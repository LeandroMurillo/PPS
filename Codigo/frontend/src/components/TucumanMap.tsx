import * as React from 'react';
import Box from '@mui/material/Box';
import FiltroCategoriasCulturales from './FiltroCategoriasCulturales';
import L from 'leaflet';
import { CircleMarker, GeoJSON, MapContainer, Pane, Popup, TileLayer, useMap } from 'react-leaflet';
import type { FeatureCollection, Geometry, Feature, Polygon, MultiPolygon } from 'geojson';
import { useColorScheme } from '@mui/material/styles';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point as turfPoint } from '@turf/helpers';
import { Link, useSearchParams } from 'react-router';

// @ts-ignore
import 'leaflet/dist/leaflet.css';

const TUCUMAN_CENTER: L.LatLngExpression = [-26.8241, -65.2226];
const TUCUMAN_BOUNDS = L.latLngBounds([-27.95, -66.35], [-25.75, -64.45]);
const DEPARTAMENTOS_GEOJSON_URL = '/data/departamentos.geojson';
const PUNTOS_JSON_URL = '/data/puntos.json';

type DepartmentProperties = {
	name?: string;
	admin_level?: string;
	[key: string]: unknown;
};

type CulturalPoint = {
	id: number;
	nombre: string;
	descripcion: string;
	categoria: string;
	departamento: string;
	latitudlongitud: L.LatLngExpression;
};

// Función auxiliar para normalizar texto (quitar acentos y pasar a minúsculas)
const normalizeText = (text: string) => {
	return text
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase();
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
			markerRefs.current[selectedId]?.openPopup();
		}, 400);

		return () => clearTimeout(timeout);
	}, [selectedId, points, map, markerRefs]);

	return null;
}

export default function TucumanMap() {
	const { mode, systemMode } = useColorScheme();
	const isDarkMode = mode === 'system' ? systemMode === 'dark' : mode === 'dark';

	const [departamentosGeoJson, setDepartamentosGeoJson] = React.useState<FeatureCollection<
		Geometry,
		DepartmentProperties
	> | null>(null);

	const [categoriasSeleccionadas, setCategoriasSeleccionadas] = React.useState<string[]>([]);
	const [busqueda, setBusqueda] = React.useState<string>('');
	const [departamentoSeleccionado, setDepartamentoSeleccionado] = React.useState<string>('');

	const [puntosProcesados, setPuntosProcesados] = React.useState<CulturalPoint[]>([]);

	const [searchParams] = useSearchParams();
	const selectedIdParam = searchParams.get('selected');
	const selectedId = selectedIdParam !== null ? Number(selectedIdParam) : null;
	const markerRefs = React.useRef<Record<number, L.CircleMarker | null>>({});

	React.useEffect(() => {
		const controller = new AbortController();

		async function loadMapData() {
			try {
				// 3. Cargamos ambos GeoJSON en paralelo
				const [resDeptos, resPuntos] = await Promise.all([
					fetch(DEPARTAMENTOS_GEOJSON_URL, { signal: controller.signal }),
					fetch(PUNTOS_JSON_URL, { signal: controller.signal }),
				]);

				if (!resDeptos.ok || !resPuntos.ok) {
					throw new Error('Error cargando archivos de datos');
				}

				const deptosData = await resDeptos.json();
				const puntosData: CulturalPoint[] = await resPuntos.json();

				setDepartamentosGeoJson(deptosData);

				// Calcular dinámicamente en qué departamento cae cada punto
				const puntosConDepartamentoDinamico = puntosData.map((punto) => {
					const positionArray = punto.latitudlongitud as [number, number];
					// Turf usa formato [Longitud, Latitud]
					const pt = turfPoint([positionArray[1], positionArray[0]]);

					// Buscamos qué polígono contiene al punto
					const departamentoEncontrado = deptosData.features.find(
						(feature: Feature<Geometry, DepartmentProperties>) => {
							const properties = feature.properties || {};
							// Evitamos que haga "match" con el polígono de toda la provincia entera
							// Forzamos a que sea un departamento (admin_level 5 o que su nombre tenga la palabra)
							const isDepartment =
								properties.admin_level === '5' ||
								(properties.name && properties.name.includes('Departamento'));

							return (
								isDepartment && booleanPointInPolygon(pt, feature as Feature<Polygon | MultiPolygon>)
							);
						},
					);

					let nombreDepto = punto.departamento; // Fallback al original por si acaso

					if (departamentoEncontrado) {
						// Limpiamos el texto, ej: "Departamento Famaillá" -> "Famaillá"
						nombreDepto =
							departamentoEncontrado.properties?.name?.replace('Departamento ', '') || nombreDepto;
					}

					return { ...punto, departamento: nombreDepto };
				});

				setPuntosProcesados(puntosConDepartamentoDinamico);
			} catch (error) {
				if (!(error instanceof DOMException && error.name === 'AbortError')) {
					console.error('Error cargando datos del mapa:', error);
				}
			}
		}

		loadMapData();

		return () => controller.abort();
	}, []);

	// 5. El filtro ahora usa puntosProcesados en vez de la constante POINTS directa
	const filteredPoints = puntosProcesados.filter((point) => {
		// Separar la búsqueda en palabras individuales y normalizarlas
		const searchTerms = normalizeText(busqueda).split(/\s+/).filter(Boolean);

		// Combinar toda la data del punto en un solo string normalizado
		const pointDataCombined = normalizeText(
			`${point.nombre} ${point.descripcion} ${point.categoria} ${point.departamento}`,
		);

		// Verificar que TODOS los términos buscados estén en la data del punto (sin importar el orden)
		const coincideBusqueda =
			searchTerms.length === 0 || searchTerms.every((term) => pointDataCombined.includes(term));

		const coincideCategoria =
			categoriasSeleccionadas.length === 0 || categoriasSeleccionadas.includes(point.categoria);

		const coincideDepartamento = departamentoSeleccionado === '' || point.departamento === departamentoSeleccionado;

		return coincideBusqueda && coincideCategoria && coincideDepartamento;
	});

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
					categoriasSeleccionadas={categoriasSeleccionadas}
					onCambiarCategorias={setCategoriasSeleccionadas}
					busqueda={busqueda}
					onCambiarBusqueda={setBusqueda}
					departamentoSeleccionado={departamentoSeleccionado}
					onCambiarDepartamento={setDepartamentoSeleccionado}
				/>
			</Box>

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
				{filteredPoints.map((point) => (
					<CircleMarker
						key={point.id}
						ref={(instance) => {
							markerRefs.current[point.id] = instance;
						}}
						center={point.latitudlongitud}
						fillColor="#1976d2"
						fillOpacity={0.85}
						radius={8}
						stroke
						color="#ffffff"
						weight={2}
					>
						<Popup>
							<strong>{point.nombre}</strong>
							<br />
							{point.descripcion}
							<br />
							<small>Categoría: {point.categoria}</small>
							<br />
							<Box sx={{ mt: 1 }}>
								<Link to={`/actores/${point.id}?from=${encodeURIComponent(`/?selected=${point.id}`)}`}>
									Ver portafolio
								</Link>
							</Box>
						</Popup>
					</CircleMarker>
				))}
			</MapContainer>
		</Box>
	);
}
