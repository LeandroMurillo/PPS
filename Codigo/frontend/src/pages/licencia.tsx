import { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';

const EMOJIS = ['🦦', '🚁', '🦝'];

export default function Licencia() {
	const { mode, systemMode } = useColorScheme();
	const isDarkMode = mode === 'system' ? systemMode === 'dark' : mode === 'dark';

	// Estado para guardar el emoji seleccionado, iniciamos con uno por defecto
	const [emoji, setEmoji] = useState(EMOJIS[0]);

	// Elegimos un emoji al azar cuando el componente se monta
	useEffect(() => {
		const randomIndex = Math.floor(Math.random() * EMOJIS.length);
		setEmoji(EMOJIS[randomIndex]);
	}, []);

	return (
		<Box
			sx={{
				minHeight: 'calc(100vh - 64px)',
				display: 'flex',
				justifyContent: 'center',
				flex: '1 0 auto',
				width: '100%',
				py: { xs: 2, sm: 8 },
				px: 2,
				boxSizing: 'border-box',
				backgroundColor: isDarkMode ? '#0b0b0b' : '#f4f6f8',
			}}
		>
			<Container maxWidth={false} disableGutters sx={{ width: '100%', maxWidth: 560 }}>
				<Paper
					elevation={0}
					sx={{
						p: 4,
						border: '1px solid',
						borderColor: isDarkMode ? '#333333' : '#eaeaea',
						borderRadius: 2,
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
					Detrás de cada rincón de nuestro territorio, hay una historia que contar y un talento por descubrir.
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
			</Container>
		</Box>
	);
}
