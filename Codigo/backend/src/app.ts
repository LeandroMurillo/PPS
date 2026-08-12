import path from 'node:path';
import { fileURLToPath } from 'node:url';

import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';

import { env } from './config/env.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFoundHandler } from './middleware/not-found-handler.js';
import { actoresPublicosRouter } from './modules/actores/actores.routes.js';
import { misActoresRouter } from './modules/actores/mis-actores.routes.js';
import { adminRouter } from './modules/admin/admin.routes.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { healthRouter } from './modules/health/health.routes.js';
import { openApiRouter } from './openapi/openapi.routes.js';
import { logger } from './shared/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

app.disable('x-powered-by');

app.use(
	pinoHttp({
		logger,
	}),
);

app.use(helmet());

app.use(
	cors({
		origin: env.CORS_ORIGIN,
		credentials: true,
	}),
);

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

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api', healthRouter);

app.use('/api/publico/auth', authRouter);
app.use('/api/publico/actores', actoresPublicosRouter);
app.use('/api/mis-actores', misActoresRouter);
app.use('/api/admin', adminRouter);

app.use(openApiRouter);

app.use(notFoundHandler);
app.use(errorHandler);
