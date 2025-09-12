// backend/routes/configuracion.js

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
require('dotenv').config();

const router = express.Router();

// Inicializar el cliente de Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Multer para recibir archivos en memoria
const upload = multer({ storage: multer.memoryStorage() });

// ------------------ POST /empresa ------------------
router.post('/empresa', upload.single('logo'), async (req, res) => {
  const { nombre_comercial, nombre_legal, ruc, direccion, telefono, email } = req.body;
  let logo_path = null;

  if (req.file) {
    const fileName = `${Date.now()}_${req.file.originalname}`;
    const filePath = `logos/${fileName}`;

    const { data, error } = await supabase.storage
      .from('logos')
      .upload(filePath, req.file.buffer, { cacheControl: '3600', upsert: false });

    if (error) {
      console.error('Error al subir el archivo a Supabase:', error);
      return res.status(500).json({ error: 'Error al subir el archivo' });
    }

    const publicUrlData = supabase.storage
      .from('logos')
      .getPublicUrl(filePath);

    logo_path = publicUrlData.data.publicUrl;
  }

  try {
    const { data, error } = await supabase
      .from('empresa')
      .insert([{ nombre_comercial, nombre_legal, ruc, direccion, telefono, email, logo_path }])
      .select();

    if (error) {
      console.error('Error al guardar la información de la empresa:', error);
      return res.status(500).json({ error: 'Error al guardar la información de la empresa' });
    }

    res.status(201).json({ message: 'Información de la empresa guardada exitosamente', empresa: data[0] });

  } catch (error) {
    console.error('Error general en POST /empresa:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// ------------------ GET /empresa ------------------
router.get('/empresa', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('empresa')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('Error al obtener la información de la empresa:', error);
      // Si no hay registros, devolvemos datos por defecto sin alterar la base
      return res.json({
        nombre_comercial: "Mi Empresa",
        nombre_legal: "Mi Empresa Legal",
        ruc: "123456789",
        direccion: "Calle Falsa 123",
        telefono: "12345678",
        email: "contacto@empresa.com",
        logo_path: "logos/logo.png"
      });
    }

    res.json(data || {
      nombre_comercial: "Mi Empresa",
      nombre_legal: "Mi Empresa Legal",
      ruc: "123456789",
      direccion: "Calle Falsa 123",
      telefono: "12345678",
      email: "contacto@empresa.com",
      logo_path: "logos/logo.png"
    });

  } catch (error) {
    console.error('Error general en GET /empresa:', error);
    // Fallback seguro para frontend
    res.json({
      nombre_comercial: "Mi Empresa",
      nombre_legal: "Mi Empresa Legal",
      ruc: "123456789",
      direccion: "Calle Falsa 123",
      telefono: "12345678",
      email: "contacto@empresa.com",
      logo_path: "logos/logo.png"
    });
  }
});

module.exports = router;
