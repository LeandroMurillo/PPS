import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
	eliminarActorService,
	renunciarIntegranteService,
	transferirTitularidadService,
} from '../src/modules/actores/mis-actores.service.js';

const mockObtenerArchivosActorRepository = vi.fn();
const mockEliminarActorRepository = vi.fn();
const mockEliminarArchivosPersonalesUsuario = vi.fn();
const mockTransferirTitularidadRepository = vi.fn();
const mockRenunciarIntegranteRepository = vi.fn();

vi.mock('../src/modules/actores/mis-actores.repository.js', () => ({
	obtenerArchivosActorRepository: (id: number) => mockObtenerArchivosActorRepository(id),
	eliminarActorRepository: (args: unknown) => mockEliminarActorRepository(args),
	transferirTitularidadRepository: (args: unknown) => mockTransferirTitularidadRepository(args),
	renunciarIntegranteRepository: (args: unknown) => mockRenunciarIntegranteRepository(args),
}));

vi.mock('../src/modules/usuario/usuario-files.service.js', () => ({
	eliminarArchivosPersonalesUsuario: (archivos: unknown) => mockEliminarArchivosPersonalesUsuario(archivos),
}));

describe('eliminarActorService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('obtiene los archivos del actor y los elimina físicamente del disco tras borrar el actor de la BD', async () => {
		const archivosMock = [
			{
				tipo: 'ACTOR_PERFIL' as const,
				url: 'https://mosaico.example/uploads/actores/perfil_1_aabbccddeeff.webp',
			},
			{
				tipo: 'ACTOR_PORTAFOLIO' as const,
				url: 'https://mosaico.example/uploads/actores/portafolio_1_112233aabbcc.jpg',
			},
		];

		mockObtenerArchivosActorRepository.mockResolvedValueOnce(archivosMock);
		mockEliminarActorRepository.mockResolvedValueOnce(undefined);
		mockEliminarArchivosPersonalesUsuario.mockReturnValueOnce({
			eliminados: 2,
			noEncontrados: 0,
			omitidos: 0,
			fallidos: 0,
		});

		await eliminarActorService({
			idUsuario: 10,
			idActor: 5,
			userRol: 'USUARIO',
		});

		expect(mockObtenerArchivosActorRepository).toHaveBeenCalledWith(5);
		expect(mockEliminarActorRepository).toHaveBeenCalledWith({
			idUsuario: 10,
			idActor: 5,
			esAdmin: false,
		});
		expect(mockEliminarArchivosPersonalesUsuario).toHaveBeenCalledWith(archivosMock);
	});

	it('no invoca eliminación de archivos si el actor no tenía imágenes registradas', async () => {
		mockObtenerArchivosActorRepository.mockResolvedValueOnce([]);
		mockEliminarActorRepository.mockResolvedValueOnce(undefined);

		await eliminarActorService({
			idUsuario: 10,
			idActor: 5,
			userRol: 'ADMIN',
		});

		expect(mockObtenerArchivosActorRepository).toHaveBeenCalledWith(5);
		expect(mockEliminarActorRepository).toHaveBeenCalledWith({
			idUsuario: 10,
			idActor: 5,
			esAdmin: true,
		});
		expect(mockEliminarArchivosPersonalesUsuario).not.toHaveBeenCalled();
	});
});

describe('transferirTitularidadService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('llama al repositorio de transferencia con los parámetros correctos', async () => {
		mockTransferirTitularidadRepository.mockResolvedValueOnce(undefined);

		await transferirTitularidadService({
			idUsuario: 1,
			idActor: 5,
			idNuevoTitular: 2,
		});

		expect(mockTransferirTitularidadRepository).toHaveBeenCalledWith({
			idUsuario: 1,
			idActor: 5,
			idNuevoTitular: 2,
		});
	});
});

describe('renunciarIntegranteService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('llama al repositorio de renuncia con los parámetros correctos', async () => {
		mockRenunciarIntegranteRepository.mockResolvedValueOnce(undefined);

		await renunciarIntegranteService({
			idUsuario: 2,
			idActor: 5,
		});

		expect(mockRenunciarIntegranteRepository).toHaveBeenCalledWith({
			idUsuario: 2,
			idActor: 5,
		});
	});
});
