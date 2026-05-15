import { ValidacionStrategy } from './ValidacionStrategy.js';
import SeccionRepository from '../../repositories/SeccionRepository.js';
import UsuarioRepository from '../../repositories/UsuarioRepository.js';

/**
 * Estrategia concreta: Valida que el alumno cumpla con todos los prerrequisitos 
 * de la asignatura que intenta tomar.
 */
export class ValidarPrerrequisitos extends ValidacionStrategy {
    async validar(contexto) {
        const { estudianteId, seccion } = contexto;
        
        // 1. Obtener prerrequisitos de la asignatura
        const prerrequisitos = await SeccionRepository.getPrerrequisitos(seccion.asignatura_id);
        
        // Si no tiene prerrequisitos, pasa automático
        if (prerrequisitos.length === 0) return true;

        // 2. Obtener historial académico (ramos aprobados)
        const historial = await UsuarioRepository.getHistorialAcademico(estudianteId);
        const idsAprobados = historial.map(h => h.id);

        // 3. Verificar que cada prerrequisito esté en el historial de aprobados
        for (const req of prerrequisitos) {
            if (!idsAprobados.includes(req.prerrequisito_id)) {
                throw new Error(`BR-03: Falta prerrequisito ${req.codigo} para inscribir esta asignatura.`);
            }
        }

        return true;
    }
}
