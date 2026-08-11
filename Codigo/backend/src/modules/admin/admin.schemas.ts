import { z } from 'zod';

function normalizeOptionalString(value: unknown): unknown {
	if (typeof value !== 'string') {
		return value;
	}

	const normalized = value.trim();

	return normalized === '' ? undefined : normalized;
}

function normalizeQueryInteger(value: unknown): unknown {
	const normalized = normalizeOptionalString(value);

	if (normalized === undefined || typeof normalized !== 'string') {
		return normalized;
	}

	return /^\d+$/.test(normalized) ? Number(normalized) : normalized;
}

const paginationQueryFields = {
	limit: z.preprocess(normalizeQueryInteger, z.number().int().min(1).max(100).default(25)),
	offset: z.preprocess(normalizeQueryInteger, z.number().int().min(0).max(2_147_483_647).default(0)),
};

export const usuarioAdminSortBySchema = z.enum([
	'idUsuario',
	'actividadesArcaCodigo',
	'actividadArca',
	'nombre',
	'apellido',
	'CUIL',
	'nacionalidad',
	'email',
	'rol',
	'estado',
	'fechaRegistro',
]);

export const actorAdminSortBySchema = z.enum([
	'idActor',
	'nombre',
	'cuit',
	'tipoActor',
	'fechaCreacion',
	'estado',
	'categoria',
	'subcategoria',
	'usuarioDueno',
	'departamento',
	'localidad',
]);

export const categoriaAdminSortBySchema = z.enum([
	'idCategoria',
	'nombre',
	'icono',
	'estado',
	'cantidadSubcategorias',
	'cantidadActores',
]);

export const sortDirectionSchema = z.enum(['ASC', 'DESC']);

export const listarUsuariosAdminQuerySchema = z.strictObject({
	busqueda: z.preprocess(normalizeOptionalString, z.string().max(255).optional()),
	rol: z.preprocess(normalizeOptionalString, z.enum(['USUARIO', 'MODERADOR', 'ADMIN']).optional()),
	estado: z.preprocess(normalizeOptionalString, z.enum(['A', 'P', 'I']).optional()),
	...paginationQueryFields,
	sortBy: usuarioAdminSortBySchema.default('idUsuario'),
	sortDir: z.preprocess(
		(value) => (typeof value === 'string' ? value.toUpperCase() : value),
		sortDirectionSchema.default('ASC'),
	),
});

export type ListarUsuariosAdminQuery = z.infer<typeof listarUsuariosAdminQuerySchema>;

export const listarActoresAdminQuerySchema = z.strictObject({
	busqueda: z.preprocess(normalizeOptionalString, z.string().max(255).optional()),
	idCategoria: z.preprocess(normalizeQueryInteger, z.number().int().positive().max(4_294_967_295).optional()),
	departamento: z.preprocess(normalizeOptionalString, z.string().max(100).optional()),
	tipoActor: z.preprocess(normalizeOptionalString, z.enum(['INDIVIDUO', 'COLECTIVO', 'ESPACIO']).optional()),
	estado: z.preprocess(normalizeOptionalString, z.enum(['A', 'P', 'I']).optional()),
	...paginationQueryFields,
	sortBy: actorAdminSortBySchema.default('idActor'),
	sortDir: z.preprocess(
		(value) => (typeof value === 'string' ? value.toUpperCase() : value),
		sortDirectionSchema.default('ASC'),
	),
});

export type ListarActoresAdminQuery = z.infer<typeof listarActoresAdminQuerySchema>;

export const listarCategoriasAdminQuerySchema = z.strictObject({
	busqueda: z.preprocess(normalizeOptionalString, z.string().max(255).optional()),
	estado: z.preprocess(normalizeOptionalString, z.enum(['A', 'I']).optional()),
	...paginationQueryFields,
	sortBy: categoriaAdminSortBySchema.default('idCategoria'),
	sortDir: z.preprocess(
		(value) => (typeof value === 'string' ? value.toUpperCase() : value),
		sortDirectionSchema.default('ASC'),
	),
});

export type ListarCategoriasAdminQuery = z.infer<typeof listarCategoriasAdminQuerySchema>;

export const usuarioAdminSchema = z.object({
	id: z.number().int().positive(),
	actividadArcaCodigo: z.string().nullable(),
	actividadArca: z.string().nullable(),
	nombre: z.string(),
	apellido: z.string(),
	cuil: z.string(),
	genero: z.enum(['F', 'M', 'X']),
	fechaNacimiento: z.string(),
	nacionalidad: z.string(),
	email: z.string(),
	fechaRegistro: z.string(),
	rol: z.enum(['USUARIO', 'MODERADOR', 'ADMIN']),
	estado: z.enum(['A', 'P', 'I']),
});

