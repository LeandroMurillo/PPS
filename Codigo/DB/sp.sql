-- ================================================================
-- Mosaico Cultural
-- Base de datos: cultura v1.0.2
-- Autores: Cesar Ezequiel Herrera, Leandro Murillo
-- ================================================================

USE `cultura`;

SET NAMES utf8mb4;

DELIMITER //

DROP PROCEDURE IF EXISTS sp_admin_listar_usuarios //

CREATE PROCEDURE sp_admin_listar_usuarios(
	IN pBusqueda VARCHAR(255),
	IN pRol VARCHAR(20),
	IN pEstado CHAR(1),
	IN pLimit INT,
	IN pOffset INT,
	IN pSortBy VARCHAR(50),
	IN pSortDir VARCHAR(4)
)
COMMENT 'Lista usuarios para administración aplicando búsqueda, filtros opcionales por rol y estado, ordenamiento controlado y paginación. Devuelve: total de coincidencias y página de usuarios.'
BEGIN
	DECLARE vLimit INT DEFAULT 25;
	DECLARE vOffset INT DEFAULT 0;
	DECLARE vSortBy VARCHAR(50) DEFAULT 'idUsuario';
	DECLARE vSortDir VARCHAR(4) DEFAULT 'ASC';

	SET vLimit = LEAST(GREATEST(COALESCE(pLimit, 25), 1), 100);
	SET vOffset = GREATEST(COALESCE(pOffset, 0), 0);

	SET vSortBy = CASE
		WHEN pSortBy IN (
			'idUsuario',
			'nombre',
			'apellido',
			'dni',
			'email',
			'rol',
			'estado',
			'fechaRegistro'
		)
		THEN pSortBy
		ELSE 'idUsuario'
	END;

	SET vSortDir = CASE
		WHEN UPPER(pSortDir) = 'DESC' THEN 'DESC'
		ELSE 'ASC'
	END;

	SELECT COUNT(*) AS total
	FROM Usuarios u
	WHERE
		(
			pBusqueda IS NULL
			OR pBusqueda = ''
			OR u.nombre LIKE CONCAT('%', pBusqueda, '%')
			OR u.apellido LIKE CONCAT('%', pBusqueda, '%')
			OR u.email LIKE CONCAT('%', pBusqueda, '%')
			OR u.dni LIKE CONCAT('%', pBusqueda, '%')
		)
		AND (
			pRol IS NULL
			OR pRol = ''
			OR u.rol = pRol
		)
		AND (
			pEstado IS NULL
			OR pEstado = ''
			OR u.estado = pEstado
		);

	SELECT
		u.idUsuario,
		u.nombre,
		u.apellido,
		u.dni,
		u.genero,
		u.fechaNacimiento,
		u.email,
		u.fechaRegistro,
		u.rol,
		u.estado
	FROM Usuarios u
	WHERE
		(
			pBusqueda IS NULL
			OR pBusqueda = ''
			OR u.nombre LIKE CONCAT('%', pBusqueda, '%')
			OR u.apellido LIKE CONCAT('%', pBusqueda, '%')
			OR u.email LIKE CONCAT('%', pBusqueda, '%')
			OR u.dni LIKE CONCAT('%', pBusqueda, '%')
		)
		AND (
			pRol IS NULL
			OR pRol = ''
			OR u.rol = pRol
		)
		AND (
			pEstado IS NULL
			OR pEstado = ''
			OR u.estado = pEstado
		)
	ORDER BY
		CASE WHEN vSortBy = 'idUsuario' AND vSortDir = 'ASC' THEN u.idUsuario END ASC,
		CASE WHEN vSortBy = 'idUsuario' AND vSortDir = 'DESC' THEN u.idUsuario END DESC,

		CASE WHEN vSortBy = 'nombre' AND vSortDir = 'ASC' THEN u.nombre END ASC,
		CASE WHEN vSortBy = 'nombre' AND vSortDir = 'DESC' THEN u.nombre END DESC,

		CASE WHEN vSortBy = 'apellido' AND vSortDir = 'ASC' THEN u.apellido END ASC,
		CASE WHEN vSortBy = 'apellido' AND vSortDir = 'DESC' THEN u.apellido END DESC,

		CASE WHEN vSortBy = 'dni' AND vSortDir = 'ASC' THEN u.dni END ASC,
		CASE WHEN vSortBy = 'dni' AND vSortDir = 'DESC' THEN u.dni END DESC,

		CASE WHEN vSortBy = 'email' AND vSortDir = 'ASC' THEN u.email END ASC,
		CASE WHEN vSortBy = 'email' AND vSortDir = 'DESC' THEN u.email END DESC,

		CASE WHEN vSortBy = 'rol' AND vSortDir = 'ASC' THEN u.rol END ASC,
		CASE WHEN vSortBy = 'rol' AND vSortDir = 'DESC' THEN u.rol END DESC,

		CASE WHEN vSortBy = 'estado' AND vSortDir = 'ASC' THEN u.estado END ASC,
		CASE WHEN vSortBy = 'estado' AND vSortDir = 'DESC' THEN u.estado END DESC,

		CASE WHEN vSortBy = 'fechaRegistro' AND vSortDir = 'ASC' THEN u.fechaRegistro END ASC,
		CASE WHEN vSortBy = 'fechaRegistro' AND vSortDir = 'DESC' THEN u.fechaRegistro END DESC,

		u.idUsuario ASC
	LIMIT vLimit OFFSET vOffset;
