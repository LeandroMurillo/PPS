import { describe, expect, it } from 'vitest';

import {
	formatSurveyDate,
	getPhoneDigits,
	getWhatsAppPhoneUrl,
	isLikelyMobilePhone,
	isValidSurveyDate,
	isValidSurveyEmail,
	isValidSurveyPhone,
	isValidSurveyUrl,
	normalizeSurveyUrl,
	validateSurveyAnswer,
} from './surveyValidation';

describe('isValidSurveyUrl', () => {
	it('acepta URLs válidas con protocolo http o https', () => {
		expect(isValidSurveyUrl('https://mosaico.tucuman.gob.ar')).toBe(true);
		expect(isValidSurveyUrl('http://www.ejemplo.com/portafolio')).toBe(true);
		expect(isValidSurveyUrl('https://instagram.com/artista_tucumano')).toBe(true);
		expect(isValidSurveyUrl('https://spotify.com/artist/123456')).toBe(true);
		expect(isValidSurveyUrl('http://localhost:3000/app')).toBe(true);
	});

	it('acepta dominios web válidos sin protocolo anteponiendo https en la normalización', () => {
		expect(isValidSurveyUrl('www.facebook.com/mi-pagina')).toBe(true);
		expect(isValidSurveyUrl('instagram.com/teatro.independiente')).toBe(true);
		expect(isValidSurveyUrl('mi-sitio-arte.com.ar')).toBe(true);
		expect(isValidSurveyUrl('localhost:5173')).toBe(true);
	});

	it('rechaza respuestas que NO son URLs (palabras, números, fechas, emails, teléfonos)', () => {
		// Respuestas numéricas o identificadores
		expect(isValidSurveyUrl('1')).toBe(false);
		expect(isValidSurveyUrl('42')).toBe(false);

		// Palabras simples o términos culturales
		expect(isValidSurveyUrl('Folklore')).toBe(false);
		expect(isValidSurveyUrl('Solista')).toBe(false);
		expect(isValidSurveyUrl('Teatro')).toBe(false);
		expect(isValidSurveyUrl('Diseño de Autor')).toBe(false);

		// Fechas
		expect(isValidSurveyUrl('9999-08-29')).toBe(false);
		expect(isValidSurveyUrl('2023-01-15')).toBe(false);

		// Emails
		expect(isValidSurveyUrl('2@gmail.com')).toBe(false);
		expect(isValidSurveyUrl('contacto@cultura.gob.ar')).toBe(false);

		// Teléfonos
		expect(isValidSurveyUrl('1111111')).toBe(false);
		expect(isValidSurveyUrl('+5493815555555')).toBe(false);

		// Vacíos
		expect(isValidSurveyUrl('')).toBe(false);
		expect(isValidSurveyUrl('   ')).toBe(false);
	});

	it('normaliza URLs agregando https:// si no tienen esquema', () => {
		expect(normalizeSurveyUrl('ejemplo.com')).toBe('https://ejemplo.com');
		expect(normalizeSurveyUrl('https://ejemplo.com')).toBe('https://ejemplo.com');
		expect(normalizeSurveyUrl('http://ejemplo.com')).toBe('http://ejemplo.com');
		expect(normalizeSurveyUrl('')).toBe('');
	});
});

describe('isValidSurveyEmail', () => {
	it('valida correos electrónicos válidos', () => {
		expect(isValidSurveyEmail('2@gmail.com')).toBe(true);
		expect(isValidSurveyEmail('contacto@mosaico.gob.ar')).toBe(true);
		expect(isValidSurveyEmail('juan.perez+cultura@dominio.com.ar')).toBe(true);
	});

	it('rechaza formatos de email inválidos', () => {
		expect(isValidSurveyEmail('no-es-email')).toBe(false);
		expect(isValidSurveyEmail('12345')).toBe(false);
		expect(isValidSurveyEmail('sin-dominio@')).toBe(false);
		expect(isValidSurveyEmail('@sin-usuario.com')).toBe(false);
	});
});

