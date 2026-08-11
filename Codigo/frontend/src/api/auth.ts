import { apiRequest } from './client';

export type RegistrarUsuarioPayload = {
	nombre: string;
	apellido: string;
	genero: 'F' | 'M' | 'X';
	fechaNacimiento: string;
	nacionalidad: string;
	email: string;
	contraseña: string;
	CUIL: string;
	actividadesArcaCodigo?: string | null;
	documentoIdentidad: string;
};

export type UsuarioSession = {
	idUsuario: number;
	nombre: string;
	apellido: string;
	email: string;
	genero: 'F' | 'M' | 'X';
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

export type LoginPayload = {
	email: string;
	contraseña: string;
};

export type LoginResponse = {
	usuario: UsuarioSession;
	mensaje: string;
};

export async function registrarUsuarioApi(data: RegistrarUsuarioPayload): Promise<UsuarioRegistradoResponse> {
	return apiRequest<UsuarioRegistradoResponse>('/api/publico/auth/registro', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	});
}

export async function loginApi(data: LoginPayload): Promise<LoginResponse> {
	return apiRequest<LoginResponse>('/api/publico/auth/login', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	});
}

export async function obtenerActividadesArcaApi(): Promise<ActividadArca[]> {
	const res = await apiRequest<ObtenerActividadesArcaResponse>('/api/publico/auth/actividades-arca');
	return res.actividades;
}
