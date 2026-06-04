import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
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
						path: '',
						Component: Mapa,
					},
					{
						path: 'employees/:employeeId?/*',
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
