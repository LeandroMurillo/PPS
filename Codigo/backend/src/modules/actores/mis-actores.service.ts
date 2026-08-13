import {
	agregarEventoRepository,
	agregarIntegranteRepository,
	agregarItemPortafolioRepository,
	cambiarEstadoActorRepository,
	crearActorRepository,
	editarActorRepository,
	eliminarActorRepository,
	eliminarEventoRepository,
	eliminarIntegranteRepository,
	eliminarItemPortafolioRepository,
	listarEventosRepository,
	listarIntegrantesRepository,
	listarMisActoresRepository,
	listarPortafolioRepository,
	obtenerFormulariosAplicablesRepository,
	obtenerOpcionesRegistroRepository,
} from './mis-actores.repository.js';
import { removeSavedActorImages, saveActorImage, type SavedActorImage } from './actor-media.service.js';

function validarValorRespuesta(
	pregunta: {
		pregunta: string;
		tipoDato: string;
		opciones: string[] | null;
	},
	valor: unknown,
): void {
	const invalid = () => {
		throw new Error(`La respuesta a “${pregunta.pregunta}” no tiene el formato esperado.`);
	};

	switch (pregunta.tipoDato) {
		case 'NUMERO':
			if (typeof valor !== 'number' || !Number.isFinite(valor)) invalid();
			return;
		case 'BOOLEANO':
			if (typeof valor !== 'boolean') invalid();
			return;
		case 'OPCION_MULTIPLE':
			if (
				!Array.isArray(valor) ||
				valor.some((item) => typeof item !== 'string' || !pregunta.opciones?.includes(item))
			) {
				invalid();
			}
			return;
		case 'OPCION_UNICA':
			if (typeof valor !== 'string' || !pregunta.opciones?.includes(valor)) invalid();
			return;
		case 'URL':
			if (typeof valor !== 'string') invalid();
			try {
				const parsed = new URL(String(valor));
				if (!['http:', 'https:'].includes(parsed.protocol)) invalid();
			} catch {
				invalid();
			}
			return;
		case 'EMAIL':
			if (typeof valor !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) invalid();
			return;
		case 'FECHA':
			if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) invalid();
			return;
		default:
			if (typeof valor !== 'string' || valor.trim() === '') invalid();
	}
}

export async function obtenerOpcionesRegistroService() {
	const rows = await obtenerOpcionesRegistroRepository();
	const categorias = new Map<
		number,
		{
			id: number;
			nombre: string;
			icono: (typeof rows)[number]['icono'];
			subcategorias: { id: number; nombre: string }[];
		}
	>();

	for (const row of rows) {
		let categoria = categorias.get(row.idCategoria);

		if (!categoria) {
			categoria = {
				id: row.idCategoria,
				nombre: row.categoria,
				icono: row.icono,
				subcategorias: [],
			};
			categorias.set(row.idCategoria, categoria);
		}

		if (row.idSubcategoria !== null && row.subcategoria) {
			categoria.subcategorias.push({ id: row.idSubcategoria, nombre: row.subcategoria });
		}
	}

	return { data: Array.from(categorias.values()) };
}

