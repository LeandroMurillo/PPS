import { describe, expect, it } from 'vitest';

import {
	asignarModeradorAdminBodySchema,
	cambiarEstadoUsuarioAdminBodySchema,
	listarActoresAdminQuerySchema,
	listarUsuariosAdminQuerySchema,
	usuarioAdminParamsSchema,
} from '../src/modules/admin/admin.schemas.js';

describe('consultas administrativas', () => {
	it('aplica paginación y orden predeterminados a usuarios', () => {
		expect(listarUsuariosAdminQuerySchema.parse({})).toEqual({
			limit: 25,
			offset: 0,
			sortBy: 'idUsuario',
			sortDir: 'ASC',
		});
	});

	it('normaliza filtros y dirección de orden', () => {
		expect(
			listarUsuariosAdminQuerySchema.parse({
				busqueda: '  ana  ',
				rol: 'ADMIN',
				estado: 'A',
				limit: '50',
				offset: '100',
				sortBy: 'apellido',
				sortDir: 'desc',
			}),
		).toEqual({
			busqueda: 'ana',
			rol: 'ADMIN',
			estado: 'A',
			limit: 50,
			offset: 100,
			sortBy: 'apellido',
			sortDir: 'DESC',
		});
	});

	it('rechaza campos de orden que no están permitidos', () => {
		const result = listarUsuariosAdminQuerySchema.safeParse({ sortBy: 'contraseña' });
		expect(result.success).toBe(false);
	});

	it('valida filtros y paginación de actores', () => {
		expect(
			listarActoresAdminQuerySchema.parse({
				idCategoria: '3',
				idUsuarioDueno: '8',
				limit: '10',
				offset: '20',
				sortBy: 'categoria',
				sortDir: 'DESC',
			}),
		).toMatchObject({
			idCategoria: 3,
			idUsuarioDueno: 8,
			limit: 10,
			offset: 20,
			sortBy: 'categoria',
			sortDir: 'DESC',
		});
	});

	it('normaliza el identificador del detalle de usuario', () => {
		expect(usuarioAdminParamsSchema.parse({ id: '12' })).toEqual({ id: 12 });
	});

	it('solo permite activar o dar de baja a un usuario', () => {
		expect(cambiarEstadoUsuarioAdminBodySchema.safeParse({ estado: 'I' }).success).toBe(true);
		expect(cambiarEstadoUsuarioAdminBodySchema.safeParse({ estado: 'P' }).success).toBe(false);
	});

	it('permite quitar todas las categorías para restaurar el rol de usuario', () => {
		expect(asignarModeradorAdminBodySchema.safeParse({ idCategorias: [1, 3] }).success).toBe(true);
		expect(asignarModeradorAdminBodySchema.safeParse({ idCategorias: [] }).success).toBe(true);
	});
});
