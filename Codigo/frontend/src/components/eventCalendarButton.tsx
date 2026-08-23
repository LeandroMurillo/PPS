import React, { useState } from 'react';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DownloadIcon from '@mui/icons-material/Download';
import LaunchIcon from '@mui/icons-material/Launch';
import { Button, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from '@mui/material';

import { createGoogleCalendarUrl, downloadIcsFile, type CalendarEventData } from '../utils/calendar';

interface EventCalendarButtonProps {
	event: CalendarEventData;
	size?: 'small' | 'medium';
	variant?: 'text' | 'outlined' | 'contained';
}

export default function EventCalendarButton({ event, size = 'small', variant = 'outlined' }: EventCalendarButtonProps) {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	const handleClick = (e: React.MouseEvent<HTMLElement>) => {
		e.stopPropagation();
		setAnchorEl(e.currentTarget);
	};

	const handleClose = (e?: React.MouseEvent) => {
		e?.stopPropagation();
		setAnchorEl(null);
	};

	const handleGoogleCalendar = (e: React.MouseEvent) => {
		e.stopPropagation();
		const url = createGoogleCalendarUrl(event);
		window.open(url, '_blank', 'noopener,noreferrer');
		handleClose();
	};

	const handleDownloadIcs = (e: React.MouseEvent) => {
		e.stopPropagation();
		downloadIcsFile(event);
		handleClose();
	};

	return (
		<>
			<Tooltip title="Agregar este evento a tu calendario personal">
				<Button
					size={size}
					variant={variant}
					startIcon={<CalendarMonthIcon fontSize="small" />}
					onClick={handleClick}
					sx={{
						textTransform: 'none',
						fontWeight: 600,
						whiteSpace: 'nowrap',
						borderRadius: 1.5,
					}}
				>
					Agregar a calendario
				</Button>
			</Tooltip>

			<Menu
				anchorEl={anchorEl}
				open={open}
				onClose={() => handleClose()}
				slotProps={{
					paper: {
						elevation: 3,
						sx: {
							borderRadius: 2,
							minWidth: 200,
							mt: 0.5,
						},
					},
				}}
			>
				<MenuItem onClick={handleGoogleCalendar}>
					<ListItemIcon>
						<LaunchIcon fontSize="small" color="primary" />
					</ListItemIcon>
					<ListItemText primary="Google Calendar" secondary="Abrir en el navegador" />
				</MenuItem>
				<MenuItem onClick={handleDownloadIcs}>
					<ListItemIcon>
						<DownloadIcon fontSize="small" color="secondary" />
					</ListItemIcon>
					<ListItemText primary="Archivo iCal (.ics)" secondary="Outlook, Apple, otros" />
				</MenuItem>
			</Menu>
		</>
	);
}
