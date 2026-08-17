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

	if (normalized === undefined) {
		return undefined;
	}

	if (typeof normalized !== 'string') {
		return normalized;
	}

	if (!/^\d+$/.test(normalized)) {
		return normalized;
	}

	return Number(normalized);
}

function normalizeQueryIntegerArray(value: unknown): unknown {
	if (value === undefined) {
		return undefined;
	}

	const rawValues = Array.isArray(value) ? value : [value];

	const normalizedValues = rawValues.flatMap((rawValue) => {
		if (typeof rawValue !== 'string') {
			return [rawValue];
		}

		return rawValue
			.split(',')
			.map((part) => part.trim())
			.filter((part) => part !== '');
	});

	if (normalizedValues.length === 0) {
		return undefined;
	}

	return normalizedValues.map((normalizedValue) => {
		if (typeof normalizedValue !== 'string') {
			return normalizedValue;
		}

		if (!/^\d+$/.test(normalizedValue)) {
			return normalizedValue;
		}

		return Number(normalizedValue);
	});
}

/**
 * Parámetros de GET /api/publico/actores.
 *
 * Este mismo esquema sirve para:
 * - validar request.query;
 * - generar la documentación OpenAPI.
 */
export const listarActoresQuerySchema = z
	.strictObject({
		busqueda: z.preprocess(normalizeOptionalString, z.string().max(255).optional()).meta({
			description:
				'Texto buscado en el nombre, descripción, categoría, subcategoría y ubicación pública del actor.',
			example: 'circo',
		}),

		departamento: z.preprocess(normalizeOptionalString, z.string().max(100).optional()).meta({
			description: 'Nombre exacto del departamento por el cual se filtrarán los actores.',
			example: 'Tafí Viejo',
		}),

		idCategoria: z.preprocess(normalizeQueryInteger, z.number().int().min(0).max(4_294_967_295).optional()).meta({
			description:
				'Identificador de la categoría. El valor 0 o la ausencia del parámetro representa todas las categorías.',
			example: 3,
		}),

		limit: z.preprocess(normalizeQueryInteger, z.number().int().min(1).max(100).default(20)).meta({
			description: 'Cantidad máxima de actores devueltos en la página.',
			example: 20,
			default: 20,
		}),

		offset: z.preprocess(normalizeQueryInteger, z.number().int().min(0).max(2_147_483_647).default(0)).meta({
			description: 'Cantidad de registros que se omitirán antes de devolver la página.',
			example: 0,
			default: 0,
		}),
	})
	.meta({
		description: 'Filtros y opciones de paginación del directorio público de actores.',
	});

export type ListarActoresQuery = z.infer<typeof listarActoresQuerySchema>;

/**
 * Parámetros de GET /api/publico/actores/mapa.
 */
export const obtenerActoresMapaQuerySchema = z
	.strictObject({
		busqueda: z.preprocess(normalizeOptionalString, z.string().max(255).optional()).meta({
			description:
				'Texto buscado en el nombre, descripción, tipo, categoría, subcategoría y ubicación pública del actor.',
			example: 'teatro',
		}),

		departamento: z.preprocess(normalizeOptionalString, z.string().max(100).optional()).meta({
			description: 'Nombre exacto del departamento por el cual se filtrarán los actores del mapa.',
			example: 'Capital',
		}),

		categorias: z
			.preprocess(
				normalizeQueryIntegerArray,
				z.array(z.number().int().positive().max(4_294_967_295)).max(100).optional(),
			)
			.meta({
				description:
					'Identificadores de categorías. Puede enviarse como CSV (?categorias=1,2) o como parámetros repetidos (?categorias=1&categorias=2).',
				example: [1, 2],
			}),
	})
	.meta({
		description: 'Filtros del mapa público de actores.',
	});

export type ObtenerActoresMapaQuery = z.infer<typeof obtenerActoresMapaQuerySchema>;

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

export const obtenerActorParamsSchema = z
	.strictObject({
		id: z.preprocess(normalizeQueryInteger, z.number().int().positive().max(4_294_967_295)).meta({
			description: 'Identificador del actor cultural.',
			example: 6,
		}),
	})
	.meta({
		description: 'Parámetros de ruta para obtener la ficha pública de un actor.',
	});

