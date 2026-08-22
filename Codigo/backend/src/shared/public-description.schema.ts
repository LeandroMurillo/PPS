import { z } from 'zod';
import { sanitizeString } from './sanitize-string.js';

export const PUBLIC_DESCRIPTION_MAX_LENGTH = 5_000;

export const publicDescriptionSchema = z
	.string()
	.transform((val) => sanitizeString(val).trim())
	.pipe(
		z
			.string()
			.min(1, { message: 'La descripción es obligatoria.' })
			.max(PUBLIC_DESCRIPTION_MAX_LENGTH, {
				message: `La descripción no puede superar los ${PUBLIC_DESCRIPTION_MAX_LENGTH} caracteres.`,
			}),
	);
