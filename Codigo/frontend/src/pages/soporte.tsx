import * as React from 'react';

import BugReportIcon from '@mui/icons-material/BugReport';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import SendIcon from '@mui/icons-material/Send';
import {
	Box,
	Button,
	FormControl,
	FormHelperText,
	InputLabel,
	MenuItem,
	Paper,
	Select,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { PageContainer } from '@toolpad/core/PageContainer';

import { useAuth } from '../context/AuthContext';
import { notify } from '../utils/toast';

type SupportType = 'duda' | 'bug' | 'sugerencia';

const SUPPORT_EMAIL =
	(import.meta.env.VITE_SUPPORT_EMAIL as string | undefined)?.trim() || 'leandromurillo00@gmail.com';

const SUPPORT_TYPES: Record<
	SupportType,
	{
		label: string;
		subjectPrefix: string;
		icon: React.ReactElement;
		messageHint: string;
	}
> = {
	duda: {
		label: 'Hacer una consulta',
		subjectPrefix: 'Consulta de soporte',
		icon: <HelpOutlineIcon fontSize="small" />,
		messageHint: 'Contanos qué necesitás saber.',
	},
	bug: {
		label: 'Reportar un problema',
		subjectPrefix: 'Reporte de problema',
		icon: <BugReportIcon fontSize="small" />,
		messageHint: 'Explicá qué estabas haciendo, qué ocurrió y qué esperabas que pasara.',
	},
	sugerencia: {
		label: 'Proponer una mejora',
		subjectPrefix: 'Sugerencia para la plataforma',
		icon: <LightbulbOutlinedIcon fontSize="small" />,
		messageHint: 'Contanos qué te gustaría mejorar y cómo te ayudaría.',
	},
};

function isValidEmail(value: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function buildSupportBody({
	tipo,
	nombre,
	email,
	pantalla,
	mensaje,
	userId,
}: {
	tipo: SupportType;
	nombre: string;
	email: string;
	pantalla: string;
	mensaje: string;
	userId?: number;
}) {
	return [
		`Tipo: ${SUPPORT_TYPES[tipo].label}`,
		`Nombre: ${nombre || 'No informado'}`,
		`Correo de contacto: ${email}`,
		`Usuario ID: ${userId ?? 'No autenticado'}`,
		`Pantalla relacionada: ${pantalla || 'No informada'}`,
		'',
		'Mensaje:',
		mensaje,
		'',
		'Información técnica:',
		`URL actual: ${typeof window !== 'undefined' ? window.location.href : ''}`,
		`Fecha local: ${new Date().toLocaleString('es-AR')}`,
	].join('\n');
}

export default function SoportePage() {
	const { user } = useAuth();
	const [tipo, setTipo] = React.useState<SupportType>('duda');
	const [nombre, setNombre] = React.useState(() => (user ? `${user.nombre} ${user.apellido}`.trim() : ''));
	const [email, setEmail] = React.useState(() => user?.email ?? '');
	const [pantalla, setPantalla] = React.useState('');
	const [asunto, setAsunto] = React.useState('');
	const [mensaje, setMensaje] = React.useState('');
	const [submitted, setSubmitted] = React.useState(false);

	React.useEffect(() => {
		if (!user) return;
		setNombre((current) => current || `${user.nombre} ${user.apellido}`.trim());
		setEmail((current) => current || user.email);
	}, [user]);

	const trimmedEmail = email.trim();
	const trimmedSubject = asunto.trim();
	const trimmedMessage = mensaje.trim();
	const hasEmailError = !trimmedEmail || !isValidEmail(trimmedEmail);
	const hasSubjectError = trimmedSubject.length < 8 || trimmedSubject.length > 120;
	const hasMessageError = trimmedMessage.length < 20 || trimmedMessage.length > 2000;
	const emailError = submitted && hasEmailError;
	const subjectError = submitted && hasSubjectError;
	const messageError = submitted && hasMessageError;
	const selectedSupportType = SUPPORT_TYPES[tipo];

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setSubmitted(true);

		if (hasEmailError || hasSubjectError || hasMessageError) {
			notify.error('Revisá los campos marcados antes de enviar el mensaje.', { scope: 'soporte' });
			return;
		}

		const subject = `${SUPPORT_TYPES[tipo].subjectPrefix}: ${trimmedSubject}`;
		const body = buildSupportBody({
			tipo,
			nombre: nombre.trim(),
			email: trimmedEmail,
			pantalla: pantalla.trim(),
			mensaje: trimmedMessage,
			userId: user?.idUsuario,
		});

		window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
			subject,
		)}&body=${encodeURIComponent(body)}`;

		notify.info('Se abrió tu cliente de correo con el mensaje preparado.', { scope: 'soporte' });
	};

	return (
		<PageContainer title="Ayuda y soporte">
			<Stack spacing={3} sx={{ width: '100%', pb: 6 }}>
				<Paper
					elevation={0}
					sx={{
						p: 0,
						border: 0,
						borderRadius: 0,
						bgcolor: 'transparent',
					}}
				>
					<Stack spacing={2}>
						<Typography variant="body1" color="text.secondary">
							¿Necesitás ayuda? Enviá una consulta, informanos sobre un problema o compartí una idea para
							mejorar Mosaico Cultural.
						</Typography>
					</Stack>
				</Paper>

				<Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 2 }}>
					<Box component="form" onSubmit={handleSubmit} noValidate>
						<Stack spacing={2.5}>
							<FormControl fullWidth>
								<InputLabel id="support-type-label">Motivo</InputLabel>
								<Select
									labelId="support-type-label"
									value={tipo}
									label="Motivo"
									onChange={(event) => setTipo(event.target.value as SupportType)}
								>
									{Object.entries(SUPPORT_TYPES).map(([value, option]) => (
										<MenuItem key={value} value={value}>
											<Stack direction="row" spacing={1} alignItems="center">
												{option.icon}
												<span>{option.label}</span>
											</Stack>
										</MenuItem>
									))}
								</Select>
								<FormHelperText>Elegí qué tipo de mensaje querés enviar.</FormHelperText>
							</FormControl>

							<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
								<TextField
									fullWidth
									label="Nombre (opcional)"
									value={nombre}
									onChange={(event) => setNombre(event.target.value)}
									autoComplete="name"
								/>
								<TextField
									fullWidth
									required
									label="Correo de contacto"
									type="email"
									value={email}
									onChange={(event) => setEmail(event.target.value)}
									autoComplete="email"
									error={emailError}
									helperText={emailError ? 'Ingresá un correo electrónico válido.' : undefined}
								/>
							</Stack>

							<TextField
								fullWidth
								required
								label="Asunto"
								value={asunto}
								onChange={(event) => setAsunto(event.target.value)}
								error={subjectError}
								helperText={subjectError ? 'El asunto debe tener entre 8 y 120 caracteres.' : undefined}
							/>

							<TextField
								fullWidth
								label="Pantalla o sección relacionada (opcional)"
								placeholder="Ej. Mis actores, Convocatorias, Perfil"
								value={pantalla}
								onChange={(event) => setPantalla(event.target.value)}
							/>

							<TextField
								fullWidth
								required
								multiline
								minRows={7}
								label="Mensaje"
								placeholder={selectedSupportType.messageHint}
								value={mensaje}
								onChange={(event) => setMensaje(event.target.value)}
								error={messageError}
								helperText={
									messageError
										? 'El mensaje debe tener entre 20 y 2000 caracteres.'
										: `${trimmedMessage.length}/2000 caracteres`
								}
							/>

							<Box
								sx={{
									display: 'flex',
									flexDirection: { xs: 'column', sm: 'row' },
									alignItems: { xs: 'stretch', sm: 'center' },
									justifyContent: 'space-between',
									gap: 2,
								}}
							>
								<Typography variant="body2" color="text.secondary">
									Se abrirá tu aplicación de correo para que revises y envíes el mensaje.
								</Typography>
								<Button type="submit" variant="contained" size="large" startIcon={<SendIcon />}>
									Continuar en mi correo
								</Button>
							</Box>
						</Stack>
					</Box>
				</Paper>
			</Stack>
		</PageContainer>
	);
}
