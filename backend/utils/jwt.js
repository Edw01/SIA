import crypto from 'crypto';

const DEFAULT_ACCESS_EXPIRES_IN_SECONDS = 60 * 60;
const DEFAULT_REFRESH_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7;

function getSecret(tokenType) {
    const secret = tokenType === 'refresh'
        ? process.env.JWT_REFRESH_SECRET
        : process.env.JWT_SECRET;

    return secret || (tokenType === 'refresh'
        ? 'sia_refresh_secret_dev_only_change_me'
        : 'sia_access_secret_dev_only_change_me');
}

function encodeBase64Url(value) {
    return Buffer.from(value)
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

function decodeBase64Url(value) {
    const normalized = value
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const padding = '='.repeat((4 - normalized.length % 4) % 4);
    return Buffer.from(normalized + padding, 'base64').toString('utf8');
}

function parseExpiresInSeconds(value, fallback) {
    if (!value) return fallback;

    if (/^\d+$/.test(String(value))) {
        return Number(value);
    }

    const match = String(value).match(/^(\d+)([smhd])$/);
    if (!match) return fallback;

    const amount = Number(match[1]);
    const unit = match[2];
    const multipliers = {
        s: 1,
        m: 60,
        h: 60 * 60,
        d: 60 * 60 * 24
    };

    return amount * multipliers[unit];
}

function sign(data, secret) {
    return crypto
        .createHmac('sha256', secret)
        .update(data)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

export function generateToken(payload, options = {}) {
    const tokenType = options.type || 'access';
    const fallbackExpiration = tokenType === 'refresh'
        ? DEFAULT_REFRESH_EXPIRES_IN_SECONDS
        : DEFAULT_ACCESS_EXPIRES_IN_SECONDS;
    const expiresIn = parseExpiresInSeconds(options.expiresIn, fallbackExpiration);
    const now = Math.floor(Date.now() / 1000);

    const header = {
        alg: 'HS256',
        typ: 'JWT'
    };

    const body = {
        ...payload,
        tokenType,
        iat: now,
        exp: now + expiresIn
    };

    const encodedHeader = encodeBase64Url(JSON.stringify(header));
    const encodedPayload = encodeBase64Url(JSON.stringify(body));
    const unsignedToken = `${encodedHeader}.${encodedPayload}`;
    const signature = sign(unsignedToken, getSecret(tokenType));

    return `${unsignedToken}.${signature}`;
}

export function verifyToken(token, options = {}) {
    if (!token || typeof token !== 'string') {
        throw new Error('Token no proporcionado.');
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
        throw new Error('Token mal formado.');
    }

    const [encodedHeader, encodedPayload, receivedSignature] = parts;
    const unsignedToken = `${encodedHeader}.${encodedPayload}`;
    const payload = JSON.parse(decodeBase64Url(encodedPayload));
    const expectedType = options.type || payload.tokenType || 'access';
    const expectedSignature = sign(unsignedToken, getSecret(expectedType));

    const receivedBuffer = Buffer.from(receivedSignature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (receivedBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)) {
        throw new Error('Firma de token inválida.');
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
        throw new Error('Token expirado.');
    }

    if (options.type && payload.tokenType !== options.type) {
        throw new Error('Tipo de token inválido.');
    }

    return payload;
}

export function generateAccessToken(usuario) {
    return generateToken({
        id: usuario.id,
        rut: usuario.rut,
        nombre: usuario.nombre,
        rol: usuario.rol
    }, {
        type: 'access',
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h'
    });
}

export function generateRefreshToken(usuario) {
    return generateToken({
        id: usuario.id,
        rut: usuario.rut,
        rol: usuario.rol
    }, {
        type: 'refresh',
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    });
}
