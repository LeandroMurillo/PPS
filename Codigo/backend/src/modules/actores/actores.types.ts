import type {
	ActorDetallePublico,
	ActorPublicoResumen,
	ActorMapaPublico,
	ListarActoresFiltroCategoria,
	ListarActoresFiltroDepartamento,
	MapaFiltroCategoria,
	MapaFiltroDepartamento,
} from './actores.schemas.js';

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

export interface ObtenerActoresMapaRepositoryInput {
	busqueda: string | null;
	departamento: string | null;
	categorias: number[];
}

export interface ObtenerActoresMapaRepositoryResult {
	actores: ActorMapaPublico[];
}

export interface ObtenerActorRepositoryResult {
	actor: ActorDetallePublico | null;
}

export interface ObtenerFiltrosListadoActoresRepositoryResult {
	categorias: ListarActoresFiltroCategoria[];
	departamentos: ListarActoresFiltroDepartamento[];
}

export interface ObtenerFiltrosMapaRepositoryResult {
	categorias: MapaFiltroCategoria[];
	departamentos: MapaFiltroDepartamento[];
}
