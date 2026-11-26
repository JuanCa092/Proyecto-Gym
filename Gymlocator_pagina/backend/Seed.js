/**
 * Seed de GYMLOCATOR.
 *
 * La estructura de la base de datos (tablas, procedimientos, triggers, vistas
 * y datos iniciales) se crea importando gimnasio_db.sql en phpMyAdmin.
 * Este script solo garantiza que exista la cuenta de administrador:
 *   1. Busca en la tabla Administrador el correo SEED_ADMIN_EMAIL.
 *   2. Si no existe, crea el perfil del administrador.
 *   3. Si el perfil no tiene cuenta en la tabla Usuario, la crea llamando a
 *      sp_registrar_usuario (el salt y el hash SHA2 los genera la base de datos).
 *
 * Es idempotente: si el administrador ya tiene cuenta, no cambia nada.
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function seed() {
  const {
    DB_HOST = 'localhost',
    DB_PORT = 3306,
    DB_USER = 'root',
    DB_PASSWORD = '',
    DB_NAME,
    SEED_ADMIN_NOMBRE = 'Administrador',
    SEED_ADMIN_APELLIDO = 'Principal',
    SEED_ADMIN_EMAIL,
    SEED_ADMIN_PASSWORD,
    SEED_ADMIN_USUARIO,                      // opcional: por defecto, la parte del correo antes de la @
    SEED_ADMIN_TIPO_DOC = 'CC',
    SEED_ADMIN_NUM_DOC = '1000000001',
    SEED_ADMIN_TELEFONO = '3000000001',
  } = process.env;

  if (!DB_NAME || !SEED_ADMIN_EMAIL || !SEED_ADMIN_PASSWORD) {
    console.error('Faltan variables en .env (DB_NAME, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD)');
    process.exit(1);
  }

  const correo = SEED_ADMIN_EMAIL.trim().toLowerCase();
  const nombreUsuario = (SEED_ADMIN_USUARIO || correo.split('@')[0]).trim();

  // Nos conectamos directamente a la base: debe existir (se crea con gimnasio_db.sql)
  const conexion = await mysql.createConnection({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  });

  try {
    // 1. ¿Ya existe el perfil del administrador y su cuenta?
    const [filas] = await conexion.query(
      `SELECT a.admin_id, u.id_usuario, u.nombre_usuario
         FROM Administrador a
         LEFT JOIN Usuario u ON u.admin_id = a.admin_id
        WHERE a.correo = ?
        LIMIT 1`,
      [correo]
    );
    const existente = filas[0];

    if (existente && existente.id_usuario) {
      console.log(
        `El administrador ${correo} ya tiene cuenta (usuario "${existente.nombre_usuario}"). No se hicieron cambios.`
      );
      return;
    }

    // 2. Crear perfil (si hace falta) y cuenta en una sola transacción
    await conexion.beginTransaction();
    try {
      let adminId;

      if (existente) {
        adminId = existente.admin_id;
      } else {
        const [resultado] = await conexion.query(
          `INSERT INTO Administrador (nom_admin, apel_admin, tipo_doc, num_doc, correo, telefono)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [SEED_ADMIN_NOMBRE, SEED_ADMIN_APELLIDO, SEED_ADMIN_TIPO_DOC, SEED_ADMIN_NUM_DOC, correo, SEED_ADMIN_TELEFONO]
        );
        adminId = resultado.insertId;
      }

      // La base valida la política de contraseñas y genera salt + hash
      await conexion.query('CALL sp_registrar_usuario(?, ?, ?, ?)', [
        nombreUsuario,
        SEED_ADMIN_PASSWORD,
        'ADMIN',
        adminId,
      ]);

      await conexion.commit();
    } catch (error) {
      await conexion.rollback();
      throw error;
    }

    console.log(`Administrador creado. Usuario: "${nombreUsuario}" (${correo})`);
  } finally {
    await conexion.end();
  }
}

seed().catch((error) => {
  if (['ER_BAD_DB_ERROR', 'ER_NO_SUCH_TABLE', 'ER_SP_DOES_NOT_EXIST'].includes(error.code)) {
    console.error('La base de datos no está lista. Importa gimnasio_db.sql en phpMyAdmin y vuelve a ejecutar el seed.');
  } else {
    console.error('Error ejecutando el seed:', error.message);
  }
  process.exit(1);
});