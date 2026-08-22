import express from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import { convocatoriasRouter } from '../src/modules/convocatorias/convocatorias.routes.js';

vi.mock('../src/middleware/auth-session.repository.js', () => ({
	obtenerUsuarioSesionRepository: vi.fn(async (idUsuario: number) => {
		if (idUsuario === 1) {
			return { idUsuario: 1, email: 'usuario@example.com', rol: 'USUARIO', estado: 'A' };
		}
		if (idUsuario === 10) {
			return { idUsuario: 10, email: 'moderador@example.com', rol: 'MODERADOR', estado: 'A' };
		}
		if (idUsuario === 20) {
			return { idUsuario: 20, email: 'admin@example.com', rol: 'ADMIN', estado: 'A' };
		}
		return null;
	}),
}));

const mockPostulantes = [
	{
		idActor: 5,
		fechaPostulacion: '2026-08-20T10:00:00.000Z',
		nombreActor: 'Compañía Teatral Norte',
		fotoPerfilUrl: null,
		estadoActor: 'A',
		categoria: 'Teatro',
		subcategoria: 'Danza Teatro',
		departamento: 'Capital',
		localidad: 'San Miguel de Tucumán',
		responsableNombre: 'Juan',
		responsableApellido: 'Pérez',
		responsableEmail: 'juan.perez@example.com',
	},
];

const mockConvocatoria = {
	idConvocatoria: 1,
	titulo: 'Convocatoria Artes Escénicas 2026',
	descripcion: 'Fondo de fomento a las artes',
	fechaCreacion: '2026-08-01T00:00:00.000Z',
	fechaCierre: '2026-09-01T00:00:00.000Z',
	totalPostulaciones: 1,
	estado: 'ABIERTA',
};

vi.mock('../src/modules/convocatorias/convocatorias.service.js', () => ({
	listarConvocatoriasActivasService: vi.fn(),
	listarConvocatoriasAdminService: vi.fn(),
	obtenerConvocatoriaDetalleService: vi.fn(async () => ({
		convocatoria: mockConvocatoria,
		postulantes: mockPostulantes,
	})),
	crearConvocatoriaService: vi.fn(),
	editarConvocatoriaService: vi.fn(),
	eliminarConvocatoriaService: vi.fn(),
	postularActorService: vi.fn(),
	cancelarPostulacionService: vi.fn(),
}));

import { createSessionToken } from '../src/modules/auth/session-token.js';

const app = express();
app.use(express.json());
app.use('/api/convocatorias', convocatoriasRouter);

const userToken = createSessionToken(1);
const moderatorToken = createSessionToken(10);
const adminToken = createSessionToken(20);

describe('Seguridad y privacidad en detalle de convocatorias (GET /api/convocatorias/:id)', () => {
	it('oculta la lista de postulantes y sus datos personales a usuarios no autenticados', async () => {
		const response = await request(app).get('/api/convocatorias/1');

		expect(response.status).toBe(200);
		expect(response.body.data).toEqual(mockConvocatoria);
		expect(response.body.postulantes).toEqual([]);
	});

	it('oculta la lista de postulantes y sus datos personales a usuarios con rol USUARIO', async () => {
		const response = await request(app).get('/api/convocatorias/1').set('Authorization', `Bearer ${userToken}`);

		expect(response.status).toBe(200);
		expect(response.body.data).toEqual(mockConvocatoria);
		expect(response.body.postulantes).toEqual([]);
	});

	it('expone la lista de postulantes con datos personales a usuarios con rol MODERADOR', async () => {
		const response = await request(app)
			.get('/api/convocatorias/1')
			.set('Authorization', `Bearer ${moderatorToken}`);

		expect(response.status).toBe(200);
		expect(response.body.data).toEqual(mockConvocatoria);
		expect(response.body.postulantes).toEqual(mockPostulantes);
	});

	it('expone la lista de postulantes con datos personales a usuarios con rol ADMIN', async () => {
		const response = await request(app).get('/api/convocatorias/1').set('Authorization', `Bearer ${adminToken}`);

		expect(response.status).toBe(200);
		expect(response.body.data).toEqual(mockConvocatoria);
		expect(response.body.postulantes).toEqual(mockPostulantes);
	});
});
