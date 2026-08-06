import type { ActorPublicoResumen } from './actores.schemas.js';

export interface ListarActoresRepositoryInput {
	busqueda: string | null;
	departamento: string | null;
	idCategoria: number | null;
	limit: number;
	offset: number;
}

export interface ListarActoresRepositoryResult {
	total: number;
	actores: ActorPublicoResumen[];
}
