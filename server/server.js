const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

// Simple language detection function (copied from translationUtils.js)
const detectLanguage = (text) => {
  // Simple detection based on character set
  // Vietnamese has specific characters that English doesn't
  const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

  return vietnamesePattern.test(text) ? 'vi' : 'en';
};

// Function to call Gemini API for text translation
const callGeminiForTranslation = async (text, apiKey, model) => {
  // Detect language
  const sourceLanguage = detectLanguage(text);
  const targetLanguage = sourceLanguage === 'en' ? 'vi' : 'en';

  // Create prompt based on detected language
  let userPrompt = '';
  if (sourceLanguage === 'en') {
    userPrompt = `Translate this English text to Vietnamese. Return ONLY the translation, no other text: "${text}"`;
  } else {
    userPrompt = `Translate this Vietnamese text to English. Return ONLY the translation, no other text: "${text}"`;
  }

  // Prepare request data with improved instruction
  const requestData = {
    model: model,
    contents: [
      {
        role: "user",
        parts: [{
          text: "INSTRUCTION: You are a translation assistant that translates between English and Vietnamese. " +
                "When given text in English, translate it to Vietnamese. " +
                "When given text in Vietnamese, translate it to English. " +
                "Return ONLY the translation without any additional text or explanations."
        }]
      },
      {
        role: "model",
        parts: [{
          text: "I understand. I will translate between English and Vietnamese, returning only the translation without additional text."
        }]
      },
      {
        role: "user",
        parts: [{ text: userPrompt }]
      }
    ]
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${requestData.model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();

    // Extract just the translation text from the response
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Invalid response format from Gemini API');
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
};

// Function to transcribe audio using Gemini
const transcribeAudio = async (base64Audio, apiKey, model) => {
  // Prepare request data for transcription
  const requestData = {
    model: model,
    contents: [
      {
        role: "user",
        parts: [
          { text: "Transcribe this audio. Return ONLY the transcription, no other text." },
          {
            inlineData: {
              mimeType: "audio/wav",
              data: base64Audio
            }
          }
        ]
      }
    ]
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${requestData.model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error during transcription: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();

    // Extract just the transcription text from the response
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Invalid response format from Gemini API during transcription');
    }
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
};

// No need for __dirname in CommonJS

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Configure CORS
app.use(cors());

// Initialize Socket.IO with CORS configuration
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins in development
    methods: ['GET', 'POST']
  }
});

// Store connected users
const users = {};
// Store API key for translation (in production, use environment variables)
let geminiApiKey = '';

// Debug middleware for Socket.IO
io.use((socket, next) => {
  console.log('Socket.IO connection attempt:', socket.id);
  console.log('Socket.IO handshake:', socket.handshake.address);
  next();
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  // Handle user joining
  socket.on('join', ({ username, isCEO }) => {
    // Store user information
    users[socket.id] = {
      id: socket.id,
      username,
      isCEO: isCEO || false
    };

    // Notify all users about the new user
    io.emit('userJoined', {
      user: users[socket.id],
      users: Object.values(users)
    });

    // Send current users list to the new user
    socket.emit('usersList', Object.values(users));

    console.log(`User ${username} joined${isCEO ? ' as CEO' : ''}`);
  });

  // Handle typing status
  socket.on('typing', ({ isTyping }) => {
    if (!users[socket.id]) return;

    const user = users[socket.id];

    // Broadcast typing status to all users except the sender
    socket.broadcast.emit('userTyping', {
      userId: socket.id,
      username: user.username,
      isTyping
    });
  });

  // Handle chat messages
  socket.on('chatMessage', async ({ text, apiKey }) => {
    if (!users[socket.id]) return;

    // Store API key if provided
    if (apiKey && !geminiApiKey) {
      geminiApiKey = apiKey;
    }

    const user = users[socket.id];
    const sourceLanguage = detectLanguage(text);
    const targetLanguage = sourceLanguage === 'en' ? 'vi' : 'en';

    // Clear typing indicator when sending a message
    socket.broadcast.emit('userTyping', {
      userId: socket.id,
      username: user.username,
      isTyping: false
    });

    // Broadcast original message
    io.emit('message', {
      user,
      text,
      language: sourceLanguage,
      timestamp: new Date().toISOString()
    });

    // Translate the message if API key is available
    if (geminiApiKey) {
      try {
        const translatedText = await callGeminiForTranslation(
          text,
          geminiApiKey,
          'gemini-2.5-pro-exp-03-25',
          []
        );

        // Broadcast translated message
        io.emit('translatedMessage', {
          user,
          originalText: text,
          translatedText,
          sourceLanguage,
          targetLanguage,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Translation error:', error);
        socket.emit('error', { message: 'Translation failed' });
      }
    }
  });

  // Handle voice messages
  socket.on('voiceMessage', async ({ base64Audio, apiKey, transcription, translation, sourceLanguage, targetLanguage, processedLocally }) => {
    if (!users[socket.id]) return;

    // Store API key if provided
    if (apiKey && !geminiApiKey) {
      geminiApiKey = apiKey;
    } else if (!apiKey) {
      apiKey = geminiApiKey;
    }

    const user = users[socket.id];
    const timestamp = new Date().toISOString();

    try {
      // First, emit the original voice message to all users
      io.emit('voiceMessage', {
        user,
        base64Audio,
        timestamp
      });

      console.log(`Voice message received from ${user.username}`);

      // Check if the message was already processed locally by the client
      if (processedLocally && transcription && translation) {
        console.log(`Using client-processed transcription and translation for ${user.username}`);

        // Emit the pre-processed transcription and translation to all users
        io.emit('voiceTranscription', {
          user,
          originalVoiceTimestamp: timestamp,
          transcription,
          translation,
          sourceLanguage,
          targetLanguage,
          timestamp: new Date().toISOString()
        });
      }
      // If not processed locally and we have an API key, process it on the server
      else if (apiKey) {
        try {
          // Transcribe the audio
          const transcription = await transcribeAudio(base64Audio, apiKey, 'gemini-2.5-pro-exp-03-25');

          // Detect language of the transcription
          const sourceLanguage = detectLanguage(transcription);
          const targetLanguage = sourceLanguage === 'en' ? 'vi' : 'en';

          // Translate the transcription
          const translatedText = await callGeminiForTranslation(
            transcription,
            apiKey,
            'gemini-2.5-pro-exp-03-25'
          );

          // Emit the transcription and translation to all users
          io.emit('voiceTranscription', {
            user,
            originalVoiceTimestamp: timestamp,
            transcription,
            translation: translatedText,
            sourceLanguage,
            targetLanguage,
            timestamp: new Date().toISOString()
          });

          console.log(`Voice message transcribed and translated for ${user.username}`);
        } catch (transcriptionError) {
          console.error('Error transcribing/translating voice message:', transcriptionError);
          socket.emit('error', { message: 'Failed to transcribe/translate voice message' });
        }
      }
    } catch (error) {
      console.error('Error processing voice message:', error);
      socket.emit('error', { message: 'Failed to process voice message' });
    }
  });

  // Handle API key setting
  socket.on('setApiKey', ({ apiKey }) => {
    geminiApiKey = apiKey;
    socket.emit('apiKeySet', { success: true });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (users[socket.id]) {
      const username = users[socket.id].username;
      console.log(`User ${username} disconnected`);

      // Notify all users about the disconnection
      io.emit('userLeft', {
        userId: socket.id,
        username
      });

      // Remove user from users object
      delete users[socket.id];
    }
  });
});

// Add a simple route for testing
app.get('/', (req, res) => {
  res.send('Chat server is running');
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server URL: http://localhost:${PORT}`);
});
