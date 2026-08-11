import * as React from 'react';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { PageContainer } from '@toolpad/core/PageContainer';
import { useNavigate, useParams } from 'react-router';

import {
	crearSubcategoriaAdmin,
	editarSubcategoriaAdmin,
	eliminarSubcategoriaAdmin,
	listarSubcategoriasAdmin,
	obtenerCategoriaAdmin,
	type CategoriaAdmin,
	type SortDirection,
	type SubcategoriaAdmin,
	type SubcategoriaAdminSortBy,
} from '../api/admin';
import CategoryIcon from '../components/categoryIcon';
import AdminFilters from '../components/adminFilters';
import AdminTable, { type AdminColumn } from '../components/adminTable';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

const stateLabels = { A: 'Activa', I: 'Inactiva' } as const;
const stateColors = { A: 'success', I: 'default' } as const;
const pageSize = 25;

export default function AdminSubcategoriasPage() {
	const navigate = useNavigate();
	const { categoriaId } = useParams<{ categoriaId: string }>();
	const parsedCategoriaId = Number(categoriaId);

	const [categoria, setCategoria] = React.useState<CategoriaAdmin | null>(null);
	const [categoriaLoading, setCategoriaLoading] = React.useState(true);

	const [search, setSearch] = React.useState('');
	const [state, setState] = React.useState('');
	const [page, setPage] = React.useState(0);
	const [sortBy, setSortBy] = React.useState<SubcategoriaAdminSortBy>('idSubcategoria');
	const [sortDir, setSortDir] = React.useState<SortDirection>('ASC');

	const [subcategorias, setSubcategorias] = React.useState<SubcategoriaAdmin[]>([]);
	const [total, setTotal] = React.useState(0);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);

	// Dialog states
	const [dialogOpen, setDialogOpen] = React.useState(false);
	const [editingSubcategoria, setEditingSubcategoria] = React.useState<SubcategoriaAdmin | null>(null);
	const [formNombre, setFormNombre] = React.useState('');
	const [formEstado, setFormEstado] = React.useState<'A' | 'I'>('A');
	const [formError, setFormError] = React.useState<string | null>(null);
	const [formSubmitting, setFormSubmitting] = React.useState(false);

	// Delete confirmation states
	const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
	const [deletingSubcategoria, setDeletingSubcategoria] = React.useState<SubcategoriaAdmin | null>(null);
	const [deleteSubmitting, setDeleteSubmitting] = React.useState(false);

	const debouncedSearch = useDebouncedValue(search, 300);

	// Fetch parent category info
	const fetchCategory = React.useCallback(async () => {
		if (!parsedCategoriaId || isNaN(parsedCategoriaId)) {
			setCategoriaLoading(false);
			return;
		}

		try {
			const res = await obtenerCategoriaAdmin(parsedCategoriaId);
			setCategoria(res.data);
		} catch {
			setCategoria(null);
		} finally {
			setCategoriaLoading(false);
		}
	}, [parsedCategoriaId]);

	React.useEffect(() => {
		void fetchCategory();
	}, [fetchCategory]);

	// Fetch subcategories
	const fetchSubcategorias = React.useCallback(async () => {
		if (!parsedCategoriaId || isNaN(parsedCategoriaId)) {
			setLoading(false);
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const res = await listarSubcategoriasAdmin(parsedCategoriaId, {
				busqueda: debouncedSearch.trim() || undefined,
				estado: (state as SubcategoriaAdmin['estado']) || undefined,
				limit: pageSize,
				offset: page * pageSize,
				sortBy,
				sortDir,
			});

			setSubcategorias(res.data);
			setTotal(res.pagination.total);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Error al cargar las subcategorías');
		} finally {
			setLoading(false);
		}
	}, [parsedCategoriaId, debouncedSearch, state, page, sortBy, sortDir]);

	React.useEffect(() => {
		void fetchSubcategorias();
	}, [fetchSubcategorias]);

	const handleOpenCreate = () => {
		setEditingSubcategoria(null);
		setFormNombre('');
		setFormEstado('A');
		setFormError(null);
		setDialogOpen(true);
	};

	const handleOpenEdit = (sub: SubcategoriaAdmin) => {
		setEditingSubcategoria(sub);
		setFormNombre(sub.nombre);
		setFormEstado(sub.estado);
		setFormError(null);
		setDialogOpen(true);
	};

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!parsedCategoriaId) return;

		const trimmedNombre = formNombre.trim();
		if (!trimmedNombre) {
			setFormError('El nombre es obligatorio.');
			return;
		}

		setFormSubmitting(true);
		setFormError(null);

		try {
			if (editingSubcategoria) {
				await editarSubcategoriaAdmin(parsedCategoriaId, editingSubcategoria.id, {
					nombre: trimmedNombre,
					estado: formEstado,
				});
			} else {
				await crearSubcategoriaAdmin(parsedCategoriaId, {
					nombre: trimmedNombre,
					estado: formEstado,
				});
			}

			setDialogOpen(false);
			void fetchSubcategorias();
			void fetchCategory();
		} catch (err) {
			setFormError(err instanceof Error ? err.message : 'Ocurrió un error al guardar la subcategoría.');
		} finally {
			setFormSubmitting(false);
		}
	};

	const handleOpenDelete = (sub: SubcategoriaAdmin) => {
		setDeletingSubcategoria(sub);
		setDeleteDialogOpen(true);
	};

	const handleDelete = async () => {
		if (!parsedCategoriaId || !deletingSubcategoria) return;

		setDeleteSubmitting(true);

		try {
			await eliminarSubcategoriaAdmin(parsedCategoriaId, deletingSubcategoria.id);
			setDeleteDialogOpen(false);
			setDeletingSubcategoria(null);
			void fetchSubcategorias();
			void fetchCategory();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'No se pudo dar de baja la subcategoría');
		} finally {
			setDeleteSubmitting(false);
		}
	};

	const columns: AdminColumn<SubcategoriaAdmin, SubcategoriaAdminSortBy>[] = [
		{ id: 'id', label: 'ID', sortBy: 'idSubcategoria', align: 'right', render: (row) => row.id },
		{
			id: 'nombre',
			label: 'Subcategoría',
			sortBy: 'nombre',
			minWidth: 240,
			render: (row) => (
				<Typography variant="body2" fontWeight={600}>
					{row.nombre}
				</Typography>
			),
		},
		{
			id: 'estado',
			label: 'Estado',
			sortBy: 'estado',
			render: (row) => <Chip label={stateLabels[row.estado]} color={stateColors[row.estado]} size="small" />,
		},
		{
			id: 'cantidadActores',
			label: 'Actores asociados',
			sortBy: 'cantidadActores',
			align: 'right',
			render: (row) => row.cantidadActores,
		},
		{
			id: 'acciones',
			label: 'Acciones',
			align: 'center',
			render: (row) => (
				<Stack direction="row" spacing={1} justifyContent="center">
					<Tooltip title="Modificar subcategoría">
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

	if (categoriaLoading) {
		return <PageContainer title="Cargando categoría..." />;
	}

	if (!categoria) {
		return (
			<PageContainer title="Categoría no encontrada">
				<Alert severity="error" sx={{ mb: 2 }}>
					La categoría solicitada no existe o fue eliminada.
				</Alert>
				<Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/categorias')}>
					Volver a categorías
				</Button>
			</PageContainer>
		);
	}

	return (
		<PageContainer
			title={`Subcategorías: ${categoria.nombre}`}
			breadcrumbs={[
				{ title: 'Categorías', path: '/categorias' },
				{ title: categoria.nombre, path: `/categorias/${categoria.id}` },
				{ title: 'Subcategorías' },
			]}
		>
			<Stack spacing={3}>
				{/* Top bar with Category summary and back button */}
				<Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
					<Stack
						direction="row"
						alignItems="center"
						justifyContent="space-between"
						spacing={2}
						flexWrap="wrap"
					>
						<Stack direction="row" alignItems="center" spacing={2}>
							<IconButton onClick={() => navigate('/categorias')} aria-label="Volver a categorías">
								<ArrowBackIcon />
							</IconButton>
							<CategoryIcon icono={categoria.icono} label={categoria.nombre} withLabel />
							<Chip
								label={`${categoria.cantidadSubcategorias} subcategoría${categoria.cantidadSubcategorias === 1 ? '' : 's'}`}
								size="small"
								variant="outlined"
								color="primary"
							/>
						</Stack>
						<Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
							Nueva subcategoría
						</Button>
					</Stack>
				</Paper>

				{/* Filters */}
				<AdminFilters
					search={search}
					searchPlaceholder="Buscar por nombre de subcategoría..."
					onSearchChange={(val) => {
						setSearch(val);
						setPage(0);
					}}
					onClear={() => {
						setSearch('');
						setState('');
						setPage(0);
					}}
				>
					<FormControl size="small" sx={{ minWidth: 160 }}>
						<InputLabel id="subcategoria-filter-estado-label">Estado</InputLabel>
						<Select
							labelId="subcategoria-filter-estado-label"
							value={state}
							label="Estado"
							onChange={(e) => {
								setState(e.target.value);
								setPage(0);
							}}
						>
							<MenuItem value="">Todos los estados</MenuItem>
							<MenuItem value="A">Activa</MenuItem>
							<MenuItem value="I">Inactiva</MenuItem>
						</Select>
					</FormControl>
				</AdminFilters>

				{/* Table */}
				<AdminTable<SubcategoriaAdmin, SubcategoriaAdminSortBy>
					columns={columns}
					rows={subcategorias}
					getRowId={(row) => row.id}
					total={total}
					page={page}
					pageSize={pageSize}
					sortBy={sortBy}
					sortDir={sortDir}
					loading={loading}
					error={error}
					emptyMessage="No se encontraron subcategorías para esta categoría."
					onPageChange={setPage}
					onSortChange={(newSortBy, newSortDir) => {
						setSortBy(newSortBy);
						setSortDir(newSortDir);
					}}
				/>
			</Stack>

			{/* Create / Edit Dialog */}
			<Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
				<form onSubmit={handleSave}>
					<DialogTitle>{editingSubcategoria ? 'Modificar subcategoría' : 'Nueva subcategoría'}</DialogTitle>
					<DialogContent dividers>
						<Stack spacing={2} sx={{ pt: 1 }}>
							{formError && <Alert severity="error">{formError}</Alert>}
							<TextField
								label="Nombre de la subcategoría"
								value={formNombre}
								onChange={(e) => setFormNombre(e.target.value)}
								required
								fullWidth
								inputProps={{ maxLength: 45 }}
							/>
							<FormControl fullWidth>
								<InputLabel id="subcategoria-estado-label">Estado</InputLabel>
								<Select
									labelId="subcategoria-estado-label"
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
						<Button onClick={() => setDialogOpen(false)} disabled={formSubmitting}>
							Cancelar
						</Button>
						<Button type="submit" variant="contained" disabled={formSubmitting}>
							{editingSubcategoria ? 'Guardar cambios' : 'Crear'}
						</Button>
					</DialogActions>
				</form>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
				<DialogTitle>¿Dar de baja subcategoría?</DialogTitle>
				<DialogContent>
					<Typography>
						Esta acción marcará como inactiva la subcategoría{' '}
						<strong>{deletingSubcategoria?.nombre}</strong>. ¿Querés continuar?
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteDialogOpen(false)} disabled={deleteSubmitting}>
						Cancelar
					</Button>
					<Button onClick={handleDelete} color="error" variant="contained" disabled={deleteSubmitting}>
						Dar de baja
					</Button>
				</DialogActions>
			</Dialog>
		</PageContainer>
	);
}
