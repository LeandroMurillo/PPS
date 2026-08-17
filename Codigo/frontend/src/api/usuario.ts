import type { GeneroCodigo } from '../constants/generos';
import type { UsuarioSession } from './auth';
import { apiRequest } from './client';

export type PerfilUsuarioData = UsuarioSession & {
	actividadArca?: string | null;
	actoresDuenoCount?: number;
};

export type ObtenerPerfilUsuarioResponse = {
	data: PerfilUsuarioData;
};

export type ActualizarPerfilPayload = {
	nombre: string;
	apellido: string;
	genero: GeneroCodigo;
	fechaNacimiento: string;
	nacionalidad: string;
	CUIL: string;
	actividadesArcaCodigo?: string | null;
	documentoIdentidad?: string;
};

export type ActualizarPerfilResponse = {
	data: PerfilUsuarioData;
	mensaje: string;
};

export type CambiarContrasenaPayload = {
	contraseñaActual: string;
	nuevaContraseña: string;
};

export type CambiarContrasenaResponse = {
	mensaje: string;
};

export type EliminarCuentaResponse = {
	mensaje: string;
	actoresEliminadosCount: number;
	archivosEliminadosCount: number;
	archivosNoEliminadosCount: number;
};

export async function obtenerPerfilUsuarioApi(): Promise<PerfilUsuarioData> {
	const res = await apiRequest<ObtenerPerfilUsuarioResponse>('/api/usuario/perfil');
	return res.data;
}

export async function actualizarPerfilUsuarioApi(data: ActualizarPerfilPayload): Promise<ActualizarPerfilResponse> {
	return apiRequest<ActualizarPerfilResponse>('/api/usuario/perfil', {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	});
}

export async function cambiarContrasenaUsuarioApi(data: CambiarContrasenaPayload): Promise<CambiarContrasenaResponse> {
	return apiRequest<CambiarContrasenaResponse>('/api/usuario/contrasena', {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	});
}

export async function eliminarCuentaUsuarioApi(): Promise<EliminarCuentaResponse> {
	return apiRequest<EliminarCuentaResponse>('/api/usuario/cuenta', {
		method: 'DELETE',
	});
}
