import { Router } from 'express';
import AdminController from '../controllers/AdminController.js';

const router = Router();

// Rutas exclusivas del Administrador
router.post('/asignaturas', AdminController.crearAsignatura);
router.post('/prerrequisitos', AdminController.configurarPrerrequisito);

export default router;
