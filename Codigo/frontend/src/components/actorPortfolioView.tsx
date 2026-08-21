import React, { useState } from 'react';
import { CircleMarker, MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link as RouterLink } from 'react-router';

import AddIcon from '@mui/icons-material/Add';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import BadgeIcon from '@mui/icons-material/Badge';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkIcon from '@mui/icons-material/Link';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import MapIcon from '@mui/icons-material/Map';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import RemoveIcon from '@mui/icons-material/Remove';
import SatelliteAltIcon from '@mui/icons-material/SatelliteAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import YouTubeIcon from '@mui/icons-material/YouTube';
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	Divider,
	FormControlLabel,
	Grid,
	IconButton,
	Link as MuiLink,
	Paper,
	Stack,
	Switch,
	Tooltip as MuiTooltip,
	Typography,
} from '@mui/material';

import { ESTADO_COLORS, getEstadoEtiqueta, getTipoActorEtiqueta } from '../constants/estados';
import { useAuth } from '../context/AuthContext';
import { formatEventDate } from '../utils/date';
import { detectarTipoEnlace, esImagenPortafolio, obtenerIdYoutube, type TipoEnlace } from '../utils/links';
import MarkdownContent from './markdownContent';
import SurveyAnswerDisplay from './surveyAnswerDisplay';

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
	cuit?: string | null;
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
		publico?: boolean;
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
		tipoDato?: string | null;
		publica?: boolean;
	}[];
	integrantes?: {
		id?: number | null;
		idUsuario?: number;
		tipo?: 'REGISTRADO' | 'NO_REGISTRADO';
		nombre: string;
		apellido?: string | null;
		email?: string | null;
		rol?: string | null;
		esDueno?: boolean;
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
	canViewPrivateInfo?: boolean;
	initialShowAllInfo?: boolean;
};

export function PortfolioMapControls({
	isSatelital,
	onToggleSatelital,
}: {
	isSatelital: boolean;
	onToggleSatelital: () => void;
}) {
	const map = useMap();
	const containerRef = React.useRef<HTMLDivElement | null>(null);

	React.useEffect(() => {
		if (containerRef.current) {
			L.DomEvent.disableClickPropagation(containerRef.current);
			L.DomEvent.disableScrollPropagation(containerRef.current);
		}
	}, []);

	return (
		<Paper
			ref={containerRef}
			elevation={3}
			onClick={(e) => {
				e.stopPropagation();
			}}
			onMouseDown={(e) => {
				e.stopPropagation();
			}}
			onDoubleClick={(e) => {
				e.stopPropagation();
			}}
			sx={{
				position: 'absolute',
				bottom: 8,
				left: 8,
				zIndex: 1000,
				display: 'flex',
				flexDirection: 'column',
				borderRadius: 1.5,
				overflow: 'hidden',
				bgcolor: 'background.paper',
				border: '1px solid',
				borderColor: 'divider',
			}}
		>
			<MuiTooltip title="Acercar" placement="right">
				<IconButton
					size="small"
					aria-label="Acercar"
					onClick={() => map.zoomIn()}
					sx={{ borderRadius: 0, p: 0.75 }}
				>
					<AddIcon fontSize="small" />
				</IconButton>
			</MuiTooltip>
			<Divider />
			<MuiTooltip title="Alejar" placement="right">
				<IconButton
					size="small"
					aria-label="Alejar"
					onClick={() => map.zoomOut()}
					sx={{ borderRadius: 0, p: 0.75 }}
				>
					<RemoveIcon fontSize="small" />
				</IconButton>
			</MuiTooltip>
			<Divider />
			<MuiTooltip
				title={isSatelital ? 'Cambiar a mapa de calles' : 'Cambiar a vista satelital'}
				placement="right"
			>
				<IconButton
					size="small"
					aria-label={isSatelital ? 'Cambiar a mapa de calles' : 'Cambiar a vista satelital'}
					onClick={onToggleSatelital}
					color={isSatelital ? 'primary' : 'default'}
					sx={{
						borderRadius: 0,
						p: 0.75,
						bgcolor: isSatelital ? 'action.selected' : 'transparent',
						'&:hover': {
							bgcolor: isSatelital ? 'action.selected' : 'action.hover',
						},
					}}
				>
					{isSatelital ? <MapIcon fontSize="small" /> : <SatelliteAltIcon fontSize="small" />}
				</IconButton>
			</MuiTooltip>
		</Paper>
	);
}

