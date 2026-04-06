import React from 'react';
import { House, Camera, List, BoxArrowRight, Person } from 'react-bootstrap-icons';

function MenuLateral({ activeSection, onSelectSection, usuario, onLogout }) {
  const menuItems = [
    { id: 'inicio', icon: <House size={20} />, label: 'Inicio' },
    { id: 'crear', icon: <Camera size={20} />, label: 'Hacer Reporte' },
    { id: 'ver', icon: <List size={20} />, label: 'Ver Reportes' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-profile">
        <div className="sidebar-avatar">
          {usuario?.charAt(0).toUpperCase() || 'U'}
        </div>
        <p className="sidebar-username">{usuario}</p>
        <small className="sidebar-user-role">Usuario activo</small>
      </div>

      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li key={item.id}>
            <button 
              onClick={() => onSelectSection(item.id)}
              className={activeSection === item.id ? 'active' : ''}
            >
              {item.icon} {item.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="sidebar-divider"></div>

      <ul className="sidebar-menu">
        <li>
          <button onClick={onLogout} className="text-danger">
            <BoxArrowRight size={20} /> Cerrar sesión
          </button>
        </li>
      </ul>
    </div>
  );
}

export default MenuLateral;