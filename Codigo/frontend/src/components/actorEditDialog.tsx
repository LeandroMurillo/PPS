import * as React from 'react';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ClearIcon from '@mui/icons-material/Clear';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import PublicIcon from '@mui/icons-material/Public';
import QuizIcon from '@mui/icons-material/Quiz';
import SearchIcon from '@mui/icons-material/Search';
import ShieldIcon from '@mui/icons-material/Shield';
import TuneIcon from '@mui/icons-material/Tune';
import {
	Alert,
	Autocomplete,
	Box,
	Button,
	Checkbox,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
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
	Tab,
	Tabs,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material';
import type { LeafletMouseEvent } from 'leaflet';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
// @ts-ignore
import 'leaflet/dist/leaflet.css';

import { PortfolioMapControls } from './actorPortfolioView';
import RequiredAsterisk from './requiredAsterisk';
import {
	editarMiActorApi,
	obtenerFormulariosActorApi,
	obtenerFormulariosAplicablesApi,
	obtenerOpcionesRegistroApi,
	type FormularioActor,
	type OpcionCategoriaRegistro,
	type PreguntaFormularioActor,
} from '../api/actores';
import { DEPARTAMENTOS_TUCUMAN } from '../constants/departamentos';
import { TIPO_ACTOR_LABELS as typeLabels } from '../constants/estados';
import { useAuth } from '../context/AuthContext';
import { fileToBase64, validateImageFile } from '../utils/file';
import { notify } from '../utils/toast';
import type { MyActor } from '../pages/misActores';

type TucumanDataMap = Record<
	string,
	{
		centroide: { lat: number; lon: number };
		localidades: string[];
	}
>;

type MapPoint = { lat: number; lng: number };

function normalizeCatalogName(value: string): string {
	return value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.trim()
		.toLocaleLowerCase('es');
}

function findCategoryByName(options: OpcionCategoriaRegistro[], categoryName: string) {
	const normalizedName = normalizeCatalogName(categoryName);
	return options.find((category) => normalizeCatalogName(category.nombre) === normalizedName) ?? null;
}

function getCategoryIdByName(options: OpcionCategoriaRegistro[], categoryName: string): number | undefined {
	return findCategoryByName(options, categoryName)?.id;
}

function getSubcategoryIdByName(
	options: OpcionCategoriaRegistro[],
	categoryName: string,
	subcategoryName?: string | null,
): number | null {
	if (!subcategoryName) return null;
	const category = findCategoryByName(options, categoryName);
	const normalizedName = normalizeCatalogName(subcategoryName);
	return (
		category?.subcategorias.find((subcategory) => normalizeCatalogName(subcategory.nombre) === normalizedName)
			?.id ?? null
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

	React.useEffect(() => {
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

	React.useEffect(() => {
		if (point) {
			map.flyTo([point.lat, point.lng], 16, { duration: 0.8 });
		}
	}, [map, point]);

	return null;
}

function InvalidateMapSize() {
	const map = useMap();
	React.useEffect(() => {
		const timer = setTimeout(() => {
			map.invalidateSize();
		}, 150);
		return () => clearTimeout(timer);
	}, [map]);
	return null;
}

function QuestionHeading({
	question,
	hasError = false,
	isNew = false,
}: {
	question: PreguntaFormularioActor;
	hasError?: boolean;
	isNew?: boolean;
}) {
	return (
		<Stack
			direction={{ xs: 'column', sm: 'row' }}
			spacing={1}
			alignItems={{ xs: 'flex-start', sm: 'center' }}
			justifyContent="space-between"
		>
			<Typography
				variant="subtitle2"
				fontWeight={600}
				color={hasError ? 'error.main' : 'text.primary'}
				sx={{ transition: 'color 0.2s ease' }}
			>
				{question.pregunta}
				{question.esObligatorio && <RequiredAsterisk tooltipTitle="Pregunta obligatoria" />}
			</Typography>
			<Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap sx={{ gap: 0.5 }}>
				{isNew && (
					<Tooltip title="Pregunta nueva: incorporada al catálogo del sector." arrow>
						<Chip
							size="small"
							color="info"
							variant="outlined"
							label="Nueva"
							sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }}
						/>
					</Tooltip>
				)}
				{question.esObligatorio && (
					<Chip
						size="small"
						color="warning"
						variant="outlined"
						label="Obligatoria"
						sx={{ height: 22, fontSize: '0.7rem' }}
					/>
				)}
				{question.esPublico ? (
					<Tooltip title="Esta respuesta podrá mostrarse en el perfil público del actor cultural." arrow>
						<Chip
							size="small"
							variant="outlined"
							color="success"
							icon={<PublicIcon sx={{ fontSize: 14 }} />}
							label="Pública"
							sx={{ height: 22, fontSize: '0.7rem' }}
						/>
					</Tooltip>
				) : (
					<Tooltip title="Esta respuesta solo es visible para moderación y administración." arrow>
						<Chip
							size="small"
							variant="outlined"
							color="default"
							label="Interna"
							sx={{ height: 22, fontSize: '0.7rem' }}
						/>
					</Tooltip>
				)}
			</Stack>
		</Stack>
	);
}

function QuestionField({
	question,
	value,
	hasError = false,
	isNew = false,
	onChange,
}: {
	question: PreguntaFormularioActor;
	value: string | string[];
	hasError?: boolean;
	isNew?: boolean;
	onChange: (value: string | string[]) => void;
}) {
	const label = question.pregunta;

	if (question.tipoDato === 'BOOLEANO') {
		return (
			<FormControl error={hasError} component="fieldset" fullWidth>
				<Stack spacing={1}>
					<QuestionHeading question={question} hasError={hasError} isNew={isNew} />
					<RadioGroup
						row
						aria-label={label}
						value={typeof value === 'string' ? value : ''}
						onChange={(event) => onChange(event.target.value)}
					>
						<FormControlLabel
							value="true"
							control={<Radio size="small" color={hasError ? 'error' : 'primary'} />}
							label="Sí"
						/>
						<FormControlLabel
							value="false"
							control={<Radio size="small" color={hasError ? 'error' : 'primary'} />}
							label="No"
						/>
					</RadioGroup>
					{hasError && <FormHelperText error>Esta pregunta es obligatoria.</FormHelperText>}
				</Stack>
			</FormControl>
		);
	}

	if (question.tipoDato === 'OPCION_UNICA') {
		return (
			<FormControl fullWidth required={question.esObligatorio} error={hasError}>
				<Stack spacing={1}>
					<QuestionHeading question={question} hasError={hasError} isNew={isNew} />
					<Select
						displayEmpty
						error={hasError}
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
					{hasError && <FormHelperText error>Seleccioná una opción.</FormHelperText>}
				</Stack>
			</FormControl>
		);
	}

	if (question.tipoDato === 'OPCION_MULTIPLE') {
		const selected = Array.isArray(value) ? value : [];
		return (
			<FormControl error={hasError} component="fieldset" fullWidth>
				<Stack spacing={1}>
					<QuestionHeading question={question} hasError={hasError} isNew={isNew} />
					<FormGroup aria-label={label}>
						{question.opciones?.map((option) => (
							<FormControlLabel
								key={option}
								label={option}
								control={
									<Checkbox
										checked={selected.includes(option)}
										color={hasError ? 'error' : 'primary'}
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
					{hasError && <FormHelperText error>Seleccioná al menos una opción.</FormHelperText>}
				</Stack>
			</FormControl>
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
			<QuestionHeading question={question} hasError={hasError} isNew={isNew} />
			<TextField
				fullWidth
				required={question.esObligatorio}
				error={hasError}
				helperText={hasError ? 'Esta pregunta es obligatoria.' : undefined}
				type={inputType[question.tipoDato] ?? 'text'}
				placeholder={question.tipoDato === 'FECHA' ? undefined : 'Ingresá tu respuesta'}
				value={typeof value === 'string' ? value : ''}
				onChange={(event) => onChange(event.target.value)}
			/>
		</Stack>
	);
}

type Props = {
	open: boolean;
	actor: MyActor | null;
	categoryOptions?: OpcionCategoriaRegistro[];
	onClose: () => void;
	onActorUpdated?: (updatedActor: MyActor) => void;
};

export default function ActorEditDialog({
	open,
	actor,
	categoryOptions: propCategoryOptions,
	onClose,
	onActorUpdated,
}: Props) {
	const { user } = useAuth();
	const isAdminOrMod = user?.rol === 'ADMIN' || user?.rol === 'MODERADOR';

	const [loadedCategoryOptions, setLoadedCategoryOptions] = React.useState<OpcionCategoriaRegistro[]>([]);
	const categoryOptions =
		propCategoryOptions && propCategoryOptions.length > 0 ? propCategoryOptions : loadedCategoryOptions;

	const [editActiveTab, setEditActiveTab] = React.useState<number>(0);
	const [editValidationAttempted, setEditValidationAttempted] = React.useState<boolean>(false);
	const [editForms, setEditForms] = React.useState<FormularioActor[]>([]);
	const [editFormsLoading, setEditFormsLoading] = React.useState<boolean>(false);
	const [editFormAnswers, setEditFormAnswers] = React.useState<Record<string, string | string[]>>({});
	const [tucumanData, setTucumanData] = React.useState<TucumanDataMap>({});
	const [editMapLayer, setEditMapLayer] = React.useState<'streets' | 'satellite'>('streets');
	const [isSearchingAddress, setIsSearchingAddress] = React.useState(false);
	const [searchAddressError, setSearchAddressError] = React.useState<string | null>(null);
	const [isLocatingUser, setIsLocatingUser] = React.useState(false);
	const [editConfirmModalOpen, setEditConfirmModalOpen] = React.useState(false);

	const initialEditSnapshot = React.useRef<{
		nombre: string;
		tipoActor: MyActor['tipoActor'];
		departamento: string;
		localidad: string;
		direccion: string;
		latitud: number | null;
		longitud: number | null;
		esPublica: boolean;
		cuit: string;
		descripcion: string;
		fotoPerfilUrl: string;
		fotoPerfilBase64: string;
		respuestas: Record<string, string | string[]>;
	} | null>(null);

	const [formValues, setFormValues] = React.useState<{
		nombre: string;
		tipoActor: MyActor['tipoActor'];
		categoria: string;
		subcategoria: string;
		departamento: string;
		localidad: string;
		direccion: string;
		latitud: number | null;
		longitud: number | null;
		esPublica: boolean;
		cuit: string;
		descripcion: string;
		fotoPerfilUrl: string;
		fotoPerfilBase64: string;
		fotoPerfilNombre: string;
	}>({
		nombre: '',
		tipoActor: 'INDIVIDUO',
		categoria: '',
		subcategoria: '',
		departamento: 'Capital',
		localidad: 'San Miguel de Tucumán',
		direccion: '',
		latitud: -26.8241,
		longitud: -65.2226,
		esPublica: true,
		cuit: '',
		descripcion: '',
		fotoPerfilUrl: '',
		fotoPerfilBase64: '',
		fotoPerfilNombre: '',
	});
	const [profileImageError, setProfileImageError] = React.useState<string | null>(null);
	const [profileImageDragging, setProfileImageDragging] = React.useState(false);

	// Load options and tucuman data
	React.useEffect(() => {
		if (!propCategoryOptions || propCategoryOptions.length === 0) {
			const controller = new AbortController();
			obtenerOpcionesRegistroApi(controller.signal)
				.then((res) => setLoadedCategoryOptions(res.data))
				.catch(() => {});
			return () => controller.abort();
		}
	}, [propCategoryOptions]);

	React.useEffect(() => {
		const controller = new AbortController();
		fetch('/data/tucuman_departamentos.json', { signal: controller.signal })
			.then((res) => res.json())
			.then((data: TucumanDataMap) => setTucumanData(data))
			.catch(() => {});
		return () => controller.abort();
	}, []);

	// Initialize form on actor change / open
	React.useEffect(() => {
		if (!open || !actor) return;

		setEditActiveTab(0);
		setEditValidationAttempted(false);
		setEditFormsLoading(true);
		setEditForms([]);
		setEditFormAnswers({});
		setSearchAddressError(null);
		setProfileImageError(null);

		const category = findCategoryByName(categoryOptions, actor.categoria);
		const cat = category?.nombre ?? actor.categoria;
		const sub = actor.subcategoria
			? (category?.subcategorias.find(
					(option) => normalizeCatalogName(option.nombre) === normalizeCatalogName(actor.subcategoria ?? ''),
				)?.nombre ?? actor.subcategoria)
			: '';

		const initialValues = {
			nombre: actor.nombre,
			tipoActor: actor.tipoActor,
			categoria: cat,
			subcategoria: sub,
			departamento: actor.departamento || 'Capital',
			localidad: actor.localidad || 'San Miguel de Tucumán',
			direccion: actor.direccion || '',
			latitud: actor.latitud ?? -26.8241,
			longitud: actor.longitud ?? -65.2226,
			esPublica: actor.esPublica ?? true,
			cuit: actor.cuit || '',
			descripcion: actor.descripcion,
			fotoPerfilUrl: actor.fotoPerfilUrl || '',
			fotoPerfilBase64: '',
			fotoPerfilNombre: '',
		};

		setFormValues(initialValues);
		initialEditSnapshot.current = {
			...initialValues,
			respuestas: {},
		};

		// Cargar formularios y respuestas existentes del actor
		obtenerFormulariosActorApi(actor.id)
			.then((res) => {
				setEditForms(res.data);
				const initialAnswers: Record<string, string | string[]> = {};
				for (const form of res.data) {
					const formId = form.id ?? form.idFormulario;
					for (const q of form.preguntas) {
						const qId = q.id ?? q.idPregunta;
						const key = `${formId}:${qId}`;
						if (q.valor !== null && q.valor !== undefined) {
							initialAnswers[key] = q.valor as string | string[];
						}
					}
				}
				setEditFormAnswers(initialAnswers);
				if (initialEditSnapshot.current) {
					initialEditSnapshot.current.respuestas = { ...initialAnswers };
				}
			})
			.catch(() => {
				const catId = getCategoryIdByName(categoryOptions, cat);
				if (catId) {
					const subId = getSubcategoryIdByName(categoryOptions, cat, sub);
					obtenerFormulariosAplicablesApi({ idCategoria: catId, idSubcategoria: subId })
						.then((res) => setEditForms(res.data))
						.catch(() => {});
				}
			})
			.finally(() => {
				setEditFormsLoading(false);
			});
	}, [open, actor, categoryOptions]);

	const selectedEditCategory = React.useMemo(
		() => findCategoryByName(categoryOptions, formValues.categoria),
		[categoryOptions, formValues.categoria],
	);

	const hasChanges = React.useMemo(() => {
		if (!initialEditSnapshot.current) return false;
		const init = initialEditSnapshot.current;

		if (formValues.nombre.trim() !== init.nombre.trim()) return true;
		if (formValues.tipoActor !== init.tipoActor) return true;
		if (formValues.departamento !== init.departamento) return true;
		if (formValues.localidad.trim() !== init.localidad.trim()) return true;
		if (formValues.direccion.trim() !== init.direccion.trim()) return true;
		if (
			formValues.latitud !== null &&
			init.latitud !== null &&
			Number(formValues.latitud.toFixed(5)) !== Number(init.latitud.toFixed(5))
		)
			return true;
		if (
			formValues.longitud !== null &&
			init.longitud !== null &&
			Number(formValues.longitud.toFixed(5)) !== Number(init.longitud.toFixed(5))
		)
			return true;
		if (formValues.esPublica !== init.esPublica) return true;
		if (formValues.cuit.trim() !== init.cuit.trim()) return true;
		if (formValues.descripcion.trim() !== init.descripcion.trim()) return true;
		if (formValues.fotoPerfilBase64) return true;
		if (formValues.fotoPerfilUrl.trim() !== init.fotoPerfilUrl.trim()) return true;

		// Compare responses
		const allKeys = new Set([...Object.keys(init.respuestas), ...Object.keys(editFormAnswers)]);
		for (const key of allKeys) {
			const v1 = init.respuestas[key];
			const v2 = editFormAnswers[key];
			const normalizeVal = (val: unknown) =>
				Array.isArray(val) ? [...val].map(String).sort().join(',') : String(val ?? '').trim();
			if (normalizeVal(v1) !== normalizeVal(v2)) return true;
		}

		return false;
	}, [formValues, editFormAnswers]);

	const handleSearchAddress = async () => {
		const trimmed = formValues.direccion.trim();
		if (!trimmed || isSearchingAddress) return;
		setIsSearchingAddress(true);
		setSearchAddressError(null);

		try {
			const query = `${trimmed}, ${formValues.localidad}, ${formValues.departamento}, Tucumán, Argentina`;
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
			if (!response.ok) throw new Error('No se pudo consultar el servicio de geocodificación.');

			const results = (await response.json()) as Array<{ lat: string; lon: string; display_name: string }>;
			const result = results[0];
			if (!result) {
				const msg =
					'No encontramos esa dirección exacta. Podés conservar el texto y señalar el punto en el mapa.';
				setSearchAddressError(msg);
				notify.error(msg, { scope: 'actor-edit' });
				return;
			}

			setFormValues((v) => ({
				...v,
				latitud: Number(result.lat),
				longitud: Number(result.lon),
			}));
			notify.success('Ubicación encontrada en el mapa.', { scope: 'actor-edit' });
		} catch {
			const msg = 'No se pudo realizar la búsqueda en el mapa en este momento.';
			setSearchAddressError(msg);
			notify.error(msg, { scope: 'actor-edit' });
		} finally {
			setIsSearchingAddress(false);
		}
	};

	const handleUseCurrentLocation = () => {
		setSearchAddressError(null);
		if (!navigator.geolocation) {
			const msg = 'Tu navegador no permite obtener la ubicación actual.';
			setSearchAddressError(msg);
			notify.error(msg, { scope: 'actor-edit' });
			return;
		}

		setIsLocatingUser(true);
		navigator.geolocation.getCurrentPosition(
			(position) => {
				const lat = position.coords.latitude;
				const lng = position.coords.longitude;
				const isInsideTucuman = lat >= -27.95 && lat <= -25.75 && lng >= -66.35 && lng <= -64.45;

				if (!isInsideTucuman) {
					const msg = 'La ubicación detectada se encuentra fuera de Tucumán.';
					setSearchAddressError(msg);
					notify.error(msg, { scope: 'actor-edit' });
					setIsLocatingUser(false);
					return;
				}

				setFormValues((v) => ({
					...v,
					latitud: lat,
					longitud: lng,
				}));
				notify.success('Ubicación GPS aplicada.', { scope: 'actor-edit' });
				setIsLocatingUser(false);
			},
			(error) => {
				const msg =
					error.code === error.PERMISSION_DENIED
						? 'Permiso de ubicación denegado.'
						: 'No se pudo obtener tu ubicación actual.';
				setSearchAddressError(msg);
				notify.error(msg, { scope: 'actor-edit' });
				setIsLocatingUser(false);
			},
			{ enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
		);
	};

	const handleProfileImageFile = async (file: File | null) => {
		if (!file) return;
		if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
			const err = 'Seleccioná una imagen JPG, PNG o WebP.';
			setProfileImageError(err);
			notify.error(err, { scope: 'actor-edit' });
			return;
		}
		const sizeValidation = validateImageFile(file, 5);
		if (!sizeValidation.valid) {
			const err = sizeValidation.error ?? 'La imagen supera el límite permitido.';
			setProfileImageError(err);
			notify.error(err, { scope: 'actor-edit' });
			return;
		}

		try {
			const base64 = await fileToBase64(file);
			setFormValues((current) => ({
				...current,
				fotoPerfilBase64: base64,
				fotoPerfilNombre: file.name,
			}));
			setProfileImageError(null);
		} catch {
			const err = 'No se pudo procesar la imagen seleccionada.';
			setProfileImageError(err);
			notify.error(err, { scope: 'actor-edit' });
		}
	};

	const handleNextFromTab0 = () => {
		if (!formValues.nombre.trim()) {
			setEditValidationAttempted(true);
			notify.error('El nombre del actor es obligatorio.', { scope: 'actor-edit' });
			return;
		}
		if (!formValues.descripcion.trim()) {
			setEditValidationAttempted(true);
			notify.error('La descripción o trayectoria es obligatoria.', { scope: 'actor-edit' });
			return;
		}
		setEditActiveTab(1);
	};

	const handleNextFromTab1 = () => {
		if (!formValues.departamento.trim() || !formValues.localidad.trim() || !formValues.direccion.trim()) {
			setEditValidationAttempted(true);
			if (!formValues.departamento.trim()) {
				notify.error('El departamento es obligatorio.', { scope: 'actor-edit' });
			} else if (!formValues.localidad.trim()) {
				notify.error('La localidad es obligatoria.', { scope: 'actor-edit' });
			} else {
				notify.error('La dirección o referencia es obligatoria.', { scope: 'actor-edit' });
			}
			return;
		}
		setEditActiveTab(2);
	};

	// Request Edit Save -> Open Edit Confirmation Dialog
	const handleRequestEditSave = () => {
		if (!formValues.nombre.trim()) {
			setEditValidationAttempted(true);
			notify.error('El nombre del actor es obligatorio.', { scope: 'actor-edit' });
			setEditActiveTab(0);
			return;
		}

		if (!formValues.descripcion.trim()) {
			setEditValidationAttempted(true);
			notify.error('La descripción o trayectoria es obligatoria.', { scope: 'actor-edit' });
			setEditActiveTab(0);
			return;
		}

		if (!actor) return;
		if (!getCategoryIdByName(categoryOptions, formValues.categoria)) {
			setEditValidationAttempted(true);
			notify.error('La categoría seleccionada ya no está disponible. Recargá la página e intentá nuevamente.', {
				scope: 'actor-edit',
			});
			setEditActiveTab(0);
			return;
		}

		if (!formValues.departamento.trim()) {
			setEditValidationAttempted(true);
			notify.error('El departamento es obligatorio.', { scope: 'actor-edit' });
			setEditActiveTab(1);
			return;
		}

		if (!formValues.localidad.trim()) {
			setEditValidationAttempted(true);
			notify.error('La localidad es obligatoria.', { scope: 'actor-edit' });
			setEditActiveTab(1);
			return;
		}

		if (!formValues.direccion.trim()) {
			setEditValidationAttempted(true);
			notify.error('La dirección o referencia es obligatoria.', { scope: 'actor-edit' });
			setEditActiveTab(1);
			return;
		}

		// Validar preguntas obligatorias
		for (const form of editForms) {
			const formId = form.id ?? form.idFormulario;
			for (const q of form.preguntas) {
				if (q.esObligatorio) {
					const qId = q.id ?? q.idPregunta;
					const key = `${formId}:${qId}`;
					const val = editFormAnswers[key];
					const isMissing =
						val === null ||
						val === undefined ||
						(Array.isArray(val) ? val.length === 0 : !String(val).trim());
					if (isMissing) {
						setEditValidationAttempted(true);
						notify.error(`Falta responder la pregunta obligatoria: "${q.pregunta}"`, {
							scope: 'actor-edit',
						});
						setEditActiveTab(2);
						return;
					}
				}
			}
		}

		// Solo mostrar confirmar los cambios si algo cambió
		if (!hasChanges) {
			notify.info('No se detectaron modificaciones para guardar.', { scope: 'actor-edit' });
			onClose();
			return;
		}

		setEditConfirmModalOpen(true);
	};

	// Confirm Edit Save
	const handleConfirmEditSave = async () => {
		if (!actor) return;

		// If edited by regular user, state automatically changes to 'P' for re-validation.
		const nextState: 'A' | 'P' | 'I' = isAdminOrMod ? actor.estado : 'P';
		let savedPhotoUrl: string | null = formValues.fotoPerfilUrl.trim() || null;

		const respuestas = Object.entries(editFormAnswers)
			.filter(
				([, val]) =>
					val !== null &&
					val !== undefined &&
					(Array.isArray(val) ? val.length > 0 : String(val).trim() !== ''),
			)
			.map(([key, val]) => {
				const [fIdStr, qIdStr] = key.split(':');
				const idFormulario = Number(fIdStr);
				const idPregunta = Number(qIdStr);
				return { idFormulario, idPregunta, valor: val };
			})
			.filter((r) => !isNaN(r.idFormulario) && !isNaN(r.idPregunta) && r.idFormulario > 0 && r.idPregunta > 0);

		try {
			const response = await editarMiActorApi(actor.id, {
				idCategoria: getCategoryIdByName(categoryOptions, formValues.categoria)!,
				idSubcategoria: getSubcategoryIdByName(categoryOptions, formValues.categoria, formValues.subcategoria),
				nombre: formValues.nombre.trim(),
				descripcion: formValues.descripcion.trim(),
				fotoPerfilUrl: formValues.fotoPerfilUrl.trim() || null,
				fotoPerfilBase64: formValues.fotoPerfilBase64 || null,
				cuit: formValues.cuit.trim() || null,
				tipoActor: formValues.tipoActor,
				departamento: formValues.departamento,
				localidad: formValues.localidad.trim(),
				direccion: formValues.direccion.trim(),
				latitud: formValues.latitud,
				longitud: formValues.longitud,
				esPublica: formValues.esPublica,
				respuestas,
			});
			savedPhotoUrl = response.data.fotoPerfilUrl;
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'No se pudo actualizar el actor cultural.';
			notify.error(errMsg, { scope: 'actor-edit' });
			setEditConfirmModalOpen(false);
			return;
		}

		const updatedActor: MyActor = {
			...actor,
			nombre: formValues.nombre.trim(),
			tipoActor: formValues.tipoActor,
			categoria: formValues.categoria,
			subcategoria: formValues.subcategoria || null,
			departamento: formValues.departamento,
			localidad: formValues.localidad.trim(),
			direccion: formValues.direccion.trim(),
			latitud: formValues.latitud,
			longitud: formValues.longitud,
			esPublica: formValues.esPublica,
			cuit: formValues.cuit.trim() || null,
			descripcion: formValues.descripcion.trim(),
			fotoPerfilUrl: savedPhotoUrl,
			estado: nextState,
		};

		onActorUpdated?.(updatedActor);

		const msg = !isAdminOrMod
			? `Se actualizaron los datos de "${formValues.nombre.trim()}". La ficha pasó a estado Pendiente para su revisión.`
			: `Se actualizó "${formValues.nombre.trim()}".`;

		notify.success(msg, { scope: 'actor-edit' });
		setEditConfirmModalOpen(false);
		onClose();
	};

	return (
		<>
			{/* MODAL: Editar Actor */}
			<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
				<DialogTitle sx={{ pb: 1, fontWeight: 700 }}>Editar actor: {actor?.nombre}</DialogTitle>

				<Tabs
					value={editActiveTab}
					onChange={(_, val) => {
						setEditActiveTab(val);
					}}
					sx={{
						px: 3,
						borderBottom: 1,
						borderColor: 'divider',
						'& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 48 },
					}}
				>
					<Tab icon={<TuneIcon fontSize="small" />} iconPosition="start" label="Información general" />
					<Tab icon={<LocationOnIcon fontSize="small" />} iconPosition="start" label="Ubicación" />
					<Tab
						icon={<QuizIcon fontSize="small" />}
						iconPosition="start"
						label={
							<Stack direction="row" spacing={1} alignItems="center">
								<span>Preguntas del sector</span>
								{editForms.reduce((sum, f) => sum + f.preguntas.length, 0) > 0 && (
									<Chip
										size="small"
										label={editForms.reduce((sum, f) => sum + f.preguntas.length, 0)}
										color={
											editForms.some((f) => {
												const fId = f.id ?? f.idFormulario;
												return f.preguntas.some((q) => {
													if (!q.esObligatorio) return false;
													const qId = q.id ?? q.idPregunta;
													const val = editFormAnswers[`${fId}:${qId}`];
													return (
														val === null ||
														val === undefined ||
														(Array.isArray(val) ? val.length === 0 : !String(val).trim())
													);
												});
											})
												? 'warning'
												: 'default'
										}
										sx={{ height: 20, fontSize: '0.72rem', fontWeight: 700 }}
									/>
								)}
							</Stack>
						}
					/>
				</Tabs>

				<DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
					{/* PESTAÑA 0: Información General */}
					{editActiveTab === 0 && (
						<Stack spacing={2.5}>
							{/* Fila superior: Foto de perfil + Datos principales */}
							<Grid container spacing={2.5} alignItems="stretch">
								{/* Tarjeta de foto de perfil */}
								<Grid size={{ xs: 12, sm: 5, md: 4 }}>
									<Paper
										variant="outlined"
										sx={{
											p: 2,
											height: '100%',
											display: 'flex',
											flexDirection: 'column',
											alignItems: 'center',
											justifyContent: 'center',
											borderRadius: 2,
											bgcolor: 'background.default',
											textAlign: 'center',
										}}
									>
										<Box
											component="label"
											title="Cambiar foto de perfil"
											onDragEnter={(event) => {
												event.preventDefault();
												setProfileImageDragging(true);
											}}
											onDragOver={(event) => event.preventDefault()}
											onDragLeave={(event) => {
												if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
													setProfileImageDragging(false);
												}
											}}
											onDrop={(event) => {
												event.preventDefault();
												setProfileImageDragging(false);
												handleProfileImageFile(event.dataTransfer.files[0] ?? null);
											}}
											sx={{
												position: 'relative',
												width: 170,
												height: 170,
												borderRadius: 3,
												overflow: 'hidden',
												cursor: 'pointer',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												border: '2px dashed',
												borderColor: profileImageError
													? 'error.main'
													: profileImageDragging
														? 'primary.main'
														: 'divider',
												bgcolor:
													formValues.fotoPerfilBase64 || formValues.fotoPerfilUrl
														? 'transparent'
														: 'action.hover',
												transition: 'border-color 160ms ease, box-shadow 160ms ease',
												boxShadow: profileImageDragging ? 2 : 0,
												'&:hover': {
													borderColor: 'primary.main',
												},
												'&:hover .profile-photo-overlay': {
													opacity: 1,
												},
											}}
										>
											{formValues.fotoPerfilBase64 || formValues.fotoPerfilUrl ? (
												<>
													<Box
														component="img"
														src={formValues.fotoPerfilBase64 || formValues.fotoPerfilUrl}
														alt={`Foto de perfil de ${formValues.nombre || 'actor cultural'}`}
														sx={{
															width: '100%',
															height: '100%',
															objectFit: 'cover',
															display: 'block',
														}}
													/>
													<Box
														className="profile-photo-overlay"
														sx={{
															position: 'absolute',
															inset: 0,
															display: 'grid',
															placeItems: 'center',
															bgcolor: 'rgba(0, 0, 0, 0.48)',
															opacity: profileImageDragging ? 1 : 0,
															transition: 'opacity 160ms ease',
															color: 'common.white',
														}}
													>
														<Stack alignItems="center" spacing={0.5}>
															<AddPhotoAlternateIcon sx={{ fontSize: 32 }} />
															<Typography
																variant="caption"
																sx={{ color: 'common.white', fontWeight: 600 }}
															>
																Cambiar foto
															</Typography>
														</Stack>
													</Box>
												</>
											) : (
												<Stack
													alignItems="center"
													justifyContent="center"
													sx={{ color: 'text.secondary', p: 1 }}
												>
													<AddPhotoAlternateIcon
														sx={{ fontSize: 42, mb: 0.5, color: 'text.disabled' }}
													/>
													<Typography
														variant="caption"
														fontWeight={600}
														color="text.secondary"
													>
														Subir foto de perfil
													</Typography>
												</Stack>
											)}
											<input
												hidden
												type="file"
												accept="image/jpeg,image/png,image/webp"
												onChange={(event) =>
													handleProfileImageFile(event.target.files?.[0] ?? null)
												}
											/>
										</Box>
										{(formValues.fotoPerfilBase64 || formValues.fotoPerfilUrl) && (
											<Button
												size="small"
												color="inherit"
												startIcon={<ClearIcon fontSize="small" />}
												onClick={() =>
													setFormValues((v) => ({
														...v,
														fotoPerfilUrl: '',
														fotoPerfilBase64: '',
														fotoPerfilNombre: '',
													}))
												}
												sx={{
													mt: 0.75,
													fontSize: '0.75rem',
													textTransform: 'none',
													color: 'text.secondary',
												}}
											>
												Quitar foto
											</Button>
										)}
										{profileImageError && (
											<Typography
												variant="caption"
												color="error.main"
												sx={{ mt: 0.5, display: 'block' }}
											>
												{profileImageError}
											</Typography>
										)}
									</Paper>
								</Grid>

								{/* Columna datos principales */}
								<Grid size={{ xs: 12, sm: 7, md: 8 }}>
									<Stack spacing={2} justifyContent="space-between" sx={{ height: '100%' }}>
										<TextField
											fullWidth
											required
											label="Nombre público del actor"
											placeholder="Ej. Ensamble del Valle"
											value={formValues.nombre}
											onChange={(e) => setFormValues((v) => ({ ...v, nombre: e.target.value }))}
											error={editValidationAttempted && !formValues.nombre.trim()}
											helperText={
												editValidationAttempted && !formValues.nombre.trim()
													? 'El nombre del actor es obligatorio'
													: undefined
											}
										/>

										<FormControl
											fullWidth
											required
											error={editValidationAttempted && !formValues.tipoActor}
										>
											<InputLabel>Tipo de actor</InputLabel>
											<Select
												value={formValues.tipoActor}
												label="Tipo de actor"
												onChange={(e) =>
													setFormValues((v) => ({
														...v,
														tipoActor: e.target.value as MyActor['tipoActor'],
													}))
												}
											>
												{Object.entries(typeLabels).map(([key, label]) => (
													<MenuItem key={key} value={key}>
														{label}
													</MenuItem>
												))}
											</Select>
											{editValidationAttempted && !formValues.tipoActor && (
												<FormHelperText>Seleccioná el tipo de actor</FormHelperText>
											)}
										</FormControl>

										<TextField
											fullWidth
											label="CUIT / CUIL (Opcional)"
											placeholder="Ej. 20300000014"
											value={formValues.cuit}
											onChange={(e) => setFormValues((v) => ({ ...v, cuit: e.target.value }))}
										/>
									</Stack>
								</Grid>
							</Grid>

							{/* Clasificación cultural (Deshabilitada por ahora) */}
							<Grid container spacing={2}>
								<Grid size={{ xs: 12, sm: 6 }}>
									<FormControl fullWidth required disabled>
										<InputLabel>Categoría principal</InputLabel>
										<Select value={formValues.categoria} label="Categoría principal" disabled>
											{!selectedEditCategory && formValues.categoria && (
												<MenuItem value={formValues.categoria} disabled>
													{formValues.categoria}
												</MenuItem>
											)}
											{categoryOptions.map((category) => (
												<MenuItem key={category.id} value={category.nombre}>
													{category.nombre}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</Grid>

								<Grid size={{ xs: 12, sm: 6 }}>
									<FormControl fullWidth disabled>
										<InputLabel>Subcategoría</InputLabel>
										<Select value={formValues.subcategoria} label="Subcategoría" disabled>
											{!selectedEditCategory?.subcategorias.some(
												(option) => option.nombre === formValues.subcategoria,
											) &&
												formValues.subcategoria && (
													<MenuItem value={formValues.subcategoria} disabled>
														{formValues.subcategoria}
													</MenuItem>
												)}
											{(selectedEditCategory?.subcategorias ?? []).map((subcategory) => (
												<MenuItem key={subcategory.id} value={subcategory.nombre}>
													{subcategory.nombre}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</Grid>
							</Grid>

							{/* Descripción o trayectoria */}
							<TextField
								fullWidth
								required
								multiline
								rows={3}
								label="Descripción o trayectoria"
								placeholder="Resumen del proyecto artístico, trayectoria e información destacada..."
								value={formValues.descripcion}
								onChange={(e) => setFormValues((v) => ({ ...v, descripcion: e.target.value }))}
								error={editValidationAttempted && !formValues.descripcion.trim()}
								helperText={
									editValidationAttempted && !formValues.descripcion.trim()
										? 'La descripción o trayectoria es obligatoria'
										: undefined
								}
							/>

							{!isAdminOrMod && (
								<Alert severity="info">
									Nota: Al guardar cambios en tu actor cultural, su estado pasará automáticamente a{' '}
									<strong>Pendiente de revisión</strong> hasta que un moderador lo apruebe.
								</Alert>
							)}
						</Stack>
					)}

					{/* PESTAÑA 1: Ubicación */}
					{editActiveTab === 1 && (
						<Stack spacing={2.5}>
							{/* Departamento y Localidad */}
							<Grid container spacing={2}>
								<Grid size={{ xs: 12, sm: 6 }}>
									<FormControl
										fullWidth
										required
										error={editValidationAttempted && !formValues.departamento.trim()}
									>
										<InputLabel>Departamento</InputLabel>
										<Select
											value={formValues.departamento}
											label="Departamento"
											onChange={(e) => {
												const newDept = e.target.value;
												const deptInfo = tucumanData[newDept];
												const firstLoc = deptInfo?.localidades?.[0] ?? '';
												setFormValues((v) => ({
													...v,
													departamento: newDept,
													localidad: firstLoc,
													latitud: deptInfo?.centroide?.lat ?? v.latitud,
													longitud: deptInfo?.centroide?.lon ?? v.longitud,
												}));
											}}
										>
											{DEPARTAMENTOS_TUCUMAN.map((dep) => (
												<MenuItem key={dep} value={dep}>
													{dep}
												</MenuItem>
											))}
										</Select>
										{editValidationAttempted && !formValues.departamento.trim() && (
											<FormHelperText>El departamento es obligatorio</FormHelperText>
										)}
									</FormControl>
								</Grid>

								<Grid size={{ xs: 12, sm: 6 }}>
									<Autocomplete
										freeSolo
										options={tucumanData[formValues.departamento]?.localidades ?? []}
										value={formValues.localidad}
										onInputChange={(_, newValue) =>
											setFormValues((v) => ({ ...v, localidad: newValue }))
										}
										renderInput={(params) => (
											<TextField
												{...params}
												required
												label="Localidad"
												placeholder="Ej. San Miguel de Tucumán"
												error={editValidationAttempted && !formValues.localidad.trim()}
												helperText={
													editValidationAttempted && !formValues.localidad.trim()
														? 'La localidad es obligatoria'
														: undefined
												}
											/>
										)}
									/>
								</Grid>
							</Grid>

							{/* Dirección / Referencia y Búsqueda */}
							<Stack spacing={1}>
								<TextField
									fullWidth
									required
									label="Dirección / Calle o referencia"
									placeholder="Ej. San Martín 450 o plaza principal"
									value={formValues.direccion}
									onChange={(e) => {
										setFormValues((v) => ({ ...v, direccion: e.target.value }));
										setSearchAddressError(null);
									}}
									onKeyDown={(e) => {
										if (e.key === 'Enter') {
											e.preventDefault();
											void handleSearchAddress();
										}
									}}
									error={
										Boolean(searchAddressError) ||
										(editValidationAttempted && !formValues.direccion.trim())
									}
									helperText={
										searchAddressError ||
										(editValidationAttempted && !formValues.direccion.trim()
											? 'La dirección o referencia es obligatoria'
											: 'Ingresá la calle, número o referencia del espacio/taller/sala.')
									}
								/>

								<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
									<Button
										variant="outlined"
										startIcon={<SearchIcon />}
										disabled={!formValues.direccion.trim() || isSearchingAddress}
										onClick={() => void handleSearchAddress()}
										sx={{ textTransform: 'none' }}
									>
										{isSearchingAddress ? 'Buscando en mapa…' : 'Buscar en el mapa'}
									</Button>
									<Button
										variant="outlined"
										color="secondary"
										startIcon={<MyLocationIcon />}
										disabled={isLocatingUser}
										onClick={handleUseCurrentLocation}
										sx={{ textTransform: 'none' }}
									>
										{isLocatingUser ? 'Obteniendo GPS…' : 'Usar mi ubicación actual'}
									</Button>
								</Stack>
							</Stack>

							{/* Mapa interactivo Leaflet */}
							<Paper
								variant="outlined"
								sx={{
									position: 'relative',
									height: 320,
									borderRadius: 2,
									overflow: 'hidden',
									borderColor: 'divider',
									'& .leaflet-container': { cursor: 'crosshair' },
								}}
							>
								<MapContainer
									center={[formValues.latitud ?? -26.8241, formValues.longitud ?? -65.2226]}
									zoom={13}
									zoomControl={false}
									style={{ width: '100%', height: '100%' }}
									scrollWheelZoom={false}
								>
									<InvalidateMapSize />
									<PortfolioMapControls
										isSatelital={editMapLayer === 'satellite'}
										onToggleSatelital={() =>
											setEditMapLayer((l) => (l === 'satellite' ? 'streets' : 'satellite'))
										}
									/>
									<MapDepartmentCenterer
										department={formValues.departamento}
										locality={formValues.localidad}
										point={
											formValues.latitud !== null && formValues.longitud !== null
												? { lat: formValues.latitud, lng: formValues.longitud }
												: null
										}
										tucumanData={tucumanData}
									/>
									<MapPointFocuser
										point={
											formValues.latitud !== null && formValues.longitud !== null
												? { lat: formValues.latitud, lng: formValues.longitud }
												: null
										}
									/>
									<MapClickHandler
										onPointChange={(p) =>
											setFormValues((v) => ({ ...v, latitud: p.lat, longitud: p.lng }))
										}
									/>
									<TileLayer
										attribution={
											editMapLayer === 'satellite'
												? '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
												: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
										}
										url={
											editMapLayer === 'satellite'
												? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
												: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
										}
									/>
									{formValues.latitud !== null && formValues.longitud !== null && (
										<Marker
											position={[formValues.latitud, formValues.longitud]}
											icon={customPinIcon}
											draggable
											eventHandlers={{
												dragend: (event) => {
													const marker = event.target as L.Marker;
													const latlng = marker.getLatLng();
													setFormValues((v) => ({
														...v,
														latitud: latlng.lat,
														longitud: latlng.lng,
													}));
												},
											}}
										/>
									)}
								</MapContainer>
							</Paper>

							{/* Visibilidad pública de la ubicación */}
							<Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
								<Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
									¿Querés que esta ubicación aparezca en el mapa público?
								</Typography>
								<RadioGroup
									row
									value={formValues.esPublica ? 'si' : 'no'}
									onChange={(e) =>
										setFormValues((v) => ({ ...v, esPublica: e.target.value === 'si' }))
									}
								>
									<FormControlLabel
										value="si"
										control={<Radio size="small" color="success" />}
										label={
											<Stack direction="row" spacing={0.5} alignItems="center">
												<PublicIcon sx={{ fontSize: 18, color: 'success.main' }} />
												<Typography variant="body2" fontWeight={600}>
													Sí, mostrar públicamente en el mapa
												</Typography>
											</Stack>
										}
										sx={{ mr: 3 }}
									/>
									<FormControlLabel
										value="no"
										control={<Radio size="small" color="default" />}
										label={
											<Stack direction="row" spacing={0.5} alignItems="center">
												<ShieldIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
												<Typography variant="body2">
													No, mantenerla privada (solo administración)
												</Typography>
											</Stack>
										}
									/>
								</RadioGroup>
								<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
									Si la mantenés privada, tu actor no mostrará la dirección exacta ni el punto en el
									mapa público, pero la administración podrá consultarla para validar el registro.
								</Typography>
							</Paper>
						</Stack>
					)}

					{/* PESTAÑA 2: Preguntas del Sector */}
					{editActiveTab === 2 && (
						<Stack spacing={3}>
							{editFormsLoading ? (
								<Stack alignItems="center" justifyContent="center" spacing={2} sx={{ py: 6 }}>
									<CircularProgress size={36} />
									<Typography variant="body2" color="text.secondary">
										Cargando preguntas de {formValues.categoria || 'la categoría'}...
									</Typography>
								</Stack>
							) : editForms.length === 0 || editForms.every((f) => f.preguntas.length === 0) ? (
								<Paper
									variant="outlined"
									sx={{
										p: 4,
										textAlign: 'center',
										borderRadius: 2,
										bgcolor: 'background.default',
									}}
								>
									<QuizIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
									<Typography variant="subtitle1" fontWeight={600}>
										Sin preguntas adicionales
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary"
										sx={{ maxWidth: 480, mx: 'auto', mt: 0.5 }}
									>
										No hay preguntas sectoriales configuradas actualmente para la categoría
										{formValues.categoria}
										{formValues.subcategoria ? ` y subcategoría "${formValues.subcategoria}"` : ''}.
									</Typography>
								</Paper>
							) : (
								editForms.map((form, index) => (
									<Box key={form.id}>
										{index > 0 && <Divider sx={{ mb: 3 }} />}
										<Stack spacing={0.5} sx={{ mb: 2 }}>
											<Stack direction="row" spacing={1} alignItems="center">
												<Typography variant="h6" fontWeight={700}>
													{form.titulo}
												</Typography>
												<Chip
													size="small"
													label={form.ambito === 'CATEGORIA' ? 'Categoría' : 'Subcategoría'}
													variant="outlined"
													sx={{ height: 20, fontSize: '0.7rem' }}
												/>
											</Stack>
											{form.descripcion && (
												<Typography variant="body2" color="text.secondary">
													{form.descripcion}
												</Typography>
											)}
										</Stack>

										{form.preguntas.length === 0 ? (
											<Typography variant="body2" color="text.secondary">
												Este formulario no tiene preguntas activas.
											</Typography>
										) : (
											<Stack spacing={2.5}>
												{form.preguntas.map((question) => {
													const formId = form.id ?? form.idFormulario;
													const qId = question.id ?? question.idPregunta;
													const key = `${formId}:${qId}`;
													const value =
														editFormAnswers[key] ??
														(question.tipoDato === 'OPCION_MULTIPLE' ? [] : '');
													const isMissing =
														question.esObligatorio &&
														(Array.isArray(value)
															? value.length === 0
															: !String(value ?? '').trim());
													const hasError = editValidationAttempted && isMissing;
													const isNew =
														question.valor === null || question.valor === undefined;

													return (
														<Paper
															key={key}
															variant="outlined"
															sx={{
																p: 2,
																borderRadius: 2,
																borderColor: hasError ? 'error.main' : 'divider',
																bgcolor: hasError
																	? 'error.lighter'
																	: 'background.paper',
																transition: 'border-color 0.2s ease',
															}}
														>
															<QuestionField
																question={question}
																value={value}
																hasError={hasError}
																isNew={isNew}
																onChange={(val) =>
																	setEditFormAnswers((prev) => ({
																		...prev,
																		[key]: val,
																	}))
																}
															/>
														</Paper>
													);
												})}
											</Stack>
										)}
									</Box>
								))
							)}
						</Stack>
					)}
				</DialogContent>
				<DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
					<Box>
						{editActiveTab === 1 && (
							<Button color="inherit" onClick={() => setEditActiveTab(0)}>
								← Datos generales
							</Button>
						)}
						{editActiveTab === 2 && (
							<Button color="inherit" onClick={() => setEditActiveTab(1)}>
								← Ubicación
							</Button>
						)}
					</Box>
					<Stack direction="row" spacing={1.5} alignItems="center">
						<Button onClick={onClose}>Cancelar</Button>

						{editActiveTab === 0 && (
							<Button variant="contained" onClick={handleNextFromTab0}>
								Siguiente: Ubicación →
							</Button>
						)}

						{editActiveTab === 1 && (
							<Button variant="contained" onClick={handleNextFromTab1}>
								Siguiente: Preguntas del sector →
							</Button>
						)}

						{editActiveTab === 2 && (
							<Tooltip title={!hasChanges ? 'No se han realizado modificaciones para guardar' : ''} arrow>
								<span>
									<Button
										variant="contained"
										color="primary"
										onClick={handleRequestEditSave}
										// disabled={!hasChanges}
									>
										Guardar cambios
									</Button>
								</span>
							</Tooltip>
						)}
					</Stack>
				</DialogActions>
			</Dialog>

			{/* MODAL: Confirmación de Edición */}
			<Dialog open={editConfirmModalOpen} onClose={() => setEditConfirmModalOpen(false)} maxWidth="sm" fullWidth>
				<DialogTitle fontWeight={700}>¿Confirmar cambios en el actor cultural?</DialogTitle>
				<DialogContent dividers>
					<Stack spacing={2}>
						<DialogContentText>
							¿Deseás guardar las modificaciones realizadas en <strong>{formValues.nombre}</strong>?
						</DialogContentText>

						<Alert severity="warning">
							Al guardar los cambios, la ficha del actor volverá automáticamente al estado{' '}
							<strong>Pendiente de revisión</strong> hasta que sea aprobada por los moderadores.
						</Alert>
					</Stack>
				</DialogContent>
				<DialogActions sx={{ p: 2 }}>
					<Button onClick={() => setEditConfirmModalOpen(false)}>Cancelar</Button>
					<Button variant="contained" color="error" onClick={handleConfirmEditSave}>
						Sí, guardar cambios
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
