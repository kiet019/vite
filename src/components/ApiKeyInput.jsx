import { useState, useEffect } from 'react';
import translations from '../utils/translations';

function ApiKeyInput({ onApiKeyChange, language = 'en' }) {
  const [apiKey, setApiKey] = useState('');

  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      onApiKeyChange(savedApiKey);
    }
  }, [onApiKeyChange]);

  const handleApiKeyChange = (e) => {
    const newApiKey = e.target.value;
    setApiKey(newApiKey);
    localStorage.setItem('gemini_api_key', newApiKey);
    onApiKeyChange(newApiKey);
  };

  // Get translations based on current interface language
  const t = translations[language];

  return (
    <div className="api-key-input">
      <label htmlFor="api-key">{t.apiKeyLabel}</label>
      <input
        type="password"
        id="api-key"
        value={apiKey}
        onChange={handleApiKeyChange}
        placeholder={t.apiKeyPlaceholder}
      />
    </div>
  );
}

export default ApiKeyInput;