export type UsuarioAdmin = z.infer<typeof usuarioAdminSchema>;

export const usuarioAdminParamsSchema = z.strictObject({
	id: z.preprocess(normalizeQueryInteger, z.number().int().positive().max(4_294_967_295)),
});

export type UsuarioAdminParams = z.infer<typeof usuarioAdminParamsSchema>;

export const actorAdminParamsSchema = z.strictObject({
	id: z.preprocess(normalizeQueryInteger, z.number().int().positive().max(4_294_967_295)),
});

export type ActorAdminParams = z.infer<typeof actorAdminParamsSchema>;

export const cambiarEstadoUsuarioAdminBodySchema = z.strictObject({
	estado: z.enum(['A', 'I']),
});

export type CambiarEstadoUsuarioAdminBody = z.infer<typeof cambiarEstadoUsuarioAdminBodySchema>;

export const cambiarEstadoActoresAdminBodySchema = z.strictObject({
	ids: z.array(z.number().int().positive().max(4_294_967_295)).min(1).max(100),
	estado: z.enum(['A', 'I']),
});

export type CambiarEstadoActoresAdminBody = z.infer<typeof cambiarEstadoActoresAdminBodySchema>;

export const cambiarEstadoActoresAdminResponseSchema = z.object({
	data: z.object({
		actualizados: z.number().int().min(0),
	}),
});

export type CambiarEstadoActoresAdminResponse = z.infer<typeof cambiarEstadoActoresAdminResponseSchema>;

export const asignarModeradorAdminBodySchema = z.strictObject({
	idCategorias: z.array(z.number().int().positive().max(4_294_967_295)).max(100),
});

export type AsignarModeradorAdminBody = z.infer<typeof asignarModeradorAdminBodySchema>;

export const categoriaAdminParamsSchema = z.strictObject({
	id: z.preprocess(normalizeQueryInteger, z.number().int().positive().max(4_294_967_295)),
});

export const categoriaIconoSchema = z.enum([
	'Category',
	'MusicNote',
	'Handyman',
	'TheaterComedy',
	'Movie',
	'MenuBook',
	'Palette',
	'AccountBalance',
	'Museum',
	'DirectionsRun',
	'CameraAlt',
	'DesignServices',
	'Restaurant',
	'Architecture',
	'School',
	'Celebration',
	'Storefront',
	'SportsEsports',
	'Radio',
	'Checkroom',
	'Park',
	'LocalLibrary',
]);

export type CategoriaIcono = z.infer<typeof categoriaIconoSchema>;

export const guardarCategoriaAdminBodySchema = z.strictObject({
	nombre: z.string().trim().min(1).max(45),
	icono: categoriaIconoSchema.default('Category'),
	estado: z.enum(['A', 'I']).default('A'),
});

export type GuardarCategoriaAdminBody = z.infer<typeof guardarCategoriaAdminBodySchema>;

export const categoriaAdminSchema = z.object({
	id: z.number().int().positive(),
	nombre: z.string(),
	icono: categoriaIconoSchema,
	estado: z.enum(['A', 'I']),
	cantidadSubcategorias: z.number().int().min(0),
	cantidadActores: z.number().int().min(0),
});

export type CategoriaAdmin = z.infer<typeof categoriaAdminSchema>;

export const categoriaModeracionAdminSchema = z.object({
	id: z.number().int().positive(),
	nombre: z.string(),
	icono: categoriaIconoSchema,
	asignada: z.boolean(),
});

export type CategoriaModeracionAdmin = z.infer<typeof categoriaModeracionAdminSchema>;

export const usuarioDetalleAdminSchema = usuarioAdminSchema.extend({
	categoriasModeracion: z.array(categoriaModeracionAdminSchema),
});

export type UsuarioDetalleAdmin = z.infer<typeof usuarioDetalleAdminSchema>;

export const obtenerUsuarioAdminResponseSchema = z.object({
	data: usuarioDetalleAdminSchema,
});

export type ObtenerUsuarioAdminResponse = z.infer<typeof obtenerUsuarioAdminResponseSchema>;

export const usuarioAdminNoEncontradoResponseSchema = z.object({
	error: z.object({
		code: z.literal('USER_NOT_FOUND'),
		message: z.string(),
	}),
});

