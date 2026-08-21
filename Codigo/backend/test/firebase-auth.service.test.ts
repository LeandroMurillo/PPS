import { beforeEach, describe, expect, it, vi } from 'vitest';

const obtenerUsuarioPorIdFirebaseRepositoryMock = vi.hoisted(() => vi.fn());

vi.mock('../src/modules/auth/auth.repository.js', () => ({
	obtenerUsuarioPorIdFirebaseRepository: obtenerUsuarioPorIdFirebaseRepositoryMock,
	registrarUsuarioRepository: vi.fn(),
	listarActividadesArcaRepository: vi.fn(),
}));

import { crearSesionFirebaseService } from '../src/modules/auth/auth.service.js';
import { verifySessionToken } from '../src/modules/auth/session-token.js';

const identity = {
	uid: 'firebase-uid-123',
	email: 'persona@example.com',
	emailVerified: true,
};

const activeUser = {
	idUsuario: 42,
	nombre: 'María',
	apellido: 'González',
	email: identity.email,
	genero: 'F' as const,
	fechaNacimiento: '1992-08-15',
	nacionalidad: 'Argentina',
	CUIL: '27359998886',
	actividadesArcaCodigo: null,
	fotoDniUrl: null,
	rol: 'USUARIO' as const,
	estado: 'A' as const,
	fechaRegistro: '2026-08-18T12:00:00.000Z',
};

describe('sesión interna basada en Firebase', () => {
	beforeEach(() => {
		obtenerUsuarioPorIdFirebaseRepositoryMock.mockReset();
	});

	it('rechaza identidades cuyo correo no está verificado', async () => {
		await expect(crearSesionFirebaseService({ ...identity, emailVerified: false })).rejects.toThrow(
			'EMAIL_NOT_VERIFIED',
		);
		expect(obtenerUsuarioPorIdFirebaseRepositoryMock).not.toHaveBeenCalled();
	});

	it('informa que falta completar el perfil cuando el UID no existe', async () => {
		obtenerUsuarioPorIdFirebaseRepositoryMock.mockResolvedValue(null);

		await expect(crearSesionFirebaseService(identity)).rejects.toThrow('PROFILE_INCOMPLETE');
		expect(obtenerUsuarioPorIdFirebaseRepositoryMock).toHaveBeenCalledWith(identity.uid);
	});

	it('mantiene la aprobación administrativa como requisito', async () => {
		obtenerUsuarioPorIdFirebaseRepositoryMock.mockResolvedValue({ ...activeUser, estado: 'P' });

		await expect(crearSesionFirebaseService(identity)).rejects.toThrow('ACCOUNT_PENDING');
	});

	it('emite el JWT interno sólo para una identidad verificada y activa', async () => {
		obtenerUsuarioPorIdFirebaseRepositoryMock.mockResolvedValue(activeUser);

		const result = await crearSesionFirebaseService(identity);

		expect(result.usuario).toEqual(activeUser);
		expect(verifySessionToken(result.token)).toBe(activeUser.idUsuario);
	});
});
