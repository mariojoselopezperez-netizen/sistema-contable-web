// backend/routes/users.js

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const router = express.Router();

// Configura el cliente de Supabase
const supabaseUrl = 'https://iowbccygufaqqquckowx.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware para verificar el token y el rol de administrador
const authenticateAndAuthorize = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        if (req.user.rol !== 'administrador') {
            return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
        }
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido o expirado.' });
    }
};

// --- Rutas de Gestión de Usuarios (protegidas) ---

// Ruta para obtener la lista de todos los usuarios (con su rol)
router.get('/', authenticateAndAuthorize, async (req, res) => {
    try {
        const { data: users, error } = await supabase.from('usuarios').select('*, roles(nombre)');
        if (error) throw error;
        res.json(users);
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ✅ Corrección: Ruta para obtener la lista de roles disponibles
router.get('/roles', authenticateAndAuthorize, async (req, res) => {
    try {
        const { data: roles, error } = await supabase.from('roles').select('id, nombre');
        if (error) throw error;
        res.json(roles);
    } catch (error) {
        console.error('Error al obtener los roles:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Ruta para crear un nuevo usuario desde el administrador
router.post('/users', authenticateAndAuthorize, async (req, res) => {
    const { nombre, email, contrasena, rol_id } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(contrasena, 10);
        const { data, error } = await supabase.from('usuarios').insert([
            { nombre, email, contrasena: hashedPassword, rol_id }
        ]).select('id, nombre, email');
        if (error) throw error;
        res.status(201).json({ message: 'Usuario creado exitosamente', user: data[0] });
    } catch (error) {
        console.error('Error al crear el usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Nueva ruta para eliminar un usuario
router.delete('/users/:id', authenticateAndAuthorize, async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabase.from('usuarios').delete().eq('id', id);
        if (error) throw error;
        res.status(200).json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
