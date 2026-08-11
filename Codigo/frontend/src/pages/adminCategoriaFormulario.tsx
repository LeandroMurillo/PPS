import * as React from 'react';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { PageContainer } from '@toolpad/core/PageContainer';
import { useNavigate, useParams } from 'react-router-dom';

import {
	crearPreguntaFormularioAdmin,
	desactivarPreguntaFormularioAdmin,
	guardarFormularioCategoriaAdmin,
	guardarFormularioSubcategoriaAdmin,
	obtenerCategoriaAdmin,
	obtenerFormularioCategoriaAdmin,
	obtenerFormularioSubcategoriaAdmin,
	obtenerSubcategoriaAdmin,
	type CategoriaAdmin,
	type FormularioAdmin,
	type PreguntaFormularioAdmin,
	type SubcategoriaAdmin,
	type TipoPreguntaAdmin,
} from '../api/admin';

const questionTypeLabels: Record<TipoPreguntaAdmin, string> = {
	TEXTO: 'Texto',
	NUMERO: 'Número',
	BOOLEANO: 'Sí / No',
	FECHA: 'Fecha',
	URL: 'Enlace',
	EMAIL: 'Correo electrónico',
	TELEFONO: 'Teléfono',
	OPCION_UNICA: 'Opción única',
	OPCION_MULTIPLE: 'Opciones múltiples',
};

const questionTypes = Object.keys(questionTypeLabels) as TipoPreguntaAdmin[];

