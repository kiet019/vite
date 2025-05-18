import { useState } from 'react';

function UserForm({ 
  user, 
  onSubmit, 
  onCancel, 
  isLoading, 
  translations, 
  isEditing = false 
}) {
  const [formData, setFormData] = useState(user || {
    username: '',
    password: '',
    email: '',
    role: 'user',
    active: true
  });
  const [showPassword, setShowPassword] = useState(false);
  
  const t = translations;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="user-form-section">
      <h3>{isEditing ? (t.adminEditUser || 'Edit User') : (t.adminCreateUser || 'Create User')}</h3>
      <form onSubmit={handleSubmit} className="user-form">
        <div className="form-group">
          <label htmlFor="username">{t.adminUsername || 'Username:'}</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder={t.adminUsernamePlaceholder || 'Enter username'}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">{t.adminPassword || 'Password:'}</label>
          <div className="password-input-container">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder={isEditing ? (t.adminPasswordPlaceholderEdit || 'Leave blank to keep current') : (t.adminPasswordPlaceholder || 'Enter password')}
              required={!isEditing}
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
        <div className="form-group">
          <label htmlFor="email">{t.adminEmail || 'Email:'}</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder={t.adminEmailPlaceholder || 'Enter email'}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="role">{t.adminRole || 'Role:'}</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
          >
            <option value="user">{t.adminRoleUser || 'User'}</option>
            <option value="admin">{t.adminRoleAdmin || 'Admin'}</option>
          </select>
        </div>
        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={handleInputChange}
            />
            {t.adminActive || 'Active'}
          </label>
        </div>
        <div className="form-buttons">
          <button 
            type="submit" 
            className="save-button"
            disabled={isLoading}
          >
            {isLoading 
              ? (t.adminSaving || 'Saving...') 
              : (isEditing 
                  ? (t.adminUpdateUser || 'Update User') 
                  : (t.adminCreateUserButton || 'Create User'))}
          </button>
          {isEditing && (
            <button 
              type="button" 
              className="cancel-button"
              onClick={onCancel}
            >
              {t.adminCancel || 'Cancel'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default UserForm;
