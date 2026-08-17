import type { RequestHandler } from 'express';

import { getPublicErrorMessage } from '../../shared/public-error.js';
import { getUserStateChangeBlockReason } from './admin.permissions.js';

import {
	asignarModeradorAdminBodySchema,
	actorAdminParamsSchema,
	asociarPreguntaFormularioAdminBodySchema,
	cambiarEstadoActoresAdminBodySchema,
	cambiarEstadoUsuarioAdminBodySchema,
	categoriaAdminParamsSchema,
	crearPreguntaFormularioAdminBodySchema,
	editarPreguntaAdminBodySchema,
	formularioAdminParamsSchema,
	formularioSubcategoriaAdminParamsSchema,
	guardarCategoriaAdminBodySchema,
	guardarFormularioAdminBodySchema,
	guardarSubcategoriaAdminBodySchema,
	listarActoresAdminQuerySchema,
	listarCategoriasAdminQuerySchema,
	listarPreguntasAdminQuerySchema,
	listarSubcategoriasAdminQuerySchema,
	listarUsuariosAdminQuerySchema,
	preguntaAdminParamsSchema,
	preguntaFormularioAdminParamsSchema,
	reemplazarPreguntaFormularioAdminBodySchema,
	subcategoriaAdminCategoriaParamSchema,
	subcategoriaAdminParamsSchema,
	usuarioAdminParamsSchema,
} from './admin.schemas.js';
import {
	asignarModeradorAdminService,
	asociarPreguntaFormularioAdminService,
	buscarFormularioAdminService,
	cambiarEstadoActoresAdminService,
	cambiarEstadoUsuarioAdminService,
	crearCategoriaAdminService,
	crearFormularioAdminService,
	crearPreguntaFormularioAdminService,
	crearSubcategoriaAdminService,
	editarCategoriaAdminService,
	editarFormularioAdminService,
	editarPreguntaAdminService,
	editarSubcategoriaAdminService,
	eliminarCategoriaAdminService,
	eliminarSubcategoriaAdminService,
	desactivarPreguntaFormularioAdminService,
	reemplazarPreguntaFormularioAdminService,
	crearPreguntaBancoAdminService,
	listarActoresAdminService,
	listarCategoriasAdminService,
	listarPreguntasAdminService,
	listarSubcategoriasAdminService,
	listarUsuariosAdminService,
	obtenerActorAdminService,
	obtenerCategoriaAdminService,
	obtenerFormularioAdminService,
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

function selfStateChangeProtected(response: Parameters<RequestHandler>[1]) {
	response.status(409).json({
		error: {
			code: 'SELF_STATE_CHANGE_NOT_ALLOWED',
			message: 'No podés cambiar el estado de tu propia cuenta desde la administración',
		},
	});
}

function moderatorUserProtected(response: Parameters<RequestHandler>[1]) {
	response.status(403).json({
		error: {
			code: 'MODERATOR_USER_PROTECTED',
			message: 'Un moderador no puede cambiar el estado de otro moderador',
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

function formNotFound(response: Parameters<RequestHandler>[1]) {
	response.status(404).json({
		error: {
			code: 'FORM_NOT_FOUND',
			message: 'No se encontró el formulario solicitado',
		},
	});
}

function isFormScopeConflict(error: unknown): boolean {
	return (
		error instanceof Error &&
		(error.message.includes('Ya existe un formulario para ese ámbito') ||
			error.message.includes('uq_Formularios_ambito') ||
			error.message.includes('Duplicate entry'))
	);
}

function formScopeConflict(response: Parameters<RequestHandler>[1]) {
	response.status(409).json({
		error: {
			code: 'FORM_SCOPE_CONFLICT',
			message: 'Ya existe un formulario para esta categoría o subcategoría.',
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

	response.status(200).json(await listarActoresAdminService(request.user!.idUsuario, result.data));
};

export const obtenerActorAdminController: RequestHandler = async (request, response) => {
	const params = actorAdminParamsSchema.safeParse(request.params);

	if (!params.success) {
		response.status(400).json(validationError(params.error.issues));
		return;
	}

	const result = await obtenerActorAdminService(request.user!.idUsuario, params.data.id);

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

	response
		.status(200)
		.json(await cambiarEstadoActoresAdminService(request.user!.idUsuario, body.data.ids, body.data.estado));
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

	if (request.user!.idUsuario === params.data.id) {
		selfStateChangeProtected(response);
		return;
	}

	const currentUser = await obtenerUsuarioAdminService(params.data.id);

	if (!currentUser) {
		userNotFound(response);
		return;
	}

	const blockReason = getUserStateChangeBlockReason({
		requesterId: request.user!.idUsuario,
		requesterRole: request.user!.rol,
		targetId: currentUser.data.id,
		targetRole: currentUser.data.rol,
	});

	if (blockReason === 'ADMIN_TARGET') {
		adminUserProtected(response);
		return;
	}

	if (blockReason === 'MODERATOR_TARGET') {
		moderatorUserProtected(response);
		return;
	}

	const result = await cambiarEstadoUsuarioAdminService(
		request.user!.idUsuario,
		params.data.id,
		body.data.estado,
	);

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

	response.status(200).json(await listarCategoriasAdminService(request.user!.idUsuario, result.data));
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

	response.status(200).json(await eliminarSubcategoriaAdminService(params.data.idCategoria, params.data.id));
};

export const obtenerFormularioCategoriaAdminController: RequestHandler = async (request, response) => {
	const params = subcategoriaAdminCategoriaParamSchema.safeParse(request.params);
	if (!params.success) {
		response.status(400).json(validationError(params.error.issues));
		return;
	}
	if (!(await obtenerCategoriaAdminService(params.data.idCategoria))) {
		categoryNotFound(response);
		return;
	}

	response.status(200).json(await buscarFormularioAdminService(params.data.idCategoria, null));
};

export const crearFormularioCategoriaAdminController: RequestHandler = async (request, response) => {
	const params = subcategoriaAdminCategoriaParamSchema.safeParse(request.params);
	const body = guardarFormularioAdminBodySchema.safeParse(request.body);
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
		response.status(201).json(await crearFormularioAdminService(params.data.idCategoria, null, body.data));
	} catch (error) {
		if (isFormScopeConflict(error)) {
			formScopeConflict(response);
			return;
		}
		throw error;
	}
};

export const editarFormularioCategoriaAdminController: RequestHandler = async (request, response) => {
	const params = subcategoriaAdminCategoriaParamSchema.safeParse(request.params);
	const body = guardarFormularioAdminBodySchema.safeParse(request.body);
	if (!params.success) {
		response.status(400).json(validationError(params.error.issues));
		return;
	}
	if (!body.success) {
		response.status(400).json(validationError(body.error.issues));
		return;
	}

	const formulario = await buscarFormularioAdminService(params.data.idCategoria, null);
	if (!formulario.data) {
		formNotFound(response);
		return;
	}

	response.status(200).json(await editarFormularioAdminService(formulario.data.id, body.data));
};

export const obtenerFormularioSubcategoriaAdminController: RequestHandler = async (request, response) => {
	const params = formularioSubcategoriaAdminParamsSchema.safeParse(request.params);
	if (!params.success) {
		response.status(400).json(validationError(params.error.issues));
		return;
	}
	if (!(await obtenerSubcategoriaAdminService(params.data.idCategoria, params.data.idSubcategoria))) {
		subcategoryNotFound(response);
		return;
	}

	response.status(200).json(await buscarFormularioAdminService(params.data.idCategoria, params.data.idSubcategoria));
};

export const crearFormularioSubcategoriaAdminController: RequestHandler = async (request, response) => {
	const params = formularioSubcategoriaAdminParamsSchema.safeParse(request.params);
	const body = guardarFormularioAdminBodySchema.safeParse(request.body);
	if (!params.success) {
		response.status(400).json(validationError(params.error.issues));
		return;
	}
	if (!body.success) {
		response.status(400).json(validationError(body.error.issues));
		return;
	}
	if (!(await obtenerSubcategoriaAdminService(params.data.idCategoria, params.data.idSubcategoria))) {
		subcategoryNotFound(response);
		return;
	}

	try {
		response
			.status(201)
			.json(await crearFormularioAdminService(params.data.idCategoria, params.data.idSubcategoria, body.data));
	} catch (error) {
		if (isFormScopeConflict(error)) {
			formScopeConflict(response);
			return;
		}
		throw error;
	}
};

export const editarFormularioSubcategoriaAdminController: RequestHandler = async (request, response) => {
	const params = formularioSubcategoriaAdminParamsSchema.safeParse(request.params);
	const body = guardarFormularioAdminBodySchema.safeParse(request.body);
	if (!params.success) {
		response.status(400).json(validationError(params.error.issues));
		return;
	}
	if (!body.success) {
		response.status(400).json(validationError(body.error.issues));
		return;
	}

	const formulario = await buscarFormularioAdminService(params.data.idCategoria, params.data.idSubcategoria);
	if (!formulario.data) {
		formNotFound(response);
		return;
	}

	response.status(200).json(await editarFormularioAdminService(formulario.data.id, body.data));
};

export const crearPreguntaFormularioAdminController: RequestHandler = async (request, response) => {
	const params = formularioAdminParamsSchema.safeParse(request.params);
	const body = crearPreguntaFormularioAdminBodySchema.safeParse(request.body);
	if (!params.success) {
		response.status(400).json(validationError(params.error.issues));
		return;
	}
	if (!body.success) {
		response.status(400).json(validationError(body.error.issues));
		return;
	}
	if (!(await obtenerFormularioAdminService(params.data.idFormulario))) {
		formNotFound(response);
		return;
	}

	response.status(201).json(await crearPreguntaFormularioAdminService(params.data.idFormulario, body.data));
};

export const desactivarPreguntaFormularioAdminController: RequestHandler = async (request, response) => {
	const params = preguntaFormularioAdminParamsSchema.safeParse(request.params);
	if (!params.success) {
		response.status(400).json(validationError(params.error.issues));
		return;
	}
	if (!(await obtenerFormularioAdminService(params.data.idFormulario))) {
		formNotFound(response);
		return;
	}

	response
		.status(200)
		.json(await desactivarPreguntaFormularioAdminService(params.data.idFormulario, params.data.idPregunta));
};

export const asociarPreguntaFormularioAdminController: RequestHandler = async (request, response) => {
	const params = formularioAdminParamsSchema.safeParse(request.params);
	const body = asociarPreguntaFormularioAdminBodySchema.safeParse(request.body);
	if (!params.success) {
		response.status(400).json(validationError(params.error.issues));
		return;
	}
	if (!body.success) {
		response.status(400).json(validationError(body.error.issues));
		return;
	}
	if (!(await obtenerFormularioAdminService(params.data.idFormulario))) {
		formNotFound(response);
		return;
	}

	response.status(201).json(await asociarPreguntaFormularioAdminService(params.data.idFormulario, body.data));
};

export const listarPreguntasAdminController: RequestHandler = async (request, response) => {
	const query = listarPreguntasAdminQuerySchema.safeParse(request.query);
	if (!query.success) {
		response.status(400).json(validationError(query.error.issues));
		return;
	}

	response.status(200).json(await listarPreguntasAdminService(query.data));
};

export const editarPreguntaAdminController: RequestHandler = async (request, response) => {
	const params = preguntaAdminParamsSchema.safeParse(request.params);
	const body = editarPreguntaAdminBodySchema.safeParse(request.body);

	if (!params.success) {
		response.status(400).json(validationError(params.error.issues));
		return;
	}
	if (!body.success) {
		response.status(400).json(validationError(body.error.issues));
		return;
	}

	try {
		const result = await editarPreguntaAdminService(params.data.idPregunta, body.data);
		response.status(200).json(result);
	} catch (error) {
		response.status(400).json({
			error: {
				code: 'QUESTION_EDIT_FAILED',
				message: getPublicErrorMessage(error, 'No se pudo editar la pregunta.'),
			},
		});
	}
};

export const reemplazarPreguntaFormularioAdminController: RequestHandler = async (request, response) => {
	const params = preguntaFormularioAdminParamsSchema.safeParse(request.params);
	const body = reemplazarPreguntaFormularioAdminBodySchema.safeParse(request.body);

	if (!params.success) {
		response.status(400).json(validationError(params.error.issues));
		return;
	}
	if (!body.success) {
		response.status(400).json(validationError(body.error.issues));
		return;
	}
	if (!(await obtenerFormularioAdminService(params.data.idFormulario))) {
		formNotFound(response);
		return;
	}

	try {
		const result = await reemplazarPreguntaFormularioAdminService(
			params.data.idFormulario,
			params.data.idPregunta,
			body.data,
		);
		response.status(200).json(result);
	} catch (error) {
		response.status(400).json({
			error: {
				code: 'QUESTION_REPLACE_FAILED',
				message: getPublicErrorMessage(error, 'No se pudo reemplazar la pregunta.'),
			},
		});
	}
};

export const crearPreguntaBancoAdminController: RequestHandler = async (request, response) => {
	const body = crearPreguntaFormularioAdminBodySchema.safeParse(request.body);

	if (!body.success) {
		response.status(400).json(validationError(body.error.issues));
		return;
	}

	try {
		const result = await crearPreguntaBancoAdminService(body.data);
		response.status(201).json(result);
	} catch (error) {
		response.status(400).json({
			error: {
				code: 'QUESTION_CREATE_FAILED',
				message: getPublicErrorMessage(error, 'No se pudo crear la pregunta.'),
			},
		});
	}
};
