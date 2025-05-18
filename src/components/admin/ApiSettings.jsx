import { useState } from 'react';

function ApiSettings({ 
  apiKey, 
  apiEndpoint, 
  onApiSettingsChange, 
  onFetchUsers, 
  isLoading, 
  translations 
}) {
  const [showPassword, setShowPassword] = useState(false);
  const t = translations;

  return (
    <div className="api-settings">
      <h3>{t.adminApiSettings || 'API Settings'}</h3>
      <div className="form-group">
        <label htmlFor="api-endpoint">{t.adminApiEndpoint || 'API Endpoint:'}</label>
        <input
          type="text"
          id="api-endpoint"
          name="apiEndpoint"
          value={apiEndpoint}
          onChange={onApiSettingsChange}
          placeholder={t.adminApiEndpointPlaceholder || 'https://api.example.com/v1'}
        />
      </div>
      <div className="form-group">
        <label htmlFor="api-key">{t.adminApiKey || 'API Key:'}</label>
        <div className="password-input-container">
          <input
            type={showPassword ? 'text' : 'password'}
            id="api-key"
            name="apiKey"
            value={apiKey}
            onChange={onApiSettingsChange}
            placeholder={t.adminApiKeyPlaceholder || 'Enter your API key'}
          />
          <button 
            type="button" 
            className="toggle-password-button"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (t.adminHidePassword || 'Hide') : (t.adminShowPassword || 'Show')}
          </button>
        </div>
      </div>
      <button 
        className="fetch-button" 
        onClick={onFetchUsers}
        disabled={isLoading || !apiKey || !apiEndpoint}
      >
        {isLoading ? (t.adminLoading || 'Loading...') : (t.adminFetchUsers || 'Fetch Users')}
      </button>
    </div>
  );
}

export default ApiSettings;
