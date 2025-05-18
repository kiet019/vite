import React from 'react';

function StatusIndicator({ message }) {
  return (
    <div className="status-indicator-container">
      <div className="status-indicator">
        <span className="status-indicator-icon"></span>
        {message}
      </div>
    </div>
  );
}

export default StatusIndicator;
