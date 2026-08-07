import { describe, expect, it } from 'vitest';

import {
	listarActoresAdminQuerySchema,
	listarUsuariosAdminQuerySchema,
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
});
