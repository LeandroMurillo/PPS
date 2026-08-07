import * as React from 'react';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';

type AdminFiltersProps = {
	search: string;
	searchPlaceholder?: string;
	children: React.ReactNode;
	onSearchChange: (value: string) => void;
	onClear: () => void;
};

export default function AdminFilters({
	search,
	searchPlaceholder = 'Nombre, email, ubicación…',
	children,
	onSearchChange,
	onClear,
}: AdminFiltersProps) {
	return (
		<Paper variant="outlined" sx={{ p: 2 }}>
			<Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
				<TextField
					value={search}
					onChange={(event) => onSearchChange(event.target.value)}
					label="Buscar"
					placeholder={searchPlaceholder}
					size="small"
					sx={{ flex: 1, minWidth: 240 }}
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
				{children}
				<Button onClick={onClear}>Limpiar</Button>
			</Stack>
		</Paper>
	);
}
