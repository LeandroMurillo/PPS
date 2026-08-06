import * as React from 'react';
import {
	Box,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Chip,
	OutlinedInput,
	TextField,
	InputAdornment,
} from '@mui/material';

import type { SelectChangeEvent } from '@mui/material/Select';
import SearchIcon from '@mui/icons-material/Search';

import type { FiltroCategoria, FiltroDepartamento } from '../api/actores';

type FiltroCategoriasCulturalesProps = {
	categorias: FiltroCategoria[];
	departamentos: FiltroDepartamento[];
	categoriasSeleccionadas: number[];
	onCambiarCategorias: (categorias: number[]) => void;
	busqueda: string;
	onCambiarBusqueda: (busqueda: string) => void;
	departamentoSeleccionado: string;
	onCambiarDepartamento: (departamento: string) => void;
};

export default function FiltroCategoriasCulturales({
	categorias,
	departamentos,
	categoriasSeleccionadas,
	onCambiarCategorias,
	busqueda,
	onCambiarBusqueda,
	departamentoSeleccionado,
	onCambiarDepartamento,
}: FiltroCategoriasCulturalesProps) {
	function handleCategoriasChange(event: SelectChangeEvent<number[]>) {
		const { value } = event.target;

		const nuevasCategorias =
			typeof value === 'string' ? value.split(',').map((categoria) => Number(categoria)) : value;

		onCambiarCategorias(nuevasCategorias);
	}

	function handleBusquedaChange(event: React.ChangeEvent<HTMLInputElement>) {
		onCambiarBusqueda(event.target.value);
	}

	function handleDepartamentoChange(event: SelectChangeEvent<string>) {
		onCambiarDepartamento(event.target.value);
	}

	return (
		<Box sx={{ width: '100%', p: 2 }}>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					gap: 2,
					width: '100%',
				}}
			>
				<TextField
					fullWidth
					label="Buscar"
					placeholder="Buscar por actor cultural, localidad, categoría..."
					value={busqueda}
					onChange={handleBusquedaChange}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon />
							</InputAdornment>
						),
					}}
				/>

				<FormControl fullWidth>
					<InputLabel id="departamento-label">Departamento</InputLabel>

					<Select
						labelId="departamento-label"
						id="departamento-select"
						value={departamentoSeleccionado}
						label="Departamento"
						onChange={handleDepartamentoChange}
					>
						<MenuItem value="">
							<em>Todos</em>
						</MenuItem>

						{departamentos.map((departamento) => (
							<MenuItem key={departamento.departamento} value={departamento.departamento}>
								{departamento.departamento}
							</MenuItem>
						))}
					</Select>
				</FormControl>

				<FormControl fullWidth>
					<InputLabel id="categorias-culturales-label">Categorías</InputLabel>

					<Select
						labelId="categorias-culturales-label"
						id="categorias-culturales-select"
						multiple
						value={categoriasSeleccionadas}
						onChange={handleCategoriasChange}
						input={<OutlinedInput label="Categorías" />}
						renderValue={(selected) => (
							<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
								{selected.map((categoriaId) => {
									const categoria = categorias.find((item) => item.id === categoriaId);

									return <Chip key={categoriaId} label={categoria?.nombre ?? categoriaId} />;
								})}
							</Box>
						)}
					>
						{categorias.map((categoria) => (
							<MenuItem key={categoria.id} value={categoria.id}>
								{categoria.nombre}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</Box>
		</Box>
	);
}
