import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, useRouteError } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import App from './app';
import Layout from './layouts/dashboard';
import Mapa from './pages/mapa';
import EmployeesCrudPage from './pages/employees';
import ActorPortfolio from './pages/actorPortfolio';
import Actores from './pages/actores';
import AcercaDe from './pages/acerca';
import ConvocatoriasUsuario from './pages/convocatoriasUsuario';
import AdminActoresPage from './pages/adminActores';
import AdminActorDetallePage from './pages/adminActorDetalle';
import AdminUsuariosPage from './pages/adminUsuarios';
import AdminUsuarioDetallePage from './pages/adminUsuarioDetalle';
import AdminCategoriasPage from './pages/adminCategorias';
import AdminCategoriaDetallePage from './pages/adminCategoriaDetalle';
import AdminCategoriaFormularioPage from './pages/adminCategoriaFormulario';
import AdminSubcategoriasPage from './pages/adminSubcategorias';
import RegistroPage from './pages/registro';
import LoginPage from './pages/login';
import { ProtectedRoute } from './components/ProtectedRoute';

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
						path: 'login',
						Component: LoginPage,
					},
					{
						path: 'registro',
						Component: RegistroPage,
					},
					{
						path: 'actoresUsuario',
						element: (
							<ProtectedRoute>
								<EmployeesCrudPage />
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
								<EmployeesCrudPage />
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
						path: 'actoresAdmin/:actorId',
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
								<EmployeesCrudPage />
							</ProtectedRoute>
						),
					},
					{
						path: 'categorias',
						element: (
							<ProtectedRoute allowedRoles={ADMIN_ROLES}>
								<AdminCategoriasPage />
							</ProtectedRoute>
						),
					},
					{
						path: 'categorias/new',
						element: (
							<ProtectedRoute allowedRoles={ADMIN_ROLES}>
								<AdminCategoriasPage />
							</ProtectedRoute>
						),
					},
					{
						path: 'categorias/:categoriaId/formulario',
						element: (
							<ProtectedRoute allowedRoles={ADMIN_ROLES}>
								<AdminCategoriaFormularioPage />
							</ProtectedRoute>
						),
					},
					{
						path: 'categorias/:categoriaId/subcategorias/:subcategoriaId/formulario',
						element: (
							<ProtectedRoute allowedRoles={ADMIN_ROLES}>
								<AdminCategoriaFormularioPage />
							</ProtectedRoute>
						),
					},
					{
						path: 'categorias/:categoriaId',
						element: (
							<ProtectedRoute allowedRoles={ADMIN_ROLES}>
								<AdminCategoriaDetallePage />
							</ProtectedRoute>
						),
					},
					{
						path: 'categorias/:categoriaId/subcategorias',
						element: (
							<ProtectedRoute allowedRoles={ADMIN_ROLES}>
								<AdminSubcategoriasPage />
							</ProtectedRoute>
						),
					},
					{
						path: 'categorias/*',
						element: (
							<ProtectedRoute allowedRoles={ADMIN_ROLES}>
								<AdminCategoriasPage />
							</ProtectedRoute>
						),
					},
					{
						path: 'acerca',
						Component: AcercaDe,
					},
					{
						path: '/actores/:id',
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
