import { useEffect, useState } from 'react';
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
import {
	listarActores,
	obtenerFiltrosListadoActores,
	type ActorResumen,
	type FiltroCategoria,
	type FiltroDepartamento,
} from '../api/actores';
import CategoryIcon from '../components/categoryIcon';

export default function ListaActoresPublica() {
	const [actores, setActores] = useState<ActorResumen[]>([]);
	const [categorias, setCategorias] = useState<FiltroCategoria[]>([]);
	const [departamentos, setDepartamentos] = useState<FiltroDepartamento[]>([]);
	const [total, setTotal] = useState(0);
	const [cargando, setCargando] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [busqueda, setBusqueda] = useState('');
	const [filtroCategoria, setFiltroCategoria] = useState(0);
	const [filtroDepartamento, setFiltroDepartamento] = useState('');

	useEffect(() => {
		const controller = new AbortController();

		async function loadFilters() {
			try {
				const filtros = await obtenerFiltrosListadoActores(controller.signal);

				setCategorias(filtros.categorias);
				setDepartamentos(filtros.departamentos);
			} catch (error) {
				if (!(error instanceof DOMException && error.name === 'AbortError')) {
					setError(error instanceof Error ? error.message : 'No se pudieron cargar los filtros.');
				}
			}
		}

		loadFilters();

		return () => controller.abort();
	}, []);

	useEffect(() => {
		const controller = new AbortController();

		async function loadActors() {
			try {
				setCargando(true);
				setError(null);

				const result = await listarActores(
					{
						busqueda,
						departamento: filtroDepartamento,
						idCategoria: filtroCategoria,
						limit: 100,
						offset: 0,
					},
					controller.signal,
				);

				setActores(result.data);
				setTotal(result.pagination.total);
			} catch (error) {
				if (!(error instanceof DOMException && error.name === 'AbortError')) {
					setError(error instanceof Error ? error.message : 'No se pudieron cargar los actores culturales.');
				}
			} finally {
				if (!controller.signal.aborted) {
					setCargando(false);
				}
			}
		}

		loadActors();

		return () => controller.abort();
	}, [busqueda, filtroCategoria, filtroDepartamento]);

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
							<MenuItem value="">Todos</MenuItem>

							{departamentos.map((dep) => (
								<MenuItem key={dep.departamento} value={dep.departamento}>
									{dep.departamento}
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
							onChange={(e) => setFiltroCategoria(Number(e.target.value))}
						>
							<MenuItem value={0}>Todas</MenuItem>

							{categorias.map((cat) => (
								<MenuItem key={cat.id} value={cat.id}>
									<CategoryIcon icono={cat.icono} fontSize="small" sx={{ mr: 1 }} />
									{cat.nombre}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Grid>
			</Grid>

			<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
				{total} actores encontrados
			</Typography>

			{actores.length === 0 ? (
				<Alert severity="info">No se encontraron actores que coincidan con los filtros.</Alert>
			) : actores.length === 1 ? (
				<Box display="flex" justifyContent="center">
					<Box sx={{ maxWidth: 500, width: '100%' }}>
						<ActorCard actor={actores[0]} />
					</Box>
				</Box>
			) : (
				<Grid container spacing={4}>
					{actores.map((actor) => (
						<Grid key={actor.id} size={{ xs: 12, md: 6 }}>
							<ActorCard actor={actor} />
						</Grid>
					))}
				</Grid>
			)}
		</Box>
	);
}

function ActorCard({ actor }: { actor: ActorResumen }) {
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
				{actor.foto ? (
					<CardMedia
						component="img"
						height="220"
						image={actor.foto}
						alt={`Foto de ${actor.nombre}`}
						sx={{ objectFit: 'cover' }}
					/>
				) : (
					<Box
						sx={{
							height: 220,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							bgcolor: 'action.hover',
							color: 'text.secondary',
						}}
					>
						Sin imagen disponible
					</Box>
				)}
				<CardContent sx={{ flexGrow: 1, p: 3 }}>
					<Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
						{actor.nombre}
					</Typography>

					<Stack direction="row" spacing={1} sx={{ mb: 2 }}>
						<Chip
							icon={<CategoryIcon icono={actor.categoriaIcono} fontSize="small" />}
							label={actor.categoria}
							size="small"
							color="primary"
						/>
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
