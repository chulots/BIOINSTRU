import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    const usuario = localStorage.getItem('usuario');
    return usuario ? children : <Navigate to="/mi_react/login" />;
};

export default PrivateRoute;
