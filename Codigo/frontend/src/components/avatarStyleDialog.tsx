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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaletteIcon from '@mui/icons-material/Palette';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import {
	AVATAR_STYLE_LIST,
	type AvatarStyleKey,
	type UserForAvatar,
	getUserAvatarUrl,
	getSavedAvatarStyle,
	getDefaultAvatarStyle,
	saveAvatarStyle,
} from '../utils/avatar';
import { notify } from '../utils/toast';

interface AvatarStyleDialogProps {
	open: boolean;
	onClose: () => void;
	user?: UserForAvatar | null;
	onStyleSaved?: (style: AvatarStyleKey) => void;
}

export const AvatarStyleDialog: React.FC<AvatarStyleDialogProps> = ({
	open,
	onClose,
	user,
	onStyleSaved,
}) => {
	const currentSaved = user
		? getSavedAvatarStyle(user.idUsuario) || getDefaultAvatarStyle(user.genero)
		: 'botttsNeutral';

	const [selectedStyle, setSelectedStyle] = useState<AvatarStyleKey>(currentSaved);

	useEffect(() => {
		if (open) {
			const active = user
				? getSavedAvatarStyle(user.idUsuario) || getDefaultAvatarStyle(user.genero)
				: 'botttsNeutral';
			setSelectedStyle(active);
		}
	}, [open, user]);

	if (!user) return null;

	const handleSave = () => {
		saveAvatarStyle(selectedStyle, user.idUsuario);
		notify.success('¡Estilo de avatar actualizado con éxito!', { scope: 'avatar' });
		if (onStyleSaved) {
			onStyleSaved(selectedStyle);
		}
		onClose();
	};

	const handleResetDefault = () => {
		const defaultStyle = getDefaultAvatarStyle(user.genero);
		setSelectedStyle(defaultStyle);
	};

	const previewAvatarUrl = getUserAvatarUrl(user, selectedStyle);

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
							Elegí la estética ilustrada que más te represente. Generado de forma local y 100% privada.
						</Typography>
					</Box>
				</Stack>
				<IconButton onClick={onClose} size="small" aria-label="cerrar">
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			<DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
				{/* Vista previa en vivo */}
				<Box
					sx={{
						p: 2.5,
						mb: 3,
						borderRadius: 2,
						bgcolor: 'action.hover',
						border: '1px dashed',
						borderColor: 'divider',
						textAlign: 'center',
					}}
				>
					<Stack spacing={1.5} alignItems="center">
						<Avatar
							src={previewAvatarUrl}
							alt={`${user.nombre} ${user.apellido}`}
							sx={{
								width: 96,
								height: 96,
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
						<Box>
							<Typography variant="subtitle1" fontWeight={700}>
								{user.nombre} {user.apellido}
							</Typography>
							<Typography variant="caption" color="text.secondary">
								Vista previa en tiempo real
							</Typography>
						</Box>
					</Stack>
				</Box>

				{/* Galería de estilos */}
				<Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
					Colecciones disponibles
				</Typography>

				<Grid container spacing={2}>
					{AVATAR_STYLE_LIST.map((style) => {
						const isSelected = selectedStyle === style.key;
						const styleThumbnailUrl = getUserAvatarUrl(user, style.key);

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
					sx={{ textTransform: 'none' }}
				>
					Restablecer sugerido
				</Button>

				<Stack direction="row" spacing={1}>
					<Button onClick={onClose} color="inherit" sx={{ textTransform: 'none' }}>
						Cancelar
					</Button>
					<Button
						variant="contained"
						color="primary"
						onClick={handleSave}
						sx={{ textTransform: 'none', px: 3, fontWeight: 700 }}
					>
						Guardar avatar
					</Button>
				</Stack>
			</DialogActions>
		</Dialog>
	);
};
