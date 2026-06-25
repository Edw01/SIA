import UsuarioRepository from '../repositories/UsuarioRepository.js';

class AuthController {
    /**
     * Endpoint para iniciar sesión
     * POST /api/auth/login
     */
    async login(req, res) {
        try {
            const { rut } = req.body;

            if (!rut) {
                return res.status(400).json({ error: "Falta proporcionar el RUT." });
            }

            const usuario = await UsuarioRepository.findByRut(rut);

            if (!usuario) {
                return res.status(404).json({ error: "Usuario no encontrado." });
            }

            // Como la integración real con SSO está excluida, devolveremos los datos básicos simulando un token
            return res.status(200).json({
                success: true,
                usuario: {
                    id: usuario.id,
                    rut: usuario.rut,
                    nombre: usuario.nombre,
                    rol: usuario.rol
                }
            });

        } catch (error) {
            console.error("Error en login:", error);
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    }
}

export default new AuthController();
