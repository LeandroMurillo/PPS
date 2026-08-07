import type { RequestHandler } from 'express';

import {
	asignarModeradorAdminBodySchema,
	cambiarEstadoUsuarioAdminBodySchema,
	categoriaAdminParamsSchema,
	guardarCategoriaAdminBodySchema,
	listarActoresAdminQuerySchema,
	listarCategoriasAdminQuerySchema,
	listarUsuariosAdminQuerySchema,
	usuarioAdminParamsSchema,
} from './admin.schemas.js';
import {
	asignarModeradorAdminService,
	cambiarEstadoUsuarioAdminService,
	crearCategoriaAdminService,
	editarCategoriaAdminService,
	eliminarCategoriaAdminService,
	listarActoresAdminService,
	listarCategoriasAdminService,
	listarUsuariosAdminService,
	obtenerCategoriaAdminService,
	obtenerUsuarioAdminService,
} from './admin.service.js';

function validationError(issues: { path: PropertyKey[]; code: string; message: string }[]) {
	return {
		error: {
			code: 'INVALID_QUERY_PARAMETERS',
			message: 'Los parámetros de consulta no son válidos',
			details: issues.map((issue) => ({
				field: issue.path.join('.'),
				code: issue.code,
				message: issue.message,
			})),
		},
	};
}

function userNotFound(response: Parameters<RequestHandler>[1]) {
	response.status(404).json({
		error: {
			code: 'USER_NOT_FOUND',
			message: 'No se encontró el usuario solicitado',
		},
	});
}

function adminUserProtected(response: Parameters<RequestHandler>[1]) {
	response.status(409).json({
		error: {
			code: 'ADMIN_USER_PROTECTED',
			message: 'No se puede cambiar el estado ni el rol de un usuario administrador',
		},
	});
}

function categoryNotFound(response: Parameters<RequestHandler>[1]) {
	response.status(404).json({
		error: {
			code: 'CATEGORY_NOT_FOUND',
			message: 'No se encontró la categoría solicitada',
		},
	});
}

function isCategoryNameConflict(error: unknown): boolean {
	return error instanceof Error && error.message.includes('Ya existe una categoría con ese nombre.');
}

function categoryNameConflict(response: Parameters<RequestHandler>[1]) {
	response.status(409).json({
		error: {
			code: 'CATEGORY_NAME_CONFLICT',
			message: 'Ya existe una categoría con ese nombre.',
		},
	});
}

export const listarUsuariosAdminController: RequestHandler = async (request, response) => {
	const result = listarUsuariosAdminQuerySchema.safeParse(request.query);

	if (!result.success) {
		response.status(400).json(validationError(result.error.issues));
		return;
	}

	response.status(200).json(await listarUsuariosAdminService(result.data));
};

export const listarActoresAdminController: RequestHandler = async (request, response) => {
	const result = listarActoresAdminQuerySchema.safeParse(request.query);

	if (!result.success) {
		response.status(400).json(validationError(result.error.issues));
		return;
	}

	response.status(200).json(await listarActoresAdminService(result.data));
};

export const obtenerUsuarioAdminController: RequestHandler = async (request, response) => {
	const params = usuarioAdminParamsSchema.safeParse(request.params);

	if (!params.success) {
		response.status(400).json(validationError(params.error.issues));
		return;
	}

	const result = await obtenerUsuarioAdminService(params.data.id);

	if (!result) {
		userNotFound(response);
		return;
	}

	response.status(200).json(result);
};

