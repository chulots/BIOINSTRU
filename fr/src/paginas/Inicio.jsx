import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Inicio.css';

const Inicio = () => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true); // <- estado de carga
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    const fetchUsuario = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/usuario', {
          headers: { Authorization: 'Bearer ' + token }
        });

        if (!res.ok) throw new Error('No autorizado');

        const data = await res.json();
        setUsuario(data);
      } catch (err) {
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setLoading(false); // <- terminar la carga
      }
    };

    fetchUsuario();
  }, [navigate]);

  const mostrarDato = dato => (dato ? dato : '....');

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    // Mientras carga, mostrar algo
    return (
      <div className="inicio-centrado">
        <div className="inicio-container">
          <p>Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="inicio-centrado">
      <div className="inicio-container">
        <h2 className="inicio-titulo">
          Bienvenido, {mostrarDato(usuario?.nombre)}
        </h2>
        <p className="inicio-subtitulo">
          Aquí puedes consultar tus datos biométricos registrados en el sistema.
        </p>

        <div className="datos-usuario">
          <p><strong>Nombre:</strong> {mostrarDato(usuario?.nombre)}</p>
          <p><strong>Correo:</strong> {mostrarDato(usuario?.correo)}</p>
          <p><strong>Edad:</strong> {mostrarDato(usuario?.edad)}</p>
          <p><strong>Género:</strong> {mostrarDato(usuario?.genero)}</p>
        </div>

        <div className="botones-navegacion">
          <button className="boton" onClick={() => navigate('/night')}>Grafica</button>
          <button className="boton" onClick={() => navigate('/DatosOximetro')}>Datos Históricos</button>
          <button className="boton" onClick={() => navigate('/Pulsasiones')}>Datos</button>
          <button className="boton" onClick={cerrarSesion}>Cerrar Sesión</button>
        </div>
      </div>
    </div>
  );
};

export default Inicio;
