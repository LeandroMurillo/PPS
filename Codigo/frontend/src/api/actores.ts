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
	direccion: string;
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
	cuit?: string | null;
	tipoActor?: 'INDIVIDUO' | 'COLECTIVO' | 'ESPACIO' | null;
	estado?: 'A' | 'P' | 'I';
	categoria: string;
	categoriaIcono: CategoriaIcono;
	subcategoria: string | null;
	dueno?: {
		id: number;
		nombre: string;
		email: string;
	} | null;
	ubicacion: {
		provincia?: string;
		departamento: string;
		localidad: string | null;
		esPublica: boolean;
		direccion: string | null;
		latitud: number | null;
		longitud: number | null;
	};
	portafolio: {
		id?: number;
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
		tipoDato?: string | null;
		publica?: boolean;
	}[];
	integrantes: {
		id?: number;
		nombre: string;
		apellido?: string;
		email?: string;
		rol: string | null;
		esDueno?: boolean;
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
		esPublica?: boolean;
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

export type OpcionSubcategoriaRegistro = {
	id: number;
	nombre: string;
};

export type OpcionCategoriaRegistro = {
	id: number;
	nombre: string;
	icono: CategoriaIcono;
	subcategorias: OpcionSubcategoriaRegistro[];
};

export type TipoPreguntaFormulario =
	| 'TEXTO'
	| 'NUMERO'
	| 'BOOLEANO'
	| 'FECHA'
	| 'URL'
	| 'EMAIL'
	| 'TELEFONO'
	| 'OPCION_UNICA'
	| 'OPCION_MULTIPLE'
	| 'OPCION_MULTIPLE_CHIPS'
	| 'TAGS';

export type PreguntaFormularioAplicable = {
	id: number;
	pregunta: string;
	tipoDato: TipoPreguntaFormulario;
	opciones: string[] | null;
	orden: number;
	esObligatorio: boolean;
	esPublico: boolean;
};

export type FormularioAplicable = {
	id: number;
	ambito: 'CATEGORIA' | 'SUBCATEGORIA';
	idCategoria: number;
	categoria: string;
	idSubcategoria: number | null;
	subcategoria: string | null;
	titulo: string;
	descripcion: string | null;
	preguntas: PreguntaFormularioAplicable[];
};

export async function obtenerOpcionesRegistroApi(signal?: AbortSignal) {
	return apiFetch<{ data: OpcionCategoriaRegistro[] }>('/api/mis-actores/opciones-registro', signal);
}

export async function obtenerFormulariosAplicablesApi(
	input: { idCategoria: number; idSubcategoria?: number | null },
	signal?: AbortSignal,
) {
	const params = new URLSearchParams({ idCategoria: String(input.idCategoria) });
	appendOptionalParam(params, 'idSubcategoria', input.idSubcategoria);

	return apiFetch<{ data: FormularioAplicable[] }>(
		`/api/mis-actores/formularios-aplicables?${params.toString()}`,
		signal,
	);
}

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

export type CrearActorInput = {
	idCategoria: number;
	idSubcategoria?: number | null;
	nombre: string;
	descripcion: string;
	fotoPerfilUrl?: string | null;
	fotoPerfilBase64?: string | null;
	cuit?: string | null;
	tipoActor: 'INDIVIDUO' | 'COLECTIVO' | 'ESPACIO';
	provincia?: string;
	departamento: string;
	localidad: string;
	direccion: string;
	latitud: number;
	longitud: number;
	esPublica: boolean;
	respuestas?: {
		idFormulario: number;
		idPregunta: number;
		valor: string | number | boolean | string[];
	}[];
	portafolio?: {
		tipo: 'IMAGEN' | 'VIDEO' | 'ENLACE';
		titulo: string;
		descripcion?: string | null;
		url?: string | null;
		imagenBase64?: string | null;
	}[];
};

export async function crearMiActorApi(input: CrearActorInput) {
	return apiRequest<{ data: { idActor: number } }>('/api/mis-actores', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(input),
	});
}

export type PreguntaFormularioActor = PreguntaFormularioAplicable & {
	idPregunta?: number;
	valor?: unknown;
};

export type FormularioActor = Omit<FormularioAplicable, 'preguntas'> & {
	idFormulario?: number;
	preguntas: PreguntaFormularioActor[];
};

