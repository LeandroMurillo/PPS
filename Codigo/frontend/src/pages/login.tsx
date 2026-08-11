import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Container,
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
import { loginApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
	const { mode, systemMode } = useColorScheme();
	const isDarkMode = mode === 'system' ? systemMode === 'dark' : mode === 'dark';
	const navigate = useNavigate();
	const { login } = useAuth();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [customError, setCustomError] = useState<string | null>(null);

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

	const handleSendForgotPassword = (e: React.FormEvent) => {
		e.preventDefault();
		if (forgotEmail.trim()) {
			setForgotSubmitted(true);
		}
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setCustomError(null);

		if (!email.trim() || !password) {
			setCustomError('Por favor complete todos los campos.');
			return;
		}

		setLoading(true);
		try {
			const response = await loginApi({ email: email.trim(), contraseña: password });
			login(response.usuario, response.token);
			navigate('/');
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Error al iniciar sesión';
			setCustomError(msg);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box
			sx={{
				minHeight: 'calc(100vh - 64px)',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				py: { xs: 2, sm: 3 },
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

					{customError && (
						<Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setCustomError(null)}>
							{customError}
						</Alert>
					)}

					<Box component="form" onSubmit={handleSubmit} noValidate>
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
							onChange={(e) => setEmail(e.target.value)}
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
							onChange={(e) => setPassword(e.target.value)}
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
