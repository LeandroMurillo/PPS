import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
	{
		ignores: ['dist/**', 'coverage/**', 'node_modules/**', 'src/**/*.js'],
	},

	eslint.configs.recommended,
	tseslint.configs.recommended,
	prettierConfig,

	{
		languageOptions: {
			globals: {
				...globals.node,
			},
		},
	},

	{
		files: ['src/**/*.ts'],
		rules: {
			'@typescript-eslint/consistent-type-imports': [
				'error',
				{
					prefer: 'type-imports',
				},
			],
			'@typescript-eslint/no-explicit-any': 'warn',
		},
	},
);
