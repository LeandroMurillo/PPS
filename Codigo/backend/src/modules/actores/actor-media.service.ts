import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { env } from '../../config/env.js';

const DATA_URL_PATTERN = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=\r\n]+)$/;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export type SavedActorImage = {
	url: string;
	filePath: string;
};

export function saveActorImage(base64Data: string, prefix: 'perfil' | 'portafolio'): SavedActorImage {
	const match = DATA_URL_PATTERN.exec(base64Data);
	if (!match?.[1] || !match[2]) {
		throw new Error('La imagen debe estar en formato JPG, PNG o WebP.');
	}

	const buffer = Buffer.from(match[2], 'base64');
	if (buffer.length === 0 || buffer.length > MAX_IMAGE_BYTES) {
		throw new Error('Cada imagen debe pesar entre 1 byte y 5 MB.');
	}

	const extension = match[1] === 'jpeg' ? 'jpg' : match[1];
	const uploadsDir = path.join(process.cwd(), 'uploads', 'actores');
	fs.mkdirSync(uploadsDir, { recursive: true });

	const fileName = `${prefix}_${Date.now()}_${crypto.randomBytes(6).toString('hex')}.${extension}`;
	const filePath = path.join(uploadsDir, fileName);
	fs.writeFileSync(filePath, buffer, { flag: 'wx' });

	return {
		url: `${env.PUBLIC_BASE_URL.replace(/\/$/, '')}/uploads/actores/${fileName}`,
		filePath,
	};
}

export function removeSavedActorImages(images: SavedActorImage[]): void {
	for (const image of images) {
		try {
			fs.rmSync(image.filePath, { force: true });
		} catch {
			// A failed cleanup must not hide the original persistence error.
		}
	}
}
