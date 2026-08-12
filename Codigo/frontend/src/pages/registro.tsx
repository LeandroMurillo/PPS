import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

import {
	obtenerActividadesArcaApi,
	registrarUsuarioApi,
	type ActividadArca,
	type RegistrarUsuarioPayload,
} from '../api/auth';

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

	const [actividadesArca, setActividadesArca] = useState<ActividadArca[]>([]);

	useEffect(() => {
		obtenerActividadesArcaApi()
			.then((list) => setActividadesArca(list))
			.catch(() => setActividadesArca([]));
	}, []);

	// Form state
	const [formData, setFormData] = useState({
		nombre: '',
		apellido: '',
		email: '',
		contraseña: '',
		confirmarContraseña: '',
		CUIL: '',
		fechaNacimiento: '',
		genero: 'F' as 'F' | 'M' | 'X',
		nacionalidad: 'Argentina',
		actividadesArcaCodigo: '',
		documentoIdentidad: '',
	});

	const [documentoFileName, setDocumentoFileName] = useState('');
	const [formErrors, setFormErrors] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [registroExitoso, setRegistroExitoso] = useState<string | null>(null);

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

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith('image/')) {
			setFormErrors((prev) => ({
				...prev,
				documentoIdentidad: 'El archivo adjunto debe ser una imagen (JPG, PNG, WEBP, etc.)',
			}));
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			setFormErrors((prev) => ({
				...prev,
				documentoIdentidad: 'La imagen no debe superar los 5 MB',
			}));
			return;
		}

		setDocumentoFileName(file.name);

		const reader = new FileReader();
		reader.onload = () => {
			setFormData((prev) => ({
				...prev,
				documentoIdentidad: reader.result as string,
			}));
			setFormErrors((prev) => {
				const updated = { ...prev };
				delete updated.documentoIdentidad;
				return updated;
			});
		};
		reader.readAsDataURL(file);
	};

	const validateStep1 = (): boolean => {
		const errors: Record<string, string> = {};

		if (!formData.nombre.trim()) {
			errors.nombre = 'El nombre es obligatorio';
		} else if (formData.nombre.trim().length > 45) {
			errors.nombre = 'Máximo 45 caracteres';
		}

		if (!formData.apellido.trim()) {
			errors.apellido = 'El apellido es obligatorio';
		} else if (formData.apellido.trim().length > 45) {
			errors.apellido = 'Máximo 45 caracteres';
		}

		if (!formData.email.trim()) {
			errors.email = 'El correo electrónico es obligatorio';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
			errors.email = 'Ingrese un correo electrónico válido';
		} else if (formData.email.trim().length > 99) {
			errors.email = 'Máximo 99 caracteres';
		}

		if (!formData.contraseña) {
			errors.contraseña = 'La contraseña es obligatoria';
		} else if (formData.contraseña.length < 6) {
			errors.contraseña = 'Mínimo 6 caracteres';
		} else if (!/^(?=.*[a-zA-Z])(?=.*\d)/.test(formData.contraseña)) {
			errors.contraseña = 'Debe incluir al menos una letra y un número';
		}

		if (formData.confirmarContraseña !== formData.contraseña) {
			errors.confirmarContraseña = 'Las contraseñas no coinciden';
		}

		if (!formData.CUIL.trim()) {
			errors.CUIL = 'El CUIL es obligatorio';
		} else if (!/^\d{11}$/.test(formData.CUIL.trim())) {
			errors.CUIL = 'Debe contener exactamente 11 dígitos numéricos sin guiones';
		} else if (!validarCUIL(formData.CUIL.trim())) {
			errors.CUIL = 'El CUIL ingresado no es válido (dígito verificador incorrecto)';
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
		setErrorMessage(null);
		if (activeStep === 0) {
			if (validateStep1()) {
				setActiveStep(1);
			}
		}
	};

	const handleBack = () => {
		setErrorMessage(null);
		setActiveStep((prev) => prev - 1);
	};

	const handleConfirmAndSubmit = async () => {
		setLoading(true);
		setErrorMessage(null);

		const payload: RegistrarUsuarioPayload = {
			nombre: formData.nombre.trim(),
			apellido: formData.apellido.trim(),
			email: formData.email.trim().toLowerCase(),
			contraseña: formData.contraseña,
			CUIL: formData.CUIL.trim(),
			fechaNacimiento: formData.fechaNacimiento,
			genero: formData.genero,
			nacionalidad: formData.nacionalidad.trim(),
			actividadesArcaCodigo: formData.actividadesArcaCodigo.trim() || null,
			documentoIdentidad: formData.documentoIdentidad,
		};

		try {
			const res = await registrarUsuarioApi(payload);
			setRegistroExitoso(res.mensaje);
			setActiveStep(2);
		} catch (err) {
			setErrorMessage(err instanceof Error ? err.message : 'Ocurrió un error inesperado al registrar la cuenta.');
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
				flex: '1 0 auto',
				width: '100%',
				py: { xs: 2, sm: 3 },
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

					<Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 2.5 }}>
						{STEPS.map((label) => (
							<Step key={label}>
								<StepLabel>{label}</StepLabel>
							</Step>
						))}
					</Stepper>

					{errorMessage && (
						<Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setErrorMessage(null)}>
							{errorMessage}
						</Alert>
					)}

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
									onChange={handleChange('email')}
									error={!!formErrors.email}
									helperText={formErrors.email || 'Será tu identificador único de usuario'}
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

							<Grid size={{ xs: 12, sm: 6 }}>
								<TextField
									required
									fullWidth
									type="password"
									label="Contraseña"
									value={formData.contraseña}
									onChange={handleChange('contraseña')}
									error={!!formErrors.contraseña}
									helperText={formErrors.contraseña || 'Mínimo 6 caracteres (debe contener letras y números)'}
								/>
							</Grid>

							<Grid size={{ xs: 12, sm: 6 }}>
								<TextField
									required
									fullWidth
									type="password"
									label="Confirmar contraseña"
									value={formData.confirmarContraseña}
									onChange={handleChange('confirmarContraseña')}
									error={!!formErrors.confirmarContraseña}
									helperText={formErrors.confirmarContraseña}
								/>
							</Grid>

							<Grid size={{ xs: 12, sm: 4 }}>
								<TextField
									required
									fullWidth
									type="date"
									label="Fecha de Nacimiento"
									slotProps={{ inputLabel: { shrink: true } }}
									value={formData.fechaNacimiento}
									onChange={handleChange('fechaNacimiento')}
									error={!!formErrors.fechaNacimiento}
									helperText={formErrors.fechaNacimiento}
								/>
							</Grid>

							<Grid size={{ xs: 12, sm: 4 }}>
								<FormControl fullWidth required error={!!formErrors.genero}>
									<InputLabel id="genero-label">Género</InputLabel>
									<Select
										labelId="genero-label"
										label="Género"
										value={formData.genero}
										onChange={handleChange('genero')}
									>
										<MenuItem value="F">Femenino (F)</MenuItem>
										<MenuItem value="M">Masculino (M)</MenuItem>
										<MenuItem value="X">No binario / Otro (X)</MenuItem>
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
									getOptionLabel={(option) => `${option.codigo} - ${option.descripcion}`}
									value={
										actividadesArca.find((a) => a.codigo === formData.actividadesArcaCodigo) || null
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

						<Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
							<Button
								variant="contained"
								endIcon={<ArrowForwardIcon />}
								onClick={handleNext}
								size="large"
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
											Género
										</Typography>
										<Typography variant="body1" fontWeight="bold">
											{formData.genero === 'F'
												? 'Femenino (F)'
												: formData.genero === 'M'
													? 'Masculino (M)'
													: 'No binario / Otro (X)'}
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

						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
							<Button
								variant="outlined"
								startIcon={<ArrowBackIcon />}
								onClick={handleBack}
								disabled={loading}
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
							¡Registro Solicitado con Éxito!
						</Typography>

						<Typography
							variant="body1"
							color="text.secondary"
							paragraph
							sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}
						>
							{registroExitoso ||
								`Se ha enviado un correo electrónico de confirmación a ${formData.email}. Por favor, revisá tu casilla para activar la cuenta. Tu cuenta permanecerá en estado Pendiente hasta su activación.`}
						</Typography>

						<Alert severity="warning" sx={{ maxWidth: 600, mx: 'auto', mb: 4, textAlign: 'left' }}>
							Una vez activada la cuenta, podrás iniciar sesión para gestionar tus perfiles de actor
							cultural y publicar en el mapa.
						</Alert>

						<Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
							<Button variant="contained" onClick={() => navigate('/')} size="large">
								Ir al Mapa Principal
							</Button>
							<Button variant="outlined" onClick={() => navigate('/login')} size="large">
								Iniciar Sesión
							</Button>
						</Box>
					</Box>
				)}
			</Paper>
		</Container>
	</Box>
	);
}
