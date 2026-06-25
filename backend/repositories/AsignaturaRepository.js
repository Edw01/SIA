import db from '../config/db.js';

/**
 * PRINCIPIO SOLID: SRP (Single Responsibility Principle)
 * 
 * Propósito: Gestionar el acceso a datos exclusivamente para la entidad Asignatura 
 * y sus Prerrequisitos (Malla Curricular).
 */
class AsignaturaRepository {
    
    async crearAsignatura(codigo, nombre, creditos) {
        const query = `
            INSERT INTO asignaturas (codigo, nombre, creditos)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const result = await db.query(query, [codigo, nombre, creditos]);
        return result.rows[0];
    }

    async comprobarDependenciaCiclica(asignaturaId, prerrequisitoId) {
        // En una implementación robusta se haría una búsqueda recursiva.
        // Aquí prevenimos la dependencia cíclica directa (A requiere B, y B requiere A).
        const query = `
            SELECT * FROM prerrequisitos 
            WHERE asignatura_id = $1 AND prerrequisito_id = $2
        `;
        // Verificamos al revés
        const result = await db.query(query, [prerrequisitoId, asignaturaId]);
        return result.rows.length > 0;
    }

    async agregarPrerrequisito(asignaturaId, prerrequisitoId) {
        const query = `
            INSERT INTO prerrequisitos (asignatura_id, prerrequisito_id)
            VALUES ($1, $2)
        `;
        await db.query(query, [asignaturaId, prerrequisitoId]);
    }
}

export default new AsignaturaRepository();
