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

export interface ListarEventosPublicosRepositoryInput {
	busqueda: string | null;
	departamento: string | null;
	idCategoria: number | null;
	fechaDesde: string | null;
	fechaHasta: string | null;
	limit: number;
	offset: number;
}

export interface EventoPublicoRepositoryItem {
	idEvento: number;
	nombreEvento: string;
	descripcion: string | null;
	fecha: string;
	idActor: number;
	nombreActor: string;
	fotoPerfilActor: string | null;
	idCategoria: number;
	categoria: string;
	categoriaIcono: string;
	subcategoria: string | null;
	departamento: string;
	localidad: string | null;
	direccion: string | null;
	latitud: number | null;
	longitud: number | null;
}

export interface ListarEventosPublicosRepositoryResult {
	total: number;
	data: EventoPublicoRepositoryItem[];
}

export interface ObtenerEstadisticasPublicasRepositoryResult {
	totalActores: number;
	totalEspacios: number;
	totalDepartamentos: number;
	totalCategorias: number;
}
