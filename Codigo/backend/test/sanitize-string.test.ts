import { describe, expect, it } from 'vitest';
import { sanitizeString } from '../src/shared/sanitize-string.js';
import { publicDescriptionSchema } from '../src/shared/public-description.schema.js';

describe('sanitizeString utility', () => {
	it('elimina bytes nulos y caracteres de control peligrosos preservando saltos de línea', () => {
		const input = 'Hola\u0000Mundo\u0007!\nSegunda\r\nlínea con\ttab.';
		const output = sanitizeString(input);
		expect(output).toBe('HolaMundo!\nSegunda\r\nlínea con\ttab.');
	});

	it('elimina caracteres invisibles de ancho cero y marcas de formato bidireccional', () => {
		const input = 'Texto\u200Bcon\u200Cespacios\u200Dinvisibles\uFEFFy\u202Eancho\u2060cero.';
		const output = sanitizeString(input);
		expect(output).toBe('Textoconespaciosinvisiblesyanchocero.');
	});

	it('normaliza espacios no rompibles (NBSP) a espacios estándar', () => {
		const input = 'Palabra1\u00A0Palabra2\u3000Palabra3';
		const output = sanitizeString(input);
		expect(output).toBe('Palabra1 Palabra2 Palabra3');
	});
});

describe('publicDescriptionSchema con sanitización', () => {
	it('sanitiza caracteres nulos e invisibles al validar', () => {
		const result = publicDescriptionSchema.safeParse('Descripción con\u0000 byte nulo y \u200Bespace invisible');
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toBe('Descripción con byte nulo y espace invisible');
		}
	});

	it('falla si la descripción queda vacía tras eliminar caracteres invisibles', () => {
		const result = publicDescriptionSchema.safeParse('\u0000\u200B\uFEFF   \u200C');
		expect(result.success).toBe(false);
	});
});
