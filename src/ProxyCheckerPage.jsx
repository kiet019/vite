import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import ProxyChecker from './components/ProxyChecker';
import ProxyVideoViewer from './components/ProxyVideoViewer';
import translations from './utils/translations';
import './style.css';
import './theme.css';
import './slider-fix.css';
import './styles/proxy-checker.css';
import './styles/proxy-checker-page.css';
import './styles/button-fix.css';
import { initMobileViewportFix, initAndroidInputFix, initIOSScrollFix } from './utils/mobileViewportFix';

// Initialize mobile viewport fixes
initMobileViewportFix();

// Initialize after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initAndroidInputFix();
  initIOSScrollFix();
});

function ProxyCheckerPage() {
  const [interfaceLanguage, setInterfaceLanguage] = useState('en');
  const [activeTab, setActiveTab] = useState('checker');
  const [isLoading, setIsLoading] = useState(true);

  // Load language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('interface_language') || 'en';
    setInterfaceLanguage(savedLanguage);

    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Handle language change
  const handleLanguageChange = (newLanguage) => {
    setInterfaceLanguage(newLanguage);
    localStorage.setItem('interface_language', newLanguage);
  };

  // Get translations based on current interface language
  const t = translations[interfaceLanguage];

  return (
    <div className="proxy-checker-page">
      {isLoading ? (
        <div className="page-loading">
          <div className="loading-spinner"></div>
          <p>{t.loading || 'Loading...'}</p>
        </div>
      ) : (
        <>
          <header className="proxy-page-header">
            <h1>{t.proxyCheckerTitle || 'Proxy/Socks Checker'}</h1>
            <div className="language-switcher">
              <select
                value={interfaceLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                aria-label="Select language"
                title="Change language / Thay đổi ngôn ngữ"
              >
                <option value="en">English</option>
                <option value="vi">Tiếng Việt</option>
              </select>
            </div>
          </header>

      <div className="proxy-page-tabs">
        <button
          className={`tab-button ${activeTab === 'checker' ? 'active' : ''}`}
          onClick={() => setActiveTab('checker')}
        >
          <span className="tab-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
            </svg>
          </span>
          <span className="tab-text">{t.proxyCheckerTabTitle || 'Proxy Checker'}</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'videoviewer' ? 'active' : ''}`}
          onClick={() => setActiveTab('videoviewer')}
        >
          <span className="tab-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 3H3c-1.11 0-2 .89-2 2v12c0 1.1.89 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.11-.9-2-2-2zm0 14H3V5h18v12z"/>
              <path d="M10 8.64v6.72L15.27 12z"/>
            </svg>
          </span>
          <span className="tab-text">{t.proxyVideoViewerTabTitle || 'Video Viewer'}</span>
        </button>
      </div>

      <div className="proxy-page-content">
        {activeTab === 'checker' && (
          <ProxyChecker
            language={interfaceLanguage}
            standalone={true}
          />
        )}
        {activeTab === 'videoviewer' && (
          <ProxyVideoViewer
            language={interfaceLanguage}
          />
        )}
      </div>

      <footer className="proxy-page-footer">
        <a href="/language-chatbot/" className="back-to-main">
          {t.backToMainApp || 'Back to Main App'}
        </a>
      </footer>
        </>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <ProxyCheckerPage />
  </React.StrictMode>
);
