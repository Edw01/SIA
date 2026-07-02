import { Router } from 'express';
import InscripcionController from '../controllers/InscripcionController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = Router();

// Rutas públicas de consulta de oferta
router.get('/secciones', InscripcionController.obtenerTodaOferta);
router.get('/secciones/:asignaturaId', InscripcionController.obtenerOferta);

// Rutas protegidas del estudiante
router.post(
    '/inscribir',
    authenticateToken,
    authorizeRoles('Estudiante'),
    InscripcionController.inscribir
);
router.delete(
    '/retirar/:inscripcionId',
    authenticateToken,
    authorizeRoles('Estudiante'),
    InscripcionController.retirar
);

// Consulta de horario: el estudiante solo puede ver el suyo; roles superiores pueden consultar.
router.get(
    '/horario/:estudianteId',
    authenticateToken,
    authorizeRoles('Estudiante', 'Coordinador', 'Administrador'),
    InscripcionController.obtenerHorario
);

export default router;
