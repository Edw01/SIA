import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// 1. Mockeamos la capa de Repositorio (BD)
jest.unstable_mockModule('../../repositories/AsignaturaRepository.js', () => ({
    default: {
        crearAsignatura: jest.fn(),
        comprobarDependenciaCiclica: jest.fn(),
        agregarPrerrequisito: jest.fn()
    }
}));

// 2. Mockeamos el middleware de autenticación
// Usamos un pequeño truco: leemos el header 'x-mock-role' para simular diferentes roles en los tests
jest.unstable_mockModule('../../middlewares/authMiddleware.js', () => ({
    authenticateToken: (req, res, next) => {
        const rol = req.headers['x-mock-role'] || 'Administrador';
        req.user = { id: 1, rol };
        next();
    }
}));

const AsignaturaRepository = (await import('../../repositories/AsignaturaRepository.js')).default;
const adminRoutes = (await import('../../routes/adminRoutes.js')).default;

// 3. Configuramos la app Express
const app = express();
app.use(express.json());
app.use('/api/admin', adminRoutes);

describe('API E2E: AdminController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Seguridad y Roles', () => {
        it('debería retornar 403 Forbidden si un Estudiante intenta entrar a rutas de Admin', async () => {
            const res = await request(app)
                .post('/api/admin/asignaturas')
                .set('x-mock-role', 'Estudiante') // Simulamos ser estudiante
                .send({ codigo: 'TEST', nombre: 'Test', creditos: 10 });

            expect(res.status).toBe(403);
            expect(res.body.error).toBe('No tienes permisos para realizar esta acción.');
        });
    });

    describe('POST /api/admin/asignaturas', () => {
        it('debería retornar 201 si la asignatura se crea exitosamente', async () => {
            AsignaturaRepository.crearAsignatura.mockResolvedValue({ id: 1, codigo: 'INFO' });

            const res = await request(app)
                .post('/api/admin/asignaturas')
                .send({ codigo: 'INFO101', nombre: 'Introducción', creditos: 10 });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.asignatura.codigo).toBe('INFO');
        });

        it('debería retornar 409 si la asignatura ya existe (duplicado en BD)', async () => {
            const mockError = new Error();
            mockError.code = '23505'; // Código de error de PostgreSQL para Unique Violation
            AsignaturaRepository.crearAsignatura.mockRejectedValue(mockError);

            const res = await request(app)
                .post('/api/admin/asignaturas')
                .send({ codigo: 'INFO101', nombre: 'Repetida', creditos: 10 });

            expect(res.status).toBe(409);
            expect(res.body.error).toContain('Ya existe');
        });

        it('debería retornar 400 si faltan datos o están malos', async () => {
            const res = await request(app)
                .post('/api/admin/asignaturas')
                .send({ nombre: 'Sin codigo ni creditos' });

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('Código es obligatorio');
        });
    });

    describe('POST /api/admin/prerrequisitos', () => {
        it('debería retornar 201 si el prerrequisito se añade correctamente', async () => {
            AsignaturaRepository.comprobarDependenciaCiclica.mockResolvedValue(false);
            AsignaturaRepository.agregarPrerrequisito.mockResolvedValue();

            const res = await request(app)
                .post('/api/admin/prerrequisitos')
                .send({ asignaturaId: 10, prerrequisitoId: 5 });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
        });

        it('debería retornar 400 si la asignatura es prerrequisito de sí misma', async () => {
            const res = await request(app)
                .post('/api/admin/prerrequisitos')
                .send({ asignaturaId: 10, prerrequisitoId: 10 }); // IDs Iguales

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('sí misma');
        });

        it('debería retornar 400 si se detecta una dependencia cíclica', async () => {
            AsignaturaRepository.comprobarDependenciaCiclica.mockResolvedValue(true);

            const res = await request(app)
                .post('/api/admin/prerrequisitos')
                .send({ asignaturaId: 10, prerrequisitoId: 5 });

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('Dependencia cíclica');
        });

        it('debería retornar 409 si el prerrequisito ya existía', async () => {
            AsignaturaRepository.comprobarDependenciaCiclica.mockResolvedValue(false);
            const mockError = new Error();
            mockError.code = '23505';
            AsignaturaRepository.agregarPrerrequisito.mockRejectedValue(mockError);

            const res = await request(app)
                .post('/api/admin/prerrequisitos')
                .send({ asignaturaId: 10, prerrequisitoId: 5 });

            expect(res.status).toBe(409);
        });
    });
});
