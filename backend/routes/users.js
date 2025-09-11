// backend/routes/users.js

const express = require('express');
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Importa 'jsonwebtoken'
require('dotenv').config();

const router = express.Router();
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});
client.connect();

// Middleware para verificar el token y el rol de administrador
const authenticateAndAuthorize = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Adjunta el usuario decodificado a la solicitud
    
    // Si el usuario no es un administrador, denegar el acceso
    if (req.user.rol !== 'administrador') {
      return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
    }
    next(); // Continúa con la siguiente función en la cadena de middleware
  } catch (error) {
    res.status(401).json({ error: 'Token inválido o expirado.' });
  }
};

// --- Rutas de Gestión de Usuarios (protegidas) ---

// Ruta para obtener la lista de todos los usuarios (con su rol)
router.get('/', authenticateAndAuthorize, async (req, res) => {
  try {
    const result = await client.query('SELECT u.id, u.nombre, u.email, r.nombre as rol FROM usuarios u JOIN roles r ON u.rol_id = r.id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para obtener la lista de roles disponibles
router.get('/roles', authenticateAndAuthorize, async (req, res) => {
  try {
    const result = await client.query('SELECT id, nombre FROM roles');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener los roles:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para crear un nuevo usuario desde el administrador
router.post('/', authenticateAndAuthorize, async (req, res) => {
  const { nombre, email, contrasena, rol_id } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(contrasena, 10);
    const result = await client.query(
      'INSERT INTO usuarios (nombre, email, contrasena, rol_id) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email',
      [nombre, email, hashedPassword, rol_id]
    );
    res.status(201).json({ message: 'Usuario creado exitosamente', user: result.rows[0] });
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Nueva ruta para eliminar un usuario
router.delete('/:id', authenticateAndAuthorize, async (req, res) => {
  const { id } = req.params;
  try {
    await client.query('DELETE FROM usuarios WHERE id = $1', [id]);
    res.status(200).json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


module.exports = router;