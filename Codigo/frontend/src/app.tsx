import * as React from 'react';
import { Outlet, useNavigate } from 'react-router';
import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import AddCommentIcon from '@mui/icons-material/AddComment';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import CategoryIcon from '@mui/icons-material/Category';
import ChecklistIcon from '@mui/icons-material/Checklist';
import GroupIcon from '@mui/icons-material/Group';
import InfoIcon from '@mui/icons-material/Info';
import MapIcon from '@mui/icons-material/Map';
import PeopleIcon from '@mui/icons-material/People';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import LoginIcon from '@mui/icons-material/Login';
import type { Navigation } from '@toolpad/core/AppProvider';
import { AuthProvider, useAuth } from './context/AuthContext';

const BRANDING = {
	title: 'Mosaico Cultural',
	logo: <img src="/favicon.svg" alt="Mosaico Cultural" style={{ width: 24, height: 24 }} />,
};

const LOCALE_TEXT = {
	accountSignInLabel: 'Ingresar',
	accountSignOutLabel: 'Cerrar sesión',
	createNewButtonLabel: 'Crear nueva',
	reloadButtonLabel: 'Recargar datos',
	createLabel: 'Crear',
	createSuccessMessage: 'Elemento creado correctamente.',
	createErrorMessage: 'No se pudo crear el elemento. Motivo:',
	editLabel: 'Modificar',
	editSuccessMessage: 'Elemento modificado correctamente.',
	editErrorMessage: 'No se pudo modificar el elemento. Motivo:',
	deleteLabel: 'Dar de baja',
	deleteConfirmTitle: '¿Dar de baja el elemento?',
	deleteConfirmMessage: 'Esta acción dará de baja el elemento. ¿Querés continuar?',
	deleteConfirmLabel: 'Dar de baja',
	deleteCancelLabel: 'Cancelar',
	deleteSuccessMessage: 'Elemento dado de baja correctamente.',
	deleteErrorMessage: 'No se pudo dar de baja el elemento. Motivo:',
	deletedItemMessage: 'Este elemento fue dado de baja.',
};

function AppContent() {
	const navigate = useNavigate();
	const { session, logout, user } = useAuth();

	const navigation: Navigation = React.useMemo(() => {
		const nav: Navigation = [
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
		];

		if (!user) {
			nav.push(
				{
					title: 'Iniciar sesión',
					segment: 'login',
					icon: <LoginIcon />,
				},
				{
					title: 'Registrarse',
					segment: 'registro',
					icon: <HowToRegIcon />,
				},
			);
		} else {
			nav.push(
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
			);

			if (user.rol === 'ADMIN' || user.rol === 'MODERADOR') {
				nav.push(
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
						pattern: 'actoresAdmin{/:actorId}*',
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
				);
			}
		}

		nav.push(
			{
				kind: 'divider',
			},
			{
				title: 'Acerca de',
				segment: 'acerca',
				icon: <InfoIcon />,
			},
		);

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
		</AuthProvider>
	);
}
