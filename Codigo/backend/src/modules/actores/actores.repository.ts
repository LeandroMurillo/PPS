import { z } from 'zod';

import { pool } from '../../database/pool.js';

import type {
	ActorDetallePublico,
	ActorMapaPublico,
	ActorPublicoResumen,
	ListarActoresFiltroCategoria,
	ListarActoresFiltroDepartamento,
	MapaFiltroCategoria,
	MapaFiltroDepartamento,
} from './actores.schemas.js';
import type {
	ListarActoresRepositoryInput,
	ListarActoresRepositoryResult,
	ObtenerActoresMapaRepositoryInput,
	ObtenerActoresMapaRepositoryResult,
	ObtenerActorRepositoryResult,
	ObtenerFiltrosListadoActoresRepositoryResult,
	ObtenerFiltrosMapaRepositoryResult,
} from './actores.types.js';

/**
 * MariaDB puede devolver algunos enteros grandes como:
 *
 * - number
 * - bigint
 * - string
 *
 * Este esquema los normaliza a number y comprueba
 * que estén dentro del rango seguro de JavaScript.
 */
const databaseIntegerSchema = z
	.union([z.number().int(), z.bigint(), z.string().regex(/^\d+$/)])
	.refine((value) => Number.isSafeInteger(Number(value)), {
		message: 'El entero recibido desde MariaDB está fuera del rango seguro',
	})
	.transform((value) => Number(value));

const databaseBooleanSchema = z
	.union([z.boolean(), z.number().int().min(0).max(1), z.string().regex(/^[01]$/)])
	.transform((value) => value === true || value === 1 || value === '1');

const databaseCoordinateSchema = z
	.union([z.number(), z.string().regex(/^-?\d+(\.\d+)?$/)])
	.transform((value) => Number(value))
	.refine((value) => Number.isFinite(value), {
		message: 'La coordenada recibida desde MariaDB no es un número finito',
	});

const databaseLatitudeSchema = databaseCoordinateSchema.refine((value) => value >= -90 && value <= 90, {
	message: 'La latitud recibida desde MariaDB está fuera de rango',
});

const databaseLongitudeSchema = databaseCoordinateSchema.refine(
	(value) => value >= -180 && value <= 180,
	{
		message: 'La longitud recibida desde MariaDB está fuera de rango',
	},
);

const nullableDatabaseLatitudeSchema = databaseLatitudeSchema.nullable();

const nullableDatabaseLongitudeSchema = databaseLongitudeSchema.nullable();

const databaseDateTimeSchema = z
	.union([z.date(), z.string()])
	.transform((value) => (value instanceof Date ? value.toISOString() : value));

const databaseAnswerValueSchema = z
	.union([
		z.string(),
		z.number(),
		z.boolean(),
		z.array(z.union([z.string(), z.number(), z.boolean()])),
	])
	.nullable()
	.transform((value) => {
		if (value === null) {
			return null;
		}

		if (Array.isArray(value)) {
			return value.map((item) => String(item)).join(', ');
		}

		if (typeof value === 'boolean') {
			return value ? 'Sí' : 'No';
		}

		return String(value);
	});

const totalRowSchema = z.object({
	total: databaseIntegerSchema,
});

/**
 * Este esquema representa exactamente las columnas
 * que esperamos recibir del segundo result set.
 *
 * Si cambia algún alias del SP, la validación fallará
 * inmediatamente en vez de devolver datos incompletos.
 */
const actorDatabaseRowSchema = z.object({
	idActor: databaseIntegerSchema,

	nombre: z.string(),
	descripcion: z.string().nullable(),
	fotoPerfilUrl: z.string().nullable(),
	categoria: z.string(),
	subcategoria: z.string().nullable(),
	departamento: z.string(),
	localidad: z.string().nullable(),
});

const actorMapaDatabaseRowSchema = z.object({
	idActor: databaseIntegerSchema,

	nombre: z.string(),
	descripcion: z.string().nullable(),
	fotoPerfilUrl: z.string().nullable(),
	categoria: z.string(),
	subcategoria: z.string().nullable(),
	departamento: z.string(),
	localidad: z.string().nullable(),
	direccion: z.string().nullable(),
	latitud: databaseLatitudeSchema,
	longitud: databaseLongitudeSchema,
});

const actorDetalleDatabaseRowSchema = z.object({
	id: databaseIntegerSchema,
	nombre: z.string(),
	descripcion: z.string().nullable(),
	fotoPerfilUrl: z.string().nullable(),
	categoria: z.string(),
	subcategoria: z.string().nullable(),
	provincia: z.string(),
	departamento: z.string(),
	localidad: z.string().nullable(),
	esUbicacionPublica: databaseBooleanSchema,
	direccion: z.string().nullable(),
	latitud: nullableDatabaseLatitudeSchema,
	longitud: nullableDatabaseLongitudeSchema,
});

