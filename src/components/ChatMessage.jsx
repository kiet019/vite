import { useState } from 'react';
import translations from '../utils/translations';

function ChatMessage({ message, isUser, language = 'en' }) {
  const [copied, setCopied] = useState(false);
  const t = translations[language];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`chat-message ${isUser ? 'user-message' : 'bot-message'}`}>
      <div className="message-content">
        {message}
      </div>
      {!isUser && (
        <button
          className={`copy-message-button ${copied ? 'copied' : ''}`}
          onClick={copyToClipboard}
          title={copied ? t.messageCopied : t.copyMessage}
          aria-label={copied ? t.messageCopied : t.copyMessage}
        >
          {copied ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
            </svg>
          )}
        </button>
      )}
    </div>
  );
}

export default ChatMessage;
