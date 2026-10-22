/**
 * Utilidades de validación estricta de tipos y valores numéricos finitos
 * Evita errores 500 ante entradas con texto, NaN, Infinity, booleanos u objetos.
 */

export function isValidId(val) {
  if (val === null || val === undefined || typeof val === 'object' || typeof val === 'boolean') {
    return false;
  }
  if (typeof val === 'string' && val.trim() === '') {
    return false;
  }
  const n = Number(val);
  return Number.isInteger(n) && Number.isFinite(n) && n > 0;
}

export function isValidQuantity(val) {
  return isValidId(val);
}

export function isValidPrice(val) {
  if (val === null || val === undefined || typeof val === 'object' || typeof val === 'boolean') {
    return false;
  }
  if (typeof val === 'string' && val.trim() === '') {
    return false;
  }
  const n = Number(val);
  return typeof n === 'number' && Number.isFinite(n) && !isNaN(n) && n > 0;
}

export function isValidStock(val) {
  if (val === null || val === undefined || typeof val === 'object' || typeof val === 'boolean') {
    return false;
  }
  if (typeof val === 'string' && val.trim() === '') {
    return false;
  }
  const n = Number(val);
  return Number.isInteger(n) && Number.isFinite(n) && n >= 0;
}

export function isValidPercentage(val) {
  if (val === null || val === undefined || typeof val === 'object' || typeof val === 'boolean') {
    return false;
  }
  if (typeof val === 'string' && val.trim() === '') {
    return false;
  }
  const n = Number(val);
  return typeof n === 'number' && Number.isFinite(n) && !isNaN(n) && n > 0 && n <= 100;
}

export function isNonEmptyString(val) {
  return typeof val === 'string' && val.trim().length > 0;
}

export function safeTrim(val) {
  return typeof val === 'string' ? val.trim() : '';
}
