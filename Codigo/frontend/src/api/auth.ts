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

export type UsuarioRegistradoResponse = {
	usuario: {
		idUsuario: number;
		nombre: string;
		apellido: string;
		email: string;
		genero: 'F' | 'M' | 'X';
		fechaNacimiento: string;
		nacionalidad: string;
		CUIL: string;
		actividadesArcaCodigo: string | null;
		rol: 'USUARIO' | 'MODERADOR' | 'ADMIN';
		estado: 'A' | 'P' | 'I';
		fechaRegistro: string;
	};
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
