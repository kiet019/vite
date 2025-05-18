import { useState, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import Settings from './Settings';
import StatusIndicator from './StatusIndicator';
import FontSizeSlider from './FontSizeSlider';
import { callGeminiForTranslation, callGeminiForSpeechTranslation, detectLanguage } from '../utils/translationUtils';
import translations from '../utils/translations';

function TranslationChatbot({ onSettingsChange, showSettings, onCloseSettings, fontSize: propFontSize, onFontSizeChange }) {
  const [settings, setSettings] = useState({
    apiKey: '',
    model: 'gemini-2.5-pro-exp-03-25',
    theme: 'system',
    interfaceLanguage: 'en',
    contextCaching: true
  });
  // Font size is now managed by the parent component
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  // showSettings is now controlled by the parent component

  // Rename contextCaching to useConversationHistory for clarity
  // but keep the same variable name in the state for backward compatibility

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini_api_key') || '';
    const savedModel = localStorage.getItem('gemini_model') || 'gemini-2.5-pro-exp-03-25';
    const savedTheme = localStorage.getItem('app_theme') || 'system';
    const savedLanguage = localStorage.getItem('interface_language') || 'en';
    const savedCaching = localStorage.getItem('context_caching') !== 'false'; // Default to true if not set
    const savedFontSize = parseFloat(localStorage.getItem('font_size')) || 1; // Default to 1.0

    setSettings({
      apiKey: savedApiKey,
      model: savedModel,
      theme: savedTheme,
      interfaceLanguage: savedLanguage,
      contextCaching: savedCaching
    });

    // Font size is now managed by the parent component
  }, []);

  // Apply theme when it changes
  useEffect(() => {
    const { theme } = settings;

    // Remove any previous theme classes
    document.documentElement.classList.remove('theme-light', 'theme-dark');

    if (theme === 'system') {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
    } else {
      // Use selected theme
      document.documentElement.classList.add(`theme-${theme}`);
    }
  }, [settings.theme]);

  // Apply font size from props directly
  useEffect(() => {
    if (propFontSize !== undefined) {
      // Apply the font size directly to chat messages using CSS variable
      document.documentElement.style.setProperty('--chat-font-size', `${propFontSize}rem`);

      // Save to localStorage
      localStorage.setItem('font_size', propFontSize.toString());
    }
  }, [propFontSize]);

  // Handle font size change if needed
  const handleFontSizeChange = (newSize) => {
    if (onFontSizeChange) {
      onFontSizeChange(newSize);
    }
  };

  // The font size is now managed by the parent component

  // No need for cache initialization anymore, as we're using conversation history directly

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
    setError(''); // Clear any previous errors when settings change

    // Notify parent component about settings change
    if (onSettingsChange) {
      onSettingsChange(newSettings);
    }

    // Close settings modal using the callback from parent
    if (onCloseSettings) {
      onCloseSettings();
    }
  };

  // Font size is now managed by the parent component

  const handleSendMessage = async (text) => {
    const t = translations[settings.interfaceLanguage];

    if (!settings.apiKey) {
      setError(t.apiKeyError);
      setShowSettings(true);
      return;
    }

    // Add user message to chat
    setMessages(prev => [...prev, { text, isUser: true }]);
    setIsLoading(true);
    setError('');

    try {
      // Call Gemini API for translation, using conversation history if enabled
      const translatedText = await callGeminiForTranslation(
        text,
        settings.apiKey,
        settings.model,
        settings.contextCaching ? messages : []
      );

      // Add bot response to chat
      setMessages(prev => [...prev, { text: translatedText, isUser: false }]);
    } catch (err) {
      console.error('Translation error:', err);
      setError(`${t.errorPrefix} ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendVoice = async (base64Audio) => {
    const t = translations[settings.interfaceLanguage];

    if (!settings.apiKey) {
      setError(t.apiKeyError);
      setShowSettings(true);
      return;
    }

    // Add user message placeholder
    setMessages(prev => [...prev, { text: `🎤 ${t.voiceMessageSent}`, isUser: true }]);
    setIsLoading(true);
    setError('');

    try {
      // Call Gemini API for speech translation, using conversation history if enabled
      const result = await callGeminiForSpeechTranslation(
        base64Audio,
        settings.apiKey,
        settings.model,
        settings.contextCaching ? messages : []
      );

      // Update user message with transcription
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].text = `🎤 ${result.transcription}`;
        return newMessages;
      });

      // Add bot response with translation
      setMessages(prev => [...prev, { text: result.translation, isUser: false }]);
    } catch (err) {
      console.error('Speech translation error:', err);
      setError(`${t.errorPrefix} ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Get translations based on current interface language
  const t = translations[settings.interfaceLanguage];

  return (
    <div className="translation-chatbot">
      {/* Header moved to TabPanel component */}

      <div className="chat-container">
        {messages.length === 0 ? (
          <div className="empty-chat">
            {t.emptyChatMessage}
          </div>
        ) : (
          <div className="messages-container">
            {messages.map((msg, index) => (
              <ChatMessage
                key={index}
                message={msg.text}
                isUser={msg.isUser}
                language={settings.interfaceLanguage}
              />
            ))}
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <ChatInput
        onSendMessage={handleSendMessage}
        onSendVoice={handleSendVoice}
        disabled={isLoading || !settings.apiKey}
        language={settings.interfaceLanguage}
      />

      {isLoading && <StatusIndicator message={t.loadingMessage} />}

      {showSettings && (
        <Settings
          onClose={onCloseSettings}
          onSettingsChange={handleSettingsChange}
          language={settings.interfaceLanguage}
        />
      )}
    </div>
  );
}

export default TranslationChatbot;
