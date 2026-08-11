import { DataSourceCache, type DataSource } from '@toolpad/core/Crud';
import { FormControl, FormHelperText, FormLabel, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { createElement } from 'react';
import { z } from 'zod';

import CategoryIcon, {
	CATEGORY_ICON_OPTIONS,
	categoryIcons,
	isCategoriaIcono,
	type CategoriaIcono,
} from '../components/categoryIcon';
import {
	crearCategoriaAdmin,
	editarCategoriaAdmin,
	eliminarCategoriaAdmin,
	listarCategoriasAdmin,
	obtenerCategoriaAdmin,
	type CategoriaAdmin,
	type CategoriaAdminSortBy,
} from '../api/admin';

export type CategoriaDataModel = CategoriaAdmin;

const sortableFields: Record<string, CategoriaAdminSortBy> = {
	id: 'idCategoria',
	categoria: 'nombre',
	nombre: 'nombre',
	icono: 'icono',
	estado: 'estado',
	cantidadSubcategorias: 'cantidadSubcategorias',
	cantidadActores: 'cantidadActores',
};

function renderCategoriaCell(row: CategoriaDataModel) {
	return createElement(CategoryIcon, {
		icono: row.icono,
		label: row.nombre,
		withLabel: true,
	});
}

function renderIconoField({
	value,
	onChange,
	error,
}: {
	value: string | string[] | number | boolean | File | null;
	onChange: (value: string) => void | Promise<void>;
	error: string | null;
}) {
	const selectedIcon = isCategoriaIcono(value) ? value : 'Category';

	return (
		<FormControl error={!!error} sx={{ flexShrink: 0, width: { xs: '100%', sm: 'calc(200% + 16px)' } }}>
			<FormLabel sx={{ mb: 1 }}>Icono</FormLabel>
			<ToggleButtonGroup
				exclusive
				value={selectedIcon}
				onChange={(_, nextValue: CategoriaIcono | null) => {
					if (nextValue) {
						void onChange(nextValue);
					}
				}}
				sx={{
					display: 'grid',
					width: '100%',
					gridTemplateColumns: 'repeat(auto-fit, minmax(64px, 1fr))',
					gap: 1,
					'& .MuiToggleButtonGroup-grouped': {
						border: '1px solid',
						borderColor: 'divider',
						borderRadius: 1,
						m: 0,
					},
				}}
			>
				{CATEGORY_ICON_OPTIONS.map((option) => {
					const Icon = categoryIcons[option.value];

					return (
						<Tooltip key={option.value} title={option.label}>
							<ToggleButton value={option.value} aria-label={option.label} sx={{ minHeight: 56, p: 1 }}>
								<Icon />
							</ToggleButton>
						</Tooltip>
					);
				})}
			</ToggleButtonGroup>
			<FormHelperText>{error ?? ' '}</FormHelperText>
		</FormControl>
	);
}

type CategoriaAdminDataSource = DataSource<CategoriaDataModel> &
	Required<Pick<DataSource<CategoriaDataModel>, 'getMany'>>;

export const categoriasAdminDataSource: CategoriaAdminDataSource = {
	fields: [
		{
			field: 'categoria',
			headerName: 'Categoría',
			minWidth: 260,
			flex: 1,
			editable: false,
			sortable: true,
			renderCell: (params) => renderCategoriaCell(params.row as CategoriaDataModel),
			valueFormatter: (_value, row) => (row as CategoriaDataModel)?.nombre ?? String(_value ?? ''),
		},
		{ field: 'nombre', headerName: 'Nombre', minWidth: 240, flex: 1 },
		{
			field: 'estado',
			headerName: 'Estado',
			type: 'singleSelect',
			valueOptions: [
				{ value: 'A', label: 'Activa' },
				{ value: 'I', label: 'Inactiva' },
			],
			width: 140,
		},
		{
			field: 'icono',
			headerName: 'Icono',
			type: 'singleSelect',
			valueOptions: CATEGORY_ICON_OPTIONS.map((option) => ({
				value: option.value,
				label: option.label,
			})),
			minWidth: 180,
			renderFormField: renderIconoField,
			renderCell: (params) => createElement(CategoryIcon, { icono: params.value as CategoriaIcono }),
			valueFormatter: (value) =>
				CATEGORY_ICON_OPTIONS.find((opt) => opt.value === value)?.label ?? String(value ?? ''),
		},
		{
			field: 'cantidadSubcategorias',
			headerName: 'Subcategorías',
			type: 'number',
			editable: false,
			width: 150,
		},
		{
			field: 'cantidadActores',
			headerName: 'Actores',
			type: 'number',
			editable: false,
			width: 120,
		},
	],
	getMany: async ({ paginationModel, filterModel, sortModel }) => {
		const nameFilter = filterModel.items.find(
			(item) => (item.field === 'nombre' || item.field === 'categoria') && typeof item.value === 'string',
		);
		const stateFilter = filterModel.items.find(
			(item) => item.field === 'estado' && (item.value === 'A' || item.value === 'I'),
		);
		const quickSearch = filterModel.quickFilterValues?.map(String).join(' ').trim();
		const firstSort = sortModel[0];
		const result = await listarCategoriasAdmin({
			busqueda: quickSearch || (nameFilter?.value as string | undefined),
			estado: stateFilter?.value as CategoriaAdmin['estado'] | undefined,
			limit: paginationModel.pageSize,
			offset: paginationModel.page * paginationModel.pageSize,
			sortBy: (firstSort && sortableFields[firstSort.field]) || 'idCategoria',
			sortDir: firstSort?.sort === 'desc' ? 'DESC' : 'ASC',
		});

		return { items: result.data, itemCount: result.pagination.total };
	},
	getOne: async (id) => (await obtenerCategoriaAdmin(id)).data,
	createOne: async (data) =>
		(
			await crearCategoriaAdmin({
				nombre: String(data.nombre ?? ''),
				icono: (data.icono || 'Category') as CategoriaIcono,
				estado: data.estado === 'I' ? 'I' : 'A',
			})
		).data,
	updateOne: async (id, data) =>
		(
			await editarCategoriaAdmin(id, {
				nombre: String(data.nombre ?? ''),
				icono: (data.icono || 'Category') as CategoriaIcono,
				estado: data.estado === 'I' ? 'I' : 'A',
			})
		).data,
	deleteOne: async (id) => {
		await eliminarCategoriaAdmin(id);
	},
	validate: z.object({
		nombre: z
			.string({ error: 'El nombre es obligatorio.' })
			.trim()
			.min(1, 'El nombre es obligatorio.')
			.max(45, 'El nombre puede tener hasta 45 caracteres.'),
		icono: z.enum(CATEGORY_ICON_OPTIONS.map((option) => option.value) as [CategoriaIcono, ...CategoriaIcono[]], {
			error: 'Seleccioná un icono válido.',
		}),
		estado: z.enum(['A', 'I'], { error: 'Seleccioná un estado válido.' }),
	})['~standard'].validate,
};

export const categoriasAdminCache = new DataSourceCache();
