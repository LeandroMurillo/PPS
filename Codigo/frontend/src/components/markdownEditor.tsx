import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

import CodeIcon from '@mui/icons-material/Code';
import EditIcon from '@mui/icons-material/Edit';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import MarkdownContent from './markdownContent';

type MarkdownEditorProps = {
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	helperText?: ReactNode;
	error?: boolean;
	required?: boolean;
	minRows?: number;
	maxLength?: number;
};

type Selection = { start: number; end: number };

export default function MarkdownEditor({
	label,
	value,
	onChange,
	placeholder,
	helperText,
	error = false,
	required = false,
	minRows = 6,
	maxLength = 5_000,
}: MarkdownEditorProps) {
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);
	const [showPreview, setShowPreview] = useState(false);

	const getSelection = (): Selection => ({
		start: textareaRef.current?.selectionStart ?? value.length,
		end: textareaRef.current?.selectionEnd ?? value.length,
	});

	const commitChange = (nextValue: string, nextSelection: Selection) => {
		if (nextValue.length > maxLength) return;

		onChange(nextValue);
		requestAnimationFrame(() => {
			textareaRef.current?.focus();
			textareaRef.current?.setSelectionRange(nextSelection.start, nextSelection.end);
		});
	};

	const wrapSelection = (prefix: string, suffix: string, placeholderText: string) => {
		const { start, end } = getSelection();
		const selectedText = value.slice(start, end);
		const selectedHasMarkers = selectedText.startsWith(prefix) && selectedText.endsWith(suffix);
		const selectionHasSurroundingMarkers =
			value.slice(Math.max(0, start - prefix.length), start) === prefix &&
			value.slice(end, end + suffix.length) === suffix;

		if (selectedText && selectedHasMarkers) {
			const content = selectedText.slice(prefix.length, selectedText.length - suffix.length);
			const nextValue = `${value.slice(0, start)}${content}${value.slice(end)}`;
			commitChange(nextValue, { start, end: start + content.length });
			return;
		}

		if (selectedText && selectionHasSurroundingMarkers) {
			const markerStart = start - prefix.length;
			const nextValue = `${value.slice(0, markerStart)}${selectedText}${value.slice(end + suffix.length)}`;
			commitChange(nextValue, { start: markerStart, end: markerStart + selectedText.length });
			return;
		}

		const content = selectedText || placeholderText;
		const nextValue = `${value.slice(0, start)}${prefix}${content}${suffix}${value.slice(end)}`;
		const contentStart = start + prefix.length;

		commitChange(nextValue, {
			start: contentStart,
			end: contentStart + content.length,
		});
	};

	const applyList = (ordered: boolean) => {
		const { start, end } = getSelection();
		const lineStart = value.lastIndexOf('\n', start - 1) + 1;
		const nextLineBreak = value.indexOf('\n', end);
		const lineEnd = nextLineBreak === -1 ? value.length : nextLineBreak;
		const selectedLines = value.slice(lineStart, lineEnd) || 'Elemento de lista';
		const lines = selectedLines.split('\n');
		const markerPattern = ordered ? /^\d+\.\s/ : /^[-+*]\s/;
		const allPrefixed = lines.every((line) => markerPattern.test(line));
		const transformed = lines
			.map((line, index) => {
				if (allPrefixed) return line.replace(markerPattern, '');
				return `${ordered ? `${index + 1}.` : '-'} ${line}`;
			})
			.join('\n');
		const nextValue = `${value.slice(0, lineStart)}${transformed}${value.slice(lineEnd)}`;

		commitChange(nextValue, { start: lineStart, end: lineStart + transformed.length });
	};

	const insertLink = () => {
		const { start, end } = getSelection();
		const selectedText = value.slice(start, end) || 'texto del enlace';
		const nextValue = `${value.slice(0, start)}[${selectedText}](https://)${value.slice(end)}`;

		commitChange(nextValue, {
			start: start + 1,
			end: start + 1 + selectedText.length,
		});
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (!(event.ctrlKey || event.metaKey) || event.altKey) return;

		if (event.code === 'KeyB' && !event.shiftKey) {
			event.preventDefault();
			wrapSelection('**', '**', 'texto en negrita');
		} else if (event.code === 'KeyI' && !event.shiftKey) {
			event.preventDefault();
			wrapSelection('*', '*', 'texto en cursiva');
		} else if (event.code === 'KeyK' && !event.shiftKey) {
			event.preventDefault();
			insertLink();
		} else if (event.code === 'Digit7' && event.shiftKey) {
			event.preventDefault();
			applyList(true);
		} else if (event.code === 'Digit8' && event.shiftKey) {
			event.preventDefault();
			applyList(false);
		}
	};

	const tools = [
		{
			label: 'Negrita (Ctrl/Cmd+B)',
			icon: <FormatBoldIcon fontSize="small" />,
			action: () => wrapSelection('**', '**', 'texto en negrita'),
		},
		{
			label: 'Cursiva (Ctrl/Cmd+I)',
			icon: <FormatItalicIcon fontSize="small" />,
			action: () => wrapSelection('*', '*', 'texto en cursiva'),
		},
		{
			label: 'Lista numerada (Ctrl/Cmd+Shift+7)',
			icon: <FormatListNumberedIcon fontSize="small" />,
			action: () => applyList(true),
		},
		{
			label: 'Lista con viñetas (Ctrl/Cmd+Shift+8)',
			icon: <FormatListBulletedIcon fontSize="small" />,
			action: () => applyList(false),
		},
		{
			label: 'Enlace (Ctrl/Cmd+K)',
			icon: <InsertLinkIcon fontSize="small" />,
			action: insertLink,
		},
	];

	return (
		<Box>
			<Paper
				variant="outlined"
				role="toolbar"
				aria-label={`Formato Markdown para ${label}`}
				sx={{
					borderColor: error ? 'error.main' : 'divider',
					borderBottomLeftRadius: 0,
					borderBottomRightRadius: 0,
					bgcolor: 'action.hover',
					px: 1,
					py: 0.5,
				}}
			>
				<Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
					<Stack direction="row" alignItems="center" spacing={0.25} sx={{ overflowX: 'auto' }}>
						<CodeIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
						{tools.map((tool) => (
							<Tooltip key={tool.label} title={tool.label} arrow>
								<IconButton
									type="button"
									size="small"
									aria-label={tool.label}
									disabled={showPreview}
									onClick={tool.action}
								>
									{tool.icon}
								</IconButton>
							</Tooltip>
						))}
					</Stack>

					<Stack direction="row" alignItems="center" spacing={0.75}>
						<Typography
							variant="caption"
							color="text.secondary"
							sx={{ display: { xs: 'none', sm: 'block' } }}
						>
							Markdown
						</Typography>
						<Divider orientation="vertical" flexItem />
						<Tooltip title={showPreview ? 'Volver a editar' : 'Vista previa'} arrow>
							<IconButton
								type="button"
								size="small"
								color={showPreview ? 'primary' : 'default'}
								aria-label={showPreview ? 'Volver a editar' : 'Vista previa del Markdown'}
								aria-pressed={showPreview}
								onClick={() => setShowPreview((current) => !current)}
							>
								{showPreview ? <EditIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
							</IconButton>
						</Tooltip>
					</Stack>
				</Stack>
			</Paper>

			{showPreview ? (
				<Paper
					variant="outlined"
					aria-label={`Vista previa de ${label}`}
					sx={{
						minHeight: minRows * 24 + 32,
						borderColor: error ? 'error.main' : 'divider',
						borderTop: 0,
						borderTopLeftRadius: 0,
						borderTopRightRadius: 0,
						p: 2,
					}}
				>
					<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
						{label}
						{required ? ' *' : ''}
					</Typography>
					{value ? (
						<MarkdownContent>{value}</MarkdownContent>
					) : (
						<Typography color="text.secondary">Todavía no hay contenido para previsualizar.</Typography>
					)}
				</Paper>
			) : (
				<TextField
					fullWidth
					multiline
					minRows={minRows}
					label={label}
					placeholder={placeholder}
					required={required}
					value={value}
					onChange={(event) => onChange(event.target.value)}
					onKeyDown={handleKeyDown}
					inputRef={textareaRef}
					error={error}
					slotProps={{ htmlInput: { maxLength } }}
					sx={{
						'& .MuiOutlinedInput-root': {
							borderTopLeftRadius: 0,
							borderTopRightRadius: 0,
						},
					}}
				/>
			)}

			{helperText && (
				<FormHelperText error={error} sx={{ mx: 1.75 }}>
					{helperText}
				</FormHelperText>
			)}
		</Box>
	);
}