export async function obtenerFormulariosActorApi(idActor: number, signal?: AbortSignal) {
	return apiFetch<{ data: FormularioActor[] }>(`/api/mis-actores/${idActor}/formularios`, signal);
}

export async function editarMiActorApi(
	idActor: number,
	input: {
		idCategoria: number;
		idSubcategoria?: number | null;
		nombre: string;
		descripcion: string;
		fotoPerfilUrl?: string | null;
		fotoPerfilBase64?: string | null;
		cuit?: string | null;
		tipoActor: 'INDIVIDUO' | 'COLECTIVO' | 'ESPACIO';
		departamento: string;
		localidad: string;
		direccion: string;
		latitud?: number | null;
		longitud?: number | null;
		esPublica?: boolean;
		respuestas?: {
			idFormulario: number;
			idPregunta: number;
			valor: string | number | boolean | string[];
		}[];
	},
) {
	return apiRequest<{ data: { fotoPerfilUrl: string | null }; message: string }>(`/api/mis-actores/${idActor}`, {
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

export type MiActorPortafolioApiItem = {
	id?: number;
	idItem?: number;
	tipo: 'IMAGEN' | 'LINK' | 'RRSS';
	descripcion: string;
	url: string;
};

export async function listarPortafolioApi(idActor: number) {
	return apiFetch<{ data: MiActorPortafolioApiItem[] }>(`/api/mis-actores/${idActor}/portafolio`);
}

export async function agregarItemPortafolioApi(
	idActor: number,
	input: { tipo: 'IMAGEN' | 'LINK' | 'RRSS'; descripcion: string; url?: string; imagenBase64?: string },
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

export type MiActorEventoApiItem = {
	id?: number;
	idEvento?: number;
	nombre: string;
	descripcion: string;
	fecha: string;
};

export async function listarEventosApi(idActor: number) {
	return apiFetch<{ data: MiActorEventoApiItem[] }>(`/api/mis-actores/${idActor}/eventos`);
}

export async function eliminarEventoApi(idActor: number, idEvento: number) {
	return apiRequest<{ message: string }>(`/api/mis-actores/${idActor}/eventos/${idEvento}`, {
		method: 'DELETE',
	});
}

export type IntegranteApiItem = {
	tipo: 'REGISTRADO' | 'NO_REGISTRADO';
	idUsuario: number | null;
	idIntegranteNoRegistrado: number | null;
	nombre: string;
	apellido: string;
	email: string | null;
	rol: string;
	esDueño: boolean;
};

export type IntegranteNoRegistradoInput = {
	nombre: string;
	apellido: string;
	email: string | null;
	rol: string;
};

export async function listarIntegrantesApi(idActor: number) {
	return apiFetch<{ data: IntegranteApiItem[] }>(`/api/mis-actores/${idActor}/integrantes`);
}

export async function agregarIntegranteApi(idActor: number, input: { email: string; rol: string }) {
	return apiRequest<{ message: string }>(`/api/mis-actores/${idActor}/integrantes`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(input),
	});
}

export async function eliminarIntegranteApi(idActor: number, idUsuario: number) {
	return apiRequest<{ message: string }>(`/api/mis-actores/${idActor}/integrantes/${idUsuario}`, {
		method: 'DELETE',
	});
}

export async function editarIntegranteApi(idActor: number, idUsuario: number, input: { rol: string }) {
	return apiRequest<{ message: string }>(`/api/mis-actores/${idActor}/integrantes/${idUsuario}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(input),
	});
}

export async function agregarIntegranteNoRegistradoApi(idActor: number, input: IntegranteNoRegistradoInput) {
	return apiRequest<{ message: string }>(`/api/mis-actores/${idActor}/integrantes-no-registrados`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(input),
	});
}

export async function editarIntegranteNoRegistradoApi(
	idActor: number,
	idIntegranteNoRegistrado: number,
	input: IntegranteNoRegistradoInput,
) {
	return apiRequest<{ message: string }>(
		`/api/mis-actores/${idActor}/integrantes-no-registrados/${idIntegranteNoRegistrado}`,
		{
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input),
		},
	);
}

export async function eliminarIntegranteNoRegistradoApi(idActor: number, idIntegranteNoRegistrado: number) {
	return apiRequest<{ message: string }>(
		`/api/mis-actores/${idActor}/integrantes-no-registrados/${idIntegranteNoRegistrado}`,
		{ method: 'DELETE' },
	);
}
