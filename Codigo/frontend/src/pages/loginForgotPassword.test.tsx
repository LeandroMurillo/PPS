// @vitest-environment jsdom
import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FirebaseError } from 'firebase/app';

import LoginPage from './login';
import * as firebaseAuthModule from 'firebase/auth';
import { getGoogleRedirectResult } from '../utils/googleAuth';
import { notify } from '../utils/toast';

// Mock de notify
vi.mock('../utils/toast', () => ({
	notify: {
		success: vi.fn(),
		error: vi.fn(),
		info: vi.fn(),
		warning: vi.fn(),
	},
}));

// Mock de AuthContext
vi.mock('../context/AuthContext', () => ({
	useAuth: () => ({
		login: vi.fn(),
		user: null,
		token: null,
		loading: false,
	}),
}));

// Mock de utils/googleAuth
vi.mock('../utils/googleAuth', () => ({
	getGoogleRedirectResult: vi.fn(),
	signInWithGoogle: vi.fn(),
}));

// Mock de firebase
vi.mock('../config/firebase', () => ({
	firebaseAuth: {},
}));

// Mock de firebase/auth
vi.mock('firebase/auth', async () => {
	const actual = await vi.importActual<typeof import('firebase/auth')>('firebase/auth');
	return {
		...actual,
		sendPasswordResetEmail: vi.fn(),
		signInWithEmailAndPassword: vi.fn(),
		signOut: vi.fn(),
		sendEmailVerification: vi.fn(),
	};
});

describe('LoginPage - Diálogo de Recuperación de Contraseña', () => {
	beforeEach(() => {
		vi.mocked(getGoogleRedirectResult).mockResolvedValue(null);
	});

	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it('abre el diálogo de recuperación de contraseña al hacer clic en el enlace', async () => {
		render(
			<MemoryRouter>
				<LoginPage />
			</MemoryRouter>,
		);

		const forgotButton = screen.getByRole('button', { name: /¿Olvidaste.*contraseña\?/i });
		fireEvent.click(forgotButton);

		expect(screen.getByRole('heading', { name: /Recuperar contraseña/i })).toBeDefined();
		expect(
			screen.getByText(/Ingresá tu correo electrónico y te enviaremos las instrucciones/i),
		).toBeDefined();
	});

	it('precompleta el email si el usuario ya lo había escrito en el formulario de login', async () => {
		render(
			<MemoryRouter>
				<LoginPage />
			</MemoryRouter>,
		);

		const emailInput = screen.getByLabelText(/Correo electrónico/i);
		fireEvent.change(emailInput, { target: { value: 'artista@mosaico.gob.ar' } });

		const forgotButton = screen.getByRole('button', { name: /¿Olvidaste.*contraseña\?/i });
		fireEvent.click(forgotButton);

		const dialogEmailInput = screen.getAllByLabelText(/Correo electrónico/i)[1];
		expect((dialogEmailInput as HTMLInputElement).value).toBe('artista@mosaico.gob.ar');
	});

	it('envía el correo de restablecimiento llamando a sendPasswordResetEmail con éxito', async () => {
		vi.mocked(firebaseAuthModule.sendPasswordResetEmail).mockResolvedValueOnce();

		render(
			<MemoryRouter>
				<LoginPage />
			</MemoryRouter>,
		);

		const forgotButton = screen.getByRole('button', { name: /¿Olvidaste.*contraseña\?/i });
		fireEvent.click(forgotButton);

		const dialogEmailInput = screen.getAllByLabelText(/Correo electrónico/i)[1];
		fireEvent.change(dialogEmailInput, { target: { value: 'contacto@mosaico.gob.ar' } });

		const submitButton = screen.getByRole('button', { name: /Enviar instrucciones/i });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(firebaseAuthModule.sendPasswordResetEmail).toHaveBeenCalledWith(
				expect.anything(),
				'contacto@mosaico.gob.ar',
			);
			expect(notify.info).toHaveBeenCalledWith(
				'Si el correo está registrado, recibirás las instrucciones.',
				{ scope: 'forgot-password' },
			);
			expect(
				screen.getByText(/Si el correo existe en nuestro sistema, recibirás las instrucciones/i),
			).toBeDefined();
		});
	});

	it('muestra notificación de error si el envío falla', async () => {
		vi.mocked(firebaseAuthModule.sendPasswordResetEmail).mockRejectedValueOnce(
			new FirebaseError('auth/user-not-found', 'No user found'),
		);

		render(
			<MemoryRouter>
				<LoginPage />
			</MemoryRouter>,
		);

		const forgotButton = screen.getByRole('button', { name: /¿Olvidaste.*contraseña\?/i });
		fireEvent.click(forgotButton);

		const dialogEmailInput = screen.getAllByLabelText(/Correo electrónico/i)[1];
		fireEvent.change(dialogEmailInput, { target: { value: 'desconocido@ejemplo.com' } });

		const submitButton = screen.getByRole('button', { name: /Enviar instrucciones/i });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(notify.error).toHaveBeenCalledWith(
				'No se encontró un usuario asociado a esta cuenta.',
				{ scope: 'forgot-password' },
			);
		});
	});
});
