import { describe, expect, it } from 'vitest';

import { PUBLIC_DESCRIPTION_MAX_LENGTH, publicDescriptionSchema } from '../src/shared/public-description.schema.js';

describe('publicDescriptionSchema', () => {
	it('acepta descripciones de hasta 5.000 caracteres', () => {
		expect(publicDescriptionSchema.safeParse('a'.repeat(PUBLIC_DESCRIPTION_MAX_LENGTH)).success).toBe(true);
	});

	it('rechaza descripciones que superan los 5.000 caracteres', () => {
		const result = publicDescriptionSchema.safeParse('a'.repeat(PUBLIC_DESCRIPTION_MAX_LENGTH + 1));

		expect(result.success).toBe(false);
	});

	it('conserva el contenido Markdown y recorta espacios exteriores', () => {
		expect(publicDescriptionSchema.parse('  **Trayectoria**\n\n- Música\n- Teatro  ')).toBe(
			'**Trayectoria**\n\n- Música\n- Teatro',
		);
	});
});
