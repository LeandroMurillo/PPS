import type { Feature, FeatureCollection, Geometry } from 'geojson';
import L from 'leaflet';
import * as React from 'react';
import { CircleMarker, GeoJSON, MapContainer, Pane, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { Link, useNavigate, useSearchParams } from 'react-router';

import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useColorScheme, useTheme } from '@mui/material/styles';

import {
	obtenerActoresMapa,
	obtenerFiltrosMapa,
	type CategoriaIcono,
	type FiltroCategoria,
	type FiltroDepartamento,
} from '../api/actores';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import CategoryIcon from './categoryIcon';
import FiltroCategoriasCulturales from './filtroCategoriasCulturales';

// @ts-ignore
import 'leaflet/dist/leaflet.css';

const TUCUMAN_CENTER: L.LatLngExpression = [-26.8241, -65.2226];
const TUCUMAN_BOUNDS = L.latLngBounds([-27.95, -66.35], [-25.75, -64.45]);
const DEPARTAMENTOS_GEOJSON_URL = '/data/departamentos.geojson';

type DepartmentProperties = {
	name?: string;
	admin_level?: string;
	[key: string]: unknown;
};

type CulturalPoint = {
	id: number;
	nombre: string;
	descripcion: string | null;
	foto: string | null;
	categoria: string;
	categoriaIcono: CategoriaIcono;
	departamento: string;
	latitudlongitud: L.LatLngExpression;
};

function MapBoundsUpdater({
	departamentoSeleccionado,
	departamentosGeoJson,
}: {
	departamentoSeleccionado: string;
	departamentosGeoJson: FeatureCollection<Geometry, DepartmentProperties> | null;
}) {
	const map = useMap();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

	React.useEffect(() => {
		const paddingTop = isMobile ? 80 : 120;
		// Si no hay departamento seleccionado (se limpió el filtro), volvemos a la vista general
		if (!departamentoSeleccionado) {
			map.flyToBounds(TUCUMAN_BOUNDS, {
				paddingTopLeft: [24, paddingTop],
				paddingBottomRight: [24, 24],
				duration: 1.2,
			});
			return;
		}

		if (departamentosGeoJson) {
			// Buscamos el polígono correspondiente al departamento seleccionado
			const feature = departamentosGeoJson.features.find((f: Feature<Geometry, DepartmentProperties>) => {
				const properties = f.properties || {};
				const isDepartment =
					properties.admin_level === '5' || (properties.name && properties.name.includes('Departamento'));
				if (!isDepartment) return false;

				const nombreDepto = properties.name?.replace('Departamento ', '') || '';
				return nombreDepto === departamentoSeleccionado;
			});

			if (feature) {
				// Creamos temporalmente un objeto GeoJSON de Leaflet para calcular sus límites exactos (Bounds)
				const bounds = L.geoJSON(feature).getBounds();
				if (bounds.isValid()) {
					// Hacemos que la cámara vuele hacia esos límites con un margen
					map.flyToBounds(bounds, {
						paddingTopLeft: [24, paddingTop],
						paddingBottomRight: [24, 24],
						duration: 1.2,
					});
				}
			}
		}
	}, [departamentoSeleccionado, departamentosGeoJson, map, isMobile]);

	return null;
}

function SelectedPointFocuser({
	selectedId,
	points,
	filtrosAbiertos,
}: {
	selectedId: number | null;
	points: CulturalPoint[];
	filtrosAbiertos: boolean;
}) {
	const map = useMap();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

	React.useEffect(() => {
		if (selectedId === null) return;

		const punto = points.find((p) => p.id === selectedId);
		if (!punto) return;

		// En pantallas angostas (mobile) el panel flotante ocupa la parte superior de la pantalla.
		// Aplicamos un margen superior dinámico para centrar el marcador en la zona visible libre.
		const paddingTop = isMobile ? (filtrosAbiertos ? 500 : 360) : 120;
		const paddingRight = isMobile ? 20 : 380;

		const bounds = L.latLngBounds([punto.latitudlongitud]);
		map.flyToBounds(bounds, {
			maxZoom: 14,
			paddingTopLeft: [20, paddingTop],
			paddingBottomRight: [paddingRight, 20],
			duration: 1.2,
		});
	}, [selectedId, points, map, isMobile, filtrosAbiertos]);

	return null;
}

