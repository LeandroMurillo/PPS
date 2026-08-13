/**
 * Fuente única de verdad para las opciones e identidades de género en el frontend.
 */
export const GENEROS = [
	{ code: 'F', label: 'Mujer' },
	{ code: 'M', label: 'Varón' },
	{ code: 'MF', label: 'Mujer trans/travesti' },
	{ code: 'FM', label: 'Varón trans/masculinidad trans' },
	{ code: 'B', label: 'No binario' },
	{ code: 'O', label: 'Otra' },
	{ code: 'N', label: 'No desea responder' },
] as const;

export type GeneroCodigo = (typeof GENEROS)[number]['code'];

export const GENEROS_MAP: Record<string, string> = Object.fromEntries(
	GENEROS.map((g) => [g.code, g.label]),
);

/**
 * Obtiene la etiqueta descriptiva en español dado su código de ENUM.
 */
export function getGeneroEtiqueta(codigo: string | null | undefined): string {
	if (!codigo) return '—';
	return GENEROS_MAP[codigo] ?? codigo;
}

export default GENEROS;
