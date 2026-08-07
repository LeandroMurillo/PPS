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
	offset: z.preprocess(
		normalizeQueryInteger,
		z.number().int().min(0).max(2_147_483_647).default(0),
	),
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
	'subcategoria',
	'cantidadActores',
]);

export const sortDirectionSchema = z.enum(['ASC', 'DESC']);

export const listarUsuariosAdminQuerySchema = z.strictObject({
	busqueda: z.preprocess(normalizeOptionalString, z.string().max(255).optional()),
	rol: z.preprocess(
		normalizeOptionalString,
		z.enum(['USUARIO', 'MODERADOR', 'ADMIN']).optional(),
	),
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
	idCategoria: z.preprocess(
		normalizeQueryInteger,
		z.number().int().positive().max(4_294_967_295).optional(),
	),
	idUsuarioDueno: z.preprocess(
		normalizeQueryInteger,
		z.number().int().positive().max(4_294_967_295).optional(),
	),
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
	id: z.preprocess(
		normalizeQueryInteger,
		z.number().int().positive().max(4_294_967_295),
	),
});

export type UsuarioAdminParams = z.infer<typeof usuarioAdminParamsSchema>;

export const cambiarEstadoUsuarioAdminBodySchema = z.strictObject({
	estado: z.enum(['A', 'I']),
});

export type CambiarEstadoUsuarioAdminBody = z.infer<typeof cambiarEstadoUsuarioAdminBodySchema>;

export const asignarModeradorAdminBodySchema = z.strictObject({
	idCategorias: z.array(z.number().int().positive().max(4_294_967_295)).max(100),
});

export type AsignarModeradorAdminBody = z.infer<typeof asignarModeradorAdminBodySchema>;

export const categoriaAdminParamsSchema = z.strictObject({
	id: z.preprocess(
		normalizeQueryInteger,
		z.number().int().positive().max(4_294_967_295),
	),
});

export const categoriaIconoSchema = z.enum([
	'Category',
	'MusicNote',
	'Handyman',
	'TheaterComedy',
	'Movie',
	'MenuBook',
	'Palette',
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
	subcategoria: z.string().nullable(),
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
