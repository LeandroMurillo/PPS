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
	listarIntegrantesRepository,
	listarMisActoresRepository,
} from './mis-actores.repository.js';

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
	cuit?: string | null | undefined;
	tipoActor: 'INDIVIDUO' | 'COLECTIVO' | 'ESPACIO';
	provincia?: string | null | undefined;
	departamento: string;
	localidad: string;
	direccion: string;
	latitud?: number | null | undefined;
	longitud?: number | null | undefined;
}) {
	return crearActorRepository(input);
}

export async function editarActorService(input: {
	idUsuario: number;
	idActor: number;
	idCategoria: number;
	idSubcategoria?: number | null | undefined;
	nombre: string;
	descripcion: string;
	fotoPerfilUrl?: string | null | undefined;
	cuit?: string | null | undefined;
	tipoActor: 'INDIVIDUO' | 'COLECTIVO' | 'ESPACIO';
	departamento: string;
	localidad: string;
	direccion: string;
	userRol: 'USUARIO' | 'MODERADOR' | 'ADMIN';
}) {
	const esAdmin = input.userRol === 'ADMIN' || input.userRol === 'MODERADOR';
	await editarActorRepository({
		...input,
		esAdmin,
	});
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

export async function eliminarItemPortafolioService(input: {
	idUsuario: number;
	idItem: number;
}) {
	await eliminarItemPortafolioRepository(input);
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

export async function eliminarEventoService(input: {
	idUsuario: number;
	idEvento: number;
}) {
	await eliminarEventoRepository(input);
}

export async function listarIntegrantesService(input: {
	idUsuario: number;
	idActor: number;
}) {
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
