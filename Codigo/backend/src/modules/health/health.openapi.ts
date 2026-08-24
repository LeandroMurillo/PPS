import { z } from 'zod';

import { internalErrorResponseSchema } from '../../openapi/common.schemas.js';
import { openApiRegistry } from '../../openapi/registry.js';

export const healthResponseSchema = z
	.strictObject({
		status: z.literal('ok'),
		service: z.literal('cultura-backend'),
		database: z.enum(['connected', 'unknown']),
		uptime: z.string().meta({ example: '1h 25m 10s' }),
		uptimeSeconds: z.number().nonnegative().meta({ example: 5110.45 }),
		timestamp: z.string().datetime().meta({ example: '2026-08-23T21:40:00.000Z' }),
	})
	.meta({
		id: 'HealthResponse',
		description: 'Estado de salud y conectividad de la aplicación y la base de datos.',
	});

export function registerHealthOpenApi(): void {
	openApiRegistry.registerPath({
		method: 'get',
		path: '/api/health',
		tags: ['Salud del Sistema'],
		summary: 'Verificar salud y conectividad del backend',
		description:
			'Verifica la operatividad del servicio backend y la conexión con el motor de base de datos MariaDB ejecutando sp_sistema_ping.',
		responses: {
			200: {
				description: 'Servicio en línea y base de datos conectada.',
				content: {
					'application/json': {
						schema: healthResponseSchema,
					},
				},
			},
			500: {
				description: 'Error al comprobar el estado del sistema o la base de datos.',
				content: {
					'application/json': {
						schema: internalErrorResponseSchema,
					},
				},
			},
		},
	});
}
