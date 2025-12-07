import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './OximetroTabla.css';

function getAlerta({ spo2 }) {
  if (spo2 < 80) return 'Hipoxemia severa (posible emergencia)';
  if (spo2 < 85) return 'Hipoxemia (posible Fibrosis Pulmonar, requiere evaluación)';
  if (spo2 < 90) return 'Hipoxemia (posible EPOC, requiere evaluación)';
  if (spo2 < 95) return 'Hipoxemia leve (posible AOS, monitorear)';
  if (spo2 > 100) return 'Valor alto (verificar dispositivo)';
  return null;
}

function getEstadoOxigeno(spo2) {
  if (spo2 < 90) return 'Bajo';
  if (spo2 >= 90 && spo2 <= 100) return 'Normal';
  return 'Alto';
}

const OximetroTabla = () => {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchDatos = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/mediciones', {
          headers: { Authorization: 'Bearer ' + token }
        });
        if (!res.ok) throw new Error('Error al obtener datos');
        const data = await res.json();
        setDatos(data);
      } catch (err) {
        console.error(err);
        // opcional: redirigir al login si hay error de autorización
        if (err.message.includes('401') || err.message.includes('403')) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDatos();
    const intervalId = setInterval(fetchDatos, 5000); // cada 5 segundos
    return () => clearInterval(intervalId);
  }, [navigate]);

  if (loading) return <p>Cargando mediciones...</p>;

  return (
    <div className="tabla-container">
      <button className="btn-volver" onClick={() => navigate('/app')}>Volver</button>
      <h2>Datos de Oximetría</h2>
      <table className="tabla">
        <thead>
          <tr>
            <th>Fecha/Hora</th>
            <th>Modo</th>
            <th>SpO₂ (%)</th>
            <th>LPM</th>
            <th>Alerta</th>
            <th>Alarma Estado Sonda</th>
            <th>Alarma SpO₂</th>
            <th>Alarma LPM</th>
          </tr>
        </thead>
        <tbody>
          {datos.map((item, index) => {
            const alerta = getAlerta(item);
            const estadoOxigeno = getEstadoOxigeno(item.spo2);
            return (
              <tr key={index} className={alerta ? 'alerta' : ''}>
                <td>{new Date(item.timestamp).toLocaleString()}</td>
                <td>{item.modo}</td>
                <td>{item.spo2}</td>
                <td>{item.lpm}</td>
                <td>{alerta}</td>
                <td>{item.alarma_estado_sonda}</td>
                <td>{item.alarma_spo2}</td>
                <td>{item.alarma_lpm}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default OximetroTabla;
