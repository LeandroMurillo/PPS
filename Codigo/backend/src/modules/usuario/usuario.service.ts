import { saveDniImage } from '../auth/auth.service.js';
import {
	actualizarPerfilUsuarioRepository,
	eliminarCuentaUsuarioRepository,
	obtenerPerfilUsuarioRepository,
} from './usuario.repository.js';
import type { ActualizarPerfilBody, PerfilUsuario } from './usuario.schemas.js';
import { eliminarArchivosPersonalesUsuario } from './usuario-files.service.js';

export async function obtenerPerfilUsuarioService(idUsuario: number): Promise<PerfilUsuario> {
	const user = await obtenerPerfilUsuarioRepository(idUsuario);
	if (!user) {
		throw new Error('USUARIO_NO_ENCONTRADO');
	}

	return user;
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

	return updated;
}

export async function eliminarCuentaUsuarioService(idUsuario: number): Promise<{
	mensaje: string;
	actoresEliminadosCount: number;
	archivosEliminadosCount: number;
	archivosNoEliminadosCount: number;
}> {
	const user = await obtenerPerfilUsuarioRepository(idUsuario);
	if (!user) {
		throw new Error('USUARIO_NO_ENCONTRADO');
	}

	const result = await eliminarCuentaUsuarioRepository(idUsuario);
	const filesResult = eliminarArchivosPersonalesUsuario(result.archivos);
	const archivosNoEliminadosCount = filesResult.fallidos;

	return {
		mensaje:
			archivosNoEliminadosCount === 0
				? 'Tu cuenta, tus actores asociados y sus archivos personales han sido eliminados correctamente.'
				: `Tu cuenta fue eliminada, pero ${archivosNoEliminadosCount} archivo(s) personal(es) no pudieron eliminarse físicamente.`,
		actoresEliminadosCount: result.actoresEliminadosCount,
		archivosEliminadosCount: filesResult.eliminados,
		archivosNoEliminadosCount,
	};
}
