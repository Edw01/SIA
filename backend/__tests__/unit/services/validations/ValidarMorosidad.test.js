import { describe, it, expect, jest, afterEach } from '@jest/globals';
import { ValidarMorosidad } from '../../../../services/validations/ValidarMorosidad.js';
import UsuarioRepository from '../../../../repositories/UsuarioRepository.js';

describe('Estrategia: ValidarMorosidad', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('debería retornar true si el estudiante está al día con sus pagos (no moroso)', async () => {
        jest.spyOn(UsuarioRepository, 'checkMorosidad').mockResolvedValue(false);

        const validador = new ValidarMorosidad();
        const resultado = await validador.validar({ estudianteId: 1 });

        expect(resultado).toBe(true);
        expect(UsuarioRepository.checkMorosidad).toHaveBeenCalledWith(1);
    });

    it('debería lanzar error BR-05 si el estudiante es moroso', async () => {
        jest.spyOn(UsuarioRepository, 'checkMorosidad').mockResolvedValue(true);

        const validador = new ValidarMorosidad();
        await expect(validador.validar({ estudianteId: 1 })).rejects.toThrow(
            'BR-05: El estudiante mantiene una restricción financiera y no puede inscribir ramos.'
        );
    });
});
