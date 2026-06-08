import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

// Importaciones de Leaflet
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import L from 'leaflet';

// @ts-ignore
import 'leaflet/dist/leaflet.css';

// Actualizamos el tipo para incluir la posición
type ActorData = {
	id: number;
	name: string;
	description: string;
	category: string;
	departamento: string;
	position: L.LatLngExpression; // Necesario para el mapa
};

// Imágenes de prueba hardcodeadas (usamos picsum.photos para tener imágenes aleatorias)
const MOCK_IMAGES = [
	'https://picsum.photos/seed/actor1/800/400',
	'https://picsum.photos/seed/actor2/800/400',
	'https://picsum.photos/seed/actor3/800/400',
];

const ActorPortfolio = () => {
	// Capturamos el id desde la URL
	const { id } = useParams<{ id: string }>();
	const [actor, setActor] = useState<ActorData | null>(null);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);

	// Buscar los datos del actor usando el ID
	useEffect(() => {
		// Aquí puedes hacer un fetch a tu JSON o API filtrando por el ID
		fetch('/data/puntos.json')
			.then((res) => res.json())
			.then((data: ActorData[]) => {
				const coincidencia = data.find((item) => String(item.id) === String(id));
				if (coincidencia) {
					setActor(coincidencia);
				}
			});
	}, [id]);

	// Funciones para manejar el carrusel
	const handlePrevImage = () => {
		setCurrentImageIndex((prev) => (prev === 0 ? MOCK_IMAGES.length - 1 : prev - 1));
	};

	const handleNextImage = () => {
		setCurrentImageIndex((prev) => (prev === MOCK_IMAGES.length - 1 ? 0 : prev + 1));
	};

	if (!actor) {
		return (
			<Box sx={{ p: 4, textAlign: 'center' }}>
				<Typography>Cargando portafolio...</Typography>
			</Box>
		);
	}

	return (
		<Box sx={{ p: 4, margin: '0 auto' }}>
			<Button component={Link} to="/" variant="outlined" sx={{ mb: 3 }}>
				Volver al Mapa
			</Button>

			<Typography variant="h3" component="h1" gutterBottom>
				{actor.name}
			</Typography>

			<Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
				{actor.category} | {actor.departamento}
			</Typography>

			{/* Grid para dividir el Carrusel y el Mapa */}
			<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4, mb: 4 }}>

				{/* COLUMNA IZQUIERDA: Carrusel de imágenes */}
				<Box>
					<Paper elevation={3} sx={{ position: 'relative', overflow: 'hidden', borderRadius: 2, height: 300 }}>
						<img
							src={MOCK_IMAGES[currentImageIndex]}
							alt={`Imagen ${currentImageIndex + 1} de ${actor.name}`}
							style={{ width: '100%', height: '100%', objectFit: 'cover' }}
						/>

						{/* Controles del carrusel */}
						<Box sx={{ position: 'absolute', top: '50%', left: 0, right: 0, display: 'flex', justifyContent: 'space-between', px: 1, transform: 'translateY(-50%)' }}>
							<IconButton onClick={handlePrevImage} sx={{ bgcolor: 'rgba(255,255,255,0.7)', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}>
								<ArrowBackIosNewIcon fontSize="small" />
							</IconButton>
							<IconButton onClick={handleNextImage} sx={{ bgcolor: 'rgba(255,255,255,0.7)', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}>
								<ArrowForwardIosIcon fontSize="small" />
							</IconButton>
						</Box>
					</Paper>
					<Typography variant="caption" display="block" textAlign="center" sx={{ mt: 1 }}>
						Imagen {currentImageIndex + 1} de {MOCK_IMAGES.length}
					</Typography>
				</Box>

				{/* COLUMNA DERECHA: Mapa Individual */}
				<Box>
					<Paper elevation={3} sx={{ overflow: 'hidden', borderRadius: 2, height: 300 }}>
						<MapContainer
							center={actor.position}
							zoom={14}
							style={{ height: '100%', width: '100%' }}
							scrollWheelZoom={false} // Desactivado para que no interfiera con el scroll de la página
						>
							<TileLayer
								attribution='<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
								url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
							/>
							<CircleMarker
								center={actor.position}
								fillColor="#1976d2"
								fillOpacity={0.85}
								radius={10}
								stroke
								color="#ffffff"
								weight={2}
							>
							</CircleMarker>
						</MapContainer>
					</Paper>
				</Box>
			</Box>

			{/* Detalles del Actor */}
			<Box sx={{ mt: 2 }}>
				<Typography variant="h5" gutterBottom>
					Sobre {actor.name}
				</Typography>
				<Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
					{actor.description}
				</Typography>
			</Box>
		</Box>
	);
};

export default ActorPortfolio;
