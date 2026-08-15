import * as React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router';

import AddIcon from '@mui/icons-material/Add';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ClearIcon from '@mui/icons-material/Clear';
import CollectionsIcon from '@mui/icons-material/Collections';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import GridViewIcon from '@mui/icons-material/GridView';
import InstagramIcon from '@mui/icons-material/Instagram';
import LanguageIcon from '@mui/icons-material/Language';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PublicIcon from '@mui/icons-material/Public';
import QuizIcon from '@mui/icons-material/Quiz';
import SearchIcon from '@mui/icons-material/Search';
import ShieldIcon from '@mui/icons-material/Shield';
import TuneIcon from '@mui/icons-material/Tune';
import ViewListIcon from '@mui/icons-material/ViewList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
	Alert,
	Autocomplete,
	Avatar,
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	CardMedia,
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
	IconButton,
	InputLabel,
	Link as MuiLink,
	MenuItem,
	Paper,
	Radio,
	RadioGroup,
	Select,
	Stack,
	Tab,
	Tabs,
	TextField,
	ToggleButton,
	ToggleButtonGroup,
	Tooltip,
	Typography,
} from '@mui/material';
import type { LeafletMouseEvent } from 'leaflet';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
// @ts-ignore
import 'leaflet/dist/leaflet.css';
import { PageContainer } from '@toolpad/core/PageContainer';
import { notify } from '../utils/toast';

import AdminFilters from '../components/adminFilters';
import AdminTable, { type AdminColumn } from '../components/adminTable';
import { PortfolioMapControls } from '../components/actorPortfolioView';
import CategoryIcon, { type CategoriaIcono } from '../components/categoryIcon';
import DatePickerSpanish from '../components/datePickerSpanish';
import RequiredAsterisk from '../components/requiredAsterisk';
import {
	agregarEventoApi,
	agregarIntegranteApi,
	agregarIntegranteNoRegistradoApi,
	agregarItemPortafolioApi,
	cambiarEstadoMiActorApi,
	editarMiActorApi,
	eliminarEventoApi,
	eliminarIntegranteApi,
	eliminarIntegranteNoRegistradoApi,
	editarIntegranteApi,
	editarIntegranteNoRegistradoApi,
	eliminarItemPortafolioApi,
	eliminarMiActorApi,
	listarIntegrantesApi,
	listarEventosApi,
	listarMisActoresApi,
	listarPortafolioApi,
	obtenerFormulariosActorApi,
	obtenerFormulariosAplicablesApi,
	obtenerOpcionesRegistroApi,
	type FormularioActor,
	type IntegranteApiItem,
	type OpcionCategoriaRegistro,
	type PreguntaFormularioActor,
} from '../api/actores';
import { DEPARTAMENTOS_TUCUMAN } from '../constants/departamentos';
import {
	ESTADO_COLORS as stateColors,
	ESTADO_LABELS as stateLabels,
	TIPO_ACTOR_LABELS as typeLabels,
} from '../constants/estados';
import { useAuth } from '../context/AuthContext';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { formatEventDate } from '../utils/date';
import { fileToBase64, validateImageFile } from '../utils/file';
import { buildSlugConId } from '../utils/slug';

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

export type MyActorPortfolioItem = {
	id: number;
	tipo: 'IMAGEN' | 'LINK' | 'RRSS';
	descripcion: string;
	url: string;
};

export type MyActorEvent = {
	id: number;
	nombre: string;
	descripcion: string;
	fecha: string;
};

export type MyActor = {
	id: number;
	idUsuarioDueno: number;
	nombre: string;
	tipoActor: 'INDIVIDUO' | 'COLECTIVO' | 'ESPACIO';
	categoria: string;
	categoriaIcono?: CategoriaIcono;
	subcategoria: string | null;
	departamento: string;
	localidad: string;
	direccion: string;
	latitud?: number | null;
	longitud?: number | null;
	esPublica?: boolean;
	cuit: string | null;
	descripcion: string;
	fotoPerfilUrl: string | null;
	estado: 'A' | 'P' | 'I';
	fechaCreacion: string;
	portafolio?: MyActorPortfolioItem[];
	eventos?: MyActorEvent[];
};

type TucumanDataMap = Record<
	string,
	{
		centroide: { lat: number; lon: number };
		localidades: string[];
	}
>;

type MapPoint = { lat: number; lng: number };

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

function getMemberKey(member: IntegranteApiItem): string {
	return member.tipo === 'REGISTRADO'
		? `usuario-${member.idUsuario}`
		: `sin-cuenta-${member.idIntegranteNoRegistrado}`;
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
				slotProps={{ htmlInput: { 'aria-label': label } }}
			/>
		</Stack>
	);
}

