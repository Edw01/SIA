import db from '../config/db.js';

/**
 * PRINCIPIO SOLID: SRP (Single Responsibility Principle)
 * 
 * Propósito: Gestiona únicamente el acceso a datos relacionados con las 
 * Secciones (horarios, cupos, aulas).
 */
class SeccionRepository {
    
    async findById(seccionId) {
        const result = await db.query('SELECT * FROM secciones WHERE id = $1', [seccionId]);
        return result.rows[0];
    }

    async getSeccionesByAsignatura(asignaturaId) {
        const result = await db.query('SELECT * FROM secciones WHERE asignatura_id = $1', [asignaturaId]);
        return result.rows;
    }

    async getPrerrequisitos(asignaturaId) {
        const query = `
            SELECT p.prerrequisito_id, a.codigo 
            FROM prerrequisitos p
            JOIN asignaturas a ON p.prerrequisito_id = a.id
            WHERE p.asignatura_id = $1
        `;
        const result = await db.query(query, [asignaturaId]);
        return result.rows;
    }

    // Actualiza cupos de forma segura usando Row-level locking o simplemente la cláusula UPDATE
    async decrementarCupo(seccionId) {
        const query = `
            UPDATE secciones 
            SET cupos_disponibles = cupos_disponibles - 1 
            WHERE id = $1 AND cupos_disponibles > 0
            RETURNING *;
        `;
        const result = await db.query(query, [seccionId]);
        return result.rows[0];
    }
}

export default new SeccionRepository();
