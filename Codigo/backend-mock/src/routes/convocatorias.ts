import { Router } from 'express';
import { db } from '../db';
import type { PostulacionMock } from '../types';

export const convocatoriasRouter = Router();

function getUserIdFromReq(req: any): number {
	const authHeader = req.headers?.authorization;
	if (authHeader && authHeader.startsWith('Bearer ')) {
		const token = authHeader.substring(7);
		if (token.includes('admin')) return 1;
		if (token.includes('moderador')) return 2;
		if (token.includes('usuario')) return 3;
	}
	return 3; // Default usuario mock
}

// GET /api/convocatorias
convocatoriasRouter.get('/', (req, res) => {
	const userId = getUserIdFromReq(req);

	const data = db.convocatorias.map((c) => {
		const totalPostulaciones = db.postulaciones.filter((p) => p.idConvocatoria === c.id).length;
		const isAbierta = new Date(c.fechaCierre) >= new Date();

		return {
			idConvocatoria: c.id,
			id: c.id,
			titulo: c.titulo,
			descripcion: c.descripcion,
			fechaCreacion: c.fechaInicio || new Date().toISOString(),
			fechaCierre: c.fechaCierre,
			totalPostulaciones,
			estado: isAbierta ? 'ABIERTA' : 'CERRADA',
		};
	});

	// Postulaciones de los actores del usuario
	const userActors = db.actores.filter(
		(a) => a.idUsuarioDueno === userId || db.integrantes.some((i) => i.idActor === a.id && i.idUsuario === userId),
	);
	const userActorIds = userActors.map((a) => a.id);

	const postulacionesUsuario = db.postulaciones
		.filter((p) => userActorIds.includes(p.idActor) || p.idUsuario === userId)
		.map((p) => {
			const actor = db.actores.find((a) => a.id === p.idActor);
			return {
				idConvocatoria: p.idConvocatoria,
				idActor: p.idActor,
				nombreActor: actor ? actor.nombre : 'Actor Cultural',
				fechaPostulacion: p.fechaPostulacion,
			};
		});

	return res.json({
		data,
		postulacionesUsuario,
	});
});

// GET /api/convocatorias/:id
convocatoriasRouter.get('/:id', (req, res) => {
	const id = Number(req.params.id);
	const c = db.convocatorias.find((item) => item.id === id);

	if (!c) {
		return res.status(404).json({ error: { message: 'Convocatoria no encontrada.' } });
	}

	const isAbierta = new Date(c.fechaCierre) >= new Date();
	const totalPostulaciones = db.postulaciones.filter((p) => p.idConvocatoria === id).length;

	const postulantes = db.postulaciones
		.filter((p) => p.idConvocatoria === id)
		.map((p) => {
			const actor = db.actores.find((a) => a.id === p.idActor);
			const ownerId = actor?.idUsuarioDueno ?? p.idUsuario;
			const user = db.usuarios.find((u) => u.id === ownerId);
			const cat = actor ? db.categorias.find((item) => item.id === actor.idCategoria) : null;
			const sub =
				actor && actor.idSubcategoria
					? db.subcategorias.find((item) => item.id === actor.idSubcategoria)
					: null;

			return {
				idActor: p.idActor,
				fechaPostulacion: p.fechaPostulacion,
				nombreActor: actor ? actor.nombre : 'Actor Cultural',
				fotoPerfilUrl: actor ? actor.foto : null,
				estadoActor: actor ? actor.estado : 'A',
				categoria: cat ? cat.nombre : 'General',
				subcategoria: sub ? sub.nombre : null,
				departamento: actor ? actor.ubicacion.departamento : null,
				localidad: actor ? actor.ubicacion.localidad : null,
				responsableNombre: user ? user.nombre : null,
				responsableApellido: user ? user.apellido : null,
				responsableEmail: user ? user.email : null,
			};
		});

	return res.json({
		data: {
			idConvocatoria: c.id,
			id: c.id,
			titulo: c.titulo,
			descripcion: c.descripcion,
			fechaCreacion: c.fechaInicio || new Date().toISOString(),
			fechaCierre: c.fechaCierre,
			totalPostulaciones,
			estado: isAbierta ? 'ABIERTA' : 'CERRADA',
		},
		postulantes,
	});
});

// POST /api/convocatorias/:id/postular (y /postulaciones)
function handlePostular(req: any, res: any) {
	const idConvocatoria = Number(req.params.id);
	const { idActor } = req.body || {};
	const userId = getUserIdFromReq(req);

	const c = db.convocatorias.find((item) => item.id === idConvocatoria);
	if (!c) {
		return res.status(404).json({ error: { message: 'Convocatoria no encontrada.' } });
	}

	if (new Date(c.fechaCierre) < new Date()) {
		return res.status(400).json({ error: { message: 'La convocatoria ya se encuentra cerrada.' } });
	}

	const existing = db.postulaciones.find((p) => p.idConvocatoria === idConvocatoria && p.idActor === Number(idActor));
	if (existing) {
		return res.status(400).json({ error: { message: 'Este actor ya está postulado a esta convocatoria.' } });
	}

	const newId = db.postulaciones.length + 1;
	const postulacion: PostulacionMock = {
		id: newId,
		idConvocatoria,
		idActor: Number(idActor),
		idUsuario: userId,
		fechaPostulacion: new Date().toISOString(),
		estado: 'PENDIENTE',
	};

	db.postulaciones.push(postulacion);

	return res.status(200).json({
		mensaje: 'Actor postulado exitosamente a la convocatoria.',
		data: postulacion,
	});
}

convocatoriasRouter.post('/:id/postular', handlePostular);
convocatoriasRouter.post('/:id/postulaciones', handlePostular);

// DELETE /api/convocatorias/:id/postulaciones/:idActor
convocatoriasRouter.delete('/:id/postulaciones/:idActor', (req, res) => {
	const idConvocatoria = Number(req.params.id);
	const idActor = Number(req.params.idActor);

	const c = db.convocatorias.find((item) => item.id === idConvocatoria);
	if (!c) {
		return res.status(404).json({ error: { message: 'Convocatoria no encontrada.' } });
	}

	if (new Date(c.fechaCierre) < new Date()) {
		return res
			.status(400)
			.json({ error: { message: 'No es posible cancelar la postulación porque la convocatoria ya cerró.' } });
	}

	db.postulaciones = db.postulaciones.filter((p) => !(p.idConvocatoria === idConvocatoria && p.idActor === idActor));

	return res.json({ mensaje: 'Postulación cancelada exitosamente.' });
});
