import { useRef, useState, type ReactNode } from 'react';

import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import BusinessIcon from '@mui/icons-material/Business';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CollectionsIcon from '@mui/icons-material/Collections';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import SendIcon from '@mui/icons-material/Send';
import {
	Alert,
	Box,
	Button,
	Chip,
	Divider,
	FormControl,
	FormControlLabel,
	Grid,
	InputLabel,
	MenuItem,
	Paper,
	Radio,
	RadioGroup,
	Select,
	Stack,
	TextField,
	Typography,
} from '@mui/material';

const STEPS = ['Datos generales', 'Categoría', 'Subcategoría', 'Portafolio', 'Vista previa'];

const STEP_DESCRIPTIONS = [
	'Información base del actor cultural y selección de categoría/subcategoría.',
	'Campos específicos definidos por la categoría elegida.',
	'Campos más precisos definidos por la subcategoría elegida.',
	'Contenido público para construir el perfil artístico.',
	'Revisión final de la ficha antes de enviar el registro.',
];

const CATEGORY_FIELDS = [
	'Disciplina principal',
	'Años de trayectoria',
	'Modalidad de presentación',
	'Necesidades técnicas',
];

const SUBCATEGORY_FIELDS = ['Formato del elenco', 'Cantidad de integrantes', 'Duración del espectáculo', 'Público sugerido'];

type ActorType = 'persona' | 'colectivo' | 'institucion';

const actorTypeOptions: {
	value: ActorType;
	label: string;
	description: string;
	icon: ReactNode;
}[] = [
	{
		value: 'persona',
		label: 'Persona individual',
		description: 'Artistas, talleristas, gestores o creadores independientes.',
		icon: <PersonIcon fontSize="small" />,
	},
	{
		value: 'colectivo',
		label: 'Colectivo o grupo',
		description: 'Bandas, compañías, agrupaciones, proyectos o elencos.',
		icon: <GroupsIcon fontSize="small" />,
	},
	{
		value: 'institucion',
		label: 'Institución o espacio',
		description: 'Centros culturales, salas, museos, academias o entidades.',
		icon: <BusinessIcon fontSize="small" />,
	},
];

