const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, '../')));

// Game Managers
const rooms = new Map(); // roomId -> Room Object

class Room {
  constructor(id, type, name) {
    this.id = id;
    this.type = type; // 'LUDO' or 'BID_WHIST'
    this.name = name;
    this.clients = new Set();
    this.players = []; // Array of { ws, name, id }
  }

  addClient(ws, name) {
    const pId = this.players.length;
    const player = { ws, name, id: pId };
    this.players.push(player);
    this.clients.add(ws);
    return player;
  }

  removeClient(ws) {
    this.clients.delete(ws);
    this.players = this.players.filter(p => p.ws !== ws);
    if (this.clients.size === 0) {
      rooms.delete(this.id);
    }
  }

  broadcast(msg) {
    const data = JSON.stringify(msg);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }
}

class BidWhistRoom extends Room {
  constructor(id, name) {
    super(id, 'BID_WHIST', name);
    this.state = {
      phase: 'WAITING', // WAITING, DEALING_1, BIDDING, DEALING_2, PLAYING, SCORING
      deck: [],
      hands: [[], [], [], []],
      bids: [],
      currentTrick: [],
      tricksWon: [0, 0], // Team 0 (0&2), Team 1 (1&3)
      scores: [0, 0],
      turn: 0,
      dealer: 0,
      contract: null // { player, tricks, trump }
    };
  }

  start() {
    // Auto-fill bots if needed for testing
    while (this.players.length < 4) {
      this.players.push({ ws: null, name: `Bot ${this.players.length}`, id: this.players.length, isBot: true });
    }

    this.state.phase = 'DEALING_1';
    this.dealInitial();
  }

  dealInitial() {
    // Create Deck
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    this.state.deck = [];
    suits.forEach(s => ranks.forEach(r => this.state.deck.push({ suit: s, rank: r, id: s + r })));

    // Shuffle
    for (let i = this.state.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.state.deck[i], this.state.deck[j]] = [this.state.deck[j], this.state.deck[i]];
    }

    // Deal 5 to each
    for (let i = 0; i < 4; i++) {
      this.state.hands[i] = this.state.deck.splice(0, 5);
      this.sendHand(i);
    }

    this.state.phase = 'BIDDING';
    this.state.turn = (this.state.dealer + 1) % 4;
    this.broadcast({ type: 'GAME_STATE', state: this.getPublicState() });
    this.requestBid();
  }

  sendHand(pId) {
    const p = this.players[pId];
    if (!p.isBot && p.ws) {
      p.ws.send(JSON.stringify({ type: 'HAND_DEALT', hand: this.state.hands[pId] }));
    }
  }

  requestBid() {
    const p = this.players[this.state.turn];
    if (p.isBot) {
      // Bot Logic: Random Bid or Pass
      setTimeout(() => this.handleBid(p.id, 0), 1000); // Always pass for now
    } else {
      p.ws.send(JSON.stringify({ type: 'REQUEST_BID', minBid: 4 }));
    }
  }

  handleBid(pId, val) {
    if (pId !== this.state.turn) return;

    console.log(`Player ${pId} bid ${val}`);
    this.state.bids.push({ pId, val });
    this.broadcast({ type: 'BID_UPDATE', pId, val });

    // Next bidder
    if (this.state.bids.length === 4) {
      this.resolveBidding();
    } else {
      this.state.turn = (this.state.turn + 1) % 4;
      this.requestBid();
    }
  }

  resolveBidding() {
    // Find winner
    let max = 0;
    let winner = -1;
    this.state.bids.forEach(b => {
      if (b.val > max) { max = b.val; winner = b.pId; }
    });

    if (max === 0) {
      // All passed - Redeal
      this.state.dealer = (this.state.dealer + 1) % 4;
      this.start();
      return;
    }

    this.state.contract = { player: winner, tricks: max, trump: '♠' }; // Default Spade for now
    this.broadcast({ type: 'CONTRACT_SET', contract: this.state.contract });

    this.dealRemainder();
  }

  dealRemainder() {
    // Deal 4 then 4 (Simplified: Just deal rest)
    for (let i = 0; i < 4; i++) {
      const extra = this.state.deck.splice(0, 8); // 8 cards each
      this.state.hands[i] = this.state.hands[i].concat(extra);
      this.sendHand(i);
    }

    this.state.phase = 'PLAYING';
    this.state.turn = (this.state.dealer + 1) % 4; // Left of dealer leads
    this.broadcast({ type: 'GAME_STATE', state: this.getPublicState() });
  }

  handlePlay(pId, card) {
    if (pId !== this.state.turn) return;

    // Validate Move (Simplified: Allow all for now, add strict rules later)
    // Remove from hand
    const hand = this.state.hands[pId];
    const idx = hand.findIndex(c => c.id === card.id);
    if (idx === -1) return;
    hand.splice(idx, 1);

    this.state.currentTrick.push({ pId, card });
    this.broadcast({ type: 'CARD_PLAYED', pId, card });

    if (this.state.currentTrick.length === 4) {
      setTimeout(() => this.resolveTrick(), 1500);
    } else {
      this.state.turn = (this.state.turn + 1) % 4;
      this.broadcast({ type: 'GAME_STATE', state: this.getPublicState() });
    }
  }

  resolveTrick() {
    // Determine winner (Simplified: High card of lead suit)
    // TODO: Trump logic
    const leadSuit = this.state.currentTrick[0].card.suit;
    let winner = this.state.currentTrick[0].pId;
    // ... logic ...

    // Clear trick
    this.state.currentTrick = [];
    this.state.turn = winner; // Winner leads
    this.broadcast({ type: 'TRICK_RESOLVED', winner });
    this.broadcast({ type: 'GAME_STATE', state: this.getPublicState() });
  }

  getPublicState() {
    return {
      phase: this.state.phase,
      turn: this.state.turn,
      tricksWon: this.state.tricksWon,
      contract: this.state.contract,
      currentTrick: this.state.currentTrick
    };
  }
}

