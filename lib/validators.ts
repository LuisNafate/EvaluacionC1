import { z } from 'zod';

// Schema para validar números con valores por defecto
export const intSchema = (defaultValue: number) => 
  z.string().nullish().transform((val) => {
    if (!val) return defaultValue;
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  });

// Schema para números con rango (min-max)
export const clampedIntSchema = (defaultValue: number, min: number, max: number) =>
  intSchema(defaultValue).transform((val) => Math.max(min, Math.min(max, val)));

// Schema para validar formato de fecha YYYY-MM-DD
export const dateFormatSchema = z.string().refine((dateStr) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
}, { message: 'Formato de fecha inválido. Debe ser YYYY-MM-DD' });

// Schema para texto de búsqueda
export const searchSchema = z.string().nullish()
  .transform((val) => val?.trim() || '')
  .pipe(z.string().max(100));

// Schema para validar categoría (1-8)
export const categorySchema = z.number().int().min(1).max(8);

// Schema para validar rango de fechas
export const dateRangeSchema = z.object({
  dateFrom: dateFormatSchema,
  dateTo: dateFormatSchema
}).refine((data) => new Date(data.dateFrom) <= new Date(data.dateTo), {
  message: 'La fecha inicial debe ser anterior o igual a la fecha final'
});

// Schema para paginación
export const paginationSchema = z.object({
  page: clampedIntSchema(1, 1, 1000),
  limit: clampedIntSchema(10, 1, 100)
}).transform((data) => ({
  ...data,
  offset: (data.page - 1) * data.limit
}));

// Tipos inferidos
export type PaginationParams = z.infer<typeof paginationSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;

// Funciones auxiliares para mantener compatibilidad
export function parseIntSafe(value: string | null | undefined, defaultValue: number): number {
  return intSchema(defaultValue).parse(value);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function isValidDateFormat(dateStr: string): boolean {
  return dateFormatSchema.safeParse(dateStr).success;
}

export function sanitizeSearch(search: string | null | undefined, maxLength: number = 100): string {
  return searchSchema.parse(search);
}

export function isValidCategory(categoryId: number): boolean {
  return categorySchema.safeParse(categoryId).success;
}

export function validateDateRange(dateFrom: string, dateTo: string): boolean {
  return dateRangeSchema.safeParse({ dateFrom, dateTo }).success;
}

export function validatePagination(
  pageParam: string | null | undefined,
  limitParam: string | null | undefined
): PaginationParams {
  return paginationSchema.parse({ page: pageParam, limit: limitParam });
}