export default function AdminCategoriaFormularioPage() {
	const { categoriaId, subcategoriaId } = useParams<{
		categoriaId: string;
		subcategoriaId?: string;
	}>();
	const navigate = useNavigate();
	const isSubcategory = Boolean(subcategoriaId);
	const [categoria, setCategoria] = React.useState<CategoriaAdmin | null>(null);
	const [subcategoria, setSubcategoria] = React.useState<SubcategoriaAdmin | null>(null);
	const [formulario, setFormulario] = React.useState<FormularioAdmin | null>(null);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);

	const [titulo, setTitulo] = React.useState('');
	const [descripcion, setDescripcion] = React.useState('');
	const [saving, setSaving] = React.useState(false);
	const [saveMessage, setSaveMessage] = React.useState<string | null>(null);
	const [questionTab, setQuestionTab] = React.useState<'activas' | 'historial'>('activas');

	const [questionDialogOpen, setQuestionDialogOpen] = React.useState(false);
	const [questionText, setQuestionText] = React.useState('');
	const [questionType, setQuestionType] = React.useState<TipoPreguntaAdmin>('TEXTO');
	const [questionOptions, setQuestionOptions] = React.useState('');
	const [questionRequired, setQuestionRequired] = React.useState(false);
	const [questionPublic, setQuestionPublic] = React.useState(true);
	const [questionSubmitting, setQuestionSubmitting] = React.useState(false);
	const [questionError, setQuestionError] = React.useState<string | null>(null);
	const [deletingQuestion, setDeletingQuestion] = React.useState<PreguntaFormularioAdmin | null>(null);

	React.useEffect(() => {
		const controller = new AbortController();

		async function load() {
			if (!categoriaId || (isSubcategory && !subcategoriaId)) {
				setError('La ruta del formulario no es válida.');
				setLoading(false);
				return;
			}

			try {
				const categoryResponse = await obtenerCategoriaAdmin(categoriaId, controller.signal);
				setCategoria(categoryResponse.data);

				let formResponse: { data: FormularioAdmin | null };
				let loadedScopeName = categoryResponse.data.nombre;
				if (subcategoriaId) {
					const [subcategoryResponse, scopedFormResponse] = await Promise.all([
						obtenerSubcategoriaAdmin(categoriaId, subcategoriaId, controller.signal),
						obtenerFormularioSubcategoriaAdmin(categoriaId, subcategoriaId, controller.signal),
					]);
					setSubcategoria(subcategoryResponse.data);
					loadedScopeName = subcategoryResponse.data.nombre;
					formResponse = scopedFormResponse;
				} else {
					formResponse = await obtenerFormularioCategoriaAdmin(categoriaId, controller.signal);
				}

				setFormulario(formResponse.data);
				setTitulo(formResponse.data?.titulo ?? `Formulario de ${loadedScopeName}`);
				setDescripcion(formResponse.data?.descripcion ?? '');
			} catch (loadError) {
				if (!controller.signal.aborted) {
					setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar el formulario.');
				}
			} finally {
				if (!controller.signal.aborted) setLoading(false);
			}
		}

		void load();
		return () => controller.abort();
	}, [categoriaId, isSubcategory, subcategoriaId]);

	const scopeName = subcategoria?.nombre ?? categoria?.nombre ?? 'Formulario';
	const backPath = categoriaId ? `/categorias/${categoriaId}/subcategorias` : '/categorias';
	const questions =
		formulario?.preguntas.filter((question) =>
			questionTab === 'activas' ? question.estado === 'A' : question.estado === 'I',
		) ?? [];
	const usesOptions = questionType === 'OPCION_UNICA' || questionType === 'OPCION_MULTIPLE';

	async function handleSave() {
		if (!categoriaId || !titulo.trim()) return;

		setSaving(true);
		setError(null);
		setSaveMessage(null);

		try {
			const data = { titulo: titulo.trim(), descripcion: descripcion.trim() || null };
			const response = subcategoriaId
				? await guardarFormularioSubcategoriaAdmin(categoriaId, subcategoriaId, data, Boolean(formulario))
				: await guardarFormularioCategoriaAdmin(categoriaId, data, Boolean(formulario));
			setFormulario(response.data);
			setTitulo(response.data.titulo);
			setDescripcion(response.data.descripcion ?? '');
			setSaveMessage(formulario ? 'Formulario actualizado.' : 'Formulario creado. Ya podés agregar preguntas.');
		} catch (saveError) {
			setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar el formulario.');
		} finally {
			setSaving(false);
		}
	}

	function openQuestionDialog() {
		setQuestionText('');
		setQuestionType('TEXTO');
		setQuestionOptions('');
		setQuestionRequired(false);
		setQuestionPublic(true);
		setQuestionError(null);
		setQuestionDialogOpen(true);
	}

	async function handleAddQuestion(event: React.FormEvent) {
		event.preventDefault();
		if (!formulario) return;

		const options = usesOptions
			? questionOptions
					.split('\n')
					.map((option) => option.trim())
					.filter(Boolean)
			: null;

		if (!questionText.trim()) {
			setQuestionError('La pregunta es obligatoria.');
			return;
		}
		if (usesOptions && (!options || options.length < 2)) {
			setQuestionError('Ingresá al menos dos opciones, una por línea.');
			return;
		}

		setQuestionSubmitting(true);
		setQuestionError(null);
		try {
			const response = await crearPreguntaFormularioAdmin(formulario.id, {
				pregunta: questionText.trim(),
				tipoDato: questionType,
				opciones: options,
				orden: null,
				esObligatorio: questionRequired,
				esPublico: questionPublic,
			});
			setFormulario(response.data);
			setQuestionDialogOpen(false);
			setQuestionTab('activas');
		} catch (submitError) {
			setQuestionError(submitError instanceof Error ? submitError.message : 'No se pudo agregar la pregunta.');
		} finally {
			setQuestionSubmitting(false);
		}
	}

	async function handleDeactivateQuestion() {
		if (!formulario || !deletingQuestion) return;

		setQuestionSubmitting(true);
		try {
			const response = await desactivarPreguntaFormularioAdmin(formulario.id, deletingQuestion.id);
			setFormulario(response.data);
			setDeletingQuestion(null);
		} catch (deleteError) {
			setError(deleteError instanceof Error ? deleteError.message : 'No se pudo dar de baja la pregunta.');
		} finally {
			setQuestionSubmitting(false);
		}
	}

	return (
		<PageContainer
			title={`Formulario de ${scopeName}`}
			breadcrumbs={[
				{ title: 'Mapa', path: '/' },
				{ title: 'Categorías', path: '/categorias' },
				{ title: categoria?.nombre ?? 'Categoría', path: backPath },
				...(subcategoria ? [{ title: subcategoria.nombre, path: backPath }] : []),
				{ title: 'Formulario' },
			]}
		>
			{loading ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
					<CircularProgress />
				</Box>
			) : (
				<Stack spacing={3} sx={{ width: '100%', maxWidth: 1080 }}>
					<Stack
						direction={{ xs: 'column', sm: 'row' }}
						justifyContent="space-between"
						alignItems={{ xs: 'flex-start', sm: 'center' }}
						spacing={1.5}
					>
						<Button startIcon={<ArrowBackIcon />} onClick={() => navigate(backPath)}>
							Volver
						</Button>
						{formulario && (
							<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
								<Chip
									label={`${formulario.cantidadPreguntasActivas} preguntas activas`}
									variant="outlined"
								/>
								<Chip
									label={`${formulario.cantidadActoresConRespuestas} actores con respuestas`}
									variant="outlined"
								/>
							</Stack>
						)}
					</Stack>

					{error && <Alert severity="error">{error}</Alert>}
					{saveMessage && <Alert severity="success">{saveMessage}</Alert>}

					<Paper variant="outlined" sx={{ p: 3, borderRadius: 1 }}>
						<Stack spacing={2.5}>
							<Typography variant="h6">Datos del formulario</Typography>
							<TextField
								label="Título"
								required
								value={titulo}
								onChange={(event) => setTitulo(event.target.value)}
								inputProps={{ maxLength: 150 }}
							/>
							<TextField
								label="Descripción"
								multiline
								minRows={3}
								value={descripcion}
								onChange={(event) => setDescripcion(event.target.value)}
								inputProps={{ maxLength: 1000 }}
							/>
							<Box>
								<Button
									variant="contained"
									startIcon={<SaveIcon />}
									disabled={!titulo.trim()}
									loading={saving}
									onClick={() => void handleSave()}
								>
									{formulario ? 'Guardar cambios' : 'Crear formulario'}
								</Button>
							</Box>
						</Stack>
					</Paper>

					{formulario && (
						<Paper variant="outlined" sx={{ borderRadius: 1, overflow: 'hidden' }}>
							<Stack
								direction="row"
								justifyContent="space-between"
								alignItems="center"
								sx={{ px: 2.5, pt: 2.5 }}
							>
								<Typography variant="h6">Preguntas</Typography>
								<Button variant="contained" startIcon={<AddIcon />} onClick={openQuestionDialog}>
									Nueva pregunta
								</Button>
							</Stack>
							<Tabs
								value={questionTab}
								onChange={(_event, value) => setQuestionTab(value)}
								sx={{ px: 2.5, borderBottom: 1, borderColor: 'divider' }}
							>
								<Tab value="activas" label="Activas" />
								<Tab value="historial" label="Historial" />
							</Tabs>
							<TableContainer>
								<Table size="small">
									<TableHead>
										<TableRow>
											<TableCell width={70}>Orden</TableCell>
											<TableCell>Pregunta</TableCell>
											<TableCell>Tipo</TableCell>
											<TableCell>Condiciones</TableCell>
											<TableCell align="right">Respuestas</TableCell>
											<TableCell align="center" width={80}>
												Acciones
											</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{questions.map((question) => (
											<TableRow key={question.id} hover>
												<TableCell>{question.orden}</TableCell>
												<TableCell>
													<Typography variant="body2" fontWeight={600}>
														{question.pregunta}
													</Typography>
													{question.opciones && (
														<Typography variant="caption" color="text.secondary">
															{question.opciones.join(' · ')}
														</Typography>
													)}
												</TableCell>
												<TableCell>{questionTypeLabels[question.tipoDato]}</TableCell>
												<TableCell>
													<Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
														{question.esObligatorio && (
															<Chip label="Obligatoria" size="small" />
														)}
														{question.esPublico ? (
															<Chip label="Pública" size="small" variant="outlined" />
														) : (
															<Chip label="Privada" size="small" variant="outlined" />
														)}
													</Stack>
												</TableCell>
												<TableCell align="right">
													{question.cantidadActoresQueRespondieron}
												</TableCell>
												<TableCell align="center">
													{question.estado === 'A' && (
														<Tooltip title="Dar de baja">
															<IconButton
																size="small"
																color="error"
																onClick={() => setDeletingQuestion(question)}
															>
																<DeleteIcon fontSize="small" />
															</IconButton>
														</Tooltip>
													)}
												</TableCell>
											</TableRow>
										))}
										{questions.length === 0 && (
											<TableRow>
												<TableCell
													colSpan={6}
													align="center"
													sx={{ py: 6, color: 'text.secondary' }}
												>
													No hay preguntas en esta vista.
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</TableContainer>
						</Paper>
					)}
				</Stack>
			)}

			<Dialog open={questionDialogOpen} onClose={() => setQuestionDialogOpen(false)} maxWidth="sm" fullWidth>
				<form onSubmit={(event) => void handleAddQuestion(event)}>
					<DialogTitle>Nueva pregunta</DialogTitle>
					<DialogContent dividers>
						<Stack spacing={2.5} sx={{ pt: 1 }}>
							{questionError && <Alert severity="error">{questionError}</Alert>}
							<TextField
								required
								autoFocus
								label="Pregunta"
								multiline
								minRows={2}
								value={questionText}
								onChange={(event) => setQuestionText(event.target.value)}
								inputProps={{ maxLength: 500 }}
							/>
							<FormControl fullWidth>
								<InputLabel id="question-type-label">Tipo de respuesta</InputLabel>
								<Select
									labelId="question-type-label"
									label="Tipo de respuesta"
									value={questionType}
									onChange={(event) => setQuestionType(event.target.value as TipoPreguntaAdmin)}
								>
									{questionTypes.map((type) => (
										<MenuItem key={type} value={type}>
											{questionTypeLabels[type]}
										</MenuItem>
									))}
								</Select>
							</FormControl>
							{usesOptions && (
								<TextField
									label="Opciones"
									helperText="Una opción por línea"
									multiline
									minRows={4}
									value={questionOptions}
									onChange={(event) => setQuestionOptions(event.target.value)}
								/>
							)}
							<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
								<FormControlLabel
									control={
										<Checkbox
											checked={questionRequired}
											onChange={(event) => setQuestionRequired(event.target.checked)}
										/>
									}
									label="Obligatoria"
								/>
								<FormControlLabel
									control={
										<Checkbox
											checked={questionPublic}
											onChange={(event) => setQuestionPublic(event.target.checked)}
										/>
									}
									label="Visible públicamente"
								/>
							</Stack>
						</Stack>
					</DialogContent>
					<DialogActions>
						<Button onClick={() => setQuestionDialogOpen(false)} disabled={questionSubmitting}>
							Cancelar
						</Button>
						<Button type="submit" variant="contained" loading={questionSubmitting}>
							Agregar
						</Button>
					</DialogActions>
				</form>
			</Dialog>

			<Dialog open={Boolean(deletingQuestion)} onClose={() => setDeletingQuestion(null)} maxWidth="xs" fullWidth>
				<DialogTitle>¿Dar de baja la pregunta?</DialogTitle>
				<DialogContent dividers>
					<Typography variant="body2">
						La pregunta dejará de solicitarse, pero se conservarán sus respuestas históricas.
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeletingQuestion(null)} disabled={questionSubmitting}>
						Cancelar
					</Button>
					<Button
						color="error"
						variant="contained"
						loading={questionSubmitting}
						onClick={() => void handleDeactivateQuestion()}
					>
						Dar de baja
					</Button>
				</DialogActions>
			</Dialog>
		</PageContainer>
	);
}
