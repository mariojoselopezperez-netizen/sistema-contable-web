// backend/server.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const configuracionRoutes = require('./routes/configuracion');
const usersRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3001;

// ---------------- CORS CONFIG ----------------
// Permite todas las solicitudes de cualquier origen.
app.use(cors());

app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API del sistema contable funcionando!');
  });

  // Rutas reales
  app.use('/api/auth', authRoutes);
  app.use('/api/configuracion', configuracionRoutes);
  // Código corregido
  app.use('/api/users', usersRoutes);

  app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    });