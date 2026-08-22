import fs from 'node:fs';
import path from 'node:path';
import type { RequestHandler } from 'express';
import { obtenerPerfilUsuarioRepository } from './usuario.repository.js';

export const obtenerDniArchivoController: RequestHandler = async (req, res, next) => {
	try {
		const user = req.user;
		if (!user) {
			res.status(401).json({
				error: {
					code: 'UNAUTHORIZED',
					message: 'Acceso no autorizado. Se requiere un token de sesión.',
				},
			});
			return;
		}

		const rawFilename = typeof req.params.filename === 'string' ? req.params.filename : '';
		const filename = path.basename(rawFilename);
		if (!filename || !/^dni_\d+_[a-f0-9]{8}\.(?:jpg|jpeg|png|webp)$/i.test(filename)) {
			res.status(400).json({
				error: {
					code: 'INVALID_FILENAME',
					message: 'Nombre de archivo inválido.',
				},
			});
			return;
		}

		const esAdminOModerador = user.rol === 'ADMIN' || user.rol === 'MODERADOR';

		if (!esAdminOModerador) {
			const perfil = await obtenerPerfilUsuarioRepository(user.idUsuario);
			const fotoDniUrl = perfil?.fotoDniUrl;
			const propioDni = fotoDniUrl ? path.basename(fotoDniUrl) : null;

			if (!propioDni || propioDni !== filename) {
				res.status(403).json({
					error: {
						code: 'FORBIDDEN',
						message: 'No tenés permisos para ver este documento.',
					},
				});
				return;
			}
		}

		const filePath = path.join(process.cwd(), 'uploads', 'dni', filename);
		if (!fs.existsSync(filePath)) {
			res.status(404).json({
				error: {
					code: 'NOT_FOUND',
					message: 'El documento solicitado no fue encontrado.',
				},
			});
			return;
		}

		res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
		res.sendFile(filePath);
	} catch (err) {
		next(err);
	}
};
