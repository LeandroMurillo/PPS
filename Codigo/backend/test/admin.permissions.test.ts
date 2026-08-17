import { describe, expect, it } from 'vitest';

import { getUserStateChangeBlockReason } from '../src/modules/admin/admin.permissions.js';

describe('permisos para cambiar el estado de usuarios', () => {
	it.each([
		['MODERADOR', 'USUARIO', null],
		['MODERADOR', 'MODERADOR', 'MODERATOR_TARGET'],
		['MODERADOR', 'ADMIN', 'ADMIN_TARGET'],
		['ADMIN', 'USUARIO', null],
		['ADMIN', 'MODERADOR', null],
		['ADMIN', 'ADMIN', 'ADMIN_TARGET'],
	] as const)('solicitante %s y destino %s produce %s', (requesterRole, targetRole, expected) => {
		expect(
			getUserStateChangeBlockReason({
				requesterId: 1,
				requesterRole,
				targetId: 2,
				targetRole,
			}),
		).toBe(expected);
	});

	it('protege la cuenta propia antes que cualquier otra regla', () => {
		expect(
			getUserStateChangeBlockReason({
				requesterId: 1,
				requesterRole: 'MODERADOR',
				targetId: 1,
				targetRole: 'MODERADOR',
			}),
		).toBe('SELF');
	});
});
