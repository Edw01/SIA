import { describe, it, expect, jest, afterEach } from '@jest/globals';

jest.unstable_mockModule('../../../config/db.js', () => ({
    default: { query: jest.fn() }
}));

const db = (await import('../../../config/db.js')).default;
const InscripcionRepository = (await import('../../../repositories/InscripcionRepository.js'))
    .default;

describe('InscripcionRepository', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('debería ejecutar INSERT / ON CONFLICT para crear inscripción', async () => {
        db.query.mockResolvedValue({ rows: [{ id: 1, estado: 'Inscrito' }] });
        const res = await InscripcionRepository.crearInscripcion(1, 2, 'Inscrito');
        expect(db.query).toHaveBeenCalledTimes(1);
        expect(res.estado).toBe('Inscrito');
    });

    it('debería obtener inscripciones del estudiante', async () => {
        db.query.mockResolvedValue({ rows: [] });
        await InscripcionRepository.getInscripcionesEstudiante(1);
        expect(db.query).toHaveBeenCalledTimes(1);
    });

    it('debería buscar inscripción por ID y por ID FOR UPDATE', async () => {
        db.query.mockResolvedValue({ rows: [{ id: 5 }] });
        await InscripcionRepository.findById(5);
        await InscripcionRepository.findByIdForUpdate(5);
        expect(db.query).toHaveBeenCalledTimes(2);
        expect(db.query.mock.calls[1][0]).toContain('FOR UPDATE');
    });

    it('debería buscar por estudiante y sección', async () => {
        db.query.mockResolvedValue({ rows: [] });
        await InscripcionRepository.findByEstudianteYSeccion(10, 20);
        expect(db.query.mock.calls[0][1]).toEqual([10, 20]);
    });

    it('debería ejecutar el UPDATE para retirar inscripción', async () => {
        db.query.mockResolvedValue({ rows: [{ id: 1, estado: 'Retirado' }] });
        const res = await InscripcionRepository.retirarInscripcion(1);
        expect(res.estado).toBe('Retirado');
    });

    it('debería registrar en bitácora sin retornar filas', async () => {
        db.query.mockResolvedValue({ rows: [] });
        await InscripcionRepository.registrarBitacora(1, 'PRUEBA', 'Detalle');
        expect(db.query.mock.calls[0][1]).toEqual([1, 'PRUEBA', 'Detalle']);
    });
});
