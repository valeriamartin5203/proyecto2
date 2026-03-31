import React from 'react';

function ReportesList({ reportes }) {
  const getBadgeClass = (urgencia) => {
    switch(urgencia?.toLowerCase()) {
      case 'alta': return 'badge-urgencia-alta';
      case 'media': return 'badge-urgencia-media';
      case 'baja': return 'badge-urgencia-baja';
      default: return '';
    }
  };

  if (!reportes || reportes.length === 0) {
    return <div className="empty-state"><p>No hay reportes aún</p></div>;
  }

  return (
    <div className="reportes-list">
      {reportes.map((reporte) => (
        <div key={reporte.id} className="reporte-item">
          <h4>#{reporte.id} - {reporte.modulo}</h4>
          <p><strong>📝 Problema:</strong> {reporte.problema}</p>
          <div>
            <span className="badge badge-categoria">🏷️ {reporte.categoria}</span>
            <span className={`badge ${getBadgeClass(reporte.urgencia)}`}>⚠️ {reporte.urgencia}</span>
          </div>
          <small>👤 {reporte.usuario}</small>
        </div>
      ))}
    </div>
  );
}

export default ReportesList;