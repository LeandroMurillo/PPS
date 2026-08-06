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

		idCategoria: z
			.preprocess(normalizeQueryInteger, z.number().int().min(0).max(4_294_967_295).optional())
			.meta({
				description:
					'Identificador de la categoría. El valor 0 o la ausencia del parámetro representa todas las categorías.',
				example: 3,
			}),

		limit: z.preprocess(normalizeQueryInteger, z.number().int().min(1).max(100).default(20)).meta({
			description: 'Cantidad máxima de actores devueltos en la página.',
			example: 20,
			default: 20,
		}),

		offset: z
			.preprocess(normalizeQueryInteger, z.number().int().min(0).max(2_147_483_647).default(0))
			.meta({
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
