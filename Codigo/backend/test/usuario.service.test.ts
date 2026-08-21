import { describe, expect, it, vi } from 'vitest';

import { eliminarCuentaUsuarioService } from '../src/modules/usuario/usuario.service.js';

const mockDeleteFirebaseUser = vi.fn();
const mockObtenerPerfilUsuarioRepository = vi.fn();
const mockEliminarCuentaUsuarioRepository = vi.fn();
const mockEliminarArchivosPersonalesUsuario = vi.fn();

vi.mock('../src/config/firebase-admin.js', () => ({
	deleteFirebaseUser: (uid: string) => mockDeleteFirebaseUser(uid),
}));

vi.mock('../src/modules/usuario/usuario.repository.js', () => ({
	obtenerPerfilUsuarioRepository: (id: number) => mockObtenerPerfilUsuarioRepository(id),
	eliminarCuentaUsuarioRepository: (id: number) => mockEliminarCuentaUsuarioRepository(id),
	actualizarPerfilUsuarioRepository: vi.fn(),
}));

vi.mock('../src/modules/usuario/usuario-files.service.js', () => ({
	eliminarArchivosPersonalesUsuario: (archivos: unknown) => mockEliminarArchivosPersonalesUsuario(archivos),
}));

describe('eliminarCuentaUsuarioService', () => {
	it('lanza error y no elimina al usuario si tiene rol ADMIN', async () => {
		mockObtenerPerfilUsuarioRepository.mockResolvedValueOnce({
			idUsuario: 1,
			firebaseUid: 'admin-uid-123',
			rol: 'ADMIN',
			nombre: 'Admin',
			apellido: 'User',
			email: 'admin@example.com',
		});

		await expect(eliminarCuentaUsuarioService(1)).rejects.toThrow('ADMIN_NO_PUEDE_ELIMINAR_CUENTA');

		expect(mockDeleteFirebaseUser).not.toHaveBeenCalled();
		expect(mockEliminarCuentaUsuarioRepository).not.toHaveBeenCalled();
	});

	it('elimina cuenta correctamente si el usuario tiene rol USUARIO', async () => {
		mockObtenerPerfilUsuarioRepository.mockResolvedValueOnce({
			idUsuario: 2,
			firebaseUid: 'user-uid-456',
			rol: 'USUARIO',
			nombre: 'Normal',
			apellido: 'User',
			email: 'user@example.com',
		});
		mockEliminarCuentaUsuarioRepository.mockResolvedValueOnce({
			actoresEliminadosCount: 1,
			archivos: [],
		});
		mockEliminarArchivosPersonalesUsuario.mockReturnValueOnce({
			eliminados: 0,
			noEncontrados: 0,
			omitidos: 0,
			fallidos: 0,
		});

		const result = await eliminarCuentaUsuarioService(2);

		expect(mockDeleteFirebaseUser).toHaveBeenCalledWith('user-uid-456');
		expect(mockEliminarCuentaUsuarioRepository).toHaveBeenCalledWith(2);
		expect(result.actoresEliminadosCount).toBe(1);
	});
});
