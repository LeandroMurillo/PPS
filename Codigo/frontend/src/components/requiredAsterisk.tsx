import { Tooltip, Typography, type TypographyProps } from '@mui/material';

interface RequiredAsteriskProps {
	/** Texto que se muestra al pasar el cursor sobre el asterisco */
	tooltipTitle?: string;
	/** Color del asterisco (por defecto error.main / rojo) */
	color?: string;
	/** Estilos adicionales de MUI Typography */
	sx?: TypographyProps['sx'];
}

/**
 * Componente reutilizable para indicar que un campo o pregunta es obligatoria,
 * mostrando un asterisco rojo con tooltip explicativo y soporte de accesibilidad.
 */
export function RequiredAsterisk({
	tooltipTitle = 'Campo u opción obligatoria',
	color = 'error.main',
	sx,
}: RequiredAsteriskProps) {
	return (
		<Tooltip title={tooltipTitle} arrow placement="top">
			<Typography
				component="span"
				aria-label={tooltipTitle}
				tabIndex={0}
				sx={{
					color,
					cursor: 'help',
					ml: 0.5,
					fontWeight: 'bold',
					display: 'inline-block',
					userSelect: 'none',
					...sx,
				}}
			>
				*
			</Typography>
		</Tooltip>
	);
}

export default RequiredAsterisk;
