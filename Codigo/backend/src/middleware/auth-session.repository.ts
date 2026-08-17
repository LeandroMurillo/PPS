import { z } from 'zod';

import { pool } from '../database/pool.js';
import { estadoUsuarioSchema, rolUsuarioSchema } from '../modules/auth/auth.schemas.js';
import type { AuthUser } from './auth.middleware.js';

const sessionUserRowSchema = z.object({
	idUsuario: z
		.union([z.number().int(), z.bigint(), z.string().regex(/^\d+$/)])
		.transform((value) => Number(value)),
	email: z.string().email(),
	rol: rolUsuarioSchema,
	estado: estadoUsuarioSchema,
});

export async function obtenerUsuarioSesionRepository(idUsuario: number): Promise<AuthUser | null> {
	const procedureName = 'sp_auth_obtener_usuario_sesion';
	const result: unknown = await pool.query('CALL sp_auth_obtener_usuario_sesion(?)', [idUsuario]);

	if (!Array.isArray(result) || !Array.isArray(result[0])) {
		throw new Error(`${procedureName} no devolvió el result set esperado`);
	}

	const rows = z.array(sessionUserRowSchema).parse(result[0]);
	return rows[0] ?? null;
}
