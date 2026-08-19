import type { RequestHandler } from 'express';
import { actualizarPerfilBodySchema } from './usuario.schemas.js';
import {
	actualizarPerfilUsuarioService,
	eliminarCuentaUsuarioService,
	obtenerPerfilUsuarioService,
} from './usuario.service.js';

export const obtenerPerfilUsuarioController: RequestHandler = async (req, res, next) => {
	try {
		const userId = req.user?.idUsuario;
		if (!userId) {
			res.status(401).json({ error: { message: 'Sesión no válida o expirada.' } });
			return;
		}

		const data = await obtenerPerfilUsuarioService(userId);
		res.status(200).json({ data });
	} catch (err) {
		next(err);
	}
};

export const actualizarPerfilUsuarioController: RequestHandler = async (req, res, next) => {
	try {
		const userId = req.user?.idUsuario;
		if (!userId) {
			res.status(401).json({ error: { message: 'Sesión no válida o expirada.' } });
			return;
		}

		const validation = actualizarPerfilBodySchema.safeParse(req.body);
		if (!validation.success) {
			const errorMsg = validation.error.issues[0]?.message ?? 'Datos de perfil inválidos.';
			res.status(400).json({ error: { message: errorMsg } });
			return;
		}

		const data = await actualizarPerfilUsuarioService(userId, validation.data);
		res.status(200).json({ data, mensaje: 'Perfil actualizado correctamente.' });
	} catch (err) {
		next(err);
	}
};

export const eliminarCuentaUsuarioController: RequestHandler = async (req, res, next) => {
	try {
		const userId = req.user?.idUsuario;
		if (!userId) {
			res.status(401).json({ error: { message: 'Sesión no válida o expirada.' } });
			return;
		}

		const result = await eliminarCuentaUsuarioService(userId);
		res.status(200).json(result);
	} catch (err) {
		next(err);
	}
};
