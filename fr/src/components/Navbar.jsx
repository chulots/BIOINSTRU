// src/components/Navbar.jsx
import React from 'react';
import logo from '../assets/logo.png';
import { Link } from 'react-router-dom';
import './Navbar.css';

const NavBar = () => {
  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
        <div style={{ textAlign: 'center', margin: '2rem' }}>
                <img src={logo} alt="Logo" style={{ width: 120, marginBottom: 20 }} />
              </div>
      <div className="container mx-auto flex justify-between items-center">

        <Link to="/datos/oxigeno" className="text-xl font-bold">
          Dylan pene
        </Link>
        
        <div className="flex space-x-4">
          <Link to="/" className="hover:underline">
            Inicio
          </Link>

          <Link to="/datoshistoricos" className="hover:underline">
            Nosotros
          </Link>

          <Link to="/Pulsasiones" className="hover:underline">
            Prueba
          </Link>

        </div>
      </div>
    </nav>
  );
};

export default NavBar;