export const usuarioAdminProtegidoResponseSchema = z.object({
	error: z.object({
		code: z.literal('ADMIN_USER_PROTECTED'),
		message: z.string(),
	}),
});

export const actorAdminSchema = z.object({
	id: z.number().int().positive(),
	nombre: z.string(),
	descripcion: z.string(),
	foto: z.string().nullable(),
	cuit: z.string().nullable(),
	tipoActor: z.enum(['INDIVIDUO', 'COLECTIVO', 'ESPACIO']),
	fechaCreacion: z.string(),
	estado: z.enum(['A', 'P', 'I']),
	categoria: z.object({
		id: z.number().int().positive(),
		nombre: z.string(),
		icono: categoriaIconoSchema,
		estado: z.enum(['A', 'I']),
	}),
	subcategoria: z
		.object({
			id: z.number().int().positive(),
			nombre: z.string(),
			estado: z.enum(['A', 'I']),
		})
		.nullable(),
	dueno: z
		.object({
			id: z.number().int().positive(),
			nombre: z.string(),
			email: z.string(),
		})
		.nullable(),
	ubicacion: z.object({
		id: z.number().int().positive(),
		provincia: z.string(),
		departamento: z.string(),
		localidad: z.string(),
		direccion: z.string(),
		latitud: z.number(),
		longitud: z.number(),
		esPublica: z.boolean(),
	}),
});

export type ActorAdmin = z.infer<typeof actorAdminSchema>;

export const actorDetalleIntegranteAdminSchema = z.object({
	id: z.number().int().positive(),
	nombre: z.string(),
	email: z.string(),
	rol: z.string(),
	esDueno: z.boolean(),
});

export const actorDetallePortafolioAdminSchema = z.object({
	id: z.number().int().positive(),
	tipo: z.enum(['IMAGEN', 'LINK', 'RRSS']),
	descripcion: z.string(),
	url: z.string(),
	fechaCreacion: z.string(),
});

export const actorDetalleEncuestaRespuestaAdminSchema = z.object({
	id: z.number().int().positive(),
	pregunta: z.string(),
	tipoDato: z.enum([
		'TEXTO',
		'NUMERO',
		'BOOLEANO',
		'FECHA',
		'URL',
		'EMAIL',
		'TELEFONO',
		'OPCION_UNICA',
		'OPCION_MULTIPLE',
	]),
	opciones: z.array(z.string()).nullable(),
	respuesta: z.union([z.string(), z.array(z.string())]).nullable(),
	obligatoria: z.boolean(),
	publica: z.boolean(),
});

export const actorDetalleEncuestaAdminSchema = z.object({
	id: z.number().int().positive(),
	tipo: z.enum(['categoria', 'subcategoria']),
	ambito: z.string(),
	titulo: z.string(),
	descripcion: z.string().nullable(),
	secciones: z.array(
		z.object({
			titulo: z.string(),
			respuestas: z.array(actorDetalleEncuestaRespuestaAdminSchema),
		}),
	),
});

export type ActorDetalleEncuestaAdmin = z.infer<typeof actorDetalleEncuestaAdminSchema>;

export const actorDetalleAdminSchema = actorAdminSchema.extend({
	integrantes: z.array(actorDetalleIntegranteAdminSchema),
	portafolio: z.array(actorDetallePortafolioAdminSchema),
	encuestas: z.array(actorDetalleEncuestaAdminSchema),
});

export type ActorDetalleAdmin = z.infer<typeof actorDetalleAdminSchema>;

export const obtenerActorAdminResponseSchema = z.object({
	data: actorDetalleAdminSchema,
});

export type ObtenerActorAdminResponse = z.infer<typeof obtenerActorAdminResponseSchema>;

export const actorAdminNoEncontradoResponseSchema = z.object({
	error: z.object({
		code: z.literal('ACTOR_NOT_FOUND'),
		message: z.string(),
	}),
});

export const adminPaginationSchema = z.object({
	total: z.number().int().min(0),
	count: z.number().int().min(0),
	limit: z.number().int().min(1).max(100),
	offset: z.number().int().min(0),
	hasNext: z.boolean(),
});

export const listarUsuariosAdminResponseSchema = z.object({
	data: z.array(usuarioAdminSchema),
	pagination: adminPaginationSchema,
});

export type ListarUsuariosAdminResponse = z.infer<typeof listarUsuariosAdminResponseSchema>;

export const listarActoresAdminResponseSchema = z.object({
	data: z.array(actorAdminSchema),
	pagination: adminPaginationSchema,
});

export type ListarActoresAdminResponse = z.infer<typeof listarActoresAdminResponseSchema>;

