# 📺 ShareScreen - WebRTC Screen Sharing App

A beautiful Discord-style screen-sharing application using WebRTC. Share your screen in real-time with automatic room creation and a modern dark-themed interface.

## ✨ Features

- 🎥 **Instant Screen Sharing** - One-click screen capture with browser APIs
- 🔗 **Automatic Room Creation** - No sign-up, just share the link
- 🎨 **Discord-Inspired UI** - Beautiful, modern dark theme
- 🔒 **Secure** - End-to-end encrypted WebRTC connections
- 🚀 **Fast** - Peer-to-peer connections with minimal latency
- 📱 **Responsive** - Works on desktop browsers (Chrome, Edge, Firefox)

## 🛠️ Tech Stack

- **Frontend**: Pure HTML/CSS/JavaScript, WebRTC
- **Backend**: Node.js, Express, WebSocket (ws)
- **Deployment**: Render.com (free tier available)

---

## 📦 Quick Start (Local Development)

### Prerequisites
- Node.js 16+ installed
- Modern browser (Chrome, Edge, or Firefox)

### 1. Clone or Download Files

Create a project folder with these files:
```
webrtc-screen-share/
├── server.js
├── package.json
├── index.html
└── README.md
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Server

```bash
npm start
```

Server runs on `http://localhost:3000`

### 4. Open the App

Open `index.html` in your browser. The app will connect to `ws://localhost:3000` automatically.

---

## 🚀 Deploy to Render.com (Production)

### Step 1: Prepare Your Repository

