import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BusinessIcon from '@mui/icons-material/Business';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupsIcon from '@mui/icons-material/Groups';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MapIcon from '@mui/icons-material/Map';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import PersonIcon from '@mui/icons-material/Person';
import PublicIcon from '@mui/icons-material/Public';
import SatelliteAltIcon from '@mui/icons-material/SatelliteAlt';
import SearchIcon from '@mui/icons-material/Search';
import L, { type LeafletMouseEvent } from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import {
	Alert,
	Autocomplete,
	Box,
	Button,
	Checkbox,
	Chip,
	CircularProgress,
	Divider,
	FormControl,
	FormControlLabel,
	FormGroup,
	FormHelperText,
	Grid,
	InputLabel,
	MenuItem,
	Paper,
	Radio,
	RadioGroup,
	Select,
	Stack,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material';

import {
	obtenerFormulariosAplicablesApi,
	obtenerOpcionesRegistroApi,
	type FormularioAplicable,
	type OpcionCategoriaRegistro,
	type PreguntaFormularioAplicable,
} from '../api/actores';

import RequiredAsterisk from '../components/requiredAsterisk';

import 'leaflet/dist/leaflet.css';

const STEPS = ['Sobre tu actividad cultural'];

const STEP_DESCRIPTIONS = ['Contanos los datos principales de tu actividad, proyecto o espacio cultural.'];

type ActorType = 'persona' | 'colectivo' | 'institucion';

type FormAnswer = string | string[];

type TucumanDepartmentInfo = {
	centroide?: { lat: number; lon: number };
	localidades: string[];
};

type TucumanDataMap = Record<string, TucumanDepartmentInfo>;

type MapPoint = { lat: number; lng: number };

type GeneralFieldErrors = {
	tipoActor: boolean;
	nombre: boolean;
	descripcion: boolean;
	cuit: boolean;
	categoria: boolean;
	subcategoria: boolean;
	departamento: boolean;
	localidad: boolean;
	direccion: boolean;
	ubicacion: boolean;
};

type GeneralActorData = {
	nombre: string;
	descripcion: string;
	cuit: string;
	departamento: string;
	localidad: string;
	direccion: string;
	ubicacion: MapPoint | null;
	ubicacionPublica: boolean;
	fotoNombre: string;
	fotoPreview: string;
};

const INITIAL_GENERAL_DATA: GeneralActorData = {
	nombre: '',
	descripcion: '',
	cuit: '',
	departamento: '',
	localidad: '',
	direccion: '',
	ubicacion: null,
	ubicacionPublica: true,
	fotoNombre: '',
	fotoPreview: '',
};

const actorTypeOptions: {
	value: ActorType;
	label: string;
	description: string;
	icon: ReactNode;
}[] = [
	{
		value: 'persona',
		label: 'Trabajo de manera independiente',
		description: 'Soy artista, tallerista, gestor/a o creador/a independiente.',
		icon: <PersonIcon fontSize="small" />,
	},
	{
		value: 'colectivo',
		label: 'Somos un grupo o colectivo',
		description: 'Somos una banda, compañía, agrupación, proyecto o elenco.',
		icon: <GroupsIcon fontSize="small" />,
	},
	{
		value: 'institucion',
		label: 'Represento un espacio o institución',
		description: 'Es un emprendimiento, centro cultural, sala, museo, academia o entidad.',
		icon: <BusinessIcon fontSize="small" />,
	},
];

export default function ActorNuevoPage() {
	const pageTopRef = useRef<HTMLDivElement>(null);
	const [activeStep, setActiveStep] = useState(0);
	const [actorType, setActorType] = useState<ActorType | null>(null);
	const [categories, setCategories] = useState<OpcionCategoriaRegistro[]>([]);
	const [categoryId, setCategoryId] = useState<number | null>(null);
	const [subcategoryId, setSubcategoryId] = useState<number | null>(null);
	const [tucumanData, setTucumanData] = useState<TucumanDataMap>({});
	const [catalogLoading, setCatalogLoading] = useState(true);
	const [catalogError, setCatalogError] = useState('');
	const [forms, setForms] = useState<FormularioAplicable[]>([]);
	const [formsLoading, setFormsLoading] = useState(false);
	const [formsError, setFormsError] = useState('');
	const [answers, setAnswers] = useState<Record<string, FormAnswer>>({});
	const [generalData, setGeneralData] = useState<GeneralActorData>(INITIAL_GENERAL_DATA);
	const [validationAttempted, setValidationAttempted] = useState(false);
	const selectedCategory = categories.find((item) => item.id === categoryId) ?? null;

	useEffect(() => {
		const controller = new AbortController();

		void fetch('/data/tucuman_departamentos.json', { signal: controller.signal })
			.then((res) => res.json())
			.then((data: TucumanDataMap) => {
				setTucumanData(data);
			})
			.catch(() => {});

		void obtenerOpcionesRegistroApi(controller.signal)
			.then((response) => {
				setCategories(response.data);
				setCategoryId(null);
				setSubcategoryId(null);
				setCatalogError('');
			})
			.catch((error: unknown) => {
				if (!controller.signal.aborted) {
					setCatalogError(
						error instanceof Error ? error.message : 'No se pudieron cargar las categorías culturales.',
					);
				}
			})
			.finally(() => {
				if (!controller.signal.aborted) setCatalogLoading(false);
			});

		return () => controller.abort();
	}, []);

	const departmentList = useMemo(
		() => Object.keys(tucumanData).sort((a, b) => a.localeCompare(b, 'es')),
		[tucumanData],
	);

	useEffect(() => {
		if (activeStep !== 1 || categoryId === null) return;

		const controller = new AbortController();
		setFormsLoading(true);
		setFormsError('');

		void obtenerFormulariosAplicablesApi(
			{ idCategoria: categoryId, idSubcategoria: subcategoryId },
			controller.signal,
		)
			.then((response) => setForms(response.data))
			.catch((error: unknown) => {
				if (!controller.signal.aborted) {
					setForms([]);
					setFormsError(error instanceof Error ? error.message : 'No se pudieron cargar los formularios.');
				}
			})
			.finally(() => {
				if (!controller.signal.aborted) setFormsLoading(false);
			});

		return () => controller.abort();
	}, [activeStep, categoryId, subcategoryId]);

	const generalFieldErrors: GeneralFieldErrors = {
		tipoActor: validationAttempted && actorType === null,
		nombre: validationAttempted && !generalData.nombre.trim(),
		descripcion: validationAttempted && !generalData.descripcion.trim(),
		cuit: validationAttempted && generalData.cuit.trim() !== '' && !/^\d{11}$/.test(generalData.cuit.trim()),
		categoria: validationAttempted && categoryId === null,
		subcategoria: validationAttempted && Boolean(selectedCategory?.subcategorias.length) && subcategoryId === null,
		departamento: validationAttempted && !generalData.departamento,
		localidad: validationAttempted && !generalData.localidad.trim(),
		direccion: validationAttempted && !generalData.direccion.trim(),
		ubicacion: validationAttempted && !generalData.ubicacion,
	};

	const handleCategoryChange = (newCategoryId: number) => {
		const nextCategory = categories.find((item) => item.id === newCategoryId) ?? null;
		setCategoryId(newCategoryId);
		setSubcategoryId(nextCategory?.subcategorias[0]?.id ?? null);
		setForms([]);
		setAnswers({});
	};

	const scrollToTop = () => {
		window.requestAnimationFrame(() => {
			pageTopRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' });
		});
	};

	const handleNext = () => {
		if (activeStep === 0) {
			setValidationAttempted(true);
			if (
				actorType === null ||
				categoryId === null ||
				(Boolean(selectedCategory?.subcategorias.length) && subcategoryId === null) ||
				!generalData.nombre.trim() ||
				!generalData.descripcion.trim() ||
				!generalData.departamento ||
				!generalData.localidad ||
				!generalData.direccion.trim() ||
				!generalData.ubicacion ||
				(generalData.cuit.trim() !== '' && !/^\d{11}$/.test(generalData.cuit.trim()))
			) {
				scrollToTop();
				return;
			}
		}

		setActiveStep(1);
		scrollToTop();
	};

	const handleBack = () => {
		setActiveStep((step) => Math.max(step - 1, 0));
		scrollToTop();
	};

	return (
		<Box
			ref={pageTopRef}
			sx={{
				width: '100%',
				minHeight: 'calc(100vh - 64px)',
				bgcolor: 'background.default',
				px: { xs: 2, md: 3 },
				py: { xs: 2, md: 3 },
				boxSizing: 'border-box',
			}}
		>
			<Box sx={{ maxWidth: 1240, mx: 'auto' }}>
				<Stack
					direction={{ xs: 'column', md: 'row' }}
					spacing={2}
					justifyContent="space-between"
					alignItems={{ xs: 'stretch', md: 'flex-start' }}
					sx={{ mb: 3 }}
				>
					{activeStep === 0 && (
						<Box>
							<Typography variant="h4" component="h1" fontWeight={700} sx={{ mb: 0.5 }}>
								Registrar actor cultural
							</Typography>
						</Box>
					)}
				</Stack>

				<Grid container spacing={3} alignItems="flex-start">
					<Grid size={{ xs: 12 }}>
						<Stack spacing={3}>
							<Paper variant="outlined" sx={{ borderRadius: 2, p: { xs: 2, md: 3 } }}>
								{activeStep === 0 && (
									<Stack spacing={0.5} sx={{ mb: 3 }}>
										<Typography variant="h5" fontWeight={700}>
											{STEPS[0]}
										</Typography>
										<Typography variant="body2" color="text.secondary">
											{STEP_DESCRIPTIONS[0]}
										</Typography>
									</Stack>
								)}

								{activeStep === 0 && (
									<Stack spacing={2.5}>
										{catalogError && (
											<Alert severity="error" variant="outlined">
												{catalogError}
											</Alert>
										)}
										<GeneralActorFields
											actorType={actorType}
											categories={categories}
											categoryId={categoryId}
											subcategoryId={subcategoryId}
											departmentList={departmentList}
											tucumanData={tucumanData}
											catalogLoading={catalogLoading}
											value={generalData}
											errors={generalFieldErrors}
											onChange={(changes) => {
												setGeneralData((current) => ({ ...current, ...changes }));
											}}
											onActorTypeChange={setActorType}
											onCategoryChange={handleCategoryChange}
											onSubcategoryChange={setSubcategoryId}
										/>
									</Stack>
								)}
								{activeStep === 1 && (
									<CategoryForms
										categoryName={selectedCategory?.nombre ?? 'la categoría seleccionada'}
										forms={forms}
										loading={formsLoading}
										error={formsError}
										answers={answers}
										onAnswerChange={(key, value) => {
											setAnswers((current) => ({ ...current, [key]: value }));
										}}
									/>
								)}
							</Paper>

							<Stack
								direction={{ xs: 'column', sm: 'row' }}
								spacing={1}
								justifyContent="space-between"
								sx={{ pt: 1, pb: { xs: 3, md: 4 } }}
							>
								<Button
									variant="outlined"
									startIcon={<ArrowBackIcon />}
									onClick={handleBack}
									disabled={activeStep === 0}
								>
									Atrás
								</Button>
								{activeStep === 0 && (
									<Button
										variant="contained"
										endIcon={<ArrowForwardIcon />}
										onClick={handleNext}
										disabled={catalogLoading || Boolean(catalogError)}
									>
										Siguiente
									</Button>
								)}
							</Stack>
						</Stack>
					</Grid>
				</Grid>
			</Box>
		</Box>
	);
}

function GeneralActorFields({
	actorType,
	categories,
	categoryId,
	subcategoryId,
	departmentList,
	tucumanData,
	catalogLoading,
	value,
	errors,
	onChange,
	onActorTypeChange,
	onCategoryChange,
	onSubcategoryChange,
}: {
	actorType: ActorType | null;
	categories: OpcionCategoriaRegistro[];
	categoryId: number | null;
	subcategoryId: number | null;
	departmentList: string[];
	tucumanData: TucumanDataMap;
	catalogLoading: boolean;
	value: GeneralActorData;
	errors: GeneralFieldErrors;
	onChange: (changes: Partial<GeneralActorData>) => void;
	onActorTypeChange: (value: ActorType) => void;
	onCategoryChange: (value: number) => void;
	onSubcategoryChange: (value: number | null) => void;
}) {
	const availableSubcategories = categories.find((item) => item.id === categoryId)?.subcategorias ?? [];

	const handleDepartmentChange = (newDepartment: string) => {
		onChange({
			departamento: newDepartment,
			localidad: '',
			ubicacion: null,
		});
	};

	return (
		<Grid container spacing={2.5}>
			<Grid size={{ xs: 12 }}>
				<TextField
					fullWidth
					required
					label="¿Cómo se llama tu proyecto o actividad cultural?"
					placeholder="Ej. Compañía Circo Fuego"
					value={value.nombre}
					onChange={(event) => onChange({ nombre: event.target.value })}
					error={errors.nombre}
					helperText={
						errors.nombre
							? 'Ingresá el nombre de tu proyecto o actividad cultural.'
							: 'Puede ser tu nombre artístico o el de tu colectivo, espacio o institución.'
					}
				/>
			</Grid>

			<Grid size={{ xs: 12 }}>
				<Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
					¿Cómo desarrollás esta actividad?
					<RequiredAsterisk tooltipTitle="Pregunta obligatoria" />
				</Typography>
				<RadioGroup
					value={actorType ?? ''}
					onChange={(event) => onActorTypeChange(event.target.value as ActorType)}
				>
					<Grid container spacing={1.5}>
						{actorTypeOptions.map((option) => {
							const selected = actorType === option.value;

							return (
								<Grid key={option.value} size={{ xs: 12, md: 4 }}>
									<Box
										sx={{
											border: '1px solid',
											borderColor: errors.tipoActor
												? 'error.main'
												: selected
													? 'primary.main'
													: 'divider',
											borderRadius: 1,
											p: 1.5,
											bgcolor: selected ? 'action.selected' : 'transparent',
											height: '100%',
										}}
									>
										<FormControlLabel
											value={option.value}
											control={<Radio size="small" />}
											label={
												<Stack spacing={0.5}>
													<Stack direction="row" spacing={1} alignItems="center">
														{option.icon}
														<Typography variant="body2" fontWeight={700}>
															{option.label}
														</Typography>
													</Stack>
													<Typography variant="caption" color="text.secondary">
														{option.description}
													</Typography>
												</Stack>
											}
											sx={{ m: 0, alignItems: 'flex-start' }}
										/>
									</Box>
								</Grid>
							);
						})}
					</Grid>
				</RadioGroup>
				{errors.tipoActor && (
					<FormHelperText error sx={{ mt: 1 }}>
						Seleccioná cómo desarrollás esta actividad.
					</FormHelperText>
				)}
			</Grid>

			<Grid size={{ xs: 12, md: 6 }}>
				<FormControl fullWidth required error={errors.categoria}>
					<InputLabel>Sector cultural principal</InputLabel>
					<Select
						label="Sector cultural principal"
						value={categoryId ?? ''}
						onChange={(event) => onCategoryChange(Number(event.target.value))}
						disabled={catalogLoading || categories.length === 0}
					>
						{categories.map((option) => (
							<MenuItem key={option.id} value={option.id}>
								{option.nombre}
							</MenuItem>
						))}
					</Select>
					<FormHelperText>
						{errors.categoria
							? 'Seleccioná un sector cultural.'
							: 'Elegí la opción que mejor represente tu actividad.'}
					</FormHelperText>
				</FormControl>
			</Grid>

			<Grid size={{ xs: 12, md: 6 }}>
				{categoryId !== null && availableSubcategories.length > 0 ? (
					<FormControl fullWidth required error={errors.subcategoria}>
						<InputLabel>Área específica</InputLabel>
						<Select
							label="Área específica"
							value={subcategoryId ?? ''}
							onChange={(event) => onSubcategoryChange(Number(event.target.value))}
						>
							{availableSubcategories.map((option) => (
								<MenuItem key={option.id} value={option.id}>
									{option.nombre}
								</MenuItem>
							))}
						</Select>
						<FormHelperText>
							{errors.subcategoria
								? 'Seleccioná un área específica.'
								: 'Las opciones dependen del sector cultural elegido.'}
						</FormHelperText>
					</FormControl>
				) : null}
			</Grid>

			<Grid size={{ xs: 12 }}>
				<TextField
					fullWidth
					multiline
					minRows={4}
					label="Contanos brevemente sobre tu actividad cultural"
					placeholder="Qué hacés, a quién está dirigida tu propuesta y qué la distingue."
					required
					value={value.descripcion}
					onChange={(event) => onChange({ descripcion: event.target.value })}
					error={errors.descripcion}
					helperText={
						errors.descripcion
							? 'Contanos brevemente sobre tu actividad cultural.'
							: 'Esta descripción se mostrará en listados, mapas y tarjetas.'
					}
				/>
			</Grid>

			<Grid size={{ xs: 12 }}>
				<TextField
					fullWidth
					label="CUIT"
					placeholder="Ej. 20123456789"
					inputProps={{ inputMode: 'numeric', maxLength: 11 }}
					value={value.cuit}
					onChange={(event) => onChange({ cuit: event.target.value.replace(/\D/g, '') })}
					error={errors.cuit}
					helperText={
						errors.cuit
							? 'El CUIT debe tener exactamente 11 números.'
							: 'Si tu actividad cuenta con CUIT, ingresá los 11 números sin guiones (opcional).'
					}
				/>
			</Grid>

			<Grid size={{ xs: 12 }}>
				<Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
					Agregá una imagen de tu actividad cultural
				</Typography>

				<UploadBox
					icon={<AddPhotoAlternateIcon color="primary" />}
					title=""
					detail="Puede ser una foto tuya, de tu grupo, espacio, trabajo o logotipo."
					fileName={value.fotoNombre}
					previewUrl={value.fotoPreview}
					onFileSelect={(file) => {
						if (!file) {
							onChange({ fotoNombre: '', fotoPreview: '' });
							return;
						}

						const reader = new FileReader();
						reader.addEventListener('load', () => {
							onChange({ fotoNombre: file.name, fotoPreview: String(reader.result ?? '') });
						});
						reader.readAsDataURL(file);
					}}
				/>
			</Grid>

			<Grid size={{ xs: 12 }}>
				<Divider sx={{ my: 0.5 }} />
				<Stack spacing={0.5}>
					<Typography variant="h6" fontWeight={700}>
						¿En qué parte de la provincia desarrollas tu actividad?
					</Typography>
				</Stack>
			</Grid>

			<Grid size={{ xs: 12, md: 6 }}>
				<FormControl fullWidth required error={errors.departamento}>
					<InputLabel>Departamento</InputLabel>
					<Select
						label="Departamento"
						value={value.departamento}
						onChange={(event) => handleDepartmentChange(event.target.value)}
					>
						{departmentList.map((dept) => (
							<MenuItem key={dept} value={dept}>
								{dept}
							</MenuItem>
						))}
					</Select>
					{errors.departamento && <FormHelperText>Seleccioná un departamento.</FormHelperText>}
				</FormControl>
			</Grid>
			<Grid size={{ xs: 12, md: 6 }}>
				<Autocomplete
					freeSolo
					options={tucumanData[value.departamento]?.localidades ?? []}
					value={value.localidad}
					onInputChange={(_, newValue) => onChange({ localidad: newValue, ubicacion: null })}
					renderInput={(params) => (
						<TextField
							{...params}
							required
							label="Localidad"
							placeholder="Ej. San Miguel de Tucumán"
							error={errors.localidad}
							helperText={errors.localidad ? 'Ingresá o seleccioná una localidad.' : undefined}
						/>
					)}
				/>
			</Grid>

			<Grid size={{ xs: 12 }}>
				<LocationPicker
					key={`${value.departamento}-${value.localidad}`}
					department={value.departamento}
					locality={value.localidad}
					address={value.direccion}
					point={value.ubicacion}
					addressError={errors.direccion}
					pointError={errors.ubicacion}
					tucumanData={tucumanData}
					onAddressChange={(direccion) => onChange({ direccion })}
					onPointChange={(ubicacion) => onChange({ ubicacion })}
				/>
			</Grid>

			<Grid size={{ xs: 12 }}>
				<Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
					¿Querés que esta ubicación aparezca en el mapa público?
				</Typography>
				<RadioGroup
					value={value.ubicacionPublica ? 'si' : 'no'}
					onChange={(event) => onChange({ ubicacionPublica: event.target.value === 'si' })}
				>
					<FormControlLabel value="si" control={<Radio size="small" />} label="Sí, mostrarla públicamente" />
					<FormControlLabel value="no" control={<Radio size="small" />} label="No, mantenerla privada" />
				</RadioGroup>
				<Typography variant="caption" color="text.secondary">
					La administración podrá consultar la ubicación para validar el registro, aunque decidas no
					publicarla.
				</Typography>
			</Grid>
		</Grid>
	);
}

function CategoryForms({
	categoryName,
	forms,
	loading,
	error,
	answers,
	onAnswerChange,
}: {
	categoryName: string;
	forms: FormularioAplicable[];
	loading: boolean;
	error: string;
	answers: Record<string, FormAnswer>;
	onAnswerChange: (key: string, value: FormAnswer) => void;
}) {
	const orderedForms = [...forms].sort((left, right) => {
		if (left.ambito === right.ambito) return left.id - right.id;
		return left.ambito === 'CATEGORIA' ? -1 : 1;
	});

	if (loading) {
		return (
			<Stack alignItems="center" spacing={1.5} sx={{ py: 6 }}>
				<CircularProgress size={32} />
				<Typography color="text.secondary">Cargando preguntas de {categoryName}…</Typography>
			</Stack>
		);
	}

	if (error) {
		return (
			<Alert severity="error" variant="outlined">
				{error}
			</Alert>
		);
	}

	if (forms.length === 0) {
		return (
			<Alert severity="info" variant="outlined">
				No hay un formulario configurado para {categoryName}. Podés volver atrás y elegir otra categoría.
			</Alert>
		);
	}

	return (
		<Stack spacing={3}>
			{orderedForms.map((form, index) => (
				<Box key={form.id}>
					{index > 0 && <Divider sx={{ mb: 3 }} />}
					<Stack spacing={0.5} sx={{ mb: 2.5 }}>
						<Typography
							variant={index === 0 ? 'h4' : 'h5'}
							component={index === 0 ? 'h1' : 'h2'}
							fontWeight={700}
						>
							{form.titulo}
						</Typography>
						{form.descripcion && <Typography color="text.secondary">{form.descripcion}</Typography>}
					</Stack>
					{form.preguntas.length === 0 ? (
						<Typography variant="body2" color="text.secondary">
							Este formulario no tiene preguntas activas.
						</Typography>
					) : (
						<Stack spacing={2.5}>
							{form.preguntas.map((question) => {
								const key = `${form.id}:${question.id}`;
								return (
									<QuestionField
										key={key}
										question={question}
										value={answers[key] ?? (question.tipoDato === 'OPCION_MULTIPLE' ? [] : '')}
										onChange={(value) => onAnswerChange(key, value)}
									/>
								);
							})}
						</Stack>
					)}
				</Box>
			))}
		</Stack>
	);
}

function QuestionField({
	question,
	value,
	onChange,
}: {
	question: PreguntaFormularioAplicable;
	value: FormAnswer;
	onChange: (value: FormAnswer) => void;
}) {
	const label = question.pregunta;

	if (question.tipoDato === 'BOOLEANO') {
		return (
			<Stack spacing={1}>
				<QuestionHeading question={question} />
				<RadioGroup
					row
					aria-label={label}
					value={typeof value === 'string' ? value : ''}
					onChange={(event) => onChange(event.target.value)}
				>
					<FormControlLabel value="true" control={<Radio size="small" />} label="Sí" />
					<FormControlLabel value="false" control={<Radio size="small" />} label="No" />
				</RadioGroup>
			</Stack>
		);
	}

	if (question.tipoDato === 'OPCION_UNICA') {
		return (
			<Stack spacing={1}>
				<QuestionHeading question={question} />
				<FormControl fullWidth required={question.esObligatorio}>
					<Select
						displayEmpty
						value={typeof value === 'string' ? value : ''}
						onChange={(event) => onChange(event.target.value)}
						inputProps={{ 'aria-label': label }}
					>
						<MenuItem value="" disabled>
							Seleccioná una opción
						</MenuItem>
						{question.opciones?.map((option) => (
							<MenuItem key={option} value={option}>
								{option}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</Stack>
		);
	}

	if (question.tipoDato === 'OPCION_MULTIPLE') {
		const selected = Array.isArray(value) ? value : [];
		return (
			<Stack spacing={1}>
				<QuestionHeading question={question} />
				<FormGroup aria-label={label}>
					{question.opciones?.map((option) => (
						<FormControlLabel
							key={option}
							label={option}
							control={
								<Checkbox
									checked={selected.includes(option)}
									onChange={(event) =>
										onChange(
											event.target.checked
												? [...selected, option]
												: selected.filter((item) => item !== option),
										)
									}
								/>
							}
						/>
					))}
				</FormGroup>
			</Stack>
		);
	}

	const inputType: Record<string, string> = {
		NUMERO: 'number',
		FECHA: 'date',
		URL: 'url',
		EMAIL: 'email',
		TELEFONO: 'tel',
	};

	return (
		<Stack spacing={1}>
			<QuestionHeading question={question} />
			<TextField
				fullWidth
				required={question.esObligatorio}
				type={inputType[question.tipoDato] ?? 'text'}
				placeholder={question.tipoDato === 'FECHA' ? undefined : 'Ingresá tu respuesta'}
				value={typeof value === 'string' ? value : ''}
				onChange={(event) => onChange(event.target.value)}
				slotProps={{ htmlInput: { 'aria-label': label } }}
			/>
		</Stack>
	);
}

function QuestionHeading({ question }: { question: PreguntaFormularioAplicable }) {
	return (
		<Stack
			direction={{ xs: 'column', sm: 'row' }}
			spacing={1}
			alignItems={{ xs: 'flex-start', sm: 'center' }}
			justifyContent="space-between"
		>
			<Typography variant="subtitle2" fontWeight={700}>
				{question.pregunta}
				{question.esObligatorio && <RequiredAsterisk tooltipTitle="Pregunta obligatoria" />}
			</Typography>
			{question.esPublico && (
				<Tooltip title="Esta respuesta podrá mostrarse en el perfil público del actor cultural." arrow>
					<Chip
						size="small"
						variant="outlined"
						color="success"
						icon={<PublicIcon />}
						label="Respuesta pública"
						tabIndex={0}
						sx={{ cursor: 'help' }}
					/>
				</Tooltip>
			)}
		</Stack>
	);
}

const customPinIcon = L.divIcon({
	className: 'custom-map-pin',
	html: `<div style="
		background-color: #d32f2f;
		width: 32px;
		height: 32px;
		border-radius: 50% 50% 50% 0;
		transform: rotate(-45deg);
		display: flex;
		align-items: center;
		justify-content: center;
		border: 3px solid #ffffff;
		box-shadow: 0 4px 10px rgba(0,0,0,0.4);
		cursor: grab;
	">
		<div style="
			width: 10px;
			height: 10px;
			background-color: #ffffff;
			border-radius: 50%;
			transform: rotate(45deg);
		"></div>
	</div>`,
	iconSize: [32, 32],
	iconAnchor: [16, 32],
	popupAnchor: [0, -32],
});

function MapDepartmentCenterer({
	department,
	locality,
	point,
	tucumanData,
}: {
	department: string;
	locality: string;
	point: MapPoint | null;
	tucumanData: TucumanDataMap;
}) {
	const map = useMap();

	useEffect(() => {
		if (point) return;

		const deptInfo = tucumanData[department];
		if (deptInfo?.centroide) {
			const coords: [number, number] = [deptInfo.centroide.lat, deptInfo.centroide.lon];
			const targetZoom = locality ? 13 : 11;
			map.flyTo(coords, targetZoom, { duration: 0.8 });
		}
	}, [map, department, locality, point, tucumanData]);

	return null;
}

function MapClickHandler({ onPointChange }: { onPointChange: (point: MapPoint) => void }) {
	useMapEvents({
		click: (event: LeafletMouseEvent) => {
			onPointChange({ lat: event.latlng.lat, lng: event.latlng.lng });
		},
	});

	return null;
}

function MapPointFocuser({ point }: { point: MapPoint | null }) {
	const map = useMap();

	useEffect(() => {
		if (point) {
			map.flyTo([point.lat, point.lng], 16, { duration: 0.8 });
		}
	}, [map, point]);

	return null;
}

function LocationPicker({
	department,
	locality,
	address,
	point,
	addressError,
	pointError,
	tucumanData,
	onAddressChange,
	onPointChange,
}: {
	department: string;
	locality: string;
	address: string;
	point: MapPoint | null;
	addressError: boolean;
	pointError: boolean;
	tucumanData: TucumanDataMap;
	onAddressChange: (address: string) => void;
	onPointChange: (point: MapPoint | null) => void;
}) {
	const [resolvedAddress, setResolvedAddress] = useState('');
	const [isSearching, setIsSearching] = useState(false);
	const [isLocating, setIsLocating] = useState(false);
	const [searchError, setSearchError] = useState('');
	const [locationError, setLocationError] = useState('');
	const [mapLayer, setMapLayer] = useState<'streets' | 'satellite'>('streets');

	const deptCentroide = tucumanData[department]?.centroide;
	const initialCenter: [number, number] = deptCentroide
		? [deptCentroide.lat, deptCentroide.lon]
		: [-26.8241, -65.2226];

	const searchAddress = async () => {
		const trimmedAddress = address.trim();
		if (!trimmedAddress || isSearching) return;

		setIsSearching(true);
		setSearchError('');
		setLocationError('');

		try {
			const query = `${trimmedAddress}, ${locality}, ${department}, Tucumán, Argentina`;
			const params = new URLSearchParams({
				q: query,
				format: 'jsonv2',
				limit: '1',
				countrycodes: 'ar',
				'accept-language': 'es',
				viewbox: '-66.35,-25.75,-64.45,-27.95',
				bounded: '1',
			});
			const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`);
			if (!response.ok) throw new Error('No se pudo consultar el servicio de direcciones.');

			const results = (await response.json()) as Array<{ lat: string; lon: string; display_name: string }>;
			const result = results[0];
			if (!result) {
				setSearchError(
					'No encontramos esa dirección o referencia. Podés conservar el texto y señalar el punto en el mapa.',
				);
				return;
			}

			const nextPoint = { lat: Number(result.lat), lng: Number(result.lon) };
			onPointChange(nextPoint);
			setResolvedAddress(result.display_name);
		} catch {
			setSearchError('No pudimos buscar la dirección en este momento. Intentá nuevamente.');
		} finally {
			setIsSearching(false);
		}
	};

	const useCurrentLocation = () => {
		setLocationError('');
		setSearchError('');
		setResolvedAddress('');

		if (!navigator.geolocation) {
			setLocationError('Tu navegador no permite obtener la ubicación actual. Podés marcarla en el mapa.');
			return;
		}

		setIsLocating(true);
		navigator.geolocation.getCurrentPosition(
			(position) => {
				const nextPoint = { lat: position.coords.latitude, lng: position.coords.longitude };
				const isInsideTucuman =
					nextPoint.lat >= -27.95 &&
					nextPoint.lat <= -25.75 &&
					nextPoint.lng >= -66.35 &&
					nextPoint.lng <= -64.45;

				if (!isInsideTucuman) {
					setLocationError(
						'La ubicación obtenida está fuera de Tucumán. Buscá una referencia o marcá el punto.',
					);
					setIsLocating(false);
					return;
				}

				onPointChange(nextPoint);
				setIsLocating(false);
			},
			(error) => {
				setLocationError(
					error.code === error.PERMISSION_DENIED
						? 'No diste permiso para usar tu ubicación. Podés buscar una referencia o marcarla en el mapa.'
						: 'No pudimos obtener tu ubicación actual. Podés buscar una referencia o marcarla en el mapa.',
				);
				setIsLocating(false);
			},
			{ enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
		);
	};

	const handleManualPointChange = (nextPoint: MapPoint) => {
		onPointChange(nextPoint);
		setResolvedAddress('');
		setSearchError('');
		setLocationError('');
	};

	const clearPoint = () => {
		onPointChange(null);
		setResolvedAddress('');
		setSearchError('');
		setLocationError('');
	};

	return (
		<Stack spacing={1}>
			<Box>
				<Typography variant="subtitle2" fontWeight={700}>
					Indicá la dirección o referencia <RequiredAsterisk />
				</Typography>
				<Typography variant="body2" color="text.secondary">
					Podés buscarla, usar tu ubicación actual o marcar directamente el punto en el mapa.
				</Typography>
			</Box>

			<TextField
				fullWidth
				required
				label="Dirección o referencia"
				placeholder="Ej. San Martín 450, plaza principal o paraje El Cadillal"
				value={address}
				onChange={(event) => {
					onAddressChange(event.target.value);
					setResolvedAddress('');
					setSearchError('');
				}}
				onKeyDown={(event) => {
					if (event.key === 'Enter') {
						event.preventDefault();
						void searchAddress();
					}
				}}
				error={addressError || Boolean(searchError)}
				helperText={
					addressError
						? 'Ingresá una dirección o una referencia para identificar el lugar.'
						: searchError || 'Este texto se guardará como dirección, aunque sea una referencia aproximada.'
				}
			/>

			<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
				<Button
					variant="contained"
					startIcon={<SearchIcon />}
					disabled={!address.trim() || isSearching}
					onClick={() => void searchAddress()}
					sx={{ minWidth: 190 }}
				>
					{isSearching ? 'Buscando…' : 'Buscar en el mapa'}
				</Button>
				<Button
					variant="outlined"
					startIcon={<MyLocationIcon />}
					disabled={isLocating}
					onClick={useCurrentLocation}
				>
					{isLocating ? 'Obteniendo ubicación…' : 'Usar mi ubicación actual'}
				</Button>
				{point && (
					<Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={clearPoint}>
						Limpiar punto
					</Button>
				)}
			</Stack>

			{locationError && (
				<Alert severity="info" variant="outlined">
					{locationError}
				</Alert>
			)}

			<Box
				sx={{
					position: 'relative',
					height: { xs: 320, md: 400 },
					border: '1px solid',
					borderColor: pointError ? 'error.main' : point ? 'success.main' : 'divider',
					borderWidth: pointError ? 2 : 1,
					borderRadius: 1,
					overflow: 'hidden',
					'& .leaflet-container': { cursor: 'crosshair' },
				}}
			>
				<Stack
					direction="row"
					spacing={0.5}
					sx={{
						position: 'absolute',
						top: 10,
						right: 10,
						zIndex: 1000,
						bgcolor: 'background.paper',
						borderRadius: 1,
						p: 0.5,
						boxShadow: 2,
					}}
				>
					<Button
						size="small"
						variant={mapLayer === 'streets' ? 'contained' : 'text'}
						onClick={() => setMapLayer('streets')}
						startIcon={<MapIcon />}
						sx={{ py: 0.25, px: 1, fontSize: '0.75rem' }}
					>
						Mapa
					</Button>
					<Button
						size="small"
						variant={mapLayer === 'satellite' ? 'contained' : 'text'}
						onClick={() => setMapLayer('satellite')}
						startIcon={<SatelliteAltIcon />}
						sx={{ py: 0.25, px: 1, fontSize: '0.75rem' }}
					>
						Satelital
					</Button>
				</Stack>

				<MapContainer
					center={initialCenter}
					zoom={locality ? 13 : department ? 11 : 8}
					minZoom={7}
					maxBounds={[
						[-27.95, -66.35],
						[-25.75, -64.45],
					]}
					maxBoundsViscosity={0.8}
					style={{ height: '100%', width: '100%' }}
				>
					{mapLayer === 'streets' ? (
						<TileLayer
							attribution='<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
							url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						/>
					) : (
						<TileLayer
							attribution="Esri, TomTom, Garmin, FAO, NOAA, USGS, and the GIS User Community"
							url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
						/>
					)}
					<MapDepartmentCenterer
						department={department}
						locality={locality}
						point={point}
						tucumanData={tucumanData}
					/>
					<MapClickHandler onPointChange={handleManualPointChange} />
					<MapPointFocuser point={point} />
					{point && (
						<Marker
							position={[point.lat, point.lng]}
							icon={customPinIcon}
							draggable={true}
							eventHandlers={{
								dragend: (event) => {
									const marker = event.target as L.Marker;
									const pos = marker.getLatLng();
									handleManualPointChange({ lat: pos.lat, lng: pos.lng });
								},
							}}
						/>
					)}
				</MapContainer>
			</Box>

			<Alert
				severity={pointError ? 'error' : point ? 'success' : 'warning'}
				variant="outlined"
				icon={<LocationOnIcon />}
			>
				{point
					? `${address.trim() ? 'Ubicación lista. Se guardarán la dirección o referencia, la latitud y la longitud. Podés arrastrar el marcador para afinar la ubicación.' : 'El punto está seleccionado. Completá una dirección o referencia para poder guardar.'}${resolvedAddress ? ` Resultado encontrado: ${resolvedAddress}` : ''}`
					: pointError
						? 'Seleccioná una ubicación buscando una referencia, usando tu ubicación actual o señalando el punto en el mapa.'
						: 'Buscá una dirección o referencia, usá tu ubicación actual o señalá el punto en el mapa.'}
			</Alert>
		</Stack>
	);
}

function UploadBox({
	icon,
	title,
	detail,
	fileName,
	previewUrl,
	onFileSelect,
	maxSizeMB = 5,
}: {
	icon: ReactNode;
	title: string;
	detail: string;
	fileName?: string;
	previewUrl?: string;
	onFileSelect?: (file: File | null) => void;
	maxSizeMB?: number;
}) {
	const [fileError, setFileError] = useState<string | null>(null);

	const handleFileChange = (file: File | null) => {
		if (!file) {
			setFileError(null);
			onFileSelect?.(null);
			return;
		}

		const maxSizeBytes = maxSizeMB * 1024 * 1024;
		if (file.size > maxSizeBytes) {
			const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
			setFileError(
				`La imagen seleccionada pesa ${sizeInMB} MB. El tamaño máximo permitido es de ${maxSizeMB} MB.`,
			);
			onFileSelect?.(null);
			return;
		}

		setFileError(null);
		onFileSelect?.(file);
	};

	return (
		<Box>
			<Box
				sx={{
					border: '1px dashed',
					borderColor: fileError ? 'error.main' : 'primary.main',
					borderRadius: 1,
					p: 2,
					minHeight: 140,
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
					textAlign: 'center',
					bgcolor: 'action.hover',
				}}
			>
				{previewUrl ? (
					<Box
						component="img"
						src={previewUrl}
						alt="Vista previa de la imagen seleccionada"
						sx={{ width: 88, height: 88, objectFit: 'cover', borderRadius: 1 }}
					/>
				) : (
					icon
				)}
				<Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1 }}>
					{title}
				</Typography>
				<Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
					{fileName || detail} (Máximo {maxSizeMB} MB)
				</Typography>
				<Button component="label" size="small" variant="outlined" startIcon={<CloudUploadIcon />}>
					{fileName ? 'Cambiar imagen' : 'Adjuntar'}
					<input
						hidden
						type="file"
						accept="image/png,image/jpeg,image/webp"
						onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
					/>
				</Button>
			</Box>
			{fileError && (
				<Alert severity="error" variant="outlined" sx={{ mt: 1 }}>
					{fileError}
				</Alert>
			)}
		</Box>
	);
}
