import { OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi';

import { registerActoresOpenApi } from '../modules/actores/actores.openapi.js';

import { openApiRegistry } from './registry.js';

/**
 * Registramos aquí todos los módulos documentados.
 *
 * Cuando aparezcan nuevos módulos:
 *
 * registerCategoriasOpenApi();
 * registerMapaOpenApi();
 * registerUsuariosOpenApi();
 */
registerActoresOpenApi();

const generator = new OpenApiGeneratorV31(openApiRegistry.definitions, {
	sortComponents: 'alphabetically',
});

export const openApiDocument = generator.generateDocument({
	openapi: '3.1.0',

	info: {
		title: 'Mapa Cultural de Tucumán API',

		version: '1.0.0',

		description: 'API REST del directorio y mapa público de actores culturales de Tucumán.',
	},

	servers: [
		{
			url: '/',
			description: 'Servidor actual',
		},
	],

	tags: [
		{
			name: 'Actores públicos',
			description: 'Consulta pública del directorio de actores culturales.',
		},
	],
});
