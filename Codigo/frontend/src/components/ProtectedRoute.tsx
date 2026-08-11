import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert, Box, Button, Typography } from '@mui/material';

interface ProtectedRouteProps {
	children: React.ReactNode;
	allowedRoles?: ('USUARIO' | 'MODERADOR' | 'ADMIN')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
	const { user, token } = useAuth();
	const location = useLocation();

	if (!user || !token) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.rol)) {
		return (
			<Box
				sx={{
					p: 4,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: 2,
					textAlign: 'center',
				}}
			>
				<Typography variant="h5" color="error" fontWeight="bold">
					Acceso restringido
				</Typography>
				<Alert severity="warning" sx={{ maxWidth: 600 }}>
					No tenés los permisos requeridos para acceder a esta sección.
				</Alert>
				<Button variant="contained" onClick={() => (window.location.href = '/')}>
					Volver al inicio
				</Button>
			</Box>
		);
	}

	return <>{children}</>;
};
