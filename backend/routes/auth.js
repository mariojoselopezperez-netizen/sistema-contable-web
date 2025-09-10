// backend/routes/auth.js

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Client } = require('pg');
require('dotenv').config();

const router = express.Router();
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

// Asegúrate de conectar el cliente a la base de datos
client.connect();

// Ruta de registro de usuario
router.post('/register', async (req, res) => {
  const { nombre, email, contrasena } = req.body;
  const hashedPassword = await bcrypt.hash(contrasena, 10); // Encripta la contraseña

  try {
    const result = await client.query(
      'INSERT INTO usuarios (nombre, email, contrasena) VALUES ($1, $2, $3) RETURNING id, email',
      [nombre, email, hashedPassword]
    );
    res.status(201).json({ message: 'Usuario registrado exitosamente', user: result.rows[0] });
  } catch (error) {
    console.error('Error al registrar el usuario:', error);
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
});

// Ruta de inicio de sesión
router.post('/login', async (req, res) => {
  const { email, contrasena } = req.body;
  try {
    const result = await client.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const isMatch = await bcrypt.compare(contrasena, user.contrasena); // Compara contraseñas
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Crea un token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      process.env.JWT_SECRET || 'mi_secreto_super_seguro', // Usa una variable de entorno para el secreto
      { expiresIn: '1h' }
    );

    res.json({ message: 'Inicio de sesión exitoso', token });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

module.exports = router;