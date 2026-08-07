import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './app';
import Layout from './layouts/dashboard';
import Mapa from './pages/mapa';
import EmployeesCrudPage from './pages/employees';
import ActorPortfolio from './pages/actorPortfolio';
import Actores from './pages/actores';
import AcercaDe from './pages/acerca';
import ConvocatoriasUsuario from './pages/convocatoriasUsuario';
import AdminActoresPage from './pages/adminActores';
import AdminUsuariosPage from './pages/adminUsuarios';
import AdminUsuarioDetallePage from './pages/adminUsuarioDetalle';

const router = createBrowserRouter([
	{
		Component: App,
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
						Component: EmployeesCrudPage,
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
