import React from 'react';
import dayjs from 'dayjs';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DownloadIcon from '@mui/icons-material/Download';
import LaunchIcon from '@mui/icons-material/Launch';
import { Box, Divider, ListItemIcon, ListItemText, Menu, MenuItem, Typography } from '@mui/material';

import { createGoogleCalendarUrl, downloadIcsFile, type CalendarEventData } from '../utils/calendar';

interface CalendarExportMenuProps {
	anchorEl: HTMLElement | null;
	open: boolean;
	onClose: () => void;
	event: CalendarEventData | null;
}

export default function CalendarExportMenu({ anchorEl, open, onClose, event }: CalendarExportMenuProps) {
	if (!event) return null;

	const handleGoogleCalendar = (e: React.MouseEvent) => {
		e.stopPropagation();
		const url = createGoogleCalendarUrl(event);
		window.open(url, '_blank', 'noopener,noreferrer');
		onClose();
	};

	const handleDownloadIcs = (e: React.MouseEvent) => {
		e.stopPropagation();
		downloadIcsFile(event);
		onClose();
	};

	const fechaFormatted = dayjs(event.fecha).format('dddd, D [de] MMMM [de] YYYY');
	const hora = dayjs(event.fecha).format('HH:mm');
	const tieneHora = hora !== '00:00';

	return (
		<Menu
			anchorEl={anchorEl}
			open={open}
			onClose={onClose}
			anchorOrigin={{
				vertical: 'bottom',
				horizontal: 'center',
			}}
			transformOrigin={{
				vertical: 'top',
				horizontal: 'center',
			}}
			slotProps={{
				paper: {
					elevation: 4,
					sx: {
						borderRadius: 2.5,
						minWidth: 260,
						maxWidth: 340,
						p: 0.5,
						mt: 1,
					},
				},
			}}
		>
			<Box sx={{ px: 2, py: 1.5 }}>
				<Typography variant="subtitle2" fontWeight="700" noWrap>
					{event.nombreEvento}
				</Typography>
				<Typography
					variant="caption"
					color="text.secondary"
					sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}
				>
					<CalendarMonthIcon sx={{ fontSize: 13 }} />
					<span style={{ textTransform: 'capitalize' }}>{fechaFormatted}</span>
					{tieneHora && ` • ${hora} hs`}
				</Typography>
			</Box>

			<Divider sx={{ my: 0.5 }} />

			<MenuItem onClick={handleGoogleCalendar} sx={{ py: 1, borderRadius: 1.5 }}>
				<ListItemIcon>
					<LaunchIcon fontSize="small" color="primary" />
				</ListItemIcon>
				<ListItemText
					primary="Google Calendar"
					secondary="Abrir en el navegador"
					primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
					secondaryTypographyProps={{ variant: 'caption' }}
				/>
			</MenuItem>

			<MenuItem onClick={handleDownloadIcs} sx={{ py: 1, borderRadius: 1.5 }}>
				<ListItemIcon>
					<DownloadIcon fontSize="small" color="secondary" />
				</ListItemIcon>
				<ListItemText
					primary="Descargar archivo (.ics)"
					secondary="Apple Calendar, Outlook, otros"
					primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
					secondaryTypographyProps={{ variant: 'caption' }}
				/>
			</MenuItem>
		</Menu>
	);
}
