import { z } from 'zod';

export const generoUsuarioSchema = z.enum(['F', 'M', 'X']);
export type GeneroUsuario = z.infer<typeof generoUsuarioSchema>;

export const rolUsuarioSchema = z.enum(['USUARIO', 'MODERADOR', 'ADMIN']);
export type RolUsuario = z.infer<typeof rolUsuarioSchema>;

export const estadoUsuarioSchema = z.enum(['A', 'P', 'I']);
export type EstadoUsuario = z.infer<typeof estadoUsuarioSchema>;

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

export function validarCUIL(cuil: string): boolean {
	const cleaned = cuil.trim().replace(/\D/g, '');
	if (cleaned.length !== 11) return false;

	const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
	let sum = 0;
	for (let i = 0; i < 10; i++) {
		sum += Number(cleaned[i]) * multipliers[i]!;
	}

	const mod = sum % 11;
	let expectedDigit = 11 - mod;
	if (expectedDigit === 11) expectedDigit = 0;
	if (expectedDigit === 10) expectedDigit = 9;

	return Number(cleaned[10]) === expectedDigit;
}

export const registrarUsuarioBodySchema = z.object({
	nombre: z
		.string()
		.transform((val) => val.trim())
		.pipe(
			z
				.string()
				.min(1, 'El nombre no puede estar vacío')
				.max(45, 'El nombre debe tener como máximo 45 caracteres'),
		),

	apellido: z
		.string()
		.transform((val) => val.trim())
		.pipe(
			z
				.string()
				.min(1, 'El apellido no puede estar vacío')
				.max(45, 'El apellido debe tener como máximo 45 caracteres'),
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
			{ message: 'La fecha de nacimiento debe ser una fecha válida entre el año 1900 y la fecha actual' },
		),

	nacionalidad: z
		.string()
		.transform((val) => val.trim())
		.pipe(
			z
				.string()
				.min(1, 'La nacionalidad no puede estar vacía')
				.max(45, 'La nacionalidad debe tener como máximo 45 caracteres'),
		),

	email: z
		.string()
		.transform((val) => val.trim().toLowerCase())
		.pipe(
			z
				.string()
				.email('El correo electrónico no tiene un formato válido')
				.max(99, 'El correo electrónico debe tener como máximo 99 caracteres'),
		),

	contraseña: z
		.string()
		.min(6, 'La contraseña debe tener una longitud mínima de 6 caracteres')
		.regex(
			/^(?=.*[a-zA-Z])(?=.*\d)/,
			'La contraseña debe incluir al menos una letra y un número',
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

	documentoIdentidad: z
		.string()
		.min(1, 'Debe adjuntar la imagen de su documento de identidad'),
});

export type RegistrarUsuarioBody = z.infer<typeof registrarUsuarioBodySchema>;

export const actividadArcaSchema = z.object({
	codigo: z.string(),
	descripcion: z.string(),
});

export type ActividadArca = z.infer<typeof actividadArcaSchema>;

export const usuarioRegistradoSchema = z.object({
	idUsuario: z.number().int().positive(),
	nombre: z.string(),
	apellido: z.string(),
	email: z.string(),
	genero: generoUsuarioSchema,
	fechaNacimiento: z.string(),
	nacionalidad: z.string(),
	CUIL: z.string(),
	actividadesArcaCodigo: z.string().nullable(),
	fotoDniUrl: z.string().nullable(),
	rol: rolUsuarioSchema,
	estado: estadoUsuarioSchema,
	fechaRegistro: z.string(),
});

export type UsuarioRegistrado = z.infer<typeof usuarioRegistradoSchema>;

export const registroUsuarioResponseSchema = z.object({
	usuario: usuarioRegistradoSchema,
	mensaje: z.string(),
});

export type RegistroUsuarioResponse = z.infer<typeof registroUsuarioResponseSchema>;

export const loginBodySchema = z.object({
	email: z
		.string()
		.transform((val) => val.trim().toLowerCase())
		.pipe(
			z
				.string()
				.email('El correo electrónico no tiene un formato válido')
				.max(99, 'El correo electrónico debe tener como máximo 99 caracteres'),
		),
	contraseña: z
		.string()
		.min(1, 'La contraseña es obligatoria'),
});

export type LoginBody = z.infer<typeof loginBodySchema>;

export const loginResponseSchema = z.object({
	usuario: usuarioRegistradoSchema,
	token: z.string(),
	mensaje: z.string(),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;

