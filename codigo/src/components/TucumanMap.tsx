import * as React from 'react';
import Box from '@mui/material/Box';
import L from 'leaflet';
import { CircleMarker, GeoJSON, MapContainer, Pane, Popup, TileLayer, useMap } from 'react-leaflet';
import type { FeatureCollection, Geometry, Position } from 'geojson';
import 'leaflet/dist/leaflet.css';

const TUCUMAN_CENTER: L.LatLngExpression = [-26.8241, -65.2226];

const TUCUMAN_BOUNDS = L.latLngBounds([-27.95, -66.35], [-25.75, -64.45]);

const TUCUMAN_GEOJSON_URL = '/data/tucuman.geojson';

type ProvinceProperties = {
	id?: string;
	nam?: string;
	nombre?: string;
	nombre_completo?: string;
};

const POINTS = [
	{
		name: 'San Miguel de Tucumán',
		description: 'Capital de la provincia',
		position: [-26.8241, -65.2226] as L.LatLngExpression,
	},
	{
		name: 'Tafí del Valle',
		description: 'Valles Calchaquíes',
		position: [-26.8528, -65.7094] as L.LatLngExpression,
	},
	{
		name: 'Amaicha del Valle',
		description: 'Comunidad y paisaje vallisto',
		position: [-26.5934, -65.9187] as L.LatLngExpression,
	},
	{
		name: 'Concepción',
		description: 'Sur tucumano',
		position: [-27.3448, -65.5966] as L.LatLngExpression,
	},
];

function geometryToRings(geometry: Geometry): Position[][] {
	if (geometry.type === 'Polygon') {
		return geometry.coordinates;
	}

	if (geometry.type === 'MultiPolygon') {
		return geometry.coordinates.flat();
	}

	return [];
}

function buildClipPathFromGeoJson(
	geoJson: FeatureCollection<Geometry, ProvinceProperties>,
	map: L.Map,
) {
	const pathParts: string[] = [];

	geoJson.features.forEach((feature) => {
		const geometry = feature.geometry;

		if (!geometry) {
			return;
		}

		const rings = geometryToRings(geometry);

		rings.forEach((ring) => {
			if (ring.length === 0) {
				return;
			}

			const points = ring.map(([lng, lat]) => map.latLngToContainerPoint([lat, lng]));

			const [firstPoint, ...otherPoints] = points;

			if (!firstPoint) {
				return;
			}

			const path = `M ${firstPoint.x} ${firstPoint.y} ${otherPoints
				.map((point) => `L ${point.x} ${point.y}`)
				.join(' ')} Z`;

			pathParts.push(path);
		});
	});

	return pathParts.join(' ');
}

function TucumanColorClip({
	tucumanGeoJson,
	paneName,
}: {
	tucumanGeoJson: FeatureCollection<Geometry, ProvinceProperties>;
	paneName: string;
}) {
	const map = useMap();

	React.useEffect(() => {
		function updateClip() {
			const pane = map.getPane(paneName);

			if (!pane) {
				return;
			}

			const clipPath = buildClipPathFromGeoJson(tucumanGeoJson, map);

			pane.style.clipPath = `path("${clipPath}")`;
			pane.style.setProperty('-webkit-clip-path', `path("${clipPath}")`);
		}

		updateClip();

		map.on('zoom move resize', updateClip);

		return () => {
			map.off('zoom move resize', updateClip);
		};
	}, [map, paneName, tucumanGeoJson]);

	return null;
}

export default function TucumanMap() {
	const [tucumanGeoJson, setTucumanGeoJson] = React.useState<FeatureCollection<
		Geometry,
		ProvinceProperties
	> | null>(null);

	React.useEffect(() => {
		const controller = new AbortController();

		async function loadTucumanBoundary() {
			const response = await fetch(TUCUMAN_GEOJSON_URL, {
				signal: controller.signal,
			});

			if (!response.ok) {
				throw new Error('No se pudo cargar el archivo tucuman.geojson');
			}

			const provinces = (await response.json()) as FeatureCollection<Geometry, ProvinceProperties>;

			const tucumanOnly: FeatureCollection<Geometry, ProvinceProperties> = {
				...provinces,
				features: provinces.features.filter(
					(feature) => feature.properties?.id === '90' || feature.properties?.nombre === 'Tucumán',
				),
			};

			setTucumanGeoJson(tucumanOnly);
		}

		loadTucumanBoundary().catch((error: unknown) => {
			if (!(error instanceof DOMException && error.name === 'AbortError')) {
				console.error('No se pudo cargar el límite de Tucumán.', error);
			}
		});

		return () => {
			controller.abort();
		};
	}, []);

	return (
		<Box
			sx={{
				height: 'calc(100vh - 64px)',
				width: '100%',
				overflow: 'hidden',
				borderRadius: 1,
				border: '1px solid',
				borderColor: 'divider',
				'& .leaflet-container': {
					fontFamily: 'inherit',
				},
			}}
		>
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
				<Pane
					name='gray-map'
					style={{
						zIndex: 200,
						filter: 'grayscale(1) saturate(0.15) contrast(0.9)',
					}}
				>
					<TileLayer
						attribution='&copy; OpenStreetMap contributors'
						maxZoom={19}
						url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
					/>
				</Pane>

				<Pane
					name='color-map'
					style={{
						zIndex: 300,
						pointerEvents: 'none',
					}}
				>
					<TileLayer
						attribution='&copy; OpenStreetMap contributors'
						maxZoom={19}
						url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
					/>
				</Pane>

				{tucumanGeoJson ? (
					<TucumanColorClip tucumanGeoJson={tucumanGeoJson} paneName='color-map' />
				) : null}

				<Pane name='tucuman-border' style={{ zIndex: 700 }}>
					{tucumanGeoJson ? (
						<GeoJSON
							data={tucumanGeoJson}
							interactive={false}
							style={{
								color: '#000000',
								weight: 4,
								opacity: 1,
								fillColor: '#1976d2',
								fillOpacity: 0.08,
							}}
						/>
					) : null}
				</Pane>

				{POINTS.map((point) => (
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
						</Popup>
					</CircleMarker>
				))}
			</MapContainer>
		</Box>
	);
}
