import jwt, { type JwtPayload } from 'jsonwebtoken';

import { env } from '../../config/env.js';

export const TOKEN_ISSUER = 'mosaico-cultural-api';
export const TOKEN_AUDIENCE = 'mosaico-cultural-client';

export function createSessionToken(idUsuario: number): string {
	return jwt.sign({}, env.JWT_SECRET, {
		subject: String(idUsuario),
		issuer: TOKEN_ISSUER,
		audience: TOKEN_AUDIENCE,
		expiresIn: env.JWT_EXPIRES_IN_SECONDS,
	});
}

export function verifySessionToken(token: string): number {
	const payload = jwt.verify(token, env.JWT_SECRET, {
		issuer: TOKEN_ISSUER,
		audience: TOKEN_AUDIENCE,
	});

	if (typeof payload === 'string') {
		throw new Error('INVALID_TOKEN_PAYLOAD');
	}

	return getUserIdFromPayload(payload);
}

function getUserIdFromPayload(payload: JwtPayload): number {
	if (typeof payload.sub !== 'string' || !/^\d+$/.test(payload.sub)) {
		throw new Error('INVALID_TOKEN_SUBJECT');
	}

	const idUsuario = Number(payload.sub);
	if (!Number.isSafeInteger(idUsuario) || idUsuario <= 0) {
		throw new Error('INVALID_TOKEN_SUBJECT');
	}

	return idUsuario;
}
