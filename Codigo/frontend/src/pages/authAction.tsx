import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { applyActionCode, confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import LockResetIcon from '@mui/icons-material/LockReset';
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Container,
	IconButton,
	InputAdornment,
	Paper,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import { firebaseAuth } from '../config/firebase';
import { getFirebaseErrorMessage } from '../utils/firebaseError';
import { notify } from '../utils/toast';

export default function AuthActionPage() {
	const { mode: colorMode, systemMode } = useColorScheme();
	const isDarkMode = colorMode === 'system' ? systemMode === 'dark' : colorMode === 'dark';
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	const mode = searchParams.get('mode');
	const oobCode = searchParams.get('oobCode');

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	// Estado para resetPassword
	const [accountEmail, setAccountEmail] = useState<string | null>(null);
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [savingPassword, setSavingPassword] = useState(false);

	useEffect(() => {
		if (!oobCode) {
			setError('El enlace de verificación o recuperación es inválido o no contiene un código de acción.');
			setLoading(false);
			return;
		}

		if (mode === 'verifyEmail') {
			handleVerifyEmail(oobCode);
		} else if (mode === 'resetPassword') {
			handleVerifyResetCode(oobCode);
		} else {
			setError('La acción solicitada no es compatible.');
			setLoading(false);
		}
	}, [mode, oobCode]);

	const handleVerifyEmail = async (code: string) => {
		setLoading(true);
		try {
			await applyActionCode(firebaseAuth, code);
			if (firebaseAuth.currentUser) {
				await firebaseAuth.currentUser.reload();
			}
			setSuccessMessage('¡Tu dirección de correo electrónico ha sido verificada correctamente!');
			notify.success('Correo electrónico verificado con éxito.', { scope: 'auth-action' });
		} catch (err) {
			await firebaseAuth.authStateReady();
			if (firebaseAuth.currentUser) {
				await firebaseAuth.currentUser.reload();
				if (firebaseAuth.currentUser.emailVerified) {
					setSuccessMessage('¡Tu dirección de correo electrónico ha sido verificada correctamente!');
					return;
				}
			}
			console.error('Error al verificar correo:', err);
			setError(
				getFirebaseErrorMessage(
					err,
					'El enlace de verificación es inválido, ha expirado o ya fue utilizado anteriormente.',
				),
			);
		} finally {
			setLoading(false);
		}
	};

	const handleVerifyResetCode = async (code: string) => {
		setLoading(true);
		try {
			const email = await verifyPasswordResetCode(firebaseAuth, code);
			setAccountEmail(email);
		} catch (err) {
			console.error('Error al verificar código de restablecimiento:', err);
			setError(
				getFirebaseErrorMessage(
					err,
					'El enlace para restablecer la contraseña es inválido, ha expirado o ya fue utilizado.',
				),
			);
		} finally {
			setLoading(false);
		}
	};

	const handleSaveNewPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!oobCode) return;

		if (newPassword.length < 6 || !/^(?=.*[a-zA-Z])(?=.*\d)/.test(newPassword)) {
			notify.error('La nueva contraseña debe tener al menos 6 caracteres, letras y números.', {
				scope: 'auth-action',
			});
			return;
		}

		if (newPassword !== confirmPassword) {
			notify.error('Las contraseñas no coinciden.', { scope: 'auth-action' });
			return;
		}

		setSavingPassword(true);
		try {
			await confirmPasswordReset(firebaseAuth, oobCode, newPassword);
			setSuccessMessage('¡Tu contraseña ha sido restablecida exitosamente!');
			notify.success('Contraseña restablecida correctamente.', { scope: 'auth-action' });
		} catch (err) {
			console.error('Error al guardar nueva contraseña:', err);
			setError(
				getFirebaseErrorMessage(
					err,
					'No se pudo restablecer la contraseña. Intentá solicitar un nuevo enlace.',
				),
			);
		} finally {
			setSavingPassword(false);
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
				p: 2,
				backgroundColor: isDarkMode ? '#0b0b0b' : '#f4f6f8',
			}}
		>
			<Container maxWidth={false} disableGutters sx={{ width: '100%', maxWidth: 520 }}>
				<Paper
					elevation={0}
					sx={{
						p: { xs: 3, sm: 4 },
						border: '1px solid',
						borderColor: isDarkMode ? '#333333' : '#eaeaea',
						borderRadius: 2,
						backgroundColor: isDarkMode ? '#121212' : '#fdfdfc',
						textAlign: 'center',
					}}
				>
					{loading && (
						<Stack alignItems="center" spacing={2} sx={{ py: 4 }}>
							<CircularProgress size={48} />
							<Typography variant="body1" color="text.secondary">
								Procesando tu solicitud...
							</Typography>
						</Stack>
					)}

					{!loading && error && (
						<Stack alignItems="center" spacing={2} sx={{ py: 2 }}>
							<ErrorOutlineIcon color="error" sx={{ fontSize: 64 }} />
							<Typography variant="h5" fontWeight="bold" color="error">
								No se pudo completar la acción
							</Typography>
							<Alert severity="error" sx={{ width: '100%', textAlign: 'left' }}>
								{error}
							</Alert>
							<Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
								<Button variant="contained" onClick={() => navigate('/login')}>
									Ir al Inicio de Sesión
								</Button>
								<Button variant="outlined" onClick={() => navigate('/registro')}>
									Ir a Registro
								</Button>
							</Box>
						</Stack>
					)}

					{!loading && !error && successMessage && (
						<Stack alignItems="center" spacing={2} sx={{ py: 2 }}>
							<CheckCircleOutlineIcon color="success" sx={{ fontSize: 72 }} />
							<Typography variant="h5" fontWeight="bold" color="success.main">
								¡Operación Exitosa!
							</Typography>
							<Typography variant="body1" color="text.secondary">
								{successMessage}
							</Typography>
							<Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
								<Button variant="contained" onClick={() => navigate('/registro')} size="large">
									Continuar Registro
								</Button>
							</Box>
						</Stack>
					)}

					{!loading && !error && !successMessage && mode === 'resetPassword' && accountEmail && (
						<Box component="form" onSubmit={handleSaveNewPassword} noValidate sx={{ textAlign: 'left' }}>
							<Stack alignItems="center" spacing={1} sx={{ mb: 3, textAlign: 'center' }}>
								<LockResetIcon color="primary" sx={{ fontSize: 48 }} />
								<Typography variant="h5" fontWeight="bold">
									Restablecer contraseña
								</Typography>
								<Typography variant="body2" color="text.secondary">
									Ingresá la nueva contraseña para <strong>{accountEmail}</strong>
								</Typography>
							</Stack>

							<Stack spacing={2.5}>
								<TextField
									fullWidth
									required
									label="Nueva contraseña"
									type={showNewPassword ? 'text' : 'password'}
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									placeholder="Mínimo 6 caracteres con letras y números"
									InputProps={{
										endAdornment: (
											<InputAdornment position="end">
												<IconButton
													size="small"
													onClick={() => setShowNewPassword(!showNewPassword)}
													edge="end"
												>
													{showNewPassword ? <VisibilityOff /> : <Visibility />}
												</IconButton>
											</InputAdornment>
										),
									}}
								/>

								<TextField
									fullWidth
									required
									label="Confirmar nueva contraseña"
									type={showNewPassword ? 'text' : 'password'}
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									placeholder="Reingresá tu nueva clave"
								/>

								<Button
									type="submit"
									fullWidth
									variant="contained"
									size="large"
									disabled={savingPassword}
									sx={{ py: 1.5, mt: 1 }}
								>
									{savingPassword ? (
										<CircularProgress size={24} color="inherit" />
									) : (
										'Guardar nueva contraseña'
									)}
								</Button>
							</Stack>
						</Box>
					)}
				</Paper>
			</Container>
		</Box>
	);
}
