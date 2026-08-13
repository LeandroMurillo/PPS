import { Router } from 'express';
import { db } from '../db';

export const authRouter = Router();

// POST /api/publico/auth/login
authRouter.post('/login', (req, res) => {
	const { email, contraseña } = req.body || {};
	const cleanEmail = email?.trim().toLowerCase();

	if (!cleanEmail || !contraseña) {
		return res.status(400).json({ error: { message: 'Debe ingresar email y contraseña.' } });
	}

	const user = db.usuarios.find((u) => u.email.toLowerCase() === cleanEmail);
	if (!user) {
		return res.status(401).json({ error: { message: 'Credenciales inválidas.' } });
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
		rol: user.rol,
		estado: user.estado,
		fechaRegistro: user.fechaRegistro,
	};

	return res.json({
		usuario: usuarioSession,
		token,
		mensaje: 'Inicio de sesión exitoso',
	});
});

// POST /api/publico/auth/registro
authRouter.post('/registro', (req, res) => {
	const attrs = req.body || {};
	const cleanEmail = attrs.email?.trim().toLowerCase();

	const existingUser = db.usuarios.find((u) => u.email.toLowerCase() === cleanEmail);
	if (existingUser) {
		return res.status(400).json({ error: { message: 'El correo electrónico ya está registrado.' } });
	}

	const newId = db.usuarios.length + 1;
	const newUser = {
		id: newId,
		nombre: attrs.nombre,
		apellido: attrs.apellido,
		genero: attrs.genero ?? 'M',
		fechaNacimiento: attrs.fechaNacimiento,
		nacionalidad: attrs.nacionalidad ?? 'Argentina',
		email: cleanEmail,
		cuil: attrs.CUIL ?? attrs.cuil,
		actividadesArcaCodigo: attrs.actividadesArcaCodigo ?? null,
		rol: 'USUARIO' as const,
		estado: 'A' as const,
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
		rol: newUser.rol,
		estado: newUser.estado,
		fechaRegistro: newUser.fechaRegistro,
	};

	return res.json({
		usuario: usuarioSession,
		mensaje: 'Usuario registrado correctamente.',
	});
});

// GET /api/publico/auth/actividades-arca
authRouter.get('/actividades-arca', (_req, res) => {
	return res.json({ actividades: db.actividadesArca });
});
