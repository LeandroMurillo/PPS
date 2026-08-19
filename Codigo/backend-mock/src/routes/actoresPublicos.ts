import { Router } from 'express';
import { db } from '../db';
import { getAuthUser } from './auth';

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
		return res
			.status(404)
			.json({ error: { message: 'No se encontró un actor público con el identificador solicitado.' } });
	}

	const user = getAuthUser(req);
	const isPrivileged = Boolean(
		user &&
		(user.rol === 'ADMIN' ||
			user.rol === 'MODERADOR' ||
			actor.idUsuarioDueno === user.id ||
			db.integrantes.some((i) => i.idActor === id && i.idUsuario === user.id)),
	);

	// Si el actor no está activo (P o I), solo es visible para admin, moderador o sus integrantes
	if (actor.estado !== 'A' && !isPrivileged) {
		return res.status(404).json({
			error: {
				code: 'ACTOR_NOT_FOUND',
				message: 'No se encontró un actor público activo con el identificador solicitado.',
			},
		});
	}

	const cat = db.categorias.find((c) => c.id === actor.idCategoria);
	const subcat = actor.idSubcategoria ? db.subcategorias.find((s) => s.id === actor.idSubcategoria) : null;
	const dueno = db.usuarios.find((u) => u.id === actor.idUsuarioDueno);

	const portafolio = db.portafolioItems
		.filter((p) => p.idActor === id)
		.map((p) => ({
			id: p.id,
			tipo: p.tipo,
			descripcion: p.descripcion,
			url: p.url,
			fechaCreacion: p.fechaCreacion,
		}));

	const eventos = db.eventos
		.filter((e) => e.idActor === id)
		.map((e) => ({ nombre: e.nombre, descripcion: e.descripcion, fecha: e.fecha }));

	const integrantes = db.integrantes
		.filter((i) => i.idActor === id)
		.map((i) => ({
			id: i.idUsuario,
			tipo: i.tipo,
			nombre: i.nombre,
			apellido: i.apellido,
			email: isPrivileged ? i.email : undefined,
			rol: i.rol,
			esDueno: i.esDueno,
		}));

	const esUbicacionPublica = actor.ubicacion?.esPublica ?? true;
	const incluirDetalleUbicacion = esUbicacionPublica || isPrivileged;

	// Obtener preguntas de los formularios aplicables a esta categoría y subcategoría
	const relevantForms = db.formularios.filter(
		(f) => f.idCategoria === actor.idCategoria && (!f.idSubcategoria || f.idSubcategoria === actor.idSubcategoria),
	);
	const allQuestions = relevantForms.flatMap((f) => f.preguntas);

	let respuestas: { pregunta: string; respuesta: string; publica?: boolean }[] = [];

	if (actor.respuestasFormulario && Object.keys(actor.respuestasFormulario).length > 0) {
		respuestas = Object.entries(actor.respuestasFormulario)
			.map(([idPreguntaStr, val]) => {
				const qId = Number(idPreguntaStr);
				const question = allQuestions.find((q) => q.id === qId);
				const preguntaText = question ? question.pregunta : `Pregunta ${qId}`;
				const isPublic = question ? question.esPublico : false; // Por defecto privada si no se encuentra
				const valorStr = Array.isArray(val) ? val.join(', ') : String(val ?? '');
				return {
					pregunta: preguntaText,
					respuesta: valorStr,
					publica: isPublic,
				};
			})
			.filter((r) => Boolean(r.respuesta.trim()));
	} else {
		// Respuestas base de fallback
		const respuestasBase = [
			{ pregunta: '¿Cuenta con espacio propio?', respuesta: 'Sí', publica: true },
			{ pregunta: '¿Años de actividad?', respuesta: '5 años', publica: true },
			{ pregunta: 'Presupuesto anual estimado', respuesta: '$1.500.000', publica: false },
		];
		respuestas = respuestasBase;
	}

	if (!isPrivileged) {
		respuestas = respuestas
			.filter((r) => r.publica !== false)
			.map(({ pregunta, respuesta }) => ({ pregunta, respuesta }));
	}

	const data = {
		id: actor.id,
		nombre: actor.nombre,
		descripcion: actor.descripcion,
		foto: actor.foto,
		cuit: isPrivileged ? (actor.cuit ?? null) : null,
		tipoActor: actor.tipoActor,
		estado: actor.estado,
		categoria: cat ? cat.nombre : 'Música',
		categoriaIcono: cat ? cat.icono : 'MUSICA',
		subcategoria: subcat ? subcat.nombre : null,
		dueno:
			isPrivileged && dueno
				? {
						id: dueno.id,
						nombre: `${dueno.nombre} ${dueno.apellido}`,
						email: dueno.email,
					}
				: null,
		ubicacion: {
			provincia: actor.ubicacion?.provincia ?? 'Tucumán',
			departamento: actor.ubicacion?.departamento ?? 'Capital',
			localidad: actor.ubicacion?.localidad ?? null,
			esPublica: esUbicacionPublica,
			direccion: incluirDetalleUbicacion ? (actor.ubicacion?.direccion ?? null) : null,
			latitud: incluirDetalleUbicacion ? (actor.ubicacion?.latitud ?? null) : null,
			longitud: incluirDetalleUbicacion ? (actor.ubicacion?.longitud ?? null) : null,
		},
		portafolio,
		eventos,
		respuestas,
		integrantes,
	};

	return res.json({ data });
});