END//

DROP PROCEDURE IF EXISTS sp_admin_listar_actores //

CREATE PROCEDURE sp_admin_listar_actores(
	IN pBusqueda VARCHAR(255),
	IN pIdCategoria INT,
	IN pIdUsuarioDueno INT,
	IN pLimit INT,
	IN pOffset INT,
	IN pSortBy VARCHAR(50),
	IN pSortDir VARCHAR(4)
)
COMMENT 'Lista actores culturales para administración aplicando búsqueda, filtros opcionales por categoría y usuario dueño, ordenamiento controlado y paginación. Devuelve: total de coincidencias y página de actores.'
BEGIN
	DECLARE vLimit INT DEFAULT 25;
	DECLARE vOffset INT DEFAULT 0;
	DECLARE vSortBy VARCHAR(50) DEFAULT 'idActor';
	DECLARE vSortDir VARCHAR(4) DEFAULT 'ASC';

	SET vLimit = LEAST(GREATEST(COALESCE(pLimit, 25), 1), 100);
	SET vOffset = GREATEST(COALESCE(pOffset, 0), 0);

	SET vSortBy = CASE
		WHEN pSortBy IN (
			'idActor',
			'nombre',
			'cuit',
			'tipoActor',
			'fechaCreacion',
			'categoria',
			'usuarioDueno',
			'departamento',
			'localidad'
		)
		THEN pSortBy
		ELSE 'idActor'
	END;

	SET vSortDir = CASE
		WHEN UPPER(pSortDir) = 'DESC' THEN 'DESC'
		ELSE 'ASC'
	END;

	SELECT COUNT(*) AS total
	FROM Actores a
	INNER JOIN Categorias c
		ON c.idCategoria = a.idCategoria
	INNER JOIN Usuarios u
		ON u.idUsuario = a.`idUsuarioDueño`
	INNER JOIN Ubicaciones ub
		ON ub.idUbicacion = a.idUbicacion
	WHERE
		(
			pBusqueda IS NULL
			OR pBusqueda = ''
			OR a.nombre LIKE CONCAT('%', pBusqueda, '%')
			OR a.cuit LIKE CONCAT('%', pBusqueda, '%')
			OR a.tipoActor LIKE CONCAT('%', pBusqueda, '%')
			OR c.nombre LIKE CONCAT('%', pBusqueda, '%')
			OR u.nombre LIKE CONCAT('%', pBusqueda, '%')
			OR u.apellido LIKE CONCAT('%', pBusqueda, '%')
			OR u.email LIKE CONCAT('%', pBusqueda, '%')
			OR ub.departamento LIKE CONCAT('%', pBusqueda, '%')
			OR ub.localidad LIKE CONCAT('%', pBusqueda, '%')
			OR ub.direccion LIKE CONCAT('%', pBusqueda, '%')
		)
		AND (
			pIdCategoria IS NULL
			OR a.idCategoria = pIdCategoria
		)
		AND (
			pIdUsuarioDueno IS NULL
			OR a.`idUsuarioDueño` = pIdUsuarioDueno
		);

	SELECT
		a.idActor,
		a.nombre AS nombreActor,
		a.cuit,
		a.tipoActor,
		a.fechaCreacion,

		c.idCategoria,
		c.nombre AS categoria,

		u.idUsuario AS idUsuarioDueno,
		CONCAT(u.nombre, ' ', u.apellido) AS usuarioDueno,
		u.email AS emailUsuarioDueno,

		ub.idUbicacion,
		ub.provincia,
		ub.departamento,
		ub.localidad,
		ub.direccion,
		ub.latitud,
		ub.longitud,
		ub.esPublica
	FROM Actores a
	INNER JOIN Categorias c
		ON c.idCategoria = a.idCategoria
	INNER JOIN Usuarios u
		ON u.idUsuario = a.`idUsuarioDueño`
	INNER JOIN Ubicaciones ub
		ON ub.idUbicacion = a.idUbicacion
	WHERE
		(
			pBusqueda IS NULL
			OR pBusqueda = ''
			OR a.nombre LIKE CONCAT('%', pBusqueda, '%')
			OR a.cuit LIKE CONCAT('%', pBusqueda, '%')
			OR a.tipoActor LIKE CONCAT('%', pBusqueda, '%')
			OR c.nombre LIKE CONCAT('%', pBusqueda, '%')
			OR u.nombre LIKE CONCAT('%', pBusqueda, '%')
			OR u.apellido LIKE CONCAT('%', pBusqueda, '%')
			OR u.email LIKE CONCAT('%', pBusqueda, '%')
			OR ub.departamento LIKE CONCAT('%', pBusqueda, '%')
			OR ub.localidad LIKE CONCAT('%', pBusqueda, '%')
			OR ub.direccion LIKE CONCAT('%', pBusqueda, '%')
		)
		AND (
			pIdCategoria IS NULL
			OR a.idCategoria = pIdCategoria
		)
		AND (
			pIdUsuarioDueno IS NULL
			OR a.`idUsuarioDueño` = pIdUsuarioDueno
		)
	ORDER BY
		CASE WHEN vSortBy = 'idActor' AND vSortDir = 'ASC' THEN a.idActor END ASC,
		CASE WHEN vSortBy = 'idActor' AND vSortDir = 'DESC' THEN a.idActor END DESC,

		CASE WHEN vSortBy = 'nombre' AND vSortDir = 'ASC' THEN a.nombre END ASC,
		CASE WHEN vSortBy = 'nombre' AND vSortDir = 'DESC' THEN a.nombre END DESC,

		CASE WHEN vSortBy = 'cuit' AND vSortDir = 'ASC' THEN a.cuit END ASC,
		CASE WHEN vSortBy = 'cuit' AND vSortDir = 'DESC' THEN a.cuit END DESC,

		CASE WHEN vSortBy = 'tipoActor' AND vSortDir = 'ASC' THEN a.tipoActor END ASC,
		CASE WHEN vSortBy = 'tipoActor' AND vSortDir = 'DESC' THEN a.tipoActor END DESC,

		CASE WHEN vSortBy = 'fechaCreacion' AND vSortDir = 'ASC' THEN a.fechaCreacion END ASC,
		CASE WHEN vSortBy = 'fechaCreacion' AND vSortDir = 'DESC' THEN a.fechaCreacion END DESC,

		CASE WHEN vSortBy = 'categoria' AND vSortDir = 'ASC' THEN c.nombre END ASC,
		CASE WHEN vSortBy = 'categoria' AND vSortDir = 'DESC' THEN c.nombre END DESC,

		CASE WHEN vSortBy = 'usuarioDueno' AND vSortDir = 'ASC' THEN CONCAT(u.nombre, ' ', u.apellido) END ASC,
		CASE WHEN vSortBy = 'usuarioDueno' AND vSortDir = 'DESC' THEN CONCAT(u.nombre, ' ', u.apellido) END DESC,

		CASE WHEN vSortBy = 'departamento' AND vSortDir = 'ASC' THEN ub.departamento END ASC,
		CASE WHEN vSortBy = 'departamento' AND vSortDir = 'DESC' THEN ub.departamento END DESC,

		CASE WHEN vSortBy = 'localidad' AND vSortDir = 'ASC' THEN ub.localidad END ASC,
		CASE WHEN vSortBy = 'localidad' AND vSortDir = 'DESC' THEN ub.localidad END DESC,

		a.idActor ASC
	LIMIT vLimit OFFSET vOffset;
