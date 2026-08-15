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
	Grid,
	IconButton,
	Paper,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import DatePickerSpanish from './datePickerSpanish';
import { agregarEventoApi, eliminarEventoApi, listarEventosApi } from '../api/actores';
import { formatEventDate } from '../utils/date';
import { notify } from '../utils/toast';
import type { MyActor, MyActorEvent } from '../pages/misActores';

type Props = {
	open: boolean;
	actor: MyActor | null;
	onClose: () => void;
	onEventsChange?: (actorId: number, eventos: MyActorEvent[]) => void;
};

export default function ActorEventsDialog({ open, actor, onClose, onEventsChange }: Props) {
	const [nombre, setNombre] = React.useState('');
	const [fecha, setFecha] = React.useState('');
	const [descripcion, setDescripcion] = React.useState('');
	const [eventos, setEventos] = React.useState<MyActorEvent[]>([]);
	const [loading, setLoading] = React.useState(false);
	const [submitting, setSubmitting] = React.useState(false);
	const [deletingId, setDeletingId] = React.useState<number | null>(null);

	// Carga los eventos al abrir el modal para el actor seleccionado
	React.useEffect(() => {
		if (!open || !actor) return;

		setNombre('');
		setFecha('');
		setDescripcion('');
		setLoading(true);

		listarEventosApi(actor.id)
			.then((res) => {
				const evts = (res.data ?? []).map((e) => ({
					id: e.idEvento ?? e.id ?? Date.now(),
					nombre: e.nombre,
					descripcion: e.descripcion,
					fecha: e.fecha,
				}));
				setEventos(evts);
				onEventsChange?.(actor.id, evts);
			})
			.catch((err) => {
				notify.error(err instanceof Error ? err.message : 'No se pudieron cargar los eventos.');
			})
			.finally(() => setLoading(false));
	}, [open, actor?.id]);

	const handleAddEvent = async () => {
		if (!actor || !nombre.trim()) return;

		setSubmitting(true);
		try {
			const res = await agregarEventoApi(actor.id, {
				nombre: nombre.trim(),
				descripcion: descripcion.trim() || 'Sin descripción',
				fecha: fecha.trim() || undefined,
			});

			if (!res.data.idEvento) throw new Error('El backend no devolvió el ID del evento.');

			const newEvt: MyActorEvent = {
				id: res.data.idEvento,
				nombre: nombre.trim(),
				fecha: fecha.trim() || new Date().toISOString(),
				descripcion: descripcion.trim() || 'Sin descripción',
			};

			const updated = [...eventos, newEvt].sort((a, b) => a.fecha.localeCompare(b.fecha));
			setEventos(updated);
			onEventsChange?.(actor.id, updated);

			setNombre('');
			setFecha('');
			setDescripcion('');
			notify.success('Evento agregado.');
		} catch (err) {
			notify.error(err instanceof Error ? err.message : 'No se pudo agregar el evento.');
		} finally {
			setSubmitting(false);
		}
	};

	const handleDeleteEvent = async (eventId: number) => {
		if (!actor) return;

		setDeletingId(eventId);
		try {
			await eliminarEventoApi(actor.id, eventId);
			const updated = eventos.filter((e) => e.id !== eventId);
			setEventos(updated);
			onEventsChange?.(actor.id, updated);
			notify.success('Evento eliminado.');
		} catch (err) {
			notify.error(err instanceof Error ? err.message : 'No se pudo eliminar el evento.');
		} finally {
			setDeletingId(null);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle fontWeight={700}>Gestionar eventos: {actor?.nombre}</DialogTitle>
			<DialogContent dividers>
				<Stack spacing={3}>
					<Typography variant="body2" color="text.secondary">
						Agregá o eliminá presentaciones, funciones o eventos programados para este actor cultural.
					</Typography>

					{/* Formulario aislado */}
					<Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
						<Typography variant="subtitle2" fontWeight={700} gutterBottom>
							Agregar nuevo evento
						</Typography>
						<Grid container spacing={2} sx={{ mt: 0.5 }}>
							<Grid size={{ xs: 12, md: 5 }}>
								<TextField
									fullWidth
									required
									label="Nombre del evento"
									placeholder="Ej. Noche de Folklore en Anfiteatro"
									value={nombre}
									onChange={(e) => setNombre(e.target.value)}
									slotProps={{ htmlInput: { maxLength: 45 } }}
								/>
							</Grid>
							<Grid size={{ xs: 12, md: 3 }}>
								<DatePickerSpanish
									label="Fecha"
									value={fecha}
									onChange={(dateStr) => setFecha(dateStr)}
								/>
							</Grid>
							<Grid size={{ xs: 12, md: 4 }}>
								<TextField
									fullWidth
									label="Descripción / Lugar"
									placeholder="Ej. Plaza Independencia"
									value={descripcion}
									onChange={(e) => setDescripcion(e.target.value)}
									slotProps={{ htmlInput: { maxLength: 455 } }}
								/>
							</Grid>
							<Grid size={{ xs: 12 }}>
								<Button
									variant="contained"
									size="medium"
									startIcon={<AddIcon />}
									onClick={handleAddEvent}
									disabled={!nombre.trim() || submitting || loading}
								>
									{submitting ? 'Agregando…' : 'Agregar evento'}
								</Button>
							</Grid>
						</Grid>
					</Paper>

					{/* Listado de eventos */}
					<Typography variant="subtitle2" fontWeight={700}>
						Eventos programados ({eventos.length})
					</Typography>

					{loading ? (
						<Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
							<CircularProgress size={28} />
						</Box>
					) : eventos.length === 0 ? (
						<Alert severity="info">Este actor no tiene eventos registrados actualmente.</Alert>
					) : (
						<Stack spacing={1.5} divider={<Divider />}>
							{eventos.map((evt) => (
								<Stack
									key={evt.id}
									direction="row"
									justifyContent="space-between"
									alignItems="center"
									spacing={2}
								>
									<Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
										<CalendarMonthIcon color="primary" />
										<Box sx={{ minWidth: 0 }}>
											<Typography variant="body2" fontWeight={600}>
												{evt.nombre}
											</Typography>
											<Typography variant="caption" color="text.secondary">
												📅 {formatEventDate(evt.fecha)} · {evt.descripcion}
											</Typography>
										</Box>
									</Stack>
									<IconButton
										size="small"
										color="error"
										onClick={() => handleDeleteEvent(evt.id)}
										disabled={deletingId !== null}
									>
										{deletingId === evt.id ? (
											<CircularProgress size={18} />
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
