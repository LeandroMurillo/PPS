import type { Request, Response } from 'express';
import { Router } from 'express';
import { db } from '../db';
import type { CategoriaMock, SubcategoriaMock, PreguntaBancoMock } from '../types';

export const adminRouter = Router();

// GET /api/admin/usuarios
adminRouter.get('/usuarios', (req, res) => {
	const busqueda = typeof req.query.busqueda === 'string' ? req.query.busqueda.toLowerCase() : undefined;
	const rol = typeof req.query.rol === 'string' ? req.query.rol : undefined;
	const estado = typeof req.query.estado === 'string' ? req.query.estado : undefined;
	const limit = req.query.limit ? Number(req.query.limit) : 10;
	const offset = req.query.offset ? Number(req.query.offset) : 0;
	const sortBy = (
		typeof req.query.sortBy === 'string' ? req.query.sortBy : 'idUsuario'
	) as keyof (typeof db.usuarios)[0];
	const sortDir = req.query.sortDir === 'DESC' ? 'DESC' : 'ASC';

	let result = [...db.usuarios];

	if (rol) result = result.filter((u) => u.rol === rol);
	if (estado) result = result.filter((u) => u.estado === estado);

	if (busqueda) {
		result = result.filter(
			(u) =>
				u.nombre.toLowerCase().includes(busqueda) ||
				u.apellido.toLowerCase().includes(busqueda) ||
				u.email.toLowerCase().includes(busqueda) ||
				(u.cuil && u.cuil.includes(busqueda)),
		);
	}

	result.sort((a, b) => {
		const valA = String(a[sortBy as keyof typeof a] ?? '');
		const valB = String(b[sortBy as keyof typeof b] ?? '');
		return sortDir === 'ASC' ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
	});

	const total = result.length;
	const paginated = result.slice(offset, offset + limit);

	const data = paginated.map((u) => ({
		id: u.id,
		actividadArcaCodigo: u.actividadesArcaCodigo ?? null,
		actividadArca: u.actividadArca ?? null,
		nombre: u.nombre,
		apellido: u.apellido,
		cuil: u.cuil,
		genero: u.genero,
		fechaNacimiento: u.fechaNacimiento,
		nacionalidad: u.nacionalidad,
		email: u.email,
		fechaRegistro: u.fechaRegistro,
		rol: u.rol,
		estado: u.estado,
	}));

	return res.json({
		data,
		pagination: { total, count: data.length, limit, offset, hasNext: offset + limit < total },
	});
});

// GET /api/admin/usuarios/:id
adminRouter.get('/usuarios/:id', (req, res) => {
	const id = Number(req.params.id);
	const user = db.usuarios.find((u) => u.id === id);

	if (!user) {
		return res.status(404).json({ error: { message: 'Usuario no encontrado.' } });
	}

	const mods = user.categoriasModeracion ?? [];
	const categoriasModeracion = db.categorias.map((c) => ({
		id: c.id,
		nombre: c.nombre,
		icono: c.icono,
		asignada: mods.includes(c.id),
	}));

	const data = {
		id: user.id,
		actividadArcaCodigo: user.actividadesArcaCodigo ?? null,
		actividadArca: user.actividadArca ?? null,
		nombre: user.nombre,
		apellido: user.apellido,
		cuil: user.cuil,
		genero: user.genero,
		fechaNacimiento: user.fechaNacimiento,
		nacionalidad: user.nacionalidad,
		email: user.email,
		fechaRegistro: user.fechaRegistro,
		rol: user.rol,
		estado: user.estado,
		categoriasModeracion,
	};

	return res.json({ data });
});

// PATCH /api/admin/usuarios/:id/estado
adminRouter.patch('/usuarios/:id/estado', (req, res) => {
	const id = Number(req.params.id);
	const { estado } = req.body || {};
	const user = db.usuarios.find((u) => u.id === id);

	if (!user) {
		return res.status(404).json({ error: { message: 'Usuario no encontrado.' } });
	}

	user.estado = estado;

	const data = {
		id: user.id,
		actividadArcaCodigo: user.actividadesArcaCodigo ?? null,
		actividadArca: user.actividadArca ?? null,
		nombre: user.nombre,
		apellido: user.apellido,
		cuil: user.cuil,
		genero: user.genero,
		fechaNacimiento: user.fechaNacimiento,
		nacionalidad: user.nacionalidad,
		email: user.email,
		fechaRegistro: user.fechaRegistro,
		rol: user.rol,
		estado: user.estado,
		categoriasModeracion: [],
	};

	return res.json({ data });
});

