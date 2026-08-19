import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	createUserWithEmailAndPassword,
	onAuthStateChanged,
	reload,
	sendEmailVerification,
	signInWithPopup,
	signOut,
	updateProfile,
} from 'firebase/auth';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BadgeIcon from '@mui/icons-material/Badge';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SendIcon from '@mui/icons-material/Send';
import {
	Alert,
	Autocomplete,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	CircularProgress,
	Container,
	Divider,
	FormControl,
	FormHelperText,
	Grid,
	InputLabel,
	MenuItem,
	Paper,
	Select,
	Step,
	StepLabel,
	Stepper,
	TextField,
	Typography,
} from '@mui/material';
import { useColorScheme } from '@mui/material/styles';

import DatePickerSpanish from '../components/datePickerSpanish';
import GENEROS, { getGeneroEtiqueta, type GeneroCodigo } from '../constants/generos';
import {
	obtenerActividadesArcaApi,
	registrarUsuarioApi,
	type ActividadArca,
	type RegistrarUsuarioPayload,
} from '../api/auth';
import { firebaseAuth, googleAuthProvider } from '../config/firebase';
import { fileToBase64, validateImageFile } from '../utils/file';
import { getFirebaseErrorMessage } from '../utils/firebaseError';
import { notify } from '../utils/toast';

function validarCUIL(cuil: string): boolean {
	const cleaned = cuil.trim().replace(/\D/g, '');
	if (cleaned.length !== 11) return false;

	const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
	let sum = 0;
	for (let i = 0; i < 10; i++) {
		sum += Number(cleaned[i]) * multipliers[i]!;
	}

	const mod = sum % 11;
	let expectedDigit = 11 - mod;
	if (expectedDigit === 11) expectedDigit = 0;
	if (expectedDigit === 10) expectedDigit = 9;

	return Number(cleaned[10]) === expectedDigit;
}

const STEPS = ['Datos personales y Documento', 'Confirmación de información', 'Registro completado'];

