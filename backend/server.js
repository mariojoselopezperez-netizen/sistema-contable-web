// backend/server.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/auth'); // Importa las rutas de autenticación
const configuracionRoutes = require('./routes/configuracion'); // Importa las rutas de configuración
const usersRoutes = require('./routes/users'); // Importa las nuevas rutas de usuarios

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// Configuración de CORS para permitir solicitudes desde el frontend
// Asegúrate de reemplazar la URL con la de tu frontend si es diferente
const corsOptions = {
    // La URL de origen no debe tener una barra al final
    origin: 'https://effective-space-pancake-4j9vr64grrwwf77j6-5173.app.github.dev', 
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());

// Rutas de prueba
app.get('/', (req, res) => {
    res.send('API del sistema contable funcionando!');
});

// Usar las rutas de autenticación
app.use('/api/auth', authRoutes);

// Usar las nuevas rutas de configuración
app.use('/api/configuracion', configuracionRoutes);

// Usar las nuevas rutas de usuarios
app.use('/api/users', usersRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});