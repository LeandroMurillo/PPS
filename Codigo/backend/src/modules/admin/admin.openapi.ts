import {
	internalErrorResponseSchema,
	validationErrorResponseSchema,
} from '../../openapi/common.schemas.js';
import { openApiRegistry } from '../../openapi/registry.js';

import {
	listarActoresAdminQuerySchema,
	listarActoresAdminResponseSchema,
	listarUsuariosAdminQuerySchema,
	listarUsuariosAdminResponseSchema,
} from './admin.schemas.js';

export function registerAdminOpenApi(): void {
	openApiRegistry.registerPath({
		method: 'get',
		path: '/api/admin/usuarios',
		tags: ['Administración'],
		summary: 'Listar usuarios para administración',
		description: 'Lista usuarios con búsqueda, filtros por rol y estado, orden y paginación.',
		request: { query: listarUsuariosAdminQuerySchema },
		responses: {
			200: {
				description: 'Página de usuarios obtenida correctamente.',
				content: { 'application/json': { schema: listarUsuariosAdminResponseSchema } },
			},
			400: {
				description: 'Parámetros de consulta inválidos.',
				content: { 'application/json': { schema: validationErrorResponseSchema } },
			},
			500: {
				description: 'Error interno al consultar usuarios.',
				content: { 'application/json': { schema: internalErrorResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'get',
		path: '/api/admin/actores',
		tags: ['Administración'],
		summary: 'Listar actores para administración',
		description:
			'Lista actores con búsqueda, filtros por categoría y usuario dueño, orden y paginación.',
		request: { query: listarActoresAdminQuerySchema },
		responses: {
			200: {
				description: 'Página de actores obtenida correctamente.',
				content: { 'application/json': { schema: listarActoresAdminResponseSchema } },
			},
			400: {
				description: 'Parámetros de consulta inválidos.',
				content: { 'application/json': { schema: validationErrorResponseSchema } },
			},
			500: {
				description: 'Error interno al consultar actores.',
				content: { 'application/json': { schema: internalErrorResponseSchema } },
			},
		},
	});
}
