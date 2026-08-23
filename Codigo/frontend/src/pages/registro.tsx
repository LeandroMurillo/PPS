import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
	createUserWithEmailAndPassword,
	onAuthStateChanged,
	reload,
	sendEmailVerification,
	signOut,
} from 'firebase/auth';

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import SendIcon from '@mui/icons-material/Send';
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Container,
	Divider,
	Link,
	Paper,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { useColorScheme } from '@mui/material/styles';

import { crearSesionFirebaseApi } from '../api/auth';
import { firebaseAuth } from '../config/firebase';
import { getFirebaseErrorMessage } from '../utils/firebaseError';
import { getGoogleRedirectResult, signInWithGoogle } from '../utils/googleAuth';
import { notify } from '../utils/toast';

const RESEND_COOLDOWN_SECONDS = 30;
const INITIAL_POLL_INTERVAL_MS = 2000;
const POLL_BACKOFF_FACTOR = 1.5;
const MAX_POLL_INTERVAL_MS = 15000;
const MAX_POLL_TOTAL_TIME_MS = 90000;

export default function RegistroPage() {
	const { mode, systemMode } = useColorScheme();
	const isDarkMode = mode === 'system' ? systemMode === 'dark' : mode === 'dark';
	const navigate = useNavigate();

	const [verificationPending, setVerificationPending] = useState(false);
	const [accessEmail, setAccessEmail] = useState('');
	const [accessPassword, setAccessPassword] = useState('');
	const [accessPasswordConfirmation, setAccessPasswordConfirmation] = useState('');

	const [loading, setLoading] = useState(false);
	const [checkingVerification, setCheckingVerification] = useState(false);
	const [resendingEmail, setResendingEmail] = useState(false);
	const [resendCooldown, setResendCooldown] = useState(0);
	const [pollCycleKey, setPollCycleKey] = useState(0);

	const handleGoogleAuthResult = async () => {
		try {
			const sessionRes = await crearSesionFirebaseApi();
			localStorage.setItem('mosaico_cultural_token', sessionRes.token);
			localStorage.setItem('mosaico_cultural_user_session', JSON.stringify(sessionRes.usuario));
			notify.success(`¡Bienvenido de nuevo, ${sessionRes.usuario.nombre}!`, { scope: 'login' });
			navigate('/');
		} catch (error) {
			const message = getFirebaseErrorMessage(error, '');
			if (
				(error instanceof Error && error.message.includes('completar el registro')) ||
				message.includes('completar el registro') ||
				message.includes('PROFILE_INCOMPLETE')
			) {
				navigate('/registro/datos');
			} else {
				notify.error(getFirebaseErrorMessage(error, 'No se pudo iniciar sesión con Google.'), {
					scope: 'registro-google',
				});
			}
		}
	};

	useEffect(() => {
		return onAuthStateChanged(firebaseAuth, async (currentUser) => {
			if (!currentUser) return;

			try {
				await reload(currentUser);
			} catch (err) {
				console.error('Error al recargar sesión en registro:', err);
			}

			if (currentUser.emailVerified) {
				navigate('/registro/datos');
			} else {
				setAccessEmail(currentUser.email ?? '');
				setVerificationPending(true);
			}
		});
	}, [navigate]);

	useEffect(() => {
		void getGoogleRedirectResult()
			.then((credential) => {
				if (credential?.user) {
					void handleGoogleAuthResult();
				}
			})
			.catch((error) => {
				notify.error(getFirebaseErrorMessage(error, 'No se pudo continuar con Google.'), {
					scope: 'registro-google',
				});
			});
	}, [navigate]);

	// Temporizador de enfriamiento para el botón de reenvío de correo
	useEffect(() => {
		if (resendCooldown <= 0) return;
		const timer = window.setInterval(() => {
			setResendCooldown((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
		return () => window.clearInterval(timer);
	}, [resendCooldown]);

	// Sondeo automático con retroceso exponencial para detectar verificación en segundo plano
	useEffect(() => {
		if (!verificationPending) return;

		let active = true;
		let timeoutId: number | undefined;
		let currentInterval = INITIAL_POLL_INTERVAL_MS;
		const startTime = Date.now();

		const poll = async () => {
			if (!active) return;

			const elapsed = Date.now() - startTime;
			if (elapsed >= MAX_POLL_TOTAL_TIME_MS) {
				return;
			}

			try {
				const currentUser = firebaseAuth.currentUser;
				if (currentUser) {
					await reload(currentUser);
					if (currentUser.emailVerified && active) {
						notify.success('¡Correo verificado con éxito!', { scope: 'registro' });
						navigate('/registro/datos');
						return;
					}
				}
			} catch (error) {
				console.error('Error en sondeo automático de correo:', error);
			}

			if (!active) return;

			timeoutId = window.setTimeout(poll, currentInterval);
			currentInterval = Math.min(currentInterval * POLL_BACKOFF_FACTOR, MAX_POLL_INTERVAL_MS);
		};

		timeoutId = window.setTimeout(poll, currentInterval);

		return () => {
			active = false;
			if (timeoutId) {
				window.clearTimeout(timeoutId);
			}
		};
	}, [verificationPending, pollCycleKey, navigate]);

	const handleGoogleRegistration = async () => {
		setLoading(true);
		try {
			const credential = await signInWithGoogle();
			if (credential?.user) {
				await handleGoogleAuthResult();
			}
		} catch (error) {
			notify.error(getFirebaseErrorMessage(error, 'No se pudo continuar con Google.'), {
				scope: 'registro-google',
			});
		} finally {
			setLoading(false);
		}
	};

	const handleCreateEmailIdentity = async () => {
		const trimmedEmail = accessEmail.trim().toLowerCase();
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
			notify.error('Ingresá un correo electrónico válido.', { scope: 'registro-identidad' });
			return;
		}
		if (accessPassword.length < 6 || !/^(?=.*[a-zA-Z])(?=.*\d)/.test(accessPassword)) {
			notify.error('La contraseña debe tener al menos seis caracteres, incluyendo letras y números.', {
				scope: 'registro-identidad',
			});
			return;
		}
		if (accessPassword !== accessPasswordConfirmation) {
			notify.error('Las contraseñas no coinciden.', { scope: 'registro-identidad' });
			return;
		}

		setLoading(true);
		try {
			const credential = await createUserWithEmailAndPassword(firebaseAuth, trimmedEmail, accessPassword);
			await sendEmailVerification(credential.user, {
				url: `${window.location.origin}/registro/datos`,
			});
			setAccessEmail(trimmedEmail);
			setVerificationPending(true);
			setPollCycleKey((prev) => prev + 1);
			setResendCooldown(RESEND_COOLDOWN_SECONDS);
			notify.info(
				'Te enviamos un correo para verificar tu cuenta. Si no lo ves en tu bandeja de entrada, revisá la carpeta de Spam / Correo no deseado.',
				{ scope: 'registro-identidad', autoClose: 8000 },
			);
		} catch (error) {
			notify.error(getFirebaseErrorMessage(error, 'No se pudo crear la cuenta de acceso.'), {
				scope: 'registro-identidad',
			});
		} finally {
			setLoading(false);
		}
	};

	const handleCheckVerification = async () => {
		setCheckingVerification(true);
		try {
			const currentUser = firebaseAuth.currentUser;
			if (!currentUser) {
				throw new Error('No se encontró una sesión activa. Volvé a ingresar tu correo.');
			}
			await reload(currentUser);
			if (currentUser.emailVerified) {
				notify.success('¡Correo electrónico verificado con éxito!', { scope: 'registro' });
				navigate('/registro/datos');
				return;
			}
			notify.info(
				'El correo todavía no figura como verificado. Si ya hiciste clic en el enlace, aguardá unos segundos o revisá tu carpeta de Spam.',
				{ scope: 'registro-identidad' },
			);
		} catch (error) {
			notify.error(getFirebaseErrorMessage(error, 'No se pudo comprobar la verificación.'), {
				scope: 'registro-identidad',
			});
		} finally {
			setCheckingVerification(false);
		}
	};

	const handleResendVerificationEmail = async () => {
		if (resendCooldown > 0 || resendingEmail) return;

		setResendingEmail(true);
		try {
			const currentUser = firebaseAuth.currentUser;
			if (!currentUser) {
				throw new Error('No se encontró una sesión activa. Volvé a ingresar tu correo.');
			}
			await sendEmailVerification(currentUser, {
				url: `${window.location.origin}/registro/datos`,
			});
			setResendCooldown(RESEND_COOLDOWN_SECONDS);
			setPollCycleKey((prev) => prev + 1);
			notify.success(
				'Te enviamos un nuevo enlace de verificación. Recordá revisar la bandeja principal y la carpeta de Spam o correo no deseado.',
				{ scope: 'registro-identidad', autoClose: 8000 },
			);
		} catch (error) {
			notify.error(getFirebaseErrorMessage(error, 'No se pudo reenviar el correo de verificación.'), {
				scope: 'registro-identidad',
			});
		} finally {
			setResendingEmail(false);
		}
	};

	const handleUseAnotherEmail = async () => {
		await signOut(firebaseAuth);
		setVerificationPending(false);
		setAccessPassword('');
		setAccessPasswordConfirmation('');
	};

	return (
		<Box
			sx={{
				minHeight: { xs: 'calc(100dvh - 56px)', sm: 'calc(100dvh - 64px)' },
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				flex: '1 0 auto',
				width: '100%',
				pt: { xs: 2, sm: 3 },
				pb: { xs: 'calc(32px + env(safe-area-inset-bottom, 16px))', sm: 3 },
				px: 2,
				boxSizing: 'border-box',
				backgroundColor: isDarkMode ? '#0b0b0b' : '#f4f6f8',
			}}
		>
			<Container maxWidth={false} disableGutters sx={{ width: '100%', maxWidth: 540 }}>
				<Paper
					elevation={0}
					sx={{
						p: { xs: 2.5, sm: 4 },
						border: '1px solid',
						borderColor: isDarkMode ? '#333333' : '#eaeaea',
						borderRadius: 2,
						backgroundColor: isDarkMode ? '#121212' : '#fdfdfc',
					}}
				>
					{!verificationPending ? (
						<>
							<Box sx={{ mb: 3, textAlign: 'center' }}>
								<Typography variant="h5" component="h1" fontWeight="bold" color="primary" gutterBottom>
									Crear Cuenta
								</Typography>
								<Typography variant="body2" color="text.secondary">
									Registrate para publicar y gestionar tu perfil cultural en Tucumán
								</Typography>
							</Box>

							<Button
								fullWidth
								variant="outlined"
								size="large"
								onClick={handleGoogleRegistration}
								disabled={loading}
								sx={{ py: 1.5, mb: 2 }}
							>
								Continuar con Google
							</Button>

							<Divider sx={{ mb: 2.5 }}>o registrate con tu correo</Divider>

							<Box
								component="form"
								noValidate
								onSubmit={(e) => {
									e.preventDefault();
									void handleCreateEmailIdentity();
								}}
							>
								<TextField
									fullWidth
									type="email"
									label="Correo electrónico"
									value={accessEmail}
									onChange={(event) => setAccessEmail(event.target.value)}
									disabled={loading}
									sx={{ mb: 2 }}
								/>

								<TextField
									fullWidth
									type="password"
									label="Contraseña"
									value={accessPassword}
									onChange={(event) => setAccessPassword(event.target.value)}
									disabled={loading}
									helperText="Mínimo seis caracteres, con letras y números"
									sx={{ mb: 2 }}
								/>

								<TextField
									fullWidth
									type="password"
									label="Confirmar contraseña"
									value={accessPasswordConfirmation}
									onChange={(event) => setAccessPasswordConfirmation(event.target.value)}
									disabled={loading}
									sx={{ mb: 2.5 }}
								/>

								<Button
									fullWidth
									variant="contained"
									size="large"
									type="submit"
									disabled={loading}
									sx={{ py: 1.3 }}
								>
									{loading ? <CircularProgress size={24} color="inherit" /> : 'Crear cuenta'}
								</Button>
							</Box>

							<Box sx={{ mt: 3, textAlign: 'center' }}>
								<Typography variant="body2" color="text.secondary">
									¿Ya tenés una cuenta?{' '}
									<Link component={RouterLink} to="/login" underline="hover" fontWeight="bold">
										Iniciar sesión
									</Link>
								</Typography>
							</Box>
						</>
					) : (
						<Box sx={{ textAlign: 'center' }}>
							<MarkEmailReadIcon color="primary" sx={{ fontSize: 64, mb: 1.5 }} />

							<Typography variant="h5" fontWeight="bold" gutterBottom>
								¡Revisá tu correo para continuar!
							</Typography>

							<Typography variant="body1" color="text.secondary" sx={{ mb: 2.5 }}>
								Enviamos un correo de verificación a <strong>{accessEmail}</strong>.
							</Typography>

							<Paper
								variant="outlined"
								sx={{
									p: 2.5,
									mb: 2.5,
									borderRadius: 2,
									textAlign: 'left',
									borderColor: (theme) =>
										theme.palette.mode === 'dark' ? 'primary.dark' : 'primary.light',
									backgroundColor: (theme) =>
										theme.palette.mode === 'dark'
											? 'rgba(25, 118, 210, 0.08)'
											: 'rgba(25, 118, 210, 0.04)',
								}}
							>
								<Typography
									variant="subtitle2"
									fontWeight="bold"
									sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
								>
									<CheckCircleOutlineIcon color="primary" fontSize="small" /> Pasos a seguir:
								</Typography>
								<Typography variant="body2" paragraph sx={{ mb: 1 }}>
									1. Abrí el correo que te enviamos y hacé clic en el enlace de verificación.
								</Typography>
								<Typography variant="body2" paragraph sx={{ mb: 1.5 }}>
									2. Al hacer clic en el enlace, ingresarás automáticamente a la pantalla para{' '}
									<strong>completar tus datos personales</strong>.
								</Typography>
								<Alert
									severity="success"
									sx={{ py: 0.5, px: 1.5, '& .MuiAlert-message': { fontSize: '0.85rem' } }}
								>
									<strong>💡 Podés cerrar esta pestaña tranquilamente.</strong> El enlace del correo
									te llevará directo al formulario de datos.
								</Alert>
							</Paper>

							<Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
								<Typography variant="body2" component="span">
									<strong>¿No encontrás el correo?</strong> El mensaje de verificación{' '}
									<strong>puede llegar a la carpeta de correo no deseado (Spam)</strong>. Por favor,
									revisá esa carpeta y marcá el remitente como seguro.
								</Typography>
							</Alert>

							<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center">
								<Button
									variant="contained"
									onClick={handleCheckVerification}
									disabled={checkingVerification || loading}
									size="large"
								>
									{checkingVerification ? (
										<CircularProgress size={20} color="inherit" />
									) : (
										'Ya verifiqué mi correo'
									)}
								</Button>

								<Button
									variant="outlined"
									startIcon={<SendIcon />}
									onClick={handleResendVerificationEmail}
									disabled={resendingEmail || resendCooldown > 0}
									size="large"
								>
									{resendingEmail ? (
										<CircularProgress size={20} color="inherit" />
									) : resendCooldown > 0 ? (
										`Reenviar correo (${resendCooldown}s)`
									) : (
										'Reenviar correo'
									)}
								</Button>

								<Button
									variant="text"
									color="inherit"
									onClick={handleUseAnotherEmail}
									disabled={loading || resendingEmail || checkingVerification}
									size="large"
								>
									Usar otro correo
								</Button>
							</Stack>
						</Box>
					)}
				</Paper>
			</Container>
		</Box>
	);
}
