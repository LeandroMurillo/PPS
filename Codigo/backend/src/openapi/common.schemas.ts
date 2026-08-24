import { z } from 'zod';

export const validationErrorResponseSchema = z
	.strictObject({
		error: z.strictObject({
			code: z.string().meta({
				example: 'INVALID_QUERY_PARAMETERS',
			}),

			message: z.string().meta({
				example: 'Los parámetros de consulta no son válidos',
			}),

			details: z
				.array(
					z.strictObject({
						field: z.string().meta({
							example: 'limit',
						}),

						code: z.string().meta({
							example: 'too_big',
						}),

						message: z.string().meta({
							example: 'El valor debe ser menor o igual que 100',
						}),
					}),
				)
				.optional(),
		}),
	})
	.meta({
		id: 'ValidationErrorResponse',
		description: 'Respuesta producida cuando los parámetros enviados no son válidos.',
	});

export const unauthorizedErrorResponseSchema = z
	.strictObject({
		error: z.strictObject({
			code: z.string().meta({
				example: 'UNAUTHORIZED',
			}),

			message: z.string().meta({
				example: 'Acceso no autorizado. Se requiere un token de sesión.',
			}),
		}),
	})
	.meta({
		id: 'UnauthorizedErrorResponse',
		description: 'Respuesta producida cuando no se provee un token de sesión válido o está expirado.',
	});

export const forbiddenErrorResponseSchema = z
	.strictObject({
		error: z.strictObject({
			code: z.string().meta({
				example: 'FORBIDDEN',
			}),

			message: z.string().meta({
				example: 'No posee los permisos necesarios para realizar esta acción.',
			}),
		}),
	})
	.meta({
		id: 'ForbiddenErrorResponse',
		description: 'Respuesta producida cuando el rol o permisos del usuario no son suficientes.',
	});

export const notFoundResponseSchema = z
	.strictObject({
		error: z.strictObject({
			code: z.string().meta({
				example: 'ROUTE_NOT_FOUND',
			}),

			message: z.string().meta({
				example: 'El recurso solicitado no fue encontrado.',
			}),
		}),
	})
	.meta({
		id: 'NotFoundResponse',
		description: 'Respuesta producida cuando el recurso solicitado no existe.',
	});

export const internalErrorResponseSchema = z
	.strictObject({
		error: z.strictObject({
			code: z.literal('INTERNAL_SERVER_ERROR'),

			message: z.string().meta({
				example: 'Se produjo un error interno',
			}),
		}),
	})
	.meta({
		id: 'InternalErrorResponse',
		description: 'Respuesta producida por un error interno inesperado.',
	});
