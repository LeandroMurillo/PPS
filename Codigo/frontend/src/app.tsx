import * as React from 'react';
import { Outlet } from 'react-router';
import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import AddCommentIcon from '@mui/icons-material/AddComment';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import CategoryIcon from '@mui/icons-material/Category';
import ChecklistIcon from '@mui/icons-material/Checklist';
import GroupIcon from '@mui/icons-material/Group';
import InfoIcon from '@mui/icons-material/Info';
import MapIcon from '@mui/icons-material/Map';
import PeopleIcon from '@mui/icons-material/People';
import type { Navigation } from '@toolpad/core/AppProvider';

const NAVIGATION: Navigation = [
	{
		kind: 'header',
		title: 'Público',
	},
	{
		title: 'Mapa',
		icon: <MapIcon />,
	},
	{
		title: 'Actores',
		segment: 'actores',
		icon: <PeopleIcon />,
	},
	{
		kind: 'header',
		title: 'Usuario',
	},
	{
		title: 'Mis actores',
		segment: 'actoresUsuario',
		icon: <PeopleIcon />,
	},
	{
		title: 'Convocatorias',
		segment: 'convocatoriasUsuario',
		icon: <AnnouncementIcon />,
	},
	{
		kind: 'header',
		title: 'Admin',
	},
	{
		title: 'Confirmaciones',
		segment: 'confirmaciones',
		icon: <ChecklistIcon />,
	},
	{
		title: 'Actores',
		segment: 'actoresAdmin',
		icon: <PeopleIcon />,
	},
	{
		title: 'Usuarios',
		segment: 'usuarios',
		icon: <GroupIcon />,
		pattern: 'usuarios{/:usuarioId}*',
	},
	{
		title: 'Convocatorias',
		segment: 'convocatoriasAdmin',
		icon: <AddCommentIcon />,
	},
	{
		title: 'Categorías',
		segment: 'categorias',
		icon: <CategoryIcon />,
		pattern: 'categorias{/:categoriaId}*',
	},
	{
		kind: 'divider',
	},
	{
		title: 'Acerca de',
		segment: 'acerca',
		icon: <InfoIcon />,
	},
	// {
	// 	segment: 'employees',
	// 	title: 'Employees',
	// 	icon: <PersonIcon />,
	// 	pattern: 'employees{/:employeeId}*',
	// },
];

const BRANDING = {
	title: 'Mosaico Cultural',
	logo: <img src="/favicon.svg" alt="Mosaico Cultural" style={{ width: 24, height: 24 }} />,
};

const LOCALE_TEXT = {
	createNewButtonLabel: 'Crear nueva',
	reloadButtonLabel: 'Recargar datos',
	createLabel: 'Crear',
	createSuccessMessage: 'Elemento creado correctamente.',
	createErrorMessage: 'No se pudo crear el elemento. Motivo:',
	editLabel: 'Modificar',
	editSuccessMessage: 'Elemento modificado correctamente.',
	editErrorMessage: 'No se pudo modificar el elemento. Motivo:',
	deleteLabel: 'Borrar',
	deleteConfirmTitle: '¿Borrar elemento?',
	deleteConfirmMessage: 'Esta acción dará de baja el elemento. ¿Querés continuar?',
	deleteConfirmLabel: 'Borrar',
	deleteCancelLabel: 'Cancelar',
	deleteSuccessMessage: 'Elemento dado de baja correctamente.',
	deleteErrorMessage: 'No se pudo dar de baja el elemento. Motivo:',
	deletedItemMessage: 'Este elemento fue dado de baja.',
};

export default function App() {
	return (
		<ReactRouterAppProvider navigation={NAVIGATION} branding={BRANDING} localeText={LOCALE_TEXT}>
			<Outlet />
		</ReactRouterAppProvider>
	);
}
