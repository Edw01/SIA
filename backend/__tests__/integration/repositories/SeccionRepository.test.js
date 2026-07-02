import { describe, it, expect, jest, afterEach } from '@jest/globals';

jest.unstable_mockModule('../../../config/db.js', () => ({
    default: { query: jest.fn() }
}));

const db = (await import('../../../config/db.js')).default;
const SeccionRepository = (await import('../../../repositories/SeccionRepository.js')).default;

describe('SeccionRepository', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('debería buscar por ID normal y con FOR UPDATE', async () => {
        db.query.mockResolvedValue({ rows: [{ id: 1 }] });
        await SeccionRepository.findById(1);
        await SeccionRepository.findByIdForUpdate(1);
        expect(db.query).toHaveBeenCalledTimes(2);
    });

    it('debería obtener secciones, prerrequisitos y secciones por asignatura', async () => {
        db.query.mockResolvedValue({ rows: [] });
        await SeccionRepository.getSeccionesByAsignatura(1);
        await SeccionRepository.getAllSecciones();
        await SeccionRepository.getPrerrequisitos(1);
        expect(db.query).toHaveBeenCalledTimes(3);
    });

    it('debería decrementar e incrementar cupos mediante UPDATE', async () => {
        db.query.mockResolvedValue({ rows: [{ id: 1, cupos_disponibles: 10 }] });
        await SeccionRepository.decrementarCupo(1);
        await SeccionRepository.incrementarCupo(1);
        expect(db.query).toHaveBeenCalledTimes(2);
    });

    it('debería crear una sección con INSERT', async () => {
        db.query.mockResolvedValue({ rows: [{ id: 99 }] });
        await SeccionRepository.crearSeccion(1, 'S1', 30, 'LU', 'A1');
        expect(db.query.mock.calls[0][1]).toEqual([1, 'S1', 30, 'LU', 'A1']);
    });
});
