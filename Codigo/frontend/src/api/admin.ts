import { apiFetch, apiRequest, appendOptionalParam } from './client';

export type SortDirection = 'ASC' | 'DESC';

export type CategoriaIcono =
	| 'Category'
	| 'MusicNote'
	| 'Handyman'
	| 'TheaterComedy'
	| 'Movie'
	| 'MenuBook'
	| 'Palette';

export type AdminPagination = {
	total: number;
	count: number;
	limit: number;
	offset: number;
	hasNext: boolean;
};

export type UsuarioAdmin = {
	id: number;
	actividadArcaCodigo: string | null;
	actividadArca: string | null;
	nombre: string;
	apellido: string;
	cuil: string;
	genero: 'F' | 'M' | 'X';
	fechaNacimiento: string;
	nacionalidad: string;
	email: string;
	fechaRegistro: string;
	rol: 'USUARIO' | 'MODERADOR' | 'ADMIN';
	estado: 'A' | 'P' | 'I';
};

export type CategoriaModeracionAdmin = {
	id: number;
	nombre: string;
	icono: CategoriaIcono;
	asignada: boolean;
};

export type UsuarioDetalleAdmin = UsuarioAdmin & {
	categoriasModeracion: CategoriaModeracionAdmin[];
};

export type UsuarioAdminSortBy =
	| 'idUsuario'
	| 'actividadesArcaCodigo'
	| 'actividadArca'
	| 'nombre'
	| 'apellido'
	| 'CUIL'
	| 'nacionalidad'
	| 'email'
	| 'rol'
	| 'estado'
	| 'fechaRegistro';

export type ActorAdminSortBy =
	| 'idActor'
	| 'nombre'
	| 'cuit'
	| 'tipoActor'
	| 'fechaCreacion'
	| 'estado'
	| 'categoria'
	| 'subcategoria'
	| 'usuarioDueno'
	| 'departamento'
	| 'localidad';

export type ActorAdmin = {
	id: number;
	nombre: string;
	descripcion: string;
	foto: string | null;
	cuit: string | null;
	tipoActor: 'INDIVIDUO' | 'COLECTIVO' | 'ESPACIO';
	fechaCreacion: string;
	estado: 'A' | 'P' | 'I';
	categoria: { id: number; nombre: string; icono: CategoriaIcono; estado: 'A' | 'I' };
	subcategoria: { id: number; nombre: string; estado: 'A' | 'I' } | null;
	dueno: { id: number; nombre: string; email: string } | null;
	ubicacion: {
		id: number;
		provincia: string;
		departamento: string;
		localidad: string;
		direccion: string;
		latitud: number;
		longitud: number;
		esPublica: boolean;
	};
};

export type CategoriaAdmin = {
	id: number;
	nombre: string;
	icono: CategoriaIcono;
	estado: 'A' | 'I';
	subcategoria: string | null;
	cantidadActores: number;
};

export type CategoriaAdminSortBy =
	| 'idCategoria'
	| 'nombre'
	| 'icono'
	| 'estado'
	| 'subcategoria'
	| 'cantidadActores';

type PageResponse<T> = {
	data: T[];
	pagination: AdminPagination;
};

export async function listarUsuariosAdmin(
	input: {
		busqueda?: string;
		rol?: UsuarioAdmin['rol'];
		estado?: UsuarioAdmin['estado'];
		limit: number;
		offset: number;
		sortBy: UsuarioAdminSortBy;
		sortDir: SortDirection;
	},
	signal?: AbortSignal,
) {
	const params = new URLSearchParams();
	Object.entries(input).forEach(([key, value]) => appendOptionalParam(params, key, value));

	return apiFetch<PageResponse<UsuarioAdmin>>(`/api/admin/usuarios?${params.toString()}`, signal);
}

export async function listarActoresAdmin(
	input: {
		busqueda?: string;
		idCategoria?: number;
		idUsuarioDueno?: number;
		limit: number;
		offset: number;
		sortBy: ActorAdminSortBy;
		sortDir: SortDirection;
	},
	signal?: AbortSignal,
) {
	const params = new URLSearchParams();
	Object.entries(input).forEach(([key, value]) => appendOptionalParam(params, key, value));

	return apiFetch<PageResponse<ActorAdmin>>(`/api/admin/actores?${params.toString()}`, signal);
}

export async function obtenerUsuarioAdmin(id: number | string, signal?: AbortSignal) {
	return apiFetch<{ data: UsuarioDetalleAdmin }>(`/api/admin/usuarios/${id}`, signal);
}

export async function cambiarEstadoUsuarioAdmin(id: number, estado: 'A' | 'I') {
	return apiRequest<{ data: UsuarioDetalleAdmin }>(`/api/admin/usuarios/${id}/estado`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ estado }),
	});
}

export async function asignarModeradorAdmin(id: number, idCategorias: number[]) {
	return apiRequest<{ data: UsuarioDetalleAdmin }>(`/api/admin/usuarios/${id}/moderacion`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ idCategorias }),
	});
}

export async function listarCategoriasAdmin(
	input: {
		busqueda?: string;
		estado?: CategoriaAdmin['estado'];
		limit: number;
		offset: number;
		sortBy: CategoriaAdminSortBy;
		sortDir: SortDirection;
	},
	signal?: AbortSignal,
) {
	const params = new URLSearchParams();
	Object.entries(input).forEach(([key, value]) => appendOptionalParam(params, key, value));

	return apiFetch<PageResponse<CategoriaAdmin>>(`/api/admin/categorias?${params.toString()}`, signal);
}

export async function obtenerCategoriaAdmin(id: number | string, signal?: AbortSignal) {
	return apiFetch<{ data: CategoriaAdmin }>(`/api/admin/categorias/${id}`, signal);
}

export async function crearCategoriaAdmin(data: Pick<CategoriaAdmin, 'nombre' | 'icono' | 'estado'>) {
	return apiRequest<{ data: CategoriaAdmin }>('/api/admin/categorias', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
}

export async function editarCategoriaAdmin(
	id: number | string,
	data: Pick<CategoriaAdmin, 'nombre' | 'icono' | 'estado'>,
) {
	return apiRequest<{ data: CategoriaAdmin }>(`/api/admin/categorias/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
}

export async function eliminarCategoriaAdmin(id: number | string) {
	return apiRequest<{ data: CategoriaAdmin }>(`/api/admin/categorias/${id}`, {
		method: 'DELETE',
	});
}
