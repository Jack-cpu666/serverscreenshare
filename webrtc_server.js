// WebRTC Signaling Server for Render.com
// This server handles WebSocket connections and forwards WebRTC signaling messages

const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const path = require('path');

const app = express();

// Serve static files from the parent directory (../)
app.use(express.static(path.join(__dirname, '..')));

// Render provides PORT environment variable
const PORT = process.env.PORT || 3000;

// Health check endpoint (required for Render)
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'WebRTC Signaling Server',
    connections: rooms.size 
  });
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server on the same port
// Render automatically handles WSS (TLS) - no configuration needed!
const wss = new WebSocketServer({ server });

// Store rooms and their participants
// rooms = { roomId: Set of ws connections }
const rooms = new Map();

// Store client metadata
// clients = WeakMap { ws -> { roomId, userId, isSharing } }
const clients = new WeakMap();

wss.on('connection', (ws) => {
  console.log('New client connected');
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      handleMessage(ws, message);
    } catch (error) {
      console.error('Error parsing message:', error);
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  });

  ws.on('close', () => {
    handleDisconnect(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

function handleMessage(ws, message) {
  const { type, roomId, userId } = message;

  switch (type) {
    case 'join':
      handleJoin(ws, roomId, userId, message.isSharing);
      break;
    
    case 'offer':
      forwardToRoom(ws, message, 'offer');
      break;
    
    case 'answer':
      forwardToTarget(ws, message);
      break;
    
    case 'ice-candidate':
      forwardToTarget(ws, message);
      break;
    
    case 'leave':
      handleLeave(ws);
      break;
    
    default:
      console.log('Unknown message type:', type);
  }
}

function handleJoin(ws, roomId, userId, isSharing = false) {
  // Store client info
  clients.set(ws, { roomId, userId, isSharing });

  // Create room if it doesn't exist
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }

  const room = rooms.get(roomId);
  
  // Get existing participants
  const existingParticipants = Array.from(room).map(client => {
    const info = clients.get(client);
    return {
      userId: info.userId,
      isSharing: info.isSharing
    };
  });

  // Add new client to room
  room.add(ws);

  // Send existing participants to new client
  ws.send(JSON.stringify({
    type: 'room-joined',
    roomId,
    participants: existingParticipants
  }));

  // Notify others in room about new participant
  broadcast(roomId, {
    type: 'user-joined',
    userId,
    isSharing
  }, ws);

  console.log(`User ${userId} joined room ${roomId}. Room size: ${room.size}`);
}

function forwardToRoom(ws, message, messageType) {
  const client = clients.get(ws);
  if (!client) return;

  const { roomId } = client;
  broadcast(roomId, message, ws);
}

function forwardToTarget(ws, message) {
  const client = clients.get(ws);
  if (!client) return;

  const { roomId } = client;
  const { targetId } = message;

  const room = rooms.get(roomId);
  if (!room) return;

  // Find target client
  for (const clientWs of room) {
    const targetClient = clients.get(clientWs);
    if (targetClient && targetClient.userId === targetId) {
      clientWs.send(JSON.stringify(message));
      break;
    }
  }
}

function broadcast(roomId, message, excludeWs = null) {
  const room = rooms.get(roomId);
  if (!room) return;

  const messageStr = JSON.stringify(message);
  
  for (const clientWs of room) {
    if (clientWs !== excludeWs && clientWs.readyState === 1) {
      clientWs.send(messageStr);
    }
  }
}

function handleLeave(ws) {
  const client = clients.get(ws);
  if (!client) return;

  const { roomId, userId } = client;
  const room = rooms.get(roomId);

  if (room) {
    room.delete(ws);
    
    // Notify others
    broadcast(roomId, {
      type: 'user-left',
      userId
    });

    // Clean up empty rooms
    if (room.size === 0) {
      rooms.delete(roomId);
      console.log(`Room ${roomId} deleted (empty)`);
    }
  }

  clients.delete(ws);
  console.log(`User ${userId} left room ${roomId}`);
}

function handleDisconnect(ws) {
  handleLeave(ws);
}

// Start server
server.listen(PORT, () => {
  console.log(`🚀 WebRTC Signaling Server running on port ${PORT}`);
  console.log(`📡 WebSocket endpoint: ${PORT === 3000 ? 'ws' : 'wss'}://localhost:${PORT}`);
  console.log(`💡 On Render, use: wss://your-app-name.onrender.com`);
});

// Graceful shutdown for Render zero-downtime deploys
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server gracefully...');
  
  // Close all WebSocket connections
  wss.clients.forEach(ws => {
    ws.close(1001, 'Server shutting down');
  });
  
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

/* 
RENDER.COM DEPLOYMENT NOTES:

1. TLS/WSS: Render automatically provides TLS encryption for WebSocket connections.
   - Your app will be available at: wss://your-app-name.onrender.com
   - No SSL configuration needed - it's automatic!

2. Port: Always use process.env.PORT (provided by Render)

3. TURN Server Integration (optional for better connectivity):
   - Add TURN server URLs to the client's RTCPeerConnection config
   - Example TURN providers: Twilio, Metered, Xirsys
   - Free option: Use coturn on a separate server
   
   In client code, update iceServers:
   {
     urls: 'turn:your-turn-server.com:3478',
     username: 'your-username',
     credential: 'your-password'
   }

4. Environment Variables (optional):
   - Set in Render Dashboard under Environment
   - Example: TURN_USERNAME, TURN_PASSWORD
*/