END//

DROP PROCEDURE IF EXISTS sp_admin_listar_eventos //

CREATE PROCEDURE sp_admin_listar_eventos(
	IN pBusqueda VARCHAR(255),
	IN pEstado CHAR(1),
	IN pTipo VARCHAR(45),
	IN pLimit INT,
	IN pOffset INT,
	IN pSortBy VARCHAR(50),
	IN pSortDir VARCHAR(4)
)
COMMENT 'Lista eventos para administración aplicando búsqueda, filtros opcionales por estado y tipo, ordenamiento controlado y paginación. Devuelve: total de coincidencias y página de eventos.'
BEGIN
	DECLARE vLimit INT DEFAULT 25;
	DECLARE vOffset INT DEFAULT 0;
	DECLARE vSortBy VARCHAR(50) DEFAULT 'idEvento';
	DECLARE vSortDir VARCHAR(4) DEFAULT 'ASC';

	SET vLimit = LEAST(GREATEST(COALESCE(pLimit, 25), 1), 100);
	SET vOffset = GREATEST(COALESCE(pOffset, 0), 0);

	SET vSortBy = CASE
		WHEN pSortBy IN (
			'idEvento',
			'nombre',
			'tipo',
			'estado',
			'fechaInicio',
			'fechaFin',
			'fechaCreacion',
			'departamento',
			'localidad',
			'cantidadActores'
		)
		THEN pSortBy
		ELSE 'idEvento'
	END;

	SET vSortDir = CASE
		WHEN UPPER(pSortDir) = 'DESC' THEN 'DESC'
		ELSE 'ASC'
	END;

	SELECT COUNT(*) AS total
	FROM Eventos e
	INNER JOIN Ubicaciones ub
		ON ub.idUbicacion = e.idUbicacion
	WHERE
		(
			pBusqueda IS NULL
			OR pBusqueda = ''
			OR e.nombre LIKE CONCAT('%', pBusqueda, '%')
			OR e.descripcion LIKE CONCAT('%', pBusqueda, '%')
			OR e.tipo LIKE CONCAT('%', pBusqueda, '%')
			OR ub.departamento LIKE CONCAT('%', pBusqueda, '%')
			OR ub.localidad LIKE CONCAT('%', pBusqueda, '%')
			OR ub.direccion LIKE CONCAT('%', pBusqueda, '%')
			OR EXISTS (
				SELECT 1
				FROM ActoresEventos ae
				INNER JOIN Actores a
					ON a.idActor = ae.idActor
				WHERE ae.idEvento = e.idEvento
				  AND (
					a.nombre LIKE CONCAT('%', pBusqueda, '%')
					OR a.cuit LIKE CONCAT('%', pBusqueda, '%')
					OR a.tipoActor LIKE CONCAT('%', pBusqueda, '%')
				  )
			)
		)
		AND (
			pEstado IS NULL
			OR pEstado = ''
			OR e.estado = pEstado
		)
		AND (
			pTipo IS NULL
			OR pTipo = ''
			OR e.tipo = pTipo
		);

	SELECT
		e.idEvento,
		e.nombre,
		e.descripcion,
		e.tipo,
		e.fechaInicio,
		e.fechaFin,
		e.estado,
		e.esAnual,
		e.fechaCreacion,

		ub.idUbicacion,
		ub.provincia,
		ub.departamento,
		ub.localidad,
		ub.direccion,
		ub.latitud,
		ub.longitud,
		ub.esPublica,

		COALESCE(actores_evento.cantidadActores, 0) AS cantidadActores
	FROM Eventos e
	INNER JOIN Ubicaciones ub
		ON ub.idUbicacion = e.idUbicacion
	LEFT JOIN (
		SELECT
			ae.idEvento,
			COUNT(*) AS cantidadActores
		FROM ActoresEventos ae
		GROUP BY ae.idEvento
	) actores_evento
		ON actores_evento.idEvento = e.idEvento
	WHERE
		(
			pBusqueda IS NULL
			OR pBusqueda = ''
			OR e.nombre LIKE CONCAT('%', pBusqueda, '%')
			OR e.descripcion LIKE CONCAT('%', pBusqueda, '%')
			OR e.tipo LIKE CONCAT('%', pBusqueda, '%')
			OR ub.departamento LIKE CONCAT('%', pBusqueda, '%')
			OR ub.localidad LIKE CONCAT('%', pBusqueda, '%')
			OR ub.direccion LIKE CONCAT('%', pBusqueda, '%')
			OR EXISTS (
				SELECT 1
				FROM ActoresEventos ae
				INNER JOIN Actores a
					ON a.idActor = ae.idActor
				WHERE ae.idEvento = e.idEvento
				  AND (
					a.nombre LIKE CONCAT('%', pBusqueda, '%')
					OR a.cuit LIKE CONCAT('%', pBusqueda, '%')
					OR a.tipoActor LIKE CONCAT('%', pBusqueda, '%')
				  )
			)
		)
		AND (
			pEstado IS NULL
			OR pEstado = ''
			OR e.estado = pEstado
		)
		AND (
			pTipo IS NULL
			OR pTipo = ''
			OR e.tipo = pTipo
		)
	ORDER BY
		CASE WHEN vSortBy = 'idEvento' AND vSortDir = 'ASC' THEN e.idEvento END ASC,
		CASE WHEN vSortBy = 'idEvento' AND vSortDir = 'DESC' THEN e.idEvento END DESC,

		CASE WHEN vSortBy = 'nombre' AND vSortDir = 'ASC' THEN e.nombre END ASC,
		CASE WHEN vSortBy = 'nombre' AND vSortDir = 'DESC' THEN e.nombre END DESC,

		CASE WHEN vSortBy = 'tipo' AND vSortDir = 'ASC' THEN e.tipo END ASC,
		CASE WHEN vSortBy = 'tipo' AND vSortDir = 'DESC' THEN e.tipo END DESC,

		CASE WHEN vSortBy = 'estado' AND vSortDir = 'ASC' THEN e.estado END ASC,
		CASE WHEN vSortBy = 'estado' AND vSortDir = 'DESC' THEN e.estado END DESC,

		CASE WHEN vSortBy = 'fechaInicio' AND vSortDir = 'ASC' THEN e.fechaInicio END ASC,
		CASE WHEN vSortBy = 'fechaInicio' AND vSortDir = 'DESC' THEN e.fechaInicio END DESC,

		CASE WHEN vSortBy = 'fechaFin' AND vSortDir = 'ASC' THEN e.fechaFin END ASC,
		CASE WHEN vSortBy = 'fechaFin' AND vSortDir = 'DESC' THEN e.fechaFin END DESC,

		CASE WHEN vSortBy = 'fechaCreacion' AND vSortDir = 'ASC' THEN e.fechaCreacion END ASC,
		CASE WHEN vSortBy = 'fechaCreacion' AND vSortDir = 'DESC' THEN e.fechaCreacion END DESC,

		CASE WHEN vSortBy = 'departamento' AND vSortDir = 'ASC' THEN ub.departamento END ASC,
		CASE WHEN vSortBy = 'departamento' AND vSortDir = 'DESC' THEN ub.departamento END DESC,

		CASE WHEN vSortBy = 'localidad' AND vSortDir = 'ASC' THEN ub.localidad END ASC,
		CASE WHEN vSortBy = 'localidad' AND vSortDir = 'DESC' THEN ub.localidad END DESC,

		CASE WHEN vSortBy = 'cantidadActores' AND vSortDir = 'ASC' THEN COALESCE(actores_evento.cantidadActores, 0) END ASC,
		CASE WHEN vSortBy = 'cantidadActores' AND vSortDir = 'DESC' THEN COALESCE(actores_evento.cantidadActores, 0) END DESC,

		e.idEvento ASC
	LIMIT vLimit OFFSET vOffset;
