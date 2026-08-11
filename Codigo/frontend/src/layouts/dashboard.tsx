import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useColorScheme } from '@mui/material/styles';
import { Account } from '@toolpad/core/Account';
import { Outlet } from 'react-router';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';

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

	if (mini) return null;

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
		</Box>
	);
}

export default function Layout() {
	return (
		<DashboardLayout
			defaultSidebarCollapsed
			sidebarExpandedWidth={264}
			sx={{
				'& .MuiDrawer-docked:has(.MuiTypography-caption)': {
					width: 0,
				},
				'& .MuiDrawer-docked:has(.MuiTypography-caption) .MuiDrawer-paper': {
					width: 0,
					borderRight: 0,
				},
			}}
			slots={{
				toolbarActions: AppToolbarActions,
				sidebarFooter: AppSidebarFooter,
			}}
		>
			<Outlet />
		</DashboardLayout>
	);
}
