import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router';
import {
	Alert,
	Card,
	CardActionArea,
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
	CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// --- Tipo de dato tal como viene de /data/puntos.json ---
type Actor = {
	id: number;
	nombre: string;
	descripcion: string;
	categoria: string;
	departamento: string;
	latitudlongitud: [number, number];
	fotoUrl: string;
};

// --- Componente Principal ---
export default function ListaActoresPublica() {
	// --- Datos cargados desde puntos.json ---
	const [actores, setActores] = useState<Actor[]>([]);
	const [cargando, setCargando] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetch('/data/puntos.json')
			.then((res) => res.json())
			.then((data: Actor[]) => {
				setActores(data);
				setCargando(false);
			})
			.catch(() => {
				setError('No se pudieron cargar los actores culturales.');
				setCargando(false);
			});
	}, []);

	// --- Estados para los filtros ---
	const [busqueda, setBusqueda] = useState('');
	const [filtroCategoria, setFiltroCategoria] = useState('Todas');
	const [filtroDepartamento, setFiltroDepartamento] = useState('Todos');

	// --- Opciones de filtro derivadas de los datos reales ---
	const categorias = useMemo(
		() => ['Todas', ...Array.from(new Set(actores.map((a) => a.categoria))).sort()],
		[actores],
	);
	const departamentos = useMemo(
		() => ['Todos', ...Array.from(new Set(actores.map((a) => a.departamento))).sort()],
		[actores],
	);

	// --- Lógica de filtrado ---
	const actoresFiltrados = useMemo(() => {
		return actores.filter((actor) => {
			const coincideBusqueda =
				actor.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
				actor.descripcion.toLowerCase().includes(busqueda.toLowerCase());
			const coincideCategoria = filtroCategoria === 'Todas' || actor.categoria === filtroCategoria;
			const coincideDepartamento = filtroDepartamento === 'Todos' || actor.departamento === filtroDepartamento;

			return coincideBusqueda && coincideCategoria && coincideDepartamento;
		});
	}, [actores, busqueda, filtroCategoria, filtroDepartamento]);

	if (cargando) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
				<CircularProgress />
			</Box>
		);
	}

	if (error) {
		return (
			<Box sx={{ p: 4 }}>
				<Alert severity="error">{error}</Alert>
			</Box>
		);
	}

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
							{departamentos.map((dep) => (
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
							{categorias.map((cat) => (
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
function ActorCard({ actor }: { actor: Actor }) {
	// por si no trae foto propia, usamos una imagen estable por id como placeholder
	const fotoUrl = actor.fotoUrl || `https://picsum.photos/seed/actor${actor.id}/600/400`;

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
			<CardActionArea
				component={Link}
				to={`/actores/${actor.id}`}
				sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
			>
				<CardMedia
					component="img"
					height="220"
					image={fotoUrl}
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
			</CardActionArea>
		</Card>
	);
}
