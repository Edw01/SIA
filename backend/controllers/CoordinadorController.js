import SeccionRepository from '../repositories/SeccionRepository.js';

class CoordinadorController {
    /**
     * Endpoint para crear una sección nueva
     * POST /api/coordinador/secciones
     */
    async crearSeccion(req, res) {
        try {
            const { asignaturaId, codigoSeccion, cuposMaximos, horario, aula } = req.body;

            if (!asignaturaId || !codigoSeccion || !cuposMaximos || !horario) {
                return res.status(400).json({ error: "Faltan parámetros requeridos para crear la sección." });
            }

            // Aquí el coordinador crea la sección con sus cupos (Requisito Funcional del Coordinador)
            const nuevaSeccion = await SeccionRepository.crearSeccion(
                asignaturaId, 
                codigoSeccion, 
                cuposMaximos, 
                horario, 
                aula
            );

            return res.status(201).json({ success: true, mensaje: "Sección creada", seccion: nuevaSeccion });

        } catch (error) {
            console.error("Error al crear sección:", error);
            // El error 23505 en PostgreSQL es "unique_violation" (Ya existe esa sección)
            if (error.code === '23505') {
                return res.status(409).json({ error: "Ya existe una sección con ese código para esta asignatura." });
            }
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    }
}

export default new CoordinadorController();
