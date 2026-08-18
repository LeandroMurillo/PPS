import type { Request, Response } from 'express';
import { z } from 'zod';

import { getPublicErrorMessage } from '../../shared/public-error.js';

import {
	agregarEventoService,
	agregarIntegranteService,
	agregarIntegranteNoRegistradoService,
	agregarItemPortafolioService,
	cambiarEstadoActorService,
	crearActorService,
	editarActorService,
	eliminarActorService,
	eliminarEventoService,
	eliminarIntegranteService,
	eliminarIntegranteNoRegistradoService,
	editarIntegranteService,
	editarIntegranteNoRegistradoService,
	eliminarItemPortafolioService,
	listarEventosService,
	listarIntegrantesService,
	listarMisActoresService,
	listarPortafolioService,
	obtenerFormulariosActorService,
	obtenerFormulariosAplicablesService,
	obtenerOpcionesRegistroService,
} from './mis-actores.service.js';

const formulariosAplicablesQuerySchema = z.object({
	idCategoria: z.coerce.number().int().positive(),
	idSubcategoria: z.coerce.number().int().positive().optional(),
});

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

const actorImageDataUrlSchema = z
	.string()
	.max(7_000_000)
	.regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=\r\n]+$/);

function normalizeUrl(value: string | null | undefined): string | null | undefined {
	if (value === null || value === undefined) return value;
	const trimmed = value.trim();
	if (!trimmed) return trimmed;
	if (/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//i.test(trimmed)) {
		return trimmed;
	}
	return `https://${trimmed}`;
}

const respuestaRegistroSchema = z.object({
	idFormulario: z.number().int().positive(),
	idPregunta: z.number().int().positive(),
	valor: z.unknown().refine((value) => value !== null && value !== undefined, 'La respuesta no puede ser nula.'),
});

const itemPortafolioRegistroSchema = z
	.object({
		tipo: z.enum(['IMAGEN', 'VIDEO', 'ENLACE']),
		titulo: z.string().trim().min(1).max(100),
		descripcion: z.string().trim().max(140).nullable().optional(),
		url: z
			.string()
			.trim()
			.transform((v) => normalizeUrl(v))
			.pipe(z.string().url('El formato del enlace no es válido').max(245))
			.nullable()
			.optional(),
		imagenBase64: actorImageDataUrlSchema.nullable().optional(),
	})
	.superRefine((item, context) => {
		if (item.tipo === 'IMAGEN' && !item.imagenBase64) {
			context.addIssue({ code: 'custom', path: ['imagenBase64'], message: 'La imagen es obligatoria.' });
		}
		if (item.tipo !== 'IMAGEN' && !item.url) {
			context.addIssue({ code: 'custom', path: ['url'], message: 'El enlace es obligatorio.' });
		}
	});

const crearBodySchema = z.object({
	idCategoria: z.number().int().positive(),
	idSubcategoria: z.number().int().positive().nullable().optional(),
	nombre: z.string().trim().min(1).max(100),
	descripcion: z.string().trim().min(1).max(500),
	fotoPerfilUrl: z.string().trim().nullable().optional(),
	fotoPerfilBase64: actorImageDataUrlSchema.nullable().optional(),
	cuit: z.string().trim().nullable().optional(),
	tipoActor: z.enum(['INDIVIDUO', 'COLECTIVO', 'ESPACIO']),
	provincia: z.string().trim().nullable().optional(),
	departamento: z.string().trim().min(1),
	localidad: z.string().trim().min(1),
	direccion: z.string().trim().min(1),
	latitud: z.number().min(-27.95).max(-25.75),
	longitud: z.number().min(-66.35).max(-64.45),
	esPublica: z.boolean(),
	respuestas: z.array(respuestaRegistroSchema).max(100).optional(),
	portafolio: z.array(itemPortafolioRegistroSchema).max(6).optional(),
});

const editarBodySchema = z.object({
	idCategoria: z.number().int().positive(),
	idSubcategoria: z.number().int().positive().nullable().optional(),
	nombre: z.string().trim().min(1).max(100),
	descripcion: z.string().trim().min(1).max(500),
	fotoPerfilUrl: z.string().trim().nullable().optional(),
	fotoPerfilBase64: actorImageDataUrlSchema.nullable().optional(),
	cuit: z.string().trim().nullable().optional(),
	tipoActor: z.enum(['INDIVIDUO', 'COLECTIVO', 'ESPACIO']),
	departamento: z.string().trim().min(1),
	localidad: z.string().trim().min(1),
	direccion: z.string().trim().min(1),
	latitud: z.number().min(-27.95).max(-25.75).optional(),
	longitud: z.number().min(-66.35).max(-64.45).optional(),
	esPublica: z.boolean().optional(),
	respuestas: z.array(respuestaRegistroSchema).max(100).optional(),
});

const cambiarEstadoBodySchema = z.object({
	nuevoEstado: z.enum(['A', 'P', 'I']),
});

