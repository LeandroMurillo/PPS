import { z } from 'zod';

import { internalErrorResponseSchema, validationErrorResponseSchema } from '../../openapi/common.schemas.js';
import { openApiRegistry } from '../../openapi/registry.js';

import {
	asignarModeradorAdminBodySchema,
	actorAdminNoEncontradoResponseSchema,
	actorAdminParamsSchema,
	buscarFormularioAdminResponseSchema,
	cambiarEstadoActoresAdminBodySchema,
	cambiarEstadoActoresAdminResponseSchema,
	cambiarEstadoUsuarioAdminBodySchema,
	crearPreguntaFormularioAdminBodySchema,
	categoriaAdminDuplicadaResponseSchema,
	categoriaAdminNoEncontradaResponseSchema,
	categoriaAdminParamsSchema,
	formularioAdminDuplicadoResponseSchema,
	formularioAdminNoEncontradoResponseSchema,
	formularioAdminParamsSchema,
	formularioSubcategoriaAdminParamsSchema,
	guardarCategoriaAdminBodySchema,
	guardarFormularioAdminBodySchema,
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
	asociarPreguntaFormularioAdminBodySchema,
	auditarIntegridadSistemaAdminResponseSchema,
	listarPreguntasAdminQuerySchema,
	listarPreguntasAdminResponseSchema,
	obtenerFormularioAdminResponseSchema,
	editarPreguntaAdminBodySchema,
	preguntaAdminParamsSchema,
	preguntaBancoAdminSchema,
	preguntaFormularioAdminParamsSchema,
	reemplazarPreguntaFormularioAdminBodySchema,
	subcategoriaAdminCategoriaParamSchema,
	subcategoriaAdminDuplicadaResponseSchema,
	subcategoriaAdminNoEncontradaResponseSchema,
	subcategoriaAdminParamsSchema,
	usuarioAdminNoEncontradoResponseSchema,
	usuarioAdminParamsSchema,
	usuarioAdminProtegidoResponseSchema,
	usuarioAutoBajaProtegidoResponseSchema,
	usuarioModeradorProtegidoResponseSchema,
	actividadArcaCodigoParamSchema,
	actividadArcaDuplicadaResponseSchema,
	actividadArcaEnUsoResponseSchema,
	actividadArcaNoEncontradaResponseSchema,
	editarActividadArcaAdminBodySchema,
	guardarActividadArcaAdminBodySchema,
	importarActividadesArcaAdminBodySchema,
	importarActividadesArcaAdminResponseSchema,
	listarActividadesArcaAdminQuerySchema,
	listarActividadesArcaAdminResponseSchema,
	obtenerActividadArcaAdminResponseSchema,
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
				description: 'No se puede cambiar el estado propio ni el de un administrador.',
				content: {
					'application/json': {
						schema: z.union([usuarioAdminProtegidoResponseSchema, usuarioAutoBajaProtegidoResponseSchema]),
					},
				},
			},
			403: {
				description: 'Un moderador no puede cambiar el estado de otro moderador.',
				content: { 'application/json': { schema: usuarioModeradorProtegidoResponseSchema } },
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
			'Devuelve los datos generales, la ubicación completa, los integrantes, el portafolio y las encuestas del actor, sin restringir por estado.',
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

	for (const method of ['get', 'post', 'put'] as const) {
		openApiRegistry.registerPath({
			method,
			path: '/api/admin/categorias/{idCategoria}/formulario',
			tags: ['Administración'],
			summary:
				method === 'get'
					? 'Obtener el formulario de una categoría'
					: method === 'post'
						? 'Crear el formulario de una categoría'
						: 'Modificar el formulario de una categoría',
			request: {
				params: subcategoriaAdminCategoriaParamSchema,
				...(method === 'get'
					? {}
					: { body: { content: { 'application/json': { schema: guardarFormularioAdminBodySchema } } } }),
			},
			responses: {
				[method === 'post' ? 201 : 200]: {
					description: 'Formulario procesado correctamente.',
					content: {
						'application/json': {
							schema:
								method === 'get'
									? buscarFormularioAdminResponseSchema
									: obtenerFormularioAdminResponseSchema,
						},
					},
				},
				400: {
					description: 'Datos inválidos.',
					content: { 'application/json': { schema: validationErrorResponseSchema } },
				},
				404: {
					description: 'Categoría o formulario no encontrado.',
					content: { 'application/json': { schema: formularioAdminNoEncontradoResponseSchema } },
				},
				409: {
					description: 'Ya existe un formulario para la categoría.',
					content: { 'application/json': { schema: formularioAdminDuplicadoResponseSchema } },
				},
			},
		});
	}

	for (const method of ['get', 'post', 'put'] as const) {
		openApiRegistry.registerPath({
			method,
			path: '/api/admin/categorias/{idCategoria}/subcategorias/{idSubcategoria}/formulario',
			tags: ['Administración'],
			summary:
				method === 'get'
					? 'Obtener el formulario de una subcategoría'
					: method === 'post'
						? 'Crear el formulario de una subcategoría'
						: 'Modificar el formulario de una subcategoría',
			request: {
				params: formularioSubcategoriaAdminParamsSchema,
				...(method === 'get'
					? {}
					: { body: { content: { 'application/json': { schema: guardarFormularioAdminBodySchema } } } }),
			},
			responses: {
				[method === 'post' ? 201 : 200]: {
					description: 'Formulario procesado correctamente.',
					content: {
						'application/json': {
							schema:
								method === 'get'
									? buscarFormularioAdminResponseSchema
									: obtenerFormularioAdminResponseSchema,
						},
					},
				},
				400: {
					description: 'Datos inválidos.',
					content: { 'application/json': { schema: validationErrorResponseSchema } },
				},
				404: {
					description: 'Subcategoría o formulario no encontrado.',
					content: { 'application/json': { schema: formularioAdminNoEncontradoResponseSchema } },
				},
				409: {
					description: 'Ya existe un formulario para la subcategoría.',
					content: { 'application/json': { schema: formularioAdminDuplicadoResponseSchema } },
				},
			},
		});
	}

	openApiRegistry.registerPath({
		method: 'post',
		path: '/api/admin/formularios/{idFormulario}/preguntas',
		tags: ['Administración'],
		summary: 'Crear y agregar una pregunta a un formulario',
		request: {
			params: formularioAdminParamsSchema,
			body: { content: { 'application/json': { schema: crearPreguntaFormularioAdminBodySchema } } },
		},
		responses: {
			201: {
				description: 'Pregunta agregada correctamente.',
				content: { 'application/json': { schema: obtenerFormularioAdminResponseSchema } },
			},
			400: {
				description: 'Datos inválidos.',
				content: { 'application/json': { schema: validationErrorResponseSchema } },
			},
			404: {
				description: 'Formulario no encontrado.',
				content: { 'application/json': { schema: formularioAdminNoEncontradoResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'delete',
		path: '/api/admin/formularios/{idFormulario}/preguntas/{idPregunta}',
		tags: ['Administración'],
		summary: 'Dar de baja una pregunta de un formulario',
		request: { params: preguntaFormularioAdminParamsSchema },
		responses: {
			200: {
				description: 'Pregunta dada de baja correctamente.',
				content: { 'application/json': { schema: obtenerFormularioAdminResponseSchema } },
			},
			400: {
				description: 'Identificadores inválidos.',
				content: { 'application/json': { schema: validationErrorResponseSchema } },
			},
			404: {
				description: 'Formulario no encontrado.',
				content: { 'application/json': { schema: formularioAdminNoEncontradoResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'put',
		path: '/api/admin/preguntas/{idPregunta}',
		tags: ['Administración'],
		summary: 'Editar una pregunta del banco globalmente',
		request: {
			params: preguntaAdminParamsSchema,
			body: { content: { 'application/json': { schema: editarPreguntaAdminBodySchema } } },
		},
		responses: {
			200: {
				description: 'Pregunta editada correctamente.',
				content: { 'application/json': { schema: z.object({ data: preguntaBancoAdminSchema }) } },
			},
			400: {
				description: 'Datos inválidos o cambios de tipo/opciones no permitidos.',
				content: { 'application/json': { schema: validationErrorResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'post',
		path: '/api/admin/formularios/{idFormulario}/preguntas/{idPregunta}/reemplazar',
		tags: ['Administración'],
		summary: 'Reemplazar una pregunta activa en un formulario conservando el historial',
		request: {
			params: preguntaFormularioAdminParamsSchema,
			body: { content: { 'application/json': { schema: reemplazarPreguntaFormularioAdminBodySchema } } },
		},
		responses: {
			200: {
				description: 'Pregunta reemplazada correctamente.',
				content: { 'application/json': { schema: obtenerFormularioAdminResponseSchema } },
			},
			400: {
				description: 'Parámetros o datos de reemplazo inválidos.',
				content: { 'application/json': { schema: validationErrorResponseSchema } },
			},
			404: {
				description: 'Formulario no encontrado.',
				content: { 'application/json': { schema: formularioAdminNoEncontradoResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'get',
		path: '/api/admin/actividades-arca',
		tags: ['Administración'],
		summary: 'Listar actividades ARCA para administración',
		description: 'Lista actividades económicas ARCA con búsqueda, orden y paginación.',
		request: { query: listarActividadesArcaAdminQuerySchema },
		responses: {
			200: {
				description: 'Listado de actividades ARCA obtenido correctamente.',
				content: { 'application/json': { schema: listarActividadesArcaAdminResponseSchema } },
			},
			400: {
				description: 'Parámetros de consulta inválidos.',
				content: { 'application/json': { schema: validationErrorResponseSchema } },
			},
			500: {
				description: 'Error interno al consultar actividades.',
				content: { 'application/json': { schema: internalErrorResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'get',
		path: '/api/admin/actividades-arca/{codigo}',
		tags: ['Administración'],
		summary: 'Obtener una actividad ARCA por su código',
		request: { params: actividadArcaCodigoParamSchema },
		responses: {
			200: {
				description: 'Actividad ARCA obtenida correctamente.',
				content: { 'application/json': { schema: obtenerActividadArcaAdminResponseSchema } },
			},
			400: {
				description: 'Código ARCA inválido.',
				content: { 'application/json': { schema: validationErrorResponseSchema } },
			},
			404: {
				description: 'Actividad ARCA no encontrada.',
				content: { 'application/json': { schema: actividadArcaNoEncontradaResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'post',
		path: '/api/admin/actividades-arca',
		tags: ['Administración'],
		summary: 'Crear una nueva actividad económica ARCA',
		request: {
			body: { content: { 'application/json': { schema: guardarActividadArcaAdminBodySchema } } },
		},
		responses: {
			201: {
				description: 'Actividad ARCA creada correctamente.',
				content: { 'application/json': { schema: obtenerActividadArcaAdminResponseSchema } },
			},
			400: {
				description: 'Datos inválidos.',
				content: { 'application/json': { schema: validationErrorResponseSchema } },
			},
			409: {
				description: 'Código o descripción duplicada.',
				content: { 'application/json': { schema: actividadArcaDuplicadaResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'put',
		path: '/api/admin/actividades-arca/{codigo}',
		tags: ['Administración'],
		summary: 'Modificar la descripción de una actividad ARCA',
		request: {
			params: actividadArcaCodigoParamSchema,
			body: { content: { 'application/json': { schema: editarActividadArcaAdminBodySchema } } },
		},
		responses: {
			200: {
				description: 'Actividad ARCA modificada correctamente.',
				content: { 'application/json': { schema: obtenerActividadArcaAdminResponseSchema } },
			},
			400: {
				description: 'Datos inválidos.',
				content: { 'application/json': { schema: validationErrorResponseSchema } },
			},
			404: {
				description: 'Actividad no encontrada.',
				content: { 'application/json': { schema: actividadArcaNoEncontradaResponseSchema } },
			},
			409: {
				description: 'Descripción duplicada.',
				content: { 'application/json': { schema: actividadArcaDuplicadaResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'delete',
		path: '/api/admin/actividades-arca/{codigo}',
		tags: ['Administración'],
		summary: 'Eliminar una actividad ARCA no asociada a usuarios',
		request: { params: actividadArcaCodigoParamSchema },
		responses: {
			200: {
				description: 'Actividad ARCA eliminada correctamente.',
				content: { 'application/json': { schema: obtenerActividadArcaAdminResponseSchema } },
			},
			400: {
				description: 'Código inválido.',
				content: { 'application/json': { schema: validationErrorResponseSchema } },
			},
			404: {
				description: 'Actividad no encontrada.',
				content: { 'application/json': { schema: actividadArcaNoEncontradaResponseSchema } },
			},
			409: {
				description: 'Actividad en uso por usuarios registrados.',
				content: { 'application/json': { schema: actividadArcaEnUsoResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'post',
		path: '/api/admin/actividades-arca/importar',
		tags: ['Administración'],
		summary: 'Importar catálogo de actividades ARCA desde archivo TXT F883',
		request: {
			body: { content: { 'application/json': { schema: importarActividadesArcaAdminBodySchema } } },
		},
		responses: {
			200: {
				description: 'Importación procesada correctamente con detalle de operaciones.',
				content: { 'application/json': { schema: importarActividadesArcaAdminResponseSchema } },
			},
			400: {
				description: 'Contenido inválido o error de procesamiento.',
				content: { 'application/json': { schema: validationErrorResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'get',
		path: '/api/admin/preguntas',
		tags: ['Administración'],
		summary: 'Listar banco de preguntas reutilizables',
		description: 'Lista todas las preguntas del banco reutilizable con filtro opcional de búsqueda por texto.',
		request: { query: listarPreguntasAdminQuerySchema },
		responses: {
			200: {
				description: 'Preguntas del banco obtenidas correctamente.',
				content: { 'application/json': { schema: listarPreguntasAdminResponseSchema } },
			},
			500: {
				description: 'Error interno.',
				content: { 'application/json': { schema: internalErrorResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'post',
		path: '/api/admin/preguntas',
		tags: ['Administración'],
		summary: 'Crear una nueva pregunta en el banco reutilizable',
		description: 'Crea una pregunta en el catálogo global con validación estricta de opciones JSON.',
		request: {
			body: { content: { 'application/json': { schema: crearPreguntaFormularioAdminBodySchema } } },
		},
		responses: {
			201: {
				description: 'Pregunta creada en el banco correctamente.',
				content: { 'application/json': { schema: z.object({ data: preguntaBancoAdminSchema }) } },
			},
			400: {
				description: 'Tipo de dato u opciones inválidas.',
				content: { 'application/json': { schema: validationErrorResponseSchema } },
			},
			500: {
				description: 'Error interno.',
				content: { 'application/json': { schema: internalErrorResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'post',
		path: '/api/admin/formularios/{idFormulario}/preguntas/existente',
		tags: ['Administración'],
		summary: 'Asociar una pregunta existente del banco a un formulario',
		description: 'Incorpora una pregunta activa del banco a un formulario de categoría o subcategoría.',
		request: {
			params: formularioAdminParamsSchema,
			body: { content: { 'application/json': { schema: asociarPreguntaFormularioAdminBodySchema } } },
		},
		responses: {
			200: {
				description: 'Pregunta asociada al formulario correctamente.',
				content: { 'application/json': { schema: obtenerFormularioAdminResponseSchema } },
			},
			400: {
				description: 'Identificador inválido o pregunta ya asociada.',
				content: { 'application/json': { schema: validationErrorResponseSchema } },
			},
			404: {
				description: 'Formulario o pregunta no encontrada.',
				content: { 'application/json': { schema: formularioAdminNoEncontradoResponseSchema } },
			},
			500: {
				description: 'Error interno.',
				content: { 'application/json': { schema: internalErrorResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'get',
		path: '/api/admin/auditoria/integridad',
		tags: ['Administración'],
		summary: 'Ejecutar auditoría diagnóstica de integridad del sistema',
		description:
			'Ejecuta sp_sistema_auditar_integridad para evaluar anomalías referenciales, registros huérfanos o desajustes de formularios en la base de datos.',
		responses: {
			200: {
				description: 'Resultados de auditoría obtenidos correctamente.',
				content: { 'application/json': { schema: auditarIntegridadSistemaAdminResponseSchema } },
			},
			500: {
				description: 'Error interno al ejecutar la auditoría de integridad.',
				content: { 'application/json': { schema: internalErrorResponseSchema } },
			},
		},
	});
}
