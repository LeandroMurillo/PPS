import { z } from 'zod';
import { generoUsuarioSchema, rolUsuarioSchema, estadoUsuarioSchema, validarCUIL } from '../auth/auth.schemas.js';

function normalizeOptionalArcaCode(value: unknown): unknown {
	if (value === null || value === undefined) {
		return null;
	}
	if (typeof value === 'string') {
		const trimmed = value.trim();
		return trimmed === '' ? null : trimmed;
	}
	return value;
}

export const actualizarPerfilBodySchema = z.object({
	nombre: z
		.string()
		.transform((val) => val.trim())
		.pipe(
			z
				.string()
				.min(1, 'El nombre no puede estar vacío')
				.max(45, 'El nombre debe tener como máximo 45 caracteres')
				.refine((val) => !/\d/.test(val), {
					message: 'El nombre no puede contener números',
				}),
		),

	apellido: z
		.string()
		.transform((val) => val.trim())
		.pipe(
			z
				.string()
				.min(1, 'El apellido no puede estar vacío')
				.max(45, 'El apellido debe tener como máximo 45 caracteres')
				.refine((val) => !/\d/.test(val), {
					message: 'El apellido no puede contener números',
				}),
		),

	genero: generoUsuarioSchema,

	fechaNacimiento: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha de nacimiento debe estar en formato AAAA-MM-DD')
		.refine(
			(val) => {
				const date = new Date(val);
				const year = date.getFullYear();
				return !isNaN(date.getTime()) && date < new Date() && year >= 1900;
			},
			{ message: 'La fecha de nacimiento debe ser una fecha válida' },
		),

	nacionalidad: z
		.string()
		.transform((val) => val.trim())
		.pipe(
			z
				.string()
				.min(1, 'La nacionalidad no puede estar vacía')
				.max(45, 'La nacionalidad debe tener como máximo 45 caracteres')
				.refine((val) => !/\d/.test(val), {
					message: 'La nacionalidad no puede contener números',
				}),
		),

	CUIL: z
		.string()
		.transform((val) => val.trim())
		.pipe(
			z
				.string()
				.regex(/^\d{11}$/, 'El CUIL debe contener exactamente 11 dígitos numéricos')
				.refine((val) => validarCUIL(val), {
					message: 'El CUIL ingresado no es válido (dígito verificador incorrecto)',
				}),
		),

	actividadesArcaCodigo: z
		.preprocess(
			normalizeOptionalArcaCode,
			z
				.string()
				.regex(/^\d{6}$/, 'El código de actividad ARCA debe contener 6 dígitos numéricos')
				.nullable()
				.optional(),
		)
		.transform((val) => val ?? null),

	documentoIdentidad: z.string().optional(),
});

export type ActualizarPerfilBody = z.infer<typeof actualizarPerfilBodySchema>;

export const perfilUsuarioSchema = z.object({
	idUsuario: z.number().int().positive(),
	nombre: z.string(),
	apellido: z.string(),
	email: z.string(),
	genero: generoUsuarioSchema,
	fechaNacimiento: z.string(),
	nacionalidad: z.string(),
	CUIL: z.string(),
	actividadesArcaCodigo: z.string().nullable(),
	actividadArca: z.string().nullable().optional(),
	fotoDniUrl: z.string().nullable(),
	rol: rolUsuarioSchema,
	estado: estadoUsuarioSchema,
	fechaRegistro: z.string(),
	actoresDuenoCount: z.number().int().nonnegative().default(0),
});

export type PerfilUsuario = z.infer<typeof perfilUsuarioSchema>;
