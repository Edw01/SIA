import { describe, it, expect, jest, afterEach } from '@jest/globals';

jest.unstable_mockModule('../../../config/db.js', () => ({
    default: { query: jest.fn() }
}));

const db = (await import('../../../config/db.js')).default;
const AsignaturaRepository = (await import('../../../repositories/AsignaturaRepository.js'))
    .default;

describe('AsignaturaRepository', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('debería insertar una nueva asignatura', async () => {
        db.query.mockResolvedValue({ rows: [{ id: 1 }] });
        await AsignaturaRepository.crearAsignatura('INFO', 'Test', 10);
        expect(db.query.mock.calls[0][1]).toEqual(['INFO', 'Test', 10]);
    });

    it('debería detectar dependencia cíclica', async () => {
        db.query.mockResolvedValue({ rows: [{ id: 1 }] });
        const res = await AsignaturaRepository.comprobarDependenciaCiclica(1, 2);
        expect(res).toBe(true);
    });

    it('debería insertar un prerrequisito', async () => {
        db.query.mockResolvedValue({ rows: [] });
        await AsignaturaRepository.agregarPrerrequisito(1, 2);
        expect(db.query).toHaveBeenCalledTimes(1);
    });
});
