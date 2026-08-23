import dayjs from 'dayjs';

export interface CalendarEventData {
	nombreEvento: string;
	descripcion?: string | null;
	fecha: string;
	departamento?: string | null;
	localidad?: string | null;
	direccion?: string | null;
}

export function createGoogleCalendarUrl(event: CalendarEventData): string {
	const startObj = dayjs(event.fecha);
	const tieneHora = startObj.format('HH:mm') !== '00:00';

	let datesParam: string;
	if (tieneHora) {
		const startStr = startObj.format('YYYYMMDDTHHmmss');
		const endStr = startObj.add(2, 'hour').format('YYYYMMDDTHHmmss');
		datesParam = `${startStr}/${endStr}`;
	} else {
		const startStr = startObj.format('YYYYMMDD');
		const endStr = startObj.add(1, 'day').format('YYYYMMDD');
		datesParam = `${startStr}/${endStr}`;
	}

	const locationParts = [event.direccion, event.localidad, event.departamento, 'Tucumán, Argentina']
		.filter(Boolean)
		.join(', ');

	const details = event.descripcion
		? `${event.descripcion}\n\nPublicado en Mosaico Cultural Tucumán`
		: 'Evento publicado en Mosaico Cultural Tucumán';

	const params = new URLSearchParams({
		action: 'TEMPLATE',
		text: event.nombreEvento,
		dates: datesParam,
		details,
		location: locationParts,
	});

	return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadIcsFile(event: CalendarEventData): void {
	const startObj = dayjs(event.fecha);
	const tieneHora = startObj.format('HH:mm') !== '00:00';

	let dtstart: string;
	let dtend: string;

	if (tieneHora) {
		dtstart = `VALUE=DATE-TIME:${startObj.format('YYYYMMDDTHHmmss')}`;
		dtend = `VALUE=DATE-TIME:${startObj.add(2, 'hour').format('YYYYMMDDTHHmmss')}`;
	} else {
		dtstart = `VALUE=DATE:${startObj.format('YYYYMMDD')}`;
		dtend = `VALUE=DATE:${startObj.add(1, 'day').format('YYYYMMDD')}`;
	}

	const locationParts = [event.direccion, event.localidad, event.departamento, 'Tucumán, Argentina']
		.filter(Boolean)
		.join(', ');

	const sanitizeText = (txt: string) =>
		txt.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');

	const icsContent = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//Mosaico Cultural//Agenda Cultural Tucuman//ES',
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		'BEGIN:VEVENT',
		`SUMMARY:${sanitizeText(event.nombreEvento)}`,
		`DESCRIPTION:${sanitizeText(event.descripcion ?? 'Evento publicado en Mosaico Cultural Tucumán')}`,
		`LOCATION:${sanitizeText(locationParts)}`,
		`DTSTART;${dtstart}`,
		`DTEND;${dtend}`,
		`DTSTAMP:${dayjs().format('YYYYMMDDTHHmmss')}Z`,
		`UID:${Date.now()}-${Math.random().toString(36).substring(2, 9)}@mosaicocultural.tucuman.gob.ar`,
		'STATUS:CONFIRMED',
		'END:VEVENT',
		'END:VCALENDAR',
	].join('\r\n');

	const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	const safeFilename =
		event.nombreEvento
			.toLowerCase()
			.replace(/[^a-z0-9_-]/g, '_')
			.substring(0, 40) || 'evento';
	link.setAttribute('download', `${safeFilename}.ics`);
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}
