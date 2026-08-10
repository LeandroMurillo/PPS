import * as React from 'react';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { PageContainer } from '@toolpad/core/PageContainer';
import { useNavigate } from 'react-router';

import {
	listarActoresAdmin,
	listarCategoriasAdmin,
	type ActorAdmin,
	type ActorAdminSortBy,
	type CategoriaAdmin,
	type SortDirection,
} from '../api/admin';
import AdminFilters from '../components/adminFilters';
import AdminTable, { type AdminColumn } from '../components/adminTable';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

const stateLabels = { A: 'Activo', P: 'Pendiente', I: 'Inactivo' } as const;
const stateColors = { A: 'success', P: 'warning', I: 'default' } as const;
const typeLabels = { INDIVIDUO: 'Individuo', COLECTIVO: 'Colectivo', ESPACIO: 'Espacio' } as const;

const departamentos = [
	'Burruyacú',
	'Capital',
	'Chicligasta',
	'Cruz Alta',
	'Famaillá',
	'Graneros',
	'Juan Bautista Alberdi',
	'La Cocha',
	'Leales',
	'Lules',
	'Monteros',
	'Río Chico',
	'Simoca',
	'Tafí del Valle',
	'Tafí Viejo',
	'Trancas',
	'Yerba Buena',
] as const;

function optionalPositiveInteger(value: string): number | undefined {
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
		id: 'ubicacion',
		label: 'Ubicación',
		sortBy: 'departamento',
		minWidth: 190,
		render: (row) => `${row.ubicacion.departamento} · ${row.ubicacion.localidad}`,
	},
	{
		id: 'estado',
		label: 'Estado',
		sortBy: 'estado',
		render: (row) => <Chip label={stateLabels[row.estado]} color={stateColors[row.estado]} size="small" />,
	},
];

export default function AdminActoresPage() {
	const navigate = useNavigate();
	const [search, setSearch] = React.useState('');
	const [categoryId, setCategoryId] = React.useState('');
	const [department, setDepartment] = React.useState('');
	const [actorType, setActorType] = React.useState('');
	const [state, setState] = React.useState('');
	const [categories, setCategories] = React.useState<CategoriaAdmin[]>([]);
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
	const debouncedDepartment = useDebouncedValue(department);
	const debouncedActorType = useDebouncedValue(actorType);
	const debouncedState = useDebouncedValue(state);

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

	React.useEffect(() => {
		const controller = new AbortController();
		setLoading(true);
		setError(null);

		void listarActoresAdmin(
			{
				busqueda: debouncedSearch || undefined,
				idCategoria: optionalPositiveInteger(debouncedCategoryId),
				departamento: debouncedDepartment || undefined,
				tipoActor: (debouncedActorType || undefined) as ActorAdmin['tipoActor'] | undefined,
				estado: (debouncedState || undefined) as ActorAdmin['estado'] | undefined,
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
					setError(
						requestError instanceof Error ? requestError.message : 'No se pudieron cargar los actores.',
					);
				}
			})
			.finally(() => {
				if (!controller.signal.aborted) {
					setLoading(false);
				}
			});

		return () => controller.abort();
	}, [
		debouncedActorType,
		debouncedCategoryId,
		debouncedDepartment,
		debouncedSearch,
		debouncedState,
		page,
		pageSize,
		sortBy,
		sortDir,
	]);

	const changeFilter = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
		setter(value);
		setPage(0);
	};

	const activeFilterCount = [categoryId, department, actorType, state].filter(Boolean).length;
	const resultSummary = total === 1 ? '1 actor encontrado' : `${total} actores encontrados`;

	return (
		<PageContainer title="Administrar actores" maxWidth={false}>
			<Stack spacing={2}>
				<AdminFilters
					search={search}
					collapsible
					activeFilterCount={activeFilterCount}
					onSearchChange={(value) => changeFilter(setSearch, value)}
					onClear={() => {
						setSearch('');
						setCategoryId('');
						setDepartment('');
						setActorType('');
						setState('');
						setPage(0);
					}}
				>
					<FormControl size="small" sx={{ minWidth: 180 }}>
						<InputLabel>Categoría</InputLabel>
						<Select
							value={categoryId}
							label="Categoría"
							onChange={(event) => changeFilter(setCategoryId, event.target.value)}
						>
							<MenuItem value="">Todas</MenuItem>
							{categories.map((category) => (
								<MenuItem key={category.id} value={String(category.id)}>
									{category.nombre}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<FormControl size="small" sx={{ minWidth: 190 }}>
						<InputLabel>Departamento</InputLabel>
						<Select
							value={department}
							label="Departamento"
							onChange={(event) => changeFilter(setDepartment, event.target.value)}
						>
							<MenuItem value="">Todos</MenuItem>
							{departamentos.map((departmentOption) => (
								<MenuItem key={departmentOption} value={departmentOption}>
									{departmentOption}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<FormControl size="small" sx={{ minWidth: 150 }}>
						<InputLabel>Tipo</InputLabel>
						<Select
							value={actorType}
							label="Tipo"
							onChange={(event) => changeFilter(setActorType, event.target.value)}
						>
							<MenuItem value="">Todos</MenuItem>
							{Object.entries(typeLabels).map(([value, label]) => (
								<MenuItem key={value} value={value}>
									{label}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<FormControl size="small" sx={{ minWidth: 145 }}>
						<InputLabel>Estado</InputLabel>
						<Select
							value={state}
							label="Estado"
							onChange={(event) => changeFilter(setState, event.target.value)}
						>
							<MenuItem value="">Todos</MenuItem>
							{Object.entries(stateLabels).map(([value, label]) => (
								<MenuItem key={value} value={value}>
									{label}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</AdminFilters>

				<Typography variant="body2" color="text.secondary">
					{loading && rows.length === 0 ? 'Buscando actores…' : resultSummary}
				</Typography>

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
					onRowClick={(row) => navigate(`/actoresAdmin/${row.id}`)}
				/>
			</Stack>
		</PageContainer>
	);
}
