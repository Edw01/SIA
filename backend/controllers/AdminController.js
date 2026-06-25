import AsignaturaRepository from '../repositories/AsignaturaRepository.js';

class AdminController {
    /**
     * Endpoint para registrar una nueva asignatura
     * POST /api/admin/asignaturas
     */
    async crearAsignatura(req, res) {
        try {
            const { codigo, nombre, creditos } = req.body;

            if (!codigo || !nombre || !creditos) {
                return res.status(400).json({ error: "Faltan parámetros para crear la asignatura." });
            }

            const nuevaAsignatura = await AsignaturaRepository.crearAsignatura(codigo, nombre, creditos);
            return res.status(201).json({ success: true, asignatura: nuevaAsignatura });

        } catch (error) {
            console.error("Error al crear asignatura:", error);
            if (error.code === '23505') {
                return res.status(409).json({ error: "Ya existe una asignatura con ese código." });
            }
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    /**
     * Endpoint para vincular un prerrequisito a una asignatura
     * POST /api/admin/prerrequisitos
     */
    async configurarPrerrequisito(req, res) {
        try {
            const { asignaturaId, prerrequisitoId } = req.body;

            if (!asignaturaId || !prerrequisitoId) {
                return res.status(400).json({ error: "Faltan IDs de asignatura y prerrequisito." });
            }

            // BR: Impedir dependencia cíclica
            const esCiclico = await AsignaturaRepository.comprobarDependenciaCiclica(asignaturaId, prerrequisitoId);
            if (esCiclico) {
                return res.status(400).json({ error: "Error: Dependencia cíclica detectada en la malla curricular." });
            }

            await AsignaturaRepository.agregarPrerrequisito(asignaturaId, prerrequisitoId);
            return res.status(201).json({ success: true, mensaje: "Prerrequisito configurado exitosamente." });

        } catch (error) {
            console.error("Error al agregar prerrequisito:", error);
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    }
}

export default new AdminController();
