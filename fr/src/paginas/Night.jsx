import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';
import Chart from "chart.js/auto";
import './Night.css';

const TIME_RANGES = [
    { label: "10min", minutes: 10 },
    { label: "1h", minutes: 60 },
    { label: "6h", minutes: 360 },
    { label: "12h", minutes: 720 },
    { label: "1d", minutes: 1440 },
];

function getColorSpo2(spo2) {
    if (spo2 < 90) return "#FF3B30";
    if (spo2 < 95) return "#FFD600";
    return "#00FF00";
}

const NightSpO2Chart = () => {
    const [selectedRange, setSelectedRange] = useState(TIME_RANGES[2]);
    const [data, setData] = useState([]);
    const spo2ChartRef = useRef(null);
    const lpmChartRef = useRef(null);
    const spo2ChartInstance = useRef(null);
    const lpmChartInstance = useRef(null);
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:3001/api/mediciones", {
                headers: { "Authorization": "Bearer " + token }
            });
            const json = await res.json();

            const now = Date.now();
            const filtered = json
                .filter(entry => new Date(entry.timestamp).getTime() >= now - selectedRange.minutes * 60 * 1000)
                .map(e => ({
                    dateString: e.timestamp,
                    spo2: e.spo2,
                    lpm: e.lpm
                }));

            setData(filtered.slice(-50));
        } catch (error) {
            console.error("Error al traer las mediciones:", error);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [selectedRange]);

    // Función para actualizar gráfico
    const updateChart = (chartRef, chartInstanceRef, values, pointColors, label, borderColor) => {
        const labels = data.map(e => new Date(e.dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        if (!chartInstanceRef.current) {
            chartInstanceRef.current = new Chart(chartRef.current, {
                type: "line",
                data: { labels, datasets: [{ label, data: values, fill: false, borderColor, tension: 0.3, pointRadius: 4, pointBackgroundColor: pointColors, pointBorderColor: pointColors, borderWidth: 2 }] },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false }, title: { display: false } },
                    scales: {
                        x: { grid: { color: "#444" }, ticks: { color: "#bbb", maxTicksLimit: 12 } },
                        y: { beginAtZero: false, grid: { color: "#444" }, ticks: { color: "#bbb" } }
                    }
                }
            });
        } else {
            chartInstanceRef.current.data.labels = labels;
            chartInstanceRef.current.data.datasets[0].data = values;
            chartInstanceRef.current.data.datasets[0].pointBackgroundColor = pointColors;
            chartInstanceRef.current.data.datasets[0].pointBorderColor = pointColors;
            chartInstanceRef.current.update();
        }
    };

    useEffect(() => {
        if (!data.length) return;
        // SpO2
        updateChart(
            spo2ChartRef,
            spo2ChartInstance,
            data.map(e => e.spo2),
            data.map(e => getColorSpo2(e.spo2)),
            "SpO₂ (%)",
            "#00FF00"
        );
        // LPM
        updateChart(
            lpmChartRef,
            lpmChartInstance,
            data.map(e => e.lpm),
            Array(data.length).fill("#00BFFF"), // azul para LPM
            "LPM",
            "#00BFFF"
        );
    }, [data]);

    return (
        <div className="nightscout-bg">
            <div className="nightscout-timerange-bar" style={{ display: "flex", gap: 8, margin: "0.5rem 0" }}>
                {TIME_RANGES.map(range => (
                    <button
                        key={range.label}
                        className={`nightscout-range-btn${selectedRange.label === range.label ? " selected" : ""}`}
                        style={{
                            background: selectedRange.label === range.label ? "#222" : "#444",
                            color: selectedRange.label === range.label ? "#0f0" : "#fff",
                            border: "none",
                            borderRadius: 4,
                            padding: "0.3rem 0.7rem",
                            fontWeight: "bold",
                            cursor: "pointer"
                        }}
                        onClick={() => setSelectedRange(range)}
                    >
                        {range.label}
                    </button>
                ))}
            </div>

            <div style={{ marginBottom: "1rem" }}>
                <button
                    onClick={() => navigate('/app')}
                    className="nightscout-back"
                    style={{
                        background: "#222",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        padding: "0.3rem 1rem",
                        fontWeight: "bold",
                        cursor: "pointer"
                    }}
                >
                    Volver
                </button>
            </div>

            <div className="nightscout-chart-container">
                <canvas ref={spo2ChartRef} />
            </div>

            <div className="nightscout-chart-container" style={{ marginTop: "2rem" }}>
                <canvas ref={lpmChartRef} />
            </div>
        </div>
    );
};

export default NightSpO2Chart;
