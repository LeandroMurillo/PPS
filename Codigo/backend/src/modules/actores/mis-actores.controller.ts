import type { Request, Response } from 'express';
import { z } from 'zod';

import {
	agregarEventoService,
	agregarIntegranteService,
	agregarItemPortafolioService,
	cambiarEstadoActorService,
	crearActorService,
	editarActorService,
	eliminarActorService,
	eliminarEventoService,
	eliminarIntegranteService,
	eliminarItemPortafolioService,
	listarIntegrantesService,
	listarMisActoresService,
} from './mis-actores.service.js';

const listarQuerySchema = z.object({
	busqueda: z.string().optional(),
	idCategoria: z
		.string()
		.optional()
		.transform((val) => (val ? Number(val) : undefined)),
	estado: z.enum(['A', 'P', 'I']).optional(),
	limit: z
		.string()
		.optional()
		.transform((val) => (val ? Number(val) : undefined)),
	offset: z
		.string()
		.optional()
		.transform((val) => (val ? Number(val) : undefined)),
});

const crearBodySchema = z.object({
	idCategoria: z.number().int().positive(),
	idSubcategoria: z.number().int().positive().nullable().optional(),
	nombre: z.string().trim().min(1).max(100),
	descripcion: z.string().trim().min(1).max(500),
	fotoPerfilUrl: z.string().trim().nullable().optional(),
	cuit: z.string().trim().nullable().optional(),
	tipoActor: z.enum(['INDIVIDUO', 'COLECTIVO', 'ESPACIO']),
	provincia: z.string().trim().nullable().optional(),
	departamento: z.string().trim().min(1),
	localidad: z.string().trim().min(1),
	direccion: z.string().trim().min(1),
	latitud: z.number().min(-27.95).max(-25.75),
	longitud: z.number().min(-66.35).max(-64.45),
	esPublica: z.boolean(),
});

const editarBodySchema = z.object({
	idCategoria: z.number().int().positive(),
	idSubcategoria: z.number().int().positive().nullable().optional(),
	nombre: z.string().trim().min(1).max(100),
	descripcion: z.string().trim().min(1).max(500),
	fotoPerfilUrl: z.string().trim().nullable().optional(),
	cuit: z.string().trim().nullable().optional(),
	tipoActor: z.enum(['INDIVIDUO', 'COLECTIVO', 'ESPACIO']),
	departamento: z.string().trim().min(1),
	localidad: z.string().trim().min(1),
	direccion: z.string().trim().min(1),
});

const cambiarEstadoBodySchema = z.object({
	nuevoEstado: z.enum(['A', 'P', 'I']),
});

const portafolioBodySchema = z.object({
	tipo: z.enum(['IMAGEN', 'LINK', 'RRSS']),
	descripcion: z.string().trim().min(1).max(255),
	url: z.string().trim().url(),
});

const eventoBodySchema = z.object({
	nombre: z.string().trim().min(1).max(100),
	descripcion: z.string().trim().min(1).max(500),
	fecha: z.string().optional(),
});

export async function listarMisActoresController(req: Request, res: Response): Promise<void> {
	try {
		const user = req.user!;
		const query = listarQuerySchema.parse(req.query);

		const result = await listarMisActoresService({
			idUsuario: user.idUsuario,
			...query,
		});

		res.json(result);
	} catch (error) {
		res.status(400).json({
			error: {
				code: 'BAD_REQUEST',
				message: error instanceof Error ? error.message : 'Error al listar los actores del usuario.',
			},
		});
	}
}

export async function crearActorController(req: Request, res: Response): Promise<void> {
	try {
		const user = req.user!;
		const body = crearBodySchema.parse(req.body);

		const result = await crearActorService({
			idUsuario: user.idUsuario,
			...body,
		});

		res.status(201).json({ data: result });
	} catch (error) {
		res.status(400).json({
			error: {
				code: 'BAD_REQUEST',
				message: error instanceof Error ? error.message : 'Error al crear el actor cultural.',
			},
		});
	}
}

export async function editarActorController(req: Request, res: Response): Promise<void> {
	try {
		const user = req.user!;
		const idActor = Number(req.params.id);
		const body = editarBodySchema.parse(req.body);

		await editarActorService({
			idUsuario: user.idUsuario,
			idActor,
			userRol: user.rol,
			...body,
		});

		res.json({ message: 'Actor cultural actualizado correctamente.' });
	} catch (error) {
		res.status(400).json({
			error: {
				code: 'BAD_REQUEST',
				message: error instanceof Error ? error.message : 'Error al editar el actor cultural.',
			},
		});
	}
}

export async function cambiarEstadoActorController(req: Request, res: Response): Promise<void> {
	try {
		const user = req.user!;
		const idActor = Number(req.params.id);
		const { nuevoEstado } = cambiarEstadoBodySchema.parse(req.body);

		await cambiarEstadoActorService({
			idUsuario: user.idUsuario,
			idActor,
			nuevoEstado,
			userRol: user.rol,
		});

		res.json({ message: `Estado actualizado a ${nuevoEstado} correctamente.` });
	} catch (error) {
		res.status(400).json({
			error: {
				code: 'BAD_REQUEST',
				message: error instanceof Error ? error.message : 'Error al cambiar el estado del actor.',
			},
		});
	}
}

