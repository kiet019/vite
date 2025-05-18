import { useState, useEffect } from 'react';
import translations from '../utils/translations';

function ProxyChecker({ language = 'en', standalone = false }) {
  const [proxies, setProxies] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('check');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authCredentials, setAuthCredentials] = useState({
    username: '',
    password: ''
  });
  const [proxyType, setProxyType] = useState('http');
  const [timeout, setTimeout] = useState(10);
  const [advancedOptions, setAdvancedOptions] = useState(false);
  const [checkOptions, setCheckOptions] = useState({
    checkAnonymity: true,
    checkCountry: true,
    checkSpeed: true
  });

  // Get translations based on current interface language
  const t = translations[language];

  // Check if user is authenticated for advanced features
  useEffect(() => {
    // In standalone mode, no authentication is required
    if (standalone) {
      setIsAuthenticated(true);
    } else {
      const savedAuth = localStorage.getItem('proxy_checker_auth');
      if (savedAuth === 'true') {
        setIsAuthenticated(true);
      }
    }
  }, [standalone]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('check-')) {
      const option = name.replace('check-', '');
      setCheckOptions(prev => ({
        ...prev,
        [option]: checked
      }));
    } else if (name === 'proxyType') {
      setProxyType(value);
    } else if (name === 'timeout') {
      setTimeout(parseInt(value) || 10);
    } else if (name === 'proxies') {
      setProxies(value);
    }
  };

  const handleAuthInputChange = (e) => {
    const { name, value } = e.target;
    setAuthCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = () => {
    // In a real app, you would validate credentials against a backend
    // This is a simplified demo that accepts any non-empty credentials
    if (authCredentials.username && authCredentials.password) {
      setIsAuthenticated(true);
      localStorage.setItem('proxy_checker_auth', 'true');
      setSuccess(t.proxyAuthSuccess || 'Authentication successful');
    } else {
      setError(t.proxyAuthError || 'Please enter both username and password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('proxy_checker_auth');
    setAuthCredentials({
      username: '',
      password: ''
    });
  };

  const parseProxies = () => {
    if (!proxies.trim()) {
      setError(t.proxyRequired || 'Please enter at least one proxy');
      return [];
    }

    // Split by newline and filter out empty lines
    const lines = proxies.trim().split(/\\r?\\n/).filter(line => line.trim());

    return lines.map(line => {
      // Try to parse proxy in format ip:port or ip:port:username:password
      const parts = line.trim().split(':');

      if (parts.length < 2) {
        return { raw: line, valid: false, error: t.proxyInvalidFormat || 'Invalid format' };
      }

      const proxy = {
        raw: line,
        ip: parts[0],
        port: parts[1],
        valid: true
      };

      if (parts.length >= 4) {
        proxy.username = parts[2];
        proxy.password = parts[3];
      }

      return proxy;
    });
  };

  const checkProxies = async () => {
    const parsedProxies = parseProxies();

    if (parsedProxies.length === 0) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    setResults([]);

    try {
      // In a real app, you would send these proxies to a backend service for checking
      // This is a simplified demo that simulates checking with random results
      setTimeout(() => {
        const checkedProxies = parsedProxies.map(proxy => {
          if (!proxy.valid) {
            return {
              ...proxy,
              status: 'error',
              error: proxy.error
            };
          }

          // Simulate checking results with random data
          const isWorking = Math.random() > 0.3; // 70% chance of working

          if (!isWorking) {
            return {
              ...proxy,
              status: 'dead',
              error: t.proxyConnectionFailed || 'Connection failed'
            };
          }

          const result = {
            ...proxy,
            status: 'alive',
            responseTime: Math.floor(Math.random() * 1000) + 100 // 100-1100ms
          };

          if (checkOptions.checkAnonymity) {
            const anonymityLevels = ['transparent', 'anonymous', 'elite'];
            result.anonymity = anonymityLevels[Math.floor(Math.random() * anonymityLevels.length)];
          }

          if (checkOptions.checkCountry) {
            const countries = ['US', 'GB', 'DE', 'FR', 'JP', 'CA', 'AU', 'RU', 'IN', 'BR'];
            result.country = countries[Math.floor(Math.random() * countries.length)];
          }

          if (checkOptions.checkSpeed) {
            result.speed = Math.floor(Math.random() * 10) + 1; // 1-10 Mbps
          }

          return result;
        });

        setResults(checkedProxies);

        const workingCount = checkedProxies.filter(p => p.status === 'alive').length;
        setSuccess(t.proxyCheckComplete.replace('{count}', workingCount) ||
          `Check complete. Found ${workingCount} working proxies out of ${checkedProxies.length}.`);

        setIsLoading(false);
      }, 2000);
    } catch (err) {
      console.error('Proxy check error:', err);
      setError(`${t.errorPrefix || 'Error:'} ${err.message}`);
      setIsLoading(false);
    }
  };

  const exportResults = () => {
    if (results.length === 0) {
      setError(t.proxyNoResults || 'No results to export');
      return;
    }

    // Filter only working proxies
    const workingProxies = results.filter(proxy => proxy.status === 'alive');

    if (workingProxies.length === 0) {
      setError(t.proxyNoWorkingProxies || 'No working proxies to export');
      return;
    }

    // Format as ip:port or ip:port:username:password
    const exportText = workingProxies.map(proxy => {
      if (proxy.username && proxy.password) {
        return `${proxy.ip}:${proxy.port}:${proxy.username}:${proxy.password}`;
      }
      return `${proxy.ip}:${proxy.port}`;
    }).join('\\n');

    // Create a blob and download
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'working_proxies.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setSuccess(t.proxyExportSuccess || 'Working proxies exported successfully');
  };

  const renderCheckTab = () => (
    <div className="proxy-check-form">
      <h3>{t.proxyCheckTitle || 'Check Proxies'}</h3>

      <div className="form-group">
        <label htmlFor="proxies">{t.proxyInputLabel || 'Enter Proxies (one per line):'}</label>
        <textarea
          id="proxies"
          name="proxies"
          value={proxies}
          onChange={handleInputChange}
          placeholder={t.proxyInputPlaceholder || 'Format: ip:port or ip:port:username:password\\nExample: 192.168.1.1:8080\\n10.0.0.1:3128:user:pass'}
          rows="8"
          required
        ></textarea>
      </div>

      <div className="form-row">
        <div className="form-group half-width">
          <label htmlFor="proxy-type">{t.proxyTypeLabel || 'Proxy Type:'}</label>
          <select
            id="proxy-type"
            name="proxyType"
            value={proxyType}
            onChange={handleInputChange}
          >
            <option value="http">HTTP</option>
            <option value="https">HTTPS</option>
            <option value="socks4">SOCKS4</option>
            <option value="socks5">SOCKS5</option>
          </select>
        </div>
        <div className="form-group half-width">
          <label htmlFor="timeout">{t.proxyTimeoutLabel || 'Timeout (seconds):'}</label>
          <input
            type="number"
            id="timeout"
            name="timeout"
            value={timeout}
            onChange={handleInputChange}
            min="1"
            max="60"
          />
        </div>
      </div>

      <div className="advanced-options-toggle">
        <button
          type="button"
          className="toggle-button"
          onClick={() => setAdvancedOptions(!advancedOptions)}
        >
          {advancedOptions ? (t.hideAdvancedOptions || 'Hide Advanced Options') : (t.showAdvancedOptions || 'Show Advanced Options')}
        </button>
      </div>

      {advancedOptions && (
        <div className="advanced-options">
          <div className="check-options">
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="check-anonymity"
                  checked={checkOptions.checkAnonymity}
                  onChange={handleInputChange}
                />
                <span>{t.proxyCheckAnonymity || 'Check Anonymity Level'}</span>
              </label>
            </div>
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="check-country"
                  checked={checkOptions.checkCountry}
                  onChange={handleInputChange}
                />
                <span>{t.proxyCheckCountry || 'Check Country'}</span>
              </label>
            </div>
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="check-speed"
                  checked={checkOptions.checkSpeed}
                  onChange={handleInputChange}
                />
                <span>{t.proxyCheckSpeed || 'Check Speed'}</span>
              </label>
            </div>
          </div>

          {!isAuthenticated && (
            <div className="auth-required-notice">
              <p>{t.proxyAuthRequired || 'Some advanced features require authentication.'}</p>
              <button
                type="button"
                className="auth-button"
                onClick={() => setActiveTab('auth')}
              >
                {t.proxyAuthButton || 'Authenticate'}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="form-buttons">
        <button
          type="button"
          className="check-button"
          onClick={checkProxies}
          disabled={isLoading || !proxies.trim()}
        >
          {isLoading ? (t.proxyChecking || 'Checking...') : (t.proxyCheckButton || 'Check Proxies')}
        </button>

        {results.length > 0 && (
          <button
            type="button"
            className="export-button"
            onClick={exportResults}
          >
            {t.proxyExportButton || 'Export Working Proxies'}
          </button>
        )}
      </div>

      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t.proxyCheckingProgress || 'Checking proxies...'}</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="results-container">
          <h3>{t.proxyResultsTitle || 'Results'}</h3>
          <div className="results-summary">
            <div className="result-stat">
              <span className="stat-label">{t.proxyTotalChecked || 'Total Checked:'}</span>
              <span className="stat-value">{results.length}</span>
            </div>
            <div className="result-stat">
              <span className="stat-label">{t.proxyWorkingCount || 'Working:'}</span>
              <span className="stat-value">{results.filter(p => p.status === 'alive').length}</span>
            </div>
            <div className="result-stat">
              <span className="stat-label">{t.proxyDeadCount || 'Dead:'}</span>
              <span className="stat-value">{results.filter(p => p.status === 'dead').length}</span>
            </div>
            <div className="result-stat">
              <span className="stat-label">{t.proxyErrorCount || 'Errors:'}</span>
              <span className="stat-value">{results.filter(p => p.status === 'error').length}</span>
            </div>
          </div>

          <div className="results-table-container">
            <table className="results-table">
              <thead>
                <tr>
                  <th>{t.proxyIp || 'IP:Port'}</th>
                  <th>{t.proxyStatus || 'Status'}</th>
                  <th>{t.proxyResponseTime || 'Response Time'}</th>
                  {checkOptions.checkAnonymity && <th>{t.proxyAnonymity || 'Anonymity'}</th>}
                  {checkOptions.checkCountry && <th>{t.proxyCountry || 'Country'}</th>}
                  {checkOptions.checkSpeed && <th>{t.proxySpeed || 'Speed'}</th>}
                </tr>
              </thead>
              <tbody>
                {results.map((proxy, index) => (
                  <tr key={index} className={`proxy-row status-${proxy.status}`}>
                    <td>{proxy.ip}:{proxy.port}</td>
                    <td>
                      <span className={`status-badge status-${proxy.status}`}>
                        {proxy.status === 'alive'
                          ? (t.proxyStatusAlive || 'Working')
                          : proxy.status === 'dead'
                            ? (t.proxyStatusDead || 'Dead')
                            : (t.proxyStatusError || 'Error')}
                      </span>
                      {proxy.error && <div className="proxy-error">{proxy.error}</div>}
                    </td>
                    <td>
                      {proxy.status === 'alive'
                        ? `${proxy.responseTime}ms`
                        : '-'}
                    </td>
                    {checkOptions.checkAnonymity && (
                      <td>
                        {proxy.status === 'alive' && proxy.anonymity
                          ? (
                              <span className={`anonymity-badge anonymity-${proxy.anonymity}`}>
                                {proxy.anonymity === 'transparent'
                                  ? (t.proxyAnonymityTransparent || 'Transparent')
                                  : proxy.anonymity === 'anonymous'
                                    ? (t.proxyAnonymityAnonymous || 'Anonymous')
                                    : (t.proxyAnonymityElite || 'Elite')}
                              </span>
                            )
                          : '-'}
                      </td>
                    )}
                    {checkOptions.checkCountry && (
                      <td>
                        {proxy.status === 'alive' && proxy.country
                          ? proxy.country
                          : '-'}
                      </td>
                    )}
                    {checkOptions.checkSpeed && (
                      <td>
                        {proxy.status === 'alive' && proxy.speed
                          ? `${proxy.speed} Mbps`
                          : '-'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderAuthTab = () => (
    <div className="proxy-auth-form">
      <h3>{t.proxyAuthTitle || 'Authentication'}</h3>

      {isAuthenticated ? (
        <div className="auth-status">
          <p className="auth-success">{t.proxyAlreadyAuth || 'You are already authenticated for advanced features.'}</p>
          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            {t.proxyLogout || 'Logout'}
          </button>
        </div>
      ) : (
        <>
          <p className="auth-description">
            {t.proxyAuthDescription || 'Authenticate to access advanced proxy checking features.'}
          </p>

          <div className="form-group">
            <label htmlFor="auth-username">{t.proxyUsername || 'Username:'}</label>
            <input
              type="text"
              id="auth-username"
              name="username"
              value={authCredentials.username}
              onChange={handleAuthInputChange}
              placeholder={t.proxyUsernamePlaceholder || 'Enter your username'}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">{t.proxyPassword || 'Password:'}</label>
            <input
              type="password"
              id="auth-password"
              name="password"
              value={authCredentials.password}
              onChange={handleAuthInputChange}
              placeholder={t.proxyPasswordPlaceholder || 'Enter your password'}
              required
            />
          </div>

          <div className="form-buttons">
            <button
              type="button"
              className="login-button"
              onClick={handleLogin}
              disabled={!authCredentials.username || !authCredentials.password}
            >
              {t.proxyLogin || 'Login'}
            </button>
            <button
              type="button"
              className="cancel-button"
              onClick={() => setActiveTab('check')}
            >
              {t.proxyCancel || 'Cancel'}
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderHelpTab = () => (
    <div className="proxy-help">
      <h3>{t.proxyHelpTitle || 'Help & Information'}</h3>

      <div className="help-section">
        <h4>{t.proxyHelpBasics || 'Proxy Basics'}</h4>
        <p>{t.proxyHelpBasicsText || 'A proxy server acts as an intermediary between your computer and the internet. It can be used for anonymity, bypassing restrictions, or improving performance.'}</p>
      </div>

      <div className="help-section">
        <h4>{t.proxyHelpTypes || 'Proxy Types'}</h4>
        <ul>
          <li><strong>HTTP</strong> - {t.proxyHelpHttp || 'Basic proxy type for web browsing. Not encrypted.'}</li>
          <li><strong>HTTPS</strong> - {t.proxyHelpHttps || 'Encrypted version of HTTP proxy.'}</li>
          <li><strong>SOCKS4</strong> - {t.proxyHelpSocks4 || 'General purpose proxy without authentication or UDP support.'}</li>
          <li><strong>SOCKS5</strong> - {t.proxyHelpSocks5 || 'Advanced proxy with authentication and UDP support.'}</li>
        </ul>
      </div>

      <div className="help-section">
        <h4>{t.proxyHelpAnonymity || 'Anonymity Levels'}</h4>
        <ul>
          <li><strong>{t.proxyAnonymityTransparent || 'Transparent'}</strong> - {t.proxyHelpTransparent || 'Your IP is visible to the target server.'}</li>
          <li><strong>{t.proxyAnonymityAnonymous || 'Anonymous'}</strong> - {t.proxyHelpAnonymous || 'The server knows you\'re using a proxy but can\'t see your real IP.'}</li>
          <li><strong>{t.proxyAnonymityElite || 'Elite'}</strong> - {t.proxyHelpElite || 'The server doesn\'t know you\'re using a proxy.'}</li>
        </ul>
      </div>

      <div className="help-section">
        <h4>{t.proxyHelpUsage || 'How to Use This Tool'}</h4>
        <ol>
          <li>{t.proxyHelpStep1 || 'Enter your proxies in the format IP:PORT or IP:PORT:USERNAME:PASSWORD, one per line.'}</li>
          <li>{t.proxyHelpStep2 || 'Select the proxy type and timeout.'}</li>
          <li>{t.proxyHelpStep3 || 'Choose any advanced options if needed.'}</li>
          <li>{t.proxyHelpStep4 || 'Click "Check Proxies" to start the verification process.'}</li>
          <li>{t.proxyHelpStep5 || 'After checking, you can export working proxies to a text file.'}</li>
        </ol>
      </div>
    </div>
  );

  return (
    <div className="proxy-checker">
      <h2>{t.proxyCheckerTitle || 'Proxy/Socks Checker'}</h2>
      <p className="proxy-description">
        {t.proxyCheckerDescription || 'Check if proxies or SOCKS are alive or dead with detailed information about each.'}
      </p>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="proxy-tabs">
        <button
          className={`tab-button ${activeTab === 'check' ? 'active' : ''}`}
          onClick={() => setActiveTab('check')}
        >
          {t.proxyCheckTab || 'Check Proxies'}
        </button>
        <button
          className={`tab-button ${activeTab === 'auth' ? 'active' : ''}`}
          onClick={() => setActiveTab('auth')}
        >
          {t.proxyAuthTab || 'Authentication'}
        </button>
        <button
          className={`tab-button ${activeTab === 'help' ? 'active' : ''}`}
          onClick={() => setActiveTab('help')}
        >
          {t.proxyHelpTab || 'Help'}
        </button>
      </div>

      <div className="proxy-tab-content">
        {activeTab === 'check' && renderCheckTab()}
        {activeTab === 'auth' && renderAuthTab()}
        {activeTab === 'help' && renderHelpTab()}
      </div>
    </div>
  );
}

export default ProxyChecker;
