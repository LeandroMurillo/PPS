import './utils/fixLeaflet';
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
						// CORRECCIÓN 2: Usar 'index: true' en lugar de 'path: \'\'' para la ruta raíz
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
						Component: EmployeesCrudPage,
					},
					{
						path: 'convocatoriasUsuario',
						Component: ConvocatoriasUsuario,
					},
					{
						path: 'confirmaciones',
						Component: EmployeesCrudPage,
					},
					{
						path: 'actoresAdmin',
						Component: AdminActoresPage,
					},
					{
						path: 'actoresAdmin/:actorId',
						Component: AdminActorDetallePage,
					},
					{
						path: 'usuarios',
						Component: AdminUsuariosPage,
					},
					{
						path: 'usuarios/:usuarioId',
						Component: AdminUsuarioDetallePage,
					},
					{
						path: 'convocatoriasAdmin',
						Component: EmployeesCrudPage,
					},
					{
						path: 'categorias',
						Component: AdminCategoriasPage,
					},
					{
						path: 'categorias/new',
						Component: AdminCategoriasPage,
					},
					{
						path: 'categorias/:categoriaId/formulario',
						Component: AdminCategoriaFormularioPage,
					},
					{
						path: 'categorias/:categoriaId/subcategorias/:subcategoriaId/formulario',
						Component: AdminCategoriaFormularioPage,
					},
					{
						path: 'categorias/:categoriaId',
						Component: AdminCategoriaDetallePage,
					},
					{
						path: 'categorias/:categoriaId/subcategorias',
						Component: AdminSubcategoriasPage,
					},
					{
						path: 'categorias/*',
						Component: AdminCategoriasPage,
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
