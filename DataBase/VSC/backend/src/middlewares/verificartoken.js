/**
 * Middleware de autenticación JWT para GYMLOCATOR.
 * Se ejecuta ANTES de llegar a una ruta protegida (ej. GET /api/auth/perfil).
 * Verifica que la petición incluya un token JWT válido; si no existe o es
 * inválido, interrumpe la petición devolviendo un estado HTTP 401.
 */

// Librería para verificar tokens JWT
const jwt = require('jsonwebtoken');

// Carga las variables de entorno desde Backend/.env (JWT_SECRET)
require('dotenv').config();

/**
 * req: petición entrante
 * res: respuesta HTTP
 * next: función que continúa hacia el controlador si el token es válido
 */
function verificarToken(req, res, next) {
    // El frontend debe enviar el token en el encabezado:
    // Authorization: Bearer <token>
    const authHeader = req.headers.authorization;

    // Si no viene el header Authorization, no hay sesión activa -> rechazamos
    if (!authHeader) {
        return res.status(401).json({
            mensaje: 'No se envió un token de autenticación'
        });
    }

    // authHeader tiene el formato "Bearer eyJhbGciOi...", extraemos esquema y token
    const [scheme, token] = authHeader.split(' ');

    // Si el formato no inicia con "Bearer" o falta el token, bloqueamos el paso
    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({
            mensaje: 'Formato de token inválido'
        });
    }

    // Validamos firma y vigencia del token dentro de un bloque try/catch
    try {
        // jwt.verify comprueba la firma con JWT_SECRET y revisa que no esté expirado
        const datosUsuario = jwt.verify(token, process.env.JWT_SECRET);

        // Guardamos los datos decodificados en req.usuario para que el controlador los use
        req.usuario = datosUsuario;

        // Todo correcto: continuamos con el siguiente middleware o controlador
        next();
    } catch (error) {
        // Si el token venció o fue alterado, jwt.verify lanza una excepción
        return res.status(401).json({
            mensaje: 'Token inválido o expirado'
        });
    }
}

// Exportamos el middleware para usarlo en src/routes/
module.exports = verificarToken;
