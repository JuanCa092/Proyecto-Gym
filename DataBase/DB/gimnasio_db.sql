-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 26-11-2026 a las 22:00:51
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `gimnasio_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auditoria_usuarios`
--

CREATE TABLE `auditoria_usuarios` (
  `id_auditoria` int(10) UNSIGNED NOT NULL,
  `id_usuario` int(10) UNSIGNED NOT NULL,
  `accion` varchar(30) NOT NULL,
  `detalle` varchar(255) DEFAULT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clases`
--

CREATE TABLE `clases` (
  `id_clase` smallint(5) UNSIGNED NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `descripcion` varchar(200) DEFAULT NULL,
  `id_tipo_cat` smallint(5) UNSIGNED NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `horarios_clase`
--

CREATE TABLE `horarios_clase` (
  `id_horario` int(10) UNSIGNED NOT NULL,
  `id_clase` smallint(5) UNSIGNED NOT NULL,
  `id_sede` smallint(5) UNSIGNED NOT NULL,
  `id_entrenador` int(10) UNSIGNED NOT NULL,
  `fecha` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `num_cupo` smallint(5) UNSIGNED NOT NULL,
  `estado` enum('activa','cancelada','finalizada') NOT NULL DEFAULT 'activa'
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `membresias`
--

CREATE TABLE `membresias` (
  `id_membresia` smallint(5) UNSIGNED NOT NULL,
  `nombre` varchar(30) NOT NULL,
  `limite_reservas` smallint(5) UNSIGNED NOT NULL,
  `descuento` decimal(5,2) NOT NULL DEFAULT 0.00,
  `valor` decimal(10,2) NOT NULL,
  `categoria` varchar(20) DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `membresias_usuario`
--

CREATE TABLE `membresias_usuario` (
  `id_membresia` smallint(5) UNSIGNED NOT NULL,
  `id_usuario` int(10) UNSIGNED NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `perfil_entrenador`
--

CREATE TABLE `perfil_entrenador` (
  `id_entrenador` int(10) UNSIGNED NOT NULL,
  `id_usuario` int(10) UNSIGNED NOT NULL,
  `especializacion` varchar(80) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reservas_clases`
--

CREATE TABLE `reservas_clases` (
  `id_usuario` int(10) UNSIGNED NOT NULL,
  `id_horario` int(10) UNSIGNED NOT NULL,
  `fecha_reserva` timestamp NOT NULL DEFAULT current_timestamp(),
  `estado` enum('reservada','asistio','cancelada') NOT NULL DEFAULT 'reservada'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Disparadores `reservas_clases`
--
DELIMITER $$
CREATE TRIGGER `trg_validar_cupo` BEFORE INSERT ON `reservas_clases` FOR EACH ROW BEGIN
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
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id_rol` tinyint(3) UNSIGNED NOT NULL,
  `nombre` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sedes`
--

CREATE TABLE `sedes` (
  `id_sede` smallint(5) UNSIGNED NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `localidad` varchar(50) NOT NULL,
  `admin_id` int(10) UNSIGNED NOT NULL,
  `direccion` varchar(80) NOT NULL,
  `telefono` varchar(15) NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_categorias`
--

CREATE TABLE `tipo_categorias` (
  `id_tipo_cat` smallint(5) UNSIGNED NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(10) UNSIGNED NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `tipo_doc` enum('CC','CE','TI','PAS','NIT') NOT NULL DEFAULT 'CC',
  `num_doc` varchar(20) NOT NULL,
  `email` varchar(100) NOT NULL,
  `telefono` varchar(15) NOT NULL,
  `password` varchar(255) NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1,
  `intentos_fallidos` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `bloqueado` tinyint(1) NOT NULL DEFAULT 0,
  `ultimo_acceso` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Disparadores `usuarios`
--
DELIMITER $$
CREATE TRIGGER `trg_usuario_ai` AFTER INSERT ON `usuarios` FOR EACH ROW BEGIN
  INSERT INTO auditoria_usuarios (id_usuario, accion, detalle)
  VALUES (NEW.id_usuario, 'REGISTRO', CONCAT('Usuario registrado: ', NEW.email));
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_usuario_au` AFTER UPDATE ON `usuarios` FOR EACH ROW BEGIN
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
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario_roles`
--

CREATE TABLE `usuario_roles` (
  `id_usuario` int(10) UNSIGNED NOT NULL,
  `id_rol` tinyint(3) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `auditoria_usuarios`
--
ALTER TABLE `auditoria_usuarios`
  ADD PRIMARY KEY (`id_auditoria`),
  ADD KEY `idx_aud_usuario` (`id_usuario`);

--
-- Indices de la tabla `clases`
--
ALTER TABLE `clases`
  ADD PRIMARY KEY (`id_clase`),
  ADD UNIQUE KEY `uq_clase_nombre` (`nombre`),
  ADD KEY `fk_clase_categoria` (`id_tipo_cat`);

--
-- Indices de la tabla `horarios_clase`
--
ALTER TABLE `horarios_clase`
  ADD PRIMARY KEY (`id_horario`),
  ADD KEY `fk_hc_clase` (`id_clase`),
  ADD KEY `fk_hc_sede` (`id_sede`),
  ADD KEY `fk_hc_entrenador` (`id_entrenador`);

--
-- Indices de la tabla `membresias`
--
ALTER TABLE `membresias`
  ADD PRIMARY KEY (`id_membresia`),
  ADD UNIQUE KEY `uq_nom_membresia` (`nombre`);

--
-- Indices de la tabla `membresias_usuario`
--
ALTER TABLE `membresias_usuario`
  ADD PRIMARY KEY (`id_membresia`,`id_usuario`,`fecha_inicio`),
  ADD KEY `fk_mu_usuario` (`id_usuario`);

--
-- Indices de la tabla `perfil_entrenador`
--
ALTER TABLE `perfil_entrenador`
  ADD PRIMARY KEY (`id_entrenador`),
  ADD UNIQUE KEY `uq_entrenador_usuario` (`id_usuario`);

--
-- Indices de la tabla `reservas_clases`
--
ALTER TABLE `reservas_clases`
  ADD PRIMARY KEY (`id_usuario`,`id_horario`),
  ADD KEY `fk_rc_horario` (`id_horario`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id_rol`),
  ADD UNIQUE KEY `uq_rol_nombre` (`nombre`);

--
-- Indices de la tabla `sedes`
--
ALTER TABLE `sedes`
  ADD PRIMARY KEY (`id_sede`),
  ADD UNIQUE KEY `uq_sede_nombre` (`nombre`),
  ADD UNIQUE KEY `uq_sede_telefono` (`telefono`),
  ADD KEY `fk_sede_admin` (`admin_id`);

--
-- Indices de la tabla `tipo_categorias`
--
ALTER TABLE `tipo_categorias`
  ADD PRIMARY KEY (`id_tipo_cat`),
  ADD UNIQUE KEY `uq_nom_cat` (`nombre`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `uq_usuario_email` (`email`),
  ADD UNIQUE KEY `uq_usuario_doc` (`tipo_doc`,`num_doc`);

--
-- Indices de la tabla `usuario_roles`
--
ALTER TABLE `usuario_roles`
  ADD PRIMARY KEY (`id_usuario`,`id_rol`),
  ADD KEY `fk_ur_rol` (`id_rol`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `auditoria_usuarios`
--
ALTER TABLE `auditoria_usuarios`
  MODIFY `id_auditoria` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `clases`
--
ALTER TABLE `clases`
  MODIFY `id_clase` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `horarios_clase`
--
ALTER TABLE `horarios_clase`
  MODIFY `id_horario` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `membresias`
--
ALTER TABLE `membresias`
  MODIFY `id_membresia` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `perfil_entrenador`
--
ALTER TABLE `perfil_entrenador`
  MODIFY `id_entrenador` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id_rol` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `sedes`
--
ALTER TABLE `sedes`
  MODIFY `id_sede` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tipo_categorias`
--
ALTER TABLE `tipo_categorias`
  MODIFY `id_tipo_cat` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `clases`
--
ALTER TABLE `clases`
  ADD CONSTRAINT `fk_clase_categoria` FOREIGN KEY (`id_tipo_cat`) REFERENCES `tipo_categorias` (`id_tipo_cat`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `horarios_clase`
--
ALTER TABLE `horarios_clase`
  ADD CONSTRAINT `fk_hc_clase` FOREIGN KEY (`id_clase`) REFERENCES `clases` (`id_clase`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_hc_entrenador` FOREIGN KEY (`id_entrenador`) REFERENCES `perfil_entrenador` (`id_entrenador`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_hc_sede` FOREIGN KEY (`id_sede`) REFERENCES `sedes` (`id_sede`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `membresias_usuario`
--
ALTER TABLE `membresias_usuario`
  ADD CONSTRAINT `fk_mu_membresia` FOREIGN KEY (`id_membresia`) REFERENCES `membresias` (`id_membresia`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_mu_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `perfil_entrenador`
--
ALTER TABLE `perfil_entrenador`
  ADD CONSTRAINT `fk_entrenador_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `reservas_clases`
--
ALTER TABLE `reservas_clases`
  ADD CONSTRAINT `fk_rc_horario` FOREIGN KEY (`id_horario`) REFERENCES `horarios_clase` (`id_horario`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_rc_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `sedes`
--
ALTER TABLE `sedes`
  ADD CONSTRAINT `fk_sede_admin` FOREIGN KEY (`admin_id`) REFERENCES `usuarios` (`id_usuario`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `usuario_roles`
--
ALTER TABLE `usuario_roles`
  ADD CONSTRAINT `fk_ur_rol` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ur_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
