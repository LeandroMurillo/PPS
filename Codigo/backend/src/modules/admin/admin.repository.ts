import { z } from 'zod';

import { pool } from '../../database/pool.js';

import type {
	ActorAdmin,
	CategoriaModeracionAdmin,
	ListarActoresAdminQuery,
	ListarUsuariosAdminQuery,
	UsuarioAdmin,
	UsuarioDetalleAdmin,
} from './admin.schemas.js';

const databaseIntegerSchema = z
	.union([z.number().int(), z.bigint(), z.string().regex(/^\d+$/)])
	.refine((value) => Number.isSafeInteger(Number(value)), {
		message: 'El entero recibido desde MariaDB está fuera del rango seguro',
	})
	.transform((value) => Number(value));

const databaseDecimalSchema = z
	.union([z.number(), z.string().regex(/^-?\d+(\.\d+)?$/)])
	.transform((value) => Number(value));

const databaseBooleanSchema = z
	.union([z.boolean(), z.number().int().min(0).max(1), z.string().regex(/^[01]$/)])
	.transform((value) => value === true || value === 1 || value === '1');

const databaseDateSchema = z
	.union([z.date(), z.string()])
	.transform((value) => (value instanceof Date ? value.toISOString() : value));

const totalRowSchema = z.object({ total: databaseIntegerSchema });

const usuarioDatabaseRowSchema = z.object({
	idUsuario: databaseIntegerSchema,
	actividadesArcaCodigo: z.string().nullable(),
	actividadArca: z.string().nullable(),
	nombre: z.string(),
	apellido: z.string(),
	CUIL: z.string(),
	genero: z.enum(['F', 'M', 'X']),
	fechaNacimiento: databaseDateSchema,
	nacionalidad: z.string(),
	email: z.string(),
	fechaRegistro: databaseDateSchema,
	rol: z.enum(['USUARIO', 'MODERADOR', 'ADMIN']),
	estado: z.enum(['A', 'P', 'I']),
});

type UsuarioDatabaseRow = z.infer<typeof usuarioDatabaseRowSchema>;

const categoriaModeracionDatabaseRowSchema = z.object({
	idCategoria: databaseIntegerSchema,
	nombre: z.string(),
	asignada: databaseBooleanSchema,
});

const actorDatabaseRowSchema = z.object({
	idActor: databaseIntegerSchema,
	nombreActor: z.string(),
	descripcion: z.string(),
	fotoPerfilUrl: z.string().nullable(),
	cuit: z.string().nullable(),
	tipoActor: z.enum(['INDIVIDUO', 'COLECTIVO', 'ESPACIO']),
	fechaCreacion: databaseDateSchema,
	estado: z.enum(['A', 'P', 'I']),
	idCategoria: databaseIntegerSchema,
	categoria: z.string(),
	estadoCategoria: z.enum(['A', 'I']),
	idSubcategoria: databaseIntegerSchema.nullable(),
	subcategoria: z.string().nullable(),
	estadoSubcategoria: z.enum(['A', 'I']).nullable(),
	idUsuarioDueno: databaseIntegerSchema.nullable(),
	usuarioDueno: z.string().nullable(),
	emailUsuarioDueno: z.string().nullable(),
	idUbicacion: databaseIntegerSchema,
	provincia: z.string(),
	departamento: z.string(),
	localidad: z.string(),
	direccion: z.string(),
	latitud: databaseDecimalSchema,
	longitud: databaseDecimalSchema,
	esPublica: databaseBooleanSchema,
});

function getResultSet(procedureResult: unknown, index: number, procedureName: string): unknown[] {
	if (!Array.isArray(procedureResult) || !Array.isArray(procedureResult[index])) {
		throw new Error(`No se encontró el result set ${index + 1} de ${procedureName}`);
	}

	return procedureResult[index];
}

function getTotal(procedureResult: unknown, procedureName: string): number {
	const rows = z.array(totalRowSchema).parse(getResultSet(procedureResult, 0, procedureName));
	const firstRow = rows[0];

	if (!firstRow) {
		throw new Error(`${procedureName} no devolvió el total`);
	}

	return firstRow.total;
}

function mapUsuario(row: UsuarioDatabaseRow): UsuarioAdmin {
	return {
		id: row.idUsuario,
		actividadArcaCodigo: row.actividadesArcaCodigo,
		actividadArca: row.actividadArca,
		nombre: row.nombre,
		apellido: row.apellido,
		cuil: row.CUIL,
		genero: row.genero,
		fechaNacimiento: row.fechaNacimiento,
		nacionalidad: row.nacionalidad,
		email: row.email,
		fechaRegistro: row.fechaRegistro,
		rol: row.rol,
		estado: row.estado,
	};
}

