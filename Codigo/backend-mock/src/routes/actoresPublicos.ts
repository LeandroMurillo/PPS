import { Router } from 'express';
import { db } from '../db';

export const actoresPublicosRouter = Router();

// GET /api/publico/actores/filtros
actoresPublicosRouter.get('/filtros', (_req, res) => {
	const categorias = db.categorias
		.filter((cat) => cat.estado === 'A')
		.map((cat) => {
			const count = db.actores.filter((a) => a.idCategoria === cat.id && a.estado === 'A').length;
			return {
				id: cat.id,
				nombre: cat.nombre,
				icono: cat.icono,
				cantidadActores: count,
			};
		});

	const departamentosSet = new Set<string>();
	db.actores
		.filter((a) => a.estado === 'A')
		.forEach((a) => {
			if (a.ubicacion?.departamento) {
				departamentosSet.add(a.ubicacion.departamento);
			}
		});

	const departamentos = Array.from(departamentosSet).map((dep) => ({
		departamento: dep,
		cantidadActores: db.actores.filter((a) => a.estado === 'A' && a.ubicacion?.departamento === dep).length,
	}));

	return res.json({ categorias, departamentos });
});

// GET /api/publico/actores/mapa/filtros
actoresPublicosRouter.get('/mapa/filtros', (_req, res) => {
	const categorias = db.categorias
		.filter((cat) => cat.estado === 'A')
		.map((cat) => {
			const count = db.actores.filter((a) => a.idCategoria === cat.id && a.estado === 'A').length;
			return {
				id: cat.id,
				nombre: cat.nombre,
				icono: cat.icono,
				cantidadActores: count,
			};
		});

	const departamentosSet = new Set<string>();
	db.actores
		.filter((a) => a.estado === 'A')
		.forEach((a) => {
			if (a.ubicacion?.departamento) {
				departamentosSet.add(a.ubicacion.departamento);
			}
		});

	const departamentos = Array.from(departamentosSet).map((dep) => ({
		departamento: dep,
		cantidadActores: db.actores.filter((a) => a.estado === 'A' && a.ubicacion?.departamento === dep).length,
	}));

	return res.json({ categorias, departamentos });
});

// GET /api/publico/actores
actoresPublicosRouter.get('/', (req, res) => {
	const busqueda = typeof req.query.busqueda === 'string' ? req.query.busqueda.toLowerCase() : undefined;
	const departamento = typeof req.query.departamento === 'string' ? req.query.departamento : undefined;
	const idCategoria = req.query.idCategoria ? Number(req.query.idCategoria) : null;
	const limit = req.query.limit ? Number(req.query.limit) : 10;
	const offset = req.query.offset ? Number(req.query.offset) : 0;

	let result = db.actores.filter((a) => a.estado === 'A');

	if (idCategoria) {
		result = result.filter((a) => a.idCategoria === idCategoria);
	}

	if (departamento) {
		result = result.filter((a) => a.ubicacion?.departamento === departamento);
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
			categoria: cat ? cat.nombre : 'Música',
			categoriaIcono: cat ? cat.icono : 'MUSICA',
			subcategoria: subcat ? subcat.nombre : null,
			departamento: a.ubicacion?.departamento ?? 'Capital',
			localidad: a.ubicacion?.localidad ?? null,
		};
	});

	return res.json({
		data,
		pagination: {
			total,
			count: data.length,
			limit,
			offset,
			hasNext: offset + limit < total,
		},
	});
});

// GET /api/publico/actores/mapa
actoresPublicosRouter.get('/mapa', (req, res) => {
	const busqueda = typeof req.query.busqueda === 'string' ? req.query.busqueda.toLowerCase() : undefined;
	const departamento = typeof req.query.departamento === 'string' ? req.query.departamento : undefined;
	const categoriasQuery = req.query.categorias;

	let categoriasArray: number[] = [];
	if (Array.isArray(categoriasQuery)) {
		categoriasArray = categoriasQuery.map(Number);
	} else if (typeof categoriasQuery === 'string') {
		categoriasArray = [Number(categoriasQuery)];
	}

	let result = db.actores.filter((a) => a.estado === 'A');

	if (categoriasArray.length > 0) {
		result = result.filter((a) => categoriasArray.includes(a.idCategoria));
	}

	if (departamento) {
		result = result.filter((a) => a.ubicacion?.departamento === departamento);
	}

	if (busqueda) {
		result = result.filter(
			(a) =>
				a.nombre.toLowerCase().includes(busqueda) ||
				(a.descripcion && a.descripcion.toLowerCase().includes(busqueda)),
		);
	}

	const data = result.map((a) => {
		const cat = db.categorias.find((c) => c.id === a.idCategoria);
		const subcat = a.idSubcategoria ? db.subcategorias.find((s) => s.id === a.idSubcategoria) : null;

		return {
			id: a.id,
			nombre: a.nombre,
			descripcion: a.descripcion,
			foto: a.foto,
			categoria: cat ? cat.nombre : 'Música',
			categoriaIcono: cat ? cat.icono : 'MUSICA',
			subcategoria: subcat ? subcat.nombre : null,
			departamento: a.ubicacion?.departamento ?? 'Capital',
			localidad: a.ubicacion?.localidad ?? null,
			direccion: a.ubicacion?.esPublica ? a.ubicacion?.direccion : null,
			latitud: a.ubicacion?.latitud ?? -26.8241,
			longitud: a.ubicacion?.longitud ?? -65.2226,
		};
	});

	return res.json({ data });
});

// GET /api/publico/actores/:id
actoresPublicosRouter.get('/:id', (req, res) => {
	const id = Number(req.params.id);
	const actor = db.actores.find((a) => a.id === id);

	if (!actor) {
		return res.status(404).json({ error: { message: 'Actor no encontrado.' } });
	}

	const cat = db.categorias.find((c) => c.id === actor.idCategoria);
	const subcat = actor.idSubcategoria ? db.subcategorias.find((s) => s.id === actor.idSubcategoria) : null;

	const portafolio = db.portafolioItems
		.filter((p) => p.idActor === id)
		.map((p) => ({ tipo: p.tipo, descripcion: p.descripcion, url: p.url }));

	const eventos = db.eventos
		.filter((e) => e.idActor === id)
		.map((e) => ({ nombre: e.nombre, descripcion: e.descripcion, fecha: e.fecha }));

	const integrantes = db.integrantes
		.filter((i) => i.idActor === id)
		.map((i) => ({ nombre: i.nombre, apellido: i.apellido, rol: i.rol }));

	const data = {
		id: actor.id,
		nombre: actor.nombre,
		descripcion: actor.descripcion,
		foto: actor.foto,
		estado: actor.estado,
		categoria: cat ? cat.nombre : 'Música',
		categoriaIcono: cat ? cat.icono : 'MUSICA',
		subcategoria: subcat ? subcat.nombre : null,
		ubicacion: {
			provincia: actor.ubicacion?.provincia ?? 'Tucumán',
			departamento: actor.ubicacion?.departamento ?? 'Capital',
			localidad: actor.ubicacion?.localidad ?? null,
			esPublica: actor.ubicacion?.esPublica ?? true,
			direccion: actor.ubicacion?.direccion ?? null,
			latitud: actor.ubicacion?.latitud ?? null,
			longitud: actor.ubicacion?.longitud ?? null,
		},
		portafolio,
		eventos,
		respuestas: [
			{ pregunta: '¿Cuenta con espacio propio?', respuesta: 'Sí' },
			{ pregunta: '¿Años de actividad?', respuesta: '5 años' },
		],
		integrantes,
	};

	return res.json({ data });
});
