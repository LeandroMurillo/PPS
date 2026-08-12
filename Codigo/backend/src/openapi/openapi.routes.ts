import { apiReference } from '@scalar/express-api-reference';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { Router } from 'express';

import { requireRole, verifyToken } from '../middleware/auth.middleware.js';
import { openApiDocument } from './document.js';

export const openApiRouter = Router();

const adminAuthMiddleware = [verifyToken, requireRole('ADMIN')];

/**
 * Documento OpenAPI en formato JSON (protegido para ADMIN y MODERADOR).
 */
openApiRouter.get('/openapi.json', adminAuthMiddleware, (_request: Request, response: Response) => {
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
	adminAuthMiddleware,
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
