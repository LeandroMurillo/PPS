import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';

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

export function verifyToken(req: Request, res: Response, next: NextFunction): void {
	let token: string | undefined;

	const authHeader = req.headers.authorization;
	if (authHeader && authHeader.startsWith('Bearer ')) {
		token = authHeader.substring(7);
	} else if (typeof req.query.token === 'string' && req.query.token) {
		token = req.query.token;
	}

	if (!token) {
		res.status(401).json({
			error: {
				code: 'UNAUTHORIZED',
				message: 'Acceso no autorizado. Se requiere un token de sesión.',
			},
		});
		return;
	}

	try {
		const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUser;
		req.user = decoded;
		next();
	} catch {
		res.status(401).json({
			error: {
				code: 'INVALID_TOKEN',
				message: 'Token de sesión inválido o expirado.',
			},
		});
	}
}

export function optionalToken(req: Request, _res: Response, next: NextFunction): void {
	let token: string | undefined;

	const authHeader = req.headers.authorization;
	if (authHeader && authHeader.startsWith('Bearer ')) {
		token = authHeader.substring(7);
	} else if (typeof req.query.token === 'string' && req.query.token) {
		token = req.query.token;
	}

	if (token) {
		try {
			const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUser;
			req.user = decoded;
		} catch {
			// Ignore invalid token on optional endpoints
		}
	}
	next();
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
