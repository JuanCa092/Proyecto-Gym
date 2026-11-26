/**
 * Rutas de autenticación para GYMLOCATOR.
 * Define las URLs (endpoints) relacionadas con la autenticación
 * y las conecta con su función controladora correspondiente.
 */

// Framework del servidor
const express = require('express');

// Router: mini servidor de rutas que luego se monta en src/server.js
// mediante app.use('/api/auth', authRoutes)
const router = express.Router();

// Funciones controladoras con la lógica de negocio de cada endpoint
const { login, perfil } = require('../controllers/auth.controller');

// Middleware que protege rutas exigiendo un token JWT válido
const verificarToken = require('../middlewares/verificartoken');

// POST /api/auth/login -> Iniciar sesión (ruta pública)
router.post('/login', login);

// GET /api/auth/perfil -> Devuelve los datos del usuario autenticado
// Ruta protegida: pasa primero por el middleware verificarToken
router.get('/perfil', verificarToken, perfil);

module.exports = router;
