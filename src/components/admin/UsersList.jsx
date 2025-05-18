function UsersList({ 
  users, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  isLoading, 
  translations 
}) {
  const t = translations;

  return (
    <div className="users-list-section">
      <h3>{t.adminUsersList || 'Users List'}</h3>
      {isLoading && <div className="loading-spinner"></div>}
      {users.length === 0 ? (
        <p className="no-users">{t.adminNoUsers || 'No users found'}</p>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>{t.adminUsername || 'Username'}</th>
                <th>{t.adminEmail || 'Email'}</th>
                <th>{t.adminRole || 'Role'}</th>
                <th>{t.adminStatus || 'Status'}</th>
                <th>{t.adminActions || 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className={user.active ? '' : 'inactive-user'}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <span className={`status-badge ${user.active ? 'active' : 'inactive'}`}>
                      {user.active 
                        ? (t.adminStatusActive || 'Active') 
                        : (t.adminStatusInactive || 'Inactive')}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button 
                      className="edit-button" 
                      onClick={() => onEdit(user)}
                      title={t.adminEditUser || 'Edit User'}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                      </svg>
                    </button>
                    <button 
                      className="toggle-status-button" 
                      onClick={() => onToggleStatus(user.id, user.active)}
                      title={user.active 
                        ? (t.adminDeactivateUser || 'Deactivate User') 
                        : (t.adminActivateUser || 'Activate User')}
                    >
                      {user.active ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z"/>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z"/>
                        </svg>
                      )}
                    </button>
                    <button 
                      className="delete-button" 
                      onClick={() => onDelete(user.id)}
                      title={t.adminDeleteUser || 'Delete User'}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default UsersList;
