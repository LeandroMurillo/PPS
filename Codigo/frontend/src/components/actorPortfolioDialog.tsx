import * as React from 'react';
import {
	Alert,
	Box,
	Button,
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
import CollectionsIcon from '@mui/icons-material/Collections';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import InstagramIcon from '@mui/icons-material/Instagram';
import LanguageIcon from '@mui/icons-material/Language';

import { agregarItemPortafolioApi, eliminarItemPortafolioApi, listarPortafolioApi } from '../api/actores';
import { notify } from '../utils/toast';
import type { MyActor, MyActorPortfolioItem } from '../pages/misActores';

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
	const [loading, setLoading] = React.useState(false);
	const [submitting, setSubmitting] = React.useState(false);
	const [deletingId, setDeletingId] = React.useState<number | null>(null);

	React.useEffect(() => {
		if (!open || !actor) return;

		setTipo('IMAGEN');
		setUrl('');
		setDescripcion('');
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
	}, [open, actor?.id]);

	const handleAddItem = async () => {
		if (!actor || !url.trim()) return;

		setSubmitting(true);
		try {
			const res = await agregarItemPortafolioApi(actor.id, {
				tipo,
				descripcion: descripcion.trim() || 'Sin descripción',
				url: url.trim(),
			});

			const createdId = res?.data?.idItem ?? Date.now();
			const newItem: MyActorPortfolioItem = {
				id: createdId,
				tipo,
				url: url.trim(),
				descripcion: descripcion.trim() || 'Sin descripción',
			};

			const updated = [newItem, ...items];
			setItems(updated);
			onPortfolioChange?.(actor.id, updated);

			setUrl('');
			setDescripcion('');
			notify.success('Elemento agregado al portafolio.');
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'No se pudo agregar el elemento al portafolio.';
			notify.error(errMsg);
		} finally {
			setSubmitting(false);
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
			notify.success('Elemento eliminado del portafolio.');
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'No se pudo eliminar el elemento del portafolio.';
			notify.error(errMsg);
		} finally {
			setDeletingId(null);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle fontWeight={700}>Gestionar portafolio: {actor?.nombre}</DialogTitle>
			<DialogContent dividers>
				<Stack spacing={3}>
					<Typography variant="body2" color="text.secondary">
						Agregá o eliminá elementos públicos para el portafolio de este actor (imágenes, enlaces o redes
						sociales).
					</Typography>

					{/* Formulario de carga aislado */}
					<Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
						<Typography variant="subtitle2" fontWeight={700} gutterBottom>
							Agregar nuevo elemento al portafolio
						</Typography>
						<Grid container spacing={2} sx={{ mt: 0.5 }}>
							<Grid size={{ xs: 12, md: 3 }}>
								<FormControl fullWidth size="small">
									<InputLabel>Tipo</InputLabel>
									<Select
										value={tipo}
										label="Tipo"
										onChange={(e) => setTipo(e.target.value as 'IMAGEN' | 'LINK' | 'RRSS')}
									>
										<MenuItem value="IMAGEN">Imagen / Foto</MenuItem>
										<MenuItem value="RRSS">Red Social / Instagram</MenuItem>
										<MenuItem value="LINK">Link / Sitio Web</MenuItem>
									</Select>
								</FormControl>
							</Grid>
							<Grid size={{ xs: 12, md: 5 }}>
								<TextField
									fullWidth
									size="small"
									label="URL o Link"
									placeholder="https://..."
									value={url}
									onChange={(e) => setUrl(e.target.value)}
								/>
							</Grid>
							<Grid size={{ xs: 12, md: 4 }}>
								<TextField
									fullWidth
									size="small"
									label="Descripción breve"
									placeholder="Ej. Show en vivo"
									value={descripcion}
									onChange={(e) => setDescripcion(e.target.value)}
								/>
							</Grid>
							<Grid size={{ xs: 12 }}>
								<Button
									variant="contained"
									size="small"
									startIcon={
										submitting ? <CircularProgress size={16} color="inherit" /> : <AddIcon />
									}
									onClick={handleAddItem}
									disabled={!url.trim() || submitting}
								>
									{submitting ? 'Agregando...' : 'Agregar elemento'}
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
											<CollectionsIcon color="secondary" />
										) : (
											<LanguageIcon color="action" />
										)}
										<Box sx={{ minWidth: 0 }}>
											<Typography variant="body2" fontWeight={600} noWrap>
												{item.descripcion}
											</Typography>
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
