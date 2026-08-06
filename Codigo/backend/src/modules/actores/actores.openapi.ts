import {
	internalErrorResponseSchema,
	validationErrorResponseSchema,
} from '../../openapi/common.schemas.js';
import { openApiRegistry } from '../../openapi/registry.js';

import { listarActoresQuerySchema, listarActoresResponseSchema } from './actores.schemas.js';

export function registerActoresOpenApi(): void {
	openApiRegistry.registerPath({
		method: 'get',

		path: '/api/publico/actores',

		tags: ['Actores públicos'],

		summary: 'Listar actores culturales',

		description:
			'Devuelve una página de actores culturales activos. Permite filtrar por texto, departamento y categoría.',

		request: {
			query: listarActoresQuerySchema,
		},

		responses: {
			200: {
				description: 'Página de actores obtenida correctamente.',

				content: {
					'application/json': {
						schema: listarActoresResponseSchema,
					},
				},
			},

			400: {
				description: 'Uno o más parámetros de consulta no son válidos.',

				content: {
					'application/json': {
						schema: validationErrorResponseSchema,
					},
				},
			},

			500: {
				description: 'Se produjo un error interno al consultar los actores.',

				content: {
					'application/json': {
						schema: internalErrorResponseSchema,
					},
				},
			},
		},
	});
}
