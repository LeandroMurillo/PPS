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

const DNI_DATA_URL_PATTERN = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=\r\n]+)$/;
const MAX_DNI_BYTES = 5 * 1024 * 1024; // 5 MB

export function saveDniImage(base64Data: string): string | null {
	if (!base64Data || typeof base64Data !== 'string') {
		return null;
	}

	try {
		const match = DNI_DATA_URL_PATTERN.exec(base64Data.trim());
		if (!match?.[1] || !match[2]) {
			return null;
		}

		const buffer = Buffer.from(match[2], 'base64');
		if (buffer.length === 0 || buffer.length > MAX_DNI_BYTES) {
			return null;
		}

		const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
		const uploadsDir = path.join(process.cwd(), 'uploads', 'dni');
		if (!fs.existsSync(uploadsDir)) {
			fs.mkdirSync(uploadsDir, { recursive: true });
		}

		const filename = `dni_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
		const filepath = path.join(uploadsDir, filename);
		fs.writeFileSync(filepath, buffer, { flag: 'wx' });

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
