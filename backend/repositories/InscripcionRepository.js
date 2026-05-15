import db from '../config/db.js';

/**
 * PRINCIPIO SOLID: SRP (Single Responsibility Principle)
 * 
 * Propósito: Aislar la persistencia de las inscripciones y la bitácora de auditoría.
 */
class InscripcionRepository {

    async crearInscripcion(estudianteId, seccionId, estado) {
        const query = `
            INSERT INTO inscripciones (estudiante_id, seccion_id, estado)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const result = await db.query(query, [estudianteId, seccionId, estado]);
        return result.rows[0];
    }

    async getInscripcionesEstudiante(estudianteId) {
        const query = `
            SELECT i.id as inscripcion_id, i.estado, s.horario, s.codigo_seccion, a.codigo as asig_codigo, a.nombre
            FROM inscripciones i
            JOIN secciones s ON i.seccion_id = s.id
            JOIN asignaturas a ON s.asignatura_id = a.id
            WHERE i.estudiante_id = $1 AND i.estado != 'Retirado'
        `;
        const result = await db.query(query, [estudianteId]);
        return result.rows;
    }

    async registrarBitacora(usuarioId, accion, detalle) {
        const query = `
            INSERT INTO bitacora (usuario_id, accion, detalle)
            VALUES ($1, $2, $3)
        `;
        await db.query(query, [usuarioId, accion, detalle]);
    }
}

export default new InscripcionRepository();
