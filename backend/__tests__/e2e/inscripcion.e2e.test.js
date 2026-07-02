import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// 1. Mockeamos la fachada y repositorios
jest.unstable_mockModule('../../services/InscripcionFacade.js', () => ({
    default: {
        inscribir: jest.fn(),
        retirar: jest.fn()
    }
}));
jest.unstable_mockModule('../../repositories/SeccionRepository.js', () => ({
    default: { getSeccionesByAsignatura: jest.fn(), getAllSecciones: jest.fn() }
}));
jest.unstable_mockModule('../../repositories/InscripcionRepository.js', () => ({
    default: { getInscripcionesEstudiante: jest.fn() }
}));

// Mockeamos el middleware de auth para evitar validar firmas reales
jest.unstable_mockModule('../../middlewares/authMiddleware.js', () => ({
    authenticateToken: (req, res, next) => {
        req.user = { id: 1, rol: 'Estudiante' };
        next();
    }
}));

const InscripcionFacade = (await import('../../services/InscripcionFacade.js')).default;
const SeccionRepository = (await import('../../repositories/SeccionRepository.js')).default;
const InscripcionRepository = (await import('../../repositories/InscripcionRepository.js')).default;
const inscripcionRoutes = (await import('../../routes/inscripcionRoutes.js')).default;

// 3. App de prueba
const app = express();
app.use(express.json());
app.use('/api', inscripcionRoutes);

describe('API E2E: InscripcionController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/inscribir', () => {
        it('debería retornar 201 si la inscripción fue exitosa', async () => {
            InscripcionFacade.inscribir.mockResolvedValue({ success: true, estado: 'Inscrito' });

            const res = await request(app)
                .post('/api/inscribir')
                .send({ seccionId: 10 });

            expect(res.status).toBe(201);
            expect(res.body.estado).toBe('Inscrito');
        });

        it('debería retornar 409 si el estudiante ya está inscrito', async () => {
            InscripcionFacade.inscribir.mockResolvedValue({ success: false, mensaje: 'El estudiante ya está inscrito o en lista de espera para esta sección.' });

            const res = await request(app)
                .post('/api/inscribir')
                .send({ seccionId: 10 });

            expect(res.status).toBe(409);
        });

        it('debería retornar 400 si falta el seccionId o es negativo', async () => {
            const res = await request(app)
                .post('/api/inscribir')
                .send({ seccionId: -5 });

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('seccionId debe ser un número entero positivo');
        });
    });

    describe('GET /api/secciones/:asignaturaId', () => {
        it('debería retornar 200 y las secciones', async () => {
            SeccionRepository.getSeccionesByAsignatura.mockResolvedValue([{ id: 1 }]);

            const res = await request(app).get('/api/secciones/100');
            
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(1);
        });
    });

    describe('GET /api/secciones', () => {
        it('debería retornar 200 y toda la oferta', async () => {
            SeccionRepository.getAllSecciones.mockResolvedValue([{ id: 1 }, { id: 2 }]);

            const res = await request(app).get('/api/secciones');
            
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
        });
    });

    describe('GET /api/horario/:estudianteId', () => {
        it('debería retornar 200 y el horario del alumno', async () => {
            InscripcionRepository.getInscripcionesEstudiante.mockResolvedValue([{ id: 1, horario: 'LU' }]);

            const res = await request(app).get('/api/horario/1'); // Mismo ID que req.user.id
            
            expect(res.status).toBe(200);
            expect(res.body[0].horario).toBe('LU');
        });

        it('debería retornar 403 si un estudiante pide el horario de OTRO estudiante', async () => {
            const res = await request(app).get('/api/horario/999'); // Pide el horario del alumno 999 pero él es el 1
            
            expect(res.status).toBe(403);
            expect(res.body.error).toBe('Solo puedes consultar tu propio horario.');
        });
    });

    describe('DELETE /api/retirar/:inscripcionId', () => {
        it('debería retornar 200 si el retiro fue exitoso', async () => {
            InscripcionFacade.retirar.mockResolvedValue({ success: true, mensaje: 'Retirado' });

            const res = await request(app).delete('/api/retirar/100');
            
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('debería retornar 400 si el retiro falló', async () => {
            InscripcionFacade.retirar.mockResolvedValue({ success: false, mensaje: 'Error retiro' });

            const res = await request(app).delete('/api/retirar/100');
            
            expect(res.status).toBe(400);
        });
    });
});
