import { useState, useRef, useEffect } from 'react';
import EmojiPicker from './EmojiPicker';
import VoiceRecorder from './VoiceRecorder';
import translations from '../utils/translations';
import { sendTypingStatus } from '../utils/socketUtils';

function ChatRoomInput({ onSendMessage, onSendVoice, disabled, language = 'en' }) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Get translations based on current interface language
  const t = translations[language];

  // Auto-resize textarea as content changes
  const autoResizeTextarea = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  };

  // Focus the input field
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle key press in the input field
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      // If Shift+Enter is pressed, insert a new line
      if (e.shiftKey) {
        // Allow default behavior (new line)
        return;
      } else {
        // Regular Enter key - send message
        e.preventDefault();
        sendMessage();
      }
    }
  };

  // Handle input change and send typing status
  const handleInputChange = (e) => {
    setMessage(e.target.value);

    // Auto-resize the textarea after content changes
    setTimeout(autoResizeTextarea, 0);

    // Handle typing status
    if (!isTyping) {
      setIsTyping(true);
      sendTypingStatus(true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingStatus(false);
    }, 2000);
  };

  // Common function to send message
  const sendMessage = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');

      // Clear typing status
      setIsTyping(false);
      sendTypingStatus(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }

      // Focus back on the input field after sending
      focusInput();
    }
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji);
    focusInput();

    // Trigger resize after emoji is added
    setTimeout(autoResizeTextarea, 0);
  };

  // Clean up typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        sendTypingStatus(false);
      }
    };
  }, []);

  return (
    <div className="chat-input" style={{ width: '100%', boxSizing: 'border-box' }}>
      <div className="input-container" style={{ width: '100%', boxSizing: 'border-box' }}>
        <textarea
          ref={inputRef}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder={t.inputPlaceholder || 'Type a message...'}
          disabled={disabled}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          rows="1"
          className="chat-textarea"
          style={{ width: '100%' }}
        />
        <div className="button-container">
          <EmojiPicker
            onEmojiSelect={handleEmojiSelect}
            language={language}
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={disabled || !message.trim()}
            className={`send-button ${!message.trim() ? 'disabled' : ''}`}
            aria-label={t.sendButton || 'Send'}
          >
            <span className="button-text">{t.sendButton || 'Send'}</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
          <VoiceRecorder
            onRecordingComplete={onSendVoice}
            disabled={disabled}
            language={language}
          />
        </div>
      </div>
    </div>
  );
}

export default ChatRoomInput;
