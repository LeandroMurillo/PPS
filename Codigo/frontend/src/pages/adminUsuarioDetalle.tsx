import * as React from 'react';
import { useNavigate, useParams } from 'react-router';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import BlockIcon from '@mui/icons-material/Block';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import CloseIcon from '@mui/icons-material/Close';
import ContactPageOutlinedIcon from '@mui/icons-material/ContactPageOutlined';
import DownloadIcon from '@mui/icons-material/Download';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import StarIcon from '@mui/icons-material/Star';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import WcOutlinedIcon from '@mui/icons-material/WcOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import ZoomInIcon from '@mui/icons-material/ZoomIn';

import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { PageContainer } from '@toolpad/core/PageContainer';
import { useDialogs } from '@toolpad/core/useDialogs';

import {
	asignarModeradorAdmin,
	cambiarEstadoUsuarioAdmin,
	obtenerUsuarioAdmin,
	type UsuarioActorAdmin,
	type UsuarioDetalleAdmin,
} from '../api/admin';
import { apiFetchBlob } from '../api/client';
import CategoryIcon from '../components/categoryIcon';
import {
	ESTADO_COLORS as stateColors,
	ESTADO_LABELS as stateLabels,
	TIPO_ACTOR_LABELS as typeLabels,
} from '../constants/estados';
import { getGeneroEtiqueta } from '../constants/generos';
import { useAuth } from '../context/AuthContext';
import { getUserAvatarUrl } from '../utils/avatar';
import { formatDate, formatDateTime } from '../utils/date';
import { buildSlugConId } from '../utils/slug';
import { notify } from '../utils/toast';

const roleColors = { USUARIO: 'default', MODERADOR: 'warning', ADMIN: 'error' } as const;

function calcularEdad(fechaNacimiento: string): number | null {
	if (!fechaNacimiento) return null;
	const fecha = new Date(fechaNacimiento);
	if (Number.isNaN(fecha.getTime())) return null;
	const hoy = new Date();
	let edad = hoy.getFullYear() - fecha.getFullYear();
	const m = hoy.getMonth() - fecha.getMonth();
	if (m < 0 || (m === 0 && hoy.getDate() < fecha.getDate())) {
		edad--;
	}
	return edad >= 0 ? edad : null;
}

