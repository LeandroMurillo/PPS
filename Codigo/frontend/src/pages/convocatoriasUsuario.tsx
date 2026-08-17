import * as React from 'react';
import { useNavigate } from 'react-router';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircularProgress from '@mui/material/CircularProgress';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import SearchIcon from '@mui/icons-material/Search';
import {
	Alert,
	Avatar,
	Box,
	Button,
	Card,
	CardActionArea,
	Checkbox,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControlLabel,
	Grid,
	InputAdornment,
	Paper,
	Stack,
	Tab,
	Tabs,
	TextField,
	Typography,
} from '@mui/material';
import { PageContainer } from '@toolpad/core/PageContainer';

import { listarMisActoresApi, type MisActorApiItem } from '../api/actores';
import {
	cancelarPostulacionApi,
	listarConvocatoriasActivasApi,
	postularActorApi,
	type Convocatoria,
} from '../api/convocatorias';
import { useAuth } from '../context/AuthContext';
import { notify } from '../utils/toast';

function formatDaysRemaining(fechaCierreStr: string) {
	const now = new Date();
	const cierre = new Date(fechaCierreStr);
	const diffMs = cierre.getTime() - now.getTime();
	const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

	if (diffDays <= 0) {
		return { label: 'Cierra hoy', color: 'error' as const };
	}
	if (diffDays === 1) {
		return { label: 'Queda 1 día', color: 'warning' as const };
	}
	if (diffDays <= 5) {
		return { label: `Quedan ${diffDays} días`, color: 'warning' as const };
	}
	return { label: `${diffDays} días restantes`, color: 'success' as const };
}

