// backend/routes/configuracion.js

const express = require('express');
const { Client } = require('pg');
require('dotenv').config();

const router = express.Router();
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});
client.connect();

// Ruta para guardar la información de la empresa
router.post('/empresa', async (req, res) => {
  const { nombre_comercial, nombre_legal, ruc, direccion, telefono, email } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO empresa (nombre_comercial, nombre_legal, ruc, direccion, telefono, email) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [nombre_comercial, nombre_legal, ruc, direccion, telefono, email]
    );
    res.status(201).json({ message: 'Información de la empresa guardada exitosamente', empresa: result.rows[0] });
  } catch (error) {
    console.error('Error al guardar la información de la empresa:', error);
    res.status(500).json({ error: 'Error al guardar la información de la empresa' });
  }
});

// Ruta para obtener la información de la empresa
router.get('/empresa', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM empresa LIMIT 1');
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'No se encontró información de la empresa' });
    }
  } catch (error) {
    console.error('Error al obtener la información de la empresa:', error);
    res.status(500).json({ error: 'Error al obtener la información de la empresa' });
  }
});

module.exports = router;