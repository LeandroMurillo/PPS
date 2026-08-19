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
	'auth/weak-password': 'La contraseña debe tener al menos seis caracteres.',
};

export function getFirebaseErrorMessage(error: unknown, fallback: string): string {
	if (error instanceof FirebaseError) {
		return FIREBASE_ERROR_MESSAGES[error.code] ?? fallback;
	}
	return error instanceof Error ? error.message : fallback;
}
