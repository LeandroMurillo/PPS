import * as React from 'react';

import AddIcon from '@mui/icons-material/Add';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { PageContainer } from '@toolpad/core/PageContainer';

import {
	crearActividadArcaAdmin,
	editarActividadArcaAdmin,
	eliminarActividadArcaAdmin,
	importarActividadesArcaAdmin,
	listarActividadesArcaAdmin,
	type ActividadArcaAdmin,
	type ActividadArcaAdminSortBy,
	type ImportarActividadesArcaResultado,
	type SortDirection,
} from '../api/admin';
import AdminFilters from '../components/adminFilters';
import AdminTable, { type AdminColumn } from '../components/adminTable';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { notify } from '../utils/toast';

const pageSize = 25;

const EJEMPLO_TXT_F883 = `COD_ACTIVIDAD_F883;DESC_ACTIVIDAD_F883;DESCL_ACTIVIDA_F883;
011111;Cultivo de arroz;Cultivo de arroz;
011119;Cultivo de cereales n.c.p., excepto los de uso forrajero;Cultivo de cereales n.c.p., excepto los de uso forrajero (Incluye alforfón, cebada cervecera, etc.);
900011;Producción de espectáculos teatrales y musicales;Producción de espectáculos teatrales y musicales;
900012;Composición y representación de obras teatrales, musicales y artísticas;Composición y representación de obras teatrales, musicales y artísticas;`;

