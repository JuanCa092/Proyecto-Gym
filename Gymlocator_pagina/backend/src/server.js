/**
 * Punto de entrada del backend para GYMLOCATOR.
 * Aquí se crea la aplicación de Express, se configuran los middlewares
 * globales (cors, json) y se montan las rutas. Al final, el servidor queda
 * escuchando peticiones en el puerto definido en .env (por defecto el 4000).
 */

// Framework para crear el servidor HTTP y definir rutas
const express = require('express');

// Middleware que habilita CORS (peticiones desde otro origen o puerto, como Vite)
const cors = require('cors');

// Lee el archivo Backend/.env y carga sus valores en process.env
require('dotenv').config();

// Importamos el router con los endpoints de autenticación (login y perfil)
const authRoutes = require('./routes/auth.routes');

// Creamos la aplicación Express
const app = express();

// cors() permite que el frontend en React + Vite (que corre en otro puerto)
// pueda hacer peticiones al backend sin que el navegador lo bloquee
app.use(cors());

// express.json() permite a Express interpretar el body de las peticiones
// cuando viene en formato JSON (ej. req.body.email, req.body.password)
app.use(express.json());

// Ruta de salud simple, útil para comprobar que el servidor está activo
app.get('/', (req, res) => {
    res.json({ mensaje: 'API de GymLocator funcionando correctamente' });
});

// Todas las rutas que empiecen con /api/auth se resuelven en src/routes/auth.routes.js
app.use('/api/auth', authRoutes);

// Middleware para rutas que no existen (404)
app.use((req, res) => {
    res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

// Tomamos el puerto desde .env o usamos 4000 si no está definido
const PORT = process.env.PORT || 4000;

// Arranca el servidor: Express queda escuchando peticiones HTTP en el puerto indicado
app.listen(PORT, () => {
    console.log(`Servidor backend de GymLocator escuchando en http://localhost:${PORT}`);
});
