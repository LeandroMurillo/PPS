import { z } from 'zod';

import {
	forbiddenErrorResponseSchema,
	internalErrorResponseSchema,
	notFoundResponseSchema,
	unauthorizedErrorResponseSchema,
	validationErrorResponseSchema,
} from '../../openapi/common.schemas.js';
import { openApiRegistry } from '../../openapi/registry.js';
import { publicDescriptionSchema } from '../../shared/public-description.schema.js';

const actorIdParamSchema = z.strictObject({
	id: z.coerce.number().int().positive().meta({ description: 'Identificador del actor cultural', example: 1 }),
});

const actorItemParamSchema = actorIdParamSchema.extend({
	idItem: z.coerce
		.number()
		.int()
		.positive()
		.meta({ description: 'Identificador del ítem de portafolio', example: 5 }),
});

const actorEventoParamSchema = actorIdParamSchema.extend({
	idEvento: z.coerce
		.number()
		.int()
		.positive()
		.meta({ description: 'Identificador del evento calendarizado', example: 12 }),
});

const actorIntegranteUsuarioParamSchema = actorIdParamSchema.extend({
	idUsuario: z.coerce
		.number()
		.int()
		.positive()
		.meta({ description: 'Identificador del usuario integrante', example: 8 }),
});

const actorIntegranteNoRegParamSchema = actorIdParamSchema.extend({
	idIntegranteNoRegistrado: z.coerce
		.number()
		.int()
		.positive()
		.meta({ description: 'Identificador del integrante sin cuenta', example: 3 }),
});

const genericMessageResponseSchema = z.strictObject({
	message: z.string().meta({ example: 'Operación realizada correctamente.' }),
});

const actorImageDataUrlSchema = z
	.string()
	.max(7_000_000)
	.regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=\r\n]+$/);

const respuestaRegistroSchema = z.object({
	idFormulario: z.number().int().positive(),
	idPregunta: z.number().int().positive(),
	valor: z.unknown(),
});

const itemPortafolioRegistroSchema = z.object({
	tipo: z.enum(['IMAGEN', 'VIDEO', 'ENLACE']),
	titulo: z.string().trim().min(1).max(100),
	descripcion: z.string().trim().max(140).nullable().optional(),
	url: z.string().url().max(245).nullable().optional(),
	imagenBase64: actorImageDataUrlSchema.nullable().optional(),
});

const crearActorBodySchema = z.object({
	idCategoria: z.number().int().positive(),
	idSubcategoria: z.number().int().positive().nullable().optional(),
	nombre: z.string().trim().min(1).max(100),
	descripcion: publicDescriptionSchema,
	fotoPerfilUrl: z.string().trim().nullable().optional(),
	fotoPerfilBase64: actorImageDataUrlSchema.nullable().optional(),
	cuit: z.string().trim().nullable().optional(),
	tipoActor: z.enum(['INDIVIDUO', 'COLECTIVO', 'ESPACIO']),
	provincia: z.string().trim().nullable().optional(),
	departamento: z.string().trim().min(1),
	localidad: z.string().trim().min(1),
	direccion: z.string().trim().min(1),
	latitud: z.number().min(-27.95).max(-25.75),
	longitud: z.number().min(-66.35).max(-64.45),
	esPublica: z.boolean(),
	respuestas: z.array(respuestaRegistroSchema).max(100).optional(),
	portafolio: z.array(itemPortafolioRegistroSchema).max(10).optional(),
});

const editarActorBodySchema = z.object({
	idCategoria: z.number().int().positive(),
	idSubcategoria: z.number().int().positive().nullable().optional(),
	nombre: z.string().trim().min(1).max(100),
	descripcion: publicDescriptionSchema,
	fotoPerfilUrl: z.string().trim().nullable().optional(),
	fotoPerfilBase64: actorImageDataUrlSchema.nullable().optional(),
	cuit: z.string().trim().nullable().optional(),
	tipoActor: z.enum(['INDIVIDUO', 'COLECTIVO', 'ESPACIO']),
	departamento: z.string().trim().min(1),
	localidad: z.string().trim().min(1),
	direccion: z.string().trim().min(1),
	latitud: z.number().min(-27.95).max(-25.75).optional(),
	longitud: z.number().min(-66.35).max(-64.45).optional(),
	esPublica: z.boolean().optional(),
	respuestas: z.array(respuestaRegistroSchema).max(100).optional(),
});