const actorDetallePortafolioDatabaseRowSchema = z.object({
	tipo: z.string(),
	descripcion: z.string().nullable(),
	url: z.string(),
});

const actorDetalleEventoDatabaseRowSchema = z.object({
	nombre: z.string(),
	descripcion: z.string().nullable(),
	fecha: databaseDateTimeSchema,
});

const actorDetalleRespuestaDatabaseRowSchema = z.object({
	pregunta: z.string(),
	respuesta: databaseAnswerValueSchema,
});

const actorDetalleIntegranteDatabaseRowSchema = z.object({
	nombre: z.string(),
	apellido: z.string(),
	rol: z.string().nullable(),
});

const listarActoresFiltroCategoriaDatabaseRowSchema = z.object({
	id: databaseIntegerSchema,
	nombre: z.string(),
});

const listarActoresFiltroDepartamentoDatabaseRowSchema = z.object({
	departamento: z.string(),
});

const mapaFiltroCategoriaDatabaseRowSchema = z.object({
	id: databaseIntegerSchema,
	nombre: z.string(),
	cantidadActores: databaseIntegerSchema,
});

const mapaFiltroDepartamentoDatabaseRowSchema = z.object({
	departamento: z.string(),
	cantidadActores: databaseIntegerSchema,
});

function getResultSet(procedureResult: unknown, index: number, procedureName: string): unknown[] {
	if (!Array.isArray(procedureResult)) {
		throw new Error(`El procedimiento ${procedureName} no devolvió result sets`);
	}

	const resultSet: unknown = procedureResult[index];

	if (!Array.isArray(resultSet)) {
		throw new Error(`No se encontró el result set ${index + 1} de ${procedureName}`);
	}

	return resultSet;
}

export async function listarActoresRepository(
	input: ListarActoresRepositoryInput,
): Promise<ListarActoresRepositoryResult> {
	const procedureResult: unknown = await pool.query(
		`
      CALL sp_publico_listar_actores(
        ?,
        ?,
        ?,
        ?,
        ?
      )
    `,
		[input.busqueda, input.departamento, input.idCategoria, input.limit, input.offset],
	);

	/*
	 * Suponemos:
	 *
	 * Result set 0: [{ total: ... }]
	 * Result set 1: [{ actor 1 }, { actor 2 }, ...]
	 *
	 * El CALL también puede incluir al final un paquete
	 * de estado del procedimiento. No necesitamos usarlo.
	 */
	const totalResultSet = getResultSet(procedureResult, 0, 'sp_publico_listar_actores');
	const actoresResultSet = getResultSet(procedureResult, 1, 'sp_publico_listar_actores');

	const totalRows = z.array(totalRowSchema).parse(totalResultSet);

	const totalRow = totalRows[0];

	if (!totalRow) {
		throw new Error('sp_publico_listar_actores no devolvió el total de actores');
	}

	const databaseActors = z.array(actorDatabaseRowSchema).parse(actoresResultSet);

	const actores: ActorPublicoResumen[] = databaseActors.map((actor) => ({
		id: actor.idActor,
		nombre: actor.nombre,
		descripcion: actor.descripcion,
		foto: actor.fotoPerfilUrl,
		categoria: actor.categoria,
		subcategoria: actor.subcategoria,
		departamento: actor.departamento,
		localidad: actor.localidad,
	}));

	return {
		total: totalRow.total,
		actores,
	};
}

export async function obtenerActorRepository(id: number): Promise<ObtenerActorRepositoryResult> {
	const procedureResult: unknown = await pool.query('CALL sp_publico_obtener_actor(?)', [id]);

	const actorResultSet = getResultSet(procedureResult, 0, 'sp_publico_obtener_actor');
	const portafolioResultSet = getResultSet(procedureResult, 1, 'sp_publico_obtener_actor');
	const eventosResultSet = getResultSet(procedureResult, 2, 'sp_publico_obtener_actor');
	const respuestasResultSet = getResultSet(procedureResult, 3, 'sp_publico_obtener_actor');
	const integrantesResultSet = getResultSet(procedureResult, 4, 'sp_publico_obtener_actor');

	const actorRows = z.array(actorDetalleDatabaseRowSchema).parse(actorResultSet);
	const actorRow = actorRows[0];

	if (!actorRow) {
		return {
			actor: null,
		};
	}

	const portafolio = z.array(actorDetallePortafolioDatabaseRowSchema).parse(portafolioResultSet);
	const eventos = z.array(actorDetalleEventoDatabaseRowSchema).parse(eventosResultSet);
	const respuestas = z.array(actorDetalleRespuestaDatabaseRowSchema).parse(respuestasResultSet);
	const integrantes = z.array(actorDetalleIntegranteDatabaseRowSchema).parse(integrantesResultSet);

	const actor: ActorDetallePublico = {
		id: actorRow.id,
		nombre: actorRow.nombre,
		descripcion: actorRow.descripcion,
		foto: actorRow.fotoPerfilUrl,
		categoria: actorRow.categoria,
		subcategoria: actorRow.subcategoria,
		ubicacion: {
			provincia: actorRow.provincia,
			departamento: actorRow.departamento,
			localidad: actorRow.localidad,
			esPublica: actorRow.esUbicacionPublica,
			direccion: actorRow.direccion,
			latitud: actorRow.latitud,
			longitud: actorRow.longitud,
		},
		portafolio,
		eventos,
		respuestas,
		integrantes,
	};

	return {
		actor,
	};
}

