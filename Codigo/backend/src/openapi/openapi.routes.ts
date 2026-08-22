import { apiReference } from '@scalar/express-api-reference';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { Router } from 'express';

import { obtenerUsuarioSesionRepository } from '../middleware/auth-session.repository.js';
import { verifySessionToken } from '../modules/auth/session-token.js';
import { openApiDocument } from './document.js';

export const openApiRouter = Router();

async function docsAdminAuthMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
	const authHeader = req.headers.authorization;
	const token = authHeader?.startsWith('Bearer ')
		? authHeader.substring(7)
		: typeof req.query.token === 'string' && req.query.token
			? req.query.token
			: undefined;

	if (!token) {
		res.status(401).json({
			error: {
				code: 'UNAUTHORIZED',
				message: 'Acceso no autorizado. Se requiere un token de sesión con rol ADMIN.',
			},
		});
		return;
	}

	let idUsuario: number;
	try {
		idUsuario = verifySessionToken(token);
	} catch {
		res.status(401).json({
			error: {
				code: 'INVALID_TOKEN',
				message: 'Token de sesión inválido.',
			},
		});
		return;
	}

	try {
		const user = await obtenerUsuarioSesionRepository(idUsuario);
		if (!user || user.estado !== 'A') {
			res.status(401).json({
				error: {
					code: 'INVALID_TOKEN',
					message: 'Token de sesión inválido.',
				},
			});
			return;
		}

		if (user.rol !== 'ADMIN') {
			res.status(403).json({
				error: {
					code: 'FORBIDDEN',
					message: 'No posee los permisos necesarios para ver la documentación.',
				},
			});
			return;
		}

		req.user = user;
		next();
	} catch (error) {
		next(error);
	}
}

/**
 * Documento OpenAPI en formato JSON (protegido para ADMIN).
 */
openApiRouter.get('/openapi.json', docsAdminAuthMiddleware, (_request: Request, response: Response) => {
	response.status(200).json(openApiDocument);
});

/**
 * CSP específica para la documentación.
 *
 * Reemplaza únicamente en /docs la CSP global
 * generada previamente por Helmet.
 */
openApiRouter.use(
	'/docs',
	docsAdminAuthMiddleware,
	(_request: Request, response: Response, next: NextFunction) => {
		response.setHeader(
			'Content-Security-Policy',
			[
				"default-src 'self'",
				"script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
				"style-src 'self' 'unsafe-inline' https:",
				"font-src 'self' data: https:",
				"img-src 'self' data: blob: https:",
				"connect-src 'self' https:",
				"worker-src 'self' blob:",
				"object-src 'none'",
				"base-uri 'self'",
				"frame-ancestors 'self'",
			].join('; '),
		);

		next();
	},
	(request: Request, response: Response, next: NextFunction) => {
		const token = (request.query.token as string | undefined) ?? request.headers.authorization?.substring(7) ?? '';
		const specUrl = token ? `/openapi.json?token=${encodeURIComponent(token)}` : '/openapi.json';

		return (
			apiReference({
				url: specUrl,
				spec: {
					content: openApiDocument,
				},
				theme: 'elysiajs',
				localization: {
					locale: 'es',
				},
				agent: {
					disabled: true,
				},
				// showDeveloperTools: 'never',
				// mcp: {
				// 	disabled: true,
				// },
				telemetry: false,
				metaData: {
					title: 'Mapa Cultural de Tucumán API',
					description: 'Documentación de la API del Mapa Cultural de Tucumán',
				},
				withDefaultFonts: true,
			}) as unknown as RequestHandler
		)(request, response, next);
	},
);
