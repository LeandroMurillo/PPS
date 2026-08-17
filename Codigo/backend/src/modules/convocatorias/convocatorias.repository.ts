import { z } from 'zod';

import { pool } from '../../database/pool.js';

const databaseIntegerSchema = z
	.union([z.number().int(), z.bigint(), z.string().regex(/^\d+$/)])
	.refine((value) => Number.isSafeInteger(Number(value)), {
		message: 'El entero recibido desde MariaDB está fuera del rango seguro',
	})
	.transform((value) => Number(value));

const databaseDateSchema = z
	.union([z.date(), z.string()])
	.transform((value) => (value instanceof Date ? value.toISOString() : value));

export const convocatoriaRowSchema = z.object({
	idConvocatoria: databaseIntegerSchema,
	titulo: z.string(),
	descripcion: z.string(),
	fechaCreacion: databaseDateSchema,
	fechaCierre: databaseDateSchema,
	totalPostulaciones: databaseIntegerSchema,
	estado: z.enum(['ABIERTA', 'CERRADA']).optional(),
});

export const postulacionUsuarioRowSchema = z.object({
	idConvocatoria: databaseIntegerSchema,
	idActor: databaseIntegerSchema,
	nombreActor: z.string(),
	fechaPostulacion: databaseDateSchema,
});

export const postulanteDetalleRowSchema = z.object({
	idActor: databaseIntegerSchema,
	fechaPostulacion: databaseDateSchema,
	nombreActor: z.string(),
	fotoPerfilUrl: z.string().nullable(),
	estadoActor: z.enum(['A', 'P', 'I']),
	categoria: z.string(),
	subcategoria: z.string().nullable(),
	departamento: z.string().nullable(),
	localidad: z.string().nullable(),
	responsableNombre: z.string().nullable(),
	responsableApellido: z.string().nullable(),
	responsableEmail: z.string().nullable(),
});

export type ConvocatoriaRow = z.infer<typeof convocatoriaRowSchema>;
export type PostulacionUsuarioRow = z.infer<typeof postulacionUsuarioRowSchema>;
export type PostulanteDetalleRow = z.infer<typeof postulanteDetalleRowSchema>;

export async function listarConvocatoriasActivasRepository(idUsuario: number | null) {
	const raw = await pool.execute('CALL sp_convocatoria_listar_activas(?)', [idUsuario]);
	const rows = raw as unknown as [unknown[], unknown[]];
	const convocatoriasRaw = Array.isArray(rows[0]) ? rows[0] : [];
	const postulacionesRaw = Array.isArray(rows[1]) ? rows[1] : [];

	const convocatorias = convocatoriasRaw.map((row) => convocatoriaRowSchema.parse(row));
	const postulaciones = postulacionesRaw.map((row) => postulacionUsuarioRowSchema.parse(row));

	return {
		convocatorias,
		postulaciones,
	};
}

export async function listarConvocatoriasAdminRepository(
	busqueda: string | undefined,
	estado: string | undefined,
	limit: number,
	offset: number,
) {
	const raw = await pool.execute('CALL sp_convocatoria_listar_admin(?, ?, ?, ?)', [
		busqueda || null,
		estado || 'TODAS',
		limit,
		offset,
	]);
	const rows = raw as unknown as [{ total: unknown }[], unknown[]];
	const total = z.object({ total: databaseIntegerSchema }).parse(rows[0][0]).total;
	const data = (Array.isArray(rows[1]) ? rows[1] : []).map((row) => convocatoriaRowSchema.parse(row));

	return {
		total,
		data,
	};
}

export async function obtenerConvocatoriaDetalleRepository(idConvocatoria: number) {
	const raw = await pool.execute('CALL sp_convocatoria_obtener_detalle(?)', [idConvocatoria]);
	const rows = raw as unknown as [unknown[], unknown[]];
	const detalleRaw = Array.isArray(rows[0]) && rows[0][0] ? rows[0][0] : null;
	if (!detalleRaw) {
		return null;
	}

	const convocatoria = convocatoriaRowSchema.parse(detalleRaw);
	const postulantes = (Array.isArray(rows[1]) ? rows[1] : []).map((row) => postulanteDetalleRowSchema.parse(row));

	return {
		convocatoria,
		postulantes,
	};
}

export async function crearConvocatoriaRepository(titulo: string, descripcion: string, fechaCierre: string) {
	// MariaDB DATETIME expects 'YYYY-MM-DD HH:MM:SS'
	const formattedDate = new Date(fechaCierre).toISOString().slice(0, 19).replace('T', ' ');
	const raw = await pool.execute('CALL sp_convocatoria_crear(?, ?, ?, @pIdConvocatoria)', [
		titulo,
		descripcion,
		formattedDate,
	]);
	const rows = raw as unknown as [unknown[]];
	const createdRaw = Array.isArray(rows[0]) && rows[0][0] ? rows[0][0] : null;
	if (!createdRaw) {
		throw new Error('No se pudo crear la convocatoria.');
	}
	return convocatoriaRowSchema.parse(createdRaw);
}

export async function editarConvocatoriaRepository(
	idConvocatoria: number,
	titulo: string,
	descripcion: string,
	fechaCierre: string,
) {
	const formattedDate = new Date(fechaCierre).toISOString().slice(0, 19).replace('T', ' ');
	const raw = await pool.execute('CALL sp_convocatoria_editar(?, ?, ?, ?)', [
		idConvocatoria,
		titulo,
		descripcion,
		formattedDate,
	]);
	const rows = raw as unknown as [unknown[]];
	const updatedRaw = Array.isArray(rows[0]) && rows[0][0] ? rows[0][0] : null;
	if (!updatedRaw) {
		throw new Error('No se pudo editar la convocatoria.');
	}
	return convocatoriaRowSchema.parse(updatedRaw);
}

export async function eliminarConvocatoriaRepository(idConvocatoria: number) {
	await pool.execute('CALL sp_convocatoria_eliminar(?)', [idConvocatoria]);
}

export async function postularActorRepository(idConvocatoria: number, idActor: number, idUsuario: number) {
	await pool.execute('CALL sp_convocatoria_postular_actor(?, ?, ?)', [idConvocatoria, idActor, idUsuario]);
}

export async function cancelarPostulacionRepository(idConvocatoria: number, idActor: number, idUsuario: number) {
	await pool.execute('CALL sp_convocatoria_cancelar_postulacion(?, ?, ?)', [idConvocatoria, idActor, idUsuario]);
}