export const listarCategoriasAdminResponseSchema = z.object({
	data: z.array(categoriaAdminSchema),
	pagination: adminPaginationSchema,
});

export type ListarCategoriasAdminResponse = z.infer<typeof listarCategoriasAdminResponseSchema>;

export const obtenerCategoriaAdminResponseSchema = z.object({
	data: categoriaAdminSchema,
});

export type ObtenerCategoriaAdminResponse = z.infer<typeof obtenerCategoriaAdminResponseSchema>;

export const categoriaAdminNoEncontradaResponseSchema = z.object({
	error: z.object({
		code: z.literal('CATEGORY_NOT_FOUND'),
		message: z.string(),
	}),
});

export const categoriaAdminDuplicadaResponseSchema = z.object({
	error: z.object({
		code: z.literal('CATEGORY_NAME_CONFLICT'),
		message: z.string(),
	}),
});

export const subcategoriaAdminSortBySchema = z.enum(['idSubcategoria', 'nombre', 'estado', 'cantidadActores']);

export const listarSubcategoriasAdminQuerySchema = z.strictObject({
	busqueda: z.preprocess(normalizeOptionalString, z.string().max(255).optional()),
	estado: z.preprocess(normalizeOptionalString, z.enum(['A', 'I']).optional()),
	...paginationQueryFields,
	sortBy: subcategoriaAdminSortBySchema.default('idSubcategoria'),
	sortDir: z.preprocess(
		(value) => (typeof value === 'string' ? value.toUpperCase() : value),
		sortDirectionSchema.default('ASC'),
	),
});

export type ListarSubcategoriasAdminQuery = z.infer<typeof listarSubcategoriasAdminQuerySchema>;

export const subcategoriaAdminParamsSchema = z.strictObject({
	idCategoria: z.preprocess(normalizeQueryInteger, z.number().int().positive().max(4_294_967_295)),
	id: z.preprocess(normalizeQueryInteger, z.number().int().positive().max(4_294_967_295)),
});

export type SubcategoriaAdminParams = z.infer<typeof subcategoriaAdminParamsSchema>;

export const subcategoriaAdminCategoriaParamSchema = z.strictObject({
	idCategoria: z.preprocess(normalizeQueryInteger, z.number().int().positive().max(4_294_967_295)),
});

export type SubcategoriaAdminCategoriaParam = z.infer<typeof subcategoriaAdminCategoriaParamSchema>;

export const guardarSubcategoriaAdminBodySchema = z.strictObject({
	nombre: z.string().trim().min(1).max(45),
	estado: z.enum(['A', 'I']).default('A'),
});

export type GuardarSubcategoriaAdminBody = z.infer<typeof guardarSubcategoriaAdminBodySchema>;

export const subcategoriaAdminSchema = z.object({
	idCategoria: z.number().int().positive(),
	id: z.number().int().positive(),
	nombre: z.string(),
	estado: z.enum(['A', 'I']),
	cantidadActores: z.number().int().min(0),
});

export type SubcategoriaAdmin = z.infer<typeof subcategoriaAdminSchema>;

export const listarSubcategoriasAdminResponseSchema = z.object({
	data: z.array(subcategoriaAdminSchema),
	pagination: adminPaginationSchema,
});

export type ListarSubcategoriasAdminResponse = z.infer<typeof listarSubcategoriasAdminResponseSchema>;

export const obtenerSubcategoriaAdminResponseSchema = z.object({
	data: subcategoriaAdminSchema,
});

export type ObtenerSubcategoriaAdminResponse = z.infer<typeof obtenerSubcategoriaAdminResponseSchema>;

export const subcategoriaAdminNoEncontradaResponseSchema = z.object({
	error: z.object({
		code: z.literal('SUBCATEGORY_NOT_FOUND'),
		message: z.string(),
	}),
});

export const subcategoriaAdminDuplicadaResponseSchema = z.object({
	error: z.object({
		code: z.literal('SUBCATEGORY_NAME_CONFLICT'),
		message: z.string(),
	}),
});

export const formularioSubcategoriaAdminParamsSchema = z.strictObject({
	idCategoria: z.preprocess(normalizeQueryInteger, z.number().int().positive().max(4_294_967_295)),
	idSubcategoria: z.preprocess(normalizeQueryInteger, z.number().int().positive().max(4_294_967_295)),
});

export type FormularioSubcategoriaAdminParams = z.infer<typeof formularioSubcategoriaAdminParamsSchema>;

