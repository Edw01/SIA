import { verifyToken } from '../utils/jwt.js';

export function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Token de acceso requerido.' });
    }

    try {
        const payload = verifyToken(token, { type: 'access' });
        req.user = {
            id: Number(payload.id),
            rut: payload.rut,
            nombre: payload.nombre,
            rol: payload.rol
        };
        return next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado.' });
    }
}
