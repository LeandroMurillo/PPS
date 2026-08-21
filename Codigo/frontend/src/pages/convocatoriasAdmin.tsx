import * as React from 'react';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SearchIcon from '@mui/icons-material/Search';
import {
	Alert,
	Avatar,
	Box,
	Button,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	Grid,
	IconButton,
	InputAdornment,
	InputLabel,
	MenuItem,
	Paper,
	Select,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material';
import { PageContainer } from '@toolpad/core/PageContainer';

import dayjs from 'dayjs';

import {
	crearConvocatoriaAdminApi,
	editarConvocatoriaAdminApi,
	eliminarConvocatoriaAdminApi,
	listarConvocatoriasAdminApi,
	obtenerConvocatoriaDetalleApi,
	type Convocatoria,
	type PostulanteDetalle,
} from '../api/convocatorias';
import DatePickerSpanish from '../components/datePickerSpanish';
import MarkdownEditor from '../components/markdownEditor';
import { markdownToPlainText } from '../utils/markdown';
import { notify } from '../utils/toast';

export default function ConvocatoriasAdminPage() {
	const [convocatorias, setConvocatorias] = React.useState<Convocatoria[]>([]);
	const [total, setTotal] = React.useState(0);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);

	// Filtros y Paginación
	const [searchTerm, setSearchTerm] = React.useState('');
	const [debouncedSearch, setDebouncedSearch] = React.useState('');
	const [statusFilter, setStatusFilter] = React.useState<'TODAS' | 'ABIERTA' | 'CERRADA'>('TODAS');
	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(10);

	// Debounce de búsqueda
	React.useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchTerm);
			setPage(0);
		}, 400);
		return () => clearTimeout(timer);
	}, [searchTerm]);

	// Modal Crear/Editar
	const [formModalOpen, setFormModalOpen] = React.useState(false);
	const [editingConvocatoria, setEditingConvocatoria] = React.useState<Convocatoria | null>(null);
	const [formTitulo, setFormTitulo] = React.useState('');
	const [formDescripcion, setFormDescripcion] = React.useState('');
	const [formFechaCierre, setFormFechaCierre] = React.useState('');
	const [formSubmitting, setFormSubmitting] = React.useState(false);
	const [formError, setFormError] = React.useState<string | null>(null);

	// Modal Eliminar
	const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
	const [convocatoriaToDelete, setConvocatoriaToDelete] = React.useState<Convocatoria | null>(null);
	const [deleting, setDeleting] = React.useState(false);

	// Modal Ver Postulantes
	const [postulantesModalOpen, setPostulantesModalOpen] = React.useState(false);
	const [selectedConvocatoriaForPostulantes, setSelectedConvocatoriaForPostulantes] =
		React.useState<Convocatoria | null>(null);
	const [postulantesList, setPostulantesList] = React.useState<PostulanteDetalle[]>([]);
	const [loadingPostulantes, setLoadingPostulantes] = React.useState(false);

	// Cargar Convocatorias
	const loadConvocatorias = React.useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await listarConvocatoriasAdminApi({
				busqueda: debouncedSearch.trim() || undefined,
				estado: statusFilter,
				limit: rowsPerPage,
				offset: page * rowsPerPage,
			});
			setConvocatorias(res.data);
			setTotal(res.total);
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'No se pudieron cargar las convocatorias.';
			setError(msg);
			notify.error(msg, { scope: 'admin-convocatorias' });
		} finally {
			setLoading(false);
		}
	}, [debouncedSearch, statusFilter, page, rowsPerPage]);

	React.useEffect(() => {
		void loadConvocatorias();
	}, [loadConvocatorias]);

	// Abrir Modal de Creación
	const handleOpenCreate = () => {
		setEditingConvocatoria(null);
		setFormTitulo('');
		setFormDescripcion('');
		// Default: fecha de cierre dentro de 30 días
		const defaultDate = dayjs().add(30, 'day').format('YYYY-MM-DD');
		setFormFechaCierre(defaultDate);
		setFormError(null);
		setFormModalOpen(true);
	};

	// Abrir Modal de Edición
	const handleOpenEdit = (c: Convocatoria) => {
		setEditingConvocatoria(c);
		setFormTitulo(c.titulo);
		setFormDescripcion(c.descripcion);
		setFormFechaCierre(dayjs(c.fechaCierre).format('YYYY-MM-DD'));
		setFormError(null);
		setFormModalOpen(true);
	};

	// Guardar Creación / Edición
	const handleSaveForm = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmedTitulo = formTitulo.trim();
		const trimmedDescripcion = formDescripcion.trim();

		if (!trimmedTitulo) {
			setFormError('El título es obligatorio.');
			notify.error('El título es obligatorio.', { scope: 'admin-convocatorias' });
			return;
		}

		if (!trimmedDescripcion) {
			setFormError('La descripción es obligatoria.');
			notify.error('La descripción es obligatoria.', { scope: 'admin-convocatorias' });
			return;
		}

		if (!formFechaCierre) {
			setFormError('La fecha de cierre es obligatoria.');
			notify.error('La fecha de cierre es obligatoria.', { scope: 'admin-convocatorias' });
			return;
		}

		const isoDate = dayjs(formFechaCierre).endOf('day').toISOString();

		setFormSubmitting(true);
		setFormError(null);
		try {
			if (editingConvocatoria) {
				const res = await editarConvocatoriaAdminApi(editingConvocatoria.idConvocatoria, {
					titulo: trimmedTitulo,
					descripcion: trimmedDescripcion,
					fechaCierre: isoDate,
				});
				notify.success(res.mensaje || 'Convocatoria actualizada.', { scope: 'admin-convocatorias' });
			} else {
				const res = await crearConvocatoriaAdminApi({
					titulo: trimmedTitulo,
					descripcion: trimmedDescripcion,
					fechaCierre: isoDate,
				});
				notify.success(res.mensaje || 'Convocatoria creada.', { scope: 'admin-convocatorias' });
			}
			setFormModalOpen(false);
			void loadConvocatorias();
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Error al guardar la convocatoria.';
			setFormError(msg);
			notify.error(msg, { scope: 'admin-convocatorias' });
		} finally {
			setFormSubmitting(false);
		}
	};

	// Abrir Modal de Confirmación de Baja
	const handleOpenDelete = (c: Convocatoria) => {
		setConvocatoriaToDelete(c);
		setDeleteModalOpen(true);
	};

	// Confirmar Baja
	const handleConfirmDelete = async () => {
		if (!convocatoriaToDelete) return;
		setDeleting(true);
		try {
			const res = await eliminarConvocatoriaAdminApi(convocatoriaToDelete.idConvocatoria);
			notify.info(res.mensaje || 'Convocatoria dada de baja.', { scope: 'admin-convocatorias' });
			setDeleteModalOpen(false);
			setConvocatoriaToDelete(null);
			void loadConvocatorias();
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'No se pudo dar de baja la convocatoria.';
			notify.error(msg, { scope: 'admin-convocatorias' });
		} finally {
			setDeleting(false);
		}
	};

	// Ver Postulantes
	const handleOpenPostulantes = async (c: Convocatoria) => {
		setSelectedConvocatoriaForPostulantes(c);
		setPostulantesModalOpen(true);
		setLoadingPostulantes(true);
		try {
			const res = await obtenerConvocatoriaDetalleApi(c.idConvocatoria);
			setPostulantesList(res.postulantes);
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Error al cargar los postulantes.';
			notify.error(msg, { scope: 'admin-convocatorias' });
		} finally {
			setLoadingPostulantes(false);
		}
	};

	return (
		<PageContainer title="Administrar convocatorias" maxWidth={false}>
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
							Creá y administrá las convocatorias oficiales del Mosaico Cultural y revisá las
							postulaciones recibidas.
						</Typography>
					</Box>

					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={handleOpenCreate}
						size="large"
						sx={{ flexShrink: 0 }}
					>
						Nueva Convocatoria
					</Button>
				</Stack>

				{/* Barra de Filtros */}
				<Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
					<Grid container spacing={2} alignItems="center">
						<Grid size={{ xs: 12, sm: 8, md: 9 }}>
							<TextField
								fullWidth
								size="small"
								placeholder="Buscar por título o palabras de la descripción…"
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

						<Grid size={{ xs: 12, sm: 4, md: 3 }}>
							<FormControl fullWidth size="small">
								<InputLabel id="estado-select-label">Estado</InputLabel>
								<Select
									labelId="estado-select-label"
									label="Estado"
									value={statusFilter}
									onChange={(e) => {
										setStatusFilter(e.target.value as 'TODAS' | 'ABIERTA' | 'CERRADA');
										setPage(0);
									}}
								>
									<MenuItem value="TODAS">Todas las convocatorias</MenuItem>
									<MenuItem value="ABIERTA">Solo abiertas</MenuItem>
									<MenuItem value="CERRADA">Solo cerradas</MenuItem>
								</Select>
							</FormControl>
						</Grid>
					</Grid>
				</Paper>

				{/* Tabla de Convocatorias */}
				<Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
					{error && (
						<Alert severity="error" sx={{ m: 2 }}>
							{error}
						</Alert>
					)}

					<TableContainer sx={{ maxHeight: 600 }}>
						<Table stickyHeader>
							<TableHead>
								<TableRow>
									<TableCell sx={{ fontWeight: 700 }}>Título y Descripción</TableCell>
									<TableCell sx={{ fontWeight: 700, width: 140 }}>Estado</TableCell>
									<TableCell sx={{ fontWeight: 700, width: 160 }}>Fecha de Cierre</TableCell>
									<TableCell sx={{ fontWeight: 700, width: 130, textAlign: 'center' }}>
										Postulantes
									</TableCell>
									<TableCell sx={{ fontWeight: 700, width: 160, textAlign: 'right' }}>
										Acciones
									</TableCell>
								</TableRow>
							</TableHead>

							<TableBody>
								{loading ? (
									<TableRow>
										<TableCell colSpan={5} align="center" sx={{ py: 6 }}>
											<CircularProgress />
										</TableCell>
									</TableRow>
								) : convocatorias.length === 0 ? (
									<TableRow>
										<TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
											No se encontraron convocatorias para los filtros aplicados.
										</TableCell>
									</TableRow>
								) : (
									convocatorias.map((c) => {
										const isAbierta = new Date(c.fechaCierre) >= new Date();

										return (
											<TableRow key={c.idConvocatoria} hover>
												<TableCell>
													<Typography variant="body1" fontWeight={600}>
														{c.titulo}
													</Typography>
													<Typography
														variant="body2"
														color="text.secondary"
														sx={{
															display: '-webkit-box',
															WebkitLineClamp: 2,
															WebkitBoxOrient: 'vertical',
															overflow: 'hidden',
															maxWidth: 550,
														}}
													>
												{markdownToPlainText(c.descripcion)}
													</Typography>
												</TableCell>

												<TableCell>
													<Chip
														label={isAbierta ? 'Abierta' : 'Cerrada'}
														color={isAbierta ? 'success' : 'default'}
														size="small"
														sx={{ fontWeight: 600 }}
													/>
												</TableCell>

												<TableCell>
													<Stack direction="row" spacing={0.5} alignItems="center">
														<EventIcon fontSize="small" color="action" />
														<Typography variant="body2">
															{new Date(c.fechaCierre).toLocaleDateString('es-AR', {
																day: '2-digit',
																month: '2-digit',
																year: 'numeric',
															})}
														</Typography>
													</Stack>
												</TableCell>

												<TableCell align="center">
													<Tooltip title="Ver lista de postulantes">
														<Button
															variant="text"
															size="small"
															startIcon={<GroupIcon />}
															onClick={() => void handleOpenPostulantes(c)}
															sx={{ fontWeight: 700 }}
														>
															{c.totalPostulaciones}
														</Button>
													</Tooltip>
												</TableCell>

												<TableCell align="right">
													<Stack direction="row" spacing={0.5} justifyContent="flex-end">
														<Tooltip title="Editar">
															<IconButton
																size="small"
																color="default"
																onClick={() => handleOpenEdit(c)}
															>
																<EditIcon fontSize="small" />
															</IconButton>
														</Tooltip>

														<Tooltip title="Eliminar">
															<IconButton
																size="small"
																color="error"
																onClick={() => handleOpenDelete(c)}
															>
																<DeleteIcon fontSize="small" />
															</IconButton>
														</Tooltip>
													</Stack>
												</TableCell>
											</TableRow>
										);
									})
								)}
							</TableBody>
						</Table>
					</TableContainer>

					<TablePagination
						component="div"
						count={total}
						page={page}
						rowsPerPage={rowsPerPage}
						rowsPerPageOptions={[5, 10, 25, 50]}
						onPageChange={(_, newPage) => setPage(newPage)}
						onRowsPerPageChange={(e) => {
							setRowsPerPage(parseInt(e.target.value, 10));
							setPage(0);
						}}
						labelRowsPerPage="Filas por página:"
						labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
					/>
				</Paper>

				{/* Modal de Creación / Edición */}
				<Dialog
					open={formModalOpen}
					onClose={() => !formSubmitting && setFormModalOpen(false)}
					maxWidth="sm"
					fullWidth
				>
					<form onSubmit={handleSaveForm}>
						<DialogTitle sx={{ fontWeight: 700 }}>
							{editingConvocatoria ? 'Modificar Convocatoria' : 'Nueva Convocatoria'}
						</DialogTitle>

						<DialogContent dividers>
							<Stack spacing={3} sx={{ pt: 1 }}>
								{formError && <Alert severity="error">{formError}</Alert>}

								<TextField
									label="Título de la convocatoria"
									required
									fullWidth
									value={formTitulo}
									onChange={(e) => setFormTitulo(e.target.value)}
									placeholder="Ej: Festival Nacional de Folclore 2026"
									slotProps={{ htmlInput: { maxLength: 145 } }}
									helperText={`${formTitulo.length} / 145 caracteres`}
								/>

								<MarkdownEditor
									label="Descripción y bases"
									required
									minRows={6}
									value={formDescripcion}
									onChange={setFormDescripcion}
									placeholder="Detallá los requisitos, perfil de artistas convocados y condiciones del evento…"
									maxLength={5000}
									helperText={`${formDescripcion.length} / 5000 caracteres`}
								/>

								<DatePickerSpanish
									label="Fecha de cierre de inscripciones"
									required
									value={formFechaCierre}
									onChange={(newDate) => setFormFechaCierre(newDate)}
									minDate={dayjs().startOf('day')}
									helperText="A partir de esta fecha no se recibirán más postulaciones."
								/>
							</Stack>
						</DialogContent>

						<DialogActions sx={{ p: 2 }}>
							<Button onClick={() => setFormModalOpen(false)} disabled={formSubmitting}>
								Cancelar
							</Button>
							<Button type="submit" variant="contained" disabled={formSubmitting}>
								{formSubmitting ? 'Guardando…' : editingConvocatoria ? 'Guardar Cambios' : 'Publicar'}
							</Button>
						</DialogActions>
					</form>
				</Dialog>

				{/* Modal Confirmar Eliminación */}
				<Dialog open={deleteModalOpen} onClose={() => !deleting && setDeleteModalOpen(false)} maxWidth="xs">
					<DialogTitle sx={{ fontWeight: 700 }}>¿Dar de baja la convocatoria?</DialogTitle>
					<DialogContent>
						<Typography variant="body2" color="text.secondary">
							Esta acción dará de baja la convocatoria <strong>{convocatoriaToDelete?.titulo}</strong> y
							cancelará las postulaciones asociadas.
						</Typography>
					</DialogContent>
					<DialogActions sx={{ p: 2 }}>
						<Button onClick={() => setDeleteModalOpen(false)} disabled={deleting}>
							Cancelar
						</Button>
						<Button
							onClick={() => void handleConfirmDelete()}
							color="error"
							variant="contained"
							disabled={deleting}
						>
							{deleting ? 'Dando de baja…' : 'Dar de baja'}
						</Button>
					</DialogActions>
				</Dialog>

				{/* Modal de Lista de Postulantes */}
				<Dialog
					open={postulantesModalOpen}
					onClose={() => setPostulantesModalOpen(false)}
					maxWidth="md"
					fullWidth
				>
					<DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
						<Stack direction="row" spacing={1} alignItems="center">
							<PeopleAltIcon color="primary" />
							<span>Postulantes inscriptos: {selectedConvocatoriaForPostulantes?.titulo}</span>
						</Stack>
					</DialogTitle>

					<DialogContent dividers>
						{loadingPostulantes ? (
							<Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
								<CircularProgress />
							</Box>
						) : postulantesList.length === 0 ? (
							<Box sx={{ textAlign: 'center', py: 5, color: 'text.secondary' }}>
								<GroupIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
								<Typography variant="body1">
									Aún no se han registrado postulaciones para esta convocatoria.
								</Typography>
							</Box>
						) : (
							<Stack spacing={2}>
								<Typography variant="body2" color="text.secondary">
									Total: <strong>{postulantesList.length}</strong> actor
									{postulantesList.length !== 1 ? 'es' : ''} inscripto
									{postulantesList.length !== 1 ? 's' : ''}
								</Typography>

								<TableContainer component={Paper} variant="outlined">
									<Table size="small">
										<TableHead>
											<TableRow>
												<TableCell sx={{ fontWeight: 700 }}>Actor Cultural</TableCell>
												<TableCell sx={{ fontWeight: 700 }}>Categoría</TableCell>
												<TableCell sx={{ fontWeight: 700 }}>Ubicación</TableCell>
												<TableCell sx={{ fontWeight: 700 }}>Responsable</TableCell>
												<TableCell sx={{ fontWeight: 700 }}>Fecha Inscripción</TableCell>
												<TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>
													Ficha
												</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{postulantesList.map((p) => (
												<TableRow key={p.idActor} hover>
													<TableCell>
														<Stack direction="row" spacing={1.5} alignItems="center">
															<Avatar
																src={p.fotoPerfilUrl ?? undefined}
																alt={p.nombreActor}
																sx={{ width: 32, height: 32 }}
															>
																{p.nombreActor.charAt(0)}
															</Avatar>
															<Typography variant="body2" fontWeight={600}>
																{p.nombreActor}
															</Typography>
														</Stack>
													</TableCell>

													<TableCell>
														<Typography variant="body2">{p.categoria}</Typography>
														{p.subcategoria && (
															<Typography
																variant="caption"
																color="text.secondary"
																display="block"
															>
																{p.subcategoria}
															</Typography>
														)}
													</TableCell>

													<TableCell>
														<Typography variant="body2">
															{[p.localidad, p.departamento].filter(Boolean).join(', ') ||
																'No especificada'}
														</Typography>
													</TableCell>

													<TableCell>
														<Typography variant="body2">
															{[p.responsableNombre, p.responsableApellido]
																.filter(Boolean)
																.join(' ') || '—'}
														</Typography>
														{p.responsableEmail && (
															<Typography
																variant="caption"
																color="text.secondary"
																display="block"
															>
																{p.responsableEmail}
															</Typography>
														)}
													</TableCell>

													<TableCell>
														<Typography variant="caption">
															{new Date(p.fechaPostulacion).toLocaleDateString('es-AR', {
																day: '2-digit',
																month: '2-digit',
																year: 'numeric',
															})}
														</Typography>
													</TableCell>

													<TableCell align="right">
														<Tooltip title="Ver ficha en el mapa cultural">
															<IconButton
																size="small"
																color="primary"
																onClick={() =>
																	window.open(`/actores?actor=${p.idActor}`, '_blank')
																}
															>
																<OpenInNewIcon fontSize="small" />
															</IconButton>
														</Tooltip>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</TableContainer>
							</Stack>
						)}
					</DialogContent>

					<DialogActions sx={{ p: 2 }}>
						<Button onClick={() => setPostulantesModalOpen(false)}>Cerrar</Button>
					</DialogActions>
				</Dialog>
			</Box>
		</PageContainer>
	);
}
