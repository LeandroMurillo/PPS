import type { GeneroCodigo } from '../constants/generos';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { firebaseAuth } from '../config/firebase';
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
	const user = firebaseAuth.currentUser;
	if (!user?.email) {
		throw new Error('No hay una identidad de Firebase activa. Volvé a iniciar sesión.');
	}

	if (!user.providerData.some((provider) => provider.providerId === 'password')) {
		throw new Error('La contraseña de una cuenta Google se administra desde Google.');
	}

	const credential = EmailAuthProvider.credential(user.email, data.contraseñaActual);
	await reauthenticateWithCredential(user, credential);
	await updatePassword(user, data.nuevaContraseña);

	return { mensaje: 'Contraseña actualizada correctamente.' };
}

export async function eliminarCuentaUsuarioApi(): Promise<EliminarCuentaResponse> {
	return apiRequest<EliminarCuentaResponse>('/api/usuario/cuenta', {
		method: 'DELETE',
	});
}
