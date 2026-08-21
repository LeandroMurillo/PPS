import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import {
	listarActividadesArcaRepository,
	obtenerUsuarioPorIdFirebaseRepository,
	registrarUsuarioRepository,
} from './auth.repository.js';
import { createSessionToken } from './session-token.js';
import type { ActividadArca, LoginResponse, RegistrarUsuarioBody, RegistroUsuarioResponse } from './auth.schemas.js';

export function saveDniImage(base64Data: string): string | null {
	if (!base64Data || typeof base64Data !== 'string') {
		return null;
	}

	try {
		const matches = base64Data.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
		let ext = 'png';
		let base64String = base64Data;

		if (matches && matches.length === 3) {
			ext = matches[1] === 'jpeg' ? 'jpg' : matches[1]!;
			base64String = matches[2]!;
		} else if (base64Data.includes('base64,')) {
			base64String = base64Data.split('base64,')[1]!;
		}

		const buffer = Buffer.from(base64String, 'base64');
		if (buffer.length === 0) {
			return null;
		}

		const uploadsDir = path.join(process.cwd(), 'uploads', 'dni');
		if (!fs.existsSync(uploadsDir)) {
			fs.mkdirSync(uploadsDir, { recursive: true });
		}

		const filename = `dni_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
		const filepath = path.join(uploadsDir, filename);
		fs.writeFileSync(filepath, buffer);

		return `/uploads/dni/${filename}`;
	} catch {
		return null;
	}
}

export type FirebaseIdentity = {
	uid: string;
	email: string;
	emailVerified: boolean;
};

export async function registrarUsuarioService(
	input: RegistrarUsuarioBody,
	identity: FirebaseIdentity,
): Promise<RegistroUsuarioResponse> {
	if (!identity.emailVerified) {
		throw new Error('EMAIL_NOT_VERIFIED');
	}

	const fotoDniUrl = saveDniImage(input.documentoIdentidad);

	const usuario = await registrarUsuarioRepository({
		idFirebase: identity.uid,
		email: identity.email,
		nombre: input.nombre,
		apellido: input.apellido,
		genero: input.genero,
		fechaNacimiento: input.fechaNacimiento,
		nacionalidad: input.nacionalidad,
		CUIL: input.CUIL,
		actividadesArcaCodigo: input.actividadesArcaCodigo,
		fotoDniUrl,
	});

	return {
		usuario,
		mensaje: 'Registro completado exitosamente. Ya podés iniciar sesión.',
	};
}

export async function crearSesionFirebaseService(identity: FirebaseIdentity): Promise<LoginResponse> {
	if (!identity.emailVerified) {
		throw new Error('EMAIL_NOT_VERIFIED');
	}

	const user = await obtenerUsuarioPorIdFirebaseRepository(identity.uid);

	if (!user) {
		throw new Error('PROFILE_INCOMPLETE');
	}

	if (user.estado === 'P') {
		throw new Error('ACCOUNT_PENDING');
	}

	if (user.estado !== 'A') {
		throw new Error('ACCOUNT_INACTIVE');
	}

	const token = createSessionToken(user.idUsuario);

	return {
		usuario: user,
		token,
		mensaje: 'Inicio de sesión exitoso.',
	};
}

export async function listarActividadesArcaService(): Promise<ActividadArca[]> {
	return listarActividadesArcaRepository();
}
