import crypto from 'node:crypto';

import { registrarUsuarioRepository } from './auth.repository.js';
import type { RegistrarUsuarioBody, RegistroUsuarioResponse } from './auth.schemas.js';

export function hashPassword(password: string): string {
	const salt = crypto.randomBytes(16).toString('hex');
	const hash = crypto.scryptSync(password, salt, 32).toString('hex');
	return `${salt}:${hash}`;
}

export async function registrarUsuarioService(
	input: RegistrarUsuarioBody,
): Promise<RegistroUsuarioResponse> {
	const contraseñaHash = hashPassword(input.contraseña);

	const usuario = await registrarUsuarioRepository({
		nombre: input.nombre,
		apellido: input.apellido,
		genero: input.genero,
		fechaNacimiento: input.fechaNacimiento,
		nacionalidad: input.nacionalidad,
		email: input.email,
		CUIL: input.CUIL,
		actividadesArcaCodigo: input.actividadesArcaCodigo,
		contraseñaHash,
	});

	return {
		usuario,
		mensaje:
			'Usuario registrado correctamente. Se ha enviado un correo electrónico para la activación de la cuenta.',
	};
}
