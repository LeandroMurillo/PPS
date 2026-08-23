import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ClearIcon from '@mui/icons-material/Clear';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import {
	Alert,
	Avatar,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	CircularProgress,
	Divider,
	FormControl,
	Grid,
	IconButton,
	InputAdornment,
	InputLabel,
	MenuItem,
	Paper,
	Select,
	Skeleton,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { useColorScheme } from '@mui/material/styles';

import {
	listarEventosPublicos,
	obtenerFiltrosListadoActores,
	type EventoPublicoItem,
	type FiltroCategoria,
	type FiltroDepartamento,
} from '../api/actores';
import CategoryIcon from '../components/categoryIcon';
import CalendarExportMenu from '../components/calendarExportMenu';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { type CalendarEventData } from '../utils/calendar';
import { markdownToPlainText } from '../utils/markdown';
import { buildSlugConId } from '../utils/slug';

dayjs.locale('es');

const PRESETS_FECHA = [
	{ id: 'todos', label: 'Todos los eventos' },
	{ id: 'semana', label: 'Próximos 7 días' },
	{ id: 'mes', label: 'Este mes' },
] as const;

type PresetFechaId = (typeof PRESETS_FECHA)[number]['id'];

export default function ProximosEventosPage() {
	const location = useLocation();
	const [searchParams, setSearchParams] = useSearchParams();

	const { mode, systemMode } = useColorScheme();
	const isDarkMode = mode === 'system' ? systemMode === 'dark' : mode === 'dark';

	const sentinelRef = useRef<HTMLDivElement | null>(null);
	const [eventos, setEventos] = useState<EventoPublicoItem[]>([]);
	const [categorias, setCategorias] = useState<FiltroCategoria[]>([]);
	const [departamentos, setDepartamentos] = useState<FiltroDepartamento[]>([]);
	const [total, setTotal] = useState(0);
	const [cargandoInicial, setCargandoInicial] = useState(true);
	const [cargando, setCargando] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Filtros inicializados desde los query params de la URL
	const [busqueda, setBusqueda] = useState(() => searchParams.get('q') || '');
	const debouncedBusqueda = useDebouncedValue(busqueda);
	const [filtroCategoria, setFiltroCategoria] = useState<number>(() => {
		const val = Number(searchParams.get('categoria'));
		return Number.isInteger(val) && val > 0 ? val : 0;
	});
	const [filtroDepartamento, setFiltroDepartamento] = useState<string>(() => searchParams.get('departamento') || '');
	const [presetFecha, setPresetFecha] = useState<PresetFechaId>(() => {
		const f = searchParams.get('fecha');
		if (f === 'todos' || f === 'semana' || f === 'mes') return f;
		return 'mes';
	});
	const [fechaDesde, setFechaDesde] = useState<string>(() => searchParams.get('desde') || '');
	const [fechaHasta, setFechaHasta] = useState<string>(() => searchParams.get('hasta') || '');

	// Sincronizar filtros a los query parameters de la URL
	useEffect(() => {
		const nextParams = new URLSearchParams();
		if (debouncedBusqueda.trim()) nextParams.set('q', debouncedBusqueda.trim());
		if (filtroCategoria > 0) nextParams.set('categoria', String(filtroCategoria));
		if (filtroDepartamento) nextParams.set('departamento', filtroDepartamento);
		if (presetFecha !== 'mes') nextParams.set('fecha', presetFecha);

		if (nextParams.toString() !== searchParams.toString()) {
			setSearchParams(nextParams, { replace: true });
		}
	}, [
		debouncedBusqueda,
		filtroCategoria,
		filtroDepartamento,
		presetFecha,
		fechaDesde,
		fechaHasta,
		searchParams,
		setSearchParams,
	]);

	const returnUrl = encodeURIComponent(`${location.pathname}${location.search}` || '/eventos');

	// Paginación
	const [page, setPage] = useState(0);
	const [hasNext, setHasNext] = useState(false);
	const LIMIT = 18;

	// Menú de calendario
	const [calendarEvent, setCalendarEvent] = useState<CalendarEventData | null>(null);
	const [calendarAnchorEl, setCalendarAnchorEl] = useState<HTMLElement | null>(null);

	const handleOpenCalendar = (evento: EventoPublicoItem, target: HTMLElement) => {
		setCalendarEvent({
			nombreEvento: evento.nombreEvento,
			descripcion: evento.descripcion,
			fecha: evento.fecha,
			departamento: evento.departamento,
			localidad: evento.localidad,
			direccion: evento.direccion,
		});
		setCalendarAnchorEl(target);
	};

	const handleCloseCalendar = () => {
		setCalendarAnchorEl(null);
		setCalendarEvent(null);
	};

	// Fechas computadas según preset
	const { computedFechaDesde, computedFechaHasta } = useMemo(() => {
		const hoy = dayjs().format('YYYY-MM-DD');
		if (presetFecha === 'semana') {
			return {
				computedFechaDesde: hoy,
				computedFechaHasta: dayjs().add(7, 'day').format('YYYY-MM-DD'),
			};
		}
		if (presetFecha === 'mes') {
			return {
				computedFechaDesde: hoy,
				computedFechaHasta: dayjs().endOf('month').format('YYYY-MM-DD'),
			};
		}
		return {
			computedFechaDesde: hoy,
			computedFechaHasta: undefined,
		};
	}, [presetFecha, fechaDesde, fechaHasta]);

	useInfiniteScroll(sentinelRef, {
		hasNext,
		cargando,
		onLoadMore: () => setPage((prev) => prev + 1),
	});

	// Reset página ante cambios de filtros
	useEffect(() => {
		setPage(0);
	}, [debouncedBusqueda, filtroCategoria, filtroDepartamento, computedFechaDesde, computedFechaHasta]);

	// Cargar filtros iniciales
	useEffect(() => {
		const controller = new AbortController();

		async function loadFilters() {
			try {
				const filtros = await obtenerFiltrosListadoActores(controller.signal);
				setCategorias(filtros.categorias);
				setDepartamentos(filtros.departamentos);
			} catch (err) {
				if (!(err instanceof DOMException && err.name === 'AbortError')) {
					setError(err instanceof Error ? err.message : 'No se pudieron cargar los filtros.');
				}
			}
		}

		loadFilters();
		return () => controller.abort();
	}, []);

	// Cargar eventos paginados
	useEffect(() => {
		const controller = new AbortController();

		async function loadEvents() {
			try {
				setCargando(true);
				setError(null);

				const result = await listarEventosPublicos(
					{
						busqueda: debouncedBusqueda || undefined,
						departamento: filtroDepartamento || undefined,
						idCategoria: filtroCategoria > 0 ? filtroCategoria : undefined,
						fechaDesde: computedFechaDesde,
						fechaHasta: computedFechaHasta,
						limit: LIMIT,
						offset: page * LIMIT,
					},
					controller.signal,
				);

				setEventos((prev) => (page === 0 ? result.data : [...prev, ...result.data]));
				setTotal(result.pagination.total);
				setHasNext(result.pagination.hasNext);
			} catch (err) {
				if (!(err instanceof DOMException && err.name === 'AbortError')) {
					setError(err instanceof Error ? err.message : 'No se pudieron cargar los eventos.');
				}
			} finally {
				setCargando(false);
				setCargandoInicial(false);
			}
		}

		loadEvents();
		return () => controller.abort();
	}, [debouncedBusqueda, filtroCategoria, filtroDepartamento, computedFechaDesde, computedFechaHasta, page]);

	const limpiarFiltros = () => {
		setBusqueda('');
		setFiltroCategoria(0);
		setFiltroDepartamento('');
		setPresetFecha('mes');
		setFechaDesde('');
		setFechaHasta('');
	};

	const tieneFiltrosActivos =
		busqueda.trim() !== '' ||
		filtroCategoria !== 0 ||
		filtroDepartamento !== '' ||
		presetFecha !== 'mes' ||
		Boolean(fechaDesde) ||
		Boolean(fechaHasta);

	return (
		<Box sx={{ width: '100%', maxWidth: 1200, margin: '0 auto', p: { xs: 2, sm: 3 }, pb: 8 }}>
			{/* Cabecera / Hero */}
			<Box
				sx={{
					mb: 3,
					p: { xs: 2.5, sm: 3.5 },
					borderRadius: 2.5,
					background: isDarkMode
						? 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)'
						: 'linear-gradient(135deg, #f0f7ff 0%, #f8fafc 100%)',
					border: '1px solid',
					borderColor: isDarkMode ? 'divider' : '#e2e8f0',
				}}
			>
				<Stack direction="row" alignItems="center" spacing={2}>
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							width: 48,
							height: 48,
							borderRadius: 2,
							backgroundColor: isDarkMode ? 'primary.dark' : 'primary.main',
							color: '#fff',
							flexShrink: 0,
						}}
					>
						<CalendarMonthIcon fontSize="medium" />
					</Box>
					<Box>
						<Typography variant="h5" component="h1" fontWeight="700" color="text.primary">
							Agenda Cultural de Tucumán
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Descubrí festivales, muestras, recitales y actividades culturales en toda la provincia.
						</Typography>
					</Box>
				</Stack>
			</Box>

			{/* Barra de Filtros */}
			<Paper
				elevation={0}
				sx={{
					p: { xs: 2, sm: 2.5 },
					mb: 3,
					borderRadius: 2,
					border: '1px solid',
					borderColor: 'divider',
				}}
			>
				<Grid container spacing={2} alignItems="center">
					{/* Buscador de texto */}
					<Grid size={{ xs: 12, md: 4 }}>
						<TextField
							fullWidth
							size="small"
							placeholder="Buscar evento o artista..."
							value={busqueda}
							onChange={(e) => setBusqueda(e.target.value)}
							slotProps={{
								input: {
									startAdornment: (
										<InputAdornment position="start">
											<SearchIcon fontSize="small" color="action" />
										</InputAdornment>
									),
									endAdornment: busqueda ? (
										<InputAdornment position="end">
											<IconButton size="small" onClick={() => setBusqueda('')}>
												<ClearIcon fontSize="small" />
											</IconButton>
										</InputAdornment>
									) : null,
								},
							}}
						/>
					</Grid>

					{/* Filtro de Categoría */}
					<Grid size={{ xs: 12, sm: 6, md: 4 }}>
						<FormControl fullWidth size="small">
							<InputLabel id="filtro-categoria-label">Categoría</InputLabel>
							<Select
								labelId="filtro-categoria-label"
								value={filtroCategoria}
								label="Categoría"
								onChange={(e) => setFiltroCategoria(Number(e.target.value))}
							>
								<MenuItem value={0}>Todas las disciplinas</MenuItem>
								{categorias.map((cat) => (
									<MenuItem key={cat.id} value={cat.id}>
										<Stack direction="row" spacing={1} alignItems="center">
											<CategoryIcon icono={cat.icono} fontSize="small" />
											<span>{cat.nombre}</span>
										</Stack>
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Grid>

					{/* Filtro de Departamento */}
					<Grid size={{ xs: 12, sm: 6, md: 4 }}>
						<FormControl fullWidth size="small">
							<InputLabel id="filtro-departamento-label">Departamento</InputLabel>
							<Select
								labelId="filtro-departamento-label"
								value={filtroDepartamento}
								label="Departamento"
								onChange={(e) => setFiltroDepartamento(e.target.value)}
							>
								<MenuItem value="">Todos los departamentos</MenuItem>
								{departamentos.map((dep) => (
									<MenuItem key={dep.departamento} value={dep.departamento}>
										{dep.departamento}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Grid>

					{/* Filtro de Tiempo (Presets) */}
					<Grid size={{ xs: 12 }}>
						<Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ gap: 1 }}>
							<Typography variant="body2" color="text.secondary" sx={{ mr: 0.5, fontWeight: 500 }}>
								Fecha:
							</Typography>
							{PRESETS_FECHA.map((preset) => (
								<Chip
									key={preset.id}
									label={preset.label}
									clickable
									color={presetFecha === preset.id ? 'primary' : 'default'}
									variant={presetFecha === preset.id ? 'filled' : 'outlined'}
									size="small"
									onClick={() => setPresetFecha(preset.id)}
								/>
							))}

							{tieneFiltrosActivos && (
								<Button
									size="small"
									color="secondary"
									startIcon={<ClearIcon />}
									onClick={limpiarFiltros}
									sx={{ ml: 'auto', textTransform: 'none' }}
								>
									Limpiar filtros
								</Button>
							)}
						</Stack>
					</Grid>
				</Grid>
			</Paper>

			{/* Mensajes de Estado */}
			{error && (
				<Alert
					severity="error"
					sx={{ mb: 3 }}
					action={
						<Button color="inherit" onClick={() => setPage(0)}>
							Reintentar
						</Button>
					}
				>
					{error}
				</Alert>
			)}

			{/* Indicador de resultados */}
			{!cargandoInicial && (
				<Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Typography variant="body2" color="text.secondary">
						{total === 0
							? 'No se encontraron eventos próximos'
							: `${total} evento${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`}
					</Typography>
				</Box>
			)}

			{/* Lista / Grid de Eventos */}
			{cargandoInicial ? (
				<Grid container spacing={3}>
					{Array.from({ length: 6 }).map((_, i) => (
						<Grid key={i} size={{ xs: 12, md: 6, lg: 4 }}>
							<Card sx={{ height: 280, p: 2, borderRadius: 2 }}>
								<Skeleton
									variant="rectangular"
									width="100%"
									height={40}
									sx={{ mb: 2, borderRadius: 1 }}
								/>
								<Skeleton variant="text" width="80%" height={30} />
								<Skeleton variant="text" width="60%" />
								<Skeleton variant="text" width="90%" />
								<Skeleton variant="rectangular" height={36} sx={{ mt: 3, borderRadius: 1 }} />
							</Card>
						</Grid>
					))}
				</Grid>
			) : eventos.length === 0 ? (
				<Paper
					elevation={0}
					sx={{
						p: 6,
						textAlign: 'center',
						borderRadius: 2.5,
						border: '1px dashed',
						borderColor: 'divider',
					}}
				>
					<EventAvailableIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
					<Typography variant="h6" fontWeight="600" gutterBottom>
						No hay eventos programados con los filtros seleccionados
					</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
						Probá ampliando el rango de fechas, seleccionando otra categoría o limpiando los términos de
						búsqueda.
					</Typography>
					{tieneFiltrosActivos && (
						<Button variant="outlined" startIcon={<ClearIcon />} onClick={limpiarFiltros}>
							Restablecer filtros
						</Button>
					)}
				</Paper>
			) : (
				<Grid container spacing={3}>
					{eventos.map((evento) => {
						const fechaObj = dayjs(evento.fecha);
						const diaNumero = fechaObj.format('DD');
						const mesTexto = fechaObj.format('MMM').toUpperCase();
						const anioTexto = fechaObj.format('YYYY');
						const horaTexto = fechaObj.format('HH:mm');
						const tieneHora = horaTexto !== '00:00';
						const actorSlug = buildSlugConId(evento.idActor, evento.nombreActor);

						return (
							<Grid key={evento.idEvento} size={{ xs: 12, md: 6, lg: 4 }}>
								<Card
									elevation={0}
									onClick={(e) => handleOpenCalendar(evento, e.currentTarget)}
									tabIndex={0}
									role="button"
									onKeyDown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault();
											handleOpenCalendar(evento, e.currentTarget);
										}
									}}
									sx={{
										height: '100%',
										display: 'flex',
										flexDirection: 'column',
										borderRadius: 2.5,
										border: '1px solid',
										borderColor: 'divider',
										cursor: 'pointer',
										userSelect: 'none',
										transition: 'all 0.2s ease',
										backgroundColor: isDarkMode ? 'background.paper' : '#ffffff',
										'&:hover': {
											transform: 'translateY(-2px)',
											boxShadow: isDarkMode
												? '0 12px 28px rgba(0,0,0,0.5)'
												: '0 12px 24px rgba(0,0,0,0.08)',
											borderColor: isDarkMode ? 'primary.dark' : 'primary.main',
											backgroundColor: isDarkMode
												? 'rgba(255, 255, 255, 0.05)'
												: 'rgba(25, 118, 210, 0.04)',
											'& .actor-footer-box': {
												backgroundColor: isDarkMode
													? 'rgba(255, 255, 255, 0.08)'
													: 'rgba(25, 118, 210, 0.08)',
											},
										},
									}}
								>
									<CardContent
										sx={{ p: 2.5, flex: '1 0 auto', display: 'flex', flexDirection: 'column' }}
									>
										{/* Fila Superior: Fecha destacada + Disciplina */}
										<Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
											{/* Bloque Calendario */}
											<Box
												sx={{
													minWidth: 52,
													width: 52,
													borderRadius: 1.5,
													overflow: 'hidden',
													textAlign: 'center',
													border: '1px solid',
													borderColor: isDarkMode ? 'primary.dark' : 'primary.light',
												}}
											>
												<Box
													sx={{
														backgroundColor: isDarkMode ? 'primary.dark' : 'primary.main',
														color: '#fff',
														py: 0.2,
														fontSize: '0.65rem',
														fontWeight: 700,
														letterSpacing: 0.5,
													}}
												>
													{mesTexto}
												</Box>
												<Box
													sx={{
														backgroundColor: isDarkMode ? 'background.paper' : '#fafafa',
														py: 0.4,
													}}
												>
													<Typography variant="h6" fontWeight="800" sx={{ lineHeight: 1.1 }}>
														{diaNumero}
													</Typography>
													<Typography
														variant="caption"
														color="text.secondary"
														sx={{ fontSize: '0.6rem' }}
													>
														{anioTexto}
													</Typography>
												</Box>
											</Box>

											{/* Categoría y Subcategoría */}
											<Box sx={{ flex: 1, minWidth: 0 }}>
												<Stack direction="row" spacing={0.8} flexWrap="wrap" sx={{ gap: 0.5 }}>
													<Chip
														size="small"
														icon={
															<CategoryIcon
																icono={evento.categoriaIcono}
																fontSize="small"
															/>
														}
														label={evento.categoria}
														color="primary"
														variant="outlined"
														sx={{ fontWeight: 500 }}
													/>
													{evento.subcategoria && (
														<Chip
															size="small"
															label={evento.subcategoria}
															variant="outlined"
														/>
													)}
												</Stack>

												{tieneHora && (
													<Stack
														direction="row"
														spacing={0.5}
														alignItems="center"
														sx={{ mt: 0.8 }}
													>
														<AccessTimeIcon
															sx={{ fontSize: 14, color: 'text.secondary' }}
														/>
														<Typography
															variant="caption"
															color="text.secondary"
															fontWeight="600"
														>
															{horaTexto} hs
														</Typography>
													</Stack>
												)}
											</Box>
										</Stack>

										{/* Nombre del Evento */}
										<Typography
											variant="h6"
											component="h2"
											fontWeight="700"
											sx={{
												mb: 1,
												display: '-webkit-box',
												WebkitLineClamp: 2,
												WebkitBoxOrient: 'vertical',
												overflow: 'hidden',
												lineHeight: 1.3,
											}}
										>
											{evento.nombreEvento}
										</Typography>

										{/* Descripción */}
										{evento.descripcion && (
											<Typography
												variant="body2"
												color="text.secondary"
												sx={{
													mb: 2,
													display: '-webkit-box',
													WebkitLineClamp: 3,
													WebkitBoxOrient: 'vertical',
													overflow: 'hidden',
													lineHeight: 1.5,
												}}
											>
												{markdownToPlainText(evento.descripcion)}
											</Typography>
										)}

										<Box sx={{ mt: 'auto', pt: 1.5, width: '100%' }}>
											<Divider sx={{ mb: 1.5 }} />

											{/* Ubicación */}
											<Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 1.5 }}>
												<LocationOnIcon fontSize="small" color="action" sx={{ mt: 0.2 }} />
												<Box sx={{ flex: 1, minWidth: 0 }}>
													<Typography variant="body2" fontWeight="600">
														{evento.departamento}
														{evento.localidad ? ` • ${evento.localidad}` : ''}
													</Typography>
													{evento.direccion && (
														<Typography
															variant="caption"
															color="text.secondary"
															noWrap
															display="block"
														>
															{evento.direccion}
														</Typography>
													)}
												</Box>
											</Stack>

											{/* Actor Organizador */}
											<Stack
												className="actor-footer-box"
												direction="row"
												spacing={1}
												alignItems="center"
												justifyContent="space-between"
												sx={{
													p: 1,
													borderRadius: 1.5,
													backgroundColor: isDarkMode ? 'action.hover' : '#f8fafc',
													transition: 'background-color 0.2s ease',
												}}
											>
												<Stack
													direction="row"
													spacing={1}
													alignItems="center"
													sx={{ minWidth: 0 }}
												>
													<Avatar
														src={evento.fotoPerfilActor ?? undefined}
														alt={evento.nombreActor}
														sx={{ width: 28, height: 28, fontSize: 13 }}
													>
														<PersonIcon fontSize="small" />
													</Avatar>
													<Typography variant="body2" fontWeight="500" noWrap>
														{evento.nombreActor}
													</Typography>
												</Stack>

												<Button
													component={Link}
													to={`/actores/${actorSlug}?from=${returnUrl}`}
													size="small"
													variant="text"
													onClick={(e) => e.stopPropagation()}
													sx={{
														textTransform: 'none',
														whiteSpace: 'nowrap',
														fontWeight: 600,
														minWidth: 'auto',
														p: 0.5,
													}}
												>
													Ver perfil
												</Button>
											</Stack>
										</Box>
									</CardContent>
								</Card>
							</Grid>
						);
					})}
				</Grid>
			)}

			{/* Centinela de scroll infinito */}
			<div ref={sentinelRef} style={{ height: 20, marginTop: 16 }} />

			{cargando && !cargandoInicial && (
				<Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
					<CircularProgress size={32} />
				</Box>
			)}

			{/* Menú para exportar al calendario */}
			<CalendarExportMenu
				anchorEl={calendarAnchorEl}
				open={Boolean(calendarAnchorEl)}
				onClose={handleCloseCalendar}
				event={calendarEvent}
			/>
		</Box>
	);
}