export default function ActorNuevoMockupPage() {
	const pageTopRef = useRef<HTMLDivElement>(null);
	const [activeStep, setActiveStep] = useState(0);
	const [actorType, setActorType] = useState<ActorType>('colectivo');
	const [category, setCategory] = useState('Artes escénicas');
	const [subcategory, setSubcategory] = useState('Circo contemporáneo');

	const isLastStep = activeStep === STEPS.length - 1;

	const scrollToTop = () => {
		window.requestAnimationFrame(() => {
			pageTopRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' });
		});
	};

	const handleNext = () => {
		setActiveStep((step) => Math.min(step + 1, STEPS.length - 1));
		scrollToTop();
	};

	const handleBack = () => {
		setActiveStep((step) => Math.max(step - 1, 0));
		scrollToTop();
	};

	return (
		<Box
			ref={pageTopRef}
			sx={{
				width: '100%',
				minHeight: 'calc(100vh - 64px)',
				bgcolor: 'background.default',
				px: { xs: 2, md: 3 },
				py: { xs: 2, md: 3 },
				boxSizing: 'border-box',
			}}
		>
			<Box sx={{ maxWidth: 1240, mx: 'auto' }}>
				<Stack
					direction={{ xs: 'column', md: 'row' }}
					spacing={2}
					justifyContent="space-between"
					alignItems={{ xs: 'stretch', md: 'flex-start' }}
					sx={{ mb: 3 }}
				>
					<Box>
						<Typography variant="h4" component="h1" fontWeight={700} sx={{ mb: 0.5 }}>
							Registrar actor cultural
						</Typography>
						<Typography color="text.secondary" sx={{ maxWidth: 740 }}>
							Un flujo por etapas: primero los datos base del actor, después los formularios específicos
							según categoría y subcategoría, y al final el portafolio público con vista previa.
						</Typography>
					</Box>

				</Stack>

				<Grid container spacing={3} alignItems="flex-start">
					<Grid size={{ xs: 12 }}>
						<Stack spacing={3}>
							<Paper variant="outlined" sx={{ borderRadius: 2, p: { xs: 2, md: 3 } }}>
								<Stack spacing={0.5} sx={{ mb: 3 }}>
									<Typography variant="h5" fontWeight={700}>
										{STEPS[activeStep]}
									</Typography>
									<Typography variant="body2" color="text.secondary">
										{STEP_DESCRIPTIONS[activeStep]}
									</Typography>
								</Stack>

								{activeStep === 0 && (
									<GeneralActorFields
										actorType={actorType}
										category={category}
										subcategory={subcategory}
										onActorTypeChange={setActorType}
										onCategoryChange={setCategory}
										onSubcategoryChange={setSubcategory}
									/>
								)}
								{activeStep === 1 && <CategoryForm category={category} />}
								{activeStep === 2 && <SubcategoryForm category={category} subcategory={subcategory} />}
								{activeStep === 3 && <PortfolioForm />}
								{activeStep === 4 && (
									<ReviewStep category={category} subcategory={subcategory} actorType={actorType} />
								)}
							</Paper>

							<Stack
								direction={{ xs: 'column', sm: 'row' }}
								spacing={1}
								justifyContent="space-between"
								sx={{ pt: 1, pb: { xs: 3, md: 4 } }}
							>
								<Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleBack} disabled={activeStep === 0}>
									Atrás
								</Button>
								<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
									<Button variant="contained" endIcon={isLastStep ? <SendIcon /> : <ArrowForwardIcon />} onClick={handleNext}>
										{isLastStep ? 'Confirmar y enviar' : 'Siguiente'}
									</Button>
								</Stack>
							</Stack>
						</Stack>
					</Grid>
				</Grid>
			</Box>
		</Box>
	);
}

