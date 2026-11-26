-- =====================================================================
--  BASE DE DATOS: gimnasio_db (GymLocator - MySQL / MariaDB)
--  100% Normalizada (3FN):
--   - Identidad única en `usuarios` + multirrol (`usuario_roles`)
--   - Autenticación por email + hash bcrypt (desde Node.js)
--   - Sedes con `localidad` integrada
--   - Catálogo (`clases`) separado de programación (`horarios_clase`)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS gimnasio_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE gimnasio_db;

-- ---------------------------------------------------------------------
-- LIMPIEZA INICIAL
-- ---------------------------------------------------------------------
SET FOREIGN_KEY_CHECKS = 0;
DROP TRIGGER IF EXISTS trg_usuario_ai;
DROP TRIGGER IF EXISTS trg_usuario_au;
DROP TRIGGER IF EXISTS trg_validar_cupo;
DROP TABLE IF EXISTS auditoria_usuarios;
DROP TABLE IF EXISTS reservas_clases;
DROP TABLE IF EXISTS horarios_clase;
DROP TABLE IF EXISTS clases;
DROP TABLE IF EXISTS tipo_categorias;
DROP TABLE IF EXISTS membresias_usuario;
DROP TABLE IF EXISTS membresias;
DROP TABLE IF EXISTS sedes;
DROP TABLE IF EXISTS perfil_entrenador;
DROP TABLE IF EXISTS usuario_roles;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS usuarios;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- 1. USUARIOS Y ROLES (Un usuario puede ser CLIENTE y ENTRENADOR/ADMIN)
-- =====================================================================

CREATE TABLE usuarios (
  id_usuario        INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre            VARCHAR(50)  NOT NULL,
  apellido          VARCHAR(50)  NOT NULL,
  tipo_doc          ENUM('CC','CE','TI','PAS','NIT') NOT NULL DEFAULT 'CC',
  num_doc           VARCHAR(20)  NOT NULL,
  email             VARCHAR(100) NOT NULL,
  telefono          VARCHAR(15)  NOT NULL,
  password          VARCHAR(255) NOT NULL, -- Hash bcrypt generado en Node.js
  estado            TINYINT(1)   NOT NULL DEFAULT 1, -- 1 = activo, 0 = inactivo
  intentos_fallidos TINYINT UNSIGNED NOT NULL DEFAULT 0,
  bloqueado         TINYINT(1)   NOT NULL DEFAULT 0, -- 1 = bloqueado tras 3 fallos
  ultimo_acceso     DATETIME     NULL,
  created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario),
  UNIQUE KEY uq_usuario_email (email),
  UNIQUE KEY uq_usuario_doc (tipo_doc, num_doc)
) ENGINE=InnoDB;

CREATE TABLE roles (
  id_rol TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(20) NOT NULL, -- 'CLIENTE', 'ENTRENADOR', 'ADMIN'
  PRIMARY KEY (id_rol),
  UNIQUE KEY uq_rol_nombre (nombre)
) ENGINE=InnoDB;

