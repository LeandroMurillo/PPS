import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link as RouterLink } from 'react-router';
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
	Alert,
	CircularProgress,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkIcon from '@mui/icons-material/Link';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
// @ts-ignore
import 'leaflet/dist/leaflet.css';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import { obtenerActor, type ActorDetalle } from '../api/actores';
import { buildSlugConId, parseIdDesdeSlug } from '../utils/slug';

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

function esImagenPortafolio(item: ActorDetalle['portafolio'][number]) {
	const tipo = item.tipo.toLowerCase();

	if (tipo.includes('imagen') || tipo.includes('foto')) {
		return true;
	}

	return /\.(jpe?g|png|webp|gif|avif)(\?.*)?$/i.test(item.url);
}

function formatearFechaEvento(fecha: string) {
	const date = new Date(fecha);

	if (Number.isNaN(date.getTime())) {
		return fecha;
	}

	return new Intl.DateTimeFormat(undefined, {
		weekday: 'long',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date);
}

// --- Miniatura de YouTube que abre el video en una pestaña nueva ---
// A diferencia de un <iframe>, esto nunca carga nada de youtube.com en la
// página: solo una imagen estática (i.ytimg.com). Cero cookies, incluso
// en modo "no-cookie", hasta que el usuario decide irse a YouTube.
function YoutubeThumbnailLink({ videoId, titulo }: { videoId: string; titulo: string }) {
	return (
		<MuiLink
			href={`https://www.youtube.com/watch?v=${videoId}`}
			target="_blank"
			rel="noopener noreferrer"
			sx={{
				position: 'relative',
				display: 'block',
				pt: '56.25%', // aspect ratio 16:9
				overflow: 'hidden',
			}}
		>
			<Box
				component="img"
				src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
				alt={titulo}
				loading="lazy"
				sx={{
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
					height: '100%',
					objectFit: 'cover',
				}}
			/>
			<Box
				sx={{
					position: 'absolute',
					inset: 0,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					bgcolor: 'rgba(0,0,0,0.15)',
					transition: 'background-color 0.2s',
					'&:hover': { bgcolor: 'rgba(0,0,0,0.35)' },
				}}
			>
				<PlayCircleFilledWhiteIcon sx={{ fontSize: 64, color: 'rgba(255,255,255,0.9)' }} />
			</Box>
		</MuiLink>
	);
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
	const navigate = useNavigate();
	const { actorSlug = '' } = useParams<{ actorSlug: string }>();
	const [searchParams] = useSearchParams();
	const volverA = searchParams.get('from') || '/actores';

	const [actor, setActor] = useState<ActorDetalle | null>(null);
	const [cargando, setCargando] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);

	useEffect(() => {
		const controller = new AbortController();
		const actorId = parseIdDesdeSlug(actorSlug);

		async function loadActor() {
			if (!actorId) {
				setError('El identificador del actor no es válido.');
				setCargando(false);
				return;
			}

			try {
				setCargando(true);
				setError(null);

				const result = await obtenerActor(actorId, controller.signal);

				setActor(result.data);
				setCurrentImageIndex(0);

				const canonicalSlug = buildSlugConId(result.data.id, result.data.nombre);
				if (actorSlug !== canonicalSlug) {
					const searchStr = volverA && volverA !== '/actores' ? `?from=${encodeURIComponent(volverA)}` : '';
					navigate(`/actores/${canonicalSlug}${searchStr}`, { replace: true });
				}
			} catch (error) {
				if (!(error instanceof DOMException && error.name === 'AbortError')) {
					setError(error instanceof Error ? error.message : 'No se pudo cargar el portafolio.');
				}
			} finally {
				if (!controller.signal.aborted) {
					setCargando(false);
				}
			}
		}

		loadActor();

		return () => controller.abort();
	}, [actorSlug, navigate, volverA]);

	const imagenes = React.useMemo(() => {
		if (!actor) {
			return [];
		}

		const imagenesPortafolio = actor.portafolio.filter(esImagenPortafolio).map((item) => ({
			url: item.url,
			descripcion: item.descripcion ?? actor.nombre,
		}));

		return actor.foto
			? [{ url: actor.foto, descripcion: `Foto de ${actor.nombre}` }, ...imagenesPortafolio]
			: imagenesPortafolio;
	}, [actor]);

	const handlePrevImage = () => {
		setCurrentImageIndex((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1));
	};

	const handleNextImage = () => {
		setCurrentImageIndex((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1));
	};

	if (cargando) {
		return (
			<Box sx={{ p: 4, textAlign: 'center' }}>
				<CircularProgress />
			</Box>
		);
	}

	if (error || !actor) {
		return (
			<Box sx={{ p: 4, maxWidth: 900, margin: '0 auto' }}>
				<Alert severity="error">{error ?? 'No se encontró el actor solicitado.'}</Alert>
			</Box>
		);
	}

	const ubicacionMapa =
		actor.ubicacion.latitud !== null && actor.ubicacion.longitud !== null
			? ([actor.ubicacion.latitud, actor.ubicacion.longitud] as [number, number])
			: null;

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
			</Stack>

			{/* --- CABECERA --- */}
			<Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
				{actor.nombre}
			</Typography>

			<Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
				{actor.categoria} | {actor.ubicacion.departamento}
			</Typography>

			{/* --- MULTIMEDIA Y MAPA --- */}
			<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4, mb: 4 }}>
				{/* COLUMNA IZQUIERDA: Carrusel de imágenes */}
				<Box>
					<Paper
						elevation={1}
						sx={{ position: 'relative', overflow: 'hidden', borderRadius: 2, height: 300 }}
					>
						{imagenes.length > 0 ? (
							<>
								<img
									src={imagenes[currentImageIndex].url}
									alt={imagenes[currentImageIndex].descripcion}
									style={{ width: '100%', height: '100%', objectFit: 'cover' }}
								/>

								{imagenes.length > 1 && (
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
								)}
							</>
						) : (
							<Box
								sx={{
									height: '100%',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									bgcolor: 'action.hover',
									color: 'text.secondary',
								}}
							>
								Sin imágenes disponibles
							</Box>
						)}
					</Paper>
				</Box>

				{/* COLUMNA DERECHA: Mapa Individual */}
				<Box>
					<Paper elevation={1} sx={{ overflow: 'hidden', borderRadius: 2, height: 300 }}>
						{ubicacionMapa ? (
							<MapContainer
								center={ubicacionMapa}
								zoom={14}
								minZoom={7}
								style={{ height: '100%', width: '100%' }}
								scrollWheelZoom={false}
							>
								<TileLayer
									attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
									url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
								/>
								<CircleMarker
									center={ubicacionMapa}
									fillColor="#1976d2"
									fillOpacity={0.85}
									radius={10}
									stroke
									color="#ffffff"
									weight={2}
								/>
							</MapContainer>
						) : (
							<Box
								sx={{
									height: '100%',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									bgcolor: 'action.hover',
									color: 'text.secondary',
									textAlign: 'center',
									p: 2,
								}}
							>
								Ubicación detallada no disponible
							</Box>
						)}
					</Paper>
				</Box>
			</Box>

			{/* --- DESCRIPCIÓN --- */}
			<Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 4 }}>
				{actor.descripcion}
			</Typography>

			{/* --- ENLACES --- */}
			{actor.portafolio.length > 0 && (
				<Box sx={{ mb: 6 }}>
					<Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
						Portafolio
					</Typography>
					<Stack spacing={1} sx={{ mb: 3 }}>
						{actor.portafolio
							.filter((enlace) => !esImagenPortafolio(enlace))
							.filter((enlace) => detectarTipoEnlace(enlace.url) !== 'youtube')
							.map((enlace) => {
								const tipo = detectarTipoEnlace(enlace.url);
								return (
									<Stack key={enlace.url} direction="row" spacing={1} alignItems="center">
										{iconoParaEnlace(tipo)}
										<MuiLink href={enlace.url} target="_blank" rel="noopener" underline="hover">
											{enlace.descripcion ?? enlace.url}
										</MuiLink>
									</Stack>
								);
							})}
					</Stack>

					{/* Embeds de YouTube para cada enlace que sea un video */}
					<Grid container spacing={3}>
						{actor.portafolio
							.filter((enlace) => !esImagenPortafolio(enlace))
							.filter((enlace) => detectarTipoEnlace(enlace.url) === 'youtube')
							.map((enlace) => {
								const videoId = obtenerIdYoutube(enlace.url);
								if (!videoId) return null;
								return (
									<Grid size={{ xs: 12, sm: 6 }} key={`yt-${enlace.url}`}>
										<Paper elevation={1} sx={{ overflow: 'hidden', borderRadius: 2 }}>
											<YoutubeThumbnailLink
												videoId={videoId}
												titulo={enlace.descripcion ?? actor.nombre}
											/>
											<Typography
												variant="caption"
												color="text.secondary"
												sx={{ display: 'block', p: 1 }}
											>
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
													<YouTubeIcon fontSize="small" color="error" />
													{enlace.descripcion ?? enlace.url}
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
			{actor.eventos.length > 0 && (
				<Box sx={{ mb: 6 }}>
					<Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
						Eventos
					</Typography>
					<Grid container spacing={3}>
						{actor.eventos.slice(0, 4).map((evento) => (
							<Grid size={{ xs: 12, sm: 6 }} key={`${evento.nombre}-${evento.fecha}`}>
								<Card
									variant="outlined"
									sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
								>
									<CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
										<Typography variant="subtitle2" color="text.secondary" gutterBottom>
											{evento.nombre}
										</Typography>

										<Typography variant="h6" sx={{ mb: 2 }}>
											{evento.descripcion}
										</Typography>

										<Typography variant="caption" color="text.secondary" sx={{ mt: 'auto' }}>
											{formatearFechaEvento(evento.fecha)}
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
				{actor.respuestas.length > 0 && (
					<Grid size={{ xs: 12, md: 6 }}>
						<Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
							Preguntas y respuestas
						</Typography>

						<Stack spacing={2}>
							{actor.respuestas.map((p, index) => (
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

				{actor.integrantes.length > 0 && (
					<Grid size={{ xs: 12, md: 6 }}>
						<Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
							Integrantes
						</Typography>
						<Stack spacing={1}>
							{actor.integrantes.map((integrante, index) => (
								<Typography key={index} variant="body1">
									{integrante.nombre} {integrante.apellido}
									{integrante.rol ? ` - ${integrante.rol}` : ''}
								</Typography>
							))}
						</Stack>
					</Grid>
				)}
			</Grid>
		</Box>
	);
}
