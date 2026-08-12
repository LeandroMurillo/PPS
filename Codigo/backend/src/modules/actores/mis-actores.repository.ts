import { z } from 'zod';

import { pool } from '../../database/pool.js';
import { categoriaIconoSchema } from './actores.schemas.js';

const databaseIntegerSchema = z
	.union([z.number().int(), z.bigint(), z.string().regex(/^\d+$/)])
	.transform((value) => Number(value));

const databaseDecimalSchema = z
	.union([z.number(), z.string().regex(/^-?\d+(\.\d+)?$/)])
	.transform((value) => Number(value));

const totalRowSchema = z.object({
	total: databaseIntegerSchema,
});

const idRowSchema = z.object({
	idActor: databaseIntegerSchema,
});

const idItemRowSchema = z.object({
	idItem: databaseIntegerSchema,
});

const idEventoRowSchema = z.object({
	idEvento: databaseIntegerSchema,
});

const eventoRowSchema = z.object({
	idEvento: databaseIntegerSchema,
	nombre: z.string(),
	descripcion: z.string(),
	fecha: z.union([z.date(), z.string()]).transform((val) => (val instanceof Date ? val.toISOString() : String(val))),
});

export const misActoresDatabaseRowSchema = z.object({
	idActor: databaseIntegerSchema,
	nombre: z.string(),
	descripcion: z.string(),
	fotoPerfilUrl: z.string().nullable(),
	cuit: z.string().nullable(),
	tipoActor: z.enum(['INDIVIDUO', 'COLECTIVO', 'ESPACIO']),
	fechaCreacion: z
		.union([z.date(), z.string()])
		.transform((val) => (val instanceof Date ? val.toISOString() : String(val))),
	estado: z.enum(['A', 'P', 'I']),
	idCategoria: databaseIntegerSchema,
	categoria: z.string(),
	iconoCategoria: categoriaIconoSchema,
	idSubcategoria: databaseIntegerSchema.nullable(),
	subcategoria: z.string().nullable(),
	idUbicacion: databaseIntegerSchema,
	provincia: z.string(),
	departamento: z.string(),
	localidad: z.string(),
	direccion: z.string(),
	latitud: databaseDecimalSchema,
	longitud: databaseDecimalSchema,
});

export type MisActorRow = z.infer<typeof misActoresDatabaseRowSchema>;

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

export async function listarMisActoresRepository(input: {
	idUsuario: number;
	busqueda?: string | null | undefined;
	idCategoria?: number | null | undefined;
	estado?: 'A' | 'P' | 'I' | null | undefined;
	limit: number;
	offset: number;
}) {
	const procedureResult: unknown = await pool.query('CALL sp_actor_listar_mis_actores(?, ?, ?, ?, ?, ?)', [
		input.idUsuario,
		input.busqueda || null,
		input.idCategoria || null,
		input.estado || null,
		input.limit,
		input.offset,
	]);

	const totalSet = getResultSet(procedureResult, 0, 'sp_actor_listar_mis_actores');
	const actoresSet = getResultSet(procedureResult, 1, 'sp_actor_listar_mis_actores');

	const totalRows = z.array(totalRowSchema).parse(totalSet);
	const total = totalRows[0]?.total ?? 0;
	const rows = z.array(misActoresDatabaseRowSchema).parse(actoresSet);

	return { total, rows };
}

export async function crearActorRepository(input: {
	idUsuario: number;
	idCategoria: number;
	idSubcategoria?: number | null | undefined;
	nombre: string;
	descripcion: string;
	fotoPerfilUrl?: string | null | undefined;
	cuit?: string | null | undefined;
	tipoActor: 'INDIVIDUO' | 'COLECTIVO' | 'ESPACIO';
	provincia?: string | null | undefined;
	departamento: string;
	localidad: string;
	direccion: string;
	latitud: number;
	longitud: number;
	esPublica: boolean;
}) {
	const procedureResult: unknown = await pool.query(
		'CALL sp_actor_crear_actor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
		[
			input.idUsuario,
			input.idCategoria,
			input.idSubcategoria || null,
			input.nombre,
			input.descripcion,
			input.fotoPerfilUrl || null,
			input.cuit || null,
			input.tipoActor,
			input.provincia || 'Tucumán',
			input.departamento,
			input.localidad,
			input.direccion,
			input.latitud,
			input.longitud,
			input.esPublica ? 1 : 0,
		],
	);

	const resultSet = getResultSet(procedureResult, 0, 'sp_actor_crear_actor');
	const idRows = z.array(idRowSchema).parse(resultSet);
	const createdId = idRows[0]?.idActor;

	if (!createdId) {
		throw new Error('No se pudo crear el actor cultural.');
	}

	return { idActor: createdId };
}

