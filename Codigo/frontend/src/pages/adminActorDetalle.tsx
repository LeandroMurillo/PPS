import * as React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import LanguageIcon from '@mui/icons-material/Language';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { PageContainer } from '@toolpad/core/PageContainer';
import { CircleMarker, MapContainer, TileLayer } from 'react-leaflet';
import { useNavigate, useParams } from 'react-router';
import 'leaflet/dist/leaflet.css';

type MockActor = {
	id: number;
	nombre: string;
	descripcion: string;
	foto: string;
	estado: 'A' | 'P' | 'I';
	tipoActor: 'INDIVIDUO' | 'COLECTIVO' | 'ESPACIO';
	cuit: string;
	fechaCreacion: string;
	categoria: string;
	subcategoria: string;
	dueno: { nombre: string; email: string };
	integrantes: { id: number; nombre: string; rol: string; esDueno?: boolean }[];
	ubicacion: {
		provincia: string;
		departamento: string;
		localidad: string;
		direccion: string;
		latitud: number;
		longitud: number;
		esPublica: boolean;
	};
	portafolio: { id: number; url: string; descripcion: string }[];
	enlaces: { tipo: 'web' | 'instagram'; etiqueta: string; url: string }[];
};

const MOCK_ACTOR: MockActor = {
	id: 12,
	nombre: 'Teatro Alberdi',
	descripcion:
		'Espacio cultural dedicado a las artes escénicas, la música y la formación artística. Su programación reúne producciones locales y propuestas invitadas.',
	foto: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=480&q=85',
	estado: 'A',
	tipoActor: 'ESPACIO',
	cuit: '30-71234567-8',
	fechaCreacion: '2025-03-18',
	categoria: 'Artes escénicas',
	subcategoria: 'Teatro',
	dueno: { nombre: 'Mariana Ruiz', email: 'mariana.ruiz@ejemplo.com' },
	integrantes: [
		{ id: 1, nombre: 'Mariana Ruiz', rol: 'Dirección general', esDueno: true },
		{ id: 2, nombre: 'Pablo Jiménez', rol: 'Producción' },
		{ id: 3, nombre: 'Lucía Fernández', rol: 'Comunicación' },
	],
	ubicacion: {
		provincia: 'Tucumán',
		departamento: 'Capital',
		localidad: 'San Miguel de Tucumán',
		direccion: 'Jujuy 99',
		latitud: -26.8333,
		longitud: -65.2138,
		esPublica: true,
	},
	portafolio: [
		{
			id: 1,
			url: 'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1000&q=85',
			descripcion: 'Sala principal durante una función',
		},
		{
			id: 2,
			url: 'https://images.unsplash.com/photo-1507924538820-ede94a04019d?auto=format&fit=crop&w=1000&q=85',
			descripcion: 'Ensayo sobre el escenario',
		},
		{
			id: 3,
			url: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=1000&q=85',
			descripcion: 'Presentación artística',
		},
	],
	enlaces: [
		{ tipo: 'web', etiqueta: 'teatroalberdi.com.ar', url: 'https://example.com' },
		{ tipo: 'instagram', etiqueta: '@teatroalberdi', url: 'https://instagram.com' },
	],
};

const stateLabels = { A: 'Activo', P: 'Pendiente', I: 'Inactivo' } as const;
const stateColors = { A: 'success', P: 'warning', I: 'default' } as const;

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
	return (
		<Paper component="section" variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, height: '100%' }}>
			<Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
				<Typography component="h2" variant="h6" fontWeight={700}>
					{title}
				</Typography>
				{action}
			</Stack>
			{children}
		</Paper>
	);
}

function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<Box>
			<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
				{label}
			</Typography>
			<Typography variant="body2" component="div">
				{value}
			</Typography>
		</Box>
	);
}

