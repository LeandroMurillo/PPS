import * as React from 'react';
import { Outlet, useNavigate } from 'react-router';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddCommentIcon from '@mui/icons-material/AddComment';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CategoryIcon from '@mui/icons-material/Category';
import ChecklistIcon from '@mui/icons-material/Checklist';
import CodeIcon from '@mui/icons-material/Code';
import GroupIcon from '@mui/icons-material/Group';
import MapIcon from '@mui/icons-material/Map';
import PeopleIcon from '@mui/icons-material/People';
import type { Navigation } from '@toolpad/core/AppProvider';
import { ReactRouterAppProvider } from '@toolpad/core/react-router';

import { ToastContainer } from 'react-toastify';

import theme from '../theme';
import { AuthProvider, useAuth } from './context/AuthContext';

import 'react-toastify/dist/ReactToastify.css';

const BRANDING = {
	title: 'Mosaico Cultural',
	logo: <img src="/favicon.svg" alt="Mosaico Cultural" style={{ width: 24, height: 24 }} />,
};

const LOCALE_TEXT = {
	accountSignInLabel: 'Iniciar sesión',
	accountSignOutLabel: 'Cerrar sesión',
	createNewButtonLabel: 'Crear nueva',
	reloadButtonLabel: 'Recargar datos',
	createLabel: 'Crear',
	createSuccessMessage: 'Elemento creado.',
	createErrorMessage: 'No se pudo crear el elemento. Motivo:',
	editLabel: 'Modificar',
	editSuccessMessage: 'Elemento modificado.',
	editErrorMessage: 'No se pudo modificar el elemento. Motivo:',
	deleteLabel: 'Dar de baja',
	deleteConfirmTitle: '¿Dar de baja el elemento?',
	deleteConfirmMessage: 'Esta acción dará de baja el elemento. ¿Querés continuar?',
	deleteConfirmLabel: 'Dar de baja',
	deleteCancelLabel: 'Cancelar',
	deleteSuccessMessage: 'Elemento dado de baja.',
	deleteErrorMessage: 'No se pudo dar de baja el elemento. Motivo:',
	deletedItemMessage: 'Este elemento fue dado de baja.',
};

function AppContent() {
	const navigate = useNavigate();
	const { session, logout, user } = useAuth();

	const navigation: Navigation = React.useMemo(() => {
		const nav: Navigation = [
			{
				title: 'Mapa cultural',
				icon: <MapIcon />,
			},
			{
				title: 'Actores culturales',
				segment: 'actores',
				icon: <PeopleIcon />,
			},
			{
				title: 'Próximos eventos',
				segment: 'eventos',
				icon: <CalendarMonthIcon />,
			},
		];

		if (user) {
			nav.push(
				{
					kind: 'divider',
				},
				{
					kind: 'header',
					title: 'Usuario',
				},
				{
					title: 'Mis actores',
					segment: 'mis-actores',
					icon: <PeopleIcon />,
				},
				{
					title: 'Convocatorias',
					segment: 'convocatoriasUsuario',
					icon: <AnnouncementIcon />,
				},
				{
					title: 'Mi perfil',
					segment: 'perfil',
					icon: <AccountCircleIcon />,
				},
			);

			if (user.rol === 'ADMIN' || user.rol === 'MODERADOR') {
				nav.push(
					{
						kind: 'divider',
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
						pattern: 'actoresAdmin{/:actorSlug}*',
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
				);
			}

			if (user.rol === 'ADMIN') {
				nav.push(
					{
						title: 'Categorías',
						segment: 'categorias',
						icon: <CategoryIcon />,
						pattern: 'categorias{/:categoriaSlug}*',
					},
					{
						title: 'Docs API',
						segment: 'docs-api',
						icon: <CodeIcon />,
					},
				);
			}
		}

		return nav;
	}, [user]);

	const authentication = React.useMemo(
		() => ({
			signIn: () => {
				navigate('/login');
			},
			signOut: () => {
				logout();
				navigate('/login');
			},
		}),
		[logout, navigate],
	);

	return (
		<ReactRouterAppProvider
			theme={theme}
			navigation={navigation}
			branding={BRANDING}
			localeText={LOCALE_TEXT}
			session={session}
			authentication={authentication}
		>
			<Outlet />
		</ReactRouterAppProvider>
	);
}

export default function App() {
	return (
		<AuthProvider>
			<AppContent />
			<ToastContainer
				position="bottom-right"
				autoClose={5000}
				hideProgressBar={false}
				newestOnTop
				closeOnClick
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme="colored"
			/>
		</AuthProvider>
	);
}
