-- ================================================================
-- Mosaico Cultural
-- Base de datos: cultura v1.2.1
-- Autores: Cesar Ezequiel Herrera, Leandro Murillo
-- ================================================================

USE `cultura`;

SET NAMES utf8mb4;

DELIMITER //

-- -----------------------------------------------------
-- 1. sp_admin_listar_usuarios
-- -----------------------------------------------------
DROP PROCEDURE IF EXISTS `sp_admin_listar_usuarios` //

CREATE PROCEDURE `sp_admin_listar_usuarios`(
    IN pBusqueda VARCHAR(255),
    IN pRol VARCHAR(20),
    IN pEstado CHAR(1),
    IN pLimit INT,
    IN pOffset INT,
    IN pSortBy VARCHAR(50),
    IN pSortDir VARCHAR(4)
)
COMMENT 'Lista usuarios para administración aplicando búsqueda, filtros opcionales por rol y estado, ordenamiento controlado y paginación. Devuelve el total de coincidencias y la página de usuarios.'
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
            'actividadesArcaCodigo',
            'actividadArca',
            'nombre',
            'apellido',
            'CUIL',
            'nacionalidad',
            'email',
            'rol',
            'estado',
            'fechaRegistro'
        ) THEN pSortBy
        ELSE 'idUsuario'
    END;

    SET vSortDir = CASE
        WHEN UPPER(COALESCE(pSortDir, 'ASC')) = 'DESC' THEN 'DESC'
        ELSE 'ASC'
    END;

    SELECT COUNT(*) AS total
    FROM `Usuarios` u
    LEFT JOIN `ActividadesArca` aa
        ON aa.codigo = u.actividadesArcaCodigo
    WHERE
        (
            pBusqueda IS NULL
            OR TRIM(pBusqueda) = ''
            OR u.nombre LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR u.apellido LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR u.email LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR u.CUIL LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR u.nacionalidad LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR u.actividadesArcaCodigo LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR aa.descripcion LIKE CONCAT('%', TRIM(pBusqueda), '%')
        )
        AND (pRol IS NULL OR TRIM(pRol) = '' OR u.rol = TRIM(pRol))
        AND (pEstado IS NULL OR TRIM(pEstado) = '' OR u.estado = TRIM(pEstado));

    SELECT
        u.idUsuario,
        u.actividadesArcaCodigo,
        aa.descripcion AS actividadArca,
        u.nombre,
        u.apellido,
        u.CUIL,
        u.genero,
        u.fechaNacimiento,
        u.nacionalidad,
        u.email,
        u.fechaRegistro,
        u.rol,
        u.estado
    FROM `Usuarios` u
    LEFT JOIN `ActividadesArca` aa
        ON aa.codigo = u.actividadesArcaCodigo
    WHERE
        (
            pBusqueda IS NULL
            OR TRIM(pBusqueda) = ''
            OR u.nombre LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR u.apellido LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR u.email LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR u.CUIL LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR u.nacionalidad LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR u.actividadesArcaCodigo LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR aa.descripcion LIKE CONCAT('%', TRIM(pBusqueda), '%')
        )
        AND (pRol IS NULL OR TRIM(pRol) = '' OR u.rol = TRIM(pRol))
        AND (pEstado IS NULL OR TRIM(pEstado) = '' OR u.estado = TRIM(pEstado))
    ORDER BY
        CASE WHEN vSortBy = 'idUsuario' AND vSortDir = 'ASC' THEN u.idUsuario END ASC,
        CASE WHEN vSortBy = 'idUsuario' AND vSortDir = 'DESC' THEN u.idUsuario END DESC,

        CASE WHEN vSortBy = 'actividadesArcaCodigo' AND vSortDir = 'ASC' THEN u.actividadesArcaCodigo END ASC,
        CASE WHEN vSortBy = 'actividadesArcaCodigo' AND vSortDir = 'DESC' THEN u.actividadesArcaCodigo END DESC,

        CASE WHEN vSortBy = 'actividadArca' AND vSortDir = 'ASC' THEN aa.descripcion END ASC,
        CASE WHEN vSortBy = 'actividadArca' AND vSortDir = 'DESC' THEN aa.descripcion END DESC,

        CASE WHEN vSortBy = 'nombre' AND vSortDir = 'ASC' THEN u.nombre END ASC,
        CASE WHEN vSortBy = 'nombre' AND vSortDir = 'DESC' THEN u.nombre END DESC,

        CASE WHEN vSortBy = 'apellido' AND vSortDir = 'ASC' THEN u.apellido END ASC,
        CASE WHEN vSortBy = 'apellido' AND vSortDir = 'DESC' THEN u.apellido END DESC,

        CASE WHEN vSortBy = 'CUIL' AND vSortDir = 'ASC' THEN u.CUIL END ASC,
        CASE WHEN vSortBy = 'CUIL' AND vSortDir = 'DESC' THEN u.CUIL END DESC,

        CASE WHEN vSortBy = 'nacionalidad' AND vSortDir = 'ASC' THEN u.nacionalidad END ASC,
        CASE WHEN vSortBy = 'nacionalidad' AND vSortDir = 'DESC' THEN u.nacionalidad END DESC,

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
END //

