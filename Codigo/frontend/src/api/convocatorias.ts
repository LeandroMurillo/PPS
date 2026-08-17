import { apiFetch, apiRequest, appendOptionalParam } from './client';

export interface Convocatoria {
	idConvocatoria: number;
	titulo: string;
	descripcion: string;
	fechaCreacion: string;
	fechaCierre: string;
	totalPostulaciones: number;
	estado?: 'ABIERTA' | 'CERRADA';
}

export interface PostulacionUsuario {
	idConvocatoria: number;
	idActor: number;
	nombreActor: string;
	fechaPostulacion: string;
}

export interface PostulanteDetalle {
	idActor: number;
	fechaPostulacion: string;
	nombreActor: string;
	fotoPerfilUrl: string | null;
	estadoActor: 'A' | 'P' | 'I';
	categoria: string;
	subcategoria: string | null;
	departamento: string | null;
	localidad: string | null;
	responsableNombre: string | null;
	responsableApellido: string | null;
	responsableEmail: string | null;
}

export interface ListarConvocatoriasActivasResponse {
	data: Convocatoria[];
	postulacionesUsuario: PostulacionUsuario[];
}

export interface ListarConvocatoriasAdminResponse {
	data: Convocatoria[];
	total: number;
}

export interface ConvocatoriaDetalleResponse {
	data: Convocatoria;
	postulantes: PostulanteDetalle[];
}

export interface CrearConvocatoriaInput {
	titulo: string;
	descripcion: string;
	fechaCierre: string;
}

export interface EditarConvocatoriaInput {
	titulo: string;
	descripcion: string;
	fechaCierre: string;
}

export interface ListarConvocatoriasAdminQuery {
	busqueda?: string;
	estado?: 'TODAS' | 'ABIERTA' | 'CERRADA';
	limit?: number;
	offset?: number;
}

// --- Endpoints Usuario / Público ---

export async function listarConvocatoriasActivasApi(signal?: AbortSignal): Promise<ListarConvocatoriasActivasResponse> {
	return apiFetch<ListarConvocatoriasActivasResponse>('/api/convocatorias', signal);
}

export async function obtenerConvocatoriaDetalleApi(
	id: number,
	signal?: AbortSignal,
): Promise<ConvocatoriaDetalleResponse> {
	return apiFetch<ConvocatoriaDetalleResponse>(`/api/convocatorias/${id}`, signal);
}

export async function postularActorApi(idConvocatoria: number, idActor: number): Promise<{ mensaje: string }> {
	return apiRequest<{ mensaje: string }>(`/api/convocatorias/${idConvocatoria}/postular`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ idActor }),
	});
}

export async function cancelarPostulacionApi(idConvocatoria: number, idActor: number): Promise<{ mensaje: string }> {
	return apiRequest<{ mensaje: string }>(`/api/convocatorias/${idConvocatoria}/postulaciones/${idActor}`, {
		method: 'DELETE',
	});
}

// --- Endpoints Administración ---

export async function listarConvocatoriasAdminApi(
	query?: ListarConvocatoriasAdminQuery,
	signal?: AbortSignal,
): Promise<ListarConvocatoriasAdminResponse> {
	const params = new URLSearchParams();
	if (query) {
		appendOptionalParam(params, 'busqueda', query.busqueda);
		appendOptionalParam(params, 'estado', query.estado);
		appendOptionalParam(params, 'limit', query.limit);
		appendOptionalParam(params, 'offset', query.offset);
	}
	const queryString = params.toString();
	const path = queryString ? `/api/admin/convocatorias?${queryString}` : '/api/admin/convocatorias';
	return apiFetch<ListarConvocatoriasAdminResponse>(path, signal);
}

export async function crearConvocatoriaAdminApi(
	data: CrearConvocatoriaInput,
): Promise<{ mensaje: string; data: Convocatoria }> {
	return apiRequest<{ mensaje: string; data: Convocatoria }>('/api/admin/convocatorias', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
}

export async function editarConvocatoriaAdminApi(
	id: number,
	data: EditarConvocatoriaInput,
): Promise<{ mensaje: string; data: Convocatoria }> {
	return apiRequest<{ mensaje: string; data: Convocatoria }>(`/api/admin/convocatorias/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
}

export async function eliminarConvocatoriaAdminApi(id: number): Promise<{ mensaje: string }> {
	return apiRequest<{ mensaje: string }>(`/api/admin/convocatorias/${id}`, {
		method: 'DELETE',
	});
}
