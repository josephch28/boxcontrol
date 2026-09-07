-- =============================================================
-- BoxControl — Base de Datos Relacional MySQL
-- Materia: Aplicaciones Web y Móviles (6to Semestre)
-- Grupo 4: Chachalo Joseph, Jiron Jonathan, Paredes Robert
-- =============================================================

CREATE DATABASE IF NOT EXISTS `boxcontrol_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `boxcontrol_db`;

-- 1. Tabla de Roles
CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(50) NOT NULL UNIQUE,
  `descripcion` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Tabla de Sucursales (RF-W10)
CREATE TABLE IF NOT EXISTS `sucursales` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `direccion` VARCHAR(255) NOT NULL,
  `telefono` VARCHAR(20) NOT NULL,
  `email` VARCHAR(100) NULL,
  `estado` ENUM('ACTIVA', 'INACTIVA') DEFAULT 'ACTIVA',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Tabla de Usuarios (RF-W01)
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `apellido` VARCHAR(100) NOT NULL,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `telefono` VARCHAR(20) NULL,
  `rol_id` INT NOT NULL,
  `sucursal_id` INT NULL,
  `estado` ENUM('ACTIVO', 'INACTIVO') DEFAULT 'ACTIVO',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`rol_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 4. Tabla de Clientes (RF-W02, RF-M01, RF-M02)
CREATE TABLE IF NOT EXISTS `clientes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT NOT NULL UNIQUE,
  `cedula` VARCHAR(20) NOT NULL UNIQUE,
  `fecha_nacimiento` DATE NULL,
  `genero` ENUM('M', 'F', 'OTRO') NULL,
  `codigo_qr` VARCHAR(255) NOT NULL UNIQUE,
  `sucursal_origen_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`sucursal_origen_id`) REFERENCES `sucursales`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 5. Tabla de Tipos de Membresía (RF-W03)
CREATE TABLE IF NOT EXISTS `tipos_membresia` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `descripcion` TEXT NULL,
  `precio` DECIMAL(10, 2) NOT NULL,
  `duracion_dias` INT NOT NULL,
  `estado` ENUM('ACTIVA', 'INACTIVA') DEFAULT 'ACTIVA',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 6. Tabla de Membresías Asignadas (RF-W04, RF-M04)
CREATE TABLE IF NOT EXISTS `membresias` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `cliente_id` INT NOT NULL,
  `tipo_membresia_id` INT NOT NULL,
  `sucursal_id` INT NOT NULL,
  `fecha_inicio` DATE NOT NULL,
  `fecha_fin` DATE NOT NULL,
  `estado` ENUM('ACTIVA', 'VENCIDA', 'CANCELADA') DEFAULT 'ACTIVA',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`tipo_membresia_id`) REFERENCES `tipos_membresia`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 7. Tabla de Pagos / Cobros (RF-W05, RF-W11, RF-M08)
CREATE TABLE IF NOT EXISTS `pagos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `membresia_id` INT NOT NULL,
  `cliente_id` INT NOT NULL,
  `monto` DECIMAL(10, 2) NOT NULL,
  `metodo_pago` ENUM('EFECTIVO', 'TRANSFERENCIA', 'TARJETA') DEFAULT 'EFECTIVO',
  `referencia` VARCHAR(100) NULL,
  `sucursal_id` INT NOT NULL,
  `registrado_por` INT NOT NULL,
  `fecha_pago` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`membresia_id`) REFERENCES `membresias`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`registrado_por`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 8. Tabla de Asistencias (RF-M03, RF-M06)
CREATE TABLE IF NOT EXISTS `asistencias` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `cliente_id` INT NOT NULL,
  `sucursal_id` INT NOT NULL,
  `fecha_hora` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `metodo` ENUM('QR_SCAN', 'MANUAL') DEFAULT 'QR_SCAN',
  FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 9. Tabla de Contenido Asistido por IA (RF-W12, RF-M07)
CREATE TABLE IF NOT EXISTS `contenidos_ia` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tipo` ENUM('RUTINA', 'ALIMENTACION') NOT NULL,
  `titulo` VARCHAR(150) NOT NULL,
  `descripcion` TEXT NOT NULL,
  `nivel` ENUM('PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO') DEFAULT 'PRINCIPIANTE',
  `estado` ENUM('BORRADOR', 'PUBLICADO') DEFAULT 'BORRADOR',
  `creado_por` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`creado_por`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =============================================================
-- SEEDERS INICIALES (DATOS DE PRUEBA Y ARRANQUE)
-- =============================================================

-- Insertar Roles
INSERT INTO `roles` (`id`, `nombre`, `descripcion`) VALUES
(1, 'ADMINISTRADOR', 'Control total del sistema en todas las sucursales'),
(2, 'RECEPCIONISTA', 'Control operativo de sucursal (clientes, pagos y asistencias)'),
(3, 'CLIENTE', 'Acceso a la app móvil, carnet QR y rutinas')
ON DUPLICATE KEY UPDATE `nombre`=`nombre`;

-- Insertar Sucursales (RF-W10)
INSERT INTO `sucursales` (`id`, `nombre`, `direccion`, `telefono`, `email`, `estado`) VALUES
(1, 'Sucursal Norte - Gym Central', 'Av. Amazonas y Naciones Unidas, Edif. Boxing Norte', '0991234567', 'norte@boxcontrol.com', 'ACTIVA'),
(2, 'Sucursal Sur - Boxing Club', 'Av. Maldonado y Moraspungo, CC El Recreo local 45', '0987654321', 'sur@boxcontrol.com', 'ACTIVA')
ON DUPLICATE KEY UPDATE `nombre`=`nombre`;

-- Insertar Tipos de Membresía de Muestra (RF-W03)
INSERT INTO `tipos_membresia` (`id`, `nombre`, `descripcion`, `precio`, `duracion_dias`, `estado`) VALUES
(1, 'Plan Mensual Boxeo Full', 'Acceso ilimitado a entrenamientos de boxeo de lunes a sábado.', 45.00, 30, 'ACTIVA'),
(2, 'Plan Trimestral Boxeo Pro', 'Acceso por 3 meses con descuento y asesoría personalizada.', 120.00, 90, 'ACTIVA'),
(3, 'Pase de Clases Sueltas (10 Clases)', 'Bono de 10 clases canjeables en 45 días en cualquier sucursal.', 35.00, 45, 'ACTIVA')
ON DUPLICATE KEY UPDATE `nombre`=`nombre`;

-- Insertar Usuarios Administrativos Iniciales (Password hasheado con bcrypt para: 'Admin123*')
-- Hash bcrypt para 'Admin123*': $2a$10$tZ2oP6uI2bQ46eU9Q77YlOfqPqjS661H3lO6wQxNmvxG14k6r6gOq (generaremos uno verificado en node)
