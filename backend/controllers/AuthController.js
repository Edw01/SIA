import UsuarioRepository from '../repositories/UsuarioRepository.js';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt.js';
import { validateRequiredString } from '../utils/validators.js';

function buildUsuarioResponse(usuario) {
    return {
        id: usuario.id,
        rut: usuario.rut,
        nombre: usuario.nombre,
        rol: usuario.rol
    };
}

class AuthController {
    /**
     * Endpoint para iniciar sesión.
     * POST /api/auth/login
     *
     * Nota: Como el SSO real está fuera del alcance académico, se mantiene login por RUT,
     * pero ahora el backend emite JWT real de acceso y refresh token.
     */
    async login(req, res) {
        try {
            const rut = validateRequiredString(req.body.rut, 'RUT', 12);
            const usuario = await UsuarioRepository.findByRut(rut);

            if (!usuario) {
                return res.status(404).json({ error: 'Usuario no encontrado.' });
            }

            return res.status(200).json({
                success: true,
                usuario: buildUsuarioResponse(usuario),
                accessToken: generateAccessToken(usuario),
                refreshToken: generateRefreshToken(usuario)
            });
        } catch (error) {
            if (error.message.includes('obligatorio')) {
                return res.status(400).json({ error: error.message });
            }

            console.error('Error en login:', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    /**
     * Endpoint para renovar sesión.
     * POST /api/auth/refresh
     */
    async refresh(req, res) {
        try {
            const { refreshToken } = req.body;
            const payload = verifyToken(refreshToken, { type: 'refresh' });
            const usuario = await UsuarioRepository.findById(payload.id);

            if (!usuario) {
                return res.status(404).json({ error: 'Usuario no encontrado.' });
            }

            return res.status(200).json({
                success: true,
                usuario: buildUsuarioResponse(usuario),
                accessToken: generateAccessToken(usuario),
                refreshToken: generateRefreshToken(usuario)
            });
        } catch (error) {
            return res.status(401).json({ error: 'Refresh token inválido o expirado.' });
        }
    }

    /**
     * Endpoint para cerrar sesión.
     * POST /api/auth/logout
     *
     * En esta versión JWT es stateless: el cliente elimina sus tokens.
     * Como mejora futura se puede persistir una blacklist de refresh tokens.
     */
    async logout(req, res) {
        return res.status(200).json({ success: true, mensaje: 'Sesión cerrada correctamente.' });
    }

    async me(req, res) {
        return res.status(200).json({ success: true, usuario: req.user });
    }
}

export default new AuthController();
