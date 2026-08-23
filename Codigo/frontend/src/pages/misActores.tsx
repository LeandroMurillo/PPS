import * as React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router';

import CollectionsIcon from '@mui/icons-material/Collections';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import GroupIcon from '@mui/icons-material/Group';
import GridViewIcon from '@mui/icons-material/GridView';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import TuneIcon from '@mui/icons-material/Tune';
import ViewListIcon from '@mui/icons-material/ViewList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
	Alert,
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	CardMedia,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	Grid,
	IconButton,
	InputLabel,
	MenuItem,
	Paper,
	Select,
	Stack,
	ToggleButton,
	ToggleButtonGroup,
	Tooltip,
	Typography,
} from '@mui/material';
import { PageContainer } from '@toolpad/core/PageContainer';
import { notify } from '../utils/toast';

import ActorDeleteDialog from '../components/actorDeleteDialog';
import ActorEditDialog from '../components/actorEditDialog';
import ActorEventsDialog from '../components/actorEventsDialog';
import ActorMembersDialog from '../components/actorMembersDialog';
import ActorPortfolioDialog from '../components/actorPortfolioDialog';
import ActorStatusDialog from '../components/actorStatusDialog';
import AdminFilters from '../components/adminFilters';
import AdminTable, { type AdminColumn } from '../components/adminTable';
import CategoryIcon, { type CategoriaIcono } from '../components/categoryIcon';
import {
	listarMisActoresApi,
	obtenerOpcionesRegistroApi,
	renunciarIntegranteApi,
	type OpcionCategoriaRegistro,
} from '../api/actores';
import {
	ESTADO_COLORS as stateColors,
	ESTADO_LABELS as stateLabels,
	TIPO_ACTOR_LABELS as typeLabels,
} from '../constants/estados';
import { useAuth } from '../context/AuthContext';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { markdownToPlainText } from '../utils/markdown';
import { buildSlugConId } from '../utils/slug';

function normalizeCatalogName(value: string): string {
	return value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.trim()
		.toLocaleLowerCase('es');
}

function findCategoryByName(options: OpcionCategoriaRegistro[], categoryName: string) {
	const normalizedName = normalizeCatalogName(categoryName);
	return options.find((category) => normalizeCatalogName(category.nombre) === normalizedName) ?? null;
}

function getCategoryIdByName(options: OpcionCategoriaRegistro[], categoryName: string): number | undefined {
	return findCategoryByName(options, categoryName)?.id;
}

export type MyActorPortfolioItem = {
	id: number;
	tipo: 'IMAGEN' | 'LINK' | 'RRSS';
	descripcion: string;
	url: string;
};

export type MyActorEvent = {
	id: number;
	nombre: string;
	descripcion: string;
	fecha: string;
};

export type MyActor = {
	id: number;
	idUsuarioDueno: number;
	nombre: string;
	tipoActor: 'INDIVIDUO' | 'COLECTIVO' | 'ESPACIO';
	categoria: string;
	categoriaIcono?: CategoriaIcono;
	subcategoria: string | null;
	departamento: string;
	localidad: string;
	direccion: string;
	latitud?: number | null;
	longitud?: number | null;
	esPublica?: boolean;
	cuit: string | null;
	descripcion: string;
	fotoPerfilUrl: string | null;
	estado: 'A' | 'P' | 'I';
	fechaCreacion: string;
	esDueno?: boolean;
	rolEnActor?: string | null;
	portafolio?: MyActorPortfolioItem[];
	eventos?: MyActorEvent[];
};

