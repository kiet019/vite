# Translator

A simple translation app using Google's Gemini API with multi-user chat capabilities.

## Features

- Text and voice translation between English and Vietnamese
- Automatic language detection
- Voice input support
- Multiple Gemini models (fast, medium, slow)
- Multi-user chat room with real-time translation
- CEO mode with red username highlighting
- Cross-platform web-based communication
- Emoji support with categorized picker
- Typing indicators to see who's currently typing
- Desktop notifications for new messages
- Persistent username storage

## Quick Start

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Install the socket.io-client package:
   ```
   npm install socket.io-client
   ```

4. Run the server (in one terminal):
   ```
   node server/server.js
   ```

   You should see output like:
   ```
   Server running on port 3000
   Server URL: http://localhost:3000
   ```

   If you don't see this output or encounter errors, try:
   - Make sure you have Node.js installed
   - Check that all dependencies are installed
   - Verify that port 3000 is not in use by another application

5. Run the client (in another terminal):
   ```
   npm run dev:host
   ```

## Usage

### Translation Mode
1. Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Enter your API key in the settings
3. Type or speak in English or Vietnamese
4. Get instant translations

### Chat Room Mode
1. Click on the "Chat Room" tab
2. Enter your username (it will be remembered for future sessions)
3. Check the "Join as CEO" box if you want your name to appear in red
4. Click "Join Chat"
5. Start chatting with other users
6. Messages are automatically translated between languages
7. Use the emoji picker to add emojis to your messages
8. See when other users are typing in real-time
9. Receive visual notifications when new messages arrive while you're in another tab

## Technologies

- React
- Vite
- Google Gemini API
- Socket.IO for real-time communication
- Express.js server
- WebSockets for cross-platform connectivity

## Troubleshooting

If you encounter any issues:

### Connection Errors

If you see `ERR_CONNECTION_REFUSED` errors in the browser console:

1. Make sure the server is running on port 3000
   ```
   node server/server.js
   ```

2. Check if another application is using port 3000
   - You can change the port in server/server.js if needed
   - If you change the server port, also update the client connection URL in src/utils/socketUtils.js

3. Check your firewall settings to ensure it's not blocking the connection

### Missing Dependencies

If you see errors about missing modules:

1. Make sure all dependencies are installed:
   ```
   npm install
   npm install socket.io-client
   ```

2. If you're still seeing errors, try deleting node_modules and reinstalling:
   ```
   rm -rf node_modules
   npm install
   ```

### Browser Issues

1. Try clearing your browser cache and reloading
2. Check the browser console for specific error messages
3. Try using a different browser to see if the issue persists
#   v i t e  
 