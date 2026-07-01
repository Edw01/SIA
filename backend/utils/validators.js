export function parsePositiveInteger(value, fieldName) {
    const number = Number(value);

    if (!Number.isInteger(number) || number <= 0) {
        throw new Error(`${fieldName} debe ser un número entero positivo.`);
    }

    return number;
}

export function parseNonNegativeInteger(value, fieldName) {
    const number = Number(value);

    if (!Number.isInteger(number) || number < 0) {
        throw new Error(`${fieldName} debe ser un número entero no negativo.`);
    }

    return number;
}

export function validateRequiredString(value, fieldName, maxLength = 255) {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error(`${fieldName} es obligatorio.`);
    }

    const cleanedValue = value.trim();
    if (cleanedValue.length > maxLength) {
        throw new Error(`${fieldName} no puede superar ${maxLength} caracteres.`);
    }

    return cleanedValue;
}
