/**
 * Controlador de autenticación para GYMLOCATOR.
 * Contiene la lógica de negocio del login: recibir email y contraseña,
 * buscar el usuario en MySQL, comparar la contraseña encriptada
 * y devolver el token JWT si las credenciales son válidas.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

/**
 * POST /api/auth/login
 * Recibe { email, password } y devuelve { token, usuario } si son correctos.
 */
async function login(req, res) {
    try {
        const { email, password } = req.body;

        // 1. Validación básica para evitar campos vacíos
        if (!email || !password) {
            return res.status(400).json({
                mensaje: 'El correo y la contraseña son obligatorios'
            });
        }

        // 2. Buscar el usuario por email en la tabla usuarios (consulta parametrizada)
        const [filas] = await db.query(
            'SELECT id, nombre, email, password, rol, estado FROM usuarios WHERE email = ? LIMIT 1',
            [email]
        );

        if (filas.length === 0) {
            return res.status(401).json({
                mensaje: 'Correo o contraseña incorrectos'
            });
        }

        const usuario = filas[0];

        // 3. Verificar si el usuario está activo
        if (usuario.estado === 0) {
            return res.status(403).json({
                mensaje: 'Este usuario está desactivado, contacte al administrador'
            });
        }

        // 4. Comparar la contraseña enviada con el hash guardado en MySQL
        const passwordCorrecta = await bcrypt.compare(password, usuario.password);

        if (!passwordCorrecta) {
            return res.status(401).json({
                mensaje: 'Correo o contraseña incorrectos'
            });
        }

        // 5. Generar el token JWT
        const token = jwt.sign(
            {
                id: usuario.id,
                email: usuario.email,
                rol: usuario.rol
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
        );

        // 6. Responder con el token y los datos públicos del usuario
        return res.json({
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });

    } catch (error) {
        console.error('Error en login (GymLocator):', error);
        return res.status(500).json({
            mensaje: 'Error del servidor al iniciar sesión'
        });
    }
}

/**
 * GET /api/auth/perfil
 * Ruta protegida: responde si el middleware verificartoken.js validó el token JWT.
 */
async function perfil(req, res) {
    return res.json({ usuario: req.usuario });
}

module.exports = { login, perfil };
