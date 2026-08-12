import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
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
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { PageContainer } from '@toolpad/core/PageContainer';

import {
	asociarPreguntaFormularioAdmin,
	crearPreguntaBancoAdmin,
	crearPreguntaFormularioAdmin,
	desactivarPreguntaFormularioAdmin,
	editarPreguntaAdmin,
	guardarFormularioCategoriaAdmin,
	guardarFormularioSubcategoriaAdmin,
	listarCategoriasAdmin,
	listarPreguntasAdmin,
	listarSubcategoriasAdmin,
	obtenerCategoriaAdmin,
	obtenerFormularioCategoriaAdmin,
	obtenerFormularioSubcategoriaAdmin,
	obtenerSubcategoriaAdmin,
	reemplazarPreguntaFormularioAdmin,
	type CategoriaAdmin,
	type FormularioAdmin,
	type PreguntaBancoAdmin,
	type PreguntaFormularioAdmin,
	type SubcategoriaAdmin,
	type TipoPreguntaAdmin,
} from '../api/admin';
import { buildSlugSinId, parseIdDesdeSlug, slugify } from '../utils/slug';

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
	const { categoriaSlug = '', subcategoriaSlug = '' } = useParams<{
		categoriaSlug: string;
		subcategoriaSlug?: string;
	}>();
	const navigate = useNavigate();
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
	const [questionMode, setQuestionMode] = React.useState<'nueva' | 'existente'>('nueva');
	const [bankQuestions, setBankQuestions] = React.useState<PreguntaBancoAdmin[]>([]);
	const [loadingBank, setLoadingBank] = React.useState(false);
	const [selectedBankQuestion, setSelectedBankQuestion] = React.useState<PreguntaBancoAdmin | null>(null);
	const [questionText, setQuestionText] = React.useState('');
	const [questionType, setQuestionType] = React.useState<TipoPreguntaAdmin>('TEXTO');
	const [questionOptions, setQuestionOptions] = React.useState('');
	const [questionRequired, setQuestionRequired] = React.useState(false);
	const [questionPublic, setQuestionPublic] = React.useState(true);
	const [questionSubmitting, setQuestionSubmitting] = React.useState(false);
	const [questionError, setQuestionError] = React.useState<string | null>(null);
	const [deletingQuestion, setDeletingQuestion] = React.useState<PreguntaFormularioAdmin | null>(null);

	// State para modal de editar/reemplazar pregunta
	const [editQuestionDialogOpen, setEditQuestionDialogOpen] = React.useState(false);
	const [editingQuestion, setEditingQuestion] = React.useState<PreguntaFormularioAdmin | null>(null);
	const [editMode, setEditMode] = React.useState<'global' | 'reemplazar'>('global');

	const [editQuestionText, setEditQuestionText] = React.useState('');
	const [editQuestionType, setEditQuestionType] = React.useState<TipoPreguntaAdmin>('TEXTO');
	const [editQuestionOptions, setEditQuestionOptions] = React.useState('');

	const [replaceQuestionMode, setReplaceQuestionMode] = React.useState<'existente' | 'nueva'>('existente');
	const [replaceSelectedBankQuestion, setReplaceSelectedBankQuestion] = React.useState<PreguntaBancoAdmin | null>(null);
	const [replaceQuestionText, setReplaceQuestionText] = React.useState('');
	const [replaceQuestionType, setReplaceQuestionType] = React.useState<TipoPreguntaAdmin>('TEXTO');
	const [replaceQuestionOptions, setReplaceQuestionOptions] = React.useState('');
	const [replaceQuestionRequired, setReplaceQuestionRequired] = React.useState(false);
	const [replaceQuestionPublic, setReplaceQuestionPublic] = React.useState(true);

	const [editQuestionSubmitting, setEditQuestionSubmitting] = React.useState(false);
	const [editQuestionError, setEditQuestionError] = React.useState<string | null>(null);

	function openEditQuestionDialog(question: PreguntaFormularioAdmin) {
		setEditingQuestion(question);
		setEditMode('global');
		setEditQuestionText(question.pregunta);
		setEditQuestionType(question.tipoDato);
		setEditQuestionOptions(question.opciones ? question.opciones.join('\n') : '');

		setReplaceQuestionMode('existente');
		setReplaceSelectedBankQuestion(null);
		setReplaceQuestionText('');
		setReplaceQuestionType('TEXTO');
		setReplaceQuestionOptions('');
		setReplaceQuestionRequired(question.esObligatorio);
		setReplaceQuestionPublic(question.esPublico);

		setEditQuestionError(null);
		setEditQuestionDialogOpen(true);

		setLoadingBank(true);
		void listarPreguntasAdmin()
			.then((res) => setBankQuestions(res.data))
			.catch(() => setBankQuestions([]))
			.finally(() => setLoadingBank(false));
	}

	async function handleSaveEditQuestion(event: React.FormEvent) {
		event.preventDefault();
		if (!formulario || !editingQuestion) return;

		if (editMode === 'global') {
			const usesOpts = editQuestionType === 'OPCION_UNICA' || editQuestionType === 'OPCION_MULTIPLE';
			const opts = usesOpts
				? editQuestionOptions
						.split('\n')
						.map((o) => o.trim())
						.filter(Boolean)
				: null;

			if (!editQuestionText.trim()) {
				setEditQuestionError('La pregunta es obligatoria.');
				return;
			}
			if (usesOpts && (!opts || opts.length < 2)) {
				setEditQuestionError('Ingresá al menos dos opciones, una por línea.');
				return;
			}

			setEditQuestionSubmitting(true);
			setEditQuestionError(null);
			try {
				await editarPreguntaAdmin(editingQuestion.id, {
					pregunta: editQuestionText.trim(),
					tipoDato: editQuestionType,
					opciones: opts,
				});
				const freshForm = subcategoria
					? await obtenerFormularioSubcategoriaAdmin(categoria!.id, subcategoria.id)
					: await obtenerFormularioCategoriaAdmin(categoria!.id);
				setFormulario(freshForm.data);
				setEditQuestionDialogOpen(false);
			} catch (err) {
				setEditQuestionError(err instanceof Error ? err.message : 'No se pudo editar la pregunta.');
			} finally {
				setEditQuestionSubmitting(false);
			}
			return;
		}

		setEditQuestionSubmitting(true);
		setEditQuestionError(null);

		try {
			let newQuestionId: number;

			if (replaceQuestionMode === 'existente') {
				if (!replaceSelectedBankQuestion) {
					setEditQuestionError('Seleccioná una pregunta del listado.');
					setEditQuestionSubmitting(false);
					return;
				}
				newQuestionId = replaceSelectedBankQuestion.id;
			} else {
				const usesOpts = replaceQuestionType === 'OPCION_UNICA' || replaceQuestionType === 'OPCION_MULTIPLE';
				const opts = usesOpts
					? replaceQuestionOptions
							.split('\n')
							.map((o) => o.trim())
							.filter(Boolean)
					: null;

				if (!replaceQuestionText.trim()) {
					setEditQuestionError('La pregunta es obligatoria.');
					setEditQuestionSubmitting(false);
					return;
				}
				if (usesOpts && (!opts || opts.length < 2)) {
					setEditQuestionError('Ingresá al menos dos opciones, una por línea.');
					setEditQuestionSubmitting(false);
					return;
				}

				const created = await crearPreguntaBancoAdmin({
					pregunta: replaceQuestionText.trim(),
					tipoDato: replaceQuestionType,
					opciones: opts,
					orden: null,
					esObligatorio: replaceQuestionRequired,
					esPublico: replaceQuestionPublic,
				});
				newQuestionId = created.data.id;
			}

			const response = await reemplazarPreguntaFormularioAdmin(formulario.id, editingQuestion.id, {
				idPreguntaNueva: newQuestionId,
				esObligatorio: replaceQuestionRequired,
				esPublico: replaceQuestionPublic,
			});

			setFormulario(response.data);
			setEditQuestionDialogOpen(false);
		} catch (err) {
			setEditQuestionError(err instanceof Error ? err.message : 'No se pudo reemplazar la pregunta.');
		} finally {
			setEditQuestionSubmitting(false);
		}
	}

	React.useEffect(() => {
		const controller = new AbortController();

		async function load() {
			if (!categoriaSlug) {
				setError('La ruta del formulario no es válida.');
				setLoading(false);
				return;
			}

			setLoading(true);
			setError(null);

			try {
				let resolvedCat: CategoriaAdmin | null = null;
				const directCatId = parseIdDesdeSlug(categoriaSlug);
				if (directCatId) {
					try {
						const res = await obtenerCategoriaAdmin(directCatId, controller.signal);
						resolvedCat = res.data;
					} catch {
						// Ignorar error si no encuentra por ID directo
					}
				}
				if (!resolvedCat) {
					const listRes = await listarCategoriasAdmin(
						{ limit: 100, offset: 0, sortBy: 'nombre', sortDir: 'ASC' },
						controller.signal,
					);
					resolvedCat =
						listRes.data.find(
							(cat) =>
								buildSlugSinId(cat.nombre, cat.id) === categoriaSlug ||
								slugify(cat.nombre) === categoriaSlug,
						) ?? null;
				}

				if (!resolvedCat) {
					setError('No se encontró la categoría solicitada.');
					setLoading(false);
					return;
				}
				setCategoria(resolvedCat);

				let resolvedSub: SubcategoriaAdmin | null = null;
				if (subcategoriaSlug) {
					const directSubId = parseIdDesdeSlug(subcategoriaSlug);
					if (directSubId) {
						try {
							const subRes = await obtenerSubcategoriaAdmin(resolvedCat.id, directSubId, controller.signal);
							resolvedSub = subRes.data;
						} catch {
							// Ignorar error
						}
					}
					if (!resolvedSub) {
						const listSubs = await listarSubcategoriasAdmin(
							resolvedCat.id,
							{ limit: 100, offset: 0, sortBy: 'nombre', sortDir: 'ASC' },
							controller.signal,
						);
						resolvedSub =
							listSubs.data.find(
								(sub) =>
									buildSlugSinId(sub.nombre, sub.id) === subcategoriaSlug ||
									slugify(sub.nombre) === subcategoriaSlug,
							) ?? null;
					}

					if (!resolvedSub) {
						setError('No se encontró la subcategoría solicitada.');
						setLoading(false);
						return;
					}
					setSubcategoria(resolvedSub);
				}

				let formResponse: { data: FormularioAdmin | null };
				const loadedScopeName = resolvedSub ? resolvedSub.nombre : resolvedCat.nombre;

				if (resolvedSub) {
					formResponse = await obtenerFormularioSubcategoriaAdmin(
						resolvedCat.id,
						resolvedSub.id,
						controller.signal,
					);
				} else {
					formResponse = await obtenerFormularioCategoriaAdmin(resolvedCat.id, controller.signal);
				}

				setFormulario(formResponse.data);
				setTitulo(formResponse.data?.titulo ?? `Formulario de ${loadedScopeName}`);
				setDescripcion(formResponse.data?.descripcion ?? '');

				// Auto-corrección de URL
				const catCanonical = buildSlugSinId(resolvedCat.nombre, resolvedCat.id);
				if (resolvedSub) {
					const subCanonical = buildSlugSinId(resolvedSub.nombre, resolvedSub.id);
					if (categoriaSlug !== catCanonical || subcategoriaSlug !== subCanonical) {
						navigate(`/categorias/${catCanonical}/subcategorias/${subCanonical}/formulario`, { replace: true });
					}
				} else if (categoriaSlug !== catCanonical) {
					navigate(`/categorias/${catCanonical}/formulario`, { replace: true });
				}
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
	}, [categoriaSlug, subcategoriaSlug, navigate]);

	const scopeName = subcategoria?.nombre ?? categoria?.nombre ?? 'Formulario';
	const backPath = categoria
		? `/categorias/${buildSlugSinId(categoria.nombre, categoria.id)}/subcategorias`
		: '/categorias';
	const questions =
		formulario?.preguntas.filter((question) =>
			questionTab === 'activas' ? question.estado === 'A' : question.estado === 'I',
		) ?? [];
	const usesOptions = questionType === 'OPCION_UNICA' || questionType === 'OPCION_MULTIPLE';

	const activeQuestionIds = React.useMemo(
		() => new Set(formulario?.preguntas.filter((q) => q.estado === 'A').map((q) => q.id) ?? []),
		[formulario],
	);
	const availableBankQuestions = React.useMemo(
		() => bankQuestions.filter((q) => !activeQuestionIds.has(q.id)),
		[bankQuestions, activeQuestionIds],
	);

	async function handleSave() {
		if (!categoria || !titulo.trim()) return;

		setSaving(true);
		setError(null);
		setSaveMessage(null);

		try {
			const data = { titulo: titulo.trim(), descripcion: descripcion.trim() || null };
			const response = subcategoria
				? await guardarFormularioSubcategoriaAdmin(categoria.id, subcategoria.id, data, Boolean(formulario))
				: await guardarFormularioCategoriaAdmin(categoria.id, data, Boolean(formulario));
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
		setQuestionMode('nueva');
		setQuestionText('');
		setQuestionType('TEXTO');
		setQuestionOptions('');
		setQuestionRequired(false);
		setQuestionPublic(true);
		setSelectedBankQuestion(null);
		setQuestionError(null);
		setQuestionDialogOpen(true);

		setLoadingBank(true);
		void listarPreguntasAdmin()
			.then((res) => setBankQuestions(res.data))
			.catch(() => setBankQuestions([]))
			.finally(() => setLoadingBank(false));
	}

	async function handleAddQuestion(event: React.FormEvent) {
		event.preventDefault();
		if (!formulario) return;

		if (questionMode === 'existente') {
			if (!selectedBankQuestion) {
				setQuestionError('Seleccioná una pregunta del listado.');
				return;
			}

			setQuestionSubmitting(true);
			setQuestionError(null);
			try {
				const response = await asociarPreguntaFormularioAdmin(formulario.id, {
					idPregunta: selectedBankQuestion.id,
					esObligatorio: questionRequired,
					esPublico: questionPublic,
				});
				setFormulario(response.data);
				setQuestionDialogOpen(false);
				setQuestionTab('activas');
			} catch (submitError) {
				setQuestionError(
					submitError instanceof Error ? submitError.message : 'No se pudo incorporar la pregunta.',
				);
			} finally {
				setQuestionSubmitting(false);
			}
			return;
		}

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
														<Typography variant="caption" color="text.secondary" display="block">
															{question.opciones.join(' · ')}
														</Typography>
													)}
													{question.preguntaReemplazada && (
														<Typography variant="caption" color="primary.main" display="block" sx={{ mt: 0.5 }}>
															Reemplaza a: «{question.preguntaReemplazada}»
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
														<Stack direction="row" spacing={0.5} justifyContent="center">
															<Tooltip title="Editar o reemplazar">
																<IconButton
																	size="small"
																	color="primary"
																	onClick={() => openEditQuestionDialog(question)}
																>
																	<EditIcon fontSize="small" />
																</IconButton>
															</Tooltip>
															<Tooltip title="Dar de baja">
																<IconButton
																	size="small"
																	color="error"
																	onClick={() => setDeletingQuestion(question)}
																>
																	<DeleteIcon fontSize="small" />
																</IconButton>
															</Tooltip>
														</Stack>
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
							<ToggleButtonGroup
								exclusive
								fullWidth
								color="primary"
								value={questionMode}
								onChange={(_e, newMode: 'nueva' | 'existente' | null) => {
									if (newMode) {
										setQuestionMode(newMode);
										setQuestionError(null);
									}
								}}
							>
								<ToggleButton value="nueva">Crear nueva pregunta</ToggleButton>
								<ToggleButton value="existente">Elegir pregunta existente</ToggleButton>
							</ToggleButtonGroup>

							{questionError && <Alert severity="error">{questionError}</Alert>}

							{questionMode === 'nueva' ? (
								<>
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
								</>
							) : (
								<>
									<Autocomplete
										options={availableBankQuestions}
										getOptionLabel={(option) => option.pregunta}
										value={selectedBankQuestion}
										loading={loadingBank}
										onChange={(_event, newValue) => setSelectedBankQuestion(newValue)}
										renderInput={(params) => (
											<TextField
												{...params}
												label="Buscar pregunta existente"
												placeholder="Seleccioná una pregunta del banco..."
												required
											/>
										)}
										renderOption={(props, option) => (
											<Box component="li" {...props} key={option.id}>
												<Stack spacing={0.5}>
													<Typography variant="body2" fontWeight={600}>
														{option.pregunta}
													</Typography>
													<Typography variant="caption" color="text.secondary">
														Tipo: {questionTypeLabels[option.tipoDato]}
														{option.opciones ? ` · ${option.opciones.join(', ')}` : ''}
													</Typography>
												</Stack>
											</Box>
										)}
										noOptionsText={
											loadingBank
												? 'Cargando preguntas...'
												: 'No hay preguntas disponibles para seleccionar'
										}
									/>

									{selectedBankQuestion && (
										<Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
											<Stack spacing={1}>
												<Typography variant="subtitle2">Detalle de la pregunta seleccionada</Typography>
												<Typography variant="body2" fontWeight={600}>
													{selectedBankQuestion.pregunta}
												</Typography>
												<Stack direction="row" spacing={1} alignItems="center">
													<Chip
														label={questionTypeLabels[selectedBankQuestion.tipoDato]}
														size="small"
														color="primary"
														variant="outlined"
													/>
													{selectedBankQuestion.opciones && (
														<Typography variant="caption" color="text.secondary">
															Opciones: {selectedBankQuestion.opciones.join(' · ')}
														</Typography>
													)}
												</Stack>
											</Stack>
										</Paper>
									)}
								</>
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
							{questionMode === 'existente' ? 'Incorporar' : 'Agregar'}
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

			<Dialog open={editQuestionDialogOpen} onClose={() => setEditQuestionDialogOpen(false)} maxWidth="sm" fullWidth>
				<form onSubmit={(event) => void handleSaveEditQuestion(event)}>
					<DialogTitle>Editar / Reemplazar pregunta</DialogTitle>
					<DialogContent dividers>
						<Stack spacing={2.5} sx={{ pt: 1 }}>
							<ToggleButtonGroup
								exclusive
								fullWidth
								value={editMode}
								onChange={(_event, value) => {
									if (value) setEditMode(value);
								}}
							>
								<ToggleButton value="global">Editar globalmente</ToggleButton>
								<ToggleButton value="reemplazar">Reemplazar en este formulario</ToggleButton>
							</ToggleButtonGroup>

							{editQuestionError && <Alert severity="error">{editQuestionError}</Alert>}

							{editMode === 'global' ? (
								<Stack spacing={2}>
									<Alert severity="info">
										Modificar la pregunta la actualizará globalmente en el banco. Si la pregunta ya posee respuestas registradas, no se permitirá modificar el tipo de dato ni las opciones.
									</Alert>
									<TextField
										label="Pregunta"
										required
										value={editQuestionText}
										onChange={(event) => setEditQuestionText(event.target.value)}
										inputProps={{ maxLength: 500 }}
									/>
									<FormControl fullWidth>
										<InputLabel id="edit-question-type-label">Tipo de dato</InputLabel>
										<Select
											labelId="edit-question-type-label"
											value={editQuestionType}
											label="Tipo de dato"
											onChange={(event) => setEditQuestionType(event.target.value as TipoPreguntaAdmin)}
										>
											{questionTypes.map((type) => (
												<MenuItem key={type} value={type}>
													{questionTypeLabels[type]}
												</MenuItem>
											))}
										</Select>
									</FormControl>
									{(editQuestionType === 'OPCION_UNICA' || editQuestionType === 'OPCION_MULTIPLE') && (
										<TextField
											label="Opciones (una por línea)"
											required
											multiline
											minRows={3}
											value={editQuestionOptions}
											onChange={(event) => setEditQuestionOptions(event.target.value)}
											helperText="Mínimo 2 opciones. Cada línea será una opción seleccionable."
										/>
									)}
								</Stack>
							) : (
								<Stack spacing={2}>
									<Alert severity="warning">
										Desactivará la pregunta actual en este formulario y la reemplazará en el mismo orden, conservando la trazabilidad histórica de respuestas.
									</Alert>

									<ToggleButtonGroup
										exclusive
										fullWidth
										size="small"
										value={replaceQuestionMode}
										onChange={(_event, value) => {
											if (value) setReplaceQuestionMode(value);
										}}
									>
										<ToggleButton value="existente">Pregunta existente</ToggleButton>
										<ToggleButton value="nueva">Pregunta nueva</ToggleButton>
									</ToggleButtonGroup>

									{replaceQuestionMode === 'existente' ? (
										<Autocomplete
											options={availableBankQuestions}
											getOptionLabel={(option) => `${option.pregunta} (${questionTypeLabels[option.tipoDato]})`}
											value={replaceSelectedBankQuestion}
											onChange={(_event, newValue) => setReplaceSelectedBankQuestion(newValue)}
											loading={loadingBank}
											renderInput={(params) => (
												<TextField
													{...params}
													label="Seleccionar pregunta del banco"
													placeholder="Buscar pregunta..."
													InputProps={{
														...params.InputProps,
														endAdornment: (
															<React.Fragment>
																{loadingBank ? <CircularProgress color="inherit" size={20} /> : null}
																{params.InputProps.endAdornment}
															</React.Fragment>
														),
													}}
												/>
											)}
										/>
									) : (
										<Stack spacing={2}>
											<TextField
												label="Pregunta nueva"
												required
												value={replaceQuestionText}
												onChange={(event) => setReplaceQuestionText(event.target.value)}
												inputProps={{ maxLength: 500 }}
											/>
											<FormControl fullWidth>
												<InputLabel id="replace-question-type-label">Tipo de dato</InputLabel>
												<Select
													labelId="replace-question-type-label"
													value={replaceQuestionType}
													label="Tipo de dato"
													onChange={(event) => setReplaceQuestionType(event.target.value as TipoPreguntaAdmin)}
												>
													{questionTypes.map((type) => (
														<MenuItem key={type} value={type}>
															{questionTypeLabels[type]}
														</MenuItem>
													))}
												</Select>
											</FormControl>
											{(replaceQuestionType === 'OPCION_UNICA' || replaceQuestionType === 'OPCION_MULTIPLE') && (
												<TextField
													label="Opciones (una por línea)"
													required
													multiline
													minRows={3}
													value={replaceQuestionOptions}
													onChange={(event) => setReplaceQuestionOptions(event.target.value)}
													helperText="Mínimo 2 opciones. Cada línea será una opción."
												/>
											)}
										</Stack>
									)}

									<Stack direction="row" spacing={2}>
										<FormControlLabel
											control={
												<Checkbox
													checked={replaceQuestionRequired}
													onChange={(event) => setReplaceQuestionRequired(event.target.checked)}
												/>
											}
											label="Obligatoria"
										/>
										<FormControlLabel
											control={
												<Checkbox
													checked={replaceQuestionPublic}
													onChange={(event) => setReplaceQuestionPublic(event.target.checked)}
												/>
											}
											label="Visible públicamente"
										/>
									</Stack>
								</Stack>
							)}
						</Stack>
					</DialogContent>
					<DialogActions>
						<Button onClick={() => setEditQuestionDialogOpen(false)} disabled={editQuestionSubmitting}>
							Cancelar
						</Button>
						<Button type="submit" variant="contained" loading={editQuestionSubmitting}>
							{editMode === 'global' ? 'Guardar globalmente' : 'Reemplazar en formulario'}
						</Button>
					</DialogActions>
				</form>
			</Dialog>
		</PageContainer>
	);
}
