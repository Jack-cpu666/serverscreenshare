# 🚀 Deployment Checklist

Follow these steps in order to deploy your WebRTC screen-sharing app:

## ☑️ Pre-Deployment (Local Setup)

- [ ] Downloaded/created all 4 files:
  - [ ] `server.js`
  - [ ] `package.json`
  - [ ] `index.html`
  - [ ] `README.md`

- [ ] Tested locally:
  - [ ] Ran `npm install`
  - [ ] Ran `npm start`
  - [ ] Opened `index.html` in browser
  - [ ] Successfully started screen share
  - [ ] Verified video appears

## ☑️ GitHub Setup

- [ ] Created GitHub account (https://github.com)
- [ ] Created new repository `webrtc-screen-share`
- [ ] Initialized git in project folder:
  ```bash
  git init
  git add .
  git commit -m "Initial commit"
  git branch -M main
  ```
- [ ] Connected to GitHub:
  ```bash
  git remote add origin https://github.com/YOUR-USERNAME/webrtc-screen-share.git
  git push -u origin main
  ```
- [ ] Verified files appear on GitHub

## ☑️ Render.com Backend Deployment

- [ ] Created Render account (https://render.com)
- [ ] Clicked "New +" → "Web Service"
- [ ] Connected GitHub account to Render
- [ ] Selected `webrtc-screen-share` repository
- [ ] Configured service:
  - [ ] Name: `webrtc-signaling-server` (or your choice)
  - [ ] Environment: `Node`
  - [ ] Build Command: `npm install`
  - [ ] Start Command: `npm start`
  - [ ] Plan: `Free` (or paid)
- [ ] Clicked "Create Web Service"
- [ ] Waited 2-3 minutes for deployment
- [ ] Noted your app URL: `https://your-app-name.onrender.com`
- [ ] Verified server is running (green status)

## ☑️ Update Client Configuration

- [ ] Opened `index.html` in text editor
- [ ] Found line ~285: `signalingServer: ...`
- [ ] Updated to your Render URL:
  ```javascript
  signalingServer: window.location.hostname === 'localhost' 
    ? 'ws://localhost:3000'
    : 'wss://your-actual-app-name.onrender.com',
  ```
- [ ] Saved file
- [ ] Committed changes:
  ```bash
  git add index.html
  git commit -m "Update signaling server URL"
  git push
  ```

## ☑️ Frontend Deployment (Choose One)

### Option A: GitHub Pages (Recommended)
- [ ] Went to repository → Settings → Pages
- [ ] Set Source: `Deploy from a branch`
- [ ] Selected Branch: `main`, Folder: `/ (root)`
- [ ] Clicked Save
- [ ] Waited 1-2 minutes
- [ ] Accessed app at: `https://YOUR-USERNAME.github.io/webrtc-screen-share/`

### Option B: Render Static Site
- [ ] Created New Static Site on Render
- [ ] Connected same GitHub repository
- [ ] Set Publish directory: `.`
- [ ] Deployed
- [ ] Accessed app at: `https://your-client-app.onrender.com`

## ☑️ Testing Production Deployment

- [ ] Opened deployed app URL in Chrome/Edge
- [ ] Checked connection status (should show "Connected")
- [ ] Clicked "Start Sharing"
- [ ] Granted screen capture permission
- [ ] Verified video appears
- [ ] Copied room link
- [ ] Opened in new incognito window
- [ ] Verified viewer can see screen

## ☑️ Final Checks

- [ ] Server logs show no errors (check Render Dashboard)
- [ ] WebSocket connection established (check browser console)
- [ ] Multiple users can join same room
- [ ] Room link works when shared
- [ ] Video quality is acceptable
- [ ] "Stop Sharing" button works

## 🎉 Success Criteria

Your app is successfully deployed when:
- ✅ Client loads without errors
- ✅ Shows "Connected" status
- ✅ Screen sharing starts successfully
- ✅ Video appears for viewers
- ✅ Room link sharing works
- ✅ Multiple participants can join

## 🐛 Common Issues

**"Disconnected" status**
- Check Render app is running (not spun down)
- Verify WebSocket URL is correct in `index.html`
- Use `wss://` not `ws://` for production
- Don't include port number in URL

**"Failed to start screen sharing"**
- Ensure using HTTPS (or localhost)
- Check browser console for errors
- Try Chrome/Edge instead of Firefox
- Grant screen capture permission

**Video doesn't appear**
- Check browser console for WebRTC errors
- Verify both users are in same room
- Check firewall isn't blocking WebRTC
- Consider adding TURN server

**Render app sleeps (free tier)**
- Normal on free tier after 15 min inactivity
- Takes ~30 sec to wake up on first connection
- Upgrade to paid plan for always-on

## 📝 Post-Deployment

Consider these improvements:
- [ ] Add TURN server for better connectivity
- [ ] Set up custom domain
- [ ] Add user authentication
- [ ] Implement room passwords
- [ ] Add usage analytics
- [ ] Set up monitoring/alerts

## 🔄 Making Updates

When you update the code:
```bash
git add .
git commit -m "Your change description"
git push
```

- GitHub Pages: Auto-deploys in 1-2 minutes
- Render: Auto-deploys when it detects changes (2-3 minutes)

---

**Need Help?** Check the troubleshooting section in README.md

**Ready to Deploy?** Start with the Pre-Deployment checklist above! 🚀
