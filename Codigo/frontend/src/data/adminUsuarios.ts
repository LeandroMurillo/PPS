import type { DataModel, DataSource } from '@toolpad/core/Crud';

import { obtenerUsuarioAdmin, type UsuarioDetalleAdmin } from '../api/admin';
import { getEstadoEtiqueta, getRolEtiqueta } from '../constants/estados';
import { getGeneroEtiqueta } from '../constants/generos';
import { formatDate, formatDateTime } from '../utils/date';

export type UsuarioDetalleDataModel = UsuarioDetalleAdmin &
	DataModel & {
		categoriasModeradas: string;
	};

export const usuarioAdminDataSource: DataSource<UsuarioDetalleDataModel> = {
	fields: [
		{ field: 'nombre', headerName: 'Nombre' },
		{ field: 'apellido', headerName: 'Apellido' },
		{ field: 'email', headerName: 'Email' },
		{ field: 'cuil', headerName: 'CUIL' },
		{
			field: 'genero',
			headerName: 'Género',
			valueFormatter: (value) => getGeneroEtiqueta(value ? String(value) : null),
		},
		{
			field: 'fechaNacimiento',
			headerName: 'Fecha de nacimiento',
			valueFormatter: formatDate,
		},
		{ field: 'nacionalidad', headerName: 'Nacionalidad' },
		{ field: 'actividadArcaCodigo', headerName: 'Código actividad ARCA' },
		{ field: 'actividadArca', headerName: 'Actividad ARCA' },
		{
			field: 'fechaRegistro',
			headerName: 'Fecha de registro',
			valueFormatter: formatDateTime,
		},
		{
			field: 'rol',
			headerName: 'Rol',
			valueFormatter: (value) => getRolEtiqueta(value ? String(value) : null),
		},
		{
			field: 'estado',
			headerName: 'Estado',
			valueFormatter: (value) => getEstadoEtiqueta(value ? String(value) : null),
		},
		{ field: 'categoriasModeradas', headerName: 'Categorías que modera' },
	],
	getOne: async (id) => {
		const result = await obtenerUsuarioAdmin(id);

		return {
			...result.data,
			categoriasModeradas:
				result.data.categoriasModeracion
					.filter((categoria) => categoria.asignada)
					.map((categoria) => categoria.nombre)
					.join(', ') || 'Ninguna',
		};
	},
};
