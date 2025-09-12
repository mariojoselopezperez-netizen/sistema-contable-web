// backend/routes/auth.js

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const router = express.Router();

// Configura el cliente de Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Ruta de registro
router.post('/register', async (req, res) => {
  const { nombre, email, contrasena } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(contrasena, 10);
    
    const { data: defaultRol, error: rolError } = await supabase
      .from('roles')
      .select('id')
      .eq('nombre', 'usuario');

    if (rolError || defaultRol.length === 0) {
      return res.status(500).json({ error: 'Rol predeterminado no encontrado' });
    }
    
    const { error: insertError } = await supabase
      .from('usuarios')
      .insert([
        { nombre, email, contrasena: hashedPassword, rol_id: defaultRol[0].id }
      ]);
    
    if (insertError) throw insertError;
    
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
    const { data: userResult, error } = await supabase
      .from('usuarios')
      .select('id, nombre, email, contrasena, rol:roles(nombre)')
      .eq('email', email);

    if (error) throw error;
    if (userResult.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = userResult[0];

    const isMatch = await bcrypt.compare(contrasena, user.contrasena);

    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, rol: user.rol.nombre }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol.nombre } });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;