import React from 'react';

function Navbar({ usuario, onLogout, serverStatus }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        📸 Reportes IA
        <span className={`server-status status-${serverStatus}`}>
          {serverStatus === 'online' ? '🟢 Online' : '🔴 Offline'}
        </span>
      </div>
      {usuario && (
        <div className="navbar-user">
          👤 {usuario}
          <button onClick={onLogout} className="logout-btn">🚪 Salir</button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;