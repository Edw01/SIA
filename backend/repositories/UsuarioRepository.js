import db from '../config/db.js';

/**
 * PRINCIPIO SOLID: SRP (Single Responsibility Principle)
 * 
 * Propósito: Esta clase tiene la ÚNICA responsabilidad de interactuar con la 
 * tabla 'usuarios' y 'historial_academico' en la base de datos.
 * 
 * Justificación: Separar las consultas SQL de la lógica de negocio (servicios)
 * hace que el código sea testeable y mantenible. Si la base de datos cambia, 
 * solo modificamos este archivo.
 */
class UsuarioRepository {
    
    async findById(usuarioId) {
        const result = await db.query('SELECT * FROM usuarios WHERE id = $1', [usuarioId]);
        return result.rows[0];
    }

    async findByRut(rut) {
        const result = await db.query('SELECT * FROM usuarios WHERE rut = $1', [rut]);
        return result.rows[0];
    }

    async getHistorialAcademico(estudianteId) {
        const query = `
            SELECT a.id, a.codigo, a.nombre, h.estado
            FROM historial_academico h
            JOIN asignaturas a ON h.asignatura_id = a.id
            WHERE h.estudiante_id = $1 AND h.estado = 'Aprobado'
        `;
        const result = await db.query(query, [estudianteId]);
        return result.rows;
    }

    async checkMorosidad(estudianteId) {
        const result = await db.query('SELECT moroso FROM usuarios WHERE id = $1', [estudianteId]);
        return result.rows[0]?.moroso || false;
    }
}

export default new UsuarioRepository();