-- -----------------------------------------------------
-- 2. sp_admin_listar_actores
-- -----------------------------------------------------
DROP PROCEDURE IF EXISTS `sp_admin_listar_actores` //

CREATE PROCEDURE `sp_admin_listar_actores`(
    IN pBusqueda VARCHAR(255),
    IN pIdCategoria INT,
    IN pIdUsuarioDueno INT,
    IN pLimit INT,
    IN pOffset INT,
    IN pSortBy VARCHAR(50),
    IN pSortDir VARCHAR(4)
)
COMMENT 'Lista actores culturales para administración aplicando búsqueda, filtros opcionales por categoría y usuario dueño, ordenamiento controlado y paginación. Incluye actores sin subcategoría y devuelve el total de coincidencias y la página de actores.'
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
            'estado',
            'categoria',
            'subcategoria',
            'usuarioDueno',
            'departamento',
            'localidad'
        ) THEN pSortBy
        ELSE 'idActor'
    END;

    SET vSortDir = CASE
        WHEN UPPER(COALESCE(pSortDir, 'ASC')) = 'DESC' THEN 'DESC'
        ELSE 'ASC'
    END;

    SELECT COUNT(*) AS total
    FROM `Actores` a
    INNER JOIN `Categorias` c
        ON c.idCategoria = a.idCategoria
    LEFT JOIN `Subcategorias` s
        ON s.idCategoria = a.idCategoria
       AND s.idSubcategoria = a.idSubcategoria
    LEFT JOIN (
        SELECT
            i.idActor,
            MIN(i.idUsuario) AS idUsuarioDueno
        FROM `Integrantes` i
        WHERE i.esDueño = 1
        GROUP BY i.idActor
    ) d
        ON d.idActor = a.idActor
    LEFT JOIN `Usuarios` u
        ON u.idUsuario = d.idUsuarioDueno
    INNER JOIN `Ubicaciones` ub
        ON ub.idUbicacion = a.idUbicacion
    WHERE
        (
            pBusqueda IS NULL
            OR TRIM(pBusqueda) = ''
            OR a.nombre LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR a.cuit LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR a.tipoActor LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR c.nombre LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR s.nombre LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR u.nombre LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR u.apellido LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR u.email LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR ub.departamento LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR ub.localidad LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR ub.direccion LIKE CONCAT('%', TRIM(pBusqueda), '%')
        )
        AND (pIdCategoria IS NULL OR a.idCategoria = pIdCategoria)
        AND (pIdUsuarioDueno IS NULL OR d.idUsuarioDueno = pIdUsuarioDueno);

    SELECT
        a.idActor,
        a.nombre AS nombreActor,
        a.descripcion,
        a.fotoPerfilUrl,
        a.cuit,
        a.tipoActor,
        a.fechaCreacion,
        a.estado,

        a.idCategoria,
        c.nombre AS categoria,
        c.estado AS estadoCategoria,

        a.idSubcategoria,
        s.nombre AS subcategoria,
        s.estado AS estadoSubcategoria,

        d.idUsuarioDueno,
        CASE
            WHEN u.idUsuario IS NULL THEN NULL
            ELSE CONCAT(u.nombre, ' ', u.apellido)
        END AS usuarioDueno,
        u.email AS emailUsuarioDueno,

        ub.idUbicacion,
        ub.provincia,
        ub.departamento,
        ub.localidad,
        ub.direccion,
        ub.latitud,
        ub.longitud,
        ub.esPublica
    FROM `Actores` a
    INNER JOIN `Categorias` c
        ON c.idCategoria = a.idCategoria
    LEFT JOIN `Subcategorias` s
        ON s.idCategoria = a.idCategoria
       AND s.idSubcategoria = a.idSubcategoria
    LEFT JOIN (
        SELECT
            i.idActor,
            MIN(i.idUsuario) AS idUsuarioDueno
        FROM `Integrantes` i
        WHERE i.esDueño = 1
        GROUP BY i.idActor
    ) d
        ON d.idActor = a.idActor
    LEFT JOIN `Usuarios` u
        ON u.idUsuario = d.idUsuarioDueno
    INNER JOIN `Ubicaciones` ub
        ON ub.idUbicacion = a.idUbicacion
    WHERE
        (
            pBusqueda IS NULL
            OR TRIM(pBusqueda) = ''
            OR a.nombre LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR a.cuit LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR a.tipoActor LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR c.nombre LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR s.nombre LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR u.nombre LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR u.apellido LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR u.email LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR ub.departamento LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR ub.localidad LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR ub.direccion LIKE CONCAT('%', TRIM(pBusqueda), '%')
        )
        AND (pIdCategoria IS NULL OR a.idCategoria = pIdCategoria)
        AND (pIdUsuarioDueno IS NULL OR d.idUsuarioDueno = pIdUsuarioDueno)
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

        CASE WHEN vSortBy = 'estado' AND vSortDir = 'ASC' THEN a.estado END ASC,
        CASE WHEN vSortBy = 'estado' AND vSortDir = 'DESC' THEN a.estado END DESC,

        CASE WHEN vSortBy = 'categoria' AND vSortDir = 'ASC' THEN c.nombre END ASC,
        CASE WHEN vSortBy = 'categoria' AND vSortDir = 'DESC' THEN c.nombre END DESC,

        CASE WHEN vSortBy = 'subcategoria' AND vSortDir = 'ASC' THEN s.nombre END ASC,
        CASE WHEN vSortBy = 'subcategoria' AND vSortDir = 'DESC' THEN s.nombre END DESC,

        CASE WHEN vSortBy = 'usuarioDueno' AND vSortDir = 'ASC' THEN CONCAT(u.nombre, ' ', u.apellido) END ASC,
        CASE WHEN vSortBy = 'usuarioDueno' AND vSortDir = 'DESC' THEN CONCAT(u.nombre, ' ', u.apellido) END DESC,

        CASE WHEN vSortBy = 'departamento' AND vSortDir = 'ASC' THEN ub.departamento END ASC,
        CASE WHEN vSortBy = 'departamento' AND vSortDir = 'DESC' THEN ub.departamento END DESC,

        CASE WHEN vSortBy = 'localidad' AND vSortDir = 'ASC' THEN ub.localidad END ASC,
        CASE WHEN vSortBy = 'localidad' AND vSortDir = 'DESC' THEN ub.localidad END DESC,

        a.idActor ASC
    LIMIT vLimit OFFSET vOffset;
