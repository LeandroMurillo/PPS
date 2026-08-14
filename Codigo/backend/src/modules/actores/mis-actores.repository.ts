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

const portafolioRowSchema = z.object({
	idItem: databaseIntegerSchema,
	tipo: z.enum(['IMAGEN', 'LINK', 'RRSS']),
	descripcion: z.string(),
	url: z.string(),
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

const opcionRegistroRowSchema = z.object({
	idCategoria: databaseIntegerSchema,
	categoria: z.string(),
	icono: categoriaIconoSchema,
	idSubcategoria: databaseIntegerSchema.nullable(),
	subcategoria: z.string().nullable(),
});

const categoriaRegistroDatabaseRowSchema = z.object({
	idCategoria: databaseIntegerSchema,
	nombre: z.string(),
	icono: categoriaIconoSchema,
});

const subcategoriaRegistroDatabaseRowSchema = z.object({
	idCategoria: databaseIntegerSchema,
	id: databaseIntegerSchema,
	nombre: z.string(),
});

const tipoPreguntaSchema = z.enum([
	'TEXTO',
	'NUMERO',
	'BOOLEANO',
	'FECHA',
	'URL',
	'EMAIL',
	'TELEFONO',
	'OPCION_UNICA',
	'OPCION_MULTIPLE',
]);

const formularioAplicableRowSchema = z.object({
	idFormulario: databaseIntegerSchema,
	idCategoria: databaseIntegerSchema,
	categoria: z.string(),
	idSubcategoria: databaseIntegerSchema,
	subcategoria: z.string().nullable(),
	titulo: z.string(),
	descripcion: z.string().nullable(),
	idPregunta: databaseIntegerSchema.nullable(),
	pregunta: z.string().nullable(),
	tipoDato: tipoPreguntaSchema.nullable(),
	opciones: z
		.union([z.string(), z.array(z.string())])
		.nullable()
		.transform(parseOpcionesPregunta),
	orden: databaseIntegerSchema.nullable(),
	esObligatorio: databaseIntegerSchema.nullable(),
	esPublico: databaseIntegerSchema.nullable(),
});

const formularioAplicableCabeceraDatabaseRowSchema = z.object({
	idFormulario: databaseIntegerSchema,
	idCategoria: databaseIntegerSchema,
	categoria: z.string(),
	estadoCategoria: z.enum(['A', 'I']),
	idSubcategoria: databaseIntegerSchema,
	subcategoria: z.string().nullable(),
	estadoSubcategoria: z.enum(['A', 'I']).nullable(),
	titulo: z.string(),
	descripcion: z.string().nullable(),
});

const preguntaFormularioAplicableDatabaseRowSchema = z.object({
	idPregunta: databaseIntegerSchema,
	pregunta: z.string(),
	tipoDato: tipoPreguntaSchema,
	opciones: z.union([z.string(), z.array(z.string())]).nullable(),
	orden: databaseIntegerSchema,
	esObligatorio: databaseIntegerSchema,
	esPublico: databaseIntegerSchema,
	estado: z.enum(['A', 'I']),
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

export type RegistroActorRespuesta = {
	idFormulario: number;
	idPregunta: number;
	valor: unknown;
};

export type RegistroActorPortafolio = {
	tipo: 'IMAGEN' | 'LINK' | 'RRSS';
	descripcion: string;
	url: string;
};

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

function parseOpcionesPregunta(value: string | string[] | null): string[] | null {
	if (value === null) return null;
	if (Array.isArray(value)) return value;

	try {
		const parsed: unknown = JSON.parse(value);
		return z.array(z.string()).parse(parsed);
	} catch {
		throw new Error('Una pregunta posee opciones inválidas en la base de datos.');
	}
}

export async function obtenerOpcionesRegistroRepository() {
	const categoriasResult: unknown = await pool.query(
		"CALL sp_admin_listar_categorias(NULL, 'A', 100, 0, 'nombre', 'ASC')",
	);
	const categorias = z
		.array(categoriaRegistroDatabaseRowSchema)
		.parse(getResultSet(categoriasResult, 1, 'sp_admin_listar_categorias'));

	const categoriasConSubcategorias = await Promise.all(
		categorias.map(async (categoria) => {
			const subcategoriasResult: unknown = await pool.query(
				"CALL sp_admin_listar_subcategorias(?, NULL, 'A', 100, 0, 'nombre', 'ASC')",
				[categoria.idCategoria],
			);
			const subcategorias = z
				.array(subcategoriaRegistroDatabaseRowSchema)
				.parse(getResultSet(subcategoriasResult, 1, 'sp_admin_listar_subcategorias'));

			return subcategorias.length > 0
				? subcategorias.map((subcategoria) => ({
						idCategoria: categoria.idCategoria,
						categoria: categoria.nombre,
						icono: categoria.icono,
						idSubcategoria: subcategoria.id,
						subcategoria: subcategoria.nombre,
					}))
				: [
						{
							idCategoria: categoria.idCategoria,
							categoria: categoria.nombre,
							icono: categoria.icono,
							idSubcategoria: null,
							subcategoria: null,
						},
					];
		}),
	);

	return z.array(opcionRegistroRowSchema).parse(categoriasConSubcategorias.flat());
}

export async function obtenerFormulariosAplicablesRepository(input: {
	idCategoria: number;
	idSubcategoria?: number | null | undefined;
}) {
	const listarResult: unknown = await pool.query("CALL sp_admin_listar_formularios(NULL, ?, 'TODOS', 100, 0)", [
		input.idCategoria,
	]);
	const cabeceras = z
		.array(formularioAplicableCabeceraDatabaseRowSchema)
		.parse(getResultSet(listarResult, 1, 'sp_admin_listar_formularios'))
		.filter(
			(formulario) =>
				formulario.estadoCategoria === 'A' &&
				(formulario.idSubcategoria === 0 ||
					(formulario.idSubcategoria === input.idSubcategoria && formulario.estadoSubcategoria === 'A')),
		);

	const formulariosConPreguntas = await Promise.all(
		cabeceras.map(async (cabecera) => {
			const obtenerResult: unknown = await pool.query('CALL sp_admin_obtener_formulario(?)', [
				cabecera.idFormulario,
			]);
			const preguntas = z
				.array(preguntaFormularioAplicableDatabaseRowSchema)
				.parse(getResultSet(obtenerResult, 1, 'sp_admin_obtener_formulario'))
				.filter((pregunta) => pregunta.estado === 'A');

			if (preguntas.length === 0) {
				return [
					{
						...cabecera,
						idPregunta: null,
						pregunta: null,
						tipoDato: null,
						opciones: null,
						orden: null,
						esObligatorio: null,
						esPublico: null,
					},
				];
			}

			return preguntas.map((pregunta) => ({
				...cabecera,
				idPregunta: pregunta.idPregunta,
				pregunta: pregunta.pregunta,
				tipoDato: pregunta.tipoDato,
				opciones: parseOpcionesPregunta(pregunta.opciones),
				orden: pregunta.orden,
				esObligatorio: pregunta.esObligatorio,
				esPublico: pregunta.esPublico,
			}));
		}),
	);

	return z.array(formularioAplicableRowSchema).parse(formulariosConPreguntas.flat());
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
	respuestas?: RegistroActorRespuesta[] | undefined;
	portafolio?: RegistroActorPortafolio[] | undefined;
}) {
	const connection = await pool.getConnection();
	try {
		await connection.beginTransaction();
		const procedureResult: unknown = await connection.query(
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

		for (const respuesta of input.respuestas ?? []) {
			await connection.query('CALL sp_actor_guardar_respuesta(?, ?, ?, ?)', [
				createdId,
				respuesta.idFormulario,
				respuesta.idPregunta,
				JSON.stringify(respuesta.valor),
			]);
		}

		for (const item of input.portafolio ?? []) {
			await connection.query('CALL sp_actor_agregar_item_portafolio(?, ?, ?, ?, ?)', [
				input.idUsuario,
				createdId,
				item.tipo,
				item.descripcion,
				item.url,
			]);
		}

		await connection.commit();
		return { idActor: createdId };
	} catch (error) {
		await connection.rollback();
		throw error;
	} finally {
		connection.release();
	}
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

export async function listarPortafolioRepository(input: { idUsuario: number; idActor: number }) {
	const procedureResult: unknown = await pool.query('CALL sp_actor_listar_portafolio(?, ?)', [
		input.idUsuario,
		input.idActor,
	]);

	const resultSet = getResultSet(procedureResult, 0, 'sp_actor_listar_portafolio');
	return z.array(portafolioRowSchema).parse(resultSet);
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
	tipo: z.enum(['REGISTRADO', 'NO_REGISTRADO']),
	idUsuario: databaseIntegerSchema.nullable(),
	idIntegranteNoRegistrado: databaseIntegerSchema.nullable(),
	nombre: z.string(),
	apellido: z.string(),
	email: z.string().nullable(),
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

export async function editarIntegranteRepository(input: {
	idUsuario: number;
	idActor: number;
	idUsuarioAEditar: number;
	rol: string;
}) {
	await pool.query('CALL sp_actor_editar_integrante(?, ?, ?, ?)', [
		input.idUsuario,
		input.idActor,
		input.idUsuarioAEditar,
		input.rol,
	]);
}

export async function agregarIntegranteNoRegistradoRepository(input: {
	idUsuario: number;
	idActor: number;
	nombre: string;
	apellido: string;
	email: string | null;
	rol: string;
}) {
	await pool.query('CALL sp_actor_agregar_integrante_no_registrado(?, ?, ?, ?, ?, ?)', [
		input.idUsuario,
		input.idActor,
		input.nombre,
		input.apellido,
		input.email,
		input.rol,
	]);
}

export async function editarIntegranteNoRegistradoRepository(input: {
	idUsuario: number;
	idActor: number;
	idIntegranteNoRegistrado: number;
	nombre: string;
	apellido: string;
	email: string | null;
	rol: string;
}) {
	await pool.query('CALL sp_actor_editar_integrante_no_registrado(?, ?, ?, ?, ?, ?, ?)', [
		input.idUsuario,
		input.idActor,
		input.idIntegranteNoRegistrado,
		input.nombre,
		input.apellido,
		input.email,
		input.rol,
	]);
}

export async function eliminarIntegranteNoRegistradoRepository(input: {
	idUsuario: number;
	idActor: number;
	idIntegranteNoRegistrado: number;
}) {
	await pool.query('CALL sp_actor_eliminar_integrante_no_registrado(?, ?, ?)', [
		input.idUsuario,
		input.idActor,
		input.idIntegranteNoRegistrado,
	]);
}
