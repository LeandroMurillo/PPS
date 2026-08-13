import { apiFetch, apiRequest, appendOptionalParam } from './client';
import type { CategoriaIcono } from '../components/categoryIcon';

export type { CategoriaIcono };

export type SortDirection = 'ASC' | 'DESC';

export type AdminPagination = {
	total: number;
	count: number;
	limit: number;
	offset: number;
	hasNext: boolean;
};

import type { GeneroCodigo } from '../constants/generos';

export type UsuarioAdmin = {
	id: number;
	actividadArcaCodigo: string | null;
	actividadArca: string | null;
	nombre: string;
	apellido: string;
	cuil: string;
	genero: GeneroCodigo;
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

export type ActorDetalleAdmin = ActorAdmin & {
	integrantes: {
		id: number;
		nombre: string;
		email: string;
		rol: string;
		esDueno: boolean;
	}[];
	portafolio: {
		id: number;
		tipo: 'IMAGEN' | 'LINK' | 'RRSS';
		descripcion: string;
		url: string;
		fechaCreacion: string;
	}[];
	encuestas: {
		id: number;
		tipo: 'categoria' | 'subcategoria';
		ambito: string;
		titulo: string;
		descripcion: string | null;
		secciones: {
			titulo: string;
			respuestas: {
				id: number;
				pregunta: string;
				tipoDato:
					| 'TEXTO'
					| 'NUMERO'
					| 'BOOLEANO'
					| 'FECHA'
					| 'URL'
					| 'EMAIL'
					| 'TELEFONO'
					| 'OPCION_UNICA'
					| 'OPCION_MULTIPLE';
				opciones: string[] | null;
				respuesta: string | string[] | null;
				obligatoria: boolean;
				publica: boolean;
			}[];
		}[];
	}[];
};

export type CategoriaAdmin = {
	id: number;
	nombre: string;
	icono: CategoriaIcono;
	estado: 'A' | 'I';
	cantidadSubcategorias: number;
	cantidadActores: number;
};

export type CategoriaAdminSortBy =
	'idCategoria' | 'nombre' | 'icono' | 'estado' | 'cantidadSubcategorias' | 'cantidadActores';

export type SubcategoriaAdmin = {
	idCategoria: number;
	id: number;
	nombre: string;
	estado: 'A' | 'I';
	cantidadActores: number;
};

export type SubcategoriaAdminSortBy = 'idSubcategoria' | 'nombre' | 'estado' | 'cantidadActores';

export type TipoPreguntaAdmin =
	'TEXTO' | 'NUMERO' | 'BOOLEANO' | 'FECHA' | 'URL' | 'EMAIL' | 'TELEFONO' | 'OPCION_UNICA' | 'OPCION_MULTIPLE';

export type PreguntaBancoAdmin = {
	id: number;
	pregunta: string;
	tipoDato: TipoPreguntaAdmin;
	opciones: string[] | null;
};

export type PreguntaFormularioAdmin = {
	id: number;
	pregunta: string;
	tipoDato: TipoPreguntaAdmin;
	opciones: string[] | null;
	idPreguntaReemplazada: number | null;
	preguntaReemplazada: string | null;
	orden: number;
	esObligatorio: boolean;
	esPublico: boolean;
	fechaIncorporacion: string;
	fechaDesactivacion: string | null;
	estado: 'A' | 'I';
	cantidadActoresQueRespondieron: number;
};

export type FormularioAdmin = {
	id: number;
	idCategoria: number;
	categoria: string;
	estadoCategoria: 'A' | 'I';
	idSubcategoria: number | null;
	subcategoria: string | null;
	estadoSubcategoria: 'A' | 'I' | null;
	ambito: 'CATEGORIA' | 'SUBCATEGORIA';
	titulo: string;
	descripcion: string | null;
	fechaCreacion: string;
	cantidadPreguntasHistoricas: number;
	cantidadPreguntasActivas: number;
	cantidadActoresConRespuestas: number;
	preguntas: PreguntaFormularioAdmin[];
};

export type GuardarFormularioAdmin = { titulo: string; descripcion: string | null };

export type CrearPreguntaFormularioAdmin = {
	pregunta: string;
	tipoDato: TipoPreguntaAdmin;
	opciones: string[] | null;
	orden: number | null;
	esObligatorio: boolean;
	esPublico: boolean;
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
		departamento?: string;
		tipoActor?: ActorAdmin['tipoActor'];
		estado?: ActorAdmin['estado'];
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

export async function obtenerActorAdmin(id: number | string, signal?: AbortSignal) {
	return apiFetch<{ data: ActorDetalleAdmin }>(`/api/admin/actores/${id}`, signal);
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

export async function cambiarEstadoActoresAdmin(ids: number[], estado: 'A' | 'I') {
	return apiRequest<{ data: { actualizados: number } }>('/api/admin/actores/estado', {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ ids, estado }),
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

export async function listarSubcategoriasAdmin(
	idCategoria: number | string,
	input: {
		busqueda?: string;
		estado?: SubcategoriaAdmin['estado'];
		limit: number;
		offset: number;
		sortBy: SubcategoriaAdminSortBy;
		sortDir: SortDirection;
	},
	signal?: AbortSignal,
) {
	const params = new URLSearchParams();
	Object.entries(input).forEach(([key, value]) => appendOptionalParam(params, key, value));

	return apiFetch<PageResponse<SubcategoriaAdmin>>(
		`/api/admin/categorias/${idCategoria}/subcategorias?${params.toString()}`,
		signal,
	);
}

export async function obtenerSubcategoriaAdmin(
	idCategoria: number | string,
	id: number | string,
	signal?: AbortSignal,
) {
	return apiFetch<{ data: SubcategoriaAdmin }>(`/api/admin/categorias/${idCategoria}/subcategorias/${id}`, signal);
}

export async function crearSubcategoriaAdmin(
	idCategoria: number | string,
	data: Pick<SubcategoriaAdmin, 'nombre' | 'estado'>,
) {
	return apiRequest<{ data: SubcategoriaAdmin }>(`/api/admin/categorias/${idCategoria}/subcategorias`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
}

export async function editarSubcategoriaAdmin(
	idCategoria: number | string,
	id: number | string,
	data: Pick<SubcategoriaAdmin, 'nombre' | 'estado'>,
) {
	return apiRequest<{ data: SubcategoriaAdmin }>(`/api/admin/categorias/${idCategoria}/subcategorias/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
}

export async function eliminarSubcategoriaAdmin(idCategoria: number | string, id: number | string) {
	return apiRequest<{ data: SubcategoriaAdmin }>(`/api/admin/categorias/${idCategoria}/subcategorias/${id}`, {
		method: 'DELETE',
	});
}

function formularioCategoriaPath(idCategoria: number | string) {
	return `/api/admin/categorias/${idCategoria}/formulario`;
}

function formularioSubcategoriaPath(idCategoria: number | string, idSubcategoria: number | string) {
	return `/api/admin/categorias/${idCategoria}/subcategorias/${idSubcategoria}/formulario`;
}

export async function obtenerFormularioCategoriaAdmin(idCategoria: number | string, signal?: AbortSignal) {
	return apiFetch<{ data: FormularioAdmin | null }>(formularioCategoriaPath(idCategoria), signal);
}

export async function guardarFormularioCategoriaAdmin(
	idCategoria: number | string,
	data: GuardarFormularioAdmin,
	existe: boolean,
) {
	return apiRequest<{ data: FormularioAdmin }>(formularioCategoriaPath(idCategoria), {
		method: existe ? 'PUT' : 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
}

export async function obtenerFormularioSubcategoriaAdmin(
	idCategoria: number | string,
	idSubcategoria: number | string,
	signal?: AbortSignal,
) {
	return apiFetch<{ data: FormularioAdmin | null }>(formularioSubcategoriaPath(idCategoria, idSubcategoria), signal);
}

export async function guardarFormularioSubcategoriaAdmin(
	idCategoria: number | string,
	idSubcategoria: number | string,
	data: GuardarFormularioAdmin,
	existe: boolean,
) {
	return apiRequest<{ data: FormularioAdmin }>(formularioSubcategoriaPath(idCategoria, idSubcategoria), {
		method: existe ? 'PUT' : 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
}

export async function crearPreguntaFormularioAdmin(idFormulario: number | string, data: CrearPreguntaFormularioAdmin) {
	return apiRequest<{ data: FormularioAdmin }>(`/api/admin/formularios/${idFormulario}/preguntas`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
}

export async function desactivarPreguntaFormularioAdmin(idFormulario: number | string, idPregunta: number | string) {
	return apiRequest<{ data: FormularioAdmin }>(`/api/admin/formularios/${idFormulario}/preguntas/${idPregunta}`, {
		method: 'DELETE',
	});
}

export async function listarPreguntasAdmin(busqueda?: string, signal?: AbortSignal) {
	const params = new URLSearchParams();
	appendOptionalParam(params, 'busqueda', busqueda);

	return apiFetch<{ data: PreguntaBancoAdmin[] }>(`/api/admin/preguntas?${params.toString()}`, signal);
}

export async function asociarPreguntaFormularioAdmin(
	idFormulario: number | string,
	data: { idPregunta: number; esObligatorio: boolean; esPublico: boolean },
) {
	return apiRequest<{ data: FormularioAdmin }>(`/api/admin/formularios/${idFormulario}/preguntas/existente`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
}

export async function editarPreguntaAdmin(
	idPregunta: number | string,
	data: { pregunta: string; tipoDato: TipoPreguntaAdmin; opciones?: string[] | null },
) {
	return apiRequest<{ data: PreguntaBancoAdmin }>(`/api/admin/preguntas/${idPregunta}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
}

export async function crearPreguntaBancoAdmin(data: CrearPreguntaFormularioAdmin) {
	return apiRequest<{ data: PreguntaBancoAdmin }>('/api/admin/preguntas', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
}

export async function reemplazarPreguntaFormularioAdmin(
	idFormulario: number | string,
	idPregunta: number | string,
	data: { idPreguntaNueva: number; esObligatorio?: boolean; esPublico?: boolean },
) {
	return apiRequest<{ data: FormularioAdmin }>(
		`/api/admin/formularios/${idFormulario}/preguntas/${idPregunta}/reemplazar`,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
		},
	);
}