export async function listarUsuariosAdminRepository(
	query: ListarUsuariosAdminQuery,
): Promise<{ total: number; usuarios: UsuarioAdmin[] }> {
	const procedureName = 'sp_admin_listar_usuarios';
	const result: unknown = await pool.query('CALL sp_admin_listar_usuarios(?, ?, ?, ?, ?, ?, ?)', [
		query.busqueda ?? null,
		query.rol ?? null,
		query.estado ?? null,
		query.limit,
		query.offset,
		query.sortBy,
		query.sortDir,
	]);
	const rows = z.array(usuarioDatabaseRowSchema).parse(getResultSet(result, 1, procedureName));

	return {
		total: getTotal(result, procedureName),
		usuarios: rows.map(mapUsuario),
	};
}

export async function obtenerUsuarioAdminRepository(id: number): Promise<UsuarioDetalleAdmin | null> {
	const procedureName = 'sp_admin_obtener_usuario';
	const result: unknown = await pool.query('CALL sp_admin_obtener_usuario(?)', [id]);
	const userRows = z.array(usuarioDatabaseRowSchema).parse(getResultSet(result, 0, procedureName));
	const userRow = userRows[0];

	if (!userRow) {
		return null;
	}

	const categoryRows = z
		.array(categoriaModeracionDatabaseRowSchema)
		.parse(getResultSet(result, 1, procedureName));
	const categoriasModeracion: CategoriaModeracionAdmin[] = categoryRows.map((row) => ({
		id: row.idCategoria,
		nombre: row.nombre,
		asignada: row.asignada,
	}));

	return {
		...mapUsuario(userRow),
		categoriasModeracion,
	};
}

export async function cambiarEstadoUsuarioAdminRepository(
	id: number,
	estado: 'A' | 'I',
): Promise<UsuarioDetalleAdmin | null> {
	await pool.query('CALL sp_admin_cambiar_estado_usuario(?, ?)', [id, estado]);

	return obtenerUsuarioAdminRepository(id);
}

export async function asignarModeradorAdminRepository(
	id: number,
	idCategorias: number[],
): Promise<UsuarioDetalleAdmin | null> {
	await pool.query('CALL sp_admin_asignar_moderador(?, ?)', [id, JSON.stringify(idCategorias)]);

	return obtenerUsuarioAdminRepository(id);
}

export async function listarActoresAdminRepository(
	query: ListarActoresAdminQuery,
): Promise<{ total: number; actores: ActorAdmin[] }> {
	const procedureName = 'sp_admin_listar_actores';
	const result: unknown = await pool.query('CALL sp_admin_listar_actores(?, ?, ?, ?, ?, ?, ?)', [
		query.busqueda ?? null,
		query.idCategoria ?? null,
		query.idUsuarioDueno ?? null,
		query.limit,
		query.offset,
		query.sortBy,
		query.sortDir,
	]);
	const rows = z.array(actorDatabaseRowSchema).parse(getResultSet(result, 1, procedureName));

	return {
		total: getTotal(result, procedureName),
		actores: rows.map((row) => ({
			id: row.idActor,
			nombre: row.nombreActor,
			descripcion: row.descripcion,
			foto: row.fotoPerfilUrl,
			cuit: row.cuit,
			tipoActor: row.tipoActor,
			fechaCreacion: row.fechaCreacion,
			estado: row.estado,
			categoria: {
				id: row.idCategoria,
				nombre: row.categoria,
				estado: row.estadoCategoria,
			},
			subcategoria:
				row.idSubcategoria !== null && row.subcategoria !== null && row.estadoSubcategoria !== null
					? {
							id: row.idSubcategoria,
							nombre: row.subcategoria,
							estado: row.estadoSubcategoria,
						}
					: null,
			dueno:
				row.idUsuarioDueno !== null && row.usuarioDueno !== null && row.emailUsuarioDueno !== null
					? {
							id: row.idUsuarioDueno,
							nombre: row.usuarioDueno,
							email: row.emailUsuarioDueno,
						}
					: null,
			ubicacion: {
				id: row.idUbicacion,
				provincia: row.provincia,
				departamento: row.departamento,
				localidad: row.localidad,
				direccion: row.direccion,
				latitud: row.latitud,
				longitud: row.longitud,
				esPublica: row.esPublica,
			},
		})),
	};
}
