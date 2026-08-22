import path from 'node:path';
import { fileURLToPath } from 'node:url';

import cors from 'cors';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';

import { env } from './config/env.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFoundHandler } from './middleware/not-found-handler.js';
import { verifyToken } from './middleware/auth.middleware.js';
import { actoresPublicosRouter } from './modules/actores/actores.routes.js';
import { misActoresRouter } from './modules/actores/mis-actores.routes.js';
import { adminRouter } from './modules/admin/admin.routes.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { convocatoriasAdminRouter, convocatoriasRouter } from './modules/convocatorias/convocatorias.routes.js';
import { healthRouter } from './modules/health/health.routes.js';
import { usuarioRouter } from './modules/usuario/usuario.routes.js';
import { obtenerDniArchivoController } from './modules/usuario/dni-archivo.controller.js';
import { openApiRouter } from './openapi/openapi.routes.js';
import { logger } from './shared/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

app.set('trust proxy', 1);

app.disable('x-powered-by');

app.use(
	pinoHttp({
		logger,
	}),
);

app.use(
	helmet({
		crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
	}),
);

app.use(
	cors({
		origin: env.CORS_ORIGIN,
		credentials: true,
	}),
);

// Mitigación de DoS por saturación de peticiones (Rate Limiting)
const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: env.NODE_ENV === 'test' ? 10000 : 300,
	standardHeaders: 'draft-8',
	legacyHeaders: false,
	message: {
		error: {
			code: 'TOO_MANY_REQUESTS',
			message: 'Demasiadas solicitudes desde esta IP, por favor intentá de nuevo más tarde.',
		},
	},
});

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: env.NODE_ENV === 'test' ? 10000 : 30,
	standardHeaders: 'draft-8',
	legacyHeaders: false,
	message: {
		error: {
			code: 'TOO_MANY_REQUESTS',
			message: 'Demasiados intentos de autenticación, por favor intentá de nuevo más tarde.',
		},
	},
});

app.use('/api', apiLimiter);

// Límite de payload reducido de 60mb a 10mb para prevenir agotamiento de memoria
app.use(
	express.json({
		limit: '10mb',
	}),
);

app.use(
	express.urlencoded({
		extended: true,
		limit: '10mb',
	}),
);

// Archivos estáticos públicos (perfiles y portafolios de actores)
app.use(
	'/uploads/actores',
	(_req, res, next) => {
		res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
		next();
	},
	express.static(path.join(__dirname, '../uploads/actores')),
);

// Acceso autenticado y restringido a imágenes de DNI (privadas)
app.get('/uploads/dni/:filename', verifyToken, obtenerDniArchivoController);

app.use('/api', healthRouter);

app.use('/api/publico/auth', authLimiter, authRouter);
app.use('/api/publico/actores', actoresPublicosRouter);
app.use('/api/mis-actores', misActoresRouter);
app.use('/api/usuario', usuarioRouter);
app.use('/api/convocatorias', convocatoriasRouter);
app.use('/api/admin/convocatorias', convocatoriasAdminRouter);
app.use('/api/admin', adminRouter);

app.use(openApiRouter);

app.use(notFoundHandler);
app.use(errorHandler);