export async function editarActorRepository(input: {
	idUsuario: number;
	idActor: number;
	idCategoria: number;
	idSubcategoria?: number | null | undefined;
	nombre: string;
	descripcion: string;
	fotoPerfilUrl?: string | null | undefined;
	cuit?: string | null | undefined;
	tipoActor: 'INDIVIDUO' | 'COLECTIVO' | 'ESPACIO';
	departamento: string;
	localidad: string;
	direccion: string;
	esAdmin: boolean;
}) {
	await pool.query('CALL sp_actor_editar_actor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
		input.idUsuario,
		input.idActor,
		input.idCategoria,
		input.idSubcategoria || null,
		input.nombre,
		input.descripcion,
		input.fotoPerfilUrl || null,
		input.cuit || null,
		input.tipoActor,
		input.departamento,
		input.localidad,
		input.direccion,
		input.esAdmin ? 1 : 0,
	]);
}

export async function cambiarEstadoActorRepository(input: {
	idUsuario: number;
	idActor: number;
	nuevoEstado: 'A' | 'P' | 'I';
	esAdmin: boolean;
}) {
	await pool.query('CALL sp_actor_cambiar_estado_actor(?, ?, ?, ?)', [
		input.idUsuario,
		input.idActor,
		input.nuevoEstado,
		input.esAdmin ? 1 : 0,
	]);
}

export async function eliminarActorRepository(input: { idUsuario: number; idActor: number; esAdmin: boolean }) {
	await pool.query('CALL sp_actor_eliminar_actor(?, ?, ?)', [input.idUsuario, input.idActor, input.esAdmin ? 1 : 0]);
}

export async function agregarItemPortafolioRepository(input: {
	idUsuario: number;
	idActor: number;
	tipo: 'IMAGEN' | 'LINK' | 'RRSS';
	descripcion: string;
	url: string;
}) {
	const procedureResult: unknown = await pool.query('CALL sp_actor_agregar_item_portafolio(?, ?, ?, ?, ?)', [
		input.idUsuario,
		input.idActor,
		input.tipo,
		input.descripcion,
		input.url,
	]);

	const resultSet = getResultSet(procedureResult, 0, 'sp_actor_agregar_item_portafolio');
	const idRows = z.array(idItemRowSchema).parse(resultSet);
	return { idItem: idRows[0]?.idItem };
}

export async function eliminarItemPortafolioRepository(input: { idUsuario: number; idItem: number }) {
	await pool.query('CALL sp_actor_eliminar_item_portafolio(?, ?)', [input.idUsuario, input.idItem]);
}

export async function agregarEventoRepository(input: {
	idUsuario: number;
	idActor: number;
	nombre: string;
	descripcion: string;
	fecha?: string | null | undefined;
}) {
	const procedureResult: unknown = await pool.query('CALL sp_actor_agregar_evento(?, ?, ?, ?, ?)', [
		input.idUsuario,
		input.idActor,
		input.nombre,
		input.descripcion,
		input.fecha || null,
	]);

	const resultSet = getResultSet(procedureResult, 0, 'sp_actor_agregar_evento');
	const idRows = z.array(idEventoRowSchema).parse(resultSet);
	return { idEvento: idRows[0]?.idEvento };
}

export async function listarEventosRepository(input: { idUsuario: number; idActor: number }) {
	const procedureResult: unknown = await pool.query('CALL sp_actor_listar_eventos(?, ?)', [
		input.idUsuario,
		input.idActor,
	]);

	const resultSet = getResultSet(procedureResult, 0, 'sp_actor_listar_eventos');
	return z.array(eventoRowSchema).parse(resultSet);
}

export async function eliminarEventoRepository(input: { idUsuario: number; idActor: number; idEvento: number }) {
	await pool.query('CALL sp_actor_eliminar_evento(?, ?, ?)', [input.idUsuario, input.idActor, input.idEvento]);
}

const integranteRowSchema = z.object({
	idUsuario: databaseIntegerSchema,
	nombre: z.string(),
	apellido: z.string(),
	email: z.string(),
	rol: z.string(),
	esDueño: databaseIntegerSchema.transform((v) => Boolean(v)),
});

export async function listarIntegrantesRepository(input: { idUsuario: number; idActor: number }) {
	const procedureResult: unknown = await pool.query('CALL sp_actor_listar_integrantes(?, ?)', [
		input.idUsuario,
		input.idActor,
	]);

	const resultSet = getResultSet(procedureResult, 0, 'sp_actor_listar_integrantes');
	return z.array(integranteRowSchema).parse(resultSet);
}

export async function agregarIntegranteRepository(input: {
	idUsuario: number;
	idActor: number;
	email: string;
	rol: string;
}) {
	await pool.query('CALL sp_actor_agregar_integrante(?, ?, ?, ?)', [
		input.idUsuario,
		input.idActor,
		input.email,
		input.rol,
	]);
}

export async function eliminarIntegranteRepository(input: {
	idUsuario: number;
	idActor: number;
	idUsuarioAEliminar: number;
}) {
	await pool.query('CALL sp_actor_eliminar_integrante(?, ?, ?)', [
		input.idUsuario,
		input.idActor,
		input.idUsuarioAEliminar,
	]);
}
