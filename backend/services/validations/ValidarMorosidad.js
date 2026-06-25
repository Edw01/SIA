import { ValidacionStrategy } from './ValidacionStrategy.js';
import UsuarioRepository from '../../repositories/UsuarioRepository.js';

/**
 * Estrategia concreta: Valida que el estudiante no tenga bloqueos por morosidad financiera.
 */
export class ValidarMorosidad extends ValidacionStrategy {
    async validar(contexto) {
        const { estudianteId } = contexto;
        
        const esMoroso = await UsuarioRepository.checkMorosidad(estudianteId);
        if (esMoroso) {
            throw new Error("BR-05: El estudiante mantiene una restricción financiera y no puede inscribir ramos.");
        }
        
        return true;
    }
}
