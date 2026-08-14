import * as React from 'react';

import AddCommentIcon from '@mui/icons-material/AddComment';
import ConstructionIcon from '@mui/icons-material/Construction';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { PageContainer } from '@toolpad/core/PageContainer';

export default function ConvocatoriasAdminPage() {
	return (
		<PageContainer maxWidth={false}>
			<Stack spacing={3}>
				<Paper
					variant="outlined"
					sx={{
						p: 4,
						textAlign: 'center',
						borderRadius: 2,
						bgcolor: 'background.paper',
					}}
				>
					<Box sx={{ maxWidth: 500, mx: 'auto', py: 4 }}>
						<AddCommentIcon color="primary" sx={{ fontSize: 56, mb: 2 }} />
						<Typography variant="h5" fontWeight={700} gutterBottom>
							Gestión de Convocatorias
						</Typography>
						<Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
							Este módulo permitirá a los administradores crear, publicar y administrar convocatorias
							culturales abiertas, así como evaluar las postulaciones de actores culturales.
						</Typography>
						<Stack direction="row" spacing={1.5} justifyContent="center" alignItems="center">
							<ConstructionIcon color="action" fontSize="small" />
							<Typography variant="caption" color="text.secondary">
								Módulo en desarrollo para la próxima versión
							</Typography>
						</Stack>
					</Box>
				</Paper>
			</Stack>
		</PageContainer>
	);
}