export async function obtenerActoresMapaRepository(
	input: ObtenerActoresMapaRepositoryInput,
): Promise<ObtenerActoresMapaRepositoryResult> {
	const categoriasJson = input.categorias.length > 0 ? JSON.stringify(input.categorias) : null;

	const procedureResult: unknown = await pool.query('CALL sp_publico_mapa_actores(?, ?, ?)', [
		input.busqueda,
		input.departamento,
		categoriasJson,
	]);

	const actoresResultSet = getResultSet(procedureResult, 0, 'sp_publico_mapa_actores');
	const actoresDatabaseRows = z.array(actorMapaDatabaseRowSchema).parse(actoresResultSet);

	const actores: ActorMapaPublico[] = actoresDatabaseRows.map((actor) => ({
		id: actor.idActor,
		nombre: actor.nombre,
		descripcion: actor.descripcion,
		foto: actor.fotoPerfilUrl,
		categoria: actor.categoria,
		subcategoria: actor.subcategoria,
		departamento: actor.departamento,
		localidad: actor.localidad,
		direccion: actor.direccion,
		latitud: actor.latitud,
		longitud: actor.longitud,
	}));

	return {
		actores,
	};
}

export async function obtenerFiltrosListadoActoresRepository(): Promise<ObtenerFiltrosListadoActoresRepositoryResult> {
	const procedureResult: unknown = await pool.query('CALL sp_publico_listar_actores_filtros()');

	const categoriasResultSet = getResultSet(
		procedureResult,
		0,
		'sp_publico_listar_actores_filtros',
	);
	const departamentosResultSet = getResultSet(
		procedureResult,
		1,
		'sp_publico_listar_actores_filtros',
	);

	const categoriasDatabaseRows = z
		.array(listarActoresFiltroCategoriaDatabaseRowSchema)
		.parse(categoriasResultSet);
	const departamentosDatabaseRows = z
		.array(listarActoresFiltroDepartamentoDatabaseRowSchema)
		.parse(departamentosResultSet);

	const categorias: ListarActoresFiltroCategoria[] = categoriasDatabaseRows.map((categoria) => ({
		id: categoria.id,
		nombre: categoria.nombre,
	}));

	const departamentos: ListarActoresFiltroDepartamento[] = departamentosDatabaseRows.map(
		(departamento) => ({
			departamento: departamento.departamento,
		}),
	);

	return {
		categorias,
		departamentos,
	};
}

export async function obtenerFiltrosMapaRepository(): Promise<ObtenerFiltrosMapaRepositoryResult> {
	const procedureResult: unknown = await pool.query('CALL sp_publico_mapa_filtros()');

	const categoriasResultSet = getResultSet(procedureResult, 0, 'sp_publico_mapa_filtros');
	const departamentosResultSet = getResultSet(procedureResult, 1, 'sp_publico_mapa_filtros');

	const categoriasDatabaseRows = z
		.array(mapaFiltroCategoriaDatabaseRowSchema)
		.parse(categoriasResultSet);
	const departamentosDatabaseRows = z
		.array(mapaFiltroDepartamentoDatabaseRowSchema)
		.parse(departamentosResultSet);

	const categorias: MapaFiltroCategoria[] = categoriasDatabaseRows.map((categoria) => ({
		id: categoria.id,
		nombre: categoria.nombre,
		cantidadActores: categoria.cantidadActores,
	}));

	const departamentos: MapaFiltroDepartamento[] = departamentosDatabaseRows.map((departamento) => ({
		departamento: departamento.departamento,
		cantidadActores: departamento.cantidadActores,
	}));

	return {
		categorias,
		departamentos,
	};
}