export default function MisActoresPage() {
	const navigate = useNavigate();
	const { user } = useAuth();

	const userId = user?.idUsuario;
	const isAdminOrMod = user?.rol === 'ADMIN' || user?.rol === 'MODERADOR';

	const [actores, setActores] = React.useState<MyActor[]>([]);
	const [categoryOptions, setCategoryOptions] = React.useState<OpcionCategoriaRegistro[]>([]);
	const [catalogError, setCatalogError] = React.useState<string | null>(null);
	const [loading, setLoading] = React.useState<boolean>(true);
	const [error, setError] = React.useState<string | null>(null);

	const [search, setSearch] = React.useState('');
	const [categoryFilter, setCategoryFilter] = React.useState('');
	const [stateFilter, setStateFilter] = React.useState('');
	const [viewMode, setViewMode] = React.useState<'grid' | 'table'>('grid');

	// Edit Modal
	const [editModalOpen, setEditModalOpen] = React.useState(false);
	const [editingActor, setEditingActor] = React.useState<MyActor | null>(null);
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

	// Edit Confirmation Modal
	const [editConfirmModalOpen, setEditConfirmModalOpen] = React.useState(false);

	// Edit Form values
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

	// Status Change Modal
	const [statusModalOpen, setStatusModalOpen] = React.useState(false);
	const [targetStatusActor, setTargetStatusActor] = React.useState<MyActor | null>(null);
	const [selectedNextStatus, setSelectedNextStatus] = React.useState<'A' | 'P' | 'I'>('P');

	// Deactivate Confirmation Modal (Dar de baja confirmation)
	const [deactivateConfirmModalOpen, setDeactivateConfirmModalOpen] = React.useState(false);

	// Portfolio Management Modal
	const [portfolioModalOpen, setPortfolioModalOpen] = React.useState(false);
	const [targetPortfolioActor, setTargetPortfolioActor] = React.useState<MyActor | null>(null);
	const [newPortfolioType, setNewPortfolioType] = React.useState<'IMAGEN' | 'LINK' | 'RRSS'>('IMAGEN');
	const [newPortfolioUrl, setNewPortfolioUrl] = React.useState('');
	const [newPortfolioDesc, setNewPortfolioDesc] = React.useState('');
	const [portfolioLoading, setPortfolioLoading] = React.useState(false);
	const [portfolioSubmitting, setPortfolioSubmitting] = React.useState(false);
	const [deletingPortfolioItemId, setDeletingPortfolioItemId] = React.useState<number | null>(null);

	// Events Management Modal
	const [eventsModalOpen, setEventsModalOpen] = React.useState(false);
	const [targetEventsActor, setTargetEventsActor] = React.useState<MyActor | null>(null);
	const [newEventNombre, setNewEventNombre] = React.useState('');
	const [newEventFecha, setNewEventFecha] = React.useState('');
	const [newEventDesc, setNewEventDesc] = React.useState('');
	const [eventsLoading, setEventsLoading] = React.useState(false);
	const [eventCreating, setEventCreating] = React.useState(false);
	const [deletingEventId, setDeletingEventId] = React.useState<number | null>(null);

	// Members Management Modal
	const [membersModalOpen, setMembersModalOpen] = React.useState(false);
	const [targetMembersActor, setTargetMembersActor] = React.useState<MyActor | null>(null);
	const [integrantesList, setIntegrantesList] = React.useState<IntegranteApiItem[]>([]);
	const [newMemberType, setNewMemberType] = React.useState<'REGISTRADO' | 'NO_REGISTRADO'>('REGISTRADO');
	const [newMemberNombre, setNewMemberNombre] = React.useState('');
	const [newMemberApellido, setNewMemberApellido] = React.useState('');
	const [newMemberEmail, setNewMemberEmail] = React.useState('');
	const [newMemberRol, setNewMemberRol] = React.useState('Integrante');
	const [editingMember, setEditingMember] = React.useState<IntegranteApiItem | null>(null);
	const [editMemberNombre, setEditMemberNombre] = React.useState('');
	const [editMemberApellido, setEditMemberApellido] = React.useState('');
	const [editMemberEmail, setEditMemberEmail] = React.useState('');
	const [editMemberRol, setEditMemberRol] = React.useState('');
	const [memberSubmitting, setMemberSubmitting] = React.useState(false);
	const [deletingMemberKey, setDeletingMemberKey] = React.useState<string | null>(null);
	const [membersLoading, setMembersLoading] = React.useState(false);

	// Delete Modal
	const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
	const [targetDeleteActor, setTargetDeleteActor] = React.useState<MyActor | null>(null);
	const [deleteConfirmInput, setDeleteConfirmInput] = React.useState('');

	const isDeleteConfirmed = React.useMemo(() => {
		if (!targetDeleteActor) return false;
		const cleanInput = deleteConfirmInput.trim().toUpperCase();
		return cleanInput === 'BORRAR' || cleanInput === 'ELIMINAR';
	}, [deleteConfirmInput, targetDeleteActor]);

	const debouncedSearch = useDebouncedValue(search);
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

	React.useEffect(() => {
		const controller = new AbortController();
		void obtenerOpcionesRegistroApi(controller.signal)
			.then((response) => {
				setCategoryOptions(response.data);
				setCatalogError(null);
			})
			.catch((loadError: unknown) => {
				if (!controller.signal.aborted) {
					setCatalogError(
						loadError instanceof Error ? loadError.message : 'No se pudo cargar el catálogo de categorías.',
					);
				}
			});

		void fetch('/data/tucuman_departamentos.json', { signal: controller.signal })
			.then((res) => res.json())
			.then((data: TucumanDataMap) => {
				setTucumanData(data);
			})
			.catch(() => {});

		return () => controller.abort();
	}, []);

	// Load actors directly from backend API (database)
	const fetchMisActores = React.useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const res = await listarMisActoresApi({
				busqueda: debouncedSearch || undefined,
				estado: (stateFilter as 'A' | 'P' | 'I') || undefined,
				idCategoria: categoryFilter ? getCategoryIdByName(categoryOptions, categoryFilter) : undefined,
			});

			if (res?.data) {
				const mapApiActores: MyActor[] = res.data.map((item) => ({
					id: item.id,
					idUsuarioDueno: userId ?? 0,
					nombre: item.nombre,
					tipoActor: item.tipoActor,
					categoria: item.categoria,
					categoriaIcono: item.categoriaIcono,
					subcategoria: item.subcategoria,
					departamento: item.ubicacion.departamento,
					localidad: item.ubicacion.localidad,
					direccion: item.ubicacion.direccion,
					latitud: item.ubicacion.latitud,
					longitud: item.ubicacion.longitud,
					esPublica: item.ubicacion.esPublica ?? true,
					cuit: item.cuit,
					descripcion: item.descripcion,
					fotoPerfilUrl: item.foto,
					estado: item.estado,
					fechaCreacion: item.fechaCreacion,
					portafolio: [],
					eventos: [],
				}));
				setActores(mapApiActores);
			} else {
				setActores([]);
			}
		} catch (err) {
			console.error('Error al obtener actores del backend:', err);
			const msg = 'No se pudieron cargar los actores culturales desde la base de datos.';
			setError(msg);
			notify.error(msg);
			setActores([]);
		} finally {
			setLoading(false);
		}
	}, [debouncedSearch, stateFilter, categoryFilter, userId, categoryOptions]);

	React.useEffect(() => {
		fetchMisActores();
	}, [fetchMisActores]);

	// Filtered list based on search, category, and state
	const filteredActores = React.useMemo(() => {
		return actores.filter((actor) => {
			const matchesSearch =
				!debouncedSearch ||
				actor.nombre.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
				actor.categoria.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
				actor.departamento.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
				actor.localidad.toLowerCase().includes(debouncedSearch.toLowerCase());

			const matchesCategory = !categoryFilter || actor.categoria === categoryFilter;
			const matchesState = !stateFilter || actor.estado === stateFilter;

			return matchesSearch && matchesCategory && matchesState;
		});
	}, [actores, debouncedSearch, categoryFilter, stateFilter]);

	// Open Edit Dialog
	const handleOpenEdit = (actor: MyActor) => {
		setEditingActor(actor);
		setEditActiveTab(0);
		setEditValidationAttempted(false);
		setEditFormsLoading(true);
		setEditForms([]);
		setEditFormAnswers({});
		setSearchAddressError(null);

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

		setProfileImageError(null);
		setEditModalOpen(true);

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
	};

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
				notify.error(msg);
				return;
			}

			setFormValues((v) => ({
				...v,
				latitud: Number(result.lat),
				longitud: Number(result.lon),
			}));
			notify.success('Ubicación encontrada en el mapa.');
		} catch {
			const msg = 'No se pudo realizar la búsqueda en el mapa en este momento.';
			setSearchAddressError(msg);
			notify.error(msg);
		} finally {
			setIsSearchingAddress(false);
		}
	};

	const handleUseCurrentLocation = () => {
		setSearchAddressError(null);
		if (!navigator.geolocation) {
			const msg = 'Tu navegador no permite obtener la ubicación actual.';
			setSearchAddressError(msg);
			notify.error(msg);
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
					notify.error(msg);
					setIsLocatingUser(false);
					return;
				}

				setFormValues((v) => ({
					...v,
					latitud: lat,
					longitud: lng,
				}));
				notify.success('Ubicación GPS aplicada.');
				setIsLocatingUser(false);
			},
			(error) => {
				const msg =
					error.code === error.PERMISSION_DENIED
						? 'Permiso de ubicación denegado.'
						: 'No se pudo obtener tu ubicación actual.';
				setSearchAddressError(msg);
				notify.error(msg);
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
			notify.error(err);
			return;
		}
		const sizeValidation = validateImageFile(file, 5);
		if (!sizeValidation.valid) {
			const err = sizeValidation.error ?? 'La imagen supera el límite permitido.';
			setProfileImageError(err);
			notify.error(err);
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
			notify.error(err);
		}
	};

	const handleNextFromTab0 = () => {
		if (!formValues.nombre.trim()) {
			setEditValidationAttempted(true);
			notify.error('El nombre del actor es obligatorio.');
			return;
		}
		if (!formValues.descripcion.trim()) {
			setEditValidationAttempted(true);
			notify.error('La descripción o trayectoria es obligatoria.');
			return;
		}
		setEditActiveTab(1);
	};

	const handleNextFromTab1 = () => {
		if (!formValues.departamento.trim() || !formValues.localidad.trim() || !formValues.direccion.trim()) {
			setEditValidationAttempted(true);
			if (!formValues.departamento.trim()) {
				notify.error('El departamento es obligatorio.');
			} else if (!formValues.localidad.trim()) {
				notify.error('La localidad es obligatoria.');
			} else {
				notify.error('La dirección o referencia es obligatoria.');
			}
			return;
		}
		setEditActiveTab(2);
	};

	// Request Edit Save -> Open Edit Confirmation Dialog
	const handleRequestEditSave = () => {
		if (!formValues.nombre.trim()) {
			setEditValidationAttempted(true);
			notify.error('El nombre del actor es obligatorio.');
			setEditActiveTab(0);
			return;
		}

		if (!formValues.descripcion.trim()) {
			setEditValidationAttempted(true);
			notify.error('La descripción o trayectoria es obligatoria.');
			setEditActiveTab(0);
			return;
		}

		if (!editingActor) return;
		if (!getCategoryIdByName(categoryOptions, formValues.categoria)) {
			setEditValidationAttempted(true);
			notify.error('La categoría seleccionada ya no está disponible. Recargá la página e intentá nuevamente.');
			setEditActiveTab(0);
			return;
		}

		if (!formValues.departamento.trim()) {
			setEditValidationAttempted(true);
			notify.error('El departamento es obligatorio.');
			setEditActiveTab(1);
			return;
		}

		if (!formValues.localidad.trim()) {
			setEditValidationAttempted(true);
			notify.error('La localidad es obligatoria.');
			setEditActiveTab(1);
			return;
		}

		if (!formValues.direccion.trim()) {
			setEditValidationAttempted(true);
			notify.error('La dirección o referencia es obligatoria.');
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
						notify.error(`Falta responder la pregunta obligatoria: "${q.pregunta}"`);
						setEditActiveTab(2);
						return;
					}
				}
			}
		}

		// Solo mostrar confirmar los cambios si algo cambió
		if (!hasChanges) {
			notify.info('No se detectaron modificaciones para guardar.');
			setEditModalOpen(false);
			return;
		}

		setEditConfirmModalOpen(true);
	};

	// Confirm Edit Save
	const handleConfirmEditSave = async () => {
		if (!editingActor) return;

		// If edited by regular user, state automatically changes to 'P' for re-validation.
		const nextState: 'A' | 'P' | 'I' = isAdminOrMod ? editingActor.estado : 'P';
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
			const response = await editarMiActorApi(editingActor.id, {
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
			notify.error(errMsg);
			setEditConfirmModalOpen(false);
			return;
		}

		setActores((prev) =>
			prev.map((actor) =>
				actor.id === editingActor.id
					? {
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
						}
					: actor,
			),
		);

		const msg = !isAdminOrMod
			? `Se actualizaron los datos de "${formValues.nombre.trim()}". La ficha pasó a estado Pendiente para su revisión.`
			: `Se actualizó "${formValues.nombre.trim()}" correctamente.`;

		notify.success(msg);
		setEditConfirmModalOpen(false);
		setEditModalOpen(false);
	};

	// Open Status Change Modal
	const handleOpenStatusModal = (actor: MyActor, defaultNext?: 'A' | 'P' | 'I') => {
		setTargetStatusActor(actor);
		const initialChoice = defaultNext || (actor.estado === 'A' ? 'I' : actor.estado === 'I' ? 'P' : 'I');
		setSelectedNextStatus(initialChoice);
		setStatusModalOpen(true);
	};

	// Status Modal Submit -> If 'I', open Deactivate Confirmation Dialog
	const handleStatusModalSubmit = () => {
		if (!targetStatusActor) return;

		if (selectedNextStatus === 'I') {
			setDeactivateConfirmModalOpen(true);
			return;
		}

		// For 'P' or 'A', execute directly
		handleExecuteStatusChange(selectedNextStatus);
	};

	// Execute Status Change
	const handleExecuteStatusChange = async (nextSt: 'A' | 'P' | 'I') => {
		if (!targetStatusActor) return;

		if (nextSt === 'A' && !isAdminOrMod) {
			notify.warning('Solo un administrador o moderador puede activar un actor cultural.');
			return;
		}

		try {
			await cambiarEstadoMiActorApi(targetStatusActor.id, nextSt);
		} catch (err) {
			console.log('Error API cambiar estado:', err);
		}

		setActores((prev) => prev.map((a) => (a.id === targetStatusActor.id ? { ...a, estado: nextSt } : a)));

		let actionText = '';
		if (nextSt === 'I') actionText = 'fue dado de baja (Inactivo)';
		else if (nextSt === 'P') actionText = 'pasó a estado Pendiente de revisión';
		else if (nextSt === 'A') actionText = 'fue activado correctamente';

		notify.info(`"${targetStatusActor.nombre}" ${actionText}.`);
		setDeactivateConfirmModalOpen(false);
		setStatusModalOpen(false);
		setTargetStatusActor(null);
	};

	// Open Portfolio Modal
	const handleOpenPortfolioModal = async (actor: MyActor) => {
		setTargetPortfolioActor(actor);
		setNewPortfolioType('IMAGEN');
		setNewPortfolioUrl('');
		setNewPortfolioDesc('');
		setPortfolioModalOpen(true);
		setPortfolioLoading(true);

		try {
			const res = await listarPortafolioApi(actor.id);
			const portafolio = (res.data ?? []).map((item) => ({
				id: item.idItem ?? item.id ?? Date.now(),
				tipo: item.tipo,
				descripcion: item.descripcion,
				url: item.url,
			}));
			setActores((prev) => prev.map((item) => (item.id === actor.id ? { ...item, portafolio } : item)));
			setTargetPortfolioActor((prev) => (prev?.id === actor.id ? { ...prev, portafolio } : prev));
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'No se pudieron cargar los elementos del portafolio.';
			notify.error(errMsg);
		} finally {
			setPortfolioLoading(false);
		}
	};

	// Add Item to Portfolio
	const handleAddPortfolioItem = async () => {
		if (!targetPortfolioActor || !newPortfolioUrl.trim()) return;

		setPortfolioSubmitting(true);
		try {
			const res = await agregarItemPortafolioApi(targetPortfolioActor.id, {
				tipo: newPortfolioType,
				descripcion: newPortfolioDesc.trim() || 'Sin descripción',
				url: newPortfolioUrl.trim(),
			});

			const createdId = res?.data?.idItem ?? Date.now();
			const newItem: MyActorPortfolioItem = {
				id: createdId,
				tipo: newPortfolioType,
				url: newPortfolioUrl.trim(),
				descripcion: newPortfolioDesc.trim() || 'Sin descripción',
			};

			const updatedItems = [newItem, ...(targetPortfolioActor.portafolio || [])];

			setActores((prev) =>
				prev.map((a) => (a.id === targetPortfolioActor.id ? { ...a, portafolio: updatedItems } : a)),
			);
			setTargetPortfolioActor((prev) => (prev ? { ...prev, portafolio: updatedItems } : null));

			setNewPortfolioUrl('');
			setNewPortfolioDesc('');
			notify.success('Elemento agregado al portafolio.');
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'No se pudo agregar el elemento al portafolio.';
			notify.error(errMsg);
		} finally {
			setPortfolioSubmitting(false);
		}
	};

	// Delete Item from Portfolio
	const handleDeletePortfolioItem = async (itemId: number) => {
		if (!targetPortfolioActor) return;

		setDeletingPortfolioItemId(itemId);
		try {
			await eliminarItemPortafolioApi(targetPortfolioActor.id, itemId);

			const updatedItems = (targetPortfolioActor.portafolio || []).filter((item) => item.id !== itemId);

			setActores((prev) =>
				prev.map((a) => (a.id === targetPortfolioActor.id ? { ...a, portafolio: updatedItems } : a)),
			);
			setTargetPortfolioActor((prev) => (prev ? { ...prev, portafolio: updatedItems } : null));

			notify.success('Elemento eliminado del portafolio.');
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'No se pudo eliminar el elemento del portafolio.';
			notify.error(errMsg);
		} finally {
			setDeletingPortfolioItemId(null);
		}
	};

	// Open Events Modal
	const handleOpenEventsModal = async (actor: MyActor) => {
		setTargetEventsActor(actor);
		setNewEventNombre('');
		setNewEventFecha('');
		setNewEventDesc('');
		setEventsModalOpen(true);
		setEventsLoading(true);

		try {
			const res = await listarEventosApi(actor.id);
			const eventos = res.data ?? [];
			setActores((prev) => prev.map((item) => (item.id === actor.id ? { ...item, eventos } : item)));
			setTargetEventsActor((prev) => (prev?.id === actor.id ? { ...prev, eventos } : prev));
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'No se pudieron cargar los eventos.';
			notify.error(errMsg);
		} finally {
			setEventsLoading(false);
		}
	};

	// Add Event
	const handleAddEvent = async () => {
		if (!targetEventsActor || !newEventNombre.trim()) return;

		setEventCreating(true);
		try {
			const res = await agregarEventoApi(targetEventsActor.id, {
				nombre: newEventNombre.trim(),
				descripcion: newEventDesc.trim() || 'Sin descripción',
				fecha: newEventFecha.trim() || undefined,
			});
			if (!res.data.idEvento) throw new Error('El backend no devolvió el identificador del evento.');

			const newEvt: MyActorEvent = {
				id: res.data.idEvento,
				nombre: newEventNombre.trim(),
				fecha: newEventFecha.trim() || new Date().toISOString(),
				descripcion: newEventDesc.trim() || 'Sin descripción',
			};

			const updatedEvents = [...(targetEventsActor.eventos || []), newEvt].sort((a, b) =>
				a.fecha.localeCompare(b.fecha),
			);

			setActores((prev) =>
				prev.map((a) => (a.id === targetEventsActor.id ? { ...a, eventos: updatedEvents } : a)),
			);
			setTargetEventsActor((prev) => (prev ? { ...prev, eventos: updatedEvents } : null));

			setNewEventNombre('');
			setNewEventFecha('');
			setNewEventDesc('');
			notify.success('Evento agregado correctamente.');
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'No se pudo agregar el evento.';
			notify.error(errMsg);
		} finally {
			setEventCreating(false);
		}
	};

	// Delete Event
	const handleDeleteEvent = async (eventId: number) => {
		if (!targetEventsActor) return;

		setDeletingEventId(eventId);
		try {
			await eliminarEventoApi(targetEventsActor.id, eventId);

			const updatedEvents = (targetEventsActor.eventos || []).filter((e) => e.id !== eventId);

			setActores((prev) =>
				prev.map((a) => (a.id === targetEventsActor.id ? { ...a, eventos: updatedEvents } : a)),
			);
			setTargetEventsActor((prev) => (prev ? { ...prev, eventos: updatedEvents } : null));

			notify.success('Evento eliminado.');
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'No se pudo eliminar el evento.';
			notify.error(errMsg);
		} finally {
			setDeletingEventId(null);
		}
	};

	// Open Members Modal
	const handleOpenMembersModal = async (actor: MyActor) => {
		setTargetMembersActor(actor);
		setNewMemberType('NO_REGISTRADO');
		setNewMemberNombre('');
		setNewMemberApellido('');
		setNewMemberEmail('');
		setNewMemberRol('Integrante');
		setEditingMember(null);
		setMembersModalOpen(true);
		setMembersLoading(true);

		try {
			const res = await listarIntegrantesApi(actor.id);
			if (res?.data) {
				setIntegrantesList(res.data);
			} else {
				setIntegrantesList([]);
			}
		} catch (err) {
			const errMsg =
				err instanceof Error ? err.message : 'No se pudieron cargar los integrantes del actor cultural.';
			notify.error(errMsg);
			setIntegrantesList([]);
		} finally {
			setMembersLoading(false);
		}
	};

	const refreshMembers = async (idActor: number) => {
		const res = await listarIntegrantesApi(idActor);
		setIntegrantesList(res?.data ?? []);
	};

	// Add a registered member or a person without an account.
	const handleAddMember = async () => {
		if (!targetMembersActor) return;
		if (newMemberType === 'REGISTRADO' && !newMemberEmail.trim()) return;
		if (newMemberType === 'NO_REGISTRADO' && (!newMemberNombre.trim() || !newMemberApellido.trim())) return;

		setMemberSubmitting(true);
		try {
			if (newMemberType === 'REGISTRADO') {
				await agregarIntegranteApi(targetMembersActor.id, {
					email: newMemberEmail.trim(),
					rol: newMemberRol.trim() || 'Integrante',
				});
			} else {
				await agregarIntegranteNoRegistradoApi(targetMembersActor.id, {
					nombre: newMemberNombre.trim(),
					apellido: newMemberApellido.trim(),
					email: newMemberEmail.trim() || null,
					rol: newMemberRol.trim() || 'Integrante',
				});
			}

			notify.success('Integrante agregado correctamente.');
			setNewMemberNombre('');
			setNewMemberApellido('');
			setNewMemberEmail('');
			setNewMemberRol('Integrante');
			await refreshMembers(targetMembersActor.id);
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'Error al agregar integrante.';
			notify.error(errMsg);
		} finally {
			setMemberSubmitting(false);
		}
	};

	const handleStartEditMember = (member: IntegranteApiItem) => {
		setEditingMember(member);
		setEditMemberNombre(member.nombre);
		setEditMemberApellido(member.apellido);
		setEditMemberEmail(member.email ?? '');
		setEditMemberRol(member.rol);
	};

	const handleSaveMember = async () => {
		if (!targetMembersActor || !editingMember || !editMemberRol.trim()) return;

		setMemberSubmitting(true);
		try {
			if (editingMember.tipo === 'REGISTRADO' && editingMember.idUsuario) {
				await editarIntegranteApi(targetMembersActor.id, editingMember.idUsuario, {
					rol: editMemberRol.trim(),
				});
			} else if (editingMember.idIntegranteNoRegistrado) {
				await editarIntegranteNoRegistradoApi(targetMembersActor.id, editingMember.idIntegranteNoRegistrado, {
					nombre: editMemberNombre.trim(),
					apellido: editMemberApellido.trim(),
					email: editMemberEmail.trim() || null,
					rol: editMemberRol.trim(),
				});
			}

			notify.success('Integrante modificado correctamente.');
			setEditingMember(null);
			await refreshMembers(targetMembersActor.id);
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'Error al modificar integrante.';
			notify.error(errMsg);
		} finally {
			setMemberSubmitting(false);
		}
	};

	// Delete Member
	const handleDeleteMember = async (member: IntegranteApiItem) => {
		if (!targetMembersActor) return;

		const memberKey = getMemberKey(member);
		setDeletingMemberKey(memberKey);
		try {
			if (member.tipo === 'REGISTRADO' && member.idUsuario) {
				await eliminarIntegranteApi(targetMembersActor.id, member.idUsuario);
			} else if (member.idIntegranteNoRegistrado) {
				await eliminarIntegranteNoRegistradoApi(targetMembersActor.id, member.idIntegranteNoRegistrado);
			}
			notify.success('Integrante eliminado.');
			setIntegrantesList((prev) => prev.filter((item) => getMemberKey(item) !== memberKey));
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'Error al eliminar integrante.';
			notify.error(errMsg);
		} finally {
			setDeletingMemberKey(null);
		}
	};

	// Open Delete Confirmation Modal
	const handleOpenDeleteModal = (actor: MyActor) => {
		setTargetDeleteActor(actor);
		setDeleteConfirmInput('');
		setDeleteModalOpen(true);
	};

	// Confirm Delete (Borrar)
	const handleConfirmDelete = async () => {
		if (!targetDeleteActor) return;

		try {
			await eliminarMiActorApi(targetDeleteActor.id);
		} catch (err) {
			console.log('Error API eliminar actor:', err);
		}

		setActores((prev) => prev.filter((a) => a.id !== targetDeleteActor.id));
		notify.info(`"${targetDeleteActor.nombre}" fue eliminado permanentemente.`);
		setDeleteModalOpen(false);
		setTargetDeleteActor(null);
	};

	// Table Columns definition for AdminTable view mode
	const columns: AdminColumn<MyActor, string>[] = [
		{
			id: 'nombre',
			label: 'Actor cultural',
			minWidth: 200,
			render: (row) => (
				<Stack>
					<Typography variant="body2" fontWeight={600}>
						{row.nombre}
					</Typography>
					<Typography variant="caption" color="text.secondary">
						{typeLabels[row.tipoActor]}
					</Typography>
				</Stack>
			),
		},
		{
			id: 'categoria',
			label: 'Categoría',
			minWidth: 160,
			render: (row) => (
				<Stack spacing={0.25}>
					<Typography variant="body2">{row.categoria}</Typography>
					{row.subcategoria && (
						<Typography variant="caption" color="text.secondary">
							{row.subcategoria}
						</Typography>
					)}
				</Stack>
			),
		},
		{
			id: 'ubicacion',
			label: 'Ubicación',
			minWidth: 180,
			render: (row) => `${row.departamento} · ${row.localidad}`,
		},
		{
			id: 'estado',
			label: 'Estado',
			render: (row) => <Chip label={stateLabels[row.estado]} color={stateColors[row.estado]} size="small" />,
		},
		{
			id: 'acciones',
			label: 'Acciones',
			align: 'right',
			minWidth: 270,
			render: (row) => (
				<Stack direction="row" spacing={0.5} justifyContent="flex-end" onClick={(e) => e.stopPropagation()}>
					<Tooltip title="Ver perfil público">
						<IconButton
							size="small"
							color="info"
							onClick={() =>
								navigate(`/actores/${buildSlugConId(row.id, row.nombre)}?from=/mis-actores`, {
									state: { isMyActor: true },
								})
							}
						>
							<VisibilityIcon fontSize="small" />
						</IconButton>
					</Tooltip>

					<Tooltip title="Gestionar integrantes">
						<IconButton size="small" color="secondary" onClick={() => handleOpenMembersModal(row)}>
							<GroupIcon fontSize="small" />
						</IconButton>
					</Tooltip>

					<Tooltip title="Gestionar portafolio">
						<IconButton size="small" color="secondary" onClick={() => handleOpenPortfolioModal(row)}>
							<CollectionsIcon fontSize="small" />
						</IconButton>
					</Tooltip>

					<Tooltip title="Gestionar eventos">
						<IconButton size="small" color="secondary" onClick={() => handleOpenEventsModal(row)}>
							<EventIcon fontSize="small" />
						</IconButton>
					</Tooltip>

					<Tooltip title="Editar datos del actor">
						<IconButton size="small" color="primary" onClick={() => handleOpenEdit(row)}>
							<EditIcon fontSize="small" />
						</IconButton>
					</Tooltip>

					<Tooltip title="Gestionar estado">
						<IconButton size="small" color="warning" onClick={() => handleOpenStatusModal(row)}>
							<TuneIcon fontSize="small" />
						</IconButton>
					</Tooltip>

					<Tooltip title="Borrar definitivamente">
						<IconButton size="small" color="error" onClick={() => handleOpenDeleteModal(row)}>
							<DeleteOutlineIcon fontSize="small" />
						</IconButton>
					</Tooltip>
				</Stack>
			),
		},
	];

	return (
		<PageContainer title="Mis actores culturales" maxWidth={false}>
			<Stack spacing={3}>
				{/* --- Header Banner --- */}
				<Paper
					variant="outlined"
					sx={{
						p: { xs: 2.5, md: 3 },
						borderRadius: 2,
						bgcolor: 'background.paper',
						boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
					}}
				>
					<Stack
						direction={{ xs: 'column', sm: 'row' }}
						spacing={2}
						justifyContent="space-between"
						alignItems={{ xs: 'stretch', sm: 'center' }}
					>
						<Box>
							<Typography variant="body2" color="text.secondary">
								Gestioná tus perfiles artísticos. Podés editar sus datos, administrar portafolios y
								eventos, pasarlos a revisión (Pendiente), dar de baja o eliminarlos.
							</Typography>
						</Box>
						<Stack direction="row" spacing={1.5} sx={{ flexShrink: 0 }}>
							<Button
								variant="contained"
								color="primary"
								startIcon={<PersonAddIcon />}
								onClick={() => navigate('/actores/nuevo')}
								sx={{ fontWeight: 600, py: 1, px: 2.5 }}
							>
								Registrar nuevo actor
							</Button>
						</Stack>
					</Stack>
				</Paper>
				{catalogError && (
					<Alert severity="warning" variant="outlined">
						No se pudo cargar el catálogo para filtros y edición. {catalogError}
					</Alert>
				)}

				{/* --- Filters & View Controls --- */}
				<AdminFilters
					search={search}
					searchPlaceholder="Buscar por nombre, categoría, departamento o localidad..."
					onSearchChange={setSearch}
					onClear={() => {
						setSearch('');
						setCategoryFilter('');
						setStateFilter('');
					}}
				>
					<FormControl size="small" sx={{ minWidth: 180 }}>
						<InputLabel>Categoría</InputLabel>
						<Select
							value={categoryFilter}
							label="Categoría"
							onChange={(e) => setCategoryFilter(e.target.value)}
						>
							<MenuItem value="">Todas</MenuItem>
							{categoryOptions.map((category) => (
								<MenuItem key={category.id} value={category.nombre}>
									{category.nombre}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<FormControl size="small" sx={{ minWidth: 160 }}>
						<InputLabel>Estado</InputLabel>
						<Select value={stateFilter} label="Estado" onChange={(e) => setStateFilter(e.target.value)}>
							<MenuItem value="">Todos</MenuItem>
							{Object.entries(stateLabels).map(([key, label]) => (
								<MenuItem key={key} value={key}>
									{label}
								</MenuItem>
							))}
						</Select>
					</FormControl>

					<Box sx={{ flexGrow: 1 }} />

					<ToggleButtonGroup
						value={viewMode}
						exclusive
						onChange={(_e, nextMode) => nextMode && setViewMode(nextMode)}
						size="small"
						aria-label="Modo de vista"
					>
						<ToggleButton value="grid" aria-label="Vista en tarjetas">
							<Tooltip title="Vista en tarjetas">
								<GridViewIcon fontSize="small" />
							</Tooltip>
						</ToggleButton>
						<ToggleButton value="table" aria-label="Vista en tabla">
							<Tooltip title="Vista en tabla">
								<ViewListIcon fontSize="small" />
							</Tooltip>
						</ToggleButton>
					</ToggleButtonGroup>
				</AdminFilters>

				{/* --- Results Summary --- */}
				<Typography variant="body2" color="text.secondary">
					{loading
						? 'Cargando actores desde la base de datos...'
						: filteredActores.length === 1
							? '1 actor cultural propio encontrado'
							: `${filteredActores.length} actores culturales propios encontrados`}
				</Typography>

				{/* --- Content Area --- */}
				{loading ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
						<CircularProgress />
					</Box>
				) : error ? (
					<Alert severity="error" sx={{ my: 2 }}>
						{error}
					</Alert>
				) : filteredActores.length === 0 ? (
					<Paper variant="outlined" sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
						<Typography variant="h6" color="text.secondary" gutterBottom>
							No tenés actores registrados con estos criterios
						</Typography>
						<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
							{actores.length === 0
								? 'Todavía no registraste ningún actor cultural propio en tu cuenta.'
								: 'Modificá los filtros de búsqueda para volver a ver tus actores.'}
						</Typography>
						<Button
							variant="contained"
							startIcon={<PersonAddIcon />}
							onClick={() => navigate('/actores/nuevo')}
						>
							Registrar nuevo actor
						</Button>
					</Paper>
				) : viewMode === 'grid' ? (
					/* --- Cards Grid --- */
					<Grid container spacing={3}>
						{filteredActores.map((actor) => (
							<Grid key={actor.id} size={{ xs: 12, sm: 6, lg: 4 }}>
								<Card
									variant="outlined"
									sx={{
										height: '100%',
										display: 'flex',
										flexDirection: 'column',
										borderRadius: 2,
										transition: 'transform 0.2s ease, box-shadow 0.2s ease',
										'&:hover': {
											transform: 'translateY(-3px)',
											boxShadow: (theme) => theme.shadows[4],
										},
									}}
								>
									<Box
										component={RouterLink}
										to={`/actores/${buildSlugConId(actor.id, actor.nombre)}?from=/mis-actores`}
										state={{ isMyActor: true }}
										aria-label={`Ver perfil público de ${actor.nombre}`}
										sx={{ display: 'block', textDecoration: 'none' }}
									>
										{actor.fotoPerfilUrl ? (
											<CardMedia
												component="img"
												height="180"
												image={actor.fotoPerfilUrl}
												alt={`Foto de ${actor.nombre}`}
												sx={{ objectFit: 'cover' }}
											/>
										) : (
											<Box
												sx={{
													height: 180,
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													bgcolor: 'action.hover',
													color: 'text.secondary',
												}}
											>
												<Typography variant="body2" color="text.secondary">
													Sin foto de perfil
												</Typography>
											</Box>
										)}
									</Box>

									<CardContent sx={{ flexGrow: 1, p: 2.5 }}>
										<Stack
											direction="row"
											justifyContent="space-between"
											alignItems="flex-start"
											sx={{ mb: 1 }}
										>
											<Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.3 }}>
												{actor.nombre}
											</Typography>
											<Chip
												label={stateLabels[actor.estado]}
												color={stateColors[actor.estado]}
												size="small"
												sx={{ fontWeight: 600 }}
											/>
										</Stack>

										<Stack
											direction="row"
											spacing={0.75}
											flexWrap="wrap"
											useFlexGap
											sx={{ mb: 1.5 }}
										>
											<Chip
												icon={
													<CategoryIcon
														icono={actor.categoriaIcono || 'Category'}
														fontSize="small"
													/>
												}
												label={actor.categoria}
												size="small"
												color="primary"
												variant="outlined"
											/>
											<Chip label={typeLabels[actor.tipoActor]} size="small" variant="outlined" />
										</Stack>

										<Stack
											direction="row"
											spacing={0.5}
											alignItems="center"
											color="text.secondary"
											sx={{ mb: 1.5 }}
										>
											<LocationOnIcon fontSize="small" color="action" />
											<Typography variant="caption" fontWeight={500}>
												{actor.departamento} · {actor.localidad}
											</Typography>
										</Stack>

										<Typography
											variant="body2"
											color="text.secondary"
											sx={{
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												display: '-webkit-box',
												WebkitLineClamp: 3,
												WebkitBoxOrient: 'vertical',
											}}
										>
											{actor.descripcion}
										</Typography>
									</CardContent>

									<CardActions
										sx={{
											p: 2,
											pt: 1,
											justifyContent: 'space-between',
											borderTop: '1px solid',
											borderColor: 'divider',
										}}
									>
										<Button
											size="small"
											startIcon={<VisibilityIcon />}
											component={RouterLink}
											to={`/actores/${buildSlugConId(actor.id, actor.nombre)}?from=/mis-actores`}
											state={{ isMyActor: true }}
										>
											Ver perfil
										</Button>

										<Stack direction="row" spacing={0.5}>
											<Tooltip title="Gestionar integrantes">
												<IconButton
													size="small"
													color="secondary"
													onClick={() => handleOpenMembersModal(actor)}
												>
													<GroupIcon fontSize="small" />
												</IconButton>
											</Tooltip>

											<Tooltip title="Gestionar portafolio">
												<IconButton
													size="small"
													color="secondary"
													onClick={() => handleOpenPortfolioModal(actor)}
												>
													<CollectionsIcon fontSize="small" />
												</IconButton>
											</Tooltip>

											<Tooltip title="Gestionar eventos">
												<IconButton
													size="small"
													color="secondary"
													onClick={() => handleOpenEventsModal(actor)}
												>
													<EventIcon fontSize="small" />
												</IconButton>
											</Tooltip>

											<Tooltip title="Editar actor">
												<IconButton
													size="small"
													color="primary"
													onClick={() => handleOpenEdit(actor)}
												>
													<EditIcon fontSize="small" />
												</IconButton>
											</Tooltip>

											<Tooltip title="Gestionar estado">
												<IconButton
													size="small"
													color="warning"
													onClick={() => handleOpenStatusModal(actor)}
												>
													<TuneIcon fontSize="small" />
												</IconButton>
											</Tooltip>

											<Tooltip title="Borrar actor">
												<IconButton
													size="small"
													color="error"
													onClick={() => handleOpenDeleteModal(actor)}
												>
													<DeleteOutlineIcon fontSize="small" />
												</IconButton>
											</Tooltip>
										</Stack>
									</CardActions>
								</Card>
							</Grid>
						))}
					</Grid>
				) : (
					/* --- Table View --- */
					<AdminTable
						columns={columns}
						rows={filteredActores}
						getRowId={(row) => row.id}
						total={filteredActores.length}
						page={0}
						pageSize={25}
						sortBy="idActor"
						sortDir="ASC"
						loading={false}
						error={null}
						emptyMessage="No tenés actores cargados con esos criterios."
						onPageChange={() => {}}
						onSortChange={() => {}}
						onRowClick={(row) =>
							navigate(`/actores/${buildSlugConId(row.id, row.nombre)}?from=/mis-actores`, {
								state: { isMyActor: true },
							})
						}
					/>
				)}
			</Stack>

			{/* ========================================================================= */}
			{/* MODAL: Editar Actor                                                       */}
			{/* ========================================================================= */}
			<Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="md" fullWidth>
				<DialogTitle sx={{ pb: 1, fontWeight: 700 }}>Editar actor: {editingActor?.nombre}</DialogTitle>

				<Tabs
					value={editActiveTab}
					onChange={(_, val) => {
						setEditActiveTab(val);
					}}
					sx={{
						px: 3,
						borderBottom: 1,
						borderColor: 'divider',
						// bgcolor: 'background.paper',
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

							{/* Resumen de coordenadas */}
							{/* <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
								<Chip
									size="small"
									icon={<LocationOnIcon fontSize="small" />}
									label={`Latitud: ${formValues.latitud?.toFixed(5) ?? 'N/A'}`}
									variant="outlined"
								/>
								<Chip
									size="small"
									icon={<LocationOnIcon fontSize="small" />}
									label={`Longitud: ${formValues.longitud?.toFixed(5) ?? 'N/A'}`}
									variant="outlined"
								/>
								<Typography variant="caption" color="text.secondary">
									Hacé clic en el mapa o arrastrá el marcador rojo para ajustar la posición precisa.
								</Typography>
							</Stack>

							<Divider /> */}

							{/* Visibilidad pública de la ubicación */}
							<Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
								<Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
									¿Querés que esta ubicación aparezca en el mapa público provincial?
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
									mapa público, pero la administración podrá verificar la procedencia.
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
						<Button onClick={() => setEditModalOpen(false)}>Cancelar</Button>

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
										// disabled={!hasChanges}
										onClick={handleRequestEditSave}
									>
										Guardar cambios
									</Button>
								</span>
							</Tooltip>
						)}
					</Stack>
				</DialogActions>
			</Dialog>

			{/* ========================================================================= */}
			{/* MODAL: Confirmación de Edición                                           */}
			{/* ========================================================================= */}
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

			{/* ========================================================================= */}
			{/* MODAL: Gestionar Estado (Pendiente, Dar de baja, Activar solo Admin)     */}
			{/* ========================================================================= */}
			<Dialog open={statusModalOpen} onClose={() => setStatusModalOpen(false)} maxWidth="sm" fullWidth>
				<DialogTitle fontWeight={700}>Gestionar estado de: {targetStatusActor?.nombre}</DialogTitle>
				<DialogContent dividers>
					<Stack spacing={2.5}>
						<DialogContentText>
							Seleccioná el estado para tu actor cultural. Los usuarios pueden solicitar revisión
							(Pendiente) o dar de baja (Inactivo).
						</DialogContentText>

						<RadioGroup
							value={selectedNextStatus}
							onChange={(e) => setSelectedNextStatus(e.target.value as 'A' | 'P' | 'I')}
						>
							{/* Option P (Pendiente) is ONLY visible if actor is not currently Active */}
							{targetStatusActor?.estado !== 'A' && (
								<Box
									sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5, mb: 1 }}
								>
									<FormControlLabel
										value="P"
										control={<Radio size="small" color="warning" />}
										label={
											<Box>
												<Typography variant="subtitle2" fontWeight={700}>
													P - Pendiente de revisión
												</Typography>
												<Typography variant="caption" color="text.secondary">
													Marca la ficha para ser revisada y aprobada por los moderadores.
												</Typography>
											</Box>
										}
										sx={{ m: 0, alignItems: 'flex-start' }}
									/>
								</Box>
							)}

							<Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5, mb: 1 }}>
								<FormControlLabel
									value="I"
									control={<Radio size="small" color="error" />}
									label={
										<Box>
											<Typography variant="subtitle2" fontWeight={700} color="error.main">
												I - Dar de baja (Inactivo)
											</Typography>
											<Typography variant="caption" color="text.secondary">
												Desactiva temporalmente la visibilidad pública del actor.
											</Typography>
										</Box>
									}
									sx={{ m: 0, alignItems: 'flex-start' }}
								/>
							</Box>

							{/* Render 'A' option ONLY if user is Admin or Moderator */}
							{isAdminOrMod && (
								<Box
									sx={{
										border: '1px solid',
										borderColor: 'success.light',
										borderRadius: 1,
										p: 1.5,
										bgcolor: 'action.hover',
									}}
								>
									<FormControlLabel
										value="A"
										control={<Radio size="small" color="success" />}
										label={
											<Box>
												<Stack direction="row" spacing={1} alignItems="center">
													<Typography
														variant="subtitle2"
														fontWeight={700}
														color="success.main"
													>
														A - Activo (Público)
													</Typography>
													<Chip
														icon={<ShieldIcon fontSize="small" />}
														label="Rol Admin / Moderador"
														size="small"
														variant="outlined"
														color="success"
														sx={{ height: 20, fontSize: 10 }}
													/>
												</Stack>
												<Typography variant="caption" color="text.secondary">
													Aprobar y activar directamente la visibilidad pública de este actor.
												</Typography>
											</Box>
										}
										sx={{ m: 0, alignItems: 'flex-start' }}
									/>
								</Box>
							)}
						</RadioGroup>
					</Stack>
				</DialogContent>
				<DialogActions sx={{ p: 2 }}>
					<Button onClick={() => setStatusModalOpen(false)}>Cancelar</Button>
					<Button
						variant="contained"
						color={
							selectedNextStatus === 'I' ? 'error' : selectedNextStatus === 'P' ? 'warning' : 'success'
						}
						onClick={handleStatusModalSubmit}
					>
						{selectedNextStatus === 'I'
							? 'Dar de baja'
							: selectedNextStatus === 'P'
								? 'Pasar a pendiente'
								: 'Activar actor'}
					</Button>
				</DialogActions>
			</Dialog>

			{/* ========================================================================= */}
			{/* MODAL: Confirmación de Dar de baja                                       */}
			{/* ========================================================================= */}
			<Dialog
				open={deactivateConfirmModalOpen}
				onClose={() => setDeactivateConfirmModalOpen(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle fontWeight={700} color="error.main">
					¿Dar de baja actor cultural?
				</DialogTitle>
				<DialogContent dividers>
					<Stack spacing={2}>
						<Alert severity="warning" icon={<WarningAmberIcon />}>
							<strong>¡Atención!</strong> Al dar de baja a <strong>{targetStatusActor?.nombre}</strong>,
							la ficha quedará en estado <strong>Inactivo</strong> y se ocultará de las búsquedas públicas
							y del mapa cultural.
						</Alert>
						<DialogContentText>
							¿Estás seguro de que querés dar de baja este actor cultural? Podrás volver a solicitar
							revisión en cualquier momento.
						</DialogContentText>
					</Stack>
				</DialogContent>
				<DialogActions sx={{ p: 2 }}>
					<Button onClick={() => setDeactivateConfirmModalOpen(false)}>Cancelar</Button>
					<Button variant="contained" color="error" onClick={() => handleExecuteStatusChange('I')}>
						Sí, dar de baja
					</Button>
				</DialogActions>
			</Dialog>

			{/* ========================================================================= */}
			{/* MODAL: Gestionar Portafolio                                               */}
			{/* ========================================================================= */}
			<Dialog open={portfolioModalOpen} onClose={() => setPortfolioModalOpen(false)} maxWidth="md" fullWidth>
				<DialogTitle fontWeight={700}>Gestionar portafolio: {targetPortfolioActor?.nombre}</DialogTitle>
				<DialogContent dividers>
					<Stack spacing={3}>
						<Typography variant="body2" color="text.secondary">
							Agregá o eliminá elementos públicos para el portafolio de este actor (imágenes, enlaces o
							redes sociales).
						</Typography>

						{/* Form to add portfolio item */}
						<Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
							<Typography variant="subtitle2" fontWeight={700} gutterBottom>
								Agregar nuevo elemento al portafolio
							</Typography>
							<Grid container spacing={2} sx={{ mt: 0.5 }}>
								<Grid size={{ xs: 12, md: 3 }}>
									<FormControl fullWidth size="small">
										<InputLabel>Tipo</InputLabel>
										<Select
											value={newPortfolioType}
											label="Tipo"
											onChange={(e) =>
												setNewPortfolioType(e.target.value as 'IMAGEN' | 'LINK' | 'RRSS')
											}
										>
											<MenuItem value="IMAGEN">Imagen / Foto</MenuItem>
											<MenuItem value="RRSS">Red Social / Instagram</MenuItem>
											<MenuItem value="LINK">Link / Sitio Web</MenuItem>
										</Select>
									</FormControl>
								</Grid>
								<Grid size={{ xs: 12, md: 5 }}>
									<TextField
										fullWidth
										size="small"
										label="URL o Link"
										placeholder="https://..."
										value={newPortfolioUrl}
										onChange={(e) => setNewPortfolioUrl(e.target.value)}
									/>
								</Grid>
								<Grid size={{ xs: 12, md: 4 }}>
									<TextField
										fullWidth
										size="small"
										label="Descripción breve"
										placeholder="Ej. Show en vivo"
										value={newPortfolioDesc}
										onChange={(e) => setNewPortfolioDesc(e.target.value)}
									/>
								</Grid>
								<Grid size={{ xs: 12 }}>
									<Button
										variant="contained"
										size="small"
										startIcon={
											portfolioSubmitting ? (
												<CircularProgress size={16} color="inherit" />
											) : (
												<AddIcon />
											)
										}
										onClick={handleAddPortfolioItem}
										disabled={!newPortfolioUrl.trim() || portfolioSubmitting}
									>
										{portfolioSubmitting ? 'Agregando...' : 'Agregar elemento'}
									</Button>
								</Grid>
							</Grid>
						</Paper>

						{/* Existing portfolio items */}
						<Typography variant="subtitle2" fontWeight={700}>
							Elementos actuales ({(targetPortfolioActor?.portafolio || []).length})
						</Typography>

						{portfolioLoading ? (
							<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
								<CircularProgress size={32} />
							</Box>
						) : (targetPortfolioActor?.portafolio || []).length === 0 ? (
							<Alert severity="info">Este actor todavía no tiene elementos en su portafolio.</Alert>
						) : (
							<Stack spacing={1.5} divider={<Divider />}>
								{(targetPortfolioActor?.portafolio || []).map((item) => (
									<Stack
										key={item.id}
										direction="row"
										justifyContent="space-between"
										alignItems="center"
										spacing={2}
									>
										<Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
											{item.tipo === 'RRSS' ? (
												<InstagramIcon color="primary" />
											) : item.tipo === 'IMAGEN' ? (
												<CollectionsIcon color="secondary" />
											) : (
												<LanguageIcon color="action" />
											)}
											<Box sx={{ minWidth: 0 }}>
												<Typography variant="body2" fontWeight={600} noWrap>
													{item.descripcion}
												</Typography>
												<MuiLink
													href={item.url}
													target="_blank"
													underline="hover"
													variant="caption"
													color="text.secondary"
													noWrap
												>
													{item.url}
												</MuiLink>
											</Box>
										</Stack>
										<IconButton
											size="small"
											color="error"
											disabled={deletingPortfolioItemId === item.id}
											onClick={() => handleDeletePortfolioItem(item.id)}
										>
											{deletingPortfolioItemId === item.id ? (
												<CircularProgress size={16} color="inherit" />
											) : (
												<DeleteOutlineIcon fontSize="small" />
											)}
										</IconButton>
									</Stack>
								))}
							</Stack>
						)}
					</Stack>
				</DialogContent>
				<DialogActions sx={{ p: 2 }}>
					<Button variant="contained" onClick={() => setPortfolioModalOpen(false)}>
						Cerrar
					</Button>
				</DialogActions>
			</Dialog>

			{/* ========================================================================= */}
			{/* MODAL: Gestionar Eventos                                                  */}
			{/* ========================================================================= */}
			<Dialog open={eventsModalOpen} onClose={() => setEventsModalOpen(false)} maxWidth="md" fullWidth>
				<DialogTitle fontWeight={700}>Gestionar eventos: {targetEventsActor?.nombre}</DialogTitle>
				<DialogContent dividers>
					<Stack spacing={3}>
						<Typography variant="body2" color="text.secondary">
							Agregá o eliminá presentaciones, funciones o eventos programados para este actor cultural.
						</Typography>

						{/* Form to add new event */}
						<Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
							<Typography variant="subtitle2" fontWeight={700} gutterBottom>
								Agregar nuevo evento
							</Typography>
							<Grid container spacing={2} sx={{ mt: 0.5 }}>
								<Grid size={{ xs: 12, md: 5 }}>
									<TextField
										fullWidth
										required
										label="Nombre del evento"
										placeholder="Ej. Noche de Folklore en Anfiteatro"
										value={newEventNombre}
										onChange={(e) => setNewEventNombre(e.target.value)}
										slotProps={{ htmlInput: { maxLength: 45 } }}
									/>
								</Grid>
								<Grid size={{ xs: 12, md: 3 }}>
									<DatePickerSpanish
										label="Fecha"
										value={newEventFecha}
										onChange={(dateStr) => setNewEventFecha(dateStr)}
									/>
								</Grid>
								<Grid size={{ xs: 12, md: 4 }}>
									<TextField
										fullWidth
										label="Descripción / Lugar"
										placeholder="Ej. Plaza Independencia"
										value={newEventDesc}
										onChange={(e) => setNewEventDesc(e.target.value)}
										slotProps={{ htmlInput: { maxLength: 455 } }}
									/>
								</Grid>
								<Grid size={{ xs: 12 }}>
									<Button
										variant="contained"
										size="medium"
										startIcon={<AddIcon />}
										onClick={handleAddEvent}
										disabled={!newEventNombre.trim() || eventCreating || eventsLoading}
									>
										{eventCreating ? 'Agregando…' : 'Agregar evento'}
									</Button>
								</Grid>
							</Grid>
						</Paper>

						{/* Existing events */}
						<Typography variant="subtitle2" fontWeight={700}>
							Eventos programados ({(targetEventsActor?.eventos || []).length})
						</Typography>

						{eventsLoading ? (
							<Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
								<CircularProgress size={28} aria-label="Cargando eventos" />
							</Box>
						) : (targetEventsActor?.eventos || []).length === 0 ? (
							<Alert severity="info">Este actor no tiene eventos registrados actualmente.</Alert>
						) : (
							<Stack spacing={1.5} divider={<Divider />}>
								{(targetEventsActor?.eventos || []).map((evt) => (
									<Stack
										key={evt.id}
										direction="row"
										justifyContent="space-between"
										alignItems="center"
										spacing={2}
									>
										<Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
											<CalendarMonthIcon color="primary" />
											<Box sx={{ minWidth: 0 }}>
												<Typography variant="body2" fontWeight={600}>
													{evt.nombre}
												</Typography>
												<Typography variant="caption" color="text.secondary">
													📅 {formatEventDate(evt.fecha)} · {evt.descripcion}
												</Typography>
											</Box>
										</Stack>
										<IconButton
											size="small"
											color="error"
											onClick={() => handleDeleteEvent(evt.id)}
											disabled={deletingEventId !== null}
											aria-label={`Eliminar evento ${evt.nombre}`}
										>
											{deletingEventId === evt.id ? (
												<CircularProgress size={18} />
											) : (
												<DeleteOutlineIcon fontSize="small" />
											)}
										</IconButton>
									</Stack>
								))}
							</Stack>
						)}
					</Stack>
				</DialogContent>
				<DialogActions sx={{ p: 2 }}>
					<Button variant="contained" onClick={() => setEventsModalOpen(false)}>
						Cerrar
					</Button>
				</DialogActions>
			</Dialog>

			{/* ========================================================================= */}
			{/* MODAL: Gestionar Integrantes                                             */}
			{/* ========================================================================= */}
			<Dialog open={membersModalOpen} onClose={() => setMembersModalOpen(false)} maxWidth="md" fullWidth>
				<DialogTitle fontWeight={700}>Gestionar integrantes: {targetMembersActor?.nombre}</DialogTitle>
				<DialogContent dividers>
					<Stack spacing={3}>
						<Typography variant="body2" color="text.secondary">
							Administrá las personas que forman parte del actor, tengan o no una cuenta en la plataforma.
						</Typography>

						{/* Form to add member */}
						<Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
							<Typography variant="subtitle2" fontWeight={700} gutterBottom>
								Agregar integrante
							</Typography>
							<ToggleButtonGroup
								exclusive
								size="small"
								value={newMemberType}
								onChange={(_event, value: 'REGISTRADO' | 'NO_REGISTRADO' | null) => {
									if (value) setNewMemberType(value);
								}}
								sx={{ mt: 1, mb: 1 }}
							>
								<ToggleButton value="REGISTRADO">Usuario registrado</ToggleButton>
								<ToggleButton value="NO_REGISTRADO">Persona sin cuenta</ToggleButton>
							</ToggleButtonGroup>
							<Grid container spacing={2} sx={{ mt: 0.5 }}>
								{newMemberType === 'NO_REGISTRADO' && (
									<>
										<Grid size={{ xs: 12, md: 6 }}>
											<TextField
												fullWidth
												size="small"
												required
												label="Nombre"
												value={newMemberNombre}
												onChange={(e) => setNewMemberNombre(e.target.value)}
											/>
										</Grid>
										<Grid size={{ xs: 12, md: 6 }}>
											<TextField
												fullWidth
												size="small"
												required
												label="Apellido"
												value={newMemberApellido}
												onChange={(e) => setNewMemberApellido(e.target.value)}
											/>
										</Grid>
									</>
								)}
								<Grid size={{ xs: 12, md: 6 }}>
									<TextField
										fullWidth
										size="small"
										required={newMemberType === 'REGISTRADO'}
										type="email"
										label={
											newMemberType === 'REGISTRADO'
												? 'Correo del usuario registrado'
												: 'Correo electrónico (opcional)'
										}
										placeholder="ejemplo@correo.com"
										value={newMemberEmail}
										onChange={(e) => setNewMemberEmail(e.target.value)}
									/>
								</Grid>
								<Grid size={{ xs: 12, md: 6 }}>
									<TextField
										fullWidth
										size="small"
										label="Rol o función en el proyecto"
										placeholder="Ej. Músico, Director, Prensa, Técnico"
										value={newMemberRol}
										onChange={(e) => setNewMemberRol(e.target.value)}
									/>
								</Grid>
								<Grid size={{ xs: 12 }}>
									<Button
										variant="contained"
										size="small"
										startIcon={<GroupIcon />}
										onClick={handleAddMember}
										disabled={
											memberSubmitting ||
											!newMemberRol.trim() ||
											(newMemberType === 'REGISTRADO'
												? !newMemberEmail.trim()
												: !newMemberNombre.trim() || !newMemberApellido.trim())
										}
									>
										{memberSubmitting ? <CircularProgress size={18} /> : 'Agregar integrante'}
									</Button>
								</Grid>
							</Grid>
						</Paper>

						{/* Members list */}
						<Typography variant="subtitle2" fontWeight={700}>
							Integrantes vinculados ({integrantesList.length})
						</Typography>

						{membersLoading ? (
							<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
								<CircularProgress size={32} />
							</Box>
						) : integrantesList.length === 0 ? (
							<Alert severity="info">No se encontraron integrantes para este actor.</Alert>
						) : (
							<Stack spacing={1.5} divider={<Divider />}>
								{integrantesList.map((member) => {
									const memberKey = getMemberKey(member);
									const isEditing = editingMember && getMemberKey(editingMember) === memberKey;

									return isEditing ? (
										<Paper key={memberKey} variant="outlined" sx={{ p: 2 }}>
											<Grid container spacing={2}>
												{member.tipo === 'NO_REGISTRADO' && (
													<>
														<Grid size={{ xs: 12, sm: 6 }}>
															<TextField
																fullWidth
																required
																size="small"
																label="Nombre"
																value={editMemberNombre}
																onChange={(e) => setEditMemberNombre(e.target.value)}
															/>
														</Grid>
														<Grid size={{ xs: 12, sm: 6 }}>
															<TextField
																fullWidth
																required
																size="small"
																label="Apellido"
																value={editMemberApellido}
																onChange={(e) => setEditMemberApellido(e.target.value)}
															/>
														</Grid>
														<Grid size={{ xs: 12, sm: 6 }}>
															<TextField
																fullWidth
																size="small"
																type="email"
																label="Correo (opcional)"
																value={editMemberEmail}
																onChange={(e) => setEditMemberEmail(e.target.value)}
															/>
														</Grid>
													</>
												)}
												<Grid size={{ xs: 12, sm: 6 }}>
													<TextField
														fullWidth
														required
														size="small"
														label="Rol o función"
														value={editMemberRol}
														onChange={(e) => setEditMemberRol(e.target.value)}
													/>
												</Grid>
												<Grid size={{ xs: 12 }}>
													<Stack direction="row" spacing={1} justifyContent="flex-end">
														<Button
															size="small"
															onClick={() => setEditingMember(null)}
															disabled={memberSubmitting}
														>
															Cancelar
														</Button>
														<Button
															variant="contained"
															size="small"
															onClick={handleSaveMember}
															disabled={
																memberSubmitting ||
																!editMemberRol.trim() ||
																(member.tipo === 'NO_REGISTRADO' &&
																	(!editMemberNombre.trim() ||
																		!editMemberApellido.trim()))
															}
														>
															Guardar cambios
														</Button>
													</Stack>
												</Grid>
											</Grid>
										</Paper>
									) : (
										<Stack
											key={memberKey}
											direction="row"
											justifyContent="space-between"
											alignItems="center"
											spacing={2}
										>
											<Stack
												direction="row"
												spacing={1.5}
												alignItems="center"
												sx={{ minWidth: 0 }}
											>
												<Avatar
													sx={{
														bgcolor: member.esDueño ? 'primary.main' : 'secondary.main',
														width: 36,
														height: 36,
														fontSize: 14,
													}}
												>
													{member.nombre.charAt(0)}
													{member.apellido?.charAt(0) || ''}
												</Avatar>
												<Box sx={{ minWidth: 0 }}>
													<Stack direction="row" spacing={1} alignItems="center">
														<Typography variant="body2" fontWeight={600}>
															{member.nombre} {member.apellido}
														</Typography>
														{member.esDueño && (
															<Chip
																label="Dueño Principal"
																size="small"
																color="primary"
																sx={{ height: 20, fontSize: 10 }}
															/>
														)}
														{member.tipo === 'NO_REGISTRADO' && (
															<Chip
																label="Sin cuenta"
																size="small"
																variant="outlined"
																sx={{ height: 20, fontSize: 10 }}
															/>
														)}
													</Stack>
													<Typography variant="caption" color="text.secondary">
														{member.email ? `📧 ${member.email} · ` : ''}Rol: {member.rol}
													</Typography>
												</Box>
											</Stack>

											<Stack direction="row" spacing={0.5}>
												<IconButton
													size="small"
													color="primary"
													onClick={() => handleStartEditMember(member)}
													aria-label={`Editar a ${member.nombre} ${member.apellido}`}
												>
													<EditIcon fontSize="small" />
												</IconButton>
												{!member.esDueño && (
													<IconButton
														size="small"
														color="error"
														onClick={() => handleDeleteMember(member)}
														disabled={deletingMemberKey !== null}
														aria-label={`Eliminar a ${member.nombre} ${member.apellido}`}
													>
														{deletingMemberKey === memberKey ? (
															<CircularProgress size={18} />
														) : (
															<DeleteOutlineIcon fontSize="small" />
														)}
													</IconButton>
												)}
											</Stack>
										</Stack>
									);
								})}
							</Stack>
						)}
					</Stack>
				</DialogContent>
				<DialogActions sx={{ p: 2 }}>
					<Button variant="contained" onClick={() => setMembersModalOpen(false)}>
						Cerrar
					</Button>
				</DialogActions>
			</Dialog>

			{/* ========================================================================= */}
			{/* MODAL: Borrar (Eliminar) - Confirmación Estricta                          */}
			{/* ========================================================================= */}
			<Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} maxWidth="sm" fullWidth>
				<DialogTitle fontWeight={700} color="error.main">
					¿Eliminar permanentemente a {targetDeleteActor?.nombre}?
				</DialogTitle>
				<DialogContent dividers>
					<Stack spacing={2}>
						<Alert severity="error">
							<strong>¡Acción irreversible!</strong> Al eliminar a{' '}
							<strong>{targetDeleteActor?.nombre}</strong>, se borrarán de forma permanente su ficha
							cultural, portafolio y todos los eventos asociados.
						</Alert>
						<DialogContentText>
							Para confirmar la eliminación, escribí <strong>BORRAR</strong>:
						</DialogContentText>
						<TextField
							fullWidth
							size="small"
							autoFocus
							placeholder="Escribí BORRAR para confirmar"
							value={deleteConfirmInput}
							onChange={(e) => setDeleteConfirmInput(e.target.value)}
							color={isDeleteConfirmed ? 'error' : 'primary'}
							helperText={
								isDeleteConfirmed ? ' ' : 'Ingresá BORRAR para habilitar el botón de eliminación.'
							}
						/>
					</Stack>
				</DialogContent>
				<DialogActions sx={{ p: 2 }}>
					<Button onClick={() => setDeleteModalOpen(false)}>Cancelar</Button>
					<Button
						variant="contained"
						color="error"
						disabled={!isDeleteConfirmed}
						onClick={handleConfirmDelete}
					>
						Eliminar definitivamente
					</Button>
				</DialogActions>
			</Dialog>
		</PageContainer>
	);
}
