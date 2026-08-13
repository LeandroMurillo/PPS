import type { DataModel, DataSource } from '@toolpad/core/Crud';

import { obtenerUsuarioAdmin, type UsuarioDetalleAdmin } from '../api/admin';
import { getGeneroEtiqueta } from '../constants/generos';

export type UsuarioDetalleDataModel = UsuarioDetalleAdmin &
	DataModel & {
		categoriasModeradas: string;
	};

const formatDate = (value: unknown) => {
	if (typeof value !== 'string') {
		return '—';
	}

	const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
	return dateOnly
		? `${dateOnly[3]}/${dateOnly[2]}/${dateOnly[1]}`
		: new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(new Date(value));
};

const formatDateTime = (value: unknown) =>
	typeof value === 'string'
		? new Intl.DateTimeFormat('es-AR', {
				dateStyle: 'medium',
				timeStyle: 'short',
			}).format(new Date(value))
		: '—';

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
			valueFormatter: (value) =>
				({ USUARIO: 'Usuario', MODERADOR: 'Moderador', ADMIN: 'Administrador' })[String(value)] ?? value,
		},
		{
			field: 'estado',
			headerName: 'Estado',
			valueFormatter: (value) => ({ A: 'Activo', P: 'Pendiente', I: 'Inactivo' })[String(value)] ?? value,
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
