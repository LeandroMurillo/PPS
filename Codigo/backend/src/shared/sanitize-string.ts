/* eslint-disable no-control-regex */
/**
 * Sanitiza una cadena de texto eliminando caracteres de control nulos,
 * caracteres invisibles / de ancho cero y normalizando espacios en blanco Unicode.
 */
export function sanitizeString(value: string): string {
	if (typeof value !== 'string') return value;

	return (
		value
			// Eliminar bytes nulos y caracteres de control no imprimibles (preservando \t, \n, \r)
			.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
			// Eliminar caracteres invisibles, marcas de sobreescritura bidireccional y zero-width (BOM, ZWSP, ZWNJ, ZWJ, etc.)
			.replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g, '')
			// Normalizar espacios no rompibles (NBSP) y otros espacios Unicode a espacio estándar
			.replace(/[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g, ' ')
	);
}
