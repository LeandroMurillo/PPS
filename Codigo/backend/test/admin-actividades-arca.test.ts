import { describe, expect, it, vi } from 'vitest';

import {
	actividadArcaCodigoParamSchema,
	editarActividadArcaAdminBodySchema,
	guardarActividadArcaAdminBodySchema,
	importarActividadesArcaAdminBodySchema,
	listarActividadesArcaAdminQuerySchema,
} from '../src/modules/admin/admin.schemas.js';
import { importarActividadesArcaAdminService } from '../src/modules/admin/admin.service.js';
import * as adminRepo from '../src/modules/admin/admin.repository.js';

describe('Esquemas de Actividades ARCA', () => {
	it('aplica paginación y orden predeterminados a la consulta de actividades ARCA', () => {
		expect(listarActividadesArcaAdminQuerySchema.parse({})).toEqual({
			limit: 25,
			offset: 0,
			sortBy: 'codigo',
			sortDir: 'ASC',
		});
	});

	it('normaliza búsqueda y dirección de orden', () => {
		expect(
			listarActividadesArcaAdminQuerySchema.parse({
				busqueda: '  teatro  ',
				limit: '50',
				offset: '10',
				sortBy: 'descripcion',
				sortDir: 'desc',
			}),
		).toEqual({
			busqueda: 'teatro',
			limit: 50,
			offset: 10,
			sortBy: 'descripcion',
			sortDir: 'DESC',
		});
	});

	it('rechaza campos de ordenamiento inválidos', () => {
		expect(listarActividadesArcaAdminQuerySchema.safeParse({ sortBy: 'invalido' }).success).toBe(false);
	});

	it('valida código ARCA de 6 dígitos numéricos', () => {
		expect(actividadArcaCodigoParamSchema.safeParse({ codigo: '011111' }).success).toBe(true);
		expect(actividadArcaCodigoParamSchema.safeParse({ codigo: '12345' }).success).toBe(false);
		expect(actividadArcaCodigoParamSchema.safeParse({ codigo: '1234567' }).success).toBe(false);
		expect(actividadArcaCodigoParamSchema.safeParse({ codigo: 'abcdef' }).success).toBe(false);
	});

	it('valida datos para creación manual de actividad ARCA', () => {
		const valid = guardarActividadArcaAdminBodySchema.parse({
			codigo: ' 900012 ',
			descripcion: '  Composición de obras teatrales  ',
		});
		expect(valid).toEqual({
			codigo: '900012',
			descripcion: 'Composición de obras teatrales',
		});

		expect(
			guardarActividadArcaAdminBodySchema.safeParse({
				codigo: '123',
				descripcion: 'Test',
			}).success,
		).toBe(false);

		expect(
			guardarActividadArcaAdminBodySchema.safeParse({
				codigo: '123456',
				descripcion: '',
			}).success,
		).toBe(false);
	});

	it('valida edición de descripción', () => {
		expect(
			editarActividadArcaAdminBodySchema.parse({
				descripcion: '  Nueva descripción  ',
			}),
		).toEqual({
			descripcion: 'Nueva descripción',
		});

		expect(
			editarActividadArcaAdminBodySchema.safeParse({
				descripcion: '   ',
			}).success,
		).toBe(false);
	});

	it('valida cuerpo de importación', () => {
		expect(importarActividadesArcaAdminBodySchema.safeParse({ contenido: '' }).success).toBe(false);
		expect(
			importarActividadesArcaAdminBodySchema.safeParse({
				contenido: '011111;Cultivo de arroz;',
			}).success,
		).toBe(true);
	});
});

describe('Servicio de Importación de Archivo TXT F883', () => {
	it('parsea correctamente archivo con cabecera y punto y coma final', async () => {
		const mockBatch = vi
			.spyOn(adminRepo, 'importarActividadesArcaBatchRepository')
			.mockResolvedValueOnce({ creados: 2, actualizados: 0, sinCambios: 0, erroresAdicionales: [] });

		const txt = `COD_ACTIVIDAD_F883;DESC_ACTIVIDAD_F883;DESCL_ACTIVIDA_F883;
011111;Cultivo de arroz;Cultivo de arroz;
011119;Cultivo de cereales n.c.p., excepto los de uso forrajero;Cultivo de cereales n.c.p., excepto los de uso forrajero (Incluye alforfón, cebada cervecera, etc.);`;

		const res = await importarActividadesArcaAdminService(txt);

		expect(mockBatch).toHaveBeenCalledWith([
			{ linea: 2, codigo: '011111', descripcion: 'Cultivo de arroz' },
			{
				linea: 3,
				codigo: '011119',
				descripcion: 'Cultivo de cereales n.c.p., excepto los de uso forrajero',
			},
		]);

		expect(res.data.totalProcesados).toBe(2);
		expect(res.data.creados).toBe(2);
		expect(res.data.errores).toHaveLength(0);

		mockBatch.mockRestore();
	});

	it('soporta archivo con BOM UTF-8 y líneas con errores de formato', async () => {
		const mockBatch = vi
			.spyOn(adminRepo, 'importarActividadesArcaBatchRepository')
			.mockResolvedValueOnce({ creados: 1, actualizados: 0, sinCambios: 0, erroresAdicionales: [] });

		const txt = `\uFEFFCOD_ACTIVIDAD_F883;DESC_ACTIVIDAD_F883;DESCL_ACTIVIDA_F883;
011111;Cultivo de arroz;
invalido;Texto sin codigo valido;
011112; ;`;

		const res = await importarActividadesArcaAdminService(txt);

		expect(mockBatch).toHaveBeenCalledWith([{ linea: 2, codigo: '011111', descripcion: 'Cultivo de arroz' }]);

		expect(res.data.creados).toBe(1);
		expect(res.data.errores).toHaveLength(2);
		expect(res.data.errores[0]?.linea).toBe(3);
		expect(res.data.errores[1]?.linea).toBe(4);

		mockBatch.mockRestore();
	});

	it('integra errores adicionales de colisión devueltos por el repositorio', async () => {
		const mockBatch = vi.spyOn(adminRepo, 'importarActividadesArcaBatchRepository').mockResolvedValueOnce({
			creados: 1,
			actualizados: 0,
			sinCambios: 0,
			erroresAdicionales: [
				{
					linea: 3,
					codigo: '900021',
					motivo: 'La descripción ya está registrada para la actividad con código 900012.',
				},
			],
		});

		const txt = `COD_ACTIVIDAD_F883;DESC_ACTIVIDAD_F883;
011111;Cultivo de arroz;
900021;Composición y representación de obras teatrales, musicales y artísticas;
invalido;Texto sin codigo;`;

		const res = await importarActividadesArcaAdminService(txt);

		expect(res.data.creados).toBe(1);
		expect(res.data.errores).toHaveLength(2);
		expect(res.data.errores[0]).toEqual({
			linea: 3,
			codigo: '900021',
			motivo: 'La descripción ya está registrada para la actividad con código 900012.',
		});
		expect(res.data.errores[1]?.linea).toBe(4);

		mockBatch.mockRestore();
	});
});