export default function RegistroPage() {
	const { mode, systemMode } = useColorScheme();
	const isDarkMode = mode === 'system' ? systemMode === 'dark' : mode === 'dark';
	const navigate = useNavigate();
	const [activeStep, setActiveStep] = useState(0);
	const [authReady, setAuthReady] = useState(false);
	const [verificationPending, setVerificationPending] = useState(false);
	const [accessEmail, setAccessEmail] = useState('');
	const [accessPassword, setAccessPassword] = useState('');
	const [accessPasswordConfirmation, setAccessPasswordConfirmation] = useState('');

	const [actividadesArca, setActividadesArca] = useState<ActividadArca[]>([]);

	useEffect(() => {
		obtenerActividadesArcaApi()
			.then((list) => setActividadesArca(list))
			.catch(() => setActividadesArca([]));
	}, []);

	useEffect(() => {
		return onAuthStateChanged(firebaseAuth, (currentUser) => {
			if (!currentUser) return;

			void reload(currentUser).then(() => {
				if (currentUser.emailVerified) {
					prepareVerifiedIdentity();
				} else {
					setAccessEmail(currentUser.email ?? '');
					setVerificationPending(true);
				}
			});
		});
	}, []);

	// Form state
	const [formData, setFormData] = useState({
		nombre: '',
		apellido: '',
		email: '',
		CUIL: '',
		fechaNacimiento: '',
		genero: '' as GeneroCodigo | '',
		nacionalidad: 'Argentina',
		actividadesArcaCodigo: '',
		documentoIdentidad: '',
	});

	const [documentoFileName, setDocumentoFileName] = useState('');
	const [formErrors, setFormErrors] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState(false);
	const [registroExitoso, setRegistroExitoso] = useState<string | null>(null);

	const prepareVerifiedIdentity = () => {
		const currentUser = firebaseAuth.currentUser;
		if (!currentUser?.emailVerified || !currentUser.email) return;

		const displayNameParts = (currentUser.displayName ?? '').trim().split(/\s+/).filter(Boolean);
		setFormData((previous) => ({
			...previous,
			email: currentUser.email ?? previous.email,
			nombre: previous.nombre || displayNameParts[0] || '',
			apellido: previous.apellido || displayNameParts.slice(1).join(' '),
		}));
		setAccessEmail(currentUser.email);
		setVerificationPending(false);
		setAuthReady(true);
	};

	const handleGoogleRegistration = async () => {
		setLoading(true);
		try {
			await signInWithPopup(firebaseAuth, googleAuthProvider);
			prepareVerifiedIdentity();
		} catch (error) {
			notify.error(getFirebaseErrorMessage(error, 'No se pudo continuar con Google.'), {
				scope: 'registro-google',
			});
		} finally {
			setLoading(false);
		}
	};

	const handleCreateEmailIdentity = async () => {
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accessEmail.trim())) {
			notify.error('Ingresá un correo electrónico válido.', { scope: 'registro-identidad' });
			return;
		}
		if (accessPassword.length < 6 || !/^(?=.*[a-zA-Z])(?=.*\d)/.test(accessPassword)) {
			notify.error('La contraseña debe tener al menos seis caracteres, letras y números.', {
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
			const credential = await createUserWithEmailAndPassword(
				firebaseAuth,
				accessEmail.trim().toLowerCase(),
				accessPassword,
			);
			await sendEmailVerification(credential.user, { url: `${window.location.origin}/registro` });
			setVerificationPending(true);
			notify.success('Te enviamos un correo para verificar la dirección.', { scope: 'registro-identidad' });
		} catch (error) {
			notify.error(getFirebaseErrorMessage(error, 'No se pudo crear la cuenta de acceso.'), {
				scope: 'registro-identidad',
			});
		} finally {
			setLoading(false);
		}
	};

	const handleCheckVerification = async () => {
		setLoading(true);
		try {
			const currentUser = firebaseAuth.currentUser;
			if (!currentUser) throw new Error('Volvé a iniciar el registro con tu correo.');
			await reload(currentUser);
			if (!currentUser.emailVerified) {
				throw new Error('El correo todavía no fue verificado. Abrí el enlace que te enviamos.');
			}
			prepareVerifiedIdentity();
		} catch (error) {
			notify.error(getFirebaseErrorMessage(error, 'No se pudo comprobar la verificación.'), {
				scope: 'registro-identidad',
			});
		} finally {
			setLoading(false);
		}
	};

	const handleChange =
		(field: keyof typeof formData) =>
		(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: unknown } }) => {
			setFormData((prev) => ({
				...prev,
				[field]: e.target.value as string,
			}));

			if (formErrors[field]) {
				setFormErrors((prev) => {
					const updated = { ...prev };
					delete updated[field];
					return updated;
				});
			}
		};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith('image/')) {
			setFormErrors((prev) => ({
				...prev,
				documentoIdentidad: 'El archivo adjunto debe ser una imagen (JPG, PNG, WEBP, etc.)',
			}));
			return;
		}

		const sizeValidation = validateImageFile(file, 5);
		if (!sizeValidation.valid) {
			setFormErrors((prev) => ({
				...prev,
				documentoIdentidad: sizeValidation.error ?? 'La imagen no debe superar los 5 MB',
			}));
			return;
		}

		setDocumentoFileName(file.name);

		try {
			const base64 = await fileToBase64(file);
			setFormData((prev) => ({
				...prev,
				documentoIdentidad: base64,
			}));
			setFormErrors((prev) => {
				const updated = { ...prev };
				delete updated.documentoIdentidad;
				return updated;
			});
		} catch {
			setFormErrors((prev) => ({
				...prev,
				documentoIdentidad: 'Error al procesar la imagen seleccionada.',
			}));
		}
	};

	const validateStep1 = (): boolean => {
		const errors: Record<string, string> = {};

		if (!formData.nombre.trim()) {
			errors.nombre = 'El nombre es obligatorio';
		} else if (formData.nombre.trim().length > 45) {
			errors.nombre = 'Máximo 45 caracteres';
		} else if (/\d/.test(formData.nombre)) {
			errors.nombre = 'El nombre no puede contener números';
		}

		if (!formData.apellido.trim()) {
			errors.apellido = 'El apellido es obligatorio';
		} else if (formData.apellido.trim().length > 45) {
			errors.apellido = 'Máximo 45 caracteres';
		} else if (/\d/.test(formData.apellido)) {
			errors.apellido = 'El apellido no puede contener números';
		}

		if (!formData.email.trim()) {
			errors.email = 'El correo electrónico es obligatorio';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
			errors.email = 'Ingrese un correo electrónico válido';
		} else if (formData.email.trim().length > 99) {
			errors.email = 'Máximo 99 caracteres';
		}

		if (!formData.CUIL.trim()) {
			errors.CUIL = 'El CUIL es obligatorio';
		} else if (!/^\d{11}$/.test(formData.CUIL.trim())) {
			errors.CUIL = 'Debe contener exactamente 11 dígitos numéricos sin guiones';
		} else if (!validarCUIL(formData.CUIL.trim())) {
			errors.CUIL = 'El CUIL ingresado no es válido (dígito verificador incorrecto)';
		}

		if (!formData.genero) {
			errors.genero = 'Seleccioná tu identidad de género';
		}

		if (!formData.fechaNacimiento) {
			errors.fechaNacimiento = 'La fecha de nacimiento es obligatoria';
		} else {
			const birthDate = new Date(formData.fechaNacimiento);
			if (isNaN(birthDate.getTime()) || birthDate >= new Date() || birthDate.getFullYear() < 1900) {
				errors.fechaNacimiento = 'Ingrese una fecha de nacimiento válida (entre 1900 y la fecha actual)';
			}
		}

		if (!formData.nacionalidad.trim()) {
			errors.nacionalidad = 'La nacionalidad es obligatoria';
		} else if (formData.nacionalidad.trim().length > 45) {
			errors.nacionalidad = 'Máximo 45 caracteres';
		} else if (/\d/.test(formData.nacionalidad)) {
			errors.nacionalidad = 'La nacionalidad no puede contener números';
		}

		if (formData.actividadesArcaCodigo.trim() && !/^\d{6}$/.test(formData.actividadesArcaCodigo.trim())) {
			errors.actividadesArcaCodigo = 'El código ARCA debe contener 6 dígitos numéricos';
		}

		if (!formData.documentoIdentidad) {
			errors.documentoIdentidad = 'Debe enviar una imagen de su documento de identidad';
		}

		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleNext = () => {
		if (activeStep === 0) {
			if (validateStep1()) {
				setActiveStep(1);
			}
		}
	};

	const handleBack = () => {
		setActiveStep((prev) => prev - 1);
	};

	const handleConfirmAndSubmit = async () => {
		setLoading(true);

		const payload: RegistrarUsuarioPayload = {
			nombre: formData.nombre.trim(),
			apellido: formData.apellido.trim(),
			CUIL: formData.CUIL.trim(),
			fechaNacimiento: formData.fechaNacimiento,
			genero: formData.genero as GeneroCodigo,
			nacionalidad: formData.nacionalidad.trim(),
			actividadesArcaCodigo: formData.actividadesArcaCodigo.trim() || null,
			documentoIdentidad: formData.documentoIdentidad,
		};

		try {
			const currentUser = firebaseAuth.currentUser;
			if (!currentUser?.emailVerified) {
				throw new Error('La identidad de Firebase no está verificada. Volvé a comenzar el registro.');
			}
			await updateProfile(currentUser, {
				displayName: `${payload.nombre} ${payload.apellido}`.trim(),
			});
			const res = await registrarUsuarioApi(payload);
			await signOut(firebaseAuth);
			setRegistroExitoso(res.mensaje);
			notify.success('¡Cuenta registrada exitosamente!', { scope: 'registro' });
			setActiveStep(2);
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Ocurrió un error inesperado al registrar la cuenta.';
			notify.error(msg, { scope: 'registro' });
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
				flex: '1 0 auto',
				width: '100%',
				pt: { xs: 2, sm: 3 },
				pb: { xs: 'calc(32px + env(safe-area-inset-bottom, 16px))', sm: 3 },
				px: 2,
				boxSizing: 'border-box',
				backgroundColor: isDarkMode ? '#0b0b0b' : '#f4f6f8',
			}}
		>
			<Container maxWidth={false} disableGutters sx={{ width: '100%', maxWidth: 760 }}>
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
							Registro de Usuario
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Creá tu cuenta para gestionar tu perfil en el Mapa Cultural de Tucumán
						</Typography>
					</Box>

					{!authReady && (
						<Box sx={{ maxWidth: 520, mx: 'auto' }}>
							<Alert severity="info" sx={{ mb: 2 }}>
								Primero verificá tu identidad con Google o con un correo electrónico. Después podrás
								completar los datos del registro cultural.
							</Alert>

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

							<Divider sx={{ mb: 2 }}>o creá una cuenta con correo</Divider>

							<TextField
								fullWidth
								type="email"
								label="Correo electrónico"
								value={accessEmail}
								onChange={(event) => setAccessEmail(event.target.value)}
								disabled={verificationPending || loading}
								sx={{ mb: 2 }}
							/>

							{!verificationPending && (
								<>
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
										sx={{ mb: 2 }}
									/>
									<Button
										fullWidth
										variant="contained"
										size="large"
										onClick={handleCreateEmailIdentity}
										disabled={loading}
									>
										{loading ? <CircularProgress size={24} color="inherit" /> : 'Crear cuenta'}
									</Button>
								</>
							)}

							{verificationPending && (
								<Alert severity="warning" sx={{ mt: 2 }}>
									Revisá el correo enviado a <strong>{accessEmail}</strong>. Después de abrir el
									enlace, volvé a esta pantalla.
									<Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
										<Button
											variant="contained"
											onClick={handleCheckVerification}
											disabled={loading}
										>
											Ya verifiqué mi correo
										</Button>
										<Button
											variant="text"
											onClick={() => {
												void signOut(firebaseAuth);
												setVerificationPending(false);
												setAccessPassword('');
												setAccessPasswordConfirmation('');
											}}
										>
											Usar otro correo
										</Button>
									</Box>
								</Alert>
							)}
						</Box>
					)}

					{authReady && (
						<>
							<Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 2.5 }}>
								{STEPS.map((label) => (
									<Step key={label}>
										<StepLabel>{label}</StepLabel>
									</Step>
								))}
							</Stepper>

							{/* PASO 1: Formulario de Datos Personales */}
							{activeStep === 0 && (
								<Box component="form" noValidate>
									<Typography
										variant="h6"
										sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}
									>
										<BadgeIcon color="primary" /> Datos personales y de acceso
									</Typography>

									<Grid container spacing={2}>
										<Grid size={{ xs: 12, sm: 6 }}>
											<TextField
												required
												fullWidth
												label="Nombre"
												value={formData.nombre}
												onChange={handleChange('nombre')}
												error={!!formErrors.nombre}
												helperText={formErrors.nombre}
											/>
										</Grid>
										<Grid size={{ xs: 12, sm: 6 }}>
											<TextField
												required
												fullWidth
												label="Apellido"
												value={formData.apellido}
												onChange={handleChange('apellido')}
												error={!!formErrors.apellido}
												helperText={formErrors.apellido}
											/>
										</Grid>

										<Grid size={{ xs: 12, sm: 6 }}>
											<TextField
												required
												fullWidth
												type="email"
												label="Correo electrónico"
												value={formData.email}
												disabled
												error={!!formErrors.email}
												helperText={
													formErrors.email || 'Será tu identificador único de usuario'
												}
											/>
										</Grid>

										<Grid size={{ xs: 12, sm: 6 }}>
											<TextField
												required
												fullWidth
												label="CUIL (11 dígitos)"
												value={formData.CUIL}
												onChange={handleChange('CUIL')}
												error={!!formErrors.CUIL}
												helperText={formErrors.CUIL || 'Ejemplo: 20384445558 (sin guiones)'}
												slotProps={{ htmlInput: { maxLength: 11 } }}
											/>
										</Grid>

										<Grid size={{ xs: 12, sm: 4 }}>
											<DatePickerSpanish
												required
												label="Fecha de Nacimiento"
												value={formData.fechaNacimiento}
												onChange={(dateStr) => {
													setFormData((prev) => ({ ...prev, fechaNacimiento: dateStr }));
													if (formErrors.fechaNacimiento) {
														setFormErrors((prev) => ({ ...prev, fechaNacimiento: '' }));
													}
												}}
												error={!!formErrors.fechaNacimiento}
												helperText={formErrors.fechaNacimiento}
											/>
										</Grid>

										<Grid size={{ xs: 12, sm: 4 }}>
											<FormControl fullWidth required error={!!formErrors.genero}>
												<InputLabel id="genero-label">Identidad de género</InputLabel>
												<Select
													labelId="genero-label"
													label="Identidad de género"
													value={formData.genero}
													onChange={handleChange('genero')}
												>
													<MenuItem value="" disabled>
														Elige
													</MenuItem>
													{GENEROS.map((item) => (
														<MenuItem key={item.code} value={item.code}>
															{item.label}
														</MenuItem>
													))}
												</Select>
												{formErrors.genero && (
													<FormHelperText>{formErrors.genero}</FormHelperText>
												)}
											</FormControl>
										</Grid>

										<Grid size={{ xs: 12, sm: 4 }}>
											<TextField
												required
												fullWidth
												label="Nacionalidad"
												value={formData.nacionalidad}
												onChange={handleChange('nacionalidad')}
												error={!!formErrors.nacionalidad}
												helperText={formErrors.nacionalidad}
											/>
										</Grid>

										<Grid size={{ xs: 12 }}>
											<Autocomplete
												options={actividadesArca}
												getOptionLabel={(option) => `${option.codigo} - ${option.descripcion}`}
												value={
													actividadesArca.find(
														(a) => a.codigo === formData.actividadesArcaCodigo,
													) || null
												}
												onChange={(_e, newValue) => {
													setFormData((prev) => ({
														...prev,
														actividadesArcaCodigo: newValue ? newValue.codigo : '',
													}));
													if (formErrors.actividadesArcaCodigo) {
														setFormErrors((prev) => {
															const updated = { ...prev };
															delete updated.actividadesArcaCodigo;
															return updated;
														});
													}
												}}
												renderInput={(params) => (
													<TextField
														{...params}
														label="Código de Actividad Rentas/ARCA (Opcional)"
														placeholder="Seleccioná tu actividad económica de la lista"
														error={!!formErrors.actividadesArcaCodigo}
														helperText={
															formErrors.actividadesArcaCodigo ||
															'Seleccioná tu código de actividad formal registrado en Rentas/ARCA'
														}
													/>
												)}
												noOptionsText="No se encontraron actividades"
											/>
										</Grid>

										{/* Documento de identidad */}
										<Grid size={{ xs: 12 }}>
											<Box
												sx={{
													p: 3,
													border: '2px dashed',
													borderColor: formErrors.documentoIdentidad
														? 'error.main'
														: 'primary.main',
													borderRadius: 2,
													bgcolor: 'action.hover',
													textAlign: 'center',
												}}
											>
												<Typography variant="subtitle1" fontWeight="bold" gutterBottom>
													Imagen del Documento de Identidad *
												</Typography>
												<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
													Adjuntá una foto legible de tu DNI / Documento para validar tu
													identidad.
												</Typography>

												<Button
													variant="contained"
													component="label"
													startIcon={<CloudUploadIcon />}
													sx={{ mb: 1 }}
												>
													Seleccionar Imagen
													<input
														type="file"
														hidden
														accept="image/*"
														onChange={handleFileChange}
													/>
												</Button>

												{documentoFileName && (
													<Typography
														variant="body2"
														color="success.main"
														sx={{ mt: 1, fontWeight: 'medium' }}
													>
														Archivo seleccionado: {documentoFileName}
													</Typography>
												)}

												{formData.documentoIdentidad && (
													<Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
														<Box
															component="img"
															src={formData.documentoIdentidad}
															alt="Vista previa del documento"
															sx={{
																maxHeight: 180,
																maxWidth: '100%',
																borderRadius: 1,
																boxShadow: 2,
															}}
														/>
													</Box>
												)}

												{formErrors.documentoIdentidad && (
													<Typography
														variant="caption"
														color="error"
														display="block"
														sx={{ mt: 1 }}
													>
														{formErrors.documentoIdentidad}
													</Typography>
												)}
											</Box>
										</Grid>
									</Grid>

									<Box
										sx={{
											mt: 4,
											display: 'flex',
											justifyContent: 'flex-end',
											pb: { xs: 'calc(16px + env(safe-area-inset-bottom, 8px))', sm: 0 },
										}}
									>
										<Button
											variant="contained"
											endIcon={<ArrowForwardIcon />}
											onClick={handleNext}
											size="large"
											sx={{ width: { xs: '100%', sm: 'auto' } }}
										>
											Siguiente (Confirmación)
										</Button>
									</Box>
								</Box>
							)}

							{/* PASO 2: Confirmación de datos antes del envío */}
							{activeStep === 1 && (
								<Box>
									<Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
										Confirmar datos antes de registrarse
									</Typography>

									<Alert severity="info" sx={{ mb: 3 }}>
										Por favor, revisá atentamente que todos tus datos sean correctos antes de
										confirmar tu registro.
									</Alert>

									<Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
										<CardContent>
											<Grid container spacing={2}>
												<Grid size={{ xs: 12, sm: 6 }}>
													<Typography variant="caption" color="text.secondary">
														Nombre Completo
													</Typography>
													<Typography variant="body1" fontWeight="bold">
														{formData.nombre} {formData.apellido}
													</Typography>
												</Grid>

												<Grid size={{ xs: 12, sm: 6 }}>
													<Typography variant="caption" color="text.secondary">
														Correo Electrónico
													</Typography>
													<Typography variant="body1" fontWeight="bold">
														{formData.email}
													</Typography>
												</Grid>

												<Grid size={{ xs: 12, sm: 6 }}>
													<Typography variant="caption" color="text.secondary">
														CUIL
													</Typography>
													<Typography variant="body1" fontWeight="bold">
														{formData.CUIL}
													</Typography>
												</Grid>

												<Grid size={{ xs: 12, sm: 6 }}>
													<Typography variant="caption" color="text.secondary">
														Fecha de Nacimiento
													</Typography>
													<Typography variant="body1" fontWeight="bold">
														{formData.fechaNacimiento}
													</Typography>
												</Grid>

												<Grid size={{ xs: 12, sm: 6 }}>
													<Typography variant="caption" color="text.secondary">
														Identidad de género
													</Typography>
													<Typography variant="body1" fontWeight="bold">
														{getGeneroEtiqueta(formData.genero)}
													</Typography>
												</Grid>

												<Grid size={{ xs: 12, sm: 6 }}>
													<Typography variant="caption" color="text.secondary">
														Nacionalidad
													</Typography>
													<Typography variant="body1" fontWeight="bold">
														{formData.nacionalidad}
													</Typography>
												</Grid>

												<Grid size={{ xs: 12, sm: 6 }}>
													<Typography variant="caption" color="text.secondary">
														Código Rentas / ARCA
													</Typography>
													<Typography variant="body1" fontWeight="bold">
														{(() => {
															const match = actividadesArca.find(
																(a) => a.codigo === formData.actividadesArcaCodigo,
															);
															return match
																? `${match.codigo} - ${match.descripcion}`
																: formData.actividadesArcaCodigo || 'No registrado';
														})()}
													</Typography>
												</Grid>

												<Grid size={{ xs: 12, sm: 6 }}>
													<Typography variant="caption" color="text.secondary">
														Documento de Identidad
													</Typography>
													<Box sx={{ mt: 0.5 }}>
														<Chip label="Imagen Adjunta" color="success" size="small" />
													</Box>
												</Grid>
											</Grid>

											<Divider sx={{ my: 2 }} />

											{formData.documentoIdentidad && (
												<Box sx={{ textAlign: 'center' }}>
													<Typography
														variant="caption"
														color="text.secondary"
														display="block"
														sx={{ mb: 1 }}
													>
														Vista Previa del Documento Adjunto:
													</Typography>
													<Box
														component="img"
														src={formData.documentoIdentidad}
														alt="Documento adjunto"
														sx={{ maxHeight: 150, maxWidth: '100%', borderRadius: 1 }}
													/>
												</Box>
											)}
										</CardContent>
									</Card>

									<Box
										sx={{
											display: 'flex',
											flexDirection: { xs: 'column-reverse', sm: 'row' },
											gap: 1.5,
											justifyContent: 'space-between',
											alignItems: 'stretch',
											pb: { xs: 'calc(16px + env(safe-area-inset-bottom, 8px))', sm: 0 },
										}}
									>
										<Button
											variant="outlined"
											startIcon={<ArrowBackIcon />}
											onClick={handleBack}
											disabled={loading}
											size="large"
										>
											Volver a Editar
										</Button>

										<Button
											variant="contained"
											color="primary"
											startIcon={
												loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />
											}
											onClick={handleConfirmAndSubmit}
											disabled={loading}
											size="large"
										>
											{loading ? 'Registrando...' : 'Confirmar y Registrarse'}
										</Button>
									</Box>
								</Box>
							)}

							{/* PASO 3: Registro completado */}
							{activeStep === 2 && (
								<Box sx={{ textAlign: 'center', py: 4 }}>
									<CheckCircleOutlineIcon color="success" sx={{ fontSize: 80, mb: 2 }} />

									<Typography variant="h5" fontWeight="bold" gutterBottom color="success.main">
										¡Registro Completado con Éxito!
									</Typography>

									<Typography
										variant="body1"
										color="text.secondary"
										paragraph
										sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}
									>
										{registroExitoso || 'Tu cuenta se encuentra activada. Ya podés iniciar sesión.'}
									</Typography>

									<Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
										<Button variant="contained" onClick={() => navigate('/login')} size="large">
											Iniciar Sesión
										</Button>
										<Button variant="outlined" onClick={() => navigate('/')} size="large">
											Ir al Mapa Principal
										</Button>
									</Box>
								</Box>
							)}
						</>
					)}
				</Paper>
			</Container>
		</Box>
	);
}
