-- schema.sql
-- Script de inicialización para la base de datos PostgreSQL del SIA

-- Tabla de Usuarios (Administradores, Coordinadores, Estudiantes)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    rut VARCHAR(12) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('Estudiante', 'Coordinador', 'Administrador')),
    -- Para simular el estado financiero (A5)
    moroso BOOLEAN DEFAULT FALSE,
    -- Prioridad de inscripción
    prioridad INT DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Asignaturas (Catálogo)
CREATE TABLE asignaturas (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    creditos INT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Prerrequisitos
-- Ejemplo: Para tomar asignatura_id, debes haber aprobado prerrequisito_id
CREATE TABLE prerrequisitos (
    asignatura_id INT REFERENCES asignaturas(id) ON DELETE CASCADE,
    prerrequisito_id INT REFERENCES asignaturas(id) ON DELETE CASCADE,
    PRIMARY KEY (asignatura_id, prerrequisito_id)
);

-- Historial Académico (Simula A6)
-- Asignaturas que el estudiante ya aprobó
CREATE TABLE historial_academico (
    estudiante_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
    asignatura_id INT REFERENCES asignaturas(id) ON DELETE CASCADE,
    estado VARCHAR(20) DEFAULT 'Aprobado',
    PRIMARY KEY (estudiante_id, asignatura_id)
);

-- Tabla de Secciones (Programación del Semestre)
CREATE TABLE secciones (
    id SERIAL PRIMARY KEY,
    asignatura_id INT REFERENCES asignaturas(id) ON DELETE CASCADE,
    codigo_seccion VARCHAR(10) NOT NULL,
    cupos_maximos INT NOT NULL,
    cupos_disponibles INT NOT NULL,
    -- Representación simplificada del horario (ej: 'LU 08:30-10:00, MI 08:30-10:00')
    horario VARCHAR(255) NOT NULL,
    aula VARCHAR(50),
    UNIQUE (asignatura_id, codigo_seccion)
);

-- Tabla de Inscripciones (Carga Académica)
CREATE TABLE inscripciones (
    id SERIAL PRIMARY KEY,
    estudiante_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
    seccion_id INT REFERENCES secciones(id) ON DELETE CASCADE,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('Inscrito', 'Lista_Espera', 'Retirado')),
    fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (estudiante_id, seccion_id)
);

-- Tabla de Log de Acciones (Trazabilidad estricta según NFR-10)
CREATE TABLE bitacora (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id),
    accion VARCHAR(100) NOT NULL,
    detalle TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
