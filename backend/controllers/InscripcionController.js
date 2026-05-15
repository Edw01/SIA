import InscripcionFacade from '../services/InscripcionFacade.js';
import SeccionRepository from '../repositories/SeccionRepository.js';

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
}

export default new InscripcionController();
