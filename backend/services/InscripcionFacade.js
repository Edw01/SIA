import SeccionRepository from '../repositories/SeccionRepository.js';
import InscripcionRepository from '../repositories/InscripcionRepository.js';
import { ValidarMorosidad } from './validations/ValidarMorosidad.js';
import { ValidarPrerrequisitos } from './validations/ValidarPrerrequisitos.js';
import { ValidarHorario } from './validations/ValidarHorario.js';

/**
 * PATRÓN DE DISEÑO: FACADE (Estructural)
 * 
 * Propósito: Proporcionar una interfaz unificada y simple a un conjunto de interfaces más complejas en el subsistema.
 * La fachada `InscripcionFacade` define un método de alto nivel que hace que el proceso de inscripción sea fácil de usar para el controlador.
 * 
 * Justificación: El controlador de Express no debería saber cómo instanciar las estrategias,
 * verificar cupos o escribir en la bitácora. La fachada agrupa toda esa complejidad.
 */
class InscripcionFacade {
    constructor() {
        // Inicializamos las estrategias de validación que queremos aplicar
        this.validaciones = [
            new ValidarMorosidad(),
            new ValidarPrerrequisitos(),
            new ValidarHorario()
        ];
    }

    /**
     * Intenta inscribir a un estudiante en una sección.
     * @param {number} estudianteId 
     * @param {number} seccionId 
     * @returns {Object} Resultado de la operación
     */
    async inscribir(estudianteId, seccionId) {
        try {
            // 1. Obtener información de la sección
            const seccion = await SeccionRepository.findById(seccionId);
            if (!seccion) throw new Error("La sección no existe.");

            // 2. Preparar el contexto para las estrategias
            const contexto = { estudianteId, seccion };

            // 3. Ejecutar todas las validaciones secuencialmente (Strategy Pattern)
            for (const estrategia of this.validaciones) {
                await estrategia.validar(contexto);
            }

            // 4. Manejo de Cupos y Listas de Espera
            let estadoInscripcion = 'Inscrito';
            if (seccion.cupos_disponibles <= 0) {
                estadoInscripcion = 'Lista_Espera';
                await InscripcionRepository.registrarBitacora(estudianteId, 'Ingreso a Lista de Espera', `Sección ${seccion.codigo_seccion}`);
            } else {
                // Descontar el cupo
                await SeccionRepository.decrementarCupo(seccion.id);
            }

            // 5. Consolidar Inscripción
            const inscripcion = await InscripcionRepository.crearInscripcion(estudianteId, seccionId, estadoInscripcion);
            
            // 6. Registrar en bitácora (NFR-10)
            if (estadoInscripcion === 'Inscrito') {
                await InscripcionRepository.registrarBitacora(estudianteId, 'Inscripción Exitosa', `Sección ${seccion.codigo_seccion}`);
            }

            return { success: true, estado: estadoInscripcion, inscripcion };

        } catch (error) {
            // Si cualquier validación falla, se atrapa aquí y se loggea el error.
            await InscripcionRepository.registrarBitacora(estudianteId, 'Fallo de Inscripción', error.message);
            return { success: false, mensaje: error.message };
        }
    }

    /**
     * Orquesta el proceso de eliminar un ramo de la carga académica.
     */
    async retirar(inscripcionId, estudianteId) {
        try {
            const inscripcion = await InscripcionRepository.findById(inscripcionId);
            
            if (!inscripcion) throw new Error("La inscripción no existe.");
            if (inscripcion.estudiante_id !== estudianteId) throw new Error("No tienes permiso para retirar esta inscripción.");
            if (inscripcion.estado === 'Retirado') throw new Error("Esta inscripción ya fue retirada.");

            // 1. Cambiar estado a retirado
            await InscripcionRepository.retirarInscripcion(inscripcionId);

            // 2. Liberar el cupo
            if (inscripcion.estado === 'Inscrito') {
                await SeccionRepository.incrementarCupo(inscripcion.seccion_id);
            }

            // 3. Registrar en bitácora
            await InscripcionRepository.registrarBitacora(estudianteId, 'Retiro de Asignatura', `Sección ID ${inscripcion.seccion_id}`);

            return { success: true, mensaje: "Asignatura retirada con éxito." };

        } catch (error) {
            return { success: false, mensaje: error.message };
        }
    }
}

// Exportamos una única instancia (ligero singleton a nivel de módulo en Node)
export default new InscripcionFacade();
