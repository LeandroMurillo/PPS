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

const perfilUsuarioDBRowSchema = z.object({
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
	actividadArca: z.string().nullable().optional(),
	fotoDniUrl: z
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
	contraseña: z.string(),
	actoresDuenoCount: databaseIntegerSchema.default(0),
});

export type PerfilUsuarioDBRow = z.infer<typeof perfilUsuarioDBRowSchema>;

export async function obtenerPerfilUsuarioRepository(idUsuario: number): Promise<PerfilUsuarioDBRow | null> {
	const [rows] = (await pool.query(
		`SELECT
			u.idUsuario,
			u.actividadesArcaCodigo,
			aa.descripcion AS actividadArca,
			u.nombre,
			u.apellido,
			u.CUIL,
			u.genero,
			u.fechaNacimiento,
			u.nacionalidad,
			u.email,
			u.fotoDniUrl,
			u.fechaRegistro,
			u.rol,
			u.estado,
			u.contraseña,
			(SELECT COUNT(*) FROM \`Integrantes\` i WHERE i.idUsuario = u.idUsuario AND i.esDueño = 1) AS actoresDuenoCount
		FROM \`Usuarios\` u
		LEFT JOIN \`ActividadesArca\` aa ON aa.codigo = u.actividadesArcaCodigo
		WHERE u.idUsuario = ?`,
		[idUsuario],
	)) as unknown as [unknown[]];

	if (!Array.isArray(rows) || rows.length === 0) {
		return null;
	}

	return perfilUsuarioDBRowSchema.parse(rows[0]);
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
};

export async function actualizarPerfilUsuarioRepository(
	idUsuario: number,
	input: ActualizarPerfilRepositoryInput,
): Promise<PerfilUsuarioDBRow | null> {
	if (input.fotoDniUrl) {
		await pool.query(
			`UPDATE \`Usuarios\`
			SET nombre = ?, apellido = ?, genero = ?, fechaNacimiento = ?, nacionalidad = ?, CUIL = ?, actividadesArcaCodigo = ?, fotoDniUrl = ?
			WHERE idUsuario = ?`,
			[
				input.nombre,
				input.apellido,
				input.genero,
				input.fechaNacimiento,
				input.nacionalidad,
				input.CUIL,
				input.actividadesArcaCodigo,
				input.fotoDniUrl,
				idUsuario,
			],
		);
	} else {
		await pool.query(
			`UPDATE \`Usuarios\`
			SET nombre = ?, apellido = ?, genero = ?, fechaNacimiento = ?, nacionalidad = ?, CUIL = ?, actividadesArcaCodigo = ?
			WHERE idUsuario = ?`,
			[
				input.nombre,
				input.apellido,
				input.genero,
				input.fechaNacimiento,
				input.nacionalidad,
				input.CUIL,
				input.actividadesArcaCodigo,
				idUsuario,
			],
		);
	}

	return obtenerPerfilUsuarioRepository(idUsuario);
}

export async function actualizarContraseñaUsuarioRepository(
	idUsuario: number,
	nuevaContraseñaHash: string,
): Promise<void> {
	await pool.query('UPDATE `Usuarios` SET contraseña = ? WHERE idUsuario = ?', [nuevaContraseñaHash, idUsuario]);
}

export async function eliminarCuentaUsuarioRepository(idUsuario: number): Promise<{ actoresEliminadosCount: number }> {
	const connection = await pool.getConnection();
	try {
		await connection.beginTransaction();

		// 1. Encontrar todos los actores donde el usuario es dueño principal
		const [ownerRows] = (await connection.query(
			'SELECT idActor FROM `Integrantes` WHERE idUsuario = ? AND esDueño = 1',
			[idUsuario],
		)) as unknown as [Array<{ idActor: number }>];

		const ownerActorIds = Array.isArray(ownerRows) ? ownerRows.map((r) => r.idActor) : [];

		for (const idActor of ownerActorIds) {
			const [actorRows] = (await connection.query('SELECT idUbicacion FROM `Actores` WHERE idActor = ?', [
				idActor,
			])) as unknown as [Array<{ idUbicacion: number | null }>];
			const idUbicacion = Array.isArray(actorRows) && actorRows[0] ? actorRows[0].idUbicacion : null;

			await connection.query('DELETE FROM `Respuestas` WHERE idActor = ?', [idActor]);
			await connection.query('DELETE FROM `Postulaciones` WHERE idActor = ?', [idActor]);
			await connection.query('DELETE FROM `ItemsPortafolio` WHERE idActor = ?', [idActor]);
			await connection.query('DELETE FROM `Eventos` WHERE idActor = ?', [idActor]);
			await connection.query('DELETE FROM `Integrantes` WHERE idActor = ?', [idActor]);
			await connection.query('DELETE FROM `IntegrantesNoRegistrados` WHERE idActor = ?', [idActor]);
			await connection.query('DELETE FROM `Actores` WHERE idActor = ?', [idActor]);
			if (idUbicacion) {
				await connection.query('DELETE FROM `Ubicaciones` WHERE idUbicacion = ?', [idUbicacion]);
			}
		}

		// 2. Eliminar membresías en actores donde no es dueño
		await connection.query('DELETE FROM `Integrantes` WHERE idUsuario = ?', [idUsuario]);

		// 3. Eliminar asignaciones de moderador
		await connection.query('DELETE FROM `ModeradoresCategorias` WHERE idUsuario = ?', [idUsuario]);

		// 4. Eliminar el usuario
		await connection.query('DELETE FROM `Usuarios` WHERE idUsuario = ?', [idUsuario]);

		await connection.commit();
		return { actoresEliminadosCount: ownerActorIds.length };
	} catch (err) {
		await connection.rollback();
		throw err;
	} finally {
		connection.release();
	}
}
