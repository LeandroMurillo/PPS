import {
	listarActoresRepository,
	listarEventosPublicosRepository,
	obtenerActoresMapaRepository,
	obtenerActorRepository,
	obtenerEstadisticasPublicasRepository,
	obtenerFiltrosListadoActoresRepository,
	obtenerFiltrosMapaRepository,
} from './actores.repository.js';

import type {
	ListarActoresQuery,
	ListarActoresResponse,
	ListarEventosPublicosQuery,
	ListarEventosPublicosResponse,
	ObtenerActoresMapaQuery,
	ObtenerActoresMapaResponse,
	ObtenerActorResponse,
	ObtenerEstadisticasPublicasResponse,
	ObtenerFiltrosListadoActoresResponse,
	ObtenerFiltrosMapaResponse,
} from './actores.schemas.js';
import type {
	ListarActoresRepositoryInput,
	ListarEventosPublicosRepositoryInput,
	ObtenerActoresMapaRepositoryInput,
} from './actores.types.js';

export async function listarActoresService(query: ListarActoresQuery): Promise<ListarActoresResponse> {
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

export async function obtenerActorService(id: number, idUsuario?: number | null): Promise<ObtenerActorResponse | null> {
	const result = await obtenerActorRepository(id, idUsuario);

	if (!result.actor) {
		return null;
	}

	return {
		data: result.actor,
	};
}

export async function obtenerActoresMapaService(query: ObtenerActoresMapaQuery): Promise<ObtenerActoresMapaResponse> {
	const repositoryInput: ObtenerActoresMapaRepositoryInput = {
		busqueda: query.busqueda ?? null,
		departamento: query.departamento ?? null,
		categorias: query.categorias ?? [],
	};

	const result = await obtenerActoresMapaRepository(repositoryInput);

	return {
		data: result.actores,
	};
}

export async function obtenerFiltrosMapaService(): Promise<ObtenerFiltrosMapaResponse> {
	return obtenerFiltrosMapaRepository();
}

export async function obtenerFiltrosListadoActoresService(): Promise<ObtenerFiltrosListadoActoresResponse> {
	return obtenerFiltrosListadoActoresRepository();
}

export async function listarEventosPublicosService(
	query: ListarEventosPublicosQuery,
): Promise<ListarEventosPublicosResponse> {
	const repositoryInput: ListarEventosPublicosRepositoryInput = {
		busqueda: query.busqueda ?? null,
		departamento: query.departamento ?? null,
		idCategoria: query.idCategoria && query.idCategoria > 0 ? query.idCategoria : null,
		fechaDesde: query.fechaDesde ?? null,
		fechaHasta: query.fechaHasta ?? null,
		limit: query.limit,
		offset: query.offset,
	};

	const result = await listarEventosPublicosRepository(repositoryInput);
	const count = result.data.length;

	return {
		data: result.data,
		pagination: {
			total: result.total,
			count,
			limit: query.limit,
			offset: query.offset,
			hasNext: query.offset + count < result.total,
		},
	};
}

export async function obtenerEstadisticasPublicasService(): Promise<ObtenerEstadisticasPublicasResponse> {
	return obtenerEstadisticasPublicasRepository();
}
