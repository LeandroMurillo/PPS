import { apiFetch, appendOptionalParam } from './client';

export type SortDirection = 'ASC' | 'DESC';

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
	categoria: { id: number; nombre: string; estado: 'A' | 'I' };
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
