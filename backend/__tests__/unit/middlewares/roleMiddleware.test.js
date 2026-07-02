import { describe, it, expect, jest } from '@jest/globals';
import { normalizeRole, authorizeRoles } from '../../../middlewares/roleMiddleware.js';

describe('Middleware de Roles (roleMiddleware.js)', () => {
    describe('Función: normalizeRole', () => {
        it('debería normalizar alias a sus roles correctos', () => {
            expect(normalizeRole('Admin')).toBe('Administrador');
            expect(normalizeRole('administrador')).toBe('Administrador');
            expect(normalizeRole('coordinador')).toBe('Coordinador');
            expect(normalizeRole('estudiante')).toBe('Estudiante');
        });

        it('debería dejar intacto un rol si no tiene alias', () => {
            expect(normalizeRole('Administrador')).toBe('Administrador');
            expect(normalizeRole('Invitado')).toBe('Invitado');
        });
    });

    describe('Función: authorizeRoles', () => {
        const mockRequestResponse = (user) => {
            const req = { user };
            const res = {};
            res.status = jest.fn().mockReturnValue(res);
            res.json = jest.fn().mockReturnValue(res);
            const next = jest.fn();
            return { req, res, next };
        };

        it('debería rechazar (401) si req.user no existe (no pasó por authMiddleware)', () => {
            const { req, res, next } = mockRequestResponse(undefined);
            const middleware = authorizeRoles('Administrador'); // Middleware esperando a un Admin

            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Usuario no autenticado.' });
            expect(next).not.toHaveBeenCalled();
        });

        it('debería rechazar (403) si el usuario tiene un rol no permitido', () => {
            const { req, res, next } = mockRequestResponse({ rol: 'Estudiante' });
            const middleware = authorizeRoles('Administrador', 'Coordinador'); // Solo entran estos dos

            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                error: 'No tienes permisos para realizar esta acción.'
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('debería dejar pasar (next) si el usuario tiene el rol exacto', () => {
            const { req, res, next } = mockRequestResponse({ rol: 'Coordinador' });
            const middleware = authorizeRoles('Administrador', 'Coordinador');

            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        it('debería dejar pasar (next) soportando alias (ej. Admin -> Administrador)', () => {
            // El usuario dice ser "Admin" (con el alias), y el middleware exige "Administrador"
            const { req, res, next } = mockRequestResponse({ rol: 'Admin' });
            const middleware = authorizeRoles('Administrador');

            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });
    });
});
