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

export default function App() {
	return (
		<ReactRouterAppProvider navigation={NAVIGATION} branding={BRANDING}>
			<Outlet />
		</ReactRouterAppProvider>
	);
}
