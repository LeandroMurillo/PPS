import * as React from 'react';

import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

type AdminFiltersProps = {
	search: string;
	searchPlaceholder?: string;
	collapsible?: boolean;
	activeFilterCount?: number;
	showClear?: boolean;
	children: React.ReactNode;
	onSearchChange: (value: string) => void;
	onClear: () => void;
};

export default function AdminFilters({
	search,
	searchPlaceholder = 'Nombre, email, ubicación…',
	collapsible = false,
	activeFilterCount = 0,
	showClear = true,
	children,
	onSearchChange,
	onClear,
}: AdminFiltersProps) {
	const [filtersOpen, setFiltersOpen] = React.useState(!collapsible);
	const filterButtonLabel = activeFilterCount > 0 ? `Filtrar (${activeFilterCount})` : 'Filtrar';

	const searchRow = (
		<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
			<TextField
				value={search}
				onChange={(event) => onSearchChange(event.target.value)}
				label="Buscar"
				placeholder={searchPlaceholder}
				size="small"
				fullWidth
				slotProps={{
					input: {
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon fontSize="small" />
							</InputAdornment>
						),
					},
				}}
			/>
			{collapsible && (
				<Button
					variant={filtersOpen || activeFilterCount > 0 ? 'contained' : 'outlined'}
					startIcon={<FilterListIcon />}
					onClick={() => setFiltersOpen((open) => !open)}
					aria-expanded={filtersOpen}
					sx={{
						minWidth: 150,
						whiteSpace: 'nowrap',
						alignSelf: { xs: 'flex-start', sm: 'center' },
					}}
				>
					{filterButtonLabel}
				</Button>
			)}
		</Stack>
	);

	const filterControls = (
		<Stack
			direction={{ xs: 'column', sm: 'row' }}
			spacing={2}
			alignItems={{ sm: 'center' }}
			useFlexGap
			sx={{
				flexWrap: 'wrap',
				'& .MuiFormControl-root, & .MuiTextField-root': {
					width: { xs: '100%', sm: 'auto' },
				},
			}}
		>
			{children}
			{showClear && (
				<Button onClick={onClear} sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}>
					Limpiar filtros
				</Button>
			)}
		</Stack>
	);

	if (collapsible) {
		return (
			<Stack spacing={2}>
				{searchRow}
				<Collapse in={filtersOpen} unmountOnExit>
					<Paper variant="outlined" sx={{ p: 2 }}>
						{filterControls}
					</Paper>
				</Collapse>
			</Stack>
		);
	}

	return (
		<Paper variant="outlined" sx={{ p: 2 }}>
			<Stack spacing={2}>
				{searchRow}
				{filterControls}
			</Stack>
		</Paper>
	);
}
