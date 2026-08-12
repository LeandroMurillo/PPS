import type { Feature, FeatureCollection, Geometry } from 'geojson';
import L from 'leaflet';
import * as React from 'react';
import { CircleMarker, GeoJSON, MapContainer, Pane, Popup, TileLayer, useMap } from 'react-leaflet';
import { Link, useSearchParams } from 'react-router';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useColorScheme } from '@mui/material/styles';

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

	React.useEffect(() => {
		// Si no hay departamento seleccionado (se limpió el filtro), volvemos a la vista general
		if (!departamentoSeleccionado) {
			map.flyToBounds(TUCUMAN_BOUNDS, { padding: [24, 24], duration: 1.2 });
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
					map.flyToBounds(bounds, { padding: [24, 24], duration: 1.2 });
				}
			}
		}
	}, [departamentoSeleccionado, departamentosGeoJson, map]);

	return null;
}

function SelectedPointFocuser({
	selectedId,
	points,
	markerRefs,
}: {
	selectedId: number | null;
	points: CulturalPoint[];
	markerRefs: React.RefObject<Record<number, L.CircleMarker | null>>;
}) {
	const map = useMap();

	React.useEffect(() => {
		if (selectedId === null) return;

		const punto = points.find((p) => p.id === selectedId);
		if (!punto) return;

		map.flyTo(punto.latitudlongitud, 14, { duration: 1.2 });

		// Esperamos a que termine el vuelo de la cámara antes de abrir el popup
		const timeout = setTimeout(() => {
			markerRefs.current?.[selectedId]?.openPopup();
		}, 400);

		return () => clearTimeout(timeout);
	}, [selectedId, points, map, markerRefs]);

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
		map.flyToBounds(bounds, { padding: [48, 48], maxZoom: 14, duration: 1.2 });
	}, [busqueda, departamentoSeleccionado, categoriasSeleccionadas, map, points]);

	return null;
}

export default function TucumanMap() {
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

	const [cargandoPuntos, setCargandoPuntos] = React.useState<boolean>(false);
	const [puntosProcesados, setPuntosProcesados] = React.useState<CulturalPoint[]>([]);
	const [error, setError] = React.useState<string | null>(null);

	const [searchParams] = useSearchParams();
	const selectedIdParam = searchParams.get('selected');
	const selectedId = selectedIdParam !== null ? Number(selectedIdParam) : null;
	const markerRefs = React.useRef<Record<number, L.CircleMarker | null>>({});

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
				// Aplicar colores del tema actual a los popups (el contenedor y la flecha)
				'& .leaflet-popup-content-wrapper, & .leaflet-popup-tip': {
					backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
					color: isDarkMode ? '#ffffff' : '#333333',
					transition: 'background-color 0.3s ease, color 0.3s ease',
					boxShadow: isDarkMode ? '0 3px 14px rgba(0,0,0,0.6)' : '0 3px 14px rgba(0,0,0,0.4)',
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
			<Box
				sx={{
					position: 'absolute',
					top: 16,
					right: 16,
					zIndex: 1000,
					width: 360,
					maxWidth: 'calc(100% - 32px)',
					bgcolor: 'background.paper',
					borderRadius: 2,
					boxShadow: 4,
				}}
			>
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

				{/* Componente invisible que actualiza la cámara al cambiar de departamento */}
				<MapBoundsUpdater
					departamentoSeleccionado={departamentoSeleccionado}
					departamentosGeoJson={departamentosGeoJson}
				/>

				{/* Componente invisible que enfoca y abre el popup del punto pasado por ?selected= */}
				<SelectedPointFocuser selectedId={selectedId} points={puntosProcesados} markerRefs={markerRefs} />

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
				{puntosProcesados.map((point) => (
					<CircleMarker
						key={point.id}
						ref={(instance) => {
							markerRefs.current[point.id] = instance;
						}}
						center={point.latitudlongitud}
						fillColor="#1976d2"
						fillOpacity={0.85}
						radius={11}
						stroke
						color="#ffffff"
						weight={2}
						eventHandlers={{
							mouseover: (event) => {
								event.target.openPopup();
							},
						}}
					>
						<Popup>
							<Box sx={{ minWidth: 160 }}>
								<Typography
									variant="subtitle2"
									component="strong"
									sx={{ display: 'block', fontWeight: 700 }}
								>
									{point.nombre}
								</Typography>
								{point.descripcion && (
									<Typography variant="body2" sx={{ mt: 0.5 }}>
										{point.descripcion}
									</Typography>
								)}
								<Box
									sx={{
										display: 'flex',
										alignItems: 'center',
										gap: 0.5,
										mt: 1,
										color: 'text.secondary',
									}}
								>
									<CategoryIcon icono={point.categoriaIcono} fontSize="small" />
									<Typography variant="caption" sx={{ lineHeight: 1 }}>
										{point.categoria}
									</Typography>
								</Box>
								<Box sx={{ mt: 1 }}>
									<Link
										to={`/actores/${point.id}?from=${encodeURIComponent(`/?selected=${point.id}`)}`}
									>
										Ver portafolio
									</Link>
								</Box>
							</Box>
						</Popup>
					</CircleMarker>
				))}
			</MapContainer>
		</Box>
	);
}
