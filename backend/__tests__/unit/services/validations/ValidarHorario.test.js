import { describe, it, expect, jest, afterEach } from '@jest/globals';
import { ValidarHorario } from '../../../../services/validations/ValidarHorario.js';
import InscripcionRepository from '../../../../repositories/InscripcionRepository.js';

describe('Estrategia: ValidarHorario', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('debería retornar true si el estudiante no tiene choques de horario', async () => {
        jest.spyOn(InscripcionRepository, 'getInscripcionesEstudiante').mockResolvedValue([
            { horario: 'LU 08:30-10:00' }
        ]);

        const validador = new ValidarHorario();
        const contexto = { estudianteId: 1, seccion: { horario: 'JU 10:15-11:45' } };

        const resultado = await validador.validar(contexto);
        expect(resultado).toBe(true);
    });

    it('debería lanzar error BR-07 si hay choque de horario', async () => {
        jest.spyOn(InscripcionRepository, 'getInscripcionesEstudiante').mockResolvedValue([
            { asig_codigo: 'INFO101', codigo_seccion: '1', horario: 'LU 08:30-10:00, MI 08:30-10:00' }
        ]);

        const validador = new ValidarHorario();
        const contexto = { estudianteId: 1, seccion: { horario: 'MI 08:30-10:00' } };

        await expect(validador.validar(contexto)).rejects.toThrow('BR-07: Choque de horario detectado con INFO101 (Sección 1).');
    });

    it('debería retornar true si los horarios vienen nulos', async () => {
        jest.spyOn(InscripcionRepository, 'getInscripcionesEstudiante').mockResolvedValue([
            { horario: null }
        ]);

        const validador = new ValidarHorario();
        const contexto = { estudianteId: 1, seccion: { horario: null } };

        const resultado = await validador.validar(contexto);
        expect(resultado).toBe(true);
    });
});
