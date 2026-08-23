import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, useRouteError } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import App from './app';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './layouts/dashboard';

import ActorNuevoPage from './pages/actorNuevo';
import ActorPortfolio from './pages/actorPortfolio';
import Actores from './pages/actores';
import ProximosEventosPage from './pages/proximosEventos';
import AdminActorDetallePage from './pages/adminActorDetalle';
import AdminActoresPage from './pages/adminActores';
import AdminCategoriaDetallePage from './pages/adminCategoriaDetalle';
import AdminCategoriaFormularioPage from './pages/adminCategoriaFormulario';
import AdminCategoriasPage from './pages/adminCategorias';
import AdminSubcategoriasPage from './pages/adminSubcategorias';
import AdminUsuarioDetallePage from './pages/adminUsuarioDetalle';
import AdminUsuariosPage from './pages/adminUsuarios';
import ConvocatoriasAdminPage from './pages/convocatoriasAdmin';
import ConvocatoriasUsuario from './pages/convocatoriasUsuario';
import ConfirmacionesPage from './pages/confirmaciones';
import MisActoresPage from './pages/misActores';
import PerfilUsuarioPage from './pages/perfilUsuario';
import Licencia from './pages/licencia';
import LoginPage from './pages/login';
import Mapa from './pages/mapa';
import RegistroPage from './pages/registro';
import RegistroDatosPage from './pages/registroDatos';
import AuthActionPage from './pages/authAction';

function DocsApiRedirect() {
	React.useEffect(() => {
		const token = typeof localStorage !== 'undefined' ? localStorage.getItem('mosaico_cultural_token') : null;
		const query = token ? `?token=${encodeURIComponent(token)}` : '';
		const apiBaseUrl =
			(import.meta.env.VITE_API_URL as string | undefined) ??
			(typeof window !== 'undefined' && window.location.port === '5173'
				? `${window.location.protocol}//${window.location.hostname}:3000`
				: typeof window !== 'undefined'
					? window.location.origin
					: 'http://localhost:3000');
		window.location.href = `${apiBaseUrl}/docs${query}`;
	}, []);

	return null;
}

function RootErrorBoundary() {
	const error = useRouteError();
	const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error inesperado al cargar la página.';

	return (
		<Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textAlign: 'center' }}>
			<Typography variant="h5" color="error" fontWeight="bold">
				¡Ups! Ocurrió un error inesperado
			</Typography>
			<Alert severity="error" sx={{ maxWidth: 600 }}>
				{errorMessage}
			</Alert>
			<Button variant="contained" onClick={() => (window.location.href = '/')}>
				Volver al inicio
			</Button>
		</Box>
	);
}

const ADMIN_ROLES: ('ADMIN' | 'MODERADOR')[] = ['ADMIN', 'MODERADOR'];
const ONLY_ADMIN: 'ADMIN'[] = ['ADMIN'];

const router = createBrowserRouter([
	{
		Component: App,
		ErrorBoundary: RootErrorBoundary,
		children: [
			{
				path: '/',
				Component: Layout,
				children: [
					{
						index: true,
						Component: Mapa,
					},
					{
						path: 'actores',
						Component: Actores,
					},
					{
						path: 'eventos',
						Component: ProximosEventosPage,
					},
					{
						path: 'login',
						Component: LoginPage,
					},
					{
						path: 'registro',
						Component: RegistroPage,
					},
					{
						path: 'registro/datos',
						Component: RegistroDatosPage,
					},
					{
						path: 'auth/action',
						Component: AuthActionPage,
					},
					{
						path: 'verificar-correo',
						Component: AuthActionPage,
					},
					{
						path: 'actores/nuevo',
						element: (
							<ProtectedRoute>
								<ActorNuevoPage />
							</ProtectedRoute>
						),
					},
					{
						path: 'mis-actores',
						element: (
							<ProtectedRoute>
								<MisActoresPage />
							</ProtectedRoute>
						),
					},
					{
						path: 'perfil',
						element: (
							<ProtectedRoute>
								<PerfilUsuarioPage />
							</ProtectedRoute>
						),
					},
					{
						path: 'convocatoriasUsuario',
						element: (
							<ProtectedRoute>
								<ConvocatoriasUsuario />
							</ProtectedRoute>
						),
					},
					{
						path: 'confirmaciones',
						element: (
							<ProtectedRoute allowedRoles={ADMIN_ROLES}>
								<ConfirmacionesPage />
							</ProtectedRoute>
						),
					},
					{
						path: 'actoresAdmin',
						element: (
							<ProtectedRoute allowedRoles={ADMIN_ROLES}>
								<AdminActoresPage />
							</ProtectedRoute>
						),
					},
					{
						path: 'actoresAdmin/:actorSlug',
						element: (
							<ProtectedRoute allowedRoles={ADMIN_ROLES}>
								<AdminActorDetallePage />
							</ProtectedRoute>
						),
					},
					{
						path: 'usuarios',
						element: (
							<ProtectedRoute allowedRoles={ADMIN_ROLES}>
								<AdminUsuariosPage />
							</ProtectedRoute>
						),
					},
					{
						path: 'usuarios/:usuarioId',
						element: (
							<ProtectedRoute allowedRoles={ADMIN_ROLES}>
								<AdminUsuarioDetallePage />
							</ProtectedRoute>
						),
					},
					{
						path: 'convocatoriasAdmin',
						element: (
							<ProtectedRoute allowedRoles={ADMIN_ROLES}>
								<ConvocatoriasAdminPage />
							</ProtectedRoute>
						),
					},
					{
						path: 'categorias',
						element: (
							<ProtectedRoute allowedRoles={ONLY_ADMIN}>
								<AdminCategoriasPage />
							</ProtectedRoute>
						),
					},
					{
						path: 'categorias/new',
						element: (
							<ProtectedRoute allowedRoles={ONLY_ADMIN}>
								<AdminCategoriasPage />
							</ProtectedRoute>
						),
					},
					{
						path: 'categorias/:categoriaSlug/formulario',
						element: (
							<ProtectedRoute allowedRoles={ONLY_ADMIN}>
								<AdminCategoriaFormularioPage />
							</ProtectedRoute>
						),
					},
					{
						path: 'categorias/:categoriaSlug/subcategorias/:subcategoriaSlug/formulario',
						element: (
							<ProtectedRoute allowedRoles={ONLY_ADMIN}>
								<AdminCategoriaFormularioPage />
							</ProtectedRoute>
						),
					},
					{
						path: 'categorias/:categoriaSlug',
						element: (
							<ProtectedRoute allowedRoles={ONLY_ADMIN}>
								<AdminCategoriaDetallePage />
							</ProtectedRoute>
						),
					},
					{
						path: 'categorias/:categoriaSlug/subcategorias',
						element: (
							<ProtectedRoute allowedRoles={ONLY_ADMIN}>
								<AdminSubcategoriasPage />
							</ProtectedRoute>
						),
					},
					{
						path: 'categorias/*',
						element: (
							<ProtectedRoute allowedRoles={ONLY_ADMIN}>
								<AdminCategoriasPage />
							</ProtectedRoute>
						),
					},
					{
						path: 'docs-api',
						element: (
							<ProtectedRoute allowedRoles={['ADMIN']}>
								<DocsApiRedirect />
							</ProtectedRoute>
						),
					},
					{
						path: 'licencia',
						Component: Licencia,
					},
					{
						path: '/actores/:actorSlug',
						element: <ActorPortfolio />,
					},
				],
			},
		],
	},
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>,
);