END //

-- -----------------------------------------------------
-- 3. sp_admin_listar_eventos
-- -----------------------------------------------------
DROP PROCEDURE IF EXISTS `sp_admin_listar_eventos` //

CREATE PROCEDURE `sp_admin_listar_eventos`(
    IN pBusqueda VARCHAR(255),
    IN pEstado CHAR(1),
    IN pLimit INT,
    IN pOffset INT,
    IN pSortBy VARCHAR(50),
    IN pSortDir VARCHAR(4)
)
COMMENT 'Lista eventos para administración aplicando búsqueda, filtro opcional por estado, ordenamiento controlado y paginación. Devuelve el total de coincidencias y la página de eventos.'
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
            'estado',
            'fecha',
            'fechaCreacion',
            'departamento',
            'localidad',
            'nombreActor'
        ) THEN pSortBy
        ELSE 'idEvento'
    END;

    SET vSortDir = CASE
        WHEN UPPER(COALESCE(pSortDir, 'ASC')) = 'DESC' THEN 'DESC'
        ELSE 'ASC'
    END;

    SELECT COUNT(*) AS total
    FROM `Eventos` e
    INNER JOIN `Actores` a
        ON a.idActor = e.idActor
    INNER JOIN `Ubicaciones` ub
        ON ub.idUbicacion = a.idUbicacion
    WHERE
        (
            pBusqueda IS NULL
            OR TRIM(pBusqueda) = ''
            OR e.nombre LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR e.descripcion LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR a.nombre LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR ub.departamento LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR ub.localidad LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR ub.direccion LIKE CONCAT('%', TRIM(pBusqueda), '%')
        )
        AND (pEstado IS NULL OR TRIM(pEstado) = '' OR e.estado = TRIM(pEstado));

    SELECT
        e.idEvento,
        e.nombre,
        e.descripcion,
        e.fecha,
        e.estado,
        e.fechaCreacion,

        a.idActor,
        a.nombre AS nombreActor,
        a.estado AS estadoActor,

        ub.idUbicacion,
        ub.provincia,
        ub.departamento,
        ub.localidad,
        ub.direccion,
        ub.latitud,
        ub.longitud,
        ub.esPublica
    FROM `Eventos` e
    INNER JOIN `Actores` a
        ON a.idActor = e.idActor
    INNER JOIN `Ubicaciones` ub
        ON ub.idUbicacion = a.idUbicacion
    WHERE
        (
            pBusqueda IS NULL
            OR TRIM(pBusqueda) = ''
            OR e.nombre LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR e.descripcion LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR a.nombre LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR ub.departamento LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR ub.localidad LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR ub.direccion LIKE CONCAT('%', TRIM(pBusqueda), '%')
        )
        AND (pEstado IS NULL OR TRIM(pEstado) = '' OR e.estado = TRIM(pEstado))
    ORDER BY
        CASE WHEN vSortBy = 'idEvento' AND vSortDir = 'ASC' THEN e.idEvento END ASC,
        CASE WHEN vSortBy = 'idEvento' AND vSortDir = 'DESC' THEN e.idEvento END DESC,

        CASE WHEN vSortBy = 'nombre' AND vSortDir = 'ASC' THEN e.nombre END ASC,
        CASE WHEN vSortBy = 'nombre' AND vSortDir = 'DESC' THEN e.nombre END DESC,

        CASE WHEN vSortBy = 'estado' AND vSortDir = 'ASC' THEN e.estado END ASC,
        CASE WHEN vSortBy = 'estado' AND vSortDir = 'DESC' THEN e.estado END DESC,

        CASE WHEN vSortBy = 'fecha' AND vSortDir = 'ASC' THEN e.fecha END ASC,
        CASE WHEN vSortBy = 'fecha' AND vSortDir = 'DESC' THEN e.fecha END DESC,

        CASE WHEN vSortBy = 'fechaCreacion' AND vSortDir = 'ASC' THEN e.fechaCreacion END ASC,
        CASE WHEN vSortBy = 'fechaCreacion' AND vSortDir = 'DESC' THEN e.fechaCreacion END DESC,

        CASE WHEN vSortBy = 'departamento' AND vSortDir = 'ASC' THEN ub.departamento END ASC,
        CASE WHEN vSortBy = 'departamento' AND vSortDir = 'DESC' THEN ub.departamento END DESC,

        CASE WHEN vSortBy = 'localidad' AND vSortDir = 'ASC' THEN ub.localidad END ASC,
        CASE WHEN vSortBy = 'localidad' AND vSortDir = 'DESC' THEN ub.localidad END DESC,

        CASE WHEN vSortBy = 'nombreActor' AND vSortDir = 'ASC' THEN a.nombre END ASC,
        CASE WHEN vSortBy = 'nombreActor' AND vSortDir = 'DESC' THEN a.nombre END DESC,

        e.idEvento ASC
    LIMIT vLimit OFFSET vOffset;