export type ObtenerActorParams = z.infer<typeof obtenerActorParamsSchema>;

/**
 * Actor resumido que consume el frontend.
 */
export const actorPublicoResumenSchema = z
	.strictObject({
		id: z.number().int().positive().meta({
			description: 'Identificador del actor cultural.',
			example: 6,
		}),

		nombre: z.string().meta({
			description: 'Nombre público del actor cultural.',
			example: 'Compañía Circo Fuego',
		}),

		descripcion: z.string().nullable().meta({
			description: 'Descripción pública del actor.',
			example: 'Colectivo de artistas callejeros y teatro de calle.',
		}),

		foto: z.string().nullable().meta({
			description: 'URL o ruta de la imagen de perfil del actor.',
			example: 'https://img.com/circofuego.jpg',
		}),

		categoria: z.string().meta({
			description: 'Categoría cultural principal.',
			example: 'Artes Escénicas',
		}),

		categoriaIcono: categoriaIconoSchema.meta({
			description: 'Icono Material asociado a la categoría cultural.',
			example: 'TheaterComedy',
		}),

		subcategoria: z.string().nullable().meta({
			description: 'Subcategoría cultural del actor.',
			example: 'Circo y Murga',
		}),

		departamento: z.string().meta({
			description: 'Departamento de Tucumán en el que se encuentra el actor.',
			example: 'Tafí Viejo',
		}),

		localidad: z.string().nullable().meta({
			description: 'Localidad del actor. Es null cuando la ubicación detallada es privada.',
			example: 'Tafí Viejo',
		}),
	})
	.meta({
		id: 'ActorPublicoResumen',
		description: 'Información resumida de un actor cultural visible en el directorio público.',
	});

export type ActorPublicoResumen = z.infer<typeof actorPublicoResumenSchema>;

export const actorMapaPublicoSchema = z
	.strictObject({
		id: z.number().int().positive().meta({
			description: 'Identificador del actor cultural.',
			example: 6,
		}),

		nombre: z.string().meta({
			description: 'Nombre público del actor cultural.',
			example: 'Teatro Alberdi',
		}),

		descripcion: z.string().nullable().meta({
			description: 'Descripción pública del actor.',
			example: 'Espacio cultural histórico administrado por la UNT.',
		}),

		foto: z.string().nullable().meta({
			description: 'URL o ruta de la imagen de perfil del actor.',
			example: 'https://img.com/teatro-alberdi.jpg',
		}),

		categoria: z.string().meta({
			description: 'Categoría cultural principal.',
			example: 'Artes Escénicas',
		}),

		categoriaIcono: categoriaIconoSchema.meta({
			description: 'Icono Material asociado a la categoría cultural.',
			example: 'TheaterComedy',
		}),

		subcategoria: z.string().nullable().meta({
			description: 'Subcategoría cultural del actor.',
			example: 'Teatro',
		}),

		departamento: z.string().meta({
			description: 'Departamento de Tucumán donde se ubica públicamente el actor.',
			example: 'Capital',
		}),

		localidad: z.string().nullable().meta({
			description: 'Localidad pública del actor.',
			example: 'San Miguel de Tucumán',
		}),

		direccion: z.string().trim().min(1).meta({
			description: 'Dirección pública del actor.',
			example: 'Jujuy 92',
		}),

		latitud: z.number().min(-90).max(90).meta({
			description: 'Latitud pública del actor.',
			example: -26.816,
		}),

		longitud: z.number().min(-180).max(180).meta({
			description: 'Longitud pública del actor.',
			example: -65.2105,
		}),
	})
	.meta({
		id: 'ActorMapaPublico',
		description: 'Actor cultural activo visible en el mapa público.',
	});

export type ActorMapaPublico = z.infer<typeof actorMapaPublicoSchema>;

export const obtenerActoresMapaResponseSchema = z
	.strictObject({
		data: z.array(actorMapaPublicoSchema),
	})
	.meta({
		id: 'ObtenerActoresMapaResponse',
		description: 'Actores culturales visibles en el mapa público.',
	});

