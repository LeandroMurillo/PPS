import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import AddIcon from '@mui/icons-material/Add';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { PageContainer } from '@toolpad/core/PageContainer';

import {
	crearCategoriaAdmin,
	editarCategoriaAdmin,
	eliminarCategoriaAdmin,
	listarCategoriasAdmin,
	obtenerCategoriaAdmin,
	type CategoriaAdmin,
	type CategoriaAdminSortBy,
	type CategoriaIcono,
	type SortDirection,
} from '../api/admin';
import AdminFilters from '../components/adminFilters';
import AdminTable, { type AdminColumn } from '../components/adminTable';
import CategoryIcon, { CATEGORY_ICON_OPTIONS, categoryIcons, isCategoriaIcono } from '../components/categoryIcon';
import { toast } from 'react-toastify';
import { ESTADO_CATEGORIA_LABELS as stateLabels, ESTADO_COLORS as stateColors } from '../constants/estados';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { buildSlugSinId } from '../utils/slug';

const pageSize = 25;

export default function AdminCategoriasPage() {
	const navigate = useNavigate();
	const location = useLocation();

	const [search, setSearch] = React.useState('');
	const [state, setState] = React.useState('');
	const [page, setPage] = React.useState(0);
	const [sortBy, setSortBy] = React.useState<CategoriaAdminSortBy>('estado');
	const [sortDir, setSortDir] = React.useState<SortDirection>('ASC');

	const [categorias, setCategorias] = React.useState<CategoriaAdmin[]>([]);
	const [total, setTotal] = React.useState(0);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);

	// Dialog states
	const [dialogOpen, setDialogOpen] = React.useState(false);
	const [editingCategoria, setEditingCategoria] = React.useState<CategoriaAdmin | null>(null);
	const [formNombre, setFormNombre] = React.useState('');
	const [formIcono, setFormIcono] = React.useState<CategoriaIcono>('Category');
	const [formEstado, setFormEstado] = React.useState<'A' | 'I'>('A');
	const [formError, setFormError] = React.useState<string | null>(null);
	const [formSubmitting, setFormSubmitting] = React.useState(false);

	// Delete dialog states
	const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
	const [deletingCategoria, setDeletingCategoria] = React.useState<CategoriaAdmin | null>(null);
	const [deleteSubmitting, setDeleteSubmitting] = React.useState(false);

	const debouncedSearch = useDebouncedValue(search, 300);

	const fetchCategorias = React.useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const res = await listarCategoriasAdmin({
				busqueda: debouncedSearch.trim() || undefined,
				estado: (state as CategoriaAdmin['estado']) || undefined,
				limit: pageSize,
				offset: page * pageSize,
				sortBy,
				sortDir,
			});

			setCategorias(res.data);
			setTotal(res.pagination.total);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Error al cargar las categorías');
		} finally {
			setLoading(false);
		}
	}, [debouncedSearch, state, page, sortBy, sortDir]);

	React.useEffect(() => {
		void fetchCategorias();
	}, [fetchCategorias]);

	// Handle direct URL route params for /categorias/new or /categorias/:id/edit
	React.useEffect(() => {
		const matchEdit = location.pathname.match(/\/categorias\/(\d+)\/edit$/);
		const isNew = location.pathname.replace(/\/$/, '') === '/categorias/new';

		if (isNew) {
			setEditingCategoria(null);
			setFormNombre('');
			setFormIcono('Category');
			setFormEstado('A');
			setFormError(null);
			setDialogOpen(true);
		} else if (matchEdit) {
			const id = Number(matchEdit[1]);
			void obtenerCategoriaAdmin(id)
				.then((res) => {
					setEditingCategoria(res.data);
					setFormNombre(res.data.nombre);
					setFormIcono(res.data.icono);
					setFormEstado(res.data.estado);
					setFormError(null);
					setDialogOpen(true);
				})
				.catch(() => {
					navigate('/categorias', { replace: true });
				});
		}
	}, [location.pathname, navigate]);

	const handleCloseDialog = () => {
		setDialogOpen(false);
		if (location.pathname !== '/categorias') {
			navigate('/categorias', { replace: true });
		}
	};

	const handleOpenCreate = () => {
		setEditingCategoria(null);
		setFormNombre('');
		setFormIcono('Category');
		setFormEstado('A');
		setFormError(null);
		setDialogOpen(true);
	};

	const handleOpenEdit = (cat: CategoriaAdmin) => {
		setEditingCategoria(cat);
		setFormNombre(cat.nombre);
		setFormIcono(cat.icono);
		setFormEstado(cat.estado);
		setFormError(null);
		setDialogOpen(true);
	};

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();

		const trimmedNombre = formNombre.trim();
		if (!trimmedNombre) {
			setFormError('El nombre es obligatorio.');
			return;
		}

		setFormSubmitting(true);
		setFormError(null);

		try {
			if (editingCategoria) {
				await editarCategoriaAdmin(editingCategoria.id, {
					nombre: trimmedNombre,
					icono: formIcono,
					estado: formEstado,
				});
				toast.success(`Categoría "${trimmedNombre}" modificada correctamente.`);
			} else {
				await crearCategoriaAdmin({
					nombre: trimmedNombre,
					icono: formIcono,
					estado: formEstado,
				});
				toast.success(`Categoría "${trimmedNombre}" creada correctamente.`);
			}

			handleCloseDialog();
			void fetchCategorias();
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'Ocurrió un error al guardar la categoría.';
			setFormError(errMsg);
			toast.error(errMsg);
		} finally {
			setFormSubmitting(false);
		}
	};

	const handleOpenDelete = (cat: CategoriaAdmin) => {
		setDeletingCategoria(cat);
		setDeleteDialogOpen(true);
	};

	const handleDelete = async () => {
		if (!deletingCategoria) return;

		setDeleteSubmitting(true);

		try {
			await eliminarCategoriaAdmin(deletingCategoria.id);
			toast.info(`Categoría "${deletingCategoria.nombre}" dada de baja correctamente.`);
			setDeleteDialogOpen(false);
			setDeletingCategoria(null);
			void fetchCategorias();
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'No se pudo dar de baja la categoría';
			setError(errMsg);
			toast.error(errMsg);
		} finally {
			setDeleteSubmitting(false);
		}
	};

	const columns: AdminColumn<CategoriaAdmin, CategoriaAdminSortBy>[] = [
		{
			id: 'categoria',
			label: 'Categoría',
			sortBy: 'nombre',
			minWidth: 240,
			render: (row) => <CategoryIcon icono={row.icono} label={row.nombre} withLabel />,
		},
		{
			id: 'estado',
			label: 'Estado',
			sortBy: 'estado',
			render: (row) => <Chip label={stateLabels[row.estado]} color={stateColors[row.estado]} size="small" />,
		},
		{
			id: 'cantidadSubcategorias',
			label: 'Subcategorías',
			sortBy: 'cantidadSubcategorias',
			align: 'right',
			render: (row) => row.cantidadSubcategorias,
		},
		{
			id: 'cantidadActores',
			label: 'Actores',
			sortBy: 'cantidadActores',
			align: 'right',
			render: (row) => row.cantidadActores,
		},
		{
			id: 'acciones',
			label: 'Acciones',
			align: 'center',
			render: (row) => (
				<Stack direction="row" spacing={1} justifyContent="center" onClick={(e) => e.stopPropagation()}>
					<Tooltip title="Administrar formulario">
						<IconButton
							size="small"
							color="primary"
							onClick={() => navigate(`/categorias/${buildSlugSinId(row.nombre, row.id)}/formulario`)}
						>
							<AssignmentIcon fontSize="small" />
						</IconButton>
					</Tooltip>
					<Tooltip title="Modificar categoría">
						<IconButton size="small" onClick={() => handleOpenEdit(row)}>
							<EditIcon fontSize="small" />
						</IconButton>
					</Tooltip>
					<Tooltip title="Dar de baja">
						<IconButton size="small" color="error" onClick={() => handleOpenDelete(row)}>
							<DeleteIcon fontSize="small" />
						</IconButton>
					</Tooltip>
				</Stack>
			),
		},
	];

	return (
		<PageContainer title="" maxWidth={false}>
			<Stack spacing={2.5}>
				<Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} flexWrap="wrap">
					<Stack direction="row" alignItems="center" spacing={1.5}>
						<Typography variant="h6" fontWeight={600}>
							Administrar categorías
						</Typography>
						<Chip label={`${total}`} size="small" color="primary" variant="outlined" />
					</Stack>

					<Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
						Nueva categoría
					</Button>
				</Stack>

				<AdminFilters
					search={search}
					onSearchChange={(val) => {
						setSearch(val);
						setPage(0);
					}}
					searchPlaceholder="Buscar categoría..."
					onClear={() => {
						setSearch('');
						setState('');
						setPage(0);
					}}
				>
					<FormControl size="small" sx={{ minWidth: 140 }}>
						<InputLabel id="cat-estado-label">Estado</InputLabel>
						<Select
							labelId="cat-estado-label"
							value={state}
							label="Estado"
							onChange={(e) => {
								setState(e.target.value);
								setPage(0);
							}}
						>
							<MenuItem value="">Todas</MenuItem>
							<MenuItem value="A">Activas</MenuItem>
							<MenuItem value="I">Inactivas</MenuItem>
						</Select>
					</FormControl>
				</AdminFilters>

				<AdminTable
					columns={columns}
					rows={categorias}
					getRowId={(row) => row.id}
					total={total}
					page={page}
					pageSize={pageSize}
					sortBy={sortBy}
					sortDir={sortDir}
					loading={loading}
					error={error}
					emptyMessage="No se encontraron categorías que coincidan con la búsqueda."
					onPageChange={setPage}
					onSortChange={(field, dir) => {
						setSortBy(field);
						setSortDir(dir);
					}}
					onRowClick={(row) => navigate(`/categorias/${buildSlugSinId(row.nombre, row.id)}/subcategorias`)}
				/>
			</Stack>

			{/* Dialog Crear / Editar */}
			<Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
				<form onSubmit={(e) => void handleSave(e)}>
					<DialogTitle>{editingCategoria ? 'Modificar categoría' : 'Nueva categoría'}</DialogTitle>

					<DialogContent dividers>
						<Stack spacing={2.5} sx={{ pt: 1 }}>
							{formError && <Alert severity="error">{formError}</Alert>}

							<TextField
								required
								fullWidth
								label="Nombre de la categoría"
								value={formNombre}
								onChange={(e) => setFormNombre(e.target.value)}
								inputProps={{ maxLength: 45 }}
								autoFocus
							/>

							<FormControl fullWidth>
								<FormLabel sx={{ mb: 1 }}>Icono</FormLabel>
								<ToggleButtonGroup
									exclusive
									value={isCategoriaIcono(formIcono) ? formIcono : 'Category'}
									onChange={(_, nextValue: CategoriaIcono | null) => {
										if (nextValue) {
											setFormIcono(nextValue);
										}
									}}
									sx={{
										display: 'grid',
										width: '100%',
										gridTemplateColumns: 'repeat(auto-fit, minmax(64px, 1fr))',
										gap: 1,
										'& .MuiToggleButtonGroup-grouped': {
											border: '1px solid',
											borderColor: 'divider',
											borderRadius: 1,
											m: 0,
										},
									}}
								>
									{CATEGORY_ICON_OPTIONS.map((option) => {
										const Icon = categoryIcons[option.value];

										return (
											<Tooltip key={option.value} title={option.label}>
												<ToggleButton
													value={option.value}
													aria-label={option.label}
													sx={{ minHeight: 56, p: 1 }}
												>
													<Icon />
												</ToggleButton>
											</Tooltip>
										);
									})}
								</ToggleButtonGroup>
								<FormHelperText>Seleccioná el icono identificatorio</FormHelperText>
							</FormControl>

							<FormControl fullWidth required>
								<InputLabel id="form-cat-estado-label">Estado</InputLabel>
								<Select
									labelId="form-cat-estado-label"
									value={formEstado}
									label="Estado"
									onChange={(e) => setFormEstado(e.target.value as 'A' | 'I')}
								>
									<MenuItem value="A">Activa</MenuItem>
									<MenuItem value="I">Inactiva</MenuItem>
								</Select>
							</FormControl>
						</Stack>
					</DialogContent>

					<DialogActions>
						<Button onClick={handleCloseDialog} disabled={formSubmitting}>
							Cancelar
						</Button>
						<Button type="submit" variant="contained" loading={formSubmitting}>
							Guardar
						</Button>
					</DialogActions>
				</form>
			</Dialog>

			{/* Dialog Confirmar Baja */}
			<Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
				<DialogTitle>¿Dar de baja categoría?</DialogTitle>
				<DialogContent dividers>
					<Typography variant="body2">
						Esta acción cambiará el estado de la categoría <strong>{deletingCategoria?.nombre}</strong> a
						inactiva.
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteDialogOpen(false)} disabled={deleteSubmitting}>
						Cancelar
					</Button>
					<Button
						color="error"
						variant="contained"
						onClick={() => void handleDelete()}
						loading={deleteSubmitting}
					>
						Dar de baja
					</Button>
				</DialogActions>
			</Dialog>
		</PageContainer>
	);
}
