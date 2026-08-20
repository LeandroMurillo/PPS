import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Stack,
	Typography,
	Grid,
	Card,
	CardActionArea,
	CardContent,
	Avatar,
	Box,
	IconButton,
	TextField,
	InputAdornment,
	CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaletteIcon from '@mui/icons-material/Palette';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import {
	AVATAR_STYLE_LIST,
	type AvatarStyleKey,
	type UserForAvatar,
	getUserAvatarUrl,
	getSavedAvatarStyle,
	getDefaultAvatarStyle,
	saveAvatarStyle,
	generateRandomSeed,
} from '../utils/avatar';
import { actualizarPerfilUsuarioApi, type PerfilUsuarioData } from '../api/usuario';
import { useAuth } from '../context/AuthContext';
import { notify } from '../utils/toast';

interface AvatarStyleDialogProps {
	open: boolean;
	onClose: () => void;
	user?: (UserForAvatar & Partial<PerfilUsuarioData>) | null;
	onStyleSaved?: (style: AvatarStyleKey, seed: string | null) => void;
}

export const AvatarStyleDialog: React.FC<AvatarStyleDialogProps> = ({ open, onClose, user, onStyleSaved }) => {
	const { updateUser } = useAuth();

	const initialStyle = user
		? (user.avatarEstilo as AvatarStyleKey) ||
			getSavedAvatarStyle(user.idUsuario) ||
			getDefaultAvatarStyle(user.genero)
		: 'botttsNeutral';

	const [selectedStyle, setSelectedStyle] = useState<AvatarStyleKey>(initialStyle);
	const [customSeed, setCustomSeed] = useState<string>(user?.avatarSeed || '');
	const [saving, setSaving] = useState<boolean>(false);

	useEffect(() => {
		if (open && user) {
			const activeStyle =
				(user.avatarEstilo as AvatarStyleKey) ||
				getSavedAvatarStyle(user.idUsuario) ||
				getDefaultAvatarStyle(user.genero);
			setSelectedStyle(activeStyle);
			setCustomSeed(user.avatarSeed || '');
		}
	}, [open, user]);

	if (!user) return null;

	const handleRandomSeed = () => {
		const newSeed = generateRandomSeed();
		setCustomSeed(newSeed);
	};

	const handleResetSeed = () => {
		setCustomSeed('');
	};

	const handleResetDefault = () => {
		const defaultStyle = getDefaultAvatarStyle(user.genero);
		setSelectedStyle(defaultStyle);
		setCustomSeed('');
	};

	const handleSave = async () => {
		setSaving(true);
		const seedToSave = customSeed.trim() || null;

		try {
			// Si contamos con los datos de perfil, guardamos en la base de datos a través de la API
			if (user.nombre && user.apellido && user.genero && user.fechaNacimiento && user.CUIL) {
				const res = await actualizarPerfilUsuarioApi({
					nombre: user.nombre,
					apellido: user.apellido,
					genero: user.genero,
					fechaNacimiento: user.fechaNacimiento,
					nacionalidad: user.nacionalidad || 'Argentina',
					CUIL: user.CUIL,
					actividadesArcaCodigo: user.actividadesArcaCodigo,
					avatarEstilo: selectedStyle,
					avatarSeed: seedToSave,
				});

				updateUser(res.data);
			} else {
				updateUser({
					avatarEstilo: selectedStyle,
					avatarSeed: seedToSave,
				});
			}

			saveAvatarStyle(selectedStyle, user.idUsuario);
			notify.success('¡Avatar guardado exitosamente en tu perfil!', { scope: 'avatar' });

			if (onStyleSaved) {
				onStyleSaved(selectedStyle, seedToSave);
			}

			onClose();
		} catch (error) {
			console.error('Error al guardar avatar en el backend:', error);
			// Fallback local
			updateUser({
				avatarEstilo: selectedStyle,
				avatarSeed: seedToSave,
			});
			saveAvatarStyle(selectedStyle, user.idUsuario);
			notify.warning('Avatar aplicado localmente (no se pudo sincronizar con el servidor).', { scope: 'avatar' });
			if (onStyleSaved) {
				onStyleSaved(selectedStyle, seedToSave);
			}
			onClose();
		} finally {
			setSaving(false);
		}
	};

	const previewAvatarUrl = getUserAvatarUrl(user, selectedStyle, customSeed);

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="md"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: 3,
					overflow: 'hidden',
				},
			}}
		>
			<DialogTitle
				sx={{
					m: 0,
					p: 2.5,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					bgcolor: 'background.default',
					borderBottom: '1px solid',
					borderColor: 'divider',
				}}
			>
				<Stack direction="row" spacing={1.5} alignItems="center">
					<PaletteIcon color="primary" />
					<Box>
						<Typography variant="h6" fontWeight={700} component="div">
							Personalizar estilo de avatar
						</Typography>
						<Typography variant="caption" color="text.secondary">
							Elegí la estética ilustrada que más te represente.
						</Typography>
					</Box>
				</Stack>
				<IconButton onClick={onClose} size="small" aria-label="cerrar" disabled={saving}>
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			<DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
				{/* Vista previa en vivo y control de Semilla */}
				<Box
					sx={{
						p: 2.5,
						my: 3,
						borderRadius: 2,
						bgcolor: 'action.hover',
						border: '1px dashed',
						borderColor: 'divider',
					}}
				>
					<Grid container spacing={3} alignItems="center">
						<Grid size={{ xs: 12, sm: 'auto' }} sx={{ display: 'flex', justifyContent: 'center' }}>
							<Avatar
								src={previewAvatarUrl}
								alt={`${user.nombre} ${user.apellido}`}
								sx={{
									width: 100,
									height: 100,
									boxShadow: 3,
									border: '3px solid',
									borderColor: 'primary.main',
									transition: 'transform 0.2s ease',
									'&:hover': {
										transform: 'scale(1.05)',
									},
								}}
							>
								{user.nombre?.charAt(0)}
							</Avatar>
						</Grid>

						<Grid size={{ xs: 12, sm: 'grow' }}>
							<Stack spacing={1.5}>
								<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
									<TextField
										size="small"
										fullWidth
										placeholder="Dejá vacío para usar el avatar por defecto"
										label="Personaliza el avatar"
										value={customSeed}
										onChange={(e) => setCustomSeed(e.target.value)}
										InputProps={{
											endAdornment: customSeed ? (
												<InputAdornment position="end">
													<Button
														size="small"
														onClick={handleResetSeed}
														sx={{ textTransform: 'none', fontSize: '0.75rem', p: 0.2 }}
													>
														Limpiar
													</Button>
												</InputAdornment>
											) : null,
										}}
									/>
									<Button
										variant="outlined"
										size="medium"
										startIcon={<AutoAwesomeIcon />}
										onClick={handleRandomSeed}
										sx={{ textTransform: 'none', minWidth: 150, whiteSpace: 'nowrap' }}
									>
										Aleatorio
									</Button>
								</Stack>
							</Stack>
						</Grid>
					</Grid>
				</Box>

				{/* Galería de estilos */}
				<Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
					Colecciones de diseño disponibles
				</Typography>

				<Grid container spacing={2}>
					{AVATAR_STYLE_LIST.map((style) => {
						const isSelected = selectedStyle === style.key;
						const styleThumbnailUrl = getUserAvatarUrl(user, style.key, customSeed);

						return (
							<Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={style.key}>
								<Card
									variant="outlined"
									sx={{
										height: '100%',
										position: 'relative',
										borderRadius: 2,
										borderColor: isSelected ? 'primary.main' : 'divider',
										borderWidth: isSelected ? 2 : 1,
										bgcolor: isSelected ? 'primary.50' : 'background.paper',
										transition: 'all 0.2s ease',
										transform: isSelected ? 'translateY(-2px)' : 'none',
										boxShadow: isSelected ? 2 : 0,
										'&:hover': {
											borderColor: 'primary.light',
											transform: 'translateY(-2px)',
										},
									}}
								>
									{isSelected && (
										<Box
											sx={{
												position: 'absolute',
												top: 6,
												right: 6,
												zIndex: 1,
												color: 'primary.main',
												display: 'flex',
											}}
										>
											<CheckCircleIcon sx={{ fontSize: 18 }} />
										</Box>
									)}
									<CardActionArea
										onClick={() => setSelectedStyle(style.key)}
										sx={{ p: 1.5, height: '100%', textAlign: 'center' }}
									>
										<CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
											<Avatar
												src={styleThumbnailUrl}
												alt={style.label}
												sx={{
													width: 56,
													height: 56,
													mx: 'auto',
													mb: 1,
													boxShadow: 1,
												}}
											/>
											<Typography variant="subtitle2" fontWeight={700} noWrap>
												{style.label}
											</Typography>
											<Typography
												variant="caption"
												color="text.secondary"
												sx={{
													display: '-webkit-box',
													WebkitLineClamp: 2,
													WebkitBoxOrient: 'vertical',
													overflow: 'hidden',
													fontSize: '0.7rem',
													lineHeight: 1.2,
													mt: 0.5,
												}}
											>
												{style.description}
											</Typography>
										</CardContent>
									</CardActionArea>
								</Card>
							</Grid>
						);
					})}
				</Grid>
			</DialogContent>

			<DialogActions
				sx={{
					p: 2,
					px: 3,
					bgcolor: 'background.default',
					borderTop: '1px solid',
					borderColor: 'divider',
					justifyContent: 'space-between',
				}}
			>
				<Button
					startIcon={<RestartAltIcon />}
					onClick={handleResetDefault}
					color="inherit"
					size="small"
					disabled={saving}
					sx={{ textTransform: 'none' }}
				>
					Restablecer por defecto
				</Button>

				<Stack direction="row" spacing={1}>
					<Button onClick={onClose} color="inherit" disabled={saving} sx={{ textTransform: 'none' }}>
						Cancelar
					</Button>
					<Button
						variant="contained"
						color="primary"
						onClick={handleSave}
						disabled={saving}
						startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
						sx={{ textTransform: 'none', px: 3, fontWeight: 700 }}
					>
						{saving ? 'Guardando…' : 'Guardar avatar'}
					</Button>
				</Stack>
			</DialogActions>
		</Dialog>
	);
};
