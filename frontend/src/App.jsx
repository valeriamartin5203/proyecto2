import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiCamera, FiList, FiLogIn, FiUserPlus } from 'react-icons/fi';
import Login from './components/login';
import Registro from './components/registro';
import ReporteForm from './components/reporteform';
import ReportesList from './components/ReportesList';
import Navbar from './components/Navbar';
import './App.css';

// URL de la API según el entorno - ¡VERIFICA QUE ESTO ESTÉ CORRECTO!
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Configuración global de axios
axios.defaults.withCredentials = true;

function App() {
  const [usuario, setUsuario] = useState(null);
  const [reportes, setReportes] = useState([]);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [serverStatus, setServerStatus] = useState('offline');
  const [activeTab, setActiveTab] = useState('login');
  const [cargandoReportes, setCargandoReportes] = useState(false);

  // Verificar conexión con el backend al iniciar
  useEffect(() => {
    verificarConexionBackend();
    const savedUser = localStorage.getItem('usuario');
    if (savedUser) {
      setUsuario(savedUser);
    }
  }, []);

  useEffect(() => {
    if (usuario) {
      cargarReportes();
    }
  }, [usuario]);

  const verificarConexionBackend = async () => {
    try {
      // Intentar conectar con el backend
      const response = await axios.get(`${API_URL}/api/test`);
      console.log('✅ Backend conectado:', response.data);
      setServerStatus('online');
      
      // También verificar el endpoint principal
      const mainResponse = await axios.get(`${API_URL}/`);
      console.log('✅ Backend principal:', mainResponse.data);
      
    } catch (error) {
      console.error('❌ Error conectando al backend:', error.message);
      setServerStatus('offline');
      
      // Mostrar alerta con información de debug
      mostrarAlerta(`Error de conexión: ${API_URL} no responde. Verifica la variable VITE_API_URL`, 'error');
    }
  };

  const cargarReportes = async () => {
    setCargandoReportes(true);
    try {
      const response = await axios.get(`${API_URL}/reportes`);
      setReportes(response.data || []);
    } catch (error) {
      console.error('Error cargando reportes:', error);
      mostrarAlerta('Error al cargar los reportes', 'error');
    } finally {
      setCargandoReportes(false);
    }
  };

  const mostrarAlerta = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000);
  };

  const handleLogin = (user) => {
    setUsuario(user);
    localStorage.setItem('usuario', user);
    mostrarAlerta(`✅ Bienvenido ${user}`, 'success');
  };

  const handleLogout = () => {
    setUsuario(null);
    localStorage.removeItem('usuario');
    setReportes([]);
    mostrarAlerta('👋 Sesión cerrada', 'info');
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
        {serverStatus === 'offline' && (
          <div style={{ 
            marginTop: '10px', 
            padding: '10px', 
            background: '#ff6b6b', 
            color: 'white',
            borderRadius: '8px'
          }}>
            ⚠️ El backend no está conectado. Verifica que la variable VITE_API_URL sea:
            <br />
            <code style={{ background: '#333', padding: '5px', borderRadius: '4px', display: 'inline-block', marginTop: '5px' }}>
              {API_URL}
            </code>
          </div>
        )}
      </div>

      <div className="grid">
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
                onReporteCreado={cargarReportes}
                mostrarAlerta={mostrarAlerta}
              />
            </>
          )}
        </div>

        <div className="card">
          <h2><FiList /> Reportes Recientes</h2>
          
          {!usuario ? (
            <div className="empty-state">
              <FiList style={{ fontSize: '3em', color: '#cbd5e0' }} />
              <p>🔒 Inicia sesión para ver los reportes</p>
            </div>
          ) : cargandoReportes ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div className="loading"></div>
              <p>Cargando reportes...</p>
            </div>
          ) : (
            <ReportesList reportes={reportes} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;