/**
 * Configuración de conexión a la base de datos MySQL para GYMLOCATOR.
 * Crea y exporta un pool de conexiones reutilizables usando mysql2/promise
 * para ejecutar consultas asíncronas con async/await desde los controladores.
 */

const mysql = require('mysql2/promise');

// Cargamos las variables definidas en el archivo Backend/.env
require('dotenv').config();

// createPool crea un conjunto de conexiones reutilizables hacia MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST,               // Host de MySQL (ej. localhost)
    port: process.env.DB_PORT || 3306,       // Puerto de MySQL (por defecto 3306)
    user: process.env.DB_USER,               // Usuario de MySQL
    password: process.env.DB_PASSWORD,       // Contraseña de MySQL
    database: process.env.DB_NAME,           // Nombre de la base de datos de GymLocator
    waitForConnections: true,                // Si no hay conexiones libres, espera en cola
    connectionLimit: 10,                     // Máximo de conexiones simultáneas
    queueLimit: 0                            // Sin límite de peticiones en espera
});

// Exportamos el pool para ejecutar consultas (db.query) desde cualquier controlador o script
module.exports = pool;