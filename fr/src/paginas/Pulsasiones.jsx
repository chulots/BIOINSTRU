import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Pulsasiones.css";
import alarmaFile from "../assets/alarma.mp3"; // ✅ Importar audio desde assets

const fetchDatos = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:3001/api/mediciones", {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Error al obtener datos");
    return await response.json();
};

export default function Pulsasiones() {
    const [ultimo, setUltimo] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [alarmaHabilitada, setAlarmaHabilitada] = useState(false); // ✅ bandera para habilitar audio
    const navigate = useNavigate();
    const alarmaAudio = useRef(null);

    // Función para obtener alertas
    const obtenerAlertas = (d) => {
        const a = [];
        if (d.alarma_estado_sonda === 1) a.push("Sonda desconectada");
        if (d.alarma_spo2 === 1) a.push("SpO₂ fuera de rango");
        if (d.alarma_lpm === 1) a.push("LPM fuera de rango");
        return a;
    };

    // Cargar datos y actualizar cada 3s
    useEffect(() => {
        const cargar = async () => {
            try {
                const lista = await fetchDatos();
                if (lista.length > 0) setUltimo(lista[0]); // solo último dato
                setCargando(false);
            } catch (err) {
                setError("No se pudieron cargar los datos.");
                setCargando(false);
            }
        };
        cargar();
        const interval = setInterval(cargar, 3000);
        return () => clearInterval(interval);
    }, []);

    // 🔔 Reproducir alarma si hay alertas y usuario habilitó audio
    useEffect(() => {
        if (!ultimo || !alarmaHabilitada) return;
        const alertas = obtenerAlertas(ultimo);
        if (alertas.length && alarmaAudio.current) {
            alarmaAudio.current.play().catch(() => {
                console.log("No se pudo reproducir el audio (política del navegador)");
            });
        }
    }, [ultimo, alarmaHabilitada]);

    return (
        <div className="monitor-container">
            <button className="btn-volver" onClick={() => navigate("/app")}>
                ← Volver
            </button>

            <h2 className="titulo">Monitor Multiparamétrico</h2>

            {/* Botón para habilitar audio */}
            {!alarmaHabilitada && (
                <button
                    className="btn-activar-alarma"
                    onClick={() => setAlarmaHabilitada(true)}
                >
                    Activar Alarmas Sonoras
                </button>
            )}

            {/* Audio oculto */}
            <audio ref={alarmaAudio} src={alarmaFile} preload="auto" />

            {cargando ? (
                <p className="loading">Cargando datos...</p>
            ) : error ? (
                <p className="error">{error}</p>
            ) : !ultimo ? (
                <p className="loading">No hay datos todavía</p>
            ) : (
                <>
                    {/* PANEL DEL MONITOR */}
                    <div className="monitor-panel">
                        <div className="parametro spo2">
                            <label>SpO₂</label>
                            <div className="valor">{ultimo.spo2}</div>
                            <span className="unidad">%</span>
                        </div>

                        <div className="parametro pulsos">
                            <label>Pulsaciones</label>
                            <div className="valor">{ultimo.lpm}</div>
                            <span className="unidad">LPM</span>
                        </div>

                        <div className="parametro modo">
                            <label>Modo</label>
                            <div className="valor-modo">{ultimo.modo}</div>
                        </div>
                    </div>

                    {/* ALERTAS GRANDES ABAJO */}
                    <div className="alertas-box">
                        {(() => {
                            const alertas = obtenerAlertas(ultimo);
                            return alertas.length ? (
                                <div className="alerta-activa">{alertas.join(" • ")}</div>
                            ) : (
                                <div className="alerta-normal">ESTADO: NORMAL</div>
                            );
                        })()}
                    </div>

                    {/* Fecha/Hora */}
                    <div className="timestamp">
                        Última medición: {new Date(ultimo.timestamp).toLocaleString()}
                    </div>
                </>
            )}
        </div>
    );
}
