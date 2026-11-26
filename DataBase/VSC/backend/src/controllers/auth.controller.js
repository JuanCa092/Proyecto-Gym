/**
 * Controlador de autenticación para GYMLOCATOR.
 * Adaptado al modelo unificado de `usuarios` + `usuario_roles`:
 * - Verifica credenciales con bcryptjs.
 * - Controla bloqueo automático tras 3 intentos fallidos.
 * - Consulta todos los roles del usuario (ej. ['CLIENTE', 'ADMIN']) y los incluye en el JWT.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

/**
 * POST /api/auth/login
 * Recibe { email, password } y devuelve { token, usuario } con su arreglo de roles.
 */
async function login(req, res) {
    try {
        const { email, password } = req.body;

        // 1. Validación básica de campos obligatorios
        if (!email || !password) {
            return res.status(400).json({
                mensaje: 'El correo y la contraseña son obligatorios'
            });
        }

        // 2. Buscar el usuario por email en la tabla unificada `usuarios`
        const [filas] = await db.query(
            `SELECT id_usuario, nombre, apellido, email, password, estado, intentos_fallidos, bloqueado
             FROM usuarios
             WHERE email = ?
             LIMIT 1`,
            [email]
        );

        if (filas.length === 0) {
            return res.status(401).json({
                mensaje: 'Correo o contraseña incorrectos'
            });
        }

        const usuario = filas[0];

        // 3. Verificar si la cuenta está activa o bloqueada
        if (usuario.estado === 0) {
            return res.status(403).json({
                mensaje: 'Este usuario está desactivado, contacte al administrador'
            });
        }

        if (usuario.bloqueado === 1) {
            return res.status(403).json({
                mensaje: 'Cuenta bloqueada por múltiples intentos fallidos. Contacte al administrador'
            });
        }

        // 4. Comparar contraseña enviada con el hash bcrypt almacenado
        const passwordCorrecta = await bcrypt.compare(password, usuario.password);

        if (!passwordCorrecta) {
            const nuevosIntentos = usuario.intentos_fallidos + 1;
            const bloquear = nuevosIntentos >= 3 ? 1 : 0;

            await db.query(
                'UPDATE usuarios SET intentos_fallidos = ?, bloqueado = ? WHERE id_usuario = ?',
                [nuevosIntentos, bloquear, usuario.id_usuario]
            );

            if (bloquear === 1) {
                return res.status(403).json({
                    mensaje: 'Cuenta bloqueada tras 3 intentos fallidos. Contacte al administrador'
                });
            }

            return res.status(401).json({
                mensaje: 'Correo o contraseña incorrectos'
            });
        }

        // 5. Login exitoso: reiniciar intentos fallidos y actualizar último acceso
        await db.query(
            'UPDATE usuarios SET intentos_fallidos = 0, ultimo_acceso = NOW() WHERE id_usuario = ?',
            [usuario.id_usuario]
        );

        // 6. Obtener todos los roles asignados al usuario (ej. ['CLIENTE', 'ENTRENADOR'])
        const [filasRoles] = await db.query(
            `SELECT r.nombre
             FROM roles r
             INNER JOIN usuario_roles ur ON r.id_rol = ur.id_rol
             WHERE ur.id_usuario = ?`,
            [usuario.id_usuario]
        );

        const roles = filasRoles.map((r) => r.nombre);

        // 7. Firmar el token JWT incluyendo el arreglo de roles
        const token = jwt.sign(
            {
                id_usuario: usuario.id_usuario,
                email: usuario.email,
                roles
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
        );

        // 8. Responder con el token y los datos públicos del usuario
        return res.json({
            token,
            usuario: {
                id_usuario: usuario.id_usuario,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                roles
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
 * Ruta protegida: devuelve los datos decodificados del token JWT.
 */
async function perfil(req, res) {
    return res.json({ usuario: req.usuario });
}

module.exports = { login, perfil };