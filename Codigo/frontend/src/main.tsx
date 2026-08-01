import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import Layout from './layouts/dashboard';
import Mapa from './pages/mapa';
import EmployeesCrudPage from './pages/employees';
import ActorPortfolio from './pages/ActorPortfolio';
import ActoresPublico from './pages/ActoresPublico';
import AcercaDe from './pages/acerca';

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
						path: 'actoresPublico',
						Component: ActoresPublico,
					},
					{
						path: 'actoresUsuario',
						Component: EmployeesCrudPage,
					},
					{
						path: 'convocatoriasUsuario',
						Component: EmployeesCrudPage,
					},
					{
						path: 'confirmaciones',
						Component: EmployeesCrudPage,
					},
					{
						path: 'usuarios',
						Component: EmployeesCrudPage,
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
