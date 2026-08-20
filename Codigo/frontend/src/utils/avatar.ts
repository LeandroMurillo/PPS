/**
 * Utilidades para la generación local y segura de avatares mediante DiceBear.
 *
 * Mejoras implementadas:
 * 1. Privacidad Total: Generación de SVGs 100% en memoria en el cliente (cero llamadas HTTP externas).
 * 2. Estilos consistentes: Selección por género y colecciones neutras atractivas (evita initials rotos).
 * 3. Selector de estilos: Soporte para personalización por el usuario con persistencia en localStorage.
 * 4. Optimización y Rendimiento: Caché en memoria (Map) y parámetros de escala y radio para circularidad perfecta.
 */

import { createAvatar } from '@dicebear/core';
import {
	adventurerNeutral,
	botttsNeutral,
	funEmoji,
	identicon,
	lorelei,
	micah,
	notionistsNeutral,
	openPeeps,
	shapes,
	thumbs,
} from '@dicebear/collection';

export type AvatarStyleKey =
	| 'lorelei'
	| 'micah'
	| 'botttsNeutral'
	| 'adventurerNeutral'
	| 'notionistsNeutral'
	| 'thumbs'
	| 'funEmoji'
	| 'shapes'
	| 'openPeeps'
	| 'identicon';

export interface AvatarStyleOption {
	key: AvatarStyleKey;
	label: string;
	description: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	collection: any;
	defaultColors: string[];
}

export const AVATAR_STYLES: Record<AvatarStyleKey, AvatarStyleOption> = {
	lorelei: {
		key: 'lorelei',
		label: 'Lorelei',
		description: 'Ilustración artística moderna',
		collection: lorelei,
		defaultColors: ['f9d5e5', 'f7c6d9', 'f2d7d5'],
	},
	micah: {
		key: 'micah',
		label: 'Micah',
		description: 'Retrato minimalista contemporáneo',
		collection: micah,
		defaultColors: ['dbeafe', 'c7d2fe', 'e0f2fe'],
	},
	botttsNeutral: {
		key: 'botttsNeutral',
		label: 'Robots (Bottts)',
		description: 'Personajes robóticos y futuristas',
		collection: botttsNeutral,
		defaultColors: ['e0e7ff', 'ede9fe', 'f3e8ff'],
	},
	adventurerNeutral: {
		key: 'adventurerNeutral',
		label: 'Aventurero',
		description: 'Estilo fantástico y RPG',
		collection: adventurerNeutral,
		defaultColors: ['fef3c7', 'fee2e2', 'fce7f3'],
	},
	notionistsNeutral: {
		key: 'notionistsNeutral',
		label: 'Notionist',
		description: 'Minimalismo y estética moderna',
		collection: notionistsNeutral,
		defaultColors: ['f3f4f6', 'e5e7eb', 'e2e8f0'],
	},
	thumbs: {
		key: 'thumbs',
		label: 'Thumbs',
		description: 'Caritas amigables y expresivas',
		collection: thumbs,
		defaultColors: ['fef08a', 'fed7aa', 'fbcfe8'],
	},
	funEmoji: {
		key: 'funEmoji',
		label: 'Fun Emoji',
		description: 'Emojis alegres y coloridos',
		collection: funEmoji,
		defaultColors: ['fef9c3', 'fef08a', 'fde047'],
	},
	shapes: {
		key: 'shapes',
		label: 'Shapes',
		description: 'Formas geométricas y abstractas',
		collection: shapes,
		defaultColors: ['e0f2fe', 'bae6fd', '7dd3fc'],
	},
	openPeeps: {
		key: 'openPeeps',
		label: 'Open Peeps',
		description: 'Bocetos y dibujos a mano alzada',
		collection: openPeeps,
		defaultColors: ['f5f5f5', 'e5e5e5', 'd4d4d4'],
	},
	identicon: {
		key: 'identicon',
		label: 'Identicon',
		description: 'Patrones simétricos algorítmicos',
		collection: identicon,
		defaultColors: ['e2e8f0', 'cbd5e1', '94a3b8'],
	},
};

export const AVATAR_STYLE_LIST: AvatarStyleOption[] = Object.values(AVATAR_STYLES);

const AVATAR_STYLE_PREF_KEY = 'mosaico_avatar_style_preference';
export const AVATAR_STYLE_CHANGED_EVENT = 'mosaico:avatar-style-changed';

/**
 * Hashea una cadena de texto de forma determinística (64-bit FNV-1a + cyrb53 mix).
 */
export function hashString(input: string): string {
	if (!input) return 'anonymous';

	let h1 = 0xdeadbeef;
	let h2 = 0x41c6ce57;
	for (let i = 0; i < input.length; i++) {
		const ch = input.charCodeAt(i);
		h1 = Math.imul(h1 ^ ch, 2654435761);
		h2 = Math.imul(h2 ^ ch, 1597334677);
	}
	h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
	h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
	h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
	h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

	const combined = 4294967296 * (2097151 & h2) + (h1 >>> 0);
	return combined.toString(16).padStart(14, '0');
}

