import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';

import { env } from './config/env.js';
import { openApiRouter } from './openapi/openapi.routes.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFoundHandler } from './middleware/not-found-handler.js';
import { actoresPublicosRouter } from './modules/actores/actores.routes.js';
import { healthRouter } from './modules/health/health.routes.js';
import { logger } from './shared/logger.js';

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
		limit: '1mb',
	}),
);

app.use(
	express.urlencoded({
		extended: true,
		limit: '1mb',
	}),
);

app.use('/api', healthRouter);

app.use('/api/publico/actores', actoresPublicosRouter);

app.use(openApiRouter);

app.use(notFoundHandler);
app.use(errorHandler);
