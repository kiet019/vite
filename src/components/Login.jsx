import { useState, useEffect } from 'react';
import translations from '../utils/translations';

function Login({ onLogin, language = 'en', onLanguageChange }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Get translations based on current interface language
  const t = translations[language];

  // Fix for Android input focus issues
  useEffect(() => {
    const inputs = document.querySelectorAll('input');

    const handleTouchStart = (e) => {
      // Force focus on touch
      e.target.focus();
    };

    inputs.forEach(input => {
      input.addEventListener('touchstart', handleTouchStart);
    });

    return () => {
      inputs.forEach(input => {
        input.removeEventListener('touchstart', handleTouchStart);
      });
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Hardcoded credentials - in a real app, this would be handled securely on a server
    const validCredentials = [
      { username: 'user', password: 'password' },
      { username: 'admin', password: 'admin123' }
    ];

    const isValid = validCredentials.some(
      cred => cred.username === username && cred.password === password
    );

    if (isValid) {
      setError('');
      onLogin(username);
    } else {
      setError(t.loginError);
    }
  };

  // Handle language change
  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    if (onLanguageChange) {
      onLanguageChange(newLanguage);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="login-header">
          <h2>{t.loginTitle}</h2>
          <div className="language-switcher">
            <select
              value={language}
              onChange={handleLanguageChange}
              aria-label="Select language"
              title="Change language / Thay đổi ngôn ngữ"
            >
              <option value="en">English</option>
              <option value="vi">Tiếng Việt</option>
            </select>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">{t.usernameLabel}</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t.usernamePlaceholder}
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">{t.passwordLabel}</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.passwordPlaceholder}
              autoComplete="current-password"
              required
            />
          </div>
          {error && <div className="login-error">{error}</div>}
          <button type="submit" className="login-button">{t.loginButton}</button>
        </form>

        <div className="login-tools">
          <a href="proxy-checker.html" className="proxy-checker-link">
            {t.proxyCheckerAccessButton || 'Access Proxy Checker'}
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;
