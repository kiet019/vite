import { useState, useEffect, useRef } from 'react';

// Common emojis for quick access
const commonEmojis = [
  '😀', '😂', '😊', '😍', '🤔', '😎', '👍', '👋', '❤️', '🎉',
  '👏', '🙏', '🔥', '⭐', '✅', '🚀', '💯', '🤝', '👀', '💪'
];

// Emoji categories
const emojiCategories = {
  smileys: [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥲', '☺️',
    '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗',
    '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓',
    '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕'
  ],
  gestures: [
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
    '👆', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌',
    '👐', '🤲', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵'
  ],
  symbols: [
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
    '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐'
  ],
  objects: [
    '🔥', '✨', '🎉', '🎊', '💫', '⭐', '🌟', '✅', '❌', '💯',
    '💢', '💥', '💫', '💦', '💨', '🕳️', '💣', '💬', '👁️‍🗨️', '🗨️',
    '🗯️', '💭', '💤', '🌐', '♠️', '♥️', '♦️', '♣️', '🃏', '🀄'
  ]
};

function EmojiPicker({ onEmojiSelect, language = 'en' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('common');
  const pickerRef = useRef(null);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle emoji selection
  const handleEmojiClick = (emoji) => {
    onEmojiSelect(emoji);
    setIsOpen(false);
  };

  // Get current emoji set based on active category
  const getCurrentEmojis = () => {
    switch (activeCategory) {
      case 'common':
        return commonEmojis;
      case 'smileys':
        return emojiCategories.smileys;
      case 'gestures':
        return emojiCategories.gestures;
      case 'symbols':
        return emojiCategories.symbols;
      case 'objects':
        return emojiCategories.objects;
      default:
        return commonEmojis;
    }
  };

  return (
    <div className="emoji-picker-container" ref={pickerRef}>
      <button
        type="button"
        className="emoji-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Emoji picker"
      >
        <span role="img" aria-label="emoji">😊</span>
      </button>
      
      {isOpen && (
        <div className="emoji-picker">
          <div className="emoji-categories">
            <button
              className={`category-button ${activeCategory === 'common' ? 'active' : ''}`}
              onClick={() => setActiveCategory('common')}
            >
              ⭐
            </button>
            <button
              className={`category-button ${activeCategory === 'smileys' ? 'active' : ''}`}
              onClick={() => setActiveCategory('smileys')}
            >
              😀
            </button>
            <button
              className={`category-button ${activeCategory === 'gestures' ? 'active' : ''}`}
              onClick={() => setActiveCategory('gestures')}
            >
              👍
            </button>
            <button
              className={`category-button ${activeCategory === 'symbols' ? 'active' : ''}`}
              onClick={() => setActiveCategory('symbols')}
            >
              ❤️
            </button>
            <button
              className={`category-button ${activeCategory === 'objects' ? 'active' : ''}`}
              onClick={() => setActiveCategory('objects')}
            >
              🔥
            </button>
          </div>
          
          <div className="emoji-grid">
            {getCurrentEmojis().map((emoji, index) => (
              <button
                key={index}
                className="emoji-item"
                onClick={() => handleEmojiClick(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default EmojiPicker;
