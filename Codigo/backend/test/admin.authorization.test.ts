import express from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import { adminRouter } from '../src/modules/admin/admin.routes.js';

vi.mock('../src/middleware/auth-session.repository.js', () => ({
	obtenerUsuarioSesionRepository: vi.fn(async (idUsuario: number) => ({
		idUsuario,
		email: idUsuario === 20 ? 'admin@example.com' : 'moderador@example.com',
		rol: idUsuario === 20 ? 'ADMIN' : 'MODERADOR',
		estado: 'A',
	})),
}));

import { createSessionToken } from '../src/modules/auth/session-token.js';

const app = express();
app.use(express.json());
app.use('/api/admin', adminRouter);

const moderatorToken = createSessionToken(10);
const adminToken = createSessionToken(20);

describe('autorización de rutas administrativas', () => {
	it.each([
		['moderador', 10, moderatorToken],
		['administrador', 20, adminToken],
	])('impide que un %s cambie el estado de su propia cuenta', async (_role, idUsuario, token) => {
		const response = await request(app)
			.patch(`/api/admin/usuarios/${idUsuario}/estado`)
			.set('Authorization', `Bearer ${token}`)
			.send({ estado: 'I' });

		expect(response.status).toBe(409);
		expect(response.body).toEqual({
			error: {
				code: 'SELF_STATE_CHANGE_NOT_ALLOWED',
				message: 'No podés cambiar el estado de tu propia cuenta desde la administración',
			},
		});
	});

	it.each([
		['PUT', '/api/admin/usuarios/1/moderacion'],
		['POST', '/api/admin/categorias'],
		['GET', '/api/admin/preguntas'],
	])('impide que un moderador use %s %s', async (method, path) => {
		const response = await request(app)
			[method.toLowerCase() as 'get' | 'post' | 'put'](path)
			.set('Authorization', `Bearer ${moderatorToken}`);

		expect(response.status).toBe(403);
		expect(response.body).toEqual({
			error: {
				code: 'FORBIDDEN',
				message: 'No posee los permisos necesarios para realizar esta acción.',
			},
		});
	});
});