const portafolioBodySchema = z.object({
	tipo: z.enum(['IMAGEN', 'LINK', 'RRSS']),
	descripcion: z.string().trim().min(1).max(255),
	url: z
		.string()
		.trim()
		.transform((v) => normalizeUrl(v) ?? '')
		.pipe(z.string().url('El formato del enlace no es válido').max(245)),
});

const eventoBodySchema = z.object({
	nombre: z.string().trim().min(1).max(45),
	descripcion: z.string().trim().min(1).max(455),
	fecha: z.iso.datetime({ local: true }).or(z.iso.date()).optional(),
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
				message: getPublicErrorMessage(error, 'No se pudieron listar tus actores culturales.'),
			},
		});
	}
}

export async function obtenerOpcionesRegistroController(_req: Request, res: Response): Promise<void> {
	try {
		res.json(await obtenerOpcionesRegistroService());
	} catch (error) {
		res.status(400).json({
			error: {
				code: 'BAD_REQUEST',
				message: getPublicErrorMessage(error, 'No se pudieron obtener las opciones de registro.'),
			},
		});
	}
}

export async function obtenerFormulariosAplicablesController(req: Request, res: Response): Promise<void> {
	try {
		const query = formulariosAplicablesQuerySchema.parse(req.query);
		res.json(await obtenerFormulariosAplicablesService(query));
	} catch (error) {
		res.status(400).json({
			error: {
				code: 'BAD_REQUEST',
				message: getPublicErrorMessage(error, 'No se pudieron obtener los formularios aplicables.'),
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
				message: getPublicErrorMessage(error, 'No se pudo crear el actor cultural.'),
			},
		});
	}
}

export async function editarActorController(req: Request, res: Response): Promise<void> {
	try {
		const user = req.user!;
		const idActor = Number(req.params.id);
		const body = editarBodySchema.parse(req.body);

		const result = await editarActorService({
			idUsuario: user.idUsuario,
			idActor,
			userRol: user.rol,
			...body,
		});

		res.json({ data: result, message: 'Actor cultural actualizado correctamente.' });
	} catch (error) {
		res.status(400).json({
			error: {
				code: 'BAD_REQUEST',
				message: getPublicErrorMessage(error, 'No se pudo modificar el actor cultural.'),
			},
		});
	}
}

export async function obtenerFormulariosActorController(req: Request, res: Response): Promise<void> {
	try {
		const user = req.user!;
		const idActor = Number(req.params.id);

		const result = await obtenerFormulariosActorService({
			idUsuario: user.idUsuario,
			idActor,
			userRol: user.rol,
		});

		res.json(result);
	} catch (error) {
		res.status(400).json({
			error: {
				code: 'BAD_REQUEST',
				message: getPublicErrorMessage(error, 'No se pudieron obtener los formularios del actor.'),
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
		});

		res.json({ message: `Estado actualizado a ${nuevoEstado} correctamente.` });
	} catch (error) {
		res.status(400).json({
			error: {
				code: 'BAD_REQUEST',
				message: getPublicErrorMessage(error, 'No se pudo cambiar el estado del actor.'),
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
				message: getPublicErrorMessage(error, 'No se pudo eliminar el actor cultural.'),
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
				message: getPublicErrorMessage(error, 'No se pudo agregar el elemento al portafolio.'),
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
				message: getPublicErrorMessage(error, 'No se pudo eliminar el elemento del portafolio.'),
			},
		});
	}
}

export async function listarPortafolioController(req: Request, res: Response): Promise<void> {
	try {
		const user = req.user!;
		const idActor = z.coerce.number().int().positive().parse(req.params.id);
		const items = await listarPortafolioService({ idUsuario: user.idUsuario, idActor });

		res.json({
			data: items.map((item) => ({
				id: item.idItem,
				tipo: item.tipo,
				descripcion: item.descripcion,
				url: item.url,
			})),
		});
	} catch (error) {
		res.status(400).json({
			error: {
				code: 'BAD_REQUEST',
				message: getPublicErrorMessage(error, 'No se pudieron listar los elementos del portafolio.'),
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
				message: getPublicErrorMessage(error, 'No se pudo agregar el evento.'),
			},
		});
	}
}

export async function listarEventosController(req: Request, res: Response): Promise<void> {
	try {
		const user = req.user!;
		const idActor = z.coerce.number().int().positive().parse(req.params.id);
		const eventos = await listarEventosService({ idUsuario: user.idUsuario, idActor });

		res.json({
			data: eventos.map((evento) => ({
				id: evento.idEvento,
				nombre: evento.nombre,
				descripcion: evento.descripcion,
				fecha: evento.fecha,
			})),
		});
	} catch (error) {
		res.status(400).json({
			error: {
				code: 'BAD_REQUEST',
				message: getPublicErrorMessage(error, 'No se pudieron listar los eventos.'),
			},
		});
	}
}

export async function eliminarEventoController(req: Request, res: Response): Promise<void> {
	try {
		const user = req.user!;
		const idActor = z.coerce.number().int().positive().parse(req.params.id);
		const idEvento = Number(req.params.idEvento);

		await eliminarEventoService({
			idUsuario: user.idUsuario,
			idActor,
			idEvento,
		});

		res.json({ message: 'Evento eliminado.' });
	} catch (error) {
		res.status(400).json({
			error: {
				code: 'BAD_REQUEST',
				message: getPublicErrorMessage(error, 'No se pudo eliminar el evento.'),
			},
		});
	}
}

const integranteBodySchema = z.object({
	email: z.string().trim().email('Correo electrónico inválido'),
	rol: z.string().trim().min(1).max(45),
});

const editarIntegranteBodySchema = z.object({
	rol: z.string().trim().min(1).max(45),
});

const emailIntegranteOpcionalSchema = z.preprocess(
	(value) => (typeof value === 'string' && value.trim() === '' ? null : value),
	z.string().trim().email('Correo electrónico inválido').max(99).nullable(),
);

const integranteNoRegistradoBodySchema = z.object({
	nombre: z
		.string()
		.trim()
		.min(1, 'El nombre no puede estar vacío')
		.max(45, 'El nombre debe tener como máximo 45 caracteres')
		.refine((val) => !/\d/.test(val), { message: 'El nombre no puede contener números' }),
	apellido: z
		.string()
		.trim()
		.min(1, 'El apellido no puede estar vacío')
		.max(45, 'El apellido debe tener como máximo 45 caracteres')
		.refine((val) => !/\d/.test(val), { message: 'El apellido no puede contener números' }),
	email: emailIntegranteOpcionalSchema,
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
				message: getPublicErrorMessage(error, 'No se pudieron listar los integrantes.'),
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
				message: getPublicErrorMessage(error, 'No se pudo agregar el integrante.'),
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
				message: getPublicErrorMessage(error, 'No se pudo eliminar el integrante.'),
			},
		});
	}
}

