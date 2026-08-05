import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link as RouterLink } from 'react-router';
import {
	Box,
	Typography,
	Button,
	IconButton,
	Paper,
	Grid,
	Card,
	CardContent,
	Stack,
	Link as MuiLink,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkIcon from '@mui/icons-material/Link';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
// @ts-ignore
import 'leaflet/dist/leaflet.css';

// --- Tipos ampliados para incluir la nueva información ---
type ActorData = {
	id: number;
	nombre: string;
	descripcion: string;
	categoria: string;
	departamento: string;
	latitudlongitud: L.LatLngExpression;
	fotoUrl?: string;
	enlaces?: { id: number; descripcion: string; url: string }[];
	eventos?: { id: number; titulo: string; descripcion: string; fecha: string }[];
	preguntas?: { pregunta: string; respuesta: string }[];
	integrantes?: { nombre: string; rol: string; esDueño: boolean }[];
};

const MOCK_IMAGES = [
	'https://picsum.photos/seed/actor1/800/400',
	'https://picsum.photos/seed/actor2/800/400',
	'https://picsum.photos/seed/actor3/800/400',
];

// --- Helpers para identificar el tipo de enlace ---
type TipoEnlace = 'youtube' | 'instagram' | 'facebook' | 'whatsapp' | 'otro';

function detectarTipoEnlace(url: string): TipoEnlace {
	const u = url.toLowerCase();
	if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
	if (u.includes('instagram.com')) return 'instagram';
	if (u.includes('facebook.com') || u.includes('fb.com')) return 'facebook';
	if (u.includes('wa.me') || u.includes('whatsapp.com')) return 'whatsapp';
	return 'otro';
}

function obtenerIdYoutube(url: string): string | null {
	try {
		const parsed = new URL(url);
		if (parsed.hostname.includes('youtu.be')) {
			return parsed.pathname.replace('/', '') || null;
		}
		if (parsed.hostname.includes('youtube.com')) {
			// Formato estándar: ?v=ID
			const v = parsed.searchParams.get('v');
			if (v) return v;
			// Formato /embed/ID o /shorts/ID
			const partes = parsed.pathname.split('/').filter(Boolean);
			if (partes[0] === 'embed' || partes[0] === 'shorts') {
				return partes[1] || null;
			}
		}
		return null;
	} catch {
		return null;
	}
}

function iconoParaEnlace(tipo: TipoEnlace) {
	switch (tipo) {
		case 'instagram':
			return <InstagramIcon fontSize="small" sx={{ color: '#E1306C' }} />;
		case 'facebook':
			return <FacebookIcon fontSize="small" sx={{ color: '#1877F2' }} />;
		case 'whatsapp':
			return <WhatsAppIcon fontSize="small" sx={{ color: '#25D366' }} />;
		default:
			return <LinkIcon fontSize="small" color="action" />;
	}
}

export default function ActorPortfolio() {
	// Capturamos el id desde la URL
	const { id } = useParams<{ id: string }>();
	const [searchParams] = useSearchParams();
	// URL de retorno: quien nos linkeó (lista de actores, mapa, etc.) la manda en ?from=...
	const volverA = searchParams.get('from') || '/actoresPublico';

	const [actor, setActor] = useState<ActorData | null>(null);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);

	// Variable mock para simular si el usuario actual es dueño de este perfil
	const isDueño = true;

	useEffect(() => {
		// Aquí puedes hacer un fetch a tu JSON o API filtrando por el ID
		fetch('/data/puntos.json')
			.then((res) => res.json())
			.then((data: ActorData[]) => {
				const coincidencia = data.find((item) => String(item.id) === String(id));
				if (coincidencia) {
					// --- Inyectamos datos mock basados en datos.sql para completar la vista ---
					const actorEnriquecido: ActorData = {
						...coincidencia,
						enlaces: [
							{ id: 2, descripcion: 'Instagram', url: 'https://www.instagram.com/culturadetucuman' },
							{ id: 3, descripcion: 'Facebook', url: 'https://www.facebook.com/culturadetucuman' },
							{
								id: 4,
								descripcion: 'Contactanos por WhatsApp',
								url: 'https://wa.me/5493815551234',
							},
							{
								id: 5,
								descripcion: 'Sitio web oficial',
								url: 'https://www.culturadetucuman.com.ar',
							},
							{
								id: 1,
								descripcion: 'Presentación en Japón',
								url: 'http://youtube.com/watch?v=nAwCcBMQBrc',
							},
						],
						eventos: [
							{
								id: 1,
								titulo: 'Presentación en Peña Patria',
								descripcion:
									'Tocaremos nuestro nuevo disco en vivo. Con invitados especiales y artistas locales.',
								fecha: '2026-07-09 22:00',
							},
							{
								id: 2,
								titulo: 'Toque en Bar de Yerba Buena',
								descripcion: 'Cierre de la gira barrial. Presentación acústica e íntima.',
								fecha: '2026-08-15 23:30',
							},
							{
								id: 3,
								titulo: 'Nuevo album en streaming',
								descripcion: 'Escucha nuestro nuevo álbum en todas las plataformas de streaming.',
								fecha: '2026-02-15 23:30',
							},
						],
						preguntas: [
							{ pregunta: 'Rama productiva principal (Técnica)', respuesta: 'Telar Criollo' },
							{ pregunta: 'Género musical principal', respuesta: 'Indie Rock Alternativo' },
							{ pregunta: 'Cámaras o equipos utilizados', respuesta: 'Sony Alpha, Dron' },
						],
						integrantes: [
							{ nombre: 'César', rol: 'Batería', esDueño: true },
							{ nombre: 'Leandro', rol: 'Bajo', esDueño: false },
						],
					};
					setActor(actorEnriquecido);
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
		<Box sx={{ p: 4, maxWidth: 1200, margin: '0 auto' }}>
			{/* --- BARRA SUPERIOR (Botón Volver y Gestión) --- */}
			<Stack
				direction={{ xs: 'column', sm: 'row' }}
				justifyContent="space-between"
				alignItems="center"
				spacing={2}
				sx={{ mb: 4 }}
			>
				<Button component={RouterLink} to={volverA} variant="contained" color="inherit">
					Volver
				</Button>

				{isDueño && (
					<Stack direction="row" spacing={2} alignItems="center">
						<Button variant="contained" color="info">
							Gestionar portafolio
						</Button>
						<Button variant="contained" color="info">
							Gestionar eventos
						</Button>
						{/* <Button variant="contained" color="info">
							Postularse a convocatorias
						</Button> */}
					</Stack>
				)}
			</Stack>

			{/* --- CABECERA --- */}
			<Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
				{actor.nombre}
			</Typography>

			<Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
				{actor.categoria} | {actor.departamento}
			</Typography>

			{/* --- MULTIMEDIA Y MAPA --- */}
			<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4, mb: 4 }}>
				{/* COLUMNA IZQUIERDA: Carrusel de imágenes */}
				<Box>
					<Paper
						elevation={1}
						sx={{ position: 'relative', overflow: 'hidden', borderRadius: 2, height: 300 }}
					>
						<img
							src={MOCK_IMAGES[currentImageIndex]}
							alt={`Imagen ${currentImageIndex + 1} de ${actor.nombre}`}
							style={{ width: '100%', height: '100%', objectFit: 'cover' }}
						/>

						{/* Controles del carrusel */}
						<Box
							sx={{
								position: 'absolute',
								top: '50%',
								left: 0,
								right: 0,
								display: 'flex',
								justifyContent: 'space-between',
								px: 1,
								transform: 'translateY(-50%)',
							}}
						>
							<IconButton
								onClick={handlePrevImage}
								sx={{
									bgcolor: 'rgba(255,255,255,0.7)',
									'&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
								}}
							>
								<ArrowBackIosNewIcon fontSize="small" />
							</IconButton>
							<IconButton
								onClick={handleNextImage}
								sx={{
									bgcolor: 'rgba(255,255,255,0.7)',
									'&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
								}}
							>
								<ArrowForwardIosIcon fontSize="small" />
							</IconButton>
						</Box>
					</Paper>
				</Box>

				{/* COLUMNA DERECHA: Mapa Individual */}
				<Box>
					<Paper elevation={1} sx={{ overflow: 'hidden', borderRadius: 2, height: 300 }}>
						<MapContainer
							center={actor.latitudlongitud}
							zoom={14}
							minZoom={7}
							style={{ height: '100%', width: '100%' }}
							scrollWheelZoom={false} // Desactivado para que no interfiera con el scroll de la página
						>
							<TileLayer
								attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
								url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
							/>
							<CircleMarker
								center={actor.latitudlongitud}
								fillColor="#1976d2"
								fillOpacity={0.85}
								radius={10}
								stroke
								color="#ffffff"
								weight={2}
							/>
						</MapContainer>
					</Paper>
				</Box>
			</Box>

			{/* --- DESCRIPCIÓN --- */}
			<Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 4 }}>
				{actor.descripcion}
			</Typography>

			{/* --- ENLACES --- */}
			{actor.enlaces && actor.enlaces.length > 0 && (
				<Box sx={{ mb: 6 }}>
					<Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
						Enlaces
					</Typography>
					<Stack spacing={1} sx={{ mb: 3 }}>
						{actor.enlaces
							.filter((enlace) => detectarTipoEnlace(enlace.url) !== 'youtube')
							.map((enlace) => {
								const tipo = detectarTipoEnlace(enlace.url);
								return (
									<Stack key={enlace.id} direction="row" spacing={1} alignItems="center">
										{iconoParaEnlace(tipo)}
										<MuiLink href={enlace.url} target="_blank" rel="noopener" underline="hover">
											{enlace.descripcion}
										</MuiLink>
									</Stack>
								);
							})}
					</Stack>

					{/* Embeds de YouTube para cada enlace que sea un video */}
					<Grid container spacing={3}>
						{actor.enlaces
							.filter((enlace) => detectarTipoEnlace(enlace.url) === 'youtube')
							.map((enlace) => {
								const videoId = obtenerIdYoutube(enlace.url);
								if (!videoId) return null;
								return (
									<Grid size={{ xs: 12, sm: 6 }} key={`yt-${enlace.id}`}>
										<Paper elevation={1} sx={{ overflow: 'hidden', borderRadius: 2 }}>
											<Box sx={{ position: 'relative', pt: '56.25%' }}>
												<Box
													component="iframe"
													src={`https://www.youtube.com/embed/${videoId}`}
													title={enlace.descripcion}
													allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
													allowFullScreen
													sx={{
														position: 'absolute',
														top: 0,
														left: 0,
														width: '100%',
														height: '100%',
														border: 0,
													}}
												/>
											</Box>
											<Typography
												variant="caption"
												color="text.secondary"
												sx={{ display: 'block', p: 1 }}
											>
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
													<YouTubeIcon fontSize="small" color="error" />
													{enlace.descripcion}
												</Box>
											</Typography>
										</Paper>
									</Grid>
								);
							})}
					</Grid>
				</Box>
			)}

			{/* --- EVENTOS --- */}
			{actor.eventos && actor.eventos.length > 0 && (
				<Box sx={{ mb: 6 }}>
					<Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
						Eventos
					</Typography>
					<Grid container spacing={3}>
						{actor.eventos.slice(0, 4).map((evento) => (
							<Grid size={{ xs: 12, sm: 6 }} key={evento.id}>
								<Card
									variant="outlined"
									sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
								>
									<CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
										<Typography variant="subtitle2" color="text.secondary" gutterBottom>
											{evento.titulo}
										</Typography>

										<Typography variant="h6" sx={{ mb: 2 }}>
											{evento.descripcion}
										</Typography>

										<Typography variant="caption" color="text.secondary" sx={{ mt: 'auto' }}>
											Fecha evento: {evento.fecha}
										</Typography>
									</CardContent>
								</Card>
							</Grid>
						))}
					</Grid>
				</Box>
			)}

			{/* <Divider sx={{ mb: 4 }} /> */}

			{/* --- PREGUNTAS E INTEGRANTES --- */}
			<Grid container spacing={4} sx={{ mb: 4 }}>
				{actor.preguntas && actor.preguntas.length > 0 && (
					<Grid size={{ xs: 12, md: 6 }}>
						<Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
							Preguntas y respuestas
						</Typography>

						<Stack spacing={2}>
							{actor.preguntas.map((p, index) => (
								<Box key={index}>
									<Typography variant="body1">{p.pregunta}</Typography>
									<Typography variant="body2" color="text.secondary">
										{p.respuesta}
									</Typography>
								</Box>
							))}
						</Stack>
					</Grid>
				)}

				{actor.integrantes && actor.integrantes.length > 0 && (
					<Grid size={{ xs: 12, md: 6 }}>
						<Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
							Integrantes
						</Typography>
						<Stack spacing={1}>
							{actor.integrantes.map((integrante, index) => (
								<Typography key={index} variant="body1">
									{integrante.nombre} - {integrante.rol}
									{/* {integrante.esDueño && (
											<Typography
												component="span"
												variant="caption"
												color="text.secondary"
												sx={{ ml: 1 }}
											>
												(Dueño)
											</Typography>
										)} */}
								</Typography>
							))}
						</Stack>
					</Grid>
				)}
			</Grid>
		</Box>
	);
}
