import { useEffect, useRef, useState, type ReactNode } from 'react';

import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BusinessIcon from '@mui/icons-material/Business';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import GroupsIcon from '@mui/icons-material/Groups';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import type { LeafletMouseEvent } from 'leaflet';
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import {
	Alert,
	Autocomplete,
	Box,
	Button,
	Divider,
	FormControl,
	FormControlLabel,
	FormHelperText,
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

import 'leaflet/dist/leaflet.css';

const STEPS = ['Sobre tu actividad cultural', 'Categoría'];

const STEP_DESCRIPTIONS = [
	'Contanos los datos principales de tu actividad, proyecto o espacio cultural.',
	'La siguiente pantalla se definirá a partir del formulario configurado para la categoría elegida.',
];

type ActorType = 'persona' | 'colectivo' | 'institucion';

const subcategoriesByCategory: Record<string, string[]> = {
	Música: ['Solista', 'Banda o ensamble', 'Producción musical', 'Otra'],
	'Artes escénicas': ['Circo contemporáneo', 'Teatro independiente', 'Danza', 'Títeres', 'Otra'],
	'Artes visuales': ['Pintura', 'Escultura', 'Fotografía', 'Arte digital', 'Otra'],
	Artesanías: ['Textil', 'Cerámica', 'Madera', 'Metales', 'Otra'],
	'Gestión cultural': [],
};

const localitiesByDepartment: Record<string, string[]> = {
	Burruyacú: ['Burruyacú', 'El Chañar', 'El Naranjo', 'Garmendia'],
	Capital: ['San Miguel de Tucumán'],
	Chicligasta: ['Concepción', 'Alpachiri', 'Arcadia'],
	'Cruz Alta': ['Banda del Río Salí', 'Alderetes', 'Colombres', 'Los Ralos'],
	Famaillá: ['Famaillá'],
	Graneros: ['Graneros', 'Taco Ralo'],
	'Juan Bautista Alberdi': ['Juan Bautista Alberdi', 'Villa Belgrano'],
	'La Cocha': ['La Cocha', 'San José de La Cocha'],
	Leales: ['Bella Vista', 'Estación Aráoz', 'Los Gómez'],
	Lules: ['Lules', 'El Manantial', 'San Pablo'],
	Monteros: ['Monteros', 'Acheral', 'Río Seco'],
	'Río Chico': ['Aguilares', 'Los Sarmientos'],
	Simoca: ['Simoca', 'Atahona'],
	'Tafí del Valle': ['Tafí del Valle', 'Amaicha del Valle', 'El Mollar', 'Colalao del Valle'],
	'Tafí Viejo': ['Tafí Viejo', 'Las Talitas', 'El Cadillal'],
	Trancas: ['Trancas', 'San Pedro de Colalao'],
	'Yerba Buena': ['Yerba Buena', 'San Javier', 'Cevil Redondo'],
};

type MapPoint = { lat: number; lng: number };

type GeneralActorData = {
	nombre: string;
	descripcion: string;
	tieneCuit: boolean;
	cuit: string;
	departamento: string;
	localidad: string;
	direccion: string;
	ubicacion: MapPoint | null;
	ubicacionPublica: boolean;
	fotoNombre: string;
	fotoPreview: string;
};

const INITIAL_GENERAL_DATA: GeneralActorData = {
	nombre: '',
	descripcion: '',
	tieneCuit: false,
	cuit: '',
	departamento: 'Capital',
	localidad: 'San Miguel de Tucumán',
	direccion: '',
	ubicacion: null,
	ubicacionPublica: true,
	fotoNombre: '',
	fotoPreview: '',
};

const actorTypeOptions: {
	value: ActorType;
	label: string;
	description: string;
	icon: ReactNode;
}[] = [
	{
		value: 'persona',
		label: 'Trabajo de manera independiente',
		description: 'Soy artista, tallerista, gestor/a o creador/a independiente.',
		icon: <PersonIcon fontSize="small" />,
	},
	{
		value: 'colectivo',
		label: 'Somos un grupo o colectivo',
		description: 'Somos una banda, compañía, agrupación, proyecto o elenco.',
		icon: <GroupsIcon fontSize="small" />,
	},
	{
		value: 'institucion',
		label: 'Represento un espacio o institución',
		description: 'Es un emprendimiento, centro cultural, sala, museo, academia o entidad.',
		icon: <BusinessIcon fontSize="small" />,
	},
];

export default function ActorNuevoPage() {
	const pageTopRef = useRef<HTMLDivElement>(null);
	const [activeStep, setActiveStep] = useState(0);
	const [actorType, setActorType] = useState<ActorType>('colectivo');
	const [category, setCategory] = useState('Artes escénicas');
	const [subcategory, setSubcategory] = useState('Circo contemporáneo');
	const [generalData, setGeneralData] = useState<GeneralActorData>(INITIAL_GENERAL_DATA);
	const [generalError, setGeneralError] = useState('');

	const handleCategoryChange = (newCategory: string) => {
		setCategory(newCategory);
		setSubcategory(subcategoriesByCategory[newCategory]?.[0] ?? '');
	};

	const scrollToTop = () => {
		window.requestAnimationFrame(() => {
			pageTopRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' });
		});
	};

	const handleNext = () => {
		if (activeStep === 0) {
			const cuitInvalido = generalData.tieneCuit && !/^\d{11}$/.test(generalData.cuit);
			if (
				!generalData.nombre.trim() ||
				!generalData.descripcion.trim() ||
				!generalData.departamento ||
				!generalData.localidad ||
				!generalData.direccion.trim() ||
				!generalData.ubicacion ||
				cuitInvalido
			) {
				setGeneralError(
					cuitInvalido
						? 'Revisá el CUIT: debe tener exactamente 11 números.'
						: 'Completá los campos obligatorios y seleccioná una ubicación antes de continuar.',
				);
				scrollToTop();
				return;
			}
			setGeneralError('');
		}

		setActiveStep(1);
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
							Un flujo por etapas: primero los datos base de la actividad, después los formularios
							específicos según categoría y subcategoría, y al final el portafolio público con vista
							previa.
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
									<Stack spacing={2.5}>
										{generalError && <Alert severity="error">{generalError}</Alert>}
										<GeneralActorFields
											actorType={actorType}
											category={category}
											subcategory={subcategory}
											value={generalData}
											onChange={(changes) => {
												setGeneralData((current) => ({ ...current, ...changes }));
												setGeneralError('');
											}}
											onActorTypeChange={setActorType}
											onCategoryChange={handleCategoryChange}
											onSubcategoryChange={setSubcategory}
										/>
									</Stack>
								)}
								{activeStep === 1 && (
									<Alert severity="info" variant="outlined">
										Los datos generales quedaron completos. La pantalla con los campos específicos
										de {category}
										se implementará en la próxima etapa.
									</Alert>
								)}
							</Paper>

							<Stack
								direction={{ xs: 'column', sm: 'row' }}
								spacing={1}
								justifyContent="space-between"
								sx={{ pt: 1, pb: { xs: 3, md: 4 } }}
							>
								<Button
									variant="outlined"
									startIcon={<ArrowBackIcon />}
									onClick={handleBack}
									disabled={activeStep === 0}
								>
									Atrás
								</Button>
								{activeStep === 0 && (
									<Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={handleNext}>
										Siguiente
									</Button>
								)}
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
	value,
	onChange,
	onActorTypeChange,
	onCategoryChange,
	onSubcategoryChange,
}: {
	actorType: ActorType;
	category: string;
	subcategory: string;
	value: GeneralActorData;
	onChange: (changes: Partial<GeneralActorData>) => void;
	onActorTypeChange: (value: ActorType) => void;
	onCategoryChange: (value: string) => void;
	onSubcategoryChange: (value: string) => void;
}) {
	const availableSubcategories = subcategoriesByCategory[category] ?? [];
	const availableLocalities = localitiesByDepartment[value.departamento] ?? [];

	const handleDepartmentChange = (newDepartment: string) => {
		onChange({
			departamento: newDepartment,
			localidad: localitiesByDepartment[newDepartment]?.[0] ?? '',
			ubicacion: null,
		});
	};

	return (
		<Grid container spacing={2.5}>
			<Grid size={{ xs: 12 }}>
				<TextField
					fullWidth
					required
					label="¿Cómo se llama tu proyecto o actividad cultural?"
					placeholder="Ej. Compañía Circo Fuego"
					helperText="Puede ser tu nombre artístico o el de tu colectivo, espacio o institución."
					value={value.nombre}
					onChange={(event) => onChange({ nombre: event.target.value })}
				/>
			</Grid>

			<Grid size={{ xs: 12 }}>
				<Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
					¿Cómo desarrollás esta actividad?
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
					<InputLabel>Sector cultural principal</InputLabel>
					<Select
						label="Sector cultural principal"
						value={category}
						onChange={(event) => onCategoryChange(event.target.value)}
					>
						<MenuItem value="Música">Música</MenuItem>
						<MenuItem value="Artes escénicas">Artes escénicas</MenuItem>
						<MenuItem value="Artes visuales">Artes visuales</MenuItem>
						<MenuItem value="Artesanías">Artesanías</MenuItem>
						<MenuItem value="Gestión cultural">Gestión cultural</MenuItem>
					</Select>
					<FormHelperText>Elegí la opción que mejor represente tu actividad.</FormHelperText>
				</FormControl>
			</Grid>

			<Grid size={{ xs: 12, md: 6 }}>
				{availableSubcategories.length > 0 ? (
					<FormControl fullWidth required>
						<InputLabel>Área específica</InputLabel>
						<Select
							label="Área específica"
							value={subcategory}
							onChange={(event) => onSubcategoryChange(event.target.value)}
						>
							{availableSubcategories.map((option) => (
								<MenuItem key={option} value={option}>
									{option}
								</MenuItem>
							))}
							<MenuItem value="No encuentro mi área">No encuentro mi área</MenuItem>
						</Select>
						<FormHelperText>Las opciones dependen del sector cultural elegido.</FormHelperText>
					</FormControl>
				) : (
					<Alert severity="info" variant="outlined">
						Este sector no requiere seleccionar un área específica.
					</Alert>
				)}
			</Grid>

			<Grid size={{ xs: 12 }}>
				<TextField
					fullWidth
					multiline
					minRows={4}
					label="Contanos brevemente sobre tu actividad cultural"
					placeholder="Qué hacés, a quién está dirigida tu propuesta y qué la distingue."
					helperText="Esta descripción se mostrará en listados, mapas y tarjetas."
					required
					value={value.descripcion}
					onChange={(event) => onChange({ descripcion: event.target.value })}
				/>
			</Grid>

			<Grid size={{ xs: 12, md: value.tieneCuit ? 6 : 12 }}>
				<Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
					¿Tu actividad está asociada a un CUIT?
				</Typography>
				<RadioGroup
					row
					value={value.tieneCuit ? 'si' : 'no'}
					onChange={(event) => onChange({ tieneCuit: event.target.value === 'si', cuit: '' })}
				>
					<FormControlLabel value="si" control={<Radio size="small" />} label="Sí" />
					<FormControlLabel value="no" control={<Radio size="small" />} label="No" />
				</RadioGroup>
			</Grid>

			{value.tieneCuit && (
				<Grid size={{ xs: 12, md: 6 }}>
					<TextField
						fullWidth
						required
						label="CUIT asociado"
						placeholder="Ej. 20123456789"
						helperText="Ingresá los 11 números, sin guiones."
						inputProps={{ inputMode: 'numeric', maxLength: 11 }}
						value={value.cuit}
						onChange={(event) => onChange({ cuit: event.target.value.replace(/\D/g, '') })}
					/>
				</Grid>
			)}

			<Grid size={{ xs: 12 }}>
				<UploadBox
					icon={<AddPhotoAlternateIcon color="primary" />}
					title="Agregá una imagen de tu actividad cultural"
					detail="Puede ser una foto tuya, de tu grupo, espacio, trabajo o logotipo."
					fileName={value.fotoNombre}
					previewUrl={value.fotoPreview}
					onFileSelect={(file) => {
						if (!file) {
							onChange({ fotoNombre: '', fotoPreview: '' });
							return;
						}

						const reader = new FileReader();
						reader.addEventListener('load', () => {
							onChange({ fotoNombre: file.name, fotoPreview: String(reader.result ?? '') });
						});
						reader.readAsDataURL(file);
					}}
				/>
			</Grid>

			<Grid size={{ xs: 12 }}>
				<Divider sx={{ my: 0.5 }} />
				<Stack spacing={0.5}>
					<Typography variant="h6" fontWeight={700}>
						¿En qué parte de la provincia desarrollas tu actividad?
					</Typography>
				</Stack>
			</Grid>

			<Grid size={{ xs: 12, md: 6 }}>
				<FormControl fullWidth required>
					<InputLabel>Departamento</InputLabel>
					<Select
						label="Departamento"
						value={value.departamento}
						onChange={(event) => handleDepartmentChange(event.target.value)}
					>
						<MenuItem value="Burruyacú">Burruyacú</MenuItem>
						<MenuItem value="Capital">Capital</MenuItem>
						<MenuItem value="Chicligasta">Chicligasta</MenuItem>
						<MenuItem value="Cruz Alta">Cruz Alta</MenuItem>
						<MenuItem value="Famaillá">Famaillá</MenuItem>
						<MenuItem value="Graneros">Graneros</MenuItem>
						<MenuItem value="Juan Bautista Alberdi">Juan Bautista Alberdi</MenuItem>
						<MenuItem value="La Cocha">La Cocha</MenuItem>
						<MenuItem value="Leales">Leales</MenuItem>
						<MenuItem value="Lules">Lules</MenuItem>
						<MenuItem value="Monteros">Monteros</MenuItem>
						<MenuItem value="Río Chico">Río Chico</MenuItem>
						<MenuItem value="Simoca">Simoca</MenuItem>
						<MenuItem value="Tafí del Valle">Tafí del Valle</MenuItem>
						<MenuItem value="Tafí Viejo">Tafí Viejo</MenuItem>
						<MenuItem value="Trancas">Trancas</MenuItem>
						<MenuItem value="Yerba Buena">Yerba Buena</MenuItem>
					</Select>
				</FormControl>
			</Grid>
			<Grid size={{ xs: 12, md: 6 }}>
				<Autocomplete
					freeSolo
					options={availableLocalities}
					value={value.localidad}
					onInputChange={(_, newValue) => onChange({ localidad: newValue, ubicacion: null })}
					renderInput={(params) => <TextField {...params} required label="Localidad" />}
				/>
			</Grid>

			<Grid size={{ xs: 12 }}>
				<LocationPicker
					key={`${value.departamento}-${value.localidad}`}
					department={value.departamento}
					locality={value.localidad}
					address={value.direccion}
					point={value.ubicacion}
					onAddressChange={(direccion) => onChange({ direccion })}
					onPointChange={(ubicacion) => onChange({ ubicacion })}
				/>
			</Grid>

			<Grid size={{ xs: 12 }}>
				<Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
					¿Querés que esta ubicación aparezca en el mapa público?
				</Typography>
				<RadioGroup
					value={value.ubicacionPublica ? 'si' : 'no'}
					onChange={(event) => onChange({ ubicacionPublica: event.target.value === 'si' })}
				>
					<FormControlLabel value="si" control={<Radio size="small" />} label="Sí, mostrarla públicamente" />
					<FormControlLabel value="no" control={<Radio size="small" />} label="No, mantenerla privada" />
				</RadioGroup>
				<Typography variant="caption" color="text.secondary">
					La administración podrá consultar la ubicación para validar el registro, aunque decidas no
					publicarla.
				</Typography>
			</Grid>
		</Grid>
	);
}