export default function MisActoresPage() {
	const navigate = useNavigate();
	const { user } = useAuth();

	const userId = user?.idUsuario;

	const [actores, setActores] = React.useState<MyActor[]>([]);
	const [categoryOptions, setCategoryOptions] = React.useState<OpcionCategoriaRegistro[]>([]);
	const [catalogError, setCatalogError] = React.useState<string | null>(null);
	const [loading, setLoading] = React.useState<boolean>(true);
	const [error, setError] = React.useState<string | null>(null);

	const [search, setSearch] = React.useState('');
	const [categoryFilter, setCategoryFilter] = React.useState('');
	const [stateFilter, setStateFilter] = React.useState('');
	const [viewMode, setViewMode] = React.useState<'grid' | 'table'>('grid');

	// Edit Modal
	const [editModalOpen, setEditModalOpen] = React.useState(false);
	const [editingActor, setEditingActor] = React.useState<MyActor | null>(null);

	// Status Change Modal
	const [statusModalOpen, setStatusModalOpen] = React.useState(false);
	const [targetStatusActor, setTargetStatusActor] = React.useState<MyActor | null>(null);

	// Portfolio Management Modal
	const [portfolioModalOpen, setPortfolioModalOpen] = React.useState(false);
	const [targetPortfolioActor, setTargetPortfolioActor] = React.useState<MyActor | null>(null);

	// Events Management Modal
	const [eventsModalOpen, setEventsModalOpen] = React.useState(false);
	const [targetEventsActor, setTargetEventsActor] = React.useState<MyActor | null>(null);

	// Members Management Modal
	const [membersModalOpen, setMembersModalOpen] = React.useState(false);
	const [targetMembersActor, setTargetMembersActor] = React.useState<MyActor | null>(null);

	// Delete Modal
	const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
	const [targetDeleteActor, setTargetDeleteActor] = React.useState<MyActor | null>(null);

	// Resign Modal
	const [resignModalOpen, setResignModalOpen] = React.useState(false);
	const [targetResignActor, setTargetResignActor] = React.useState<MyActor | null>(null);
	const [resigning, setResigning] = React.useState(false);

	const handleOpenResignModal = (actor: MyActor) => {
		setTargetResignActor(actor);
		setResignModalOpen(true);
	};

	const handleCloseResignModal = () => {
		if (resigning) return;
		setResignModalOpen(false);
		setTargetResignActor(null);
	};

	const handleConfirmResign = async () => {
		if (!targetResignActor) return;
		setResigning(true);
		try {
			await renunciarIntegranteApi(targetResignActor.id);
			notify.success(`Has renunciado a ${targetResignActor.nombre}.`, { scope: 'mis-actores' });
			handleCloseResignModal();
			await fetchMisActores();
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'Error al procesar la renuncia.';
			notify.error(errMsg, { scope: 'mis-actores' });
		} finally {
			setResigning(false);
		}
	};

	const debouncedSearch = useDebouncedValue(search);

	React.useEffect(() => {
		const controller = new AbortController();
		void obtenerOpcionesRegistroApi(controller.signal)
			.then((response) => {
				setCategoryOptions(response.data);
				setCatalogError(null);
			})
			.catch((loadError: unknown) => {
				if (!controller.signal.aborted) {
					setCatalogError(
						loadError instanceof Error ? loadError.message : 'No se pudo cargar el catálogo de categorías.',
					);
				}
			});

		return () => controller.abort();
	}, []);

	// Load actors directly from backend API (database)
	const fetchMisActores = React.useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const res = await listarMisActoresApi({
				busqueda: debouncedSearch || undefined,
				estado: (stateFilter as 'A' | 'P' | 'I') || undefined,
				idCategoria: categoryFilter ? getCategoryIdByName(categoryOptions, categoryFilter) : undefined,
			});

			if (res?.data) {
				const mapApiActores: MyActor[] = res.data.map((item) => ({
					id: item.id,
					idUsuarioDueno: userId ?? 0,
					nombre: item.nombre,
					tipoActor: item.tipoActor,
					categoria: item.categoria,
					categoriaIcono: item.categoriaIcono,
					subcategoria: item.subcategoria,
					departamento: item.ubicacion.departamento,
					localidad: item.ubicacion.localidad,
					direccion: item.ubicacion.direccion,
					latitud: item.ubicacion.latitud,
					longitud: item.ubicacion.longitud,
					esPublica: item.ubicacion.esPublica ?? true,
					cuit: item.cuit,
					descripcion: item.descripcion,
					fotoPerfilUrl: item.foto,
					estado: item.estado,
					fechaCreacion: item.fechaCreacion,
					esDueno: item.esDueno ?? true,
					rolEnActor: item.rolEnActor ?? null,
					portafolio: [],
					eventos: [],
				}));
				setActores(mapApiActores);
			} else {
				setActores([]);
			}
		} catch (err) {
			console.error('Error al obtener actores del backend:', err);
			const msg = 'No se pudieron cargar los actores culturales desde la base de datos.';
			setError(msg);
			notify.error(msg, { scope: 'mis-actores' });
			setActores([]);
		} finally {
			setLoading(false);
		}
	}, [debouncedSearch, stateFilter, categoryFilter, userId, categoryOptions]);

	React.useEffect(() => {
		fetchMisActores();
	}, [fetchMisActores]);

	// Filtered list based on search, category, and state
	const filteredActores = React.useMemo(() => {
		return actores.filter((actor) => {
			const matchesSearch =
				!debouncedSearch ||
				actor.nombre.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
				actor.categoria.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
				actor.departamento.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
				actor.localidad.toLowerCase().includes(debouncedSearch.toLowerCase());

			const matchesCategory = !categoryFilter || actor.categoria === categoryFilter;
			const matchesState = !stateFilter || actor.estado === stateFilter;

			return matchesSearch && matchesCategory && matchesState;
		});
	}, [actores, debouncedSearch, categoryFilter, stateFilter]);

	// Open Edit Dialog
	const handleOpenEdit = (actor: MyActor) => {
		setEditingActor(actor);
		setEditModalOpen(true);
	};

	// Open Status Change Modal
	const handleOpenStatusModal = (actor: MyActor) => {
		setTargetStatusActor(actor);
		setStatusModalOpen(true);
	};

	// Open Portfolio Modal
	const handleOpenPortfolioModal = (actor: MyActor) => {
		setTargetPortfolioActor(actor);
		setPortfolioModalOpen(true);
	};

	// Open Events Modal
	const handleOpenEventsModal = (actor: MyActor) => {
		setTargetEventsActor(actor);
		setEventsModalOpen(true);
	};

	// Open Members Modal
	const handleOpenMembersModal = (actor: MyActor) => {
		setTargetMembersActor(actor);
		setMembersModalOpen(true);
	};

	// Open Delete Confirmation Modal
	const handleOpenDeleteModal = (actor: MyActor) => {
		setTargetDeleteActor(actor);
		setDeleteModalOpen(true);
	};

	// Table Columns definition for AdminTable view mode
	const columns: AdminColumn<MyActor, string>[] = [
		{
			id: 'nombre',
			label: 'Actor cultural',
			minWidth: 200,
			render: (row) => (
				<Stack spacing={0.5}>
					<Stack direction="row" spacing={1} alignItems="center">
						<Typography variant="body2" fontWeight={600}>
							{row.nombre}
						</Typography>
						{row.esDueno ? (
							<Chip label="Titular" size="small" color="primary" sx={{ height: 20, fontSize: 10 }} />
						) : (
							<Chip
								label={row.rolEnActor ? `Integrante (${row.rolEnActor})` : 'Integrante'}
								size="small"
								variant="outlined"
								color="secondary"
								sx={{ height: 20, fontSize: 10 }}
							/>
						)}
					</Stack>
					<Typography variant="caption" color="text.secondary">
						{typeLabels[row.tipoActor]}
					</Typography>
				</Stack>
			),
		},
		{
			id: 'categoria',
			label: 'Categoría',
			minWidth: 160,
			render: (row) => (
				<Stack spacing={0.25}>
					<Typography variant="body2">{row.categoria}</Typography>
					{row.subcategoria && (
						<Typography variant="caption" color="text.secondary">
							{row.subcategoria}
						</Typography>
					)}
				</Stack>
			),
		},
		{
			id: 'ubicacion',
			label: 'Ubicación',
			minWidth: 180,
			render: (row) => `${row.departamento} · ${row.localidad}`,
		},
		{
			id: 'estado',
			label: 'Estado',
			render: (row) => <Chip label={stateLabels[row.estado]} color={stateColors[row.estado]} size="small" />,
		},
		{
			id: 'acciones',
			label: 'Acciones',
			align: 'right',
			minWidth: 270,
			render: (row) => (
				<Stack direction="row" spacing={0.5} justifyContent="flex-end" onClick={(e) => e.stopPropagation()}>
					<Tooltip title="Ver perfil público">
						<IconButton
							size="small"
							color="info"
							onClick={() =>
								navigate(`/actores/${buildSlugConId(row.id, row.nombre)}?from=/mis-actores`, {
									state: { isMyActor: true },
								})
							}
						>
							<VisibilityIcon fontSize="small" />
						</IconButton>
					</Tooltip>

					{row.esDueno ? (
						<>
							<Tooltip title="Editar datos del actor">
								<IconButton size="small" color="primary" onClick={() => handleOpenEdit(row)}>
									<EditIcon fontSize="small" />
								</IconButton>
							</Tooltip>

							<Tooltip title="Gestionar integrantes">
								<IconButton size="small" color="secondary" onClick={() => handleOpenMembersModal(row)}>
									<GroupIcon fontSize="small" />
								</IconButton>
							</Tooltip>

							<Tooltip title="Gestionar portafolio">
								<IconButton size="small" color="secondary" onClick={() => handleOpenPortfolioModal(row)}>
									<CollectionsIcon fontSize="small" />
								</IconButton>
							</Tooltip>

							<Tooltip title="Gestionar eventos">
								<IconButton size="small" color="secondary" onClick={() => handleOpenEventsModal(row)}>
									<EventIcon fontSize="small" />
								</IconButton>
							</Tooltip>

							<Tooltip title="Gestionar estado">
								<IconButton size="small" color="warning" onClick={() => handleOpenStatusModal(row)}>
									<TuneIcon fontSize="small" />
								</IconButton>
							</Tooltip>

							<Tooltip title="Borrar definitivamente">
								<IconButton size="small" color="error" onClick={() => handleOpenDeleteModal(row)}>
									<DeleteOutlineIcon fontSize="small" />
								</IconButton>
							</Tooltip>
						</>
					) : (
						<Tooltip title="Renunciar a ser integrante">
							<IconButton size="small" color="error" onClick={() => handleOpenResignModal(row)}>
								<ExitToAppIcon fontSize="small" />
							</IconButton>
						</Tooltip>
					)}
				</Stack>
			),
		},
	];

	return (
		<PageContainer title="Mis actores culturales" maxWidth={false}>
			<Stack spacing={3}>
				{/* --- Header Banner --- */}
				<Paper
					variant="outlined"
					sx={{
						p: { xs: 2.5, md: 3 },
						borderRadius: 2,
						bgcolor: 'background.paper',
						boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
					}}
				>
					<Stack
						direction={{ xs: 'column', sm: 'row' }}
						spacing={2}
						justifyContent="space-between"
						alignItems={{ xs: 'stretch', sm: 'center' }}
					>
						<Box>
							<Typography variant="body2" color="text.secondary">
								Gestioná tus perfiles artísticos. Podés editar sus datos, administrar portafolios y
								eventos, pasarlos a revisión (Pendiente), dar de baja o eliminarlos.
							</Typography>
						</Box>
						<Stack direction="row" spacing={1.5} sx={{ flexShrink: 0 }}>
							<Button
								variant="contained"
								color="primary"
								startIcon={<PersonAddIcon />}
								onClick={() => navigate('/actores/nuevo')}
								sx={{ fontWeight: 600, py: 1, px: 2.5 }}
							>
								Registrar nuevo actor
							</Button>
						</Stack>
					</Stack>
				</Paper>
				{catalogError && (
					<Alert severity="warning" variant="outlined">
						No se pudo cargar el catálogo para filtros y edición. {catalogError}
					</Alert>
				)}

				{/* --- Filters & View Controls --- */}
				<AdminFilters
					search={search}
					searchPlaceholder="Buscar por nombre, categoría, departamento o localidad..."
					onSearchChange={setSearch}
					onClear={() => {
						setSearch('');
						setCategoryFilter('');
						setStateFilter('');
					}}
				>
					<FormControl size="small" sx={{ minWidth: 180 }}>
						<InputLabel>Categoría</InputLabel>
						<Select
							value={categoryFilter}
							label="Categoría"
							onChange={(e) => setCategoryFilter(e.target.value)}
						>
							<MenuItem value="">Todas</MenuItem>
							{categoryOptions.map((category) => (
								<MenuItem key={category.id} value={category.nombre}>
									{category.nombre}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<FormControl size="small" sx={{ minWidth: 160 }}>
						<InputLabel>Estado</InputLabel>
						<Select value={stateFilter} label="Estado" onChange={(e) => setStateFilter(e.target.value)}>
							<MenuItem value="">Todos</MenuItem>
							{Object.entries(stateLabels).map(([key, label]) => (
								<MenuItem key={key} value={key}>
									{label}
								</MenuItem>
							))}
						</Select>
					</FormControl>

					<Box sx={{ flexGrow: 1 }} />

					<ToggleButtonGroup
						value={viewMode}
						exclusive
						onChange={(_e, nextMode) => nextMode && setViewMode(nextMode)}
						size="small"
						aria-label="Modo de vista"
					>
						<ToggleButton value="grid" aria-label="Vista en tarjetas">
							<Tooltip title="Vista en tarjetas">
								<GridViewIcon fontSize="small" />
							</Tooltip>
						</ToggleButton>
						<ToggleButton value="table" aria-label="Vista en tabla">
							<Tooltip title="Vista en tabla">
								<ViewListIcon fontSize="small" />
							</Tooltip>
						</ToggleButton>
					</ToggleButtonGroup>
				</AdminFilters>

				{/* --- Results Summary --- */}
				<Typography variant="body2" color="text.secondary">
					{loading
						? 'Cargando actores desde la base de datos...'
						: filteredActores.length === 1
							? '1 actor cultural propio encontrado'
							: `${filteredActores.length} actores culturales propios encontrados`}
				</Typography>

				{/* --- Content Area --- */}
				{loading ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
						<CircularProgress />
					</Box>
				) : error ? (
					<Alert severity="error" sx={{ my: 2 }}>
						{error}
					</Alert>
				) : filteredActores.length === 0 ? (
					<Paper variant="outlined" sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
						<Typography variant="h6" color="text.secondary" gutterBottom>
							No tenés actores registrados con estos criterios
						</Typography>
						<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
							{actores.length === 0
								? 'Todavía no registraste ningún actor cultural propio en tu cuenta.'
								: 'Modificá los filtros de búsqueda para volver a ver tus actores.'}
						</Typography>
						<Button
							variant="contained"
							startIcon={<PersonAddIcon />}
							onClick={() => navigate('/actores/nuevo')}
						>
							Registrar nuevo actor
						</Button>
					</Paper>
				) : viewMode === 'grid' ? (
					/* --- Cards Grid --- */
					<Grid container spacing={3}>
						{filteredActores.map((actor) => (
							<Grid key={actor.id} size={{ xs: 12, sm: 6, lg: 4 }}>
								<Card
									variant="outlined"
									sx={{
										height: '100%',
										display: 'flex',
										flexDirection: 'column',
										borderRadius: 2,
										transition: 'transform 0.2s ease, box-shadow 0.2s ease',
										'&:hover': {
											transform: 'translateY(-3px)',
											boxShadow: (theme) => theme.shadows[4],
										},
									}}
								>
									<Box
										component={RouterLink}
										to={`/actores/${buildSlugConId(actor.id, actor.nombre)}?from=/mis-actores`}
										state={{ isMyActor: true }}
										aria-label={`Ver perfil público de ${actor.nombre}`}
										sx={{ display: 'block', textDecoration: 'none' }}
									>
										{actor.fotoPerfilUrl ? (
											<CardMedia
												component="img"
												height="180"
												image={actor.fotoPerfilUrl}
												alt={`Foto de ${actor.nombre}`}
												sx={{ objectFit: 'cover' }}
											/>
										) : (
											<Box
												sx={{
													height: 180,
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													bgcolor: 'action.hover',
													color: 'text.secondary',
												}}
											>
												<Typography variant="body2" color="text.secondary">
													Sin foto de perfil
												</Typography>
											</Box>
										)}
									</Box>

									<CardContent sx={{ flexGrow: 1, p: 2.5 }}>
										<Stack
											direction="row"
											justifyContent="space-between"
											alignItems="flex-start"
											sx={{ mb: 1 }}
										>
											<Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.3 }}>
												{actor.nombre}
											</Typography>
											<Chip
												label={stateLabels[actor.estado]}
												color={stateColors[actor.estado]}
												size="small"
												sx={{ fontWeight: 600 }}
											/>
										</Stack>

										<Stack
											direction="row"
											spacing={0.75}
											flexWrap="wrap"
											useFlexGap
											sx={{ mb: 1.5 }}
										>
											<Chip
												icon={
													<CategoryIcon
														icono={actor.categoriaIcono || 'Category'}
														fontSize="small"
													/>
												}
												label={actor.categoria}
												size="small"
												color="primary"
												variant="outlined"
											/>
											<Chip label={typeLabels[actor.tipoActor]} size="small" variant="outlined" />
											{actor.esDueno ? (
												<Chip label="Titular" size="small" color="primary" sx={{ fontWeight: 600 }} />
											) : (
												<Chip
													label={actor.rolEnActor ? `Integrante (${actor.rolEnActor})` : 'Integrante'}
													size="small"
													color="secondary"
													variant="outlined"
													sx={{ fontWeight: 600 }}
												/>
											)}
										</Stack>

										<Stack
											direction="row"
											spacing={0.5}
											alignItems="center"
											color="text.secondary"
											sx={{ mb: 1.5 }}
										>
											<LocationOnIcon fontSize="small" color="action" />
											<Typography variant="caption" fontWeight={500}>
												{actor.departamento} · {actor.localidad}
											</Typography>
										</Stack>

										<Typography
											variant="body2"
											color="text.secondary"
											sx={{
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												display: '-webkit-box',
												WebkitLineClamp: 3,
												WebkitBoxOrient: 'vertical',
											}}
										>
											{markdownToPlainText(actor.descripcion)}
										</Typography>
									</CardContent>

									<CardActions
										sx={{
											p: 2,
											pt: 1,
											justifyContent: 'space-between',
											borderTop: '1px solid',
											borderColor: 'divider',
										}}
									>
										<Button
											size="small"
											startIcon={<VisibilityIcon />}
											component={RouterLink}
											to={`/actores/${buildSlugConId(actor.id, actor.nombre)}?from=/mis-actores`}
											state={{ isMyActor: true }}
										>
											Ver perfil
										</Button>

										<Stack direction="row" spacing={0.5}>
											{actor.esDueno ? (
												<>
													<Tooltip title="Editar actor">
														<IconButton
															size="small"
															color="primary"
															onClick={() => handleOpenEdit(actor)}
														>
															<EditIcon fontSize="small" />
														</IconButton>
													</Tooltip>

													<Tooltip title="Gestionar integrantes">
														<IconButton
															size="small"
															color="secondary"
															onClick={() => handleOpenMembersModal(actor)}
														>
															<GroupIcon fontSize="small" />
														</IconButton>
													</Tooltip>

													<Tooltip title="Gestionar portafolio">
														<IconButton
															size="small"
															color="secondary"
															onClick={() => handleOpenPortfolioModal(actor)}
														>
															<CollectionsIcon fontSize="small" />
														</IconButton>
													</Tooltip>

													<Tooltip title="Gestionar eventos">
														<IconButton
															size="small"
															color="secondary"
															onClick={() => handleOpenEventsModal(actor)}
														>
															<EventIcon fontSize="small" />
														</IconButton>
													</Tooltip>

													<Tooltip title="Gestionar estado">
														<IconButton
															size="small"
															color="warning"
															onClick={() => handleOpenStatusModal(actor)}
														>
															<TuneIcon fontSize="small" />
														</IconButton>
													</Tooltip>

													<Tooltip title="Borrar definitivamente">
														<IconButton
															size="small"
															color="error"
															onClick={() => handleOpenDeleteModal(actor)}
														>
															<DeleteOutlineIcon fontSize="small" />
														</IconButton>
													</Tooltip>
												</>
											) : (
												<Tooltip title="Renunciar a ser integrante">
													<Button
														size="small"
														color="error"
														variant="outlined"
														startIcon={<ExitToAppIcon />}
														onClick={() => handleOpenResignModal(actor)}
													>
														Renunciar
													</Button>
												</Tooltip>
											)}
										</Stack>
									</CardActions>
								</Card>
							</Grid>
						))}
					</Grid>
				) : (
					/* --- Table View --- */
					<AdminTable
						columns={columns}
						rows={filteredActores}
						getRowId={(row) => row.id}
						total={filteredActores.length}
						page={0}
						pageSize={25}
						sortBy="idActor"
						sortDir="ASC"
						loading={false}
						error={null}
						emptyMessage="No tenés actores cargados con esos criterios."
						onPageChange={() => {}}
						onSortChange={() => {}}
						onRowClick={(row) =>
							navigate(`/actores/${buildSlugConId(row.id, row.nombre)}?from=/mis-actores`, {
								state: { isMyActor: true },
							})
						}
					/>
				)}
			</Stack>

			{/* Edit Dialog */}
			<ActorEditDialog
				open={editModalOpen}
				actor={editingActor}
				categoryOptions={categoryOptions}
				onClose={() => {
					setEditModalOpen(false);
					setEditingActor(null);
				}}
				onActorUpdated={(updatedActor) => {
					setActores((prev) => prev.map((a) => (a.id === updatedActor.id ? updatedActor : a)));
				}}
			/>

			{/* Status Dialog */}
			<ActorStatusDialog
				open={statusModalOpen}
				actor={targetStatusActor}
				onClose={() => {
					setStatusModalOpen(false);
					setTargetStatusActor(null);
				}}
				onStatusChanged={(actorId, nextStatus) => {
					setActores((prev) => prev.map((a) => (a.id === actorId ? { ...a, estado: nextStatus } : a)));
				}}
			/>

			{/* Portfolio Dialog */}
			<ActorPortfolioDialog
				open={portfolioModalOpen}
				actor={targetPortfolioActor}
				onClose={() => {
					setPortfolioModalOpen(false);
					setTargetPortfolioActor(null);
				}}
				onPortfolioChange={(actorId, updatedPortfolio) => {
					setActores((prev) =>
						prev.map((a) => (a.id === actorId ? { ...a, portafolio: updatedPortfolio } : a)),
					);
				}}
			/>

			{/* Members Dialog */}
			<ActorMembersDialog
				open={membersModalOpen}
				actor={targetMembersActor}
				onClose={() => {
					setMembersModalOpen(false);
					setTargetMembersActor(null);
				}}
			/>

			{/* Events Dialog */}
			<ActorEventsDialog
				open={eventsModalOpen}
				actor={targetEventsActor}
				onClose={() => {
					setEventsModalOpen(false);
					setTargetEventsActor(null);
				}}
				onEventsChange={(actorId, updatedEvents) => {
					setActores((prev) => prev.map((a) => (a.id === actorId ? { ...a, eventos: updatedEvents } : a)));
				}}
			/>

			{/* Delete Dialog */}
			<ActorDeleteDialog
				open={deleteModalOpen}
				actor={targetDeleteActor}
				onClose={() => {
					setDeleteModalOpen(false);
					setTargetDeleteActor(null);
				}}
				onActorDeleted={(actorId) => {
					setActores((prev) => prev.filter((a) => a.id !== actorId));
				}}
			/>

			{/* Resign Dialog */}
			<Dialog
				open={resignModalOpen}
				onClose={handleCloseResignModal}
				maxWidth="xs"
				fullWidth
			>
				<DialogTitle fontWeight={700}>Renunciar a ser integrante</DialogTitle>
				<DialogContent dividers>
					<Stack spacing={2}>
						<Typography variant="body2">
							¿Estás seguro de que deseás renunciar a ser integrante de{' '}
							<strong>{targetResignActor?.nombre}</strong>?
						</Typography>
						<Alert severity="info">
							Tu membresía en este actor cultural será eliminada y dejarás de figurar en su nómina de integrantes.
						</Alert>
					</Stack>
				</DialogContent>
				<DialogActions sx={{ p: 2 }}>
					<Button onClick={handleCloseResignModal} disabled={resigning}>
						Cancelar
					</Button>
					<Button
						variant="contained"
						color="error"
						onClick={handleConfirmResign}
						disabled={resigning}
						startIcon={resigning ? <CircularProgress size={16} /> : <ExitToAppIcon />}
					>
						{resigning ? 'Procesando...' : 'Renunciar al actor'}
					</Button>
				</DialogActions>
			</Dialog>
		</PageContainer>
	);
}
