import type { NextFunction, Request, Response } from 'express';

import { logger } from '../shared/logger.js';
import { verifySessionToken } from '../modules/auth/session-token.js';
import { obtenerUsuarioSesionRepository } from './auth-session.repository.js';

export interface AuthUser {
	idUsuario: number;
	email: string;
	rol: 'USUARIO' | 'MODERADOR' | 'ADMIN';
	estado: 'A' | 'P' | 'I';
}

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
	namespace Express {
		interface Request {
			user?: AuthUser;
		}
	}
}

export async function verifyToken(req: Request, res: Response, next: NextFunction): Promise<void> {
	const token = getRequestToken(req);
	if (!token) {
		logger.warn(
			{ event: 'AUTH_TOKEN_MISSING', ip: req.ip, path: req.originalUrl },
			'Petición rechazada: token ausente',
		);
		res.status(401).json({
			error: {
				code: 'UNAUTHORIZED',
				message: 'Acceso no autorizado. Se requiere un token de sesión.',
			},
		});
		return;
	}

	let idUsuario: number;
	try {
		idUsuario = verifySessionToken(token);
	} catch {
		invalidSession(req, res);
		return;
	}

	try {
		const user = await obtenerUsuarioSesionRepository(idUsuario);

		if (!user || user.estado !== 'A') {
			invalidSession(req, res);
			return;
		}

		req.user = user;
		next();
	} catch (error) {
		next(error);
	}
}

export async function optionalToken(req: Request, _res: Response, next: NextFunction): Promise<void> {
	const token = getRequestToken(req);
	if (!token) {
		next();
		return;
	}

	let idUsuario: number;
	try {
		idUsuario = verifySessionToken(token);
	} catch {
		next();
		return;
	}

	try {
		const user = await obtenerUsuarioSesionRepository(idUsuario);
		if (user?.estado === 'A') {
			req.user = user;
		}
		next();
	} catch (error) {
		next(error);
	}
}

function getRequestToken(req: Request): string | undefined {
	const authHeader = req.headers.authorization;
	if (authHeader?.startsWith('Bearer ')) {
		return authHeader.substring(7);
	}

	return undefined;
}

function invalidSession(req: Request, res: Response): void {
	logger.warn(
		{ event: 'AUTH_INVALID_SESSION', ip: req.ip, path: req.originalUrl },
		'Sesión rechazada: token inválido o expirado',
	);
	res.status(401).json({
		error: {
			code: 'INVALID_TOKEN',
			message: 'Token de sesión inválido.',
		},
	});
}

export function requireRole(...allowedRoles: string[]) {
	return (req: Request, res: Response, next: NextFunction): void => {
		if (!req.user) {
			logger.warn(
				{ event: 'AUTH_UNAUTHORIZED_NO_USER', ip: req.ip, path: req.originalUrl },
				'Acceso denegado: usuario no autenticado',
			);
			res.status(401).json({
				error: {
					code: 'UNAUTHORIZED',
					message: 'Acceso no autorizado. Se requiere un token de sesión.',
				},
			});
			return;
		}

		if (!allowedRoles.includes(req.user.rol)) {
			logger.warn(
				{
					event: 'AUTH_FORBIDDEN',
					idUsuario: req.user.idUsuario,
					rol: req.user.rol,
					allowedRoles,
					ip: req.ip,
					path: req.originalUrl,
				},
				'Acceso denegado por rol insuficiente',
			);
			res.status(403).json({
				error: {
					code: 'FORBIDDEN',
					message: 'No posee los permisos necesarios para realizar esta acción.',
				},
			});
			return;
		}

		next();
	};
}
