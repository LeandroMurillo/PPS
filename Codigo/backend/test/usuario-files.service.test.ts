import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { eliminarArchivosPersonalesUsuario } from '../src/modules/usuario/usuario-files.service.js';

const temporaryRoots: string[] = [];

afterEach(() => {
	for (const root of temporaryRoots.splice(0)) {
		fs.rmSync(root, { recursive: true, force: true });
	}
});

describe('eliminación física de archivos personales', () => {
	it('elimina únicamente archivos administrados y pertenecientes al manifiesto', () => {
		const uploadsRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'mosaico-uploads-'));
		temporaryRoots.push(uploadsRoot);
		fs.mkdirSync(path.join(uploadsRoot, 'dni'));
		fs.mkdirSync(path.join(uploadsRoot, 'actores'));

		const dniFile = path.join(uploadsRoot, 'dni', 'dni_1700000000000_deadbeef.png');
		const profileFile = path.join(uploadsRoot, 'actores', 'perfil_1700000000000_aabbccddeeff.webp');
		const portfolioFile = path.join(uploadsRoot, 'actores', 'portafolio_1700000000000_112233aabbcc.jpg');
		fs.writeFileSync(dniFile, 'dni');
		fs.writeFileSync(profileFile, 'profile');
		fs.writeFileSync(portfolioFile, 'portfolio');

		const result = eliminarArchivosPersonalesUsuario(
			[
				{ tipo: 'DNI', url: '/uploads/dni/dni_1700000000000_deadbeef.png' },
				{
					tipo: 'ACTOR_PERFIL',
					url: 'https://mosaico.example/uploads/actores/perfil_1700000000000_aabbccddeeff.webp',
				},
				{
					tipo: 'ACTOR_PORTAFOLIO',
					url: 'https://mosaico.example/uploads/actores/portafolio_1700000000000_112233aabbcc.jpg',
				},
			],
			{ uploadsRoot, publicBaseUrl: 'https://mosaico.example' },
		);

		expect(result).toEqual({ eliminados: 3, noEncontrados: 0, omitidos: 0, fallidos: 0 });
		expect(fs.existsSync(dniFile)).toBe(false);
		expect(fs.existsSync(profileFile)).toBe(false);
		expect(fs.existsSync(portfolioFile)).toBe(false);
	});

	it('omite URLs externas, rutas manipuladas y nombres que no genera la aplicación', () => {
		const uploadsRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'mosaico-uploads-'));
		temporaryRoots.push(uploadsRoot);

		const result = eliminarArchivosPersonalesUsuario(
			[
				{ tipo: 'ACTOR_PERFIL', url: 'https://externo.example/uploads/actores/perfil_1_aabbccddeeff.png' },
				{ tipo: 'DNI', url: '/uploads/dni/../secreto.txt' },
				{ tipo: 'DNI', url: '/uploads/dni/archivo-arbitrario.png' },
			],
			{ uploadsRoot, publicBaseUrl: 'https://mosaico.example' },
		);

		expect(result).toEqual({ eliminados: 0, noEncontrados: 0, omitidos: 3, fallidos: 0 });
	});
});