const cambiarEstadoActorBodySchema = z.object({
	nuevoEstado: z.enum(['A', 'P', 'I']),
});

const transferirTitularidadBodySchema = z.object({
	idNuevoTitular: z.coerce.number().int().positive(),
});

const portafolioItemBodySchema = z.object({
	tipo: z.enum(['IMAGEN', 'LINK', 'RRSS']),
	descripcion: z.string().trim().min(1).max(255),
	url: z.string().url().max(245).optional().nullable(),
	imagenBase64: actorImageDataUrlSchema.optional().nullable(),
});

const eventoActorBodySchema = z.object({
	nombre: z.string().trim().min(1).max(45),
	descripcion: z.string().trim().min(1).max(455),
	fecha: z.string().optional(),
});

const integranteRegistradoBodySchema = z.object({
	email: z.string().trim().email(),
	rol: z.string().trim().min(1).max(45),
});

const editarIntegranteRegistradoBodySchema = z.object({
	rol: z.string().trim().min(1).max(45),
});

const integranteNoRegistradoBodySchema = z.object({
	nombre: z.string().trim().min(1).max(45),
	apellido: z.string().trim().min(1).max(45),
	email: z.string().trim().email().max(99).nullable().optional(),
	rol: z.string().trim().min(1).max(45),
});

