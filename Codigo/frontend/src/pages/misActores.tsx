import * as React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router';

import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CollectionsIcon from '@mui/icons-material/Collections';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import GridViewIcon from '@mui/icons-material/GridView';
import InstagramIcon from '@mui/icons-material/Instagram';
import LanguageIcon from '@mui/icons-material/Language';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ShieldIcon from '@mui/icons-material/Shield';
import TuneIcon from '@mui/icons-material/Tune';
import ViewListIcon from '@mui/icons-material/ViewList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
	Alert,
	Avatar,
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	CardMedia,
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
	Grid,
	IconButton,
	InputLabel,
	Link as MuiLink,
	MenuItem,
	Paper,
	Radio,
	RadioGroup,
	Select,
	Snackbar,
	Stack,
	TextField,
	ToggleButton,
	ToggleButtonGroup,
	Tooltip,
	Typography,
} from '@mui/material';
import { PageContainer } from '@toolpad/core/PageContainer';

import AdminFilters from '../components/adminFilters';
import AdminTable, { type AdminColumn } from '../components/adminTable';
import CategoryIcon, { type CategoriaIcono } from '../components/categoryIcon';
import {
	agregarEventoApi,
	agregarIntegranteApi,
	agregarItemPortafolioApi,
	cambiarEstadoMiActorApi,
	editarMiActorApi,
	eliminarEventoApi,
	eliminarIntegranteApi,
	eliminarItemPortafolioApi,
	eliminarMiActorApi,
	listarIntegrantesApi,
	listarMisActoresApi,
	type IntegranteApiItem,
} from '../api/actores';
import { useAuth } from '../context/AuthContext';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { buildSlugConId } from '../utils/slug';

function getCategoryIdByName(categoriaNombre: string): number {
	const idx = CATEGORIAS_OPCIONES.indexOf(categoriaNombre);
	return idx >= 0 ? idx + 1 : 1;
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
	cuit: string | null;
	descripcion: string;
	fotoPerfilUrl: string | null;
	estado: 'A' | 'P' | 'I';
	fechaCreacion: string;
	portafolio?: MyActorPortfolioItem[];
	eventos?: MyActorEvent[];
};

const stateLabels = { A: 'Activo', P: 'Pendiente', I: 'Inactivo' } as const;
const stateColors = { A: 'success', P: 'warning', I: 'default' } as const;
const typeLabels = { INDIVIDUO: 'Individuo', COLECTIVO: 'Colectivo', ESPACIO: 'Espacio' } as const;

const departamentos = [
	'Burruyacú',
	'Capital',
	'Chicligasta',
	'Cruz Alta',
	'Famaillá',
	'Graneros',
	'Juan Bautista Alberdi',
	'La Cocha',
	'Leales',
	'Lules',
	'Monteros',
	'Río Chico',
	'Simoca',
	'Tafí del Valle',
	'Tafí Viejo',
	'Trancas',
	'Yerba Buena',
] as const;

const CATEGORIAS_OPCIONES = [
	'Música',
	'Artes escénicas',
	'Artes visuales',
	'Artesanías',
	'Gestión cultural',
	'Audiovisual',
	'Literatura',
];

const SUBCATEGORIAS_OPCIONES: Record<string, string[]> = {
	Música: ['Folklore y fusión', 'Música popular', 'Rock/Indie', 'Música académica', 'Cumbia/Tropical'],
	'Artes escénicas': ['Circo contemporáneo', 'Teatro independiente', 'Danza', 'Títeres', 'Performance'],
	'Artes visuales': ['Pintura y grabado', 'Escultura', 'Fotografía', 'Arte digital'],
	Artesanías: ['Alfarería tradicional', 'Textilería', 'Talla en madera', 'Cestería'],
	'Gestión cultural': ['Producción de eventos', 'Espacio comunitario', 'Formación artística'],
	Audiovisual: ['Cine independiente', 'Documental', 'Animación'],
	Literatura: ['Poesía', 'Narrativa', 'Edición independiente'],
};

