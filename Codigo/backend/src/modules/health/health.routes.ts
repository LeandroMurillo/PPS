import { Router } from 'express';

import { pool } from '../../database/pool.js';

export const healthRouter = Router();

healthRouter.get('/health', async (_request, response) => {
	const rows = await pool.query<Array<{ ok: number }>>('SELECT 1 AS ok');

	response.status(200).json({
		status: 'ok',
		service: 'cultura-backend',
		database: rows[0]?.ok === 1 ? 'connected' : 'unknown',
		timestamp: new Date().toISOString(),
	});
});
