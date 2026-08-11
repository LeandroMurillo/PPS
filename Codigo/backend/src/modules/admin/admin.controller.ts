import type { RequestHandler } from 'express';

import {
	asignarModeradorAdminBodySchema,
	actorAdminParamsSchema,
	cambiarEstadoActoresAdminBodySchema,
	cambiarEstadoUsuarioAdminBodySchema,
	categoriaAdminParamsSchema,
	guardarCategoriaAdminBodySchema,
	guardarSubcategoriaAdminBodySchema,
	listarActoresAdminQuerySchema,
	listarCategoriasAdminQuerySchema,
	listarSubcategoriasAdminQuerySchema,
	listarUsuariosAdminQuerySchema,
	subcategoriaAdminCategoriaParamSchema,
	subcategoriaAdminParamsSchema,
	usuarioAdminParamsSchema,
} from './admin.schemas.js';
import {
	asignarModeradorAdminService,
	cambiarEstadoActoresAdminService,
	cambiarEstadoUsuarioAdminService,
	crearCategoriaAdminService,
	crearSubcategoriaAdminService,
	editarCategoriaAdminService,
	editarSubcategoriaAdminService,
	eliminarCategoriaAdminService,
	eliminarSubcategoriaAdminService,
	listarActoresAdminService,
	listarCategoriasAdminService,
	listarSubcategoriasAdminService,
	listarUsuariosAdminService,
	obtenerActorAdminService,
	obtenerCategoriaAdminService,
	obtenerSubcategoriaAdminService,
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

function actorNotFound(response: Parameters<RequestHandler>[1]) {
	response.status(404).json({
		error: {
			code: 'ACTOR_NOT_FOUND',
			message: 'No se encontró el actor solicitado',
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

function subcategoryNotFound(response: Parameters<RequestHandler>[1]) {
	response.status(404).json({
		error: {
			code: 'SUBCATEGORY_NOT_FOUND',
			message: 'No se encontró la subcategoría solicitada',
		},
	});
}

function isSubcategoryNameConflict(error: unknown): boolean {
	return (
		error instanceof Error &&
		(error.message.includes('ER_DUP_ENTRY') ||
			error.message.includes('uq_idCategoria_nombre') ||
			error.message.includes('Ya existe una subcategoría con ese nombre'))
	);
}

function subcategoryNameConflict(response: Parameters<RequestHandler>[1]) {
	response.status(409).json({
		error: {
			code: 'SUBCATEGORY_NAME_CONFLICT',
			message: 'Ya existe una subcategoría con ese nombre para esta categoría.',
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

export const obtenerActorAdminController: RequestHandler = async (request, response) => {
	const params = actorAdminParamsSchema.safeParse(request.params);

	if (!params.success) {
		response.status(400).json(validationError(params.error.issues));
		return;
	}

	const result = await obtenerActorAdminService(params.data.id);

	if (!result) {
		actorNotFound(response);
		return;
	}

	response.status(200).json(result);
};

export const cambiarEstadoActoresAdminController: RequestHandler = async (request, response) => {
	const body = cambiarEstadoActoresAdminBodySchema.safeParse(request.body);

	if (!body.success) {
		response.status(400).json(validationError(body.error.issues));
		return;
	}

	response.status(200).json(await cambiarEstadoActoresAdminService(body.data.ids, body.data.estado));
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
				await editarCategoriaAdminService(params.data.id, body.data.nombre, body.data.icono, body.data.estado),
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

export const listarSubcategoriasAdminController: RequestHandler = async (request, response) => {
	const params = subcategoriaAdminCategoriaParamSchema.safeParse(request.params);
	const query = listarSubcategoriasAdminQuerySchema.safeParse(request.query);

	if (!params.success) {
		response.status(400).json(validationError(params.error.issues));
		return;
	}
	if (!query.success) {
		response.status(400).json(validationError(query.error.issues));
		return;
	}

	if (!(await obtenerCategoriaAdminService(params.data.idCategoria))) {
		categoryNotFound(response);
		return;
	}

	response.status(200).json(await listarSubcategoriasAdminService(params.data.idCategoria, query.data));
};

export const obtenerSubcategoriaAdminController: RequestHandler = async (request, response) => {
	const params = subcategoriaAdminParamsSchema.safeParse(request.params);

	if (!params.success) {
		response.status(400).json(validationError(params.error.issues));
		return;
	}

	const result = await obtenerSubcategoriaAdminService(params.data.idCategoria, params.data.id);

	if (!result) {
		subcategoryNotFound(response);
		return;
	}

	response.status(200).json(result);
};

export const crearSubcategoriaAdminController: RequestHandler = async (request, response) => {
	const params = subcategoriaAdminCategoriaParamSchema.safeParse(request.params);
	const body = guardarSubcategoriaAdminBodySchema.safeParse(request.body);

	if (!params.success) {
		response.status(400).json(validationError(params.error.issues));
		return;
	}
	if (!body.success) {
		response.status(400).json(validationError(body.error.issues));
		return;
	}

	if (!(await obtenerCategoriaAdminService(params.data.idCategoria))) {
		categoryNotFound(response);
		return;
	}

	try {
		response
			.status(201)
			.json(await crearSubcategoriaAdminService(params.data.idCategoria, body.data.nombre, body.data.estado));
	} catch (error) {
		if (isSubcategoryNameConflict(error)) {
			subcategoryNameConflict(response);
			return;
		}
		throw error;
	}
};

export const editarSubcategoriaAdminController: RequestHandler = async (request, response) => {
	const params = subcategoriaAdminParamsSchema.safeParse(request.params);
	const body = guardarSubcategoriaAdminBodySchema.safeParse(request.body);

	if (!params.success) {
		response.status(400).json(validationError(params.error.issues));
		return;
	}
	if (!body.success) {
		response.status(400).json(validationError(body.error.issues));
		return;
	}

	if (!(await obtenerSubcategoriaAdminService(params.data.idCategoria, params.data.id))) {
		subcategoryNotFound(response);
		return;
	}

	try {
		response
			.status(200)
			.json(
				await editarSubcategoriaAdminService(
					params.data.idCategoria,
					params.data.id,
					body.data.nombre,
					body.data.estado,
				),
			);
	} catch (error) {
		if (isSubcategoryNameConflict(error)) {
			subcategoryNameConflict(response);
			return;
		}
		throw error;
	}
};

export const eliminarSubcategoriaAdminController: RequestHandler = async (request, response) => {
	const params = subcategoriaAdminParamsSchema.safeParse(request.params);

	if (!params.success) {
		response.status(400).json(validationError(params.error.issues));
		return;
	}

	if (!(await obtenerSubcategoriaAdminService(params.data.idCategoria, params.data.id))) {
		subcategoryNotFound(response);
		return;
	}

	response
		.status(200)
		.json(await eliminarSubcategoriaAdminService(params.data.idCategoria, params.data.id));
};
