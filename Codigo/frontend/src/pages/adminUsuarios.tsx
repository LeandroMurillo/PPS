import * as React from 'react';
import { useNavigate } from 'react-router';

import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { PageContainer } from '@toolpad/core/PageContainer';

import { listarUsuariosAdmin, type SortDirection, type UsuarioAdmin, type UsuarioAdminSortBy } from '../api/admin';
import AdminFilters from '../components/adminFilters';
import AdminTable, { type AdminColumn } from '../components/adminTable';
import { ESTADO_COLORS as stateColors, ESTADO_LABELS as stateLabels } from '../constants/estados';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { formatDate, formatDateTime } from '../utils/date';

const roleColors = { USUARIO: 'default', MODERADOR: 'warning', ADMIN: 'error' } as const;

const columns: AdminColumn<UsuarioAdmin, UsuarioAdminSortBy>[] = [
	{
		id: 'persona',
		label: 'Usuario',
		sortBy: 'apellido',
		minWidth: 190,
		render: (row) => (
			<Stack>
				<Typography variant="body2" fontWeight={600}>{`${row.apellido}, ${row.nombre}`}</Typography>
				<Typography variant="caption" color="text.secondary">
					{row.email}
				</Typography>
			</Stack>
		),
	},
	{ id: 'cuil', label: 'CUIL', sortBy: 'CUIL', minWidth: 110, render: (row) => row.cuil },
	{
		id: 'actividad',
		label: 'Actividad ARCA',
		sortBy: 'actividadArca',
		minWidth: 220,
		render: (row) => row.actividadArca ?? '—',
	},
	{
		id: 'rol',
		label: 'Rol',
		sortBy: 'rol',
		render: (row) => <Chip label={row.rol} color={roleColors[row.rol]} size="small" />,
	},
	{
		id: 'estado',
		label: 'Estado',
		sortBy: 'estado',
		render: (row) => <Chip label={stateLabels[row.estado]} color={stateColors[row.estado]} size="small" />,
	},
	{
		id: 'nacionalidad',
		label: 'Nacionalidad',
		sortBy: 'nacionalidad',
		minWidth: 130,
		render: (row) => row.nacionalidad,
	},
	{
		id: 'nacimiento',
		label: 'Nacimiento',
		minWidth: 115,
		render: (row) => formatDate(row.fechaNacimiento),
	},
	{
		id: 'registro',
		label: 'Registro',
		sortBy: 'fechaRegistro',
		minWidth: 145,
		render: (row) => formatDateTime(row.fechaRegistro),
	},
];

export default function AdminUsuariosPage() {
	const navigate = useNavigate();
	const [search, setSearch] = React.useState('');
	const [role, setRole] = React.useState('');
	const [state, setState] = React.useState('A');
	const [page, setPage] = React.useState(0);
	const [pageSize, setPageSize] = React.useState(25);
	const [sortBy, setSortBy] = React.useState<UsuarioAdminSortBy>('idUsuario');
	const [sortDir, setSortDir] = React.useState<SortDirection>('ASC');
	const [rows, setRows] = React.useState<UsuarioAdmin[]>([]);
	const [total, setTotal] = React.useState(0);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);
	const debouncedSearch = useDebouncedValue(search);

	React.useEffect(() => {
		setPage(0);
		setRows([]);
	}, [debouncedSearch, role, sortBy, sortDir, state]);

	React.useEffect(() => {
		const controller = new AbortController();
		setLoading(true);
		setError(null);

		void listarUsuariosAdmin(
			{
				busqueda: debouncedSearch || undefined,
				rol: (role || undefined) as UsuarioAdmin['rol'] | undefined,
				estado: (state || undefined) as UsuarioAdmin['estado'] | undefined,
				limit: pageSize,
				offset: page * pageSize,
				sortBy,
				sortDir,
			},
			controller.signal,
		)
			.then((result) => {
				setRows((prev) => (page === 0 ? result.data : [...prev, ...result.data]));
				setTotal(result.pagination.total);
			})
			.catch((requestError: unknown) => {
				if (!controller.signal.aborted) {
					setError(
						requestError instanceof Error ? requestError.message : 'No se pudieron cargar los usuarios.',
					);
				}
			})
			.finally(() => {
				if (!controller.signal.aborted) {
					setLoading(false);
				}
			});

		return () => controller.abort();
	}, [debouncedSearch, page, pageSize, role, sortBy, sortDir, state]);

	const changeFilter = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
		setter(value);
		setPage(0);
		setRows([]);
	};

	return (
		<PageContainer title="Administrar usuarios" maxWidth={false}>
			<Stack spacing={2}>
				<AdminFilters
					search={search}
					searchPlaceholder="Nombre, apellido, email, CUIL o actividad…"
					onSearchChange={(value) => changeFilter(setSearch, value)}
					onClear={() => {
						setSearch('');
						setRole('');
						setState('A');
						setPage(0);
						setRows([]);
					}}
				>
					<TextField
						select
						label="Rol"
						size="small"
						value={role}
						onChange={(event) => changeFilter(setRole, event.target.value)}
						sx={{ minWidth: 150 }}
					>
						<MenuItem value="">Todos</MenuItem>
						<MenuItem value="USUARIO">Usuario</MenuItem>
						<MenuItem value="MODERADOR">Moderador</MenuItem>
						<MenuItem value="ADMIN">Admin</MenuItem>
					</TextField>
					<TextField
						select
						label="Estado"
						size="small"
						value={state}
						onChange={(event) => changeFilter(setState, event.target.value)}
						sx={{ minWidth: 150 }}
					>
						<MenuItem value="">Todos</MenuItem>
						<MenuItem value="A">Activo</MenuItem>
						<MenuItem value="P">Pendiente</MenuItem>
						<MenuItem value="I">Inactivo</MenuItem>
					</TextField>
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
					emptyMessage="No hay usuarios que coincidan con los filtros."
					onPageChange={setPage}
					onPageSizeChange={(value) => {
						setPageSize(value);
						setPage(0);
						setRows([]);
					}}
					onSortChange={(field, direction) => {
						setSortBy(field);
						setSortDir(direction);
						setPage(0);
						setRows([]);
					}}
					onRowClick={(row) => navigate(`/usuarios/${row.id}`)}
					infiniteScroll
					hasMore={rows.length < total}
				/>
			</Stack>
		</PageContainer>
	);
}
