import { useState } from 'react';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventIcon from '@mui/icons-material/Event';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import {
	Box,
	Button,
	Card,
	CardActionArea,
	CardContent,
	Checkbox,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	FormControlLabel,
	FormGroup,
	Grid,
	Stack,
	Typography,
} from '@mui/material';

// --- Datos Mock ---
type Convocatoria = {
	id: number;
	titulo: string;
	descripcion: string;
	fechaCierre: string;
};

const MOCK_CONVOCATORIAS: Convocatoria[] = [
	{
		id: 1,
		titulo: 'Festival Nacional del Limón 2026',
		descripcion: 'Convocatoria oficial para artistas musicales de Tafí Viejo y la provincia.',
		fechaCierre: '2026-08-30',
	},
	{
		id: 2,
		titulo: 'Mercado Artesanal Calchaquí - Edición Invierno',
		descripcion: 'Espacio de exposición y venta para artesanos de la ruta 307.',
		fechaCierre: '2026-07-05',
	},
	{
		id: 3,
		titulo: 'Fomento a la Producción Audiovisual Independiente',
		descripcion: 'Subsidio provincial para finalización de cortometrajes.',
		fechaCierre: '2026-10-15',
	},
];

// Simulamos los actores que el usuario actual (Dueño) tiene registrados
const MOCK_MIS_ACTORES = [
	{ id: 4, nombre: 'Los Carpinchos del Alba', categoria: 'Música' },
	{ id: 6, nombre: 'Compañía Circo Fuego', categoria: 'Artes Escénicas' },
	{ id: 12, nombre: 'Grupo Ráfaga', categoria: 'Música' },
];

export default function ConvocatoriasUsuario() {
	// Estado: Mapea { idConvocatoria: [idActor1, idActor2] }
	const [postulaciones, setPostulaciones] = useState<Record<number, number[]>>({});

	// Estado para el modal
	const [dialogOpen, setDialogOpen] = useState(false);
	const [convocatoriaSeleccionada, setConvocatoriaSeleccionada] = useState<Convocatoria | null>(null);

	const handleOpenDialog = (convocatoria: Convocatoria) => {
		setConvocatoriaSeleccionada(convocatoria);
		setDialogOpen(true);
	};

	const handleCloseDialog = () => {
		setDialogOpen(false);
		setConvocatoriaSeleccionada(null);
	};

	const handleToggleActor = (idConvocatoria: number, idActor: number) => {
		setPostulaciones((prev) => {
			const actoresActuales = prev[idConvocatoria] || [];
			const estaPostulado = actoresActuales.includes(idActor);

			if (estaPostulado) {
				// Quita al actor de esta convocatoria
				return {
					...prev,
					[idConvocatoria]: actoresActuales.filter((id) => id !== idActor),
				};
			} else {
				// Agrega al actor a esta convocatoria
				return {
					...prev,
					[idConvocatoria]: [...actoresActuales, idActor],
				};
			}
		});
	};

	return (
		<Box sx={{ width: '100%', maxWidth: 1200, margin: '0 auto', p: 3 }}>
			<Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
				Convocatorias Abiertas
			</Typography>
			{/* <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
				Elegí una convocatoria para postular a tus actores culturales.
			</Typography> */}

			<Grid container spacing={3} sx={{ paddingY: 5 }}>
				{MOCK_CONVOCATORIAS.map((convocatoria) => {
					const actoresPostulados = postulaciones[convocatoria.id] || [];
					const cantidadPostulados = actoresPostulados.length;
					const estaPostulado = cantidadPostulados > 0;

					return (
						<Grid key={convocatoria.id} size={{ xs: 12 }}>
							<Card
								variant="outlined"
								sx={{
									height: '100%',
									display: 'flex',
									flexDirection: 'column',
									// Cambiamos sutilmente el borde y fondo si está postulado
									borderColor: estaPostulado ? 'primary.main' : 'divider',
									backgroundColor: 'background.paper',
									transition: 'all 0.5s ease-out',
									borderWidth: 2,
								}}
							>
								<CardActionArea
									onClick={() => handleOpenDialog(convocatoria)}
									sx={{
										height: '100%',
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'stretch',
									}}
								>
									<CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
										<Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
											{convocatoria.titulo}
										</Typography>

										<Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
											{convocatoria.descripcion}
										</Typography>

										<Stack
											spacing={2}
											direction="row"
											justifyContent="space-between"
											alignItems="center"
										>
											<Stack
												direction="row"
												alignItems="center"
												spacing={1}
												color="text.secondary"
											>
												<EventIcon fontSize="small" />
												<Typography variant="caption" fontWeight="medium">
													Cierra el:{' '}
													{new Date(convocatoria.fechaCierre).toLocaleDateString('es-AR')}
												</Typography>
											</Stack>

											{estaPostulado ? (
												<Chip
													icon={<CheckCircleIcon />}
													label={`Postulado con ${cantidadPostulados} actor(es)`}
													color="primary"
													sx={{ fontWeight: 'bold', alignSelf: 'flex-start' }}
												/>
											) : (
												<Chip
													icon={<RadioButtonUncheckedIcon />}
													label="Tocar para postularse"
													variant="outlined"
													sx={{ alignSelf: 'flex-start' }}
												/>
											)}
										</Stack>
									</CardContent>
								</CardActionArea>
							</Card>
						</Grid>
					);
				})}
			</Grid>

			{/* --- Modal de Selección de Actores --- */}
			<Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
				<DialogTitle sx={{ fontWeight: 'bold', pb: 1 }}>Gestionar Postulación</DialogTitle>
				<DialogContent dividers>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
						Seleccioná con cuáles de tus actores querés participar en{' '}
						<strong>{convocatoriaSeleccionada?.titulo}</strong>. Podés elegir más de uno.
					</Typography>

					<FormGroup>
						{MOCK_MIS_ACTORES.map((actor) => {
							const idConv = convocatoriaSeleccionada?.id || 0;
							const isChecked = (postulaciones[idConv] || []).includes(actor.id);

							return (
								<Box key={actor.id} sx={{ mb: 1 }}>
									<FormControlLabel
										control={
											<Checkbox
												checked={isChecked}
												onChange={() => handleToggleActor(idConv, actor.id)}
												color="primary"
											/>
										}
										label={
											<Box>
												<Typography variant="body1" sx={{ fontWeight: 500 }}>
													{actor.nombre}
												</Typography>
												<Typography variant="caption" color="text.secondary">
													{actor.categoria}
												</Typography>
											</Box>
										}
									/>
									<Divider sx={{ mt: 1 }} />
								</Box>
							);
						})}
					</FormGroup>
				</DialogContent>
				<DialogActions sx={{ p: 2 }}>
					<Button onClick={handleCloseDialog} variant="contained" color="primary" disableElevation>
						Listo
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}
