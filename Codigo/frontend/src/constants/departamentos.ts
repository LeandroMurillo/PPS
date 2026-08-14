/**
 * Departamentos de la Provincia de Tucumán.
 * Fuente única de verdad para selectores y filtros geográficos.
 */
export const DEPARTAMENTOS_TUCUMAN = [
	'Burruyacú',
	'Capital',
	'Chicligasta',
	'Cruz Alta',
	'Famaillá',
	'Graneros',
	'Juan Bautista Alberdi',
	'La Cocha',
	'Leales',
	'Lules',
	'Monteros',
	'Río Chico',
	'Simoca',
	'Tafí del Valle',
	'Tafí Viejo',
	'Trancas',
	'Yerba Buena',
] as const;

export type DepartamentoTucuman = (typeof DEPARTAMENTOS_TUCUMAN)[number];

export default DEPARTAMENTOS_TUCUMAN;
