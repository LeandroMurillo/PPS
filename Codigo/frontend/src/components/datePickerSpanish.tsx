import React from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/es';
import updateLocale from 'dayjs/plugin/updateLocale';

dayjs.extend(updateLocale);
dayjs.locale('es');
dayjs.updateLocale('es', {
	weekStart: 0, // 0 = Domingo (Sunday first day of week)
});

interface DatePickerSpanishProps {
	label: string;
	value: string; // YYYY-MM-DD
	onChange: (dateString: string) => void;
	size?: 'small' | 'medium';
	error?: boolean;
	helperText?: string;
	required?: boolean;
	disabled?: boolean;
	minDate?: Dayjs;
	maxDate?: Dayjs;
}

export default function DatePickerSpanish({
	label,
	value,
	onChange,
	size = 'medium',
	error,
	helperText,
	required,
	disabled,
	minDate,
	maxDate,
}: DatePickerSpanishProps) {
	const dayjsValue = value ? dayjs(value) : null;

	return (
		<LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
			<DatePicker
				label={label}
				value={dayjsValue && dayjsValue.isValid() ? dayjsValue : null}
				onChange={(newValue) => {
					if (newValue && newValue.isValid()) {
						onChange(newValue.format('YYYY-MM-DD'));
					} else {
						onChange('');
					}
				}}
				disabled={disabled}
				minDate={minDate}
				maxDate={maxDate}
				slotProps={{
					textField: {
						fullWidth: true,
						size,
						required,
						error,
						helperText,
					},
				}}
			/>
		</LocalizationProvider>
	);
}
