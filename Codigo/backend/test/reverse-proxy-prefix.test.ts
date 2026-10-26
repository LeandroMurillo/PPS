import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../src/database/pool.js', () => ({
	pool: {
		query: vi.fn().mockResolvedValue([[{ ok: 1 }]]),
	},
}));

import { app } from '../src/app.js';

describe('soporte de reverse proxy con StripPrefix (Coolify / Traefik)', () => {
	it('restaura el prefijo cuando x-forwarded-prefix es /api', async () => {
		const response = await request(app)
			.get('/health')
			.set('x-forwarded-prefix', '/api');

		expect(response.status).toBe(200);
		expect(response.body.status).toBe('ok');
		expect(response.body.database).toBe('connected');
	});

	it('restaura el prefijo cuando la ruta comienza con prefijo de API conocido sin header', async () => {
		const response = await request(app).get('/health');

		expect(response.status).toBe(200);
		expect(response.body.status).toBe('ok');
	});

	it('mantiene la ruta original si ya incluye /api', async () => {
		const response = await request(app).get('/api/health');

		expect(response.status).toBe(200);
		expect(response.body.status).toBe('ok');
	});
});