function GeneralActorFields({
	actorType,
	category,
	subcategory,
	onActorTypeChange,
	onCategoryChange,
	onSubcategoryChange,
}: {
	actorType: ActorType;
	category: string;
	subcategory: string;
	onActorTypeChange: (value: ActorType) => void;
	onCategoryChange: (value: string) => void;
	onSubcategoryChange: (value: string) => void;
}) {
	return (
		<Grid container spacing={2.5}>
			<Grid size={{ xs: 12 }}>
				<TextField
					fullWidth
					required
					label="Nombre público del actor"
					placeholder="Ej. Compañía Circo Fuego"
					helperText="Usá el nombre con el que el público reconoce al actor cultural."
				/>
			</Grid>

			<Grid size={{ xs: 12 }}>
				<Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
					Tipo de actor
				</Typography>
				<RadioGroup value={actorType} onChange={(event) => onActorTypeChange(event.target.value as ActorType)}>
					<Grid container spacing={1.5}>
						{actorTypeOptions.map((option) => {
							const selected = actorType === option.value;

							return (
								<Grid key={option.value} size={{ xs: 12, md: 4 }}>
									<Box
										sx={{
											border: '1px solid',
											borderColor: selected ? 'primary.main' : 'divider',
											borderRadius: 1,
											p: 1.5,
											bgcolor: selected ? 'action.selected' : 'transparent',
											height: '100%',
										}}
									>
										<FormControlLabel
											value={option.value}
											control={<Radio size="small" />}
											label={
												<Stack spacing={0.5}>
													<Stack direction="row" spacing={1} alignItems="center">
														{option.icon}
														<Typography variant="body2" fontWeight={700}>
															{option.label}
														</Typography>
													</Stack>
													<Typography variant="caption" color="text.secondary">
														{option.description}
													</Typography>
												</Stack>
											}
											sx={{ m: 0, alignItems: 'flex-start' }}
										/>
									</Box>
								</Grid>
							);
						})}
					</Grid>
				</RadioGroup>
			</Grid>

			<Grid size={{ xs: 12, md: 6 }}>
				<FormControl fullWidth required>
					<InputLabel>Categoría principal</InputLabel>
					<Select label="Categoría principal" value={category} onChange={(event) => onCategoryChange(event.target.value)}>
						<MenuItem value="Música">Música</MenuItem>
						<MenuItem value="Artes escénicas">Artes escénicas</MenuItem>
						<MenuItem value="Artes visuales">Artes visuales</MenuItem>
						<MenuItem value="Artesanías">Artesanías</MenuItem>
						<MenuItem value="Gestión cultural">Gestión cultural</MenuItem>
					</Select>
				</FormControl>
			</Grid>

			<Grid size={{ xs: 12, md: 6 }}>
				<FormControl fullWidth required>
					<InputLabel>Subcategoría</InputLabel>
					<Select
						label="Subcategoría"
						value={subcategory}
						onChange={(event) => onSubcategoryChange(event.target.value)}
					>
						<MenuItem value="Circo contemporáneo">Circo contemporáneo</MenuItem>
						<MenuItem value="Teatro independiente">Teatro independiente</MenuItem>
						<MenuItem value="Danza">Danza</MenuItem>
						<MenuItem value="Títeres">Títeres</MenuItem>
					</Select>
				</FormControl>
			</Grid>

			<Grid size={{ xs: 12 }}>
				<TextField
					fullWidth
					multiline
					minRows={3}
					label="Descripción breve"
					placeholder="Resumen público del actor cultural."
					helperText="Descripción inicial para listados, mapa y tarjetas."
				/>
			</Grid>

			<Grid size={{ xs: 12, md: 4 }}>
				<FormControl fullWidth required>
					<InputLabel>Departamento</InputLabel>
					<Select label="Departamento" defaultValue="Capital">
						<MenuItem value="Capital">Capital</MenuItem>
						<MenuItem value="Tafí Viejo">Tafí Viejo</MenuItem>
						<MenuItem value="Yerba Buena">Yerba Buena</MenuItem>
						<MenuItem value="Monteros">Monteros</MenuItem>
					</Select>
				</FormControl>
			</Grid>
			<Grid size={{ xs: 12, md: 4 }}>
				<TextField fullWidth required label="Localidad" placeholder="San Miguel de Tucumán" />
			</Grid>
			<Grid size={{ xs: 12, md: 4 }}>
				<TextField fullWidth label="Barrio o zona" placeholder="Opcional" />
			</Grid>

			<Grid size={{ xs: 12, md: 6 }}>
				<TextField fullWidth required label="Correo de contacto" placeholder="contacto@ejemplo.com" />
			</Grid>
			<Grid size={{ xs: 12, md: 6 }}>
				<TextField fullWidth label="Teléfono o WhatsApp" placeholder="+54 9 381 000 0000" />
			</Grid>
		</Grid>
	);
}

function CategoryForm({ category }: { category: string }) {
	return (
		<Grid container spacing={2.5}>
			<Grid size={{ xs: 12 }}>
				<Alert severity="success" variant="outlined">
					Formulario dinámico para la categoría {category}. En producción estos campos deberían venir de la
					configuración creada por administración.
				</Alert>
			</Grid>

			<Grid size={{ xs: 12, md: 6 }}>
				<FormControl fullWidth required>
					<InputLabel>Disciplina principal</InputLabel>
					<Select label="Disciplina principal" defaultValue="Circo">
						<MenuItem value="Circo">Circo</MenuItem>
						<MenuItem value="Teatro">Teatro</MenuItem>
						<MenuItem value="Danza">Danza</MenuItem>
						<MenuItem value="Performance">Performance</MenuItem>
					</Select>
				</FormControl>
			</Grid>
			<Grid size={{ xs: 12, md: 6 }}>
				<TextField fullWidth label="Años de trayectoria" placeholder="Ej. 8" />
			</Grid>
			<Grid size={{ xs: 12, md: 6 }}>
				<FormControl fullWidth>
					<InputLabel>Modalidad de presentación</InputLabel>
					<Select label="Modalidad de presentación" defaultValue="Presencial">
						<MenuItem value="Presencial">Presencial</MenuItem>
						<MenuItem value="Virtual">Virtual</MenuItem>
						<MenuItem value="Mixta">Mixta</MenuItem>
					</Select>
				</FormControl>
			</Grid>
			<Grid size={{ xs: 12, md: 6 }}>
				<TextField fullWidth label="Necesidades técnicas" placeholder="Sonido, luces, escenario..." />
			</Grid>
			<Grid size={{ xs: 12 }}>
				<TextField
					fullWidth
					multiline
					minRows={4}
					label="Descripción específica de la categoría"
					placeholder="Información técnica o artística propia de esta categoría."
				/>
			</Grid>

			<Grid size={{ xs: 12 }}>
				<FieldPreview title="Campos esperados para esta categoría" fields={CATEGORY_FIELDS} />
			</Grid>
		</Grid>
	);
}