function MapClickHandler({ onPointChange }: { onPointChange: (point: MapPoint) => void }) {
	useMapEvents({
		click: (event: LeafletMouseEvent) => {
			onPointChange({ lat: event.latlng.lat, lng: event.latlng.lng });
		},
	});

	return null;
}

function MapPointFocuser({ point }: { point: MapPoint | null }) {
	const map = useMap();

	useEffect(() => {
		if (point) {
			map.flyTo([point.lat, point.lng], 16, { duration: 0.8 });
		}
	}, [map, point]);

	return null;
}

function LocationPicker({
	department,
	locality,
	address,
	point,
	onAddressChange,
	onPointChange,
}: {
	department: string;
	locality: string;
	address: string;
	point: MapPoint | null;
	onAddressChange: (address: string) => void;
	onPointChange: (point: MapPoint | null) => void;
}) {
	const [resolvedAddress, setResolvedAddress] = useState('');
	const [isSearching, setIsSearching] = useState(false);
	const [isLocating, setIsLocating] = useState(false);
	const [searchError, setSearchError] = useState('');
	const [locationError, setLocationError] = useState('');

	const searchAddress = async () => {
		const trimmedAddress = address.trim();
		if (!trimmedAddress || isSearching) return;

		setIsSearching(true);
		setSearchError('');
		setLocationError('');

		try {
			const query = `${trimmedAddress}, ${locality}, ${department}, Tucumán, Argentina`;
			const params = new URLSearchParams({
				q: query,
				format: 'jsonv2',
				limit: '1',
				countrycodes: 'ar',
				'accept-language': 'es',
				viewbox: '-66.35,-25.75,-64.45,-27.95',
				bounded: '1',
			});
			const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`);
			if (!response.ok) throw new Error('No se pudo consultar el servicio de direcciones.');

			const results = (await response.json()) as Array<{ lat: string; lon: string; display_name: string }>;
			const result = results[0];
			if (!result) {
				setSearchError(
					'No encontramos esa dirección o referencia. Podés conservar el texto y señalar el punto en el mapa.',
				);
				return;
			}

			const nextPoint = { lat: Number(result.lat), lng: Number(result.lon) };
			onPointChange(nextPoint);
			setResolvedAddress(result.display_name);
		} catch {
			setSearchError('No pudimos buscar la dirección en este momento. Intentá nuevamente.');
		} finally {
			setIsSearching(false);
		}
	};

	const useCurrentLocation = () => {
		setLocationError('');
		setSearchError('');
		setResolvedAddress('');

		if (!navigator.geolocation) {
			setLocationError('Tu navegador no permite obtener la ubicación actual. Podés marcarla en el mapa.');
			return;
		}

		setIsLocating(true);
		navigator.geolocation.getCurrentPosition(
			(position) => {
				const nextPoint = { lat: position.coords.latitude, lng: position.coords.longitude };
				const isInsideTucuman =
					nextPoint.lat >= -27.95 &&
					nextPoint.lat <= -25.75 &&
					nextPoint.lng >= -66.35 &&
					nextPoint.lng <= -64.45;

				if (!isInsideTucuman) {
					setLocationError(
						'La ubicación obtenida está fuera de Tucumán. Buscá una referencia o marcá el punto.',
					);
					setIsLocating(false);
					return;
				}

				onPointChange(nextPoint);
				setIsLocating(false);
			},
			(error) => {
				setLocationError(
					error.code === error.PERMISSION_DENIED
						? 'No diste permiso para usar tu ubicación. Podés buscar una referencia o marcarla en el mapa.'
						: 'No pudimos obtener tu ubicación actual. Podés buscar una referencia o marcarla en el mapa.',
				);
				setIsLocating(false);
			},
			{ enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
		);
	};

	const handleManualPointChange = (nextPoint: MapPoint) => {
		onPointChange(nextPoint);
		setResolvedAddress('');
		setSearchError('');
		setLocationError('');
	};

	return (
		<Stack spacing={1}>
			<Box>
				<Typography variant="subtitle2" fontWeight={700}>
					Indicá la dirección o referencia{' '}
					<Typography component="span" color="error">
						*
					</Typography>
				</Typography>
				<Typography variant="body2" color="text.secondary">
					Podés buscarla, usar tu ubicación actual o marcar directamente el punto en el mapa.
				</Typography>
			</Box>

			<TextField
				fullWidth
				required
				label="Dirección o referencia"
				placeholder="Ej. San Martín 450, plaza principal o paraje El Cadillal"
				value={address}
				onChange={(event) => {
					onAddressChange(event.target.value);
					setResolvedAddress('');
					setSearchError('');
				}}
				onKeyDown={(event) => {
					if (event.key === 'Enter') {
						event.preventDefault();
						void searchAddress();
					}
				}}
				error={Boolean(searchError)}
				helperText={
					searchError || 'Este texto se guardará como dirección, aunque sea una referencia aproximada.'
				}
			/>

			<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
				<Button
					variant="contained"
					startIcon={<SearchIcon />}
					disabled={!address.trim() || isSearching}
					onClick={() => void searchAddress()}
					sx={{ minWidth: 190 }}
				>
					{isSearching ? 'Buscando…' : 'Buscar en el mapa'}
				</Button>
				<Button
					variant="outlined"
					startIcon={<MyLocationIcon />}
					disabled={isLocating}
					onClick={useCurrentLocation}
				>
					{isLocating ? 'Obteniendo ubicación…' : 'Usar mi ubicación actual'}
				</Button>
			</Stack>

			{locationError && (
				<Alert severity="info" variant="outlined">
					{locationError}
				</Alert>
			)}

			<Box
				sx={{
					height: { xs: 300, md: 380 },
					border: '1px solid',
					borderColor: point ? 'success.main' : 'divider',
					borderRadius: 1,
					overflow: 'hidden',
					'& .leaflet-container': { cursor: 'crosshair' },
				}}
			>
				<MapContainer
					center={[-26.8241, -65.2226]}
					zoom={8}
					minZoom={7}
					maxBounds={[
						[-27.95, -66.35],
						[-25.75, -64.45],
					]}
					maxBoundsViscosity={0.8}
					style={{ height: '100%', width: '100%' }}
				>
					<TileLayer
						attribution='<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					/>
					<MapClickHandler onPointChange={handleManualPointChange} />
					<MapPointFocuser point={point} />
					{point && (
						<CircleMarker
							center={[point.lat, point.lng]}
							radius={10}
							pathOptions={{ color: '#ffffff', fillColor: '#1976d2', fillOpacity: 1, weight: 3 }}
						/>
					)}
				</MapContainer>
			</Box>

			<Alert severity={point ? 'success' : 'warning'} variant="outlined" icon={<LocationOnIcon />}>
				{point
					? `${address.trim() ? 'Ubicación lista. Se guardarán la dirección o referencia, la latitud y la longitud.' : 'El punto está seleccionado. Completá una dirección o referencia para poder guardar.'}${resolvedAddress ? ` Resultado encontrado: ${resolvedAddress}` : ''}`
					: 'Buscá una dirección o referencia, usá tu ubicación actual o señalá el punto en el mapa.'}
			</Alert>
		</Stack>
	);
}

function UploadBox({
	icon,
	title,
	detail,
	fileName,
	previewUrl,
	onFileSelect,
}: {
	icon: ReactNode;
	title: string;
	detail: string;
	fileName?: string;
	previewUrl?: string;
	onFileSelect?: (file: File | null) => void;
}) {
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
			{previewUrl ? (
				<Box
					component="img"
					src={previewUrl}
					alt="Vista previa de la imagen seleccionada"
					sx={{ width: 88, height: 88, objectFit: 'cover', borderRadius: 1 }}
				/>
			) : (
				icon
			)}
			<Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1 }}>
				{title}
			</Typography>
			<Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
				{fileName || detail}
			</Typography>
			<Button component="label" size="small" variant="outlined" startIcon={<CloudUploadIcon />}>
				{fileName ? 'Cambiar imagen' : 'Adjuntar'}
				<input
					hidden
					type="file"
					accept="image/png,image/jpeg,image/webp"
					onChange={(event) => onFileSelect?.(event.target.files?.[0] ?? null)}
				/>
			</Button>
		</Box>
	);
}
