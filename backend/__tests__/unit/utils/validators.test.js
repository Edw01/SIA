import { describe, it, expect } from '@jest/globals';
import {
    parsePositiveInteger,
    parseNonNegativeInteger,
    validateRequiredString
} from '../../../utils/validators.js';

describe('Utilidades de Validación (validators.js)', () => {

    describe('Función: parsePositiveInteger', () => {
        it('debería aceptar un número entero positivo y retornarlo como Number', () => {
            expect(parsePositiveInteger('5', 'Edad')).toBe(5);
            expect(parsePositiveInteger(10, 'Edad')).toBe(10);
        });

        it('debería lanzar un error si recibe cero o un número negativo', () => {
            expect(() => parsePositiveInteger(0, 'Edad')).toThrow('Edad debe ser un número entero positivo.');
            expect(() => parsePositiveInteger(-5, 'Edad')).toThrow('Edad debe ser un número entero positivo.');
        });

        it('debería lanzar un error si recibe un número decimal', () => {
            expect(() => parsePositiveInteger(5.5, 'Edad')).toThrow('Edad debe ser un número entero positivo.');
            expect(() => parsePositiveInteger('3.14', 'Edad')).toThrow('Edad debe ser un número entero positivo.');
        });

        it('debería lanzar un error si recibe texto u otros tipos inválidos', () => {
            expect(() => parsePositiveInteger('abc', 'Edad')).toThrow('Edad debe ser un número entero positivo.');
            expect(() => parsePositiveInteger(null, 'Edad')).toThrow('Edad debe ser un número entero positivo.');
        });
    });

    describe('Función: parseNonNegativeInteger', () => {
        it('debería aceptar un número entero positivo', () => {
            expect(parseNonNegativeInteger('5', 'Edad')).toBe(5);
        });

        it('debería aceptar el número cero', () => {
            expect(parseNonNegativeInteger(0, 'Edad')).toBe(0);
            expect(parseNonNegativeInteger('0', 'Edad')).toBe(0);
        });

        it('debería lanzar un error si recibe un número negativo', () => {
            expect(() => parseNonNegativeInteger(-1, 'Edad')).toThrow('Edad debe ser un número entero no negativo.');
        });

        it('debería lanzar un error si no es un número entero', () => {
            expect(() => parseNonNegativeInteger('abc', 'Edad')).toThrow('Edad debe ser un número entero no negativo.');
            expect(() => parseNonNegativeInteger(1.5, 'Edad')).toThrow('Edad debe ser un número entero no negativo.');
        });
    });

    describe('Función: validateRequiredString', () => {
        it('debería aceptar un string válido y retornarlo', () => {
            expect(validateRequiredString('Hola Mundo', 'Nombre')).toBe('Hola Mundo');
        });

        it('debería limpiar (trim) los espacios al inicio y final del string', () => {
            expect(validateRequiredString('  Hola Mundo  ', 'Nombre')).toBe('Hola Mundo');
        });

        it('debería lanzar error si el string está vacío o contiene solo espacios', () => {
            expect(() => validateRequiredString('', 'Nombre')).toThrow('Nombre es obligatorio.');
            expect(() => validateRequiredString('   ', 'Nombre')).toThrow('Nombre es obligatorio.');
        });

        it('debería lanzar error si no se proporciona un string (null, undefined, number)', () => {
            expect(() => validateRequiredString(123, 'Nombre')).toThrow('Nombre es obligatorio.');
            expect(() => validateRequiredString(null, 'Nombre')).toThrow('Nombre es obligatorio.');
            expect(() => validateRequiredString(undefined, 'Nombre')).toThrow('Nombre es obligatorio.');
        });

        it('debería lanzar error si el string excede la longitud máxima permitida', () => {
            // Pasamos 'universidad' que tiene 11 caracteres, pero límite de 5
            expect(() => validateRequiredString('universidad', 'Nombre', 5)).toThrow('Nombre no puede superar 5 caracteres.');
        });
    });

});
