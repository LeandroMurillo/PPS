import { Router } from 'express';
import { db } from '../db';
import type { UsuarioMock } from '../types';

export const authRouter = Router();

type DecodedIdentity = {
	uid?: string;
	email?: string;
	name?: string;
};

export function parseTokenIdentity(authHeader?: string): DecodedIdentity | null {
	if (!authHeader) return null;
	const token = authHeader.replace(/^Bearer\s+/i, '').trim();
	if (!token) return null;

	if (token.startsWith('mock-token-')) {
		const match = token.match(/mock-token-(\d+)/);
		if (match) {
			const u = db.usuarios.find((user) => user.id === Number(match[1]));
			if (u)
				return { uid: u.firebaseUid ?? `mock-uid-${u.id}`, email: u.email, name: `${u.nombre} ${u.apellido}` };
		}
	}

	const parts = token.split('.');
	if (parts.length === 3) {
		try {
			const payload = JSON.parse(Buffer.from(parts[1]!, 'base64url').toString('utf8'));
			return {
				uid: payload.user_id || payload.sub || payload.uid,
				email: payload.email ? String(payload.email).toLowerCase() : undefined,
				name: payload.name,
			};
		} catch {
			// ignore
		}
	}

	return { uid: token, email: undefined };
}

export function getAuthUser(req: { headers: { authorization?: string } }): UsuarioMock | null {
	const auth = req.headers.authorization;
	if (!auth) return null;
	const token = auth.replace(/^Bearer\s+/i, '').trim();
	if (!token) return null;

	const match = token.match(/mock-token-(\d+)/);
	if (match) {
		const userId = Number(match[1]);
		return db.usuarios.find((u) => u.id === userId) || null;
	}

	const parts = token.split('.');
	if (parts.length === 3) {
		try {
			const payload = JSON.parse(Buffer.from(parts[1]!, 'base64url').toString('utf8'));
			if (payload.idUsuario) {
				const u = db.usuarios.find((user) => user.id === Number(payload.idUsuario));
				if (u) return u;
			}
			if (payload.sub && /^\d+$/.test(payload.sub)) {
				const u = db.usuarios.find((user) => user.id === Number(payload.sub));
				if (u) return u;
			}
			if (payload.email) {
				const u = db.usuarios.find((user) => user.email.toLowerCase() === String(payload.email).toLowerCase());
				if (u) return u;
			}
			if (payload.user_id || payload.sub) {
				const uid = String(payload.user_id || payload.sub);
				const u = db.usuarios.find((user) => user.firebaseUid === uid);
				if (u) return u;
			}
		} catch {
			// ignore
		}
	}

	return db.usuarios[0] || null;
}

// POST /api/publico/auth/firebase/session
authRouter.post('/firebase/session', (req, res) => {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		return res.status(401).json({
			error: { code: 'INVALID_FIREBASE_TOKEN', message: 'No se pudo validar la identidad de Firebase.' },
		});
	}

	const identity = parseTokenIdentity(authHeader);
	if (!identity || (!identity.email && !identity.uid)) {
		return res.status(401).json({
			error: { code: 'INVALID_FIREBASE_TOKEN', message: 'No se pudo validar la identidad de Firebase.' },
		});
	}

	const user = db.usuarios.find((u) => {
		if (identity.email && u.email.toLowerCase() === identity.email.toLowerCase()) return true;
		if (identity.uid && u.firebaseUid === identity.uid) return true;
		return false;
	});

	if (!user) {
		return res.status(404).json({
			error: {
				code: 'PROFILE_INCOMPLETE',
				message: 'Tu identidad está verificada, pero todavía debés completar el registro.',
			},
		});
	}

	if (user.estado === 'P') {
		return res.status(401).json({
			error: {
				code: 'ACCOUNT_PENDING',
				message: 'Tu registro se encuentra pendiente de aprobación administrativa.',
			},
		});
	}

	if (user.estado !== 'A') {
		return res.status(401).json({
			error: {
				code: 'ACCOUNT_INACTIVE',
				message: 'Su cuenta se encuentra inactiva o dada de baja.',
			},
		});
	}

	const token = `mock-token-${user.id}-${Date.now()}`;
	const usuarioSession = {
		idUsuario: user.id,
		nombre: user.nombre,
		apellido: user.apellido,
		email: user.email,
		genero: user.genero,
		fechaNacimiento: user.fechaNacimiento,
		nacionalidad: user.nacionalidad,
		CUIL: user.cuil,
		actividadesArcaCodigo: user.actividadesArcaCodigo ?? null,
		fotoDniUrl: user.fotoDniUrl ?? null,
		avatarEstilo: user.avatarEstilo ?? null,
		avatarSeed: user.avatarSeed ?? null,
		rol: user.rol,
		estado: user.estado,
		fechaRegistro: user.fechaRegistro,
	};

	return res.json({
		usuario: usuarioSession,
		token,
		mensaje: 'Inicio de sesión exitoso.',
	});
});

