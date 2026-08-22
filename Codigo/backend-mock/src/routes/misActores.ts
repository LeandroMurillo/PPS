import { Router } from 'express';
import { db } from '../db';
import type { ActorMock } from '../types';
import { getAuthUser } from './auth';

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
	const user = getAuthUser(req);
	const busqueda = typeof req.query.busqueda === 'string' ? req.query.busqueda.toLowerCase() : undefined;
	const idCategoria = req.query.idCategoria ? Number(req.query.idCategoria) : null;
	const estado = typeof req.query.estado === 'string' ? req.query.estado : undefined;
	const limit = req.query.limit ? Number(req.query.limit) : 100;
	const offset = req.query.offset ? Number(req.query.offset) : 0;

	let result = user ? db.actores.filter((a) => a.idUsuarioDueno === user.id) : db.actores;

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
			categoriaIcono: cat ? cat.icono : 'MusicNote',
			subcategoria: subcat ? subcat.nombre : null,
			ubicacion: {
				provincia: a.ubicacion?.provincia ?? 'Tucumán',
				departamento: a.ubicacion?.departamento ?? 'Capital',
				localidad: a.ubicacion?.localidad ?? 'San Miguel de Tucumán',
				direccion: a.ubicacion?.direccion ?? '',
				latitud: a.ubicacion?.latitud ?? -26.8241,
				longitud: a.ubicacion?.longitud ?? -65.2226,
				esPublica: a.ubicacion?.esPublica ?? true,
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

// GET /api/mis-actores/:id
misActoresRouter.get('/:id', (req, res) => {
	const id = Number(req.params.id);
	const a = db.actores.find((item) => item.id === id);

	if (!a) {
		return res.status(404).json({ error: { message: 'Actor cultural no encontrado.' } });
	}

	const cat = db.categorias.find((c) => c.id === a.idCategoria);
	const subcat = a.idSubcategoria ? db.subcategorias.find((s) => s.id === a.idSubcategoria) : null;

	const portafolio = db.portafolioItems
		.filter((p) => p.idActor === id)
		.map((p) => ({
			idItem: p.id,
			tipo: p.tipo,
			descripcion: p.descripcion,
			url: p.url,
		}));

	const eventos = db.eventos
		.filter((e) => e.idActor === id)
		.map((e) => ({
			idEvento: e.id,
			nombre: e.nombre,
			descripcion: e.descripcion,
			fecha: e.fecha,
		}));

	const data = {
		id: a.id,
		nombre: a.nombre,
		descripcion: a.descripcion,
		foto: a.foto,
		cuit: a.cuit,
		tipoActor: a.tipoActor,
		fechaCreacion: a.fechaCreacion,
		estado: a.estado,
		categoria: cat ? cat.nombre : 'Música',
		categoriaIcono: cat ? cat.icono : 'MusicNote',
		subcategoria: subcat ? subcat.nombre : null,
		ubicacion: {
			provincia: a.ubicacion?.provincia ?? 'Tucumán',
			departamento: a.ubicacion?.departamento ?? 'Capital',
			localidad: a.ubicacion?.localidad ?? 'San Miguel de Tucumán',
			direccion: a.ubicacion?.direccion ?? '',
			latitud: a.ubicacion?.latitud ?? -26.8241,
			longitud: a.ubicacion?.longitud ?? -65.2226,
			esPublica: a.ubicacion?.esPublica ?? true,
		},
		portafolio,
		eventos,
	};

	return res.json({ data });
});

// GET /api/mis-actores/:id/formularios
misActoresRouter.get('/:id/formularios', (req, res) => {
	const id = Number(req.params.id);
	const actor = db.actores.find((item) => item.id === id);

	if (!actor) {
		return res.status(404).json({ error: { message: 'Actor cultural no encontrado.' } });
	}

	let forms = db.formularios.filter((f) => f.idCategoria === actor.idCategoria);
	if (actor.idSubcategoria) {
		forms = forms.concat(db.formularios.filter((f) => f.idSubcategoria === actor.idSubcategoria));
	}

	const respuestasFormulario = actor.respuestasFormulario ?? {};

	const data = forms.map((f) => ({
		id: f.id,
		idFormulario: f.id,
		ambito: f.ambito,
		idCategoria: f.idCategoria,
		categoria: f.categoria,
		idSubcategoria: f.idSubcategoria ?? null,
		subcategoria: f.subcategoria ?? null,
		titulo: f.titulo,
		descripcion: f.descripcion ?? null,
		preguntas: (f.preguntas ?? [])
			.filter((p) => p.estado === 'A')
			.map((p) => ({
				id: p.id,
				idPregunta: p.id,
				pregunta: p.pregunta,
				tipoDato: p.tipoDato,
				opciones: p.opciones,
				orden: p.orden,
				esObligatorio: p.esObligatorio,
				esPublico: p.esPublico,
				valor: respuestasFormulario[p.id] ?? null,
			})),
	}));

	return res.json({ data });
});

// POST /api/mis-actores
misActoresRouter.post('/', (req, res) => {
	const attrs = req.body || {};
	const user = getAuthUser(req);
	const ownerUser = user || db.usuarios.find((u) => u.id === 3) || db.usuarios[0];
	const pendingActorCount = db.actores.filter(
		(actor) => actor.idUsuarioDueno === ownerUser.id && actor.estado === 'P',
	).length;

	if (pendingActorCount >= 5) {
		return res.status(400).json({
			error: { message: 'Ya alcanzaste el límite de 5 actores culturales pendientes de revisión.' },
		});
	}

	const newId = db.actores.length + 1;
	const newActor: ActorMock = {
		id: newId,
		idUsuarioDueno: ownerUser.id,
		nombre: attrs.nombre,
		descripcion: attrs.descripcion,
		foto: attrs.fotoPerfilBase64 ?? attrs.fotoPerfilUrl ?? null,
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
		respuestasFormulario: Object.fromEntries(
			(attrs.respuestas ?? []).map(
				(respuesta: { idPregunta: number; valor: string | number | boolean | string[] }) => [
					respuesta.idPregunta,
					respuesta.valor,
				],
			),
		),
	};

	db.actores.push(newActor);

	if (ownerUser) {
		db.integrantes.push({
			tipo: 'REGISTRADO',
			idActor: newId,
			idUsuario: ownerUser.id,
			idIntegranteNoRegistrado: null,
			nombre: ownerUser.nombre,
			apellido: ownerUser.apellido,
			email: ownerUser.email,
			rol: 'Contacto Principal',
			esDueno: true,
		});
	}

	for (const item of attrs.portafolio ?? []) {
		db.portafolioItems.push({
			id: db.portafolioItems.length + 1,
			idActor: newId,
			tipo: item.tipo === 'IMAGEN' ? 'IMAGEN' : 'LINK',
			url: item.tipo === 'IMAGEN' ? item.imagenBase64 : item.url,
			descripcion: item.descripcion ? `${item.titulo}\n${item.descripcion}` : item.titulo,
			fechaCreacion: new Date().toISOString(),
		});
	}

	return res.status(201).json({ data: { idActor: newId } });
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
	actor.foto = attrs.fotoPerfilBase64 ?? attrs.fotoPerfilUrl ?? actor.foto;
	actor.cuit = attrs.cuit ?? actor.cuit;
	actor.tipoActor = attrs.tipoActor ?? actor.tipoActor;
	actor.idCategoria = Number(attrs.idCategoria);
	actor.idSubcategoria = attrs.idSubcategoria ? Number(attrs.idSubcategoria) : null;
	if (actor.ubicacion) {
		if (attrs.departamento) actor.ubicacion.departamento = attrs.departamento;
		if (attrs.localidad) actor.ubicacion.localidad = attrs.localidad;
		if (attrs.direccion !== undefined) actor.ubicacion.direccion = attrs.direccion;
		if (typeof attrs.latitud === 'number') actor.ubicacion.latitud = attrs.latitud;
		if (typeof attrs.longitud === 'number') actor.ubicacion.longitud = attrs.longitud;
		if (typeof attrs.esPublica === 'boolean') actor.ubicacion.esPublica = attrs.esPublica;
	}

	if (Array.isArray(attrs.respuestas)) {
		if (!actor.respuestasFormulario) {
			actor.respuestasFormulario = {};
		}
		for (const r of attrs.respuestas) {
			if (r && typeof r.idPregunta === 'number') {
				actor.respuestasFormulario[r.idPregunta] = r.valor;
			}
		}
	}

	return res.json({ data: { fotoPerfilUrl: actor.foto }, message: 'Actor actualizado.' });
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
	return res.json({ message: 'Estado actualizado.' });
});

// DELETE /api/mis-actores/:id
misActoresRouter.delete('/:id', (req, res) => {
	const id = Number(req.params.id);
	db.actores = db.actores.filter((a) => a.id !== id);
	db.portafolioItems = db.portafolioItems.filter((p) => p.idActor !== id);
	db.eventos = db.eventos.filter((e) => e.idActor !== id);
	db.integrantes = db.integrantes.filter((i) => i.idActor !== id);
	db.postulaciones = db.postulaciones.filter((p) => p.idActor !== id);

	return res.json({ message: 'Actor eliminado.' });
});

// GET /api/mis-actores/:id/portafolio
misActoresRouter.get('/:id/portafolio', (req, res) => {
	const idActor = Number(req.params.id);
	const data = db.portafolioItems
		.filter((p) => p.idActor === idActor)
		.map((p) => ({
			id: p.id,
			idItem: p.id,
			tipo: p.tipo,
			descripcion: p.descripcion,
			url: p.url,
		}));

	return res.json({ data });
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

// GET /api/mis-actores/:id/eventos
misActoresRouter.get('/:id/eventos', (req, res) => {
	const idActor = Number(req.params.id);
	const data = db.eventos
		.filter((e) => e.idActor === idActor)
		.map((e) => ({ idEvento: e.id, id: e.id, nombre: e.nombre, descripcion: e.descripcion, fecha: e.fecha }));

	return res.json({ data });
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

// DELETE /api/mis-actores/:id/eventos/:idEvento
misActoresRouter.delete('/:id/eventos/:idEvento', (req, res) => {
	const idEvento = Number(req.params.idEvento);
	db.eventos = db.eventos.filter((e) => e.id !== idEvento);

	return res.json({ message: 'Evento eliminado.' });
});

// GET /api/mis-actores/:id/integrantes
misActoresRouter.get('/:id/integrantes', (req, res) => {
	const idActor = Number(req.params.id);
	const data = db.integrantes
		.filter((i) => i.idActor === idActor)
		.map((i) => ({
			tipo: i.tipo,
			idUsuario: i.idUsuario,
			idIntegranteNoRegistrado: i.idIntegranteNoRegistrado,
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
	const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

	const user = db.usuarios.find((u) => u.email.toLowerCase() === normalizedEmail);
	if (!user) {
		return res.status(400).json({
			error: {
				code: 'BAD_REQUEST',
				message: 'No se encontró ningún usuario registrado con ese correo electrónico.',
			},
		});
	}

	if (db.integrantes.some((i) => i.idActor === idActor && i.idUsuario === user.id)) {
		return res.status(400).json({
			error: { code: 'BAD_REQUEST', message: 'Este usuario ya es integrante del actor cultural.' },
		});
	}

	db.integrantes.push({
		tipo: 'REGISTRADO',
		idActor,
		idUsuario: user.id,
		idIntegranteNoRegistrado: null,
		nombre: user.nombre,
		apellido: user.apellido,
		email: user.email,
		rol: typeof rol === 'string' && rol.trim() ? rol.trim() : 'Integrante',
		esDueno: false,
	});

	return res.status(201).json({ message: 'Integrante agregado.' });
});

// PUT /api/mis-actores/:id/integrantes/:idUsuario
misActoresRouter.put('/:id/integrantes/:idUsuario', (req, res) => {
	const idActor = Number(req.params.id);
	const idUsuario = Number(req.params.idUsuario);
	const integrante = db.integrantes.find((i) => i.idActor === idActor && i.idUsuario === idUsuario);

	if (!integrante) {
		return res.status(400).json({
			error: { code: 'BAD_REQUEST', message: 'El integrante solicitado no existe.' },
		});
	}

	if (typeof req.body?.rol !== 'string' || !req.body.rol.trim()) {
		return res.status(400).json({
			error: { code: 'BAD_REQUEST', message: 'El rol o función es obligatorio.' },
		});
	}

	integrante.rol = req.body.rol.trim();
	return res.json({ message: 'Integrante modificado.' });
});

// DELETE /api/mis-actores/:id/integrantes/:idUsuario
misActoresRouter.delete('/:id/integrantes/:idUsuario', (req, res) => {
	const idActor = Number(req.params.id);
	const idUsuario = Number(req.params.idUsuario);
	const integrante = db.integrantes.find((i) => i.idActor === idActor && i.idUsuario === idUsuario);

	if (!integrante) {
		return res.status(400).json({
			error: { code: 'BAD_REQUEST', message: 'El integrante solicitado no existe.' },
		});
	}

	if (integrante.esDueno) {
		return res.status(400).json({
			error: { code: 'BAD_REQUEST', message: 'No se puede eliminar al titular del actor cultural.' },
		});
	}

	db.integrantes = db.integrantes.filter((i) => !(i.idActor === idActor && i.idUsuario === idUsuario));

	return res.json({ message: 'Integrante eliminado.' });
});

// POST /api/mis-actores/:id/integrantes-no-registrados
misActoresRouter.post('/:id/integrantes-no-registrados', (req, res) => {
	const idActor = Number(req.params.id);
	const { nombre, apellido, email, rol } = req.body || {};
	const normalizedEmail = typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : null;

	if (!nombre?.trim() || !apellido?.trim()) {
		return res.status(400).json({
			error: { code: 'BAD_REQUEST', message: 'El nombre y el apellido son obligatorios.' },
		});
	}

	if (normalizedEmail && db.usuarios.some((u) => u.email.toLowerCase() === normalizedEmail)) {
		return res.status(400).json({
			error: {
				code: 'BAD_REQUEST',
				message: 'Ese correo pertenece a un usuario registrado; agregalo como usuario de la plataforma.',
			},
		});
	}

	if (
		normalizedEmail &&
		db.integrantes.some((i) => i.idActor === idActor && i.email?.toLowerCase() === normalizedEmail)
	) {
		return res.status(400).json({
			error: { code: 'BAD_REQUEST', message: 'Ya existe un integrante con ese correo en el actor cultural.' },
		});
	}

	const nextId = Math.max(0, ...db.integrantes.map((i) => i.idIntegranteNoRegistrado ?? 0)) + 1;
	db.integrantes.push({
		tipo: 'NO_REGISTRADO',
		idActor,
		idUsuario: null,
		idIntegranteNoRegistrado: nextId,
		nombre: nombre.trim(),
		apellido: apellido.trim(),
		email: normalizedEmail,
		rol: typeof rol === 'string' && rol.trim() ? rol.trim() : 'Integrante',
		esDueno: false,
	});

	return res.status(201).json({ message: 'Integrante sin cuenta agregado.' });
});

// PUT /api/mis-actores/:id/integrantes-no-registrados/:idIntegranteNoRegistrado
misActoresRouter.put('/:id/integrantes-no-registrados/:idIntegranteNoRegistrado', (req, res) => {
	const idActor = Number(req.params.id);
	const idIntegranteNoRegistrado = Number(req.params.idIntegranteNoRegistrado);
	const integrante = db.integrantes.find(
		(i) => i.idActor === idActor && i.idIntegranteNoRegistrado === idIntegranteNoRegistrado,
	);

	if (!integrante) {
		return res.status(400).json({
			error: { code: 'BAD_REQUEST', message: 'El integrante solicitado no existe.' },
		});
	}

	const { nombre, apellido, email, rol } = req.body || {};
	const normalizedEmail = typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : null;
	if (!nombre?.trim() || !apellido?.trim()) {
		return res.status(400).json({
			error: { code: 'BAD_REQUEST', message: 'El nombre y el apellido son obligatorios.' },
		});
	}

	if (normalizedEmail && db.usuarios.some((u) => u.email.toLowerCase() === normalizedEmail)) {
		return res.status(400).json({
			error: {
				code: 'BAD_REQUEST',
				message: 'Ese correo pertenece a un usuario registrado; agregalo como usuario de la plataforma.',
			},
		});
	}

	if (
		normalizedEmail &&
		db.integrantes.some(
			(i) =>
				i.idActor === idActor &&
				i.idIntegranteNoRegistrado !== idIntegranteNoRegistrado &&
				i.email?.toLowerCase() === normalizedEmail,
		)
	) {
		return res.status(400).json({
			error: { code: 'BAD_REQUEST', message: 'Ya existe un integrante con ese correo en el actor cultural.' },
		});
	}

	integrante.nombre = nombre.trim();
	integrante.apellido = apellido.trim();
	integrante.email = normalizedEmail;
	integrante.rol = typeof rol === 'string' && rol.trim() ? rol.trim() : integrante.rol;

	return res.json({ message: 'Integrante modificado.' });
});

// DELETE /api/mis-actores/:id/integrantes-no-registrados/:idIntegranteNoRegistrado
misActoresRouter.delete('/:id/integrantes-no-registrados/:idIntegranteNoRegistrado', (req, res) => {
	const idActor = Number(req.params.id);
	const idIntegranteNoRegistrado = Number(req.params.idIntegranteNoRegistrado);
	const exists = db.integrantes.some(
		(i) => i.idActor === idActor && i.idIntegranteNoRegistrado === idIntegranteNoRegistrado,
	);

	if (!exists) {
		return res.status(400).json({
			error: { code: 'BAD_REQUEST', message: 'El integrante solicitado no existe.' },
		});
	}

	db.integrantes = db.integrantes.filter(
		(i) => !(i.idActor === idActor && i.idIntegranteNoRegistrado === idIntegranteNoRegistrado),
	);

	return res.json({ message: 'Integrante eliminado.' });
});