export type ObtenerActoresMapaResponse = z.infer<typeof obtenerActoresMapaResponseSchema>;

export const actorDetallePortafolioItemSchema = z
	.strictObject({
		tipo: z.string().meta({
			description: 'Tipo del elemento de portafolio.',
			example: 'VIDEO',
		}),

		descripcion: z.string().nullable().meta({
			description: 'Descripción pública del elemento.',
			example: 'Presentación en vivo.',
		}),

		url: z.string().meta({
			description: 'URL pública del elemento.',
			example: 'https://youtube.com/watch?v=abc123',
		}),
	})
	.meta({
		id: 'ActorDetallePortafolioItem',
		description: 'Elemento público del portafolio de un actor cultural.',
	});

export const actorDetalleEventoSchema = z
	.strictObject({
		nombre: z.string().meta({
			description: 'Nombre del evento.',
			example: 'Presentación en Peña Patria',
		}),

		descripcion: z.string().nullable().meta({
			description: 'Descripción del evento.',
			example: 'Presentación con artistas invitados.',
		}),

		fecha: z.string().meta({
			description: 'Fecha y hora del evento.',
			example: '2026-07-09T22:00:00.000Z',
		}),
	})
	.meta({
		id: 'ActorDetalleEvento',
		description: 'Evento activo asociado al actor cultural.',
	});

export const actorDetalleRespuestaSchema = z
	.strictObject({
		pregunta: z.string().meta({
			description: 'Pregunta pública del formulario.',
			example: 'Género musical principal',
		}),

		respuesta: z.string().nullable().meta({
			description: 'Respuesta pública del actor.',
			example: 'Folklore',
		}),

		publica: z.boolean().optional().meta({
			description: 'Indica si la respuesta es visible al público general.',
			example: true,
		}),
	})
	.meta({
		id: 'ActorDetalleRespuesta',
		description: 'Pregunta y respuesta asociada al actor cultural.',
	});

export const actorDetalleIntegranteSchema = z
	.strictObject({
		id: z.number().int().positive().nullable().optional().meta({
			description: 'Identificador del usuario integrante.',
			example: 3,
		}),

		tipo: z.enum(['REGISTRADO', 'NO_REGISTRADO']).meta({
			description: 'Indica si el integrante posee una cuenta en la plataforma.',
			example: 'REGISTRADO',
		}),

		nombre: z.string().meta({
			description: 'Nombre del integrante.',
			example: 'César',
		}),

		apellido: z.string().meta({
			description: 'Apellido del integrante.',
			example: 'López',
		}),

		email: z.string().email().nullable().optional().meta({
			description: 'Correo electrónico del integrante (solo visible para usuarios autorizados).',
			example: 'cesar@ejemplo.com',
		}),

		rol: z.string().nullable().meta({
			description: 'Rol del integrante dentro del actor cultural.',
			example: 'Batería',
		}),

		esDueno: z.boolean().optional().meta({
			description: 'Indica si el integrante es el creador/dueño de la ficha.',
			example: true,
		}),
	})
	.meta({
		id: 'ActorDetalleIntegrante',
		description: 'Integrante activo del actor cultural.',
	});

