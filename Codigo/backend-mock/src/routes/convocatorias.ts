import { Router } from 'express';
import { db } from '../db';
import type { PostulacionMock } from '../types';

export const convocatoriasRouter = Router();

// GET /api/convocatorias
convocatoriasRouter.get('/', (_req, res) => {
	const data = db.convocatorias.map((c) => {
		const totalPostulaciones = db.postulaciones.filter((p) => p.idConvocatoria === c.id).length;
		return {
			...c,
			totalPostulaciones,
		};
	});

	return res.json({ data });
});

// GET /api/convocatorias/:id
convocatoriasRouter.get('/:id', (req, res) => {
	const id = Number(req.params.id);
	const c = db.convocatorias.find((item) => item.id === id);

	if (!c) {
		return res.status(404).json({ error: { message: 'Convocatoria no encontrada.' } });
	}

	const postulaciones = db.postulaciones
		.filter((p) => p.idConvocatoria === id)
		.map((p) => {
			const actor = db.actores.find((a) => a.id === p.idActor);
			const user = db.usuarios.find((u) => u.id === p.idUsuario);

			return {
				id: p.id,
				idConvocatoria: p.idConvocatoria,
				idActor: p.idActor,
				actorNombre: actor ? actor.nombre : 'Actor Cultural',
				actorCategoria: actor ? (db.categorias.find((cat) => cat.id === actor.idCategoria)?.nombre ?? '') : '',
				idUsuario: p.idUsuario,
				usuarioNombre: user ? `${user.nombre} ${user.apellido}` : 'Usuario',
				usuarioEmail: user ? user.email : '',
				fechaPostulacion: p.fechaPostulacion,
				estado: p.estado,
				notas: p.notas ?? null,
			};
		});

	return res.json({
		data: {
			...c,
			postulaciones,
		},
	});
});

// POST /api/convocatorias/:id/postulaciones
convocatoriasRouter.post('/:id/postulaciones', (req, res) => {
	const idConvocatoria = Number(req.params.id);
	const { idActor, idUsuario = 3 } = req.body || {};

	const c = db.convocatorias.find((item) => item.id === idConvocatoria);
	if (!c) {
		return res.status(404).json({ error: { message: 'Convocatoria no encontrada.' } });
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
		idUsuario: Number(idUsuario),
		fechaPostulacion: new Date().toISOString(),
		estado: 'PENDIENTE',
	};

	db.postulaciones.push(postulacion);

	return res.status(201).json({
		data: postulacion,
		mensaje: 'Postulación registrada exitosamente.',
	});
});

// DELETE /api/convocatorias/:id/postulaciones/:idActor
convocatoriasRouter.delete('/:id/postulaciones/:idActor', (req, res) => {
	const idConvocatoria = Number(req.params.id);
	const idActor = Number(req.params.idActor);

	db.postulaciones = db.postulaciones.filter((p) => !(p.idConvocatoria === idConvocatoria && p.idActor === idActor));

	return res.json({ mensaje: 'Postulación cancelada.' });
});
