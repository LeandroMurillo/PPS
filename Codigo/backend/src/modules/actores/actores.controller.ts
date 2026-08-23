import type { RequestHandler } from 'express';

import {
	listarActoresQuerySchema,
	listarEventosPublicosQuerySchema,
	obtenerActoresMapaQuerySchema,
	obtenerActorParamsSchema,
} from './actores.schemas.js';
import {
	listarActoresService,
	listarEventosPublicosService,
	obtenerActoresMapaService,
	obtenerActorService,
	obtenerEstadisticasPublicasService,
	obtenerFiltrosListadoActoresService,
	obtenerFiltrosMapaService,
} from './actores.service.js';

export const listarActoresController: RequestHandler = async (request, response) => {
	const validationResult = listarActoresQuerySchema.safeParse(request.query);

	if (!validationResult.success) {
		response.status(400).json({
			error: {
				code: 'INVALID_QUERY_PARAMETERS',
				message: 'Los parámetros de consulta no son válidos',

				details: validationResult.error.issues.map((issue) => ({
					field: issue.path.join('.'),
					code: issue.code,
					message: issue.message,
				})),
			},
		});

		return;
	}

	const result = await listarActoresService(validationResult.data);

	response.status(200).json(result);
};

export const obtenerActorController: RequestHandler = async (request, response) => {
	const validationResult = obtenerActorParamsSchema.safeParse(request.params);

	if (!validationResult.success) {
		response.status(400).json({
			error: {
				code: 'INVALID_QUERY_PARAMETERS',
				message: 'Los parámetros de ruta no son válidos',

				details: validationResult.error.issues.map((issue) => ({
					field: issue.path.join('.'),
					code: issue.code,
					message: issue.message,
				})),
			},
		});

		return;
	}

	const userId = request.user?.idUsuario ?? null;
	const result = await obtenerActorService(validationResult.data.id, userId);

	if (!result) {
		response.status(404).json({
			error: {
				code: 'ACTOR_NOT_FOUND',
				message: 'No se encontró un actor público activo con el identificador solicitado',
			},
		});

		return;
	}

	response.status(200).json(result);
};

export const obtenerActoresMapaController: RequestHandler = async (request, response) => {
	const validationResult = obtenerActoresMapaQuerySchema.safeParse(request.query);

	if (!validationResult.success) {
		response.status(400).json({
			error: {
				code: 'INVALID_QUERY_PARAMETERS',
				message: 'Los parámetros de consulta no son válidos',

				details: validationResult.error.issues.map((issue) => ({
					field: issue.path.join('.'),
					code: issue.code,
					message: issue.message,
				})),
			},
		});

		return;
	}

	const result = await obtenerActoresMapaService(validationResult.data);

	response.status(200).json(result);
};

export const obtenerFiltrosListadoActoresController: RequestHandler = async (_request, response) => {
	const result = await obtenerFiltrosListadoActoresService();

	response.status(200).json(result);
};

export const obtenerFiltrosMapaController: RequestHandler = async (_request, response) => {
	const result = await obtenerFiltrosMapaService();

	response.status(200).json(result);
};

export const listarEventosPublicosController: RequestHandler = async (request, response) => {
	const validationResult = listarEventosPublicosQuerySchema.safeParse(request.query);

	if (!validationResult.success) {
		response.status(400).json({
			error: {
				code: 'INVALID_QUERY_PARAMETERS',
				message: 'Los parámetros de consulta no son válidos',
				details: validationResult.error.issues.map((issue) => ({
					field: issue.path.join('.'),
					code: issue.code,
					message: issue.message,
				})),
			},
		});

		return;
	}

	const result = await listarEventosPublicosService(validationResult.data);

	response.status(200).json(result);
};

export const obtenerEstadisticasPublicasController: RequestHandler = async (_request, response) => {
	const result = await obtenerEstadisticasPublicasService();

	response.status(200).json(result);
};
