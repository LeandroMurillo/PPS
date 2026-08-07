import * as React from 'react';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { PageContainer } from '@toolpad/core/PageContainer';

import {
	listarActoresAdmin,
	type ActorAdmin,
	type ActorAdminSortBy,
	type SortDirection,
} from '../api/admin';
import AdminFilters from '../components/adminFilters';
import AdminTable, { type AdminColumn } from '../components/adminTable';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

const stateLabels = { A: 'Activo', P: 'Pendiente', I: 'Inactivo' } as const;
const stateColors = { A: 'success', P: 'warning', I: 'default' } as const;

function formatDate(value: string) {
	return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(new Date(value));
}

function positiveInteger(value: string): number | undefined {
	const parsed = Number(value);
	return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

const columns: AdminColumn<ActorAdmin, ActorAdminSortBy>[] = [
	{ id: 'id', label: 'ID', sortBy: 'idActor', align: 'right', render: (row) => row.id },
	{
		id: 'nombre',
		label: 'Actor cultural',
		sortBy: 'nombre',
		minWidth: 210,
		render: (row) => (
			<Stack>
				<Typography variant="body2" fontWeight={600}>
					{row.nombre}
				</Typography>
				<Typography variant="caption" color="text.secondary">
					{row.tipoActor}
				</Typography>
			</Stack>
		),
	},
	{
		id: 'categoria',
		label: 'Categoría',
		sortBy: 'categoria',
		minWidth: 160,
		render: (row) => row.categoria.nombre,
	},
	{
		id: 'subcategoria',
		label: 'Subcategoría',
		sortBy: 'subcategoria',
		minWidth: 160,
		render: (row) => row.subcategoria?.nombre ?? '—',
	},
	{
		id: 'dueno',
		label: 'Usuario dueño',
		sortBy: 'usuarioDueno',
		minWidth: 210,
		render: (row) =>
			row.dueno ? (
				<Stack>
					<Typography variant="body2">{row.dueno.nombre}</Typography>
					<Typography variant="caption" color="text.secondary">
						{row.dueno.email}
					</Typography>
				</Stack>
			) : (
				'—'
			),
	},
	{
		id: 'ubicacion',
		label: 'Ubicación',
		sortBy: 'departamento',
		minWidth: 190,
		render: (row) => `${row.ubicacion.departamento} · ${row.ubicacion.localidad}`,
	},
	{
		id: 'cuit',
		label: 'CUIT',
		sortBy: 'cuit',
		minWidth: 110,
		render: (row) => row.cuit ?? '—',
	},
	{
		id: 'estado',
		label: 'Estado',
		sortBy: 'estado',
		render: (row) => (
			<Chip label={stateLabels[row.estado]} color={stateColors[row.estado]} size="small" />
		),
	},
	{
		id: 'creacion',
		label: 'Creación',
		sortBy: 'fechaCreacion',
		minWidth: 115,
		render: (row) => formatDate(row.fechaCreacion),
	},
];

export default function AdminActoresPage() {
	const [search, setSearch] = React.useState('');
	const [categoryId, setCategoryId] = React.useState('');
	const [ownerId, setOwnerId] = React.useState('');
	const [page, setPage] = React.useState(0);
	const [pageSize, setPageSize] = React.useState(25);
	const [sortBy, setSortBy] = React.useState<ActorAdminSortBy>('idActor');
	const [sortDir, setSortDir] = React.useState<SortDirection>('ASC');
	const [rows, setRows] = React.useState<ActorAdmin[]>([]);
	const [total, setTotal] = React.useState(0);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);
	const debouncedSearch = useDebouncedValue(search);
	const debouncedCategoryId = useDebouncedValue(categoryId);
	const debouncedOwnerId = useDebouncedValue(ownerId);

	React.useEffect(() => {
		const controller = new AbortController();
		setLoading(true);
		setError(null);

		void listarActoresAdmin(
			{
				busqueda: debouncedSearch || undefined,
				idCategoria: positiveInteger(debouncedCategoryId),
				idUsuarioDueno: positiveInteger(debouncedOwnerId),
				limit: pageSize,
				offset: page * pageSize,
				sortBy,
				sortDir,
			},
			controller.signal,
		)
			.then((result) => {
				setRows(result.data);
				setTotal(result.pagination.total);
			})
			.catch((requestError: unknown) => {
				if (!controller.signal.aborted) {
					setError(requestError instanceof Error ? requestError.message : 'No se pudieron cargar los actores.');
				}
			})
			.finally(() => {
				if (!controller.signal.aborted) {
					setLoading(false);
				}
			});

		return () => controller.abort();
	}, [debouncedCategoryId, debouncedOwnerId, debouncedSearch, page, pageSize, sortBy, sortDir]);

	const changeFilter = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
		setter(value);
		setPage(0);
	};

	return (
		<PageContainer title="Administrar actores" maxWidth={false}>
			<Stack spacing={2}>
				<AdminFilters
					search={search}
					onSearchChange={(value) => changeFilter(setSearch, value)}
					onClear={() => {
						setSearch('');
						setCategoryId('');
						setOwnerId('');
						setPage(0);
					}}
				>
					<TextField
						label="ID categoría"
						type="number"
						size="small"
						value={categoryId}
						onChange={(event) => changeFilter(setCategoryId, event.target.value)}
						slotProps={{ htmlInput: { min: 1 } }}
						sx={{ width: 145 }}
					/>
					<TextField
						label="ID usuario dueño"
						type="number"
						size="small"
						value={ownerId}
						onChange={(event) => changeFilter(setOwnerId, event.target.value)}
						slotProps={{ htmlInput: { min: 1 } }}
						sx={{ width: 175 }}
					/>
				</AdminFilters>

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
					emptyMessage="No hay actores que coincidan con los filtros."
					onPageChange={setPage}
					onPageSizeChange={(value) => {
						setPageSize(value);
						setPage(0);
					}}
					onSortChange={(field, direction) => {
						setSortBy(field);
						setSortDir(direction);
						setPage(0);
					}}
				/>
			</Stack>
		</PageContainer>
	);
}
