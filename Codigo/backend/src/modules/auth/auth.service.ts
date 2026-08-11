import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { env } from '../../config/env.js';
import {
	listarActividadesArcaRepository,
	obtenerUsuarioPorEmailRepository,
	registrarUsuarioRepository,
} from './auth.repository.js';
import type {
	ActividadArca,
	LoginBody,
	LoginResponse,
	RegistrarUsuarioBody,
	RegistroUsuarioResponse,
} from './auth.schemas.js';

export function hashPassword(password: string): string {
	const salt = crypto.randomBytes(16).toString('hex');
	const hash = crypto.scryptSync(password, salt, 32).toString('hex');
	return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
	if (storedHash.startsWith('$2b$') || storedHash.startsWith('$2a$')) {
		try {
			return bcrypt.compareSync(password, storedHash);
		} catch {
			return false;
		}
	}

	if (storedHash.includes(':')) {
		const [salt, hash] = storedHash.split(':');
		if (salt && hash) {
			try {
				const calculatedHash = crypto.scryptSync(password, salt, 32).toString('hex');
				return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(calculatedHash));
			} catch {
				return false;
			}
		}
	}

	return password === storedHash;
}

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

export async function registrarUsuarioService(
	input: RegistrarUsuarioBody,
): Promise<RegistroUsuarioResponse> {
	const contraseñaHash = hashPassword(input.contraseña);
	const fotoDniUrl = saveDniImage(input.documentoIdentidad);

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
		fotoDniUrl,
	});

	return {
		usuario,
		mensaje:
			'Usuario registrado correctamente. Se ha enviado un correo electrónico para la activación de la cuenta.',
	};
}

export async function loginService(input: LoginBody): Promise<LoginResponse> {
	const user = await obtenerUsuarioPorEmailRepository(input.email);

	if (!user) {
		throw new Error('CREDENTIALS_INVALID');
	}

	if (user.estado === 'P') {
		throw new Error('ACCOUNT_PENDING');
	}

	if (user.estado !== 'A') {
		throw new Error('ACCOUNT_INACTIVE');
	}

	const isPasswordValid = verifyPassword(input.contraseña, user.contraseña);

	if (!isPasswordValid) {
		throw new Error('CREDENTIALS_INVALID');
	}

	const { contraseña: unusedContraseña, ...usuarioSinContraseña } = user;
	void unusedContraseña;

	const token = jwt.sign(
		{
			idUsuario: user.idUsuario,
			email: user.email,
			rol: user.rol,
			estado: user.estado,
		},
		env.JWT_SECRET,
		{ expiresIn: '24h' },
	);

	return {
		usuario: usuarioSinContraseña,
		token,
		mensaje: 'Inicio de sesión exitoso.',
	};
}

export async function listarActividadesArcaService(): Promise<ActividadArca[]> {
	return listarActividadesArcaRepository();
}
