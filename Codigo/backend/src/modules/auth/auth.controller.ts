import type { RequestHandler } from 'express';

import { loginBodySchema, registrarUsuarioBodySchema } from './auth.schemas.js';
import { loginService, listarActividadesArcaService, registrarUsuarioService } from './auth.service.js';

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

export const loginController: RequestHandler = async (request, response, next) => {
	try {
		const validationResult = loginBodySchema.safeParse(request.body);

		if (!validationResult.success) {
			response.status(400).json({
				error: {
					code: 'INVALID_LOGIN_DATA',
					message: 'Los datos de inicio de sesión no son válidos.',
					details: validationResult.error.issues.map((issue) => ({
						field: issue.path.join('.'),
						code: issue.code,
						message: issue.message,
					})),
				},
			});
			return;
		}

		const result = await loginService(validationResult.data);
		response.status(200).json(result);
	} catch (error) {
		if (error instanceof Error) {
			if (error.message === 'CREDENTIALS_INVALID') {
				response.status(401).json({
					error: {
						code: 'CREDENTIALS_INVALID',
						message: 'El correo electrónico o la contraseña ingresados son incorrectos.',
					},
				});
				return;
			}

			if (error.message === 'ACCOUNT_INACTIVE') {
				response.status(401).json({
					error: {
						code: 'ACCOUNT_INACTIVE',
						message: 'Su cuenta se encuentra inactiva o dada de baja.',
					},
				});
				return;
			}
		}

		next(error);
	}
};

export const listarActividadesArcaController: RequestHandler = async (_request, response, next) => {
	try {
		const actividades = await listarActividadesArcaService();
		response.status(200).json({ actividades });
	} catch (error) {
		next(error);
	}
};

