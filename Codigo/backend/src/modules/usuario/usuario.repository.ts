import { z } from 'zod';
import { pool } from '../../database/pool.js';
import {
	estadoUsuarioSchema,
	generoUsuarioSchema,
	rolUsuarioSchema,
	type GeneroUsuario,
} from '../auth/auth.schemas.js';

const databaseIntegerSchema = z
	.union([z.number().int(), z.bigint(), z.string().regex(/^\d+$/)])
	.refine((value) => Number.isSafeInteger(Number(value)), {
		message: 'El entero recibido desde MariaDB está fuera del rango seguro',
	})
	.transform((value) => Number(value));

const cuentaEliminadaRowSchema = z.object({
	actoresEliminadosCount: databaseIntegerSchema,
});

const archivoPersonalRowSchema = z.object({
	tipo: z.enum(['DNI', 'ACTOR_PERFIL', 'ACTOR_PORTAFOLIO']),
	url: z.string(),
});

export type ArchivoPersonalUsuario = z.infer<typeof archivoPersonalRowSchema>;

const perfilUsuarioDBRowSchema = z.object({
	idUsuario: databaseIntegerSchema,
	idFirebase: z.string(),
	nombre: z.string(),
	apellido: z.string(),
	email: z.string(),
	genero: generoUsuarioSchema,
	fechaNacimiento: z.union([z.string(), z.date()]).transform((val) => {
		if (val instanceof Date) {
			return val.toISOString().split('T')[0]!;
		}
		return String(val).split('T')[0]!;
	}),
	nacionalidad: z.string(),
	CUIL: z.string(),
	actividadesArcaCodigo: z.string().nullable(),
	actividadArca: z.string().nullable().optional(),
	fotoDniUrl: z
		.string()
		.nullable()
		.optional()
		.transform((val) => val ?? null),
	avatarEstilo: z
		.string()
		.nullable()
		.optional()
		.transform((val) => val ?? null),
	avatarSeed: z
		.string()
		.nullable()
		.optional()
		.transform((val) => val ?? null),
	rol: rolUsuarioSchema,
	estado: estadoUsuarioSchema,
	fechaRegistro: z.union([z.string(), z.date()]).transform((val) => {
		if (val instanceof Date) {
			return val.toISOString();
		}
		return String(val);
	}),
	actoresDuenoCount: databaseIntegerSchema.default(0),
});

export type PerfilUsuarioDBRow = z.infer<typeof perfilUsuarioDBRowSchema>;

function getResultSet(procedureResult: unknown, index: number, procedureName: string): unknown[] {
	if (!Array.isArray(procedureResult) || !Array.isArray(procedureResult[index])) {
		throw new Error(`No se encontró el result set ${index + 1} de ${procedureName}`);
	}

	return procedureResult[index];
}

export async function obtenerPerfilUsuarioRepository(idUsuario: number): Promise<PerfilUsuarioDBRow | null> {
	const procedureName = 'sp_usuario_obtener_perfil';

	const result: unknown = await pool.query('CALL sp_usuario_obtener_perfil(?)', [idUsuario]);

	const rows = z.array(perfilUsuarioDBRowSchema).parse(getResultSet(result, 0, procedureName));

	return rows[0] ?? null;
}

export type ActualizarPerfilRepositoryInput = {
	nombre: string;
	apellido: string;
	genero: GeneroUsuario;
	fechaNacimiento: string;
	nacionalidad: string;
	CUIL: string;
	actividadesArcaCodigo: string | null;
	fotoDniUrl?: string | null;
	avatarEstilo?: string | null;
	avatarSeed?: string | null;
};

export async function actualizarPerfilUsuarioRepository(
	idUsuario: number,
	input: ActualizarPerfilRepositoryInput,
): Promise<PerfilUsuarioDBRow | null> {
	const procedureName = 'sp_usuario_actualizar_perfil';

	const result: unknown = await pool.query('CALL sp_usuario_actualizar_perfil(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
		idUsuario,
		input.nombre,
		input.apellido,
		input.genero,
		input.fechaNacimiento,
		input.nacionalidad,
		input.CUIL,
		input.actividadesArcaCodigo ?? null,
		input.fotoDniUrl ?? null,
		input.avatarEstilo ?? null,
		input.avatarSeed ?? null,
	]);

	const rows = z.array(perfilUsuarioDBRowSchema).parse(getResultSet(result, 0, procedureName));

	return rows[0] ?? null;
}

export async function eliminarCuentaUsuarioRepository(
	idUsuario: number,
): Promise<{ actoresEliminadosCount: number; archivos: ArchivoPersonalUsuario[] }> {
	const procedureName = 'sp_usuario_eliminar_cuenta';
	const result: unknown = await pool.query('CALL sp_usuario_eliminar_cuenta(?)', [idUsuario]);
	const summary = z.array(cuentaEliminadaRowSchema).parse(getResultSet(result, 0, procedureName))[0];

	if (!summary) {
		throw new Error(`${procedureName} no devolvió el resumen de la eliminación`);
	}

	return {
		actoresEliminadosCount: summary.actoresEliminadosCount,
		archivos: z.array(archivoPersonalRowSchema).parse(getResultSet(result, 1, procedureName)),
	};
}
