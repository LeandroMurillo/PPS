import { hashPassword, verifyPassword, saveDniImage } from '../auth/auth.service.js';
import {
	actualizarContraseñaUsuarioRepository,
	actualizarPerfilUsuarioRepository,
	eliminarCuentaUsuarioRepository,
	obtenerPerfilUsuarioRepository,
} from './usuario.repository.js';
import type { ActualizarPerfilBody, CambiarContraseñaBody, PerfilUsuario } from './usuario.schemas.js';

export async function obtenerPerfilUsuarioService(idUsuario: number): Promise<PerfilUsuario> {
	const user = await obtenerPerfilUsuarioRepository(idUsuario);
	if (!user) {
		throw new Error('USUARIO_NO_ENCONTRADO');
	}

	const { contraseña: _unused, ...perfilSinContraseña } = user;
	void _unused;
	return perfilSinContraseña;
}

export async function actualizarPerfilUsuarioService(
	idUsuario: number,
	input: ActualizarPerfilBody,
): Promise<PerfilUsuario> {
	const existingUser = await obtenerPerfilUsuarioRepository(idUsuario);
	if (!existingUser) {
		throw new Error('USUARIO_NO_ENCONTRADO');
	}

	let fotoDniUrl: string | null = null;
	if (input.documentoIdentidad) {
		fotoDniUrl = saveDniImage(input.documentoIdentidad);
	}

	const updated = await actualizarPerfilUsuarioRepository(idUsuario, {
		nombre: input.nombre,
		apellido: input.apellido,
		genero: input.genero,
		fechaNacimiento: input.fechaNacimiento,
		nacionalidad: input.nacionalidad,
		CUIL: input.CUIL,
		actividadesArcaCodigo: input.actividadesArcaCodigo,
		...(fotoDniUrl ? { fotoDniUrl } : {}),
	});

	if (!updated) {
		throw new Error('ERROR_ACTUALIZAR_USUARIO');
	}

	const { contraseña: _unused, ...perfilSinContraseña } = updated;
	void _unused;
	return perfilSinContraseña;
}

export async function cambiarContraseñaUsuarioService(
	idUsuario: number,
	input: CambiarContraseñaBody,
): Promise<{ mensaje: string }> {
	const user = await obtenerPerfilUsuarioRepository(idUsuario);
	if (!user) {
		throw new Error('USUARIO_NO_ENCONTRADO');
	}

	const isCurrentValid = verifyPassword(input.contraseñaActual, user.contraseña);
	if (!isCurrentValid) {
		throw new Error('PASSWORD_CURRENT_INVALID');
	}

	const nuevaHash = hashPassword(input.nuevaContraseña);
	await actualizarContraseñaUsuarioRepository(idUsuario, nuevaHash);

	return {
		mensaje: 'Contraseña actualizada correctamente.',
	};
}

export async function eliminarCuentaUsuarioService(
	idUsuario: number,
): Promise<{ mensaje: string; actoresEliminadosCount: number }> {
	const user = await obtenerPerfilUsuarioRepository(idUsuario);
	if (!user) {
		throw new Error('USUARIO_NO_ENCONTRADO');
	}

	const result = await eliminarCuentaUsuarioRepository(idUsuario);

	return {
		mensaje: 'Tu cuenta y todos tus actores asociados han sido eliminados correctamente.',
		actoresEliminadosCount: result.actoresEliminadosCount,
	};
}
