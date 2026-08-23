import { z } from 'zod';

import { pool } from '../../database/pool.js';
import { categoriaIconoSchema, tipoPreguntaAdminSchema } from './admin.schemas.js';

import type {
	ActorAdmin,
	ActorDetalleAdmin,
	ActorDetalleEncuestaAdmin,
	AsociarPreguntaFormularioAdminBody,
	AuditoriaIntegridadHallazgo,
	CategoriaAdmin,
	CategoriaModeracionAdmin,
	CrearPreguntaFormularioAdminBody,
	EditarPreguntaAdminBody,
	FormularioAdmin,
	GuardarFormularioAdminBody,
	ListarActoresAdminQuery,
	ListarCategoriasAdminQuery,
	ListarPreguntasAdminQuery,
	ListarSubcategoriasAdminQuery,
	ListarUsuariosAdminQuery,
	PreguntaBancoAdmin,
	ReemplazarPreguntaFormularioAdminBody,
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

import { generoUsuarioSchema } from '../auth/auth.schemas.js';

const usuarioDatabaseRowSchema = z.object({
	idUsuario: databaseIntegerSchema,
	actividadesArcaCodigo: z.string().nullable(),
	actividadArca: z.string().nullable(),
	nombre: z.string(),
	apellido: z.string(),
	CUIL: z.string(),
	genero: generoUsuarioSchema,
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
	tipo: z.enum(['REGISTRADO', 'NO_REGISTRADO']),
	idUsuario: databaseIntegerSchema.nullable(),
	idIntegranteNoRegistrado: databaseIntegerSchema.nullable(),
	nombreUsuario: z.string(),
	email: z.string().nullable(),
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

const databaseAnswerValueSchema = z
	.union([z.string(), z.number(), z.boolean(), z.array(z.union([z.string(), z.number(), z.boolean()]))])
	.nullable()
	.transform((value) => {
		if (value === null) return null;
		if (Array.isArray(value)) return value.map(String);
		if (typeof value === 'boolean') return value ? 'Sí' : 'No';
		return String(value);
	});

const databaseQuestionOptionsSchema = z.preprocess((value) => {
	if (typeof value !== 'string') return value;

	try {
		return JSON.parse(value) as unknown;
	} catch {
		return value;
	}
}, z.array(z.string()).nullable());

const actorEncuestaDatabaseRowSchema = z.object({
	idFormulario: databaseIntegerSchema,
	ambito: z.enum(['CATEGORIA', 'SUBCATEGORIA']),
	categoria: z.string(),
	subcategoria: z.string().nullable(),
	titulo: z.string(),
	descripcion: z.string().nullable(),
});

const actorEncuestaRespuestaDatabaseRowSchema = z.object({
	idFormulario: databaseIntegerSchema,
	idPregunta: databaseIntegerSchema,
	orden: databaseIntegerSchema,
	pregunta: z.string(),
	tipoDato: tipoPreguntaAdminSchema,
	opciones: databaseQuestionOptionsSchema,
	esObligatorio: databaseBooleanSchema,
	esPublico: databaseBooleanSchema,
	valor: databaseAnswerValueSchema,
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

const formularioIdDatabaseRowSchema = z.object({ idFormulario: databaseIntegerSchema });
const formularioAmbitoDatabaseRowSchema = formularioIdDatabaseRowSchema.extend({
	idSubcategoria: databaseIntegerSchema.nullable(),
});

const formularioAdminDatabaseRowSchema = z.object({
	idFormulario: databaseIntegerSchema,
	idCategoria: databaseIntegerSchema,
	categoria: z.string(),
	estadoCategoria: z.enum(['A', 'I']),
	idSubcategoria: databaseIntegerSchema.nullable(),
	subcategoria: z.string().nullable(),
	estadoSubcategoria: z.enum(['A', 'I']).nullable(),
	titulo: z.string(),
	descripcion: z.string().nullable(),
	fechaCreacion: databaseDateSchema,
	cantidadPreguntasHistoricas: databaseIntegerSchema,
	cantidadPreguntasActivas: databaseIntegerSchema,
	cantidadActoresConRespuestas: databaseIntegerSchema,
});

const preguntaFormularioAdminDatabaseRowSchema = z.object({
	idFormulario: databaseIntegerSchema,
	idPregunta: databaseIntegerSchema,
	pregunta: z.string(),
	tipoDato: tipoPreguntaAdminSchema,
	opciones: databaseQuestionOptionsSchema,
	idPreguntaReemplazada: databaseIntegerSchema.nullable(),
	preguntaReemplazada: z.string().nullable(),
	orden: databaseIntegerSchema,
	esObligatorio: databaseBooleanSchema,
	esPublico: databaseBooleanSchema,
	fechaIncorporacion: databaseDateSchema,
	fechaDesactivacion: databaseDateSchema.nullable(),
	estado: z.enum(['A', 'I']),
	cantidadActoresQueRespondieron: databaseIntegerSchema,
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
	idUsuarioSolicitante: number,
	id: number,
	estado: 'A' | 'I',
): Promise<UsuarioDetalleAdmin | null> {
	await pool.query('CALL sp_admin_cambiar_estado_usuario(?, ?, ?)', [idUsuarioSolicitante, id, estado]);

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
	idUsuarioSolicitante: number,
	query: ListarActoresAdminQuery,
): Promise<{ total: number; actores: ActorAdmin[] }> {
	const procedureName = 'sp_admin_listar_actores';
	const result: unknown = await pool.query('CALL sp_admin_listar_actores(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
		idUsuarioSolicitante,
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

export async function obtenerActorAdminRepository(
	idUsuarioSolicitante: number,
	id: number,
): Promise<ActorDetalleAdmin | null> {
	const procedureName = 'sp_admin_obtener_actor';
	const result: unknown = await pool.query('CALL sp_admin_obtener_actor(?, ?)', [idUsuarioSolicitante, id]);
	const actorRows = z.array(actorDatabaseRowSchema).parse(getResultSet(result, 0, procedureName));
	const actorRow = actorRows[0];

	if (!actorRow) {
		return null;
	}

	const integrantes = z.array(actorIntegranteDatabaseRowSchema).parse(getResultSet(result, 1, procedureName));
	const portafolio = z.array(actorPortafolioDatabaseRowSchema).parse(getResultSet(result, 2, procedureName));
	const encuestas = await obtenerEncuestasActor(id);

	return {
		...mapActor(actorRow),
		integrantes: integrantes.map((row) => ({
			id: row.idUsuario,
			idIntegranteNoRegistrado: row.idIntegranteNoRegistrado,
			tipo: row.tipo,
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
		encuestas,
	};
}

function mapFormulario(
	row: z.infer<typeof formularioAdminDatabaseRowSchema>,
	preguntas: z.infer<typeof preguntaFormularioAdminDatabaseRowSchema>[],
): FormularioAdmin {
	const idSubcategoria = row.idSubcategoria && row.idSubcategoria > 0 ? row.idSubcategoria : null;

	return {
		id: row.idFormulario,
		idCategoria: row.idCategoria,
		categoria: row.categoria,
		estadoCategoria: row.estadoCategoria,
		idSubcategoria,
		subcategoria: idSubcategoria === null ? null : row.subcategoria,
		estadoSubcategoria: idSubcategoria === null ? null : row.estadoSubcategoria,
		ambito: idSubcategoria === null ? 'CATEGORIA' : 'SUBCATEGORIA',
		titulo: row.titulo,
		descripcion: row.descripcion,
		fechaCreacion: row.fechaCreacion,
		cantidadPreguntasHistoricas: row.cantidadPreguntasHistoricas,
		cantidadPreguntasActivas: row.cantidadPreguntasActivas,
		cantidadActoresConRespuestas: row.cantidadActoresConRespuestas,
		preguntas: preguntas.map((pregunta) => ({
			id: pregunta.idPregunta,
			pregunta: pregunta.pregunta,
			tipoDato: pregunta.tipoDato,
			opciones: pregunta.opciones,
			idPreguntaReemplazada: pregunta.idPreguntaReemplazada,
			preguntaReemplazada: pregunta.preguntaReemplazada,
			orden: pregunta.orden,
			esObligatorio: pregunta.esObligatorio,
			esPublico: pregunta.esPublico,
			fechaIncorporacion: pregunta.fechaIncorporacion,
			fechaDesactivacion: pregunta.fechaDesactivacion,
			estado: pregunta.estado,
			cantidadActoresQueRespondieron: pregunta.cantidadActoresQueRespondieron,
		})),
	};
}

async function obtenerEncuestasActor(idActor: number): Promise<ActorDetalleEncuestaAdmin[]> {
	const listarProcedureName = 'sp_actor_listar_formularios';
	const listarResult: unknown = await pool.query('CALL sp_actor_listar_formularios(?)', [idActor]);
	const formularios = z
		.array(actorEncuestaDatabaseRowSchema)
		.parse(getResultSet(listarResult, 0, listarProcedureName));

	return Promise.all(
		formularios.map(async (formulario) => {
			const obtenerProcedureName = 'sp_actor_obtener_formulario';
			const obtenerResult: unknown = await pool.query('CALL sp_actor_obtener_formulario(?, ?)', [
				idActor,
				formulario.idFormulario,
			]);
			const respuestas = z
				.array(actorEncuestaRespuestaDatabaseRowSchema)
				.parse(getResultSet(obtenerResult, 1, obtenerProcedureName))
				.map((respuesta) => ({
					id: respuesta.idPregunta,
					pregunta: respuesta.pregunta,
					tipoDato: respuesta.tipoDato,
					opciones: respuesta.opciones,
					respuesta: respuesta.valor,
					obligatoria: respuesta.esObligatorio,
					publica: respuesta.esPublico,
				}));

			return {
				id: formulario.idFormulario,
				tipo: formulario.ambito === 'CATEGORIA' ? 'categoria' : 'subcategoria',
				ambito:
					formulario.ambito === 'CATEGORIA'
						? formulario.categoria
						: (formulario.subcategoria ?? 'Subcategoría'),
				titulo: formulario.titulo,
				descripcion: formulario.descripcion,
				secciones: respuestas.length > 0 ? [{ titulo: 'Preguntas', respuestas }] : [],
			} satisfies ActorDetalleEncuestaAdmin;
		}),
	);
}

export async function cambiarEstadoActoresAdminRepository(
	idUsuarioSolicitante: number,
	ids: number[],
	estado: 'A' | 'I',
): Promise<number> {
	const procedureName = 'sp_admin_cambiar_estado_actores';
	const result: unknown = await pool.query('CALL sp_admin_cambiar_estado_actores(?, ?, ?)', [
		idUsuarioSolicitante,
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
	idUsuarioSolicitante: number,
	query: ListarCategoriasAdminQuery,
): Promise<{ total: number; categorias: CategoriaAdmin[] }> {
	const procedureName = 'sp_admin_listar_categorias';
	const result: unknown = await pool.query('CALL sp_admin_listar_categorias(?, ?, ?, ?, ?, ?, ?)', [
		idUsuarioSolicitante,
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
	const result: unknown = await pool.query('CALL sp_admin_obtener_subcategoria(?, ?)', [idCategoria, idSubcategoria]);
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

export async function obtenerFormularioAdminRepository(idFormulario: number): Promise<FormularioAdmin | null> {
	const procedureName = 'sp_admin_obtener_formulario';
	const result: unknown = await pool.query('CALL sp_admin_obtener_formulario(?)', [idFormulario]);
	const formularios = z.array(formularioAdminDatabaseRowSchema).parse(getResultSet(result, 0, procedureName));
	const formulario = formularios[0];

	if (!formulario) return null;

	const preguntas = z.array(preguntaFormularioAdminDatabaseRowSchema).parse(getResultSet(result, 1, procedureName));

	return mapFormulario(formulario, preguntas);
}

export async function buscarFormularioAdminRepository(
	idCategoria: number,
	idSubcategoria: number | null,
): Promise<FormularioAdmin | null> {
	const procedureName = 'sp_admin_listar_formularios';
	const idSubcategoriaNormalizada = idSubcategoria ?? 0;
	const result: unknown = await pool.query('CALL sp_admin_listar_formularios(NULL, ?, ?, 100, 0)', [
		idCategoria,
		idSubcategoriaNormalizada === 0 ? 'CATEGORIA' : 'SUBCATEGORIA',
	]);
	const rows = z.array(formularioAmbitoDatabaseRowSchema).parse(getResultSet(result, 1, procedureName));
	const row = rows.find((formulario) => (formulario.idSubcategoria ?? 0) === idSubcategoriaNormalizada);

	return row ? obtenerFormularioAdminRepository(row.idFormulario) : null;
}

export async function crearFormularioAdminRepository(
	idCategoria: number,
	idSubcategoria: number | null,
	data: GuardarFormularioAdminBody,
): Promise<FormularioAdmin> {
	const procedureName = 'sp_admin_crear_formulario';
	const result: unknown = await pool.query('CALL sp_admin_crear_formulario(?, ?, ?, ?)', [
		idCategoria,
		idSubcategoria ?? 0,
		data.titulo,
		data.descripcion,
	]);
	const rows = z.array(formularioIdDatabaseRowSchema).parse(getResultSet(result, 0, procedureName));
	const row = rows[0];

	if (!row) throw new Error(`${procedureName} no devolvió el formulario creado`);

	const formulario = await obtenerFormularioAdminRepository(row.idFormulario);
	if (!formulario) throw new Error(`${procedureName} no permitió recuperar el formulario creado`);

	return formulario;
}

export async function editarFormularioAdminRepository(
	idFormulario: number,
	data: GuardarFormularioAdminBody,
): Promise<FormularioAdmin> {
	const procedureName = 'sp_admin_editar_formulario';
	await pool.query('CALL sp_admin_editar_formulario(?, ?, ?)', [idFormulario, data.titulo, data.descripcion]);

	const formulario = await obtenerFormularioAdminRepository(idFormulario);
	if (!formulario) throw new Error(`${procedureName} no permitió recuperar el formulario editado`);

	return formulario;
}

export async function crearPreguntaFormularioAdminRepository(
	idFormulario: number,
	data: CrearPreguntaFormularioAdminBody,
): Promise<FormularioAdmin> {
	const crearProcedureName = 'sp_admin_crear_pregunta';
	const crearResult: unknown = await pool.query('CALL sp_admin_crear_pregunta(?, ?, ?)', [
		data.pregunta,
		data.tipoDato,
		data.opciones ? JSON.stringify(data.opciones) : null,
	]);
	const rows = z
		.array(z.object({ idPregunta: databaseIntegerSchema }))
		.parse(getResultSet(crearResult, 0, crearProcedureName));
	const pregunta = rows[0];

	if (!pregunta) throw new Error(`${crearProcedureName} no devolvió la pregunta creada`);

	await pool.query('CALL sp_admin_agregar_pregunta_formulario(?, ?, ?, ?, ?)', [
		idFormulario,
		pregunta.idPregunta,
		data.orden,
		data.esObligatorio ? 1 : 0,
		data.esPublico ? 1 : 0,
	]);

	const formulario = await obtenerFormularioAdminRepository(idFormulario);
	if (!formulario) throw new Error('No se pudo recuperar el formulario actualizado');

	return formulario;
}

export async function desactivarPreguntaFormularioAdminRepository(
	idFormulario: number,
	idPregunta: number,
): Promise<FormularioAdmin> {
	await pool.query('CALL sp_admin_desactivar_pregunta_formulario(?, ?)', [idFormulario, idPregunta]);

	const formulario = await obtenerFormularioAdminRepository(idFormulario);
	if (!formulario) throw new Error('No se pudo recuperar el formulario actualizado');

	return formulario;
}

export async function asociarPreguntaFormularioAdminRepository(
	idFormulario: number,
	data: AsociarPreguntaFormularioAdminBody,
): Promise<FormularioAdmin> {
	await pool.query('CALL sp_admin_agregar_pregunta_formulario(?, ?, ?, ?, ?)', [
		idFormulario,
		data.idPregunta,
		null,
		data.esObligatorio ? 1 : 0,
		data.esPublico ? 1 : 0,
	]);

	const formulario = await obtenerFormularioAdminRepository(idFormulario);
	if (!formulario) throw new Error('No se pudo recuperar el formulario actualizado');

	return formulario;
}

export async function listarPreguntasAdminRepository(query: ListarPreguntasAdminQuery): Promise<PreguntaBancoAdmin[]> {
	const procedureName = 'sp_admin_listar_preguntas';
	const result: unknown = await pool.query('CALL sp_admin_listar_preguntas(?)', [query.busqueda ?? null]);
	const rows = getResultSet(result, 0, procedureName);

	const preguntaBancoRowSchema = z.object({
		id: databaseIntegerSchema,
		pregunta: z.string(),
		tipoDato: tipoPreguntaAdminSchema,
		opciones: databaseQuestionOptionsSchema,
	});

	return z.array(preguntaBancoRowSchema).parse(rows);
}

export async function editarPreguntaAdminRepository(
	idPregunta: number,
	data: EditarPreguntaAdminBody,
): Promise<PreguntaBancoAdmin> {
	const procedureName = 'sp_admin_editar_pregunta';
	const result: unknown = await pool.query('CALL sp_admin_editar_pregunta(?, ?, ?, ?)', [
		idPregunta,
		data.pregunta,
		data.tipoDato,
		data.opciones ? JSON.stringify(data.opciones) : null,
	]);
	const rows = z
		.array(
			z.object({
				idPregunta: databaseIntegerSchema,
				pregunta: z.string(),
				tipoDato: tipoPreguntaAdminSchema,
				opciones: databaseQuestionOptionsSchema,
			}),
		)
		.parse(getResultSet(result, 0, procedureName));

	const row = rows[0];
	if (!row) throw new Error(`${procedureName} no devolvió la pregunta editada`);

	return {
		id: row.idPregunta,
		pregunta: row.pregunta,
		tipoDato: row.tipoDato,
		opciones: row.opciones,
	};
}

export async function reemplazarPreguntaFormularioAdminRepository(
	idFormulario: number,
	idPreguntaAnterior: number,
	data: ReemplazarPreguntaFormularioAdminBody,
): Promise<FormularioAdmin> {
	await pool.query('CALL sp_admin_reemplazar_pregunta_formulario(?, ?, ?, ?, ?)', [
		idFormulario,
		idPreguntaAnterior,
		data.idPreguntaNueva,
		data.esObligatorio !== undefined ? (data.esObligatorio ? 1 : 0) : null,
		data.esPublico !== undefined ? (data.esPublico ? 1 : 0) : null,
	]);

	const formulario = await obtenerFormularioAdminRepository(idFormulario);
	if (!formulario) throw new Error('No se pudo recuperar el formulario actualizado');

	return formulario;
}

export async function crearPreguntaBancoAdminRepository(
	data: CrearPreguntaFormularioAdminBody,
): Promise<PreguntaBancoAdmin> {
	const crearProcedureName = 'sp_admin_crear_pregunta';
	const crearResult: unknown = await pool.query('CALL sp_admin_crear_pregunta(?, ?, ?)', [
		data.pregunta,
		data.tipoDato,
		data.opciones ? JSON.stringify(data.opciones) : null,
	]);
	const rows = z
		.array(
			z.object({
				idPregunta: databaseIntegerSchema,
				pregunta: z.string(),
				tipoDato: tipoPreguntaAdminSchema,
				opciones: databaseQuestionOptionsSchema,
			}),
		)
		.parse(getResultSet(crearResult, 0, crearProcedureName));
	const row = rows[0];
	if (!row) throw new Error(`${crearProcedureName} no devolvió la pregunta creada`);

	return {
		id: row.idPregunta,
		pregunta: row.pregunta,
		tipoDato: row.tipoDato,
		opciones: row.opciones,
	};
}

const auditoriaDatabaseRowSchema = z.object({
	modulo: z.string(),
	severidad: z.enum(['ALTA', 'MEDIA', 'BAJA', 'INFO']),
	descripcion: z.string(),
	idReferencia: databaseIntegerSchema.nullable(),
});

export async function auditarIntegridadSistemaAdminRepository(
	idUsuarioSolicitante: number,
): Promise<AuditoriaIntegridadHallazgo[]> {
	const procedureName = 'sp_sistema_auditar_integridad';
	const result: unknown = await pool.query('CALL sp_sistema_auditar_integridad(?)', [idUsuarioSolicitante]);
	const rows = getResultSet(result, 0, procedureName);

	const parsed = z.array(auditoriaDatabaseRowSchema).parse(rows);

	return parsed.map((item) => ({
		modulo: item.modulo,
		severidad: item.severidad,
		descripcion: item.descripcion,
		idReferencia: item.idReferencia,
	}));
}
