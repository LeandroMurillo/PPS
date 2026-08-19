import type { GeneroCodigo } from '../constants/generos';
import { apiRequest } from './client';

export type RegistrarUsuarioPayload = {
	nombre: string;
	apellido: string;
	genero: GeneroCodigo;
	fechaNacimiento: string;
	nacionalidad: string;
	CUIL: string;
	actividadesArcaCodigo?: string | null;
	documentoIdentidad: string;
};

export type UsuarioSession = {
	idUsuario: number;
	nombre: string;
	apellido: string;
	email: string;
	genero: GeneroCodigo;
	fechaNacimiento: string;
	nacionalidad: string;
	CUIL: string;
	actividadesArcaCodigo: string | null;
	fotoDniUrl?: string | null;
	rol: 'USUARIO' | 'MODERADOR' | 'ADMIN';
	estado: 'A' | 'P' | 'I';
	fechaRegistro: string;
};

export type ActividadArca = {
	codigo: string;
	descripcion: string;
};

export type ObtenerActividadesArcaResponse = {
	actividades: ActividadArca[];
};

export type UsuarioRegistradoResponse = {
	usuario: UsuarioSession;
	mensaje: string;
};

export type LoginResponse = {
	usuario: UsuarioSession;
	token: string;
	mensaje: string;
};

export async function registrarUsuarioApi(data: RegistrarUsuarioPayload): Promise<UsuarioRegistradoResponse> {
	return apiRequest<UsuarioRegistradoResponse>('/api/publico/auth/registro', {
		method: 'POST',
		authMode: 'firebase',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	});
}

export async function crearSesionFirebaseApi(): Promise<LoginResponse> {
	return apiRequest<LoginResponse>('/api/publico/auth/firebase/session', {
		method: 'POST',
		authMode: 'firebase',
	});
}

export async function obtenerActividadesArcaApi(): Promise<ActividadArca[]> {
	const res = await apiRequest<ObtenerActividadesArcaResponse>('/api/publico/auth/actividades-arca', {
		authMode: 'none',
	});
	return res.actividades;
}
