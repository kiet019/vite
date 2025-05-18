import { io } from 'socket.io-client';

// Create a socket instance
let socket = null;

// Initialize socket connection
export const initSocket = (serverUrl = 'http://localhost:3000') => {
  if (!socket) {
    console.log('Attempting to connect to socket server at:', serverUrl);

    // Configure socket with options
    socket = io(serverUrl, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      transports: ['websocket', 'polling']
    });

    // Add event listeners for connection status
    socket.on('connect', () => {
      console.log('Socket connected successfully');
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Socket reconnection attempt ${attemptNumber}`);
    });

    socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed after all attempts');
    });
  }
  return socket;
};

// Get the socket instance
export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket not initialized. Call initSocket first.');
  }
  return socket;
};

// Join the chat room
export const joinChatRoom = (username, isCEO = false) => {
  if (!socket) {
    throw new Error('Socket not initialized. Call initSocket first.');
  }

  socket.emit('join', { username, isCEO });
};

// Send a text message
export const sendTextMessage = (text, apiKey) => {
  if (!socket) {
    throw new Error('Socket not initialized. Call initSocket first.');
  }

  socket.emit('chatMessage', { text, apiKey });
};

// Send typing status
export const sendTypingStatus = (isTyping) => {
  if (!socket) {
    throw new Error('Socket not initialized. Call initSocket first.');
  }

  socket.emit('typing', { isTyping });
};

// Send a voice message
export const sendVoiceMessage = (base64Audio, apiKey, translationResult = null) => {
  if (!socket) {
    throw new Error('Socket not initialized. Call initSocket first.');
  }

  // If we have translation results, include them in the message
  if (translationResult) {
    socket.emit('voiceMessage', {
      base64Audio,
      apiKey,
      transcription: translationResult.transcription,
      translation: translationResult.translation,
      sourceLanguage: translationResult.sourceLanguage,
      targetLanguage: translationResult.targetLanguage,
      processedLocally: true
    });
  } else {
    // Otherwise just send the audio for server-side processing
    socket.emit('voiceMessage', { base64Audio, apiKey });
  }
};

// Set the API key
export const setApiKey = (apiKey) => {
  if (!socket) {
    throw new Error('Socket not initialized. Call initSocket first.');
  }

  socket.emit('setApiKey', { apiKey });
};

// Disconnect from the server
export const disconnect = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket disconnected');
  }
};
