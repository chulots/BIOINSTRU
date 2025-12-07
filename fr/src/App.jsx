import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './paginas/Login';
import Inicio from './paginas/Inicio';
import Night from './paginas/Night';
import DatosOximetro from './paginas/DatosOximetro';
import Pulsasiones from './paginas/Pulsasiones';

function App() {
  const isAuthenticated = !!localStorage.getItem('token'); // revisa si hay token

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/app" element={isAuthenticated ? <Inicio /> : <Navigate to="/login" />} />
      <Route path="/night" element={isAuthenticated ? <Night /> : <Navigate to="/login" />} />
      <Route path="/DatosOximetro" element={isAuthenticated ? <DatosOximetro /> : <Navigate to="/login" />} />
      <Route path="/Pulsasiones" element={isAuthenticated ? <Pulsasiones /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
