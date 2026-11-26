CREATE DATABASE IF NOT EXISTS db_jimmyalpala
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE db_jimmyalpala;

CREATE TABLE IF NOT EXISTS usuarios (
    identificacion VARCHAR(20) NOT NULL,
    nombre VARCHAR(80) NOT NULL,
    apellido VARCHAR(80) NOT NULL,
    email VARCHAR(120) NOT NULL,
    cargo ENUM('Doctor', 'Especialista', 'Administrativo') NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    nombre_usuario VARCHAR(50) NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    estado ENUM('Activado', 'Desactivado') NOT NULL DEFAULT 'Activado',
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_usuarios PRIMARY KEY (identificacion),
    CONSTRAINT uq_usuarios_email UNIQUE (email),
    CONSTRAINT uq_usuarios_nombre_usuario UNIQUE (nombre_usuario)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO usuarios (
    identificacion,
    nombre,
    apellido,
    email,
    cargo,
    telefono,
    nombre_usuario,
    contrasena,
    estado
) VALUES
    (
        '9900000001',
        'Doctor',
        'Demo',
        'doctor.demo@hospital.local',
        'Doctor',
        '0000000001',
        'doctor_demo',
        SHA2('DemoDoctor#2026', 256),
        'Activado'
    ),
    (
        '9900000002',
        'Especialista',
        'Demo',
        'especialista.demo@hospital.local',
        'Especialista',
        '0000000002',
        'especialista_demo',
        SHA2('DemoEspecialista#2026', 256),
        'Activado'
    ),
    (
        '9900000003',
        'Administrativo',
        'Demo',
        'administrativo.demo@hospital.local',
        'Administrativo',
        '0000000003',
        'administrativo_demo',
        SHA2('DemoAdmin#2026', 256),
        'Activado'
    ),
    (
        '9900000004',
        'Inactivo',
        'Demo',
        'inactivo.demo@hospital.local',
        'Doctor',
        '0000000004',
        'inactivo_demo',
        SHA2('DemoInactivo#2026', 256),
        'Desactivado'
    );
