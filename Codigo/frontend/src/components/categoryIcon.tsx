import type { ComponentType } from 'react';

import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CategoryIconMui from '@mui/icons-material/Category';
import CelebrationIcon from '@mui/icons-material/Celebration';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import HandymanIcon from '@mui/icons-material/Handyman';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MovieIcon from '@mui/icons-material/Movie';
import MuseumIcon from '@mui/icons-material/Museum';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PaletteIcon from '@mui/icons-material/Palette';
import ParkIcon from '@mui/icons-material/Park';
import RadioIcon from '@mui/icons-material/Radio';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SchoolIcon from '@mui/icons-material/School';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import StorefrontIcon from '@mui/icons-material/Storefront';
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';
import { Box, type SvgIconProps } from '@mui/material';

export const CATEGORY_ICON_OPTIONS = [
	{ value: 'Category', label: 'General' },
	{ value: 'MusicNote', label: 'Música' },
	{ value: 'Handyman', label: 'Artesanía' },
	{ value: 'TheaterComedy', label: 'Artes Escénicas' },
	{ value: 'Movie', label: 'Audiovisual' },
	{ value: 'MenuBook', label: 'Literatura' },
	{ value: 'Palette', label: 'Artes Visuales' },
	{ value: 'AccountBalance', label: 'Patrimonio' },
	{ value: 'Museum', label: 'Museos' },
	{ value: 'DirectionsRun', label: 'Deporte' },
	{ value: 'CameraAlt', label: 'Fotografía' },
	{ value: 'DesignServices', label: 'Diseño' },
	{ value: 'Restaurant', label: 'Gastronomía' },
	{ value: 'Architecture', label: 'Arquitectura' },
	{ value: 'School', label: 'Educación' },
	{ value: 'Celebration', label: 'Festivales' },
	{ value: 'Storefront', label: 'Ferias y Mercados' },
	{ value: 'SportsEsports', label: 'Videojuegos' },
	{ value: 'Radio', label: 'Radio y Medios' },
	{ value: 'Checkroom', label: 'Moda' },
	{ value: 'Park', label: 'Naturaleza y Turismo' },
	{ value: 'LocalLibrary', label: 'Bibliotecas' },
] as const;

export type CategoriaIcono = (typeof CATEGORY_ICON_OPTIONS)[number]['value'];

export const categoryIcons: Record<CategoriaIcono, ComponentType<SvgIconProps>> = {
	Category: CategoryIconMui,
	MusicNote: MusicNoteIcon,
	Handyman: HandymanIcon,
	TheaterComedy: TheaterComedyIcon,
	Movie: MovieIcon,
	MenuBook: MenuBookIcon,
	Palette: PaletteIcon,
	AccountBalance: AccountBalanceIcon,
	Museum: MuseumIcon,
	DirectionsRun: DirectionsRunIcon,
	CameraAlt: CameraAltIcon,
	DesignServices: DesignServicesIcon,
	Restaurant: RestaurantIcon,
	Architecture: ArchitectureIcon,
	School: SchoolIcon,
	Celebration: CelebrationIcon,
	Storefront: StorefrontIcon,
	SportsEsports: SportsEsportsIcon,
	Radio: RadioIcon,
	Checkroom: CheckroomIcon,
	Park: ParkIcon,
	LocalLibrary: LocalLibraryIcon,
};

export function isCategoriaIcono(value: unknown): value is CategoriaIcono {
	return CATEGORY_ICON_OPTIONS.some((option) => option.value === value);
}

export function getCategoriaIconLabel(icono: CategoriaIcono): string {
	return CATEGORY_ICON_OPTIONS.find((option) => option.value === icono)?.label ?? 'General';
}

type CategoryIconProps = SvgIconProps & {
	icono: CategoriaIcono | string;
	label?: string;
	withLabel?: boolean;
};

export default function CategoryIcon({ icono, label, withLabel = false, ...props }: CategoryIconProps) {
	const normalizedIcon = isCategoriaIcono(icono) ? icono : 'Category';
	const Icon = categoryIcons[normalizedIcon];

	if (!withLabel) {
		return <Icon {...props} />;
	}

	return (
		<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
			<Icon fontSize="small" {...props} />
			<Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
				{label ?? getCategoriaIconLabel(normalizedIcon)}
			</Box>
		</Box>
	);
}
