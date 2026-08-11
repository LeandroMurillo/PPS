import type { RequestHandler } from 'express';

import { registrarUsuarioBodySchema } from './auth.schemas.js';
import { registrarUsuarioService } from './auth.service.js';

export const registrarUsuarioController: RequestHandler = async (request, response, next) => {
	try {
		const validationResult = registrarUsuarioBodySchema.safeParse(request.body);

		if (!validationResult.success) {
			response.status(400).json({
				error: {
					code: 'INVALID_REGISTRATION_DATA',
					message: 'Los datos ingresados para el registro no son válidos.',
					details: validationResult.error.issues.map((issue) => ({
						field: issue.path.join('.'),
						code: issue.code,
						message: issue.message,
					})),
				},
			});
			return;
		}

		const result = await registrarUsuarioService(validationResult.data);
		response.status(201).json(result);
	} catch (error) {
		if (
			error instanceof Error &&
			(error.message.includes('registrado') || error.message.includes('existe'))
		) {
			response.status(409).json({
				error: {
					code: 'USER_ALREADY_EXISTS',
					message: error.message,
				},
			});
			return;
		}

		next(error);
	}
};
