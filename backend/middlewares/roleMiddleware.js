const ROLE_ALIASES = {
    Admin: 'Administrador',
    administrador: 'Administrador',
    coordinador: 'Coordinador',
    estudiante: 'Estudiante'
};

export function normalizeRole(role) {
    return ROLE_ALIASES[role] || role;
}

export function authorizeRoles(...allowedRoles) {
    const normalizedAllowedRoles = allowedRoles.map(normalizeRole);

    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Usuario no autenticado.' });
        }

        const userRole = normalizeRole(req.user.rol);
        if (!normalizedAllowedRoles.includes(userRole)) {
            return res.status(403).json({ error: 'No tienes permisos para realizar esta acción.' });
        }

        return next();
    };
}
