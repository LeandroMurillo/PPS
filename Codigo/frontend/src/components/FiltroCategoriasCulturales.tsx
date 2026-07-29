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

const categoriasCulturales: string[] = [
	'Música',
	'Danza',
	'Teatro',
	'Artes visuales',
	'Literatura',
	'Cine',
	'Fotografía',
	'Artesanías',
	'Patrimonio',
	'Diseño',
];

const departamentosTucuman: string[] = [
	'Burruyacú',
	'Capital',
	'Chicligasta',
	'Cruz Alta',
	'Famaillá',
	'Graneros',
	'Juan Bautista Alberdi',
	'La Cocha',
	'Leales',
	'Lules',
	'Monteros',
	'Río Chico',
	'Simoca',
	'Tafí del Valle',
	'Tafí Viejo',
	'Trancas',
	'Yerba Buena',
];

type FiltroCategoriasCulturalesProps = {
	categoriasSeleccionadas: string[];
	onCambiarCategorias: (categorias: string[]) => void;
	busqueda: string;
	onCambiarBusqueda: (busqueda: string) => void;
	departamentoSeleccionado: string;
	onCambiarDepartamento: (departamento: string) => void;
};

export default function FiltroCategoriasCulturales({
	categoriasSeleccionadas,
	onCambiarCategorias,
	busqueda,
	onCambiarBusqueda,
	departamentoSeleccionado,
	onCambiarDepartamento,
}: FiltroCategoriasCulturalesProps) {
	function handleCategoriasChange(event: SelectChangeEvent<string[]>) {
		const { value } = event.target;

		const nuevasCategorias = typeof value === 'string' ? value.split(',') : value;

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

						{departamentosTucuman.map((departamento) => (
							<MenuItem key={departamento} value={departamento}>
								{departamento}
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
								{selected.map((categoria) => (
									<Chip key={categoria} label={categoria} />
								))}
							</Box>
						)}
					>
						{categoriasCulturales.map((categoria) => (
							<MenuItem key={categoria} value={categoria}>
								{categoria}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</Box>
		</Box>
	);
}