export const actorDetallePublicoSchema = z
	.strictObject({
		id: z.number().int().positive().meta({
			description: 'Identificador del actor cultural.',
			example: 6,
		}),

		nombre: z.string().meta({
			description: 'Nombre público del actor cultural.',
			example: 'Teatro Alberdi',
		}),

		descripcion: z.string().nullable().meta({
			description: 'Descripción pública del actor.',
			example: 'Espacio cultural histórico administrado por la UNT.',
		}),

		foto: z.string().nullable().meta({
			description: 'URL o ruta de la imagen de perfil del actor.',
			example: 'https://img.com/teatro-alberdi.jpg',
		}),

		cuit: z.string().nullable().optional().meta({
			description: 'CUIT del actor cultural (solo visible para usuarios autorizados).',
			example: '20123456789',
		}),

		tipoActor: z.enum(['INDIVIDUO', 'COLECTIVO', 'ESPACIO']).optional().meta({
			description: 'Tipo de actor cultural.',
			example: 'COLECTIVO',
		}),

		estado: z.enum(['A', 'P', 'I']).optional().meta({
			description: 'Estado del actor cultural.',
			example: 'A',
		}),

		categoria: z.string().meta({
			description: 'Categoría cultural principal.',
			example: 'Artes Escénicas',
		}),

		categoriaIcono: categoriaIconoSchema.meta({
			description: 'Icono Material asociado a la categoría cultural.',
			example: 'TheaterComedy',
		}),

		subcategoria: z.string().nullable().meta({
			description: 'Subcategoría cultural del actor.',
			example: 'Teatro',
		}),

		dueno: z
			.strictObject({
				id: z.number().int().positive(),
				nombre: z.string(),
				email: z.string().email(),
			})
			.nullable()
			.optional()
			.meta({
				description: 'Información del dueño / creador del actor cultural (solo visible para autorizados).',
			}),

		ubicacion: z.strictObject({
			provincia: z.string().meta({
				description: 'Provincia donde está registrado el actor.',
				example: 'Tucumán',
			}),

			departamento: z.string().meta({
				description: 'Departamento donde está registrado el actor.',
				example: 'Capital',
			}),

			localidad: z.string().nullable().meta({
				description: 'Localidad registrada del actor.',
				example: 'San Miguel de Tucumán',
			}),

			esPublica: z.boolean().meta({
				description: 'Indica si la ubicación detallada es pública.',
				example: true,
			}),

			direccion: z.string().nullable().meta({
				description: 'Dirección del actor. Solo visible para autorizados si es privada.',
				example: 'Jujuy 92',
			}),

			latitud: z.number().min(-90).max(90).nullable().meta({
				description: 'Latitud del actor. Solo visible para autorizados si es privada.',
				example: -26.816,
			}),

			longitud: z.number().min(-180).max(180).nullable().meta({
				description: 'Longitud del actor. Solo visible para autorizados si es privada.',
				example: -65.2105,
			}),
		}),

		portafolio: z.array(actorDetallePortafolioItemSchema),
		eventos: z.array(actorDetalleEventoSchema),
		respuestas: z.array(actorDetalleRespuestaSchema),
		integrantes: z.array(actorDetalleIntegranteSchema),
	})
	.meta({
		id: 'ActorDetallePublico',
		description: 'Ficha completa de un actor cultural con datos públicos o privados según permisos.',
	});

export type ActorDetallePublico = z.infer<typeof actorDetallePublicoSchema>;

export const obtenerActorResponseSchema = z
	.strictObject({
		data: actorDetallePublicoSchema,
	})
	.meta({
		id: 'ObtenerActorResponse',
		description: 'Ficha pública completa de un actor cultural.',
	});

export type ObtenerActorResponse = z.infer<typeof obtenerActorResponseSchema>;

export const actorNoEncontradoResponseSchema = z
	.strictObject({
		error: z.strictObject({
			code: z.literal('ACTOR_NOT_FOUND'),

			message: z.string().meta({
				example: 'No se encontró un actor público activo con el identificador solicitado',
			}),
		}),
	})
	.meta({
		id: 'ActorNoEncontradoResponse',
		description: 'Respuesta producida cuando no existe un actor público activo con ese identificador.',
	});

export const listarActoresFiltroCategoriaSchema = z
	.strictObject({
		id: z.number().int().positive().meta({
			description: 'Identificador de la categoría cultural.',
			example: 3,
		}),

		nombre: z.string().meta({
			description: 'Nombre de la categoría cultural.',
			example: 'Artes Escénicas',
		}),

		icono: categoriaIconoSchema.meta({
			description: 'Icono Material asociado a la categoría cultural.',
			example: 'TheaterComedy',
		}),
	})
	.meta({
		id: 'ListarActoresFiltroCategoria',
		description: 'Categoría disponible como filtro del directorio público de actores.',
	});

export type ListarActoresFiltroCategoria = z.infer<typeof listarActoresFiltroCategoriaSchema>;