1. **Create a GitHub account** (if you don't have one): https://github.com

2. **Create a new repository**:
   - Go to https://github.com/new
   - Repository name: `webrtc-screen-share`
   - Make it Public or Private (both work)
   - Don't initialize with README (we already have files)
   - Click "Create repository"

3. **Push your code to GitHub**:
   ```bash
   # In your project folder
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/webrtc-screen-share.git
   git push -u origin main
   ```

### Step 2: Deploy Backend to Render

1. **Sign up for Render**: https://render.com (free tier available)

2. **Create a New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub account
   - Select your `webrtc-screen-share` repository

3. **Configure the Service**:
   ```
   Name: webrtc-signaling-server (or any name you like)
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   Plan: Free (or paid for better performance)
   ```

4. **Create Web Service** (wait 2-3 minutes for deployment)

5. **Get Your WebSocket URL**:
   - After deployment, you'll see: `https://your-app-name.onrender.com`
   - Your WebSocket URL is: `wss://your-app-name.onrender.com`
   - ✅ **Note**: Render automatically provides TLS (wss://) - no configuration needed!

### Step 3: Update Client Configuration

1. Open `index.html`

2. Find this line (around line 285):
   ```javascript
   signalingServer: window.location.hostname === 'localhost' 
     ? 'ws://localhost:3000'
     : 'wss://YOUR-APP-NAME.onrender.com', // ⚠️ CHANGE THIS!
   ```

3. Replace `YOUR-APP-NAME` with your actual Render app name:
   ```javascript
   signalingServer: window.location.hostname === 'localhost' 
     ? 'ws://localhost:3000'
     : 'wss://webrtc-signaling-server.onrender.com',
   ```

### Step 4: Host the Client

**Option A: GitHub Pages (Recommended for demo)**

1. Commit and push your updated `index.html`:
   ```bash
   git add index.html
   git commit -m "Update signaling server URL"
   git push
   ```

2. Enable GitHub Pages:
   - Go to your repository → Settings → Pages
   - Source: Deploy from a branch
   - Branch: main, /root
   - Save

3. Your app will be available at:
   `https://YOUR-USERNAME.github.io/webrtc-screen-share/`

**Option B: Deploy Client to Render (Static Site)**

1. Create New Static Site on Render
2. Connect same repository
3. Publish directory: `.` (root)
4. Your app will be available at: `https://your-client-app.onrender.com`

### Step 5: Test Your App! 🎉

1. Open your deployed client URL
2. Click "Start Sharing"
3. Select your screen/window
4. Copy the room link and share with others
5. Others can join by clicking "Watch"

---

## 🔧 Configuration & Customization

### Adding TURN Server (Better Connectivity)

For better connectivity across different networks (especially behind strict firewalls), add a TURN server.

**Free TURN Providers:**
- [Metered.ca](https://www.metered.ca/tools/openrelay/) - Free TURN servers
- [Twilio STUN/TURN](https://www.twilio.com/stun-turn) - Generous free tier
- [Xirsys](https://xirsys.com/) - Free tier available

**Update `index.html`** (around line 290):
```javascript
iceServers: [
  { urls: 'stun:stun.l.google.com:19302' },
  {
    urls: 'turn:a.relay.metered.ca:80',
    username: 'YOUR-USERNAME',
    credential: 'YOUR-CREDENTIAL'
  },
  {
    urls: 'turn:a.relay.metered.ca:443',
    username: 'YOUR-USERNAME',
    credential: 'YOUR-CREDENTIAL'
  }
]
```

### Environment Variables (Optional)

In Render Dashboard → Environment:
```
NODE_ENV=production
PORT=10000  # Render sets this automatically
```

---

## 🌐 Browser Compatibility

### ✅ Fully Supported (Screen Sharing + Viewing)
- ✅ Chrome 72+ (Desktop)
- ✅ Edge 79+ (Desktop)
- ✅ Firefox 66+ (Desktop)

### ⚠️ Partially Supported (Viewing Only)
- ⚠️ Safari 13+ (Can view streams, cannot share - browser limitation)

### ❌ Not Supported
- ❌ Mobile browsers (screen sharing not available)
- ❌ Internet Explorer

### Requirements
- 🔒 **HTTPS Required** - WebRTC requires secure context (localhost or https://)
- 🎤 **User Permission** - Browser will prompt for screen capture permission
- 📡 **Stable Internet** - Recommended 5+ Mbps upload for HD sharing

---

## 🔒 Security & Privacy

### What's Secure
- ✅ **Encrypted Connections**: All WebRTC streams are encrypted (DTLS/SRTP)
- ✅ **User Permission**: Browser requires explicit permission for screen capture
- ✅ **Temporary Rooms**: Rooms are temporary, no data stored
- ✅ **Peer-to-Peer**: Direct connections when possible (no server relay)

### Important Privacy Notes
- ⚠️ **Anyone with the room link can join** - keep links private
- ⚠️ **Everything on your screen is visible** - close sensitive tabs/apps
- ⚠️ **No recording by default** - but participants could record locally
- ⚠️ **No authentication** - implement auth if needed for production

### Security Best Practices
1. **Never share sensitive information** while screen sharing
2. **Use strong room IDs** (automatic by default)
3. **Share room links securely** (Signal, WhatsApp, not public posts)
4. **Close rooms when done** (just close the tab)
5. **For production**: Add authentication, rate limiting, and monitoring

---

## 🐛 Troubleshooting

### Connection Issues

**Problem**: "Disconnected" status or can't connect
- ✅ Check your Render app is running (not spun down on free tier)
- ✅ Verify WebSocket URL in `index.html` is correct
- ✅ Check browser console for errors (F12)
- ✅ Ensure you're using `wss://` not `ws://` for production

**Problem**: "Failed to start screen sharing"
- ✅ Make sure you're on HTTPS (or localhost)
- ✅ Grant screen capture permission when prompted
- ✅ Try Chrome/Edge if using Firefox
- ✅ Restart browser and try again

### Video Issues

**Problem**: Black screen or no video
- ✅ Ensure the correct screen/window is selected
- ✅ Check the tab isn't minimized (some browsers pause capture)
- ✅ Verify peer connection is established (check console)
- ✅ Try refreshing both sharer and viewer

**Problem**: Laggy or poor quality
- ✅ Check internet speed (need 5+ Mbps upload)
- ✅ Close unnecessary applications
- ✅ Reduce resolution in browser settings
- ✅ Add TURN server for better connectivity

### Render.com Specific

**Problem**: App sleeps on free tier
- ℹ️ Free tier apps spin down after 15 minutes of inactivity
- ℹ️ First connection after sleep takes ~30 seconds
- ✅ Upgrade to paid plan for always-on service
- ✅ Or use a cron job to ping every 14 minutes

**Problem**: Can't connect to WebSocket
- ✅ Don't specify port in URL: Use `wss://app-name.onrender.com` NOT `wss://app-name.onrender.com:10000`
- ✅ Render provides SSL automatically, always use `wss://`
- ✅ Check server logs in Render Dashboard

---

## 📊 Performance Tips

### For Best Quality
1. **Wired Connection** - Use Ethernet instead of WiFi when possible
2. **Close Background Apps** - Free up CPU/bandwidth
3. **Upgrade Plan** - Paid Render plans have better resources
4. **Use TURN Server** - For reliable connectivity across networks
5. **Modern Browser** - Use latest Chrome/Edge for best codec support

### Optimizing Bandwidth
- Lower your screen resolution before sharing
- Share specific window instead of entire screen
- Close unnecessary browser tabs
- Limit number of concurrent viewers (2-4 is optimal on free tier)

---

## 🤝 Contributing

Found a bug or want to improve the app? Contributions welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.

---

## 🙋 FAQ

**Q: Is this free to use?**  
A: Yes! Both Render.com and GitHub Pages have free tiers. The app itself is open source.

**Q: How many people can watch my screen?**  
A: On free tier, recommend 2-4 viewers. Paid plans support more. Each viewer creates a peer connection.

**Q: Can I record the screen share?**  
A: Not built-in, but viewers can use OS screen recording tools. Consider privacy implications.

**Q: Does this work on mobile?**  
A: Mobile browsers don't support screen sharing. Use desktop browsers only.

**Q: Is my data stored anywhere?**  
A: No! All connections are temporary. The signaling server only forwards connection info, no video data is stored.

**Q: How secure is this?**  
A: WebRTC streams are encrypted end-to-end. However, anyone with the room link can join, so keep links private.

**Q: Can I use this for commercial purposes?**  
A: Yes, but add authentication, monitoring, and review Render's terms of service for commercial usage.

---

## 🔗 Useful Links

- [WebRTC Documentation](https://webrtc.org/)
- [Render.com Docs](https://render.com/docs)
- [MDN WebRTC Guide](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [Free TURN Servers](https://www.metered.ca/tools/openrelay/)

---

## 📞 Support

Having issues? Check the troubleshooting section above or:
- Check the browser console (F12) for errors
- Review Render logs in the Dashboard
- Test with Chrome/Edge first (best compatibility)
- Ensure HTTPS is enabled (required for WebRTC)

---

**Made with ❤️ using WebRTC**

Happy Screen Sharing! 🎉
