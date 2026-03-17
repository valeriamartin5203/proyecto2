import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiCamera, FiList, FiLogIn, FiUserPlus } from 'react-icons/fi';
import Login from './components/login';
import Registro from './components/registro';
import ReporteForm from './components/reporteform';
import ReportesList from './components/ReportesList';
import Navbar from './components/Navbar';
import './App.css';

const API_URL = 'http://localhost:3000';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [reportes, setReportes] = useState([]);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [serverStatus, setServerStatus] = useState('offline');
  const [activeTab, setActiveTab] = useState('login');
  const [cargandoReportes, setCargandoReportes] = useState(false);

  // Verificar servidor al inicio
  useEffect(() => {
    verificarServidor();
    
    // Verificar si hay usuario en localStorage
    const savedUser = localStorage.getItem('usuario');
    if (savedUser) {
      console.log('Usuario encontrado en localStorage:', savedUser);
      setUsuario(savedUser);
    }
  }, []);

  // Cargar reportes cuando cambia el usuario
  useEffect(() => {
    if (usuario) {
      console.log('Usuario activo, cargando reportes...');
      cargarReportes();
    } else {
      setReportes([]);
    }
  }, [usuario]);

  const verificarServidor = async () => {
    try {
      const response = await axios.get(`${API_URL}/`);
      console.log('Servidor respuesta:', response.data);
      setServerStatus('online');
      mostrarAlerta('✅ Conectado al servidor', 'success');
    } catch (error) {
      console.error('Servidor no disponible:', error);
      setServerStatus('offline');
      mostrarAlerta('❌ Servidor no disponible', 'error');
    }
  };

  const cargarReportes = async () => {
    setCargandoReportes(true);
    try {
      const response = await axios.get(`${API_URL}/reportes`);
      console.log('Respuesta completa del servidor:', response);
      console.log('Datos de reportes:', response.data);
      
      // La API devuelve directamente un array
      if (Array.isArray(response.data)) {
        console.log(`${response.data.length} reportes cargados`);
        setReportes(response.data);
      } else if (response.data.reportes && Array.isArray(response.data.reportes)) {
        // Por si acaso viene con la propiedad reportes
        console.log(`${response.data.reportes.length} reportes cargados (formato con propiedad)`);
        setReportes(response.data.reportes);
      } else {
        console.log('Formato de respuesta no esperado:', response.data);
        setReportes([]);
      }
    } catch (error) {
      console.error('Error cargando reportes:', error);
      mostrarAlerta('Error al cargar reportes', 'error');
      setReportes([]);
    } finally {
      setCargandoReportes(false);
    }
  };

  const mostrarAlerta = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000);
  };

  const handleLogin = (user) => {
    console.log('Login exitoso:', user);
    setUsuario(user);
    localStorage.setItem('usuario', user);
    mostrarAlerta(`✅ Bienvenido ${user}`, 'success');
  };

  const handleLogout = () => {
    console.log('Cerrando sesión');
    setUsuario(null);
    localStorage.removeItem('usuario');
    setReportes([]);
    mostrarAlerta('👋 Sesión cerrada', 'info');
  };

  const handleReporteCreado = () => {
    console.log('Reporte creado, recargando lista...');
    cargarReportes();
    mostrarAlerta('✅ Reporte creado correctamente', 'success');
  };

  // Forzar recarga manual de reportes (útil para debugging)
  const recargarReportes = () => {
    if (usuario) {
      cargarReportes();
    }
  };

  return (
    <div className="container">
      <Navbar 
        usuario={usuario} 
        onLogout={handleLogout}
        serverStatus={serverStatus}
      />

      {alert.show && (
        <div className={`alert ${alert.type}`}>
          {alert.message}
        </div>
      )}

      <div className="header">
        <h1>📸 Sistema de Reportes con IA</h1>
        <p>Sube una imagen y la IA analizará el problema automáticamente</p>
        {usuario && (
          <div style={{ 
            marginTop: '15px', 
            padding: '10px 20px',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '50px',
            display: 'inline-block'
          }}>
            <span style={{ marginRight: '10px' }}>👤</span>
            <strong>{usuario}</strong>
          </div>
        )}
      </div>

      {/* Grid principal */}
      <div className="grid">
        {/* Card izquierda: Login/Registro o Formulario */}
        <div className="card">
          {!usuario ? (
            <>
              <h2><FiLogIn /> Acceso al Sistema</h2>
              
              <div className="tabs">
                <div 
                  className={`tab ${activeTab === 'login' ? 'active' : ''}`}
                  onClick={() => setActiveTab('login')}
                >
                  Login
                </div>
                <div 
                  className={`tab ${activeTab === 'registro' ? 'active' : ''}`}
                  onClick={() => setActiveTab('registro')}
                >
                  Registro
                </div>
              </div>

              {activeTab === 'login' ? (
                <Login 
                  API_URL={API_URL} 
                  onLogin={handleLogin}
                  mostrarAlerta={mostrarAlerta}
                />
              ) : (
                <Registro 
                  API_URL={API_URL}
                  mostrarAlerta={mostrarAlerta}
                  onRegistroExitoso={() => setActiveTab('login')}
                />
              )}
            </>
          ) : (
            <>
              <h2><FiCamera /> Nuevo Reporte</h2>
              <ReporteForm 
                API_URL={API_URL}
                usuario={usuario}
                onReporteCreado={handleReporteCreado}
                mostrarAlerta={mostrarAlerta}
              />
              
              {/* Botón de recarga manual (útil para debugging) */}
              <button 
                onClick={recargarReportes}
                style={{ 
                  marginTop: '15px', 
                  background: '#4a5568',
                  fontSize: '14px',
                  padding: '8px'
                }}
              >
                🔄 Recargar Reportes
              </button>
            </>
          )}
        </div>

        {/* Card derecha: Reportes */}
        <div className="card">
          <h2><FiList /> Reportes Recientes</h2>
          
          {!usuario ? (
            <div className="empty-state">
              <FiList style={{ fontSize: '3em', color: '#cbd5e0', marginBottom: '15px' }} />
              <p>🔒 Inicia sesión para ver los reportes</p>
              <small>Podrás ver todos los reportes creados</small>
            </div>
          ) : cargandoReportes ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div className="loading" style={{ margin: '0 auto 20px' }}></div>
              <p>Cargando reportes...</p>
            </div>
          ) : (
            <>
              <ReportesList reportes={reportes} />
              
              {/* Debug info */}
              <div style={{ 
                marginTop: '15px', 
                padding: '10px',
                background: '#f0f4ff',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#4a5568'
              }}>
                <strong>Debug:</strong> {reportes.length} reportes cargados
                {reportes.length > 0 && (
                  <span> | Último ID: {reportes[0]?.id}</span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;