import * as React from 'react';
import Box from '@mui/material/Box';
import FiltroCategoriasCulturales from './FiltroCategoriasCulturales';
import L from 'leaflet';
import { CircleMarker, GeoJSON, MapContainer, Pane, Popup, TileLayer } from 'react-leaflet';
import type { FeatureCollection, Geometry } from 'geojson';
import { useColorScheme } from '@mui/material/styles';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point as turfPoint } from '@turf/helpers';

// @ts-ignore
import 'leaflet/dist/leaflet.css';

const TUCUMAN_CENTER: L.LatLngExpression = [-26.8241, -65.2226];
const TUCUMAN_BOUNDS = L.latLngBounds([-27.95, -66.35], [-25.75, -64.45]);
const TUCUMAN_GEOJSON_URL = '/data/tucuman.geojson';
const DEPARTAMENTOS_GEOJSON_URL = '/data/departamentos.geojson';
const PUNTOS_JSON_URL = '/data/puntos.json';

type ProvinceProperties = {
	id?: string;
	nam?: string;
	nombre?: string;
	nombre_completo?: string;
};

type CulturalPoint = {
	name: string;
	description: string;
	category: string;
	departamento: string;
	position: L.LatLngExpression;
};

export default function TucumanMap() {
	const { mode, systemMode } = useColorScheme();
	const isDarkMode = mode === 'system' ? systemMode === 'dark' : mode === 'dark';

	const [tucumanGeoJson, setTucumanGeoJson] = React.useState<FeatureCollection<
		Geometry,
		ProvinceProperties
	> | null>(null);

	const [departamentosGeoJson, setDepartamentosGeoJson] = React.useState<FeatureCollection<
		Geometry,
		any
	> | null>(null);

	const [categoriasSeleccionadas, setCategoriasSeleccionadas] = React.useState<string[]>([]);
	const [busqueda, setBusqueda] = React.useState<string>('');
	const [departamentoSeleccionado, setDepartamentoSeleccionado] = React.useState<string>('');

	const [puntosProcesados, setPuntosProcesados] = React.useState<CulturalPoint[]>([]);

	React.useEffect(() => {
		const controller = new AbortController();

		async function loadMapData() {
			try {
				// 3. Cargamos ambos GeoJSON en paralelo
				const [resTucuman, resDeptos, resPuntos] = await Promise.all([
					fetch(TUCUMAN_GEOJSON_URL, { signal: controller.signal }),
					fetch(DEPARTAMENTOS_GEOJSON_URL, { signal: controller.signal }),
					fetch(PUNTOS_JSON_URL, { signal: controller.signal })
				]);

				if (!resTucuman.ok || !resDeptos.ok || !resPuntos.ok) {
					throw new Error('Error cargando archivos de datos');
				}

				const tucumanData = await resTucuman.json();
				const deptosData = await resDeptos.json();
				const puntosData: CulturalPoint[] = await resPuntos.json();

				// Filtrar frontera provincial si es necesario
				const tucumanOnly = {
					...tucumanData,
					features: tucumanData.features.filter(
						(f: any) => f.properties?.id === '90' || f.properties?.nombre === 'Tucumán'
					),
				};

				setTucumanGeoJson(tucumanOnly);
				setDepartamentosGeoJson(deptosData);

				// Calcular dinámicamente en qué departamento cae cada punto
				const puntosConDepartamentoDinamico = puntosData.map((punto) => {
					const positionArray = punto.position as [number, number];
					// Turf usa formato [Longitud, Latitud]
					const pt = turfPoint([positionArray[1], positionArray[0]]);

					// Buscamos qué polígono contiene al punto
					const departamentoEncontrado = deptosData.features.find((feature: any) => {
						const props = feature.properties || {};
						// Evitamos que haga "match" con el polígono de toda la provincia entera
						// Forzamos a que sea un departamento (admin_level 5 o que su nombre tenga la palabra)
						const isDepartment = props.admin_level === '5' || (props.name && props.name.includes('Departamento'));

						return isDepartment && booleanPointInPolygon(pt, feature);
					});

					let nombreDepto = punto.departamento; // Fallback al original por si acaso

					if (departamentoEncontrado) {
						// Limpiamos el texto, ej: "Departamento Famaillá" -> "Famaillá"
						nombreDepto = departamentoEncontrado.properties.name.replace('Departamento ', '');
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
		const textoBusqueda = busqueda.toLowerCase().trim();

		const coincideBusqueda =
			textoBusqueda === '' ||
			point.name.toLowerCase().includes(textoBusqueda) ||
			point.description.toLowerCase().includes(textoBusqueda) ||
			point.category.toLowerCase().includes(textoBusqueda) ||
			point.departamento.toLowerCase().includes(textoBusqueda);

		const coincideCategoria =
			categoriasSeleccionadas.length === 0 || categoriasSeleccionadas.includes(point.category);

		const coincideDepartamento =
			departamentoSeleccionado === '' || point.departamento === departamentoSeleccionado;

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
				// 2. Aplicar filtro a los mapas base si es modo oscuro
				'& .leaflet-tile-pane': {
					filter: isDarkMode
						? 'invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)'
						: 'none',
					transition: 'filter 0.3s ease',
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
					attribution=''
					maxZoom={19}
					url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
				/>

				{/* Tucumán border */}
				{/* {tucumanGeoJson && (
					<Pane name='tucuman-border' style={{ zIndex: 700 }}>
						<GeoJSON
							data={tucumanGeoJson}
							interactive={false}
							style={{
								color: isDarkMode ? '#bbdefb' : '#000000',
								weight: 4,
								opacity: 1,
								fillOpacity: 0,
							}}
						/>
					</Pane>
				)} */}

				{/* 6. Renderizar las líneas divisorias de los Departamentos */}
				{departamentosGeoJson && (
					<Pane name='departamentos-borders' style={{ zIndex: 690 }}>
						<GeoJSON
							data={departamentosGeoJson}
							interactive={false}
							filter={(feature) => feature.geometry.type !== 'Point' && feature.geometry.type !== 'MultiPoint'}
							style={{
								color: isDarkMode ? '#90caf9' : '#666666',
								weight: 1.5,
								dashArray: '4 4', // Línea punteada para departamentos
								fillOpacity: 0.05,
								fillColor: isDarkMode ? '#1976d2' : '#e3f2fd'
							}}
						/>
					</Pane>
				)}

				{/* Puntos Culturales */}
				{filteredPoints.map((point) => (
					<CircleMarker
						key={point.name}
						center={point.position}
						fillColor='#1976d2'
						fillOpacity={0.85}
						radius={8}
						stroke
						color='#ffffff'
						weight={2}
					>
						<Popup>
							<strong>{point.name}</strong>
							<br />
							{point.description}
							<br />
							<small>Categoría: {point.category}</small>
							<br />
							<small>Departamento: {point.departamento}</small>
						</Popup>
					</CircleMarker>
				))}
			</MapContainer>
		</Box>
	);
}
