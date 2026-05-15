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
            ON CONFLICT (estudiante_id, seccion_id) 
            DO UPDATE SET estado = EXCLUDED.estado, fecha_inscripcion = CURRENT_TIMESTAMP
            RETURNING *;
        `;
        const result = await db.query(query, [estudianteId, seccionId, estado]);
        return result.rows[0];
    }

    async getInscripcionesEstudiante(estudianteId) {
        const query = `
            SELECT i.id as inscripcion_id, i.seccion_id, i.estado, s.horario, s.codigo_seccion, a.codigo as asig_codigo, a.nombre
            FROM inscripciones i
            JOIN secciones s ON i.seccion_id = s.id
            JOIN asignaturas a ON s.asignatura_id = a.id
            WHERE i.estudiante_id = $1 AND i.estado != 'Retirado'
        `;
        const result = await db.query(query, [estudianteId]);
        return result.rows;
    }

    async findById(inscripcionId) {
        const result = await db.query('SELECT * FROM inscripciones WHERE id = $1', [inscripcionId]);
        return result.rows[0];
    }

    async retirarInscripcion(inscripcionId) {
        const query = `
            UPDATE inscripciones 
            SET estado = 'Retirado' 
            WHERE id = $1
            RETURNING *;
        `;
        const result = await db.query(query, [inscripcionId]);
        return result.rows[0];
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
