import * as React from 'react';
import {
	Alert,
	Box,
	Button,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	FormControl,
	Grid,
	IconButton,
	InputLabel,
	Link as MuiLink,
	MenuItem,
	Paper,
	Select,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import InstagramIcon from '@mui/icons-material/Instagram';
import LanguageIcon from '@mui/icons-material/Language';

import { agregarItemPortafolioApi, eliminarItemPortafolioApi, listarPortafolioApi } from '../api/actores';
import { fileToBase64, validateImageFile } from '../utils/file';
import { normalizarUrl } from '../utils/links';
import { notify } from '../utils/toast';
import type { MyActor, MyActorPortfolioItem } from '../pages/misActores';

const MAX_PORTFOLIO_IMAGES = 10;
const MAX_IMAGE_MB = 5;

type Props = {
	open: boolean;
	actor: MyActor | null;
	onClose: () => void;
	onPortfolioChange?: (actorId: number, portafolio: MyActorPortfolioItem[]) => void;
};

export default function ActorPortfolioDialog({ open, actor, onClose, onPortfolioChange }: Props) {
	const [items, setItems] = React.useState<MyActorPortfolioItem[]>([]);
	const [tipo, setTipo] = React.useState<'IMAGEN' | 'LINK' | 'RRSS'>('IMAGEN');
	const [url, setUrl] = React.useState('');
	const [descripcion, setDescripcion] = React.useState('');
	const [imageFile, setImageFile] = React.useState<File | null>(null);
	const [imagePreview, setImagePreview] = React.useState<string>('');
	const [imageError, setImageError] = React.useState<string | null>(null);
	const [isDragging, setIsDragging] = React.useState(false);
	const [loading, setLoading] = React.useState(false);
	const [submitting, setSubmitting] = React.useState(false);
	const [deletingId, setDeletingId] = React.useState<number | null>(null);

	const resetForm = React.useCallback(() => {
		setUrl('');
		setDescripcion('');
		setImageFile(null);
		setImagePreview('');
		setImageError(null);
		setIsDragging(false);
	}, []);

	React.useEffect(() => {
		if (!open || !actor) return;

		setTipo('IMAGEN');
		resetForm();
		setLoading(true);

		listarPortafolioApi(actor.id)
			.then((res) => {
				const portafolio = (res.data ?? []).map((item) => ({
					id: item.idItem ?? item.id ?? Date.now(),
					tipo: item.tipo,
					descripcion: item.descripcion,
					url: item.url,
				}));
				setItems(portafolio);
				onPortfolioChange?.(actor.id, portafolio);
			})
			.catch((err) => {
				const errMsg =
					err instanceof Error ? err.message : 'No se pudieron cargar los elementos del portafolio.';
				notify.error(errMsg);
			})
			.finally(() => setLoading(false));
	}, [open, actor?.id, resetForm]);

	const imageCount = React.useMemo(() => {
		return items.filter((it) => it.tipo === 'IMAGEN').length;
	}, [items]);

	const hasReachedImageLimit = imageCount >= MAX_PORTFOLIO_IMAGES;

	const handleProcessFile = async (file: File | null) => {
		if (!file) {
			setImageFile(null);
			setImagePreview('');
			setImageError(null);
			return;
		}

		const validation = validateImageFile(file, MAX_IMAGE_MB);
		if (!validation.valid) {
			setImageError(validation.error || `El archivo supera los ${MAX_IMAGE_MB} MB permitidos.`);
			setImageFile(null);
			setImagePreview('');
			return;
		}

		try {
			const base64 = await fileToBase64(file);
			setImageFile(file);
			setImagePreview(base64);
			setImageError(null);
		} catch {
			setImageError('Error al leer el archivo de imagen.');
			setImageFile(null);
			setImagePreview('');
		}
	};

	// Manejo de pegado desde el portapapeles (Ctrl+V / Cmd+V)
	React.useEffect(() => {
		if (!open || tipo !== 'IMAGEN' || hasReachedImageLimit) return;

		const handleWindowPaste = (e: ClipboardEvent) => {
			const clipboardItems = e.clipboardData?.items;
			if (!clipboardItems) return;

			for (let i = 0; i < clipboardItems.length; i++) {
				const item = clipboardItems[i];
				if (item.type.startsWith('image/')) {
					const file = item.getAsFile();
					if (file) {
						e.preventDefault();
						handleProcessFile(file);
						notify.info('Imagen pegada desde el portapapeles.', { scope: 'actor-portfolio' });
						break;
					}
				}
			}
		};

		window.addEventListener('paste', handleWindowPaste);
		return () => window.removeEventListener('paste', handleWindowPaste);
	}, [open, tipo, hasReachedImageLimit]);

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (!isDragging) setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		if (hasReachedImageLimit) return;

		const files = e.dataTransfer.files;
		if (files && files.length > 0) {
			const file = files[0];
			if (file.type.startsWith('image/')) {
				handleProcessFile(file);
			} else {
				setImageError('El archivo debe ser una imagen en formato JPG, PNG o WebP.');
			}
		}
	};

	const handleAddItem = async () => {
		if (!actor) return;

		if (tipo === 'IMAGEN') {
			if (hasReachedImageLimit) {
				notify.error(`No podés subir más de ${MAX_PORTFOLIO_IMAGES} imágenes por actor.`, {
					scope: 'actor-portfolio',
				});
				return;
			}
			if (!imagePreview) {
				setImageError('Por favor seleccioná o pegá una imagen.');
				return;
			}

			setSubmitting(true);
			try {
				const res = await agregarItemPortafolioApi(actor.id, {
					tipo: 'IMAGEN',
					descripcion: descripcion.trim() || 'Sin título',
					imagenBase64: imagePreview,
				});

				const createdId = res?.data?.idItem ?? Date.now();
				const itemUrl = res?.data?.url || '';
				const newItem: MyActorPortfolioItem = {
					id: createdId,
					tipo: 'IMAGEN',
					url: itemUrl,
					descripcion: descripcion.trim() || 'Sin título',
				};

				const updated = [newItem, ...items];
				setItems(updated);
				onPortfolioChange?.(actor.id, updated);

				resetForm();
				notify.success('Imagen agregada al portafolio.', { scope: 'actor-portfolio' });
			} catch (err) {
				const errMsg = err instanceof Error ? err.message : 'No se pudo agregar la imagen al portafolio.';
				notify.error(errMsg, { scope: 'actor-portfolio' });
			} finally {
				setSubmitting(false);
			}
		} else {
			if (!url.trim()) return;
			const normalizedUrl = normalizarUrl(url);

			setSubmitting(true);
			try {
				const res = await agregarItemPortafolioApi(actor.id, {
					tipo,
					descripcion: descripcion.trim() || 'Sin descripción',
					url: normalizedUrl,
				});

				const createdId = res?.data?.idItem ?? Date.now();
				const itemUrl = res?.data?.url || normalizedUrl;
				const newItem: MyActorPortfolioItem = {
					id: createdId,
					tipo,
					url: itemUrl,
					descripcion: descripcion.trim() || 'Sin descripción',
				};

				const updated = [newItem, ...items];
				setItems(updated);
				onPortfolioChange?.(actor.id, updated);

				resetForm();
				notify.success('Elemento agregado al portafolio.', { scope: 'actor-portfolio' });
			} catch (err) {
				const errMsg = err instanceof Error ? err.message : 'No se pudo agregar el elemento al portafolio.';
				notify.error(errMsg, { scope: 'actor-portfolio' });
			} finally {
				setSubmitting(false);
			}
		}
	};

	const handleDeleteItem = async (itemId: number) => {
		if (!actor) return;

		setDeletingId(itemId);
		try {
			await eliminarItemPortafolioApi(actor.id, itemId);
			const updated = items.filter((item) => item.id !== itemId);
			setItems(updated);
			onPortfolioChange?.(actor.id, updated);
			notify.success('Elemento eliminado del portafolio.', { scope: 'actor-portfolio' });
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'No se pudo eliminar el elemento del portafolio.';
			notify.error(errMsg, { scope: 'actor-portfolio' });
		} finally {
			setDeletingId(null);
		}
	};

	const isAddDisabled = submitting || (tipo === 'IMAGEN' ? !imagePreview || hasReachedImageLimit : !url.trim());

	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle fontWeight={700}>Gestionar portafolio: {actor?.nombre}</DialogTitle>
			<DialogContent dividers>
				<Stack spacing={3}>
					<Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
						<Typography variant="body2" color="text.secondary">
							Subí imágenes de tu actividad o agregá enlaces a redes sociales y sitios web.
						</Typography>
						<Chip
							label={`Imágenes: ${imageCount} / ${MAX_PORTFOLIO_IMAGES}`}
							color={hasReachedImageLimit ? 'warning' : 'primary'}
							size="small"
							variant="outlined"
						/>
					</Stack>

					{/* Formulario de carga aislado */}
					<Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
						<Typography variant="subtitle2" fontWeight={700} gutterBottom>
							Agregar nuevo elemento al portafolio
						</Typography>
						<Grid container spacing={2} sx={{ mt: 0.5 }}>
							<Grid size={{ xs: 12, md: 4 }}>
								<FormControl fullWidth size="small">
									<InputLabel>Tipo</InputLabel>
									<Select
										value={tipo}
										label="Tipo"
										onChange={(e) => {
											setTipo(e.target.value as 'IMAGEN' | 'LINK' | 'RRSS');
											resetForm();
										}}
									>
										<MenuItem value="IMAGEN">Imagen / Fotografía</MenuItem>
										<MenuItem value="RRSS">Red Social / Instagram</MenuItem>
										<MenuItem value="LINK">Link / Sitio Web</MenuItem>
									</Select>
								</FormControl>
							</Grid>

							<Grid size={{ xs: 12, md: 8 }}>
								<TextField
									fullWidth
									size="small"
									label={
										tipo === 'IMAGEN' ? 'Título o descripción de la imagen' : 'Descripción breve'
									}
									placeholder={
										tipo === 'IMAGEN' ? 'Ej. Presentación en vivo 2024' : 'Ej. Sitio oficial'
									}
									value={descripcion}
									onChange={(e) => setDescripcion(e.target.value)}
								/>
							</Grid>

							{tipo === 'IMAGEN' ? (
								<Grid size={{ xs: 12 }}>
									{hasReachedImageLimit ? (
										<Alert severity="warning" sx={{ mb: 1 }}>
											Has alcanzado el límite máximo de {MAX_PORTFOLIO_IMAGES} imágenes para este
											actor. Eliminá alguna existente si deseás subir una nueva.
										</Alert>
									) : (
										<Box>
											<Box
												onDragOver={handleDragOver}
												onDragLeave={handleDragLeave}
												onDrop={handleDrop}
												sx={{
													border: '2px dashed',
													borderColor: imageError
														? 'error.main'
														: isDragging
															? 'primary.main'
															: 'divider',
													borderRadius: 2,
													p: 2.5,
													textAlign: 'center',
													bgcolor: isDragging
														? 'action.selected'
														: imagePreview
															? 'background.paper'
															: 'transparent',
													transition: 'all 0.2s ease-in-out',
													display: 'flex',
													flexDirection: 'column',
													alignItems: 'center',
													justifyContent: 'center',
													gap: 1.5,
													cursor: 'pointer',
												}}
												onClick={() => {
													if (!imagePreview) {
														document
															.getElementById('portfolio-image-upload-input')
															?.click();
													}
												}}
											>
												<input
													id="portfolio-image-upload-input"
													type="file"
													hidden
													accept="image/png,image/jpeg,image/webp"
													onChange={(e) => handleProcessFile(e.target.files?.[0] ?? null)}
												/>

												{imagePreview ? (
													<Stack
														direction={{ xs: 'column', sm: 'row' }}
														spacing={2}
														alignItems="center"
													>
														<Box
															component="img"
															src={imagePreview}
															alt="Vista previa"
															sx={{
																width: 110,
																height: 90,
																objectFit: 'cover',
																borderRadius: 1.5,
																border: '1px solid',
																borderColor: 'divider',
															}}
														/>
														<Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
															<Typography
																variant="body2"
																fontWeight={600}
																noWrap
																sx={{ maxWidth: 300 }}
															>
																{imageFile?.name || 'Imagen cargada'}
															</Typography>
															<Typography
																variant="caption"
																color="text.secondary"
																display="block"
															>
																{imageFile
																	? `${(imageFile.size / (1024 * 1024)).toFixed(2)} MB`
																	: 'Lista para agregar'}
															</Typography>
															<Stack direction="row" spacing={1} sx={{ mt: 1 }}>
																<Button
																	size="small"
																	variant="outlined"
																	onClick={(e) => {
																		e.stopPropagation();
																		document
																			.getElementById(
																				'portfolio-image-upload-input',
																			)
																			?.click();
																	}}
																>
																	Cambiar
																</Button>
																<Button
																	size="small"
																	color="error"
																	onClick={(e) => {
																		e.stopPropagation();
																		setImageFile(null);
																		setImagePreview('');
																		setImageError(null);
																	}}
																>
																	Quitar
																</Button>
															</Stack>
														</Box>
													</Stack>
												) : (
													<>
														<CloudUploadIcon
															sx={{ fontSize: 44, color: 'primary.main', opacity: 0.85 }}
														/>
														<Box>
															<Typography variant="subtitle2" fontWeight={700}>
																Arrastrá y soltá una imagen aquí, o pegala con Ctrl+V
															</Typography>
															<Typography variant="caption" color="text.secondary">
																También podés hacer clic para examinar archivos (JPG,
																PNG o WebP - Máx. {MAX_IMAGE_MB} MB)
															</Typography>
														</Box>
														<Button
															size="small"
															variant="outlined"
															component="label"
															startIcon={<CloudUploadIcon />}
															onClick={(e) => e.stopPropagation()}
														>
															Examinar archivos
															<input
																type="file"
																hidden
																accept="image/png,image/jpeg,image/webp"
																onChange={(e) =>
																	handleProcessFile(e.target.files?.[0] ?? null)
																}
															/>
														</Button>
													</>
												)}
											</Box>

											{imageError && (
												<Alert severity="error" variant="outlined" sx={{ mt: 1 }}>
													{imageError}
												</Alert>
											)}
										</Box>
									)}
								</Grid>
							) : (
								<Grid size={{ xs: 12 }}>
									<TextField
										fullWidth
										size="small"
										label="URL o Link"
										placeholder="https://..."
										value={url}
										onChange={(e) => setUrl(e.target.value)}
										helperText="Pegá el enlace público del sitio o red social."
									/>
								</Grid>
							)}

							<Grid size={{ xs: 12 }}>
								<Button
									variant="contained"
									size="small"
									startIcon={
										submitting ? <CircularProgress size={16} color="inherit" /> : <AddIcon />
									}
									onClick={handleAddItem}
									disabled={isAddDisabled}
								>
									{submitting
										? 'Agregando...'
										: tipo === 'IMAGEN'
											? 'Subir imagen'
											: 'Agregar enlace'}
								</Button>
							</Grid>
						</Grid>
					</Paper>

					{/* Lista de elementos */}
					<Typography variant="subtitle2" fontWeight={700}>
						Elementos actuales ({items.length})
					</Typography>

					{loading ? (
						<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
							<CircularProgress size={32} />
						</Box>
					) : items.length === 0 ? (
						<Alert severity="info">Este actor todavía no tiene elementos en su portafolio.</Alert>
					) : (
						<Stack spacing={1.5} divider={<Divider />}>
							{items.map((item) => (
								<Stack
									key={item.id}
									direction="row"
									justifyContent="space-between"
									alignItems="center"
									spacing={2}
								>
									<Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
										{item.tipo === 'RRSS' ? (
											<InstagramIcon color="primary" />
										) : item.tipo === 'IMAGEN' ? (
											<Box
												component="img"
												src={item.url}
												alt={item.descripcion}
												sx={{
													width: 48,
													height: 48,
													borderRadius: 1,
													objectFit: 'cover',
													bgcolor: 'action.hover',
													flexShrink: 0,
												}}
											/>
										) : (
											<LanguageIcon color="action" />
										)}
										<Box sx={{ minWidth: 0 }}>
											<Typography variant="body2" fontWeight={600} noWrap>
												{item.descripcion}
											</Typography>
											{item.tipo !== 'IMAGEN' && (
												<MuiLink
													href={item.url}
													target="_blank"
													underline="hover"
													variant="caption"
													color="text.secondary"
													noWrap
												>
													{item.url}
												</MuiLink>
											)}
										</Box>
									</Stack>
									<IconButton
										size="small"
										color="error"
										disabled={deletingId === item.id}
										onClick={() => handleDeleteItem(item.id)}
									>
										{deletingId === item.id ? (
											<CircularProgress size={16} color="inherit" />
										) : (
											<DeleteOutlineIcon fontSize="small" />
										)}
									</IconButton>
								</Stack>
							))}
						</Stack>
					)}
				</Stack>
			</DialogContent>
			<DialogActions sx={{ p: 2 }}>
				<Button variant="contained" onClick={onClose}>
					Cerrar
				</Button>
			</DialogActions>
		</Dialog>
	);
}
