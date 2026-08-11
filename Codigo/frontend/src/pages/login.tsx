import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { SignInPage, type AuthProvider, type AuthResponse } from '@toolpad/core/SignInPage';
import { Alert, Link, Typography } from '@mui/material';
import { loginApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';

const AUTH_PROVIDERS: AuthProvider[] = [{ id: 'credentials', name: 'Email y Contraseña' }];

export default function LoginPage() {
	const navigate = useNavigate();
	const { login } = useAuth();
	const [customError, setCustomError] = useState<string | null>(null);

	const handleSignIn = async (provider: AuthProvider, formData?: FormData): Promise<AuthResponse> => {
		setCustomError(null);

		if (provider.id === 'credentials' && formData) {
			const email = (formData.get('email') as string) || '';
			const password = (formData.get('password') as string) || '';

			if (!email.trim() || !password) {
				return {
					error: 'Por favor complete todos los campos.',
				};
			}

			try {
				const response = await loginApi({ email, contraseña: password });
				login(response.usuario);
				navigate('/');
				return {};
			} catch (err) {
				const msg = err instanceof Error ? err.message : 'Error al iniciar sesión';
				setCustomError(msg);
				return {
					error: msg,
				};
			}
		}

		return { error: 'Proveedor no soportado' };
	};

	return (
		<div>
			{customError && (
				<Alert severity="error" sx={{ mb: 2 }} onClose={() => setCustomError(null)}>
					{customError}
				</Alert>
			)}

			<SignInPage
				providers={AUTH_PROVIDERS}
				signIn={handleSignIn}
				slots={{
					signUpLink: () => (
						<Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
							¿No tenés una cuenta?{' '}
							<Link component={RouterLink} to="/registro" underline="hover">
								Registrate acá
							</Link>
						</Typography>
					),
				}}
				slotProps={{
					emailField: { label: 'Correo electrónico', autoFocus: true, fullWidth: true },
					passwordField: { label: 'Contraseña', fullWidth: true },
					submitButton: { children: 'Iniciar Sesión', fullWidth: true },
				}}
			/>
		</div>
	);
}
