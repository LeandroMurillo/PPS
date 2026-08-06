import { z } from 'zod';

import { pool } from '../../database/pool.js';

import type { ActorPublicoResumen } from './actores.schemas.js';
import type {
	ListarActoresRepositoryInput,
	ListarActoresRepositoryResult,
} from './actores.types.js';

/**
 * MariaDB puede devolver algunos enteros grandes como:
 *
 * - number
 * - bigint
 * - string
 *
 * Este esquema los normaliza a number y comprueba
 * que estén dentro del rango seguro de JavaScript.
 */
const databaseIntegerSchema = z
	.union([z.number().int(), z.bigint(), z.string().regex(/^\d+$/)])
	.refine((value) => Number.isSafeInteger(Number(value)), {
		message: 'El entero recibido desde MariaDB está fuera del rango seguro',
	})
	.transform((value) => Number(value));

const totalRowSchema = z.object({
	total: databaseIntegerSchema,
});

/**
 * Este esquema representa exactamente las columnas
 * que esperamos recibir del segundo result set.
 *
 * Si cambia algún alias del SP, la validación fallará
 * inmediatamente en vez de devolver datos incompletos.
 */
const actorDatabaseRowSchema = z.object({
	idActor: databaseIntegerSchema,

	nombre: z.string(),
	descripcion: z.string().nullable(),
	fotoPerfilUrl: z.string().nullable(),
	categoria: z.string(),
	subcategoria: z.string().nullable(),
	departamento: z.string(),
	localidad: z.string().nullable(),
});

function getResultSet(procedureResult: unknown, index: number): unknown[] {
	if (!Array.isArray(procedureResult)) {
		throw new Error('El procedimiento sp_publico_listar_actores no devolvió result sets');
	}

	const resultSet: unknown = procedureResult[index];

	if (!Array.isArray(resultSet)) {
		throw new Error(`No se encontró el result set ${index + 1} de sp_publico_listar_actores`);
	}

	return resultSet;
}

export async function listarActoresRepository(
	input: ListarActoresRepositoryInput,
): Promise<ListarActoresRepositoryResult> {
	const procedureResult: unknown = await pool.query(
		`
      CALL sp_publico_listar_actores(
        ?,
        ?,
        ?,
        ?,
        ?
      )
    `,
		[input.busqueda, input.departamento, input.idCategoria, input.limit, input.offset],
	);

	/*
	 * Suponemos:
	 *
	 * Result set 0: [{ total: ... }]
	 * Result set 1: [{ actor 1 }, { actor 2 }, ...]
	 *
	 * El CALL también puede incluir al final un paquete
	 * de estado del procedimiento. No necesitamos usarlo.
	 */
	const totalResultSet = getResultSet(procedureResult, 0);
	const actoresResultSet = getResultSet(procedureResult, 1);

	const totalRows = z.array(totalRowSchema).parse(totalResultSet);

	const totalRow = totalRows[0];

	if (!totalRow) {
		throw new Error('sp_publico_listar_actores no devolvió el total de actores');
	}

	const databaseActors = z.array(actorDatabaseRowSchema).parse(actoresResultSet);

	const actores: ActorPublicoResumen[] = databaseActors.map((actor) => ({
		id: actor.idActor,
		nombre: actor.nombre,
		descripcion: actor.descripcion,
		foto: actor.fotoPerfilUrl,
		categoria: actor.categoria,
		subcategoria: actor.subcategoria,
		departamento: actor.departamento,
		localidad: actor.localidad,
	}));

	return {
		total: totalRow.total,
		actores,
	};
}
