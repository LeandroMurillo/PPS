import fs from 'node:fs';
import path from 'node:path';

import { env } from '../../config/env.js';
import { logger } from '../../shared/logger.js';
import type { ArchivoPersonalUsuario } from './usuario.repository.js';

export type PersonalFilesDeletionResult = {
	eliminados: number;
	noEncontrados: number;
	omitidos: number;
	fallidos: number;
};

type PersonalFilesDeletionOptions = {
	uploadsRoot?: string;
	publicBaseUrl?: string;
};

const FILE_PATTERNS: Record<ArchivoPersonalUsuario['tipo'], RegExp> = {
	DNI: /^dni_\d+_[a-f0-9]{8}\.[A-Za-z0-9]+$/,
	ACTOR_PERFIL: /^perfil_\d+_[a-f0-9]{12}\.(?:jpg|png|webp)$/,
	ACTOR_PORTAFOLIO: /^portafolio_\d+_[a-f0-9]{12}\.(?:jpg|png|webp)$/,
};

const FILE_DIRECTORIES: Record<ArchivoPersonalUsuario['tipo'], 'dni' | 'actores'> = {
	DNI: 'dni',
	ACTOR_PERFIL: 'actores',
	ACTOR_PORTAFOLIO: 'actores',
};

export function eliminarArchivosPersonalesUsuario(
	archivos: ArchivoPersonalUsuario[],
	options: PersonalFilesDeletionOptions = {},
): PersonalFilesDeletionResult {
	const uploadsRoot = path.resolve(options.uploadsRoot ?? path.join(process.cwd(), 'uploads'));
	const publicBaseUrl = options.publicBaseUrl ?? env.PUBLIC_BASE_URL;
	const processedPaths = new Set<string>();
	const result: PersonalFilesDeletionResult = { eliminados: 0, noEncontrados: 0, omitidos: 0, fallidos: 0 };

	for (const archivo of archivos) {
		const filePath = resolveManagedPersonalFile(archivo, uploadsRoot, publicBaseUrl);
		if (!filePath || processedPaths.has(filePath)) {
			result.omitidos += 1;
			continue;
		}
		processedPaths.add(filePath);

		try {
			if (!fs.existsSync(filePath)) {
				result.noEncontrados += 1;
				continue;
			}

			fs.rmSync(filePath, { force: true });
			result.eliminados += 1;
		} catch (error) {
			result.fallidos += 1;
			logger.error({ err: error, filePath }, 'No se pudo eliminar físicamente un archivo personal');
		}
	}

	return result;
}

function resolveManagedPersonalFile(
	archivo: ArchivoPersonalUsuario,
	uploadsRoot: string,
	publicBaseUrl: string,
): string | null {
	let pathname: string;
	try {
		if (/^https?:\/\//i.test(archivo.url)) {
			const fileUrl = new URL(archivo.url);
			if (fileUrl.origin !== new URL(publicBaseUrl).origin) return null;
			pathname = fileUrl.pathname;
		} else {
			pathname = archivo.url.split(/[?#]/, 1)[0] ?? '';
		}
	} catch {
		return null;
	}

	const match = /^\/uploads\/(dni|actores)\/([^/%\\]+)$/.exec(pathname);
	if (!match?.[1] || !match[2]) return null;

	const expectedDirectory = FILE_DIRECTORIES[archivo.tipo];
	if (match[1] !== expectedDirectory || !FILE_PATTERNS[archivo.tipo].test(match[2])) return null;

	const directory = path.resolve(uploadsRoot, expectedDirectory);
	const filePath = path.resolve(directory, match[2]);
	return path.dirname(filePath) === directory ? filePath : null;
}
