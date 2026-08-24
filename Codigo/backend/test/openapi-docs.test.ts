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

	it('contiene registradas todas las rutas principales de los módulos', async () => {
		const { openApiDocument } = await import('../src/openapi/document.js');
		const paths = openApiDocument.paths ?? {};

		// Salud
		expect(paths['/api/health']).toBeDefined();

		// Auth
		expect(paths['/api/publico/auth/registro']).toBeDefined();
		expect(paths['/api/publico/auth/firebase/session']).toBeDefined();
		expect(paths['/api/publico/auth/actividades-arca']).toBeDefined();

		// Actores públicos
		expect(paths['/api/publico/actores']).toBeDefined();
		expect(paths['/api/publico/actores/mapa']).toBeDefined();
		expect(paths['/api/publico/actores/eventos']).toBeDefined();
		expect(paths['/api/publico/actores/estadisticas']).toBeDefined();
		expect(paths['/api/publico/actores/{id}']).toBeDefined();

		// Perfil Usuario
		expect(paths['/api/usuario/perfil']).toBeDefined();
		expect(paths['/api/usuario/cuenta']).toBeDefined();
		expect(paths['/uploads/dni/{filename}']).toBeDefined();

		// Mis Actores
		expect(paths['/api/mis-actores']).toBeDefined();
		expect(paths['/api/mis-actores/opciones-registro']).toBeDefined();
		expect(paths['/api/mis-actores/formularios-aplicables']).toBeDefined();
		expect(paths['/api/mis-actores/{id}']).toBeDefined();
		expect(paths['/api/mis-actores/{id}/formularios']).toBeDefined();
		expect(paths['/api/mis-actores/{id}/portafolio']).toBeDefined();
		expect(paths['/api/mis-actores/{id}/eventos']).toBeDefined();
		expect(paths['/api/mis-actores/{id}/integrantes']).toBeDefined();
		expect(paths['/api/mis-actores/{id}/integrantes-no-registrados']).toBeDefined();
		expect(paths['/api/mis-actores/{id}/transferir-titularidad']).toBeDefined();

		// Convocatorias
		expect(paths['/api/convocatorias']).toBeDefined();
		expect(paths['/api/convocatorias/{id}']).toBeDefined();
		expect(paths['/api/convocatorias/{id}/postular']).toBeDefined();
		expect(paths['/api/admin/convocatorias']).toBeDefined();

		// Admin
		expect(paths['/api/admin/usuarios']).toBeDefined();
		expect(paths['/api/admin/actores']).toBeDefined();
		expect(paths['/api/admin/categorias']).toBeDefined();
		expect(paths['/api/admin/preguntas']).toBeDefined();
		expect(paths['/api/admin/actividades-arca']).toBeDefined();
		expect(paths['/api/admin/auditoria/integridad']).toBeDefined();
	});
});
