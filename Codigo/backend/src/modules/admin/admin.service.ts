import {
	asignarModeradorAdminRepository,
	cambiarEstadoActoresAdminRepository,
	cambiarEstadoUsuarioAdminRepository,
	crearCategoriaAdminRepository,
	editarCategoriaAdminRepository,
	eliminarCategoriaAdminRepository,
	listarActoresAdminRepository,
	listarCategoriasAdminRepository,
	listarUsuariosAdminRepository,
	obtenerActorAdminRepository,
	obtenerCategoriaAdminRepository,
	obtenerUsuarioAdminRepository,
} from './admin.repository.js';

import type {
	ListarActoresAdminQuery,
	ListarActoresAdminResponse,
	ListarCategoriasAdminQuery,
	ListarCategoriasAdminResponse,
	ListarUsuariosAdminQuery,
	ListarUsuariosAdminResponse,
	ObtenerUsuarioAdminResponse,
	ObtenerActorAdminResponse,
	ObtenerCategoriaAdminResponse,
	CambiarEstadoActoresAdminResponse,
} from './admin.schemas.js';

function pagination(total: number, count: number, limit: number, offset: number) {
	return {
		total,
		count,
		limit,
		offset,
		hasNext: offset + count < total,
	};
}

export async function listarUsuariosAdminService(
	query: ListarUsuariosAdminQuery,
): Promise<ListarUsuariosAdminResponse> {
	const result = await listarUsuariosAdminRepository(query);

	return {
		data: result.usuarios,
		pagination: pagination(result.total, result.usuarios.length, query.limit, query.offset),
	};
}

export async function obtenerUsuarioAdminService(id: number): Promise<ObtenerUsuarioAdminResponse | null> {
	const usuario = await obtenerUsuarioAdminRepository(id);

	return usuario ? { data: usuario } : null;
}

export async function cambiarEstadoUsuarioAdminService(
	id: number,
	estado: 'A' | 'I',
): Promise<ObtenerUsuarioAdminResponse | null> {
	const usuario = await cambiarEstadoUsuarioAdminRepository(id, estado);

	return usuario ? { data: usuario } : null;
}

export async function asignarModeradorAdminService(
	id: number,
	idCategorias: number[],
): Promise<ObtenerUsuarioAdminResponse | null> {
	const usuario = await asignarModeradorAdminRepository(id, idCategorias);

	return usuario ? { data: usuario } : null;
}

export async function listarActoresAdminService(query: ListarActoresAdminQuery): Promise<ListarActoresAdminResponse> {
	const result = await listarActoresAdminRepository(query);

	return {
		data: result.actores,
		pagination: pagination(result.total, result.actores.length, query.limit, query.offset),
	};
}

export async function obtenerActorAdminService(id: number): Promise<ObtenerActorAdminResponse | null> {
	const actor = await obtenerActorAdminRepository(id);

	return actor ? { data: actor } : null;
}

export async function cambiarEstadoActoresAdminService(
	ids: number[],
	estado: 'A' | 'I',
): Promise<CambiarEstadoActoresAdminResponse> {
	return { data: { actualizados: await cambiarEstadoActoresAdminRepository(ids, estado) } };
}

export async function listarCategoriasAdminService(
	query: ListarCategoriasAdminQuery,
): Promise<ListarCategoriasAdminResponse> {
	const result = await listarCategoriasAdminRepository(query);

	return {
		data: result.categorias,
		pagination: pagination(result.total, result.categorias.length, query.limit, query.offset),
	};
}

export async function obtenerCategoriaAdminService(id: number): Promise<ObtenerCategoriaAdminResponse | null> {
	const categoria = await obtenerCategoriaAdminRepository(id);

	return categoria ? { data: categoria } : null;
}

export async function crearCategoriaAdminService(
	nombre: string,
	icono: string,
	estado: 'A' | 'I',
): Promise<ObtenerCategoriaAdminResponse> {
	return { data: await crearCategoriaAdminRepository(nombre, icono, estado) };
}

export async function editarCategoriaAdminService(
	id: number,
	nombre: string,
	icono: string,
	estado: 'A' | 'I',
): Promise<ObtenerCategoriaAdminResponse> {
	return { data: await editarCategoriaAdminRepository(id, nombre, icono, estado) };
}

export async function eliminarCategoriaAdminService(id: number): Promise<ObtenerCategoriaAdminResponse> {
	return { data: await eliminarCategoriaAdminRepository(id) };
}
