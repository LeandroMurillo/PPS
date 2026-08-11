import * as React from 'react';
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
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';

import {
	crearSubcategoriaAdmin,
	editarSubcategoriaAdmin,
	eliminarSubcategoriaAdmin,
	listarSubcategoriasAdmin,
	type SortDirection,
	type SubcategoriaAdmin,
	type SubcategoriaAdminSortBy,
} from '../api/admin';
import AdminFilters from './adminFilters';
import AdminTable, { type AdminColumn } from './adminTable';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { PageContainer } from '@toolpad/core/PageContainer';

const stateLabels = { A: 'Activa', I: 'Inactiva' } as const;
const stateColors = { A: 'success', I: 'default' } as const;
const pageSize = 25;

interface SubcategoriasManagerProps {
	categoryId: number;
	contained?: boolean;
	showTitle?: boolean;
}

export default function SubcategoriasManager({ categoryId, showTitle = true }: SubcategoriasManagerProps) {
	const navigate = useNavigate();
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

	// Fetch subcategories for categoryId
	const fetchSubcategorias = React.useCallback(async () => {
		if (!categoryId || isNaN(categoryId)) {
			setLoading(false);
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const res = await listarSubcategoriasAdmin(categoryId, {
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
	}, [categoryId, debouncedSearch, state, page, sortBy, sortDir]);

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
		if (!categoryId) return;

		const trimmedNombre = formNombre.trim();
		if (!trimmedNombre) {
			setFormError('El nombre es obligatorio.');
			return;
		}

		setFormSubmitting(true);
		setFormError(null);

		try {
			if (editingSubcategoria) {
				await editarSubcategoriaAdmin(categoryId, editingSubcategoria.id, {
					nombre: trimmedNombre,
					estado: formEstado,
				});
			} else {
				await crearSubcategoriaAdmin(categoryId, {
					nombre: trimmedNombre,
					estado: formEstado,
				});
			}

			setDialogOpen(false);
			void fetchSubcategorias();
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
		if (!categoryId || !deletingSubcategoria) return;

		setDeleteSubmitting(true);

		try {
			await eliminarSubcategoriaAdmin(categoryId, deletingSubcategoria.id);
			setDeleteDialogOpen(false);
			setDeletingSubcategoria(null);
			void fetchSubcategorias();
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
			minWidth: 200,
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
					<Tooltip title="Administrar formulario">
						<IconButton
							size="small"
							color="primary"
							onClick={() => navigate(`/categorias/${categoryId}/subcategorias/${row.id}/formulario`)}
						>
							<AssignmentIcon fontSize="small" />
						</IconButton>
					</Tooltip>
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

	return (
		<PageContainer title="Administrar subcategorías" maxWidth={false}>
			<Stack spacing={2.5}>
				<Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} flexWrap="wrap">
					<Stack direction="row" alignItems="center" spacing={1.5}>
						{showTitle && (
							<Typography variant="h6" fontWeight={600}>
								Subcategorías
							</Typography>
						)}
						<Chip label={`${total}`} size="small" color="primary" variant="outlined" />
					</Stack>

					<Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
						Nueva subcategoría
					</Button>
				</Stack>

				<AdminFilters
					search={search}
					onSearchChange={(val) => {
						setSearch(val);
						setPage(0);
					}}
					searchPlaceholder="Buscar subcategoría..."
					onClear={() => {
						setSearch('');
						setState('');
						setPage(0);
					}}
				>
					<FormControl size="small" sx={{ minWidth: 140 }}>
						<InputLabel id="subcat-estado-label">Estado</InputLabel>
						<Select
							labelId="subcat-estado-label"
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
					onSortChange={(field, dir) => {
						setSortBy(field);
						setSortDir(dir);
					}}
				/>
			</Stack>

			{/* Dialog Crear / Editar */}
			<Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
				<form onSubmit={(e) => void handleSave(e)}>
					<DialogTitle>{editingSubcategoria ? 'Modificar subcategoría' : 'Nueva subcategoría'}</DialogTitle>

					<DialogContent dividers>
						<Stack spacing={2.5} sx={{ pt: 1 }}>
							{formError && <Alert severity="error">{formError}</Alert>}

							<TextField
								required
								fullWidth
								label="Nombre de la subcategoría"
								value={formNombre}
								onChange={(e) => setFormNombre(e.target.value)}
								inputProps={{ maxLength: 45 }}
								autoFocus
							/>

							<FormControl fullWidth required>
								<InputLabel id="form-subcat-estado-label">Estado</InputLabel>
								<Select
									labelId="form-subcat-estado-label"
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
						<Button type="submit" variant="contained" loading={formSubmitting}>
							Guardar
						</Button>
					</DialogActions>
				</form>
			</Dialog>

			{/* Dialog Confirmar Baja */}
			<Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
				<DialogTitle>¿Dar de baja subcategoría?</DialogTitle>
				<DialogContent dividers>
					<Typography variant="body2">
						Esta acción cambiará el estado de la subcategoría{' '}
						<strong>{deletingSubcategoria?.nombre}</strong> a inactiva.
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
