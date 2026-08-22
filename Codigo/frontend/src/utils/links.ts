/**
 * Utilidades para detección y manipulación de enlaces y redes sociales.
 */

export type TipoEnlace = 'youtube' | 'instagram' | 'facebook' | 'whatsapp' | 'otro';

export function normalizarUrl(url: string): string {
	const trimmed = (url ?? '').trim();
	if (!trimmed) return trimmed;
	if (/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//i.test(trimmed)) {
		return trimmed;
	}
	return `https://${trimmed}`;
}

export function detectarTipoEnlace(url: string): TipoEnlace {
	if (!url) return 'otro';
	const u = normalizarUrl(url).toLowerCase();
	if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
	if (u.includes('instagram.com')) return 'instagram';
	if (u.includes('facebook.com') || u.includes('fb.com')) return 'facebook';
	if (u.includes('wa.me') || u.includes('whatsapp.com')) return 'whatsapp';
	return 'otro';
}

export function obtenerIdYoutube(url: string): string | null {
	if (!url) return null;
	try {
		const parsed = new URL(normalizarUrl(url));
		if (parsed.hostname.includes('youtu.be')) {
			return parsed.pathname.replace('/', '') || null;
		}
		if (parsed.hostname.includes('youtube.com')) {
			const v = parsed.searchParams.get('v');
			if (v) return v;
			const partes = parsed.pathname.split('/').filter(Boolean);
			if (partes[0] === 'embed' || partes[0] === 'shorts' || partes[0] === 'v' || partes[0] === 'live') {
				return partes[1] || null;
			}
		}
		return null;
	} catch {
		return null;
	}
}

export function esImagenPortafolio(item: { tipo?: string; url: string }) {
	const tipo = (item.tipo ?? '').toLowerCase();
	if (tipo.includes('imagen') || tipo.includes('foto')) {
		return true;
	}
	return /\.(jpe?g|png|webp|gif|avif)(\?.*)?$/i.test(item.url);
}
