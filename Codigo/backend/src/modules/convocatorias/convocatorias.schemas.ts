import { z } from 'zod';

export const convocatoriaIdParamSchema = z.object({
	id: z.coerce.number().int().positive({ message: 'El ID de convocatoria debe ser un número entero positivo.' }),
});

export const cancelarPostulacionParamSchema = z.object({
	id: z.coerce.number().int().positive({ message: 'El ID de convocatoria debe ser un número entero positivo.' }),
	idActor: z.coerce.number().int().positive({ message: 'El ID de actor debe ser un número entero positivo.' }),
});

export const postularActorBodySchema = z.object({
	idActor: z.number().int().positive({ message: 'El ID de actor es obligatorio.' }),
});

export const crearConvocatoriaBodySchema = z.object({
	titulo: z
		.string()
		.trim()
		.min(1, { message: 'El título es obligatorio.' })
		.max(145, { message: 'El título no puede superar los 145 caracteres.' }),
	descripcion: z
		.string()
		.trim()
		.min(1, { message: 'La descripción es obligatoria.' })
		.max(445, { message: 'La descripción no puede superar los 445 caracteres.' }),
	fechaCierre: z.string().datetime({ message: 'La fecha de cierre debe tener un formato ISO válido.' }),
});

export const editarConvocatoriaBodySchema = z.object({
	titulo: z
		.string()
		.trim()
		.min(1, { message: 'El título es obligatorio.' })
		.max(145, { message: 'El título no puede superar los 145 caracteres.' }),
	descripcion: z
		.string()
		.trim()
		.min(1, { message: 'La descripción es obligatoria.' })
		.max(445, { message: 'La descripción no puede superar los 445 caracteres.' }),
	fechaCierre: z.string().datetime({ message: 'La fecha de cierre debe tener un formato ISO válido.' }),
});

export const listarAdminConvocatoriasQuerySchema = z.object({
	busqueda: z.string().optional(),
	estado: z.enum(['TODAS', 'ABIERTA', 'CERRADA']).optional().default('TODAS'),
	limit: z.coerce.number().int().min(1).max(100).optional().default(25),
	offset: z.coerce.number().int().min(0).optional().default(0),
});
