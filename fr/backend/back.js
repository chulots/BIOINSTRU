import express from "express";
import cors from "cors";
import mysql from "mysql2";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'basedatossensor'
});

db.connect(err => {
    if (err) throw err;
    console.log('Conectado a la base de datos Base de Datos del Sensor');
});

// ----------------------
// 1) Login
// ----------------------
app.post("/login", (req, res) => { 
    const { username, password } = req.body;

    const query = "SELECT * FROM pacientes WHERE usuario = ? AND contrasena = ?";
    db.query(query, [username, password], (err, results) => {
        if (err) return res.status(500).json({ error: "Error del servidor" });

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: "Credenciales inválidas" });
        }

        const usuario = results[0];

        // Generar token solo con el username
        const token = jwt.sign({ username: usuario.usuario }, 'MI_SECRETO', { expiresIn: '1h' });

        // Devolver usuario real
        return res.json({
            success: true,
            message: "Ingreso correcto",
            token,
            usuario: {
                nombre: usuario.nombre,
                correo: usuario.correo,
                edad: usuario.edad,
                genero: usuario.genero,
                usuario: usuario.usuario
            }
        });
    });
});

// ----------------------
// Middleware para verificar token
// ----------------------
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Token no proporcionado" });

    jwt.verify(token, 'MI_SECRETO', (err, decoded) => {
        if (err) return res.status(403).json({ error: "Token inválido" });

        // Ahora verificamos en la DB que el usuario exista
        const query = "SELECT * FROM pacientes WHERE usuario = ?";
        db.query(query, [decoded.username], (err, results) => {
            if (err) return res.status(500).json({ error: "Error del servidor" });
            if (results.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });

            req.user = results[0]; // guardamos el usuario completo en req.user
            next();
        });
    });
}

// ----------------------
// 2) Ruta datos del paciente
// ----------------------
app.get("/api/usuario", verifyToken, (req, res) => {
    const usuario = req.user;
    return res.json({
        nombre: usuario.nombre,
        correo: usuario.correo,
        edad: usuario.edad,
        genero: usuario.genero
    });
});

// ----------------------
app.listen(3001, () => { 
    console.log("Servidor corriendo en el puerto 3001");
});

// ----------------------
// 3) Ruta recibir medicionoes 
// ----------------------

app.post("/api/medicion", verifyToken, (req, res) => {
  const { var_mode, var_spo2, var_lpm, var_alarma_estadosonda, var_alarma_spo2, var_alarma_lpm } = req.body;

  if (!var_mode || !var_spo2 || !var_lpm) {
    return res.status(400).json({ error: "Faltan datos de la medición" });
  } 

  // Convertir nombres del body a los que coinciden con la tabla SQL
  const modo = var_mode;
  const alarma_estado_sonda = var_alarma_estadosonda;
  const alarma_spo2 = var_alarma_spo2;
  const alarma_lpm = var_alarma_lpm;

  // Usar directamente el id del paciente desde el token
  const paciente_id = req.user.id;

  // Insertar medición en la tabla SQL
  const insertQuery = `
    INSERT INTO mediciones
    (paciente_id, modo, spo2, lpm, alarma_estado_sonda, alarma_spo2, alarma_lpm, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
  `;
  const values = [paciente_id, modo, var_spo2, var_lpm, alarma_estado_sonda, alarma_spo2, alarma_lpm];

  db.query(insertQuery, values, (err) => {
    if (err) return res.status(500).json({ error: "Error al guardar la medición" });
    return res.json({ success: true, message: "Medición guardada correctamente" });
  });
});

// ----------------------
// 4) ruta para obtener todas las mediciones del paciente logueado
// ----------------------
app.get("/api/mediciones", verifyToken, (req, res) => {
  const paciente_id = req.user.id;

  const query = `
    SELECT timestamp, modo, spo2, lpm, alarma_estado_sonda, alarma_spo2, alarma_lpm
    FROM mediciones
    WHERE paciente_id = ?
    ORDER BY timestamp DESC
  `;

  db.query(query, [paciente_id], (err, results) => {
    if (err) return res.status(500).json({ error: "Error al obtener las mediciones" });
    return res.json(results);
  });
});
