import { describe, expect, it } from 'vitest';
import { openApiDocument } from '../src/openapi/document.js';
import { registrarUsuarioBodySchema } from '../src/modules/auth/auth.schemas.js';

describe('validación del registro de usuario', () => {
	const validPayload = {
		nombre: '  María  ',
		apellido: '  González  ',
		genero: 'F',
		fechaNacimiento: '1992-08-15',
		nacionalidad: '  Argentina  ',
		email: '  MARIA.GONZALEZ@EXAMPLE.COM  ',
		contraseña: 'miPasswordSegura123',
		CUIL: '27359998881',
		actividadesArcaCodigo: '900012',
		documentoIdentidad: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
	};

	it('acepta y normaliza un payload válido', () => {
		const parsed = registrarUsuarioBodySchema.parse(validPayload);
		expect(parsed).toEqual({
			nombre: 'María',
			apellido: 'González',
			genero: 'F',
			fechaNacimiento: '1992-08-15',
			nacionalidad: 'Argentina',
			email: 'maria.gonzalez@example.com',
			contraseña: 'miPasswordSegura123',
			CUIL: '27359998881',
			actividadesArcaCodigo: '900012',
			documentoIdentidad: validPayload.documentoIdentidad,
		});
	});

	it('permite actividadesArcaCodigo opcional/nulo', () => {
		const parsedNull = registrarUsuarioBodySchema.parse({
			...validPayload,
			actividadesArcaCodigo: null,
		});
		expect(parsedNull.actividadesArcaCodigo).toBeNull();

		const parsedEmpty = registrarUsuarioBodySchema.parse({
			...validPayload,
			actividadesArcaCodigo: '   ',
		});
		expect(parsedEmpty.actividadesArcaCodigo).toBeNull();
	});

	it('rechaza contraseñas con menos de 6 caracteres', () => {
		const result = registrarUsuarioBodySchema.safeParse({
			...validPayload,
			contraseña: '12345',
		});
		expect(result.success).toBe(false);
	});

	it('rechaza correos electrónicos inválidos', () => {
		const result = registrarUsuarioBodySchema.safeParse({
			...validPayload,
			email: 'correo-invalido',
		});
		expect(result.success).toBe(false);
	});

	it('rechaza CUIL con formato incorrecto', () => {
		const result1 = registrarUsuarioBodySchema.safeParse({
			...validPayload,
			CUIL: '1234567890', // 10 dígitos
		});
		expect(result1.success).toBe(false);

		const result2 = registrarUsuarioBodySchema.safeParse({
			...validPayload,
			CUIL: '2735999888A', // letras
		});
		expect(result2.success).toBe(false);
	});

	it('rechaza fechas de nacimiento en el futuro', () => {
		const result = registrarUsuarioBodySchema.safeParse({
			...validPayload,
			fechaNacimiento: '2099-01-01',
		});
		expect(result.success).toBe(false);
	});

	it('rechaza código ARCA que no tenga 6 dígitos', () => {
		const result = registrarUsuarioBodySchema.safeParse({
			...validPayload,
			actividadesArcaCodigo: '12345',
		});
		expect(result.success).toBe(false);
	});

	it('rechaza si no se adjunta el documento de identidad', () => {
		const result = registrarUsuarioBodySchema.safeParse({
			...validPayload,
			documentoIdentidad: '',
		});
		expect(result.success).toBe(false);
	});

	it('genera el documento OpenAPI sin errores', () => {
		expect(openApiDocument).toBeDefined();
		expect(openApiDocument.paths?.['/api/publico/auth/registro']).toBeDefined();
	});
});