export default function AdminActividadesArcaPage() {
	const [search, setSearch] = React.useState('');
	const [page, setPage] = React.useState(0);
	const [sortBy, setSortBy] = React.useState<ActividadArcaAdminSortBy>('codigo');
	const [sortDir, setSortDir] = React.useState<SortDirection>('ASC');

	const [actividades, setActividades] = React.useState<ActividadArcaAdmin[]>([]);
	const [total, setTotal] = React.useState(0);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);

	// Modal Crear / Editar
	const [dialogOpen, setDialogOpen] = React.useState(false);
	const [editingActividad, setEditingActividad] = React.useState<ActividadArcaAdmin | null>(null);
	const [formCodigo, setFormCodigo] = React.useState('');
	const [formDescripcion, setFormDescripcion] = React.useState('');
	const [formSubmitting, setFormSubmitting] = React.useState(false);

	// Modal Eliminar
	const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
	const [deletingActividad, setDeletingActividad] = React.useState<ActividadArcaAdmin | null>(null);
	const [deleteSubmitting, setDeleteSubmitting] = React.useState(false);

	// Modal Importación TXT
	const [importDialogOpen, setImportDialogOpen] = React.useState(false);
	const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
	const [fileRawContent, setFileRawContent] = React.useState<string>('');
	const [previewRows, setPreviewRows] = React.useState<{ codigo: string; descripcion: string }[]>([]);
	const [previewTotalLines, setPreviewTotalLines] = React.useState(0);
	const [previewErrorsCount, setPreviewErrorsCount] = React.useState(0);
	const [importSubmitting, setImportSubmitting] = React.useState(false);
	const [importResult, setImportResult] = React.useState<ImportarActividadesArcaResultado | null>(null);
	const [importError, setImportError] = React.useState<string | null>(null);
	const [isDragOver, setIsDragOver] = React.useState(false);

	const fileInputRef = React.useRef<HTMLInputElement | null>(null);
	const debouncedSearch = useDebouncedValue(search, 300);

	const fetchActividades = React.useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const res = await listarActividadesArcaAdmin({
				busqueda: debouncedSearch.trim() || undefined,
				limit: pageSize,
				offset: page * pageSize,
				sortBy,
				sortDir,
			});

			setActividades(res.data);
			setTotal(res.pagination.total);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Error al cargar las actividades ARCA');
		} finally {
			setLoading(false);
		}
	}, [debouncedSearch, page, sortBy, sortDir]);

	React.useEffect(() => {
		void fetchActividades();
	}, [fetchActividades]);

	const handleOpenCreate = () => {
		setEditingActividad(null);
		setFormCodigo('');
		setFormDescripcion('');
		setDialogOpen(true);
	};

	const handleOpenEdit = (act: ActividadArcaAdmin) => {
		setEditingActividad(act);
		setFormCodigo(act.codigo);
		setFormDescripcion(act.descripcion);
		setDialogOpen(true);
	};

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();

		const cleanCodigo = formCodigo.trim();
		const cleanDescripcion = formDescripcion.trim();

		if (!editingActividad && !/^\d{6}$/.test(cleanCodigo)) {
			notify.error('El código ARCA debe contener exactamente 6 dígitos numéricos.', {
				scope: 'admin-actividades-arca',
			});
			return;
		}

		if (!cleanDescripcion) {
			notify.error('La descripción de la actividad es obligatoria.', {
				scope: 'admin-actividades-arca',
			});
			return;
		}

		setFormSubmitting(true);

		try {
			if (editingActividad) {
				await editarActividadArcaAdmin(editingActividad.codigo, {
					descripcion: cleanDescripcion,
				});
				notify.success(`Actividad "${editingActividad.codigo}" modificada correctamente.`, {
					scope: 'admin-actividades-arca',
				});
			} else {
				await crearActividadArcaAdmin({
					codigo: cleanCodigo,
					descripcion: cleanDescripcion,
				});
				notify.success(`Actividad "${cleanCodigo}" creada correctamente.`, {
					scope: 'admin-actividades-arca',
				});
			}

			setDialogOpen(false);
			void fetchActividades();
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'Ocurrió un error al guardar la actividad.';
			notify.error(errMsg, { scope: 'admin-actividades-arca' });
		} finally {
			setFormSubmitting(false);
		}
	};

	const handleOpenDelete = (act: ActividadArcaAdmin) => {
		setDeletingActividad(act);
		setDeleteDialogOpen(true);
	};

	const handleDelete = async () => {
		if (!deletingActividad) return;

		setDeleteSubmitting(true);

		try {
			await eliminarActividadArcaAdmin(deletingActividad.codigo);
			notify.info(`Actividad "${deletingActividad.codigo}" eliminada.`, {
				scope: 'admin-actividades-arca',
			});
			setDeleteDialogOpen(false);
			setDeletingActividad(null);
			void fetchActividades();
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'No se pudo eliminar la actividad';
			notify.error(errMsg, { scope: 'admin-actividades-arca' });
		} finally {
			setDeleteSubmitting(false);
		}
	};

	// Manejo de archivo TXT
	const handleFileSelect = (file: File | null) => {
		if (!file) return;

		setSelectedFile(file);
		setImportResult(null);
		setImportError(null);

		const reader = new FileReader();
		reader.onload = (evt) => {
			const content = (evt.target?.result as string) || '';
			setFileRawContent(content);

			// Previsualización ligera
			const clean = content.replace(/^\uFEFF/, '');
			const lines = clean.split(/\r?\n/).filter((l) => l.trim().length > 0);

			let startIndex = 0;
			if (lines.length > 0 && /^COD_|^"COD_|^CODIGO|COD_ACTIVIDAD/i.test(lines[0]!.trim())) {
				startIndex = 1;
			}

			const parsedPreview: { codigo: string; descripcion: string }[] = [];
			let invalidCount = 0;

			for (let i = startIndex; i < lines.length; i++) {
				const line = lines[i]!.trim();
				const parts = line.split(';').map((p) => p.trim().replace(/^["']|["']$/g, ''));
				const cod = parts[0] ?? '';
				const desc = (parts[1] || parts[2] || '').trim().slice(0, 255);

				if (/^\d{6}$/.test(cod) && desc) {
					if (parsedPreview.length < 5) {
						parsedPreview.push({ codigo: cod, descripcion: desc });
					}
				} else {
					invalidCount++;
				}
			}

			setPreviewTotalLines(lines.length - startIndex);
			setPreviewErrorsCount(invalidCount);
			setPreviewRows(parsedPreview);
		};

		reader.readAsText(file, 'UTF-8');
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragOver(false);

		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			const file = e.dataTransfer.files[0];
			if (file) {
				handleFileSelect(file);
			}
		}
	};

	const handleExecuteImport = async () => {
		if (!fileRawContent) return;

		setImportSubmitting(true);
		setImportError(null);

		try {
			const res = await importarActividadesArcaAdmin(fileRawContent);
			setImportResult(res.data);
			notify.success(
				`Importación finalizada: ${res.data.creados} creadas, ${res.data.actualizados} actualizadas.`,
				{
					scope: 'admin-actividades-arca',
				},
			);
			void fetchActividades();
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'Error al procesar la importación.';
			setImportError(errMsg);
			notify.error(errMsg, { scope: 'admin-actividades-arca' });
		} finally {
			setImportSubmitting(false);
		}
	};

	const handleDownloadTemplate = () => {
		const blob = new Blob([EJEMPLO_TXT_F883], { type: 'text/plain;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'plantilla_actividades_arca_f883.txt';
		link.click();
		URL.revokeObjectURL(url);
	};

	const handleCloseImportDialog = () => {
		setImportDialogOpen(false);
		setSelectedFile(null);
		setFileRawContent('');
		setPreviewRows([]);
		setImportResult(null);
		setImportError(null);
	};

	const columns: AdminColumn<ActividadArcaAdmin, ActividadArcaAdminSortBy>[] = [
		{
			id: 'codigo',
			label: 'Código ARCA',
			sortBy: 'codigo',
			minWidth: 140,
			render: (row) => (
				<Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'primary.main' }}>
					{row.codigo}
				</Typography>
			),
		},
		{
			id: 'descripcion',
			label: 'Descripción de la actividad',
			sortBy: 'descripcion',
			minWidth: 320,
			render: (row) => (
				<Typography variant="body2" sx={{ fontWeight: 500 }}>
					{row.descripcion}
				</Typography>
			),
		},
		{
			id: 'cantidadUsuarios',
			label: 'Usuarios asignados',
			sortBy: 'cantidadUsuarios',
			align: 'right',
			minWidth: 160,
			render: (row) => (
				<Chip
					label={`${row.cantidadUsuarios} ${row.cantidadUsuarios === 1 ? 'usuario' : 'usuarios'}`}
					size="small"
					color={row.cantidadUsuarios > 0 ? 'primary' : 'default'}
					variant={row.cantidadUsuarios > 0 ? 'filled' : 'outlined'}
				/>
			),
		},
		{
			id: 'acciones',
			label: 'Acciones',
			align: 'center',
			minWidth: 120,
			render: (row) => (
				<Stack direction="row" spacing={1} justifyContent="center" onClick={(e) => e.stopPropagation()}>
					<Tooltip title="Modificar descripción">
						<IconButton size="small" onClick={() => handleOpenEdit(row)}>
							<EditIcon fontSize="small" />
						</IconButton>
					</Tooltip>
					<Tooltip
						title={
							row.cantidadUsuarios > 0
								? 'No se puede eliminar: tiene usuarios asociados'
								: 'Eliminar actividad'
						}
					>
						<span>
							<IconButton
								size="small"
								color="error"
								disabled={row.cantidadUsuarios > 0}
								onClick={() => handleOpenDelete(row)}
							>
								<DeleteIcon fontSize="small" />
							</IconButton>
						</span>
					</Tooltip>
				</Stack>
			),
		},
	];

	return (
		<PageContainer title="" maxWidth={false}>
			<Stack spacing={2.5}>
				<Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} flexWrap="wrap">
					<Stack direction="row" alignItems="center" spacing={1.5}>
						<Typography variant="h6" fontWeight={600}>
							Administrar actividades ARCA
						</Typography>
						<Chip label={`${total}`} size="small" color="primary" variant="outlined" />
					</Stack>

					<Stack direction="row" spacing={1.5} flexWrap="wrap">
						<Button
							variant="outlined"
							color="secondary"
							startIcon={<FileUploadIcon />}
							onClick={() => setImportDialogOpen(true)}
						>
							Importar archivo TXT (F883)
						</Button>
						<Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
							Nueva actividad
						</Button>
					</Stack>
				</Stack>

				<AdminFilters
					search={search}
					onSearchChange={(val) => {
						setSearch(val);
						setPage(0);
					}}
					searchPlaceholder="Buscar por código (ej. 900011) o descripción..."
					onClear={() => {
						setSearch('');
						setPage(0);
					}}
				/>

				<AdminTable
					columns={columns}
					rows={actividades}
					getRowId={(row) => row.codigo}
					total={total}
					page={page}
					pageSize={pageSize}
					sortBy={sortBy}
					sortDir={sortDir}
					loading={loading}
					error={error}
					emptyMessage="No se encontraron actividades ARCA que coincidan con la búsqueda."
					onPageChange={setPage}
					onSortChange={(field, dir) => {
						setSortBy(field);
						setSortDir(dir);
					}}
				/>
			</Stack>

			{/* Modal Crear / Editar */}
			<Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
				<form onSubmit={(e) => void handleSave(e)}>
					<DialogTitle>{editingActividad ? 'Modificar actividad ARCA' : 'Nueva actividad ARCA'}</DialogTitle>
					<DialogContent dividers>
						<Stack spacing={2.5} sx={{ pt: 1 }}>
							<TextField
								required
								fullWidth
								label="Código ARCA (6 dígitos)"
								value={formCodigo}
								disabled={!!editingActividad}
								onChange={(e) => setFormCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
								placeholder="Ej: 900011"
								helperText={
									editingActividad
										? 'El código no puede modificarse.'
										: 'Debe contener exactamente 6 números.'
								}
								autoFocus={!editingActividad}
							/>

							<TextField
								required
								fullWidth
								multiline
								rows={3}
								label="Descripción de la actividad"
								value={formDescripcion}
								onChange={(e) => setFormDescripcion(e.target.value)}
								inputProps={{ maxLength: 255 }}
								helperText={`${formDescripcion.length}/255 caracteres`}
								autoFocus={!!editingActividad}
							/>
						</Stack>
					</DialogContent>
					<DialogActions>
						<Button onClick={() => setDialogOpen(false)} disabled={formSubmitting}>
							Cancelar
						</Button>
						<Button type="submit" variant="contained" loading={formSubmitting}>
							Guardar
						</Button>
					</DialogActions>
				</form>
			</Dialog>

			{/* Modal Eliminar */}
			<Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
				<DialogTitle>¿Eliminar actividad ARCA?</DialogTitle>
				<DialogContent dividers>
					<Typography variant="body2">
						¿Estás seguro de que deseas eliminar permanentemente la actividad{' '}
						<strong>
							{deletingActividad?.codigo} - {deletingActividad?.descripcion}
						</strong>
						?
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteDialogOpen(false)} disabled={deleteSubmitting}>
						Cancelar
					</Button>
					<Button
						color="error"
						variant="contained"
						onClick={() => void handleDelete()}
						loading={deleteSubmitting}
					>
						Eliminar
					</Button>
				</DialogActions>
			</Dialog>

			{/* Modal Importar Archivo TXT F883 */}
			<Dialog open={importDialogOpen} onClose={handleCloseImportDialog} maxWidth="md" fullWidth>
				<DialogTitle>
					<Stack direction="row" alignItems="center" justifyContent="space-between">
						<Typography variant="h6" fontWeight={600}>
							Importar actividades ARCA (Padrón F883)
						</Typography>
						<Button
							size="small"
							startIcon={<DownloadIcon />}
							variant="text"
							onClick={handleDownloadTemplate}
						>
							Descargar formato de ejemplo
						</Button>
					</Stack>
				</DialogTitle>

				<DialogContent dividers>
					<Stack spacing={3}>
						<Alert severity="info" icon={<HelpOutlineIcon />}>
							<AlertTitle sx={{ fontWeight: 600 }}>Formato del archivo TXT esperado</AlertTitle>
							<Typography variant="body2" sx={{ mb: 1 }}>
								El archivo debe contener campos separados por punto y coma (<code>;</code>) siguiendo la
								estructura del padrón de actividades económicas de ARCA (F883):
							</Typography>
							<Box
								component="pre"
								sx={{
									p: 1.5,
									bgcolor: 'action.hover',
									borderRadius: 1,
									fontSize: '0.78rem',
									fontFamily: 'monospace',
									overflowX: 'auto',
									m: 0,
								}}
							>
								{`COD_ACTIVIDAD_F883;DESC_ACTIVIDAD_F883;DESCL_ACTIVIDA_F883;
011111;Cultivo de arroz;Cultivo de arroz;
011119;Cultivo de cereales n.c.p., excepto los de uso forrajero;...`}
							</Box>
						</Alert>

						{importError && (
							<Alert severity="error" onClose={() => setImportError(null)}>
								<AlertTitle sx={{ fontWeight: 600 }}>Error al importar actividades</AlertTitle>
								{importError}
							</Alert>
						)}

						{/* Dropzone */}
						<Box
							onDragOver={(e) => {
								e.preventDefault();
								setIsDragOver(true);
							}}
							onDragLeave={() => setIsDragOver(false)}
							onDrop={handleDrop}
							onClick={() => fileInputRef.current?.click()}
							sx={{
								border: '2px dashed',
								borderColor: isDragOver ? 'primary.main' : 'divider',
								borderRadius: 2,
								p: 4,
								textAlign: 'center',
								cursor: 'pointer',
								bgcolor: isDragOver ? 'action.hover' : 'background.paper',
								transition: 'all 0.2s ease',
								'&:hover': {
									borderColor: 'primary.main',
									bgcolor: 'action.hover',
								},
							}}
						>
							<input
								ref={fileInputRef}
								type="file"
								accept=".txt,.csv,text/plain"
								style={{ display: 'none' }}
								onChange={(e) => {
									if (e.target.files && e.target.files[0]) {
										handleFileSelect(e.target.files[0]);
									}
								}}
							/>
							<CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
							<Typography variant="subtitle1" fontWeight={600}>
								{selectedFile
									? selectedFile.name
									: 'Arrastrá tu archivo TXT aquí o hacé clic para seleccionarlo'}
							</Typography>
							<Typography variant="caption" color="text.secondary">
								Archivos de texto (.txt, .csv) con codificación UTF-8
							</Typography>
						</Box>

						{/* Previsualización del archivo cargado */}
						{selectedFile && !importResult && (
							<Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
								<Stack spacing={2}>
									<Stack direction="row" alignItems="center" justifyContent="space-between">
										<Typography variant="subtitle2" fontWeight={600}>
											Resumen del archivo detectado
										</Typography>
										<Stack direction="row" spacing={1}>
											<Chip
												label={`${previewTotalLines} filas válidas`}
												color="success"
												size="small"
												variant="outlined"
											/>
											{previewErrorsCount > 0 && (
												<Chip
													label={`${previewErrorsCount} filas omitidas`}
													color="warning"
													size="small"
													variant="outlined"
												/>
											)}
										</Stack>
									</Stack>

									<Typography variant="caption" color="text.secondary">
										Previsualización de las primeras {previewRows.length} filas:
									</Typography>

									<TableContainer>
										<Table size="small">
											<TableHead>
												<TableRow>
													<TableCell sx={{ fontWeight: 600 }}>Código</TableCell>
													<TableCell sx={{ fontWeight: 600 }}>Descripción</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{previewRows.map((row, idx) => (
													<TableRow key={idx}>
														<TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
															{row.codigo}
														</TableCell>
														<TableCell>{row.descripcion}</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</TableContainer>
								</Stack>
							</Paper>
						)}

						{importSubmitting && (
							<Box sx={{ width: '100%', py: 2 }}>
								<Typography variant="body2" color="text.secondary" sx={{ mb: 1, textAlign: 'center' }}>
									Procesando e insertando actividades en la base de datos...
								</Typography>
								<LinearProgress />
							</Box>
						)}

						{/* Resultado de la importación */}
						{importResult && (
							<Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: 'background.paper' }}>
								<Stack spacing={2}>
									<Stack direction="row" alignItems="center" spacing={1.5}>
										<CheckCircleOutlineIcon color="success" sx={{ fontSize: 32 }} />
										<Box>
											<Typography variant="subtitle1" fontWeight={600}>
												Importación completada con éxito
											</Typography>
											<Typography variant="body2" color="text.secondary">
												Total procesado: {importResult.totalProcesados} registros
											</Typography>
										</Box>
									</Stack>

									<Divider />

									<Box
										sx={{
											display: 'grid',
											gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' },
											gap: 2,
										}}
									>
										<Paper
											variant="outlined"
											sx={{
												p: 1.5,
												textAlign: 'center',
												bgcolor: 'success.light',
												color: 'success.contrastText',
											}}
										>
											<Typography variant="h5" fontWeight={700}>
												{importResult.creados}
											</Typography>
											<Typography variant="caption" fontWeight={600}>
												Nuevas creadas
											</Typography>
										</Paper>
										<Paper
											variant="outlined"
											sx={{
												p: 1.5,
												textAlign: 'center',
												bgcolor: 'info.light',
												color: 'info.contrastText',
											}}
										>
											<Typography variant="h5" fontWeight={700}>
												{importResult.actualizados}
											</Typography>
											<Typography variant="caption" fontWeight={600}>
												Actualizadas
											</Typography>
										</Paper>
										<Paper
											variant="outlined"
											sx={{ p: 1.5, textAlign: 'center', bgcolor: 'action.selected' }}
										>
											<Typography variant="h5" fontWeight={700}>
												{importResult.sinCambios}
											</Typography>
											<Typography variant="caption">Sin cambios</Typography>
										</Paper>
										<Paper
											variant="outlined"
											sx={{
												p: 1.5,
												textAlign: 'center',
												bgcolor:
													importResult.errores.length > 0 ? 'warning.light' : 'action.hover',
											}}
										>
											<Typography variant="h5" fontWeight={700}>
												{importResult.errores.length}
											</Typography>
											<Typography variant="caption">Omitidas / Error</Typography>
										</Paper>
									</Box>

									{importResult.errores.length > 0 && (
										<Alert severity="warning" icon={<ErrorOutlineIcon />}>
											<AlertTitle sx={{ fontWeight: 600 }}>
												Detalle de líneas con advertencias
											</AlertTitle>
											<Stack spacing={0.5} sx={{ maxHeight: 160, overflowY: 'auto', mt: 1 }}>
												{importResult.errores.map((err, i) => (
													<Typography key={i} variant="caption">
														• Línea {err.linea} {err.codigo ? `[${err.codigo}]` : ''}:{' '}
														{err.motivo}
													</Typography>
												))}
											</Stack>
										</Alert>
									)}
								</Stack>
							</Paper>
						)}
					</Stack>
				</DialogContent>

				<DialogActions>
					<Button onClick={handleCloseImportDialog}>{importResult ? 'Cerrar' : 'Cancelar'}</Button>
					{!importResult && (
						<Button
							variant="contained"
							startIcon={<FileUploadIcon />}
							onClick={() => void handleExecuteImport()}
							disabled={!fileRawContent || importSubmitting || previewRows.length === 0}
							loading={importSubmitting}
						>
							Importar actividades
						</Button>
					)}
				</DialogActions>
			</Dialog>
		</PageContainer>
	);
}
