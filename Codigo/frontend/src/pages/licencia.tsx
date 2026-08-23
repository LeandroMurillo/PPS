import { useEffect, useState } from 'react';

import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import GroupsIcon from '@mui/icons-material/Groups';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import { Box, Card, CardContent, Container, Grid, Paper, Skeleton, Typography } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';

import { obtenerEstadisticasPublicas, type EstadisticasPublicasResponse } from '../api/actores';

const EMOJIS = ['🦦', '🚁', '🦝'];

export default function Licencia() {
	const { mode, systemMode } = useColorScheme();
	const isDarkMode = mode === 'system' ? systemMode === 'dark' : mode === 'dark';

	const [emoji, setEmoji] = useState(EMOJIS[0]);
	const [estadisticas, setEstadisticas] = useState<EstadisticasPublicasResponse | null>(null);
	const [cargandoStats, setCargandoStats] = useState(true);

	useEffect(() => {
		const randomIndex = Math.floor(Math.random() * EMOJIS.length);
		setEmoji(EMOJIS[randomIndex]);

		const controller = new AbortController();

		async function loadStats() {
			try {
				const stats = await obtenerEstadisticasPublicas(controller.signal);
				setEstadisticas(stats);
			} catch {
				// Ignorar errores silenciosos en la pantalla de licencia
			} finally {
				setCargandoStats(false);
			}
		}

		loadStats();
		return () => controller.abort();
	}, []);

	return (
		<Box
			sx={{
				minHeight: { xs: 'calc(100dvh - 56px)', sm: 'calc(100dvh - 64px)' },
				display: 'flex',
				justifyContent: 'center',
				flex: '1 0 auto',
				width: '100%',
				pt: { xs: 2, sm: 6 },
				pb: { xs: 'calc(32px + env(safe-area-inset-bottom, 16px))', sm: 6 },
				px: 2,
				boxSizing: 'border-box',
				backgroundColor: isDarkMode ? '#0b0b0b' : '#f4f6f8',
			}}
		>
			<Container maxWidth={false} disableGutters sx={{ width: '100%', maxWidth: 760 }}>
				{/* Panel de Licencia */}
				<Paper
					elevation={0}
					sx={{
						p: 4,
						border: '1px solid',
						borderColor: isDarkMode ? '#333333' : '#eaeaea',
						borderRadius: 2.5,
						backgroundColor: isDarkMode ? '#121212' : '#fdfdfc',
					}}
				>
					<Box sx={{ textAlign: 'center', mb: 3 }}>
						<Typography variant="h2" component="div" sx={{ mb: 2 }}>
							{emoji}
						</Typography>
						<Typography
							variant="h5"
							component="h1"
							gutterBottom
							fontWeight="600"
							color={isDarkMode ? '#ffffff' : '#111111'}
						>
							Mosaico Cultural
						</Typography>
					</Box>

					<Typography variant="body2" color="text.secondary" paragraph>
						Detrás de cada rincón de nuestro territorio, hay una historia que contar y un talento por
						descubrir.
					</Typography>

					<Typography variant="body2" color="text.secondary" paragraph>
						<strong>Copyright &copy; 2026 Leandro Murillo y César Ezequiel Herrera</strong>
					</Typography>

					<Typography variant="body2" color="text.secondary" paragraph>
						Este producto incluye software desarrollado por
					</Typography>
					<Typography variant="body2" color="text.secondary" paragraph>
						Leandro Murillo y César Ezequiel Herrera.
					</Typography>

					<Box
						sx={{
							backgroundColor: isDarkMode ? '#1e1e1e' : '#f9f9f9',
							p: 2,
							borderRadius: 1,
							overflowX: 'auto',
							fontFamily: 'monospace',
							fontSize: '0.8rem',
							color: isDarkMode ? '#cccccc' : '#444444',
						}}
					>
						<Typography variant="body2" component="pre" sx={{ margin: 0, whiteSpace: 'pre-wrap' }}>
							{`Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

		http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.`}
						</Typography>
					</Box>
				</Paper>

				{/* Métricas de Impacto Cultural */}
				<Box sx={{ mt: 3, justifyContent: 'center'  }}>
					<Typography
						variant="subtitle2"
						color="text.secondary"
						sx={{ mb: 1.5, textAlign: 'center', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}
					>
						Impacto Territorial de la Plataforma
					</Typography>
					<Grid container spacing={2}>
						<Grid size={{ xs: 12, sm: 4 }}>
							<Card
								elevation={0}
								sx={{
									p: 1.5,
									textAlign: 'center',
									borderRadius: 2,
									border: '1px solid',
									borderColor: isDarkMode ? '#282828' : '#e2e8f0',
									backgroundColor: isDarkMode ? '#141414' : '#ffffff',
								}}
							>
								<CardContent sx={{ p: '8px !important' }}>
									<GroupsIcon color="primary" sx={{ fontSize: 28, mb: 0.5 }} />
									<Typography variant="h5" fontWeight="800">
										{cargandoStats ? (
											<Skeleton width={40} sx={{ mx: 'auto' }} />
										) : (
											(estadisticas?.totalActores ?? 0)
										)}
									</Typography>
									<Typography variant="caption" color="text.secondary" fontWeight="500">
										Hacedores de cultura
									</Typography>
								</CardContent>
							</Card>
						</Grid>

						<Grid size={{ xs: 12, sm: 4 }}>
							<Card
								elevation={0}
								sx={{
									p: 1.5,
									textAlign: 'center',
									borderRadius: 2,
									border: '1px solid',
									borderColor: isDarkMode ? '#282828' : '#e2e8f0',
									backgroundColor: isDarkMode ? '#141414' : '#ffffff',
								}}
							>
								<CardContent sx={{ p: '8px !important' }}>
									<AccountBalanceIcon color="primary" sx={{ fontSize: 28, mb: 0.5 }} />
									<Typography variant="h5" fontWeight="800">
										{cargandoStats ? (
											<Skeleton width={40} sx={{ mx: 'auto' }} />
										) : (
											(estadisticas?.totalEspacios ?? 0)
										)}
									</Typography>
									<Typography variant="caption" color="text.secondary" fontWeight="500">
										Espacios
									</Typography>
								</CardContent>
							</Card>
						</Grid>

						<Grid size={{ xs: 12, sm: 4 }}>
							<Card
								elevation={0}
								sx={{
									p: 1.5,
									textAlign: 'center',
									borderRadius: 2,
									border: '1px solid',
									borderColor: isDarkMode ? '#282828' : '#e2e8f0',
									backgroundColor: isDarkMode ? '#141414' : '#ffffff',
								}}
							>
								<CardContent sx={{ p: '8px !important' }}>
									<LocationCityIcon color="primary" sx={{ fontSize: 28, mb: 0.5 }} />
									<Typography variant="h5" fontWeight="800">
										{cargandoStats ? (
											<Skeleton width={40} sx={{ mx: 'auto' }} />
										) : (
											(estadisticas?.totalDepartamentos ?? 0)
										)}
									</Typography>
									<Typography variant="caption" color="text.secondary" fontWeight="500">
										Departamentos
									</Typography>
								</CardContent>
							</Card>
						</Grid>
					</Grid>
				</Box>
			</Container>
		</Box>
	);
}
