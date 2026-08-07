import {
	internalErrorResponseSchema,
	validationErrorResponseSchema,
} from '../../openapi/common.schemas.js';
import { openApiRegistry } from '../../openapi/registry.js';

import {
	asignarModeradorAdminBodySchema,
	cambiarEstadoUsuarioAdminBodySchema,
	listarActoresAdminQuerySchema,
	listarActoresAdminResponseSchema,
	listarUsuariosAdminQuerySchema,
	listarUsuariosAdminResponseSchema,
	obtenerUsuarioAdminResponseSchema,
	usuarioAdminNoEncontradoResponseSchema,
	usuarioAdminParamsSchema,
	usuarioAdminProtegidoResponseSchema,
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
		path: '/api/admin/usuarios/{id}',
		tags: ['Administración'],
		summary: 'Obtener un usuario para administración',
		description:
			'Devuelve el detalle del usuario y las categorías activas disponibles para su moderación.',
		request: { params: usuarioAdminParamsSchema },
		responses: {
			200: {
				description: 'Usuario obtenido correctamente.',
				content: { 'application/json': { schema: obtenerUsuarioAdminResponseSchema } },
			},
			400: {
				description: 'Identificador inválido.',
				content: { 'application/json': { schema: validationErrorResponseSchema } },
			},
			404: {
				description: 'Usuario no encontrado.',
				content: { 'application/json': { schema: usuarioAdminNoEncontradoResponseSchema } },
			},
			500: {
				description: 'Error interno al consultar el usuario.',
				content: { 'application/json': { schema: internalErrorResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'patch',
		path: '/api/admin/usuarios/{id}/estado',
		tags: ['Administración'],
		summary: 'Dar de baja o reactivar un usuario',
		request: {
			params: usuarioAdminParamsSchema,
			body: {
				content: { 'application/json': { schema: cambiarEstadoUsuarioAdminBodySchema } },
			},
		},
		responses: {
			200: {
				description: 'Estado actualizado correctamente.',
				content: { 'application/json': { schema: obtenerUsuarioAdminResponseSchema } },
			},
			400: {
				description: 'Datos inválidos.',
				content: { 'application/json': { schema: validationErrorResponseSchema } },
			},
			404: {
				description: 'Usuario no encontrado.',
				content: { 'application/json': { schema: usuarioAdminNoEncontradoResponseSchema } },
			},
			409: {
				description: 'Los administradores no pueden cambiar de estado.',
				content: { 'application/json': { schema: usuarioAdminProtegidoResponseSchema } },
			},
			500: {
				description: 'Error interno al actualizar el estado.',
				content: { 'application/json': { schema: internalErrorResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'put',
		path: '/api/admin/usuarios/{id}/moderacion',
		tags: ['Administración'],
		summary: 'Asignar un usuario como moderador',
		description:
			'Reemplaza las categorías de moderación. Si la lista está vacía, elimina las asignaciones y restaura el rol USUARIO.',
		request: {
			params: usuarioAdminParamsSchema,
			body: {
				content: { 'application/json': { schema: asignarModeradorAdminBodySchema } },
			},
		},
		responses: {
			200: {
				description: 'Moderación asignada correctamente.',
				content: { 'application/json': { schema: obtenerUsuarioAdminResponseSchema } },
			},
			400: {
				description: 'Datos inválidos.',
				content: { 'application/json': { schema: validationErrorResponseSchema } },
			},
			404: {
				description: 'Usuario no encontrado.',
				content: { 'application/json': { schema: usuarioAdminNoEncontradoResponseSchema } },
			},
			409: {
				description: 'Los administradores no pueden cambiar de rol.',
				content: { 'application/json': { schema: usuarioAdminProtegidoResponseSchema } },
			},
			500: {
				description: 'Error interno al asignar la moderación.',
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