export function registerMisActoresOpenApi(): void {
	// ================= OPCIONES Y FORMULARIOS =================
	openApiRegistry.registerPath({
		method: 'get',
		path: '/api/mis-actores/opciones-registro',
		tags: ['Gestión de mis actores'],
		summary: 'Obtener opciones de categorías y subcategorías para registrar un actor',
		description: 'Lista las categorías y subcategorías activas disponibles para el alta o edición de actores.',
		security: [{ bearerAuth: [] }],
		responses: {
			200: {
				description: 'Opciones de registro obtenidas correctamente.',
			},
			401: {
				description: 'No autorizado.',
				content: { 'application/json': { schema: unauthorizedErrorResponseSchema } },
			},
			500: {
				description: 'Error interno.',
				content: { 'application/json': { schema: internalErrorResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'get',
		path: '/api/mis-actores/formularios-aplicables',
		tags: ['Gestión de mis actores'],
		summary: 'Obtener esquema de formularios aplicables para una categoría/subcategoría',
		description:
			'Devuelve los formularios dinámicos y preguntas activas correspondientes a la categoría y subcategoría.',
		security: [{ bearerAuth: [] }],
		responses: {
			200: { description: 'Formularios aplicables obtenidos correctamente.' },
			401: {
				description: 'No autorizado.',
				content: { 'application/json': { schema: unauthorizedErrorResponseSchema } },
			},
			500: {
				description: 'Error interno.',
				content: { 'application/json': { schema: internalErrorResponseSchema } },
			},
		},
	});

	// ================= LISTADO Y CRUD ACTOR =================
	openApiRegistry.registerPath({
		method: 'get',
		path: '/api/mis-actores',
		tags: ['Gestión de mis actores'],
		summary: 'Listar actores culturales donde el usuario es titular o integrante',
		description:
			'Devuelve los actores culturales asociados al usuario autenticado con filtros de búsqueda, estado y paginación.',
		security: [{ bearerAuth: [] }],
		responses: {
			200: { description: 'Lista de actores propios obtenida correctamente.' },
			401: {
				description: 'No autorizado.',
				content: { 'application/json': { schema: unauthorizedErrorResponseSchema } },
			},
			500: {
				description: 'Error interno.',
				content: { 'application/json': { schema: internalErrorResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'post',
		path: '/api/mis-actores',
		tags: ['Gestión de mis actores'],
		summary: 'Crear un nuevo actor cultural',
		description:
			'Crea un nuevo actor cultural en estado Pendiente (P) asociando ubicación, respuestas dinámicas y portafolio inicial. Respeta el límite de 5 actores pendientes simultáneos.',
		security: [{ bearerAuth: [] }],
		request: {
			body: { content: { 'application/json': { schema: crearActorBodySchema } } },
		},
		responses: {
			201: { description: 'Actor cultural creado exitosamente.' },
			400: {
				description: 'Datos inválidos o límite de actores pendientes alcanzado.',
				content: { 'application/json': { schema: validationErrorResponseSchema } },
			},
			401: {
				description: 'No autorizado.',
				content: { 'application/json': { schema: unauthorizedErrorResponseSchema } },
			},
			500: {
				description: 'Error interno.',
				content: { 'application/json': { schema: internalErrorResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'get',
		path: '/api/mis-actores/{id}/formularios',
		tags: ['Gestión de mis actores'],
		summary: 'Obtener formularios y respuestas vigentes de un actor',
		description:
			'Obtiene las preguntas del formulario dinámico del actor y los valores vigentes de sus respuestas.',
		security: [{ bearerAuth: [] }],
		request: { params: actorIdParamSchema },
		responses: {
			200: { description: 'Formularios y respuestas del actor obtenidos correctamente.' },
			401: {
				description: 'No autorizado.',
				content: { 'application/json': { schema: unauthorizedErrorResponseSchema } },
			},
			403: {
				description: 'Prohibido: no pertenece al actor.',
				content: { 'application/json': { schema: forbiddenErrorResponseSchema } },
			},
			404: {
				description: 'Actor no encontrado.',
				content: { 'application/json': { schema: notFoundResponseSchema } },
			},
			500: {
				description: 'Error interno.',
				content: { 'application/json': { schema: internalErrorResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'put',
		path: '/api/mis-actores/{id}',
		tags: ['Gestión de mis actores'],
		summary: 'Modificar datos generales y respuestas de un actor',
		description:
			'Actualiza los datos del actor y sus respuestas de formulario. Si es editado por usuario estándar pasa a estado Pendiente.',
		security: [{ bearerAuth: [] }],
		request: {
			params: actorIdParamSchema,
			body: { content: { 'application/json': { schema: editarActorBodySchema } } },
		},
		responses: {
			200: { description: 'Actor modificado correctamente.' },
			400: {
				description: 'Datos inválidos.',
				content: { 'application/json': { schema: validationErrorResponseSchema } },
			},
			401: {
				description: 'No autorizado.',
				content: { 'application/json': { schema: unauthorizedErrorResponseSchema } },
			},
			403: {
				description: 'Prohibido.',
				content: { 'application/json': { schema: forbiddenErrorResponseSchema } },
			},
			500: {
				description: 'Error interno.',
				content: { 'application/json': { schema: internalErrorResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'patch',
		path: '/api/mis-actores/{id}/estado',
		tags: ['Gestión de mis actores'],
		summary: 'Cambiar estado del actor (baja lógica / reactivación)',
		description: 'Permite al titular o moderador cambiar el estado del actor (A, P, I).',
		security: [{ bearerAuth: [] }],
		request: {
			params: actorIdParamSchema,
			body: { content: { 'application/json': { schema: cambiarEstadoActorBodySchema } } },
		},
		responses: {
			200: {
				description: 'Estado actualizado correctamente.',
				content: { 'application/json': { schema: genericMessageResponseSchema } },
			},
			401: {
				description: 'No autorizado.',
				content: { 'application/json': { schema: unauthorizedErrorResponseSchema } },
			},
			403: {
				description: 'Prohibido.',
				content: { 'application/json': { schema: forbiddenErrorResponseSchema } },
			},
			500: {
				description: 'Error interno.',
				content: { 'application/json': { schema: internalErrorResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'delete',
		path: '/api/mis-actores/{id}',
		tags: ['Gestión de mis actores'],
		summary: 'Eliminar permanentemente un actor cultural',
		description: 'Elimina de forma física el actor y sus datos asociados.',
		security: [{ bearerAuth: [] }],
		request: { params: actorIdParamSchema },
		responses: {
			200: {
				description: 'Actor eliminado permanentemente.',
				content: { 'application/json': { schema: genericMessageResponseSchema } },
			},
			401: {
				description: 'No autorizado.',
				content: { 'application/json': { schema: unauthorizedErrorResponseSchema } },
			},
			403: {
				description: 'Prohibido.',
				content: { 'application/json': { schema: forbiddenErrorResponseSchema } },
			},
			500: {
				description: 'Error interno.',
				content: { 'application/json': { schema: internalErrorResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'post',
		path: '/api/mis-actores/{id}/transferir-titularidad',
		tags: ['Gestión de mis actores'],
		summary: 'Transferir la titularidad del actor a otro integrante registrado',
		description: 'Transfiere la condición de titular (esDueño = 1) a otro miembro registrado.',
		security: [{ bearerAuth: [] }],
		request: {
			params: actorIdParamSchema,
			body: { content: { 'application/json': { schema: transferirTitularidadBodySchema } } },
		},
		responses: {
			200: {
				description: 'Titularidad transferida correctamente.',
				content: { 'application/json': { schema: genericMessageResponseSchema } },
			},
			401: {
				description: 'No autorizado.',
				content: { 'application/json': { schema: unauthorizedErrorResponseSchema } },
			},
			403: {
				description: 'Prohibido.',
				content: { 'application/json': { schema: forbiddenErrorResponseSchema } },
			},
			500: {
				description: 'Error interno.',
				content: { 'application/json': { schema: internalErrorResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'post',
		path: '/api/mis-actores/{id}/renunciar',
		tags: ['Gestión de mis actores'],
		summary: 'Renunciar a la membresía de un actor cultural',
		description: 'Permite a un usuario integrante desvincularse voluntariamente de un colectivo.',
		security: [{ bearerAuth: [] }],
		request: { params: actorIdParamSchema },
		responses: {
			200: {
				description: 'Renuncia procesada correctamente.',
				content: { 'application/json': { schema: genericMessageResponseSchema } },
			},
			401: {
				description: 'No autorizado.',
				content: { 'application/json': { schema: unauthorizedErrorResponseSchema } },
			},
			500: {
				description: 'Error interno.',
				content: { 'application/json': { schema: internalErrorResponseSchema } },
			},
		},
	});

	// ================= PORTAFOLIO =================
	openApiRegistry.registerPath({
		method: 'get',
		path: '/api/mis-actores/{id}/portafolio',
		tags: ['Gestión de mis actores'],
		summary: 'Listar ítems del portafolio del actor',
		description: 'Devuelve las imágenes, enlaces y redes sociales cargadas en el portafolio del actor.',
		security: [{ bearerAuth: [] }],
		request: { params: actorIdParamSchema },
		responses: {
			200: { description: 'Ítems de portafolio obtenidos correctamente.' },
			401: {
				description: 'No autorizado.',
				content: { 'application/json': { schema: unauthorizedErrorResponseSchema } },
			},
			500: {
				description: 'Error interno.',
				content: { 'application/json': { schema: internalErrorResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'post',
		path: '/api/mis-actores/{id}/portafolio',
		tags: ['Gestión de mis actores'],
		summary: 'Agregar un ítem al portafolio del actor',
		description: 'Agrega una imagen (subida en Base64 o URL), enlace externo o red social al portafolio.',
		security: [{ bearerAuth: [] }],
		request: {
			params: actorIdParamSchema,
			body: { content: { 'application/json': { schema: portafolioItemBodySchema } } },
		},
		responses: {
			201: { description: 'Ítem agregado al portafolio exitosamente.' },
			400: {
				description: 'Datos inválidos.',
				content: { 'application/json': { schema: validationErrorResponseSchema } },
			},
			401: {
				description: 'No autorizado.',
				content: { 'application/json': { schema: unauthorizedErrorResponseSchema } },
			},
			500: {
				description: 'Error interno.',
				content: { 'application/json': { schema: internalErrorResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'delete',
		path: '/api/mis-actores/{id}/portafolio/{idItem}',
		tags: ['Gestión de mis actores'],
		summary: 'Eliminar un ítem del portafolio',
		description: 'Elimina un elemento del portafolio del actor cultural.',
		security: [{ bearerAuth: [] }],
		request: { params: actorItemParamSchema },
		responses: {
			200: {
				description: 'Ítem eliminado correctamente.',
				content: { 'application/json': { schema: genericMessageResponseSchema } },
			},
			401: {
				description: 'No autorizado.',
				content: { 'application/json': { schema: unauthorizedErrorResponseSchema } },
			},
			500: {
				description: 'Error interno.',
				content: { 'application/json': { schema: internalErrorResponseSchema } },
			},
		},
	});

	// ================= EVENTOS =================
	openApiRegistry.registerPath({
		method: 'get',
		path: '/api/mis-actores/{id}/eventos',
		tags: ['Gestión de mis actores'],
		summary: 'Listar eventos de un actor cultural',
		description: 'Lista los eventos registrados por el actor.',
		security: [{ bearerAuth: [] }],
		request: { params: actorIdParamSchema },
		responses: {
			200: { description: 'Eventos obtenidos correctamente.' },
			401: {
				description: 'No autorizado.',
				content: { 'application/json': { schema: unauthorizedErrorResponseSchema } },
			},
			500: {
				description: 'Error interno.',
				content: { 'application/json': { schema: internalErrorResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'post',
		path: '/api/mis-actores/{id}/eventos',
		tags: ['Gestión de mis actores'],
		summary: 'Agregar un evento a la agenda del actor',
		description: 'Registra un nuevo evento calendarizado.',
		security: [{ bearerAuth: [] }],
		request: {
			params: actorIdParamSchema,
			body: { content: { 'application/json': { schema: eventoActorBodySchema } } },
		},
		responses: {
			201: { description: 'Evento registrado exitosamente.' },
			400: {
				description: 'Datos de evento inválidos.',
				content: { 'application/json': { schema: validationErrorResponseSchema } },
			},
			401: {
				description: 'No autorizado.',
				content: { 'application/json': { schema: unauthorizedErrorResponseSchema } },
			},
			500: {
				description: 'Error interno.',
				content: { 'application/json': { schema: internalErrorResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'delete',
		path: '/api/mis-actores/{id}/eventos/{idEvento}',
		tags: ['Gestión de mis actores'],
		summary: 'Eliminar un evento del actor',
		description: 'Elimina un evento de la agenda del actor cultural.',
		security: [{ bearerAuth: [] }],
		request: { params: actorEventoParamSchema },
		responses: {
			200: {
				description: 'Evento eliminado correctamente.',
				content: { 'application/json': { schema: genericMessageResponseSchema } },
			},
			401: {
				description: 'No autorizado.',
				content: { 'application/json': { schema: unauthorizedErrorResponseSchema } },
			},
			500: {
				description: 'Error interno.',
				content: { 'application/json': { schema: internalErrorResponseSchema } },
			},
		},
	});

	// ================= INTEGRANTES REGISTRADOS =================
	openApiRegistry.registerPath({
		method: 'get',
		path: '/api/mis-actores/{id}/integrantes',
		tags: ['Gestión de mis actores'],
		summary: 'Listar integrantes registrados y no registrados de un actor',
		description: 'Devuelve la nómina completa de integrantes vinculados al actor.',
		security: [{ bearerAuth: [] }],
		request: { params: actorIdParamSchema },
		responses: {
			200: { description: 'Nómina de integrantes obtenida correctamente.' },
			401: {
				description: 'No autorizado.',
				content: { 'application/json': { schema: unauthorizedErrorResponseSchema } },
			},
			500: {
				description: 'Error interno.',
				content: { 'application/json': { schema: internalErrorResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'post',
		path: '/api/mis-actores/{id}/integrantes',
		tags: ['Gestión de mis actores'],
		summary: 'Agregar un integrante registrado por correo electrónico',
		description: 'Vincula un usuario existente en la plataforma a la agrupación asignándole un rol.',
		security: [{ bearerAuth: [] }],
		request: {
			params: actorIdParamSchema,
			body: { content: { 'application/json': { schema: integranteRegistradoBodySchema } } },
		},
		responses: {
			201: {
				description: 'Integrante agregado correctamente.',
				content: { 'application/json': { schema: genericMessageResponseSchema } },
			},
			400: {
				description: 'Usuario no encontrado o ya integrado.',
				content: { 'application/json': { schema: validationErrorResponseSchema } },
			},
			401: {
				description: 'No autorizado.',
				content: { 'application/json': { schema: unauthorizedErrorResponseSchema } },
			},
			500: {
				description: 'Error interno.',
				content: { 'application/json': { schema: internalErrorResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'put',
		path: '/api/mis-actores/{id}/integrantes/{idUsuario}',
		tags: ['Gestión de mis actores'],
		summary: 'Modificar el rol de un integrante registrado',
		description: 'Actualiza la descripción del rol artístico del integrante.',
		security: [{ bearerAuth: [] }],
		request: {
			params: actorIntegranteUsuarioParamSchema,
			body: { content: { 'application/json': { schema: editarIntegranteRegistradoBodySchema } } },
		},
		responses: {
			200: {
				description: 'Rol modificado correctamente.',
				content: { 'application/json': { schema: genericMessageResponseSchema } },
			},
			401: {
				description: 'No autorizado.',
				content: { 'application/json': { schema: unauthorizedErrorResponseSchema } },
			},
			500: {
				description: 'Error interno.',
				content: { 'application/json': { schema: internalErrorResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'delete',
		path: '/api/mis-actores/{id}/integrantes/{idUsuario}',
		tags: ['Gestión de mis actores'],
		summary: 'Eliminar un integrante registrado del actor',
		description: 'Desvincula a un integrante de la agrupación.',
		security: [{ bearerAuth: [] }],
		request: { params: actorIntegranteUsuarioParamSchema },
		responses: {
			200: {
				description: 'Integrante eliminado correctamente.',
				content: { 'application/json': { schema: genericMessageResponseSchema } },
			},
			401: {
				description: 'No autorizado.',
				content: { 'application/json': { schema: unauthorizedErrorResponseSchema } },
			},
			500: {
				description: 'Error interno.',
				content: { 'application/json': { schema: internalErrorResponseSchema } },
			},
		},
	});

	// ================= INTEGRANTES NO REGISTRADOS =================
	openApiRegistry.registerPath({
		method: 'post',
		path: '/api/mis-actores/{id}/integrantes-no-registrados',
		tags: ['Gestión de mis actores'],
		summary: 'Agregar un integrante sin cuenta de usuario',
		description: 'Registra a un participante que no posee cuenta en la plataforma.',
		security: [{ bearerAuth: [] }],
		request: {
			params: actorIdParamSchema,
			body: { content: { 'application/json': { schema: integranteNoRegistradoBodySchema } } },
		},
		responses: {
			201: {
				description: 'Integrante sin cuenta agregado.',
				content: { 'application/json': { schema: genericMessageResponseSchema } },
			},
			400: {
				description: 'Datos inválidos.',
				content: { 'application/json': { schema: validationErrorResponseSchema } },
			},
			401: {
				description: 'No autorizado.',
				content: { 'application/json': { schema: unauthorizedErrorResponseSchema } },
			},
			500: {
				description: 'Error interno.',
				content: { 'application/json': { schema: internalErrorResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'put',
		path: '/api/mis-actores/{id}/integrantes-no-registrados/{idIntegranteNoRegistrado}',
		tags: ['Gestión de mis actores'],
		summary: 'Modificar datos de un integrante sin cuenta de usuario',
		description: 'Actualiza nombre, apellido, correo o rol del integrante no registrado.',
		security: [{ bearerAuth: [] }],
		request: {
			params: actorIntegranteNoRegParamSchema,
			body: { content: { 'application/json': { schema: integranteNoRegistradoBodySchema } } },
		},
		responses: {
			200: {
				description: 'Integrante sin cuenta modificado.',
				content: { 'application/json': { schema: genericMessageResponseSchema } },
			},
			401: {
				description: 'No autorizado.',
				content: { 'application/json': { schema: unauthorizedErrorResponseSchema } },
			},
			500: {
				description: 'Error interno.',
				content: { 'application/json': { schema: internalErrorResponseSchema } },
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'delete',
		path: '/api/mis-actores/{id}/integrantes-no-registrados/{idIntegranteNoRegistrado}',
		tags: ['Gestión de mis actores'],
		summary: 'Eliminar un integrante sin cuenta de usuario',
		description: 'Elimina al participante no registrado de la agrupación.',
		security: [{ bearerAuth: [] }],
		request: { params: actorIntegranteNoRegParamSchema },
		responses: {
			200: {
				description: 'Integrante sin cuenta eliminado.',
				content: { 'application/json': { schema: genericMessageResponseSchema } },
			},
			401: {
				description: 'No autorizado.',
				content: { 'application/json': { schema: unauthorizedErrorResponseSchema } },
			},
			500: {
				description: 'Error interno.',
				content: { 'application/json': { schema: internalErrorResponseSchema } },
			},
		},
	});
}
