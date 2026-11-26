/**
 * Seed de GYMLOCATOR.
 *
 * La estructura de la base de datos (tablas usuarios, roles, usuario_roles, etc.)
 * se crea importando el archivo SQL de gimnasio_db en phpMyAdmin. Ese archivo
 * no trae datos, así que este script se encarga de lo mínimo para poder entrar:
 *   1. Crea los roles ADMIN, ENTRENADOR y CLIENTE si no existen.
 *   2. Crea el usuario administrador definido en .env (contraseña con bcrypt).
 *   3. Le asigna el rol ADMIN en usuario_roles.
 *
 * Es idempotente: se puede ejecutar varias veces sin duplicar nada y nunca
 * modifica la contraseña de un usuario que ya existe.
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const ROLES = ['ADMIN', 'ENTRENADOR', 'CLIENTE'];

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
    SEED_ADMIN_TIPO_DOC = 'CC',
    SEED_ADMIN_NUM_DOC = '1000000001',
    SEED_ADMIN_TELEFONO = '3000000001',
  } = process.env;

  if (!DB_NAME || !SEED_ADMIN_EMAIL || !SEED_ADMIN_PASSWORD) {
    console.error('Faltan variables en .env (DB_NAME, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD)');
    process.exit(1);
  }

  const email = SEED_ADMIN_EMAIL.trim().toLowerCase();

  // Nos conectamos directamente a la base: debe existir con sus tablas ya creadas
  const conexion = await mysql.createConnection({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  });

  try {
    await conexion.beginTransaction();

    try {
      // 1. Roles base (INSERT IGNORE respeta el índice único de roles.nombre)
      for (const rol of ROLES) {
        await conexion.query('INSERT IGNORE INTO roles (nombre) VALUES (?)', [rol]);
      }

      const [[rolAdmin]] = await conexion.query('SELECT id_rol FROM roles WHERE nombre = ?', ['ADMIN']);

      // 2. Usuario administrador: se crea solo si el correo no existe
      const [filas] = await conexion.query('SELECT id_usuario FROM usuarios WHERE email = ? LIMIT 1', [email]);

      let idUsuario;
      let creado = false;

      if (filas.length > 0) {
        idUsuario = filas[0].id_usuario;
      } else {
        const hash = await bcrypt.hash(SEED_ADMIN_PASSWORD, 10);
        const [resultado] = await conexion.query(
          `INSERT INTO usuarios (nombre, apellido, tipo_doc, num_doc, email, telefono, password)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [SEED_ADMIN_NOMBRE, SEED_ADMIN_APELLIDO, SEED_ADMIN_TIPO_DOC, SEED_ADMIN_NUM_DOC, email, SEED_ADMIN_TELEFONO, hash]
        );
        idUsuario = resultado.insertId;
        creado = true;
      }

      // 3. Asignar el rol ADMIN (no hace nada si ya lo tenía)
      const [asignacion] = await conexion.query(
        'INSERT IGNORE INTO usuario_roles (id_usuario, id_rol) VALUES (?, ?)',
        [idUsuario, rolAdmin.id_rol]
      );

      await conexion.commit();

      console.log(`Roles verificados: ${ROLES.join(', ')}`);
      if (creado) {
        console.log(`Administrador creado: ${email}`);
      } else if (asignacion.affectedRows > 0) {
        console.log(`El usuario ${email} ya existía; se le asignó el rol ADMIN. Su contraseña no se modificó.`);
      } else {
        console.log(`El administrador ${email} ya existe con rol ADMIN. No se hicieron cambios.`);
      }
    } catch (error) {
      await conexion.rollback();
      throw error;
    }
  } finally {
    await conexion.end();
  }
}

seed().catch((error) => {
  if (['ER_BAD_DB_ERROR', 'ER_NO_SUCH_TABLE'].includes(error.code)) {
    console.error('La base de datos no está lista. Crea gimnasio_db e importa el archivo SQL en phpMyAdmin, y vuelve a ejecutar el seed.');
  } else {
    console.error('Error ejecutando el seed:', error.message);
  }
  process.exit(1);
});