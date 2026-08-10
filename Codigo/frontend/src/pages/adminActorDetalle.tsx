import * as React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import LanguageIcon from '@mui/icons-material/Language';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { CircleMarker, MapContainer, TileLayer } from 'react-leaflet';
import { Link as RouterLink, useNavigate, useParams } from 'react-router';
import 'leaflet/dist/leaflet.css';

import { obtenerActorAdmin, type ActorDetalleAdmin } from '../api/admin';

const stateLabels = { A: 'Activo', P: 'Pendiente', I: 'Inactivo' } as const;
const stateColors = { A: 'success', P: 'warning', I: 'default' } as const;

function formatDate(value: string) {
	return new Intl.DateTimeFormat('es-AR', { dateStyle: 'long' }).format(new Date(value));
}

function formatCuit(value: string | null) {
	if (!value) return 'No informado';
	const digits = value.replace(/\D/g, '');
	return digits.length === 11 ? `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}` : value;
}

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

function PortfolioSection({ actor }: { actor: ActorDetalleAdmin }) {
	const images = actor.portafolio.filter((item) => item.tipo === 'IMAGEN');
	const links = actor.portafolio.filter((item) => item.tipo !== 'IMAGEN');

	return (
		<Section title="Portafolio">
			{images.length > 0 ? (
				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
						gridAutoRows: { xs: 130, sm: 170 },
						gap: 1,
						mb: links.length > 0 ? 2 : 0,
					}}
				>
					{images.slice(0, 3).map((item, index) => (
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
								gridColumn: index === 0 && images.length > 1 ? '1 / -1' : undefined,
							}}
						/>
					))}
				</Box>
			) : (
				<Box
					sx={{
						py: 4,
						mb: links.length > 0 ? 2 : 0,
						textAlign: 'center',
						bgcolor: 'action.hover',
						borderRadius: 1,
					}}
				>
					<Typography variant="body2" color="text.secondary">
						Sin imágenes cargadas
					</Typography>
				</Box>
			)}

			{links.length > 0 && (
				<Stack spacing={1}>
					{links.map((item) => {
						const isInstagram = item.url.toLowerCase().includes('instagram.com');
						return (
							<Link
								key={item.id}
								href={item.url}
								target="_blank"
								rel="noopener noreferrer"
								underline="hover"
								sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, fontSize: 14 }}
							>
								{isInstagram ? <InstagramIcon fontSize="small" /> : <LanguageIcon fontSize="small" />}
								{item.descripcion || item.url}
							</Link>
						);
					})}
				</Stack>
			)}
		</Section>
	);
}

function ProfileTab({ actor }: { actor: ActorDetalleAdmin }) {
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
							<DataRow label="CUIT" value={formatCuit(actor.cuit)} />
							<DataRow label="Fecha de alta" value={formatDate(actor.fechaCreacion)} />
							<DataRow label="Responsable" value={actor.dueno?.nombre ?? 'Sin responsable asignado'} />
							<DataRow
								label="Contacto"
								value={
									actor.dueno ? (
										<Stack direction="row" spacing={0.75} alignItems="center">
											<EmailOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
											{actor.dueno.email}
										</Stack>
									) : (
										'No informado'
									)
								}
							/>
						</Box>
					</Stack>
				</Section>

				<Section
					title={`Integrantes (${actor.integrantes.length})`}
					action={<GroupsOutlinedIcon color="action" />}
				>
					{actor.integrantes.length > 0 ? (
						<Stack divider={<Divider flexItem />}>
							{actor.integrantes.map((integrante) => (
								<Stack
									key={integrante.id}
									direction="row"
									spacing={1.5}
									alignItems="center"
									sx={{ py: 1.25 }}
								>
									<Avatar
										sx={{ width: 38, height: 38, bgcolor: 'action.hover', color: 'text.secondary' }}
									>
										<PersonOutlineIcon fontSize="small" />
									</Avatar>
									<Box sx={{ minWidth: 0, flex: 1 }}>
										<Stack
											direction="row"
											spacing={1}
											alignItems="center"
											flexWrap="wrap"
											useFlexGap
										>
											<Link
												component={RouterLink}
												to={`/usuarios/${integrante.id}`}
												variant="body2"
												fontWeight={600}
												underline="hover"
											>
												{integrante.nombre}
											</Link>
											{integrante.esDueno && (
												<Chip label="Dueño" size="small" variant="outlined" />
											)}
										</Stack>
										<Typography variant="caption" color="text.secondary">
											{integrante.rol}
										</Typography>
									</Box>
								</Stack>
							))}
						</Stack>
					) : (
						<Typography variant="body2" color="text.secondary">
							Sin integrantes registrados
						</Typography>
					)}
				</Section>
			</Stack>

			<Stack spacing={2}>
				<PortfolioSection actor={actor} />
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
	const { actorId = '' } = useParams();
	const [activeTab, setActiveTab] = React.useState(0);
	const [actor, setActor] = React.useState<ActorDetalleAdmin | null>(null);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);

	React.useEffect(() => {
		const id = Number(actorId);
		const controller = new AbortController();

		if (!Number.isInteger(id) || id <= 0) {
			setError('El identificador del actor no es válido.');
			setLoading(false);
			return () => controller.abort();
		}

		setLoading(true);
		setError(null);
		void obtenerActorAdmin(id, controller.signal)
			.then((result) => setActor(result.data))
			.catch((requestError: unknown) => {
				if (!controller.signal.aborted) {
					setError(requestError instanceof Error ? requestError.message : 'No se pudo cargar el actor.');
				}
			})
			.finally(() => {
				if (!controller.signal.aborted) setLoading(false);
			});

		return () => controller.abort();
	}, [actorId]);

	return (
		<Box sx={{ p: { xs: 2, sm: 3 } }}>
			<Stack spacing={2.5}>
				<Button
					startIcon={<ArrowBackIcon />}
					onClick={() => navigate('/actoresAdmin')}
					sx={{ alignSelf: 'flex-start' }}
				>
					Volver a actores
				</Button>

				{loading && (
					<Box sx={{ minHeight: 320, display: 'grid', placeItems: 'center' }}>
						<CircularProgress />
					</Box>
				)}
				{error && <Alert severity="error">{error}</Alert>}

				{!loading && !error && actor && (
					<>
						<Paper variant="outlined" sx={{ overflow: 'hidden' }}>
							<Box sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3 }, pb: 2.5 }}>
								<Stack
									direction={{ xs: 'column', sm: 'row' }}
									spacing={2.5}
									alignItems={{ sm: 'center' }}
								>
									<Avatar
										src={actor.foto ?? undefined}
										alt={`Foto de ${actor.nombre}`}
										sx={{ width: 88, height: 88, fontSize: 30 }}
									>
										{actor.nombre.slice(0, 2).toUpperCase()}
									</Avatar>
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
											<Chip label={actor.categoria.nombre} size="small" />
											{actor.subcategoria && (
												<Chip
													label={actor.subcategoria.nombre}
													size="small"
													variant="outlined"
												/>
											)}
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
					</>
				)}
			</Stack>
		</Box>
	);
}