export async function obtenerFormulariosAplicablesService(input: {
	idCategoria: number;
	idSubcategoria?: number | null | undefined;
}) {
	const opciones = await obtenerOpcionesRegistroService();
	const categoria = opciones.data.find((item) => item.id === input.idCategoria);

	if (!categoria) {
		throw new Error('La categoría seleccionada no existe o está inactiva.');
	}

	if (
		input.idSubcategoria !== null &&
		input.idSubcategoria !== undefined &&
		!categoria.subcategorias.some((item) => item.id === input.idSubcategoria)
	) {
		throw new Error('La subcategoría seleccionada no corresponde a la categoría.');
	}

	const rows = await obtenerFormulariosAplicablesRepository(input);
	const formularios = new Map<
		number,
		{
			id: number;
			ambito: 'CATEGORIA' | 'SUBCATEGORIA';
			idCategoria: number;
			categoria: string;
			idSubcategoria: number | null;
			subcategoria: string | null;
			titulo: string;
			descripcion: string | null;
			preguntas: {
				id: number;
				pregunta: string;
				tipoDato: NonNullable<(typeof rows)[number]['tipoDato']>;
				opciones: string[] | null;
				orden: number;
				esObligatorio: boolean;
				esPublico: boolean;
			}[];
		}
	>();

	for (const row of rows) {
		let formulario = formularios.get(row.idFormulario);

		if (!formulario) {
			formulario = {
				id: row.idFormulario,
				ambito: row.idSubcategoria === 0 ? 'CATEGORIA' : 'SUBCATEGORIA',
				idCategoria: row.idCategoria,
				categoria: row.categoria,
				idSubcategoria: row.idSubcategoria === 0 ? null : row.idSubcategoria,
				subcategoria: row.subcategoria,
				titulo: row.titulo,
				descripcion: row.descripcion,
				preguntas: [],
			};
			formularios.set(row.idFormulario, formulario);
		}

		if (row.idPregunta !== null && row.pregunta && row.tipoDato && row.orden !== null) {
			formulario.preguntas.push({
				id: row.idPregunta,
				pregunta: row.pregunta,
				tipoDato: row.tipoDato,
				opciones: row.opciones,
				orden: row.orden,
				esObligatorio: Boolean(row.esObligatorio),
				esPublico: Boolean(row.esPublico),
			});
		}
	}

	return { data: Array.from(formularios.values()) };
}

export async function listarMisActoresService(input: {
	idUsuario: number;
	busqueda?: string | undefined;
	idCategoria?: number | undefined;
	estado?: 'A' | 'P' | 'I' | undefined;
	limit?: number | undefined;
	offset?: number | undefined;
}) {
	const limit = Math.min(Math.max(input.limit ?? 25, 1), 100);
	const offset = Math.max(input.offset ?? 0, 0);

	const { total, rows } = await listarMisActoresRepository({
		idUsuario: input.idUsuario,
		busqueda: input.busqueda,
		idCategoria: input.idCategoria,
		estado: input.estado,
		limit,
		offset,
	});

	return {
		data: rows.map((actor) => ({
			id: actor.idActor,
			nombre: actor.nombre,
			descripcion: actor.descripcion,
			foto: actor.fotoPerfilUrl,
			cuit: actor.cuit,
			tipoActor: actor.tipoActor,
			fechaCreacion: actor.fechaCreacion,
			estado: actor.estado,
			categoria: actor.categoria,
			categoriaIcono: actor.iconoCategoria,
			subcategoria: actor.subcategoria,
			ubicacion: {
				provincia: actor.provincia,
				departamento: actor.departamento,
				localidad: actor.localidad,
				direccion: actor.direccion,
				latitud: actor.latitud,
				longitud: actor.longitud,
			},
		})),
		pagination: {
			total,
			limit,
			offset,
			hasNext: offset + limit < total,
		},
	};
}

