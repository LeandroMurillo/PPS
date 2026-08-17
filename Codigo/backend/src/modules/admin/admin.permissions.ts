type AdministrativeRole = 'USUARIO' | 'MODERADOR' | 'ADMIN';

export type UserStateChangeBlockReason = 'SELF' | 'ADMIN_TARGET' | 'MODERATOR_TARGET' | null;

export function getUserStateChangeBlockReason(input: {
	requesterId: number;
	requesterRole: AdministrativeRole;
	targetId: number;
	targetRole: AdministrativeRole;
}): UserStateChangeBlockReason {
	if (input.requesterId === input.targetId) {
		return 'SELF';
	}

	if (input.targetRole === 'ADMIN') {
		return 'ADMIN_TARGET';
	}

	if (input.requesterRole === 'MODERADOR' && input.targetRole === 'MODERADOR') {
		return 'MODERATOR_TARGET';
	}

	return null;
}
