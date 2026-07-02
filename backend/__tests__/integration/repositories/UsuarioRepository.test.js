import { describe, it, expect, jest, afterEach } from '@jest/globals';

// 1. Mockeamos el módulo antes de importarlo para evitar el error de "extensible" en ES Modules
jest.unstable_mockModule('../../../config/db.js', () => ({
    default: {
        query: jest.fn()
    }
}));

// 2. Importamos dinámicamente los módulos ahora que la BD está mockeada
const db = (await import('../../../config/db.js')).default;
const UsuarioRepository = (await import('../../../repositories/UsuarioRepository.js')).default;

describe('UsuarioRepository (Test de Integración Simulado)', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('debería ejecutar la consulta SELECT para buscar por ID', async () => {
        db.query.mockResolvedValue({ rows: [{ id: 1, nombre: 'Test' }] });
        const result = await UsuarioRepository.findById(1);
        expect(db.query).toHaveBeenCalledWith('SELECT * FROM usuarios WHERE id = $1', [1]);
        expect(result.nombre).toBe('Test');
    });

    it('debería ejecutar la consulta SELECT para buscar por RUT', async () => {
        db.query.mockResolvedValue({ rows: [{ id: 2, rut: '111-1' }] });
        await UsuarioRepository.findByRut('111-1');
        expect(db.query).toHaveBeenCalledWith('SELECT * FROM usuarios WHERE rut = $1', ['111-1']);
    });

    it('debería ejecutar el JOIN para obtener el historial académico', async () => {
        db.query.mockResolvedValue({ rows: [{ codigo: 'MAT' }] });
        const result = await UsuarioRepository.getHistorialAcademico(10);
        expect(db.query).toHaveBeenCalledTimes(1);
        expect(db.query.mock.calls[0][1]).toEqual([10]);
        expect(result.length).toBe(1);
    });

    it('debería retornar el estado de morosidad correctamente', async () => {
        db.query.mockResolvedValue({ rows: [{ moroso: true }] });
        const result = await UsuarioRepository.checkMorosidad(5);
        expect(result).toBe(true);
    });

    it('debería retornar false si no encuentra al usuario al chequear morosidad', async () => {
        db.query.mockResolvedValue({ rows: [] });
        const result = await UsuarioRepository.checkMorosidad(999);
        expect(result).toBe(false);
    });
});
