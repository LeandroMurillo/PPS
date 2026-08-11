const RESERVED_SLUGS = new Set(['new', 'edit', 'formulario', 'subcategorias', 'create']);

/**
 * Convierte un texto en un slug amigable para URLs:
 * minúsculas, remueve tildes/diacríticos, ñ/Ñ -> n, sustituye caracteres especiales por guiones.
 */
export function slugify(text: string): string {
	if (!text || typeof text !== 'string') return 'elemento';

	const normalized = text
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/ñ/g, 'n')
		.replace(/Ñ/g, 'n')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.replace(/-{2,}/g, '-');

	return normalized || 'elemento';
}

/**
 * Construye un slug combinando el ID numérico y el nombre (ej. "12-juan-perez").
 * Usado para Actores, donde no hay garantía de unicidad del nombre.
 */
export function buildSlugConId(id: number | string, nombre: string): string {
	const cleanSlug = slugify(nombre);
	return `${id}-${cleanSlug}`;
}

/**
 * Construye un slug únicamente a partir del nombre (ej. "artes-visuales").
 * Si el slug coincide con una palabra reservada (ej. "new") y se provee ID,
 * usa fallback "id-nombre" para evitar colisión de rutas.
 */
export function buildSlugSinId(nombre: string, id?: number): string {
	const cleanSlug = slugify(nombre);
	if (RESERVED_SLUGS.has(cleanSlug) && id !== undefined) {
		return buildSlugConId(id, nombre);
	}
	return cleanSlug;
}

/**
 * Extrae el ID numérico inicial de un slug (ej. "12-juan-perez" -> 12).
 * Retorna null si el slug no comienza con números.
 */
export function parseIdDesdeSlug(slugParam?: string): number | null {
	if (!slugParam) return null;
	const match = slugParam.match(/^(\d+)/);
	if (!match) return null;
	const id = Number(match[1]);
	return Number.isInteger(id) && id > 0 ? id : null;
}