wss.on('connection', (ws) => {
  let currentRoom = null;
  let myPlayerId = null;

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.type === 'LIST_ROOMS') {
      const list = [];
      rooms.forEach(r => {
        list.push({ id: r.id, name: r.name, type: r.type, players: r.players.length });
      });
      ws.send(JSON.stringify({ type: 'ROOM_LIST', rooms: list }));
    }
    else if (data.type === 'CREATE_GAME') {
      const roomId = Math.random().toString(36).substring(7);
      let room;
      if (data.gameType === 'BID_WHIST') {
        room = new BidWhistRoom(roomId, data.name + "'s Room");
      } else {
        room = new Room(roomId, 'LUDO', data.name + "'s Room");
      }
      rooms.set(roomId, room);

      const player = room.addClient(ws, data.name || 'Host');
      currentRoom = room;
      myPlayerId = player.id;

      ws.send(JSON.stringify({ type: 'ROOM_CREATED', roomId, playerId: myPlayerId, gameType: room.type }));

      if (room.type === 'BID_WHIST') {
        room.start(); // Auto start for testing
      }
    }
    else if (data.type === 'JOIN_GAME') {
      const room = rooms.get(data.roomId);
      if (room) {
        const player = room.addClient(ws, data.name || 'Player');
        currentRoom = room;
        myPlayerId = player.id;
        ws.send(JSON.stringify({ type: 'JOINED_ROOM', roomId: room.id, playerId: myPlayerId, gameType: room.type }));

        // Sync state
        if (room.type === 'BID_WHIST') {
          ws.send(JSON.stringify({ type: 'GAME_STATE', state: room.getPublicState() }));
          room.sendHand(myPlayerId);
        }
      }
    }
    else if (data.type === 'BID') {
      if (currentRoom && currentRoom.type === 'BID_WHIST') {
        currentRoom.handleBid(myPlayerId, data.val);
      }
    }
    else if (data.type === 'PLAY_CARD') {
      if (currentRoom && currentRoom.type === 'BID_WHIST') {
        currentRoom.handlePlay(myPlayerId, data.card);
      }
    }
    // Ludo signaling & Chat
    else if (currentRoom) {
      currentRoom.broadcast(data);
    }
  });

  ws.on('close', () => {
    if (currentRoom) {
      currentRoom.removeClient(ws);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
