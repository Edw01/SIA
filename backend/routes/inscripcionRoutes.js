import { Router } from 'express';
import InscripcionController from '../controllers/InscripcionController.js';

const router = Router();

// Rutas para la gestión de oferta e inscripciones
router.post('/inscribir', InscripcionController.inscribir);
router.get('/secciones/:asignaturaId', InscripcionController.obtenerOferta);

export default router;
