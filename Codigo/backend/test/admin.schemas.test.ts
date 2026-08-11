import { describe, expect, it } from 'vitest';

import {
	asignarModeradorAdminBodySchema,
	actorDetalleEncuestaAdminSchema,
	actorAdminParamsSchema,
	asociarPreguntaFormularioAdminBodySchema,
	cambiarEstadoActoresAdminBodySchema,
	cambiarEstadoUsuarioAdminBodySchema,
	categoriaAdminParamsSchema,
	crearPreguntaFormularioAdminBodySchema,
	formularioSubcategoriaAdminParamsSchema,
	guardarCategoriaAdminBodySchema,
	guardarFormularioAdminBodySchema,
	listarActoresAdminQuerySchema,
	listarCategoriasAdminQuerySchema,
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
				departamento: '  Capital  ',
				tipoActor: 'COLECTIVO',
				estado: 'P',
				limit: '10',
				offset: '20',
				sortBy: 'categoria',
				sortDir: 'DESC',
			}),
		).toMatchObject({
			idCategoria: 3,
			departamento: 'Capital',
			tipoActor: 'COLECTIVO',
			estado: 'P',
			limit: 10,
			offset: 20,
			sortBy: 'categoria',
			sortDir: 'DESC',
		});
	});

	it('normaliza el identificador del detalle de usuario', () => {
		expect(usuarioAdminParamsSchema.parse({ id: '12' })).toEqual({ id: 12 });
	});

	it('normaliza y valida el identificador del detalle de actor', () => {
		expect(actorAdminParamsSchema.parse({ id: '12' })).toEqual({ id: 12 });
		expect(actorAdminParamsSchema.safeParse({ id: '0' }).success).toBe(false);
		expect(actorAdminParamsSchema.safeParse({ id: 'actor' }).success).toBe(false);
	});

	it('valida las encuestas incluidas en el detalle administrativo del actor', () => {
		expect(
			actorDetalleEncuestaAdminSchema.safeParse({
				id: 1,
				tipo: 'categoria',
				ambito: 'Artesanía',
				titulo: 'Relevamiento de Artesanía',
				descripcion: 'Información productiva general.',
				secciones: [
					{
						titulo: 'Preguntas',
						respuestas: [
							{
								id: 1,
								pregunta: 'Rama productiva principal',
								tipoDato: 'OPCION_UNICA',
								opciones: ['Telar Criollo', 'Macramé'],
								respuesta: 'Telar Criollo',
								obligatoria: true,
								publica: true,
							},
						],
					},
				],
			}).success,
		).toBe(true);
	});

	it('solo permite activar o dar de baja a un usuario', () => {
		expect(cambiarEstadoUsuarioAdminBodySchema.safeParse({ estado: 'I' }).success).toBe(true);
		expect(cambiarEstadoUsuarioAdminBodySchema.safeParse({ estado: 'P' }).success).toBe(false);
	});

	it('solo permite activar o dar de baja actores con una selección válida', () => {
		expect(cambiarEstadoActoresAdminBodySchema.safeParse({ ids: [1, 2], estado: 'A' }).success).toBe(true);
		expect(cambiarEstadoActoresAdminBodySchema.safeParse({ ids: [], estado: 'A' }).success).toBe(false);
		expect(cambiarEstadoActoresAdminBodySchema.safeParse({ ids: [1], estado: 'P' }).success).toBe(false);
	});

	it('permite quitar todas las categorías para restaurar el rol de usuario', () => {
		expect(asignarModeradorAdminBodySchema.safeParse({ idCategorias: [1, 3] }).success).toBe(true);
		expect(asignarModeradorAdminBodySchema.safeParse({ idCategorias: [] }).success).toBe(true);
	});

	it('aplica valores predeterminados al listado de categorías', () => {
		expect(listarCategoriasAdminQuerySchema.parse({})).toEqual({
			limit: 25,
			offset: 0,
			sortBy: 'idCategoria',
			sortDir: 'ASC',
		});
	});

	it('normaliza filtros y orden del listado de categorías', () => {
		expect(
			listarCategoriasAdminQuerySchema.parse({
				busqueda: '  música  ',
				estado: 'I',
				limit: '10',
				offset: '20',
				sortBy: 'icono',
				sortDir: 'desc',
			}),
		).toEqual({
			busqueda: 'música',
			estado: 'I',
			limit: 10,
			offset: 20,
			sortBy: 'icono',
			sortDir: 'DESC',
		});
	});

	it('rechaza campos de orden que no están permitidos en categorías', () => {
		expect(listarCategoriasAdminQuerySchema.safeParse({ sortBy: 'campoInexistente' }).success).toBe(false);
	});

	it('valida los datos de creación y edición de categorías', () => {
		expect(guardarCategoriaAdminBodySchema.parse({ nombre: '  Teatro  ' })).toEqual({
			nombre: 'Teatro',
			icono: 'Category',
			estado: 'A',
		});
		expect(guardarCategoriaAdminBodySchema.safeParse({ nombre: 'Teatro', icono: 'TheaterComedy' }).success).toBe(
			true,
		);
		expect(guardarCategoriaAdminBodySchema.safeParse({ nombre: 'Teatro', icono: 'NoExiste' }).success).toBe(false);
		expect(guardarCategoriaAdminBodySchema.safeParse({ nombre: '' }).success).toBe(false);
		expect(guardarCategoriaAdminBodySchema.safeParse({ nombre: 'x'.repeat(46) }).success).toBe(false);
		expect(categoriaAdminParamsSchema.parse({ id: '7' })).toEqual({ id: 7 });
	});

	it('valida el ámbito y los datos generales de un formulario', () => {
		expect(formularioSubcategoriaAdminParamsSchema.parse({ idCategoria: '1', idSubcategoria: '3' })).toEqual({
			idCategoria: 1,
			idSubcategoria: 3,
		});
		expect(
			guardarFormularioAdminBodySchema.parse({
				titulo: '  Relevamiento musical  ',
				descripcion: '  Trayectoria y actividad  ',
			}),
		).toEqual({ titulo: 'Relevamiento musical', descripcion: 'Trayectoria y actividad' });
		expect(guardarFormularioAdminBodySchema.parse({ titulo: 'Ficha', descripcion: '  ' })).toEqual({
			titulo: 'Ficha',
			descripcion: null,
		});
	});

	it('exige opciones solamente para preguntas de selección', () => {
		expect(
			crearPreguntaFormularioAdminBodySchema.safeParse({
				pregunta: 'Formato de presentación',
				tipoDato: 'OPCION_UNICA',
				opciones: ['Solista', 'Banda'],
			}).success,
		).toBe(true);
		expect(
			crearPreguntaFormularioAdminBodySchema.safeParse({
				pregunta: 'Formato de presentación',
				tipoDato: 'OPCION_UNICA',
				opciones: null,
			}).success,
		).toBe(false);
		expect(
			crearPreguntaFormularioAdminBodySchema.safeParse({
				pregunta: 'Trayectoria',
				tipoDato: 'TEXTO',
				opciones: ['No corresponde', 'Otra'],
			}).success,
		).toBe(false);
	});

	it('valida la asociación de una pregunta existente a un formulario', () => {
		expect(asociarPreguntaFormularioAdminBodySchema.parse({ idPregunta: '15' })).toEqual({
			idPregunta: 15,
			esObligatorio: false,
			esPublico: true,
		});
		expect(asociarPreguntaFormularioAdminBodySchema.safeParse({ idPregunta: '0' }).success).toBe(false);
	});
});