function ProfileTab({ actor }: { actor: MockActor }) {
	return (
		<Box
			sx={{
				display: 'grid',
				gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 0.9fr) minmax(0, 1.1fr)' },
				gap: 2,
				alignItems: 'start',
			}}
		>
			<Stack spacing={2}>
				<Section title="Información general">
					<Stack spacing={2}>
						<DataRow label="Descripción" value={actor.descripcion} />
						<Divider />
						<Box
							sx={{
								display: 'grid',
								gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
								gap: 2,
							}}
						>
							<DataRow label="CUIT" value={actor.cuit} />
							<DataRow
								label="Fecha de alta"
								value={new Intl.DateTimeFormat('es-AR', { dateStyle: 'long' }).format(
									new Date(`${actor.fechaCreacion}T12:00:00`),
								)}
							/>
							<DataRow label="Responsable" value={actor.dueno.nombre} />
							<DataRow
								label="Contacto"
								value={
									<Stack direction="row" spacing={0.75} alignItems="center">
										<EmailOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
										{actor.dueno.email}
									</Stack>
								}
							/>
						</Box>
					</Stack>
				</Section>

				<Section
					title={`Integrantes (${actor.integrantes.length})`}
					action={<GroupsOutlinedIcon color="action" />}
				>
					<Stack divider={<Divider flexItem />}>
						{actor.integrantes.map((integrante) => (
							<Stack
								key={integrante.id}
								direction="row"
								spacing={1.5}
								alignItems="center"
								sx={{ py: 1.25 }}
							>
								<Box
									sx={{
										width: 38,
										height: 38,
										borderRadius: '50%',
										bgcolor: 'action.hover',
										display: 'grid',
										placeItems: 'center',
										flex: '0 0 auto',
									}}
								>
									<PersonOutlineIcon color="action" fontSize="small" />
								</Box>
								<Box sx={{ minWidth: 0, flex: 1 }}>
									<Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
										<Typography variant="body2" fontWeight={600}>
											{integrante.nombre}
										</Typography>
										{integrante.esDueno && <Chip label="Dueña" size="small" variant="outlined" />}
									</Stack>
									<Typography variant="caption" color="text.secondary">
										{integrante.rol}
									</Typography>
								</Box>
							</Stack>
						))}
					</Stack>
				</Section>
			</Stack>

			<Stack spacing={2}>
				<Section title="Portafolio">
					<Box
						sx={{
							display: 'grid',
							gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
							gridTemplateRows: { xs: '150px 120px', sm: '210px 150px' },
							gap: 1,
							mb: 2,
						}}
					>
						{actor.portafolio.map((item, index) => (
							<Box
								key={item.id}
								component="img"
								src={item.url}
								alt={item.descripcion}
								sx={{
									width: '100%',
									height: '100%',
									objectFit: 'cover',
									borderRadius: 1,
									gridColumn: index === 0 ? '1 / -1' : undefined,
								}}
							/>
						))}
					</Box>
					<Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
						{actor.enlaces.map((enlace) => (
							<Link
								key={enlace.tipo}
								href={enlace.url}
								target="_blank"
								rel="noopener noreferrer"
								underline="hover"
								sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, fontSize: 14 }}
							>
								{enlace.tipo === 'instagram' ? (
									<InstagramIcon fontSize="small" />
								) : (
									<LanguageIcon fontSize="small" />
								)}
								{enlace.etiqueta}
							</Link>
						))}
					</Stack>
				</Section>

				<Section title="Ubicación">
					<Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 2 }}>
						<LocationOnOutlinedIcon color="action" fontSize="small" sx={{ mt: 0.25 }} />
						<Box>
							<Typography variant="body2" fontWeight={600}>
								{actor.ubicacion.direccion}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								{actor.ubicacion.localidad}, {actor.ubicacion.departamento}, {actor.ubicacion.provincia}
							</Typography>
							<Typography variant="caption" color="text.secondary">
								{actor.ubicacion.esPublica ? 'Ubicación visible públicamente' : 'Ubicación privada'}
							</Typography>
						</Box>
					</Stack>
					<Box sx={{ height: 260, overflow: 'hidden', borderRadius: 1 }}>
						<MapContainer
							center={[actor.ubicacion.latitud, actor.ubicacion.longitud]}
							zoom={14}
							scrollWheelZoom={false}
							style={{ height: '100%', width: '100%' }}
						>
							<TileLayer
								attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
								url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
							/>
							<CircleMarker
								center={[actor.ubicacion.latitud, actor.ubicacion.longitud]}
								radius={9}
								fillColor="#c2185b"
								fillOpacity={0.9}
								color="#ffffff"
								weight={3}
							/>
						</MapContainer>
					</Box>
				</Section>
			</Stack>
		</Box>
	);
}

export default function AdminActorDetallePage() {
	const navigate = useNavigate();
	const { actorId } = useParams();
	const [activeTab, setActiveTab] = React.useState(0);
	const actor = { ...MOCK_ACTOR, id: Number(actorId) || MOCK_ACTOR.id };

	return (
		<PageContainer title="Detalle del actor" maxWidth={false}>
			<Stack spacing={2.5}>
				<Button
					startIcon={<ArrowBackIcon />}
					onClick={() => navigate('/actoresAdmin')}
					sx={{ alignSelf: 'flex-start' }}
				>
					Volver a actores
				</Button>

				<Paper variant="outlined" sx={{ overflow: 'hidden' }}>
					<Box sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3 }, pb: 2.5 }}>
						<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems={{ sm: 'center' }}>
							<Box
								component="img"
								src={actor.foto}
								alt={`Foto de ${actor.nombre}`}
								sx={{
									width: 88,
									height: 88,
									borderRadius: '50%',
									objectFit: 'cover',
									flex: '0 0 auto',
								}}
							/>
							<Box sx={{ minWidth: 0, flex: 1 }}>
								<Stack
									direction="row"
									spacing={1}
									alignItems="center"
									flexWrap="wrap"
									useFlexGap
									sx={{ mb: 0.75 }}
								>
									<Typography component="h1" variant="h4" fontWeight={750}>
										{actor.nombre}
									</Typography>
									<Chip
										label={stateLabels[actor.estado]}
										color={stateColors[actor.estado]}
										size="small"
									/>
									<Chip label={actor.tipoActor} size="small" variant="outlined" />
								</Stack>
								<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
									<Chip label={actor.categoria} size="small" />
									<Chip label={actor.subcategoria} size="small" variant="outlined" />
									<Stack
										direction="row"
										spacing={0.5}
										alignItems="center"
										sx={{ color: 'text.secondary' }}
									>
										<CalendarTodayOutlinedIcon sx={{ fontSize: 15 }} />
										<Typography variant="caption">Actor #{actor.id}</Typography>
									</Stack>
								</Stack>
							</Box>
						</Stack>
					</Box>

					<Tabs
						value={activeTab}
						onChange={(_event, value: number) => setActiveTab(value)}
						variant="scrollable"
						scrollButtons="auto"
						aria-label="Secciones del actor"
						sx={{ px: { xs: 1, sm: 2 }, borderTop: 1, borderColor: 'divider' }}
					>
						<Tab label="Perfil" />
						<Tab label="Respuestas" disabled />
						<Tab label="Eventos" disabled />
						<Tab label="Convocatorias" disabled />
					</Tabs>
				</Paper>

				{activeTab === 0 && <ProfileTab actor={actor} />}
			</Stack>
		</PageContainer>
	);
}
