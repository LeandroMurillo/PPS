const API_BASE_URL = (import.meta as ImportMeta & { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? '';

type ApiErrorBody = {
	error?: {
		message?: string;
	};
};

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
	const response = await fetch(`${API_BASE_URL}${path}`, init);

	if (!response.ok) {
		let message = 'No se pudo completar la solicitud al backend.';

		try {
			const body = (await response.json()) as ApiErrorBody;
			message = body.error?.message ?? message;
		} catch {
			// La respuesta de error no siempre es JSON.
		}

		throw new Error(message);
	}

	return (await response.json()) as T;
}

export async function apiFetch<T>(path: string, signal?: AbortSignal): Promise<T> {
	return apiRequest<T>(path, { signal });
}

export function appendOptionalParam(params: URLSearchParams, key: string, value: string | number | null | undefined) {
	if (value === null || value === undefined || value === '') {
		return;
	}

	params.set(key, String(value));
}
