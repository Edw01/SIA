import InscripcionFacade from '../services/InscripcionFacade.js';
import SeccionRepository from '../repositories/SeccionRepository.js';
import InscripcionRepository from '../repositories/InscripcionRepository.js';

/**
 * PRINCIPIO SOLID: SRP (Single Responsibility Principle)
 * 
 * Propósito: Este controlador se encarga ÚNICAMENTE de manejar las peticiones HTTP
 * relacionadas a las inscripciones (extraer parámetros del body/query y devolver respuestas JSON).
 * No contiene lógica de negocio, delega todo el trabajo duro a la Fachada (InscripcionFacade).
 */
class InscripcionController {
    
    /**
     * Endpoint para inscribir una asignatura
     * POST /api/inscripciones
     */
    async inscribir(req, res) {
        try {
            const { estudianteId, seccionId } = req.body;
            
            if (!estudianteId || !seccionId) {
                return res.status(400).json({ error: "Faltan parámetros: estudianteId o seccionId" });
            }

            // Llamada directa a la Fachada, ocultando la complejidad del proceso
            const resultado = await InscripcionFacade.inscribir(estudianteId, seccionId);

            if (resultado.success) {
                return res.status(201).json(resultado);
            } else {
                // BR: Las fallas de negocio (prerrequisitos, morosidad) devuelven un 403 Forbidden o 400
                return res.status(403).json(resultado);
            }

        } catch (error) {
            console.error("Error en InscripcionController:", error);
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    /**
     * Endpoint para consultar oferta de secciones por asignatura
     * GET /api/secciones/:asignaturaId
     */
    async obtenerOferta(req, res) {
        try {
            const { asignaturaId } = req.params;
            const secciones = await SeccionRepository.getSeccionesByAsignatura(asignaturaId);
            return res.status(200).json(secciones);
        } catch (error) {
            console.error("Error al consultar la BD en obtenerOferta:", error);
            return res.status(500).json({ error: "Error al obtener secciones" });
        }
    }

    /**
     * Endpoint para consultar TODA la oferta académica
     * GET /api/secciones
     */
    async obtenerTodaOferta(req, res) {
        try {
            const secciones = await SeccionRepository.getAllSecciones();
            return res.status(200).json(secciones);
        } catch (error) {
            console.error("Error en obtenerTodaOferta:", error);
            return res.status(500).json({ error: "Error al obtener toda la oferta" });
        }
    }

    /**
     * Endpoint para consultar el horario (ramos inscritos) del estudiante
     * GET /api/inscripciones/:estudianteId
     */
    async obtenerHorario(req, res) {
        try {
            const { estudianteId } = req.params;
            const inscripciones = await InscripcionRepository.getInscripcionesEstudiante(estudianteId);
            return res.status(200).json(inscripciones);
        } catch (error) {
            console.error("Error en obtenerHorario:", error);
            return res.status(500).json({ error: "Error al obtener horario" });
        }
    }

    /**
     * Endpoint para retirar una asignatura
     * DELETE /api/inscripciones/:inscripcionId
     */
    async retirar(req, res) {
        try {
            const { inscripcionId } = req.params;
            const { estudianteId } = req.body; // Se envía por body para validar que es el mismo estudiante
            
            if (!estudianteId) return res.status(400).json({ error: "Falta estudianteId" });

            const resultado = await InscripcionFacade.retirar(inscripcionId, estudianteId);
            
            if (resultado.success) {
                return res.status(200).json(resultado);
            } else {
                return res.status(400).json(resultado);
            }
        } catch (error) {
            console.error("Error en retirar:", error);
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    }
}

export default new InscripcionController();
