import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth';

import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Container,
	Divider,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Link,
	Paper,
	TextField,
	Typography,
} from '@mui/material';
import { useColorScheme } from '@mui/material/styles';

import { crearSesionFirebaseApi } from '../api/auth';
import { firebaseAuth } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { getFirebaseErrorMessage } from '../utils/firebaseError';
import { getGoogleRedirectResult, signInWithGoogle } from '../utils/googleAuth';
import { notify } from '../utils/toast';

export default function LoginPage() {
	const { mode, systemMode } = useColorScheme();
	const isDarkMode = mode === 'system' ? systemMode === 'dark' : mode === 'dark';
	const navigate = useNavigate();
	const { login } = useAuth();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [emailError, setEmailError] = useState<string | null>(null);
	const [passwordError, setPasswordError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	// Forgot password dialog state
	const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
	const [forgotEmail, setForgotEmail] = useState('');
	const [forgotSubmitted, setForgotSubmitted] = useState(false);

	const handleOpenForgotPassword = () => {
		setForgotEmail(email);
		setForgotSubmitted(false);
		setForgotPasswordOpen(true);
	};

	const handleCloseForgotPassword = () => {
		setForgotPasswordOpen(false);
	};

	const handleSendForgotPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		if (forgotEmail.trim()) {
			try {
				await sendPasswordResetEmail(firebaseAuth, forgotEmail.trim().toLowerCase());
				setForgotSubmitted(true);
				notify.info('Si el correo está registrado, recibirás las instrucciones.', {
					scope: 'forgot-password',
				});
			} catch (error) {
				notify.error(getFirebaseErrorMessage(error, 'No se pudo enviar el correo de recuperación.'), {
					scope: 'forgot-password',
				});
			}
		}
	};

	const completeApplicationLogin = async () => {
		const response = await crearSesionFirebaseApi();
		login(response.usuario, response.token);
		notify.success(`¡Hola, ${response.usuario.nombre || 'usuario'}!`, { scope: 'login' });
		navigate('/');
	};

	useEffect(() => {
		void getGoogleRedirectResult()
			.then((credential) => {
				if (credential) return completeApplicationLogin();
			})
			.catch((error) => {
				notify.error(getFirebaseErrorMessage(error, 'No se pudo iniciar sesión con Google.'), {
					scope: 'login-google',
				});
			});
	}, []);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		let hasError = false;
		setEmailError(null);
		setPasswordError(null);

		const trimmedEmail = email.trim();
		if (!trimmedEmail) {
			setEmailError('El correo electrónico es obligatorio.');
			hasError = true;
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
			setEmailError('Ingrese un correo electrónico válido.');
			hasError = true;
		}

		if (!password) {
			setPasswordError('La contraseña es obligatoria.');
			hasError = true;
		}

		if (hasError) {
			notify.error('Por favor complete correctamente los campos requeridos.', { scope: 'login' });
			return;
		}

		setLoading(true);
		try {
			const credential = await signInWithEmailAndPassword(firebaseAuth, trimmedEmail, password);
			await credential.user.reload();
			if (!credential.user.emailVerified) {
				await sendEmailVerification(credential.user, { url: `${window.location.origin}/login` });
				await signOut(firebaseAuth);
				throw new Error('Debés verificar tu correo. Te enviamos un nuevo enlace de verificación.');
			}
			await completeApplicationLogin();
		} catch (err) {
			const msg = getFirebaseErrorMessage(err, 'Error al iniciar sesión');
			setEmailError('Verifique sus credenciales');
			setPasswordError('Verifique sus credenciales');
			notify.error(msg, { scope: 'login' });
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleLogin = async () => {
		setLoading(true);
		try {
			const credential = await signInWithGoogle();
			if (credential) await completeApplicationLogin();
		} catch (error) {
			const message = getFirebaseErrorMessage(error, 'No se pudo iniciar sesión con Google.');
			if (message.includes('completar el registro')) {
				navigate('/registro');
			} else {
				notify.error(message, { scope: 'login-google' });
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box
			sx={{
				minHeight: { xs: 'calc(100dvh - 56px)', sm: 'calc(100dvh - 64px)' },
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				pt: { xs: 2, sm: 3 },
				pb: { xs: 'calc(24px + env(safe-area-inset-bottom, 16px))', sm: 3 },
				px: 2,
				boxSizing: 'border-box',
				backgroundColor: isDarkMode ? '#0b0b0b' : '#f4f6f8',
			}}
		>
			<Container maxWidth={false} disableGutters sx={{ width: '100%', maxWidth: 480 }}>
				<Paper
					elevation={0}
					sx={{
						p: { xs: 2, sm: 3.5 },
						border: '1px solid',
						borderColor: isDarkMode ? '#333333' : '#eaeaea',
						borderRadius: 2,
						backgroundColor: isDarkMode ? '#121212' : '#fdfdfc',
					}}
				>
					<Box sx={{ mb: 2.5, textAlign: 'center' }}>
						<Typography variant="h5" component="h1" fontWeight="bold" color="primary" gutterBottom>
							Iniciar sesión
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Ingresá a tu cuenta para gestionar tu perfil en el Mapa Cultural de Tucumán
						</Typography>
					</Box>

					<Box component="form" onSubmit={handleSubmit} noValidate>
						<Button
							fullWidth
							variant="outlined"
							size="large"
							onClick={handleGoogleLogin}
							disabled={loading}
							sx={{ py: 1.5, mb: 2 }}
						>
							Continuar con Google
						</Button>

						<Divider sx={{ mb: 2 }}>o ingresá con correo</Divider>
						<TextField
							required
							fullWidth
							id="email"
							label="Correo electrónico"
							name="email"
							type="email"
							autoComplete="email"
							autoFocus
							value={email}
							onChange={(e) => {
								setEmail(e.target.value);
								if (emailError) setEmailError(null);
							}}
							error={Boolean(emailError)}
							helperText={emailError}
							sx={{ mb: 2 }}
						/>

						<TextField
							required
							fullWidth
							id="password"
							label="Contraseña"
							name="password"
							type="password"
							autoComplete="current-password"
							value={password}
							onChange={(e) => {
								setPassword(e.target.value);
								if (passwordError) setPasswordError(null);
							}}
							error={Boolean(passwordError)}
							helperText={passwordError}
							sx={{ mb: 2 }}
						/>

						<Button
							type="submit"
							fullWidth
							variant="contained"
							size="large"
							disabled={loading}
							sx={{ py: 1.5 }}
						>
							{loading ? <CircularProgress size={24} color="inherit" /> : 'Iniciar sesión'}
						</Button>

						<Typography variant="body2" sx={{ mt: 2.5, textAlign: 'center' }}>
							<Link
								component="button"
								type="button"
								variant="body2"
								onClick={handleOpenForgotPassword}
								underline="hover"
								sx={{ cursor: 'pointer' }}
							>
								¿Olvidaste la contraseña?
							</Link>
						</Typography>

						<Typography variant="body2" sx={{ mt: 2.5, textAlign: 'center' }}>
							¿No tenés una cuenta?{' '}
							<Link component={RouterLink} to="/registro" underline="hover">
								Registrate acá
							</Link>
						</Typography>
					</Box>
				</Paper>
			</Container>

			{/* Modal de recuperación de contraseña */}
			<Dialog open={forgotPasswordOpen} onClose={handleCloseForgotPassword} fullWidth>
				<form onSubmit={handleSendForgotPassword}>
					<DialogTitle>Recuperar contraseña</DialogTitle>
					<DialogContent>
						<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
							Ingresá tu correo electrónico y te enviaremos las instrucciones para restablecer tu
							contraseña.
						</Typography>
						<TextField
							autoFocus
							required
							fullWidth
							label="Correo electrónico"
							type="email"
							value={forgotEmail}
							onChange={(e) => setForgotEmail(e.target.value)}
							sx={{ mt: 1 }}
						/>
						{forgotSubmitted && (
							<Alert severity="success" sx={{ mt: 2 }}>
								Si el correo existe en nuestro sistema, recibirás las instrucciones para restablecer tu
								contraseña a la brevedad.
							</Alert>
						)}
					</DialogContent>
					<DialogActions sx={{ px: 3, pb: 2 }}>
						<Button onClick={handleCloseForgotPassword} color="inherit">
							{forgotSubmitted ? 'Cerrar' : 'Cancelar'}
						</Button>
						{!forgotSubmitted && (
							<Button type="submit" variant="contained">
								Enviar instrucciones
							</Button>
						)}
					</DialogActions>
				</form>
			</Dialog>
		</Box>
	);
}
