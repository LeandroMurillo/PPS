import { internalErrorResponseSchema, validationErrorResponseSchema } from '../../openapi/common.schemas.js';
import { openApiRegistry } from '../../openapi/registry.js';
import { loginResponseSchema, registrarUsuarioBodySchema, registroUsuarioResponseSchema } from './auth.schemas.js';

export function registerAuthOpenApi(): void {
	openApiRegistry.registerPath({
		method: 'post',

		path: '/api/publico/auth/registro',

		tags: ['Autenticación y Registro'],

		summary: 'Registrar un nuevo usuario',

		description:
			'Completa el perfil de una identidad previamente autenticada y verificada por Firebase. Requiere un ID token de Firebase en Authorization: Bearer y crea la cuenta en estado Pendiente (P).',

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

		path: '/api/publico/auth/firebase/session',

		tags: ['Autenticación y Registro'],

		summary: 'Crear una sesión desde Firebase',

		description:
			'Valida un ID token de Firebase recibido en Authorization: Bearer y emite la sesión interna de la aplicación.',

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
