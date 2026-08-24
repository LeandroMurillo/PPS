import { z } from 'zod';

import {
	forbiddenErrorResponseSchema,
	internalErrorResponseSchema,
	notFoundResponseSchema,
	unauthorizedErrorResponseSchema,
	validationErrorResponseSchema,
} from '../../openapi/common.schemas.js';
import { openApiRegistry } from '../../openapi/registry.js';
import {
	cancelarPostulacionParamSchema,
	convocatoriaIdParamSchema,
	crearConvocatoriaBodySchema,
	editarConvocatoriaBodySchema,
	listarAdminConvocatoriasQuerySchema,
	postularActorBodySchema,
} from './convocatorias.schemas.js';

export const convocatoriaResumenSchema = z.strictObject({
	idConvocatoria: z.number().int().positive(),
	titulo: z.string(),
	descripcion: z.string(),
	fechaCreacion: z.string(),
	fechaCierre: z.string(),
	totalPostulaciones: z.number().int().nonnegative().optional(),
	estado: z.string().optional(),
});

export const postulacionUsuarioSchema = z.strictObject({
	idConvocatoria: z.number().int().positive(),
	idActor: z.number().int().positive(),
	nombreActor: z.string(),
	fechaPostulacion: z.string(),
});

export const postulanteDetalleAdminSchema = z.strictObject({
	idActor: z.number().int().positive(),
	fechaPostulacion: z.string(),
	nombreActor: z.string(),
	fotoPerfilUrl: z.string().nullable(),
	estadoActor: z.string(),
	categoria: z.string(),
	subcategoria: z.string().nullable(),
	departamento: z.string(),
	localidad: z.string(),
	responsableNombre: z.string(),
	responsableApellido: z.string(),
	responsableEmail: z.string(),
});

export const listarConvocatoriasActivasResponseSchema = z.strictObject({
	data: z.array(convocatoriaResumenSchema),
	postulacionesUsuario: z.array(postulacionUsuarioSchema),
});

export const listarConvocatoriasAdminResponseSchema = z.strictObject({
	data: z.array(convocatoriaResumenSchema),
	total: z.number().int().nonnegative(),
});

export const obtenerConvocatoriaDetalleResponseSchema = z.strictObject({
	data: convocatoriaResumenSchema,
	postulantes: z.array(postulanteDetalleAdminSchema),
});

export const mensajeConvocatoriaResponseSchema = z.strictObject({
	mensaje: z.string(),
	data: convocatoriaResumenSchema.optional(),
});

