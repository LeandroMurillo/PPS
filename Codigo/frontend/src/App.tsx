import * as React from 'react';
import MapIcon from '@mui/icons-material/Map';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import ChecklistIcon from '@mui/icons-material/Checklist';
import { Outlet } from 'react-router';
import { ReactRouterAppProvider } from '@toolpad/core/react-router';
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
