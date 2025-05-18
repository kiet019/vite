import { useState, useEffect, useRef } from 'react';
import ChatRoomInput from './ChatRoomInput';
import EmojiPicker from './EmojiPicker';
import translations from '../utils/translations';
import { initSocket, joinChatRoom, sendTextMessage, sendVoiceMessage, setApiKey, disconnect, sendTypingStatus } from '../utils/socketUtils';
import { callGeminiForSpeechTranslation } from '../utils/translationUtils';
import '../styles/chatRoom.css';

function ChatRoom({ language = 'en', apiKey = '' }) {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [isCEO, setIsCEO] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState({});
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const socket = useRef(null);
  const isWindowFocused = useRef(true);
  const typingTimeoutRef = useRef(null);

  // Get translations based on current interface language
  const t = translations[language] || translations.en;

  // Load saved username and CEO status
  useEffect(() => {
    const savedUsername = localStorage.getItem('chat_username') || '';
    const savedIsCEO = localStorage.getItem('chat_is_ceo') === 'true';

    if (savedUsername) {
      setUsername(savedUsername);
      setIsCEO(savedIsCEO);
    }

    // Set up window focus/blur events for notifications
    const handleFocus = () => {
      isWindowFocused.current = true;
      setShowNotification(false);
      setNewMessageCount(0);
      document.title = 'Translator'; // Reset title
    };

    const handleBlur = () => {
      isWindowFocused.current = false;
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Initialize socket connection
  useEffect(() => {
    if (!socket.current) {
      try {
        socket.current = initSocket();

        // Add connection status handler
        socket.current.on('connect_error', (err) => {
          setError(`Connection error: ${err.message}. Make sure the server is running.`);
        });

        // Set up socket event listeners
        socket.current.on('userJoined', ({ user, users }) => {
          setUsers(users);
          addSystemMessage(`${user.username} ${t.userJoined || 'joined the chat'}`);
        });

        socket.current.on('userLeft', ({ username }) => {
          setUsers(prev => prev.filter(user => user.username !== username));
          addSystemMessage(`${username} ${t.userLeft || 'left the chat'}`);
        });

        socket.current.on('usersList', (usersList) => {
          setUsers(usersList);
        });

        socket.current.on('message', ({ user, text, language: msgLanguage, timestamp }) => {
          setMessages(prev => [...prev, {
            id: `${user.id}-${timestamp}`,
            user,
            text,
            language: msgLanguage,
            isTranslated: false,
            timestamp
          }]);

          // Show notification if window is not focused
          if (!isWindowFocused.current && user.id !== socket.current.id) {
            setShowNotification(true);
            setNewMessageCount(prev => prev + 1);
            // Update page title with notification count
            document.title = `(${newMessageCount + 1}) New message - Translator`;
          }
        });

        socket.current.on('translatedMessage', ({ user, originalText, translatedText, sourceLanguage, targetLanguage, timestamp }) => {
          setMessages(prev => [...prev, {
            id: `${user.id}-${timestamp}-translated`,
            user,
            text: translatedText,
            originalText,
            language: targetLanguage,
            isTranslated: true,
            timestamp
          }]);
        });

        // Handle voice messages
        socket.current.on('voiceMessage', ({ user, base64Audio, timestamp }) => {
          // Only add the message if it's from another user (our own messages are added locally)
          if (user.id !== socket.current.id) {
            // Add message to the chat
            setMessages(prev => [...prev, {
              id: `${user.id}-${timestamp}-voice`,
              user,
              isVoice: true,
              audioSrc: `data:audio/wav;base64,${base64Audio}`,
              text: t.voiceMessage || 'Voice message',
              timestamp
            }]);

            // Show notification if window is not focused
            if (!isWindowFocused.current) {
              setShowNotification(true);
              setNewMessageCount(prev => prev + 1);
              // Update page title with notification count
              document.title = `(${newMessageCount + 1}) New message - Translator`;
            }
          }
        });

        // Handle voice transcription and translation
        socket.current.on('voiceTranscription', ({ user, originalVoiceTimestamp, transcription, translation, sourceLanguage, targetLanguage, timestamp }) => {
          // Remove loading message if it's our own transcription
          if (user.id === socket.current.id) {
            setMessages(prev => prev.filter(msg => !msg.isLoading));
          }

          // Add transcription message
          setMessages(prev => [...prev, {
            id: `${user.id}-${originalVoiceTimestamp}-transcription`,
            user,
            text: `🎤 ${transcription}`,
            language: sourceLanguage,
            isTranscription: true,
            timestamp
          }]);

          // Add translation message
          setMessages(prev => [...prev, {
            id: `${user.id}-${originalVoiceTimestamp}-translation`,
            user,
            text: translation,
            originalText: transcription,
            language: targetLanguage,
            isTranslated: true,
            timestamp
          }]);
        });

        socket.current.on('error', ({ message }) => {
          setError(message);
          setTimeout(() => setError(''), 5000);
        });

        socket.current.on('apiKeySet', ({ success }) => {
          if (success) {
            console.log('API key set successfully');
          }
        });

        // Handle typing indicators
        socket.current.on('userTyping', ({ userId, username, isTyping }) => {
          if (isTyping) {
            setTypingUsers(prev => ({ ...prev, [userId]: username }));
          } else {
            setTypingUsers(prev => {
              const newTypingUsers = { ...prev };
              delete newTypingUsers[userId];
              return newTypingUsers;
            });
          }
        });
      } catch (err) {
        console.error('Error initializing socket:', err);
        setError(`Failed to connect to chat server: ${err.message}`);
      }
    }

    // Clean up on unmount
    return () => {
      if (socket.current) {
        disconnect();
        socket.current = null;
      }
    };
  }, [t]);

  // Set API key when it changes
  useEffect(() => {
    if (socket.current && apiKey && isJoined) {
      setApiKey(apiKey);
    }
  }, [apiKey, isJoined]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add system message
  const addSystemMessage = (text) => {
    setMessages(prev => [...prev, {
      id: `system-${Date.now()}`,
      user: { username: 'System', isCEO: false },
      text,
      isSystem: true,
      timestamp: new Date().toISOString()
    }]);
  };

  // Handle joining the chat
  const handleJoin = () => {
    if (!username.trim()) {
      setError(t.usernameRequired || 'Username is required');
      return;
    }

    setIsLoading(true);

    try {
      // Save username and CEO status to localStorage
      localStorage.setItem('chat_username', username);
      localStorage.setItem('chat_is_ceo', isCEO.toString());

      joinChatRoom(username, isCEO);
      setIsJoined(true);

      if (apiKey) {
        setApiKey(apiKey);
      }

      addSystemMessage(t.welcomeMessage || 'Welcome to the chat room!');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sending a text message
  const handleSendMessage = (text) => {
    if (!text.trim() || !isJoined) return;

    try {
      sendTextMessage(text, apiKey);
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle sending a voice message
  const handleSendVoice = async (base64Audio) => {
    if (!isJoined) return;
    if (!apiKey) {
      setError(t.apiKeyError || 'API key is required for voice messages');
      return;
    }

    try {
      const timestamp = new Date().toISOString();
      const messageId = `user-voice-${Date.now()}`;

      // Add a placeholder message for the voice message
      setMessages(prev => [...prev, {
        id: messageId,
        user: {
          id: socket.current.id,
          username: username,
          isCEO: isCEO
        },
        isVoice: true,
        audioSrc: `data:audio/wav;base64,${base64Audio}`,
        text: t.voiceMessage || 'Voice message',
        timestamp: timestamp
      }]);

      // Add a loading message for transcription
      setMessages(prev => [...prev, {
        id: `${messageId}-loading`,
        user: {
          id: socket.current.id,
          username: username,
          isCEO: isCEO
        },
        isLoading: true,
        text: t.transcribing || 'Transcribing and translating...',
        timestamp: timestamp
      }]);

      // Process the voice recording locally using Gemini API (like in translator tab)
      try {
        // Call Gemini API for speech translation
        const result = await callGeminiForSpeechTranslation(
          base64Audio,
          apiKey,
          'gemini-2.5-pro-exp-03-25',
          []
        );

        // Remove loading message
        setMessages(prev => prev.filter(msg => msg.id !== `${messageId}-loading`));

        // Add transcription message
        setMessages(prev => [...prev, {
          id: `${messageId}-transcription`,
          user: {
            id: socket.current.id,
            username: username,
            isCEO: isCEO
          },
          text: `🎤 ${result.transcription}`,
          language: result.sourceLanguage,
          isTranscription: true,
          timestamp: timestamp
        }]);

        // Add translation message
        setMessages(prev => [...prev, {
          id: `${messageId}-translation`,
          user: {
            id: socket.current.id,
            username: username,
            isCEO: isCEO
          },
          text: result.translation,
          originalText: result.transcription,
          language: result.targetLanguage,
          isTranslated: true,
          timestamp: timestamp
        }]);

        // Send the voice message to the server with transcription and translation
        sendVoiceMessage(base64Audio, apiKey, result);
      } catch (transcriptionError) {
        console.error('Error processing voice locally:', transcriptionError);
        setError(t.transcriptionError || 'Failed to transcribe voice message');

        // Remove loading message if there was an error
        setMessages(prev => prev.filter(msg => msg.id !== `${messageId}-loading`));

        // Still send the raw voice message to the server as fallback
        sendVoiceMessage(base64Audio, apiKey);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="chat-room">
      {!isJoined ? (
        <div className="join-form">
          <h2>{t.joinChatRoom || 'Join Chat Room'}</h2>
          <div className="form-group">
            <label htmlFor="username">{t.username || 'Username'}</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t.enterUsername || 'Enter your username'}
              disabled={isLoading}
            />
          </div>
          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="isCEO"
              checked={isCEO}
              onChange={(e) => setIsCEO(e.target.checked)}
              disabled={isLoading}
            />
            <label htmlFor="isCEO">{t.joinAsCEO || 'Join as CEO'}</label>
          </div>
          {error && <div className="error-message">{error}</div>}
          <button
            className="join-button"
            onClick={handleJoin}
            disabled={isLoading || !username.trim()}
          >
            {isLoading ? (t.joining || 'Joining...') : (t.joinChat || 'Join Chat')}
          </button>
        </div>
      ) : (
        <>
          <div className="chat-header">
            <h2>{t.chatRoom || 'Chat Room'}</h2>
            <div className="users-online">
              <span>{t.usersOnline || 'Users online'}: {users.length}</span>
            </div>
          </div>

          <div className="chat-container">
            <div className="users-sidebar">
              <h3>{t.users || 'Users'}</h3>
              <ul className="users-list">
                {users.map((user) => (
                  <li
                    key={user.id}
                    className={`user-item ${user.isCEO ? 'ceo-user' : ''}`}
                  >
                    {user.username} {user.isCEO && '(CEO)'}
                  </li>
                ))}
              </ul>
            </div>

            <div className="messages-area">
              {messages.length === 0 ? (
                <div className="empty-chat">
                  {t.emptyChatMessage || 'No messages yet. Start the conversation!'}
                </div>
              ) : (
                <div className="messages-container">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`chat-message ${msg.isSystem ? 'system-message' : msg.user.isCEO ? 'ceo-message' : 'user-message'} ${msg.isTranslated ? 'translated-message' : ''}`}
                    >
                      {!msg.isSystem && (
                        <div className="message-header">
                          <span className={`message-username ${msg.user.isCEO ? 'ceo-username' : ''}`}>
                            {msg.user.username}
                          </span>
                          <span className="message-time">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                      <div className="message-content">
                        {msg.isLoading ? (
                          <div className="loading-message">
                            <div className="loading-spinner"></div>
                            <span>{msg.text}</span>
                          </div>
                        ) : msg.isVoice ? (
                          <div className="voice-message">
                            <button
                              className="play-voice-button"
                              onClick={(event) => {
                                const audio = new Audio(msg.audioSrc);

                                // Add event listeners to update UI
                                const button = event.currentTarget;
                                const originalText = button.innerHTML;

                                // Show playing state
                                button.innerHTML = `
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                                  </svg>
                                  ${t.playing || 'Playing...'}
                                `;

                                // Reset when done
                                audio.onended = () => {
                                  button.innerHTML = originalText;
                                };

                                audio.play().catch(err => {
                                  console.error('Error playing audio:', err);
                                  button.innerHTML = originalText;
                                });
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                              {t.playVoice || 'Play voice message'}
                            </button>
                          </div>
                        ) : msg.isTranscription ? (
                          <div className="transcription-message">
                            {msg.text}
                          </div>
                        ) : (
                          msg.text
                        )}
                      </div>
                      {msg.isTranslated && (
                        <div className="message-footer">
                          <span className="translation-info">
                            {t.translatedFrom || 'Translated from'}: {msg.originalText}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                  {/* Typing indicator */}
                  {Object.keys(typingUsers).length > 0 && (
                    <div className="typing-indicator">
                      <span>
                        {Object.values(typingUsers).join(', ')} {Object.keys(typingUsers).length === 1 ? t.isTyping || 'is typing' : t.areTyping || 'are typing'}
                      </span>
                      <div className="typing-dots">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div style={{ width: '100%' }}>
            <ChatRoomInput
              onSendMessage={handleSendMessage}
              onSendVoice={handleSendVoice}
              disabled={!isJoined}
              language={language}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default ChatRoom;
