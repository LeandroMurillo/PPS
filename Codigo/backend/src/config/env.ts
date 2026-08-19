import { z } from 'zod';

const envSchema = z
	.object({
		NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

		PORT: z.coerce.number().int().min(1).max(65535).default(3000),

		CORS_ORIGIN: z.string().url().default('http://localhost:5173'),

		PUBLIC_BASE_URL: z.string().url().default('http://localhost:3000'),

		DB_HOST: z.string().trim().min(1).default('localhost'),

		DB_PORT: z.coerce.number().int().min(1).max(65535).default(3306),

		DB_USER: z.string().trim().min(1).default('root'),

		DB_PASSWORD: z.string().default(''),

		DB_NAME: z.string().trim().min(1).default('cultura'),

		DB_CONNECTION_LIMIT: z.coerce.number().int().min(1).max(50).default(10),

		JWT_SECRET: z.string().min(16).default('mosaico_cultural_jwt_secret_key_dev_mode_2026'),

		JWT_EXPIRES_IN_SECONDS: z.coerce.number().int().min(60).max(86400).default(900),

		FIREBASE_PROJECT_ID: z.string().trim().min(1).optional(),

		FIREBASE_CLIENT_EMAIL: z.string().trim().email().optional(),

		FIREBASE_PRIVATE_KEY: z.string().min(1).optional(),
	})
	.superRefine((data, ctx) => {
		if (data.NODE_ENV === 'production') {
			if (!process.env.JWT_SECRET || data.JWT_SECRET === 'mosaico_cultural_jwt_secret_key_dev_mode_2026') {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['JWT_SECRET'],
					message:
						'En producción se debe configurar una variable JWT_SECRET segura y diferente al valor por defecto.',
				});
			}

			for (const key of ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'] as const) {
				if (!data[key]) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						path: [key],
						message: `En producción se debe configurar ${key}.`,
					});
				}
			}
		}
	});

const result = envSchema.safeParse(process.env);

if (!result.success) {
	console.error('Variables de entorno inválidas:');

	for (const issue of result.error.issues) {
		console.error(`- ${issue.path.join('.')}: ${issue.message}`);
	}

	process.exit(1);
}

export const env = result.data;
