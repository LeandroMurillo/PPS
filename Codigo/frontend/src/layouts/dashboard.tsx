import * as React from 'react';
import { Link, Outlet } from 'react-router';

import DarkModeIcon from '@mui/icons-material/DarkMode';
import InfoIcon from '@mui/icons-material/Info';
import LightModeIcon from '@mui/icons-material/LightMode';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { useColorScheme } from '@mui/material/styles';
import { Account } from '@toolpad/core/Account';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';

import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

function AppToolbarActions() {
	return (
		<Stack direction="row" alignItems="center">
			<Account
				slotProps={{
					signInButton: {
						sx: {
							textTransform: 'none',
							filter: 'opacity(0.9)',
							width: 'auto',
							minWidth: 124,
							whiteSpace: 'nowrap',
							margin: (theme) => `${theme.spacing(1)} auto`,
							transition: 'filter 0.2s ease-in',
							'&:hover': {
								filter: 'opacity(1)',
							},
						},
					},
				}}
			/>
		</Stack>
	);
}

function AppSidebarFooter({ mini }: { mini: boolean }) {
	const { mode, systemMode, setMode } = useColorScheme();
	const effectiveMode = (mode === 'system' ? systemMode : mode) ?? 'light';
	const isDarkMode = effectiveMode === 'dark';

	if (mini) {
		return (
			<Stack spacing={1} alignItems="center" sx={{ pb: 1, width: '100%' }}>
				<Tooltip title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'} placement="right" arrow>
					<IconButton
						onClick={() => setMode(isDarkMode ? 'light' : 'dark')}
						aria-label={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
					>
						{isDarkMode ? (
							<DarkModeIcon color="primary" fontSize="small" />
						) : (
							<LightModeIcon color="primary" fontSize="small" />
						)}
					</IconButton>
				</Tooltip>

				<Tooltip title="Licencia" placement="right" arrow>
					<IconButton component={Link} to="/licencia" aria-label="Licencia">
						<InfoIcon color="primary" fontSize="small" />
					</IconButton>
				</Tooltip>
			</Stack>
		);
	}

	return (
		<Box sx={{ px: 1, pb: 1, width: '100%', boxSizing: 'border-box' }}>
			<Box
				component="label"
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					py: 0,
					cursor: 'pointer',
					width: '100%',
					boxSizing: 'border-box',
				}}
			>
				<Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0, height: 48, px: 1.4 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 34 }}>
						{isDarkMode ? (
							<DarkModeIcon color="primary" fontSize="small" />
						) : (
							<LightModeIcon color="primary" fontSize="small" />
						)}
					</Box>
					<Typography variant="body1" sx={{ ml: 1.2, whiteSpace: 'nowrap' }}>
						{isDarkMode ? 'Modo oscuro' : 'Modo claro'}
					</Typography>
				</Box>

				<Switch
					checked={isDarkMode}
					onChange={(event) => setMode(event.target.checked ? 'dark' : 'light')}
					inputProps={{ 'aria-label': isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro' }}
				/>
			</Box>

			<Box
				component={Link}
				to="/licencia"
				sx={{
					display: 'flex',
					alignItems: 'center',
					py: 0,
					px: 1.4,
					height: 48,
					width: '100%',
					boxSizing: 'border-box',
					color: 'inherit',
					textDecoration: 'none',
					borderRadius: 1,
					transition: 'background-color 0.2s ease',
					'&:hover': {
						backgroundColor: 'action.hover',
					},
				}}
			>
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 34 }}>
					<InfoIcon color="primary" fontSize="small" />
				</Box>
				<Typography variant="body1" sx={{ ml: 1.2, whiteSpace: 'nowrap' }}>
					Licencia
				</Typography>
			</Box>
		</Box>
	);
}

export default function Layout() {
	return (
		<DashboardLayout
			sidebarExpandedWidth={264}
			slots={{
				toolbarActions: AppToolbarActions,
				sidebarFooter: AppSidebarFooter,
			}}
		>
			<Outlet />
		</DashboardLayout>
	);
}
