import { ValidacionStrategy } from './ValidacionStrategy.js';
import InscripcionRepository from '../../repositories/InscripcionRepository.js';

/**
 * Estrategia concreta: Valida que la nueva sección no choque en horario con 
 * las secciones que el estudiante ya tiene inscritas.
 */
export class ValidarHorario extends ValidacionStrategy {
    async validar(contexto) {
        const { estudianteId, seccion } = contexto;
        
        // Obtenemos las inscripciones actuales del estudiante
        const actuales = await InscripcionRepository.getInscripcionesEstudiante(estudianteId);
        
        // Simplificación: Asumimos un formato "LU 08:30" 
        // En la vida real, parsearíamos días y horas.
        // Aquí simularemos una detección de colisión de strings literal para el prototipo.
        for (const ins of actuales) {
            if (this.hayChoque(ins.horario, seccion.horario)) {
                throw new Error(`BR-07: Choque de horario detectado con ${ins.asig_codigo} (Sección ${ins.codigo_seccion}).`);
            }
        }

        return true;
    }

    hayChoque(horarioA, horarioB) {
        // Lógica súper simplificada para el ejemplo.
        // Si tienen exactamente la misma cadena (ej. 'LU 08:30-10:00'), es choque.
        if (!horarioA || !horarioB) return false;
        
        // Un motor real de horarios separaría por comas y luego por bloques de tiempo.
        const bloquesA = horarioA.split(',').map(b => b.trim());
        const bloquesB = horarioB.split(',').map(b => b.trim());

        return bloquesA.some(bloque => bloquesB.includes(bloque));
    }
}
