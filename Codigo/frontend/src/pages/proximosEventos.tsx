import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
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
	Container,
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
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { markdownToPlainText } from '../utils/markdown';
import { buildSlugConId } from '../utils/slug';

dayjs.locale('es');

const PRESETS_FECHA = [
	{ id: 'todos', label: 'Todos los futuros' },
	{ id: 'semana', label: 'Próximos 7 días' },
	{ id: 'mes', label: 'Este mes' },
] as const;

type PresetFechaId = (typeof PRESETS_FECHA)[number]['id'];

export default function ProximosEventosPage() {
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

	// Filtros
	const [busqueda, setBusqueda] = useState('');
	const debouncedBusqueda = useDebouncedValue(busqueda);
	const [filtroCategoria, setFiltroCategoria] = useState<number>(0);
	const [filtroDepartamento, setFiltroDepartamento] = useState<string>('');
	const [presetFecha, setPresetFecha] = useState<PresetFechaId>('todos');
	const [fechaDesde, setFechaDesde] = useState<string>('');
	const [fechaHasta, setFechaHasta] = useState<string>('');

	// Paginación
	const [page, setPage] = useState(0);
	const [hasNext, setHasNext] = useState(false);
	const LIMIT = 18;

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
		setPresetFecha('todos');
		setFechaDesde('');
		setFechaHasta('');
	};

	const tieneFiltrosActivos =
		busqueda.trim() !== '' ||
		filtroCategoria !== 0 ||
		filtroDepartamento !== '' ||
		presetFecha !== 'todos' ||
		Boolean(fechaDesde) ||
		Boolean(fechaHasta);

	return (
		<Box
			sx={{
				minHeight: '100%',
				pb: 8,
				pt: { xs: 2, md: 4 },
				px: { xs: 2, sm: 3, md: 4 },
				backgroundColor: isDarkMode ? '#0d0d0d' : '#f8f9fa',
			}}
		>
			<Container maxWidth="lg" disableGutters>
				{/* Cabecera / Hero */}
				<Box
					sx={{
						mb: 4,
						p: { xs: 3, md: 4 },
						borderRadius: 3,
						background: isDarkMode
							? 'linear-gradient(135deg, #1e1e24 0%, #121216 100%)'
							: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)',
						border: '1px solid',
						borderColor: isDarkMode ? '#2c2c34' : '#e0e7ff',
						boxShadow: isDarkMode ? '0 8px 32px rgba(0,0,0,0.37)' : '0 8px 24px rgba(0,0,0,0.05)',
					}}
				>
					<Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1.5 }}>
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
							}}
						>
							<CalendarMonthIcon fontSize="medium" />
						</Box>
						<Box>
							<Typography variant="h4" component="h1" fontWeight="700" color="text.primary">
								Agenda Cultural de Tucumán
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Explorá festivales, recitales, obras de teatro, muestras y actividades en toda la
								provincia.
							</Typography>
						</Box>
					</Stack>
				</Box>

				{/* Barra de Filtros */}
				<Paper
					elevation={0}
					sx={{
						p: { xs: 2, sm: 3 },
						mb: 4,
						borderRadius: 2.5,
						border: '1px solid',
						borderColor: isDarkMode ? '#252525' : '#e2e8f0',
						backgroundColor: isDarkMode ? '#141414' : '#ffffff',
					}}
				>
					<Grid container spacing={2} alignItems="center">
						{/* Buscador de texto */}
						<Grid size={{ xs: 12, md: 4 }}>
							<TextField
								fullWidth
								size="small"
								placeholder="Buscar evento, festival o artista..."
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
								<Typography variant="body2" color="text.secondary" sx={{ mr: 1, fontWeight: 500 }}>
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
								<Card sx={{ height: 260, p: 2, borderRadius: 2.5 }}>
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
							borderRadius: 3,
							border: '1px dashed',
							borderColor: isDarkMode ? '#333333' : '#cbd5e1',
							backgroundColor: isDarkMode ? '#121212' : '#ffffff',
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
										sx={{
											height: '100%',
											display: 'flex',
											flexDirection: 'column',
											borderRadius: 2.5,
											border: '1px solid',
											borderColor: isDarkMode ? '#282828' : '#e2e8f0',
											backgroundColor: isDarkMode ? '#161616' : '#ffffff',
											transition:
												'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
											'&:hover': {
												transform: 'translateY(-3px)',
												boxShadow: isDarkMode
													? '0 12px 28px rgba(0,0,0,0.5)'
													: '0 12px 24px rgba(0,0,0,0.08)',
												borderColor: isDarkMode ? 'primary.dark' : 'primary.light',
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
														minWidth: 54,
														width: 54,
														borderRadius: 2,
														overflow: 'hidden',
														textAlign: 'center',
														border: '1px solid',
														borderColor: isDarkMode ? 'primary.dark' : 'primary.light',
														boxShadow: 1,
													}}
												>
													<Box
														sx={{
															backgroundColor: isDarkMode
																? 'primary.dark'
																: 'primary.main',
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
															backgroundColor: isDarkMode ? '#222222' : '#fafafa',
															py: 0.4,
														}}
													>
														<Typography
															variant="h6"
															fontWeight="800"
															sx={{ lineHeight: 1.1 }}
														>
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
													<Stack
														direction="row"
														spacing={0.8}
														flexWrap="wrap"
														sx={{ gap: 0.5 }}
													>
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
																sx={{ borderColor: isDarkMode ? '#444' : '#cbd5e1' }}
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

											<Box sx={{ mt: 'auto', pt: 1.5 }}>
												<Divider
													sx={{ mb: 1.5, borderColor: isDarkMode ? '#262626' : '#f1f5f9' }}
												/>

												{/* Ubicación */}
												<Stack
													direction="row"
													spacing={1}
													alignItems="flex-start"
													sx={{ mb: 1.5 }}
												>
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

												{/* Actor Organizador / Ficha */}
												<Stack
													direction="row"
													spacing={1.5}
													alignItems="center"
													justifyContent="space-between"
													sx={{
														p: 1,
														borderRadius: 1.5,
														backgroundColor: isDarkMode ? '#1f1f1f' : '#f8fafc',
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
														to={`/actores/${actorSlug}`}
														size="small"
														variant="text"
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
			</Container>
		</Box>
	);
}
