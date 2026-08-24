import { describe, expect, it } from 'vitest';
import { FirebaseError } from 'firebase/app';
import { getFirebaseErrorMessage } from './firebaseError';

describe('getFirebaseErrorMessage', () => {
	it('retorna mensajes en español para códigos de error conocidos de Firebase', () => {
		expect(getFirebaseErrorMessage(new FirebaseError('auth/weak-password', ''), 'Fallback')).toBe(
			'La nueva contraseña debe tener al menos seis caracteres.',
		);
		expect(getFirebaseErrorMessage(new FirebaseError('auth/wrong-password', ''), 'Fallback')).toBe(
			'La contraseña actual ingresada es incorrecta.',
		);
		expect(getFirebaseErrorMessage(new FirebaseError('auth/invalid-credential', ''), 'Fallback')).toBe(
			'El correo electrónico o la contraseña son incorrectos.',
		);
		expect(getFirebaseErrorMessage(new FirebaseError('auth/email-already-in-use', ''), 'Fallback')).toBe(
			'El correo electrónico ya está registrado.',
		);
		expect(getFirebaseErrorMessage(new FirebaseError('auth/expired-action-code', ''), 'Fallback')).toBe(
			'El enlace ha expirado. Por favor solicitá un nuevo enlace.',
		);
		expect(getFirebaseErrorMessage(new FirebaseError('auth/invalid-action-code', ''), 'Fallback')).toBe(
			'El enlace es inválido o ya fue utilizado anteriormente.',
		);
		expect(getFirebaseErrorMessage(new FirebaseError('auth/user-not-found', ''), 'Fallback')).toBe(
			'No se encontró un usuario asociado a esta cuenta.',
		);
	});

	it('retorna el fallback si el error de Firebase no está en el mapa', () => {
		expect(
			getFirebaseErrorMessage(new FirebaseError('auth/unknown-error-code', 'Unknown'), 'Mensaje por defecto'),
		).toBe('Mensaje por defecto');
	});

	it('retorna el mensaje de la excepción estándar si no es FirebaseError', () => {
		expect(getFirebaseErrorMessage(new Error('Error de red personalizado'), 'Fallback')).toBe(
			'Error de red personalizado',
		);
	});

	it('maneja errores de almacenamiento local / IndexedDB adecuadamente', () => {
		expect(getFirebaseErrorMessage(new Error('The database is closing'), 'Fallback')).toContain(
			'problema temporal con el almacenamiento',
		);
	});
});