describe('isValidSurveyPhone & WhatsApp helpers', () => {
	it('valida números de teléfono con longitud y formato estándar', () => {
		expect(isValidSurveyPhone('1111111')).toBe(true);
		expect(isValidSurveyPhone('+54 9 381 123-4567')).toBe(true);
		expect(isValidSurveyPhone('0381-4300000')).toBe(true);
	});

	it('rechaza teléfonos inválidos', () => {
		expect(isValidSurveyPhone('123')).toBe(false);
		expect(isValidSurveyPhone('abc-defg')).toBe(false);
	});

	it('extrae correctamente los dígitos del teléfono', () => {
		expect(getPhoneDigits('+54 (381) 123-4567')).toBe('543811234567');
	});

	it('detecta celulares argentinos y genera enlace a wa.me', () => {
		expect(isLikelyMobilePhone('3815123456')).toBe(true);
		const waUrl = getWhatsAppPhoneUrl('3815123456');
		expect(waUrl).toBe('https://wa.me/5493815123456');
	});
});

describe('isValidSurveyDate & formatSurveyDate', () => {
	it('valida fechas en formato YYYY-MM-DD', () => {
		expect(isValidSurveyDate('2024-05-25')).toBe(true);
		expect(isValidSurveyDate('9999-08-29')).toBe(true);
		expect(isValidSurveyDate('fecha-invalida')).toBe(false);
		expect(isValidSurveyDate('25/05/2024')).toBe(false);
	});

	it('formatea fechas de manera legible en español de Argentina', () => {
		const formatted = formatSurveyDate('2024-05-25');
		expect(formatted).toContain('25');
		expect(formatted.toLowerCase()).toContain('mayo');
		expect(formatted).toContain('2024');
	});
});

describe('validateSurveyAnswer', () => {
	it('valida preguntas de tipo TEXTO', () => {
		expect(validateSurveyAnswer('TEXTO', 'Reseña artística', true)).toBeNull();
		expect(validateSurveyAnswer('TEXTO', '', true)).toBe('Esta pregunta es obligatoria.');
		expect(validateSurveyAnswer('TEXTO', '', false)).toBeNull();
	});

	it('valida preguntas de tipo URL', () => {
		expect(validateSurveyAnswer('URL', 'https://instagram.com/actor', true)).toBeNull();
		expect(validateSurveyAnswer('URL', 'instagram.com/actor', true)).toBeNull();
		expect(validateSurveyAnswer('URL', 'no-es-url', true)).toBe('Ingresá una URL válida.');
		expect(validateSurveyAnswer('URL', '1', true)).toBe('Ingresá una URL válida.');
		expect(validateSurveyAnswer('URL', '', false)).toBeNull();
	});

	it('valida preguntas de tipo EMAIL', () => {
		expect(validateSurveyAnswer('EMAIL', 'contacto@gmail.com', true)).toBeNull();
		expect(validateSurveyAnswer('EMAIL', 'no-email', true)).toBe('Ingresá un correo electrónico válido.');
		expect(validateSurveyAnswer('EMAIL', '', false)).toBeNull();
	});

	it('valida preguntas de tipo TELEFONO', () => {
		expect(validateSurveyAnswer('TELEFONO', '+543815123456', true)).toBeNull();
		expect(validateSurveyAnswer('TELEFONO', '12', true)).toBe('Ingresá un teléfono válido.');
		expect(validateSurveyAnswer('TELEFONO', '', false)).toBeNull();
	});

	it('valida preguntas de tipo FECHA', () => {
		expect(validateSurveyAnswer('FECHA', '2024-01-01', true)).toBeNull();
		expect(validateSurveyAnswer('FECHA', '01/01/2024', true)).toBe('Seleccioná una fecha válida.');
		expect(validateSurveyAnswer('FECHA', '', false)).toBeNull();
	});

	it('valida preguntas de selección múltiple y chips', () => {
		expect(validateSurveyAnswer('OPCION_MULTIPLE', ['Sonido en vivo', 'Iluminación'], true)).toBeNull();
		expect(validateSurveyAnswer('TAGS', ['Folklore', 'Rock'], true)).toBeNull();
		expect(validateSurveyAnswer('TAGS', [], true)).toBe('Esta pregunta es obligatoria.');
		expect(validateSurveyAnswer('TAGS', [], false)).toBeNull();
	});
});
