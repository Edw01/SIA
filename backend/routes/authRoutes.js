import { Router } from 'express';
import AuthController from '../controllers/AuthController.js';

const router = Router();

// Rutas de autenticación
router.post('/login', AuthController.login);

export default router;
