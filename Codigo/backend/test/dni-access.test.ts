import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const sessionRepositoryMock = vi.hoisted(() => vi.fn());
const usuarioRepositoryMock = vi.hoisted(() => vi.fn());

vi.mock('../src/middleware/auth-session.repository.js', () => ({
	obtenerUsuarioSesionRepository: sessionRepositoryMock,
}));

vi.mock('../src/modules/usuario/usuario.repository.js', () => ({
	obtenerPerfilUsuarioRepository: usuarioRepositoryMock,
}));

import { app } from '../src/app.js';
import { createSessionToken } from '../src/modules/auth/session-token.js';

describe('control de acceso a documentos DNI (/uploads/dni/:filename)', () => {
	beforeEach(() => {
		sessionRepositoryMock.mockReset();
		usuarioRepositoryMock.mockReset();
	});

	it('bloquea con 401 si no se envía token de autenticación', async () => {
		const response = await request(app).get('/uploads/dni/dni_123456789_abcdef12.png');

		expect(response.status).toBe(401);
		expect(response.body.error.code).toBe('UNAUTHORIZED');
	});

	it('bloquea con 403 si un usuario regular intenta acceder al DNI de otro usuario', async () => {
		sessionRepositoryMock.mockResolvedValue({
			idUsuario: 10,
			email: 'usuario@example.com',
			rol: 'USUARIO',
			estado: 'A',
		});

		usuarioRepositoryMock.mockResolvedValue({
			idUsuario: 10,
			fotoDniUrl: '/uploads/dni/dni_111111111_aaaaaaaa.png',
		});

		const token = createSessionToken(10);
		const response = await request(app)
			.get('/uploads/dni/dni_222222222_bbbbbbbb.png')
			.set('Authorization', `Bearer ${token}`);

		expect(response.status).toBe(403);
		expect(response.body.error.code).toBe('FORBIDDEN');
	});

	it('permite a un ADMIN consultar DNI de cualquier usuario (pasa autorización)', async () => {
		sessionRepositoryMock.mockResolvedValue({
			idUsuario: 1,
			email: 'admin@example.com',
			rol: 'ADMIN',
			estado: 'A',
		});

		const token = createSessionToken(1);
		const response = await request(app)
			.get('/uploads/dni/dni_222222222_bbbbbbbb.png')
			.set('Authorization', `Bearer ${token}`);

		// Como no existe físicamente en el disco en tests, debe retornar 404 y NO 401 ni 403
		expect(response.status).toBe(404);
		expect(response.body.error.code).toBe('NOT_FOUND');
	});
});
