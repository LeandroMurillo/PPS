import { OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi';

import { registerActoresOpenApi } from '../modules/actores/actores.openapi.js';
import { registerAdminOpenApi } from '../modules/admin/admin.openapi.js';
import { registerAuthOpenApi } from '../modules/auth/auth.openapi.js';
import { registerConvocatoriasOpenApi } from '../modules/convocatorias/convocatorias.openapi.js';
import { registerHealthOpenApi } from '../modules/health/health.openapi.js';
import { registerMisActoresOpenApi } from '../modules/actores/mis-actores.openapi.js';
import { registerUsuarioOpenApi } from '../modules/usuario/usuario.openapi.js';

import { openApiRegistry } from './registry.js';

// Registrar esquema de seguridad Bearer JWT
openApiRegistry.registerComponent('securitySchemes', 'bearerAuth', {
	type: 'http',
	scheme: 'bearer',
	bearerFormat: 'JWT',
	description: 'Token JWT de sesión emitido por la API de Mosaico Cultural o ID Token de Firebase.',
});

// Registro de todos los módulos de la API
registerHealthOpenApi();
registerAuthOpenApi();
registerActoresOpenApi();
registerMisActoresOpenApi();
registerUsuarioOpenApi();
registerConvocatoriasOpenApi();
registerAdminOpenApi();

const generator = new OpenApiGeneratorV31(openApiRegistry.definitions, {
	sortComponents: 'alphabetically',
});

export const openApiDocument = generator.generateDocument({
	openapi: '3.1.0',

	info: {
		title: 'Mosaico Cultural API',
		version: '1.0.0',
		description:
			'API REST integral del sistema Mosaico Cultural: directorio, mapa georreferenciado, autogestión de actores, portafolios, agenda de eventos, convocatorias, actividades ARCA y administración.',
	},

	servers: [
		{
			url: '/',
			description: 'Servidor actual',
		},
	],

	tags: [
		{
			name: 'Salud del Sistema',
			description: 'Verificación de conectividad y estado operativo del backend y MariaDB.',
		},
		{
			name: 'Autenticación y Registro',
			description: 'Gestión de sesiones e identidades validadas por Firebase y registro inicial.',
		},
		{
			name: 'Perfil de Usuario',
			description: 'Consulta, actualización y eliminación de perfil de usuario y descarga de DNI.',
		},
		{
			name: 'Actores públicos',
			description: 'Directorio público, mapa georreferenciado, agenda de eventos y estadísticas.',
		},
		{
			name: 'Gestión de mis actores',
			description:
				'Autogestión de actores propios, formularios dinámicos EAV, portafolios, integrantes y eventos.',
		},
		{
			name: 'Convocatorias',
			description: 'Consulta de convocatorias culturales activas y postulación de actores.',
		},
		{
			name: 'Convocatorias (Administración)',
			description: 'Gestión administrativa de convocatorias y revisión de postulantes.',
		},
		{
			name: 'Administración',
			description: 'Panel administrativo de usuarios, actores, categorías, formularios, ARCA y auditoría.',
		},
	],
});