export default function ActorPortfolioView({
	actor,
	volverA,
	hideHeaderNav = false,
	showStatusAlert = true,
	canViewPrivateInfo,
	initialShowAllInfo = false,
}: ActorPortfolioViewProps) {
	const { user } = useAuth();
	const [currentImageIndex, setCurrentImageIndex] = useState(0);

	// Determinar si el usuario autenticado tiene privilegios para ver la parte privada
	const isPrivileged = React.useMemo(() => {
		if (canViewPrivateInfo !== undefined) return canViewPrivateInfo;
		if (!user) return false;
		if (user.rol === 'ADMIN' || user.rol === 'MODERADOR') return true;

		const isOwner =
			(actor.dueno &&
				(actor.dueno.id === user.idUsuario ||
					actor.dueno.email?.toLowerCase() === user.email?.toLowerCase())) ||
			actor.integrantes?.some(
				(i) =>
					i.esDueno &&
					(i.idUsuario === user.idUsuario || i.email?.toLowerCase() === user.email?.toLowerCase()),
			);

		const isMember = actor.integrantes?.some(
			(i) => i.idUsuario === user.idUsuario || (i.email && i.email.toLowerCase() === user.email?.toLowerCase()),
		);

		return Boolean(isOwner || isMember);
	}, [canViewPrivateInfo, user, actor.dueno, actor.integrantes]);

	// Estado del switch: solo puede activarse si el usuario es privilegiado
	const [showAllInfo, setShowAllInfo] = useState(Boolean(isPrivileged && initialShowAllInfo));
	const [mapaSatelital, setMapaSatelital] = useState(false);

	// Asegurar que si los permisos cambian, no se muestre información privada
	const effectiveShowAll = isPrivileged && showAllInfo;

	const portafolioItems = actor.portafolio ?? [];
	const enlacesPortafolio = portafolioItems.filter((item) => !esImagenPortafolio(item));
	const eventos = actor.eventos ?? [];
	const allRespuestas = actor.respuestas ?? [];
	const integrantes = actor.integrantes ?? [];

	// Filtrar preguntas según el modo de visualización
	const respuestas = React.useMemo(() => {
		if (effectiveShowAll) {
			return allRespuestas;
		}
		// En modo público, solo preguntas públicas
		return allRespuestas.filter((r) => r.publica !== false);
	}, [allRespuestas, effectiveShowAll]);

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

	// Visibilidad del mapa
	const ubicacionEsVisible = (actor.ubicacion.esPublica ?? true) || effectiveShowAll;
	const ubicacionMapa =
		ubicacionEsVisible &&
		actor.ubicacion.latitud !== null &&
		actor.ubicacion.latitud !== undefined &&
		actor.ubicacion.longitud !== null &&
		actor.ubicacion.longitud !== undefined
			? ([actor.ubicacion.latitud, actor.ubicacion.longitud] as [number, number])
			: null;

	const mostrarImagenes = imagenes.length > 0;
	const mostrarMultimedia = mostrarImagenes || ubicacionMapa !== null;
	const mostrarAmbasColumnas = mostrarImagenes && ubicacionMapa !== null;

	const mostrarDireccion = Boolean(
		actor.ubicacion.direccion && (actor.ubicacion.esPublica !== false || effectiveShowAll),
	);
	const textoUbicacion = [
		mostrarDireccion ? actor.ubicacion.direccion : null,
		actor.ubicacion.localidad,
		actor.ubicacion.departamento,
	]
		.filter(Boolean)
		.join(', ');

	return (
		<Box sx={{ width: '100%', maxWidth: 1200, margin: '0 auto', p: { xs: 2, sm: 3, md: 4 } }}>
			{/* --- BARRA SUPERIOR (Botón Volver) --- */}
			{!hideHeaderNav && volverA && (
				<Stack
					direction={{ xs: 'column', sm: 'row' }}
					justifyContent="space-between"
					alignItems="center"
					spacing={2}
					sx={{ mb: 3 }}
				>
					<Button component={RouterLink} to={volverA} variant="contained" color="inherit">
						Volver
					</Button>
				</Stack>
			)}

			{/* --- SWITCH DE CONTROL DE VISTA PRIVADA / COMPLETA --- */}
			{isPrivileged && (
				<Paper
					variant="outlined"
					sx={{
						p: 2,
						mb: 3,
						borderRadius: 2,
						bgcolor: effectiveShowAll ? 'action.hover' : 'background.paper',
						borderColor: effectiveShowAll ? 'primary.main' : 'divider',
						borderWidth: effectiveShowAll ? 2 : 1,
						display: 'flex',
						flexDirection: { xs: 'column', sm: 'row' },
						alignItems: { xs: 'flex-start', sm: 'center' },
						justifyContent: 'space-between',
						gap: 2,
					}}
				>
					<Stack direction="row" spacing={1.5} alignItems="center">
						{effectiveShowAll ? (
							<LockOpenIcon color="primary" sx={{ fontSize: 28 }} />
						) : (
							<VisibilityIcon color="action" sx={{ fontSize: 28 }} />
						)}
						<Box>
							<Typography variant="subtitle1" fontWeight={700}>
								{effectiveShowAll
									? 'Visualización Completa (con datos privados)'
									: 'Visualización Pública'}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								{effectiveShowAll
									? 'Estás viendo toda la información cargada.'
									: 'Estás viendo la ficha tal como la ven los visitantes del portal público.'}
							</Typography>
						</Box>
					</Stack>

					<FormControlLabel
						control={
							<Switch
								checked={showAllInfo}
								onChange={(e) => setShowAllInfo(e.target.checked)}
								color="primary"
							/>
						}
						label={
							<Typography variant="body2" fontWeight={700} sx={{ whiteSpace: 'nowrap' }}>
								Ver toda la info
							</Typography>
						}
						sx={{ m: 0 }}
					/>
				</Paper>
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
				{actor.tipoActor && (
					<Chip label={`Tipo: ${getTipoActorEtiqueta(actor.tipoActor)}`} variant="outlined" />
				)}
				{textoUbicacion && (
					<Chip icon={<LocationOnIcon fontSize="small" />} label={textoUbicacion} variant="outlined" />
				)}
				{effectiveShowAll && actor.ubicacion.esPublica === false && (
					<Chip
						icon={<LockIcon />}
						label="Ubicación privada"
						color="warning"
						variant="outlined"
						size="small"
					/>
				)}
				{effectiveShowAll && actor.cuit && (
					<Chip icon={<BadgeIcon />} label={`CUIT: ${actor.cuit}`} color="info" variant="outlined" />
				)}
				{effectiveShowAll && actor.estado && (
					<Chip
						label={`Estado: ${getEstadoEtiqueta(actor.estado)}`}
						color={ESTADO_COLORS[actor.estado] ?? 'default'}
					/>
				)}
			</Stack>

			{/* --- DATOS ADMINISTRATIVOS / INTERNOS (Solo en modo completo) --- */}
			{effectiveShowAll && (
				<Paper
					variant="outlined"
					sx={{
						p: 2.5,
						mb: 4,
						borderRadius: 2,
						bgcolor: 'background.paper',
						borderColor: 'divider',
					}}
				>
					<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
						<AdminPanelSettingsIcon color="primary" />
						<Typography variant="h6" fontWeight={700}>
							Datos administrativos e internos
						</Typography>
					</Stack>

					<Grid container spacing={2}>
						<Grid size={{ xs: 12, sm: 6, md: 3 }}>
							<Typography variant="caption" color="text.secondary" display="block">
								CUIT / Identificación
							</Typography>
							<Typography variant="body2" fontWeight={600}>
								{actor.cuit || 'Sin CUIT informado'}
							</Typography>
						</Grid>

						<Grid size={{ xs: 12, sm: 6, md: 3 }}>
							<Typography variant="caption" color="text.secondary" display="block">
								Visibilidad de ubicación
							</Typography>
							<Typography variant="body2" fontWeight={600}>
								{actor.ubicacion.esPublica ? 'Pública' : 'Privada (Oculta al público)'}
							</Typography>
						</Grid>

						<Grid size={{ xs: 12, sm: 6, md: 3 }}>
							<Typography variant="caption" color="text.secondary" display="block">
								Dirección exacta
							</Typography>
							<Typography variant="body2" fontWeight={600}>
								{actor.ubicacion.direccion || 'Sin dirección'}
							</Typography>
						</Grid>

						<Grid size={{ xs: 12, sm: 6, md: 3 }}>
							<Typography variant="caption" color="text.secondary" display="block">
								Creador / Titular de la ficha
							</Typography>
							<Typography variant="body2" fontWeight={600}>
								{actor.dueno ? (
									<>
										{actor.dueno.nombre} (
										<MuiLink href={`mailto:${actor.dueno.email}`} underline="hover">
											{actor.dueno.email}
										</MuiLink>
										)
									</>
								) : (
									'No informado'
								)}
							</Typography>
						</Grid>
					</Grid>
				</Paper>
			)}

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
							<Paper
								variant="outlined"
								sx={{
									height: { xs: 240, md: 320 },
									borderRadius: 2,
									overflow: 'hidden',
									position: 'relative',
									'& .leaflet-container': {
										fontFamily: 'inherit',
									},
								}}
							>
								{effectiveShowAll && actor.ubicacion.esPublica === false && (
									<Box
										sx={{
											position: 'absolute',
											top: 8,
											left: 8,
											zIndex: 1000,
											bgcolor: 'warning.main',
											color: 'warning.contrastText',
											px: 1,
											py: 0.25,
											borderRadius: 1,
											fontSize: '0.75rem',
											fontWeight: 700,
											display: 'flex',
											alignItems: 'center',
											gap: 0.5,
											boxShadow: 1,
										}}
									>
										<LockIcon sx={{ fontSize: 14 }} /> Ubicación privada
									</Box>
								)}
								<MapContainer
									center={ubicacionMapa}
									zoom={14}
									minZoom={7}
									zoomControl={false}
									style={{ height: '100%', width: '100%' }}
									scrollWheelZoom={false}
								>
									{/* Controles unificados de Zoom y Capa Satelital/Calles abajo a la izquierda */}
									<PortfolioMapControls
										isSatelital={mapaSatelital}
										onToggleSatelital={() => setMapaSatelital((prev) => !prev)}
									/>

									<TileLayer
										key={mapaSatelital ? 'satellite' : 'streets'}
										attribution={
											mapaSatelital
												? 'Esri, TomTom, Garmin, FAO, NOAA, USGS, and the GIS User Community'
												: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
										}
										url={
											mapaSatelital
												? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
												: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
										}
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
				<MarkdownContent sx={{ mb: 4 }}>{actor.descripcion}</MarkdownContent>
			)}

			{/* --- ENLACES --- */}
			{enlacesPortafolio.length > 0 && (
				<Box sx={{ mb: 6 }}>
					<Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
						Enlaces
					</Typography>
					<Stack spacing={1} sx={{ mb: 3 }}>
						{enlacesPortafolio
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
						{enlacesPortafolio
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
							<Stack spacing={2.5}>
								{respuestas.map((p, index) => (
									<Box key={index}>
										<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
											<Typography variant="body1" fontWeight={600}>
												{p.pregunta}
											</Typography>
											{effectiveShowAll && p.publica === false && (
												<Chip
													size="small"
													icon={<LockIcon sx={{ fontSize: '0.85rem !important' }} />}
													label="Privada"
													color="warning"
													variant="outlined"
													sx={{ height: 20, fontSize: '0.7rem' }}
												/>
											)}
										</Stack>
										<SurveyAnswerDisplay value={p.respuesta} tipoDato={p.tipoDato} emptyText="" />
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
							<Stack spacing={1.5}>
								{integrantes.map((integrante, index) => (
									<Box key={index}>
										<Stack direction="row" spacing={1} alignItems="center">
											<Typography variant="body1" fontWeight={500}>
												{integrante.nombre} {integrante.apellido || ''}
											</Typography>
											{integrante.rol && (
												<Chip
													size="small"
													label={integrante.rol}
													variant="outlined"
													sx={{ height: 22, fontSize: '0.75rem' }}
												/>
											)}
											{effectiveShowAll && integrante.esDueno && (
												<Chip
													size="small"
													label="Titular"
													color="primary"
													sx={{ height: 20, fontSize: '0.7rem' }}
												/>
											)}
										</Stack>
										{effectiveShowAll && integrante.email && (
											<Typography variant="caption" color="text.secondary" display="block">
												<MuiLink href={`mailto:${integrante.email}`} underline="hover">
													{integrante.email}
												</MuiLink>
											</Typography>
										)}
									</Box>
								))}
							</Stack>
						</Grid>
					)}
				</Grid>
			)}
		</Box>
	);
}
