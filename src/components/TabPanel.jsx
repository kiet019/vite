import React, { useState } from 'react';
import translations from '../utils/translations';
import FontSizeSlider from './FontSizeSlider';

function TabPanel({ children, activeTab, onTabChange, language = 'en', onSettingsClick, fontSize = 1, onFontSizeChange, username, onLogout }) {
  const t = translations[language];

  return (
    <div className="tab-panel">
      <div className="unified-header">
        <div className="header-left">
          <button
            className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => onTabChange('chat')}
          >
            <span className="tab-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
              </svg>
            </span>
            <span className="tab-text">
              {t.appTitle.split('  ').map((part, index, array) => (
                <React.Fragment key={index}>
                  {part}
                  {index < array.length - 1 && (
                    <span className="translation-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7.5 21L3 16.5L7.5 12L9 13.5L7.05 15.45H15V10.5H18V18.45H7.05L9 20.4L7.5 21ZM16.5 12L15 10.5L16.95 8.55H9V13.5H6V5.55H16.95L15 3.6L16.5 2.1L21 6.6L16.5 12Z"/>
                      </svg>
                    </span>
                  )}
                </React.Fragment>
              ))}
            </span>
          </button>
          <button
            className={`tab-button ${activeTab === 'chatroom' ? 'active' : ''}`}
            onClick={() => onTabChange('chatroom')}
          >
            <span className="tab-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
              </svg>
            </span>
            <span className="tab-text">{t.chatRoomTabTitle || 'Chat Room'}</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'metaseo' ? 'active' : ''}`}
            onClick={() => onTabChange('metaseo')}
          >
            <span className="tab-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
              </svg>
            </span>
            <span className="tab-text">{t.metaSeoTabTitle}</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'seokeyword' ? 'active' : ''}`}
            onClick={() => onTabChange('seokeyword')}
          >
            <span className="tab-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                <path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/>
              </svg>
            </span>
            <span className="tab-text">{t.seoKeywordTabTitle || 'SEO Keywords'}</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'countryresearch' ? 'active' : ''}`}
            onClick={() => onTabChange('countryresearch')}
          >
            <span className="tab-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </span>
            <span className="tab-text">{t.countryResearchTabTitle || 'Country Research'}</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => onTabChange('admin')}
          >
            <span className="tab-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </span>
            <span className="tab-text">{t.adminTabTitle || 'Admin'}</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'socialmedia' ? 'active' : ''}`}
            onClick={() => onTabChange('socialmedia')}
          >
            <span className="tab-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
            </span>
            <span className="tab-text">{t.socialMediaTabTitle || 'Social Media'}</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'proxychecker' ? 'active' : ''}`}
            onClick={() => onTabChange('proxychecker')}
          >
            <span className="tab-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
              </svg>
            </span>
            <span className="tab-text">{t.proxyCheckerTabTitle || 'Proxy Checker'}</span>
          </button>
        </div>

        <div className="header-controls">
          {username && (
            <button className="logout-button" onClick={onLogout}>
              {t.logoutButton}
            </button>
          )}
          {onFontSizeChange && (
            <FontSizeSlider
              initialValue={fontSize}
              onChange={onFontSizeChange}
              language={language}
            />
          )}
          {onSettingsClick && (
            <button
              className="settings-button"
              onClick={onSettingsClick}
              title={t.settingsTitle}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className="tab-content">
        {children}
      </div>
    </div>
  );
}

export default TabPanel;