END//

DROP PROCEDURE IF EXISTS sp_publico_mapa_actores_buscar //

CREATE PROCEDURE sp_publico_mapa_actores_buscar(
	IN pBusqueda VARCHAR(255),
	IN pDepartamento VARCHAR(100),
	IN pCategoriasJson JSON
)
COMMENT 'Busca actores culturales para el mapa público. Devuelve puntos georreferenciados con datos resumidos para marcadores y popups.'
BEGIN
	SELECT
		a.idActor,
		a.nombre,
		a.tipoActor,
		c.idCategoria,
		c.nombre AS categoria,
		ub.departamento,
		ub.localidad,
		ub.direccion,
		ub.latitud,
		ub.longitud
	FROM Actores a
	INNER JOIN Categorias c
		ON c.idCategoria = a.idCategoria
	INNER JOIN Ubicaciones ub
		ON ub.idUbicacion = a.idUbicacion
	WHERE c.estado = 'A'
	  AND ub.esPublica = 1
	  AND ub.latitud IS NOT NULL
	  AND ub.longitud IS NOT NULL
	  AND (
			pBusqueda IS NULL
			OR pBusqueda = ''
			OR a.nombre LIKE CONCAT('%', pBusqueda, '%')
			OR a.tipoActor LIKE CONCAT('%', pBusqueda, '%')
			OR c.nombre LIKE CONCAT('%', pBusqueda, '%')
			OR ub.departamento LIKE CONCAT('%', pBusqueda, '%')
			OR ub.localidad LIKE CONCAT('%', pBusqueda, '%')
			OR ub.direccion LIKE CONCAT('%', pBusqueda, '%')
	  )
	  AND (
			pDepartamento IS NULL
			OR pDepartamento = ''
			OR ub.departamento = pDepartamento
	  )
	  AND (
			pCategoriasJson IS NULL
			OR JSON_LENGTH(pCategoriasJson) = 0
			OR JSON_CONTAINS(
				pCategoriasJson,
				CAST(c.idCategoria AS CHAR),
				'$'
			)
	  )
	ORDER BY a.nombre ASC;
END//

DELIMITER;