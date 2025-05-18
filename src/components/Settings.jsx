import { useState, useEffect } from 'react';
import translations from '../utils/translations';

function Settings({ onClose, onSettingsChange, language = 'en' }) {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-2.5-pro-exp-03-25');
  const [theme, setTheme] = useState('system');
  const [interfaceLanguage, setInterfaceLanguage] = useState('en');
  const [contextCaching, setContextCaching] = useState(true);
  const [fontFamily, setFontFamily] = useState('questrial');
  const [autoStopVoice, setAutoStopVoice] = useState(true);
  const [isPWA, setIsPWA] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini_api_key') || '';
    const savedModel = localStorage.getItem('gemini_model') || 'gemini-2.5-pro-exp-03-25';
    const savedTheme = localStorage.getItem('app_theme') || 'system';
    const savedLanguage = localStorage.getItem('interface_language') || 'en';
    const savedCaching = localStorage.getItem('context_caching') !== 'false'; // Default to true if not set
    const savedFont = localStorage.getItem('app_font_family') || 'questrial';
    const savedAutoStop = localStorage.getItem('voice_auto_stop') !== 'false'; // Default to true if not set
    const pwaMode = localStorage.getItem('isPWA') === 'true';

    setApiKey(savedApiKey);
    setModel(savedModel);
    setTheme(savedTheme);
    setInterfaceLanguage(savedLanguage);
    setContextCaching(savedCaching);
    setFontFamily(savedFont);
    setAutoStopVoice(savedAutoStop);
    setIsPWA(pwaMode);
  }, []);

  const handleSave = () => {
    // Save settings to localStorage
    localStorage.setItem('gemini_api_key', apiKey);
    localStorage.setItem('gemini_model', model);
    localStorage.setItem('app_theme', theme);
    localStorage.setItem('interface_language', interfaceLanguage);
    localStorage.setItem('context_caching', contextCaching);
    localStorage.setItem('app_font_family', fontFamily);
    localStorage.setItem('voice_auto_stop', autoStopVoice);

    // Apply font family immediately
    document.documentElement.style.setProperty('--app-font-family',
      fontFamily === 'questrial' ? 'var(--font-questrial)' : 'var(--font-source-code-pro)');

    // Apply theme class for PWA if needed
    if (isPWA) {
      document.body.classList.add('pwa-mode');
      if (isIOS()) {
        document.body.classList.add('pwa-ios');
      } else if (isAndroid()) {
        document.body.classList.add('pwa-android');
      }
    } else {
      document.body.classList.remove('pwa-mode', 'pwa-ios', 'pwa-android');
    }

    // Notify parent component
    onSettingsChange({
      apiKey,
      model,
      theme,
      interfaceLanguage,
      contextCaching,
      fontFamily,
      autoStopVoice,
      isPWA
    });
    onClose();
  };

  // Platform detection helpers
  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  };

  const isAndroid = () => {
    return /Android/i.test(navigator.userAgent);
  };

  // Get translations based on current interface language
  const t = translations[language];

  return (
    <div className="settings-overlay">
      <div className="settings-panel">
        <div className="settings-panel-header">
          <h2>{t.settingsTitle}</h2>
        </div>

        {/* API Key - Full width */}
        <div className="settings-group full-width">
          <label htmlFor="api-key">{t.apiKeyLabel}</label>
          <input
            type="password"
            id="api-key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={t.apiKeyPlaceholder}
          />
          <div className="api-key-help">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.getApiKeyLink}
            </a>
          </div>
        </div>

        {/* Model Selection */}
        <div className="settings-group">
          <label htmlFor="model-select">{t.modelLabel}</label>
          <select
            id="model-select"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="gemini-2.0-flash-lite">{t.modelFast}</option>
            <option value="gemini-2.0-flash">{t.modelMedium}</option>
            <option value="gemini-2.5-pro-exp-03-25">{t.modelSlow}</option>
          </select>
        </div>

        {/* Theme Selection */}
        <div className="settings-group">
          <label htmlFor="theme-select">{t.themeLabel}</label>
          <select
            id="theme-select"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            <option value="system">{t.systemTheme}</option>
            <option value="light">{t.lightTheme}</option>
            <option value="dark">{t.darkTheme}</option>
          </select>
        </div>

        {/* Interface Language */}
        <div className="settings-group">
          <label htmlFor="language-select">{t.interfaceLanguageLabel}</label>
          <select
            id="language-select"
            value={interfaceLanguage}
            onChange={(e) => setInterfaceLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="vi">Tiếng Việt</option>
          </select>
        </div>

        {/* Context Caching */}
        <div className="settings-group">
          <label htmlFor="caching-select">{t.cachingLabel}</label>
          <select
            id="caching-select"
            value={contextCaching.toString()}
            onChange={(e) => setContextCaching(e.target.value === 'true')}
          >
            <option value="true">{t.cachingEnabled}</option>
            <option value="false">{t.cachingDisabled}</option>
          </select>
          <div className="setting-description">{t.cachingDescription}</div>
        </div>

        {/* Font Family Selection */}
        <div className="settings-group">
          <label htmlFor="font-family-select">{t.fontFamilyLabel}</label>
          <select
            id="font-family-select"
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
          >
            <option value="questrial">{t.fontQuestrial}</option>
            <option value="source-code-pro">{t.fontSourceCodePro}</option>
          </select>

          {/* Font Preview */}
          {fontFamily === 'questrial' ? (
            <div className="font-preview-questrial">Questrial - Sample Text</div>
          ) : (
            <div className="font-preview-source-code-pro">Source Code Pro - Sample Text</div>
          )}
        </div>

        {/* Voice Recording Auto-Stop */}
        <div className="settings-group">
          <label htmlFor="auto-stop-select">{t.autoStopLabel}</label>
          <select
            id="auto-stop-select"
            value={autoStopVoice.toString()}
            onChange={(e) => setAutoStopVoice(e.target.value === 'true')}
          >
            <option value="true">{t.autoStopEnabled}</option>
            <option value="false">{t.autoStopDisabled}</option>
          </select>
          <div className="setting-description">{t.autoStopDescription}</div>
        </div>

        {/* PWA Mode Indicator (read-only) */}
        {isPWA && (
          <div className="settings-group pwa-indicator">
            <div className="pwa-badge">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M19 1H5c-1.1 0-1.99.9-1.99 2L3 15.93c0 .69.35 1.3.88 1.66L12 23l8.11-5.41c.53-.36.88-.97.88-1.66L21 3c0-1.1-.9-2-2-2zm-7 19.6l-7-4.66V3h14v12.93l-7 4.67z"/>
              </svg>
              {t.pwaMode}
            </div>
            <div className="setting-description">{t.pwaModeDescription}</div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="settings-panel-footer">
          <div className="settings-actions">
            <button onClick={onClose} className="cancel-button">{t.cancelButton}</button>
            <button onClick={handleSave} className="save-button">{t.saveButton}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
