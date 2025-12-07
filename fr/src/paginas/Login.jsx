import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; 
import logo from '../assets/logo.png';


function Login() {
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const payload = { username: usuario, password };

            const res = await fetch('http://localhost:3001/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Credenciales incorrectas');
            }

            // Guardar token en localStorage
            localStorage.setItem('token', data.token);

            // Redirigir a /app
            navigate('/app');
        } catch (err) {
            setError(err.message);
        }
    };

return (
    <div
        className="login-container"
        style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#F6FBFC'
        }}
    >
        <form
            onSubmit={handleSubmit}
            className="login-form"
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: 32,
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 2px 16px rgba(0,0,0,0.08)'
            }}
        >
            {/* Logo grande */}
            <img
                src={logo} // Cambia la ruta si tienes otro logo
                alt="Logo"
                style={{ width: 250, marginBottom: 24 }}
            />
            <h2>Iniciar sesión</h2>
            <input
                type="text"
                placeholder="Usuario"
                value={usuario}
                onChange={e => setUsuario(e.target.value)}
                required
                className="login-input"
                style={{ width: 260, fontSize: 18, margin: '12px 0' }}
            />
            <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="login-input"
                style={{ width: 260, fontSize: 18, margin: '12px 0' }}
            />
            <button type="submit" className="login-button" style={{ width: 260, fontSize: 18 }}>
                Entrar
            </button>
            {error && <p className="error-message" style={{ color: 'red', marginTop: 12 }}>{error}</p>}
        </form>
    </div>
);

}

export default Login;