export default function MisActoresPage() {
	const navigate = useNavigate();
	const { user } = useAuth();

	const currentUserId = user?.idUsuario ?? 1;
	const isAdminOrMod = user?.rol === 'ADMIN' || user?.rol === 'MODERADOR';

	const [actores, setActores] = React.useState<MyActor[]>([]);
	const [loading, setLoading] = React.useState<boolean>(true);
	const [error, setError] = React.useState<string | null>(null);

	const [search, setSearch] = React.useState('');
	const [categoryFilter, setCategoryFilter] = React.useState('');
	const [stateFilter, setStateFilter] = React.useState('');
	const [viewMode, setViewMode] = React.useState<'grid' | 'table'>('grid');

	// Edit Modal
	const [editModalOpen, setEditModalOpen] = React.useState(false);
	const [editingActor, setEditingActor] = React.useState<MyActor | null>(null);

	// Edit Confirmation Modal
	const [editConfirmModalOpen, setEditConfirmModalOpen] = React.useState(false);

	// Edit Form values
	const [formValues, setFormValues] = React.useState({
		nombre: '',
		tipoActor: 'COLECTIVO' as MyActor['tipoActor'],
		categoria: 'Música',
		subcategoria: 'Folklore y fusión',
		departamento: 'Capital',
		localidad: '',
		direccion: '',
		cuit: '',
		descripcion: '',
		fotoPerfilUrl: '',
	});
	const [formError, setFormError] = React.useState<string | null>(null);

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

	// Events Management Modal
	const [eventsModalOpen, setEventsModalOpen] = React.useState(false);
	const [targetEventsActor, setTargetEventsActor] = React.useState<MyActor | null>(null);
	const [newEventNombre, setNewEventNombre] = React.useState('');
	const [newEventFecha, setNewEventFecha] = React.useState('');
	const [newEventDesc, setNewEventDesc] = React.useState('');

	// Members Management Modal
	const [membersModalOpen, setMembersModalOpen] = React.useState(false);
	const [targetMembersActor, setTargetMembersActor] = React.useState<MyActor | null>(null);
	const [integrantesList, setIntegrantesList] = React.useState<IntegranteApiItem[]>([]);
	const [newMemberEmail, setNewMemberEmail] = React.useState('');
	const [newMemberRol, setNewMemberRol] = React.useState('Integrante');
	const [membersLoading, setMembersLoading] = React.useState(false);
	const [membersError, setMembersError] = React.useState<string | null>(null);

	// Delete Modal
	const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
	const [targetDeleteActor, setTargetDeleteActor] = React.useState<MyActor | null>(null);
	const [deleteConfirmInput, setDeleteConfirmInput] = React.useState('');

	const isDeleteConfirmed = React.useMemo(() => {
		if (!targetDeleteActor) return false;
		const cleanInput = deleteConfirmInput.trim().toUpperCase();
		return cleanInput === 'BORRAR' || cleanInput === 'ELIMINAR';
	}, [deleteConfirmInput, targetDeleteActor]);

	// Toast notification
	const [snackbarMessage, setSnackbarMessage] = React.useState<string | null>(null);

	const debouncedSearch = useDebouncedValue(search);

	// Load actors directly from backend API (database)
	const fetchMisActores = React.useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const res = await listarMisActoresApi({
				busqueda: debouncedSearch || undefined,
				estado: (stateFilter as 'A' | 'P' | 'I') || undefined,
				idCategoria: categoryFilter ? getCategoryIdByName(categoryFilter) : undefined,
			});

			if (res?.data) {
				const mapApiActores: MyActor[] = res.data.map((item) => ({
					id: item.id,
					idUsuarioDueno: currentUserId,
					nombre: item.nombre,
					tipoActor: item.tipoActor,
					categoria: item.categoria,
					categoriaIcono: item.categoriaIcono,
					subcategoria: item.subcategoria,
					departamento: item.ubicacion.departamento,
					localidad: item.ubicacion.localidad,
					direccion: item.ubicacion.direccion,
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
			setError('No se pudieron cargar los actores culturales desde la base de datos.');
			setActores([]);
		} finally {
			setLoading(false);
		}
	}, [debouncedSearch, stateFilter, categoryFilter, currentUserId]);

	React.useEffect(() => {
		fetchMisActores();
	}, [fetchMisActores]);

	// STRICT OWNER FILTERING: Only actors owned by the logged-in user
	const misActoresPropios = React.useMemo(() => {
		return actores.filter((actor) => actor.idUsuarioDueno === currentUserId);
	}, [actores, currentUserId]);

	// Filtered list based on search, category, and state
	const filteredActores = React.useMemo(() => {
		return misActoresPropios.filter((actor) => {
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
	}, [misActoresPropios, debouncedSearch, categoryFilter, stateFilter]);

	// Open Edit Dialog
	const handleOpenEdit = (actor: MyActor) => {
		setEditingActor(actor);
		setFormValues({
			nombre: actor.nombre,
			tipoActor: actor.tipoActor,
			categoria: actor.categoria,
			subcategoria: actor.subcategoria || '',
			departamento: actor.departamento,
			localidad: actor.localidad,
			direccion: actor.direccion,
			cuit: actor.cuit || '',
			descripcion: actor.descripcion,
			fotoPerfilUrl: actor.fotoPerfilUrl || '',
		});
		setFormError(null);
		setEditModalOpen(true);
	};

	// Request Edit Save -> Open Edit Confirmation Dialog
	const handleRequestEditSave = () => {
		if (!formValues.nombre.trim()) {
			setFormError('El nombre del actor es obligatorio.');
			return;
		}

		if (!editingActor) return;
		setFormError(null);
		setEditConfirmModalOpen(true);
	};

	// Confirm Edit Save
	const handleConfirmEditSave = async () => {
		if (!editingActor) return;

		// If edited by regular user, state automatically changes to 'P' for re-validation.
		const nextState: 'A' | 'P' | 'I' = isAdminOrMod ? editingActor.estado : 'P';

		try {
			await editarMiActorApi(editingActor.id, {
				idCategoria: getCategoryIdByName(formValues.categoria),
				nombre: formValues.nombre.trim(),
				descripcion: formValues.descripcion.trim(),
				fotoPerfilUrl: formValues.fotoPerfilUrl.trim() || null,
				cuit: formValues.cuit.trim() || null,
				tipoActor: formValues.tipoActor,
				departamento: formValues.departamento,
				localidad: formValues.localidad.trim(),
				direccion: formValues.direccion.trim(),
			});
		} catch (err) {
			console.log('Error API editar actor:', err);
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
							cuit: formValues.cuit.trim() || null,
							descripcion: formValues.descripcion.trim(),
							fotoPerfilUrl: formValues.fotoPerfilUrl.trim() || null,
							estado: nextState,
						}
					: actor,
			),
		);

		const msg = !isAdminOrMod
			? `Se actualizaron los datos de "${formValues.nombre.trim()}". La ficha pasó a estado Pendiente para su revisión.`
			: `Se actualizó "${formValues.nombre.trim()}" correctamente.`;

		setSnackbarMessage(msg);
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
			setSnackbarMessage('Solo un administrador o moderador puede activar un actor cultural.');
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

		setSnackbarMessage(`"${targetStatusActor.nombre}" ${actionText}.`);
		setDeactivateConfirmModalOpen(false);
		setStatusModalOpen(false);
		setTargetStatusActor(null);
	};

	// Open Portfolio Modal
	const handleOpenPortfolioModal = (actor: MyActor) => {
		setTargetPortfolioActor(actor);
		setNewPortfolioType('IMAGEN');
		setNewPortfolioUrl('');
		setNewPortfolioDesc('');
		setPortfolioModalOpen(true);
	};

	// Add Item to Portfolio
	const handleAddPortfolioItem = async () => {
		if (!targetPortfolioActor || !newPortfolioUrl.trim()) return;

		let createdId = Date.now();
		try {
			const res = await agregarItemPortafolioApi(targetPortfolioActor.id, {
				tipo: newPortfolioType,
				descripcion: newPortfolioDesc.trim() || 'Sin descripción',
				url: newPortfolioUrl.trim(),
			});
			if (res?.data?.idItem) {
				createdId = res.data.idItem;
			}
		} catch (err) {
			console.log('Error API agregar portafolio:', err);
		}

		const newItem: MyActorPortfolioItem = {
			id: createdId,
			tipo: newPortfolioType,
			url: newPortfolioUrl.trim(),
			descripcion: newPortfolioDesc.trim() || 'Sin descripción',
		};

		const updatedItems = [...(targetPortfolioActor.portafolio || []), newItem];

		setActores((prev) =>
			prev.map((a) => (a.id === targetPortfolioActor.id ? { ...a, portafolio: updatedItems } : a)),
		);
		setTargetPortfolioActor((prev) => (prev ? { ...prev, portafolio: updatedItems } : null));

		setNewPortfolioUrl('');
		setNewPortfolioDesc('');
		setSnackbarMessage('Elemento agregado al portafolio.');
	};

	// Delete Item from Portfolio
	const handleDeletePortfolioItem = async (itemId: number) => {
		if (!targetPortfolioActor) return;

		try {
			await eliminarItemPortafolioApi(targetPortfolioActor.id, itemId);
		} catch (err) {
			console.log('Error API eliminar portafolio:', err);
		}

		const updatedItems = (targetPortfolioActor.portafolio || []).filter((item) => item.id !== itemId);

		setActores((prev) =>
			prev.map((a) => (a.id === targetPortfolioActor.id ? { ...a, portafolio: updatedItems } : a)),
		);
		setTargetPortfolioActor((prev) => (prev ? { ...prev, portafolio: updatedItems } : null));

		setSnackbarMessage('Elemento eliminado del portafolio.');
	};

	// Open Events Modal
	const handleOpenEventsModal = (actor: MyActor) => {
		setTargetEventsActor(actor);
		setNewEventNombre('');
		setNewEventFecha('');
		setNewEventDesc('');
		setEventsModalOpen(true);
	};

	// Add Event
	const handleAddEvent = async () => {
		if (!targetEventsActor || !newEventNombre.trim()) return;

		let createdId = Date.now();
		try {
			const res = await agregarEventoApi(targetEventsActor.id, {
				nombre: newEventNombre.trim(),
				descripcion: newEventDesc.trim() || 'Sin descripción',
				fecha: newEventFecha.trim() || undefined,
			});
			if (res?.data?.idEvento) {
				createdId = res.data.idEvento;
			}
		} catch (err) {
			console.log('Error API agregar evento:', err);
		}

		const newEvt: MyActorEvent = {
			id: createdId,
			nombre: newEventNombre.trim(),
			fecha: newEventFecha.trim() || new Date().toISOString().split('T')[0],
			descripcion: newEventDesc.trim() || 'Sin descripción',
		};

		const updatedEvents = [...(targetEventsActor.eventos || []), newEvt];

		setActores((prev) => prev.map((a) => (a.id === targetEventsActor.id ? { ...a, eventos: updatedEvents } : a)));
		setTargetEventsActor((prev) => (prev ? { ...prev, eventos: updatedEvents } : null));

		setNewEventNombre('');
		setNewEventFecha('');
		setNewEventDesc('');
		setSnackbarMessage('Evento agregado correctamente.');
	};

	// Delete Event
	const handleDeleteEvent = async (eventId: number) => {
		if (!targetEventsActor) return;

		try {
			await eliminarEventoApi(targetEventsActor.id, eventId);
		} catch (err) {
			console.log('Error API eliminar evento:', err);
		}

		const updatedEvents = (targetEventsActor.eventos || []).filter((e) => e.id !== eventId);

		setActores((prev) => prev.map((a) => (a.id === targetEventsActor.id ? { ...a, eventos: updatedEvents } : a)));
		setTargetEventsActor((prev) => (prev ? { ...prev, eventos: updatedEvents } : null));

		setSnackbarMessage('Evento eliminado.');
	};

	// Open Members Modal
	const handleOpenMembersModal = async (actor: MyActor) => {
		setTargetMembersActor(actor);
		setNewMemberEmail('');
		setNewMemberRol('Integrante');
		setMembersError(null);
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
			console.log('Error al listar integrantes:', err);
			setIntegrantesList([
				{
					idUsuario: currentUserId,
					nombre: user?.nombre || 'Contacto',
					apellido: user?.apellido || 'Principal',
					email: user?.email || 'usuario@cultura.gob.ar',
					rol: 'Contacto Principal',
					esDueño: true,
				},
			]);
		} finally {
			setMembersLoading(false);
		}
	};

	// Add Member by Email
	const handleAddMember = async () => {
		if (!targetMembersActor || !newMemberEmail.trim()) return;

		setMembersError(null);
		try {
			await agregarIntegranteApi(targetMembersActor.id, {
				email: newMemberEmail.trim(),
				rol: newMemberRol.trim() || 'Integrante',
			});

			setSnackbarMessage('Integrante agregado correctamente.');
			setNewMemberEmail('');
			setNewMemberRol('Integrante');

			const res = await listarIntegrantesApi(targetMembersActor.id);
			if (res?.data) {
				setIntegrantesList(res.data);
			}
		} catch (err) {
			setMembersError(err instanceof Error ? err.message : 'Error al agregar integrante.');
		}
	};

	// Delete Member
	const handleDeleteMember = async (idUsuarioAEliminar: number) => {
		if (!targetMembersActor) return;

		setMembersError(null);
		try {
			await eliminarIntegranteApi(targetMembersActor.id, idUsuarioAEliminar);
			setSnackbarMessage('Integrante eliminado.');
			setIntegrantesList((prev) => prev.filter((m) => m.idUsuario !== idUsuarioAEliminar));
		} catch (err) {
			setMembersError(err instanceof Error ? err.message : 'Error al eliminar integrante.');
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
		setSnackbarMessage(`"${targetDeleteActor.nombre}" fue eliminado permanentemente.`);
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
							onClick={() => navigate(`/actores/${buildSlugConId(row.id, row.nombre)}`)}
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
							{CATEGORIAS_OPCIONES.map((cat) => (
								<MenuItem key={cat} value={cat}>
									{cat}
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
							{misActoresPropios.length === 0
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
											to={`/actores/${buildSlugConId(actor.id, actor.nombre)}`}
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
						onRowClick={(row) => navigate(`/actores/${buildSlugConId(row.id, row.nombre)}`)}
					/>
				)}
			</Stack>

			{/* ========================================================================= */}
			{/* MODAL: Editar Actor                                                       */}
			{/* ========================================================================= */}
			<Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="md" fullWidth>
				<DialogTitle fontWeight={700}>Editar actor: {editingActor?.nombre}</DialogTitle>
				<DialogContent dividers>
					<Stack spacing={2.5} sx={{ pt: 1 }}>
						{!isAdminOrMod && (
							<Alert severity="info">
								Nota: Al guardar cambios en tu actor cultural, su estado pasará automáticamente a{' '}
								<strong>Pendiente de revisión</strong> hasta que un moderador lo apruebe.
							</Alert>
						)}
						{formError && <Alert severity="error">{formError}</Alert>}

						<Grid container spacing={2}>
							<Grid size={{ xs: 12, md: 8 }}>
								<TextField
									fullWidth
									required
									label="Nombre público del actor"
									placeholder="Ej. Compañía Circo Fuego"
									value={formValues.nombre}
									onChange={(e) => setFormValues((v) => ({ ...v, nombre: e.target.value }))}
								/>
							</Grid>
							<Grid size={{ xs: 12, md: 4 }}>
								<FormControl fullWidth required>
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
								</FormControl>
							</Grid>

							<Grid size={{ xs: 12, md: 6 }}>
								<FormControl fullWidth required>
									<InputLabel>Categoría principal</InputLabel>
									<Select
										value={formValues.categoria}
										label="Categoría principal"
										onChange={(e) => {
											const cat = e.target.value;
											const subOpts = SUBCATEGORIAS_OPCIONES[cat] || [];
											setFormValues((v) => ({
												...v,
												categoria: cat,
												subcategoria: subOpts[0] || '',
											}));
										}}
									>
										{CATEGORIAS_OPCIONES.map((cat) => (
											<MenuItem key={cat} value={cat}>
												{cat}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Grid>

							<Grid size={{ xs: 12, md: 6 }}>
								<FormControl fullWidth>
									<InputLabel>Subcategoría</InputLabel>
									<Select
										value={formValues.subcategoria}
										label="Subcategoría"
										onChange={(e) => setFormValues((v) => ({ ...v, subcategoria: e.target.value }))}
									>
										{(SUBCATEGORIAS_OPCIONES[formValues.categoria] || []).map((sub) => (
											<MenuItem key={sub} value={sub}>
												{sub}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Grid>

							<Grid size={{ xs: 12, md: 4 }}>
								<FormControl fullWidth required>
									<InputLabel>Departamento</InputLabel>
									<Select
										value={formValues.departamento}
										label="Departamento"
										onChange={(e) => setFormValues((v) => ({ ...v, departamento: e.target.value }))}
									>
										{departamentos.map((dep) => (
											<MenuItem key={dep} value={dep}>
												{dep}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Grid>

							<Grid size={{ xs: 12, md: 4 }}>
								<TextField
									fullWidth
									required
									label="Localidad"
									placeholder="Ej. San Miguel de Tucumán"
									value={formValues.localidad}
									onChange={(e) => setFormValues((v) => ({ ...v, localidad: e.target.value }))}
								/>
							</Grid>

							<Grid size={{ xs: 12, md: 4 }}>
								<TextField
									fullWidth
									label="Dirección / Calle"
									placeholder="Ej. Av. Mate de Luna 2100"
									value={formValues.direccion}
									onChange={(e) => setFormValues((v) => ({ ...v, direccion: e.target.value }))}
								/>
							</Grid>

							<Grid size={{ xs: 12, md: 6 }}>
								<TextField
									fullWidth
									label="CUIT / CUIL (Opcional)"
									placeholder="Ej. 30712345678"
									value={formValues.cuit}
									onChange={(e) => setFormValues((v) => ({ ...v, cuit: e.target.value }))}
								/>
							</Grid>

							<Grid size={{ xs: 12, md: 6 }}>
								<TextField
									fullWidth
									label="URL de Foto de Perfil (Opcional)"
									placeholder="https://..."
									value={formValues.fotoPerfilUrl}
									onChange={(e) => setFormValues((v) => ({ ...v, fotoPerfilUrl: e.target.value }))}
								/>
							</Grid>

							<Grid size={{ xs: 12 }}>
								<TextField
									fullWidth
									multiline
									rows={3}
									label="Descripción o trayectoria"
									placeholder="Resumen del proyecto artístico, trayectoria e información destacada..."
									value={formValues.descripcion}
									onChange={(e) => setFormValues((v) => ({ ...v, descripcion: e.target.value }))}
								/>
							</Grid>
						</Grid>
					</Stack>
				</DialogContent>
				<DialogActions sx={{ p: 2 }}>
					<Button onClick={() => setEditModalOpen(false)}>Cancelar</Button>
					<Button variant="contained" color="primary" onClick={handleRequestEditSave}>
						Guardar cambios
					</Button>
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

						{!isAdminOrMod && (
							<Alert severity="info">
								Al guardar los cambios, la ficha del actor pasará automáticamente al estado{' '}
								<strong>Pendiente de revisión</strong> para su aprobación por parte de los moderadores.
							</Alert>
						)}
					</Stack>
				</DialogContent>
				<DialogActions sx={{ p: 2 }}>
					<Button onClick={() => setEditConfirmModalOpen(false)}>Cancelar</Button>
					<Button variant="contained" color="primary" onClick={handleConfirmEditSave}>
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
										startIcon={<AddIcon />}
										onClick={handleAddPortfolioItem}
										disabled={!newPortfolioUrl.trim()}
									>
										Agregar elemento
									</Button>
								</Grid>
							</Grid>
						</Paper>

						{/* Existing portfolio items */}
						<Typography variant="subtitle2" fontWeight={700}>
							Elementos actuales ({(targetPortfolioActor?.portafolio || []).length})
						</Typography>

						{(targetPortfolioActor?.portafolio || []).length === 0 ? (
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
											onClick={() => handleDeletePortfolioItem(item.id)}
										>
											<DeleteOutlineIcon fontSize="small" />
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
										size="small"
										required
										label="Nombre del evento"
										placeholder="Ej. Noche de Folklore en Anfiteatro"
										value={newEventNombre}
										onChange={(e) => setNewEventNombre(e.target.value)}
									/>
								</Grid>
								<Grid size={{ xs: 12, md: 3 }}>
									<TextField
										fullWidth
										size="small"
										type="date"
										label="Fecha"
										slotProps={{ inputLabel: { shrink: true } }}
										value={newEventFecha}
										onChange={(e) => setNewEventFecha(e.target.value)}
									/>
								</Grid>
								<Grid size={{ xs: 12, md: 4 }}>
									<TextField
										fullWidth
										size="small"
										label="Descripción / Lugar"
										placeholder="Ej. Plaza Independencia"
										value={newEventDesc}
										onChange={(e) => setNewEventDesc(e.target.value)}
									/>
								</Grid>
								<Grid size={{ xs: 12 }}>
									<Button
										variant="contained"
										size="small"
										startIcon={<AddIcon />}
										onClick={handleAddEvent}
										disabled={!newEventNombre.trim()}
									>
										Agregar evento
									</Button>
								</Grid>
							</Grid>
						</Paper>

						{/* Existing events */}
						<Typography variant="subtitle2" fontWeight={700}>
							Eventos programados ({(targetEventsActor?.eventos || []).length})
						</Typography>

						{(targetEventsActor?.eventos || []).length === 0 ? (
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
													📅 {evt.fecha} · {evt.descripcion}
												</Typography>
											</Box>
										</Stack>
										<IconButton
											size="small"
											color="error"
											onClick={() => handleDeleteEvent(evt.id)}
										>
											<DeleteOutlineIcon fontSize="small" />
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
				<DialogTitle fontWeight={700}>
					Gestionar integrantes: {targetMembersActor?.nombre}
				</DialogTitle>
				<DialogContent dividers>
					<Stack spacing={3}>
						<Typography variant="body2" color="text.secondary">
							Administrá los usuarios que forman parte de este colectivo, espacio o proyecto artístico.
						</Typography>

						{membersError && <Alert severity="error">{membersError}</Alert>}

						{/* Form to add member */}
						<Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
							<Typography variant="subtitle2" fontWeight={700} gutterBottom>
								Agregar nuevo integrante por correo electrónico
							</Typography>
							<Grid container spacing={2} sx={{ mt: 0.5 }}>
								<Grid size={{ xs: 12, md: 6 }}>
									<TextField
										fullWidth
										size="small"
										required
										type="email"
										label="Correo electrónico del usuario"
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
										disabled={!newMemberEmail.trim()}
									>
										Agregar integrante
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
							<Alert severity="info">No se encontraron integrantes registrados para este actor.</Alert>
						) : (
							<Stack spacing={1.5} divider={<Divider />}>
								{integrantesList.map((member) => (
									<Stack
										key={member.idUsuario}
										direction="row"
										justifyContent="space-between"
										alignItems="center"
										spacing={2}
									>
										<Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
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
												</Stack>
												<Typography variant="caption" color="text.secondary">
													📧 {member.email} · Rol: {member.rol}
												</Typography>
											</Box>
										</Stack>

										{!member.esDueño && (
											<IconButton
												size="small"
												color="error"
												onClick={() => handleDeleteMember(member.idUsuario)}
											>
												<DeleteOutlineIcon fontSize="small" />
											</IconButton>
										)}
									</Stack>
								))}
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

			{/* Toast notification */}
			<Snackbar
				open={Boolean(snackbarMessage)}
				autoHideDuration={4000}
				onClose={() => setSnackbarMessage(null)}
				message={snackbarMessage}
			/>
		</PageContainer>
	);
}
