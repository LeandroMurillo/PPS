import CategoryIconMui from '@mui/icons-material/Category';
import HandymanIcon from '@mui/icons-material/Handyman';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MovieIcon from '@mui/icons-material/Movie';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PaletteIcon from '@mui/icons-material/Palette';
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';
import { Box, type SvgIconProps } from '@mui/material';
import type { ComponentType } from 'react';

export const CATEGORY_ICON_OPTIONS = [
	{ value: 'Category', label: 'General' },
	{ value: 'MusicNote', label: 'Música' },
	{ value: 'Handyman', label: 'Artesanía' },
	{ value: 'TheaterComedy', label: 'Artes Escénicas' },
	{ value: 'Movie', label: 'Audiovisual' },
	{ value: 'MenuBook', label: 'Literatura' },
	{ value: 'Palette', label: 'Artes Visuales' },
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
