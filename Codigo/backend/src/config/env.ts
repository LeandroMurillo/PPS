import { z } from 'zod';

const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

	PORT: z.coerce.number().int().min(1).max(65535).default(3000),

	CORS_ORIGIN: z.string().url(),

	DB_HOST: z.string().trim().min(1),

	DB_PORT: z.coerce.number().int().min(1).max(65535).default(3306),

	DB_USER: z.string().trim().min(1),

	DB_PASSWORD: z.string(),

	DB_NAME: z.string().trim().min(1),

	DB_CONNECTION_LIMIT: z.coerce.number().int().min(1).max(50).default(10),
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