/**
 * Determina el estilo por defecto según el género si el usuario no ha elegido uno específico.
 */
export function getDefaultAvatarStyle(genero?: string): AvatarStyleKey {
	if (genero === 'F' || genero === 'MF') return 'lorelei';
	if (genero === 'M' || genero === 'FM') return 'micah';
	return 'botttsNeutral';
}

/**
 * Obtiene el estilo de avatar guardado para un usuario específico o globalmente en el navegador.
 */
export function getSavedAvatarStyle(userId?: number | string): AvatarStyleKey | null {
	try {
		if (userId) {
			const userSpecific = localStorage.getItem(`${AVATAR_STYLE_PREF_KEY}_${userId}`);
			if (userSpecific && userSpecific in AVATAR_STYLES) return userSpecific as AvatarStyleKey;
		}
		const generic = localStorage.getItem(AVATAR_STYLE_PREF_KEY);
		if (generic && generic in AVATAR_STYLES) return generic as AvatarStyleKey;
	} catch {
		// Ignore storage errors
	}
	return null;
}

/**
 * Guarda la preferencia de estilo de avatar y emite un evento global para actualizar la UI en vivo.
 */
export function saveAvatarStyle(style: AvatarStyleKey, userId?: number | string): void {
	try {
		localStorage.setItem(AVATAR_STYLE_PREF_KEY, style);
		if (userId) {
			localStorage.setItem(`${AVATAR_STYLE_PREF_KEY}_${userId}`, style);
		}
		window.dispatchEvent(new CustomEvent(AVATAR_STYLE_CHANGED_EVENT, { detail: { style, userId } }));
	} catch {
		// Ignore storage errors
	}
}

export interface UserForAvatar {
	idUsuario?: number | string;
	nombre?: string;
	apellido?: string;
	email?: string;
	genero?: string;
	avatarEstilo?: string | null;
	avatarSeed?: string | null;
}

// Caché en memoria para evitar recalcular SVGs ya renderizados
const avatarCache = new Map<string, string>();

/**
 * Genera una semilla aleatoria amigable para el avatar del usuario.
 */
export function generateRandomSeed(): string {
	const adjectives = [
		'mosaico',
		'astro',
		'luna',
		'sol',
		'rio',
		'viento',
		'eco',
		'onda',
		'rayo',
		'fuego',
		'magia',
		'arte',
	];
	const nouns = [
		'tucuman',
		'norte',
		'cerro',
		'selva',
		'valle',
		'jardin',
		'estrella',
		'puma',
		'pajaro',
		'flor',
		'creativo',
		'cultura',
	];
	const adj = adjectives[Math.floor(Math.random() * adjectives.length)]!;
	const noun = nouns[Math.floor(Math.random() * nouns.length)]!;
	const num = Math.floor(Math.random() * 900) + 100;
	return `${adj}-${noun}-${num}`;
}

/**
 * Genera el avatar en formato Data URI (SVG local en memoria) para el usuario dado.
 * Soporta estilos personalizados y semillas personalizadas.
 */
export function getUserAvatarUrl(
	user?: UserForAvatar | null,
	customStyle?: AvatarStyleKey,
	customSeed?: string,
): string {
	if (!user) return '';

	// Estilo: prioridad customStyle > user.avatarEstilo > localStorage > género
	const userDbStyle =
		user.avatarEstilo && user.avatarEstilo in AVATAR_STYLES ? (user.avatarEstilo as AvatarStyleKey) : null;
	const styleKey =
		customStyle || userDbStyle || getSavedAvatarStyle(user.idUsuario) || getDefaultAvatarStyle(user.genero);

	const styleOption = AVATAR_STYLES[styleKey] || AVATAR_STYLES.botttsNeutral;

	// Semilla: prioridad customSeed > user.avatarSeed > hash inmutable
	let finalSeed: string;
	if (customSeed !== undefined && customSeed !== null && customSeed.trim() !== '') {
		finalSeed = customSeed.trim();
	} else if (user.avatarSeed && user.avatarSeed.trim() !== '') {
		finalSeed = user.avatarSeed.trim();
	} else {
		const rawData = `salt_mosaico_${user.idUsuario ?? ''}_${user.email ?? ''}_${user.nombre ?? ''}_${user.apellido ?? ''}`;
		finalSeed = hashString(rawData.trim() || 'default_seed');
	}

	const cacheKey = `${styleKey}:${finalSeed}`;
	if (avatarCache.has(cacheKey)) {
		return avatarCache.get(cacheKey)!;
	}

	try {
		const avatar = createAvatar(styleOption.collection, {
			seed: finalSeed,
			backgroundColor: styleOption.defaultColors,
			size: 128,
			radius: 50,
			scale: 90,
		});

		const dataUri = avatar.toDataUri();
		avatarCache.set(cacheKey, dataUri);
		return dataUri;
	} catch (e) {
		console.error('Error generando avatar localmente:', e);
		return '';
	}
}
