import db from '../config/db.js';
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
        this.validaciones = [
            new ValidarMorosidad(),
            new ValidarPrerrequisitos(),
            new ValidarHorario()
        ];
    }

    async inscribir(estudianteId, seccionId) {
        const estudianteIdNumber = Number(estudianteId);
        const seccionIdNumber = Number(seccionId);

        try {
            const seccion = await SeccionRepository.findById(seccionIdNumber);
            if (!seccion) throw new Error('La sección no existe.');

            const existente = await InscripcionRepository.findByEstudianteYSeccion(estudianteIdNumber, seccionIdNumber);
            if (existente && existente.estado !== 'Retirado') {
                throw new Error('El estudiante ya está inscrito o en lista de espera para esta sección.');
            }

            const contexto = { estudianteId: estudianteIdNumber, seccion };
            for (const estrategia of this.validaciones) {
                await estrategia.validar(contexto);
            }

            const resultado = await db.transaction(async (client) => {
                const existenteBloqueado = await InscripcionRepository.findByEstudianteYSeccion(
                    estudianteIdNumber,
                    seccionIdNumber,
                    client
                );

                if (existenteBloqueado && existenteBloqueado.estado !== 'Retirado') {
                    throw new Error('El estudiante ya está inscrito o en lista de espera para esta sección.');
                }

                const seccionBloqueada = await SeccionRepository.findByIdForUpdate(seccionIdNumber, client);
                if (!seccionBloqueada) throw new Error('La sección no existe.');

                let estadoInscripcion = 'Inscrito';
                if (seccionBloqueada.cupos_disponibles <= 0) {
                    estadoInscripcion = 'Lista_Espera';
                } else {
                    const seccionActualizada = await SeccionRepository.decrementarCupo(seccionIdNumber, client);
                    if (!seccionActualizada) {
                        estadoInscripcion = 'Lista_Espera';
                    }
                }

                const inscripcion = await InscripcionRepository.crearInscripcion(
                    estudianteIdNumber,
                    seccionIdNumber,
                    estadoInscripcion,
                    client
                );

                if (!inscripcion) {
                    throw new Error('No se pudo registrar la inscripción. Verifica si ya existe una inscripción activa.');
                }

                const accion = estadoInscripcion === 'Inscrito'
                    ? 'Inscripción Exitosa'
                    : 'Ingreso a Lista de Espera';
                await InscripcionRepository.registrarBitacora(
                    estudianteIdNumber,
                    accion,
                    `Sección ${seccionBloqueada.codigo_seccion}`,
                    client
                );

                return { success: true, estado: estadoInscripcion, inscripcion };
            });

            return resultado;
        } catch (error) {
            try {
                await InscripcionRepository.registrarBitacora(estudianteIdNumber, 'Fallo de Inscripción', error.message);
            } catch (bitacoraError) {
                console.error('No se pudo registrar bitácora de fallo:', bitacoraError);
            }

            return { success: false, mensaje: error.message };
        }
    }

    async retirar(inscripcionId, estudianteId) {
        const inscripcionIdNumber = Number(inscripcionId);
        const estudianteIdNumber = Number(estudianteId);

        try {
            const resultado = await db.transaction(async (client) => {
                const inscripcion = await InscripcionRepository.findByIdForUpdate(inscripcionIdNumber, client);

                if (!inscripcion) throw new Error('La inscripción no existe.');
                if (Number(inscripcion.estudiante_id) !== estudianteIdNumber) {
                    throw new Error('No tienes permiso para retirar esta inscripción.');
                }
                if (inscripcion.estado === 'Retirado') {
                    throw new Error('Esta inscripción ya fue retirada.');
                }

                await InscripcionRepository.retirarInscripcion(inscripcionIdNumber, client);

                if (inscripcion.estado === 'Inscrito') {
                    await SeccionRepository.incrementarCupo(inscripcion.seccion_id, client);
                }

                await InscripcionRepository.registrarBitacora(
                    estudianteIdNumber,
                    'Retiro de Asignatura',
                    `Sección ID ${inscripcion.seccion_id}`,
                    client
                );

                return { success: true, mensaje: 'Asignatura retirada con éxito.' };
            });

            return resultado;
        } catch (error) {
            return { success: false, mensaje: error.message };
        }
    }
}

export default new InscripcionFacade();
