import { Router } from 'express';
import CoordinadorController from '../controllers/CoordinadorController.js';

const router = Router();

// Rutas exclusivas del Coordinador
router.post('/secciones', CoordinadorController.crearSeccion);

export default router;
