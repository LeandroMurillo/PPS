import * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { PageContainer } from '@toolpad/core/PageContainer';

import { listarUsuariosAdmin, type SortDirection, type UsuarioAdmin, type UsuarioAdminSortBy } from '../api/admin';
import AdminFilters from '../components/adminFilters';
import AdminTable, { type AdminColumn } from '../components/adminTable';
import { ESTADO_COLORS as stateColors, ESTADO_LABELS as stateLabels } from '../constants/estados';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { getUserAvatarUrl } from '../utils/avatar';
import { formatDateTime } from '../utils/date';

const roleColors = { USUARIO: 'default', MODERADOR: 'warning', ADMIN: 'error' } as const;
const validRoles = new Set<UsuarioAdmin['rol']>(['USUARIO', 'MODERADOR', 'ADMIN']);
const validStates = new Set<UsuarioAdmin['estado']>(['A', 'P', 'I']);

const columns: AdminColumn<UsuarioAdmin, UsuarioAdminSortBy>[] = [
	{
		id: 'persona',
		label: 'Usuario',
		sortBy: 'apellido',
		minWidth: 230,
		render: (row) => {
			const avatarUrl = getUserAvatarUrl({
				idUsuario: row.id,
				nombre: row.nombre,
				apellido: row.apellido,
				email: row.email,
				genero: row.genero,
				avatarEstilo: row.avatarEstilo,
				avatarSeed: row.avatarSeed,
			});

			return (
				<Stack direction="row" spacing={1.5} alignItems="center">
					<Avatar
						src={avatarUrl}
						alt={`${row.nombre} ${row.apellido}`}
						sx={{
							width: 38,
							height: 38,
							boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
							border: '1px solid',
							borderColor: 'divider',
						}}
					/>
					<Box sx={{ minWidth: 0 }}>
						<Typography variant="body2" fontWeight={600} noWrap>
							{`${row.apellido}, ${row.nombre}`}
						</Typography>
						<Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
							{row.email}
						</Typography>
					</Box>
				</Stack>
			);
		},
	},
	{
		id: 'actividad',
		label: 'Actividad ARCA',
		sortBy: 'actividadArca',
		minWidth: 180,
		render: (row) => {
			const actividad = row.actividadArca ?? '—';

			return (
				<Tooltip title={actividad} disableHoverListener={actividad === '—'}>
					<Typography variant="body2" noWrap sx={{ maxWidth: 260 }}>
						{actividad}
					</Typography>
				</Tooltip>
			);
		},
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
		id: 'registro',
		label: 'Registro',
		sortBy: 'fechaRegistro',
		minWidth: 145,
		render: (row) => formatDateTime(row.fechaRegistro),
	},
];

export default function AdminUsuariosPage() {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const search = searchParams.get('busqueda') ?? '';
	const roleParam = searchParams.get('rol');
	const stateParam = searchParams.get('estado');
	const role = roleParam && validRoles.has(roleParam as UsuarioAdmin['rol']) ? roleParam : 'USUARIO';
	const state = stateParam && validStates.has(stateParam as UsuarioAdmin['estado']) ? stateParam : 'A';
	const [page, setPage] = React.useState(0);
	const [pageSize, setPageSize] = React.useState(25);
	const [sortBy, setSortBy] = React.useState<UsuarioAdminSortBy>('fechaRegistro');
	const [sortDir, setSortDir] = React.useState<SortDirection>('DESC');
	const [rows, setRows] = React.useState<UsuarioAdmin[]>([]);
	const [total, setTotal] = React.useState(0);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);
	const debouncedSearch = useDebouncedValue(search);
	const activeFilterCount = Number(Boolean(search.trim())) + Number(Boolean(role)) + Number(Boolean(state));
	const hasActiveFilters = activeFilterCount > 0;
	const resultSummary = total === 1 ? '1 usuario encontrado' : `${total} usuarios encontrados`;

	React.useEffect(() => {
		setPage(0);
		setRows([]);
		setTotal(0);
		setLoading(true);
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

	const changeFilter = (key: 'busqueda' | 'rol' | 'estado', value: string, replace = false) => {
		const nextParams = new URLSearchParams(searchParams);
		if (value) {
			nextParams.set(key, value);
		} else {
			nextParams.delete(key);
		}
		setSearchParams(nextParams, { replace });
		setPage(0);
		setRows([]);
		setTotal(0);
		setLoading(true);
	};

	const clearFilters = () => {
		const nextParams = new URLSearchParams(searchParams);
		nextParams.delete('busqueda');
		nextParams.delete('rol');
		nextParams.delete('estado');
		setSearchParams(nextParams);
		setPage(0);
		setRows([]);
		setTotal(0);
		setLoading(true);
	};

	return (
		<PageContainer title="Administrar usuarios" maxWidth={false}>
			<Stack spacing={2}>
				<AdminFilters
					search={search}
					searchPlaceholder="Buscar por nombre, email, CUIL o actividad ARCA…"
					activeFilterCount={activeFilterCount}
					showClear={hasActiveFilters}
					onSearchChange={(value) => changeFilter('busqueda', value, true)}
					onClear={clearFilters}
				>
					<TextField
						select
						label="Rol"
						size="small"
						value={role}
						onChange={(event) => changeFilter('rol', event.target.value)}
						sx={{ minWidth: 150 }}
					>
						<MenuItem value="">Todos los roles</MenuItem>
						<MenuItem value="USUARIO">Usuario</MenuItem>
						<MenuItem value="MODERADOR">Moderador</MenuItem>
						<MenuItem value="ADMIN">Administrador</MenuItem>
					</TextField>
					<TextField
						select
						label="Estado"
						size="small"
						value={state}
						onChange={(event) => changeFilter('estado', event.target.value)}
						sx={{ minWidth: 150 }}
					>
						<MenuItem value="">Todos</MenuItem>
						<MenuItem value="A">Activo</MenuItem>
						<MenuItem value="P">Pendiente</MenuItem>
						<MenuItem value="I">Inactivo</MenuItem>
					</TextField>
				</AdminFilters>

				<Typography variant="body2" color="text.secondary">
					{loading && rows.length === 0 ? 'Buscando usuarios…' : resultSummary}
				</Typography>

				<AdminTable
					columns={columns}
					rows={rows}
					getRowId={(row) => row.id}
					showTopPagination
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
