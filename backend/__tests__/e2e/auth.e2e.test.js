import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// 1. Mockeamos la base de datos (Repositorio)
jest.unstable_mockModule('../../repositories/UsuarioRepository.js', () => ({
    default: {
        findByRut: jest.fn(),
        findById: jest.fn()
    }
}));

// 2. Importaciones dinámicas después del mock
const UsuarioRepository = (await import('../../repositories/UsuarioRepository.js')).default;
const authRoutes = (await import('../../routes/authRoutes.js')).default;
const jwtUtils = await import('../../utils/jwt.js');

// 3. App de prueba
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('API E2E: AuthController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/auth/login', () => {
        it('debería retornar 200 y tokens JWT si el RUT existe', async () => {
            const mockUser = { id: 1, rut: '12345678-9', nombre: 'Test', rol: 'Estudiante' };
            UsuarioRepository.findByRut.mockResolvedValue(mockUser);

            const response = await request(app).post('/api/auth/login').send({ rut: '12345678-9' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.accessToken).toBeDefined();
            expect(response.body.refreshToken).toBeDefined();
            expect(response.body.usuario.nombre).toBe('Test');
        });

        it('debería retornar 404 si el usuario no existe', async () => {
            UsuarioRepository.findByRut.mockResolvedValue(null);

            const response = await request(app).post('/api/auth/login').send({ rut: '99999999-9' });

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Usuario no encontrado.');
        });

        it('debería retornar 400 si el RUT falta o está vacío (Validación)', async () => {
            const response = await request(app).post('/api/auth/login').send({}); // Sin RUT

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('RUT es obligatorio');
        });
    });

    describe('POST /api/auth/refresh', () => {
        it('debería retornar 200 y nuevos tokens si el refresh token es válido', async () => {
            const mockUser = { id: 1, rut: '12345678-9', nombre: 'Test', rol: 'Estudiante' };
            const validRefreshToken = jwtUtils.generateRefreshToken(mockUser);

            UsuarioRepository.findById.mockResolvedValue(mockUser);

            const response = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: validRefreshToken });

            expect(response.status).toBe(200);
            expect(response.body.accessToken).toBeDefined();
        });

        it('debería retornar 401 si el refresh token es falso', async () => {
            const response = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: 'token_falso_inventado' });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Refresh token inválido o expirado.');
        });
    });

    describe('POST /api/auth/logout', () => {
        it('debería retornar 200 al cerrar sesión (incluso sin BD, solo borra estado cliente)', async () => {
            const mockUser = { id: 1, rut: '12345678-9', nombre: 'Test', rol: 'Estudiante' };
            const accessToken = jwtUtils.generateAccessToken(mockUser);

            const response = await request(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(response.status).toBe(200);
            expect(response.body.mensaje).toBe('Sesión cerrada correctamente.');
        });
    });

    describe('GET /api/auth/me', () => {
        it('debería retornar 200 y el usuario inyectado por el token', async () => {
            const mockUser = { id: 10, rut: '111', nombre: 'Me', rol: 'Admin' };
            const accessToken = jwtUtils.generateAccessToken(mockUser);

            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(response.status).toBe(200);
            expect(response.body.usuario.id).toBe(10);
        });
    });
});
