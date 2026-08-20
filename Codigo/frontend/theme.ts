'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
	cssVariables: {
		colorSchemeSelector: 'data-toolpad-color-scheme',
	},
	colorSchemes: { light: true, dark: true },
	defaultColorScheme: 'dark',
	components: {
		MuiTextField: {
			defaultProps: {
				inputProps: {
					spellCheck: 'true',
					autoCorrect: 'on',
				},
			},
		},
	},
});

export default theme;
