import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import Layout from './layouts/dashboard';
import Mapa from './pages/mapa';
import EmployeesCrudPage from './pages/employees';

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