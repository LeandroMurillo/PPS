import { Router } from 'express';
import { db } from '../db';
import { getAuthUser } from './auth';

export const usuarioRouter = Router();

// GET /api/usuario/perfil
usuarioRouter.get('/perfil', (req, res) => {
	const user = getAuthUser(req);
	if (!user) {
		return res.status(401).json({ error: { message: 'Acceso no autorizado. Se requiere iniciar sesión.' } });
	}

	const arca = user.actividadesArcaCodigo
		? db.actividadesArca.find((a) => a.codigo === user.actividadesArcaCodigo)
		: null;

	const actoresDuenoCount = db.actores.filter((a) => a.idUsuarioDueno === user.id).length;

	const perfil = {
		idUsuario: user.id,
		nombre: user.nombre,
		apellido: user.apellido,
		email: user.email,
		genero: user.genero,
		fechaNacimiento: user.fechaNacimiento,
		nacionalidad: user.nacionalidad,
		CUIL: user.cuil,
		actividadesArcaCodigo: user.actividadesArcaCodigo ?? null,
		actividadArca: arca?.descripcion ?? null,
		fotoDniUrl: user.fotoDniUrl ?? null,
		avatarEstilo: user.avatarEstilo ?? null,
		avatarSeed: user.avatarSeed ?? null,
		rol: user.rol,
		estado: user.estado,
		fechaRegistro: user.fechaRegistro,
		actoresDuenoCount,
	};

	return res.json({ data: perfil });
});

// PUT /api/usuario/perfil
usuarioRouter.put('/perfil', (req, res) => {
	const user = getAuthUser(req);
	if (!user) {
		return res.status(401).json({ error: { message: 'Acceso no autorizado. Se requiere iniciar sesión.' } });
	}

	const body = req.body || {};

	if (!body.nombre || !body.apellido) {
		return res.status(400).json({ error: { message: 'Nombre y apellido son obligatorios.' } });
	}

	user.nombre = body.nombre.trim();
	user.apellido = body.apellido.trim();
	if (body.genero) user.genero = body.genero;
	if (body.fechaNacimiento) user.fechaNacimiento = body.fechaNacimiento;
	if (body.nacionalidad) user.nacionalidad = body.nacionalidad.trim();
	if (body.CUIL) user.cuil = body.CUIL.trim();
	user.actividadesArcaCodigo = body.actividadesArcaCodigo ?? null;
	if (body.avatarEstilo !== undefined)
		user.avatarEstilo = body.avatarEstilo ? String(body.avatarEstilo).trim() : null;
	if (body.avatarSeed !== undefined) user.avatarSeed = body.avatarSeed ? String(body.avatarSeed).trim() : null;

	if (body.documentoIdentidad) {
		user.fotoDniUrl = body.documentoIdentidad.startsWith('data:')
			? body.documentoIdentidad
			: `/uploads/dni/mock_dni_${Date.now()}.png`;
	}

	const arca = user.actividadesArcaCodigo
		? db.actividadesArca.find((a) => a.codigo === user.actividadesArcaCodigo)
		: null;

	const actoresDuenoCount = db.actores.filter((a) => a.idUsuarioDueno === user.id).length;

	const perfil = {
		idUsuario: user.id,
		nombre: user.nombre,
		apellido: user.apellido,
		email: user.email,
		genero: user.genero,
		fechaNacimiento: user.fechaNacimiento,
		nacionalidad: user.nacionalidad,
		CUIL: user.cuil,
		actividadesArcaCodigo: user.actividadesArcaCodigo ?? null,
		actividadArca: arca?.descripcion ?? null,
		fotoDniUrl: user.fotoDniUrl ?? null,
		avatarEstilo: user.avatarEstilo ?? null,
		avatarSeed: user.avatarSeed ?? null,
		rol: user.rol,
		estado: user.estado,
		fechaRegistro: user.fechaRegistro,
		actoresDuenoCount,
	};

	return res.json({ data: perfil, mensaje: 'Perfil actualizado correctamente.' });
});

// DELETE /api/usuario/cuenta
usuarioRouter.delete('/cuenta', (req, res) => {
	const user = getAuthUser(req);
	if (!user) {
		return res.status(401).json({ error: { message: 'Acceso no autorizado. Se requiere iniciar sesión.' } });
	}

	const ownedActorIds = db.actores.filter((a) => a.idUsuarioDueno === user.id).map((a) => a.id);

	// Eliminar actores de los que es dueño
	db.actores = db.actores.filter((a) => a.idUsuarioDueno !== user.id);
	db.portafolioItems = db.portafolioItems.filter((p) => !ownedActorIds.includes(p.idActor));
	db.eventos = db.eventos.filter((e) => !ownedActorIds.includes(e.idActor));
	db.integrantes = db.integrantes.filter((i) => !ownedActorIds.includes(i.idActor) && i.idUsuario !== user.id);
	db.postulaciones = db.postulaciones.filter((p) => !ownedActorIds.includes(p.idActor));

	// Eliminar usuario
	const userIdx = db.usuarios.findIndex((u) => u.id === user.id);
	if (userIdx !== -1) {
		db.usuarios.splice(userIdx, 1);
	}

	return res.json({
		mensaje: 'Tu cuenta y todos tus actores asociados han sido eliminados correctamente.',
		actoresEliminadosCount: ownedActorIds.length,
	});
});
