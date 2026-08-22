import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const sessionRepositoryMock = vi.hoisted(() => vi.fn());

vi.mock('../src/middleware/auth-session.repository.js', () => ({
	obtenerUsuarioSesionRepository: sessionRepositoryMock,
}));

import { app } from '../src/app.js';
import { createSessionToken } from '../src/modules/auth/session-token.js';

describe('acceso a documentación /docs y /openapi.json', () => {
	beforeEach(() => {
		sessionRepositoryMock.mockReset();
	});

	it('bloquea con 401 si no se envía token', async () => {
		const response = await request(app).get('/openapi.json');

		expect(response.status).toBe(401);
		expect(response.body.error.code).toBe('UNAUTHORIZED');
	});

	it('bloquea con 403 si un usuario regular intenta acceder', async () => {
		sessionRepositoryMock.mockResolvedValue({
			idUsuario: 10,
			email: 'usuario@example.com',
			rol: 'USUARIO',
			estado: 'A',
		});

		const token = createSessionToken(10);
		const response = await request(app).get(`/openapi.json?token=${token}`);

		expect(response.status).toBe(403);
		expect(response.body.error.code).toBe('FORBIDDEN');
	});

	it('permite el acceso a un ADMIN mediante query param ?token=', async () => {
		sessionRepositoryMock.mockResolvedValue({
			idUsuario: 1,
			email: 'admin@example.com',
			rol: 'ADMIN',
			estado: 'A',
		});

		const token = createSessionToken(1);
		const response = await request(app).get(`/openapi.json?token=${token}`);

		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('openapi');
	});

	it('permite el acceso a un ADMIN mediante Bearer header', async () => {
		sessionRepositoryMock.mockResolvedValue({
			idUsuario: 1,
			email: 'admin@example.com',
			rol: 'ADMIN',
			estado: 'A',
		});

		const token = createSessionToken(1);
		const response = await request(app).get('/openapi.json').set('Authorization', `Bearer ${token}`);

		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('openapi');
	});
});
