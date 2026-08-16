import * as React from 'react';
import {
	Alert,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Stack,
	TextField,
} from '@mui/material';

import { eliminarMiActorApi } from '../api/actores';
import { notify } from '../utils/toast';
import type { MyActor } from '../pages/misActores';

type Props = {
	open: boolean;
	actor: MyActor | null;
	onClose: () => void;
	onActorDeleted?: (actorId: number) => void;
};

export default function ActorDeleteDialog({ open, actor, onClose, onActorDeleted }: Props) {
	const [deleteConfirmInput, setDeleteConfirmInput] = React.useState('');
	const [submitting, setSubmitting] = React.useState(false);

	React.useEffect(() => {
		if (open) {
			setDeleteConfirmInput('');
		}
	}, [open, actor]);

	const isDeleteConfirmed = React.useMemo(() => {
		if (!actor) return false;
		const cleanInput = deleteConfirmInput.trim().toUpperCase();
		return cleanInput === 'BORRAR' || cleanInput === 'ELIMINAR';
	}, [deleteConfirmInput, actor]);

	const handleConfirmDelete = async () => {
		if (!actor) return;

		setSubmitting(true);
		try {
			await eliminarMiActorApi(actor.id);
			onActorDeleted?.(actor.id);
			notify.info(`"${actor.nombre}" fue eliminado permanentemente.`, { scope: 'actor-delete' });
			onClose();
		} catch (err) {
			console.error('Error API eliminar actor:', err);
			const msg = err instanceof Error ? err.message : 'No se pudo eliminar el actor cultural.';
			notify.error(msg, { scope: 'actor-delete' });
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle fontWeight={700} color="error.main">
				¿Eliminar permanentemente a {actor?.nombre}?
			</DialogTitle>
			<DialogContent dividers>
				<Stack spacing={2}>
					<Alert severity="error">
						<strong>¡Acción irreversible!</strong> Al eliminar a <strong>{actor?.nombre}</strong>, se
						borrarán de forma permanente su ficha cultural, portafolio y todos los eventos asociados.
					</Alert>
					<DialogContentText>
						Para confirmar la eliminación, escribí <strong>BORRAR</strong>:
					</DialogContentText>
					<TextField
						fullWidth
						size="small"
						autoFocus
						placeholder="Escribí BORRAR para confirmar"
						value={deleteConfirmInput}
						onChange={(e) => setDeleteConfirmInput(e.target.value)}
						color={isDeleteConfirmed ? 'error' : 'primary'}
						helperText={isDeleteConfirmed ? ' ' : 'Ingresá BORRAR para habilitar el botón de eliminación.'}
					/>
				</Stack>
			</DialogContent>
			<DialogActions sx={{ p: 2 }}>
				<Button onClick={onClose} disabled={submitting}>
					Cancelar
				</Button>
				<Button
					variant="contained"
					color="error"
					disabled={!isDeleteConfirmed || submitting}
					onClick={handleConfirmDelete}
				>
					Eliminar definitivamente
				</Button>
			</DialogActions>
		</Dialog>
	);
}
