import React from 'react';
import { Nav } from 'react-bootstrap';
import { 
  House, 
  Camera, 
  List, 
  BoxArrowRight,
  Person
} from 'react-bootstrap-icons';

function MenuLateral({ activeSection, onSelectSection, usuario, onLogout }) {
  const menuItems = [
    { id: 'inicio', icon: <House className="me-2" />, label: 'Inicio' },
    { id: 'crear', icon: <Camera className="me-2" />, label: 'Hacer Reporte' },
    { id: 'ver', icon: <List className="me-2" />, label: 'Ver Reportes' },
  ];

  return (
    <nav className="col-md-3 col-lg-2 p-3 vh-100" style={{ 
      backgroundColor: '#f8f9fa', 
      borderRight: '1px solid #e0e0e0',
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflowY: 'auto'
    }}>
      {/* Perfil del usuario */}
      <div className="text-center mb-4 pb-2 border-bottom">
        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2" style={{ width: '60px', height: '60px', fontSize: '24px' }}>
          {usuario?.charAt(0).toUpperCase() || 'U'}
        </div>
        <h6 className="mb-0">{usuario}</h6>
        <small className="text-muted">Usuario activo</small>
      </div>

      {/* Menú de navegación */}
      <h6 className="text-muted mb-3">Navegación</h6>
      <Nav className="flex-column">
        {menuItems.map((item) => (
          <Nav.Link 
            key={item.id}
            onClick={() => onSelectSection(item.id)}
            className={`mb-2 ${activeSection === item.id ? 'active-menu' : 'text-dark'}`}
            style={{ 
              padding: '10px 15px', 
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: activeSection === item.id ? '#e7f3ff' : 'transparent',
              fontWeight: activeSection === item.id ? 'bold' : 'normal'
            }}
          >
            {item.icon} {item.label}
          </Nav.Link>
        ))}
      </Nav>

      <hr className="my-3" />

      {/* Cerrar sesión */}
      <Nav className="flex-column">
        <Nav.Link 
          onClick={onLogout}
          className="text-danger"
          style={{ padding: '10px 15px', borderRadius: '8px', cursor: 'pointer' }}
        >
          <BoxArrowRight className="me-2" /> Cerrar sesión
        </Nav.Link>
      </Nav>
    </nav>
  );
}

export default MenuLateral;