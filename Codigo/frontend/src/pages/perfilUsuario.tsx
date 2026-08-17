import * as React from 'react';
import { useNavigate } from 'react-router';

import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import ShieldIcon from '@mui/icons-material/Shield';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
	Alert,
	Autocomplete,
	Avatar,
	Box,
	Button,
	Chip,
	type ChipProps,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Divider,
	FormControl,
	Grid,
	IconButton,
	InputAdornment,
	InputLabel,
	MenuItem,
	Paper,
	Select,
	Stack,
	Tab,
	Tabs,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material';
import { PageContainer } from '@toolpad/core/PageContainer';
import dayjs from 'dayjs';

import {
	actualizarPerfilUsuarioApi,
	cambiarContrasenaUsuarioApi,
	eliminarCuentaUsuarioApi,
	obtenerPerfilUsuarioApi,
	type PerfilUsuarioData,
} from '../api/usuario';
import { obtenerActividadesArcaApi, type ActividadArca } from '../api/auth';
import DatePickerSpanish from '../components/datePickerSpanish';
import { GENEROS, type GeneroCodigo } from '../constants/generos';
import { ESTADO_COLORS, ESTADO_LABELS } from '../constants/estados';
import { useAuth } from '../context/AuthContext';
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

export default function PerfilUsuarioPage() {
	const navigate = useNavigate();
	const { updateUser, logout } = useAuth();

	const [activeTab, setActiveTab] = React.useState<number>(0);
	const [loading, setLoading] = React.useState<boolean>(true);
	const [perfil, setPerfil] = React.useState<PerfilUsuarioData | null>(null);

	// Actividades ARCA
	const [actividadesArca, setActividadesArca] = React.useState<ActividadArca[]>([]);
	const [actividadesLoading, setActividadesLoading] = React.useState<boolean>(false);

	// Formulario de datos personales
	const [nombre, setNombre] = React.useState('');
	const [apellido, setApellido] = React.useState('');
	const [genero, setGenero] = React.useState<GeneroCodigo>('N');
	const [fechaNacimiento, setFechaNacimiento] = React.useState('');
	const [nacionalidad, setNacionalidad] = React.useState('Argentina');
	const [cuil, setCuil] = React.useState('');
	const [selectedArca, setSelectedArca] = React.useState<ActividadArca | null>(null);
	const [fotoDniBase64, setFotoDniBase64] = React.useState<string | null>(null);
	const [fotoDniNombre, setFotoDniNombre] = React.useState<string>('');
	const [fotoDniError, setFotoDniError] = React.useState<string | null>(null);
	const [profileDragging, setProfileDragging] = React.useState<boolean>(false);
	const [savingProfile, setSavingProfile] = React.useState<boolean>(false);
	const [profileValidationAttempted, setProfileValidationAttempted] = React.useState<boolean>(false);

	// Formulario de cambio de contraseña
	const [contraseñaActual, setContraseñaActual] = React.useState('');
	const [nuevaContraseña, setNuevaContraseña] = React.useState('');
	const [confirmarContraseña, setConfirmarContraseña] = React.useState('');
	const [showCurrentPass, setShowCurrentPass] = React.useState(false);
	const [showNewPass, setShowNewPass] = React.useState(false);
	const [showConfirmPass, setShowConfirmPass] = React.useState(false);
	const [savingPassword, setSavingPassword] = React.useState(false);
	const [passValidationAttempted, setPassValidationAttempted] = React.useState(false);

	// Modal de eliminación de cuenta
	const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
	const [deleteConfirmInput, setDeleteConfirmInput] = React.useState('');
	const [deletingAccount, setDeletingAccount] = React.useState(false);

	// Cargar perfil y actividades ARCA
	const cargarPerfil = React.useCallback(async () => {
		try {
			setLoading(true);
			const [perfilData, arcaList] = await Promise.all([
				obtenerPerfilUsuarioApi(),
				obtenerActividadesArcaApi().catch(() => [] as ActividadArca[]),
			]);

			setPerfil(perfilData);
			setActividadesArca(arcaList);

			setNombre(perfilData.nombre);
			setApellido(perfilData.apellido);
			setGenero(perfilData.genero);
			setFechaNacimiento(perfilData.fechaNacimiento);
			setNacionalidad(perfilData.nacionalidad || 'Argentina');
			setCuil(perfilData.CUIL);

			if (perfilData.actividadesArcaCodigo) {
				const found = arcaList.find((a) => a.codigo === perfilData.actividadesArcaCodigo);
				setSelectedArca(
					found || {
						codigo: perfilData.actividadesArcaCodigo,
						descripcion: perfilData.actividadArca || `Actividad ${perfilData.actividadesArcaCodigo}`,
					},
				);
			} else {
				setSelectedArca(null);
			}
		} catch (err) {
			console.error('Error al cargar perfil:', err);
			notify.error(err instanceof Error ? err.message : 'No se pudo cargar el perfil.', { scope: 'perfil' });
		} finally {
			setLoading(false);
		}
	}, []);

	React.useEffect(() => {
		void cargarPerfil();
	}, [cargarPerfil]);

	// Cargar actividades ARCA si no se cargaron antes
	React.useEffect(() => {
		if (actividadesArca.length === 0) {
			setActividadesLoading(true);
			obtenerActividadesArcaApi()
				.then((list) => setActividadesArca(list))
				.catch(() => {})
				.finally(() => setActividadesLoading(false));
		}
	}, [actividadesArca.length]);

	// Manejo de archivo DNI
	const handleDniFile = async (file: File | null) => {
		if (!file) return;
		if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
			const err = 'Seleccioná una imagen JPG, PNG o WebP.';
			setFotoDniError(err);
			notify.error(err, { scope: 'perfil' });
			return;
		}
		const sizeVal = validateImageFile(file, 5);
		if (!sizeVal.valid) {
			const err = sizeVal.error ?? 'La imagen supera el límite permitido de 5 MB.';
			setFotoDniError(err);
			notify.error(err, { scope: 'perfil' });
			return;
		}

		try {
			const base64 = await fileToBase64(file);
			setFotoDniBase64(base64);
			setFotoDniNombre(file.name);
			setFotoDniError(null);
		} catch {
			const err = 'No se pudo procesar la imagen seleccionada.';
			setFotoDniError(err);
			notify.error(err, { scope: 'perfil' });
		}
	};

	// Validaciones de contraseña
	const passHasMinLength = nuevaContraseña.length >= 6;
	const passHasLetter = /[a-zA-Z]/.test(nuevaContraseña);
	const passHasNumber = /\d/.test(nuevaContraseña);
	const passMatch = nuevaContraseña.length > 0 && nuevaContraseña === confirmarContraseña;
	const passIsValid = passHasMinLength && passHasLetter && passHasNumber && passMatch;

	// Guardar datos del perfil
	const handleGuardarPerfil = async (e: React.FormEvent) => {
		e.preventDefault();
		setProfileValidationAttempted(true);

		if (!nombre.trim()) {
			notify.error('El nombre es obligatorio.', { scope: 'perfil' });
			return;
		}
		if (/\d/.test(nombre)) {
			notify.error('El nombre no puede contener números.', { scope: 'perfil' });
			return;
		}
		if (!apellido.trim()) {
			notify.error('El apellido es obligatorio.', { scope: 'perfil' });
			return;
		}
		if (/\d/.test(apellido)) {
			notify.error('El apellido no puede contener números.', { scope: 'perfil' });
			return;
		}
		if (!fechaNacimiento) {
			notify.error('La fecha de nacimiento es obligatoria.', { scope: 'perfil' });
			return;
		}
		if (!nacionalidad.trim()) {
			notify.error('La nacionalidad es obligatoria.', { scope: 'perfil' });
			return;
		}
		if (/\d/.test(nacionalidad)) {
			notify.error('La nacionalidad no puede contener números.', { scope: 'perfil' });
			return;
		}
		if (!cuil.trim() || !validarCUIL(cuil.trim())) {
			notify.error('El CUIL no es válido (debe tener 11 dígitos y dígito verificador correcto).', {
				scope: 'perfil',
			});
			return;
		}

		setSavingProfile(true);
		try {
			const res = await actualizarPerfilUsuarioApi({
				nombre: nombre.trim(),
				apellido: apellido.trim(),
				genero,
				fechaNacimiento,
				nacionalidad: nacionalidad.trim(),
				CUIL: cuil.trim().replace(/\D/g, ''),
				actividadesArcaCodigo: selectedArca?.codigo || null,
				documentoIdentidad: fotoDniBase64 || undefined,
			});

			setPerfil(res.data);
			updateUser({
				nombre: res.data.nombre,
				apellido: res.data.apellido,
				genero: res.data.genero,
				fechaNacimiento: res.data.fechaNacimiento,
				nacionalidad: res.data.nacionalidad,
				CUIL: res.data.CUIL,
				actividadesArcaCodigo: res.data.actividadesArcaCodigo,
				fotoDniUrl: res.data.fotoDniUrl,
			});

			setFotoDniBase64(null);
			setFotoDniNombre('');
			notify.success(res.mensaje || 'Perfil actualizado correctamente.', { scope: 'perfil' });
		} catch (err) {
			console.error('Error al actualizar perfil:', err);
			notify.error(err instanceof Error ? err.message : 'No se pudo actualizar el perfil.', { scope: 'perfil' });
		} finally {
			setSavingProfile(false);
		}
	};

	// Cambiar contraseña
	const handleCambiarContraseña = async (e: React.FormEvent) => {
		e.preventDefault();
		setPassValidationAttempted(true);

		if (!contraseñaActual) {
			notify.error('Ingresá tu contraseña actual.', { scope: 'password' });
			return;
		}
		if (!passIsValid) {
			notify.error('La nueva contraseña no cumple con todos los requisitos.', { scope: 'password' });
			return;
		}

		setSavingPassword(true);
		try {
			const res = await cambiarContrasenaUsuarioApi({
				contraseñaActual,
				nuevaContraseña,
			});

			setContraseñaActual('');
			setNuevaContraseña('');
			setConfirmarContraseña('');
			setPassValidationAttempted(false);
			notify.success(res.mensaje || 'Contraseña actualizada correctamente.', { scope: 'password' });
		} catch (err) {
			console.error('Error al cambiar contraseña:', err);
			notify.error(err instanceof Error ? err.message : 'No se pudo cambiar la contraseña.', {
				scope: 'password',
			});
		} finally {
			setSavingPassword(false);
		}
	};

	// Eliminar cuenta
	const isDeleteConfirmed = React.useMemo(() => {
		const clean = deleteConfirmInput.trim().toUpperCase();
		return clean === 'BORRAR MI CUENTA' || clean === 'ELIMINAR';
	}, [deleteConfirmInput]);

	const handleEliminarCuenta = async () => {
		if (!isDeleteConfirmed) return;

		setDeletingAccount(true);
		try {
			const res = await eliminarCuentaUsuarioApi();
			setDeleteModalOpen(false);
			logout();
			if (res.archivosNoEliminadosCount > 0) {
				notify.warning(res.mensaje, { scope: 'cuenta' });
			} else {
				notify.info(res.mensaje || 'Tu cuenta ha sido eliminada.', { scope: 'cuenta' });
			}
			navigate('/login');
		} catch (err) {
			console.error('Error al eliminar cuenta:', err);
			notify.error(err instanceof Error ? err.message : 'No se pudo eliminar la cuenta.', { scope: 'cuenta' });
		} finally {
			setDeletingAccount(false);
		}
	};

	if (loading) {
		return (
			<PageContainer title="Mi perfil">
				<Stack alignItems="center" justifyContent="center" sx={{ py: 12 }}>
					<CircularProgress size={48} />
					<Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
						Cargando información de tu perfil...
					</Typography>
				</Stack>
			</PageContainer>
		);
	}

	const roleLabel = perfil?.rol === 'ADMIN' ? 'Administrador' : perfil?.rol === 'MODERADOR' ? 'Moderador' : 'Usuario';
	const statusColor: ChipProps['color'] = perfil?.estado ? (ESTADO_COLORS[perfil.estado] ?? 'default') : 'default';
	const statusLabel = perfil?.estado ? ESTADO_LABELS[perfil.estado] : '—';

	// Configuración de avatar dinámico por género
	const getAvatarConfig = (genero?: string) => {
		if (genero === 'F' || genero === 'MF') {
			return {
				style: 'lorelei',
				backgroundColor: ['f9d5e5', 'f7c6d9', 'f2d7d5'],
			};
		}
		if (genero === 'M' || genero === 'FM') {
			return {
				style: 'micah',
				backgroundColor: ['dbeafe', 'c7d2fe', 'e0f2fe'],
			};
		}
		return {
			style: 'initials',
			backgroundColor: ['e5e7eb', 'd1d5db', 'f3f4f6'],
		};
	};

	const avatarConfig = getAvatarConfig(perfil?.genero);
	const avatarUrl = `https://api.dicebear.com/10.x/${avatarConfig.style}/svg?seed=${encodeURIComponent(
		`${perfil?.nombre} ${perfil?.apellido}`,
	)}&backgroundColor=${avatarConfig.backgroundColor.join(',')}`;

	return (
		<PageContainer title="Mi perfil">
			<Stack spacing={3} sx={{ width: '100%', maxWidth: 960, mx: 'auto', pb: 6 }}>
				{/* Encabezado / Resumen del Usuario */}
				<Paper
					variant="outlined"
					sx={{
						p: 3,
						borderRadius: 2,
						bgcolor: 'background.paper',
						boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
					}}
				>
					<Stack
						direction={{ xs: 'column', sm: 'row' }}
						spacing={3}
						alignItems={{ xs: 'center', sm: 'center' }}
						justifyContent="space-between"
					>
						<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems="center">
							<Avatar
								src={avatarUrl}
								alt={`${perfil?.nombre} ${perfil?.apellido}`}
								sx={{
									width: 80,
									height: 80,
									fontSize: '1.8rem',
									fontWeight: 700,
									bgcolor: 'primary.main',
									boxShadow: 2,
								}}
							>
								{perfil?.nombre?.charAt(0)}
								{perfil?.apellido?.charAt(0)}
							</Avatar>
							<Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
								<Typography variant="h5" fontWeight={700}>
									{perfil?.nombre} {perfil?.apellido}
								</Typography>
								<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
									{perfil?.email}
								</Typography>
								<Stack
									direction="row"
									spacing={1}
									flexWrap="wrap"
									useFlexGap
									sx={{ gap: 0.75, justifyContent: { xs: 'center', sm: 'flex-start' } }}
								>
									<Chip
										size="small"
										icon={perfil?.rol !== 'USUARIO' ? <ShieldIcon fontSize="small" /> : undefined}
										label={roleLabel}
										color={
											perfil?.rol === 'ADMIN'
												? 'secondary'
												: perfil?.rol === 'MODERADOR'
													? 'info'
													: 'default'
										}
										variant="outlined"
									/>
									<Chip
										size="small"
										label={`Estado: ${statusLabel}`}
										color={statusColor}
										variant="outlined"
									/>
									<Chip
										size="small"
										label={`Dueño de ${perfil?.actoresDuenoCount ?? 0} actor${(perfil?.actoresDuenoCount ?? 0) === 1 ? '' : 'es'}`}
										color="primary"
										variant="outlined"
									/>
								</Stack>
							</Box>
						</Stack>

						{perfil?.fechaRegistro && (
							<Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right' }}>
								Miembro desde {dayjs(perfil.fechaRegistro).format('DD/MM/YYYY')}
							</Typography>
						)}
					</Stack>
				</Paper>

				{/* Pestañas de Navegación del Perfil */}
				<Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
					<Tabs
						value={activeTab}
						onChange={(_, val) => setActiveTab(val)}
						variant="scrollable"
						scrollButtons="auto"
						sx={{
							borderBottom: 1,
							borderColor: 'divider',
							px: 2,
							bgcolor: 'background.default',
							'& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 48 },
						}}
					>
						<Tab icon={<PersonIcon fontSize="small" />} iconPosition="start" label="Datos personales" />
						<Tab icon={<LockIcon fontSize="small" />} iconPosition="start" label="Seguridad y contraseña" />
						<Tab
							icon={<DeleteForeverIcon fontSize="small" />}
							iconPosition="start"
							label="Zona de peligro"
							sx={{ color: 'error.main', '&.Mui-selected': { color: 'error.main' } }}
						/>
					</Tabs>

					<Box sx={{ p: { xs: 2.5, sm: 4 } }}>
						{/* ========================================================================= */}
						{/* PESTAÑA 0: DATOS PERSONALES                                               */}
						{/* ========================================================================= */}
						{activeTab === 0 && (
							<Box component="form" onSubmit={handleGuardarPerfil} noValidate>
								<Stack spacing={3}>
									<Typography variant="h6" fontWeight={700}>
										Información de la cuenta
									</Typography>

									<Grid container spacing={2.5}>
										{/* Nombre */}
										<Grid size={{ xs: 12, sm: 6 }}>
											<TextField
												fullWidth
												required
												label="Nombre"
												value={nombre}
												onChange={(e) => setNombre(e.target.value)}
												error={
													profileValidationAttempted && (!nombre.trim() || /\d/.test(nombre))
												}
												helperText={
													profileValidationAttempted
														? !nombre.trim()
															? 'El nombre es obligatorio'
															: /\d/.test(nombre)
																? 'El nombre no puede contener números'
																: undefined
														: undefined
												}
											/>
										</Grid>

										{/* Apellido */}
										<Grid size={{ xs: 12, sm: 6 }}>
											<TextField
												fullWidth
												required
												label="Apellido"
												value={apellido}
												onChange={(e) => setApellido(e.target.value)}
												error={
													profileValidationAttempted &&
													(!apellido.trim() || /\d/.test(apellido))
												}
												helperText={
													profileValidationAttempted
														? !apellido.trim()
															? 'El apellido es obligatorio'
															: /\d/.test(apellido)
																? 'El apellido no puede contener números'
																: undefined
														: undefined
												}
											/>
										</Grid>

										{/* Correo (Solo lectura) */}
										<Grid size={{ xs: 12, sm: 6 }}>
											<Tooltip
												title="El correo electrónico es el identificador único de tu cuenta y no puede modificarse directamente."
												arrow
											>
												<TextField
													fullWidth
													disabled
													label="Correo electrónico"
													value={perfil?.email || ''}
													helperText="Identificador principal de tu cuenta"
												/>
											</Tooltip>
										</Grid>

										{/* Género */}
										<Grid size={{ xs: 12, sm: 6 }}>
											<FormControl fullWidth required>
												<InputLabel>Identidad de género</InputLabel>
												<Select
													value={genero}
													label="Identidad de género"
													onChange={(e) => setGenero(e.target.value as GeneroCodigo)}
												>
													{GENEROS.map((g) => (
														<MenuItem key={g.code} value={g.code}>
															{g.label}
														</MenuItem>
													))}
												</Select>
											</FormControl>
										</Grid>

										{/* Fecha de nacimiento */}
										<Grid size={{ xs: 12, sm: 6 }}>
											<DatePickerSpanish
												label="Fecha de nacimiento"
												value={fechaNacimiento}
												required
												onChange={(dateStr) => setFechaNacimiento(dateStr)}
												error={profileValidationAttempted && !fechaNacimiento}
												helperText={
													profileValidationAttempted && !fechaNacimiento
														? 'La fecha de nacimiento es obligatoria'
														: undefined
												}
												maxDate={dayjs()}
											/>
										</Grid>

										{/* Nacionalidad */}
										<Grid size={{ xs: 12, sm: 6 }}>
											<TextField
												fullWidth
												required
												label="Nacionalidad"
												value={nacionalidad}
												onChange={(e) => setNacionalidad(e.target.value)}
												error={
													profileValidationAttempted &&
													(!nacionalidad.trim() || /\d/.test(nacionalidad))
												}
												helperText={
													profileValidationAttempted
														? !nacionalidad.trim()
															? 'La nacionalidad es obligatoria'
															: /\d/.test(nacionalidad)
																? 'La nacionalidad no puede contener números'
																: undefined
														: undefined
												}
											/>
										</Grid>

										{/* CUIL */}
										<Grid size={{ xs: 12, sm: 6 }}>
											<TextField
												fullWidth
												required
												label="CUIL / CUIT"
												placeholder="Ej. 20301234567"
												value={cuil}
												onChange={(e) => setCuil(e.target.value)}
												error={
													profileValidationAttempted &&
													(!cuil.trim() || !validarCUIL(cuil.trim()))
												}
												helperText={
													profileValidationAttempted &&
													(!cuil.trim() || !validarCUIL(cuil.trim()))
														? 'Ingresá un CUIL válido de 11 dígitos'
														: '11 dígitos sin guiones'
												}
											/>
										</Grid>

										{/* Actividad ARCA */}
										<Grid size={{ xs: 12, sm: 6 }}>
											<Autocomplete
												options={actividadesArca}
												loading={actividadesLoading}
												getOptionLabel={(opt) => `${opt.codigo} - ${opt.descripcion}`}
												value={selectedArca}
												onChange={(_, newValue) => setSelectedArca(newValue)}
												isOptionEqualToValue={(opt, val) => opt.codigo === val?.codigo}
												renderInput={(params) => (
													<TextField
														{...params}
														label="Actividad principal ARCA (Opcional)"
														placeholder="Buscá por código o descripción..."
														helperText="Actividad económica declarada ante ARCA / AFIP"
													/>
												)}
											/>
										</Grid>
									</Grid>

									<Divider sx={{ my: 1 }} />

									{/* Documento de Identidad / Foto DNI */}
									<Box>
										<Paper
											variant="outlined"
											sx={{
												p: 2.5,
												borderRadius: 2,
												bgcolor: 'background.default',
												border: '1px dashed',
												borderColor: fotoDniError
													? 'error.main'
													: profileDragging
														? 'primary.main'
														: 'divider',
											}}
											onDragEnter={(e) => {
												e.preventDefault();
												setProfileDragging(true);
											}}
											onDragOver={(e) => e.preventDefault()}
											onDragLeave={(e) => {
												if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
													setProfileDragging(false);
												}
											}}
											onDrop={(e) => {
												e.preventDefault();
												setProfileDragging(false);
												handleDniFile(e.dataTransfer.files[0] ?? null);
											}}
										>
											<Stack
												direction={{ xs: 'column', sm: 'row' }}
												spacing={2.5}
												alignItems="center"
											>
												{/* Vista previa */}
												{fotoDniBase64 || perfil?.fotoDniUrl ? (
													<Box
														component="img"
														src={fotoDniBase64 || perfil?.fotoDniUrl || ''}
														alt="Foto DNI"
														sx={{
															width: 140,
															height: 90,
															borderRadius: 1.5,
															objectFit: 'cover',
															border: 1,
															borderColor: 'divider',
															boxShadow: 1,
														}}
													/>
												) : (
													<Box
														sx={{
															width: 140,
															height: 90,
															borderRadius: 1.5,
															bgcolor: 'action.hover',
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center',
															color: 'text.disabled',
														}}
													>
														<AddPhotoAlternateIcon sx={{ fontSize: 36 }} />
													</Box>
												)}

												<Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
													<Typography variant="subtitle2" fontWeight={600} paddingBottom={2}>
														{fotoDniNombre ||
															(perfil?.fotoDniUrl
																? 'Documento registrado actualmente'
																: 'Sin documento cargado')}
													</Typography>

													<Stack
														direction="row"
														spacing={1}
														justifyContent={{ xs: 'center', sm: 'flex-start' }}
													>
														<Button
															component="label"
															variant="outlined"
															size="small"
															startIcon={<AddPhotoAlternateIcon />}
															sx={{ textTransform: 'none' }}
														>
															{perfil?.fotoDniUrl
																? 'Reemplazar documento'
																: 'Subir foto DNI'}
															<input
																hidden
																type="file"
																accept="image/jpeg,image/png,image/webp"
																onChange={(e) =>
																	handleDniFile(e.target.files?.[0] ?? null)
																}
															/>
														</Button>

														{fotoDniBase64 && (
															<Button
																size="small"
																color="inherit"
																startIcon={<ClearIcon />}
																onClick={() => {
																	setFotoDniBase64(null);
																	setFotoDniNombre('');
																}}
																sx={{ textTransform: 'none' }}
															>
																Descartar cambio
															</Button>
														)}
													</Stack>
													{fotoDniError && (
														<Typography
															variant="caption"
															color="error.main"
															sx={{ mt: 1, display: 'block' }}
														>
															{fotoDniError}
														</Typography>
													)}
												</Box>
											</Stack>
										</Paper>
									</Box>

									<Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
										<Button
											type="submit"
											variant="contained"
											color="primary"
											size="large"
											disabled={savingProfile}
											sx={{ minWidth: 180, fontWeight: 700 }}
										>
											{savingProfile ? 'Guardando cambios…' : 'Guardar cambios'}
										</Button>
									</Box>
								</Stack>
							</Box>
						)}

						{/* ========================================================================= */}
						{/* PESTAÑA 1: SEGURIDAD Y CONTRASEÑA                                         */}
						{/* ========================================================================= */}
						{activeTab === 1 && (
							<Box component="form" onSubmit={handleCambiarContraseña} noValidate>
								<Stack spacing={3}>
									<Box>
										<Typography variant="h6" fontWeight={700}>
											Cambiar contraseña
										</Typography>
										<Typography variant="body2" color="text.secondary">
											Actualizá tu clave de acceso para mantener segura tu cuenta.
										</Typography>
									</Box>

									{/* Contraseña Actual */}
									<TextField
										fullWidth
										required
										type={showCurrentPass ? 'text' : 'password'}
										label="Contraseña actual"
										placeholder="Ingresá tu clave actual"
										value={contraseñaActual}
										onChange={(e) => setContraseñaActual(e.target.value)}
										error={passValidationAttempted && !contraseñaActual}
										helperText={
											passValidationAttempted && !contraseñaActual
												? 'Debés ingresar tu contraseña actual'
												: undefined
										}
										InputProps={{
											endAdornment: (
												<InputAdornment position="end">
													<IconButton
														size="small"
														onClick={() => setShowCurrentPass(!showCurrentPass)}
														edge="end"
													>
														{showCurrentPass ? <VisibilityOff /> : <Visibility />}
													</IconButton>
												</InputAdornment>
											),
										}}
									/>

									{/* Nueva Contraseña */}
									<TextField
										fullWidth
										required
										type={showNewPass ? 'text' : 'password'}
										label="Nueva contraseña"
										placeholder="Ingresá tu nueva clave"
										value={nuevaContraseña}
										onChange={(e) => setNuevaContraseña(e.target.value)}
										error={
											passValidationAttempted &&
											(!passHasMinLength || !passHasLetter || !passHasNumber)
										}
										InputProps={{
											endAdornment: (
												<InputAdornment position="end">
													<IconButton
														size="small"
														onClick={() => setShowNewPass(!showNewPass)}
														edge="end"
													>
														{showNewPass ? <VisibilityOff /> : <Visibility />}
													</IconButton>
												</InputAdornment>
											),
										}}
									/>

									{/* Confirmar Nueva Contraseña */}
									<TextField
										fullWidth
										required
										type={showConfirmPass ? 'text' : 'password'}
										label="Confirmar nueva contraseña"
										placeholder="Reingresá tu nueva clave"
										value={confirmarContraseña}
										onChange={(e) => setConfirmarContraseña(e.target.value)}
										error={passValidationAttempted && !passMatch}
										helperText={
											passValidationAttempted && !passMatch
												? 'Las contraseñas no coinciden'
												: undefined
										}
										InputProps={{
											endAdornment: (
												<InputAdornment position="end">
													<IconButton
														size="small"
														onClick={() => setShowConfirmPass(!showConfirmPass)}
														edge="end"
													>
														{showConfirmPass ? <VisibilityOff /> : <Visibility />}
													</IconButton>
												</InputAdornment>
											),
										}}
									/>

									{/* Requisitos de contraseña en tiempo real */}
									<Paper
										variant="outlined"
										sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}
									>
										<Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
											Requisitos de seguridad:
										</Typography>
										<Stack spacing={0.75}>
											<Stack direction="row" spacing={1} alignItems="center">
												{passHasMinLength ? (
													<CheckCircleOutlineIcon fontSize="small" color="success" />
												) : (
													<ErrorOutlineIcon fontSize="small" color="disabled" />
												)}
												<Typography
													variant="caption"
													color={passHasMinLength ? 'success.main' : 'text.secondary'}
													fontWeight={passHasMinLength ? 600 : 400}
												>
													Mínimo 6 caracteres
												</Typography>
											</Stack>

											<Stack direction="row" spacing={1} alignItems="center">
												{passHasLetter ? (
													<CheckCircleOutlineIcon fontSize="small" color="success" />
												) : (
													<ErrorOutlineIcon fontSize="small" color="disabled" />
												)}
												<Typography
													variant="caption"
													color={passHasLetter ? 'success.main' : 'text.secondary'}
													fontWeight={passHasLetter ? 600 : 400}
												>
													Al menos una letra (a-z, A-Z)
												</Typography>
											</Stack>

											<Stack direction="row" spacing={1} alignItems="center">
												{passHasNumber ? (
													<CheckCircleOutlineIcon fontSize="small" color="success" />
												) : (
													<ErrorOutlineIcon fontSize="small" color="disabled" />
												)}
												<Typography
													variant="caption"
													color={passHasNumber ? 'success.main' : 'text.secondary'}
													fontWeight={passHasNumber ? 600 : 400}
												>
													Al menos un número (0-9)
												</Typography>
											</Stack>

											<Stack direction="row" spacing={1} alignItems="center">
												{passMatch ? (
													<CheckCircleOutlineIcon fontSize="small" color="success" />
												) : (
													<ErrorOutlineIcon fontSize="small" color="disabled" />
												)}
												<Typography
													variant="caption"
													color={passMatch ? 'success.main' : 'text.secondary'}
													fontWeight={passMatch ? 600 : 400}
												>
													Las contraseñas coinciden
												</Typography>
											</Stack>
										</Stack>
									</Paper>

									<Box sx={{ display: 'flex', justifyContent: 'flex-start', pt: 1 }}>
										<Button
											type="submit"
											variant="contained"
											color="primary"
											size="large"
											disabled={savingPassword || !passIsValid}
											sx={{ minWidth: 200, fontWeight: 700 }}
										>
											{savingPassword ? 'Actualizando clave…' : 'Actualizar contraseña'}
										</Button>
									</Box>
								</Stack>
							</Box>
						)}

						{/* ========================================================================= */}
						{/* PESTAÑA 2: ZONA DE PELIGRO (BORRAR CUENTA)                                */}
						{/* ========================================================================= */}
						{activeTab === 2 && (
							<Stack spacing={3}>
								<Box>
									<Typography variant="h6" fontWeight={700} color="error.main">
										Zona de peligro
									</Typography>
									<Typography variant="body2" color="text.secondary">
										Acciones críticas e irreversibles sobre tu cuenta de usuario.
									</Typography>
								</Box>

								<Alert severity="error" icon={<WarningAmberIcon />}>
									<strong>¡Atención!</strong> Al eliminar tu cuenta de usuario:
									<ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
										<li>Se borrarán permanentemente tus credenciales y datos personales.</li>
										<li>
											<strong>
												Se eliminarán automáticamente todos los actores culturales de los que
												sos dueño/a ({perfil?.actoresDuenoCount ?? 0} actor
												{(perfil?.actoresDuenoCount ?? 0) === 1 ? '' : 'es'})
											</strong>
											, junto con sus portafolios, fotos, eventos, integrantes y postulaciones.
										</li>
										<li>Esta acción es totalmente definitiva y no podrá deshacerse.</li>
									</ul>
								</Alert>

								<Paper
									variant="outlined"
									sx={{
										p: 3,
										borderRadius: 2,
										borderColor: 'error.main',
										bgcolor: 'error.lighter',
									}}
								>
									<Stack
										direction={{ xs: 'column', sm: 'row' }}
										spacing={2}
										alignItems={{ xs: 'flex-start', sm: 'center' }}
										justifyContent="space-between"
									>
										<Box>
											<Typography variant="subtitle1" fontWeight={700} color="error.main">
												Eliminar definitivamente mi cuenta
											</Typography>
											<Typography variant="body2" color="text.secondary">
												Borra de forma permanente tu usuario y todos tus proyectos culturales
												asociados.
											</Typography>
										</Box>
										<Button
											variant="contained"
											color="error"
											startIcon={<DeleteForeverIcon />}
											onClick={() => {
												setDeleteConfirmInput('');
												setDeleteModalOpen(true);
											}}
											sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}
										>
											Eliminar cuenta
										</Button>
									</Stack>
								</Paper>
							</Stack>
						)}
					</Box>
				</Paper>
			</Stack>

			{/* MODAL: Confirmación estricta de eliminación de cuenta */}
			<Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} maxWidth="sm" fullWidth>
				<DialogTitle fontWeight={700} color="error.main">
					¿Confirmar eliminación definitiva de tu cuenta?
				</DialogTitle>
				<DialogContent dividers>
					<Stack spacing={2.5}>
						<Alert severity="error">
							<strong>¡Esta acción no se puede deshacer!</strong> Se eliminará permanentemente tu cuenta{' '}
							<strong>{perfil?.email}</strong> y{' '}
							<strong>
								todos los actores culturales bajo tu titularidad ({perfil?.actoresDuenoCount ?? 0} actor
								{(perfil?.actoresDuenoCount ?? 0) === 1 ? '' : 'es'})
							</strong>
							.
						</Alert>
						<DialogContentText style={{ userSelect: 'none' }}>
							Para confirmar la eliminación, escribí <strong>BORRAR MI CUENTA</strong> en el siguiente
							campo:
						</DialogContentText>
						<TextField
							fullWidth
							autoFocus
							size="small"
							placeholder="Escribí BORRAR MI CUENTA para confirmar"
							value={deleteConfirmInput}
							onChange={(e) => setDeleteConfirmInput(e.target.value)}
							color={isDeleteConfirmed ? 'error' : 'primary'}
							helperText={
								isDeleteConfirmed
									? 'Confirmación detectada. Hacé clic en el botón rojo para proceder.'
									: 'Ingresá el texto de confirmación para habilitar el botón.'
							}
						/>
					</Stack>
				</DialogContent>
				<DialogActions sx={{ p: 2 }}>
					<Button onClick={() => setDeleteModalOpen(false)} disabled={deletingAccount}>
						Cancelar
					</Button>
					<Button
						variant="contained"
						color="error"
						disabled={!isDeleteConfirmed || deletingAccount}
						onClick={handleEliminarCuenta}
					>
						{deletingAccount ? 'Eliminando cuenta…' : 'Eliminar definitivamente mi cuenta'}
					</Button>
				</DialogActions>
			</Dialog>
		</PageContainer>
	);
}
