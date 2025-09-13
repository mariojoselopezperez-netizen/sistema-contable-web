const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const upload = multer({ storage: multer.memoryStorage() });

// Middleware de autenticación
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No autorizado' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Asume que el payload incluye el id del usuario
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// ------------------ POST /empresa ------------------
router.post('/empresa', authenticate, upload.single('logo'), async (req, res) => {
  try {
    const { nombre_comercial, nombre_legal, ruc, direccion, telefono, email } = req.body;
    const usuario_id = req.user.id;

    if (!nombre_comercial || !nombre_legal) {
      return res.status(400).json({ error: 'nombre_comercial y nombre_legal son requeridos' });
    }

    let logo_url = null;
    if (req.file) {
      const fileName = `${usuario_id}/${Date.now()}_${req.file.originalname}`;
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Error al subir el archivo a Supabase:', uploadError);
        return res.status(500).json({ error: 'Error al subir el archivo' });
      }

      const { data: urlData } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);
      logo_url = urlData.publicUrl;
    }

    const empresaData = {
      usuario_id,
      nombre_comercial,
      nombre_legal,
      ruc,
      direccion,
      telefono,
      email,
      logo_url,
    };

    const { data, error } = await supabase
      .from('empresa')
      .upsert([empresaData], { onConflict: 'usuario_id' })
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
router.get('/empresa', authenticate, async (req, res) => {
  try {
    const usuario_id = req.user.id;

    const { data, error } = await supabase
      .from('empresa')
      .select('*')
      .eq('usuario_id', usuario_id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error al obtener la información de la empresa:', error);
      return res.status(500).json({ error: 'Error al obtener la información de la empresa' });
    }

    if (!data) {
      return res.status(404).json({ message: 'No se encontró información de la empresa para este usuario' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error general en GET /empresa:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// ------------------ GET /comprobantes ------------------
router.get('/comprobantes', authenticate, async (req, res) => {
  try {
    const usuario_id = req.user.id;
    const { data, error } = await supabase
      .from('comprobantes')
      .select('*')
      .eq('usuario_id', usuario_id); // Ajusta según tu esquema
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error al obtener comprobantes:', error);
    res.status(500).json({ error: 'Error al obtener comprobantes' });
  }
});

// ------------------ PUT /comprobantes/:id ------------------
router.put('/comprobantes/:id', authenticate, async (req, res) => {
  if (req.user.rol !== 'administrador') return res.status(403).json({ error: 'Acceso denegado' });
  try {
    const { id } = req.params;
    const { consecutivo, reinicio } = req.body;
    const { data, error } = await supabase
      .from('comprobantes')
      .update({ consecutivo, reinicio })
      .eq('id', id)
      .eq('usuario_id', req.user.id);
    if (error) throw error;
    res.json({ message: 'Comprobante actualizado' });
  } catch (error) {
    console.error('Error al actualizar comprobante:', error);
    res.status(500).json({ error: 'Error al actualizar comprobante' });
  }
});

// ------------------ GET /periodos ------------------
router.get('/periodos', authenticate, async (req, res) => {
  try {
    const usuario_id = req.user.id;
    const { data, error } = await supabase
      .from('periodos_contables')
      .select('*')
      .eq('usuario_id', usuario_id); // Ajusta según tu esquema
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error al obtener periodos:', error);
    res.status(500).json({ error: 'Error al obtener periodos' });
  }
});

// ------------------ PUT /periodos/:id ------------------
router.put('/periodos/:id', authenticate, async (req, res) => {
  if (req.user.rol !== 'administrador') return res.status(403).json({ error: 'Acceso denegado' });
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const { data, error } = await supabase
      .from('periodos_contables')
      .update({ estado })
      .eq('id', id)
      .eq('usuario_id', req.user.id);
    if (error) throw error;
    res.json({ message: 'Periodo actualizado' });
  } catch (error) {
    console.error('Error al actualizar periodo:', error);
    res.status(500).json({ error: 'Error al actualizar periodo' });
  }
});

// ------------------ GET /cuentas-bancarias ------------------
router.get('/cuentas-bancarias', authenticate, async (req, res) => {
  try {
    const usuario_id = req.user.id;
    const { data, error } = await supabase
      .from('cuentas_bancarias')
      .select('*, conciliaciones(*)')
      .eq('usuario_id', usuario_id); // Ajusta según tu esquema
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error al obtener cuentas bancarias:', error);
    res.status(500).json({ error: 'Error al obtener cuentas bancarias' });
  }
});

// ------------------ PUT /cuentas-bancarias/:id ------------------
router.put('/cuentas-bancarias/:id', authenticate, async (req, res) => {
  if (req.user.rol !== 'administrador') return res.status(403).json({ error: 'Acceso denegado' });
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const { data, error } = await supabase
      .from('conciliaciones')
      .update({ estado })
      .eq('id', id)
      .eq('usuario_id', req.user.id);
    if (error) throw error;
    res.json({ message: 'Cuenta conciliada' });
  } catch (error) {
    console.error('Error al conciliar cuenta:', error);
    res.status(500).json({ error: 'Error al conciliar cuenta' });
  }
});

module.exports = router;