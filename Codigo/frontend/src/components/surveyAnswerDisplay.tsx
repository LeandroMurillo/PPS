import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LinkIcon from '@mui/icons-material/Link';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { Box, Chip, Link, Stack, Typography } from '@mui/material';

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
				return (
					<Typography variant="body2" color="text.secondary">
						{formatSurveyDate(textValue)}
					</Typography>
				);
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
					const href = normalizeSurveyUrl(textValue);
					return (
						<AnswerLink href={href} icon={<LinkIcon fontSize="small" />}>
							{textValue.replace(/^https?:\/\//i, '')}
							<OpenInNewIcon sx={{ fontSize: 14, ml: 0.5 }} />
						</AnswerLink>
					);
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
		return (
			<Typography variant="body2" color="text.secondary">
				{formatSurveyDate(textValue)}
			</Typography>
		);
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
		const href = normalizeSurveyUrl(textValue);
		return (
			<AnswerLink href={href} icon={<LinkIcon fontSize="small" />}>
				{textValue.replace(/^https?:\/\//i, '')}
				<OpenInNewIcon sx={{ fontSize: 14, ml: 0.5 }} />
			</AnswerLink>
		);
	}

	return (
		<Typography variant="body2" color="text.secondary">
			{textValue}
		</Typography>
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
