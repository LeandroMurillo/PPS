import * as React from 'react';
import { Outlet } from 'react-router';
import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import ChecklistIcon from '@mui/icons-material/Checklist';
import InfoIcon from '@mui/icons-material/Info';
import MapIcon from '@mui/icons-material/Map';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
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
		title: 'Admin',
	},
	{
		title: 'Confirmaciones',
		segment: 'confirmaciones',
		icon: <ChecklistIcon />,
	},
	{
		title: 'Usuarios',
		segment: 'usuarios',
		icon: <PersonIcon />,
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
};

export default function App() {
	return (
		<ReactRouterAppProvider navigation={NAVIGATION} branding={BRANDING}>
			<Outlet />
		</ReactRouterAppProvider>
	);
}