// POST /api/publico/auth/registro
authRouter.post('/registro', (req, res) => {
	const body = req.body || {};
	const authHeader = req.headers.authorization;
	const identity = parseTokenIdentity(authHeader);

	const cleanEmail = (identity?.email || body.email || '').trim().toLowerCase();
	const cleanCUIL = (body.CUIL || body.cuil || '').trim();

	if (!body.nombre || !body.apellido || !body.fechaNacimiento || !body.genero) {
		return res.status(400).json({
			error: {
				code: 'INVALID_REGISTRATION_DATA',
				message: 'Los datos ingresados para el registro no son válidos.',
			},
		});
	}

	if (cleanEmail) {
		const existingEmail = db.usuarios.find((u) => u.email.toLowerCase() === cleanEmail);
		if (existingEmail) {
			return res.status(409).json({
				error: {
					code: 'USER_ALREADY_EXISTS',
					message: 'El correo electrónico ya se encuentra registrado.',
				},
			});
		}
	}

	if (cleanCUIL) {
		const existingCUIL = db.usuarios.find((u) => u.cuil === cleanCUIL);
		if (existingCUIL) {
			return res.status(409).json({
				error: {
					code: 'USER_ALREADY_EXISTS',
					message: 'El CUIL ya se encuentra registrado.',
				},
			});
		}
	}

	const newId = Math.max(0, ...db.usuarios.map((u) => u.id)) + 1;
	const newUser: UsuarioMock = {
		id: newId,
		nombre: body.nombre.trim(),
		apellido: body.apellido.trim(),
		email: cleanEmail || `usuario${newId}@mosaico.com`,
		firebaseUid: identity?.uid ?? null,
		genero: body.genero,
		fechaNacimiento: body.fechaNacimiento,
		nacionalidad: body.nacionalidad?.trim() || 'Argentina',
		cuil: cleanCUIL,
		actividadesArcaCodigo: body.actividadesArcaCodigo?.trim() || null,
		fotoDniUrl: body.documentoIdentidad ? `/uploads/dni/mock_dni_${Date.now()}.png` : null,
		avatarEstilo: null,
		avatarSeed: null,
		rol: 'USUARIO',
		estado: 'A',
		fechaRegistro: new Date().toISOString(),
	};

	db.usuarios.push(newUser);

	const usuarioSession = {
		idUsuario: newUser.id,
		nombre: newUser.nombre,
		apellido: newUser.apellido,
		email: newUser.email,
		genero: newUser.genero,
		fechaNacimiento: newUser.fechaNacimiento,
		nacionalidad: newUser.nacionalidad,
		CUIL: newUser.cuil,
		actividadesArcaCodigo: newUser.actividadesArcaCodigo,
		fotoDniUrl: newUser.fotoDniUrl,
		avatarEstilo: newUser.avatarEstilo,
		avatarSeed: newUser.avatarSeed,
		rol: newUser.rol,
		estado: newUser.estado,
		fechaRegistro: newUser.fechaRegistro,
	};

	return res.status(201).json({
		usuario: usuarioSession,
		mensaje: 'Registro completado exitosamente. Ya podés iniciar sesión.',
	});
});

// GET /api/publico/auth/actividades-arca
authRouter.get('/actividades-arca', (_req, res) => {
	return res.json({ actividades: db.actividadesArca });
});