export default function ConvocatoriasUsuario() {
	const navigate = useNavigate();
	const { user } = useAuth();

	const [convocatorias, setConvocatorias] = React.useState<Convocatoria[]>([]);
	const [misActores, setMisActores] = React.useState<MisActorApiItem[]>([]);
	const [postulacionesMap, setPostulacionesMap] = React.useState<Record<number, number[]>>({});

	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);

	// Filtros de UI
	const [searchTerm, setSearchTerm] = React.useState('');
	const [activeTab, setActiveTab] = React.useState<'todas' | 'postuladas'>('todas');

	// Modal de postulación
	const [dialogOpen, setDialogOpen] = React.useState(false);
	const [selectedConvocatoria, setSelectedConvocatoria] = React.useState<Convocatoria | null>(null);
	const [togglingActorId, setTogglingActorId] = React.useState<number | null>(null);

	const loadData = React.useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const [convRes, actoresRes] = await Promise.all([
				listarConvocatoriasActivasApi(),
				user
					? listarMisActoresApi({ limit: 100 })
					: Promise.resolve({ data: [], pagination: { total: 0, limit: 100, offset: 0, hasNext: false } }),
			]);

			setConvocatorias(convRes.data ?? []);
			setMisActores(actoresRes.data ?? []);

			const map: Record<number, number[]> = {};
			for (const p of convRes.postulacionesUsuario ?? []) {
				if (!map[p.idConvocatoria]) {
					map[p.idConvocatoria] = [];
				}
				map[p.idConvocatoria].push(p.idActor);
			}
			setPostulacionesMap(map);
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'No se pudieron cargar las convocatorias.';
			setError(msg);
			notify.error(msg, { scope: 'convocatorias' });
		} finally {
			setLoading(false);
		}
	}, [user]);

	React.useEffect(() => {
		void loadData();
	}, [loadData]);

	const handleOpenDialog = (convocatoria: Convocatoria) => {
		setSelectedConvocatoria(convocatoria);
		setDialogOpen(true);
	};

	const handleCloseDialog = () => {
		setDialogOpen(false);
		setSelectedConvocatoria(null);
	};

	const handleToggleActor = async (convocatoriaId: number, actor: MisActorApiItem) => {
		const actuales = postulacionesMap[convocatoriaId] || [];
		const estaPostulado = actuales.includes(actor.id);

		setTogglingActorId(actor.id);
		try {
			if (estaPostulado) {
				await cancelarPostulacionApi(convocatoriaId, actor.id);
				setPostulacionesMap((prev) => ({
					...prev,
					[convocatoriaId]: (prev[convocatoriaId] || []).filter((id) => id !== actor.id),
				}));
				// Actualizar contador en la convocatoria local
				setConvocatorias((prev) =>
					prev.map((c) =>
						c.idConvocatoria === convocatoriaId
							? { ...c, totalPostulaciones: Math.max(0, c.totalPostulaciones - 1) }
							: c,
					),
				);
				notify.info(`Se retiró la postulación de "${actor.nombre}".`, { scope: 'convocatorias' });
			} else {
				await postularActorApi(convocatoriaId, actor.id);
				setPostulacionesMap((prev) => ({
					...prev,
					[convocatoriaId]: [...(prev[convocatoriaId] || []), actor.id],
				}));
				setConvocatorias((prev) =>
					prev.map((c) =>
						c.idConvocatoria === convocatoriaId
							? { ...c, totalPostulaciones: c.totalPostulaciones + 1 }
							: c,
					),
				);
				notify.success(`¡"${actor.nombre}" postulado exitosamente!`, { scope: 'convocatorias' });
			}
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Error al modificar la postulación.';
			notify.error(msg, { scope: 'convocatorias' });
		} finally {
			setTogglingActorId(null);
		}
	};

	// Filtrado de convocatorias
	const filteredConvocatorias = React.useMemo(() => {
		return convocatorias.filter((c) => {
			const matchesSearch =
				c.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
				c.descripcion.toLowerCase().includes(searchTerm.toLowerCase());

			if (!matchesSearch) return false;

			if (activeTab === 'postuladas') {
				const postulados = postulacionesMap[c.idConvocatoria] || [];
				return postulados.length > 0;
			}

			return true;
		});
	}, [convocatorias, searchTerm, activeTab, postulacionesMap]);

	return (
		<PageContainer title="Convocatorias culturales" maxWidth={false}>
			<Box
				sx={{
					width: '100%',
					mx: 'auto',
					minHeight: { xs: 'calc(100dvh - 56px)', sm: 'calc(100dvh - 64px)' },
					pb: { xs: 'calc(40px + env(safe-area-inset-bottom, 24px))', sm: 4 },
					boxSizing: 'border-box',
				}}
			>
				{/* Encabezado */}
				<Stack
					direction={{ xs: 'column', sm: 'row' }}
					justifyContent="space-between"
					alignItems={{ xs: 'flex-start', sm: 'center' }}
					spacing={2}
					sx={{ mb: 3 }}
				>
					<Box>
						<Typography variant="body1" color="text.secondary">
							Participá y postulá tus actores culturales a festivales, subsidios y proyectos oficiales.
						</Typography>
					</Box>
				</Stack>

				{/* Barra de Filtros y Búsqueda */}
				<Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
					<Grid container spacing={2} alignItems="center">
						<Grid size={{ xs: 12, md: 6 }}>
							<TextField
								fullWidth
								size="small"
								placeholder="Buscar convocatorias por título o palabras clave…"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								slotProps={{
									input: {
										startAdornment: (
											<InputAdornment position="start">
												<SearchIcon color="action" />
											</InputAdornment>
										),
									},
								}}
							/>
						</Grid>

						<Grid size={{ xs: 12, md: 6 }}>
							<Tabs
								value={activeTab}
								onChange={(_, val) => setActiveTab(val)}
								textColor="primary"
								indicatorColor="primary"
								sx={{ minHeight: 40 }}
							>
								<Tab label={`Todas las abiertas (${convocatorias.length})`} value="todas" />
								<Tab
									label={`Mis postulaciones (${
										Object.values(postulacionesMap).filter((ids) => ids.length > 0).length
									})`}
									value="postuladas"
								/>
							</Tabs>
						</Grid>
					</Grid>
				</Paper>

				{/* Estado de Carga / Error */}
				{loading ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
						<CircularProgress />
					</Box>
				) : error ? (
					<Alert severity="error" sx={{ mb: 3 }}>
						{error}
					</Alert>
				) : filteredConvocatorias.length === 0 ? (
					<Paper
						variant="outlined"
						sx={{
							p: 6,
							textAlign: 'center',
							borderRadius: 2,
							bgcolor: 'background.paper',
						}}
					>
						<AnnouncementIcon color="disabled" sx={{ fontSize: 64, mb: 1.5 }} />
						<Typography variant="h6" fontWeight={600} gutterBottom>
							{activeTab === 'postuladas'
								? 'Aún no postulaste ningún actor cultural'
								: 'No hay convocatorias activas para el criterio seleccionado'}
						</Typography>
						<Typography variant="body2" color="text.secondary" sx={{ maxWidth: 480, mx: 'auto', mb: 3 }}>
							{activeTab === 'postuladas'
								? 'Podés explorar la lista de convocatorias abiertas y postular tus perfiles culturales con un solo toque.'
								: 'Cuando se abran nuevos festivales, ferias o subsidios oficiales, aparecerán listados aquí.'}
						</Typography>
						{activeTab === 'postuladas' && (
							<Button variant="outlined" onClick={() => setActiveTab('todas')}>
								Ver todas las convocatorias
							</Button>
						)}
					</Paper>
				) : (
					/* Listado de Tarjetas */
					<Grid container spacing={3}>
						{filteredConvocatorias.map((convocatoria) => {
							const postuladosIds = postulacionesMap[convocatoria.idConvocatoria] || [];
							const cantidadPostulados = postuladosIds.length;
							const estaPostulado = cantidadPostulados > 0;
							const remaining = formatDaysRemaining(convocatoria.fechaCierre);

							return (
								<Grid key={convocatoria.idConvocatoria} size={{ xs: 12, md: 6 }}>
									<Card
										variant="outlined"
										sx={{
											height: '100%',
											display: 'flex',
											flexDirection: 'column',
											borderRadius: 2.5,
											borderWidth: estaPostulado ? 2 : 1,
											borderColor: estaPostulado ? 'primary.main' : 'divider',
											transition: 'transform 0.2s ease, box-shadow 0.2s ease',
											'&:hover': {
												transform: 'translateY(-2px)',
												boxShadow: (t) =>
													t.palette.mode === 'dark'
														? '0 6px 20px rgba(0,0,0,0.6)'
														: '0 6px 20px rgba(0,0,0,0.08)',
											},
										}}
									>
										<CardActionArea
											onClick={() => handleOpenDialog(convocatoria)}
											sx={{
												p: 2.5,
												height: '100%',
												display: 'flex',
												flexDirection: 'column',
												alignItems: 'stretch',
												justifyContent: 'space-between',
											}}
										>
											<Box>
												<Stack
													direction="row"
													justifyContent="space-between"
													alignItems="flex-start"
													spacing={1.5}
													sx={{ mb: 1.5 }}
												>
													<Typography variant="h6" fontWeight={700} component="h2">
														{convocatoria.titulo}
													</Typography>
													<Chip
														size="small"
														label={remaining.label}
														color={remaining.color}
														variant={remaining.color === 'error' ? 'filled' : 'outlined'}
														sx={{ fontWeight: 600, flexShrink: 0 }}
													/>
												</Stack>

												<Typography
													variant="body2"
													color="text.secondary"
													sx={{
														mb: 2.5,
														lineHeight: 1.6,
														display: '-webkit-box',
														WebkitLineClamp: 4,
														WebkitBoxOrient: 'vertical',
														overflow: 'hidden',
													}}
												>
													{convocatoria.descripcion}
												</Typography>
											</Box>

											<Box sx={{ pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
												<Stack
													direction="row"
													justifyContent="space-between"
													alignItems="center"
													spacing={1}
												>
													<Stack direction="row" spacing={1.5} alignItems="center">
														<Stack
															direction="row"
															spacing={0.5}
															alignItems="center"
															color="text.secondary"
														>
															<EventIcon fontSize="small" />
															<Typography variant="caption" fontWeight={500}>
																Cierre:{' '}
																{new Date(convocatoria.fechaCierre).toLocaleDateString(
																	'es-AR',
																	{
																		day: 'numeric',
																		month: 'short',
																		year: 'numeric',
																	},
																)}
															</Typography>
														</Stack>

														<Stack
															direction="row"
															spacing={0.5}
															alignItems="center"
															color="text.secondary"
														>
															<GroupIcon fontSize="small" />
															<Typography variant="caption">
																{convocatoria.totalPostulaciones} inscripto
																{convocatoria.totalPostulaciones !== 1 ? 's' : ''}
															</Typography>
														</Stack>
													</Stack>

													{estaPostulado ? (
														<Chip
															icon={<CheckCircleIcon />}
															label={`Postulado (${cantidadPostulados})`}
															color="primary"
															size="small"
															sx={{ fontWeight: 700 }}
														/>
													) : (
														<Chip
															icon={<RadioButtonUncheckedIcon />}
															label="Postularse"
															variant="outlined"
															size="small"
														/>
													)}
												</Stack>
											</Box>
										</CardActionArea>
									</Card>
								</Grid>
							);
						})}
					</Grid>
				)}

				{/* Modal de Selección y Postulación de Actores */}
				<Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
					<DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
						<Stack direction="row" spacing={1} alignItems="center">
							<HowToRegIcon color="primary" />
							<span>Gestionar Postulación</span>
						</Stack>
					</DialogTitle>

					<DialogContent dividers>
						{selectedConvocatoria && (
							<Box sx={{ mb: 3 }}>
								<Typography variant="subtitle1" fontWeight={700} color="primary" gutterBottom>
									{selectedConvocatoria.titulo}
								</Typography>
								<Typography variant="body2" color="text.secondary" paragraph>
									{selectedConvocatoria.descripcion}
								</Typography>
								<Alert severity="info" variant="outlined" sx={{ py: 0.5 }}>
									Fecha límite de recepción:{' '}
									<strong>
										{new Date(selectedConvocatoria.fechaCierre).toLocaleDateString('es-AR', {
											weekday: 'long',
											day: 'numeric',
											month: 'long',
											year: 'numeric',
										})}
									</strong>
								</Alert>
							</Box>
						)}

						<Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
							Seleccioná cuáles de tus perfiles culturales querés inscribir:
						</Typography>

						{misActores.length === 0 ? (
							<Paper variant="outlined" sx={{ p: 3, textAlign: 'center', bgcolor: 'action.hover' }}>
								<Typography variant="body2" color="text.secondary" paragraph>
									No tenés ningún actor cultural registrado aún en tu cuenta.
								</Typography>
								<Button
									variant="contained"
									startIcon={<AddCircleOutlineIcon />}
									onClick={() => {
										handleCloseDialog();
										navigate('/actores/nuevo');
									}}
								>
									Registrar mi primer actor cultural
								</Button>
							</Paper>
						) : (
							<Stack spacing={1.5}>
								{misActores.map((actor) => {
									const convId = selectedConvocatoria?.idConvocatoria ?? 0;
									const isChecked = (postulacionesMap[convId] || []).includes(actor.id);
									const isPending = togglingActorId === actor.id;

									return (
										<Paper
											key={actor.id}
											variant="outlined"
											sx={{
												p: 1.5,
												borderRadius: 2,
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'space-between',
												borderColor: isChecked ? 'primary.main' : 'divider',
												bgcolor: isChecked ? 'action.selected' : 'background.paper',
											}}
										>
											<FormControlLabel
												sx={{ width: '100%', mr: 0 }}
												control={
													<Checkbox
														checked={isChecked}
														disabled={isPending}
														onChange={() => void handleToggleActor(convId, actor)}
														color="primary"
													/>
												}
												label={
													<Stack
														direction="row"
														spacing={2}
														alignItems="center"
														sx={{ width: '100%' }}
													>
														<Avatar
															src={actor.foto ?? undefined}
															alt={actor.nombre}
															sx={{ width: 40, height: 40 }}
														>
															{actor.nombre.charAt(0)}
														</Avatar>
														<Box>
															<Typography variant="body1" fontWeight={600}>
																{actor.nombre}
															</Typography>
															<Typography variant="caption" color="text.secondary">
																{actor.categoria}
																{actor.subcategoria ? ` • ${actor.subcategoria}` : ''}
															</Typography>
														</Box>
													</Stack>
												}
											/>

											{isPending && <CircularProgress size={20} sx={{ ml: 1, flexShrink: 0 }} />}
										</Paper>
									);
								})}
							</Stack>
						)}
					</DialogContent>

					<DialogActions sx={{ p: 2 }}>
						<Button onClick={handleCloseDialog} variant="contained" disableElevation>
							Listo
						</Button>
					</DialogActions>
				</Dialog>
			</Box>
		</PageContainer>
	);
}