export const cambiarEstadoUsuarioAdminController: RequestHandler = async (request, response) => {
	const params = usuarioAdminParamsSchema.safeParse(request.params);
	const body = cambiarEstadoUsuarioAdminBodySchema.safeParse(request.body);

	if (!params.success) {
		response.status(400).json(validationError(params.error.issues));
		return;
	}

	if (!body.success) {
		response.status(400).json(validationError(body.error.issues));
		return;
	}

	const currentUser = await obtenerUsuarioAdminService(params.data.id);

	if (!currentUser) {
		userNotFound(response);
		return;
	}

	if (currentUser.data.rol === 'ADMIN') {
		adminUserProtected(response);
		return;
	}

	const result = await cambiarEstadoUsuarioAdminService(params.data.id, body.data.estado);

	if (!result) {
		userNotFound(response);
		return;
	}

	response.status(200).json(result);
};

export const asignarModeradorAdminController: RequestHandler = async (request, response) => {
	const params = usuarioAdminParamsSchema.safeParse(request.params);
	const body = asignarModeradorAdminBodySchema.safeParse(request.body);

	if (!params.success) {
		response.status(400).json(validationError(params.error.issues));
		return;
	}

	if (!body.success) {
		response.status(400).json(validationError(body.error.issues));
		return;
	}

	const currentUser = await obtenerUsuarioAdminService(params.data.id);

	if (!currentUser) {
		userNotFound(response);
		return;
	}

	if (currentUser.data.rol === 'ADMIN') {
		adminUserProtected(response);
		return;
	}

	const result = await asignarModeradorAdminService(params.data.id, body.data.idCategorias);

	if (!result) {
		userNotFound(response);
		return;
	}

	response.status(200).json(result);
};

export const listarCategoriasAdminController: RequestHandler = async (request, response) => {
	const result = listarCategoriasAdminQuerySchema.safeParse(request.query);

	if (!result.success) {
		response.status(400).json(validationError(result.error.issues));
		return;
	}

	response.status(200).json(await listarCategoriasAdminService(result.data));
};

export const obtenerCategoriaAdminController: RequestHandler = async (request, response) => {
	const params = categoriaAdminParamsSchema.safeParse(request.params);

	if (!params.success) {
		response.status(400).json(validationError(params.error.issues));
		return;
	}

	const result = await obtenerCategoriaAdminService(params.data.id);

	if (!result) {
		categoryNotFound(response);
		return;
	}

	response.status(200).json(result);
};

export const crearCategoriaAdminController: RequestHandler = async (request, response) => {
	const body = guardarCategoriaAdminBodySchema.safeParse(request.body);

	if (!body.success) {
		response.status(400).json(validationError(body.error.issues));
		return;
	}

	try {
		response
			.status(201)
			.json(await crearCategoriaAdminService(body.data.nombre, body.data.icono, body.data.estado));
	} catch (error) {
		if (isCategoryNameConflict(error)) {
			categoryNameConflict(response);
			return;
		}
		throw error;
	}
};

export const editarCategoriaAdminController: RequestHandler = async (request, response) => {
	const params = categoriaAdminParamsSchema.safeParse(request.params);
	const body = guardarCategoriaAdminBodySchema.safeParse(request.body);

	if (!params.success) {
		response.status(400).json(validationError(params.error.issues));
		return;
	}
	if (!body.success) {
		response.status(400).json(validationError(body.error.issues));
		return;
	}
	if (!(await obtenerCategoriaAdminService(params.data.id))) {
		categoryNotFound(response);
		return;
	}

	try {
		response
			.status(200)
			.json(
				await editarCategoriaAdminService(
					params.data.id,
					body.data.nombre,
					body.data.icono,
					body.data.estado,
				),
			);
	} catch (error) {
		if (isCategoryNameConflict(error)) {
			categoryNameConflict(response);
			return;
		}
		throw error;
	}
};

export const eliminarCategoriaAdminController: RequestHandler = async (request, response) => {
	const params = categoriaAdminParamsSchema.safeParse(request.params);

	if (!params.success) {
		response.status(400).json(validationError(params.error.issues));
		return;
	}
	if (!(await obtenerCategoriaAdminService(params.data.id))) {
		categoryNotFound(response);
		return;
	}

	response.status(200).json(await eliminarCategoriaAdminService(params.data.id));
};
