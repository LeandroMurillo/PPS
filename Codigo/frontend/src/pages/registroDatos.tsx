import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, reload, signOut, updateProfile } from 'firebase/auth';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BadgeIcon from '@mui/icons-material/Badge';
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
import { firebaseAuth } from '../config/firebase';
import { fileToBase64, validateImageFile } from '../utils/file';
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

const STEPS = ['Datos personales y Documento', 'Confirmación de información'];

export default function RegistroDatosPage() {
	const { mode, systemMode } = useColorScheme();
	const isDarkMode = mode === 'system' ? systemMode === 'dark' : mode === 'dark';
	const navigate = useNavigate();

	const isCompletingRegistrationRef = useRef(false);
	const [authChecking, setAuthChecking] = useState(true);
	const [activeStep, setActiveStep] = useState(0);
	const [actividadesArca, setActividadesArca] = useState<ActividadArca[]>([]);
	const [loadingActividades, setLoadingActividades] = useState(false);
	const [errorActividades, setErrorActividades] = useState(false);

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

	const cargarActividades = async () => {
		setLoadingActividades(true);
		setErrorActividades(false);
		try {
			const list = await obtenerActividadesArcaApi();
			setActividadesArca(list);
		} catch (err) {
			console.error('Error al cargar actividades ARCA:', err);
			setErrorActividades(true);
		} finally {
			setLoadingActividades(false);
		}
	};

	useEffect(() => {
		void cargarActividades();
	}, []);

	useEffect(() => {
		return onAuthStateChanged(firebaseAuth, async (currentUser) => {
			if (isCompletingRegistrationRef.current) {
				return;
			}

			if (!currentUser) {
				notify.warning('Debés crear tu cuenta de acceso o iniciar sesión para continuar.', {
					scope: 'registro-datos',
				});
				navigate('/registro');
				return;
			}

			try {
				await reload(currentUser);
			} catch (err) {
				console.error('Error al recargar sesión:', err);
			}

			if (!currentUser.emailVerified) {
				notify.warning(
					'Tu correo electrónico aún no fue verificado. Por favor, abrí el enlace que te enviamos.',
					{ scope: 'registro-datos' },
				);
				navigate('/registro');
				return;
			}

			const displayNameParts = (currentUser.displayName ?? '').trim().split(/\s+/).filter(Boolean);
			setFormData((prev) => ({
				...prev,
				email: currentUser.email ?? '',
				nombre: prev.nombre || displayNameParts[0] || '',
				apellido: prev.apellido || displayNameParts.slice(1).join(' '),
			}));
			setAuthChecking(false);
		});
	}, [navigate]);

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
			if (!currentUser) {
				throw new Error('No se encontró una sesión activa de Firebase. Volvé a ingresar.');
			}
			await reload(currentUser);
			if (!currentUser.emailVerified) {
				throw new Error('La identidad de Firebase no está verificada. Abrí el enlace que te enviamos.');
			}
			await updateProfile(currentUser, {
				displayName: `${payload.nombre} ${payload.apellido}`.trim(),
			});
			await currentUser.getIdToken(true);
			isCompletingRegistrationRef.current = true;
			const res = await registrarUsuarioApi(payload);
			notify.success(res.mensaje || '¡Cuenta registrada exitosamente! Ya podés iniciar sesión.', {
				scope: 'registro',
			});
			await signOut(firebaseAuth);
			navigate('/login', { replace: true });
		} catch (err) {
			isCompletingRegistrationRef.current = false;
			const msg = err instanceof Error ? err.message : 'Ocurrió un error inesperado al registrar la cuenta.';
			notify.error(msg, { scope: 'registro' });
		} finally {
			setLoading(false);
		}
	};

	if (authChecking) {
		return (
			<Box
				sx={{
					minHeight: { xs: 'calc(100dvh - 56px)', sm: 'calc(100dvh - 64px)' },
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
					p: 3,
					backgroundColor: isDarkMode ? '#0b0b0b' : '#f4f6f8',
				}}
			>
				<CircularProgress size={48} sx={{ mb: 2 }} />
				<Typography variant="body1" color="text.secondary">
					Comprobando estado de la cuenta verificada...
				</Typography>
			</Box>
		);
	}

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
							Completar Datos de Registro
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Completá tus datos personales para gestionar tu perfil en el Mapa Cultural de Tucumán
						</Typography>
					</Box>

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
										helperText="Correo verificado de tu cuenta"
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
										{formErrors.genero && <FormHelperText>{formErrors.genero}</FormHelperText>}
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
										loading={loadingActividades}
										getOptionLabel={(option) => `${option.codigo} - ${option.descripcion}`}
										value={
											actividadesArca.find((a) => a.codigo === formData.actividadesArcaCodigo) ||
											null
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
												placeholder={
													loadingActividades
														? 'Cargando actividades...'
														: 'Seleccioná tu actividad económica de la lista'
												}
												error={!!formErrors.actividadesArcaCodigo}
												helperText={
													formErrors.actividadesArcaCodigo ||
													(errorActividades
														? 'No pudimos cargar la lista de actividades de ARCA. Podés continuar o reintentar.'
														: 'Seleccioná tu código de actividad formal registrado en Rentas/ARCA')
												}
											/>
										)}
										noOptionsText={
											errorActividades
												? 'Error al cargar actividades'
												: loadingActividades
													? 'Cargando actividades...'
													: 'No se encontraron actividades'
										}
									/>
									{errorActividades && (
										<Button
											size="small"
											variant="text"
											onClick={() => void cargarActividades()}
											disabled={loadingActividades}
											sx={{ mt: 0.5 }}
										>
											{loadingActividades ? 'Reintentando...' : 'Reintentar cargar actividades'}
										</Button>
									)}
								</Grid>

								{/* Documento de identidad */}
								<Grid size={{ xs: 12 }}>
									<Box
										sx={{
											p: 3,
											border: '2px dashed',
											borderColor: formErrors.documentoIdentidad ? 'error.main' : 'primary.main',
											borderRadius: 2,
											bgcolor: 'action.hover',
											textAlign: 'center',
										}}
									>
										<Typography variant="subtitle1" fontWeight="bold" gutterBottom>
											Imagen del Documento de Identidad *
										</Typography>
										<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
											Adjuntá una foto legible de tu DNI / Documento para validar tu identidad.
										</Typography>

										<Button
											variant="contained"
											component="label"
											startIcon={<CloudUploadIcon />}
											sx={{ mb: 1 }}
										>
											Seleccionar Imagen
											<input type="file" hidden accept="image/*" onChange={handleFileChange} />
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
											<Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
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
								Por favor, revisá atentamente que todos tus datos sean correctos antes de confirmar tu
								registro.
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
									startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
									onClick={handleConfirmAndSubmit}
									disabled={loading}
									size="large"
								>
									{loading ? 'Registrando...' : 'Confirmar y Registrarse'}
								</Button>
							</Box>
						</Box>
					)}
				</Paper>
			</Container>
		</Box>
	);
}