export const formularioAdminParamsSchema = z.strictObject({
	idFormulario: z.preprocess(normalizeQueryInteger, z.number().int().positive().max(4_294_967_295)),
});

export const preguntaFormularioAdminParamsSchema = formularioAdminParamsSchema.extend({
	idPregunta: z.preprocess(normalizeQueryInteger, z.number().int().positive().max(4_294_967_295)),
});

export const guardarFormularioAdminBodySchema = z.strictObject({
	titulo: z.string().trim().min(1).max(150),
	descripcion: z.preprocess(
		(value) => (typeof value === 'string' && value.trim() === '' ? null : value),
		z.string().trim().min(1).max(1000).nullable().default(null),
	),
});

export type GuardarFormularioAdminBody = z.infer<typeof guardarFormularioAdminBodySchema>;

export const tipoPreguntaAdminSchema = z.enum([
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

export const crearPreguntaFormularioAdminBodySchema = z
	.strictObject({
		pregunta: z.string().trim().min(1).max(500),
		tipoDato: tipoPreguntaAdminSchema,
		opciones: z.array(z.string().trim().min(1).max(150)).min(2).max(50).nullable().default(null),
		orden: z.number().int().positive().nullable().default(null),
		esObligatorio: z.boolean().default(false),
		esPublico: z.boolean().default(true),
	})
	.superRefine((value, context) => {
		const requiereOpciones = value.tipoDato === 'OPCION_UNICA' || value.tipoDato === 'OPCION_MULTIPLE';

		if (requiereOpciones && value.opciones === null) {
			context.addIssue({
				code: 'custom',
				path: ['opciones'],
				message: 'Este tipo de pregunta requiere opciones.',
			});
		}
		if (!requiereOpciones && value.opciones !== null) {
			context.addIssue({
				code: 'custom',
				path: ['opciones'],
				message: 'Este tipo de pregunta no admite opciones.',
			});
		}
	});

export type CrearPreguntaFormularioAdminBody = z.infer<typeof crearPreguntaFormularioAdminBodySchema>;

export const preguntaFormularioAdminSchema = z.object({
	id: z.number().int().positive(),
	pregunta: z.string(),
	tipoDato: tipoPreguntaAdminSchema,
	opciones: z.array(z.string()).nullable(),
	idPreguntaReemplazada: z.number().int().positive().nullable(),
	preguntaReemplazada: z.string().nullable(),
	orden: z.number().int().positive(),
	esObligatorio: z.boolean(),
	esPublico: z.boolean(),
	fechaIncorporacion: z.string(),
	fechaDesactivacion: z.string().nullable(),
	estado: z.enum(['A', 'I']),
	cantidadActoresQueRespondieron: z.number().int().min(0),
});

export type PreguntaFormularioAdmin = z.infer<typeof preguntaFormularioAdminSchema>;

export const formularioAdminSchema = z.object({
	id: z.number().int().positive(),
	idCategoria: z.number().int().positive(),
	categoria: z.string(),
	estadoCategoria: z.enum(['A', 'I']),
	idSubcategoria: z.number().int().positive().nullable(),
	subcategoria: z.string().nullable(),
	estadoSubcategoria: z.enum(['A', 'I']).nullable(),
	ambito: z.enum(['CATEGORIA', 'SUBCATEGORIA']),
	titulo: z.string(),
	descripcion: z.string().nullable(),
	fechaCreacion: z.string(),
	cantidadPreguntasHistoricas: z.number().int().min(0),
	cantidadPreguntasActivas: z.number().int().min(0),
	cantidadActoresConRespuestas: z.number().int().min(0),
	preguntas: z.array(preguntaFormularioAdminSchema),
});

export type FormularioAdmin = z.infer<typeof formularioAdminSchema>;

export const obtenerFormularioAdminResponseSchema = z.object({ data: formularioAdminSchema });
export type ObtenerFormularioAdminResponse = z.infer<typeof obtenerFormularioAdminResponseSchema>;

export const buscarFormularioAdminResponseSchema = z.object({ data: formularioAdminSchema.nullable() });
export type BuscarFormularioAdminResponse = z.infer<typeof buscarFormularioAdminResponseSchema>;

export const formularioAdminNoEncontradoResponseSchema = z.object({
	error: z.object({
		code: z.literal('FORM_NOT_FOUND'),
		message: z.string(),
	}),
});

export const formularioAdminDuplicadoResponseSchema = z.object({
	error: z.object({
		code: z.literal('FORM_SCOPE_CONFLICT'),
		message: z.string(),
	}),
});
