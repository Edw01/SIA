import { describe, it, expect, jest } from '@jest/globals';
import { authenticateToken } from '../../../middlewares/authMiddleware.js';
import { generateAccessToken } from '../../../utils/jwt.js';

describe('Middleware de Autenticación (authMiddleware.js)', () => {
    // Función auxiliar para crear mocks de Express (req, res, next)
    const mockRequestResponse = (headers = {}) => {
        const req = { headers };
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        const next = jest.fn();
        return { req, res, next };
    };

    it('debería rechazar si no hay header de autorización', () => {
        const { req, res, next } = mockRequestResponse({}); // Sin headers

        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Token de acceso requerido.' });
        expect(next).not.toHaveBeenCalled();
    });

    it('debería rechazar si el esquema no es Bearer', () => {
        const { req, res, next } = mockRequestResponse({ authorization: 'Basic 123456' });

        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Token de acceso requerido.' });
    });

    it('debería rechazar si dice Bearer pero no trae token', () => {
        const { req, res, next } = mockRequestResponse({ authorization: 'Bearer ' });

        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Token de acceso requerido.' });
    });

    it('debería rechazar si el token es falso o ha expirado', () => {
        const { req, res, next } = mockRequestResponse({
            authorization: 'Bearer token_falso_inventado'
        });

        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido o expirado.' });
    });

    it('debería llamar a next() e inyectar req.user si el token es válido', () => {
        // Generamos un token real usando nuestra utilidad que ya probamos
        const mockUser = { id: 10, rut: '111-1', nombre: 'Test User', rol: 'Estudiante' };
        const validToken = generateAccessToken(mockUser);

        const { req, res, next } = mockRequestResponse({ authorization: `Bearer ${validToken}` });

        authenticateToken(req, res, next);

        // Verificamos que dejó pasar la petición
        expect(next).toHaveBeenCalled();
        // Verificamos que guardó al usuario en req.user
        expect(req.user).toBeDefined();
        expect(req.user.id).toBe(10);
        expect(req.user.rut).toBe('111-1');
        expect(req.user.rol).toBe('Estudiante');
        // Aseguramos que no devolvió error
        expect(res.status).not.toHaveBeenCalled();
    });
});
