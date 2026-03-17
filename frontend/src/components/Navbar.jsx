import React from 'react';
import { FiUser, FiPower, FiServer } from 'react-icons/fi';

function Navbar({ usuario, onLogout, serverStatus }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        📸 Reportes IA
        <span className={`server-status status-${serverStatus}`}>
          {serverStatus === 'online' ? '🟢 Online' : '🔴 Offline'}
        </span>
      </div>
      
      <div className="navbar-user">
        {usuario && (
          <>
            <FiUser /> {usuario}
            <button onClick={onLogout} className="logout-btn">
              <FiPower /> Salir
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;