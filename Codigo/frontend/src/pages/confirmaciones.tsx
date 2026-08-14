import * as React from 'react';
import { CircleMarker, MapContainer, TileLayer } from 'react-leaflet';
import { useNavigate } from 'react-router';

import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ChecklistIcon from '@mui/icons-material/Checklist';
import CollectionsIcon from '@mui/icons-material/Collections';
import InstagramIcon from '@mui/icons-material/Instagram';
import LanguageIcon from '@mui/icons-material/Language';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
	Alert,
	Avatar,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
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
	InputLabel,
	Link as MuiLink,
	MenuItem,
	Paper,
	Select,
	Snackbar,
	Stack,
	Tooltip,
	Typography,
} from '@mui/material';
import { PageContainer } from '@toolpad/core/PageContainer';

import {
	cambiarEstadoActoresAdmin,
	listarActoresAdmin,
	listarCategoriasAdmin,
	obtenerActorAdmin,
	type ActorAdmin,
	type ActorAdminSortBy,
	type ActorDetalleAdmin,
	type CategoriaAdmin,
	type SortDirection,
} from '../api/admin';
import AdminFilters from '../components/adminFilters';
import AdminTable, { type AdminColumn } from '../components/adminTable';
import CategoryIcon from '../components/categoryIcon';
import { DEPARTAMENTOS_TUCUMAN } from '../constants/departamentos';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { buildSlugConId } from '../utils/slug';

import 'leaflet/dist/leaflet.css';

const typeLabels = { INDIVIDUO: 'Individuo', COLECTIVO: 'Colectivo', ESPACIO: 'Espacio' } as const;
const pageSize = 25;

