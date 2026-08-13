import { Router } from 'express';
import { db } from '../db';
import type { ActorMock } from '../types';

export const misActoresRouter = Router();

// GET /api/mis-actores/opciones-registro
misActoresRouter.get('/opciones-registro', (_req, res) => {
	const data = db.categorias
		.filter((cat) => cat.estado === 'A')
		.map((cat) => {
			const subcategorias = db.subcategorias
				.filter((sub) => sub.idCategoria === cat.id && sub.estado === 'A')
				.map((sub) => ({ id: sub.id, nombre: sub.nombre }));

			return {
				id: cat.id,
				nombre: cat.nombre,
				icono: cat.icono,
				subcategorias,
			};
		});

	return res.json({ data });
});

// GET /api/mis-actores/formularios-aplicables
misActoresRouter.get('/formularios-aplicables', (req, res) => {
	const idCategoria = Number(req.query.idCategoria);
	const idSubcategoria = req.query.idSubcategoria ? Number(req.query.idSubcategoria) : null;

	let forms = db.formularios.filter((f) => f.idCategoria === idCategoria);
	if (idSubcategoria) {
		forms = forms.concat(db.formularios.filter((f) => f.idSubcategoria === idSubcategoria));
	}

	const data = forms.map((f) => ({
		id: f.id,
		ambito: f.ambito,
		idCategoria: f.idCategoria,
		categoria: f.categoria,
		idSubcategoria: f.idSubcategoria ?? null,
		subcategoria: f.subcategoria ?? null,
		titulo: f.titulo,
		descripcion: f.descripcion ?? null,
		preguntas: f.preguntas ?? [],
	}));

	return res.json({ data });
});

// GET /api/mis-actores
misActoresRouter.get('/', (req, res) => {
	const busqueda = typeof req.query.busqueda === 'string' ? req.query.busqueda.toLowerCase() : undefined;
	const idCategoria = req.query.idCategoria ? Number(req.query.idCategoria) : null;
	const estado = typeof req.query.estado === 'string' ? req.query.estado : undefined;
	const limit = req.query.limit ? Number(req.query.limit) : 10;
	const offset = req.query.offset ? Number(req.query.offset) : 0;

	let result = db.actores;

	if (idCategoria) {
		result = result.filter((a) => a.idCategoria === idCategoria);
	}

	if (estado) {
		result = result.filter((a) => a.estado === estado);
	}

	if (busqueda) {
		result = result.filter(
			(a) =>
				a.nombre.toLowerCase().includes(busqueda) ||
				(a.descripcion && a.descripcion.toLowerCase().includes(busqueda)),
		);
	}

	const total = result.length;
	const paginated = result.slice(offset, offset + limit);

	const data = paginated.map((a) => {
		const cat = db.categorias.find((c) => c.id === a.idCategoria);
		const subcat = a.idSubcategoria ? db.subcategorias.find((s) => s.id === a.idSubcategoria) : null;

		return {
			id: a.id,
			nombre: a.nombre,
			descripcion: a.descripcion,
			foto: a.foto,
			cuit: a.cuit,
			tipoActor: a.tipoActor,
			fechaCreacion: a.fechaCreacion,
			estado: a.estado,
			categoria: cat ? cat.nombre : 'Música',
			categoriaIcono: cat ? cat.icono : 'MUSICA',
			subcategoria: subcat ? subcat.nombre : null,
			ubicacion: {
				provincia: a.ubicacion?.provincia ?? 'Tucumán',
				departamento: a.ubicacion?.departamento ?? 'Capital',
				localidad: a.ubicacion?.localidad ?? 'San Miguel de Tucumán',
				direccion: a.ubicacion?.direccion ?? '',
				latitud: a.ubicacion?.latitud ?? -26.8241,
				longitud: a.ubicacion?.longitud ?? -65.2226,
			},
		};
	});

	return res.json({
		data,
		pagination: {
			total,
			limit,
			offset,
			hasNext: offset + limit < total,
		},
	});
});

// POST /api/mis-actores
misActoresRouter.post('/', (req, res) => {
	const attrs = req.body || {};

	const newId = db.actores.length + 1;
	const newActor: ActorMock = {
		id: newId,
		idUsuarioDueno: 3,
		nombre: attrs.nombre,
		descripcion: attrs.descripcion,
		foto: attrs.fotoPerfilUrl ?? null,
		cuit: attrs.cuit ?? null,
		tipoActor: attrs.tipoActor ?? 'INDIVIDUO',
		fechaCreacion: new Date().toISOString(),
		estado: 'P',
		idCategoria: Number(attrs.idCategoria),
		idSubcategoria: attrs.idSubcategoria ? Number(attrs.idSubcategoria) : null,
		ubicacion: {
			provincia: attrs.provincia ?? 'Tucumán',
			departamento: attrs.departamento ?? 'Capital',
			localidad: attrs.localidad ?? 'San Miguel de Tucumán',
			direccion: attrs.direccion ?? '',
			latitud: attrs.latitud ?? -26.8241,
			longitud: attrs.longitud ?? -65.2226,
			esPublica: attrs.esPublica ?? true,
		},
	};

	db.actores.push(newActor);

	return res.json({ data: { idActor: newId } });
});

