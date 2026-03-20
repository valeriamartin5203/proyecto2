import React, { useState } from 'react';
import api from '../services/api';

function Registro({ mostrarAlerta, onRegistroExitoso }) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!usuario || !password) {
      mostrarAlerta('Completa todos los campos', 'error');
      return;
    }

    if (password.length < 6) {
      mostrarAlerta('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/registro', { usuario, password });

      if (response.data.success) {
        mostrarAlerta('✅ Usuario registrado', 'success');
        setUsuario('');
        setPassword('');
        onRegistroExitoso();
      } else {
        mostrarAlerta(response.data.mensaje, 'error');
      }
    } catch (error) {
      mostrarAlerta(error.message || 'Error al registrar', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Usuario:</label>
        <input
          type="text"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          disabled={loading}
        />
      </div>
      
      <div className="form-group">
        <label>Contraseña:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Registrando...' : 'Registrarse'}
      </button>
    </form>
  );
}

export default Registro;