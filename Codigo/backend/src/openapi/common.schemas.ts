import { z } from 'zod';

export const validationErrorResponseSchema = z
	.strictObject({
		error: z.strictObject({
			code: z.literal('INVALID_QUERY_PARAMETERS'),

			message: z.string().meta({
				example: 'Los parámetros de consulta no son válidos',
			}),

			details: z.array(
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
			),
		}),
	})
	.meta({
		id: 'ValidationErrorResponse',
		description: 'Respuesta producida cuando los parámetros enviados no son válidos.',
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

export const notFoundResponseSchema = z
	.strictObject({
		error: z.strictObject({
			code: z.literal('ROUTE_NOT_FOUND'),

			message: z.string().meta({
				example: 'No existe la ruta GET /api/publico/desconocida',
			}),
		}),
	})
	.meta({
		id: 'NotFoundResponse',
		description: 'Respuesta producida cuando la ruta solicitada no existe.',
	});
