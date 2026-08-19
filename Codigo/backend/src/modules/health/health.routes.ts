import { Router } from 'express';

import { pool } from '../../database/pool.js';

export const healthRouter = Router();

healthRouter.get('/health', async (_request, response) => {
	const rows = await pool.query<Array<{ ok: number }>>('SELECT 1 AS ok');
	const uptimeSeconds = process.uptime();
	const hours = Math.floor(uptimeSeconds / 3600);
	const minutes = Math.floor((uptimeSeconds % 3600) / 60);
	const seconds = Math.floor(uptimeSeconds % 60);

	response.status(200).json({
		status: 'ok',
		service: 'cultura-backend',
		database: rows[0]?.ok === 1 ? 'connected' : 'unknown',
		uptime: `${hours}h ${minutes}m ${seconds}s`,
		uptimeSeconds,
		timestamp: new Date().toISOString(),
	});
});
