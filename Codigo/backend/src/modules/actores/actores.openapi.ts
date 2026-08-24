import { internalErrorResponseSchema, validationErrorResponseSchema } from '../../openapi/common.schemas.js';
import { openApiRegistry } from '../../openapi/registry.js';

import {
	actorNoEncontradoResponseSchema,
	listarActoresQuerySchema,
	listarActoresResponseSchema,
	listarEventosPublicosQuerySchema,
	listarEventosPublicosResponseSchema,
	obtenerActoresMapaQuerySchema,
	obtenerActoresMapaResponseSchema,
	obtenerActorParamsSchema,
	obtenerActorResponseSchema,
	obtenerEstadisticasPublicasResponseSchema,
	obtenerFiltrosListadoActoresResponseSchema,
	obtenerFiltrosMapaResponseSchema,
} from './actores.schemas.js';

export function registerActoresOpenApi(): void {
	openApiRegistry.registerPath({
		method: 'get',

		path: '/api/publico/actores/filtros',

		tags: ['Actores públicos'],

		summary: 'Obtener filtros del directorio público',

		description:
			'Devuelve las categorías y departamentos disponibles para filtrar el directorio público de actores.',

		responses: {
			200: {
				description: 'Filtros del directorio obtenidos correctamente.',

				content: {
					'application/json': {
						schema: obtenerFiltrosListadoActoresResponseSchema,
					},
				},
			},

			500: {
				description: 'Se produjo un error interno al consultar los filtros del directorio.',

				content: {
					'application/json': {
						schema: internalErrorResponseSchema,
					},
				},
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'get',

		path: '/api/publico/actores/mapa',

		tags: ['Actores públicos'],

		summary: 'Obtener actores del mapa público',

		description:
			'Devuelve actores culturales activos visibles en el mapa público. Permite filtrar por texto, departamento y categorías.',

		request: {
			query: obtenerActoresMapaQuerySchema,
		},

		responses: {
			200: {
				description: 'Actores del mapa obtenidos correctamente.',

				content: {
					'application/json': {
						schema: obtenerActoresMapaResponseSchema,
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
				description: 'Se produjo un error interno al consultar los actores del mapa.',

				content: {
					'application/json': {
						schema: internalErrorResponseSchema,
					},
				},
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'get',

		path: '/api/publico/actores/mapa/filtros',

		tags: ['Actores públicos'],

		summary: 'Obtener filtros del mapa público',

		description:
			'Devuelve las categorías y departamentos disponibles para filtrar actores visibles en el mapa público.',

		responses: {
			200: {
				description: 'Filtros del mapa obtenidos correctamente.',

				content: {
					'application/json': {
						schema: obtenerFiltrosMapaResponseSchema,
					},
				},
			},

			500: {
				description: 'Se produjo un error interno al consultar los filtros del mapa.',

				content: {
					'application/json': {
						schema: internalErrorResponseSchema,
					},
				},
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'get',

		path: '/api/publico/actores/eventos',

		tags: ['Actores públicos'],

		summary: 'Listar eventos de la agenda cultural pública',

		description:
			'Devuelve los próximos eventos calendarizados de actores culturales activos con filtros por texto, departamento, categoría y rango de fechas.',

		request: {
			query: listarEventosPublicosQuerySchema,
		},

		responses: {
			200: {
				description: 'Listado de eventos públicos obtenido correctamente.',

				content: {
					'application/json': {
						schema: listarEventosPublicosResponseSchema,
					},
				},
			},

			400: {
				description: 'Parámetros de consulta no válidos.',

				content: {
					'application/json': {
						schema: validationErrorResponseSchema,
					},
				},
			},

			500: {
				description: 'Error interno al consultar la agenda de eventos.',

				content: {
					'application/json': {
						schema: internalErrorResponseSchema,
					},
				},
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'get',

		path: '/api/publico/actores/estadisticas',

		tags: ['Actores públicos'],

		summary: 'Obtener resumen consolidado de estadísticas culturales',

		description:
			'Devuelve los contadores consolidados de impacto cultural provincial: total de actores activos, total de espacios, departamentos alcanzados y categorías activas.',

		responses: {
			200: {
				description: 'Resumen estadístico obtenido correctamente.',

				content: {
					'application/json': {
						schema: obtenerEstadisticasPublicasResponseSchema,
					},
				},
			},

			500: {
				description: 'Error interno al calcular las estadísticas públicas.',

				content: {
					'application/json': {
						schema: internalErrorResponseSchema,
					},
				},
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'get',

		path: '/api/publico/actores/{id}',

		tags: ['Actores públicos'],

		summary: 'Obtener ficha pública de un actor',

		description:
			'Devuelve la ficha pública completa de un actor cultural activo, incluyendo datos generales, ubicación pública, portafolio, eventos, respuestas públicas e integrantes.',

		request: {
			params: obtenerActorParamsSchema,
		},

		responses: {
			200: {
				description: 'Ficha pública obtenida correctamente.',

				content: {
					'application/json': {
						schema: obtenerActorResponseSchema,
					},
				},
			},

			400: {
				description: 'El identificador del actor no es válido.',

				content: {
					'application/json': {
						schema: validationErrorResponseSchema,
					},
				},
			},

			404: {
				description: 'No existe un actor público activo con ese identificador.',

				content: {
					'application/json': {
						schema: actorNoEncontradoResponseSchema,
					},
				},
			},

			500: {
				description: 'Se produjo un error interno al consultar la ficha del actor.',

				content: {
					'application/json': {
						schema: internalErrorResponseSchema,
					},
				},
			},
		},
	});

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
