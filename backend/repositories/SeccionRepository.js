import db from '../config/db.js';

/**
 * PRINCIPIO SOLID: SRP (Single Responsibility Principle)
 *
 * Propósito: Gestiona únicamente el acceso a datos relacionados con las
 * Secciones (horarios, cupos, aulas).
 */
class SeccionRepository {
    async findById(seccionId, executor = db) {
        const result = await executor.query('SELECT * FROM secciones WHERE id = $1', [seccionId]);
        return result.rows[0];
    }

    async findByIdForUpdate(seccionId, executor = db) {
        const result = await executor.query('SELECT * FROM secciones WHERE id = $1 FOR UPDATE', [seccionId]);
        return result.rows[0];
    }

    async getSeccionesByAsignatura(asignaturaId, executor = db) {
        const result = await executor.query('SELECT * FROM secciones WHERE asignatura_id = $1', [asignaturaId]);
        return result.rows;
    }

    async getAllSecciones(executor = db) {
        const query = `
            SELECT s.*, a.codigo as asig_codigo, a.nombre as asig_nombre
            FROM secciones s
            JOIN asignaturas a ON s.asignatura_id = a.id
        `;
        const result = await executor.query(query);
        return result.rows;
    }

    async getPrerrequisitos(asignaturaId, executor = db) {
        const query = `
            SELECT p.prerrequisito_id, a.codigo
            FROM prerrequisitos p
            JOIN asignaturas a ON p.prerrequisito_id = a.id
            WHERE p.asignatura_id = $1
        `;
        const result = await executor.query(query, [asignaturaId]);
        return result.rows;
    }

    async decrementarCupo(seccionId, executor = db) {
        const query = `
            UPDATE secciones
            SET cupos_disponibles = cupos_disponibles - 1
            WHERE id = $1 AND cupos_disponibles > 0
            RETURNING *;
        `;
        const result = await executor.query(query, [seccionId]);
        return result.rows[0];
    }

    async incrementarCupo(seccionId, executor = db) {
        const query = `
            UPDATE secciones
            SET cupos_disponibles = cupos_disponibles + 1
            WHERE id = $1 AND cupos_disponibles < cupos_maximos
            RETURNING *;
        `;
        const result = await executor.query(query, [seccionId]);
        return result.rows[0];
    }

    async crearSeccion(asignaturaId, codigoSeccion, cuposMaximos, horario, aula, executor = db) {
        const query = `
            INSERT INTO secciones (asignatura_id, codigo_seccion, cupos_maximos, cupos_disponibles, horario, aula)
            VALUES ($1, $2, $3, $3, $4, $5)
            RETURNING *;
        `;
        const result = await executor.query(query, [asignaturaId, codigoSeccion, cuposMaximos, horario, aula]);
        return result.rows[0];
    }
}

export default new SeccionRepository();
