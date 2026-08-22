import mariadb, { type Pool } from 'mariadb';

import { env } from '../config/env.js';
import { logger } from '../shared/logger.js';

export const pool: Pool = mariadb.createPool({
	host: env.DB_HOST,
	port: env.DB_PORT,
	user: env.DB_USER,
	password: env.DB_PASSWORD,
	database: env.DB_NAME,

	connectionLimit: env.DB_CONNECTION_LIMIT,

	connectTimeout: 5_000,
	acquireTimeout: 10_000,
});

export async function checkDatabaseConnection(): Promise<void> {
	const result: unknown = await pool.query('CALL sp_sistema_ping()');
	const rows = Array.isArray(result) && Array.isArray(result[0]) ? (result[0] as Array<{ ok?: number }>) : [];

	if (rows[0]?.ok !== 1) {
		throw new Error('MariaDB respondió de manera inesperada');
	}

	logger.info(
		{
			host: env.DB_HOST,
			port: env.DB_PORT,
			database: env.DB_NAME,
		},
		'Conexión con MariaDB verificada',
	);
}

export async function closeDatabasePool(): Promise<void> {
	await pool.end();
	logger.info('Pool de MariaDB cerrado');
}
