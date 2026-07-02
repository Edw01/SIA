import { Router } from 'express';
import AdminController from '../controllers/AdminController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = Router();

// Rutas exclusivas del Administrador
router.use(authenticateToken, authorizeRoles('Administrador'));
router.post('/asignaturas', AdminController.crearAsignatura);
router.post('/prerrequisitos', AdminController.configurarPrerrequisito);

export default router;
