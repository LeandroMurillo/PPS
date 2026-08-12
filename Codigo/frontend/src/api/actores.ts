import { apiFetch, apiRequest, appendOptionalParam } from './client';
import type { CategoriaIcono } from '../components/categoryIcon';

export type { CategoriaIcono };

export type FiltroCategoria = {
	id: number;
	nombre: string;
	icono: CategoriaIcono;
	cantidadActores?: number;
};

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

export type MisActorApiItem = {
	id: number;
	nombre: string;
	descripcion: string;
	foto: string | null;
	cuit: string | null;
	tipoActor: 'INDIVIDUO' | 'COLECTIVO' | 'ESPACIO';
	fechaCreacion: string;
	estado: 'A' | 'P' | 'I';
	categoria: string;
	categoriaIcono: CategoriaIcono;
	subcategoria: string | null;
	ubicacion: {
		provincia: string;
		departamento: string;
		localidad: string;
		direccion: string;
		latitud: number;
		longitud: number;
	};
};

export type ListarMisActoresResponse = {
	data: MisActorApiItem[];
	pagination: {
		total: number;
		limit: number;
		offset: number;
		hasNext: boolean;
	};
};

export async function listarMisActoresApi(
	input?: { busqueda?: string; idCategoria?: number; estado?: 'A' | 'P' | 'I'; limit?: number; offset?: number },
	signal?: AbortSignal,
) {
	const params = new URLSearchParams();
	if (input?.busqueda) appendOptionalParam(params, 'busqueda', input.busqueda);
	if (input?.idCategoria) appendOptionalParam(params, 'idCategoria', input.idCategoria);
	if (input?.estado) appendOptionalParam(params, 'estado', input.estado);
	if (input?.limit) appendOptionalParam(params, 'limit', input.limit);
	if (input?.offset) appendOptionalParam(params, 'offset', input.offset);

	const query = params.toString();
	return apiFetch<ListarMisActoresResponse>(`/api/mis-actores${query ? `?${query}` : ''}`, signal);
}

export async function editarMiActorApi(
	idActor: number,
	input: {
		idCategoria: number;
		idSubcategoria?: number | null;
		nombre: string;
		descripcion: string;
		fotoPerfilUrl?: string | null;
		cuit?: string | null;
		tipoActor: 'INDIVIDUO' | 'COLECTIVO' | 'ESPACIO';
		departamento: string;
		localidad: string;
		direccion: string;
	},
) {
	return apiRequest<{ message: string }>(`/api/mis-actores/${idActor}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(input),
	});
}

export async function cambiarEstadoMiActorApi(idActor: number, nuevoEstado: 'A' | 'P' | 'I') {
	return apiRequest<{ message: string }>(`/api/mis-actores/${idActor}/estado`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ nuevoEstado }),
	});
}

export async function eliminarMiActorApi(idActor: number) {
	return apiRequest<{ message: string }>(`/api/mis-actores/${idActor}`, {
		method: 'DELETE',
	});
}

export async function agregarItemPortafolioApi(
	idActor: number,
	input: { tipo: 'IMAGEN' | 'LINK' | 'RRSS'; descripcion: string; url: string },
) {
	return apiRequest<{ data: { idItem: number } }>(`/api/mis-actores/${idActor}/portafolio`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(input),
	});
}

export async function eliminarItemPortafolioApi(idActor: number, idItem: number) {
	return apiRequest<{ message: string }>(`/api/mis-actores/${idActor}/portafolio/${idItem}`, {
		method: 'DELETE',
	});
}

export async function agregarEventoApi(
	idActor: number,
	input: { nombre: string; descripcion: string; fecha?: string },
) {
	return apiRequest<{ data: { idEvento: number } }>(`/api/mis-actores/${idActor}/eventos`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(input),
	});
}

export async function eliminarEventoApi(idActor: number, idEvento: number) {
	return apiRequest<{ message: string }>(`/api/mis-actores/${idActor}/eventos/${idEvento}`, {
		method: 'DELETE',
	});
}
