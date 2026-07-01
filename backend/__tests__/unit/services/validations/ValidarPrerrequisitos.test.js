import { describe, it, expect, jest, afterEach } from '@jest/globals';
import { ValidarPrerrequisitos } from '../../../../services/validations/ValidarPrerrequisitos.js';
import SeccionRepository from '../../../../repositories/SeccionRepository.js';
import UsuarioRepository from '../../../../repositories/UsuarioRepository.js';

describe('Estrategia: ValidarPrerrequisitos', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('debería retornar true automáticamente si la asignatura no tiene prerrequisitos', async () => {
        jest.spyOn(SeccionRepository, 'getPrerrequisitos').mockResolvedValue([]);
        
        const validador = new ValidarPrerrequisitos();
        const resultado = await validador.validar({ estudianteId: 1, seccion: { asignatura_id: 10 } });
        
        expect(resultado).toBe(true);
    });

    it('debería retornar true si el estudiante cumple con todos los ramos exigidos', async () => {
        jest.spyOn(SeccionRepository, 'getPrerrequisitos').mockResolvedValue([
            { prerrequisito_id: 101, codigo: 'MAT101' },
            { prerrequisito_id: 102, codigo: 'INT101' }
        ]);
        jest.spyOn(UsuarioRepository, 'getHistorialAcademico').mockResolvedValue([
            { id: 101, codigo: 'MAT101' },
            { id: 102, codigo: 'INT101' },
            { id: 103, codigo: 'FIS101' } 
        ]);

        const validador = new ValidarPrerrequisitos();
        const resultado = await validador.validar({ estudianteId: 1, seccion: { asignatura_id: 200 } });
        
        expect(resultado).toBe(true);
    });

    it('debería lanzar error BR-03 si al estudiante le falta al menos 1 prerrequisito', async () => {
        jest.spyOn(SeccionRepository, 'getPrerrequisitos').mockResolvedValue([
            { prerrequisito_id: 101, codigo: 'MAT101' },
            { prerrequisito_id: 103, codigo: 'FIS101' }
        ]);
        jest.spyOn(UsuarioRepository, 'getHistorialAcademico').mockResolvedValue([
            { id: 101, codigo: 'MAT101' }
        ]);

        const validador = new ValidarPrerrequisitos();
        
        await expect(validador.validar({ estudianteId: 1, seccion: { asignatura_id: 200 } }))
            .rejects.toThrow('BR-03: Falta prerrequisito FIS101 para inscribir esta asignatura.');
    });
});
