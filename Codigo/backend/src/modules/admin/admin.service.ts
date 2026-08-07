import {
	asignarModeradorAdminRepository,
	cambiarEstadoUsuarioAdminRepository,
	listarActoresAdminRepository,
	listarUsuariosAdminRepository,
	obtenerUsuarioAdminRepository,
} from './admin.repository.js';

import type {
	ListarActoresAdminQuery,
	ListarActoresAdminResponse,
	ListarUsuariosAdminQuery,
	ListarUsuariosAdminResponse,
	ObtenerUsuarioAdminResponse,
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

export async function obtenerUsuarioAdminService(
	id: number,
): Promise<ObtenerUsuarioAdminResponse | null> {
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

export async function listarActoresAdminService(
	query: ListarActoresAdminQuery,
): Promise<ListarActoresAdminResponse> {
	const result = await listarActoresAdminRepository(query);

	return {
		data: result.actores,
		pagination: pagination(result.total, result.actores.length, query.limit, query.offset),
	};
}
