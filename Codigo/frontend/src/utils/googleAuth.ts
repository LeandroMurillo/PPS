import { getRedirectResult, signInWithPopup, signInWithRedirect, type UserCredential } from 'firebase/auth';

import { firebaseAuth, googleAuthProvider } from '../config/firebase';

const REDIRECT_FALLBACK_ERRORS = new Set([
	'auth/popup-blocked',
	'auth/popup-closed-by-user',
	'auth/cancelled-popup-request',
]);

function firebaseErrorCode(error: unknown): string | undefined {
	if (typeof error !== 'object' || error === null || !('code' in error)) return undefined;
	return typeof error.code === 'string' ? error.code : undefined;
}

/**
 * Inicia sesión con una ventana emergente y cambia a redirección cuando el
 * navegador no permite completar ese mecanismo.
 */
export async function signInWithGoogle(): Promise<UserCredential | null> {
	try {
		return await signInWithPopup(firebaseAuth, googleAuthProvider);
	} catch (error) {
		if (!REDIRECT_FALLBACK_ERRORS.has(firebaseErrorCode(error) ?? '')) throw error;
		await signInWithRedirect(firebaseAuth, googleAuthProvider);
		return null;
	}
}

export function getGoogleRedirectResult(): Promise<UserCredential | null> {
	return getRedirectResult(firebaseAuth);
}
