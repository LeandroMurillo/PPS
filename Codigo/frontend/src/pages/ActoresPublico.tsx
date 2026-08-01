import { useState, useMemo } from 'react';
import {
	Alert,
	Card,
	CardContent,
	CardMedia,
	Typography,
	TextField,
	MenuItem,
	Select,
	FormControl,
	InputLabel,
	Grid,
	Box,
	InputAdornment,
	Chip,
	Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// --- Datos Mock basados en la Base de Datos ---
// Combinamos los datos de Actores, Categorías y Ubicaciones para la vista pública[cite: 3].
const ACTORES_PUBLICOS = [
	{
		id: 1,
		nombre: 'Tejidos Ancestrales María',
		descripcion:
			'Producción de ponchos y ruanas en telar criollo. Las carpinchas, con sus anteojos de lectura y ovillos de colores, tejen los lazos de la comunidad.',
		categoria: 'Artesanía',
		departamento: 'Tafí del Valle',
		fotoUrl: 'https://images.unsplash.com/photo-1606722590583-6951b5ea92ad?auto=format&fit=crop&w=600&q=80',
	},
	{
		id: 2,
		nombre: 'Los Tucu Cantores',
		descripcion:
			'Agrupación folclórica con más de 10 años de trayectoria. Con trajes de lentejuelas que brillan más que el sol en el río.',
		categoria: 'Música',
		departamento: 'Capital',
		fotoUrl: 'https://images.unsplash.com/photo-1764352104218-2d3a899ce36c?auto=format&fit=crop&w=600&q=80',
	},
	{
		id: 3,
		nombre: 'Teatro Alberdi',
		descripcion:
			'Espacio cultural histórico administrado por la UNT. Entre mesas con termos listos, los socios acomodan sus mejores galas.',
		categoria: 'Artes Escénicas',
		departamento: 'Capital',
		fotoUrl: 'https://images.unsplash.com/photo-1773332598451-8a0a59941912?auto=format&fit=crop&w=600&q=80',
	},
	{
		id: 4,
		nombre: 'Los Carpinchos del Alba',
		descripcion:
			'Banda de Indie Rock emergente. Melenas al viento que harían envidiar al mismísimo Ariel, aparecen Los Carpinchos.',
		categoria: 'Música',
		departamento: 'Yerba Buena',
		fotoUrl: 'https://images.unsplash.com/photo-1614793351079-11dd79b922ba?auto=format&fit=crop&w=600&q=80',
	},
];

const CATEGORIAS = ['Todas', 'Música', 'Artesanía', 'Artes Escénicas', 'Audiovisual', 'Literatura', 'Artes Visuales'];
const DEPARTAMENTOS = ['Todos', 'Capital', 'Tafí Viejo', 'Tafí del Valle', 'Yerba Buena', 'Lules'];

// --- Componente Principal ---
export default function ListaActoresPublica() {
	// --- Estados para los filtros ---
	const [busqueda, setBusqueda] = useState('');
	const [filtroCategoria, setFiltroCategoria] = useState('Todas');
	const [filtroDepartamento, setFiltroDepartamento] = useState('Todos');

	// --- Lógica de filtrado ---
	const actoresFiltrados = useMemo(() => {
		return ACTORES_PUBLICOS.filter((actor) => {
			const coincideBusqueda =
				actor.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
				actor.descripcion.toLowerCase().includes(busqueda.toLowerCase());
			const coincideCategoria = filtroCategoria === 'Todas' || actor.categoria === filtroCategoria;
			const coincideDepartamento = filtroDepartamento === 'Todos' || actor.departamento === filtroDepartamento;

			return coincideBusqueda && coincideCategoria && coincideDepartamento;
		});
	}, [busqueda, filtroCategoria, filtroDepartamento]);

	return (
		<Box sx={{ width: '100%', maxWidth: 1200, margin: '0 auto', p: 3 }}>
			{/* --- Barra de Filtros --- */}
			<Grid container spacing={2} sx={{ mb: 4 }}>
				<Grid size={{ xs: 12, md: 4 }}>
					<TextField
						fullWidth
						placeholder="Buscar actor..."
						value={busqueda}
						onChange={(e) => setBusqueda(e.target.value)}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<SearchIcon />
								</InputAdornment>
							),
						}}
					/>
				</Grid>
				<Grid size={{ xs: 12, md: 4 }}>
					<FormControl fullWidth>
						<InputLabel>Filtrar Departamento</InputLabel>
						<Select
							value={filtroDepartamento}
							label="Filtrar Departamento"
							onChange={(e) => setFiltroDepartamento(e.target.value)}
						>
							{DEPARTAMENTOS.map((dep) => (
								<MenuItem key={dep} value={dep}>
									{dep}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Grid>
				<Grid size={{ xs: 12, md: 4 }}>
					<FormControl fullWidth>
						<InputLabel>Filtrar Categoría</InputLabel>
						<Select
							value={filtroCategoria}
							label="Filtrar Categoría"
							onChange={(e) => setFiltroCategoria(e.target.value)}
						>
							{CATEGORIAS.map((cat) => (
								<MenuItem key={cat} value={cat}>
									{cat}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Grid>
			</Grid>

			{/* --- Grilla de Tarjetas --- */}
			{actoresFiltrados.length === 0 ? (
				<Alert severity="info">No se encontraron actores que coincidan con los filtros.</Alert>
			) : actoresFiltrados.length === 1 ? (
				<Box display="flex" justifyContent="center">
					<Box sx={{ maxWidth: 500, width: '100%' }}>
						<ActorCard actor={actoresFiltrados[0]} />
					</Box>
				</Box>
			) : (
				<Grid container spacing={4}>
					{actoresFiltrados.map((actor) => (
						<Grid key={actor.id} size={{ xs: 12, md: 6 }}>
							<ActorCard actor={actor} />
						</Grid>
					))}
				</Grid>
			)}
		</Box>
	);
}

// --- Componente Tarjeta (Inspirado en PostulacionCard) ---
function ActorCard({ actor }: { actor: (typeof ACTORES_PUBLICOS)[0] }) {
	// Imagen por defecto en caso de que el actor no tenga foto
	const imagenPlaceholder =
		'https://https://images.unsplash.com/vector-1783945574842-2d61707ad72f?auto=format&fit=crop&w=600&q=80';

	return (
		<Card
			sx={{
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				boxShadow: 2,
				overflow: 'hidden',
				transition: 'transform 0.5s ease-out, box-shadow 0.5s ease-out',
				'&:hover': {
					transform: 'scale(1.01)', // subtle enlargement
					boxShadow: 6, // stronger shadow for depth
				},
			}}
		>
			<CardMedia
				component="img"
				height="220"
				image={actor.fotoUrl || imagenPlaceholder}
				alt={`Foto de ${actor.nombre}`}
				sx={{ objectFit: 'cover' }}
			/>
			<CardContent sx={{ flexGrow: 1, p: 3 }}>
				<Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
					{actor.nombre}
				</Typography>

				<Stack direction="row" spacing={1} sx={{ mb: 2 }}>
					<Chip label={actor.categoria} size="small" color="primary" />
					<Chip
						icon={<LocationOnIcon fontSize="small" />}
						label={actor.departamento}
						size="small"
						color="secondary"
					/>
				</Stack>

				<Typography
					variant="body2"
					color="text.secondary"
					sx={{
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						display: '-webkit-box',
						WebkitLineClamp: 4,
						WebkitBoxOrient: 'vertical',
					}}
				>
					{actor.descripcion}
				</Typography>
			</CardContent>
		</Card>
	);
}
