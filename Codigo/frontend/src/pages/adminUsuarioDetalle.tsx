import * as React from 'react';
import { useNavigate, useParams } from 'react-router';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BlockIcon from '@mui/icons-material/Block';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import { Show, type DataSource } from '@toolpad/core/Crud';
import { PageContainer, type PageContainerProps } from '@toolpad/core/PageContainer';
import { useDialogs } from '@toolpad/core/useDialogs';
import { notify } from '../utils/toast';

import { asignarModeradorAdmin, cambiarEstadoUsuarioAdmin, type UsuarioDetalleAdmin } from '../api/admin';
import { usuarioAdminDataSource, type UsuarioDetalleDataModel } from '../data/adminUsuarios';

function BarePageContainer({ children }: PageContainerProps) {
	return <>{children}</>;
}

function toDataModel(usuario: UsuarioDetalleAdmin): UsuarioDetalleDataModel {
	return {
		...usuario,
		categoriasModeradas:
			usuario.categoriasModeracion
				.filter((categoria) => categoria.asignada)
				.map((categoria) => categoria.nombre)
				.join(', ') || 'Ninguna',
	};
}

export default function AdminUsuarioDetallePage() {
	const { usuarioId = '' } = useParams();
	const navigate = useNavigate();
	const dialogs = useDialogs();
	const [usuario, setUsuario] = React.useState<UsuarioDetalleDataModel | null>(null);
	const [reloadKey, setReloadKey] = React.useState(0);
	const [actionLoading, setActionLoading] = React.useState(false);
	const [moderationDialogOpen, setModerationDialogOpen] = React.useState(false);
	const [selectedCategories, setSelectedCategories] = React.useState<number[]>([]);

	const dataSource = React.useMemo<DataSource<UsuarioDetalleDataModel>>(
		() => ({
			...usuarioAdminDataSource,
			getOne: async (id) => {
				const result = await usuarioAdminDataSource.getOne!(id);
				setUsuario(result);
				return result;
			},
		}),
		[],
	);

	const reload = (updatedUsuario: UsuarioDetalleAdmin) => {
		setUsuario(toDataModel(updatedUsuario));
		setReloadKey((current) => current + 1);
	};

	const handleStateChange = async () => {
		if (!usuario) {
			return;
		}

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

		if (!confirmed) {
			return;
		}

		setActionLoading(true);
		try {
			const result = await cambiarEstadoUsuarioAdmin(usuario.id, activating ? 'A' : 'I');
			reload(result.data);
			notify.success(activating ? 'Usuario activado.' : 'Usuario dado de baja.', {
				scope: 'admin-usuario-detalle',
			});
		} catch (error) {
			const errMsg = error instanceof Error ? error.message : 'No se pudo actualizar el estado.';
			notify.error(errMsg, { scope: 'admin-usuario-detalle' });
		} finally {
			setActionLoading(false);
		}
	};

	const openModerationDialog = () => {
		if (!usuario) {
			return;
		}

		setSelectedCategories(
			usuario.categoriasModeracion.filter((categoria) => categoria.asignada).map((categoria) => categoria.id),
		);
		setModerationDialogOpen(true);
	};

	const saveModeration = async () => {
		if (!usuario || (usuario.rol !== 'MODERADOR' && selectedCategories.length === 0)) {
			return;
		}

		setActionLoading(true);
		try {
			const result = await asignarModeradorAdmin(usuario.id, selectedCategories);
			reload(result.data);
			setModerationDialogOpen(false);
			notify.success(
				selectedCategories.length === 0
					? 'Se quitaron las categorías y el usuario dejó de ser moderador.'
					: 'Rol y categorías de moderación actualizados.',
				{ scope: 'admin-usuario-detalle' },
			);
		} catch (error) {
			const errMsg = error instanceof Error ? error.message : 'No se pudo asignar la moderación.';
			notify.error(errMsg, { scope: 'admin-usuario-detalle' });
		} finally {
			setActionLoading(false);
		}
	};

	return (
		<PageContainer title={usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Detalle de usuario'} maxWidth="lg">
			<Stack spacing={2}>
				<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between">
					<Button
						startIcon={<ArrowBackIcon />}
						onClick={() => navigate('/usuarios')}
						sx={{ alignSelf: 'flex-start' }}
					>
						Volver a usuarios
					</Button>
					{usuario && usuario.rol !== 'ADMIN' && (
						<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
							{usuario.estado !== 'I' && (
								<Button
									variant="contained"
									startIcon={<ManageAccountsIcon />}
									onClick={openModerationDialog}
									disabled={actionLoading}
								>
									{usuario.rol === 'MODERADOR' ? 'Editar categorías' : 'Asignar como moderador'}
								</Button>
							)}
							<Button
								variant={usuario.estado === 'I' ? 'contained' : 'outlined'}
								color={usuario.estado === 'I' ? 'success' : 'error'}
								startIcon={usuario.estado === 'I' ? <HowToRegIcon /> : <BlockIcon />}
								onClick={handleStateChange}
								disabled={actionLoading}
							>
								{usuario.estado === 'I' ? 'Reactivar usuario' : 'Dar de baja'}
							</Button>
						</Stack>
					)}
				</Stack>

				<Show
					key={reloadKey}
					id={usuarioId}
					dataSource={
						dataSource as DataSource<UsuarioDetalleDataModel> & {
							getOne: NonNullable<typeof dataSource.getOne>;
						}
					}
					dataSourceCache={null}
					slots={{ pageContainer: BarePageContainer }}
				/>
			</Stack>

			<Dialog open={moderationDialogOpen} onClose={() => setModerationDialogOpen(false)} fullWidth maxWidth="sm">
				<DialogTitle>
					{usuario?.rol === 'MODERADOR' ? 'Editar categorías moderadas' : 'Asignar como moderador'}
				</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ mb: 2 }}>
						Seleccioná las categorías activas que podrá moderar. Si quitás todas las categorías a un
						moderador, volverá a tener el rol Usuario.
					</DialogContentText>
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
