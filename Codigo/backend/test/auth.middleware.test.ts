import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const sessionRepositoryMock = vi.hoisted(() => vi.fn());

vi.mock('../src/middleware/auth-session.repository.js', () => ({
	obtenerUsuarioSesionRepository: sessionRepositoryMock,
}));

import { verifyToken } from '../src/middleware/auth.middleware.js';
import { createSessionToken } from '../src/modules/auth/session-token.js';

const app = express();
app.get('/protected', verifyToken, (req, res) => {
	res.status(200).json({ user: req.user });
});

describe('validación de la sesión contra la base de datos', () => {
	beforeEach(() => {
		sessionRepositoryMock.mockReset();
	});

	it('usa el rol vigente de la base de datos', async () => {
		sessionRepositoryMock.mockResolvedValue({
			idUsuario: 7,
			email: 'admin@example.com',
			rol: 'ADMIN',
			estado: 'A',
		});

		const response = await request(app)
			.get('/protected')
			.set('Authorization', `Bearer ${createSessionToken(7)}`);

		expect(response.status).toBe(200);
		expect(response.body.user.rol).toBe('ADMIN');
		expect(sessionRepositoryMock).toHaveBeenCalledWith(7);
	});

	it('rechaza inmediatamente el token de una cuenta dada de baja', async () => {
		sessionRepositoryMock.mockResolvedValue({
			idUsuario: 7,
			email: 'usuario@example.com',
			rol: 'USUARIO',
			estado: 'I',
		});

		const response = await request(app)
			.get('/protected')
			.set('Authorization', `Bearer ${createSessionToken(7)}`);

		expect(response.status).toBe(401);
		expect(response.body.error.code).toBe('INVALID_TOKEN');
	});

	it('ignora tokens pasados por query params y responde 401', async () => {
		const token = createSessionToken(7);
		const response = await request(app).get(`/protected?token=${token}`);

		expect(response.status).toBe(401);
		expect(response.body.error.code).toBe('UNAUTHORIZED');
	});
});
