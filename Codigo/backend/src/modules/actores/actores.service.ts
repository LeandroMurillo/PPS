import { listarActoresRepository } from './actores.repository.js';

import type { ListarActoresQuery, ListarActoresResponse } from './actores.schemas.js';
import type { ListarActoresRepositoryInput } from './actores.types.js';

export async function listarActoresService(
	query: ListarActoresQuery,
): Promise<ListarActoresResponse> {
	const repositoryInput: ListarActoresRepositoryInput = {
		busqueda: query.busqueda ?? null,
		departamento: query.departamento ?? null,

		/**
		 * La API permite idCategoria=0 para mantener
		 * compatibilidad con el comportamiento del SP,
		 * pero internamente lo normalizamos a null.
		 */
		idCategoria: query.idCategoria && query.idCategoria > 0 ? query.idCategoria : null,

		limit: query.limit,
		offset: query.offset,
	};

	const result = await listarActoresRepository(repositoryInput);

	const count = result.actores.length;

	return {
		data: result.actores,

		pagination: {
			total: result.total,
			count,
			limit: query.limit,
			offset: query.offset,
			hasNext: query.offset + count < result.total,
		},
	};
}