function FilteredPointsFocuser({
	points,
	busqueda,
	departamentoSeleccionado,
	categoriasSeleccionadas,
}: {
	points: CulturalPoint[];
	busqueda: string;
	departamentoSeleccionado: string;
	categoriasSeleccionadas: number[];
}) {
	const map = useMap();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

	React.useEffect(() => {
		const hayFiltrosActivos = Boolean(
			busqueda.trim() || departamentoSeleccionado || categoriasSeleccionadas.length,
		);
		if (!hayFiltrosActivos || points.length === 0) return;

		if (points.length === 1) {
			map.flyTo(points[0].latitudlongitud, 14, { duration: 1.2 });
			return;
		}

		const bounds = L.latLngBounds(points.map((point) => point.latitudlongitud));
		map.flyToBounds(bounds, {
			paddingTopLeft: [20, isMobile ? 80 : 120],
			paddingBottomRight: [20, 20],
			maxZoom: 14,
			duration: 1.2,
		});
	}, [busqueda, departamentoSeleccionado, categoriasSeleccionadas, map, points, isMobile]);

	return null;
}

function MapClickListener({ onMapClick }: { onMapClick: () => void }) {
	useMapEvents({
		click: () => {
			onMapClick();
		},
	});
	return null;
}

export default function TucumanMap() {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

	const { mode, systemMode } = useColorScheme();
	const isDarkMode = mode === 'system' ? systemMode === 'dark' : mode === 'dark';

	const [departamentosGeoJson, setDepartamentosGeoJson] = React.useState<FeatureCollection<
		Geometry,
		DepartmentProperties
	> | null>(null);

	const [categorias, setCategorias] = React.useState<FiltroCategoria[]>([]);
	const [departamentos, setDepartamentos] = React.useState<FiltroDepartamento[]>([]);
	const [categoriasSeleccionadas, setCategoriasSeleccionadas] = React.useState<number[]>([]);
	const [busqueda, setBusqueda] = React.useState<string>('');
	const debouncedBusqueda = useDebouncedValue(busqueda);
	const [departamentoSeleccionado, setDepartamentoSeleccionado] = React.useState<string>('');
	const [filtrosAbiertos, setFiltrosAbiertos] = React.useState<boolean>(false);

	const [cargandoPuntos, setCargandoPuntos] = React.useState<boolean>(false);
	const [puntosProcesados, setPuntosProcesados] = React.useState<CulturalPoint[]>([]);
	const [error, setError] = React.useState<string | null>(null);

	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const selectedIdParam = searchParams.get('selected');
	const selectedId = selectedIdParam !== null ? Number(selectedIdParam) : null;
	const [activeId, setActiveId] = React.useState<number | null>(selectedId);
	const [isLocked, setIsLocked] = React.useState<boolean>(selectedId !== null);

	React.useEffect(() => {
		if (selectedIdParam !== null) {
			const id = Number(selectedIdParam);
			setActiveId(id);
			setIsLocked(true);
		}
	}, [selectedIdParam]);

	const handleSelectPoint = React.useCallback(
		(id: number | null, shouldLockAndFly = true) => {
			setActiveId(id);
			if (shouldLockAndFly) {
				setIsLocked(id !== null);
				setSearchParams(
					(prev) => {
						const next = new URLSearchParams(prev);
						if (id !== null) {
							next.set('selected', String(id));
						} else {
							next.delete('selected');
						}
						return next;
					},
					{ replace: true },
				);
			}
		},
		[setSearchParams],
	);

	const activeActor = React.useMemo(() => {
		if (activeId === null) return null;
		return puntosProcesados.find((p) => p.id === activeId) || null;
	}, [activeId, puntosProcesados]);

	React.useEffect(() => {
		const controller = new AbortController();

		async function loadInitialMapData() {
			try {
				const [resDeptos, filtros] = await Promise.all([
					fetch(DEPARTAMENTOS_GEOJSON_URL, { signal: controller.signal }),
					obtenerFiltrosMapa(controller.signal),
				]);

				if (!resDeptos.ok) {
					throw new Error('No se pudo cargar la capa de departamentos.');
				}

				const deptosData = await resDeptos.json();

				setDepartamentosGeoJson(deptosData);
				setCategorias(filtros.categorias);
				setDepartamentos(filtros.departamentos);
			} catch (error) {
				if (!(error instanceof DOMException && error.name === 'AbortError')) {
					setError(error instanceof Error ? error.message : 'No se pudieron cargar los datos del mapa.');
				}
			}
		}

		loadInitialMapData();

		return () => controller.abort();
	}, []);

	React.useEffect(() => {
		const controller = new AbortController();

		async function loadPoints() {
			try {
				setCargandoPuntos(true);
				setError(null);

				const result = await obtenerActoresMapa(
					{
						busqueda: debouncedBusqueda,
						departamento: departamentoSeleccionado,
						categorias: categoriasSeleccionadas,
					},
					controller.signal,
				);

				setPuntosProcesados(
					result.data.map((actor) => ({
						id: actor.id,
						nombre: actor.nombre,
						descripcion: actor.descripcion,
						foto: actor.foto,
						categoria: actor.categoria,
						categoriaIcono: actor.categoriaIcono,
						departamento: actor.departamento,
						latitudlongitud: [actor.latitud, actor.longitud],
					})),
				);
			} catch (error) {
				if (!(error instanceof DOMException && error.name === 'AbortError')) {
					setError(error instanceof Error ? error.message : 'No se pudieron cargar los puntos del mapa.');
				}
			} finally {
				if (!controller.signal.aborted) {
					setCargandoPuntos(false);
				}
			}
		}

		loadPoints();

		return () => controller.abort();
	}, [debouncedBusqueda, departamentoSeleccionado, categoriasSeleccionadas]);

	const hayFiltrosActivos = Boolean(
		busqueda.trim() || departamentoSeleccionado || categoriasSeleccionadas.length > 0,
	);

	return (
		<Box
			sx={{
				position: 'relative',
				height: 'calc(100vh - 64px)',
				width: '100%',
				overflow: 'hidden',
				borderRadius: 1,
				border: '1px solid',
				borderColor: 'divider',
				'& .leaflet-container': {
					fontFamily: 'inherit',
				},
				// Aplicar filtro a los mapas base si es modo oscuro
				'& .leaflet-tile-pane': {
					filter: isDarkMode ? 'invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)' : 'none',
					transition: 'filter 0.3s ease',
				},
				// Aplicar colores a los botones de control (Zoom)
				'& .leaflet-bar': {
					border: isDarkMode ? 'none' : 'none',
					boxShadow: isDarkMode ? '0 1px 5px rgba(0,0,0,0.65)' : '0 1px 5px rgba(0,0,0,0.65)',
				},
				'& .leaflet-bar a': {
					backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
					color: isDarkMode ? '#ffffff' : '#333333',
					borderBottom: isDarkMode ? '1px solid #333333' : '1px solid #ccc',
				},
				'& .leaflet-bar a:hover': {
					backgroundColor: isDarkMode ? '#333333' : '#f4f4f4',
					color: isDarkMode ? '#ffffff' : '#333333',
				},
				'& .leaflet-bar a:last-child': {
					borderBottom: 'none',
				},
				// Aplicar colores al texto de atribución de Leaflet
				'& .leaflet-control-attribution': {
					backgroundColor: isDarkMode
						? 'rgba(30, 30, 30, 0.8) !important'
						: 'rgba(255, 255, 255, 0.8) !important',
					color: isDarkMode ? '#cccccc !important' : '#333333 !important',
				},
				'& .leaflet-control-attribution a': {
					color: isDarkMode ? '#90caf9 !important' : '#0078A8 !important',
				},
			}}
		>
			{/* Panel flotante de búsqueda y filtros */}
			<Box
				sx={{
					position: 'absolute',
					top: { xs: 10, sm: 16 },
					right: { xs: 10, sm: 16 },
					zIndex: 1000,
					width: { xs: 'calc(100% - 20px)', sm: 360 },
					maxWidth: 360,
					bgcolor: 'background.paper',
					borderRadius: 2,
					boxShadow: 6,
					overflow: 'hidden',
					transition: 'all 0.25s ease',
				}}
			>
				{/* Cabecera colapsable / Toggle para pantallas pequeñas */}
				<Box
					onClick={() => setFiltrosAbiertos((prev) => !prev)}
					sx={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						px: 2,
						py: 1.25,
						cursor: 'pointer',
						userSelect: 'none',
						bgcolor: isMobile && !filtrosAbiertos ? 'primary.main' : 'background.paper',
						color: isMobile && !filtrosAbiertos ? 'primary.contrastText' : 'text.primary',
						borderBottom: filtrosAbiertos ? '1px solid' : 'none',
						borderColor: 'divider',
						transition: 'background-color 0.2s ease',
					}}
				>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
						<FilterListIcon fontSize="small" />
						<Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
							{isMobile && !filtrosAbiertos
								? busqueda
									? `Búsqueda: "${busqueda}"`
									: `Filtros de mapa (${puntosProcesados.length})`
								: 'Filtros y Búsqueda'}
						</Typography>
						{hayFiltrosActivos && isMobile && !filtrosAbiertos && (
							<Chip
								label="Activos"
								size="small"
								color="secondary"
								sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }}
							/>
						)}
					</Box>
					<IconButton size="small" color="inherit" sx={{ ml: 1, p: 0.5 }}>
						{filtrosAbiertos ? <ExpandLessIcon /> : <ExpandMoreIcon />}
					</IconButton>
				</Box>

				<Collapse in={filtrosAbiertos} timeout="auto">
					<FiltroCategoriasCulturales
						categorias={categorias}
						departamentos={departamentos}
						categoriasSeleccionadas={categoriasSeleccionadas}
						onCambiarCategorias={setCategoriasSeleccionadas}
						busqueda={busqueda}
						onCambiarBusqueda={setBusqueda}
						departamentoSeleccionado={departamentoSeleccionado}
						onCambiarDepartamento={setDepartamentoSeleccionado}
						cargando={cargandoPuntos}
						totalResultados={puntosProcesados.length}
					/>
				</Collapse>

				{/* Tarjeta de Actor Cultural Seleccionado / Activo */}
				<Collapse in={Boolean(activeActor)} timeout="auto">
					{activeActor && (
						<Card
							sx={{
								borderTop: '1px solid',
								borderColor: 'divider',
								borderRadius: 0,
								boxShadow: 'none',
								maxHeight: { xs: 300, sm: 380 },
								overflowY: 'auto',
							}}
						>
							<CardActionArea
								component={Link}
								to={`/actores/${activeActor.id}?from=${encodeURIComponent(`/?selected=${activeActor.id}`)}`}
								sx={{
									height: '100%',
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'stretch',
									justifyContent: 'flex-start',
								}}
							>
								{activeActor.foto ? (
									<CardMedia
										component="img"
										height="160"
										image={activeActor.foto}
										alt={`Foto de ${activeActor.nombre}`}
										sx={{ objectFit: 'cover' }}
									/>
								) : null}

								<CardContent sx={{ p: 2, width: '100%', flexGrow: 1, '&:last-child': { pb: 2 } }}>
									<Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', mb: 1 }}>
										{activeActor.nombre}
									</Typography>

									<Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5} sx={{ mb: 1.5 }}>
										<Chip
											icon={<CategoryIcon icono={activeActor.categoriaIcono} fontSize="small" />}
											label={activeActor.categoria}
											size="small"
											color="primary"
											sx={{ height: 24, fontSize: '0.725rem' }}
										/>
										<Chip
											icon={<LocationOnIcon fontSize="small" />}
											label={activeActor.departamento}
											size="small"
											color="secondary"
											sx={{ height: 24, fontSize: '0.725rem' }}
										/>
									</Stack>

									{activeActor.descripcion && (
										<Typography
											variant="body2"
											color="text.secondary"
											sx={{
												fontSize: '0.825rem',
												mb: 1.5,
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												display: '-webkit-box',
												WebkitLineClamp: 3,
												WebkitBoxOrient: 'vertical',
											}}
										>
											{activeActor.descripcion}
										</Typography>
									)}

									<Box sx={{ mt: 1 }}>
										<Button
											variant="contained"
											fullWidth
											size="small"
											sx={{
												fontWeight: 600,
												fontSize: '0.8125rem',
												textTransform: 'none',
												pointerEvents: 'none',
											}}
										>
											Ver portafolio
										</Button>
									</Box>
								</CardContent>
							</CardActionArea>
						</Card>
					)}
				</Collapse>
			</Box>

			{error && (
				<Box
					sx={{
						position: 'absolute',
						left: 16,
						top: 16,
						zIndex: 1000,
						maxWidth: 'calc(100% - 32px)',
					}}
				>
					<Alert severity="error">{error}</Alert>
				</Box>
			)}

			<MapContainer
				bounds={TUCUMAN_BOUNDS}
				boundsOptions={{ padding: [24, 24] }}
				center={TUCUMAN_CENTER}
				zoom={8}
				minZoom={7}
				maxBounds={TUCUMAN_BOUNDS.pad(0.35)}
				maxBoundsViscosity={0.75}
				style={{ height: '100%', width: '100%' }}
			>
				<TileLayer
					attribution='<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>

				{/* Escuchador de clicks en zona libre del mapa para deseleccionar */}
				<MapClickListener onMapClick={() => handleSelectPoint(null, true)} />

				{/* Componente invisible que actualiza la cámara al cambiar de departamento */}
				<MapBoundsUpdater
					departamentoSeleccionado={departamentoSeleccionado}
					departamentosGeoJson={departamentosGeoJson}
				/>

				{/* Componente invisible que enfoca el punto pasado por ?selected= */}
				<SelectedPointFocuser
					selectedId={selectedId}
					points={puntosProcesados}
					filtrosAbiertos={filtrosAbiertos}
				/>

				{/* Componente invisible que ajusta la cámara a los resultados filtrados */}
				<FilteredPointsFocuser
					points={puntosProcesados}
					busqueda={debouncedBusqueda}
					departamentoSeleccionado={departamentoSeleccionado}
					categoriasSeleccionadas={categoriasSeleccionadas}
				/>

				{/* 6. Renderizar las líneas divisorias de los Departamentos */}
				{departamentosGeoJson && (
					<Pane name="departamentos-borders" style={{ zIndex: 690 }}>
						<GeoJSON
							data={departamentosGeoJson}
							interactive={false}
							filter={(feature) =>
								feature.geometry.type !== 'Point' && feature.geometry.type !== 'MultiPoint'
							}
							style={{
								color: isDarkMode ? '#90caf9' : '#666666',
								weight: 1,
								dashArray: '4 4', // Línea punteada para departamentos
								fillOpacity: 0,
								fillColor: isDarkMode ? '#1976d2' : '#e3f2fd',
							}}
						/>
					</Pane>
				)}

				{/* Puntos Culturales */}
				{puntosProcesados.map((point) => {
					const isActive = point.id === activeId;

					return (
						<CircleMarker
							key={point.id}
							center={point.latitudlongitud}
							fillColor={isActive ? '#e91e63' : '#1976d2'}
							fillOpacity={isActive ? 1 : 0.85}
							radius={isActive ? 14 : 11}
							stroke
							color="#ffffff"
							weight={isActive ? 3 : 2}
							eventHandlers={{
								mouseover: () => {
									if (!isLocked) {
										handleSelectPoint(point.id, false);
									}
								},
								click: (e) => {
									L.DomEvent.stopPropagation(e);
									handleSelectPoint(point.id, true);
								},
								dblclick: (e) => {
									L.DomEvent.stopPropagation(e);
									navigate(
										`/actores/${point.id}?from=${encodeURIComponent(`/?selected=${point.id}`)}`,
									);
								},
							}}
						/>
					);
				})}
			</MapContainer>
		</Box>
	);
}
