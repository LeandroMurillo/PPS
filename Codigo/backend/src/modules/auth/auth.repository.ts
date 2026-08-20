import { z } from 'zod';

import { pool } from '../../database/pool.js';
import type { ActividadArca, RegistrarUsuarioBody, UsuarioRegistrado } from './auth.schemas.js';
import {
	actividadArcaSchema,
	estadoUsuarioSchema,
	generoUsuarioSchema,
	rolUsuarioSchema,
	usuarioRegistradoSchema,
} from './auth.schemas.js';

const databaseIntegerSchema = z
	.union([z.number().int(), z.bigint(), z.string().regex(/^\d+$/)])
	.refine((value) => Number.isSafeInteger(Number(value)), {
		message: 'El entero recibido desde MariaDB está fuera del rango seguro',
	})
	.transform((value) => Number(value));

const usuarioDBRowSchema = z.object({
	idUsuario: databaseIntegerSchema,
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
});

function getResultSet(procedureResult: unknown, index: number, procedureName: string): unknown[] {
	if (!Array.isArray(procedureResult) || !Array.isArray(procedureResult[index])) {
		throw new Error(`No se encontró el result set ${index + 1} de ${procedureName}`);
	}

	return procedureResult[index];
}

export type RegistrarUsuarioRepositoryInput = Omit<RegistrarUsuarioBody, 'documentoIdentidad'> & {
	firebaseUid: string;
	email: string;
	fotoDniUrl: string | null;
};

export async function registrarUsuarioRepository(input: RegistrarUsuarioRepositoryInput): Promise<UsuarioRegistrado> {
	const procedureName = 'sp_publico_registrar_usuario';

	const result: unknown = await pool.query('CALL sp_publico_registrar_usuario(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
		input.firebaseUid,
		input.nombre,
		input.apellido,
		input.genero,
		input.fechaNacimiento,
		input.nacionalidad,
		input.email,
		input.CUIL,
		input.actividadesArcaCodigo ?? null,
		input.fotoDniUrl ?? null,
	]);

	const rows = z.array(usuarioDBRowSchema).parse(getResultSet(result, 0, procedureName));

	const firstRow = rows[0];

	if (!firstRow) {
		throw new Error('El procedimiento de registro no devolvió los datos del usuario.');
	}

	return usuarioRegistradoSchema.parse(firstRow);
}

export async function obtenerUsuarioPorFirebaseUidRepository(firebaseUid: string): Promise<UsuarioRegistrado | null> {
	const procedureName = 'sp_publico_obtener_usuario_por_firebase_uid';

	const result: unknown = await pool.query('CALL sp_publico_obtener_usuario_por_firebase_uid(?)', [firebaseUid]);

	const rows = z.array(usuarioDBRowSchema).parse(getResultSet(result, 0, procedureName));

	return rows[0] ?? null;
}

export async function listarActividadesArcaRepository(): Promise<ActividadArca[]> {
	const procedureName = 'sp_publico_listar_actividades_arca';

	const result: unknown = await pool.query('CALL sp_publico_listar_actividades_arca()');

	const rows = z.array(actividadArcaSchema).parse(getResultSet(result, 0, procedureName));

	return rows;
}
