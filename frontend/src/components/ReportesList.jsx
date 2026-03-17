import React from 'react';
import { FiList } from 'react-icons/fi';

function ReportesList({ reportes }) {
  console.log('ReportesList recibió:', reportes);

  const getBadgeClass = (urgencia) => {
    switch(urgencia?.toLowerCase()) {
      case 'alta': return 'badge-urgencia-alta';
      case 'media': return 'badge-urgencia-media';
      case 'baja': return 'badge-urgencia-baja';
      default: return '';
    }
  };

  if (!reportes || reportes.length === 0) {
    return (
      <div className="empty-state">
        <FiList style={{ fontSize: '3em', color: '#cbd5e0', marginBottom: '15px' }} />
        <p>No hay reportes aún</p>
        <small>Crea tu primer reporte usando el formulario</small>
      </div>
    );
  }

  return (
    <div className="reportes-list">
      {reportes.map((reporte) => (
        <div key={reporte.id} className="reporte-item">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ margin: 0 }}>
              <span style={{ 
                background: '#667eea', 
                color: 'white', 
                padding: '2px 8px', 
                borderRadius: '12px', 
                fontSize: '0.8em', 
                marginRight: '10px' 
              }}>
                #{reporte.id}
              </span>
              {reporte.modulo}
            </h4>
          </div>
          
          <p><strong>📍 Ubicación:</strong> {reporte.modulo}</p>
          <p><strong>📝 Problema:</strong> {reporte.problema}</p>
          
          <div style={{ marginTop: '10px', marginBottom: '10px' }}>
            <span className="badge badge-categoria">
              🏷️ {reporte.categoria}
            </span>
            <span className={`badge ${getBadgeClass(reporte.urgencia)}`}>
              ⚠️ {reporte.urgencia}
            </span>
          </div>
          
          <div style={{ 
            marginTop: '10px', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.85em',
            color: '#999',
            borderTop: '1px dashed #e0e0e0',
            paddingTop: '10px'
          }}>
            <span>👤 {reporte.usuario}</span>
            <span>📅 {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      ))}
      
      <div style={{ 
        textAlign: 'center', 
        marginTop: '15px',
        padding: '10px',
        background: '#f8f9fa',
        borderRadius: '8px',
        color: '#666',
        fontSize: '0.9em'
      }}>
        Total: {reportes.length} reporte{reportes.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

export default ReportesList;