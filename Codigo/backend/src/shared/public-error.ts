type DatabaseError = Error & {
	errno?: unknown;
	sqlState?: unknown;
	sqlMessage?: unknown;
};

const DATABASE_DETAILS_PATTERN = /\b(?:conn:\s*\d+|SQLState:|sql:\s|parameters?:)/i;

/**
 * Devuelve un mensaje apto para mostrar al usuario sin exponer consultas,
 * parámetros ni información de la conexión a la base de datos.
 */
export function getPublicErrorMessage(error: unknown, fallback: string): string {
	if (!(error instanceof Error)) {
		return fallback;
	}

	const databaseError = error as DatabaseError;
	const isBusinessDatabaseError =
		Number(databaseError.errno) === 1644 ||
		databaseError.sqlState === '45000' ||
		/\bno:\s*1644\b[\s\S]*\bSQLState:\s*45000\b/i.test(error.message);

	if (isBusinessDatabaseError) {
		if (typeof databaseError.sqlMessage === 'string' && databaseError.sqlMessage.trim()) {
			return databaseError.sqlMessage.trim();
		}

		const match = error.message.match(/SQLState:\s*45000\)\s*([\s\S]*?)(?:\s+sql:\s|$)/i);
		if (match?.[1]?.trim()) {
			return match[1].trim();
		}
	}

	if (DATABASE_DETAILS_PATTERN.test(error.message)) {
		return fallback;
	}

	return error.message.trim() || fallback;
}
