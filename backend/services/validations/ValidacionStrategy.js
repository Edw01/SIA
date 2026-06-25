/**
 * PATRÓN DE DISEÑO: STRATEGY (Comportamiento)
 * PRINCIPIO SOLID: OCP (Open/Closed Principle) e ISP (Interface Segregation Principle)
 * 
 * Propósito: Define una "Interfaz" (en JavaScript simulada por una clase base que lanza error si no se implementa) 
 * que todas las estrategias de validación deben cumplir.
 * 
 * Justificación: Si mañana la universidad inventa una nueva regla (ej: "Prioridad por Notas"), 
 * no modificamos la fachada ni el controlador, simplemente creamos una nueva clase que extienda esta 
 * y la agregamos a la lista de validaciones. Evitamos tener un "if" gigante.
 */
export class ValidacionStrategy {
    /**
     * @param {Object} contexto - Contiene la información necesaria (estudianteId, seccion, historial, etc.)
     * @returns {boolean | Object} - Devuelve true/false o lanza un error si la validación falla.
     */
    async validar(contexto) {
        throw new Error("El método 'validar' debe ser implementado por la estrategia concreta.");
    }
}