// PUT /api/mis-actores/:id
misActoresRouter.put('/:id', (req, res) => {
	const id = Number(req.params.id);
	const attrs = req.body || {};
	const actor = db.actores.find((a) => a.id === id);

	if (!actor) {
		return res.status(404).json({ error: { message: 'Actor no encontrado.' } });
	}

	actor.nombre = attrs.nombre;
	actor.descripcion = attrs.descripcion;
	actor.foto = attrs.fotoPerfilUrl ?? actor.foto;
	actor.cuit = attrs.cuit ?? actor.cuit;
	actor.tipoActor = attrs.tipoActor ?? actor.tipoActor;
	actor.idCategoria = Number(attrs.idCategoria);
	actor.idSubcategoria = attrs.idSubcategoria ? Number(attrs.idSubcategoria) : null;
	if (actor.ubicacion) {
		actor.ubicacion.departamento = attrs.departamento;
		actor.ubicacion.localidad = attrs.localidad;
		actor.ubicacion.direccion = attrs.direccion;
	}

	return res.json({ message: 'Actor actualizado correctamente.' });
});

// PATCH /api/mis-actores/:id/estado
misActoresRouter.patch('/:id/estado', (req, res) => {
	const id = Number(req.params.id);
	const { nuevoEstado } = req.body || {};
	const actor = db.actores.find((a) => a.id === id);

	if (!actor) {
		return res.status(404).json({ error: { message: 'Actor no encontrado.' } });
	}

	actor.estado = nuevoEstado;
	return res.json({ message: 'Estado actualizado correctamente.' });
});

// DELETE /api/mis-actores/:id
misActoresRouter.delete('/:id', (req, res) => {
	const id = Number(req.params.id);
	db.actores = db.actores.filter((a) => a.id !== id);

	return res.json({ message: 'Actor eliminado correctamente.' });
});

// POST /api/mis-actores/:id/portafolio
misActoresRouter.post('/:id/portafolio', (req, res) => {
	const idActor = Number(req.params.id);
	const attrs = req.body || {};

	const newId = db.portafolioItems.length + 1;
	db.portafolioItems.push({
		id: newId,
		idActor,
		tipo: attrs.tipo,
		descripcion: attrs.descripcion,
		url: attrs.url,
		fechaCreacion: new Date().toISOString(),
	});

	return res.json({ data: { idItem: newId } });
});

// DELETE /api/mis-actores/:id/portafolio/:idItem
misActoresRouter.delete('/:id/portafolio/:idItem', (req, res) => {
	const idItem = Number(req.params.idItem);
	db.portafolioItems = db.portafolioItems.filter((p) => p.id !== idItem);

	return res.json({ message: 'Elemento eliminado del portafolio.' });
});

// POST /api/mis-actores/:id/eventos
misActoresRouter.post('/:id/eventos', (req, res) => {
	const idActor = Number(req.params.id);
	const attrs = req.body || {};

	const newId = db.eventos.length + 1;
	db.eventos.push({
		id: newId,
		idActor,
		nombre: attrs.nombre,
		descripcion: attrs.descripcion,
		fecha: attrs.fecha ?? new Date().toISOString().split('T')[0],
	});

	return res.json({ data: { idEvento: newId } });
});

// GET /api/mis-actores/:id/eventos
misActoresRouter.get('/:id/eventos', (req, res) => {
	const idActor = Number(req.params.id);
	const data = db.eventos
		.filter((e) => e.idActor === idActor)
		.map((e) => ({ id: e.id, nombre: e.nombre, descripcion: e.descripcion, fecha: e.fecha }));

	return res.json({ data });
});

// DELETE /api/mis-actores/:id/eventos/:idEvento
misActoresRouter.delete('/:id/eventos/:idEvento', (req, res) => {
	const idEvento = Number(req.params.idEvento);
	db.eventos = db.eventos.filter((e) => e.id !== idEvento);

	return res.json({ message: 'Evento eliminado correctamente.' });
});

// GET /api/mis-actores/:id/integrantes
misActoresRouter.get('/:id/integrantes', (req, res) => {
	const idActor = Number(req.params.id);
	const data = db.integrantes
		.filter((i) => i.idActor === idActor)
		.map((i) => ({
			idUsuario: i.idUsuario,
			nombre: i.nombre,
			apellido: i.apellido,
			email: i.email,
			rol: i.rol,
			esDueño: i.esDueno,
		}));

	return res.json({ data });
});

// POST /api/mis-actores/:id/integrantes
misActoresRouter.post('/:id/integrantes', (req, res) => {
	const idActor = Number(req.params.id);
	const { email, rol } = req.body || {};

	const user = db.usuarios.find((u) => u.email.toLowerCase() === email?.trim().toLowerCase());
	const nombre = user ? user.nombre : 'Usuario';
	const apellido = user ? user.apellido : 'Nuevo';

	db.integrantes.push({
		idActor,
		idUsuario: user ? user.id : Date.now(),
		nombre,
		apellido,
		email,
		rol,
		esDueno: false,
	});

	return res.json({ message: 'Integrante agregado correctamente.' });
});

// DELETE /api/mis-actores/:id/integrantes/:idUsuario
misActoresRouter.delete('/:id/integrantes/:idUsuario', (req, res) => {
	const idActor = Number(req.params.id);
	const idUsuario = Number(req.params.idUsuario);

	db.integrantes = db.integrantes.filter((i) => !(i.idActor === idActor && i.idUsuario === idUsuario));

	return res.json({ message: 'Integrante eliminado correctamente.' });
});
