import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../../../utils/jwt.js';

describe('Manejo de Tokens (jwt.js)', () => {
    const mockUser = {
        id: 1,
        rut: '12345678-9',
        nombre: 'Juan Perez',
        rol: 'Estudiante'
    };

    let originalAccessSecret;
    let originalRefreshSecret;

    // Antes de cada test, configuramos variables de entorno predecibles
    beforeEach(() => {
        originalAccessSecret = process.env.JWT_SECRET;
        originalRefreshSecret = process.env.JWT_REFRESH_SECRET;

        process.env.JWT_SECRET = 'secreto_de_prueba_access';
        process.env.JWT_REFRESH_SECRET = 'secreto_de_prueba_refresh';
    });

    // Después de cada test, restauramos el entorno
    afterEach(() => {
        process.env.JWT_SECRET = originalAccessSecret;
        process.env.JWT_REFRESH_SECRET = originalRefreshSecret;
    });

    describe('Función: generateAccessToken', () => {
        it('debería generar un JWT de acceso válido en 3 partes', () => {
            const token = generateAccessToken(mockUser);
            expect(typeof token).toBe('string');
            expect(token.split('.').length).toBe(3); // Todo JWT válido tiene header, payload y signature
        });
    });

    describe('Función: generateRefreshToken', () => {
        it('debería generar un JWT de refresh válido', () => {
            const token = generateRefreshToken(mockUser);
            expect(typeof token).toBe('string');
            expect(token.split('.').length).toBe(3);
        });
    });

    describe('Función: verifyToken', () => {
        it('debería verificar correctamente un token de acceso y extraer su payload', () => {
            const token = generateAccessToken(mockUser);
            const payload = verifyToken(token, { type: 'access' });

            expect(payload.id).toBe(mockUser.id);
            expect(payload.rut).toBe(mockUser.rut);
            expect(payload.nombre).toBe(mockUser.nombre);
            expect(payload.rol).toBe(mockUser.rol);
            expect(payload.tokenType).toBe('access');
        });

        it('debería verificar correctamente un token de refresh', () => {
            const token = generateRefreshToken(mockUser);
            const payload = verifyToken(token, { type: 'refresh' });

            expect(payload.id).toBe(mockUser.id);
            expect(payload.rut).toBe(mockUser.rut);
            expect(payload.tokenType).toBe('refresh');
        });

        it('debería fallar si se intenta verificar un access token usando el secreto del refresh token', () => {
            const token = generateAccessToken(mockUser);
            // Intentamos verificarlo como si fuera un refresh token (usará el secreto equivocado y fallará)
            expect(() => {
                verifyToken(token, { type: 'refresh' });
            }).toThrow('Firma de token inválida.');
        });

        it('debería fallar si el token no tiene 3 partes', () => {
            expect(() => {
                verifyToken('header.payload_incompleto', { type: 'access' });
            }).toThrow('Token mal formado.');
        });

        it('debería fallar si no se proporciona ningún token', () => {
            expect(() => {
                verifyToken('', { type: 'access' });
            }).toThrow('Token no proporcionado.');

            expect(() => {
                verifyToken(null, { type: 'access' });
            }).toThrow('Token no proporcionado.');
        });

        it('debería fallar si alguien altera la firma del token (Firma Inválida)', () => {
            const token = generateAccessToken(mockUser);
            // Tomamos el token válido y le reemplazamos su último caracter
            const tokenHackeado = token.slice(0, -1) + (token.endsWith('a') ? 'b' : 'a');

            expect(() => {
                verifyToken(tokenHackeado, { type: 'access' });
            }).toThrow('Firma de token inválida.');
        });

        it('debería fallar si se espera un tipo de token distinto al generado', () => {
            // Hackeamos la variable de entorno para que ambos usen la misma clave (para saltarnos el error de firma)
            process.env.JWT_REFRESH_SECRET = 'secreto_de_prueba_access';

            const token = generateAccessToken(mockUser); // Genera con tokenType='access'

            // Tratamos de validarlo pidiendo que sea un 'refresh'
            expect(() => {
                verifyToken(token, { type: 'refresh' });
            }).toThrow('Tipo de token inválido.');
        });
    });
});
