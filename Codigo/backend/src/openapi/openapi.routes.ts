import { apiReference } from '@scalar/express-api-reference';
import { Router } from 'express';

import { openApiDocument } from './document.js';

export const openApiRouter = Router();

/**
 * Documento OpenAPI en formato JSON.
 */
openApiRouter.get('/openapi.json', (_request, response) => {
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
	(_request, response, next) => {
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

	apiReference({
		url: '/openapi.json',
		theme: 'default',

		metaData: {
			title: 'Mapa Cultural de Tucumán API',
			description: 'Documentación de la API del Mapa Cultural de Tucumán',
		},

		withDefaultFonts: true,
	}),
);