export async function crearActorService(input: {
	idUsuario: number;
	idCategoria: number;
	idSubcategoria?: number | null | undefined;
	nombre: string;
	descripcion: string;
	fotoPerfilUrl?: string | null | undefined;
	fotoPerfilBase64?: string | null | undefined;
	cuit?: string | null | undefined;
	tipoActor: 'INDIVIDUO' | 'COLECTIVO' | 'ESPACIO';
	provincia?: string | null | undefined;
	departamento: string;
	localidad: string;
	direccion: string;
	latitud: number;
	longitud: number;
	esPublica: boolean;
	respuestas?: { idFormulario: number; idPregunta: number; valor: unknown }[] | undefined;
	portafolio?:
		| {
				tipo: 'IMAGEN' | 'VIDEO' | 'ENLACE';
				titulo: string;
				descripcion?: string | null | undefined;
				url?: string | null | undefined;
				imagenBase64?: string | null | undefined;
		  }[]
		| undefined;
}) {
	const formularios = await obtenerFormulariosAplicablesService({
		idCategoria: input.idCategoria,
		idSubcategoria: input.idSubcategoria,
	});
	const preguntasAplicables = new Map<
		string,
		{
			formulario: (typeof formularios.data)[number];
			pregunta: (typeof formularios.data)[number]['preguntas'][number];
		}
	>(
		formularios.data.flatMap((formulario) =>
			formulario.preguntas.map((pregunta) => [
				`${formulario.id}:${pregunta.id}`,
				{ formulario, pregunta },
			] as const),
		),
	);
	const respuestas = input.respuestas ?? [];
	const respuestasPorPregunta = new Map<string, (typeof respuestas)[number]>();

	for (const respuesta of respuestas) {
		const key = `${respuesta.idFormulario}:${respuesta.idPregunta}`;
		const aplicable = preguntasAplicables.get(key);
		if (!aplicable) {
			throw new Error('Una de las respuestas no pertenece a los formularios aplicables al actor.');
		}
		if (respuestasPorPregunta.has(key)) {
			throw new Error('No se puede enviar dos veces la respuesta a una misma pregunta.');
		}
		validarValorRespuesta(aplicable.pregunta, respuesta.valor);
		respuestasPorPregunta.set(key, respuesta);
	}

	for (const [key, { pregunta }] of preguntasAplicables) {
		if (!pregunta.esObligatorio) continue;
		const respuesta = respuestasPorPregunta.get(key);
		const valor = respuesta?.valor;
		const estaVacia =
			valor === null ||
			valor === undefined ||
			(typeof valor === 'string' && valor.trim() === '') ||
			(Array.isArray(valor) && valor.length === 0);
		if (estaVacia) {
			throw new Error(`Falta responder la pregunta obligatoria: ${pregunta.pregunta}`);
		}
	}

	const savedImages: SavedActorImage[] = [];
	try {
		let fotoPerfilUrl = input.fotoPerfilUrl ?? null;
		if (input.fotoPerfilBase64) {
			const image = saveActorImage(input.fotoPerfilBase64, 'perfil');
			savedImages.push(image);
			fotoPerfilUrl = image.url;
		}

		const portafolio = (input.portafolio ?? []).map((item) => {
			let url = item.url ?? '';
			if (item.tipo === 'IMAGEN') {
				if (!item.imagenBase64) throw new Error(`Falta la imagen del trabajo “${item.titulo}”.`);
				const image = saveActorImage(item.imagenBase64, 'portafolio');
				savedImages.push(image);
				url = image.url;
			}
			if (!url) throw new Error(`Falta el enlace del trabajo “${item.titulo}”.`);

			const descripcion = item.descripcion?.trim()
				? `${item.titulo.trim()}\n${item.descripcion.trim()}`
				: item.titulo.trim();
			const esRedSocial = /(?:instagram|facebook|tiktok|x\.com|twitter)\./i.test(url);

			return {
				tipo: item.tipo === 'IMAGEN' ? ('IMAGEN' as const) : esRedSocial ? ('RRSS' as const) : ('LINK' as const),
				descripcion,
				url,
			};
		});

		return await crearActorRepository({
			idUsuario: input.idUsuario,
			idCategoria: input.idCategoria,
			idSubcategoria: input.idSubcategoria,
			nombre: input.nombre,
			descripcion: input.descripcion,
			fotoPerfilUrl,
			cuit: input.cuit,
			tipoActor: input.tipoActor,
			provincia: input.provincia,
			departamento: input.departamento,
			localidad: input.localidad,
			direccion: input.direccion,
			latitud: input.latitud,
			longitud: input.longitud,
			esPublica: input.esPublica,
			respuestas,
			portafolio,
		});
	} catch (error) {
		removeSavedActorImages(savedImages);
		throw error;
	}
}