// PUT /api/admin/usuarios/:id/moderacion
adminRouter.put('/usuarios/:id/moderacion', (req, res) => {
	const id = Number(req.params.id);
	const { idCategorias } = req.body || {};
	const user = db.usuarios.find((u) => u.id === id);

	if (!user) {
		return res.status(404).json({ error: { message: 'Usuario no encontrado.' } });
	}

	user.rol = idCategorias && idCategorias.length > 0 ? 'MODERADOR' : 'USUARIO';
	user.categoriasModeracion = idCategorias;

	const categoriasModeracion = db.categorias.map((c) => ({
		id: c.id,
		nombre: c.nombre,
		icono: c.icono,
		asignada: (idCategorias ?? []).includes(c.id),
	}));

	const data = {
		id: user.id,
		actividadArcaCodigo: user.actividadesArcaCodigo ?? null,
		actividadArca: user.actividadArca ?? null,
		nombre: user.nombre,
		apellido: user.apellido,
		cuil: user.cuil,
		genero: user.genero,
		fechaNacimiento: user.fechaNacimiento,
		nacionalidad: user.nacionalidad,
		email: user.email,
		fechaRegistro: user.fechaRegistro,
		rol: user.rol,
		estado: user.estado,
		categoriasModeracion,
	};

	return res.json({ data });
});

// GET /api/admin/actores
adminRouter.get('/actores', (req, res) => {
	const busqueda = typeof req.query.busqueda === 'string' ? req.query.busqueda.toLowerCase() : undefined;
	const idCategoria = req.query.idCategoria ? Number(req.query.idCategoria) : null;
	const departamento = typeof req.query.departamento === 'string' ? req.query.departamento : undefined;
	const tipoActor = typeof req.query.tipoActor === 'string' ? req.query.tipoActor : undefined;
	const estado = typeof req.query.estado === 'string' ? req.query.estado : undefined;
	const limit = req.query.limit ? Number(req.query.limit) : 10;
	const offset = req.query.offset ? Number(req.query.offset) : 0;

	let result = db.actores;

	if (idCategoria) result = result.filter((a) => a.idCategoria === idCategoria);
	if (departamento) result = result.filter((a) => a.ubicacion?.departamento === departamento);
	if (tipoActor) result = result.filter((a) => a.tipoActor === tipoActor);
	if (estado) result = result.filter((a) => a.estado === estado);

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
		const dueno = db.usuarios.find((u) => u.id === a.idUsuarioDueno);

		return {
			id: a.id,
			nombre: a.nombre,
			descripcion: a.descripcion,
			foto: a.foto,
			cuit: a.cuit,
			tipoActor: a.tipoActor,
			fechaCreacion: a.fechaCreacion,
			estado: a.estado,
			categoria: {
				id: a.idCategoria,
				nombre: cat ? cat.nombre : 'Música',
				icono: cat ? cat.icono : 'MUSICA',
				estado: cat ? cat.estado : 'A',
			},
			subcategoria: subcat ? { id: subcat.id, nombre: subcat.nombre, estado: subcat.estado } : null,
			dueno: dueno ? { id: dueno.id, nombre: `${dueno.nombre} ${dueno.apellido}`, email: dueno.email } : null,
			ubicacion: {
				id: 1,
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
		pagination: { total, count: data.length, limit, offset, hasNext: offset + limit < total },
	});
});

