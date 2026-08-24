import { z } from 'zod';

import {
	forbiddenErrorResponseSchema,
	internalErrorResponseSchema,
	notFoundResponseSchema,
	unauthorizedErrorResponseSchema,
	validationErrorResponseSchema,
} from '../../openapi/common.schemas.js';
import { openApiRegistry } from '../../openapi/registry.js';
import { actualizarPerfilBodySchema, perfilUsuarioSchema } from './usuario.schemas.js';

export const eliminarCuentaResponseSchema = z
	.strictObject({
		message: z.string().meta({ example: 'Cuenta y archivos asociados eliminados correctamente.' }),
	})
	.meta({
		id: 'EliminarCuentaResponse',
		description: 'Confirmación de supresión física definitiva de cuenta y archivos personales.',
	});

export const dniFilenameParamSchema = z.strictObject({
	filename: z
		.string()
		.regex(/^dni_\d+_[a-f0-9]+\.(jpe?g|png|webp)$/i, {
			message: 'Formato de nombre de archivo DNI inválido.',
		})
		.meta({
			example: 'dni_12345678_abcdef0123456789.png',
			description: 'Nombre del archivo de imagen de documento de identidad almacenado en el servidor.',
		}),
});

export function registerUsuarioOpenApi(): void {
	openApiRegistry.registerPath({
		method: 'get',
		path: '/api/usuario/perfil',
		tags: ['Perfil de Usuario'],
		summary: 'Obtener datos de perfil del usuario autenticado',
		description:
			'Devuelve los datos personales, actividad económica ARCA, CUIL, rol, estado y avatares del usuario autenticado.',
		security: [{ bearerAuth: [] }],
		responses: {
			200: {
				description: 'Perfil del usuario obtenido correctamente.',
				content: {
					'application/json': {
						schema: perfilUsuarioSchema,
					},
				},
			},
			401: {
				description: 'No autorizado: token inválido o expirado.',
				content: {
					'application/json': {
						schema: unauthorizedErrorResponseSchema,
					},
				},
			},
			500: {
				description: 'Error interno al consultar el perfil del usuario.',
				content: {
					'application/json': {
						schema: internalErrorResponseSchema,
					},
				},
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'put',
		path: '/api/usuario/perfil',
		tags: ['Perfil de Usuario'],
		summary: 'Actualizar perfil del usuario autenticado',
		description:
			'Actualiza los datos personales del usuario, fecha de nacimiento (mínimo 10 años), CUIL, actividad ARCA opcional y estilo de avatar DiceBear.',
		security: [{ bearerAuth: [] }],
		request: {
			body: {
				content: {
					'application/json': {
						schema: actualizarPerfilBodySchema,
					},
				},
			},
		},
		responses: {
			200: {
				description: 'Perfil actualizado correctamente.',
				content: {
					'application/json': {
						schema: perfilUsuarioSchema,
					},
				},
			},
			400: {
				description: 'Datos de perfil no válidos o restricción de edad incumplida.',
				content: {
					'application/json': {
						schema: validationErrorResponseSchema,
					},
				},
			},
			401: {
				description: 'No autorizado: token inválido o expirado.',
				content: {
					'application/json': {
						schema: unauthorizedErrorResponseSchema,
					},
				},
			},
			500: {
				description: 'Error interno al actualizar el perfil.',
				content: {
					'application/json': {
						schema: internalErrorResponseSchema,
					},
				},
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'delete',
		path: '/api/usuario/cuenta',
		tags: ['Perfil de Usuario'],
		summary: 'Eliminar físicamente la cuenta de usuario (Derecho al olvido)',
		description:
			'Elimina permanentemente la cuenta de usuario de MariaDB, desvincula o elimina los actores de su propiedad exclusiva y purga del almacenamiento físico los archivos huérfanos asociados (DNI, portafolio y fotos de perfil). Cumplimiento de la Ley N° 25.326.',
		security: [{ bearerAuth: [] }],
		responses: {
			200: {
				description: 'Cuenta y archivos asociados eliminados correctamente.',
				content: {
					'application/json': {
						schema: eliminarCuentaResponseSchema,
					},
				},
			},
			401: {
				description: 'No autorizado: token inválido o expirado.',
				content: {
					'application/json': {
						schema: unauthorizedErrorResponseSchema,
					},
				},
			},
			500: {
				description: 'Error interno al eliminar la cuenta.',
				content: {
					'application/json': {
						schema: internalErrorResponseSchema,
					},
				},
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'get',
		path: '/uploads/dni/{filename}',
		tags: ['Perfil de Usuario'],
		summary: 'Descargar archivo de documento de identidad (Privado)',
		description:
			'Permite visualizar o descargar la imagen del DNI de un usuario. El acceso está restringido al titular del documento o a usuarios con rol ADMIN o MODERADOR.',
		security: [{ bearerAuth: [] }],
		request: {
			params: dniFilenameParamSchema,
		},
		responses: {
			200: {
				description: 'Archivo de imagen del documento devuelto correctamente.',
				content: {
					'image/jpeg': {},
					'image/png': {},
					'image/webp': {},
				},
			},
			401: {
				description: 'No autorizado: token ausente o inválido.',
				content: {
					'application/json': {
						schema: unauthorizedErrorResponseSchema,
					},
				},
			},
			403: {
				description: 'Acceso denegado: no es titular del documento ni posee rol administrativo.',
				content: {
					'application/json': {
						schema: forbiddenErrorResponseSchema,
					},
				},
			},
			404: {
				description: 'El archivo solicitado no existe en el almacenamiento.',
				content: {
					'application/json': {
						schema: notFoundResponseSchema,
					},
				},
			},
			500: {
				description: 'Error interno al acceder al archivo.',
				content: {
					'application/json': {
						schema: internalErrorResponseSchema,
					},
				},
			},
		},
	});
}