export const listarActoresFiltroDepartamentoSchema = z
	.strictObject({
		departamento: z.string().meta({
			description: 'Nombre del departamento disponible como filtro.',
			example: 'Tafí Viejo',
		}),
	})
	.meta({
		id: 'ListarActoresFiltroDepartamento',
		description: 'Departamento disponible como filtro del directorio público de actores.',
	});

export type ListarActoresFiltroDepartamento = z.infer<typeof listarActoresFiltroDepartamentoSchema>;

export const obtenerFiltrosListadoActoresResponseSchema = z
	.strictObject({
		categorias: z.array(listarActoresFiltroCategoriaSchema),
		departamentos: z.array(listarActoresFiltroDepartamentoSchema),
	})
	.meta({
		id: 'ObtenerFiltrosListadoActoresResponse',
		description: 'Filtros disponibles para el directorio público de actores culturales.',
	});

export type ObtenerFiltrosListadoActoresResponse = z.infer<typeof obtenerFiltrosListadoActoresResponseSchema>;

export const mapaFiltroCategoriaSchema = z
	.strictObject({
		id: z.number().int().positive().meta({
			description: 'Identificador de la categoría cultural.',
			example: 3,
		}),

		nombre: z.string().meta({
			description: 'Nombre de la categoría cultural.',
			example: 'Artes Escénicas',
		}),

		icono: categoriaIconoSchema.meta({
			description: 'Icono Material asociado a la categoría cultural.',
			example: 'TheaterComedy',
		}),

		cantidadActores: z.number().int().min(0).meta({
			description: 'Cantidad de actores visibles en el mapa para esta categoría.',
			example: 12,
		}),
	})
	.meta({
		id: 'MapaFiltroCategoria',
		description: 'Categoría disponible como filtro del mapa público.',
	});

export type MapaFiltroCategoria = z.infer<typeof mapaFiltroCategoriaSchema>;

export const mapaFiltroDepartamentoSchema = z
	.strictObject({
		departamento: z.string().meta({
			description: 'Nombre del departamento disponible como filtro.',
			example: 'Tafí Viejo',
		}),

		cantidadActores: z.number().int().min(0).meta({
			description: 'Cantidad de actores visibles en el mapa para este departamento.',
			example: 8,
		}),
	})
	.meta({
		id: 'MapaFiltroDepartamento',
		description: 'Departamento disponible como filtro del mapa público.',
	});

export type MapaFiltroDepartamento = z.infer<typeof mapaFiltroDepartamentoSchema>;

export const obtenerFiltrosMapaResponseSchema = z
	.strictObject({
		categorias: z.array(mapaFiltroCategoriaSchema),
		departamentos: z.array(mapaFiltroDepartamentoSchema),
	})
	.meta({
		id: 'ObtenerFiltrosMapaResponse',
		description: 'Filtros disponibles para el mapa público de actores culturales.',
	});

export type ObtenerFiltrosMapaResponse = z.infer<typeof obtenerFiltrosMapaResponseSchema>;

export const paginacionSchema = z
	.strictObject({
		total: z.number().int().min(0).meta({
			description: 'Cantidad total de actores que coinciden con los filtros.',
			example: 35,
		}),

		count: z.number().int().min(0).meta({
			description: 'Cantidad de actores incluidos en esta respuesta.',
			example: 20,
		}),

		limit: z.number().int().min(1).max(100).meta({
			description: 'Límite utilizado en la consulta.',
			example: 20,
		}),

		offset: z.number().int().min(0).meta({
			description: 'Desplazamiento utilizado en la consulta.',
			example: 0,
		}),

		hasNext: z.boolean().meta({
			description: 'Indica si existen más resultados después de esta página.',
			example: true,
		}),
	})
	.meta({
		id: 'Paginacion',
		description: 'Información de paginación de la respuesta.',
	});

export const listarActoresResponseSchema = z
	.strictObject({
		data: z.array(actorPublicoResumenSchema),

		pagination: paginacionSchema,
	})
	.meta({
		id: 'ListarActoresResponse',
		description: 'Página de actores culturales del directorio público.',
	});

export type ListarActoresResponse = z.infer<typeof listarActoresResponseSchema>;
