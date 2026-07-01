import SeccionRepository from '../repositories/SeccionRepository.js';
import { parsePositiveInteger, validateRequiredString } from '../utils/validators.js';

class CoordinadorController {
    /**
     * Endpoint para crear una sección nueva
     * POST /api/coordinador/secciones
     */
    async crearSeccion(req, res) {
        try {
            const asignaturaId = parsePositiveInteger(req.body.asignaturaId, 'asignaturaId');
            const codigoSeccion = validateRequiredString(req.body.codigoSeccion, 'Código de sección', 10).toUpperCase();
            const cuposMaximos = parsePositiveInteger(req.body.cuposMaximos, 'Cupos máximos');
            const horario = validateRequiredString(req.body.horario, 'Horario', 255);
            const aula = typeof req.body.aula === 'string' ? req.body.aula.trim() : null;

            const nuevaSeccion = await SeccionRepository.crearSeccion(
                asignaturaId,
                codigoSeccion,
                cuposMaximos,
                horario,
                aula || null
            );

            return res.status(201).json({ success: true, mensaje: 'Sección creada', seccion: nuevaSeccion });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(409).json({ error: 'Ya existe una sección con ese código para esta asignatura.' });
            }

            if (error.message.includes('obligatorio') || error.message.includes('positivo')) {
                return res.status(400).json({ error: error.message });
            }

            console.error('Error al crear sección:', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
}

export default new CoordinadorController();
