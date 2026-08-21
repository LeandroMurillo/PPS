import type { TipoPreguntaFormulario } from '../api/actores';

export type SurveyAnswerValue = string | number | boolean | string[] | null | undefined;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const PHONE_PATTERN = /^\+?[0-9\s().-]{7,24}$/;

export function normalizeSurveyUrl(value: string): string {
	const trimmed = value.trim();
	if (!trimmed) return '';
	return /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function isValidSurveyUrl(value: string): boolean {
	try {
		const parsed = new URL(normalizeSurveyUrl(value));
		return parsed.protocol === 'http:' || parsed.protocol === 'https:';
	} catch {
		return false;
	}
}

export function isValidSurveyEmail(value: string): boolean {
	return EMAIL_PATTERN.test(value.trim());
}

export function getPhoneDigits(value: string): string {
	return value.replace(/\D/g, '');
}

export function isValidSurveyPhone(value: string): boolean {
	const trimmed = value.trim();
	const digits = getPhoneDigits(trimmed);
	return PHONE_PATTERN.test(trimmed) && digits.length >= 7 && digits.length <= 15;
}

export function isLikelyMobilePhone(value: string): boolean {
	const digits = getPhoneDigits(value);
	if (digits.startsWith('549')) return true;
	if (digits.startsWith('54') && digits.slice(2).startsWith('9')) return true;
	return digits.length >= 10 && digits.includes('15');
}

export function isValidSurveyDate(value: string): boolean {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return false;
	const date = new Date(`${value}T00:00:00`);
	return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function formatSurveyDate(value: string): string {
	if (!isValidSurveyDate(value)) return value;
	return new Intl.DateTimeFormat('es-AR', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC',
	}).format(new Date(`${value}T00:00:00Z`));
}

export function validateSurveyAnswer(
	tipoDato: TipoPreguntaFormulario | 'OPCION_MULTIPLE_CHIPS' | 'TAGS' | string,
	value: SurveyAnswerValue,
	required = false,
): string | null {
	const isEmpty = Array.isArray(value) ? value.length === 0 : !String(value ?? '').trim();
	if (isEmpty) return required ? 'Esta pregunta es obligatoria.' : null;
	if (Array.isArray(value)) return null;

	const textValue = String(value).trim();
	switch (tipoDato) {
		case 'URL':
			return isValidSurveyUrl(textValue) ? null : 'Ingresá una URL válida.';
		case 'EMAIL':
			return isValidSurveyEmail(textValue) ? null : 'Ingresá un correo electrónico válido.';
		case 'TELEFONO':
			return isValidSurveyPhone(textValue) ? null : 'Ingresá un teléfono válido.';
		case 'FECHA':
			return isValidSurveyDate(textValue) ? null : 'Seleccioná una fecha válida.';
		default:
			return null;
	}
}
