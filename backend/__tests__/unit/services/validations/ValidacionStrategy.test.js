import { describe, it, expect } from '@jest/globals';
import { ValidacionStrategy } from '../../../../services/validations/ValidacionStrategy.js';

describe('ValidacionStrategy (Clase Base)', () => {
    it('debería lanzar un error indicando que debe ser implementado por el hijo', async () => {
        const estrategia = new ValidacionStrategy();
        await expect(estrategia.validar({})).rejects.toThrow(
            "El método 'validar' debe ser implementado por la estrategia concreta."
        );
    });
});
