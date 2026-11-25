require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seed() {
  const {
    DB_HOST = 'localhost',
    DB_PORT = 3306,
    DB_USER = 'root',
    DB_PASSWORD = '',
    DB_NAME,
    SEED_ADMIN_NOMBRE,
    SEED_ADMIN_EMAIL,
    SEED_ADMIN_PASSWORD,
  } = process.env;

  if (!DB_NAME || !SEED_ADMIN_EMAIL || !SEED_ADMIN_PASSWORD) {
    console.error('Faltan variables en .env (DB_NAME, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD)');
    process.exit(1);
  }

  // Conexión sin base de datos para poder crearla si no existe
  const conexion = await mysql.createConnection({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
  });

  try {
    await conexion.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await conexion.query(`USE \`${DB_NAME}\``);

    await conexion.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        rol ENUM('admin', 'usuario') NOT NULL DEFAULT 'usuario',
        activo TINYINT(1) NOT NULL DEFAULT 1,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);

    const email = SEED_ADMIN_EMAIL.trim().toLowerCase();
    const [existente] = await conexion.query('SELECT id FROM usuarios WHERE email = ?', [email]);

    if (existente.length > 0) {
      console.log(`El administrador ${email} ya existe. No se hicieron cambios.`);
      return;
    }

    const hash = await bcrypt.hash(SEED_ADMIN_PASSWORD, 10);
    await conexion.query(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
      [SEED_ADMIN_NOMBRE || 'Administrador', email, hash, 'admin']
    );

    console.log(`Base "${DB_NAME}" lista. Administrador creado: ${email}`);
  } finally {
    await conexion.end();
  }
}

seed().catch((error) => {
  console.error('Error ejecutando el seed:', error.message);
  process.exit(1);
});