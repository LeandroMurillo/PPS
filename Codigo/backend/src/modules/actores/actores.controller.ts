import type { RequestHandler } from 'express';

import { listarActoresQuerySchema } from './actores.schemas.js';
import { listarActoresService } from './actores.service.js';

export const listarActoresController: RequestHandler = async (request, response) => {
	const validationResult = listarActoresQuerySchema.safeParse(request.query);

	if (!validationResult.success) {
		response.status(400).json({
			error: {
				code: 'INVALID_QUERY_PARAMETERS',
				message: 'Los parámetros de consulta no son válidos',

				details: validationResult.error.issues.map((issue) => ({
					field: issue.path.join('.'),
					code: issue.code,
					message: issue.message,
				})),
			},
		});

		return;
	}

	const result = await listarActoresService(validationResult.data);

	response.status(200).json(result);
};