export function registerConvocatoriasOpenApi(): void {
	// ================= RUTAS PÚBLICAS / USUARIOS =================
	openApiRegistry.registerPath({
		method: 'get',
		path: '/api/convocatorias',
		tags: ['Convocatorias'],
		summary: 'Listar convocatorias culturales activas',
		description:
			'Devuelve la lista de convocatorias oficiales abiertas. Si el usuario está autenticado, incluye además sus postulaciones vigentes.',
		responses: {
			200: {
				description: 'Convocatorias activas obtenidas correctamente.',
				content: {
					'application/json': {
						schema: listarConvocatoriasActivasResponseSchema,
					},
				},
			},
			500: {
				description: 'Error interno al consultar las convocatorias.',
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
		path: '/api/convocatorias/{id}',
		tags: ['Convocatorias'],
		summary: 'Obtener detalle de una convocatoria',
		description:
			'Devuelve los datos de la convocatoria. Si el usuario solicitante posee rol ADMIN o MODERADOR, incluye la lista completa de actores postulados y datos de contacto.',
		request: {
			params: convocatoriaIdParamSchema,
		},
		responses: {
			200: {
				description: 'Detalle de la convocatoria obtenido correctamente.',
				content: {
					'application/json': {
						schema: obtenerConvocatoriaDetalleResponseSchema,
					},
				},
			},
			404: {
				description: 'Convocatoria no encontrada.',
				content: {
					'application/json': {
						schema: notFoundResponseSchema,
					},
				},
			},
			500: {
				description: 'Error interno al consultar la convocatoria.',
				content: {
					'application/json': {
						schema: internalErrorResponseSchema,
					},
				},
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'post',
		path: '/api/convocatorias/{id}/postular',
		tags: ['Convocatorias'],
		summary: 'Postular un actor cultural a una convocatoria activa',
		description:
			'Postula un actor cultural en estado activo a una convocatoria abierta. Requiere ser titular del actor.',
		security: [{ bearerAuth: [] }],
		request: {
			params: convocatoriaIdParamSchema,
			body: {
				content: {
					'application/json': {
						schema: postularActorBodySchema,
					},
				},
			},
		},
		responses: {
			200: {
				description: 'Actor postulado exitosamente.',
				content: {
					'application/json': {
						schema: mensajeConvocatoriaResponseSchema,
					},
				},
			},
			400: {
				description: 'Error de validación, convocatoria cerrada o actor no elegible.',
				content: {
					'application/json': {
						schema: validationErrorResponseSchema,
					},
				},
			},
			401: {
				description: 'No autorizado.',
				content: {
					'application/json': {
						schema: unauthorizedErrorResponseSchema,
					},
				},
			},
			500: {
				description: 'Error interno al postular el actor.',
				content: {
					'application/json': {
						schema: internalErrorResponseSchema,
					},
				},
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'delete',
		path: '/api/convocatorias/{id}/postulaciones/{idActor}',
		tags: ['Convocatorias'],
		summary: 'Cancelar postulación de un actor cultural',
		description:
			'Permite al titular de un actor cultural retirar su postulación antes de que la convocatoria cierre.',
		security: [{ bearerAuth: [] }],
		request: {
			params: cancelarPostulacionParamSchema,
		},
		responses: {
			200: {
				description: 'Postulación cancelada exitosamente.',
				content: {
					'application/json': {
						schema: mensajeConvocatoriaResponseSchema,
					},
				},
			},
			400: {
				description: 'No se pudo cancelar la postulación.',
				content: {
					'application/json': {
						schema: validationErrorResponseSchema,
					},
				},
			},
			401: {
				description: 'No autorizado.',
				content: {
					'application/json': {
						schema: unauthorizedErrorResponseSchema,
					},
				},
			},
			500: {
				description: 'Error interno al cancelar la postulación.',
				content: {
					'application/json': {
						schema: internalErrorResponseSchema,
					},
				},
			},
		},
	});

	// ================= RUTAS ADMINISTRATIVAS =================
	openApiRegistry.registerPath({
		method: 'get',
		path: '/api/admin/convocatorias',
		tags: ['Convocatorias (Administración)'],
		summary: 'Listado administrativo de convocatorias',
		description:
			'Devuelve el listado de convocatorias culturales con filtros por búsqueda, estado y paginación para el panel de gestión.',
		security: [{ bearerAuth: [] }],
		request: {
			query: listarAdminConvocatoriasQuerySchema,
		},
		responses: {
			200: {
				description: 'Listado de convocatorias obtenido correctamente.',
				content: {
					'application/json': {
						schema: listarConvocatoriasAdminResponseSchema,
					},
				},
			},
			401: {
				description: 'No autorizado.',
				content: {
					'application/json': {
						schema: unauthorizedErrorResponseSchema,
					},
				},
			},
			403: {
				description: 'Prohibido: requiere rol ADMIN o MODERADOR.',
				content: {
					'application/json': {
						schema: forbiddenErrorResponseSchema,
					},
				},
			},
			500: {
				description: 'Error interno al listar convocatorias.',
				content: {
					'application/json': {
						schema: internalErrorResponseSchema,
					},
				},
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'post',
		path: '/api/admin/convocatorias',
		tags: ['Convocatorias (Administración)'],
		summary: 'Crear una nueva convocatoria oficial',
		description: 'Crea una nueva convocatoria cultural con título, descripción y fecha de cierre obligatoria.',
		security: [{ bearerAuth: [] }],
		request: {
			body: {
				content: {
					'application/json': {
						schema: crearConvocatoriaBodySchema,
					},
				},
			},
		},
		responses: {
			201: {
				description: 'Convocatoria creada exitosamente.',
				content: {
					'application/json': {
						schema: mensajeConvocatoriaResponseSchema,
					},
				},
			},
			400: {
				description: 'Datos de convocatoria inválidos.',
				content: {
					'application/json': {
						schema: validationErrorResponseSchema,
					},
				},
			},
			401: {
				description: 'No autorizado.',
				content: {
					'application/json': {
						schema: unauthorizedErrorResponseSchema,
					},
				},
			},
			403: {
				description: 'Prohibido: requiere rol ADMIN o MODERADOR.',
				content: {
					'application/json': {
						schema: forbiddenErrorResponseSchema,
					},
				},
			},
			500: {
				description: 'Error interno al crear convocatoria.',
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
		path: '/api/admin/convocatorias/{id}',
		tags: ['Convocatorias (Administración)'],
		summary: 'Obtener detalle administrativo de una convocatoria',
		description: 'Obtiene los datos de la convocatoria y la lista completa de postulantes con datos de contacto.',
		security: [{ bearerAuth: [] }],
		request: {
			params: convocatoriaIdParamSchema,
		},
		responses: {
			200: {
				description: 'Detalle de la convocatoria obtenido correctamente.',
				content: {
					'application/json': {
						schema: obtenerConvocatoriaDetalleResponseSchema,
					},
				},
			},
			401: {
				description: 'No autorizado.',
				content: {
					'application/json': {
						schema: unauthorizedErrorResponseSchema,
					},
				},
			},
			403: {
				description: 'Prohibido: requiere rol ADMIN o MODERADOR.',
				content: {
					'application/json': {
						schema: forbiddenErrorResponseSchema,
					},
				},
			},
			404: {
				description: 'Convocatoria no encontrada.',
				content: {
					'application/json': {
						schema: notFoundResponseSchema,
					},
				},
			},
			500: {
				description: 'Error interno al consultar la convocatoria.',
				content: {
					'application/json': {
						schema: internalErrorResponseSchema,
					},
				},
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'put',
		path: '/api/admin/convocatorias/{id}',
		tags: ['Convocatorias (Administración)'],
		summary: 'Editar una convocatoria existente',
		description: 'Modifica el título, descripción o fecha de cierre de una convocatoria.',
		security: [{ bearerAuth: [] }],
		request: {
			params: convocatoriaIdParamSchema,
			body: {
				content: {
					'application/json': {
						schema: editarConvocatoriaBodySchema,
					},
				},
			},
		},
		responses: {
			200: {
				description: 'Convocatoria actualizada exitosamente.',
				content: {
					'application/json': {
						schema: mensajeConvocatoriaResponseSchema,
					},
				},
			},
			400: {
				description: 'Datos inválidos.',
				content: {
					'application/json': {
						schema: validationErrorResponseSchema,
					},
				},
			},
			401: {
				description: 'No autorizado.',
				content: {
					'application/json': {
						schema: unauthorizedErrorResponseSchema,
					},
				},
			},
			403: {
				description: 'Prohibido: requiere rol ADMIN o MODERADOR.',
				content: {
					'application/json': {
						schema: forbiddenErrorResponseSchema,
					},
				},
			},
			500: {
				description: 'Error interno al actualizar la convocatoria.',
				content: {
					'application/json': {
						schema: internalErrorResponseSchema,
					},
				},
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'delete',
		path: '/api/admin/convocatorias/{id}',
		tags: ['Convocatorias (Administración)'],
		summary: 'Eliminar una convocatoria',
		description: 'Elimina permanentemente una convocatoria y sus postulaciones asociadas.',
		security: [{ bearerAuth: [] }],
		request: {
			params: convocatoriaIdParamSchema,
		},
		responses: {
			200: {
				description: 'Convocatoria eliminada exitosamente.',
				content: {
					'application/json': {
						schema: mensajeConvocatoriaResponseSchema,
					},
				},
			},
			401: {
				description: 'No autorizado.',
				content: {
					'application/json': {
						schema: unauthorizedErrorResponseSchema,
					},
				},
			},
			403: {
				description: 'Prohibido: requiere rol ADMIN o MODERADOR.',
				content: {
					'application/json': {
						schema: forbiddenErrorResponseSchema,
					},
				},
			},
			500: {
				description: 'Error interno al eliminar la convocatoria.',
				content: {
					'application/json': {
						schema: internalErrorResponseSchema,
					},
				},
			},
		},
	});
}
