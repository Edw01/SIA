import { Router } from 'express';
import InscripcionController from '../controllers/InscripcionController.js';

const router = Router();

// Rutas para la gestión de oferta e inscripciones
router.post('/inscribir', InscripcionController.inscribir);
router.get('/secciones', InscripcionController.obtenerTodaOferta);
router.get('/secciones/:asignaturaId', InscripcionController.obtenerOferta);
router.get('/horario/:estudianteId', InscripcionController.obtenerHorario);
router.delete('/retirar/:inscripcionId', InscripcionController.retirar);

export default router;
