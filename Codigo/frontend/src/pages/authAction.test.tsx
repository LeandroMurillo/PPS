// @vitest-environment jsdom
import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FirebaseError } from 'firebase/app';

import AuthActionPage from './authAction';
import * as firebaseAuthModule from 'firebase/auth';
import { notify } from '../utils/toast';

// Mock de react-toastify / notify
vi.mock('../utils/toast', () => ({
	notify: {
		success: vi.fn(),
		error: vi.fn(),
		info: vi.fn(),
		warning: vi.fn(),
	},
}));

// Mock de firebase/auth
vi.mock('firebase/auth', async () => {
	const actual = await vi.importActual<typeof import('firebase/auth')>('firebase/auth');
	return {
		...actual,
		verifyPasswordResetCode: vi.fn(),
		confirmPasswordReset: vi.fn(),
		applyActionCode: vi.fn(),
	};
});

describe('AuthActionPage - Restablecer Contraseña', () => {
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it('muestra error si no se proporciona el parámetro oobCode', async () => {
		render(
			<MemoryRouter initialEntries={['/auth/action?mode=resetPassword']}>
				<AuthActionPage />
			</MemoryRouter>,
		);

		await waitFor(() => {
			expect(
				screen.getByText(/El enlace de verificación o recuperación es inválido/i),
			).toBeDefined();
		});
	});

	it('muestra error si el modo no es compatible', async () => {
		render(
			<MemoryRouter initialEntries={['/auth/action?mode=unknownMode&oobCode=123456']}>
				<AuthActionPage />
			</MemoryRouter>,
		);

		await waitFor(() => {
			expect(screen.getByText(/La acción solicitada no es compatible/i)).toBeDefined();
		});
	});

	it('verifica el código de restablecimiento y muestra el formulario con el email del usuario', async () => {
		vi.mocked(firebaseAuthModule.verifyPasswordResetCode).mockResolvedValueOnce('usuario.test@mosaico.gob.ar');

		render(
			<MemoryRouter initialEntries={['/auth/action?mode=resetPassword&oobCode=valid-code-123']}>
				<AuthActionPage />
			</MemoryRouter>,
		);

		await waitFor(() => {
			expect(firebaseAuthModule.verifyPasswordResetCode).toHaveBeenCalledWith(
				expect.anything(),
				'valid-code-123',
			);
			expect(screen.getByText(/Restablecer contraseña/i)).toBeDefined();
			expect(screen.getByText('usuario.test@mosaico.gob.ar')).toBeDefined();
		});

		expect(screen.getByLabelText(/^Nueva contraseña/i)).toBeDefined();
		expect(screen.getByLabelText(/^Confirmar nueva contraseña/i)).toBeDefined();
		expect(screen.getByRole('button', { name: /Guardar nueva contraseña/i })).toBeDefined();
	});

	it('muestra error si el código de restablecimiento expiró o es inválido', async () => {
		vi.mocked(firebaseAuthModule.verifyPasswordResetCode).mockRejectedValueOnce(
			new FirebaseError('auth/expired-action-code', 'Action code has expired'),
		);

		render(
			<MemoryRouter initialEntries={['/auth/action?mode=resetPassword&oobCode=expired-code-123']}>
				<AuthActionPage />
			</MemoryRouter>,
		);

		await waitFor(() => {
			expect(screen.getByText(/El enlace ha expirado. Por favor solicitá un nuevo enlace/i)).toBeDefined();
		});
	});

	it('valida que la nueva contraseña tenga al menos 6 caracteres alfanuméricos', async () => {
		vi.mocked(firebaseAuthModule.verifyPasswordResetCode).mockResolvedValueOnce('usuario.test@mosaico.gob.ar');

		render(
			<MemoryRouter initialEntries={['/auth/action?mode=resetPassword&oobCode=valid-code-123']}>
				<AuthActionPage />
			</MemoryRouter>,
		);

		await waitFor(() => {
			expect(screen.getByLabelText(/^Nueva contraseña/i)).toBeDefined();
		});

		const newPassInput = screen.getByLabelText(/^Nueva contraseña/i);
		const confirmPassInput = screen.getByLabelText(/^Confirmar nueva contraseña/i);
		const submitButton = screen.getByRole('button', { name: /Guardar nueva contraseña/i });

		// Password demasiado corta o solo letras
		fireEvent.change(newPassInput, { target: { value: 'abc' } });
		fireEvent.change(confirmPassInput, { target: { value: 'abc' } });
		fireEvent.click(submitButton);

		expect(notify.error).toHaveBeenCalledWith(
			expect.stringContaining('al menos 6 caracteres, letras y números'),
			expect.anything(),
		);
		expect(firebaseAuthModule.confirmPasswordReset).not.toHaveBeenCalled();
	});

	it('valida que las contraseñas coincidan', async () => {
		vi.mocked(firebaseAuthModule.verifyPasswordResetCode).mockResolvedValueOnce('usuario.test@mosaico.gob.ar');

		render(
			<MemoryRouter initialEntries={['/auth/action?mode=resetPassword&oobCode=valid-code-123']}>
				<AuthActionPage />
			</MemoryRouter>,
		);

		await waitFor(() => {
			expect(screen.getByLabelText(/^Nueva contraseña/i)).toBeDefined();
		});

		const newPassInput = screen.getByLabelText(/^Nueva contraseña/i);
		const confirmPassInput = screen.getByLabelText(/^Confirmar nueva contraseña/i);
		const submitButton = screen.getByRole('button', { name: /Guardar nueva contraseña/i });

		fireEvent.change(newPassInput, { target: { value: 'ClaveSegura123' } });
		fireEvent.change(confirmPassInput, { target: { value: 'OtraClaveDistinta456' } });
		fireEvent.click(submitButton);

		expect(notify.error).toHaveBeenCalledWith(
			'Las contraseñas no coinciden.',
			expect.anything(),
		);
		expect(firebaseAuthModule.confirmPasswordReset).not.toHaveBeenCalled();
	});

	it('restablece la contraseña exitosamente y muestra pantalla de confirmación', async () => {
		vi.mocked(firebaseAuthModule.verifyPasswordResetCode).mockResolvedValueOnce('usuario.test@mosaico.gob.ar');
		vi.mocked(firebaseAuthModule.confirmPasswordReset).mockResolvedValueOnce(undefined);

		render(
			<MemoryRouter initialEntries={['/auth/action?mode=resetPassword&oobCode=valid-code-123']}>
				<AuthActionPage />
			</MemoryRouter>,
		);

		await waitFor(() => {
			expect(screen.getByLabelText(/^Nueva contraseña/i)).toBeDefined();
		});

		const newPassInput = screen.getByLabelText(/^Nueva contraseña/i);
		const confirmPassInput = screen.getByLabelText(/^Confirmar nueva contraseña/i);
		const submitButton = screen.getByRole('button', { name: /Guardar nueva contraseña/i });

		fireEvent.change(newPassInput, { target: { value: 'NuevaClaveValida1' } });
		fireEvent.change(confirmPassInput, { target: { value: 'NuevaClaveValida1' } });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(firebaseAuthModule.confirmPasswordReset).toHaveBeenCalledWith(
				expect.anything(),
				'valid-code-123',
				'NuevaClaveValida1',
			);
			expect(screen.getByText(/¡Tu contraseña ha sido restablecida exitosamente!/i)).toBeDefined();
			expect(screen.getByRole('button', { name: /Ir a Iniciar Sesión/i })).toBeDefined();
		});
	});
});