export async function eliminarActorController(req: Request, res: Response): Promise<void> {
	try {
		const user = req.user!;
		const idActor = Number(req.params.id);

		await eliminarActorService({
			idUsuario: user.idUsuario,
			idActor,
			userRol: user.rol,
		});

		res.json({ message: 'Actor cultural eliminado permanentemente.' });
	} catch (error) {
		res.status(400).json({
			error: {
				code: 'BAD_REQUEST',
				message: error instanceof Error ? error.message : 'Error al eliminar el actor cultural.',
			},
		});
	}
}

export async function agregarItemPortafolioController(req: Request, res: Response): Promise<void> {
	try {
		const user = req.user!;
		const idActor = Number(req.params.id);
		const body = portafolioBodySchema.parse(req.body);

		const result = await agregarItemPortafolioService({
			idUsuario: user.idUsuario,
			idActor,
			...body,
		});

		res.status(201).json({ data: result });
	} catch (error) {
		res.status(400).json({
			error: {
				code: 'BAD_REQUEST',
				message: error instanceof Error ? error.message : 'Error al agregar elemento al portafolio.',
			},
		});
	}
}

export async function eliminarItemPortafolioController(req: Request, res: Response): Promise<void> {
	try {
		const user = req.user!;
		const idItem = Number(req.params.idItem);

		await eliminarItemPortafolioService({
			idUsuario: user.idUsuario,
			idItem,
		});

		res.json({ message: 'Elemento de portafolio eliminado.' });
	} catch (error) {
		res.status(400).json({
			error: {
				code: 'BAD_REQUEST',
				message: error instanceof Error ? error.message : 'Error al eliminar elemento del portafolio.',
			},
		});
	}
}

export async function agregarEventoController(req: Request, res: Response): Promise<void> {
	try {
		const user = req.user!;
		const idActor = Number(req.params.id);
		const body = eventoBodySchema.parse(req.body);

		const result = await agregarEventoService({
			idUsuario: user.idUsuario,
			idActor,
			...body,
		});

		res.status(201).json({ data: result });
	} catch (error) {
		res.status(400).json({
			error: {
				code: 'BAD_REQUEST',
				message: error instanceof Error ? error.message : 'Error al agregar evento.',
			},
		});
	}
}

export async function eliminarEventoController(req: Request, res: Response): Promise<void> {
	try {
		const user = req.user!;
		const idEvento = Number(req.params.idEvento);

		await eliminarEventoService({
			idUsuario: user.idUsuario,
			idEvento,
		});

		res.json({ message: 'Evento eliminado.' });
	} catch (error) {
		res.status(400).json({
			error: {
				code: 'BAD_REQUEST',
				message: error instanceof Error ? error.message : 'Error al eliminar el evento.',
			},
		});
	}
}

const integranteBodySchema = z.object({
	email: z.string().trim().email('Correo electrónico inválido'),
	rol: z.string().trim().min(1).max(45),
});

export async function listarIntegrantesController(req: Request, res: Response): Promise<void> {
	try {
		const user = req.user!;
		const idActor = Number(req.params.id);

		const data = await listarIntegrantesService({
			idUsuario: user.idUsuario,
			idActor,
		});

		res.json({ data });
	} catch (error) {
		res.status(400).json({
			error: {
				code: 'BAD_REQUEST',
				message: error instanceof Error ? error.message : 'Error al listar los integrantes.',
			},
		});
	}
}

export async function agregarIntegranteController(req: Request, res: Response): Promise<void> {
	try {
		const user = req.user!;
		const idActor = Number(req.params.id);
		const body = integranteBodySchema.parse(req.body);

		await agregarIntegranteService({
			idUsuario: user.idUsuario,
			idActor,
			email: body.email,
			rol: body.rol,
		});

		res.status(201).json({ message: 'Integrante agregado correctamente.' });
	} catch (error) {
		res.status(400).json({
			error: {
				code: 'BAD_REQUEST',
				message: error instanceof Error ? error.message : 'Error al agregar integrante.',
			},
		});
	}
}

export async function eliminarIntegranteController(req: Request, res: Response): Promise<void> {
	try {
		const user = req.user!;
		const idActor = Number(req.params.id);
		const idUsuarioAEliminar = Number(req.params.idUsuario);

		await eliminarIntegranteService({
			idUsuario: user.idUsuario,
			idActor,
			idUsuarioAEliminar,
		});

		res.json({ message: 'Integrante eliminado correctamente.' });
	} catch (error) {
		res.status(400).json({
			error: {
				code: 'BAD_REQUEST',
				message: error instanceof Error ? error.message : 'Error al eliminar el integrante.',
			},
		});
	}
}
