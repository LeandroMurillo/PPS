USE cultura;

SET SESSION group_concat_max_len = 100000;

SELECT
	r.ROUTINE_NAME AS `stored procedure`,
	CASE
		WHEN r.ROUTINE_COMMENT IS NULL
		OR r.ROUTINE_COMMENT = '' THEN 'Sin descripción'
		ELSE TRIM(
			REPLACE (
					REPLACE (
							REPLACE (
									r.ROUTINE_COMMENT,
									CHAR(13),
									' '
								),
								CHAR(10),
								' '
						),
						CHAR(9),
						' '
				)
		)
	END AS descripcion,
	COALESCE(
		p.parametros_entrada,
		'Sin parámetros de entrada'
	) AS parametros_entrada
FROM information_schema.ROUTINES r
	LEFT JOIN (
		SELECT
			SPECIFIC_SCHEMA, SPECIFIC_NAME, GROUP_CONCAT(
				CASE
					WHEN PARAMETER_MODE IN ('IN', 'INOUT') THEN CONCAT(
						PARAMETER_NAME, ' ', DTD_IDENTIFIER
					)
				END
				ORDER BY ORDINAL_POSITION SEPARATOR ' | '
			) AS parametros_entrada
		FROM information_schema.PARAMETERS
		WHERE
			SPECIFIC_SCHEMA = DATABASE()
		GROUP BY
			SPECIFIC_SCHEMA, SPECIFIC_NAME
	) p ON p.SPECIFIC_SCHEMA = r.ROUTINE_SCHEMA
	AND p.SPECIFIC_NAME = r.SPECIFIC_NAME
WHERE
	r.ROUTINE_SCHEMA = DATABASE()
	AND r.ROUTINE_TYPE = 'PROCEDURE'
ORDER BY r.ROUTINE_NAME;