function SubcategoryForm({ category, subcategory }: { category: string; subcategory: string }) {
	return (
		<Grid container spacing={2.5}>
			<Grid size={{ xs: 12 }}>
				<Alert severity="success" variant="outlined">
					Formulario dinámico para {subcategory}, dentro de {category}. Esta capa permite pedir datos más
					específicos sin sobrecargar el primer paso.
				</Alert>
			</Grid>

			<Grid size={{ xs: 12, md: 6 }}>
				<FormControl fullWidth required>
					<InputLabel>Formato del elenco</InputLabel>
					<Select label="Formato del elenco" defaultValue="Compañía">
						<MenuItem value="Solista">Solista</MenuItem>
						<MenuItem value="Dúo">Dúo</MenuItem>
						<MenuItem value="Compañía">Compañía</MenuItem>
						<MenuItem value="Colectivo">Colectivo</MenuItem>
					</Select>
				</FormControl>
			</Grid>
			<Grid size={{ xs: 12, md: 6 }}>
				<TextField fullWidth label="Cantidad de integrantes" placeholder="Ej. 6" />
			</Grid>
			<Grid size={{ xs: 12, md: 6 }}>
				<TextField fullWidth label="Duración del espectáculo" placeholder="Ej. 45 minutos" />
			</Grid>
			<Grid size={{ xs: 12, md: 6 }}>
				<FormControl fullWidth>
					<InputLabel>Público sugerido</InputLabel>
					<Select label="Público sugerido" defaultValue="Todo público">
						<MenuItem value="Todo público">Todo público</MenuItem>
						<MenuItem value="Infancias">Infancias</MenuItem>
						<MenuItem value="Jóvenes y adultos">Jóvenes y adultos</MenuItem>
					</Select>
				</FormControl>
			</Grid>
			<Grid size={{ xs: 12 }}>
				<TextField
					fullWidth
					multiline
					minRows={4}
					label="Detalle de propuesta"
					placeholder="Contá qué caracteriza esta propuesta dentro de la subcategoría elegida."
				/>
			</Grid>

			<Grid size={{ xs: 12 }}>
				<FieldPreview title="Campos esperados para esta subcategoría" fields={SUBCATEGORY_FIELDS} />
			</Grid>
		</Grid>
	);
}

