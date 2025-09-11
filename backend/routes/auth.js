// backend/routes/auth.js

const express = require('express');
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const router = express.Router();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});
client.connect();

// Ruta de registro
router.post('/register', async (req, res) => {
  const { nombre, email, contrasena } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(contrasena, 10);
    const defaultRol = await client.query('SELECT id FROM roles WHERE nombre = $1', ['usuario']);
    
    if (defaultRol.rows.length === 0) {
      return res.status(500).json({ error: 'Rol predeterminado no encontrado' });
    }
    
    await client.query(
      'INSERT INTO usuarios (nombre, email, contrasena, rol_id) VALUES ($1, $2, $3, $4)',
      [nombre, email, hashedPassword, defaultRol.rows[0].id]
    );
    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (error) {
    console.error('Error al registrar el usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta de inicio de sesión (Login)
router.post('/login', async (req, res) => {
  const { email, contrasena } = req.body;
  try {
    // Consulta para buscar el usuario y su rol. Se usa un JOIN
    const userResult = await client.query(
      'SELECT u.id, u.nombre, u.email, u.contrasena, r.nombre AS rol FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE u.email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(contrasena, user.contrasena);

    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol } });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;