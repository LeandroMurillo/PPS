import React, { useState } from 'react';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LinkIcon from '@mui/icons-material/Link';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { Alert, Box, Chip, Link, Popover, Stack, Tooltip, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

import {
	formatSurveyDate,
	getWhatsAppPhoneUrl,
	isLikelyMobilePhone,
	isValidSurveyDate,
	isValidSurveyEmail,
	isValidSurveyPhone,
	isValidSurveyUrl,
	normalizeSurveyUrl,
	type SurveyAnswerValue,
} from '../utils/surveyValidation';

export default function SurveyAnswerDisplay({
	value,
	tipoDato,
	emptyText = 'Sin respuesta',
}: {
	value: SurveyAnswerValue;
	tipoDato?: string | null;
	emptyText?: string;
}) {
	if (Array.isArray(value)) {
		if (value.length === 0) return <EmptyAnswer text={emptyText} />;
		return (
			<Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
				{value.map((item) => (
					<Chip key={item} label={item} size="small" variant="outlined" />
				))}
			</Stack>
		);
	}

	if (value === null || value === undefined || String(value).trim() === '') {
		return <EmptyAnswer text={emptyText} />;
	}

	if (typeof value === 'boolean' || tipoDato === 'BOOLEANO') {
		const booleanValue = typeof value === 'boolean' ? value : String(value).toLowerCase() === 'true';
		return <Chip size="small" color={booleanValue ? 'success' : 'default'} label={booleanValue ? 'Sí' : 'No'} />;
	}

	const textValue = String(value).trim();

	if (tipoDato) {
		switch (tipoDato) {
			case 'FECHA':
				return <DateAnswer value={textValue} />;
			case 'EMAIL':
				return (
					<AnswerLink href={`mailto:${textValue}`} icon={<EmailOutlinedIcon fontSize="small" />}>
						{textValue}
					</AnswerLink>
				);
			case 'TELEFONO': {
				const isMobile = isLikelyMobilePhone(textValue);
				const waUrl = isMobile ? getWhatsAppPhoneUrl(textValue) : null;
				const href = waUrl ?? `tel:${textValue}`;
				const icon = waUrl ? <WhatsAppIcon fontSize="small" /> : <PhoneOutlinedIcon fontSize="small" />;
				return (
					<AnswerLink href={href} icon={icon}>
						{textValue}
					</AnswerLink>
				);
			}
			case 'URL': {
				if (isValidSurveyUrl(textValue)) {
					return <UrlAnswer value={textValue} />;
				}
				return (
					<Typography variant="body2" color="text.secondary">
						{textValue}
					</Typography>
				);
			}
			case 'OPCION_MULTIPLE':
			case 'OPCION_MULTIPLE_CHIPS':
			case 'TAGS': {
				let items: string[] = [];
				if (textValue.startsWith('[') && textValue.endsWith(']')) {
					try {
						const parsed = JSON.parse(textValue);
						if (Array.isArray(parsed)) {
							items = parsed.map(String);
						}
					} catch {
						// ignore
					}
				}
				if (items.length === 0 && textValue.includes(',')) {
					items = textValue
						.split(',')
						.map((s) => s.trim())
						.filter(Boolean);
				}
				if (items.length > 0) {
					return (
						<Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
							{items.map((item) => (
								<Chip key={item} label={item} size="small" variant="outlined" />
							))}
						</Stack>
					);
				}
				return (
					<Typography variant="body2" color="text.secondary">
						{textValue}
					</Typography>
				);
			}
			default:
				return (
					<Typography variant="body2" color="text.secondary">
						{textValue}
					</Typography>
				);
		}
	}

	if (isValidSurveyDate(textValue)) {
		return <DateAnswer value={textValue} />;
	}

	if (isValidSurveyEmail(textValue)) {
		return (
			<AnswerLink href={`mailto:${textValue}`} icon={<EmailOutlinedIcon fontSize="small" />}>
				{textValue}
			</AnswerLink>
		);
	}

	if (isValidSurveyPhone(textValue)) {
		const isMobile = isLikelyMobilePhone(textValue);
		const waUrl = isMobile ? getWhatsAppPhoneUrl(textValue) : null;
		const href = waUrl ?? `tel:${textValue}`;
		const icon = waUrl ? <WhatsAppIcon fontSize="small" /> : <PhoneOutlinedIcon fontSize="small" />;
		return (
			<AnswerLink href={href} icon={icon}>
				{textValue}
			</AnswerLink>
		);
	}

	if (isValidSurveyUrl(textValue)) {
		return <UrlAnswer value={textValue} />;
	}

	return (
		<Typography variant="body2" color="text.secondary">
			{textValue}
		</Typography>
	);
}

function DateAnswer({ value }: { value: string }) {
	const formattedDate = formatSurveyDate(value);
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

	const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const open = Boolean(anchorEl);
	const dayjsValue = value ? dayjs(value) : null;
	const isDayjsValid = dayjsValue && dayjsValue.isValid();

	return (
		<>
			<Box
				onClick={handleOpen}
				sx={{
					display: 'inline-flex',
					alignItems: 'center',
					gap: 0.75,
					cursor: 'pointer',
					maxWidth: '100%',
					borderRadius: 1,
					px: 0.5,
					py: 0.25,
					mx: -0.5,
					transition: 'background-color 0.2s',
					'&:hover': {
						bgcolor: 'action.hover',
					},
				}}
			>
				<CalendarMonthOutlinedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
				<Typography variant="body2" color="text.secondary" component="span">
					{formattedDate}
				</Typography>
			</Box>

			<Popover
				open={open}
				anchorEl={anchorEl}
				onClose={handleClose}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'left',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'left',
				}}
				slotProps={{
					paper: {
						sx: {
							p: 1,
							boxShadow: 6,
							borderRadius: 2,
							overflow: 'hidden',
						},
					},
				}}
			>
				{isDayjsValid ? (
					<LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
						<Box sx={{ width: 280 }}>
							<DateCalendar
								value={dayjsValue}
								readOnly
								sx={{
									width: 280,
									maxHeight: 290,
									'& .MuiPickersCalendarHeader-root': {
										pl: 1,
										pr: 1,
										my: 0.5,
									},
								}}
							/>
						</Box>
					</LocalizationProvider>
				) : (
					<Typography variant="body2" sx={{ p: 2 }}>
						{formattedDate}
					</Typography>
				)}
			</Popover>
		</>
	);
}

