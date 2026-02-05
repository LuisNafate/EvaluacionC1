// Funciones para validar datos

// Convierte string a numero, si falla devuelve el default
export function parseIntSafe(value: string | null | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

// Limita un numero entre min y max
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// Revisa si la fecha esta en formato YYYY-MM-DD
export function isValidDateFormat(dateStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
}

// Limpia texto de busqueda
export function sanitizeSearch(search: string | null | undefined, maxLength: number = 100): string {
  if (!search) return '';
  return search.trim().slice(0, maxLength);
}

// Revisa que la categoria sea valida (1-8)
export function isValidCategory(categoryId: number): boolean {
  return Number.isInteger(categoryId) && categoryId >= 1 && categoryId <= 8;
}

// Revisa que date_from sea antes que date_to
export function validateDateRange(dateFrom: string, dateTo: string): boolean {
  if (!isValidDateFormat(dateFrom) || !isValidDateFormat(dateTo)) {
    return false;
  }
  return new Date(dateFrom) <= new Date(dateTo);
}

// Info de paginacion
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

// Valida y limpia parametros de paginacion
export function validatePagination(
  pageParam: string | null | undefined,
  limitParam: string | null | undefined
): PaginationParams {
  const page = clamp(parseIntSafe(pageParam, 1), 1, 1000);
  const limit = clamp(parseIntSafe(limitParam, 10), 1, 100);
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

