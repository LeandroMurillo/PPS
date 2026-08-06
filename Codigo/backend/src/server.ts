import type { Server } from 'node:http';

import { app } from './app.js';
import { env } from './config/env.js';
import { checkDatabaseConnection, closeDatabasePool } from './database/pool.js';
import { logger } from './shared/logger.js';

let server: Server | undefined;

async function startServer(): Promise<void> {
	try {
		await checkDatabaseConnection();

		server = app.listen(env.PORT, () => {
			logger.info(
				{
					port: env.PORT,
					environment: env.NODE_ENV,
				},
				`Servidor disponible en http://localhost:${env.PORT}`,
			);
		});
	} catch (error) {
		logger.fatal(
			{
				err: error,
			},
			'No se pudo iniciar el servidor',
		);

		await closeDatabasePool().catch(() => undefined);
		process.exit(1);
	}
}

async function shutdown(signal: string): Promise<void> {
	logger.info(
		{
			signal,
		},
		'Cerrando aplicación',
	);

	if (!server) {
		await closeDatabasePool();
		process.exit(0);
	}

	server.close((serverError) => {
		void closeDatabasePool()
			.then(() => {
				process.exit(serverError ? 1 : 0);
			})
			.catch((databaseError: unknown) => {
				logger.error(
					{
						err: databaseError,
					},
					'No se pudo cerrar el pool',
				);

				process.exit(1);
			});
	});
}

process.on('SIGINT', () => {
	void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
	void shutdown('SIGTERM');
});

void startServer();
