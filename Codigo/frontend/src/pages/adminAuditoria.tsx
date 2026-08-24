import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import FilterListIcon from '@mui/icons-material/FilterList';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	CircularProgress,
	FormControl,
	Grid,
	InputAdornment,
	InputLabel,
	MenuItem,
	Paper,
	Select,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Typography,
} from '@mui/material';
import { useColorScheme } from '@mui/material/styles';

import { auditarIntegridadSistemaAdmin, type AuditoriaIntegridadItem } from '../api/admin';

dayjs.locale('es');

export default function AdminAuditoriaPage() {
	const { mode, systemMode } = useColorScheme();
	const isDarkMode = mode === 'system' ? systemMode === 'dark' : mode === 'dark';

	const [hallazgos, setHallazgos] = useState<AuditoriaIntegridadItem[]>([]);
	const [cargando, setCargando] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Filtros
	const [busqueda, setBusqueda] = useState('');
	const [filtroSeveridad, setFiltroSeveridad] = useState<string>('TODAS');
	const [filtroModulo, setFiltroModulo] = useState<string>('TODOS');

	const ejecutarAuditoria = async () => {
		try {
			setCargando(true);
			setError(null);
			const response = await auditarIntegridadSistemaAdmin();
			setHallazgos(response.data);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'No se pudo ejecutar la auditoría de integridad.');
		} finally {
			setCargando(false);
		}
	};

	useEffect(() => {
		ejecutarAuditoria();
	}, []);

	// Módulos únicos detectados
	const modulosDisponibles = useMemo(() => {
		const mods = new Set(hallazgos.map((h) => h.modulo));
		return Array.from(mods).sort();
	}, [hallazgos]);

	// Contadores por severidad
	const conteoAlta = useMemo(() => hallazgos.filter((h) => h.severidad === 'ALTA').length, [hallazgos]);
	const conteoMedia = useMemo(() => hallazgos.filter((h) => h.severidad === 'MEDIA').length, [hallazgos]);
	const conteoBaja = useMemo(() => hallazgos.filter((h) => h.severidad === 'BAJA').length, [hallazgos]);
	const conteoInfo = useMemo(() => hallazgos.filter((h) => h.severidad === 'INFO').length, [hallazgos]);

	// Filtrado de la lista
	const hallazgosFiltrados = useMemo(() => {
		return hallazgos.filter((item) => {
			if (filtroSeveridad !== 'TODAS' && item.severidad !== filtroSeveridad) {
				return false;
			}
			if (filtroModulo !== 'TODOS' && item.modulo !== filtroModulo) {
				return false;
			}
			if (busqueda.trim()) {
				const query = busqueda.toLowerCase();
				const matchDesc = item.descripcion.toLowerCase().includes(query);
				const matchMod = item.modulo.toLowerCase().includes(query);
				const matchRef = item.idReferencia ? String(item.idReferencia).includes(query) : false;
				if (!matchDesc && !matchMod && !matchRef) {
					return false;
				}
			}
			return true;
		});
	}, [hallazgos, filtroSeveridad, filtroModulo, busqueda]);

	const renderSeveridadChip = (severidad: AuditoriaIntegridadItem['severidad']) => {
		switch (severidad) {
			case 'ALTA':
				return (
					<Chip
						size="small"
						icon={<ErrorOutlineIcon fontSize="small" />}
						label="ALTA"
						color="error"
						sx={{ fontWeight: 700 }}
					/>
				);
			case 'MEDIA':
				return (
					<Chip
						size="small"
						icon={<WarningAmberIcon fontSize="small" />}
						label="MEDIA"
						color="warning"
						sx={{ fontWeight: 600 }}
					/>
				);
			case 'BAJA':
				return <Chip size="small" label="BAJA" color="warning" variant="outlined" sx={{ fontWeight: 500 }} />;
			case 'INFO':
				return (
					<Chip
						size="small"
						icon={<InfoOutlinedIcon fontSize="small" />}
						label="INFO"
						color="info"
						variant="outlined"
						sx={{ fontWeight: 500 }}
					/>
				);
			default:
				return <Chip size="small" label={severidad} />;
		}
	};

	return (
		<Box sx={{ width: '100%', margin: '0 auto', p: { xs: 2, sm: 3 }, pb: 8 }}>
			{/* Cabecera */}
			<Box
				sx={{
					mb: 3,
					p: { xs: 2.5, sm: 3.5 },
					borderRadius: 2.5,
					background: isDarkMode
						? 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)'
						: 'linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%)',
					border: '1px solid',
					borderColor: 'divider',
				}}
			>
				<Stack
					direction={{ xs: 'column', sm: 'row' }}
					justifyContent="space-between"
					alignItems={{ xs: 'flex-start', sm: 'center' }}
					spacing={2}
				>
					<Stack direction="row" alignItems="center" spacing={2}>
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								width: 48,
								height: 48,
								borderRadius: 2,
								backgroundColor: isDarkMode ? 'success.dark' : 'success.main',
								color: '#fff',
								flexShrink: 0,
							}}
						>
							<FactCheckIcon fontSize="medium" />
						</Box>
						<Box>
							<Typography variant="h5" component="h1" fontWeight="700" color="text.primary">
								Auditoría de Integridad del Sistema
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Diagnóstico de consistencia relacional y reglas de negocio de la base de datos.
							</Typography>
						</Box>
					</Stack>

					<Button
						variant="contained"
						color="primary"
						startIcon={cargando ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon />}
						onClick={ejecutarAuditoria}
						disabled={cargando}
						sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
					>
						Ejecutar diagnóstico
					</Button>
				</Stack>
			</Box>

			{/* Tarjetas de Métricas de Severidad */}
			<Grid container spacing={2} sx={{ mb: 3 }}>
				<Grid size={{ xs: 6, sm: 3 }}>
					<Card
						elevation={0}
						sx={{
							p: 1.5,
							textAlign: 'center',
							borderRadius: 2,
							border: '1px solid',
							borderColor: 'divider',
						}}
					>
						<CardContent sx={{ p: '8px !important' }}>
							<Typography variant="caption" color="text.secondary" fontWeight="600">
								TOTAL HALLAZGOS
							</Typography>
							<Typography variant="h4" fontWeight="800" sx={{ my: 0.5 }}>
								{cargando ? <CircularProgress size={24} /> : hallazgos.length}
							</Typography>
							<Typography variant="caption" color="text.secondary">
								Observaciones registradas
							</Typography>
						</CardContent>
					</Card>
				</Grid>

				<Grid size={{ xs: 6, sm: 3 }}>
					<Card
						elevation={0}
						sx={{
							p: 1.5,
							textAlign: 'center',
							borderRadius: 2,
							border: '1px solid',
							borderColor: conteoAlta > 0 ? 'error.main' : 'divider',
							backgroundColor:
								conteoAlta > 0 ? (isDarkMode ? 'rgba(211, 47, 47, 0.1)' : '#ffebee') : undefined,
						}}
					>
						<CardContent sx={{ p: '8px !important' }}>
							<Typography
								variant="caption"
								color={conteoAlta > 0 ? 'error.main' : 'text.secondary'}
								fontWeight="600"
							>
								SEVERIDAD ALTA
							</Typography>
							<Typography
								variant="h4"
								fontWeight="800"
								color={conteoAlta > 0 ? 'error.main' : 'text.primary'}
								sx={{ my: 0.5 }}
							>
								{cargando ? <CircularProgress size={24} /> : conteoAlta}
							</Typography>
							<Typography variant="caption" color="text.secondary">
								Requieren atención
							</Typography>
						</CardContent>
					</Card>
				</Grid>

				<Grid size={{ xs: 6, sm: 3 }}>
					<Card
						elevation={0}
						sx={{
							p: 1.5,
							textAlign: 'center',
							borderRadius: 2,
							border: '1px solid',
							borderColor: conteoMedia + conteoBaja > 0 ? 'warning.main' : 'divider',
						}}
					>
						<CardContent sx={{ p: '8px !important' }}>
							<Typography variant="caption" color="text.secondary" fontWeight="600">
								MEDIA / BAJA
							</Typography>
							<Typography
								variant="h4"
								fontWeight="800"
								color={conteoMedia + conteoBaja > 0 ? 'warning.main' : 'text.primary'}
								sx={{ my: 0.5 }}
							>
								{cargando ? <CircularProgress size={24} /> : conteoMedia + conteoBaja}
							</Typography>
							<Typography variant="caption" color="text.secondary">
								Advertencias / ajustes
							</Typography>
						</CardContent>
					</Card>
				</Grid>

				<Grid size={{ xs: 6, sm: 3 }}>
					<Card
						elevation={0}
						sx={{
							p: 1.5,
							textAlign: 'center',
							borderRadius: 2,
							border: '1px solid',
							borderColor: 'divider',
						}}
					>
						<CardContent sx={{ p: '8px !important' }}>
							<Typography variant="caption" color="text.secondary" fontWeight="600">
								INFORMATIVOS
							</Typography>
							<Typography variant="h4" fontWeight="800" color="info.main" sx={{ my: 0.5 }}>
								{cargando ? <CircularProgress size={24} /> : conteoInfo}
							</Typography>
							<Typography variant="caption" color="text.secondary">
								Sugerencias y estados
							</Typography>
						</CardContent>
					</Card>
				</Grid>
			</Grid>

			{/* Barra de Filtros */}
			<Paper
				elevation={0}
				sx={{
					p: { xs: 2, sm: 2.5 },
					mb: 3,
					borderRadius: 2,
					border: '1px solid',
					borderColor: 'divider',
				}}
			>
				<Grid container spacing={2} alignItems="center">
					<Grid size={{ xs: 12, sm: 5 }}>
						<TextField
							fullWidth
							size="small"
							placeholder="Buscar en descripción, módulo o ID..."
							value={busqueda}
							onChange={(e) => setBusqueda(e.target.value)}
							slotProps={{
								input: {
									startAdornment: (
										<InputAdornment position="start">
											<SearchIcon fontSize="small" color="action" />
										</InputAdornment>
									),
								},
							}}
						/>
					</Grid>

					<Grid size={{ xs: 6, sm: 3.5 }}>
						<FormControl fullWidth size="small">
							<InputLabel id="filtro-severidad-label">Severidad</InputLabel>
							<Select
								labelId="filtro-severidad-label"
								value={filtroSeveridad}
								label="Severidad"
								onChange={(e) => setFiltroSeveridad(e.target.value)}
							>
								<MenuItem value="TODAS">Todas las severidades</MenuItem>
								<MenuItem value="ALTA">Alta (Crítica)</MenuItem>
								<MenuItem value="MEDIA">Media</MenuItem>
								<MenuItem value="BAJA">Baja</MenuItem>
								<MenuItem value="INFO">Informativa</MenuItem>
							</Select>
						</FormControl>
					</Grid>

					<Grid size={{ xs: 6, sm: 3.5 }}>
						<FormControl fullWidth size="small">
							<InputLabel id="filtro-modulo-label">Módulo</InputLabel>
							<Select
								labelId="filtro-modulo-label"
								value={filtroModulo}
								label="Módulo"
								onChange={(e) => setFiltroModulo(e.target.value)}
							>
								<MenuItem value="TODOS">Todos los módulos</MenuItem>
								{modulosDisponibles.map((mod) => (
									<MenuItem key={mod} value={mod}>
										{mod}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Grid>
				</Grid>
			</Paper>

			{/* Error */}
			{error && (
				<Alert
					severity="error"
					sx={{ mb: 3 }}
					action={
						<Button color="inherit" onClick={ejecutarAuditoria}>
							Reintentar
						</Button>
					}
				>
					{error}
				</Alert>
			)}

			{/* Tabla de Resultados */}
			{cargando ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
					<CircularProgress />
				</Box>
			) : hallazgos.length === 0 ? (
				<Paper
					elevation={0}
					sx={{
						p: 6,
						textAlign: 'center',
						borderRadius: 2.5,
						border: '1px dashed',
						borderColor: 'success.main',
						backgroundColor: isDarkMode ? 'rgba(46, 125, 50, 0.05)' : '#f0fdf4',
					}}
				>
					<CheckCircleOutlineIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
					<Typography variant="h6" fontWeight="700" color="success.dark" gutterBottom>
						¡Base de datos completamente íntegra!
					</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
						No se encontraron inconsistencias relacionales, formularios sin preguntas activas ni
						irregularidades en actores o eventos.
					</Typography>
				</Paper>
			) : hallazgosFiltrados.length === 0 ? (
				<Paper
					elevation={0}
					sx={{
						p: 5,
						textAlign: 'center',
						borderRadius: 2,
						border: '1px dashed',
						borderColor: 'divider',
					}}
				>
					<FilterListIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
					<Typography variant="subtitle1" fontWeight="600">
						No hay hallazgos con los filtros seleccionados
					</Typography>
					<Button
						size="small"
						sx={{ mt: 1.5 }}
						onClick={() => {
							setBusqueda('');
							setFiltroSeveridad('TODAS');
							setFiltroModulo('TODOS');
						}}
					>
						Restablecer filtros
					</Button>
				</Paper>
			) : (
				<TableContainer
					component={Paper}
					elevation={0}
					sx={{
						borderRadius: 2,
						border: '1px solid',
						borderColor: 'divider',
					}}
				>
					<Table sx={{ minWidth: 650 }}>
						<TableHead sx={{ backgroundColor: isDarkMode ? 'action.hover' : '#f8fafc' }}>
							<TableRow>
								<TableCell sx={{ fontWeight: 700, width: 120 }}>Severidad</TableCell>
								<TableCell sx={{ fontWeight: 700, width: 150 }}>Módulo</TableCell>
								<TableCell sx={{ fontWeight: 700, width: 110 }}>Referencia</TableCell>
								<TableCell sx={{ fontWeight: 700 }}>Descripción del Hallazgo</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{hallazgosFiltrados.map((item, index) => (
								<TableRow
									key={index}
									hover
									sx={{
										'&:last-child td, &:last-child th': { border: 0 },
									}}
								>
									<TableCell>{renderSeveridadChip(item.severidad)}</TableCell>
									<TableCell>
										<Chip
											size="small"
											label={item.modulo}
											variant="outlined"
											sx={{ fontWeight: 600, fontSize: '0.75rem' }}
										/>
									</TableCell>
									<TableCell>
										{item.idReferencia !== null ? (
											<Typography
												variant="body2"
												fontFamily="monospace"
												fontWeight="600"
												color="text.secondary"
											>
												#{item.idReferencia}
											</Typography>
										) : (
											<Typography variant="caption" color="text.disabled">
												N/A
											</Typography>
										)}
									</TableCell>
									<TableCell>
										<Typography variant="body2">{item.descripcion}</Typography>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			)}
		</Box>
	);
}
