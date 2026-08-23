import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PublicIcon from '@mui/icons-material/Public';
import {
	Alert,
	Autocomplete,
	Checkbox,
	Chip,
	FormControl,
	FormControlLabel,
	FormGroup,
	FormHelperText,
	IconButton,
	InputAdornment,
	MenuItem,
	Radio,
	RadioGroup,
	Select,
	Stack,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material';

import type { PreguntaFormularioAplicable, TipoPreguntaFormulario } from '../api/actores';
import DatePickerSpanish from './datePickerSpanish';
import RequiredAsterisk from './requiredAsterisk';
import { normalizeSurveyUrl, validateSurveyAnswer, type SurveyAnswerValue } from '../utils/surveyValidation';

export type QuestionAnswer = string | string[];

export type SharedQuestion = Omit<PreguntaFormularioAplicable, 'tipoDato'> & {
	tipoDato: TipoPreguntaFormulario | 'OPCION_MULTIPLE_CHIPS' | 'TAGS' | string;
};

function questionError(question: SharedQuestion, value: SurveyAnswerValue, externalError: boolean): string | null {
	if (externalError) {
		return (
			validateSurveyAnswer(question.tipoDato, value, question.esObligatorio) ?? 'Esta pregunta es obligatoria.'
		);
	}
	return validateSurveyAnswer(question.tipoDato, value, false);
}

export default function QuestionField({
	question,
	value,
	hasError = false,
	isNew = false,
	onChange,
}: {
	question: SharedQuestion;
	value: QuestionAnswer;
	hasError?: boolean;
	isNew?: boolean;
	onChange: (value: QuestionAnswer) => void;
}) {
	const label = question.pregunta;
	const selected = Array.isArray(value) ? value : [];
	const scalarValue = typeof value === 'string' ? value : '';
	const validationMessage = questionError(question, value, hasError);
	const showError = Boolean(validationMessage);

	if (question.tipoDato === 'BOOLEANO') {
		return (
			<FormControl error={showError} component="fieldset" fullWidth>
				<Stack spacing={1}>
					<QuestionHeading question={question} hasError={showError} isNew={isNew} />
					<RadioGroup
						row
						aria-label={label}
						value={scalarValue}
						onChange={(event) => onChange(event.target.value)}
					>
						<FormControlLabel value="true" control={<Radio size="small" />} label="Sí" />
						<FormControlLabel value="false" control={<Radio size="small" />} label="No" />
					</RadioGroup>
					{validationMessage && <FormHelperText error>{validationMessage}</FormHelperText>}
				</Stack>
			</FormControl>
		);
	}

	if (question.tipoDato === 'OPCION_UNICA') {
		return (
			<FormControl fullWidth required={question.esObligatorio} error={showError}>
				<Stack spacing={1}>
					<QuestionHeading question={question} hasError={showError} isNew={isNew} />
					<Select
						displayEmpty
						error={showError}
						value={scalarValue}
						onChange={(event) => onChange(event.target.value)}
						inputProps={{ 'aria-label': label }}
					>
						<MenuItem value="" disabled>
							Seleccioná una opción
						</MenuItem>
						{question.opciones?.map((option) => (
							<MenuItem key={option} value={option}>
								{option}
							</MenuItem>
						))}
					</Select>
					{validationMessage && <FormHelperText error>{validationMessage}</FormHelperText>}
				</Stack>
			</FormControl>
		);
	}

	if (
		question.tipoDato === 'OPCION_MULTIPLE_CHIPS' ||
		question.tipoDato === 'TAGS' ||
		(question.tipoDato === 'OPCION_MULTIPLE' && (question.opciones?.length ?? 0) > 10)
	) {
		return (
			<FormControl error={showError} component="fieldset" fullWidth>
				<Stack spacing={1}>
					<QuestionHeading question={question} hasError={showError} isNew={isNew} />
					<Autocomplete
						multiple
						options={question.opciones ?? []}
						value={selected}
						onChange={(_, nextValue) => onChange(nextValue)}
						renderTags={(tagValue, getTagProps) =>
							tagValue.map((option, index) => {
								const { key, ...tagProps } = getTagProps({ index });
								return <Chip key={key} label={option} size="small" {...tagProps} />;
							})
						}
						renderInput={(params) => (
							<TextField
								{...params}
								error={showError}
								placeholder={selected.length > 0 ? undefined : 'Seleccioná una o más opciones'}
							/>
						)}
					/>
					{validationMessage && <FormHelperText error>{validationMessage}</FormHelperText>}
				</Stack>
			</FormControl>
		);
	}

	if (question.tipoDato === 'OPCION_MULTIPLE') {
		return (
			<FormControl error={showError} component="fieldset" fullWidth>
				<Stack spacing={1}>
					<QuestionHeading question={question} hasError={showError} isNew={isNew} />
					<FormGroup aria-label={label}>
						{question.opciones?.map((option) => (
							<FormControlLabel
								key={option}
								label={option}
								control={
									<Checkbox
										checked={selected.includes(option)}
										onChange={(event) =>
											onChange(
												event.target.checked
													? [...selected, option]
													: selected.filter((item) => item !== option),
											)
										}
									/>
								}
							/>
						))}
					</FormGroup>
					{validationMessage && <FormHelperText error>{validationMessage}</FormHelperText>}
				</Stack>
			</FormControl>
		);
	}

	if (question.tipoDato === 'FECHA') {
		return (
			<Stack spacing={1}>
				<QuestionHeading question={question} hasError={showError} isNew={isNew} />
				<DatePickerSpanish
					label={label}
					value={scalarValue}
					onChange={onChange}
					required={question.esObligatorio}
					error={showError}
					helperText={validationMessage ?? undefined}
				/>
			</Stack>
		);
	}

	const inputType: Record<string, string> = {
		NUMERO: 'number',
		URL: 'url',
		EMAIL: 'email',
		TELEFONO: 'tel',
	};
	const isValidUrl = question.tipoDato === 'URL' && scalarValue.trim() && !validationMessage;

	return (
		<Stack spacing={1}>
			<QuestionHeading question={question} hasError={showError} isNew={isNew} />
			<TextField
				fullWidth
				required={question.esObligatorio}
				error={showError}
				helperText={validationMessage ?? undefined}
				type={inputType[question.tipoDato] ?? 'text'}
				placeholder="Ingresá tu respuesta"
				value={scalarValue}
				onChange={(event) => onChange(event.target.value)}
				onBlur={() => {
					if (question.tipoDato === 'URL' && scalarValue.trim() && !validationMessage) {
						onChange(normalizeSurveyUrl(scalarValue));
					}
				}}
				slotProps={{
					htmlInput: { 'aria-label': label },
					input:
						question.tipoDato === 'URL' && isValidUrl
							? {
									endAdornment: (
										<InputAdornment position="end">
											<Tooltip title="Abrir enlace en una pestaña nueva">
												<IconButton
													aria-label="Abrir enlace"
													edge="end"
													href={normalizeSurveyUrl(scalarValue)}
													target="_blank"
													rel="noopener noreferrer"
												>
													<OpenInNewIcon fontSize="small" />
												</IconButton>
											</Tooltip>
										</InputAdornment>
									),
								}
							: undefined,
				}}
			/>
			{question.tipoDato === 'URL' && scalarValue.trim().toLowerCase().startsWith('http://') && !showError && (
				<Alert severity="warning" variant="outlined" sx={{ py: 0.25, px: 1, fontSize: '0.75rem' }}>
					El enlace utiliza HTTP en vez de HTTPS. Se recomienda utilizar una dirección segura (HTTPS).
				</Alert>
			)}
		</Stack>
	);
}

function QuestionHeading({
	question,
	hasError = false,
	isNew = false,
}: {
	question: SharedQuestion;
	hasError?: boolean;
	isNew?: boolean;
}) {
	return (
		<Stack
			direction={{ xs: 'column', sm: 'row' }}
			spacing={1}
			alignItems={{ xs: 'flex-start', sm: 'center' }}
			justifyContent="space-between"
		>
			<Typography
				variant="subtitle2"
				fontWeight={700}
				color={hasError ? 'error.main' : 'text.primary'}
				sx={{ transition: 'color 0.2s ease' }}
			>
				{question.pregunta}
				{question.esObligatorio && <RequiredAsterisk tooltipTitle="Pregunta obligatoria" />}
			</Typography>
			<Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap sx={{ gap: 0.5 }}>
				{isNew && (
					<Tooltip title="Pregunta nueva: incorporada al catálogo del sector." arrow>
						<Chip
							size="small"
							color="info"
							variant="outlined"
							label="Nueva"
							sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }}
						/>
					</Tooltip>
				)}
				{question.esObligatorio && (
					<Chip
						size="small"
						color="warning"
						variant="outlined"
						label="Obligatoria"
						sx={{ height: 22, fontSize: '0.7rem' }}
					/>
				)}
				{question.esPublico && (
					<Tooltip title="Esta respuesta podrá mostrarse en el perfil público del actor cultural." arrow>
						<Chip
							size="small"
							variant="outlined"
							color="success"
							icon={<PublicIcon sx={{ fontSize: 14 }} />}
							label="Pública"
							tabIndex={0}
							sx={{ height: 22, fontSize: '0.7rem', cursor: 'help' }}
						/>
					</Tooltip>
				)}
			</Stack>
		</Stack>
	);
}
