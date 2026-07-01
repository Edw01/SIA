import AsignaturaRepository from '../repositories/AsignaturaRepository.js';
import { parsePositiveInteger, validateRequiredString } from '../utils/validators.js';

class AdminController {
    /**
     * Endpoint para registrar una nueva asignatura
     * POST /api/admin/asignaturas
     */
    async crearAsignatura(req, res) {
        try {
            const codigo = validateRequiredString(req.body.codigo, 'Código', 20).toUpperCase();
            const nombre = validateRequiredString(req.body.nombre, 'Nombre', 100);
            const creditos = parsePositiveInteger(req.body.creditos, 'Créditos');

            const nuevaAsignatura = await AsignaturaRepository.crearAsignatura(codigo, nombre, creditos);
            return res.status(201).json({ success: true, asignatura: nuevaAsignatura });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(409).json({ error: 'Ya existe una asignatura con ese código.' });
            }

            if (error.message.includes('obligatorio') || error.message.includes('positivo')) {
                return res.status(400).json({ error: error.message });
            }

            console.error('Error al crear asignatura:', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    /**
     * Endpoint para vincular un prerrequisito a una asignatura
     * POST /api/admin/prerrequisitos
     */
    async configurarPrerrequisito(req, res) {
        try {
            const asignaturaId = parsePositiveInteger(req.body.asignaturaId, 'asignaturaId');
            const prerrequisitoId = parsePositiveInteger(req.body.prerrequisitoId, 'prerrequisitoId');

            if (asignaturaId === prerrequisitoId) {
                return res.status(400).json({ error: 'Una asignatura no puede ser prerrequisito de sí misma.' });
            }

            // BR: Impedir dependencia cíclica directa.
            const esCiclico = await AsignaturaRepository.comprobarDependenciaCiclica(asignaturaId, prerrequisitoId);
            if (esCiclico) {
                return res.status(400).json({ error: 'Error: Dependencia cíclica detectada en la malla curricular.' });
            }

            await AsignaturaRepository.agregarPrerrequisito(asignaturaId, prerrequisitoId);
            return res.status(201).json({ success: true, mensaje: 'Prerrequisito configurado exitosamente.' });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(409).json({ error: 'El prerrequisito ya existe para esta asignatura.' });
            }

            if (error.message.includes('positivo')) {
                return res.status(400).json({ error: error.message });
            }

            console.error('Error al agregar prerrequisito:', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
}

export default new AdminController();
