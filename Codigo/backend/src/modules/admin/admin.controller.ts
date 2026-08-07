import type { RequestHandler } from 'express';

import { listarActoresAdminQuerySchema, listarUsuariosAdminQuerySchema } from './admin.schemas.js';
import { listarActoresAdminService, listarUsuariosAdminService } from './admin.service.js';

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
