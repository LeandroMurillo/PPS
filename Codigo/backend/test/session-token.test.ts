import jwt, { type JwtPayload } from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';

import { env } from '../src/config/env.js';
import { createSessionToken, verifySessionToken } from '../src/modules/auth/session-token.js';

describe('token de sesión', () => {
	it('incorpora subject, issuer, audience y los tiempos estándar', () => {
		const token = createSessionToken(42);
		const payload = jwt.decode(token) as JwtPayload;

		expect(payload.sub).toBe('42');
		expect(payload.iss).toBe('mosaico-cultural-api');
		expect(payload.aud).toBe('mosaico-cultural-client');
		expect(payload.exp! - payload.iat!).toBe(env.JWT_EXPIRES_IN_SECONDS);
		expect(payload).not.toHaveProperty('idUsuario');
		expect(payload).not.toHaveProperty('email');
		expect(payload).not.toHaveProperty('rol');
		expect(payload).not.toHaveProperty('estado');
		expect(verifySessionToken(token)).toBe(42);
	});

	it('rechaza tokens con issuer o audience inválidos', () => {
		const invalidIssToken = jwt.sign({}, env.JWT_SECRET, {
			subject: '42',
			issuer: 'otro-emisor',
			audience: 'mosaico-cultural-client',
		});
		expect(() => verifySessionToken(invalidIssToken)).toThrow();

		const invalidAudToken = jwt.sign({}, env.JWT_SECRET, {
			subject: '42',
			issuer: 'mosaico-cultural-api',
			audience: 'otra-audiencia',
		});
		expect(() => verifySessionToken(invalidAudToken)).toThrow();
	});
});
