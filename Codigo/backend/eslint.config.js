import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
	{
		ignores: ['dist/**', 'coverage/**', 'node_modules/**'],
	},

	eslint.configs.recommended,
	tseslint.configs.recommended,
	prettierConfig,

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