END //

-- -----------------------------------------------------
-- 4. sp_publico_mapa_actores_buscar
-- -----------------------------------------------------
DROP PROCEDURE IF EXISTS `sp_publico_mapa_actores_buscar` //

CREATE PROCEDURE `sp_publico_mapa_actores_buscar`(
    IN pBusqueda VARCHAR(255),
    IN pDepartamento VARCHAR(100),
    IN pCategoriasJson JSON
)
COMMENT 'Busca actores culturales activos para el mapa público. Solo devuelve actores de categorías activas, con subcategoría activa cuando corresponda y ubicación pública.'
BEGIN
    SELECT
        a.idActor,
        a.nombre,
        a.descripcion,
        a.fotoPerfilUrl,
        a.tipoActor,

        a.idCategoria,
        c.nombre AS categoria,

        a.idSubcategoria,
        s.nombre AS subcategoria,

        ub.departamento,
        ub.localidad,
        ub.direccion,
        ub.latitud,
        ub.longitud
    FROM `Actores` a
    INNER JOIN `Categorias` c
        ON c.idCategoria = a.idCategoria
    LEFT JOIN `Subcategorias` s
        ON s.idCategoria = a.idCategoria
       AND s.idSubcategoria = a.idSubcategoria
    INNER JOIN `Ubicaciones` ub
        ON ub.idUbicacion = a.idUbicacion
    WHERE
        a.estado = 'A'
        AND c.estado = 'A'
        AND (
            a.idSubcategoria IS NULL
            OR s.estado = 'A'
        )
        AND ub.esPublica = 1
        AND (
            pBusqueda IS NULL
            OR TRIM(pBusqueda) = ''
            OR a.nombre LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR a.descripcion LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR a.tipoActor LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR c.nombre LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR s.nombre LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR ub.departamento LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR ub.localidad LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR ub.direccion LIKE CONCAT('%', TRIM(pBusqueda), '%')
        )
        AND (
            pDepartamento IS NULL
            OR TRIM(pDepartamento) = ''
            OR ub.departamento = TRIM(pDepartamento)
        )
        AND (
            pCategoriasJson IS NULL
            OR JSON_LENGTH(pCategoriasJson) = 0
            OR JSON_CONTAINS(
                pCategoriasJson,
                CAST(a.idCategoria AS CHAR),
                '$'
            )
        )
    ORDER BY a.nombre ASC, a.idActor ASC;
END //

DELIMITER ;
