import type { ErrorRequestHandler } from 'express';

import { env } from '../config/env.js';
import { logger } from '../shared/logger.js';

export const errorHandler: ErrorRequestHandler = (error, request, response, next) => {
	logger.error(
		{
			err: error,
			method: request.method,
			path: request.originalUrl,
		},
		'Error procesando la petición',
	);

	if (response.headersSent) {
		next(error);
		return;
	}

	response.status(500).json({
		error: {
			code: 'INTERNAL_SERVER_ERROR',
			message:
				env.NODE_ENV === 'production'
					? 'Se produjo un error interno'
					: error instanceof Error
						? error.message
						: 'Error desconocido',
		},
	});
};
