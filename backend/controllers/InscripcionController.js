import InscripcionFacade from '../services/InscripcionFacade.js';
import SeccionRepository from '../repositories/SeccionRepository.js';
import InscripcionRepository from '../repositories/InscripcionRepository.js';
import { parsePositiveInteger } from '../utils/validators.js';

/**
 * PRINCIPIO SOLID: SRP (Single Responsibility Principle)
 *
 * Propósito: Este controlador se encarga ÚNICAMENTE de manejar las peticiones HTTP
 * relacionadas a las inscripciones (extraer parámetros del body/query y devolver respuestas JSON).
 * No contiene lógica de negocio, delega todo el trabajo duro a la Fachada (InscripcionFacade).
 */
class InscripcionController {
    /**
     * Endpoint para inscribir una asignatura.
     * POST /api/inscribir
     */
    async inscribir(req, res) {
        try {
            const estudianteId = req.user.id;
            const seccionId = parsePositiveInteger(req.body.seccionId, 'seccionId');

            const resultado = await InscripcionFacade.inscribir(estudianteId, seccionId);

            if (resultado.success) {
                return res.status(201).json(resultado);
            }

            const status = resultado.mensaje.includes('ya está') ? 409 : 403;
            return res.status(status).json(resultado);
        } catch (error) {
            if (error.message.includes('positivo')) {
                return res.status(400).json({ error: error.message });
            }

            console.error('Error en InscripcionController:', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    /**
     * Endpoint para consultar oferta de secciones por asignatura.
     * GET /api/secciones/:asignaturaId
     */
    async obtenerOferta(req, res) {
        try {
            const asignaturaId = parsePositiveInteger(req.params.asignaturaId, 'asignaturaId');
            const secciones = await SeccionRepository.getSeccionesByAsignatura(asignaturaId);
            return res.status(200).json(secciones);
        } catch (error) {
            if (error.message.includes('positivo')) {
                return res.status(400).json({ error: error.message });
            }

            console.error('Error al consultar la BD en obtenerOferta:', error);
            return res.status(500).json({ error: 'Error al obtener secciones' });
        }
    }

    /**
     * Endpoint para consultar TODA la oferta académica.
     * GET /api/secciones
     */
    async obtenerTodaOferta(req, res) {
        try {
            const secciones = await SeccionRepository.getAllSecciones();
            return res.status(200).json(secciones);
        } catch (error) {
            console.error('Error en obtenerTodaOferta:', error);
            return res.status(500).json({ error: 'Error al obtener toda la oferta' });
        }
    }

    /**
     * Endpoint para consultar el horario del estudiante.
     * GET /api/horario/:estudianteId
     */
    async obtenerHorario(req, res) {
        try {
            const estudianteId = parsePositiveInteger(req.params.estudianteId, 'estudianteId');

            if (req.user.rol === 'Estudiante' && Number(req.user.id) !== estudianteId) {
                return res.status(403).json({ error: 'Solo puedes consultar tu propio horario.' });
            }

            const inscripciones =
                await InscripcionRepository.getInscripcionesEstudiante(estudianteId);
            return res.status(200).json(inscripciones);
        } catch (error) {
            if (error.message.includes('positivo')) {
                return res.status(400).json({ error: error.message });
            }

            console.error('Error en obtenerHorario:', error);
            return res.status(500).json({ error: 'Error al obtener horario' });
        }
    }

    /**
     * Endpoint para retirar una asignatura.
     * DELETE /api/retirar/:inscripcionId
     */
    async retirar(req, res) {
        try {
            const inscripcionId = parsePositiveInteger(req.params.inscripcionId, 'inscripcionId');
            const estudianteId = req.user.id;

            const resultado = await InscripcionFacade.retirar(inscripcionId, estudianteId);

            if (resultado.success) {
                return res.status(200).json(resultado);
            }

            return res.status(400).json(resultado);
        } catch (error) {
            if (error.message.includes('positivo')) {
                return res.status(400).json({ error: error.message });
            }

            console.error('Error en retirar:', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
}

export default new InscripcionController();
