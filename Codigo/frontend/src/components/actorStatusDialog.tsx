import * as React from 'react';
import ShieldIcon from '@mui/icons-material/Shield';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
	Alert,
	Box,
	Button,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	FormControlLabel,
	Radio,
	RadioGroup,
	Stack,
	Typography,
} from '@mui/material';

import { cambiarEstadoMiActorApi } from '../api/actores';
import { useAuth } from '../context/AuthContext';
import { notify } from '../utils/toast';
import type { MyActor } from '../pages/misActores';

type Props = {
	open: boolean;
	actor: MyActor | null;
	defaultNext?: 'A' | 'P' | 'I';
	onClose: () => void;
	onStatusChanged?: (actorId: number, nextStatus: 'A' | 'P' | 'I') => void;
};

export default function ActorStatusDialog({ open, actor, defaultNext, onClose, onStatusChanged }: Props) {
	const { user } = useAuth();
	const isAdminOrMod = user?.rol === 'ADMIN' || user?.rol === 'MODERADOR';

	const [selectedNextStatus, setSelectedNextStatus] = React.useState<'A' | 'P' | 'I'>('P');
	const [deactivateConfirmModalOpen, setDeactivateConfirmModalOpen] = React.useState(false);
	const [submitting, setSubmitting] = React.useState(false);

	React.useEffect(() => {
		if (open && actor) {
			const initialChoice = defaultNext || (actor.estado === 'A' ? 'I' : actor.estado === 'I' ? 'P' : 'I');
			setSelectedNextStatus(initialChoice);
			setDeactivateConfirmModalOpen(false);
		}
	}, [open, actor, defaultNext]);

	// Status Modal Submit -> If 'I', open Deactivate Confirmation Dialog
	const handleStatusModalSubmit = () => {
		if (!actor) return;

		if (selectedNextStatus === 'I') {
			setDeactivateConfirmModalOpen(true);
			return;
		}

		// For 'P' or 'A', execute directly
		void handleExecuteStatusChange(selectedNextStatus);
	};

	// Execute Status Change
	const handleExecuteStatusChange = async (nextSt: 'A' | 'P' | 'I') => {
		if (!actor) return;

		if (nextSt === 'A' && !isAdminOrMod) {
			notify.warning('Solo un administrador o moderador puede activar un actor cultural.');
			return;
		}

		setSubmitting(true);
		try {
			await cambiarEstadoMiActorApi(actor.id, nextSt);
			onStatusChanged?.(actor.id, nextSt);

			let actionText = '';
			if (nextSt === 'I') actionText = 'fue dado de baja (Inactivo)';
			else if (nextSt === 'P') actionText = 'pasó a estado Pendiente de revisión';
			else if (nextSt === 'A') actionText = 'fue activado';

			notify.info(`"${actor.nombre}" ${actionText}.`);
			setDeactivateConfirmModalOpen(false);
			onClose();
		} catch (err) {
			console.error('Error API cambiar estado:', err);
			const msg = err instanceof Error ? err.message : 'No se pudo cambiar el estado del actor cultural.';
			notify.error(msg);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<>
			{/* MODAL: Gestionar Estado (Pendiente, Dar de baja, Activar solo Admin) */}
			<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
				<DialogTitle fontWeight={700}>Gestionar estado de: {actor?.nombre}</DialogTitle>
				<DialogContent dividers>
					<Stack spacing={2.5}>
						<DialogContentText>
							Seleccioná el estado para tu actor cultural. Los usuarios pueden solicitar revisión
							(Pendiente) o dar de baja (Inactivo).
						</DialogContentText>

						<RadioGroup
							value={selectedNextStatus}
							onChange={(e) => setSelectedNextStatus(e.target.value as 'A' | 'P' | 'I')}
						>
							{/* Option P (Pendiente) is ONLY visible if actor is not currently Active */}
							{actor?.estado !== 'A' && (
								<Box
									sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5, mb: 1 }}
								>
									<FormControlLabel
										value="P"
										control={<Radio size="small" color="warning" />}
										label={
											<Box>
												<Typography variant="subtitle2" fontWeight={700}>
													P - Pendiente de revisión
												</Typography>
												<Typography variant="caption" color="text.secondary">
													Marca la ficha para ser revisada y aprobada por los moderadores.
												</Typography>
											</Box>
										}
										sx={{ m: 0, alignItems: 'flex-start' }}
									/>
								</Box>
							)}

							<Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5, mb: 1 }}>
								<FormControlLabel
									value="I"
									control={<Radio size="small" color="error" />}
									label={
										<Box>
											<Typography variant="subtitle2" fontWeight={700} color="error.main">
												I - Dar de baja (Inactivo)
											</Typography>
											<Typography variant="caption" color="text.secondary">
												Desactiva temporalmente la visibilidad pública del actor.
											</Typography>
										</Box>
									}
									sx={{ m: 0, alignItems: 'flex-start' }}
								/>
							</Box>

							{/* Render 'A' option ONLY if user is Admin or Moderator */}
							{isAdminOrMod && (
								<Box
									sx={{
										border: '1px solid',
										borderColor: 'success.light',
										borderRadius: 1,
										p: 1.5,
										bgcolor: 'action.hover',
									}}
								>
									<FormControlLabel
										value="A"
										control={<Radio size="small" color="success" />}
										label={
											<Box>
												<Stack direction="row" spacing={1} alignItems="center">
													<Typography
														variant="subtitle2"
														fontWeight={700}
														color="success.main"
													>
														A - Activo (Público)
													</Typography>
													<Chip
														icon={<ShieldIcon fontSize="small" />}
														label="Rol Admin / Moderador"
														size="small"
														variant="outlined"
														color="success"
														sx={{ height: 20, fontSize: 10 }}
													/>
												</Stack>
												<Typography variant="caption" color="text.secondary">
													Aprobar y activar directamente la visibilidad pública de este actor.
												</Typography>
											</Box>
										}
										sx={{ m: 0, alignItems: 'flex-start' }}
									/>
								</Box>
							)}
						</RadioGroup>
					</Stack>
				</DialogContent>
				<DialogActions sx={{ p: 2 }}>
					<Button onClick={onClose} disabled={submitting}>
						Cancelar
					</Button>
					<Button
						variant="contained"
						disabled={submitting}
						color={
							selectedNextStatus === 'I' ? 'error' : selectedNextStatus === 'P' ? 'warning' : 'success'
						}
						onClick={handleStatusModalSubmit}
					>
						{selectedNextStatus === 'I'
							? 'Dar de baja'
							: selectedNextStatus === 'P'
								? 'Pasar a pendiente'
								: 'Activar actor'}
					</Button>
				</DialogActions>
			</Dialog>

			{/* MODAL: Confirmación de Dar de baja */}
			<Dialog
				open={deactivateConfirmModalOpen}
				onClose={() => setDeactivateConfirmModalOpen(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle fontWeight={700} color="error.main">
					¿Dar de baja actor cultural?
				</DialogTitle>
				<DialogContent dividers>
					<Stack spacing={2}>
						<Alert severity="warning" icon={<WarningAmberIcon />}>
							<strong>¡Atención!</strong> Al dar de baja a <strong>{actor?.nombre}</strong>, la ficha
							quedará en estado <strong>Inactivo</strong> y se ocultará de las búsquedas públicas y del
							mapa cultural.
						</Alert>
						<DialogContentText>
							¿Estás seguro de que querés dar de baja este actor cultural? Podrás volver a solicitar
							revisión en cualquier momento.
						</DialogContentText>
					</Stack>
				</DialogContent>
				<DialogActions sx={{ p: 2 }}>
					<Button onClick={() => setDeactivateConfirmModalOpen(false)} disabled={submitting}>
						Cancelar
					</Button>
					<Button
						variant="contained"
						color="error"
						disabled={submitting}
						onClick={() => void handleExecuteStatusChange('I')}
					>
						Sí, dar de baja
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
