import { Router } from 'express';
import AuthController from '../controllers/AuthController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

// Rutas de autenticación
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', authenticateToken, AuthController.logout);
router.get('/me', authenticateToken, AuthController.me);

export default router;
