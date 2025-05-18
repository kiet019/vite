import { useState, useRef, useEffect, useCallback } from 'react';
import translations from '../utils/translations';
import VoiceRecorder from './VoiceRecorder';

function ChatInput({ onSendMessage, onSendVoice, disabled, language = 'en' }) {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Auto-resize textarea as content changes
  const autoResizeTextarea = useCallback(() => {
    if (inputRef.current) {
      // Reset height to auto to get the correct scrollHeight
      inputRef.current.style.height = 'auto';
      // Set the height to match the content (scrollHeight) with a minimum height
      const minHeight = window.innerWidth <= 480 ? 38 : 42; // Match CSS min-height
      const maxHeight = window.innerWidth <= 480 ? 100 : 120; // Match CSS max-height
      const newHeight = Math.max(minHeight, Math.min(inputRef.current.scrollHeight, maxHeight));
      inputRef.current.style.height = `${newHeight}px`;

      // Check if content has multiple lines
      const lineHeight = parseFloat(getComputedStyle(inputRef.current).lineHeight);
      const isMultiline = inputRef.current.scrollHeight > (lineHeight * 1.5 + parseFloat(getComputedStyle(inputRef.current).paddingTop) * 2);

      // Add or remove multiline class based on content
      if (isMultiline) {
        inputRef.current.classList.add('multiline');
      } else {
        inputRef.current.classList.remove('multiline');
      }
    }
  }, []);

  // Initialize textarea height when component mounts or message changes
  useEffect(() => {
    autoResizeTextarea();
  }, [autoResizeTextarea, message]);

  // Check platform and setup keyboard detection
  useEffect(() => {
    const userAgent = navigator.userAgent || window.opera;
    const androidDevice = /Android/i.test(userAgent);
    const iosDevice = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    const mobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const pwaMode = localStorage.getItem('isPWA') === 'true' ||
                   window.matchMedia('(display-mode: standalone)').matches ||
                   window.navigator.standalone;

    setIsAndroid(androidDevice);
    setIsIOS(iosDevice);
    setIsMobile(mobileDevice);
    setIsPWA(pwaMode);

    // Setup keyboard visibility detection
    if ('visualViewport' in window) {
      const handleViewportResize = () => {
        const isKeyboard = window.visualViewport.height < window.innerHeight * 0.75;
        setIsKeyboardVisible(isKeyboard);

        if (isKeyboard && inputRef.current) {
          // Add a small delay to ensure the keyboard is fully visible
          setTimeout(() => {
            inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 300);
        }
      };

      window.visualViewport.addEventListener('resize', handleViewportResize);
      return () => window.visualViewport.removeEventListener('resize', handleViewportResize);
    }
  }, []);

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

  // Common function to send message
  const sendMessage = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
      // Focus back on the input field after sending
      focusInput();
    }
  };

  const handleVoiceRecording = (base64Audio) => {
    if (!disabled) {
      onSendVoice(base64Audio);
      // Focus back on the input field after voice recording
      focusInput();
    }
  };

  // Click handler for the send button
  const handleSendClick = (e) => {
    e.preventDefault(); // Prevent default to avoid any unwanted behavior
    e.stopPropagation();
    sendMessage();
  };

  // Function to safely focus input
  const focusInput = () => {
    if (inputRef.current) {
      if (isAndroid) {
        // Special handling for Android
        setTimeout(() => {
          inputRef.current.style.transform = 'translateZ(0)';
          inputRef.current.style.opacity = '0.99';
          inputRef.current.focus();
          // Force redraw
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.style.opacity = '1';
              inputRef.current.style.transform = 'none';
            }
          }, 50);
        }, 100);
      } else {
        inputRef.current.focus();
      }
    }
  };

  // Enhanced mobile input handling
  const handleInputTouch = () => {
    if (isAndroid) {
      // Don't prevent default - this is blocking typing
      // Just focus the input
      setTimeout(() => focusInput(), 10);
    }
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (isMobile) {
      // Ensure the input is visible when keyboard appears
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  };

  // Get translations based on current interface language
  const t = translations[language];

  return (
    <div
      className={`chat-input ${isAndroid ? 'android-device' : ''} ${isIOS ? 'ios-device' : ''} ${isPWA ? 'pwa-mode' : ''} ${isKeyboardVisible ? 'keyboard-visible' : ''}`}
      onSubmit={(e) => e.preventDefault()} // Prevent any form submission behavior
    >
      <textarea
        ref={inputRef}
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          // Auto-resize the textarea after content changes
          setTimeout(autoResizeTextarea, 0);
        }}
        onKeyDown={handleKeyPress}
        onClick={handleInputFocus}
        onTouchStart={handleInputTouch}
        onFocus={handleInputFocus}
        placeholder={t.inputPlaceholder}
        disabled={disabled}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        rows="1"
        className={`chat-textarea ${isAndroid ? 'android-input' : ''} ${isIOS ? 'ios-input' : ''}`}
      />
      <div className="button-container">
        <button
          type="button"
          onClick={handleSendClick}
          disabled={disabled || !message.trim()}
          className={`send-button ${!message.trim() ? 'disabled' : ''}`}
          aria-label={t.sendButton}
        >
          <span className="button-text">{t.sendButton}</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
        <VoiceRecorder
          onRecordingComplete={handleVoiceRecording}
          disabled={disabled}
          language={language}
        />
      </div>
    </div>
  );
}

export default ChatInput;
