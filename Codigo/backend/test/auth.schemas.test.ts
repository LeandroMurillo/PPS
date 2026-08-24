import { describe, expect, it } from 'vitest';

import { registrarUsuarioBodySchema } from '../src/modules/auth/auth.schemas.js';
import { openApiDocument } from '../src/openapi/document.js';

describe('validación del registro y login de usuario', () => {
	const validPayload = {
		nombre: '  María  ',
		apellido: '  González  ',
		genero: 'F',
		fechaNacimiento: '1992-08-15',
		nacionalidad: '  Argentina  ',
		CUIL: '27359998886',
		actividadesArcaCodigo: '900012',
		documentoIdentidad:
			'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
	};

	it('acepta y normaliza un payload válido de registro', () => {
		const parsed = registrarUsuarioBodySchema.parse(validPayload);
		expect(parsed).toEqual({
			nombre: 'María',
			apellido: 'González',
			genero: 'F',
			fechaNacimiento: '1992-08-15',
			nacionalidad: 'Argentina',
			CUIL: '27359998886',
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

	it('no acepta identidad ni contraseña desde el cuerpo público', () => {
		const parsed = registrarUsuarioBodySchema.parse({
			...validPayload,
			email: 'suplantado@example.com',
			contraseña: 'clave1',
		});
		expect(parsed).not.toHaveProperty('email');
		expect(parsed).not.toHaveProperty('contraseña');
	});

	it('rechaza CUIL con formato incorrecto o dígito verificador inválido', () => {
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

		const result3 = registrarUsuarioBodySchema.safeParse({
			...validPayload,
			CUIL: '27359998881', // dígito verificador incorrecto (esperado 6)
		});
		expect(result3.success).toBe(false);
	});

	it('rechaza fechas de nacimiento en el futuro o para menores de 10 años', () => {
		const resultFuturo = registrarUsuarioBodySchema.safeParse({
			...validPayload,
			fechaNacimiento: '2099-01-01',
		});
		expect(resultFuturo.success).toBe(false);

		const hoy = new Date();
		const cincoAnosAtras = new Date(hoy.getFullYear() - 5, hoy.getMonth(), hoy.getDate())
			.toISOString()
			.slice(0, 10);

		const resultMenor = registrarUsuarioBodySchema.safeParse({
			...validPayload,
			fechaNacimiento: cincoAnosAtras,
		});
		expect(resultMenor.success).toBe(false);
	});

	it('rechaza código ARCA que no tenga 6 dígitos', () => {
		const result = registrarUsuarioBodySchema.safeParse({
			...validPayload,
			actividadesArcaCodigo: '12345',
		});
		expect(result.success).toBe(false);
	});

	it('rechaza nombres, apellidos o nacionalidades que contengan números', () => {
		const resultNombreConNumero = registrarUsuarioBodySchema.safeParse({
			...validPayload,
			nombre: 'María 2',
		});
		expect(resultNombreConNumero.success).toBe(false);

		const resultApellidoConNumero = registrarUsuarioBodySchema.safeParse({
			...validPayload,
			apellido: 'González3',
		});
		expect(resultApellidoConNumero.success).toBe(false);

		const resultNacConNumero = registrarUsuarioBodySchema.safeParse({
			...validPayload,
			nacionalidad: 'Argentina 1',
		});
		expect(resultNacConNumero.success).toBe(false);
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
		expect(openApiDocument.paths?.['/api/publico/auth/firebase/session']).toBeDefined();
	});
});
