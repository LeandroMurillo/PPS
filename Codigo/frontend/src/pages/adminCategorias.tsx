import { Crud } from '@toolpad/core/Crud';

import { categoriasAdminCache, categoriasAdminDataSource, type CategoriaDataModel } from '../data/adminCategorias';

export default function AdminCategoriasPage() {
	return (
		<Crud<CategoriaDataModel>
			dataSource={categoriasAdminDataSource}
			dataSourceCache={categoriasAdminCache}
			rootPath="/categorias"
			initialPageSize={25}
			slotProps={{
				list: {
					dataGrid: {
						initialState: {
							columns: {
								columnVisibilityModel: {
									nombre: false,
									icono: false,
									subcategorias: false,
								},
							},
						},
					},
				},
			}}
			defaultValues={{ icono: 'Category', estado: 'A' }}
			pageTitles={{
				list: 'Administrar categorías',
				show: 'Detalle de categoría',
				create: 'Nueva categoría',
				edit: 'Modificar categoría',
			}}
		/>
	);
}
