const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const configuracionRoutes = require('./routes/configuracion');
const usersRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3001;

// Verificación de variables de entorno
const requiredEnv = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'JWT_SECRET'];
if (requiredEnv.some(key => !process.env[key])) {
  console.error('Faltan variables de entorno requeridas');
  process.exit(1);
}

// ---------------- CORS CONFIG ----------------
// Permite todas las solicitudes (ajustar en producción)
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API del sistema contable funcionando!');
});

// Montar rutas
app.use('/api/auth', authRoutes);
app.use('/api/configuracion', configuracionRoutes);
app.use('/api/users', usersRoutes);

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal en el servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});