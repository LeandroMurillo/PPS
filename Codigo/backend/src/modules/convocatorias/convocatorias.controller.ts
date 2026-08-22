import type { Request, Response } from 'express';

import { getPublicErrorMessage } from '../../shared/public-error.js';
import {
	cancelarPostulacionParamSchema,
	convocatoriaIdParamSchema,
	crearConvocatoriaBodySchema,
	editarConvocatoriaBodySchema,
	listarAdminConvocatoriasQuerySchema,
	postularActorBodySchema,
} from './convocatorias.schemas.js';
import {
	cancelarPostulacionService,
	crearConvocatoriaService,
	editarConvocatoriaService,
	eliminarConvocatoriaService,
	listarConvocatoriasActivasService,
	listarConvocatoriasAdminService,
	obtenerConvocatoriaDetalleService,
	postularActorService,
} from './convocatorias.service.js';

export async function listarConvocatoriasActivasController(req: Request, res: Response): Promise<void> {
	try {
		const idUsuario = req.user?.idUsuario ?? null;
		const result = await listarConvocatoriasActivasService(idUsuario);
		res.status(200).json({
			data: result.convocatorias,
			postulacionesUsuario: result.postulaciones,
		});
	} catch (error) {
		const message = getPublicErrorMessage(error, 'No se pudieron listar las convocatorias activas.');
		res.status(400).json({ error: { message } });
	}
}

export async function listarConvocatoriasAdminController(req: Request, res: Response): Promise<void> {
	try {
		const query = listarAdminConvocatoriasQuerySchema.parse(req.query);
		const result = await listarConvocatoriasAdminService(query.busqueda, query.estado, query.limit, query.offset);
		res.status(200).json({
			data: result.data,
			total: result.total,
		});
	} catch (error) {
		const message = getPublicErrorMessage(error, 'No se pudieron listar las convocatorias.');
		res.status(400).json({ error: { message } });
	}
}

export async function obtenerConvocatoriaDetalleController(req: Request, res: Response): Promise<void> {
	try {
		const params = convocatoriaIdParamSchema.parse(req.params);
		const result = await obtenerConvocatoriaDetalleService(params.id);
		const esAdminOModerador = req.user?.rol === 'ADMIN' || req.user?.rol === 'MODERADOR';
		res.status(200).json({
			data: result.convocatoria,
			postulantes: esAdminOModerador ? result.postulantes : [],
		});
	} catch (error) {
		const message = getPublicErrorMessage(error, 'No se pudo obtener el detalle de la convocatoria.');
		res.status(404).json({ error: { message } });
	}
}

export async function crearConvocatoriaController(req: Request, res: Response): Promise<void> {
	try {
		const body = crearConvocatoriaBodySchema.parse(req.body);
		const result = await crearConvocatoriaService(body.titulo, body.descripcion, body.fechaCierre);
		res.status(201).json({
			mensaje: 'Convocatoria creada exitosamente.',
			data: result,
		});
	} catch (error) {
		const message = getPublicErrorMessage(error, 'No se pudo crear la convocatoria.');
		res.status(400).json({ error: { message } });
	}
}

export async function editarConvocatoriaController(req: Request, res: Response): Promise<void> {
	try {
		const params = convocatoriaIdParamSchema.parse(req.params);
		const body = editarConvocatoriaBodySchema.parse(req.body);
		const result = await editarConvocatoriaService(params.id, body.titulo, body.descripcion, body.fechaCierre);
		res.status(200).json({
			mensaje: 'Convocatoria actualizada exitosamente.',
			data: result,
		});
	} catch (error) {
		const message = getPublicErrorMessage(error, 'No se pudo actualizar la convocatoria.');
		res.status(400).json({ error: { message } });
	}
}

export async function eliminarConvocatoriaController(req: Request, res: Response): Promise<void> {
	try {
		const params = convocatoriaIdParamSchema.parse(req.params);
		await eliminarConvocatoriaService(params.id);
		res.status(200).json({
			mensaje: 'Convocatoria eliminada exitosamente.',
		});
	} catch (error) {
		const message = getPublicErrorMessage(error, 'No se pudo eliminar la convocatoria.');
		res.status(400).json({ error: { message } });
	}
}

export async function postularActorController(req: Request, res: Response): Promise<void> {
	try {
		const params = convocatoriaIdParamSchema.parse(req.params);
		const body = postularActorBodySchema.parse(req.body);
		const idUsuario = req.user!.idUsuario;
		await postularActorService(params.id, body.idActor, idUsuario);
		res.status(200).json({
			mensaje: 'Actor postulado exitosamente a la convocatoria.',
		});
	} catch (error) {
		const message = getPublicErrorMessage(error, 'No se pudo postular el actor cultural.');
		res.status(400).json({ error: { message } });
	}
}

export async function cancelarPostulacionController(req: Request, res: Response): Promise<void> {
	try {
		const params = cancelarPostulacionParamSchema.parse(req.params);
		const idUsuario = req.user!.idUsuario;
		await cancelarPostulacionService(params.id, params.idActor, idUsuario);
		res.status(200).json({
			mensaje: 'Postulación cancelada exitosamente.',
		});
	} catch (error) {
		const message = getPublicErrorMessage(error, 'No se pudo cancelar la postulación.');
		res.status(400).json({ error: { message } });
	}
}