// GET /api/admin/actores/:id
adminRouter.get('/actores/:id', (req, res) => {
	const id = Number(req.params.id);
	const a = db.actores.find((item) => item.id === id);

	if (!a) {
		return res.status(404).json({ error: { message: 'Actor no encontrado.' } });
	}

	const cat = db.categorias.find((c) => c.id === a.idCategoria);
	const subcat = a.idSubcategoria ? db.subcategorias.find((s) => s.id === a.idSubcategoria) : null;
	const dueno = db.usuarios.find((u) => u.id === a.idUsuarioDueno);

	const portafolio = db.portafolioItems
		.filter((p) => p.idActor === id)
		.map((p) => ({
			id: p.id,
			tipo: p.tipo,
			descripcion: p.descripcion,
			url: p.url,
			fechaCreacion: p.fechaCreacion,
		}));

	const integrantes = db.integrantes
		.filter((i) => i.idActor === id)
		.map((i) => ({
			id: i.idUsuario,
			nombre: `${i.nombre} ${i.apellido}`,
			email: i.email,
			rol: i.rol,
			esDueno: i.esDueno,
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
		categoria: {
			id: a.idCategoria,
			nombre: cat ? cat.nombre : 'Música',
			icono: cat ? cat.icono : 'MUSICA',
			estado: cat ? cat.estado : 'A',
		},
		subcategoria: subcat ? { id: subcat.id, nombre: subcat.nombre, estado: subcat.estado } : null,
		dueno: dueno ? { id: dueno.id, nombre: `${dueno.nombre} ${dueno.apellido}`, email: dueno.email } : null,
		ubicacion: {
			id: 1,
			provincia: a.ubicacion?.provincia ?? 'Tucumán',
			departamento: a.ubicacion?.departamento ?? 'Capital',
			localidad: a.ubicacion?.localidad ?? 'San Miguel de Tucumán',
			direccion: a.ubicacion?.direccion ?? '',
			latitud: a.ubicacion?.latitud ?? -26.8241,
			longitud: a.ubicacion?.longitud ?? -65.2226,
			esPublica: a.ubicacion?.esPublica ?? true,
		},
		integrantes,
		portafolio,
		encuestas: [],
	};

	return res.json({ data });
});

// PATCH /api/admin/actores/estado
adminRouter.patch('/actores/estado', (req, res) => {
	const { ids, estado } = req.body || {};

	let count = 0;
	if (Array.isArray(ids)) {
		ids.forEach((id) => {
			const actor = db.actores.find((a) => a.id === Number(id));
			if (actor) {
				actor.estado = estado;
				count++;
			}
		});
	}

	return res.json({ data: { actualizados: count } });
});

// GET /api/admin/categorias
adminRouter.get('/categorias', (req, res) => {
	const busqueda = typeof req.query.busqueda === 'string' ? req.query.busqueda.toLowerCase() : undefined;
	const estado = typeof req.query.estado === 'string' ? req.query.estado : undefined;
	const limit = req.query.limit ? Number(req.query.limit) : 10;
	const offset = req.query.offset ? Number(req.query.offset) : 0;

	let result = db.categorias;

	if (estado) result = result.filter((c) => c.estado === estado);
	if (busqueda) result = result.filter((c) => c.nombre.toLowerCase().includes(busqueda));

	const total = result.length;
	const paginated = result.slice(offset, offset + limit);

	const data = paginated.map((c) => {
		const cantidadSubcategorias = db.subcategorias.filter((s) => s.idCategoria === c.id).length;
		const cantidadActores = db.actores.filter((a) => a.idCategoria === c.id).length;

		return {
			id: c.id,
			nombre: c.nombre,
			icono: c.icono,
			estado: c.estado,
			cantidadSubcategorias,
			cantidadActores,
		};
	});

	return res.json({
		data,
		pagination: { total, count: data.length, limit, offset, hasNext: offset + limit < total },
	});
});

// GET /api/admin/categorias/:id
adminRouter.get('/categorias/:id', (req, res) => {
	const id = Number(req.params.id);
	const c = db.categorias.find((item) => item.id === id);

	if (!c) return res.status(404).json({ error: { message: 'Categoría no encontrada.' } });

	const cantidadSubcategorias = db.subcategorias.filter((s) => s.idCategoria === c.id).length;
	const cantidadActores = db.actores.filter((a) => a.idCategoria === c.id).length;

	return res.json({
		data: {
			id: c.id,
			nombre: c.nombre,
			icono: c.icono,
			estado: c.estado,
			cantidadSubcategorias,
			cantidadActores,
		},
	});
});

// POST /api/admin/categorias
adminRouter.post('/categorias', (req, res) => {
	const attrs = req.body || {};
	const newId = db.categorias.length + 1;
	const newCat: CategoriaMock = {
		id: newId,
		nombre: attrs.nombre,
		icono: attrs.icono,
		estado: attrs.estado ?? 'A',
	};

	db.categorias.push(newCat);

	return res.json({
		data: {
			id: newCat.id,
			nombre: newCat.nombre,
			icono: newCat.icono,
			estado: newCat.estado,
			cantidadSubcategorias: 0,
			cantidadActores: 0,
		},
	});
});

// PUT /api/admin/categorias/:id
adminRouter.put('/categorias/:id', (req, res) => {
	const id = Number(req.params.id);
	const c = db.categorias.find((item) => item.id === id);
	if (!c) return res.status(404).json({ error: { message: 'Categoría no encontrada.' } });

	const attrs = req.body || {};
	c.nombre = attrs.nombre;
	c.icono = attrs.icono;
	c.estado = attrs.estado;

	return res.json({
		data: {
			id: c.id,
			nombre: c.nombre,
			icono: c.icono,
			estado: c.estado,
			cantidadSubcategorias: 0,
			cantidadActores: 0,
		},
	});
});

// DELETE /api/admin/categorias/:id
adminRouter.delete('/categorias/:id', (req, res) => {
	const id = Number(req.params.id);
	db.categorias = db.categorias.filter((c) => c.id !== id);

	return res.json({ data: { id } });
});

// GET /api/admin/categorias/:idCategoria/subcategorias
adminRouter.get('/categorias/:idCategoria/subcategorias', (req, res) => {
	const idCategoria = Number(req.params.idCategoria);
	const busqueda = typeof req.query.busqueda === 'string' ? req.query.busqueda.toLowerCase() : undefined;
	const estado = typeof req.query.estado === 'string' ? req.query.estado : undefined;
	const limit = req.query.limit ? Number(req.query.limit) : 10;
	const offset = req.query.offset ? Number(req.query.offset) : 0;

	let result = db.subcategorias.filter((s) => s.idCategoria === idCategoria);

	if (estado) result = result.filter((s) => s.estado === estado);
	if (busqueda) result = result.filter((s) => s.nombre.toLowerCase().includes(busqueda));

	const total = result.length;
	const paginated = result.slice(offset, offset + limit);

	const data = paginated.map((s) => ({
		idCategoria,
		id: s.id,
		nombre: s.nombre,
		estado: s.estado,
		cantidadActores: db.actores.filter((a) => a.idSubcategoria === s.id).length,
	}));

	return res.json({
		data,
		pagination: { total, count: data.length, limit, offset, hasNext: offset + limit < total },
	});
});

// POST /api/admin/categorias/:idCategoria/subcategorias
adminRouter.post('/categorias/:idCategoria/subcategorias', (req, res) => {
	const idCategoria = Number(req.params.idCategoria);
	const attrs = req.body || {};

	const newId = db.subcategorias.length + 1;
	const newSub: SubcategoriaMock = {
		id: newId,
		idCategoria,
		nombre: attrs.nombre,
		estado: attrs.estado ?? 'A',
	};

	db.subcategorias.push(newSub);

	return res.json({
		data: {
			idCategoria,
			id: newSub.id,
			nombre: newSub.nombre,
			estado: newSub.estado,
			cantidadActores: 0,
		},
	});
});

// GET /api/admin/categorias/:idCategoria/formulario
adminRouter.get('/categorias/:idCategoria/formulario', (req, res) => {
	const idCategoria = Number(req.params.idCategoria);
	const form = db.formularios.find((f) => f.idCategoria === idCategoria && f.ambito === 'CATEGORIA');

	return res.json({ data: form ?? null });
});

// POST/PUT /api/admin/categorias/:idCategoria/formulario
const handleGuardarFormCat = (req: Request, res: Response) => {
	const idCategoria = Number(req.params.idCategoria);
	const cat = db.categorias.find((c) => c.id === idCategoria);
	const attrs = req.body || {};

	let form = db.formularios.find((f) => f.idCategoria === idCategoria && f.ambito === 'CATEGORIA');

	if (!form) {
		form = {
			id: db.formularios.length + 1,
			idCategoria,
			categoria: cat ? cat.nombre : 'Música',
			estadoCategoria: cat ? cat.estado : 'A',
			idSubcategoria: null,
			subcategoria: null,
			estadoSubcategoria: null,
			ambito: 'CATEGORIA',
			titulo: attrs.titulo,
			descripcion: attrs.descripcion ?? null,
			fechaCreacion: new Date().toISOString(),
			cantidadPreguntasHistoricas: 0,
			cantidadPreguntasActivas: 0,
			cantidadActoresConRespuestas: 0,
			preguntas: [],
		};
		db.formularios.push(form);
	} else {
		form.titulo = attrs.titulo;
		form.descripcion = attrs.descripcion ?? null;
	}

	return res.json({ data: form });
};

adminRouter.post('/categorias/:idCategoria/formulario', handleGuardarFormCat);
adminRouter.put('/categorias/:idCategoria/formulario', handleGuardarFormCat);

// GET /api/admin/preguntas
adminRouter.get('/preguntas', (req, res) => {
	const busqueda = typeof req.query.busqueda === 'string' ? req.query.busqueda.toLowerCase() : undefined;
	let result = db.preguntasBanco;

	if (busqueda) {
		result = result.filter((p) => p.pregunta.toLowerCase().includes(busqueda));
	}

	const data = result.map((p) => ({
		id: p.id,
		pregunta: p.pregunta,
		tipoDato: p.tipoDato,
		opciones: p.opciones ?? null,
	}));

	return res.json({ data });
});

// POST /api/admin/preguntas
adminRouter.post('/preguntas', (req, res) => {
	const attrs = req.body || {};
	const newId = db.preguntasBanco.length + 1;
	const p: PreguntaBancoMock = {
		id: newId,
		pregunta: attrs.pregunta,
		tipoDato: attrs.tipoDato,
		opciones: attrs.opciones ?? null,
	};

	db.preguntasBanco.push(p);

	return res.json({ data: p });
});