function formatDate(value: string) {
	try {
		return new Intl.DateTimeFormat('es-AR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		}).format(new Date(value));
	} catch {
		return value;
	}
}

function optionalPositiveInteger(value: string): number | undefined {
	const parsed = Number(value);
	return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export default function ConfirmacionesPage() {
	const navigate = useNavigate();

	// Filters and sorting
	const [search, setSearch] = React.useState('');
	const [categoryId, setCategoryId] = React.useState('');
	const [department, setDepartment] = React.useState('');
	const [actorType, setActorType] = React.useState('');
	const [categories, setCategories] = React.useState<CategoriaAdmin[]>([]);
	const [page, setPage] = React.useState(0);
	const [sortBy, setSortBy] = React.useState<ActorAdminSortBy>('fechaCreacion');
	const [sortDir, setSortDir] = React.useState<SortDirection>('DESC');

	// Data
	const [rows, setRows] = React.useState<ActorAdmin[]>([]);
	const [total, setTotal] = React.useState(0);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);

	// Selection for batch actions
	const [selectedActorIds, setSelectedActorIds] = React.useState<React.Key[]>([]);

	// Action dialogs
	const [actionDialogState, setActionDialogState] = React.useState<{
		open: boolean;
		targetState: 'A' | 'I';
		actors: ActorAdmin[];
	}>({
		open: false,
		targetState: 'A',
		actors: [],
	});
	const [actionSubmitting, setActionSubmitting] = React.useState(false);
	const [actionError, setActionError] = React.useState<string | null>(null);

	// Preview modal
	const [previewOpen, setPreviewOpen] = React.useState(false);
	const [previewLoading, setPreviewLoading] = React.useState(false);
	const [previewActor, setPreviewActor] = React.useState<ActorDetalleAdmin | null>(null);
	const [previewError, setPreviewError] = React.useState<string | null>(null);

	// Toast
	const [snackbarMessage, setSnackbarMessage] = React.useState<string | null>(null);

	const debouncedSearch = useDebouncedValue(search);
	const debouncedCategoryId = useDebouncedValue(categoryId);
	const debouncedDepartment = useDebouncedValue(department);
	const debouncedActorType = useDebouncedValue(actorType);

	// Load categories catalog
	React.useEffect(() => {
		const controller = new AbortController();
		void listarCategoriasAdmin(
			{
				limit: 100,
				offset: 0,
				sortBy: 'nombre',
				sortDir: 'ASC',
			},
			controller.signal,
		)
			.then((result) => setCategories(result.data))
			.catch(() => {
				if (!controller.signal.aborted) {
					setCategories([]);
				}
			});
		return () => controller.abort();
	}, []);

	// Reset pagination on filter changes
	React.useEffect(() => {
		setPage(0);
		setRows([]);
		setSelectedActorIds([]);
	}, [debouncedActorType, debouncedCategoryId, debouncedDepartment, debouncedSearch, sortBy, sortDir]);

	// Load pending actors
	const loadPendingActores = React.useCallback(
		(signal?: AbortSignal) => {
			setLoading(true);
			setError(null);

			return listarActoresAdmin(
				{
					busqueda: debouncedSearch || undefined,
					idCategoria: optionalPositiveInteger(debouncedCategoryId),
					departamento: debouncedDepartment || undefined,
					tipoActor: (debouncedActorType || undefined) as ActorAdmin['tipoActor'] | undefined,
					estado: 'P', // Strict filter: only pending actors
					limit: pageSize,
					offset: page * pageSize,
					sortBy,
					sortDir,
				},
				signal,
			)
				.then((result) => {
					setRows((prev) => (page === 0 ? result.data : [...prev, ...result.data]));
					setTotal(result.pagination.total);
				})
				.catch((requestError: unknown) => {
					if (!signal?.aborted) {
						setError(
							requestError instanceof Error
								? requestError.message
								: 'No se pudieron cargar los actores pendientes.',
						);
					}
				})
				.finally(() => {
					if (!signal?.aborted) {
						setLoading(false);
					}
				});
		},
		[debouncedActorType, debouncedCategoryId, debouncedDepartment, debouncedSearch, page, sortBy, sortDir],
	);

	React.useEffect(() => {
		const controller = new AbortController();
		void loadPendingActores(controller.signal);
		return () => controller.abort();
	}, [loadPendingActores]);

	// Handlers for batch actions
	const selectedRows = React.useMemo(
		() => rows.filter((row) => selectedActorIds.includes(row.id)),
		[rows, selectedActorIds],
	);

	const handleOpenActionDialog = (targetState: 'A' | 'I', customActors?: ActorAdmin[]) => {
		const actors = customActors ?? selectedRows;
		if (actors.length === 0) return;
		setActionError(null);
		setActionDialogState({
			open: true,
			targetState,
			actors,
		});
	};

	const handleConfirmAction = async () => {
		const { targetState, actors } = actionDialogState;
		if (actors.length === 0) return;

		setActionSubmitting(true);
		setActionError(null);

		try {
			const ids = actors.map((a) => a.id);
			await cambiarEstadoActoresAdmin(ids, targetState);

			const count = actors.length;
			const isApproved = targetState === 'A';
			const msg =
				count === 1
					? `El actor cultural "${actors[0].nombre}" fue ${isApproved ? 'aprobado y publicado' : 'rechazado'}.`
					: `Se ${isApproved ? 'aprobaron' : 'rechazaron'} ${count} actores culturales correctamente.`;

			setSnackbarMessage(msg);
			setActionDialogState({ open: false, targetState: 'A', actors: [] });
			setSelectedActorIds((prev) => prev.filter((id) => !ids.includes(Number(id))));

			if (previewOpen) {
				setPreviewOpen(false);
				setPreviewActor(null);
			}

			// Reload list
			setPage(0);
			await loadPendingActores();
		} catch (err: unknown) {
			setActionError(
				err instanceof Error ? err.message : 'No se pudo actualizar el estado de los actores seleccionados.',
			);
		} finally {
			setActionSubmitting(false);
		}
	};

	// Quick Preview Handler
	const handleOpenPreview = async (actor: ActorAdmin) => {
		setPreviewOpen(true);
		setPreviewLoading(true);
		setPreviewError(null);
		setPreviewActor(null);

		try {
			const res = await obtenerActorAdmin(actor.id);
			setPreviewActor(res.data);
		} catch (err: unknown) {
			setPreviewError(
				err instanceof Error ? err.message : 'No se pudieron cargar los detalles completos del actor.',
			);
		} finally {
			setPreviewLoading(false);
		}
	};

	// Columns definition
	const columns: AdminColumn<ActorAdmin, ActorAdminSortBy>[] = [
		{
			id: 'nombre',
			label: 'Actor cultural',
			sortBy: 'nombre',
			minWidth: 230,
			render: (row) => (
				<Stack direction="row" spacing={1.5} alignItems="center">
					<Avatar
						src={row.foto || undefined}
						alt={row.nombre}
						variant="rounded"
						sx={{ width: 44, height: 44, bgcolor: 'primary.light' }}
					>
						{row.nombre.charAt(0).toUpperCase()}
					</Avatar>
					<Box sx={{ minWidth: 0 }}>
						<Typography variant="body2" fontWeight={600} noWrap>
							{row.nombre}
						</Typography>
						<Typography variant="caption" color="text.secondary">
							{typeLabels[row.tipoActor]} {row.cuit ? `· CUIT: ${row.cuit}` : ''}
						</Typography>
					</Box>
				</Stack>
			),
		},
		{
			id: 'categoria',
			label: 'Categoría',
			sortBy: 'categoria',
			minWidth: 170,
			render: (row) => (
				<Stack direction="row" spacing={1} alignItems="center">
					<CategoryIcon icono={row.categoria.icono} fontSize="small" color="primary" />
					<Box>
						<Typography variant="body2">{row.categoria.nombre}</Typography>
						{row.subcategoria && (
							<Typography variant="caption" color="text.secondary">
								{row.subcategoria.nombre}
							</Typography>
						)}
					</Box>
				</Stack>
			),
		},
		{
			id: 'ubicacion',
			label: 'Ubicación',
			sortBy: 'departamento',
			minWidth: 170,
			render: (row) => (
				<Typography variant="body2">
					{row.ubicacion.departamento}
					{row.ubicacion.localidad ? ` · ${row.ubicacion.localidad}` : ''}
				</Typography>
			),
		},
		{
			id: 'dueno',
			label: 'Contacto / Dueño',
			sortBy: 'usuarioDueno',
			minWidth: 190,
			render: (row) => (
				<Stack spacing={0.25}>
					<Typography variant="body2" fontWeight={500}>
						{row.dueno?.nombre || 'Sin contacto'}
					</Typography>
					{row.dueno?.email && (
						<Typography variant="caption" color="text.secondary" noWrap>
							{row.dueno.email}
						</Typography>
					)}
				</Stack>
			),
		},
		// {
		// 	id: 'fechaCreacion',
		// 	label: 'Fecha de solicitud',
		// 	sortBy: 'fechaCreacion',
		// 	minWidth: 150,
		// 	render: (row) => (
		// 		<Typography variant="caption" color="text.secondary">
		// 			{formatDate(row.fechaCreacion)}
		// 		</Typography>
		// 	),
		// },
		{
			id: 'acciones',
			label: 'Acciones',
			minWidth: 180,
			align: 'right',
			render: (row) => (
				<Stack direction="row" spacing={0.75} justifyContent="flex-end" onClick={(e) => e.stopPropagation()}>
					<Tooltip title="Ver detalles y respuestas">
						<IconButton size="small" color="primary" onClick={() => handleOpenPreview(row)}>
							<VisibilityIcon fontSize="small" />
						</IconButton>
					</Tooltip>
					<Tooltip title="Aprobar actor (publicar)">
						<IconButton
							size="small"
							color="success"
							onClick={() => handleOpenActionDialog('A', [row])}
							sx={{
								bgcolor: 'success.lighter',
								'&:hover': { bgcolor: 'success.light' },
							}}
						>
							<CheckCircleOutlineIcon fontSize="small" />
						</IconButton>
					</Tooltip>
					<Tooltip title="Rechazar actor">
						<IconButton
							size="small"
							color="error"
							onClick={() => handleOpenActionDialog('I', [row])}
							sx={{
								bgcolor: 'error.lighter',
								'&:hover': { bgcolor: 'error.light' },
							}}
						>
							<CancelOutlinedIcon fontSize="small" />
						</IconButton>
					</Tooltip>
				</Stack>
			),
		},
	];

	return (
		<PageContainer maxWidth={false}>
			<Stack spacing={3}>
				{/* Top Header Card */}
				<Paper
					variant="outlined"
					sx={{
						p: 3,
						background: (th) =>
							th.palette.mode === 'dark'
								? 'linear-gradient(135deg, rgba(25, 118, 210, 0.15) 0%, rgba(156, 39, 176, 0.05) 100%)'
								: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
						borderRadius: 2,
					}}
				>
					<Grid container spacing={2} alignItems="center">
						<Grid size={{ xs: 12, md: 8 }}>
							<Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
								<ChecklistIcon color="primary" sx={{ fontSize: 32 }} />
								<Typography variant="body2" color="text.secondary">
									Revisá, aprobá o rechazá las fichas de actores culturales enviadas por los usuarios
									que se encuentran pendientes de validación.
								</Typography>
							</Stack>
						</Grid>
						<Grid
							size={{ xs: 12, md: 4 }}
							sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}
						>
							<Card variant="outlined" sx={{ bgcolor: 'background.paper', minWidth: 160 }}>
								<CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
									<Typography variant="caption" color="text.secondary" fontWeight={600}>
										SOLICITUDES PENDIENTES
									</Typography>
									<Typography variant="h4" fontWeight={800} color="warning.main">
										{total}
									</Typography>
								</CardContent>
							</Card>
						</Grid>
					</Grid>
				</Paper>

				{/* Filters */}
				<AdminFilters
					search={search}
					searchPlaceholder="Buscar por nombre, ubicación o contacto…"
					onSearchChange={(value) => {
						setSearch(value);
						setSelectedActorIds([]);
						setPage(0);
					}}
					onClear={() => {
						setSearch('');
						setCategoryId('');
						setDepartment('');
						setActorType('');
						setSelectedActorIds([]);
						setPage(0);
					}}
				>
					<FormControl size="small" sx={{ minWidth: 180 }}>
						<InputLabel>Categoría</InputLabel>
						<Select
							value={categoryId}
							label="Categoría"
							onChange={(e) => {
								setCategoryId(e.target.value);
								setSelectedActorIds([]);
								setPage(0);
							}}
						>
							<MenuItem value="">Todas las categorías</MenuItem>
							{categories.map((cat) => (
								<MenuItem key={cat.id} value={String(cat.id)}>
									{cat.nombre}
								</MenuItem>
							))}
						</Select>
					</FormControl>

					<FormControl size="small" sx={{ minWidth: 160 }}>
						<InputLabel>Departamento</InputLabel>
						<Select
							value={department}
							label="Departamento"
							onChange={(e) => {
								setDepartment(e.target.value);
								setSelectedActorIds([]);
								setPage(0);
							}}
						>
							<MenuItem value="">Todos los deptos.</MenuItem>
							{DEPARTAMENTOS_TUCUMAN.map((dep) => (
								<MenuItem key={dep} value={dep}>
									{dep}
								</MenuItem>
							))}
						</Select>
					</FormControl>

					<FormControl size="small" sx={{ minWidth: 150 }}>
						<InputLabel>Tipo de actor</InputLabel>
						<Select
							value={actorType}
							label="Tipo de actor"
							onChange={(e) => {
								setActorType(e.target.value);
								setSelectedActorIds([]);
								setPage(0);
							}}
						>
							<MenuItem value="">Todos los tipos</MenuItem>
							<MenuItem value="INDIVIDUO">Individuo</MenuItem>
							<MenuItem value="COLECTIVO">Colectivo</MenuItem>
							<MenuItem value="ESPACIO">Espacio</MenuItem>
						</Select>
					</FormControl>
				</AdminFilters>

				{/* Table of pending actors */}
				<AdminTable
					columns={columns}
					rows={rows}
					getRowId={(row) => row.id}
					total={total}
					page={page}
					pageSize={pageSize}
					sortBy={sortBy}
					sortDir={sortDir}
					loading={loading}
					error={error}
					emptyMessage={
						total === 0 && !search && !categoryId && !department && !actorType
							? '¡Al día! No hay actores culturales pendientes de confirmación.'
							: 'No se encontraron actores pendientes con los filtros aplicados.'
					}
					onPageChange={(nextPage) => setPage(nextPage)}
					onSortChange={(nextSortBy, nextSortDir) => {
						setSelectedActorIds([]);
						setSortBy(nextSortBy);
						setSortDir(nextSortDir);
						setPage(0);
					}}
					onRowClick={(row) => handleOpenPreview(row)}
					selectedRowIds={selectedActorIds}
					onSelectionChange={setSelectedActorIds}
					showTopPagination
					infiniteScroll
					hasMore={rows.length < total}
					toolbarActions={
						<Stack direction="row" spacing={1} alignItems="center">
							<Button
								variant="contained"
								color="success"
								size="small"
								startIcon={<CheckCircleOutlineIcon />}
								disabled={selectedActorIds.length === 0}
								onClick={() => handleOpenActionDialog('A')}
							>
								Aprobar seleccionados ({selectedActorIds.length})
							</Button>
							<Button
								variant="outlined"
								color="error"
								size="small"
								startIcon={<CancelOutlinedIcon />}
								disabled={selectedActorIds.length === 0}
								onClick={() => handleOpenActionDialog('I')}
							>
								Rechazar seleccionados ({selectedActorIds.length})
							</Button>
						</Stack>
					}
				/>
			</Stack>

			{/* Modal de confirmación para Aprobar / Rechazar (Individual o Masivo) */}
			<Dialog
				open={actionDialogState.open}
				onClose={() => !actionSubmitting && setActionDialogState((prev) => ({ ...prev, open: false }))}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle fontWeight={700}>
					{actionDialogState.targetState === 'A'
						? actionDialogState.actors.length === 1
							? '¿Aprobar actor cultural?'
							: `¿Aprobar ${actionDialogState.actors.length} actores culturales?`
						: actionDialogState.actors.length === 1
							? '¿Rechazar actor cultural?'
							: `¿Rechazar ${actionDialogState.actors.length} actores culturales?`}
				</DialogTitle>
				<DialogContent>
					<Stack spacing={2} sx={{ mt: 1 }}>
						{actionError && <Alert severity="error">{actionError}</Alert>}

						<DialogContentText>
							{actionDialogState.targetState === 'A' ? (
								<>
									Esta acción cambiará el estado a <strong>Activo</strong>. Los actores culturales
									pasarán a ser visibles públicamente en el mapa y el catálogo cultural:
								</>
							) : (
								<>
									Esta acción cambiará el estado a <strong>Inactivo</strong>. Los actores culturales
									no serán visibles públicamente:
								</>
							)}
						</DialogContentText>

						<Paper
							variant="outlined"
							sx={{
								p: 1.5,
								maxHeight: 180,
								overflowY: 'auto',
								bgcolor: 'action.hover',
							}}
						>
							<Stack spacing={1}>
								{actionDialogState.actors.map((actor) => (
									<Stack key={actor.id} direction="row" spacing={1} alignItems="center">
										<Chip
											label={typeLabels[actor.tipoActor]}
											size="small"
											variant="outlined"
											sx={{ height: 20, fontSize: '0.75rem' }}
										/>
										<Typography variant="body2" fontWeight={600}>
											{actor.nombre}
										</Typography>
										<Typography variant="caption" color="text.secondary">
											({actor.categoria.nombre} · {actor.ubicacion.departamento})
										</Typography>
									</Stack>
								))}
							</Stack>
						</Paper>
					</Stack>
				</DialogContent>
				<DialogActions sx={{ p: 2 }}>
					<Button
						onClick={() => setActionDialogState((prev) => ({ ...prev, open: false }))}
						disabled={actionSubmitting}
					>
						Cancelar
					</Button>
					<Button
						variant="contained"
						color={actionDialogState.targetState === 'A' ? 'success' : 'error'}
						onClick={handleConfirmAction}
						disabled={actionSubmitting}
						startIcon={
							actionSubmitting ? (
								<CircularProgress size={16} color="inherit" />
							) : actionDialogState.targetState === 'A' ? (
								<CheckCircleOutlineIcon />
							) : (
								<CancelOutlinedIcon />
							)
						}
					>
						{actionSubmitting
							? 'Procesando...'
							: actionDialogState.targetState === 'A'
								? 'Sí, aprobar'
								: 'Sí, rechazar'}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Modal de Vista Previa Rápida y Moderación */}
			<Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth scroll="paper">
				<DialogTitle sx={{ pb: 1 }}>
					<Stack direction="row" justifyContent="space-between" alignItems="center">
						<Box>
							<Typography variant="h6" fontWeight={700}>
								Vista previa de moderación
							</Typography>
							<Typography variant="caption" color="text.secondary">
								Revisá toda la información antes de aprobar o rechazar
							</Typography>
						</Box>
						{previewActor && (
							<Button
								size="small"
								endIcon={<OpenInNewIcon fontSize="small" />}
								onClick={() => {
									const slug = buildSlugConId(previewActor.id, previewActor.nombre);
									navigate(`/actoresAdmin/${slug}`);
								}}
							>
								Abrir ficha completa
							</Button>
						)}
					</Stack>
				</DialogTitle>
				<Divider />
				<DialogContent dividers sx={{ p: { xs: 2, md: 3 } }}>
					{previewLoading ? (
						<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
							<CircularProgress />
						</Box>
					) : previewError ? (
						<Alert severity="error">{previewError}</Alert>
					) : previewActor ? (
						<Stack spacing={3}>
							{/* Header con foto y datos principales */}
							<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems={{ sm: 'center' }}>
								<Avatar
									src={previewActor.foto || undefined}
									alt={previewActor.nombre}
									sx={{ width: 80, height: 80, fontSize: '2rem', bgcolor: 'primary.light' }}
								>
									{previewActor.nombre.charAt(0).toUpperCase()}
								</Avatar>
								<Box sx={{ flexGrow: 1 }}>
									<Stack
										direction="row"
										spacing={1}
										alignItems="center"
										flexWrap="wrap"
										sx={{ mb: 0.5 }}
									>
										<Typography variant="h5" fontWeight={700}>
											{previewActor.nombre}
										</Typography>
										<Chip label="Pendiente de revisión" color="warning" size="small" />
									</Stack>
									<Typography variant="body2" color="text.secondary">
										{previewActor.categoria.nombre}{' '}
										{previewActor.subcategoria ? `· ${previewActor.subcategoria.nombre}` : ''} |{' '}
										{typeLabels[previewActor.tipoActor]}
									</Typography>
									<Typography variant="caption" color="text.secondary">
										Registrado el {formatDate(previewActor.fechaCreacion)}
									</Typography>
								</Box>
							</Stack>

							<Divider />

							{/* Datos de contacto y ubicación */}
							<Grid container spacing={2}>
								<Grid size={{ xs: 12, sm: 6 }}>
									<Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
										<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
											<LocationOnOutlinedIcon color="primary" fontSize="small" />
											<Typography variant="subtitle2" fontWeight={700}>
												Ubicación
											</Typography>
										</Stack>
										<Typography variant="body2">
											<strong>Departamento:</strong> {previewActor.ubicacion.departamento}
										</Typography>
										<Typography variant="body2">
											<strong>Localidad:</strong> {previewActor.ubicacion.localidad}
										</Typography>
										<Typography variant="body2">
											<strong>Dirección:</strong> {previewActor.ubicacion.direccion}
										</Typography>
									</Paper>
								</Grid>
								<Grid size={{ xs: 12, sm: 6 }}>
									<Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
										<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
											<PersonOutlineIcon color="primary" fontSize="small" />
											<Typography variant="subtitle2" fontWeight={700}>
												Contacto / Solicitante
											</Typography>
										</Stack>
										<Typography variant="body2">
											<strong>Nombre:</strong> {previewActor.dueno?.nombre || 'No informado'}
										</Typography>
										<Typography variant="body2">
											<strong>Email:</strong> {previewActor.dueno?.email || 'No informado'}
										</Typography>
										{previewActor.cuit && (
											<Typography variant="body2">
												<strong>CUIT:</strong> {previewActor.cuit}
											</Typography>
										)}
									</Paper>
								</Grid>
							</Grid>

							{/* Descripción / Biografía */}
							<Box>
								<Typography variant="subtitle2" fontWeight={700} gutterBottom>
									Descripción / Biografía
								</Typography>
								<Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: 'text.secondary' }}>
									{previewActor.descripcion || 'Sin descripción proporcionada.'}
								</Typography>
							</Box>

							{/* Portafolio */}
							{previewActor.portafolio && previewActor.portafolio.length > 0 && (
								<Box>
									<Typography variant="subtitle2" fontWeight={700} gutterBottom>
										Portafolio ({previewActor.portafolio.length})
									</Typography>
									<Stack spacing={1}>
										{previewActor.portafolio.map((item) => (
											<Stack
												key={item.id}
												direction="row"
												spacing={1.5}
												alignItems="center"
												sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1 }}
											>
												{item.tipo === 'RRSS' ? (
													<InstagramIcon color="primary" fontSize="small" />
												) : item.tipo === 'IMAGEN' ? (
													<CollectionsIcon color="secondary" fontSize="small" />
												) : (
													<LanguageIcon color="action" fontSize="small" />
												)}
												<Box sx={{ minWidth: 0 }}>
													<Typography variant="body2" fontWeight={600} noWrap>
														{item.descripcion}
													</Typography>
													<MuiLink
														href={item.url}
														target="_blank"
														rel="noopener"
														variant="caption"
														color="primary"
													>
														{item.url}
													</MuiLink>
												</Box>
											</Stack>
										))}
									</Stack>
								</Box>
							)}

							{/* Respuestas a formularios / preguntas */}
							{previewActor.encuestas && previewActor.encuestas.length > 0 && (
								<Box>
									<Typography variant="subtitle2" fontWeight={700} gutterBottom>
										Respuestas al formulario
									</Typography>
									<Stack spacing={2}>
										{previewActor.encuestas.map((enc) =>
											enc.secciones.map((sec, secIdx) => (
												<Paper key={secIdx} variant="outlined" sx={{ p: 2 }}>
													<Typography variant="caption" fontWeight={700} color="primary">
														{sec.titulo.toUpperCase()}
													</Typography>
													<Stack spacing={1.5} sx={{ mt: 1 }}>
														{sec.respuestas.map((resp) => (
															<Box key={resp.id}>
																<Typography variant="body2" fontWeight={600}>
																	{resp.pregunta}
																</Typography>
																<Typography variant="body2" color="text.secondary">
																	{Array.isArray(resp.respuesta)
																		? resp.respuesta.join(', ')
																		: resp.respuesta || 'Sin respuesta'}
																</Typography>
															</Box>
														))}
													</Stack>
												</Paper>
											)),
										)}
									</Stack>
								</Box>
							)}

							{/* Mapa de ubicación */}
							{previewActor.ubicacion.latitud && previewActor.ubicacion.longitud && (
								<Box>
									<Typography variant="subtitle2" fontWeight={700} gutterBottom>
										Ubicación geográfica
									</Typography>
									<Paper variant="outlined" sx={{ height: 220, overflow: 'hidden', borderRadius: 2 }}>
										<MapContainer
											center={[previewActor.ubicacion.latitud, previewActor.ubicacion.longitud]}
											zoom={14}
											style={{ height: '100%', width: '100%' }}
											scrollWheelZoom={false}
										>
											<TileLayer
												attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
												url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
											/>
											<CircleMarker
												center={[
													previewActor.ubicacion.latitud,
													previewActor.ubicacion.longitud,
												]}
												fillColor="#1976d2"
												fillOpacity={0.85}
												radius={8}
												stroke
												color="#ffffff"
												weight={2}
											/>
										</MapContainer>
									</Paper>
								</Box>
							)}
						</Stack>
					) : null}
				</DialogContent>
				<DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
					<Button onClick={() => setPreviewOpen(false)}>Cerrar</Button>
					{previewActor && (
						<Stack direction="row" spacing={1.5}>
							<Button
								variant="outlined"
								color="error"
								startIcon={<CancelOutlinedIcon />}
								onClick={() => {
									handleOpenActionDialog('I', [previewActor]);
								}}
							>
								Rechazar ficha
							</Button>
							<Button
								variant="contained"
								color="success"
								startIcon={<CheckCircleOutlineIcon />}
								onClick={() => {
									handleOpenActionDialog('A', [previewActor]);
								}}
							>
								Aprobar y publicar
							</Button>
						</Stack>
					)}
				</DialogActions>
			</Dialog>

			{/* Snackbar Toast notification */}
			<Snackbar
				open={Boolean(snackbarMessage)}
				autoHideDuration={5000}
				onClose={() => setSnackbarMessage(null)}
				message={snackbarMessage}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
			/>
		</PageContainer>
	);
}
