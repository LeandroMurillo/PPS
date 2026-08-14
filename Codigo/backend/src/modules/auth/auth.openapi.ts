import { internalErrorResponseSchema, validationErrorResponseSchema } from '../../openapi/common.schemas.js';
import { openApiRegistry } from '../../openapi/registry.js';
import {
	loginBodySchema,
	loginResponseSchema,
	registrarUsuarioBodySchema,
	registroUsuarioResponseSchema,
} from './auth.schemas.js';

export function registerAuthOpenApi(): void {
	openApiRegistry.registerPath({
		method: 'post',

		path: '/api/publico/auth/registro',

		tags: ['Autenticación y Registro'],

		summary: 'Registrar un nuevo usuario',

		description:
			'Permite a un nuevo usuario registrarse en la plataforma ingresando sus datos personales, credenciales y adjuntando una imagen de su documento de identidad. El usuario se crea en estado Activo (A).',

		request: {
			body: {
				content: {
					'application/json': {
						schema: registrarUsuarioBodySchema,
					},
				},
			},
		},

		responses: {
			201: {
				description: 'Usuario registrado correctamente.',
				content: {
					'application/json': {
						schema: registroUsuarioResponseSchema,
					},
				},
			},

			400: {
				description: 'Los datos provistos para el registro no son válidos.',
				content: {
					'application/json': {
						schema: validationErrorResponseSchema,
					},
				},
			},

			409: {
				description: 'El correo electrónico o CUIL ya se encuentra registrado.',
				content: {
					'application/json': {
						schema: validationErrorResponseSchema,
					},
				},
			},

			500: {
				description: 'Error interno al registrar el usuario.',
				content: {
					'application/json': {
						schema: internalErrorResponseSchema,
					},
				},
			},
		},
	});

	openApiRegistry.registerPath({
		method: 'post',

		path: '/api/publico/auth/login',

		tags: ['Autenticación y Registro'],

		summary: 'Iniciar sesión de usuario',

		description:
			'Verifica las credenciales de un usuario (correo electrónico y contraseña) y retorna la información de perfil.',

		request: {
			body: {
				content: {
					'application/json': {
						schema: loginBodySchema,
					},
				},
			},
		},

		responses: {
			200: {
				description: 'Inicio de sesión exitoso.',
				content: {
					'application/json': {
						schema: loginResponseSchema,
					},
				},
			},

			400: {
				description: 'Formato de datos de inicio de sesión no válido.',
				content: {
					'application/json': {
						schema: validationErrorResponseSchema,
					},
				},
			},

			401: {
				description: 'Credenciales incorrectas o cuenta inactiva.',
				content: {
					'application/json': {
						schema: validationErrorResponseSchema,
					},
				},
			},

			500: {
				description: 'Error interno al iniciar sesión.',
				content: {
					'application/json': {
						schema: internalErrorResponseSchema,
					},
				},
			},
		},
	});
}
