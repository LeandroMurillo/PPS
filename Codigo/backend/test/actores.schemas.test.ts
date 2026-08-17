import { describe, expect, it } from 'vitest';

import { actorMapaPublicoSchema } from '../src/modules/actores/actores.schemas.js';

const actorMapaValido = {
	id: 47,
	nombre: 'Talleres Ferroviarios de Tafí Viejo',
	descripcion: null,
	foto: null,
	categoria: 'Patrimonio',
	categoriaIcono: 'Category' as const,
	subcategoria: null,
	departamento: 'Tafí Viejo',
	localidad: 'Tafí Viejo',
	direccion: 'Talleres Ferroviarios',
	latitud: -26.731,
	longitud: -65.265,
};

describe('actorMapaPublicoSchema', () => {
	it('exige una dirección no vacía para cada punto del mapa', () => {
		expect(actorMapaPublicoSchema.safeParse({ ...actorMapaValido, direccion: null }).success).toBe(false);
		expect(actorMapaPublicoSchema.safeParse({ ...actorMapaValido, direccion: '   ' }).success).toBe(false);
	});

	it('normaliza la dirección pública', () => {
		const actor = actorMapaPublicoSchema.parse({
			...actorMapaValido,
			direccion: '  Talleres Ferroviarios  ',
		});

		expect(actor.direccion).toBe('Talleres Ferroviarios');
	});
});
