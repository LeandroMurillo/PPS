import * as React from 'react';
import AssignmentIcon from '@mui/icons-material/Assignment';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { Crud, List } from '@toolpad/core/Crud';
import { useLocation, useNavigate } from 'react-router-dom';

import { categoriasAdminCache, categoriasAdminDataSource, type CategoriaDataModel } from '../data/adminCategorias';

export default function AdminCategoriasPage() {
	const location = useLocation();
	const navigate = useNavigate();
	const isList = location.pathname.replace(/\/$/, '') === '/categorias';
	const listDataSource = React.useMemo(
		() => ({
			...categoriasAdminDataSource,
			fields: [
				...categoriasAdminDataSource.fields,
				{
					field: 'formulario',
					headerName: 'Formulario',
					width: 120,
					sortable: false,
					filterable: false,
					editable: false,
					disableColumnMenu: true,
					renderCell: (params: { row: CategoriaDataModel }) => (
						<Tooltip title={`Administrar formulario de ${params.row.nombre}`}>
							<IconButton
								size="small"
								color="primary"
								onClick={(event) => {
									event.stopPropagation();
									navigate(`/categorias/${params.row.id}/formulario`);
								}}
							>
								<AssignmentIcon fontSize="small" />
							</IconButton>
						</Tooltip>
					),
				},
			],
		}),
		[navigate],
	);

	if (isList) {
		return (
			<List<CategoriaDataModel>
				dataSource={listDataSource}
				dataSourceCache={categoriasAdminCache}
				initialPageSize={25}
				pageTitle="Administrar categorías"
				onCreateClick={() => navigate('/categorias/new')}
				onEditClick={(id) => navigate(`/categorias/${id}/edit`)}
				onRowClick={(id) => navigate(`/categorias/${id}/subcategorias`)}
				slotProps={{
					dataGrid: {
						initialState: {
							columns: { columnVisibilityModel: { nombre: false, icono: false } },
						},
					},
				}}
			/>
		);
	}

	return (
		<Crud<CategoriaDataModel>
			dataSource={categoriasAdminDataSource}
			dataSourceCache={categoriasAdminCache}
			rootPath="/categorias"
			initialPageSize={25}
			defaultValues={{ icono: 'Category', estado: 'A' }}
			pageTitles={{
				list: 'Administrar categorías',
				create: 'Nueva categoría',
				edit: 'Modificar categoría',
			}}
		/>
	);
}
