import { useState, useEffect } from 'react';
import TranslationChatbot from './components/TranslationChatbot';
import MetaSeoGenerator from './components/MetaSeoGenerator';
import SeoKeywordResearch from './components/SeoKeywordResearch';
import CountryResearchTool from './components/CountryResearchTool';
import AdminManagement from './components/AdminManagement';
import SocialMediaAutomation from './components/SocialMediaAutomation';
import ProxyChecker from './components/ProxyChecker';
import ChatRoom from './components/ChatRoom';
import TabPanel from './components/TabPanel';
import Login from './components/Login';
import translations from './utils/translations';

// Import CSS for new components
import './styles/seo-keyword.css';
import './styles/country-research.css';
import './styles/admin-management.css';
import './styles/social-media.css';
import './styles/proxy-checker.css';
import './styles/chatRoom.css';

function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [interfaceLanguage, setInterfaceLanguage] = useState('en');
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(1); // Default to medium (1.0)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('interface_language') || 'en';
    setInterfaceLanguage(savedLanguage);

    // Load font size from localStorage
    const savedFontSize = localStorage.getItem('font_size');
    if (savedFontSize) {
      setFontSize(parseFloat(savedFontSize));
    }

    // Load and apply font family
    const savedFontFamily = localStorage.getItem('app_font_family') || 'questrial';
    const fontFamilyValue = savedFontFamily === 'questrial' ? 'var(--font-questrial)' : 'var(--font-source-code-pro)';
    document.documentElement.style.setProperty('--app-font-family', fontFamilyValue);

    // Check if user is already logged in
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      setIsAuthenticated(true);
      setUsername(savedUsername);
    }
  }, []);

  // Handle language change from TranslationChatbot
  const handleSettingsChange = (settings) => {
    if (settings.interfaceLanguage !== interfaceLanguage) {
      setInterfaceLanguage(settings.interfaceLanguage);
      localStorage.setItem('interface_language', settings.interfaceLanguage);
    }
  };

  // Handle language change from Login
  const handleLanguageChange = (newLanguage) => {
    setInterfaceLanguage(newLanguage);
    localStorage.setItem('interface_language', newLanguage);
  };

  // Handle settings button click
  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  // Handle login
  const handleLogin = (username) => {
    setIsAuthenticated(true);
    setUsername(username);
    localStorage.setItem('username', username);
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    localStorage.removeItem('username');
  };

  // Get translations based on current interface language
  const t = translations[interfaceLanguage];

  // Get API key from localStorage if available
  const getApiKey = () => {
    return localStorage.getItem('gemini_api_key') || '';
  };

  return (
    <>
      {isAuthenticated ? (
        <TabPanel
          activeTab={activeTab}
          onTabChange={setActiveTab}
          language={interfaceLanguage}
          onSettingsClick={handleSettingsClick}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          username={username}
          onLogout={handleLogout}
        >
          {activeTab === 'chat' && (
            <TranslationChatbot
              onSettingsChange={handleSettingsChange}
              showSettings={showSettings}
              onCloseSettings={() => setShowSettings(false)}
              fontSize={fontSize}
              onFontSizeChange={setFontSize}
            />
          )}
          {activeTab === 'chatroom' && (
            <ChatRoom
              language={interfaceLanguage}
              apiKey={getApiKey()}
            />
          )}
          {activeTab === 'metaseo' && (
            <MetaSeoGenerator
              language={interfaceLanguage}
            />
          )}
          {activeTab === 'seokeyword' && (
            <SeoKeywordResearch
              language={interfaceLanguage}
            />
          )}
          {activeTab === 'countryresearch' && (
            <CountryResearchTool
              language={interfaceLanguage}
            />
          )}
          {activeTab === 'admin' && (
            <AdminManagement
              language={interfaceLanguage}
            />
          )}
          {activeTab === 'socialmedia' && (
            <SocialMediaAutomation
              language={interfaceLanguage}
            />
          )}
          {activeTab === 'proxychecker' && (
            <ProxyChecker
              language={interfaceLanguage}
            />
          )}
        </TabPanel>
      ) : (
        <Login
          onLogin={handleLogin}
          language={interfaceLanguage}
          onLanguageChange={handleLanguageChange}
        />
      )}
    </>
  );
}

export default App;
