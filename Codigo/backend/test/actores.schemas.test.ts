import { describe, expect, it } from 'vitest';

import {
	actorDetallePublicoSchema,
	actorDetalleRespuestaSchema,
	actorMapaPublicoSchema,
} from '../src/modules/actores/actores.schemas.js';

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

describe('actorDetalleRespuestaSchema', () => {
	it('valida respuestas con todos los diferentes tipos de dato soportados', () => {
		const tiposDatoEjemplos = [
			{ pregunta: 'Género musical principal', tipoDato: 'TEXTO', respuesta: 'Folklore' },
			{ pregunta: 'Cantidad de discos editados', tipoDato: 'NUMERO', respuesta: '5' },
			{ pregunta: '¿La materia prima es local?', tipoDato: 'BOOLEANO', respuesta: 'Sí' },
			{ pregunta: 'Fecha de inicio o debut artístico', tipoDato: 'FECHA', respuesta: '2015-08-29' },
			{ pregunta: 'Sitio web oficial', tipoDato: 'URL', respuesta: 'https://artista.ejemplo.ar' },
			{ pregunta: 'Correo de contrataciones', tipoDato: 'EMAIL', respuesta: 'contacto@ejemplo.com' },
			{ pregunta: 'Teléfono de contacto', tipoDato: 'TELEFONO', respuesta: '+5493815123456' },
			{ pregunta: 'Formato habitual', tipoDato: 'OPCION_UNICA', respuesta: 'Solista' },
			{ pregunta: 'Cámaras utilizadas', tipoDato: 'OPCION_MULTIPLE', respuesta: 'Sony Alpha, Blackmagic' },
			{
				pregunta: 'Especialidades técnicas',
				tipoDato: 'OPCION_MULTIPLE_CHIPS',
				respuesta: 'Sonido, Iluminación',
			},
			{ pregunta: 'Etiquetas temáticas', tipoDato: 'TAGS', respuesta: 'Folklore, Rock Tucumano' },
		];

		for (const ejemplo of tiposDatoEjemplos) {
			const parsed = actorDetalleRespuestaSchema.safeParse({
				...ejemplo,
				publica: true,
			});
			expect(parsed.success).toBe(true);
			if (parsed.success) {
				expect(parsed.data.tipoDato).toBe(ejemplo.tipoDato);
				expect(parsed.data.respuesta).toBe(ejemplo.respuesta);
				expect(parsed.data.publica).toBe(true);
			}
		}
	});

	it('permite respuestas sin tipoDato o con tipoDato nulo para retrocompatibilidad', () => {
		const parsed1 = actorDetalleRespuestaSchema.safeParse({
			pregunta: 'Pregunta general',
			respuesta: 'Respuesta simple',
		});
		expect(parsed1.success).toBe(true);

		const parsed2 = actorDetalleRespuestaSchema.safeParse({
			pregunta: 'Pregunta con nulo',
			tipoDato: null,
			respuesta: 'Otra respuesta',
			publica: false,
		});
		expect(parsed2.success).toBe(true);
	});

	it('valida la ficha pública completa conteniendo respuestas tipadas', () => {
		const fichaCompleta = {
			id: 1,
			nombre: 'Ballet Folklórico Tucumano',
			descripcion: 'Compañía de danza tradicional.',
			foto: null,
			cuit: null,
			tipoActor: 'COLECTIVO',
			estado: 'A',
			categoria: 'Danza',
			categoriaIcono: 'Category',
			subcategoria: 'Danza Tradicional',
			dueno: null,
			ubicacion: {
				provincia: 'Tucumán',
				departamento: 'Capital',
				localidad: 'San Miguel de Tucumán',
				esPublica: true,
				direccion: 'San Martín 250',
				latitud: -26.83,
				longitud: -65.2,
			},
			portafolio: [],
			eventos: [],
			respuestas: [
				{ pregunta: 'Género musical principal', tipoDato: 'TEXTO', respuesta: 'Folklore', publica: true },
				{ pregunta: 'Fecha de inicio', tipoDato: 'FECHA', respuesta: '2010-05-25', publica: true },
				{ pregunta: 'Sitio web', tipoDato: 'URL', respuesta: 'https://ballet.ar', publica: true },
				{ pregunta: 'Presupuesto privado', tipoDato: 'TEXTO', respuesta: 'Privado', publica: false },
			],
			integrantes: [],
		};

		const parsed = actorDetallePublicoSchema.safeParse(fichaCompleta);
		expect(parsed.success).toBe(true);
		if (parsed.success) {
			expect(parsed.data.respuestas).toHaveLength(4);
			expect(parsed.data.respuestas[0].tipoDato).toBe('TEXTO');
			expect(parsed.data.respuestas[1].tipoDato).toBe('FECHA');
			expect(parsed.data.respuestas[2].tipoDato).toBe('URL');
		}
	});
});
