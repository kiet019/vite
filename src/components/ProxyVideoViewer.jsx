import { useState, useEffect } from 'react';
import translations from '../utils/translations';

function ProxyVideoViewer({ language = 'en' }) {
  const [videoUrl, setVideoUrl] = useState('');
  const [proxies, setProxies] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [viewCount, setViewCount] = useState(0);
  const [proxyType, setProxyType] = useState('http');
  const [timeout, setTimeout] = useState(30);
  const [platform, setPlatform] = useState('auto');
  const [viewsTarget, setViewsTarget] = useState(10);
  const [viewsInterval, setViewsInterval] = useState(5);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentProxy, setCurrentProxy] = useState('');
  const [advancedOptions, setAdvancedOptions] = useState(false);
  const [savedProxyLists, setSavedProxyLists] = useState([]);
  const [showSavedLists, setShowSavedLists] = useState(false);
  const [proxyListName, setProxyListName] = useState('');
  const [quickTestProxy, setQuickTestProxy] = useState('');
  const [quickTestResult, setQuickTestResult] = useState(null);

  // Get translations based on current interface language
  const t = translations[language];

  // Load saved proxy lists from localStorage
  useEffect(() => {
    try {
      const savedLists = localStorage.getItem('saved_proxy_lists');
      if (savedLists) {
        setSavedProxyLists(JSON.parse(savedLists));
      }
    } catch (err) {
      console.error('Error loading saved proxy lists:', err);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'videoUrl') {
      setVideoUrl(value);
      // Auto-detect platform
      if (value.includes('facebook.com') || value.includes('fb.watch')) {
        setPlatform('facebook');
      } else if (value.includes('tiktok.com')) {
        setPlatform('tiktok');
      } else if (value.includes('youtube.com') || value.includes('youtu.be')) {
        setPlatform('youtube');
      } else {
        setPlatform('auto');
      }
    } else if (name === 'proxies') {
      setProxies(value);
    } else if (name === 'proxyType') {
      setProxyType(value);
    } else if (name === 'timeout') {
      setTimeout(parseInt(value) || 30);
    } else if (name === 'platform') {
      setPlatform(value);
    } else if (name === 'viewsTarget') {
      setViewsTarget(parseInt(value) || 10);
    } else if (name === 'viewsInterval') {
      setViewsInterval(parseInt(value) || 5);
    }
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

  const validateInputs = () => {
    // Reset errors
    setError('');

    // Validate video URL
    if (!videoUrl.trim()) {
      setError(t.videoUrlRequired || 'Please enter a video URL');
      return false;
    }

    // Validate URL format
    try {
      new URL(videoUrl);
    } catch (e) {
      setError(t.invalidVideoUrl || 'Please enter a valid URL');
      return false;
    }

    // Check if URL is from supported platforms
    const isSupported =
      videoUrl.includes('facebook.com') ||
      videoUrl.includes('fb.watch') ||
      videoUrl.includes('tiktok.com') ||
      videoUrl.includes('youtube.com') ||
      videoUrl.includes('youtu.be');

    if (!isSupported) {
      setError(t.unsupportedPlatform || 'URL must be from Facebook, TikTok, or YouTube');
      return false;
    }

    // Validate proxies
    const parsedProxies = parseProxies();
    if (parsedProxies.length === 0) {
      return false;
    }

    const validProxies = parsedProxies.filter(p => p.valid);
    if (validProxies.length === 0) {
      setError(t.noValidProxies || 'No valid proxies found');
      return false;
    }

    // Validate minimum proxies
    if (validProxies.length < 3) {
      setError(t.tooFewProxies || 'Please enter at least 3 valid proxies for better results');
      return false;
    }

    return true;
  };

  const startViewing = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    setViewCount(0);
    setProgress(0);
    setIsRunning(true);

    const parsedProxies = parseProxies().filter(p => p.valid);

    try {
      // In a real implementation, this would connect to a backend service
      // that handles the actual proxy rotation and video viewing
      // This is a simplified demo that simulates the process

      let currentCount = 0;
      let failedAttempts = 0;
      const totalViews = viewsTarget;
      const maxFailedAttempts = 5; // Maximum consecutive failed attempts before showing error

      // Store the interval ID so we can clear it if needed
      let viewIntervalId = null;

      viewIntervalId = setInterval(() => {
        // Check if we've reached the target or if we should stop due to errors
        if (currentCount >= totalViews) {
          clearInterval(viewIntervalId);
          setIsLoading(false);
          setIsRunning(false);
          setSuccess(t.viewingComplete.replace('{count}', currentCount) ||
            `Viewing complete. Generated ${currentCount} views.`);
          return;
        }

        // Simulate using a random proxy from the list
        const randomIndex = Math.floor(Math.random() * parsedProxies.length);
        const proxy = parsedProxies[randomIndex];
        setCurrentProxy(`${proxy.ip}:${proxy.port}`);

        // Simulate view success/failure (90% success rate in this demo)
        const isSuccessful = Math.random() > 0.1;

        if (isSuccessful) {
          // Simulate a successful view
          currentCount++;
          setViewCount(currentCount);
          setProgress((currentCount / totalViews) * 100);
          failedAttempts = 0; // Reset failed attempts counter on success
        } else {
          // Simulate a failed view
          failedAttempts++;

          // If too many consecutive failures, show error and stop
          if (failedAttempts >= maxFailedAttempts) {
            clearInterval(viewIntervalId);
            setIsLoading(false);
            setIsRunning(false);
            setError(t.tooManyFailures || 'Too many failed attempts. Please check your proxies and try again.');
            return;
          }
        }

      }, viewsInterval * 1000);

      // Store the interval ID in a ref so we can clear it when stopping
      return () => {
        if (viewIntervalId) {
          clearInterval(viewIntervalId);
        }
      };

    } catch (err) {
      console.error('Video viewing error:', err);
      setError(`${t.errorPrefix || 'Error:'} ${err.message}`);
      setIsLoading(false);
      setIsRunning(false);
    }
  };

  const stopViewing = () => {
    setIsRunning(false);
    setIsLoading(false);
    setSuccess(t.viewingStopped.replace('{count}', viewCount) ||
      `Viewing stopped. Generated ${viewCount} views.`);
  };

  const saveProxyList = () => {
    if (!proxies.trim()) {
      setError(t.proxyRequired || 'Please enter at least one proxy');
      return;
    }

    if (!proxyListName.trim()) {
      setError(t.proxyListNameRequired || 'Please enter a name for this proxy list');
      return;
    }

    try {
      // Check if name already exists
      const existingIndex = savedProxyLists.findIndex(list => list.name === proxyListName);

      let newSavedLists;
      if (existingIndex >= 0) {
        // Update existing list
        newSavedLists = [...savedProxyLists];
        newSavedLists[existingIndex] = {
          name: proxyListName,
          proxies: proxies,
          type: proxyType,
          date: new Date().toISOString()
        };
      } else {
        // Add new list
        newSavedLists = [
          ...savedProxyLists,
          {
            name: proxyListName,
            proxies: proxies,
            type: proxyType,
            date: new Date().toISOString()
          }
        ];
      }

      // Save to state and localStorage
      setSavedProxyLists(newSavedLists);
      localStorage.setItem('saved_proxy_lists', JSON.stringify(newSavedLists));

      setSuccess(t.proxyListSaved || 'Proxy list saved successfully');
      setProxyListName('');
    } catch (err) {
      console.error('Error saving proxy list:', err);
      setError(`${t.errorPrefix || 'Error:'} ${err.message}`);
    }
  };

  const loadProxyList = (index) => {
    try {
      const list = savedProxyLists[index];
      if (list) {
        setProxies(list.proxies);
        setProxyType(list.type || 'http');
        setSuccess(t.proxyListLoaded || 'Proxy list loaded successfully');
        setShowSavedLists(false);
      }
    } catch (err) {
      console.error('Error loading proxy list:', err);
      setError(`${t.errorPrefix || 'Error:'} ${err.message}`);
    }
  };

  const deleteProxyList = (index) => {
    try {
      const newSavedLists = [...savedProxyLists];
      newSavedLists.splice(index, 1);

      // Save to state and localStorage
      setSavedProxyLists(newSavedLists);
      localStorage.setItem('saved_proxy_lists', JSON.stringify(newSavedLists));

      setSuccess(t.proxyListDeleted || 'Proxy list deleted successfully');
    } catch (err) {
      console.error('Error deleting proxy list:', err);
      setError(`${t.errorPrefix || 'Error:'} ${err.message}`);
    }
  };

  const testSingleProxy = () => {
    // Reset previous results
    setQuickTestResult(null);
    setError('');

    // Validate proxy format
    if (!quickTestProxy.trim()) {
      setError(t.proxyRequired || 'Please enter a proxy to test');
      return;
    }

    // Parse proxy
    const parts = quickTestProxy.trim().split(':');
    if (parts.length < 2) {
      setError(t.proxyInvalidFormat || 'Invalid proxy format. Use ip:port or ip:port:username:password');
      return;
    }

    // Start testing
    setIsLoading(true);

    // In a real implementation, this would make an actual request through the proxy
    // This is a simplified demo that simulates testing
    setTimeout(() => {
      const isWorking = Math.random() > 0.3; // 70% chance of working

      setQuickTestResult({
        ip: parts[0],
        port: parts[1],
        username: parts.length >= 4 ? parts[2] : undefined,
        password: parts.length >= 4 ? parts[3] : undefined,
        status: isWorking ? 'alive' : 'dead',
        responseTime: isWorking ? Math.floor(Math.random() * 1000) + 100 : null,
        type: proxyType,
        testedAt: new Date().toISOString()
      });

      setIsLoading(false);

      if (isWorking) {
        setSuccess(t.proxyTestSuccess || 'Proxy is working!');
      } else {
        setError(t.proxyTestFailed || 'Proxy is not working.');
      }
    }, 1500);
  };

  return (
    <div className="proxy-video-viewer">
      <h2>{t.proxyVideoViewerTitle || 'Video Viewer with Proxies'}</h2>
      <p className="proxy-description">
        {t.proxyVideoViewerDescription || 'View videos through proxies to generate views. Each proxy IP counts as one view.'}
      </p>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="video-form">
        <div className="form-group">
          <label htmlFor="videoUrl">{t.videoUrlLabel || 'Video URL:'}</label>
          <input
            type="url"
            id="videoUrl"
            name="videoUrl"
            value={videoUrl}
            onChange={handleInputChange}
            placeholder={t.videoUrlPlaceholder || 'Enter Facebook, TikTok, or YouTube video URL'}
            required
            disabled={isRunning}
          />
        </div>

        <div className="form-group">
          <div className="form-header">
            <label htmlFor="proxies">{t.proxyInputLabel || 'Enter Proxies (one per line):'}</label>
            <div className="form-actions">
              <button
                type="button"
                className="action-button"
                onClick={() => setShowSavedLists(!showSavedLists)}
                disabled={isRunning}
              >
                {showSavedLists
                  ? (t.hideSavedLists || 'Hide Saved Lists')
                  : (t.showSavedLists || 'Show Saved Lists')}
              </button>
            </div>
          </div>
          <textarea
            id="proxies"
            name="proxies"
            value={proxies}
            onChange={handleInputChange}
            placeholder={t.proxyInputPlaceholder || 'Format: ip:port or ip:port:username:password\nExample: 192.168.1.1:8080\n10.0.0.1:3128:user:pass'}
            rows="6"
            required
            disabled={isRunning}
          ></textarea>

          {showSavedLists && (
            <div className="saved-lists">
              <h4>{t.savedProxyLists || 'Saved Proxy Lists'}</h4>
              {savedProxyLists.length === 0 ? (
                <p className="no-lists">{t.noSavedLists || 'No saved proxy lists'}</p>
              ) : (
                <ul className="lists">
                  {savedProxyLists.map((list, index) => (
                    <li key={index} className="list-item">
                      <div className="list-info">
                        <span className="list-name">{list.name}</span>
                        <span className="list-count">
                          {list.proxies.split(/\\r?\\n/).filter(line => line.trim()).length} {t.proxies || 'proxies'}
                        </span>
                      </div>
                      <div className="list-actions">
                        <button
                          type="button"
                          className="load-button"
                          onClick={() => loadProxyList(index)}
                          disabled={isRunning}
                        >
                          {t.loadList || 'Load'}
                        </button>
                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => deleteProxyList(index)}
                          disabled={isRunning}
                        >
                          {t.deleteList || 'Delete'}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="save-form">
                <input
                  type="text"
                  placeholder={t.proxyListNamePlaceholder || 'Enter a name for this list'}
                  value={proxyListName}
                  onChange={(e) => setProxyListName(e.target.value)}
                  disabled={isRunning || !proxies.trim()}
                />
                <button
                  type="button"
                  className="save-button"
                  onClick={saveProxyList}
                  disabled={isRunning || !proxies.trim() || !proxyListName.trim()}
                >
                  {t.saveList || 'Save List'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="form-row">
          <div className="form-group half-width">
            <label htmlFor="proxy-type">{t.proxyTypeLabel || 'Proxy Type:'}</label>
            <select
              id="proxy-type"
              name="proxyType"
              value={proxyType}
              onChange={handleInputChange}
              disabled={isRunning}
            >
              <option value="http">HTTP</option>
              <option value="https">HTTPS</option>
              <option value="socks4">SOCKS4</option>
              <option value="socks5">SOCKS5</option>
            </select>
          </div>
          <div className="form-group half-width">
            <label htmlFor="platform">{t.platformLabel || 'Platform:'}</label>
            <select
              id="platform"
              name="platform"
              value={platform}
              onChange={handleInputChange}
              disabled={isRunning}
            >
              <option value="auto">{t.platformAuto || 'Auto-detect'}</option>
              <option value="facebook">Facebook</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
            </select>
          </div>
        </div>

        <div className="quick-test-container">
          <h4>{t.quickProxyTest || 'Quick Proxy Test'}</h4>
          <div className="quick-test-form">
            <input
              type="text"
              placeholder={t.quickTestPlaceholder || 'Enter a single proxy to test (ip:port)'}
              value={quickTestProxy}
              onChange={(e) => setQuickTestProxy(e.target.value)}
              disabled={isRunning || isLoading}
            />
            <button
              type="button"
              className="test-button"
              onClick={testSingleProxy}
              disabled={isRunning || isLoading || !quickTestProxy.trim()}
            >
              {isLoading ? (t.testing || 'Testing...') : (t.testProxy || 'Test')}
            </button>
          </div>

          {quickTestResult && (
            <div className={`quick-test-result status-${quickTestResult.status}`}>
              <div className="result-header">
                <span className="proxy-address">{quickTestResult.ip}:{quickTestResult.port}</span>
                <span className={`status-badge status-${quickTestResult.status}`}>
                  {quickTestResult.status === 'alive'
                    ? (t.proxyStatusAlive || 'Working')
                    : (t.proxyStatusDead || 'Dead')}
                </span>
              </div>
              {quickTestResult.status === 'alive' && (
                <div className="result-details">
                  <div className="detail-item">
                    <span className="detail-label">{t.proxyResponseTime || 'Response Time'}:</span>
                    <span className="detail-value">{quickTestResult.responseTime}ms</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">{t.proxyType || 'Type'}:</span>
                    <span className="detail-value">{quickTestResult.type.toUpperCase()}</span>
                  </div>
                  <button
                    type="button"
                    className="use-proxy-button"
                    onClick={() => {
                      // Add this proxy to the textarea
                      const newProxy = quickTestResult.username && quickTestResult.password
                        ? `${quickTestResult.ip}:${quickTestResult.port}:${quickTestResult.username}:${quickTestResult.password}`
                        : `${quickTestResult.ip}:${quickTestResult.port}`;

                      if (proxies.trim()) {
                        setProxies(proxies + '\n' + newProxy);
                      } else {
                        setProxies(newProxy);
                      }

                      setSuccess(t.proxyAdded || 'Proxy added to the list');
                    }}
                    disabled={isRunning}
                  >
                    {t.useThisProxy || 'Use This Proxy'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="advanced-options-toggle">
          <button
            type="button"
            className="toggle-button"
            onClick={() => setAdvancedOptions(!advancedOptions)}
            disabled={isRunning}
          >
            {advancedOptions ? (t.hideAdvancedOptions || 'Hide Advanced Options') : (t.showAdvancedOptions || 'Show Advanced Options')}
          </button>
        </div>

        {advancedOptions && (
          <div className="advanced-options">
            <div className="form-row">
              <div className="form-group half-width">
                <label htmlFor="viewsTarget">{t.viewsTargetLabel || 'Target Views:'}</label>
                <input
                  type="number"
                  id="viewsTarget"
                  name="viewsTarget"
                  value={viewsTarget}
                  onChange={handleInputChange}
                  min="1"
                  max="1000"
                  disabled={isRunning}
                />
              </div>
              <div className="form-group half-width">
                <label htmlFor="viewsInterval">{t.viewsIntervalLabel || 'Interval (seconds):'}</label>
                <input
                  type="number"
                  id="viewsInterval"
                  name="viewsInterval"
                  value={viewsInterval}
                  onChange={handleInputChange}
                  min="1"
                  max="60"
                  disabled={isRunning}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="timeout">{t.proxyTimeoutLabel || 'Timeout (seconds):'}</label>
              <input
                type="number"
                id="timeout"
                name="timeout"
                value={timeout}
                onChange={handleInputChange}
                min="1"
                max="120"
                disabled={isRunning}
              />
            </div>
          </div>
        )}

        <div className="form-buttons">
          {!isRunning ? (
            <button
              type="button"
              className="check-button"
              onClick={startViewing}
              disabled={isLoading || !videoUrl.trim() || !proxies.trim()}
            >
              {t.startViewingButton || 'Start Viewing'}
            </button>
          ) : (
            <button
              type="button"
              className="stop-button"
              onClick={stopViewing}
            >
              {t.stopViewingButton || 'Stop Viewing'}
            </button>
          )}
        </div>

        {isRunning && (
          <div className="viewing-progress">
            <div className="progress-header">
              <span>{t.viewingInProgress || 'Viewing in progress...'}</span>
              <span>{viewCount} / {viewsTarget} {t.views || 'views'}</span>
            </div>
            <div className="progress-bar-container">
              <div
                className="progress-bar"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="current-proxy">
              <span>{t.currentProxy || 'Current Proxy:'}</span>
              <span>{currentProxy}</span>
            </div>
          </div>
        )}
      </div>

      <div className="help-section">
        <h3>{t.howItWorksTitle || 'How It Works'}</h3>
        <p>{t.howItWorksDescription || 'This tool uses proxies to view videos on social media platforms. Each proxy IP counts as one unique view, helping to increase view counts on your videos.'}</p>

        <h4>{t.supportedPlatformsTitle || 'Supported Platforms'}</h4>
        <ul>
          <li><strong>Facebook</strong> - {t.facebookSupport || 'Works with Facebook video posts and Watch videos'}</li>
          <li><strong>TikTok</strong> - {t.tiktokSupport || 'Works with TikTok video links'}</li>
          <li><strong>YouTube</strong> - {t.youtubeSupport || 'Works with YouTube videos and shorts'}</li>
        </ul>

        <h4>{t.bestPracticesTitle || 'Best Practices'}</h4>
        <ul>
          <li>{t.bestPractice1 || 'Use high-quality proxies for better success rates'}</li>
          <li>{t.bestPractice2 || 'Set reasonable intervals between views (5-10 seconds recommended)'}</li>
          <li>{t.bestPractice3 || 'Use a mix of different proxy types for better results'}</li>
          <li>{t.bestPractice4 || 'Distribute view generation over time for more natural growth'}</li>
        </ul>
      </div>
    </div>
  );
}

export default ProxyVideoViewer;
