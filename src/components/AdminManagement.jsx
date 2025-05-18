import { useState, useEffect } from 'react';
import translations from '../utils/translations';
import ApiSettings from './admin/ApiSettings';
import UserForm from './admin/UserForm';
import UsersList from './admin/UsersList';
import HelpSection from './admin/HelpSection';

function AdminManagement({ language = 'en' }) {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    email: '',
    role: 'user',
    active: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [editingUser, setEditingUser] = useState(null);

  // Get translations based on current interface language
  const t = translations[language];

  // Load API key and endpoint from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('admin_api_key') || '';
    const savedApiEndpoint = localStorage.getItem('admin_api_endpoint') || '';
    setApiKey(savedApiKey);
    setApiEndpoint(savedApiEndpoint);

    // If we have API credentials, fetch users
    if (savedApiKey && savedApiEndpoint) {
      fetchUsers();
    }
  }, []);

  const fetchUsers = async () => {
    if (!apiKey || !apiEndpoint) {
      setError(t.adminApiCredentialsRequired || 'API credentials are required');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Simulate API call for demo purposes
      // In a real app, you would make an actual API call to your backend
      setTimeout(() => {
        // Mock data for demonstration
        const mockUsers = [
          { id: '1', username: 'admin', email: 'admin@example.com', role: 'admin', active: true },
          { id: '2', username: 'user1', email: 'user1@example.com', role: 'user', active: true },
          { id: '3', username: 'user2', email: 'user2@example.com', role: 'user', active: false }
        ];
        setUsers(mockUsers);
        setIsLoading(false);
      }, 1000);

      /* Real API call would look like this:
      const response = await fetch(`${apiEndpoint}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      setUsers(data);
      */
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(`${t.errorPrefix || 'Error:'} ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiSettingsChange = (e) => {
    const { name, value } = e.target;
    if (name === 'apiKey') {
      setApiKey(value);
      localStorage.setItem('admin_api_key', value);
    } else if (name === 'apiEndpoint') {
      setApiEndpoint(value);
      localStorage.setItem('admin_api_endpoint', value);
    }
  };

  const handleSubmit = async (formData) => {
    if (!apiKey || !apiEndpoint) {
      setError(t.adminApiCredentialsRequired || 'API credentials are required');
      return;
    }

    if (!formData.username || (!editingUser && !formData.password) || !formData.email) {
      setError(t.adminRequiredFields || 'Username, password, and email are required');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (editingUser) {
        // Update existing user
        // Simulate API call for demo purposes
        setTimeout(() => {
          setUsers(prev => prev.map(user => 
            user.id === editingUser.id ? { ...formData, id: user.id } : user
          ));
          setSuccess(t.adminUserUpdated || 'User updated successfully');
          setEditingUser(null);
          setNewUser({
            username: '',
            password: '',
            email: '',
            role: 'user',
            active: true
          });
          setIsLoading(false);
        }, 1000);
      } else {
        // Create new user
        // Simulate API call for demo purposes
        setTimeout(() => {
          const newId = (Math.max(...users.map(u => parseInt(u.id)), 0) + 1).toString();
          setUsers(prev => [...prev, { ...formData, id: newId }]);
          setSuccess(t.adminUserCreated || 'User created successfully');
          setNewUser({
            username: '',
            password: '',
            email: '',
            role: 'user',
            active: true
          });
          setIsLoading(false);
        }, 1000);
      }
    } catch (err) {
      console.error('Error saving user:', err);
      setError(`${t.errorPrefix || 'Error:'} ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setNewUser({
      ...user,
      password: '' // Don't include password when editing
    });
  };

  const handleDelete = async (userId) => {
    if (!confirm(t.adminConfirmDelete || 'Are you sure you want to delete this user?')) {
      return;
    }

    if (!apiKey || !apiEndpoint) {
      setError(t.adminApiCredentialsRequired || 'API credentials are required');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Simulate API call for demo purposes
      setTimeout(() => {
        setUsers(prev => prev.filter(user => user.id !== userId));
        setSuccess(t.adminUserDeleted || 'User deleted successfully');
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(`${t.errorPrefix || 'Error:'} ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingUser(null);
    setNewUser({
      username: '',
      password: '',
      email: '',
      role: 'user',
      active: true
    });
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    if (!apiKey || !apiEndpoint) {
      setError(t.adminApiCredentialsRequired || 'API credentials are required');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Simulate API call for demo purposes
      setTimeout(() => {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, active: !currentStatus } : user
        ));
        setSuccess(currentStatus 
          ? (t.adminUserDeactivated || 'User deactivated successfully') 
          : (t.adminUserActivated || 'User activated successfully'));
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Error updating user status:', err);
      setError(`${t.errorPrefix || 'Error:'} ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-management">
      <h2>{t.adminManagementTitle || 'Admin Management'}</h2>
      <p className="admin-description">
        {t.adminManagementDescription || 'Manage users and administrators with form-based creation and API integration.'}
      </p>

      <ApiSettings 
        apiKey={apiKey}
        apiEndpoint={apiEndpoint}
        onApiSettingsChange={handleApiSettingsChange}
        onFetchUsers={fetchUsers}
        isLoading={isLoading}
        translations={t}
      />

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="admin-sections">
        <UserForm 
          user={newUser}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
          translations={t}
          isEditing={!!editingUser}
        />

        <UsersList 
          users={users}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={toggleUserStatus}
          isLoading={isLoading}
          translations={t}
        />
      </div>

      <HelpSection translations={t} />
    </div>
  );
}

export default AdminManagement;
