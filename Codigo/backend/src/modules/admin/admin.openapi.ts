import { internalErrorResponseSchema, validationErrorResponseSchema } from '../../openapi/common.schemas.js';
import { openApiRegistry } from '../../openapi/registry.js';

import {
	asignarModeradorAdminBodySchema,
	actorAdminNoEncontradoResponseSchema,
	actorAdminParamsSchema,
	cambiarEstadoActoresAdminBodySchema,
	cambiarEstadoActoresAdminResponseSchema,
	cambiarEstadoUsuarioAdminBodySchema,
	categoriaAdminDuplicadaResponseSchema,
	categoriaAdminNoEncontradaResponseSchema,
	categoriaAdminParamsSchema,
	guardarCategoriaAdminBodySchema,
	guardarSubcategoriaAdminBodySchema,
	listarActoresAdminQuerySchema,
	listarActoresAdminResponseSchema,
	listarCategoriasAdminQuerySchema,
	listarCategoriasAdminResponseSchema,
	listarSubcategoriasAdminQuerySchema,
	listarSubcategoriasAdminResponseSchema,
	listarUsuariosAdminQuerySchema,
	listarUsuariosAdminResponseSchema,
	obtenerUsuarioAdminResponseSchema,
	obtenerActorAdminResponseSchema,
	obtenerCategoriaAdminResponseSchema,
	obtenerSubcategoriaAdminResponseSchema,
	subcategoriaAdminCategoriaParamSchema,
	subcategoriaAdminDuplicadaResponseSchema,
	subcategoriaAdminNoEncontradaResponseSchema,
	subcategoriaAdminParamsSchema,
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
		description: 'Devuelve el detalle del usuario y las categorías activas disponibles para su moderación.',
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
			'Lista actores con búsqueda, filtros por categoría, departamento, tipo de actor y estado, orden y paginación.',
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

	openApiRegistry.registerPath({
		method: 'get',
		path: '/api/admin/actores/{id}',
		tags: ['Administración'],
		summary: 'Obtener el perfil administrativo de un actor',
		description:
			'Devuelve los datos generales, la ubicación completa, los integrantes y el portafolio del actor, sin restringir por estado.',
		request: { params: actorAdminParamsSchema },
		responses: {
			200: {
				description: 'Actor obtenido correctamente.',
				content: { 'application/json': { schema: obtenerActorAdminResponseSchema } },
			},
			400: {
				description: 'Identificador inválido.',
				content: { 'application/json': { schema: validationErrorResponseSchema } },
			},
			404: {
				description: 'Actor no encontrado.',
				content: { 'application/json': { schema: actorAdminNoEncontradoResponseSchema } },
			},
			500: {
				description: 'Error interno al consultar el actor.',
				content: { 'application/json': { schema: internalErrorResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'patch',
		path: '/api/admin/actores/estado',
		tags: ['Administración'],
		summary: 'Activar o dar de baja actores',
		description: 'Actualiza el estado de uno o más actores seleccionados desde el listado administrativo.',
		request: {
			body: {
				content: { 'application/json': { schema: cambiarEstadoActoresAdminBodySchema } },
			},
		},
		responses: {
			200: {
				description: 'Estados actualizados correctamente.',
				content: { 'application/json': { schema: cambiarEstadoActoresAdminResponseSchema } },
			},
			400: {
				description: 'Datos inválidos.',
				content: { 'application/json': { schema: validationErrorResponseSchema } },
			},
			500: {
				description: 'Error interno al actualizar actores.',
				content: { 'application/json': { schema: internalErrorResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'get',
		path: '/api/admin/categorias',
		tags: ['Administración'],
		summary: 'Listar categorías para administración',
		description: 'Lista categorías con búsqueda, filtro de estado, orden y paginación.',
		request: { query: listarCategoriasAdminQuerySchema },
		responses: {
			200: {
				description: 'Página de categorías obtenida correctamente.',
				content: { 'application/json': { schema: listarCategoriasAdminResponseSchema } },
			},
			400: {
				description: 'Parámetros de consulta inválidos.',
				content: { 'application/json': { schema: validationErrorResponseSchema } },
			},
			500: {
				description: 'Error interno al consultar categorías.',
				content: { 'application/json': { schema: internalErrorResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'get',
		path: '/api/admin/categorias/{id}',
		tags: ['Administración'],
		summary: 'Obtener una categoría',
		request: { params: categoriaAdminParamsSchema },
		responses: {
			200: {
				description: 'Categoría obtenida correctamente.',
				content: { 'application/json': { schema: obtenerCategoriaAdminResponseSchema } },
			},
			400: {
				description: 'Identificador inválido.',
				content: { 'application/json': { schema: validationErrorResponseSchema } },
			},
			404: {
				description: 'Categoría no encontrada.',
				content: { 'application/json': { schema: categoriaAdminNoEncontradaResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'post',
		path: '/api/admin/categorias',
		tags: ['Administración'],
		summary: 'Crear una categoría',
		request: {
			body: { content: { 'application/json': { schema: guardarCategoriaAdminBodySchema } } },
		},
		responses: {
			201: {
				description: 'Categoría creada correctamente.',
				content: { 'application/json': { schema: obtenerCategoriaAdminResponseSchema } },
			},
			400: {
				description: 'Datos inválidos.',
				content: { 'application/json': { schema: validationErrorResponseSchema } },
			},
			409: {
				description: 'Ya existe una categoría con el mismo nombre.',
				content: { 'application/json': { schema: categoriaAdminDuplicadaResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'put',
		path: '/api/admin/categorias/{id}',
		tags: ['Administración'],
		summary: 'Modificar una categoría',
		request: {
			params: categoriaAdminParamsSchema,
			body: { content: { 'application/json': { schema: guardarCategoriaAdminBodySchema } } },
		},
		responses: {
			200: {
				description: 'Categoría modificada correctamente.',
				content: { 'application/json': { schema: obtenerCategoriaAdminResponseSchema } },
			},
			400: {
				description: 'Datos inválidos.',
				content: { 'application/json': { schema: validationErrorResponseSchema } },
			},
			404: {
				description: 'Categoría no encontrada.',
				content: { 'application/json': { schema: categoriaAdminNoEncontradaResponseSchema } },
			},
			409: {
				description: 'Ya existe una categoría con el mismo nombre.',
				content: { 'application/json': { schema: categoriaAdminDuplicadaResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'delete',
		path: '/api/admin/categorias/{id}',
		tags: ['Administración'],
		summary: 'Dar de baja una categoría',
		description: 'Realiza una baja lógica para preservar las relaciones históricas.',
		request: { params: categoriaAdminParamsSchema },
		responses: {
			200: {
				description: 'Categoría dada de baja correctamente.',
				content: { 'application/json': { schema: obtenerCategoriaAdminResponseSchema } },
			},
			400: {
				description: 'Identificador inválido.',
				content: { 'application/json': { schema: validationErrorResponseSchema } },
			},
			404: {
				description: 'Categoría no encontrada.',
				content: { 'application/json': { schema: categoriaAdminNoEncontradaResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'get',
		path: '/api/admin/categorias/{idCategoria}/subcategorias',
		tags: ['Administración'],
		summary: 'Listar subcategorías de una categoría',
		description: 'Lista subcategorías con búsqueda, filtro de estado, orden y paginación.',
		request: { params: subcategoriaAdminCategoriaParamSchema, query: listarSubcategoriasAdminQuerySchema },
		responses: {
			200: {
				description: 'Página de subcategorías obtenida correctamente.',
				content: { 'application/json': { schema: listarSubcategoriasAdminResponseSchema } },
			},
			400: {
				description: 'Parámetros inválidos.',
				content: { 'application/json': { schema: validationErrorResponseSchema } },
			},
			404: {
				description: 'Categoría no encontrada.',
				content: { 'application/json': { schema: categoriaAdminNoEncontradaResponseSchema } },
			},
			500: {
				description: 'Error interno.',
				content: { 'application/json': { schema: internalErrorResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'post',
		path: '/api/admin/categorias/{idCategoria}/subcategorias',
		tags: ['Administración'],
		summary: 'Crear una subcategoría',
		request: {
			params: subcategoriaAdminCategoriaParamSchema,
			body: { content: { 'application/json': { schema: guardarSubcategoriaAdminBodySchema } } },
		},
		responses: {
			201: {
				description: 'Subcategoría creada correctamente.',
				content: { 'application/json': { schema: obtenerSubcategoriaAdminResponseSchema } },
			},
			400: {
				description: 'Datos inválidos.',
				content: { 'application/json': { schema: validationErrorResponseSchema } },
			},
			404: {
				description: 'Categoría no encontrada.',
				content: { 'application/json': { schema: categoriaAdminNoEncontradaResponseSchema } },
			},
			409: {
				description: 'Ya existe una subcategoría con ese nombre.',
				content: { 'application/json': { schema: subcategoriaAdminDuplicadaResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'get',
		path: '/api/admin/categorias/{idCategoria}/subcategorias/{id}',
		tags: ['Administración'],
		summary: 'Obtener una subcategoría',
		request: { params: subcategoriaAdminParamsSchema },
		responses: {
			200: {
				description: 'Subcategoría obtenida correctamente.',
				content: { 'application/json': { schema: obtenerSubcategoriaAdminResponseSchema } },
			},
			400: {
				description: 'Identificador inválido.',
				content: { 'application/json': { schema: validationErrorResponseSchema } },
			},
			404: {
				description: 'Subcategoría no encontrada.',
				content: { 'application/json': { schema: subcategoriaAdminNoEncontradaResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'put',
		path: '/api/admin/categorias/{idCategoria}/subcategorias/{id}',
		tags: ['Administración'],
		summary: 'Modificar una subcategoría',
		request: {
			params: subcategoriaAdminParamsSchema,
			body: { content: { 'application/json': { schema: guardarSubcategoriaAdminBodySchema } } },
		},
		responses: {
			200: {
				description: 'Subcategoría modificada correctamente.',
				content: { 'application/json': { schema: obtenerSubcategoriaAdminResponseSchema } },
			},
			400: {
				description: 'Datos inválidos.',
				content: { 'application/json': { schema: validationErrorResponseSchema } },
			},
			404: {
				description: 'Subcategoría no encontrada.',
				content: { 'application/json': { schema: subcategoriaAdminNoEncontradaResponseSchema } },
			},
			409: {
				description: 'Ya existe una subcategoría con ese nombre.',
				content: { 'application/json': { schema: subcategoriaAdminDuplicadaResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'delete',
		path: '/api/admin/categorias/{idCategoria}/subcategorias/{id}',
		tags: ['Administración'],
		summary: 'Dar de baja una subcategoría',
		request: { params: subcategoriaAdminParamsSchema },
		responses: {
			200: {
				description: 'Subcategoría dada de baja correctamente.',
				content: { 'application/json': { schema: obtenerSubcategoriaAdminResponseSchema } },
			},
			400: {
				description: 'Identificador inválido.',
				content: { 'application/json': { schema: validationErrorResponseSchema } },
			},
			404: {
				description: 'Subcategoría no encontrada.',
				content: { 'application/json': { schema: subcategoriaAdminNoEncontradaResponseSchema } },
			},
		},
	});
}
