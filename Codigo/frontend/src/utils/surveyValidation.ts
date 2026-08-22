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

function stripArgentine15(raw: string): string | null {
	if (raw.length === 12) {
		for (const areaLen of [2, 3, 4]) {
			if (raw.slice(areaLen, areaLen + 2) === '15') {
				const area = raw.slice(0, areaLen);
				const subscriber = raw.slice(areaLen + 2);
				return `${area}${subscriber}`;
			}
		}
	}
	return null;
}

export function isLikelyMobilePhone(value: string): boolean {
	const digits = getPhoneDigits(value);
	if (!digits) return false;

	if (digits.startsWith('549') && digits.length >= 12) return true;
	if (digits.startsWith('54') && digits.charAt(2) === '9') return true;

	let raw = digits;
	if (raw.startsWith('54')) raw = raw.slice(2);
	if (raw.startsWith('0')) raw = raw.slice(1);

	return stripArgentine15(raw) !== null;
}

export function getWhatsAppPhoneUrl(value: string): string | null {
	const digits = getPhoneDigits(value);
	if (!digits) return null;

	if (digits.startsWith('549') && digits.length === 13) {
		return `https://wa.me/${digits}`;
	}

	if (digits.startsWith('54') && digits.length === 13 && digits.charAt(2) === '9') {
		return `https://wa.me/${digits}`;
	}

	if (digits.startsWith('54') && digits.length === 12) {
		return `https://wa.me/549${digits.slice(2)}`;
	}

	if (digits.startsWith('54')) {
		const without54 = digits.slice(2);
		const stripped = stripArgentine15(without54);
		if (stripped && stripped.length === 10) {
			return `https://wa.me/549${stripped}`;
		}
	}

	let raw = digits;
	if (raw.startsWith('0')) {
		raw = raw.slice(1);
	}

	const stripped = stripArgentine15(raw);
	if (stripped && stripped.length === 10) {
		return `https://wa.me/549${stripped}`;
	}

	if (raw.length === 10) {
		return `https://wa.me/549${raw}`;
	}

	return null;
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
