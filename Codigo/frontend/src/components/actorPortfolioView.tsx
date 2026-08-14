import React, { useState } from 'react';
import { CircleMarker, MapContainer, TileLayer } from 'react-leaflet';
import { Link as RouterLink } from 'react-router';

import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkIcon from '@mui/icons-material/Link';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import YouTubeIcon from '@mui/icons-material/YouTube';
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	Grid,
	IconButton,
	Link as MuiLink,
	Paper,
	Stack,
	Typography,
} from '@mui/material';

import { formatEventDate } from '../utils/date';
import {
	detectarTipoEnlace,
	esImagenPortafolio,
	obtenerIdYoutube,
	type TipoEnlace,
} from '../utils/links';

import 'leaflet/dist/leaflet.css';

export { detectarTipoEnlace, esImagenPortafolio, obtenerIdYoutube, type TipoEnlace };
export const formatearFechaEvento = formatEventDate;

export function YoutubeThumbnailLink({ videoId, titulo }: { videoId: string; titulo: string }) {
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

export function iconoParaEnlace(tipo: TipoEnlace) {
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

export type ActorPortfolioViewData = {
	id?: number;
	nombre: string;
	categoria: string;
	subcategoria?: string | null;
	tipoActor?: string | null;
	descripcion?: string | null;
	foto?: string | null;
	estado?: string | null;
	ubicacion: {
		provincia?: string | null;
		departamento?: string | null;
		localidad?: string | null;
		direccion?: string | null;
		latitud?: number | null;
		longitud?: number | null;
		esPublica?: boolean;
	};
	portafolio?: {
		id?: number;
		tipo: string;
		url: string;
		descripcion?: string | null;
		titulo?: string | null;
	}[];
	eventos?: {
		id?: number;
		idEvento?: number;
		nombre: string;
		descripcion?: string | null;
		fecha: string;
	}[];
	respuestas?: {
		pregunta: string;
		respuesta?: string | number | boolean | string[] | null;
	}[];
	integrantes?: {
		id?: number;
		idUsuario?: number;
		nombre: string;
		apellido?: string | null;
		email?: string | null;
		rol?: string | null;
	}[];
	dueno?: {
		id?: number;
		nombre: string;
		email: string;
	} | null;
};

export type ActorPortfolioViewProps = {
	actor: ActorPortfolioViewData;
	volverA?: string;
	hideHeaderNav?: boolean;
	showStatusAlert?: boolean;
};

export default function ActorPortfolioView({
	actor,
	volverA,
	hideHeaderNav = false,
	showStatusAlert = true,
}: ActorPortfolioViewProps) {
	const [currentImageIndex, setCurrentImageIndex] = useState(0);

	const portafolioItems = actor.portafolio ?? [];
	const eventos = actor.eventos ?? [];
	const respuestas = actor.respuestas ?? [];
	const integrantes = actor.integrantes ?? [];

	const imagenes = React.useMemo(() => {
		const imagenesPortafolio = portafolioItems.filter(esImagenPortafolio).map((item) => ({
			url: item.url,
			descripcion: item.descripcion || item.titulo || actor.nombre,
		}));

		return actor.foto
			? [{ url: actor.foto, descripcion: `Foto de ${actor.nombre}` }, ...imagenesPortafolio]
			: imagenesPortafolio;
	}, [actor.foto, actor.nombre, portafolioItems]);

	const handlePrevImage = () => {
		setCurrentImageIndex((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1));
	};

	const handleNextImage = () => {
		setCurrentImageIndex((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1));
	};

	const ubicacionMapa =
		(actor.ubicacion.esPublica ?? true) &&
		actor.ubicacion.latitud !== null &&
		actor.ubicacion.latitud !== undefined &&
		actor.ubicacion.longitud !== null &&
		actor.ubicacion.longitud !== undefined
			? ([actor.ubicacion.latitud, actor.ubicacion.longitud] as [number, number])
			: null;

	const mostrarImagenes = imagenes.length > 0;
	const mostrarMultimedia = mostrarImagenes || ubicacionMapa !== null;
	const mostrarAmbasColumnas = mostrarImagenes && ubicacionMapa !== null;

	return (
		<Box sx={{ width: '100%', maxWidth: 1200, margin: '0 auto', p: { xs: 2, sm: 3, md: 4 } }}>
			{/* --- BARRA SUPERIOR (Botón Volver) --- */}
			{!hideHeaderNav && volverA && (
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
			)}

			{showStatusAlert && actor.estado && actor.estado !== 'A' && (
				<Alert severity="warning" sx={{ mb: 3 }}>
					<strong>Vista Previa Exclusiva:</strong> La ficha cultural de <strong>{actor.nombre}</strong> está
					en estado <strong>{actor.estado === 'P' ? 'Pendiente de revisión' : 'Inactivo'}</strong>. Esta vista
					previa únicamente es accesible para sus integrantes y moderadores.
				</Alert>
			)}

			{/* --- CABECERA --- */}
			<Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
				{actor.nombre || 'Nombre de la actividad cultural'}
			</Typography>

			<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 4 }}>
				{actor.categoria && <Chip label={actor.categoria} color="primary" />}
				{Boolean(actor.subcategoria) && <Chip label={actor.subcategoria} variant="outlined" />}
				{actor.ubicacion.departamento && (
					<Chip
						label={[actor.ubicacion.localidad, actor.ubicacion.departamento].filter(Boolean).join(', ')}
						variant="outlined"
					/>
				)}
			</Stack>

			{/* --- MULTIMEDIA Y MAPA --- */}
			{mostrarMultimedia && (
				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: {
							xs: 'minmax(0, 1fr)',
							md: mostrarAmbasColumnas ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1fr)',
						},
						gap: 4,
						mb: 4,
					}}
				>
					{/* COLUMNA IZQUIERDA: Carrusel de imágenes */}
					{mostrarImagenes && (
						<Box
							sx={{
								width: '100%',
								maxWidth: mostrarAmbasColumnas ? 'none' : { md: 'calc((100% - 32px) / 2)' },
								justifySelf: 'center',
							}}
						>
							<Paper
								elevation={1}
								sx={{ position: 'relative', overflow: 'hidden', borderRadius: 2, height: 300 }}
							>
								<img
									src={imagenes[currentImageIndex]?.url}
									alt={imagenes[currentImageIndex]?.descripcion}
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
							</Paper>
						</Box>
					)}

					{/* COLUMNA DERECHA: Mapa Individual */}
					{ubicacionMapa && (
						<Box
							sx={{
								width: '100%',
								maxWidth: mostrarAmbasColumnas ? 'none' : { md: 'calc((100% - 32px) / 2)' },
								justifySelf: 'center',
							}}
						>
							<Paper elevation={1} sx={{ overflow: 'hidden', borderRadius: 2, height: 300 }}>
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
							</Paper>
						</Box>
					)}
				</Box>
			)}

			{/* --- DESCRIPCIÓN --- */}
			{actor.descripcion && (
				<Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 4 }}>
					{actor.descripcion}
				</Typography>
			)}

			{/* --- ENLACES Y PORTAFOLIO --- */}
			{portafolioItems.length > 0 && (
				<Box sx={{ mb: 6 }}>
					<Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
						Portafolio
					</Typography>
					<Stack spacing={1} sx={{ mb: 3 }}>
						{portafolioItems
							.filter((enlace) => !esImagenPortafolio(enlace))
							.filter((enlace) => detectarTipoEnlace(enlace.url) !== 'youtube')
							.map((enlace, idx) => {
								const tipo = detectarTipoEnlace(enlace.url);
								return (
									<Stack key={enlace.url || idx} direction="row" spacing={1} alignItems="center">
										{iconoParaEnlace(tipo)}
										<MuiLink href={enlace.url} target="_blank" rel="noopener" underline="hover">
											{enlace.descripcion || enlace.titulo || enlace.url}
										</MuiLink>
									</Stack>
								);
							})}
					</Stack>

					{/* Embeds de YouTube */}
					<Grid container spacing={3}>
						{portafolioItems
							.filter((enlace) => !esImagenPortafolio(enlace))
							.filter((enlace) => detectarTipoEnlace(enlace.url) === 'youtube')
							.map((enlace, idx) => {
								const videoId = obtenerIdYoutube(enlace.url);
								if (!videoId) return null;
								return (
									<Grid size={{ xs: 12, sm: 6 }} key={`yt-${enlace.url || idx}`}>
										<Paper elevation={1} sx={{ overflow: 'hidden', borderRadius: 2 }}>
											<YoutubeThumbnailLink
												videoId={videoId}
												titulo={enlace.descripcion || enlace.titulo || actor.nombre}
											/>
											<Typography
												variant="caption"
												color="text.secondary"
												sx={{ display: 'block', p: 1 }}
											>
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
													<YouTubeIcon fontSize="small" color="error" />
													{enlace.descripcion || enlace.titulo || enlace.url}
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
			{eventos.length > 0 && (
				<Box sx={{ mb: 6 }}>
					<Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
						Eventos
					</Typography>
					<Grid container spacing={3}>
						{eventos.slice(0, 4).map((evento, idx) => (
							<Grid size={{ xs: 12, sm: 6 }} key={`${evento.nombre}-${evento.fecha}-${idx}`}>
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

			{/* --- PREGUNTAS E INTEGRANTES --- */}
			{(respuestas.length > 0 || integrantes.length > 0) && (
				<Grid container spacing={4} sx={{ mb: 4 }}>
					{respuestas.length > 0 && (
						<Grid size={{ xs: 12, md: 6 }}>
							<Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
								Preguntas y respuestas
							</Typography>
							<Stack spacing={2}>
								{respuestas.map((p, index) => (
									<Box key={index}>
										<Typography variant="body1" fontWeight={600}>
											{p.pregunta}
										</Typography>
										<Typography variant="body2" color="text.secondary">
											{Array.isArray(p.respuesta)
												? p.respuesta.join(', ')
												: String(p.respuesta ?? '')}
										</Typography>
									</Box>
								))}
							</Stack>
						</Grid>
					)}

					{integrantes.length > 0 && (
						<Grid size={{ xs: 12, md: 6 }}>
							<Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
								Integrantes
							</Typography>
							<Stack spacing={1}>
								{integrantes.map((integrante, index) => (
									<Typography key={index} variant="body1">
										{integrante.nombre} {integrante.apellido || ''}
										{integrante.rol ? ` - ${integrante.rol}` : ''}
									</Typography>
								))}
							</Stack>
						</Grid>
					)}
				</Grid>
			)}
		</Box>
	);
}