export async function editarIntegranteController(req: Request, res: Response): Promise<void> {
	try {
		const user = req.user!;
		const idActor = Number(req.params.id);
		const idUsuarioAEditar = Number(req.params.idUsuario);
		const body = editarIntegranteBodySchema.parse(req.body);

		await editarIntegranteService({
			idUsuario: user.idUsuario,
			idActor,
			idUsuarioAEditar,
			rol: body.rol,
		});

		res.json({ message: 'Integrante modificado correctamente.' });
	} catch (error) {
		res.status(400).json({
			error: {
				code: 'BAD_REQUEST',
				message: getPublicErrorMessage(error, 'No se pudo modificar el integrante.'),
			},
		});
	}
}

export async function agregarIntegranteNoRegistradoController(req: Request, res: Response): Promise<void> {
	try {
		const user = req.user!;
		const idActor = Number(req.params.id);
		const body = integranteNoRegistradoBodySchema.parse(req.body);

		await agregarIntegranteNoRegistradoService({
			idUsuario: user.idUsuario,
			idActor,
			...body,
		});

		res.status(201).json({ message: 'Integrante sin cuenta agregado correctamente.' });
	} catch (error) {
		res.status(400).json({
			error: {
				code: 'BAD_REQUEST',
				message: getPublicErrorMessage(error, 'No se pudo agregar el integrante.'),
			},
		});
	}
}

export async function editarIntegranteNoRegistradoController(req: Request, res: Response): Promise<void> {
	try {
		const user = req.user!;
		const idActor = Number(req.params.id);
		const idIntegranteNoRegistrado = Number(req.params.idIntegranteNoRegistrado);
		const body = integranteNoRegistradoBodySchema.parse(req.body);

		await editarIntegranteNoRegistradoService({
			idUsuario: user.idUsuario,
			idActor,
			idIntegranteNoRegistrado,
			...body,
		});

		res.json({ message: 'Integrante modificado correctamente.' });
	} catch (error) {
		res.status(400).json({
			error: {
				code: 'BAD_REQUEST',
				message: getPublicErrorMessage(error, 'No se pudo modificar el integrante.'),
			},
		});
	}
}

export async function eliminarIntegranteNoRegistradoController(req: Request, res: Response): Promise<void> {
	try {
		const user = req.user!;
		const idActor = Number(req.params.id);
		const idIntegranteNoRegistrado = Number(req.params.idIntegranteNoRegistrado);

		await eliminarIntegranteNoRegistradoService({
			idUsuario: user.idUsuario,
			idActor,
			idIntegranteNoRegistrado,
		});

		res.json({ message: 'Integrante eliminado correctamente.' });
	} catch (error) {
		res.status(400).json({
			error: {
				code: 'BAD_REQUEST',
				message: getPublicErrorMessage(error, 'No se pudo eliminar el integrante.'),
			},
		});
	}
}
