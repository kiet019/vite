import React from 'react'
import ReactDOM from 'react-dom/client'
import './style.css'
import './theme.css'
import './slider-fix.css'
import './styles/button-fix.css'
import App from './App'
import { initMobileViewportFix, initAndroidInputFix, initIOSScrollFix } from './utils/mobileViewportFix'

// Initialize mobile viewport fixes
initMobileViewportFix();

// Initialize after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initAndroidInputFix();
  initIOSScrollFix();
});

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
