import { Router } from 'express';
import CoordinadorController from '../controllers/CoordinadorController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = Router();

// Rutas exclusivas del Coordinador
router.use(authenticateToken, authorizeRoles('Coordinador'));
router.post('/secciones', CoordinadorController.crearSeccion);

export default router;
