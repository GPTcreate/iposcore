/** KRX short codes contain six ASCII digits/uppercase letters, e.g. 0015M0. */
export function isStockCode(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9A-Z]{6}$/.test(value) && value !== '000000';
}

export function normalizeStockCode(value: unknown): string {
  if (typeof value !== 'string') return '';
  const code = value.trim().toUpperCase();
  return isStockCode(code) ? code : '';
}
