import type { RequestHandler } from 'express';

import { verifyFirebaseIdToken } from '../../config/firebase-admin.js';
import { registrarUsuarioBodySchema } from './auth.schemas.js';
import {
	crearSesionFirebaseService,
	listarActividadesArcaService,
	registrarUsuarioService,
	type FirebaseIdentity,
} from './auth.service.js';

function getBearerToken(request: Parameters<RequestHandler>[0]): string | null {
	const authorization = request.headers.authorization;
	return authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
}

async function getFirebaseIdentity(request: Parameters<RequestHandler>[0]): Promise<FirebaseIdentity> {
	const token = getBearerToken(request);
	if (!token) throw new Error('FIREBASE_TOKEN_REQUIRED');

	const decoded = await verifyFirebaseIdToken(token);
	if (!decoded.email) throw new Error('FIREBASE_EMAIL_REQUIRED');

	return {
		uid: decoded.uid,
		email: decoded.email.trim().toLowerCase(),
		emailVerified: decoded.email_verified === true,
	};
}

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

		const identity = await getFirebaseIdentity(request);
		const result = await registrarUsuarioService(validationResult.data, identity);
		response.status(201).json(result);
	} catch (error) {
		if (error instanceof Error && error.message === 'FIREBASE_NOT_CONFIGURED') {
			response.status(503).json({
				error: { code: 'FIREBASE_NOT_CONFIGURED', message: 'Firebase no está configurado en el servidor.' },
			});
			return;
		}

		if (
			error instanceof Error &&
			(['FIREBASE_TOKEN_REQUIRED', 'FIREBASE_EMAIL_REQUIRED'].includes(error.message) ||
				error.name === 'FirebaseAuthError')
		) {
			response.status(401).json({
				error: { code: 'INVALID_FIREBASE_TOKEN', message: 'No se pudo validar la identidad de Firebase.' },
			});
			return;
		}

		if (error instanceof Error && error.message === 'EMAIL_NOT_VERIFIED') {
			response.status(403).json({
				error: {
					code: 'EMAIL_NOT_VERIFIED',
					message: 'Debés verificar tu correo antes de completar el registro.',
				},
			});
			return;
		}

		if (error instanceof Error && (error.message.includes('registrado') || error.message.includes('existe'))) {
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

export const crearSesionFirebaseController: RequestHandler = async (request, response) => {
	try {
		const identity = await getFirebaseIdentity(request);
		const result = await crearSesionFirebaseService(identity);
		response.status(200).json(result);
	} catch (error) {
		if (error instanceof Error) {
			if (error.message === 'EMAIL_NOT_VERIFIED') {
				response.status(403).json({
					error: {
						code: 'EMAIL_NOT_VERIFIED',
						message: 'Debés verificar tu correo electrónico antes de iniciar sesión.',
					},
				});
				return;
			}

			if (error.message === 'PROFILE_INCOMPLETE') {
				response.status(404).json({
					error: {
						code: 'PROFILE_INCOMPLETE',
						message: 'Tu identidad está verificada, pero todavía debés completar el registro.',
					},
				});
				return;
			}

			if (error.message === 'ACCOUNT_PENDING') {
				response.status(401).json({
					error: {
						code: 'ACCOUNT_PENDING',
						message: 'Tu registro se encuentra pendiente de aprobación administrativa.',
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

		if (error instanceof Error && error.message === 'FIREBASE_NOT_CONFIGURED') {
			response.status(503).json({
				error: { code: 'FIREBASE_NOT_CONFIGURED', message: 'Firebase no está configurado en el servidor.' },
			});
			return;
		}

		if (error instanceof Error && ['FIREBASE_TOKEN_REQUIRED', 'FIREBASE_EMAIL_REQUIRED'].includes(error.message)) {
			response
				.status(401)
				.json({ error: { code: 'INVALID_FIREBASE_TOKEN', message: 'Identidad de Firebase inválida.' } });
			return;
		}

		response.status(401).json({
			error: { code: 'INVALID_FIREBASE_TOKEN', message: 'No se pudo validar la identidad de Firebase.' },
		});
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