function UrlAnswer({ value }: { value: string }) {
	const href = normalizeSurveyUrl(value);
	const isHttpInsecure = href.startsWith('http://');

	return (
		<Stack spacing={0.5} alignItems="flex-start" sx={{ maxWidth: '100%' }}>
			<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, maxWidth: '100%' }}>
				<AnswerLink href={href} icon={<LinkIcon fontSize="small" />}>
					{value.replace(/^https?:\/\//i, '')}
					<OpenInNewIcon sx={{ fontSize: 14, ml: 0.5 }} />
				</AnswerLink>
				{isHttpInsecure && (
					<Tooltip title="Alerta: Este enlace utiliza HTTP no seguro en lugar de HTTPS" arrow>
						<WarningAmberIcon color="warning" sx={{ fontSize: 18, cursor: 'help' }} />
					</Tooltip>
				)}
			</Box>
			{isHttpInsecure && (
				<Alert
					severity="warning"
					variant="outlined"
					sx={{
						py: 0.25,
						px: 1,
						fontSize: '0.75rem',
						'& .MuiAlert-icon': { mr: 0.75, fontSize: 16, py: 0.25 },
						'& .MuiAlert-message': { py: 0.25 },
					}}
				>
					El enlace utiliza HTTP en lugar de HTTPS (conexión no segura).
				</Alert>
			)}
		</Stack>
	);
}

function AnswerLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
	return (
		<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, maxWidth: '100%' }}>
			{icon}
			<Link
				href={href}
				target={href.startsWith('http') ? '_blank' : undefined}
				rel="noopener noreferrer"
				underline="hover"
				sx={{ overflowWrap: 'anywhere' }}
			>
				{children}
			</Link>
		</Box>
	);
}

function EmptyAnswer({ text }: { text: string }) {
	return (
		<Typography variant="body2" color="text.secondary">
			{text}
		</Typography>
	);
}
