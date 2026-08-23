import { firebaseAuth } from '../config/firebase';

const API_BASE_URL = (import.meta as ImportMeta & { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? '';

const TOKEN_STORAGE_KEY = 'mosaico_cultural_token';
const USER_STORAGE_KEY = 'mosaico_cultural_user_session';
export const SESSION_INVALIDATED_EVENT = 'mosaico-cultural:session-invalidated';

type ApiErrorBody = {
	error?: {
		message?: string;
	};
};

type ApiRequestInit = RequestInit & {
	authMode?: 'application' | 'firebase' | 'none';
};

function resolveUrl(path: string): string {
	if (/^https?:\/\//i.test(path)) {
		return path;
	}
	const base = API_BASE_URL.replace(/\/$/, '');
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;
	return `${base}${normalizedPath}`;
}

function sanitizeErrorMessage(rawMessage: string): string {
	const match = rawMessage.match(/SQLState:\s*45000\)\s*([\s\S]*?)(?:\s+sql:\s|$)/i);
	if (match?.[1]?.trim()) {
		return match[1].trim();
	}
	if (/\b(?:conn:\s*\d+|SQLState:|sql:\s)/i.test(rawMessage)) {
		const cleaned = rawMessage
			.replace(/^\(conn:\s*\d+,\s*no:\s*\d+,\s*SQLState:\s*[^)]+\)\s*/i, '')
			.replace(/\s+sql:\s+CALL[\s\S]*$/i, '')
			.replace(/\s+sql:\s+SELECT[\s\S]*$/i, '')
			.trim();
		if (cleaned) return cleaned;
	}
	return rawMessage;
}

export async function apiRequest<T>(path: string, init?: ApiRequestInit): Promise<T> {
	const headers = new Headers(init?.headers);
	const authMode = init?.authMode ?? 'application';
	const { authMode: _authMode, ...requestInit } = init ?? {};
	void _authMode;

	const token =
		authMode === 'firebase'
			? await firebaseAuth.currentUser?.getIdToken()
			: authMode === 'application' && typeof localStorage !== 'undefined'
				? localStorage.getItem(TOKEN_STORAGE_KEY)
				: null;
	if (token && !headers.has('Authorization')) {
		headers.set('Authorization', `Bearer ${token}`);
	}

	const response = await fetch(resolveUrl(path), {
		...requestInit,
		headers,
	});

	if (response.status === 401 && typeof window !== 'undefined') {
		localStorage.removeItem(TOKEN_STORAGE_KEY);
		localStorage.removeItem(USER_STORAGE_KEY);
		window.dispatchEvent(new Event(SESSION_INVALIDATED_EVENT));
	}

	if (!response.ok) {
		let message = 'No se pudo completar la solicitud al backend.';

		try {
			const body = (await response.json()) as ApiErrorBody;
			message = body.error?.message ?? message;
		} catch {
			// La respuesta de error no siempre es JSON.
		}

		throw new Error(sanitizeErrorMessage(message));
	}

	return (await response.json()) as T;
}

export async function apiFetch<T>(path: string, signal?: AbortSignal): Promise<T> {
	return apiRequest<T>(path, { signal });
}

export async function apiFetchBlob(path: string, signal?: AbortSignal): Promise<Blob> {
	const token = typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;
	const headers = new Headers();
	if (token) {
		headers.set('Authorization', `Bearer ${token}`);
	}

	const response = await fetch(resolveUrl(path), {
		signal,
		headers,
	});

	if (response.status === 401 && typeof window !== 'undefined') {
		localStorage.removeItem(TOKEN_STORAGE_KEY);
		localStorage.removeItem(USER_STORAGE_KEY);
		window.dispatchEvent(new Event(SESSION_INVALIDATED_EVENT));
	}

	if (!response.ok) {
		throw new Error('No se pudo cargar el archivo.');
	}

	return response.blob();
}

export function appendOptionalParam(params: URLSearchParams, key: string, value: string | number | null | undefined) {
	if (value === null || value === undefined || value === '') {
		return;
	}

	params.set(key, String(value));
}
