function HelpSection({ translations }) {
  const t = translations;

  return (
    <div className="admin-help">
      <h3>{t.adminHelpTitle || 'Help & Documentation'}</h3>
      <div className="help-content">
        <p>{t.adminHelpText || 'This admin panel allows you to manage users through a form-based interface. The panel connects to your backend API for user management operations.'}</p>
        <h4>{t.adminApiIntegrationTitle || 'API Integration'}</h4>
        <p>{t.adminApiIntegrationText || 'To connect to your backend, enter your API endpoint and key in the settings section. The API should support standard CRUD operations for user management.'}</p>
        <h4>{t.adminSecurityTitle || 'Security Notes'}</h4>
        <p>{t.adminSecurityText || 'Ensure your API implements proper authentication and authorization. All API requests from this panel include your API key in the Authorization header.'}</p>
      </div>
    </div>
  );
}

export default HelpSection;
