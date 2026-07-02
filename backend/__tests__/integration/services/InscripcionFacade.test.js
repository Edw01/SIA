import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// 1. Mockeamos la Base de Datos (solo para la transacción)
jest.unstable_mockModule('../../../config/db.js', () => ({
    default: {
        // Simulamos la función transaction recibiendo un callback y pasándole un cliente falso
        transaction: jest.fn(async (callback) => await callback({ isMockClient: true }))
    }
}));

// 2. Mockeamos los repositorios para controlar exactamente qué devuelven
jest.unstable_mockModule('../../../repositories/SeccionRepository.js', () => ({
    default: {
        findById: jest.fn(),
        findByIdForUpdate: jest.fn(),
        decrementarCupo: jest.fn(),
        incrementarCupo: jest.fn(),
        getPrerrequisitos: jest.fn() // Necesario para la estrategia
    }
}));

jest.unstable_mockModule('../../../repositories/InscripcionRepository.js', () => ({
    default: {
        findByEstudianteYSeccion: jest.fn(),
        crearInscripcion: jest.fn(),
        registrarBitacora: jest.fn(),
        findByIdForUpdate: jest.fn(),
        retirarInscripcion: jest.fn(),
        getInscripcionesEstudiante: jest.fn() // Necesario para la estrategia
    }
}));

jest.unstable_mockModule('../../../repositories/UsuarioRepository.js', () => ({
    default: {
        checkMorosidad: jest.fn(), // Necesario para la estrategia
        getHistorialAcademico: jest.fn()
    }
}));

// 3. Importamos todo (Debe ser dinámico por ESM)
const db = (await import('../../../config/db.js')).default;
const SeccionRepository = (await import('../../../repositories/SeccionRepository.js')).default;
const InscripcionRepository = (await import('../../../repositories/InscripcionRepository.js')).default;
const UsuarioRepository = (await import('../../../repositories/UsuarioRepository.js')).default;
const InscripcionFacade = (await import('../../../services/InscripcionFacade.js')).default;

describe('InscripcionFacade (Test de Integración de Lógica de Negocio)', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Configuramos un escenario ideal de éxito por defecto (Camino Feliz)
        SeccionRepository.findById.mockResolvedValue({ id: 10, cupos_disponibles: 5 });
        InscripcionRepository.findByEstudianteYSeccion.mockResolvedValue(null);
        
        // Mocks para que las estrategias pasen en verde
        UsuarioRepository.checkMorosidad.mockResolvedValue(false);
        SeccionRepository.getPrerrequisitos.mockResolvedValue([]);
        InscripcionRepository.getInscripcionesEstudiante.mockResolvedValue([]);
        
        // Mocks dentro de la transacción
        SeccionRepository.findByIdForUpdate.mockResolvedValue({ id: 10, cupos_disponibles: 5, codigo_seccion: 'S1' });
        SeccionRepository.decrementarCupo.mockResolvedValue({ id: 10, cupos_disponibles: 4 });
        InscripcionRepository.crearInscripcion.mockResolvedValue({ id: 1, estado: 'Inscrito' });
    });

    it('debería inscribir exitosamente si el alumno cumple todo y hay cupos', async () => {
        const res = await InscripcionFacade.inscribir(1, 10);
        
        expect(res.success).toBe(true);
        expect(res.estado).toBe('Inscrito');
        expect(db.transaction).toHaveBeenCalled();
        expect(InscripcionRepository.crearInscripcion).toHaveBeenCalled();
    });

    it('debería fallar antes de la transacción si la sección no existe', async () => {
        SeccionRepository.findById.mockResolvedValue(null);
        
        const res = await InscripcionFacade.inscribir(1, 999);
        
        expect(res.success).toBe(false);
        expect(res.mensaje).toBe('La sección no existe.');
        expect(db.transaction).not.toHaveBeenCalled(); // Nunca entró a la BD transaccional
    });

    it('debería capturar el error si el alumno es moroso (Falla Estrategia)', async () => {
        // Hacemos que la validación arroje morosidad
        UsuarioRepository.checkMorosidad.mockResolvedValue(true);
        
        const res = await InscripcionFacade.inscribir(1, 10);
        
        expect(res.success).toBe(false);
        expect(res.mensaje).toContain('restricción financiera');
        expect(db.transaction).not.toHaveBeenCalled();
    });

    it('debería dejar al alumno en Lista_Espera si en el momento del bloqueo (FOR UPDATE) no hay cupos', async () => {
        // Simulamos que al bloquear la fila en la BD, nos damos cuenta que justo se acabaron los cupos
        SeccionRepository.findByIdForUpdate.mockResolvedValue({ id: 10, cupos_disponibles: 0, codigo_seccion: 'S1' });
        InscripcionRepository.crearInscripcion.mockResolvedValue({ id: 2, estado: 'Lista_Espera' });
        
        const res = await InscripcionFacade.inscribir(1, 10);
        
        expect(res.success).toBe(true);
        expect(res.estado).toBe('Lista_Espera');
        expect(SeccionRepository.decrementarCupo).not.toHaveBeenCalled(); // No resta cupos porque no hay
    });

    it('debería retirar una inscripción exitosamente', async () => {
        InscripcionRepository.findByIdForUpdate.mockResolvedValue({ 
            id: 100, estudiante_id: 1, estado: 'Inscrito', seccion_id: 10 
        });
        
        const res = await InscripcionFacade.retirar(100, 1);
        
        expect(res.success).toBe(true);
        expect(InscripcionRepository.retirarInscripcion).toHaveBeenCalled();
        expect(SeccionRepository.incrementarCupo).toHaveBeenCalled(); // Liberó el cupo
    });

    it('debería rechazar el retiro si el estudiante no es el dueño', async () => {
        InscripcionRepository.findByIdForUpdate.mockResolvedValue({ 
            id: 100, estudiante_id: 2, estado: 'Inscrito' // Dueño = 2
        });
        
        const res = await InscripcionFacade.retirar(100, 1); // Intenta retirar = 1
        
        expect(res.success).toBe(false);
        expect(res.mensaje).toBe('No tienes permiso para retirar esta inscripción.');
    });

    it('debería rechazar el retiro si ya estaba retirado previamente', async () => {
        InscripcionRepository.findByIdForUpdate.mockResolvedValue({ 
            id: 100, estudiante_id: 1, estado: 'Retirado'
        });
        
        const res = await InscripcionFacade.retirar(100, 1);
        
        expect(res.success).toBe(false);
        expect(res.mensaje).toBe('Esta inscripción ya fue retirada.');
    });
});