export async function editarActorService(input: {
	idUsuario: number;
	idActor: number;
	idCategoria: number;
	idSubcategoria?: number | null | undefined;
	nombre: string;
	descripcion: string;
	fotoPerfilUrl?: string | null | undefined;
	fotoPerfilBase64?: string | null | undefined;
	cuit?: string | null | undefined;
	tipoActor: 'INDIVIDUO' | 'COLECTIVO' | 'ESPACIO';
	departamento: string;
	localidad: string;
	direccion: string;
	userRol: 'USUARIO' | 'MODERADOR' | 'ADMIN';
}) {
	const esAdmin = input.userRol === 'ADMIN' || input.userRol === 'MODERADOR';
	const savedImages: SavedActorImage[] = [];
	try {
		let fotoPerfilUrl = input.fotoPerfilUrl ?? null;
		if (input.fotoPerfilBase64) {
			const image = saveActorImage(input.fotoPerfilBase64, 'perfil');
			savedImages.push(image);
			fotoPerfilUrl = image.url;
		}

		await editarActorRepository({
			idUsuario: input.idUsuario,
			idActor: input.idActor,
			idCategoria: input.idCategoria,
			idSubcategoria: input.idSubcategoria,
			nombre: input.nombre,
			descripcion: input.descripcion,
			fotoPerfilUrl,
			cuit: input.cuit,
			tipoActor: input.tipoActor,
			departamento: input.departamento,
			localidad: input.localidad,
			direccion: input.direccion,
			esAdmin,
		});

		return { fotoPerfilUrl };
	} catch (error) {
		removeSavedActorImages(savedImages);
		throw error;
	}
}

export async function cambiarEstadoActorService(input: {
	idUsuario: number;
	idActor: number;
	nuevoEstado: 'A' | 'P' | 'I';
	userRol: 'USUARIO' | 'MODERADOR' | 'ADMIN';
}) {
	const esAdmin = input.userRol === 'ADMIN' || input.userRol === 'MODERADOR';

	if (input.nuevoEstado === 'A' && !esAdmin) {
		throw new Error('Solo los administradores o moderadores pueden activar un actor.');
	}

	await cambiarEstadoActorRepository({
		idUsuario: input.idUsuario,
		idActor: input.idActor,
		nuevoEstado: input.nuevoEstado,
		esAdmin,
	});
}

export async function eliminarActorService(input: {
	idUsuario: number;
	idActor: number;
	userRol: 'USUARIO' | 'MODERADOR' | 'ADMIN';
}) {
	const esAdmin = input.userRol === 'ADMIN' || input.userRol === 'MODERADOR';

	await eliminarActorRepository({
		idUsuario: input.idUsuario,
		idActor: input.idActor,
		esAdmin,
	});
}

export async function agregarItemPortafolioService(input: {
	idUsuario: number;
	idActor: number;
	tipo: 'IMAGEN' | 'LINK' | 'RRSS';
	descripcion: string;
	url: string;
}) {
	return agregarItemPortafolioRepository(input);
}

export async function eliminarItemPortafolioService(input: { idUsuario: number; idItem: number }) {
	await eliminarItemPortafolioRepository(input);
}

export async function listarPortafolioService(input: { idUsuario: number; idActor: number }) {
	return listarPortafolioRepository(input);
}

export async function agregarEventoService(input: {
	idUsuario: number;
	idActor: number;
	nombre: string;
	descripcion: string;
	fecha?: string | null | undefined;
}) {
	return agregarEventoRepository(input);
}

export async function listarEventosService(input: { idUsuario: number; idActor: number }) {
	return listarEventosRepository(input);
}

export async function eliminarEventoService(input: { idUsuario: number; idActor: number; idEvento: number }) {
	await eliminarEventoRepository(input);
}

export async function listarIntegrantesService(input: { idUsuario: number; idActor: number }) {
	return listarIntegrantesRepository(input);
}

export async function agregarIntegranteService(input: {
	idUsuario: number;
	idActor: number;
	email: string;
	rol: string;
}) {
	await agregarIntegranteRepository(input);
}

export async function eliminarIntegranteService(input: {
	idUsuario: number;
	idActor: number;
	idUsuarioAEliminar: number;
}) {
	await eliminarIntegranteRepository(input);
}
