import { apiFetch, appendOptionalParam } from './client';

export type FiltroCategoria = {
	id: number;
	nombre: string;
	icono: CategoriaIcono;
	cantidadActores?: number;
};

export type CategoriaIcono =
	| 'Category'
	| 'MusicNote'
	| 'Handyman'
	| 'TheaterComedy'
	| 'Movie'
	| 'MenuBook'
	| 'Palette';

export type FiltroDepartamento = {
	departamento: string;
	cantidadActores?: number;
};

export type FiltrosActoresResponse = {
	categorias: FiltroCategoria[];
	departamentos: FiltroDepartamento[];
};

export type ActorResumen = {
	id: number;
	nombre: string;
	descripcion: string | null;
	foto: string | null;
	categoria: string;
	categoriaIcono: CategoriaIcono;
	subcategoria: string | null;
	departamento: string;
	localidad: string | null;
};

export type ListarActoresResponse = {
	data: ActorResumen[];
	pagination: {
		total: number;
		count: number;
		limit: number;
		offset: number;
		hasNext: boolean;
	};
};

export type ActorMapa = {
	id: number;
	nombre: string;
	descripcion: string | null;
	foto: string | null;
	categoria: string;
	categoriaIcono: CategoriaIcono;
	subcategoria: string | null;
	departamento: string;
	localidad: string | null;
	direccion: string | null;
	latitud: number;
	longitud: number;
};

export type ObtenerActoresMapaResponse = {
	data: ActorMapa[];
};

export type ActorDetalle = {
	id: number;
	nombre: string;
	descripcion: string | null;
	foto: string | null;
	categoria: string;
	categoriaIcono: CategoriaIcono;
	subcategoria: string | null;
	ubicacion: {
		provincia: string;
		departamento: string;
		localidad: string | null;
		esPublica: boolean;
		direccion: string | null;
		latitud: number | null;
		longitud: number | null;
	};
	portafolio: {
		tipo: string;
		descripcion: string | null;
		url: string;
	}[];
	eventos: {
		nombre: string;
		descripcion: string | null;
		fecha: string;
	}[];
	respuestas: {
		pregunta: string;
		respuesta: string | null;
	}[];
	integrantes: {
		nombre: string;
		apellido: string;
		rol: string | null;
	}[];
};

export type ObtenerActorResponse = {
	data: ActorDetalle;
};

export async function obtenerFiltrosListadoActores(signal?: AbortSignal) {
	return apiFetch<FiltrosActoresResponse>('/api/publico/actores/filtros', signal);
}

export async function obtenerFiltrosMapa(signal?: AbortSignal) {
	return apiFetch<FiltrosActoresResponse>('/api/publico/actores/mapa/filtros', signal);
}

export async function listarActores(
	input: {
		busqueda?: string;
		departamento?: string;
		idCategoria?: number;
		limit?: number;
		offset?: number;
	},
	signal?: AbortSignal,
) {
	const params = new URLSearchParams();

	appendOptionalParam(params, 'busqueda', input.busqueda);
	appendOptionalParam(params, 'departamento', input.departamento);
	appendOptionalParam(params, 'idCategoria', input.idCategoria);
	appendOptionalParam(params, 'limit', input.limit);
	appendOptionalParam(params, 'offset', input.offset);

	const query = params.toString();

	return apiFetch<ListarActoresResponse>(`/api/publico/actores${query ? `?${query}` : ''}`, signal);
}

export async function obtenerActoresMapa(
	input: {
		busqueda?: string;
		departamento?: string;
		categorias?: number[];
	},
	signal?: AbortSignal,
) {
	const params = new URLSearchParams();

	appendOptionalParam(params, 'busqueda', input.busqueda);
	appendOptionalParam(params, 'departamento', input.departamento);

	for (const categoria of input.categorias ?? []) {
		params.append('categorias', String(categoria));
	}

	const query = params.toString();

	return apiFetch<ObtenerActoresMapaResponse>(`/api/publico/actores/mapa${query ? `?${query}` : ''}`, signal);
}

export async function obtenerActor(id: number, signal?: AbortSignal) {
	return apiFetch<ObtenerActorResponse>(`/api/publico/actores/${id}`, signal);
}