CREATE TABLE usuario_roles (
  id_usuario INT UNSIGNED NOT NULL,
  id_rol     TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (id_usuario, id_rol),
  CONSTRAINT fk_ur_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios (id_usuario) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_ur_rol FOREIGN KEY (id_rol)
    REFERENCES roles (id_rol) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE perfil_entrenador (
  id_entrenador   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario      INT UNSIGNED NOT NULL,
  especializacion VARCHAR(80) NULL,
  PRIMARY KEY (id_entrenador),
  UNIQUE KEY uq_entrenador_usuario (id_usuario),
  CONSTRAINT fk_entrenador_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios (id_usuario) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 2. SEDES
-- =====================================================================

CREATE TABLE sedes (
  id_sede    SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre     VARCHAR(50)  NOT NULL,
  localidad  VARCHAR(50)  NOT NULL, -- Ej: Suba, Chapinero, Engativá
  admin_id   INT UNSIGNED NOT NULL, -- Usuario con rol ADMIN a cargo
  direccion  VARCHAR(80)  NOT NULL,
  telefono   VARCHAR(15)  NOT NULL,
  estado     TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (id_sede),
  UNIQUE KEY uq_sede_nombre (nombre),
  UNIQUE KEY uq_sede_telefono (telefono),
  CONSTRAINT fk_sede_admin FOREIGN KEY (admin_id)
    REFERENCES usuarios (id_usuario) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =====================================================================
-- 3. CATÁLOGO DE CLASES, HORARIOS Y RESERVAS
-- =====================================================================

CREATE TABLE tipo_categorias (
  id_tipo_cat SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre      VARCHAR(50) NOT NULL,
  PRIMARY KEY (id_tipo_cat),
  UNIQUE KEY uq_nom_cat (nombre)
) ENGINE=InnoDB;

-- Catálogo general: se crea "Yoga" una sola vez con su descripción y categoría
CREATE TABLE clases (
  id_clase    SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre      VARCHAR(50)  NOT NULL,
  descripcion VARCHAR(200) NULL,
  id_tipo_cat SMALLINT UNSIGNED NOT NULL,
  estado      TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (id_clase),
  UNIQUE KEY uq_clase_nombre (nombre),
  CONSTRAINT fk_clase_categoria FOREIGN KEY (id_tipo_cat)
    REFERENCES tipo_categorias (id_tipo_cat) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Programación específica: asigna una clase del catálogo a una sede, horario y entrenador
CREATE TABLE horarios_clase (
  id_horario    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_clase      SMALLINT UNSIGNED NOT NULL,
  id_sede       SMALLINT UNSIGNED NOT NULL,
  id_entrenador INT UNSIGNED NOT NULL,
  fecha         DATE NOT NULL,
  hora_inicio   TIME NOT NULL,
  hora_fin      TIME NOT NULL,
  num_cupo      SMALLINT UNSIGNED NOT NULL,
  estado        ENUM('activa','cancelada','finalizada') NOT NULL DEFAULT 'activa',
  PRIMARY KEY (id_horario),
  CONSTRAINT chk_horario_cupo  CHECK (num_cupo > 0),
  CONSTRAINT chk_horario_horas CHECK (hora_fin > hora_inicio),
  CONSTRAINT fk_hc_clase FOREIGN KEY (id_clase)
    REFERENCES clases (id_clase) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_hc_sede FOREIGN KEY (id_sede)
    REFERENCES sedes (id_sede) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_hc_entrenador FOREIGN KEY (id_entrenador)
    REFERENCES perfil_entrenador (id_entrenador) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Inscripción de cualquier usuario a un horario programado
CREATE TABLE reservas_clases (
  id_usuario    INT UNSIGNED NOT NULL,
  id_horario    INT UNSIGNED NOT NULL,
  fecha_reserva TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado        ENUM('reservada','asistio','cancelada') NOT NULL DEFAULT 'reservada',
  PRIMARY KEY (id_usuario, id_horario),
  CONSTRAINT fk_rc_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios (id_usuario) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_rc_horario FOREIGN KEY (id_horario)
    REFERENCES horarios_clase (id_horario) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 4. MEMBRESÍAS
-- =====================================================================

CREATE TABLE membresias (
  id_membresia    SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre          VARCHAR(30) NOT NULL,
  limite_reservas SMALLINT UNSIGNED NOT NULL,
  descuento       DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  valor           DECIMAL(10,2) NOT NULL,
  categoria       VARCHAR(20) NULL,
  estado          TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id_membresia),
  UNIQUE KEY uq_nom_membresia (nombre),
  CONSTRAINT chk_memb_desc CHECK (descuento BETWEEN 0 AND 100)
) ENGINE=InnoDB;

CREATE TABLE membresias_usuario (
  id_membresia SMALLINT UNSIGNED NOT NULL,
  id_usuario   INT UNSIGNED NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin    DATE NOT NULL,
  estado       TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id_membresia, id_usuario, fecha_inicio),
  CONSTRAINT chk_mu_fecha CHECK (fecha_fin >= fecha_inicio),
  CONSTRAINT fk_mu_membresia FOREIGN KEY (id_membresia)
    REFERENCES membresias (id_membresia) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_mu_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios (id_usuario) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 5. AUDITORÍA Y VALIDACIÓN DE CUPOS (TRIGGERS)
-- =====================================================================

CREATE TABLE auditoria_usuarios (
  id_auditoria INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario   INT UNSIGNED NOT NULL,
  accion       VARCHAR(30)  NOT NULL,
  detalle      VARCHAR(255) NULL,
  fecha        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_auditoria),
  KEY idx_aud_usuario (id_usuario)
) ENGINE=InnoDB;

DELIMITER //

CREATE TRIGGER trg_usuario_ai
AFTER INSERT ON usuarios
FOR EACH ROW
BEGIN
  INSERT INTO auditoria_usuarios (id_usuario, accion, detalle)
  VALUES (NEW.id_usuario, 'REGISTRO', CONCAT('Usuario registrado: ', NEW.email));
END //

CREATE TRIGGER trg_usuario_au
AFTER UPDATE ON usuarios
FOR EACH ROW
BEGIN
  IF NEW.password <> OLD.password THEN
    INSERT INTO auditoria_usuarios (id_usuario, accion, detalle)
    VALUES (NEW.id_usuario, 'CAMBIO_PASSWORD', 'Contraseña actualizada');
  END IF;

  IF NEW.bloqueado = 1 AND OLD.bloqueado = 0 THEN
    INSERT INTO auditoria_usuarios (id_usuario, accion, detalle)
    VALUES (NEW.id_usuario, 'BLOQUEO', 'Cuenta bloqueada por intentos fallidos');
  END IF;

  IF NEW.bloqueado = 0 AND OLD.bloqueado = 1 THEN
    INSERT INTO auditoria_usuarios (id_usuario, accion, detalle)
    VALUES (NEW.id_usuario, 'DESBLOQUEO', 'Cuenta desbloqueada');
  END IF;
END //

CREATE TRIGGER trg_validar_cupo
BEFORE INSERT ON reservas_clases
FOR EACH ROW
BEGIN
  DECLARE v_cupo SMALLINT UNSIGNED;
  DECLARE v_ocupados INT;

  SELECT num_cupo INTO v_cupo
    FROM horarios_clase
   WHERE id_horario = NEW.id_horario;

  SELECT COUNT(*) INTO v_ocupados
    FROM reservas_clases
   WHERE id_horario = NEW.id_horario
     AND estado <> 'cancelada';

  IF v_ocupados >= v_cupo THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Este horario ya no tiene cupos disponibles';
  END IF;
END //

DELIMITER ;

-- =====================================================================
-- 6. DATOS INICIALES BASE
-- =====================================================================

INSERT INTO roles (nombre) VALUES
  ('CLIENTE'),
  ('ENTRENADOR'),
  ('ADMIN');

INSERT INTO tipo_categorias (nombre) VALUES
  ('Cardio'),
  ('Fuerza'),
  ('Yoga'),
  ('Funcional'),
  ('Baile');

INSERT INTO membresias (nombre, limite_reservas, descuento, valor, categoria) VALUES
  ('Basica',  4,  0.00,  60000.00, 'Mensual'),
  ('Plus',    12, 10.00, 90000.00, 'Mensual'),
  ('Premium', 30, 20.00, 130000.00,'Mensual');