function PortfolioForm() {
	return (
		<Grid container spacing={2.5}>
			<Grid size={{ xs: 12 }}>
				<Alert severity="info" variant="outlined">
					Esta sección construye la página pública del actor. Puede ser opcional en parte, pero mejora mucho
					la ficha final.
				</Alert>
			</Grid>

			<Grid size={{ xs: 12 }}>
				<TextField
					fullWidth
					multiline
					minRows={5}
					label="Biografía o presentación extendida"
					placeholder="Trayectoria, estilo, proyectos, vínculos comunitarios y principales trabajos."
				/>
			</Grid>

			<Grid size={{ xs: 12, md: 6 }}>
				<TextField fullWidth label="Instagram / red social" placeholder="@actorcultural" />
			</Grid>
			<Grid size={{ xs: 12, md: 6 }}>
				<TextField fullWidth label="Sitio web o link principal" placeholder="https://..." />
			</Grid>
			<Grid size={{ xs: 12, md: 6 }}>
				<TextField fullWidth label="Video destacado" placeholder="Link a YouTube, Vimeo u otra plataforma" />
			</Grid>
			<Grid size={{ xs: 12, md: 6 }}>
				<TextField fullWidth label="Obra o proyecto destacado" placeholder="Ej. Varieté de fuego" />
			</Grid>

			<Grid size={{ xs: 12, md: 6 }}>
				<UploadBox icon={<AddPhotoAlternateIcon color="primary" />} title="Imagen principal" detail="Portada del perfil público" />
			</Grid>
			<Grid size={{ xs: 12, md: 6 }}>
				<UploadBox icon={<CollectionsIcon color="primary" />} title="Galería" detail="Fotos de obras, talleres o presentaciones" />
			</Grid>
		</Grid>
	);
}

function ReviewStep({
	category,
	subcategory,
	actorType,
}: {
	category: string;
	subcategory: string;
	actorType: ActorType;
}) {
	return (
		<Grid container spacing={3}>
			<Grid size={{ xs: 12 }}>
				<Alert severity="warning" variant="outlined">
					Antes de enviar, el usuario debería revisar los datos administrativos y la vista pública. Luego el
					registro queda pendiente de validación.
				</Alert>
			</Grid>

			<Grid size={{ xs: 12 }}>
				<Paper variant="outlined" sx={{ borderRadius: 1, p: 2 }}>
					<Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
						Resumen para confirmar
					</Typography>
					<Stack spacing={1.25}>
						<ContextRow label="Nombre" value="Compañía Circo Fuego" />
						<ContextRow label="Tipo" value={actorTypeLabel(actorType)} />
						<ContextRow label="Categoría" value={category} />
						<ContextRow label="Subcategoría" value={subcategory} />
						<ContextRow label="Ubicación" value="Capital, Tucumán" />
						<ContextRow label="Estado inicial" value="Pendiente de revisión" />
					</Stack>
				</Paper>
			</Grid>
		</Grid>
	);
}

function UploadBox({ icon, title, detail }: { icon: ReactNode; title: string; detail: string }) {
	return (
		<Box
			sx={{
				border: '1px dashed',
				borderColor: 'primary.main',
				borderRadius: 1,
				p: 2,
				minHeight: 140,
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				textAlign: 'center',
				bgcolor: 'action.hover',
			}}
		>
			{icon}
			<Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1 }}>
				{title}
			</Typography>
			<Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
				{detail}
			</Typography>
			<Button size="small" variant="outlined" startIcon={<CloudUploadIcon />}>
				Adjuntar
			</Button>
		</Box>
	);
}

function FieldPreview({ title, fields }: { title: string; fields: string[] }) {
	return (
		<Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
			<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
				<AssignmentTurnedInIcon color="primary" fontSize="small" />
				<Typography variant="subtitle2" fontWeight={700}>
					{title}
				</Typography>
			</Stack>
			<Stack direction="row" flexWrap="wrap" gap={1}>
				{fields.map((field) => (
					<Chip key={field} label={field} size="small" variant="outlined" />
				))}
			</Stack>
		</Box>
	);
}

function ContextRow({ label, value }: { label: string; value: string }) {
	return (
		<Box>
			<Typography variant="caption" color="text.secondary">
				{label}
			</Typography>
			<Typography variant="body2" fontWeight={700}>
				{value}
			</Typography>
			<Divider sx={{ mt: 1 }} />
		</Box>
	);
}

function actorTypeLabel(actorType: ActorType) {
	const option = actorTypeOptions.find((item) => item.value === actorType);
	return option?.label ?? 'Actor cultural';
}