function SectionPaper({
	title,
	icon,
	badge,
	children,
	action,
}: {
	title: string;
	icon?: React.ReactNode;
	badge?: React.ReactNode;
	children: React.ReactNode;
	action?: React.ReactNode;
}) {
	return (
		<Paper
			variant="outlined"
			sx={{
				p: { xs: 2, sm: 3 },
				height: '100%',
				borderRadius: 2,
				borderColor: 'divider',
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<Stack
				direction="row"
				alignItems="center"
				justifyContent="space-between"
				sx={{ mb: 2.5 }}
				flexWrap="wrap"
				gap={1}
			>
				<Stack direction="row" alignItems="center" spacing={1.25}>
					{icon && <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>}
					<Typography component="h2" variant="h6" fontWeight={700}>
						{title}
					</Typography>
					{badge}
				</Stack>
				{action}
			</Stack>
			{children}
		</Paper>
	);
}

function InfoItem({ icon, label, value }: { icon?: React.ReactNode; label: string; value: React.ReactNode }) {
	return (
		<Box sx={{ py: 1 }}>
			<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
				{icon && <Box sx={{ color: 'text.secondary', display: 'flex', fontSize: '1rem' }}>{icon}</Box>}
				<Typography variant="caption" color="text.secondary" fontWeight={500}>
					{label}
				</Typography>
			</Stack>
			<Typography variant="body2" fontWeight={600} sx={{ pl: icon ? 3 : 0, wordBreak: 'break-word' }}>
				{value ?? '—'}
			</Typography>
		</Box>
	);
}

export default function AdminUsuarioDetallePage() {
	const { usuarioId = '' } = useParams();
	const navigate = useNavigate();
	const dialogs = useDialogs();
	const { user: currentUser } = useAuth();

	const [usuario, setUsuario] = React.useState<UsuarioDetalleAdmin | null>(null);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);
	const [actionLoading, setActionLoading] = React.useState(false);

	// DNI Viewer state
	const [dniBlobUrl, setDniBlobUrl] = React.useState<string | null>(null);
	const [dniLoading, setDniLoading] = React.useState(false);
	const [dniError, setDniError] = React.useState(false);
	const [dniViewerOpen, setDniViewerOpen] = React.useState(false);

	// Moderation dialog state
	const [moderationDialogOpen, setModerationDialogOpen] = React.useState(false);
	const [selectedCategories, setSelectedCategories] = React.useState<number[]>([]);

	const cargarUsuario = React.useCallback(async () => {
		if (!usuarioId) return;
		setLoading(true);
		setError(null);
		try {
			const res = await obtenerUsuarioAdmin(usuarioId);
			setUsuario(res.data);
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'No se pudo cargar la información del usuario.';
			setError(msg);
			notify.error(msg, { scope: 'admin-usuario-detalle' });
		} finally {
			setLoading(false);
		}
	}, [usuarioId]);

	React.useEffect(() => {
		void cargarUsuario();
	}, [cargarUsuario]);

	// Fetch authenticated DNI photo
	React.useEffect(() => {
		let active = true;
		let blobUrl: string | null = null;

		if (usuario?.fotoDniUrl) {
			setDniLoading(true);
			setDniError(false);
			apiFetchBlob(usuario.fotoDniUrl)
				.then((blob) => {
					if (!active) return;
					blobUrl = URL.createObjectURL(blob);
					setDniBlobUrl(blobUrl);
				})
				.catch(() => {
					if (active) setDniError(true);
				})
				.finally(() => {
					if (active) setDniLoading(false);
				});
		} else {
			setDniBlobUrl(null);
			setDniLoading(false);
			setDniError(false);
		}

		return () => {
			active = false;
			if (blobUrl) {
				URL.revokeObjectURL(blobUrl);
			}
		};
	}, [usuario?.fotoDniUrl]);

	const handleStateChange = async () => {
		if (!usuario) return;

		const activating = usuario.estado === 'I';
		const confirmed = await dialogs.confirm(
			activating
				? `¿Querés reactivar a ${usuario.nombre} ${usuario.apellido}?`
				: `¿Querés dar de baja a ${usuario.nombre} ${usuario.apellido}?`,
			{
				title: activating ? 'Reactivar usuario' : 'Dar de baja al usuario',
				okText: activating ? 'Reactivar' : 'Dar de baja',
				cancelText: 'Cancelar',
				severity: activating ? 'success' : 'error',
			},
		);

		if (!confirmed) return;

		setActionLoading(true);
		try {
			const result = await cambiarEstadoUsuarioAdmin(usuario.id, activating ? 'A' : 'I');
			setUsuario(result.data);
			notify.success(activating ? 'Usuario activado.' : 'Usuario dado de baja.', {
				scope: 'admin-usuario-detalle',
			});
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'No se pudo actualizar el estado.';
			notify.error(errMsg, { scope: 'admin-usuario-detalle' });
		} finally {
			setActionLoading(false);
		}
	};

	const openModerationDialog = () => {
		if (!usuario) return;
		setSelectedCategories(
			usuario.categoriasModeracion.filter((categoria) => categoria.asignada).map((categoria) => categoria.id),
		);
		setModerationDialogOpen(true);
	};

	const saveModeration = async () => {
		if (!usuario || (usuario.rol !== 'MODERADOR' && selectedCategories.length === 0)) return;

		setActionLoading(true);
		try {
			const result = await asignarModeradorAdmin(usuario.id, selectedCategories);
			setUsuario(result.data);
			setModerationDialogOpen(false);
			notify.success(
				selectedCategories.length === 0
					? 'Se quitaron las categorías y el usuario volvió al rol Usuario.'
					: 'Rol y categorías de moderación actualizados.',
				{ scope: 'admin-usuario-detalle' },
			);
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'No se pudo asignar la moderación.';
			notify.error(errMsg, { scope: 'admin-usuario-detalle' });
		} finally {
			setActionLoading(false);
		}
	};

	const selectAllCategories = () => {
		setSelectedCategories(usuario?.categoriasModeracion.map((categoria) => categoria.id) ?? []);
	};

	const allCategoriesSelected =
		(usuario?.categoriasModeracion.length ?? 0) > 0 &&
		usuario!.categoriasModeracion.every((categoria) => selectedCategories.includes(categoria.id));

	const isOwnProfile = usuario !== null && currentUser?.idUsuario === usuario.id;
	const canChangeUserState =
		usuario !== null &&
		!isOwnProfile &&
		usuario.rol !== 'ADMIN' &&
		(currentUser?.rol === 'ADMIN' || usuario.rol === 'USUARIO');
	const canEditModeration =
		usuario !== null && currentUser?.rol === 'ADMIN' && !isOwnProfile && usuario.rol !== 'ADMIN';

	if (loading) {
		return (
			<PageContainer title="Detalle de usuario" maxWidth="lg">
				<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
					<CircularProgress />
				</Box>
			</PageContainer>
		);
	}

	if (error || !usuario) {
		return (
			<PageContainer title="Detalle de usuario" maxWidth="lg">
				<Stack spacing={2}>
					<Button
						startIcon={<ArrowBackIcon />}
						onClick={() => navigate('/usuarios')}
						sx={{ alignSelf: 'flex-start' }}
					>
						Volver a usuarios
					</Button>
					<Alert severity="error">{error || 'No se encontró el usuario solicitado.'}</Alert>
				</Stack>
			</PageContainer>
		);
	}

	const avatarUrl = getUserAvatarUrl({
		idUsuario: usuario.id,
		nombre: usuario.nombre,
		apellido: usuario.apellido,
		email: usuario.email,
		genero: usuario.genero,
		avatarEstilo: usuario.avatarEstilo,
		avatarSeed: usuario.avatarSeed,
	});

	const edad = calcularEdad(usuario.fechaNacimiento);
	const categoriasAsignadas = usuario.categoriasModeracion.filter((c) => c.asignada);

	return (
		<PageContainer title={`${usuario.nombre} ${usuario.apellido}`} maxWidth="lg">
			<Stack spacing={3}>
				{/* Top Bar Actions */}
				<Stack
					direction={{ xs: 'column', sm: 'row' }}
					spacing={1}
					justifyContent="space-between"
					alignItems={{ sm: 'center' }}
				>
					<Button
						startIcon={<ArrowBackIcon />}
						onClick={() => navigate('/usuarios')}
						sx={{ alignSelf: 'flex-start' }}
						variant="text"
					>
						Volver a usuarios
					</Button>
					{(canEditModeration || canChangeUserState) && (
						<Stack direction="row" spacing={1} flexWrap="wrap">
							{canEditModeration && usuario.estado !== 'I' && (
								<Button
									variant="contained"
									startIcon={<ManageAccountsIcon />}
									onClick={openModerationDialog}
									disabled={actionLoading}
									size="medium"
								>
									{usuario.rol === 'MODERADOR' ? 'Editar categorías' : 'Asignar moderador'}
								</Button>
							)}
							{canChangeUserState && (
								<Button
									variant={usuario.estado === 'I' ? 'contained' : 'outlined'}
									color={usuario.estado === 'I' ? 'success' : 'error'}
									startIcon={usuario.estado === 'I' ? <HowToRegIcon /> : <BlockIcon />}
									onClick={handleStateChange}
									disabled={actionLoading}
									size="medium"
								>
									{usuario.estado === 'I' ? 'Reactivar usuario' : 'Dar de baja'}
								</Button>
							)}
						</Stack>
					)}
				</Stack>

				{/* Hero Overview Card */}
				<Paper
					variant="outlined"
					sx={{
						p: { xs: 2.5, sm: 3.5 },
						borderRadius: 3,
						borderColor: 'divider',
						background: (theme) =>
							theme.palette.mode === 'dark'
								? 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)'
								: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
						boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
					}}
				>
					<Stack
						direction={{ xs: 'column', sm: 'row' }}
						spacing={{ xs: 2.5, sm: 3.5 }}
						alignItems={{ sm: 'center' }}
					>
						<Avatar
							src={avatarUrl}
							alt={`${usuario.nombre} ${usuario.apellido}`}
							sx={{
								width: { xs: 80, sm: 100 },
								height: { xs: 80, sm: 100 },
								boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
								border: '3px solid',
								borderColor: 'primary.light',
								alignSelf: { xs: 'center', sm: 'auto' },
							}}
						/>
						<Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
							<Stack
								direction="row"
								spacing={1.5}
								alignItems="center"
								justifyContent={{ xs: 'center', sm: 'flex-start' }}
								flexWrap="wrap"
								sx={{ mb: 1 }}
							>
								<Typography variant="h5" component="h1" fontWeight={700}>
									{`${usuario.nombre} ${usuario.apellido}`}
								</Typography>
								<Chip
									label={usuario.rol}
									color={roleColors[usuario.rol]}
									size="small"
									sx={{ fontWeight: 600 }}
								/>
								<Chip
									label={stateLabels[usuario.estado]}
									color={stateColors[usuario.estado]}
									size="small"
								/>
							</Stack>
							<Typography
								variant="body1"
								color="text.secondary"
								sx={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: { xs: 'center', sm: 'flex-start' },
									gap: 0.75,
									mb: 0.5,
								}}
							>
								<EmailOutlinedIcon fontSize="small" color="action" />
								{usuario.email}
							</Typography>
							<Typography variant="caption" color="text.secondary">
								ID #{usuario.id} · Registrado el {formatDateTime(usuario.fechaRegistro)}
							</Typography>
						</Box>
					</Stack>
				</Paper>

				{/* 2-Column Details: Personal Info & DNI Photo */}
				<Grid container spacing={3}>
					{/* Personal Information */}
					<Grid size={{ xs: 12, md: 7 }}>
						<SectionPaper title="Información Personal y Registro" icon={<PersonOutlineIcon />}>
							<Grid container spacing={2}>
								<Grid size={{ xs: 12, sm: 6 }}>
									<InfoItem icon={<BadgeOutlinedIcon />} label="CUIL" value={usuario.cuil} />
								</Grid>
								<Grid size={{ xs: 12, sm: 6 }}>
									<InfoItem
										icon={<WcOutlinedIcon />}
										label="Género"
										value={getGeneroEtiqueta(usuario.genero)}
									/>
								</Grid>
								<Grid size={{ xs: 12, sm: 6 }}>
									<InfoItem
										icon={<CakeOutlinedIcon />}
										label="Fecha de nacimiento"
										value={
											edad !== null
												? `${formatDate(usuario.fechaNacimiento)} (${edad} años)`
												: formatDate(usuario.fechaNacimiento)
										}
									/>
								</Grid>
								<Grid size={{ xs: 12, sm: 6 }}>
									<InfoItem
										icon={<FlagOutlinedIcon />}
										label="Nacionalidad"
										value={usuario.nacionalidad}
									/>
								</Grid>
								<Grid size={{ xs: 12 }}>
									<Divider sx={{ my: 0.5 }} />
								</Grid>
								<Grid size={{ xs: 12 }}>
									<InfoItem
										icon={<WorkOutlineIcon />}
										label="Actividad ARCA"
										value={
											usuario.actividadArcaCodigo ? (
												<Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
													<Chip
														label={usuario.actividadArcaCodigo}
														size="small"
														variant="outlined"
													/>
													<Typography variant="body2">
														{usuario.actividadArca ?? '—'}
													</Typography>
												</Stack>
											) : (
												'Sin actividad ARCA declarada'
											)
										}
									/>
								</Grid>
								<Grid size={{ xs: 12 }}>
									<InfoItem
										icon={<CalendarTodayOutlinedIcon />}
										label="Fecha de registro"
										value={formatDateTime(usuario.fechaRegistro)}
									/>
								</Grid>
							</Grid>

							{/* Moderation section if user is MODERATOR */}
							{usuario.rol === 'MODERADOR' && (
								<Box sx={{ mt: 3, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
									<Typography
										variant="subtitle2"
										fontWeight={700}
										sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}
									>
										<ManageAccountsIcon fontSize="small" color="primary" />
										Categorías de moderación asignadas ({categoriasAsignadas.length})
									</Typography>
									{categoriasAsignadas.length > 0 ? (
										<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
											{categoriasAsignadas.map((cat) => (
												<Chip
													key={cat.id}
													icon={
														<CategoryIcon
															icono={cat.icono}
															sx={{ fontSize: '1rem !important' }}
														/>
													}
													label={cat.nombre}
													variant="filled"
													color="primary"
													size="small"
													sx={{ py: 0.5 }}
												/>
											))}
										</Stack>
									) : (
										<Typography variant="body2" color="text.secondary">
											Este moderador no tiene categorías asignadas actualmente.
										</Typography>
									)}
								</Box>
							)}
						</SectionPaper>
					</Grid>

					{/* DNI Document Photo */}
					<Grid size={{ xs: 12, md: 5 }}>
						<SectionPaper
							title="Documento de Identidad (DNI)"
							icon={<ContactPageOutlinedIcon />}
							badge={
								usuario.fotoDniUrl ? (
									<Chip label="Adjunto" color="success" size="small" variant="outlined" />
								) : (
									<Chip label="No cargado" color="default" size="small" variant="outlined" />
								)
							}
						>
							{dniLoading && (
								<Box
									sx={{
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										justifyContent: 'center',
										p: 4,
										minHeight: 220,
									}}
								>
									<CircularProgress size={36} sx={{ mb: 1.5 }} />
									<Typography variant="caption" color="text.secondary">
										Cargando imagen del DNI…
									</Typography>
								</Box>
							)}

							{!dniLoading && dniBlobUrl && (
								<Stack spacing={2} alignItems="center">
									<Box
										onClick={() => setDniViewerOpen(true)}
										sx={{
											position: 'relative',
											width: '100%',
											height: { xs: 200, sm: 240 },
											borderRadius: 2,
											overflow: 'hidden',
											border: '1px solid',
											borderColor: 'divider',
											cursor: 'pointer',
											bgcolor: 'background.default',
											'&:hover .dni-hover-overlay': {
												opacity: 1,
											},
										}}
									>
										<Box
											component="img"
											src={dniBlobUrl}
											alt={`DNI de ${usuario.nombre} ${usuario.apellido}`}
											sx={{
												width: '100%',
												height: '100%',
												objectFit: 'contain',
												p: 1,
											}}
										/>
										<Box
											className="dni-hover-overlay"
											sx={{
												position: 'absolute',
												inset: 0,
												bgcolor: 'rgba(0, 0, 0, 0.45)',
												color: '#ffffff',
												display: 'flex',
												flexDirection: 'column',
												alignItems: 'center',
												justifyContent: 'center',
												opacity: 0,
												transition: 'opacity 0.2s ease-in-out',
												gap: 0.5,
											}}
										>
											<ZoomInIcon sx={{ fontSize: 36 }} />
											<Typography variant="body2" fontWeight={600}>
												Hacé clic para ampliar
											</Typography>
										</Box>
									</Box>

									<Stack direction="row" spacing={1} sx={{ width: '100%' }}>
										<Button
											variant="outlined"
											startIcon={<VisibilityOutlinedIcon />}
											onClick={() => setDniViewerOpen(true)}
											fullWidth
											size="small"
										>
											Ver ampliado
										</Button>
										<Button
											variant="outlined"
											startIcon={<DownloadIcon />}
											href={dniBlobUrl}
											download={`dni_${usuario.cuil || usuario.id}.jpg`}
											size="small"
											sx={{ minWidth: 42, px: 1.5 }}
										>
											Descargar
										</Button>
									</Stack>
								</Stack>
							)}

							{!dniLoading && dniError && (
								<Alert severity="warning" sx={{ mt: 1 }}>
									No se pudo cargar la imagen del documento de identidad.
								</Alert>
							)}

							{!dniLoading && !usuario.fotoDniUrl && (
								<Box
									sx={{
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										justifyContent: 'center',
										py: 5,
										px: 2,
										textAlign: 'center',
										bgcolor: 'action.hover',
										borderRadius: 2,
										border: '1px dashed',
										borderColor: 'divider',
									}}
								>
									<ContactPageOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
									<Typography variant="body2" fontWeight={600} color="text.secondary">
										Sin foto de DNI adjunta
									</Typography>
									<Typography
										variant="caption"
										color="text.secondary"
										sx={{ mt: 0.5, maxWidth: 260 }}
									>
										El usuario no cargó una fotografía o imagen de su documento de identidad.
									</Typography>
								</Box>
							)}
						</SectionPaper>
					</Grid>
				</Grid>

				{/* Cultural Actors (Integrations) Section */}
				<SectionPaper
					title="Actores culturales a los que pertenece"
					icon={<GroupsOutlinedIcon />}
					badge={
						<Chip
							label={usuario.actores?.length ?? 0}
							color={usuario.actores?.length ? 'primary' : 'default'}
							size="small"
						/>
					}
				>
					{usuario.actores && usuario.actores.length > 0 ? (
						<Grid container spacing={2.5}>
							{usuario.actores.map((actor: UsuarioActorAdmin) => {
								const slug = buildSlugConId(actor.id, actor.nombre);
								return (
									<Grid size={{ xs: 12, sm: 6, md: 4 }} key={actor.id}>
										<Card
											variant="outlined"
											sx={{
												height: '100%',
												display: 'flex',
												flexDirection: 'column',
												borderRadius: 2,
												transition: 'transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
												'&:hover': {
													transform: 'translateY(-2px)',
													boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
												},
											}}
										>
											<CardContent sx={{ flexGrow: 1, p: 2.25 }}>
												<Stack
													direction="row"
													spacing={1.5}
													alignItems="center"
													sx={{ mb: 1.5 }}
												>
													<Avatar
														src={actor.foto ?? undefined}
														alt={actor.nombre}
														sx={{
															width: 44,
															height: 44,
															bgcolor: 'primary.light',
															color: 'primary.contrastText',
															fontWeight: 700,
														}}
													>
														{!actor.foto && <CategoryIcon icono={actor.categoria.icono} />}
													</Avatar>
													<Box sx={{ minWidth: 0, flexGrow: 1 }}>
														<Typography
															variant="subtitle1"
															fontWeight={700}
															noWrap
															title={actor.nombre}
															sx={{
																cursor: 'pointer',
																'&:hover': { color: 'primary.main' },
															}}
															onClick={() => navigate(`/actoresAdmin/${slug}`)}
														>
															{actor.nombre}
														</Typography>
														<Typography
															variant="caption"
															color="text.secondary"
															noWrap
															sx={{ display: 'block' }}
														>
															{typeLabels[actor.tipoActor]}
														</Typography>
													</Box>
												</Stack>

												<Stack
													direction="row"
													spacing={0.75}
													flexWrap="wrap"
													useFlexGap
													sx={{ mb: 1.5 }}
												>
													{actor.esDueno ? (
														<Chip
															icon={<StarIcon sx={{ fontSize: '0.9rem !important' }} />}
															label="Dueño / Titular"
															size="small"
															color="primary"
															variant="filled"
														/>
													) : (
														<Chip
															label={actor.rolEnActor || 'Integrante'}
															size="small"
															variant="outlined"
														/>
													)}
													<Chip
														label={stateLabels[actor.estado]}
														color={stateColors[actor.estado]}
														size="small"
													/>
												</Stack>

												<Stack spacing={0.75} sx={{ mb: 1.5 }}>
													<Typography
														variant="caption"
														color="text.secondary"
														sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
													>
														<CategoryIcon
															icono={actor.categoria.icono}
															sx={{ fontSize: 15 }}
														/>
														{actor.categoria.nombre}
														{actor.subcategoria?.nombre
															? ` › ${actor.subcategoria.nombre}`
															: ''}
													</Typography>
													<Typography
														variant="caption"
														color="text.secondary"
														sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
													>
														<LocationOnOutlinedIcon sx={{ fontSize: 15 }} />
														{actor.ubicacion.localidad}, {actor.ubicacion.departamento}
													</Typography>
												</Stack>

												{actor.descripcion && (
													<Typography
														variant="caption"
														color="text.secondary"
														sx={{
															display: '-webkit-box',
															WebkitLineClamp: 2,
															WebkitBoxOrient: 'vertical',
															overflow: 'hidden',
															mb: 1,
														}}
													>
														{actor.descripcion}
													</Typography>
												)}
											</CardContent>

											<Divider />
											<Box
												sx={{
													p: 1.25,
													display: 'flex',
													justifyContent: 'space-between',
													alignItems: 'center',
													bgcolor: 'action.hover',
												}}
											>
												<Button
													size="small"
													variant="text"
													onClick={() => navigate(`/actoresAdmin/${slug}`)}
												>
													Administrar actor
												</Button>
												<Tooltip title="Ver perfil público">
													<IconButton
														size="small"
														onClick={() =>
															window.open(
																`/actores/${slug}`,
																'_blank',
																'noopener,noreferrer',
															)
														}
													>
														<OpenInNewIcon fontSize="small" />
													</IconButton>
												</Tooltip>
											</Box>
										</Card>
									</Grid>
								);
							})}
						</Grid>
					) : (
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center',
								py: 5,
								px: 2,
								textAlign: 'center',
								bgcolor: 'action.hover',
								borderRadius: 2,
								border: '1px dashed',
								borderColor: 'divider',
							}}
						>
							<GroupsOutlinedIcon sx={{ fontSize: 52, color: 'text.disabled', mb: 1 }} />
							<Typography variant="body1" fontWeight={600} color="text.secondary">
								Sin agrupaciones ni actores culturales
							</Typography>
							<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 360 }}>
								Este usuario no integra ningún colectivo, espacio cultural o agrupación registrada en la
								plataforma.
							</Typography>
						</Box>
					)}
				</SectionPaper>
			</Stack>

			{/* DNI Zoom Viewer Dialog */}
			<Dialog
				open={dniViewerOpen}
				onClose={() => setDniViewerOpen(false)}
				maxWidth="md"
				fullWidth
				aria-labelledby="dni-dialog-title"
			>
				<DialogTitle
					id="dni-dialog-title"
					sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
				>
					<Typography variant="h6" fontWeight={700}>
						Documento de Identidad · {usuario.nombre} {usuario.apellido}
					</Typography>
					<IconButton onClick={() => setDniViewerOpen(false)} size="small">
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent
					dividers
					sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#121212' }}
				>
					{dniBlobUrl && (
						<Box
							component="img"
							src={dniBlobUrl}
							alt={`DNI de ${usuario.nombre} ${usuario.apellido}`}
							sx={{
								maxWidth: '100%',
								maxHeight: '75vh',
								objectFit: 'contain',
								borderRadius: 1,
							}}
						/>
					)}
				</DialogContent>
				<DialogActions sx={{ px: 2.5, py: 1.5 }}>
					{dniBlobUrl && (
						<Button
							startIcon={<DownloadIcon />}
							href={dniBlobUrl}
							download={`dni_${usuario.cuil || usuario.id}.jpg`}
						>
							Descargar imagen
						</Button>
					)}
					<Button onClick={() => setDniViewerOpen(false)} variant="contained">
						Cerrar
					</Button>
				</DialogActions>
			</Dialog>

			{/* Moderation Assignment Dialog */}
			<Dialog open={moderationDialogOpen} onClose={() => setModerationDialogOpen(false)} fullWidth maxWidth="sm">
				<DialogTitle>
					{usuario?.rol === 'MODERADOR' ? 'Editar categorías moderadas' : 'Asignar como moderador'}
				</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ mb: 2 }}>
						Seleccioná las categorías activas que podrá moderar. Si quitás todas las categorías a un
						moderador, volverá a tener el rol Usuario.
					</DialogContentText>
					<Button
						variant="outlined"
						startIcon={<SelectAllIcon />}
						onClick={selectAllCategories}
						disabled={actionLoading || allCategoriesSelected || !usuario?.categoriasModeracion.length}
						sx={{ mb: 2 }}
					>
						{allCategoriesSelected ? 'Todas seleccionadas' : 'Moderar todas las categorías'}
					</Button>
					<FormControl fullWidth>
						<InputLabel id="moderation-categories-label">Categorías</InputLabel>
						<Select
							labelId="moderation-categories-label"
							multiple
							value={selectedCategories}
							label="Categorías"
							onChange={(event) => setSelectedCategories(event.target.value as number[])}
							renderValue={(selected) =>
								usuario?.categoriasModeracion
									.filter((categoria) => selected.includes(categoria.id))
									.map((categoria) => categoria.nombre)
									.join(', ') ?? ''
							}
						>
							{usuario?.categoriasModeracion.map((categoria) => (
								<MenuItem key={categoria.id} value={categoria.id}>
									<Checkbox checked={selectedCategories.includes(categoria.id)} />
									<ListItemText primary={categoria.nombre} />
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setModerationDialogOpen(false)} disabled={actionLoading}>
						Cancelar
					</Button>
					<Button
						variant="contained"
						onClick={saveModeration}
						disabled={actionLoading || (usuario?.rol !== 'MODERADOR' && selectedCategories.length === 0)}
					>
						Guardar
					</Button>
				</DialogActions>
			</Dialog>
		</PageContainer>
	);
}
