import * as React from 'react';
import Box from '@mui/material/Box';
import FiltroCategoriasCulturales from './FiltroCategoriasCulturales';
import L from 'leaflet';
import { CircleMarker, GeoJSON, MapContainer, Pane, Popup, TileLayer } from 'react-leaflet';
import type { FeatureCollection, Geometry } from 'geojson';
import { useColorScheme } from '@mui/material/styles';
// @ts-ignore
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

type CulturalPoint = {
	name: string;
	description: string;
	category: string;
	departamento: string;
	position: L.LatLngExpression;
};

const POINTS: CulturalPoint[] =
	[
		{
			"name": "Festival de la Alfalfa",
			"departamento": "Burruyacú",
			"description": "Tradicional festival folclórico que reúne a músicos locales y provinciales celebrando las raíces rurales.",
			"category": "Música",
			"position": [-26.5000, -64.7500]
		},
		{
			"name": "Taller de Tejido Criollo de Burruyacú",
			"departamento": "Burruyacú",
			"description": "Espacio comunitario dedicado a la preservación de técnicas ancestrales de hilado y telar criollo.",
			"category": "Artesanías",
			"position": [-26.5020, -64.7520]
		},
		{
			"name": "Grupo Ráfaga",
			"departamento": "Capital",
			"description": "Histórica y reconocida banda de cumbia con una enorme trayectoria y un vínculo entrañable con el público tucumano en grandes festivales populares.",
			"category": "Música",
			"position": [-26.8241, -65.2226]
		},
		{
			"name": "Homenaje a Mercedes Sosa",
			"departamento": "Capital",
			"description": "Espacio cultural y actividades conmemorativas dedicadas a mantener vivo el legado de 'La Voz de América'.",
			"category": "Música",
			"position": [-26.8280, -65.2210]
		},
		{
			"name": "Teatro San Martín",
			"departamento": "Capital",
			"description": "Principal coliseo de la provincia, sede de los cuerpos estables de teatro, ballet y ópera.",
			"category": "Teatro",
			"position": [-26.8195, -65.2105]
		},
		{
			"name": "Centro Cultural Eugenio Flavio Virla",
			"departamento": "Capital",
			"description": "Espacio artístico de la UNT que alberga muestras plásticas, recitales e importantes debates culturales.",
			"category": "Artes visuales",
			"position": [-26.8250, -65.2080]
		},
		{
			"name": "Escuela Universitaria de Cine, Video y Televisión",
			"departamento": "Capital",
			"description": "Semillero fundamental de realizadores audiovisuales que impulsan el cine independiente en el NOA.",
			"category": "Cine",
			"position": [-26.8220, -65.2060]
		},
		{
			"name": "Fotoclub Tucumán",
			"departamento": "Capital",
			"description": "Asociación que nuclea a fotógrafos locales enfocada en la documentación identitaria e histórica de la provincia.",
			"category": "Fotografía",
			"position": [-26.8260, -65.2010]
		},
		{
			"name": "Marca Diseño de Autor Tucumano",
			"departamento": "Capital",
			"description": "Colectivo de diseñadores locales que fusionan iconografía calchaquí con tendencias de indumentaria moderna.",
			"category": "Diseño",
			"position": [-26.8230, -65.2190]
		},
		{
			"name": "Biblioteca Sarmiento",
			"departamento": "Capital",
			"description": "Institución centenaria dedicada al resguardo bibliográfico y la promoción de la literatura regional.",
			"category": "Literatura",
			"position": [-26.8350, -65.2120]
		},
		{
			"name": "Casa Histórica de la Independencia",
			"departamento": "Capital",
			"description": "Monumento nacional icónico donde se proclamó la Declaración de la Independencia en 1816.",
			"category": "Patrimonio",
			"position": [-26.8306, -65.2039]
		},
		{
			"name": "Ballet Contemporáneo de la Provincia",
			"departamento": "Capital",
			"description": "Compañía artística oficial que desarrolla producciones coreográficas de vanguardia y giras regionales.",
			"category": "Danza",
			"position": [-26.8190, -65.2110]
		},
		{
			"name": "Teatro Estación Concepción",
			"departamento": "Chicligasta",
			"description": "Antigua estación ferroviaria recuperada como sala de teatro independiente y talleres comunitarios.",
			"category": "Teatro",
			"position": [-27.3450, -65.5950]
		},
		{
			"name": "Biblioteca Popular Mariano Moreno",
			"departamento": "Chicligasta",
			"description": "Espacio de fomento a la lectura que realiza ciclos de cafés literarios con autores del sur de la provincia.",
			"category": "Literatura",
			"position": [-27.3460, -65.5980]
		},
		{
			"name": "Feria de Artesanos del Sur",
			"departamento": "Chicligasta",
			"description": "Punto de encuentro semanal para artesanos del cuero, metal y cestería en la plaza principal de Concepción.",
			"category": "Artesanías",
			"position": [-27.3448, -65.5966]
		},
		{
			"name": "Academia de Danzas Tradicionales Banda del Río Salí",
			"departamento": "Cruz Alta",
			"description": "Escuela de formación para jóvenes bailarines enfocada en el malambo y las danzas folclóricas del NOA.",
			"category": "Danza",
			"position": [-26.8550, -65.1700]
		},
		{
			"name": "Festival de la Humita",
			"departamento": "Cruz Alta",
			"description": "Encuentro gastronómico y cultural que rinde homenaje a este plato ancestral del norte argentino.",
			"category": "Patrimonio",
			"position": [-26.8600, -65.1500]
		},
		{
			"name": "Fiesta Nacional de la Empanada",
			"departamento": "Famaillá",
			"description": "Famoso festival nacional que premia a los mejores campeones del repulgue y reúne grandes espectáculos folclóricos.",
			"category": "Patrimonio",
			"position": [-27.0510, -65.4020]
		},
		{
			"name": "Festival de Cortometrajes de Famaillá",
			"departamento": "Famaillá",
			"description": "Muestra competitiva de cine que convoca a realizadores independientes de cortometrajes y documentales.",
			"category": "Cine",
			"position": [-27.0500, -65.4000]
		},
		{
			"name": "Fiesta Provincial del Locro",
			"departamento": "Graneros",
			"description": "Encuentro masivo de cocina tradicional acompañado por peñas folclóricas al aire libre.",
			"category": "Patrimonio",
			"position": [-27.6500, -65.4300]
		},
		{
			"name": "Encuentro de Cantores Populares de Graneros",
			"departamento": "Graneros",
			"description": "Reunión anual de copleros y cantores de tonadas tradicionales del sur tucumano.",
			"category": "Música",
			"position": [-27.6520, -65.4310]
		},
		{
			"name": "Centro Cultural Alberdi",
			"departamento": "Juan Bautista Alberdi",
			"description": "Espacio público que promueve la actividad escénica a través de colectivos teatrales independientes.",
			"category": "Teatro",
			"position": [-27.5861, -65.6200]
		},
		{
			"name": "Cine Teatro Marconi",
			"departamento": "Juan Bautista Alberdi",
			"description": "Histórico edificio cinematográfico y de artes escénicas recuperado para la comunidad del sur provincial.",
			"category": "Cine",
			"position": [-27.5870, -65.6210]
		},
		{
			"name": "Festival de la Cocha y el Canto",
			"departamento": "La Cocha",
			"description": "Importante cita invernal de la música folclórica que congrega a reconocidas figuras nacionales.",
			"category": "Música",
			"position": [-27.7667, -65.5833]
		},
		{
			"name": "Muestra Fotográfica 'Rostros del Tabaco'",
			"departamento": "La Cocha",
			"description": "Exposición itinerante de fotoperiodismo sobre la vida, el trabajo y las tradiciones rurales locales.",
			"category": "Fotografía",
			"position": [-27.7690, -65.5810]
		},
		{
			"name": "Artesanos del Mimbre de Bella Vista",
			"departamento": "Leales",
			"description": "Agrupación de familias dedicadas a la cestería tradicional utilizando fibras naturales del entorno.",
			"category": "Artesanías",
			"position": [-27.0340, -65.3010]
		},
		{
			"name": "Teatro Comunitario de Leales",
			"departamento": "Leales",
			"description": "Colectivo teatral integrado por vecinos que relatan la historia azucarera del departamento a través de obras abiertas.",
			"category": "Teatro",
			"position": [-27.0333, -65.3000]
		},
		{
			"name": "Ruinas de San José de Lules",
			"departamento": "Lules",
			"description": "Antiguo conjunto arquitectónico jesuítico del siglo XVII, declarado Monumento Histórico Nacional.",
			"category": "Patrimonio",
			"position": [-26.9200, -65.3400]
		},
		{
			"name": "Lules Coral",
			"departamento": "Lules",
			"description": "Encuentro que congrega a coros polifónicos de diversas provincias en las históricas iglesias lulistas.",
			"category": "Música",
			"position": [-26.9167, -65.3333]
		},
		{
			"name": "Encuentro de Escritores 'Monteros de la Patria'",
			"departamento": "Monteros",
			"description": "Prestigioso foro literario del NOA donde poetas y novelistas exponen sus obras anualmente.",
			"category": "Literatura",
			"position": [-27.1667, -65.5000]
		},
		{
			"name": "Fortaleza del Folklore",
			"departamento": "Monteros",
			"description": "Uno de los festivales de música folclórica más antiguos y masivos del noroeste del país.",
			"category": "Música",
			"position": [-27.1680, -65.5020]
		},
		{
			"name": "Corsos de Carnaval de Aguilares",
			"departamento": "Río Chico",
			"description": "La mayor fiesta de carnaval de la provincia, famosa por el despliegue de sus comparsas y escuelas de danza.",
			"category": "Danza",
			"position": [-27.4350, -65.6180]
		},
		{
			"name": "Salón de Pintura Aguilares",
			"departamento": "Río Chico",
			"description": "Certamen anual de artes plásticas que expone lienzos inspirados en el paisaje y la idiosincrasia sureña.",
			"category": "Artes visuales",
			"position": [-27.4333, -65.6167]
		},
		{
			"name": "Feria de Simoca",
			"departamento": "Simoca",
			"description": "Feria centenaria viva, famosa por sus comidas típicas, artesanías y la clásica presencia del sulky.",
			"category": "Patrimonio",
			"position": [-27.2667, -65.3500]
		},
		{
			"name": "Festival Nacional del Sulky",
			"departamento": "Simoca",
			"description": "Homenaje al tradicional medio de transporte y a la cultura gaucha con desfiles y shows musicales.",
			"category": "Patrimonio",
			"position": [-27.2680, -65.3510]
		},
		{
			"name": "Ruinas de Quilmes",
			"departamento": "Tafí del Valle",
			"description": "Uno de los asentamientos prehispánicos más importantes del país, bastión de la resistencia calchaquí.",
			"category": "Patrimonio",
			"position": [-26.2778, -66.0222]
		},
		{
			"name": "Museo Jesuítico La Banda",
			"departamento": "Tafí del Valle",
			"description": "Estancia colonial del siglo XVIII que preserva mobiliario, arte sacro y vestigios arqueológicos vallistos.",
			"category": "Patrimonio",
			"position": [-26.8600, -65.7000]
		},
		{
			"name": "Ruta del Artesano de Tafí del Valle",
			"departamento": "Tafí del Valle",
			"description": "Circuito cultural que conecta talleres familiares de tejidos en telar, platería y cerámica rústica.",
			"category": "Artesanías",
			"position": [-26.8540, -65.7080]
		},
		{
			"name": "Poesía en las Nubes (Amaicha del Valle)",
			"departamento": "Tafí del Valle",
			"description": "Recital poético anual bajo el límpido cielo de los valles, impulsado por escritores indígenas.",
			"category": "Literatura",
			"position": [-26.5950, -65.9200]
		},
		{
			"name": "Festival Nacional del Limón",
			"departamento": "Tafí Viejo",
			"description": "Gran festival del folclore argentino que celebra la producción citrícola característica de la 'Capital del Limón'.",
			"category": "Música",
			"position": [-26.7333, -65.2667]
		},
		{
			"name": "Talleres Ferroviarios de Tafí Viejo",
			"departamento": "Tafí Viejo",
			"description": "Patrimonio industrial e histórico que forjó la identidad social, obrera y cultural de la ciudad.",
			"category": "Patrimonio",
			"position": [-26.7310, -65.2650]
		},
		{
			"name": "Fiesta Nacional del Caballo",
			"departamento": "Trancas",
			"description": "Cita fundamental de la tradición gaucha con jineteadas, destrezas ecuestres y destacados grupos folclóricos.",
			"category": "Patrimonio",
			"position": [-26.2333, -65.2800]
		},
		{
			"name": "Trancas Canta a la Patria",
			"departamento": "Trancas",
			"description": "Peña folclórica de vigilia que convoca a artistas locales en fechas patrias.",
			"category": "Música",
			"position": [-26.2350, -65.2820]
		},
		{
			"name": "Encuentro de Cine Independiente del NOA",
			"departamento": "Yerba Buena",
			"description": "Muestra audiovisual anual de directores emergentes del noroeste argentino.",
			"category": "Cine",
			"position": [-26.8167, -65.3000]
		},
		{
			"name": "Estudio de Diseño Sostenible Yerba Buena",
			"departamento": "Yerba Buena",
			"description": "Laboratorio de diseño enfocado en la creación de mobiliario contemporáneo con materiales reciclados y maderas nativas.",
			"category": "Diseño",
			"position": [-26.8180, -65.3020]
		},
		{
			"name": "Galería de Arte Contemporáneo 'El Árbol'",
			"departamento": "Yerba Buena",
			"description": "Espacio expositivo rodeado de yungas dedicado a la pintura, escultura e instalaciones conceptuales.",
			"category": "Artes visuales",
			"position": [-26.8120, -65.3050]
		},
		{
			"name": "Estudio de Danza Contemporánea Yerba Buena",
			"departamento": "Yerba Buena",
			"description": "Centro formativo de danzas modernas e investigación del movimiento corporal.",
			"category": "Danza",
			"position": [-26.8200, -65.2900]
		},
		{
			"name": "Teatro de la Paz",
			"departamento": "Capital",
			"description": "Espacio escénico independiente alternativo con fuerte enfoque en comedia musical y drama local.",
			"category": "Teatro",
			"position": [-26.8210, -65.2250]
		},
		{
			"name": "Cerámica Ancestral de Amaicha del Valle",
			"departamento": "Tafí del Valle",
			"description": "Taller enfocado en réplicas de vasijas e iconografía de la cultura Santa María.",
			"category": "Artesanías",
			"position": [-26.5934, -65.9187]
		},
		{
			"name": "Muestra Visual del Sur",
			"departamento": "Chicligasta",
			"description": "Salón anual de fotografía artística que premia las mejores capturas de paisajes y retratos tucumanos.",
			"category": "Fotografía",
			"position": [-27.3465, -65.5990]
		}
	];

export default function TucumanMap() {
	const { mode, systemMode } = useColorScheme();
	const isDarkMode = mode === 'system' ? systemMode === 'dark' : mode === 'dark';
	const [tucumanGeoJson, setTucumanGeoJson] = React.useState<FeatureCollection<
		Geometry,
		ProvinceProperties
	> | null>(null);

	const [categoriasSeleccionadas, setCategoriasSeleccionadas] = React.useState<string[]>([]);
	const [busqueda, setBusqueda] = React.useState<string>('');
	const [departamentoSeleccionado, setDepartamentoSeleccionado] = React.useState<string>('');

	const filteredPoints = POINTS.filter((point) => {
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
				{tucumanGeoJson ? (
					<Pane name='tucuman-border' style={{ zIndex: 700 }}>
						<GeoJSON
							data={tucumanGeoJson}
							interactive={false}
							style={{
								color: '#000000',
								weight: 4,
								opacity: 1,
								fillColor: '#1976d2',
								fillOpacity: 0,
							}}
						/>
					</Pane>
				) : null}

				{/* Cultural points */}
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
						</Popup>
					</CircleMarker>
				))}
			</MapContainer>
		</Box>
	);
}
