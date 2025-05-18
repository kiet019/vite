import React, { createContext, useState, useContext } from 'react';
import { callGeminiForTranslation, callGeminiForSpeechTranslation } from '../utils/translationUtils';
import { useSettings } from './SettingsContext';
import translations from '../utils/translations';

const TranslationContext = createContext();

export const useTranslation = () => useContext(TranslationContext);

export const TranslationProvider = ({ children }) => {
  const { settings } = useSettings();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Get translations based on current interface language
  const t = translations[settings.interfaceLanguage];

  // Send text message for translation
  const sendTextMessage = async (text) => {
    if (!settings.apiKey) {
      setError(t.apiKeyError);
      return false;
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
      return true;
    } catch (err) {
      console.error('Translation error:', err);
      setError(`${t.errorPrefix} ${err.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Send voice message for translation
  const sendVoiceMessage = async (base64Audio) => {
    if (!settings.apiKey) {
      setError(t.apiKeyError);
      return false;
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
      return true;
    } catch (err) {
      console.error('Speech translation error:', err);
      setError(`${t.errorPrefix} ${err.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Clear chat history
  const clearChat = () => {
    setMessages([]);
    setError('');
  };

  return (
    <TranslationContext.Provider 
      value={{ 
        messages, 
        isLoading, 
        error, 
        sendTextMessage, 
        sendVoiceMessage, 
        clearChat,
        t // Provide translations
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
};
