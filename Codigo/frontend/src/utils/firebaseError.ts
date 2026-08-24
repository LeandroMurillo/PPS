import { FirebaseError } from 'firebase/app';

const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
	'auth/account-exists-with-different-credential': 'Ya existe una cuenta con ese correo y otro método de acceso.',
	'auth/email-already-in-use': 'El correo electrónico ya está registrado.',
	'auth/invalid-credential': 'El correo electrónico o la contraseña son incorrectos.',
	'auth/invalid-email': 'El correo electrónico no es válido.',
	'auth/popup-closed-by-user': 'Se cerró la ventana de Google antes de completar el acceso.',
	'auth/popup-blocked': 'El navegador bloqueó la ventana de acceso con Google.',
	'auth/too-many-requests': 'Hubo demasiados intentos. Esperá unos minutos y volvé a intentar.',
	'auth/user-disabled': 'La cuenta de autenticación se encuentra deshabilitada.',
	'auth/user-not-found': 'No se encontró un usuario asociado a esta cuenta.',
	'auth/weak-password': 'La nueva contraseña debe tener al menos seis caracteres.',
	'auth/wrong-password': 'La contraseña actual ingresada es incorrecta.',
	'auth/requires-recent-login': 'Esta operación requiere volver a iniciar sesión por seguridad.',
	'auth/expired-action-code': 'El enlace ha expirado. Por favor solicitá un nuevo enlace.',
	'auth/invalid-action-code': 'El enlace es inválido o ya fue utilizado anteriormente.',
};

function isBrowserStorageError(message: string): boolean {
	const normalizedMessage = message.toLowerCase();
	return (
		normalizedMessage.includes('database is closing') ||
		normalizedMessage.includes('database is closed') ||
		normalizedMessage.includes('database is hidden') ||
		normalizedMessage.includes('indexeddb')
	);
}

export function getFirebaseErrorMessage(error: unknown, fallback: string): string {
	if (error instanceof FirebaseError) {
		if (
			error.code === 'auth/internal-error' ||
			isBrowserStorageError(error.message) ||
			isBrowserStorageError(String(error.customData?._serverResponse ?? ''))
		) {
			return 'El navegador tuvo un problema temporal con el almacenamiento de la sesión. Reintentá iniciar sesión.';
		}
		return FIREBASE_ERROR_MESSAGES[error.code] ?? fallback;
	}
	if (error instanceof Error && isBrowserStorageError(error.message)) {
		return 'El navegador tuvo un problema temporal con el almacenamiento de la sesión. Reintentá iniciar sesión.';
	}
	return error instanceof Error ? error.message : fallback;
}
