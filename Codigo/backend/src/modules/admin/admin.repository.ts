import { z } from 'zod';

import { pool } from '../../database/pool.js';
import { categoriaIconoSchema } from './admin.schemas.js';

import type {
	ActorAdmin,
	ActorDetalleAdmin,
	CategoriaAdmin,
	CategoriaModeracionAdmin,
	ListarActoresAdminQuery,
	ListarCategoriasAdminQuery,
	ListarSubcategoriasAdminQuery,
	ListarUsuariosAdminQuery,
	SubcategoriaAdmin,
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
const actualizadosRowSchema = z.object({ actualizados: databaseIntegerSchema });

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
	icono: categoriaIconoSchema,
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
	iconoCategoria: categoriaIconoSchema,
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

type ActorDatabaseRow = z.infer<typeof actorDatabaseRowSchema>;

const actorIntegranteDatabaseRowSchema = z.object({
	idUsuario: databaseIntegerSchema,
	nombreUsuario: z.string(),
	email: z.string(),
	rol: z.string(),
	esDueno: databaseBooleanSchema,
});

const actorPortafolioDatabaseRowSchema = z.object({
	idItem: databaseIntegerSchema,
	tipo: z.enum(['IMAGEN', 'LINK', 'RRSS']),
	descripcion: z.string(),
	url: z.string(),
	fechaCreacion: databaseDateSchema,
});

const categoriaAdminDatabaseRowSchema = z.object({
	idCategoria: databaseIntegerSchema,
	nombre: z.string(),
	icono: categoriaIconoSchema,
	estado: z.enum(['A', 'I']),
	cantidadSubcategorias: databaseIntegerSchema,
	cantidadActores: databaseIntegerSchema,
});

const subcategoriaAdminDatabaseRowSchema = z.object({
	idCategoria: databaseIntegerSchema,
	id: databaseIntegerSchema,
	nombre: z.string(),
	estado: z.enum(['A', 'I']),
	cantidadActores: databaseIntegerSchema,
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

function mapCategoria(row: z.infer<typeof categoriaAdminDatabaseRowSchema>): CategoriaAdmin {
	return {
		id: row.idCategoria,
		nombre: row.nombre,
		icono: row.icono,
		estado: row.estado,
		cantidadSubcategorias: row.cantidadSubcategorias,
		cantidadActores: row.cantidadActores,
	};
}

function mapSubcategoria(row: z.infer<typeof subcategoriaAdminDatabaseRowSchema>): SubcategoriaAdmin {
	return {
		idCategoria: row.idCategoria,
		id: row.id,
		nombre: row.nombre,
		estado: row.estado,
		cantidadActores: row.cantidadActores,
	};
}

function mapActor(row: ActorDatabaseRow): ActorAdmin {
	return {
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
			icono: row.iconoCategoria,
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

	const categoryRows = z.array(categoriaModeracionDatabaseRowSchema).parse(getResultSet(result, 1, procedureName));
	const categoriasModeracion: CategoriaModeracionAdmin[] = categoryRows.map((row) => ({
		id: row.idCategoria,
		nombre: row.nombre,
		icono: row.icono,
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
	const result: unknown = await pool.query('CALL sp_admin_listar_actores(?, ?, ?, ?, ?, ?, ?, ?, ?)', [
		query.busqueda ?? null,
		query.idCategoria ?? null,
		query.departamento ?? null,
		query.tipoActor ?? null,
		query.estado ?? null,
		query.limit,
		query.offset,
		query.sortBy,
		query.sortDir,
	]);
	const rows = z.array(actorDatabaseRowSchema).parse(getResultSet(result, 1, procedureName));

	return {
		total: getTotal(result, procedureName),
		actores: rows.map(mapActor),
	};
}

export async function obtenerActorAdminRepository(id: number): Promise<ActorDetalleAdmin | null> {
	const procedureName = 'sp_admin_obtener_actor';
	const result: unknown = await pool.query('CALL sp_admin_obtener_actor(?)', [id]);
	const actorRows = z.array(actorDatabaseRowSchema).parse(getResultSet(result, 0, procedureName));
	const actorRow = actorRows[0];

	if (!actorRow) {
		return null;
	}

	const integrantes = z.array(actorIntegranteDatabaseRowSchema).parse(getResultSet(result, 1, procedureName));
	const portafolio = z.array(actorPortafolioDatabaseRowSchema).parse(getResultSet(result, 2, procedureName));

	return {
		...mapActor(actorRow),
		integrantes: integrantes.map((row) => ({
			id: row.idUsuario,
			nombre: row.nombreUsuario,
			email: row.email,
			rol: row.rol,
			esDueno: row.esDueno,
		})),
		portafolio: portafolio.map((row) => ({
			id: row.idItem,
			tipo: row.tipo,
			descripcion: row.descripcion,
			url: row.url,
			fechaCreacion: row.fechaCreacion,
		})),
	};
}

export async function cambiarEstadoActoresAdminRepository(ids: number[], estado: 'A' | 'I'): Promise<number> {
	const procedureName = 'sp_admin_cambiar_estado_actores';
	const result: unknown = await pool.query('CALL sp_admin_cambiar_estado_actores(?, ?)', [
		JSON.stringify(ids),
		estado,
	]);
	const rows = z.array(actualizadosRowSchema).parse(getResultSet(result, 0, procedureName));
	const firstRow = rows[0];

	if (!firstRow) {
		throw new Error(`${procedureName} no devolvió el total de actores actualizados`);
	}

	return firstRow.actualizados;
}

export async function listarCategoriasAdminRepository(
	query: ListarCategoriasAdminQuery,
): Promise<{ total: number; categorias: CategoriaAdmin[] }> {
	const procedureName = 'sp_admin_listar_categorias';
	const result: unknown = await pool.query('CALL sp_admin_listar_categorias(?, ?, ?, ?, ?, ?)', [
		query.busqueda ?? null,
		query.estado ?? null,
		query.limit,
		query.offset,
		query.sortBy,
		query.sortDir,
	]);
	const rows = z.array(categoriaAdminDatabaseRowSchema).parse(getResultSet(result, 1, procedureName));

	return {
		total: getTotal(result, procedureName),
		categorias: rows.map(mapCategoria),
	};
}

export async function obtenerCategoriaAdminRepository(id: number): Promise<CategoriaAdmin | null> {
	const procedureName = 'sp_admin_obtener_categoria';
	const result: unknown = await pool.query('CALL sp_admin_obtener_categoria(?)', [id]);
	const rows = z.array(categoriaAdminDatabaseRowSchema).parse(getResultSet(result, 0, procedureName));

	return rows[0] ? mapCategoria(rows[0]) : null;
}

export async function crearCategoriaAdminRepository(
	nombre: string,
	icono: string,
	estado: 'A' | 'I',
): Promise<CategoriaAdmin> {
	const procedureName = 'sp_admin_crear_categoria';
	const result: unknown = await pool.query('CALL sp_admin_crear_categoria(?, ?, ?)', [nombre, icono, estado]);
	const rows = z.array(categoriaAdminDatabaseRowSchema).parse(getResultSet(result, 0, procedureName));
	const categoria = rows[0];

	if (!categoria) {
		throw new Error(`${procedureName} no devolvió la categoría creada`);
	}

	return mapCategoria(categoria);
}

export async function editarCategoriaAdminRepository(
	id: number,
	nombre: string,
	icono: string,
	estado: 'A' | 'I',
): Promise<CategoriaAdmin> {
	const procedureName = 'sp_admin_editar_categoria';
	const result: unknown = await pool.query('CALL sp_admin_editar_categoria(?, ?, ?, ?)', [id, nombre, icono, estado]);
	const rows = z.array(categoriaAdminDatabaseRowSchema).parse(getResultSet(result, 0, procedureName));
	const categoria = rows[0];

	if (!categoria) {
		throw new Error(`${procedureName} no devolvió la categoría actualizada`);
	}

	return mapCategoria(categoria);
}

export async function eliminarCategoriaAdminRepository(id: number): Promise<CategoriaAdmin> {
	const procedureName = 'sp_admin_eliminar_categoria';
	const result: unknown = await pool.query('CALL sp_admin_eliminar_categoria(?)', [id]);
	const rows = z.array(categoriaAdminDatabaseRowSchema).parse(getResultSet(result, 0, procedureName));
	const categoria = rows[0];

	if (!categoria) {
		throw new Error(`${procedureName} no devolvió la categoría eliminada`);
	}

	return mapCategoria(categoria);
}

export async function listarSubcategoriasAdminRepository(
	idCategoria: number,
	query: ListarSubcategoriasAdminQuery,
): Promise<{ total: number; subcategorias: SubcategoriaAdmin[] }> {
	const procedureName = 'sp_admin_listar_subcategorias';
	const result: unknown = await pool.query('CALL sp_admin_listar_subcategorias(?, ?, ?, ?, ?, ?, ?)', [
		idCategoria,
		query.busqueda ?? null,
		query.estado ?? null,
		query.limit,
		query.offset,
		query.sortBy,
		query.sortDir,
	]);
	const rows = z.array(subcategoriaAdminDatabaseRowSchema).parse(getResultSet(result, 1, procedureName));

	return {
		total: getTotal(result, procedureName),
		subcategorias: rows.map(mapSubcategoria),
	};
}

export async function obtenerSubcategoriaAdminRepository(
	idCategoria: number,
	idSubcategoria: number,
): Promise<SubcategoriaAdmin | null> {
	const procedureName = 'sp_admin_obtener_subcategoria';
	const result: unknown = await pool.query('CALL sp_admin_obtener_subcategoria(?, ?)', [
		idCategoria,
		idSubcategoria,
	]);
	const rows = z.array(subcategoriaAdminDatabaseRowSchema).parse(getResultSet(result, 0, procedureName));

	return rows[0] ? mapSubcategoria(rows[0]) : null;
}

export async function crearSubcategoriaAdminRepository(
	idCategoria: number,
	nombre: string,
	estado: 'A' | 'I',
): Promise<SubcategoriaAdmin> {
	const procedureName = 'sp_admin_crear_subcategoria';
	const result: unknown = await pool.query('CALL sp_admin_crear_subcategoria(?, ?, ?)', [
		idCategoria,
		nombre,
		estado,
	]);
	const rows = z.array(subcategoriaAdminDatabaseRowSchema).parse(getResultSet(result, 0, procedureName));
	const subcategoria = rows[0];

	if (!subcategoria) {
		throw new Error(`${procedureName} no devolvió la subcategoría creada`);
	}

	return mapSubcategoria(subcategoria);
}

export async function editarSubcategoriaAdminRepository(
	idCategoria: number,
	idSubcategoria: number,
	nombre: string,
	estado: 'A' | 'I',
): Promise<SubcategoriaAdmin> {
	const procedureName = 'sp_admin_editar_subcategoria';
	const result: unknown = await pool.query('CALL sp_admin_editar_subcategoria(?, ?, ?, ?)', [
		idCategoria,
		idSubcategoria,
		nombre,
		estado,
	]);
	const rows = z.array(subcategoriaAdminDatabaseRowSchema).parse(getResultSet(result, 0, procedureName));
	const subcategoria = rows[0];

	if (!subcategoria) {
		throw new Error(`${procedureName} no devolvió la subcategoría actualizada`);
	}

	return mapSubcategoria(subcategoria);
}

export async function eliminarSubcategoriaAdminRepository(
	idCategoria: number,
	idSubcategoria: number,
): Promise<SubcategoriaAdmin> {
	const procedureName = 'sp_admin_eliminar_subcategoria';
	const result: unknown = await pool.query('CALL sp_admin_eliminar_subcategoria(?, ?)', [
		idCategoria,
		idSubcategoria,
	]);
	const rows = z.array(subcategoriaAdminDatabaseRowSchema).parse(getResultSet(result, 0, procedureName));
	const subcategoria = rows[0];

	if (!subcategoria) {
		throw new Error(`${procedureName} no devolvió la subcategoría eliminada`);
	}

	return mapSubcategoria(subcategoria);
}
