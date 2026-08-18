/**
 * Utilidades para formatear fechas de manera consistente en español (Argentina).
 */

export function formatDate(value: unknown): string {
	if (!value) return '—';
	if (typeof value !== 'string' && !(value instanceof Date)) return '—';

	const str = typeof value === 'string' ? value : value.toISOString();
	const dateOnly = /^(\d{4})-(\d{2})-(\d{2})/.exec(str);
	if (dateOnly) {
		return `${dateOnly[3]}/${dateOnly[2]}/${dateOnly[1]}`;
	}

	try {
		const parsed = new Date(str);
		return Number.isNaN(parsed.getTime())
			? str
			: new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(parsed);
	} catch {
		return String(value);
	}
}

export function formatDateTime(value: unknown): string {
	if (!value) return '—';
	if (typeof value !== 'string' && !(value instanceof Date)) return '—';

	const str = typeof value === 'string' ? value : value.toISOString();

	try {
		const parsed = new Date(str);
		return Number.isNaN(parsed.getTime())
			? str
			: new Intl.DateTimeFormat('es-AR', {
					dateStyle: 'medium',
					timeStyle: 'short',
					hourCycle: 'h23',
				}).format(parsed);
	} catch {
		return String(value);
	}
}

export function formatEventDate(fecha: string): string {
	if (!fecha) return '—';

	const date = new Date(fecha);
	if (Number.isNaN(date.getTime())) {
		const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(fecha);
		return match ? `${match[3]}/${match[2]}/${match[1]}` : fecha;
	}

	return new Intl.DateTimeFormat('es-AR', {
		weekday: 'long',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date);
}
