import type { NextFunction, Request, Response } from 'express';

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
		invalidSession(res);
		return;
	}

	try {
		const user = await obtenerUsuarioSesionRepository(idUsuario);

		if (!user || user.estado !== 'A') {
			invalidSession(res);
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

function invalidSession(res: Response): void {
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
			res.status(401).json({
				error: {
					code: 'UNAUTHORIZED',
					message: 'Acceso no autorizado. Se requiere un token de sesión.',
				},
			});
			return;
		}

		if (!allowedRoles.includes(req.user.rol)) {
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
