-- ================================================================
-- Mosaico Cultural
-- Base de datos: cultura v1.2.2
-- Autores: Cesar Ezequiel Herrera, Leandro Murillo
-- ================================================================

USE `cultura`;

SET NAMES utf8mb4;

DELIMITER //

-- -----------------------------------------------------
-- sp_admin_listar_usuarios
-- -----------------------------------------------------
CREATE OR REPLACE PROCEDURE `sp_admin_listar_usuarios`(
    IN pBusqueda VARCHAR(255) DEFAULT NULL,
    IN pRol VARCHAR(20) DEFAULT NULL,
    IN pEstado CHAR(1) DEFAULT NULL,
    IN pLimit INT DEFAULT 25,
    IN pOffset INT DEFAULT 0,
    IN pSortBy VARCHAR(50) DEFAULT 'idUsuario',
    IN pSortDir VARCHAR(4) DEFAULT 'ASC'
)
READS SQL DATA
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
-- sp_admin_obtener_usuario
-- -----------------------------------------------------
CREATE OR REPLACE PROCEDURE `sp_admin_obtener_usuario`(
    IN pIdUsuario INT
)
READS SQL DATA
COMMENT 'Obtiene el detalle administrativo de un usuario y las categorías activas que puede moderar, indicando sus asignaciones actuales.'
BEGIN
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
    WHERE u.idUsuario = pIdUsuario;

    SELECT
        c.idCategoria,
        c.nombre,
        c.icono,
        CASE WHEN mc.idUsuario IS NULL THEN 0 ELSE 1 END AS asignada
    FROM `Categorias` c
    LEFT JOIN `ModeradoresCategorias` mc
        ON mc.idCategoria = c.idCategoria
       AND mc.idUsuario = pIdUsuario
    WHERE c.estado = 'A'
    ORDER BY c.nombre ASC, c.idCategoria ASC;
END //

-- -----------------------------------------------------
-- sp_admin_cambiar_estado_usuario
-- -----------------------------------------------------
CREATE OR REPLACE PROCEDURE `sp_admin_cambiar_estado_usuario`(
    IN pIdUsuario INT,
    IN pEstado CHAR(1)
)
MODIFIES SQL DATA
COMMENT 'Da de baja o reactiva un usuario estableciendo su estado en I o A. Los administradores no pueden cambiar de estado.'
BEGIN
    IF pIdUsuario IS NULL OR pIdUsuario <= 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El identificador del usuario no es válido.';
    END IF;

    IF pEstado NOT IN ('A', 'I') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El estado del usuario debe ser A o I.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM `Usuarios`
        WHERE idUsuario = pIdUsuario
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El usuario solicitado no existe.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM `Usuarios`
        WHERE idUsuario = pIdUsuario
          AND rol = 'ADMIN'
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'No se puede cambiar el estado de un usuario administrador.';
    END IF;

    UPDATE `Usuarios`
    SET estado = pEstado
    WHERE idUsuario = pIdUsuario;
END //

-- -----------------------------------------------------
-- sp_admin_asignar_moderador
-- -----------------------------------------------------
CREATE OR REPLACE PROCEDURE `sp_admin_asignar_moderador`(
    IN pIdUsuario INT,
    IN pIdsCategorias JSON
)
MODIFIES SQL DATA
COMMENT 'Reemplaza de forma transaccional las categorías que modera un usuario. Con categorías lo convierte en moderador; sin categorías restaura el rol de usuario. Los administradores no pueden cambiar de rol.'
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF pIdUsuario IS NULL OR pIdUsuario <= 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El identificador del usuario no es válido.';
    END IF;

    IF pIdsCategorias IS NULL
       OR pIdsCategorias IS NOT JSON ARRAY
       OR JSON_LENGTH(pIdsCategorias) > 100 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Las categorías deben enviarse como un arreglo JSON de hasta 100 elementos.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM `Usuarios`
        WHERE idUsuario = pIdUsuario
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El usuario solicitado no existe.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM `Usuarios`
        WHERE idUsuario = pIdUsuario
          AND rol = 'ADMIN'
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'No se puede cambiar el rol de un usuario administrador.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM `Usuarios`
        WHERE idUsuario = pIdUsuario
          AND estado = 'I'
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'No se puede asignar moderación a un usuario inactivo.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM JSON_TABLE(
            pIdsCategorias,
            '$[*]' COLUMNS (
                idCategoria INT PATH '$'
            )
        ) ids
        LEFT JOIN `Categorias` c
            ON c.idCategoria = ids.idCategoria
           AND c.estado = 'A'
        WHERE ids.idCategoria IS NULL
           OR ids.idCategoria <= 0
           OR c.idCategoria IS NULL
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Todas las categorías seleccionadas deben existir y estar activas.';
    END IF;

    START TRANSACTION;

    UPDATE `Usuarios`
    SET rol = CASE
        WHEN JSON_LENGTH(pIdsCategorias) = 0 THEN 'USUARIO'
        ELSE 'MODERADOR'
    END
    WHERE idUsuario = pIdUsuario;

    DELETE FROM `ModeradoresCategorias`
    WHERE idUsuario = pIdUsuario;

    INSERT INTO `ModeradoresCategorias` (idCategoria, idUsuario)
    SELECT DISTINCT ids.idCategoria, pIdUsuario
    FROM JSON_TABLE(
        pIdsCategorias,
        '$[*]' COLUMNS (
            idCategoria INT PATH '$'
        )
    ) ids;

    COMMIT;
END //

-- -----------------------------------------------------
-- sp_admin_cambiar_estado_actores
-- -----------------------------------------------------
CREATE OR REPLACE PROCEDURE `sp_admin_cambiar_estado_actores`(
    IN pIdsActores JSON,
    IN pEstado CHAR(1)
)
MODIFIES SQL DATA
COMMENT 'Da de baja o reactiva uno o más actores estableciendo su estado en I o A.'
BEGIN
    IF pIdsActores IS NULL
       OR pIdsActores IS NOT JSON ARRAY
       OR JSON_LENGTH(pIdsActores) = 0
       OR JSON_LENGTH(pIdsActores) > 100 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Los actores deben enviarse como un arreglo JSON de entre 1 y 100 elementos.';
    END IF;

    IF pEstado NOT IN ('A', 'I') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El estado del actor debe ser A o I.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM JSON_TABLE(
            pIdsActores,
            '$[*]' COLUMNS (
                idActor INT PATH '$'
            )
        ) ids
        LEFT JOIN `Actores` a
            ON a.idActor = ids.idActor
        WHERE ids.idActor IS NULL
           OR ids.idActor <= 0
           OR a.idActor IS NULL
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Todos los actores seleccionados deben existir.';
    END IF;

    UPDATE `Actores` a
    INNER JOIN (
        SELECT DISTINCT ids.idActor
        FROM JSON_TABLE(
            pIdsActores,
            '$[*]' COLUMNS (
                idActor INT PATH '$'
            )
        ) ids
    ) seleccionados
        ON seleccionados.idActor = a.idActor
    SET a.estado = pEstado;

    SELECT ROW_COUNT() AS actualizados;
END //

-- -----------------------------------------------------
-- sp_admin_listar_actores
-- -----------------------------------------------------
CREATE OR REPLACE PROCEDURE `sp_admin_listar_actores`(
    IN pBusqueda VARCHAR(255) DEFAULT NULL,
    IN pIdCategoria INT DEFAULT NULL,
    IN pDepartamento VARCHAR(100) DEFAULT NULL,
    IN pTipoActor VARCHAR(20) DEFAULT NULL,
    IN pEstado CHAR(1) DEFAULT NULL,
    IN pLimit INT DEFAULT 25,
    IN pOffset INT DEFAULT 0,
    IN pSortBy VARCHAR(50) DEFAULT 'idActor',
    IN pSortDir VARCHAR(4) DEFAULT 'ASC'
)
READS SQL DATA
COMMENT 'Lista actores culturales para administración aplicando búsqueda, filtros opcionales por categoría, departamento, tipo de actor y estado, ordenamiento controlado y paginación. Incluye actores sin subcategoría y devuelve el total de coincidencias y la página de actores.'
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
        AND (pDepartamento IS NULL OR TRIM(pDepartamento) = '' OR ub.departamento = TRIM(pDepartamento))
        AND (pTipoActor IS NULL OR TRIM(pTipoActor) = '' OR a.tipoActor = TRIM(pTipoActor))
        AND (pEstado IS NULL OR TRIM(pEstado) = '' OR a.estado = TRIM(pEstado));

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
        c.icono AS iconoCategoria,
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
        AND (pDepartamento IS NULL OR TRIM(pDepartamento) = '' OR ub.departamento = TRIM(pDepartamento))
        AND (pTipoActor IS NULL OR TRIM(pTipoActor) = '' OR a.tipoActor = TRIM(pTipoActor))
        AND (pEstado IS NULL OR TRIM(pEstado) = '' OR a.estado = TRIM(pEstado))
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
-- sp_admin_obtener_actor
-- -----------------------------------------------------
CREATE OR REPLACE PROCEDURE `sp_admin_obtener_actor`(
    IN pIdActor INT
)
READS SQL DATA
COMMENT 'Obtiene el perfil administrativo de un actor cultural sin restringir su estado. Devuelve datos generales, integrantes y elementos del portafolio.'
BEGIN
    IF pIdActor IS NULL OR pIdActor <= 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MYSQL_ERRNO = 1644,
                MESSAGE_TEXT = 'pIdActor debe ser un entero positivo';
    END IF;

    -- RESULTADO 1: datos generales, clasificación, dueño y ubicación.
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
        c.icono AS iconoCategoria,
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
    WHERE a.idActor = pIdActor;

    -- RESULTADO 2: todos los usuarios integrantes del actor.
    SELECT
        u.idUsuario,
        CONCAT(u.nombre, ' ', u.apellido) AS nombreUsuario,
        u.email,
        i.rol,
        i.esDueño AS esDueno
    FROM `Integrantes` i
    INNER JOIN `Usuarios` u
        ON u.idUsuario = i.idUsuario
    WHERE i.idActor = pIdActor
    ORDER BY
        i.esDueño DESC,
        u.apellido ASC,
        u.nombre ASC,
        u.idUsuario ASC;

    -- RESULTADO 3: imágenes, enlaces y redes sociales del portafolio.
    SELECT
        ip.idItem,
        ip.tipo,
        ip.descripcion,
        ip.url,
        ip.fechaCreacion
    FROM `ItemsPortafolio` ip
    WHERE ip.idActor = pIdActor
    ORDER BY ip.fechaCreacion DESC, ip.idItem DESC;
END //

-- -----------------------------------------------------
-- sp_admin_listar_categorias
-- -----------------------------------------------------
CREATE OR REPLACE PROCEDURE `sp_admin_listar_categorias`(
    IN pBusqueda VARCHAR(255) DEFAULT NULL,
    IN pEstado CHAR(1) DEFAULT NULL,
    IN pLimit INT DEFAULT 25,
    IN pOffset INT DEFAULT 0,
    IN pSortBy VARCHAR(50) DEFAULT 'idCategoria',
    IN pSortDir VARCHAR(4) DEFAULT 'ASC'
)
READS SQL DATA
COMMENT 'Lista categorías para administración con búsqueda, filtro de estado, orden y paginación. Incluye icono, el nombre de su única subcategoría y la cantidad de actores asociados.'
BEGIN
    DECLARE vLimit INT DEFAULT 25;
    DECLARE vOffset INT DEFAULT 0;
    DECLARE vSortBy VARCHAR(50) DEFAULT 'idCategoria';
    DECLARE vSortDir VARCHAR(4) DEFAULT 'ASC';

    SET vLimit = LEAST(GREATEST(COALESCE(pLimit, 25), 1), 100);
    SET vOffset = GREATEST(COALESCE(pOffset, 0), 0);
    SET vSortBy = CASE
        WHEN pSortBy IN ('idCategoria', 'nombre', 'icono', 'estado', 'subcategoria', 'cantidadActores')
            THEN pSortBy
        ELSE 'idCategoria'
    END;
    SET vSortDir = CASE
        WHEN UPPER(COALESCE(pSortDir, 'ASC')) = 'DESC' THEN 'DESC'
        ELSE 'ASC'
    END;

    SELECT COUNT(*) AS total
    FROM `Categorias` c
    WHERE
        (pBusqueda IS NULL OR TRIM(pBusqueda) = '' OR c.nombre LIKE CONCAT('%', TRIM(pBusqueda), '%'))
        AND (pEstado IS NULL OR TRIM(pEstado) = '' OR c.estado = TRIM(pEstado));

    SELECT
        c.idCategoria,
        c.nombre,
        c.icono,
        c.estado,
        MAX(s.nombre) AS subcategoria,
        COUNT(DISTINCT a.idActor) AS cantidadActores
    FROM `Categorias` c
    LEFT JOIN `Subcategorias` s ON s.idCategoria = c.idCategoria
    LEFT JOIN `Actores` a ON a.idCategoria = c.idCategoria
    WHERE
        (pBusqueda IS NULL OR TRIM(pBusqueda) = '' OR c.nombre LIKE CONCAT('%', TRIM(pBusqueda), '%'))
        AND (pEstado IS NULL OR TRIM(pEstado) = '' OR c.estado = TRIM(pEstado))
    GROUP BY c.idCategoria, c.nombre, c.icono, c.estado
    ORDER BY
        CASE WHEN vSortBy = 'idCategoria' AND vSortDir = 'ASC' THEN c.idCategoria END ASC,
        CASE WHEN vSortBy = 'idCategoria' AND vSortDir = 'DESC' THEN c.idCategoria END DESC,
        CASE WHEN vSortBy = 'nombre' AND vSortDir = 'ASC' THEN c.nombre END ASC,
        CASE WHEN vSortBy = 'nombre' AND vSortDir = 'DESC' THEN c.nombre END DESC,
        CASE WHEN vSortBy = 'icono' AND vSortDir = 'ASC' THEN c.icono END ASC,
        CASE WHEN vSortBy = 'icono' AND vSortDir = 'DESC' THEN c.icono END DESC,
        CASE WHEN vSortBy = 'estado' AND vSortDir = 'ASC' THEN c.estado END ASC,
        CASE WHEN vSortBy = 'estado' AND vSortDir = 'DESC' THEN c.estado END DESC,
        CASE WHEN vSortBy = 'subcategoria' AND vSortDir = 'ASC' THEN MAX(s.nombre) END ASC,
        CASE WHEN vSortBy = 'subcategoria' AND vSortDir = 'DESC' THEN MAX(s.nombre) END DESC,
        CASE WHEN vSortBy = 'cantidadActores' AND vSortDir = 'ASC' THEN COUNT(DISTINCT a.idActor) END ASC,
        CASE WHEN vSortBy = 'cantidadActores' AND vSortDir = 'DESC' THEN COUNT(DISTINCT a.idActor) END DESC,
        c.idCategoria ASC
    LIMIT vLimit OFFSET vOffset;
END //

-- -----------------------------------------------------
-- sp_admin_obtener_categoria
-- -----------------------------------------------------
CREATE OR REPLACE PROCEDURE `sp_admin_obtener_categoria`(
    IN pIdCategoria INT
)
READS SQL DATA
COMMENT 'Obtiene una categoría por identificador con icono, el nombre de su única subcategoría y la cantidad de actores asociados.'
BEGIN
    SELECT
        c.idCategoria,
        c.nombre,
        c.icono,
        c.estado,
        MAX(s.nombre) AS subcategoria,
        COUNT(DISTINCT a.idActor) AS cantidadActores
    FROM `Categorias` c
    LEFT JOIN `Subcategorias` s ON s.idCategoria = c.idCategoria
    LEFT JOIN `Actores` a ON a.idCategoria = c.idCategoria
    WHERE c.idCategoria = pIdCategoria
    GROUP BY c.idCategoria, c.nombre, c.icono, c.estado;
END //

-- -----------------------------------------------------
-- sp_admin_crear_categoria
-- -----------------------------------------------------
CREATE OR REPLACE PROCEDURE `sp_admin_crear_categoria`(
    IN pNombre VARCHAR(45),
    IN pIcono VARCHAR(64) DEFAULT 'Category',
    IN pEstado CHAR(1) DEFAULT 'A'
)
MODIFIES SQL DATA
COMMENT 'Crea una categoría y devuelve el registro creado.'
BEGIN
    IF pNombre IS NULL OR TRIM(pNombre) = '' OR CHAR_LENGTH(TRIM(pNombre)) > 45 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El nombre de la categoría debe tener entre 1 y 45 caracteres.';
    END IF;

    IF pEstado NOT IN ('A', 'I') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El estado de la categoría debe ser A o I.';
    END IF;

    IF pIcono IS NULL OR TRIM(pIcono) = '' OR CHAR_LENGTH(TRIM(pIcono)) > 64
       OR TRIM(pIcono) NOT REGEXP '^[A-Za-z][A-Za-z0-9]{0,63}$' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El icono de la categoría no es válido.';
    END IF;

    IF EXISTS (SELECT 1 FROM `Categorias` WHERE nombre = TRIM(pNombre)) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Ya existe una categoría con ese nombre.';
    END IF;

    INSERT INTO `Categorias` (nombre, icono, estado)
    VALUES (TRIM(pNombre), TRIM(pIcono), pEstado);

    CALL `sp_admin_obtener_categoria`(LAST_INSERT_ID());
END //

-- -----------------------------------------------------
-- sp_admin_editar_categoria
-- -----------------------------------------------------
CREATE OR REPLACE PROCEDURE `sp_admin_editar_categoria`(
    IN pIdCategoria INT,
    IN pNombre VARCHAR(45),
    IN pIcono VARCHAR(64),
    IN pEstado CHAR(1)
)
MODIFIES SQL DATA
COMMENT 'Modifica el nombre y estado de una categoría y devuelve el registro actualizado.'
BEGIN
    IF pIdCategoria IS NULL OR pIdCategoria <= 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El identificador de la categoría no es válido.';
    END IF;

    IF pNombre IS NULL OR TRIM(pNombre) = '' OR CHAR_LENGTH(TRIM(pNombre)) > 45 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El nombre de la categoría debe tener entre 1 y 45 caracteres.';
    END IF;

    IF pEstado NOT IN ('A', 'I') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El estado de la categoría debe ser A o I.';
    END IF;

    IF pIcono IS NULL OR TRIM(pIcono) = '' OR CHAR_LENGTH(TRIM(pIcono)) > 64
       OR TRIM(pIcono) NOT REGEXP '^[A-Za-z][A-Za-z0-9]{0,63}$' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El icono de la categoría no es válido.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM `Categorias` WHERE idCategoria = pIdCategoria) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La categoría solicitada no existe.';
    END IF;

    IF EXISTS (
        SELECT 1 FROM `Categorias`
        WHERE nombre = TRIM(pNombre) AND idCategoria <> pIdCategoria
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Ya existe una categoría con ese nombre.';
    END IF;

    UPDATE `Categorias`
    SET nombre = TRIM(pNombre), icono = TRIM(pIcono), estado = pEstado
    WHERE idCategoria = pIdCategoria;

    CALL `sp_admin_obtener_categoria`(pIdCategoria);
END //

-- -----------------------------------------------------
-- sp_admin_eliminar_categoria
-- -----------------------------------------------------
CREATE OR REPLACE PROCEDURE `sp_admin_eliminar_categoria`(
    IN pIdCategoria INT
)
MODIFIES SQL DATA
COMMENT 'Realiza la baja lógica de una categoría para preservar sus relaciones históricas y devuelve el registro actualizado.'
BEGIN
    IF pIdCategoria IS NULL OR pIdCategoria <= 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El identificador de la categoría no es válido.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM `Categorias` WHERE idCategoria = pIdCategoria) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La categoría solicitada no existe.';
    END IF;

    UPDATE `Categorias`
    SET estado = 'I'
    WHERE idCategoria = pIdCategoria;

    CALL `sp_admin_obtener_categoria`(pIdCategoria);
END //

-- -----------------------------------------------------
-- sp_admin_listar_eventos
-- -----------------------------------------------------
CREATE OR REPLACE PROCEDURE `sp_admin_listar_eventos`(
    IN pBusqueda VARCHAR(255) DEFAULT NULL,
    IN pEstado CHAR(1) DEFAULT NULL,
    IN pLimit INT DEFAULT 25,
    IN pOffset INT DEFAULT 0,
    IN pSortBy VARCHAR(50) DEFAULT 'idEvento',
    IN pSortDir VARCHAR(4) DEFAULT 'ASC'
)
READS SQL DATA
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
-- sp_publico_mapa_actores_filtros
-- -----------------------------------------------------
CREATE OR REPLACE PROCEDURE `sp_publico_mapa_filtros`()
SQL SECURITY DEFINER
READS SQL DATA
COMMENT 'Devuelve los filtros disponibles para el mapa público. RS1: categorías. RS2: departamentos.'
BEGIN

    /*
     * RESULT SET 1: categorías
     *
     * Solo devuelve categorías que tengan al menos
     * un actor actualmente visible en el mapa.
     */
    SELECT
        c.idCategoria as id,
        c.nombre,
        c.icono,
        COUNT(DISTINCT a.idActor) AS cantidadActores

    FROM `Categorias` c
    INNER JOIN `Actores` a
        ON a.idCategoria = c.idCategoria
    LEFT JOIN `Subcategorias` s
        ON s.idCategoria = a.idCategoria
       AND s.idSubcategoria = a.idSubcategoria
    INNER JOIN `Ubicaciones` ub
        ON ub.idUbicacion = a.idUbicacion
    WHERE
        c.estado = 'A'
        AND a.estado = 'A'
        AND (
            a.idSubcategoria IS NULL
            OR s.estado = 'A'
        )
        AND ub.esPublica = 1
        AND ub.latitud IS NOT NULL
        AND ub.longitud IS NOT NULL
    GROUP BY
        c.idCategoria,
        c.nombre,
        c.icono
    ORDER BY
        c.nombre ASC,
        c.idCategoria ASC;


    /*
     * RESULT SET 2: departamentos
     *
     * Solo devuelve departamentos que tengan al menos
     * un actor actualmente visible en el mapa.
     */
    SELECT
        ub.departamento,
        COUNT(DISTINCT a.idActor) AS cantidadActores
    FROM `Actores` a
    INNER JOIN `Categorias` c
        ON c.idCategoria = a.idCategoria
    LEFT JOIN `Subcategorias` s
        ON s.idCategoria = a.idCategoria
       AND s.idSubcategoria = a.idSubcategoria
    INNER JOIN `Ubicaciones` ub
        ON ub.idUbicacion = a.idUbicacion
    WHERE
        c.estado = 'A'
        AND a.estado = 'A'
        AND (
            a.idSubcategoria IS NULL
            OR s.estado = 'A'
        )
        AND ub.esPublica = 1
        AND ub.latitud IS NOT NULL
        AND ub.longitud IS NOT NULL
    GROUP BY
        ub.departamento
    ORDER BY
        ub.departamento ASC;

END //

-- -----------------------------------------------------
-- sp_publico_mapa_actores
-- -----------------------------------------------------
CREATE OR REPLACE PROCEDURE `sp_publico_mapa_actores`(
    IN pBusqueda VARCHAR(255) DEFAULT NULL,
    IN pDepartamento VARCHAR(100) DEFAULT NULL,
    IN pCategoriasJson JSON DEFAULT NULL
)
READS SQL DATA
COMMENT 'Busca actores culturales activos para el mapa público. Solo devuelve actores de categorías activas, con subcategoría activa cuando corresponda y ubicación pública.'
BEGIN
    IF pCategoriasJson IS NOT NULL
       AND pCategoriasJson IS NOT JSON ARRAY THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Las categorías deben enviarse como un arreglo JSON.';
    END IF;

    IF pCategoriasJson IS NOT NULL
       AND EXISTS (
            SELECT 1
            FROM JSON_TABLE(
                pCategoriasJson,
                '$[*]' COLUMNS (
                    ord FOR ORDINALITY
                )
            ) AS jt
            WHERE JSON_TYPE(
                    JSON_EXTRACT(
                        pCategoriasJson,
                        CONCAT('$[', jt.ord - 1, ']')
                    )
                  ) <> 'INTEGER'
               OR CAST(
                    JSON_UNQUOTE(
                        JSON_EXTRACT(
                            pCategoriasJson,
                            CONCAT('$[', jt.ord - 1, ']')
                        )
                    ) AS SIGNED
                  ) <= 0
       ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cada categoría debe ser un identificador entero positivo.';
    END IF;

    SELECT
        a.idActor,
        a.nombre,
        a.descripcion,
        a.fotoPerfilUrl,
        c.nombre AS categoria,
        c.icono AS categoriaIcono,
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
        AND ub.latitud IS NOT NULL
        AND ub.longitud IS NOT NULL
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
            OR EXISTS (
                SELECT 1
                FROM JSON_TABLE(
                    pCategoriasJson,
                    '$[*]' COLUMNS (
                        idCategoria INT PATH '$' ERROR ON EMPTY ERROR ON ERROR
                    )
                ) AS categoriasFiltro
                WHERE categoriasFiltro.idCategoria = a.idCategoria
            )
        )
    ORDER BY a.nombre ASC, a.idActor ASC;
END //

-- -----------------------------------------------------
-- sp_publico_listar_actores_filtros
-- -----------------------------------------------------
CREATE OR REPLACE PROCEDURE `sp_publico_listar_actores_filtros`()
SQL SECURITY DEFINER
READS SQL DATA
COMMENT 'Devuelve los filtros disponibles para el directorio público de actores. RS1: categorías. RS2: departamentos.'
BEGIN

    /*
     * RESULT SET 1: categorías
     *
     * Solo devuelve categorías que tengan al menos
     * un actor actualmente visible en el directorio.
     *
     * No se exige que la ubicación sea pública,
     * porque un actor con ubicación privada también
     * puede aparecer en el listado.
     */
    SELECT
        c.idCategoria AS id,
        c.nombre,
        c.icono
    FROM `Categorias` AS c
    INNER JOIN `Actores` AS a
        ON a.idCategoria = c.idCategoria
    LEFT JOIN `Subcategorias` AS s
        ON s.idCategoria = a.idCategoria
       AND s.idSubcategoria = a.idSubcategoria
    INNER JOIN `Ubicaciones` AS ub
        ON ub.idUbicacion = a.idUbicacion
    WHERE
        c.estado = 'A'
        AND a.estado = 'A'
        AND (
            a.idSubcategoria IS NULL
            OR s.estado = 'A'
        )
    GROUP BY
        c.idCategoria,
        c.nombre,
        c.icono
    ORDER BY
        c.nombre ASC,
        c.idCategoria ASC;


    /*
     * RESULT SET 2: departamentos
     *
     * El departamento permanece visible aunque
     * ub.esPublica sea igual a 0.
     *
     * esPublica únicamente protege localidad,
     * dirección, latitud y longitud.
     */
    SELECT
        ub.departamento
    FROM `Actores` AS a
    INNER JOIN `Categorias` AS c
        ON c.idCategoria = a.idCategoria
    LEFT JOIN `Subcategorias` AS s
        ON s.idCategoria = a.idCategoria
       AND s.idSubcategoria = a.idSubcategoria
    INNER JOIN `Ubicaciones` AS ub
        ON ub.idUbicacion = a.idUbicacion
    WHERE
        c.estado = 'A'
        AND a.estado = 'A'
        AND (
            a.idSubcategoria IS NULL
            OR s.estado = 'A'
        )
        AND NULLIF(TRIM(ub.departamento), '') IS NOT NULL
    GROUP BY
        ub.departamento
    ORDER BY
        ub.departamento ASC;

END //

-- -----------------------------------------------------
-- sp_publico_listar_actores
-- -----------------------------------------------------
CREATE OR REPLACE PROCEDURE `sp_publico_listar_actores`(
    IN pBusqueda      VARCHAR(255) DEFAULT NULL,
    IN pDepartamento VARCHAR(100) DEFAULT NULL,
    IN pIdCategoria  INT UNSIGNED DEFAULT NULL,
    IN pLimit         INT DEFAULT 20,
    IN pOffset        INT DEFAULT 0
)
SQL SECURITY DEFINER
READS SQL DATA
COMMENT 'Lista actores culturales activos para el directorio público, con filtros opcionales por nombre, departamento y categoría. Devuelve el total y la página solicitada.'
BEGIN
    DECLARE vBusqueda      VARCHAR(255);
    DECLARE vDepartamento VARCHAR(100);
    DECLARE vIdCategoria  INT UNSIGNED;
    DECLARE vLimit         INT DEFAULT 20;
    DECLARE vOffset        INT DEFAULT 0;

    -- Normalización de argumentos
    SET vBusqueda = NULLIF(TRIM(pBusqueda), '');
    SET vDepartamento = NULLIF(TRIM(pDepartamento), '');

    -- NULL y 0 significan "Todas las categorías"
    SET vIdCategoria = NULLIF(pIdCategoria, 0);

    -- El límite debe estar entre 1 y 100
    SET vLimit = LEAST(
        GREATEST(COALESCE(pLimit, 20), 1),
        100
    );

    -- El desplazamiento no puede ser negativo
    SET vOffset = GREATEST(COALESCE(pOffset, 0), 0);

    -- =========================================================
    -- Resultado 1: cantidad total de coincidencias
    -- =========================================================
    SELECT
        COUNT(*) AS total
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

        AND (
            vBusqueda IS NULL
            OR a.nombre LIKE CONCAT('%', vBusqueda, '%')
            OR a.descripcion LIKE CONCAT('%', vBusqueda, '%')
            OR c.nombre LIKE CONCAT('%', vBusqueda, '%')
            OR s.nombre LIKE CONCAT('%', vBusqueda, '%')
            OR ub.departamento LIKE CONCAT('%', vBusqueda, '%')
            OR (
                ub.esPublica = 1
                AND (
                    ub.localidad LIKE CONCAT('%', vBusqueda, '%')
                    OR ub.direccion LIKE CONCAT('%', vBusqueda, '%')
                )
            )
        )

        AND (
            vDepartamento IS NULL
            OR ub.departamento = vDepartamento
        )

        AND (
            vIdCategoria IS NULL
            OR a.idCategoria = vIdCategoria
        );

    -- =========================================================
    -- Resultado 2: actores de la página solicitada
    -- =========================================================
    SELECT
        a.idActor,
        a.nombre,
        a.descripcion,
        a.fotoPerfilUrl,

        c.idCategoria,
        c.nombre AS categoria,
        c.icono AS categoriaIcono,

        s.idSubcategoria,
        s.nombre AS subcategoria,

        ub.departamento,

        CASE
            WHEN ub.esPublica = 1
            THEN ub.localidad
            ELSE NULL
        END AS localidad

    FROM `Actores` AS a

    INNER JOIN `Categorias` AS c
        ON c.idCategoria = a.idCategoria

    LEFT JOIN `Subcategorias` AS s
        ON s.idCategoria = a.idCategoria
    AND s.idSubcategoria = a.idSubcategoria

    INNER JOIN `Ubicaciones` AS ub
        ON ub.idUbicacion = a.idUbicacion

    WHERE
        a.estado = 'A'
        AND c.estado = 'A'

        AND (
            a.idSubcategoria IS NULL
            OR s.estado = 'A'
        )

        AND (
            vBusqueda IS NULL
            OR a.nombre LIKE CONCAT('%', vBusqueda, '%')
            OR a.descripcion LIKE CONCAT('%', vBusqueda, '%')
            OR c.nombre LIKE CONCAT('%', vBusqueda, '%')
            OR s.nombre LIKE CONCAT('%', vBusqueda, '%')
            OR ub.departamento LIKE CONCAT('%', vBusqueda, '%')
            OR (
                ub.esPublica = 1
                AND (
                    ub.localidad LIKE CONCAT('%', vBusqueda, '%')
                    OR ub.direccion LIKE CONCAT('%', vBusqueda, '%')
                )
            )
        )

        AND (
            vDepartamento IS NULL
            OR ub.departamento = vDepartamento
        )

        AND (
            vIdCategoria IS NULL
            OR a.idCategoria = vIdCategoria
        )

    ORDER BY
        a.nombre ASC,
        a.idActor ASC

    LIMIT vLimit
    OFFSET vOffset;
END //

-- -----------------------------------------------------
-- sp_publico_obtener_actor
-- -----------------------------------------------------

CREATE OR REPLACE PROCEDURE `sp_publico_obtener_actor`(
    IN pIdActor INT
)
SQL SECURITY DEFINER
READS SQL DATA
COMMENT 'Obtiene la ficha pública completa de un actor cultural activo: datos generales, portafolio, eventos, respuestas públicas e integrantes.'
BEGIN
    -- =====================================================
    -- Validación de argumentos
    -- =====================================================
    IF pIdActor IS NULL OR pIdActor <= 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MYSQL_ERRNO = 1644,
                MESSAGE_TEXT = 'pIdActor debe ser un entero positivo';
    END IF;


    -- =====================================================
    -- RESULTADO 1: datos generales del actor
    --
    -- Si el actor no existe, está pendiente, está inactivo
    -- o pertenece a una categoría/subcategoría inactiva,
    -- este conjunto no devolverá filas.
    -- =====================================================
    SELECT
        a.idActor as id,
        a.nombre,
        a.descripcion,
        a.fotoPerfilUrl,
        c.nombre AS categoria,
        c.icono AS categoriaIcono,
        s.nombre AS subcategoria,
        u.provincia,
        u.departamento,
        u.localidad,
        u.esPublica AS esUbicacionPublica,

        CASE
            WHEN u.esPublica = 1 THEN u.direccion
            ELSE NULL
        END AS direccion,

        CASE
            WHEN u.esPublica = 1 THEN u.latitud
            ELSE NULL
        END AS latitud,

        CASE
            WHEN u.esPublica = 1 THEN u.longitud
            ELSE NULL
        END AS longitud

    FROM `Actores` AS a

    INNER JOIN `Categorias` AS c
        ON c.idCategoria = a.idCategoria

    LEFT JOIN `Subcategorias` AS s
        ON s.idCategoria = a.idCategoria
       AND s.idSubcategoria = a.idSubcategoria

    INNER JOIN `Ubicaciones` AS u
        ON u.idUbicacion = a.idUbicacion

    WHERE a.idActor = pIdActor
      AND a.estado = 'A'
      AND c.estado = 'A'
      AND (
            a.idSubcategoria IS NULL
            OR s.estado = 'A'
          );


    -- =====================================================
    -- RESULTADO 2: elementos del portafolio
    -- =====================================================
    SELECT
        ip.tipo,
        ip.descripcion,
        ip.url

    FROM `ItemsPortafolio` AS ip

    INNER JOIN `Actores` AS a
        ON a.idActor = ip.idActor

    INNER JOIN `Categorias` AS c
        ON c.idCategoria = a.idCategoria

    LEFT JOIN `Subcategorias` AS s
        ON s.idCategoria = a.idCategoria
       AND s.idSubcategoria = a.idSubcategoria

    WHERE a.idActor = pIdActor
      AND a.estado = 'A'
      AND c.estado = 'A'
      AND (
            a.idSubcategoria IS NULL
            OR s.estado = 'A'
          )

    ORDER BY ip.idItem DESC;


    -- =====================================================
    -- RESULTADO 3: eventos activos
    --
    -- Orden:
    --   1. Eventos futuros, del más próximo al más lejano.
    --   2. Eventos pasados, del más reciente al más antiguo.
    -- =====================================================
    SELECT
        e.nombre,
        e.descripcion,
        e.fecha

    FROM `Eventos` AS e

    INNER JOIN `Actores` AS a
        ON a.idActor = e.idActor

    INNER JOIN `Categorias` AS c
        ON c.idCategoria = a.idCategoria

    LEFT JOIN `Subcategorias` AS s
        ON s.idCategoria = a.idCategoria
       AND s.idSubcategoria = a.idSubcategoria

    WHERE a.idActor = pIdActor
      AND a.estado = 'A'
      AND c.estado = 'A'
      AND (
            a.idSubcategoria IS NULL
            OR s.estado = 'A'
          )
      AND e.estado = 'A'

    ORDER BY
        CASE
            WHEN e.fecha >= CURRENT_TIMESTAMP THEN 0
            ELSE 1
        END ASC,

        CASE
            WHEN e.fecha >= CURRENT_TIMESTAMP THEN e.fecha
            ELSE NULL
        END ASC,

        CASE
            WHEN e.fecha < CURRENT_TIMESTAMP THEN e.fecha
            ELSE NULL
        END DESC,

        e.idEvento DESC;


    -- =====================================================
    -- RESULTADO 4: preguntas y respuestas públicas
    --
    -- Se incluyen solamente:
    --   - preguntas activas;
    --   - preguntas marcadas como públicas;
    --   - formularios aplicables a la categoría actual;
    --   - formularios aplicables a la subcategoría actual.
    -- =====================================================
    SELECT
        p.pregunta,
        r.valor AS respuesta
    FROM `Respuestas` AS r

    INNER JOIN `Actores` AS a
        ON a.idActor = r.idActor

    INNER JOIN `Categorias` AS c
        ON c.idCategoria = a.idCategoria

    LEFT JOIN `Subcategorias` AS s
        ON s.idCategoria = a.idCategoria
       AND s.idSubcategoria = a.idSubcategoria

    INNER JOIN `Formularios` AS f
        ON f.idFormulario = r.idFormulario

    INNER JOIN `PreguntasFormulario` AS pf
        ON pf.idFormulario = r.idFormulario
       AND pf.idPregunta = r.idPregunta

    INNER JOIN `Preguntas` AS p
        ON p.idPregunta = r.idPregunta

    WHERE a.idActor = pIdActor
      AND a.estado = 'A'
      AND c.estado = 'A'
      AND (
            a.idSubcategoria IS NULL
            OR s.estado = 'A'
          )

      -- El formulario debe corresponder a la categoría
      -- actual del actor.
      AND f.idCategoria = a.idCategoria

      -- Puede ser el formulario general de la categoría
      -- o el formulario específico de su subcategoría.
      AND (
            f.idSubcategoria IS NULL
            OR f.idSubcategoria = a.idSubcategoria
          )

      AND pf.estado = 'A'
      AND pf.esPublico = 1

    ORDER BY
        CASE
            WHEN f.idSubcategoria IS NULL THEN 0
            ELSE 1
        END ASC,

        f.idFormulario ASC,
        pf.orden ASC,
        p.idPregunta ASC;


    -- =====================================================
    -- RESULTADO 5: integrantes
    --
    -- Solo se muestran integrantes cuyo usuario se
    -- encuentre activo.
    -- =====================================================
    SELECT
        u.nombre,
        u.apellido,
        i.rol

    FROM `Integrantes` AS i

    INNER JOIN `Usuarios` AS u
        ON u.idUsuario = i.idUsuario

    INNER JOIN `Actores` AS a
        ON a.idActor = i.idActor

    INNER JOIN `Categorias` AS c
        ON c.idCategoria = a.idCategoria

    LEFT JOIN `Subcategorias` AS s
        ON s.idCategoria = a.idCategoria
       AND s.idSubcategoria = a.idSubcategoria

    WHERE a.idActor = pIdActor
      AND a.estado = 'A'
      AND c.estado = 'A'
      AND (
            a.idSubcategoria IS NULL
            OR s.estado = 'A'
          )
      AND u.estado = 'A'

    ORDER BY
        u.apellido ASC,
        u.nombre ASC;

END //

-- -----------------------------------------------------
-- sp_interno_validar_opciones_pregunta
-- -----------------------------------------------------
CREATE OR REPLACE PROCEDURE `sp_interno_validar_opciones_pregunta`(
    IN pTipoDato VARCHAR(20),
    IN pOpciones JSON
)
READS SQL DATA
COMMENT 'Valida que las opciones de una pregunta sean coherentes con su tipo de dato, no estén vacías y no contengan duplicados.'
BEGIN
    IF pTipoDato IN ('OPCION_UNICA', 'OPCION_MULTIPLE') THEN
        IF pOpciones IS NULL
           OR pOpciones IS NOT JSON ARRAY
           OR JSON_LENGTH(pOpciones) < 2
           OR JSON_LENGTH(pOpciones) > 100 THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Las preguntas de opción requieren un arreglo JSON de entre 2 y 100 valores.';
        END IF;

        IF EXISTS (
            SELECT 1
            FROM JSON_TABLE(
                pOpciones,
                '$[*]' COLUMNS (
                    ord FOR ORDINALITY
                )
            ) AS jt
            WHERE JSON_TYPE(
                    JSON_EXTRACT(
                        pOpciones,
                        CONCAT('$[', jt.ord - 1, ']')
                    )
                  ) <> 'STRING'
               OR JSON_UNQUOTE(
                    JSON_EXTRACT(
                        pOpciones,
                        CONCAT('$[', jt.ord - 1, ']')
                    )
                  ) <> TRIM(
                    JSON_UNQUOTE(
                        JSON_EXTRACT(
                            pOpciones,
                            CONCAT('$[', jt.ord - 1, ']')
                        )
                    )
                  )
               OR TRIM(
                    JSON_UNQUOTE(
                        JSON_EXTRACT(
                            pOpciones,
                            CONCAT('$[', jt.ord - 1, ']')
                        )
                    )
                  ) = ''
               OR CHAR_LENGTH(
                    JSON_UNQUOTE(
                        JSON_EXTRACT(
                            pOpciones,
                            CONCAT('$[', jt.ord - 1, ']')
                        )
                    )
                  ) > 255
        ) THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Cada opción debe estar recortada y tener entre 1 y 255 caracteres.';
        END IF;

        IF EXISTS (
            SELECT 1
            FROM (
                SELECT
                    LOWER(
                        JSON_UNQUOTE(
                            JSON_EXTRACT(
                                pOpciones,
                                CONCAT('$[', jt.ord - 1, ']')
                            )
                        )
                    ) AS opcionNormalizada
                FROM JSON_TABLE(
                    pOpciones,
                    '$[*]' COLUMNS (
                        ord FOR ORDINALITY
                    )
                ) AS jt
                GROUP BY opcionNormalizada
                HAVING COUNT(*) > 1
            ) AS opcionesDuplicadas
        ) THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Las opciones de una pregunta no pueden repetirse.';
        END IF;

    ELSEIF pOpciones IS NOT NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Solo las preguntas de opción pueden contener opciones.';
    END IF;
END //

-- -----------------------------------------------------
-- sp_interno_validar_valor_respuesta
-- -----------------------------------------------------
CREATE OR REPLACE PROCEDURE `sp_interno_validar_valor_respuesta`(
    IN pTipoDato VARCHAR(20),
    IN pOpciones JSON,
    IN pValor JSON
)
READS SQL DATA
COMMENT 'Valida el tipo y el contenido JSON de una respuesta según la definición de la pregunta.'
BEGIN
    DECLARE vTexto LONGTEXT;

    IF pValor IS NULL
       OR pValor IS NOT JSON
       OR JSON_TYPE(pValor) = 'NULL' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La respuesta debe contener un valor JSON válido y distinto de null.';
    END IF;

    IF pTipoDato = 'TEXTO' THEN
        IF JSON_TYPE(pValor) <> 'STRING'
           OR TRIM(JSON_UNQUOTE(pValor)) = '' THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'La respuesta TEXTO debe ser una cadena no vacía.';
        END IF;

    ELSEIF pTipoDato = 'NUMERO' THEN
        IF JSON_TYPE(pValor) NOT IN ('INTEGER', 'DOUBLE') THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'La respuesta NUMERO debe ser un número JSON.';
        END IF;

    ELSEIF pTipoDato = 'BOOLEANO' THEN
        IF JSON_TYPE(pValor) <> 'BOOLEAN' THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'La respuesta BOOLEANO debe ser true o false.';
        END IF;

    ELSEIF pTipoDato = 'FECHA' THEN
        SET vTexto = JSON_UNQUOTE(pValor);

        IF JSON_TYPE(pValor) <> 'STRING'
           OR vTexto NOT REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
           OR STR_TO_DATE(vTexto, '%Y-%m-%d') IS NULL
           OR DATE_FORMAT(STR_TO_DATE(vTexto, '%Y-%m-%d'), '%Y-%m-%d') <> vTexto THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'La respuesta FECHA debe usar YYYY-MM-DD y ser válida.';
        END IF;

    ELSEIF pTipoDato = 'URL' THEN
        IF JSON_TYPE(pValor) <> 'STRING'
           OR JSON_UNQUOTE(pValor) NOT REGEXP '^https?://[^[:space:]]+$' THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'La respuesta URL debe usar HTTP o HTTPS.';
        END IF;

    ELSEIF pTipoDato = 'EMAIL' THEN
        IF JSON_TYPE(pValor) <> 'STRING'
           OR JSON_UNQUOTE(pValor) NOT REGEXP '^[^[:space:]@]+@[^[:space:]@]+\\.[^[:space:]@]+$' THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'La respuesta EMAIL no tiene un formato válido.';
        END IF;

    ELSEIF pTipoDato = 'TELEFONO' THEN
        IF JSON_TYPE(pValor) <> 'STRING'
           OR JSON_UNQUOTE(pValor) NOT REGEXP '^[0-9+() .-]{6,30}$' THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'La respuesta TELEFONO no tiene un formato válido.';
        END IF;

    ELSEIF pTipoDato = 'OPCION_UNICA' THEN
        IF pOpciones IS NULL
           OR pOpciones IS NOT JSON ARRAY
           OR JSON_TYPE(pValor) <> 'STRING'
           OR COALESCE(JSON_CONTAINS(pOpciones, pValor, '$'), 0) = 0 THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'La respuesta no pertenece a las opciones permitidas.';
        END IF;

    ELSEIF pTipoDato = 'OPCION_MULTIPLE' THEN
        IF pOpciones IS NULL OR pOpciones IS NOT JSON ARRAY THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'La pregunta no tiene opciones válidas configuradas.';
        END IF;

        IF pValor IS NOT JSON ARRAY OR JSON_LENGTH(pValor) = 0 THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'La respuesta múltiple debe ser un arreglo no vacío.';
        END IF;

        IF EXISTS (
            SELECT 1
            FROM JSON_TABLE(
                pValor,
                '$[*]' COLUMNS (
                    ord FOR ORDINALITY
                )
            ) AS jt
            WHERE JSON_TYPE(
                    JSON_EXTRACT(
                        pValor,
                        CONCAT('$[', jt.ord - 1, ']')
                    )
                  ) <> 'STRING'
               OR COALESCE(
                    JSON_CONTAINS(
                        pOpciones,
                        JSON_EXTRACT(
                            pValor,
                            CONCAT('$[', jt.ord - 1, ']')
                        ),
                        '$'
                    ),
                    0
                  ) = 0
        ) THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'La respuesta múltiple contiene una opción inválida.';
        END IF;

        IF EXISTS (
            SELECT 1
            FROM (
                SELECT
                    JSON_UNQUOTE(
                        JSON_EXTRACT(
                            pValor,
                            CONCAT('$[', jt.ord - 1, ']')
                        )
                    ) AS opcionElegida
                FROM JSON_TABLE(
                    pValor,
                    '$[*]' COLUMNS (
                        ord FOR ORDINALITY
                    )
                ) AS jt
                GROUP BY opcionElegida
                HAVING COUNT(*) > 1
            ) AS opcionesDuplicadas
        ) THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Una opción no puede repetirse en la respuesta.';
        END IF;

    ELSE
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El tipo de dato de la pregunta no es válido.';
    END IF;
END //

-- -----------------------------------------------------
-- sp_admin_listar_formularios
-- -----------------------------------------------------
CREATE OR REPLACE PROCEDURE `sp_admin_listar_formularios`(
    IN pBusqueda VARCHAR(255) DEFAULT NULL,
    IN pIdCategoria INT DEFAULT NULL,
    IN pAmbito VARCHAR(20) DEFAULT 'TODOS',
    IN pLimit INT DEFAULT 25,
    IN pOffset INT DEFAULT 0
)
READS SQL DATA
COMMENT 'Lista formularios para administración con filtros por texto, categoría y ámbito. Devuelve el total y la página solicitada.'
BEGIN
    DECLARE vLimit INT DEFAULT 25;
    DECLARE vOffset INT DEFAULT 0;
    DECLARE vAmbito VARCHAR(20) DEFAULT 'TODOS';

    SET vLimit = LEAST(GREATEST(COALESCE(pLimit, 25), 1), 100);
    SET vOffset = GREATEST(COALESCE(pOffset, 0), 0);
    SET vAmbito = UPPER(COALESCE(NULLIF(TRIM(pAmbito), ''), 'TODOS'));

    IF vAmbito NOT IN ('TODOS', 'CATEGORIA', 'SUBCATEGORIA') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El ámbito debe ser TODOS, CATEGORIA o SUBCATEGORIA.';
    END IF;

    SELECT COUNT(*) AS total
    FROM `Formularios` f
    INNER JOIN `Categorias` c
        ON c.idCategoria = f.idCategoria
    LEFT JOIN `Subcategorias` s
        ON s.idCategoria = f.idCategoria
       AND s.idSubcategoria = f.idSubcategoria
    WHERE
        (
            pBusqueda IS NULL
            OR TRIM(pBusqueda) = ''
            OR f.titulo LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR f.descripcion LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR c.nombre LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR s.nombre LIKE CONCAT('%', TRIM(pBusqueda), '%')
        )
        AND (pIdCategoria IS NULL OR f.idCategoria = pIdCategoria)
        AND (
            vAmbito = 'TODOS'
            OR (vAmbito = 'CATEGORIA' AND f.idSubcategoria IS NULL)
            OR (vAmbito = 'SUBCATEGORIA' AND f.idSubcategoria IS NOT NULL)
        );

    SELECT
        f.idFormulario,
        f.idCategoria,
        c.nombre AS categoria,
        c.estado AS estadoCategoria,
        f.idSubcategoria,
        s.nombre AS subcategoria,
        s.estado AS estadoSubcategoria,
        CASE
            WHEN f.idSubcategoria IS NULL THEN 'CATEGORIA'
            ELSE 'SUBCATEGORIA'
        END AS ambito,
        f.titulo,
        f.descripcion,
        f.fechaCreacion,
        COALESCE(pa.cantidadPreguntasHistoricas, 0) AS cantidadPreguntasHistoricas,
        COALESCE(pa.cantidadPreguntasActivas, 0) AS cantidadPreguntasActivas,
        COALESCE(pa.cantidadObligatorias, 0) AS cantidadObligatorias,
        COALESCE(ra.cantidadActoresConRespuestas, 0) AS cantidadActoresConRespuestas
    FROM `Formularios` f
    INNER JOIN `Categorias` c
        ON c.idCategoria = f.idCategoria
    LEFT JOIN `Subcategorias` s
        ON s.idCategoria = f.idCategoria
       AND s.idSubcategoria = f.idSubcategoria
    LEFT JOIN (
        SELECT
            pf.idFormulario,
            COUNT(*) AS cantidadPreguntasHistoricas,
            SUM(pf.estado = 'A') AS cantidadPreguntasActivas,
            SUM(pf.estado = 'A' AND pf.esObligatorio = 1) AS cantidadObligatorias
        FROM `PreguntasFormulario` pf
        GROUP BY pf.idFormulario
    ) pa
        ON pa.idFormulario = f.idFormulario
    LEFT JOIN (
        SELECT
            r.idFormulario,
            COUNT(DISTINCT r.idActor) AS cantidadActoresConRespuestas
        FROM `Respuestas` r
        GROUP BY r.idFormulario
    ) ra
        ON ra.idFormulario = f.idFormulario
    WHERE
        (
            pBusqueda IS NULL
            OR TRIM(pBusqueda) = ''
            OR f.titulo LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR f.descripcion LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR c.nombre LIKE CONCAT('%', TRIM(pBusqueda), '%')
            OR s.nombre LIKE CONCAT('%', TRIM(pBusqueda), '%')
        )
        AND (pIdCategoria IS NULL OR f.idCategoria = pIdCategoria)
        AND (
            vAmbito = 'TODOS'
            OR (vAmbito = 'CATEGORIA' AND f.idSubcategoria IS NULL)
            OR (vAmbito = 'SUBCATEGORIA' AND f.idSubcategoria IS NOT NULL)
        )
    ORDER BY c.nombre ASC, s.nombre ASC, f.idFormulario ASC
    LIMIT vLimit OFFSET vOffset;
END //

-- -----------------------------------------------------
-- sp_admin_crear_formulario
-- -----------------------------------------------------
CREATE OR REPLACE PROCEDURE `sp_admin_crear_formulario`(
    IN pIdCategoria INT,
    IN pIdSubcategoria INT,
    IN pTitulo VARCHAR(150),
    IN pDescripcion VARCHAR(1000) DEFAULT NULL
)
MODIFIES SQL DATA
COMMENT 'Crea el único formulario correspondiente a una categoría o subcategoría activa.'
BEGIN
    DECLARE vTitulo VARCHAR(150);
    DECLARE vDescripcion VARCHAR(1000);
    DECLARE vEstadoCategoria CHAR(1);
    DECLARE vEstadoSubcategoria CHAR(1);
    DECLARE vIdFormulario INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    SET vTitulo = NULLIF(TRIM(pTitulo), '');
    SET vDescripcion = NULLIF(TRIM(pDescripcion), '');

    IF pIdCategoria IS NULL OR pIdCategoria <= 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La categoría del formulario es obligatoria.';
    END IF;

    IF vTitulo IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El título del formulario es obligatorio.';
    END IF;

    IF CHAR_LENGTH(vTitulo) > 150 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El título no puede superar los 150 caracteres.';
    END IF;

    IF vDescripcion IS NOT NULL AND CHAR_LENGTH(vDescripcion) > 1000 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La descripción no puede superar los 1000 caracteres.';
    END IF;

    START TRANSACTION;

    IF NOT EXISTS (
        SELECT 1
        FROM `Categorias` c
        WHERE c.idCategoria = pIdCategoria
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La categoría indicada no existe.';
    END IF;

    SELECT c.estado
      INTO vEstadoCategoria
    FROM `Categorias` c
    WHERE c.idCategoria = pIdCategoria
    FOR UPDATE;

    IF vEstadoCategoria <> 'A' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La categoría debe estar activa.';
    END IF;

    IF pIdSubcategoria IS NOT NULL THEN
        IF pIdSubcategoria <= 0 OR NOT EXISTS (
            SELECT 1
            FROM `Subcategorias` s
            WHERE s.idCategoria = pIdCategoria
              AND s.idSubcategoria = pIdSubcategoria
        ) THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'La subcategoría indicada no existe en la categoría.';
        END IF;

        SELECT s.estado
          INTO vEstadoSubcategoria
        FROM `Subcategorias` s
        WHERE s.idCategoria = pIdCategoria
          AND s.idSubcategoria = pIdSubcategoria
        FOR UPDATE;

        IF vEstadoSubcategoria <> 'A' THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'La subcategoría debe estar activa.';
        END IF;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM `Formularios` f
        WHERE f.idCategoria = pIdCategoria
          AND f.idSubcategoria <=> pIdSubcategoria
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Ya existe un formulario para ese ámbito.';
    END IF;

    INSERT INTO `Formularios` (
        idCategoria,
        idSubcategoria,
        titulo,
        descripcion
    )
    VALUES (
        pIdCategoria,
        pIdSubcategoria,
        vTitulo,
        vDescripcion
    );

    SET vIdFormulario = LAST_INSERT_ID();

    COMMIT;

    SELECT
        f.idFormulario,
        f.idCategoria,
        c.nombre AS categoria,
        f.idSubcategoria,
        s.nombre AS subcategoria,
        f.titulo,
        f.descripcion,
        f.fechaCreacion
    FROM `Formularios` f
    INNER JOIN `Categorias` c
        ON c.idCategoria = f.idCategoria
    LEFT JOIN `Subcategorias` s
        ON s.idCategoria = f.idCategoria
       AND s.idSubcategoria = f.idSubcategoria
    WHERE f.idFormulario = vIdFormulario;
END //

-- -----------------------------------------------------
-- sp_admin_editar_formulario
-- -----------------------------------------------------
CREATE OR REPLACE PROCEDURE `sp_admin_editar_formulario`(
    IN pIdFormulario INT,
    IN pTitulo VARCHAR(150),
    IN pDescripcion VARCHAR(1000)
)
MODIFIES SQL DATA
COMMENT 'Modifica el título y la descripción de un formulario sin cambiar su categoría o subcategoría.'
BEGIN
    DECLARE vTitulo VARCHAR(150);
    DECLARE vDescripcion VARCHAR(1000);

    SET vTitulo = NULLIF(TRIM(pTitulo), '');
    SET vDescripcion = NULLIF(TRIM(pDescripcion), '');

    IF pIdFormulario IS NULL OR pIdFormulario <= 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El formulario es obligatorio.';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM `Formularios` f WHERE f.idFormulario = pIdFormulario
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El formulario indicado no existe.';
    END IF;

    IF vTitulo IS NULL OR CHAR_LENGTH(vTitulo) > 150 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El título debe tener entre 1 y 150 caracteres.';
    END IF;

    IF vDescripcion IS NOT NULL AND CHAR_LENGTH(vDescripcion) > 1000 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La descripción no puede superar los 1000 caracteres.';
    END IF;

    UPDATE `Formularios`
    SET titulo = vTitulo,
        descripcion = vDescripcion
    WHERE idFormulario = pIdFormulario;

    SELECT
        f.idFormulario,
        f.idCategoria,
        c.nombre AS categoria,
        f.idSubcategoria,
        s.nombre AS subcategoria,
        f.titulo,
        f.descripcion,
        f.fechaCreacion
    FROM `Formularios` f
    INNER JOIN `Categorias` c
        ON c.idCategoria = f.idCategoria
    LEFT JOIN `Subcategorias` s
        ON s.idCategoria = f.idCategoria
       AND s.idSubcategoria = f.idSubcategoria
    WHERE f.idFormulario = pIdFormulario;
END //

-- -----------------------------------------------------
-- sp_admin_crear_pregunta
-- -----------------------------------------------------
CREATE OR REPLACE PROCEDURE `sp_admin_crear_pregunta`(
    IN pPregunta VARCHAR(500),
    IN pTipoDato VARCHAR(20),
    IN pOpciones JSON DEFAULT NULL
)
MODIFIES SQL DATA
COMMENT 'Crea una pregunta reutilizable después de validar el tipo de dato y sus posibles opciones.'
BEGIN
    DECLARE vPregunta VARCHAR(500);
    DECLARE vTipoDato VARCHAR(20);
    DECLARE vIdPregunta INT;

    SET vPregunta = NULLIF(TRIM(pPregunta), '');
    SET vTipoDato = UPPER(NULLIF(TRIM(pTipoDato), ''));

    IF vPregunta IS NULL OR CHAR_LENGTH(vPregunta) > 500 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La pregunta debe tener entre 1 y 500 caracteres.';
    END IF;

    IF vTipoDato IS NULL OR vTipoDato NOT IN (
        'TEXTO',
        'NUMERO',
        'BOOLEANO',
        'FECHA',
        'URL',
        'EMAIL',
        'TELEFONO',
        'OPCION_UNICA',
        'OPCION_MULTIPLE'
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El tipo de dato de la pregunta no es válido.';
    END IF;

    CALL `sp_interno_validar_opciones_pregunta`(vTipoDato, pOpciones);

    IF EXISTS (
        SELECT 1
        FROM `Preguntas` p
        WHERE LOWER(p.pregunta) = LOWER(vPregunta)
          AND p.tipoDato = vTipoDato
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Ya existe una pregunta equivalente con ese tipo.';
    END IF;

    INSERT INTO `Preguntas` (
        pregunta,
        tipoDato,
        opciones
    )
    VALUES (
        vPregunta,
        vTipoDato,
        pOpciones
    );

    SET vIdPregunta = LAST_INSERT_ID();

    SELECT
        p.idPregunta,
        p.pregunta,
        p.tipoDato,
        p.opciones
    FROM `Preguntas` p
    WHERE p.idPregunta = vIdPregunta;
END //

-- -----------------------------------------------------
-- sp_admin_agregar_pregunta_formulario
-- -----------------------------------------------------
CREATE OR REPLACE PROCEDURE `sp_admin_agregar_pregunta_formulario`(
    IN pIdFormulario INT,
    IN pIdPregunta INT,
    IN pOrden INT,
    IN pEsObligatorio TINYINT,
    IN pEsPublico TINYINT
)
MODIFIES SQL DATA
COMMENT 'Incorpora una pregunta existente a un formulario y ajusta el orden de las preguntas activas.'
BEGIN
    DECLARE vOrden INT;
    DECLARE vIdFormularioBloqueado INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF pIdFormulario IS NULL OR NOT EXISTS (
        SELECT 1 FROM `Formularios` f WHERE f.idFormulario = pIdFormulario
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El formulario indicado no existe.';
    END IF;

    IF pIdPregunta IS NULL OR NOT EXISTS (
        SELECT 1 FROM `Preguntas` p WHERE p.idPregunta = pIdPregunta
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La pregunta indicada no existe.';
    END IF;

    IF pEsObligatorio IS NULL
       OR pEsPublico IS NULL
       OR pEsObligatorio NOT IN (0, 1)
       OR pEsPublico NOT IN (0, 1) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'esObligatorio y esPublico deben ser 0 o 1.';
    END IF;

    START TRANSACTION;

    SELECT f.idFormulario
      INTO vIdFormularioBloqueado
    FROM `Formularios` f
    WHERE f.idFormulario = pIdFormulario
    FOR UPDATE;

    IF EXISTS (
        SELECT 1
        FROM `PreguntasFormulario` pf
        WHERE pf.idFormulario = pIdFormulario
          AND pf.idPregunta = pIdPregunta
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La pregunta ya fue incorporada a ese formulario.';
    END IF;

    SELECT COALESCE(MAX(pf.orden), 0) + 1
      INTO vOrden
    FROM `PreguntasFormulario` pf
    WHERE pf.idFormulario = pIdFormulario
      AND pf.estado = 'A';

    IF pOrden IS NOT NULL THEN
        IF pOrden <= 0 OR pOrden > vOrden THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'El orden debe estar entre 1 y la última posición disponible.';
        END IF;

        SET vOrden = pOrden;

        UPDATE `PreguntasFormulario`
        SET orden = orden + 1
        WHERE idFormulario = pIdFormulario
          AND estado = 'A'
          AND orden >= vOrden
        ORDER BY orden DESC;
    END IF;

    INSERT INTO `PreguntasFormulario` (
        idFormulario,
        idPregunta,
        idPreguntaReemplazada,
        orden,
        esObligatorio,
        esPublico,
        fechaIncorporacion,
        fechaDesactivacion,
        estado
    )
    VALUES (
        pIdFormulario,
        pIdPregunta,
        NULL,
        vOrden,
        pEsObligatorio,
        pEsPublico,
        CURRENT_TIMESTAMP,
        NULL,
        'A'
    );

    COMMIT;

    SELECT
        pf.idFormulario,
        pf.idPregunta,
        p.pregunta,
        p.tipoDato,
        p.opciones,
        pf.orden,
        pf.esObligatorio,
        pf.esPublico,
        pf.fechaIncorporacion,
        pf.estado
    FROM `PreguntasFormulario` pf
    INNER JOIN `Preguntas` p
        ON p.idPregunta = pf.idPregunta
    WHERE pf.idFormulario = pIdFormulario
      AND pf.idPregunta = pIdPregunta;
END //

-- -----------------------------------------------------
-- sp_admin_reemplazar_pregunta_formulario
-- -----------------------------------------------------
CREATE OR REPLACE PROCEDURE `sp_admin_reemplazar_pregunta_formulario`(
    IN pIdFormulario INT,
    IN pIdPreguntaAnterior INT,
    IN pIdPreguntaNueva INT,
    IN pEsObligatorio TINYINT DEFAULT NULL,
    IN pEsPublico TINYINT DEFAULT NULL
)
MODIFIES SQL DATA
COMMENT 'Desactiva una pregunta activa e incorpora otra en la misma posición, conservando el vínculo histórico de reemplazo.'
BEGIN
    DECLARE vOrden INT;
    DECLARE vObligatoriaAnterior TINYINT;
    DECLARE vPublicaAnterior TINYINT;
    DECLARE vEsObligatorio TINYINT;
    DECLARE vEsPublico TINYINT;
    DECLARE vIdFormularioBloqueado INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF pIdPreguntaAnterior = pIdPreguntaNueva THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La pregunta nueva debe ser diferente de la reemplazada.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM `PreguntasFormulario` pf
        WHERE pf.idFormulario = pIdFormulario
          AND pf.idPregunta = pIdPreguntaAnterior
          AND pf.estado = 'A'
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La pregunta anterior no está activa en el formulario.';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM `Preguntas` p WHERE p.idPregunta = pIdPreguntaNueva
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La pregunta nueva no existe.';
    END IF;

    IF pEsObligatorio IS NOT NULL AND pEsObligatorio NOT IN (0, 1) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'esObligatorio debe ser NULL, 0 o 1.';
    END IF;

    IF pEsPublico IS NOT NULL AND pEsPublico NOT IN (0, 1) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'esPublico debe ser NULL, 0 o 1.';
    END IF;

    START TRANSACTION;

    SELECT f.idFormulario
      INTO vIdFormularioBloqueado
    FROM `Formularios` f
    WHERE f.idFormulario = pIdFormulario
    FOR UPDATE;

    IF EXISTS (
        SELECT 1
        FROM `PreguntasFormulario` pf
        WHERE pf.idFormulario = pIdFormulario
          AND pf.idPregunta = pIdPreguntaNueva
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La pregunta nueva ya pertenece al formulario.';
    END IF;

    SELECT
        pf.orden,
        pf.esObligatorio,
        pf.esPublico
      INTO
        vOrden,
        vObligatoriaAnterior,
        vPublicaAnterior
    FROM `PreguntasFormulario` pf
    WHERE pf.idFormulario = pIdFormulario
      AND pf.idPregunta = pIdPreguntaAnterior
    FOR UPDATE;

    SET vEsObligatorio = COALESCE(pEsObligatorio, vObligatoriaAnterior);
    SET vEsPublico = COALESCE(pEsPublico, vPublicaAnterior);

    UPDATE `PreguntasFormulario`
    SET estado = 'I',
        fechaDesactivacion = CURRENT_TIMESTAMP
    WHERE idFormulario = pIdFormulario
      AND idPregunta = pIdPreguntaAnterior;

    INSERT INTO `PreguntasFormulario` (
        idFormulario,
        idPregunta,
        idPreguntaReemplazada,
        orden,
        esObligatorio,
        esPublico,
        fechaIncorporacion,
        fechaDesactivacion,
        estado
    )
    VALUES (
        pIdFormulario,
        pIdPreguntaNueva,
        pIdPreguntaAnterior,
        vOrden,
        vEsObligatorio,
        vEsPublico,
        CURRENT_TIMESTAMP,
        NULL,
        'A'
    );

    COMMIT;

    SELECT
        pf.idFormulario,
        pf.idPregunta,
        p.pregunta,
        pf.idPreguntaReemplazada,
        pr.pregunta AS preguntaReemplazada,
        pf.orden,
        pf.esObligatorio,
        pf.esPublico,
        pf.fechaIncorporacion,
        pf.estado
    FROM `PreguntasFormulario` pf
    INNER JOIN `Preguntas` p
        ON p.idPregunta = pf.idPregunta
    LEFT JOIN `Preguntas` pr
        ON pr.idPregunta = pf.idPreguntaReemplazada
    WHERE pf.idFormulario = pIdFormulario
      AND pf.idPregunta = pIdPreguntaNueva;
END //

-- -----------------------------------------------------
-- sp_admin_desactivar_pregunta_formulario
-- -----------------------------------------------------
CREATE OR REPLACE PROCEDURE `sp_admin_desactivar_pregunta_formulario`(
    IN pIdFormulario INT,
    IN pIdPregunta INT
)
MODIFIES SQL DATA
COMMENT 'Desactiva una pregunta del formulario sin eliminarla ni borrar sus respuestas históricas.'
BEGIN
    DECLARE vOrden INT;
    DECLARE vIdFormularioBloqueado INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF NOT EXISTS (
        SELECT 1
        FROM `PreguntasFormulario` pf
        WHERE pf.idFormulario = pIdFormulario
          AND pf.idPregunta = pIdPregunta
          AND pf.estado = 'A'
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La pregunta no está activa en el formulario.';
    END IF;

    START TRANSACTION;

    SELECT f.idFormulario
      INTO vIdFormularioBloqueado
    FROM `Formularios` f
    WHERE f.idFormulario = pIdFormulario
    FOR UPDATE;

    SELECT pf.orden
      INTO vOrden
    FROM `PreguntasFormulario` pf
    WHERE pf.idFormulario = pIdFormulario
      AND pf.idPregunta = pIdPregunta
    FOR UPDATE;

    UPDATE `PreguntasFormulario`
    SET estado = 'I',
        fechaDesactivacion = CURRENT_TIMESTAMP
    WHERE idFormulario = pIdFormulario
      AND idPregunta = pIdPregunta;

    UPDATE `PreguntasFormulario`
    SET orden = orden - 1
    WHERE idFormulario = pIdFormulario
      AND estado = 'A'
      AND orden > vOrden
    ORDER BY orden ASC;

    COMMIT;

    SELECT
        pf.idFormulario,
        pf.idPregunta,
        p.pregunta,
        pf.orden,
        pf.fechaIncorporacion,
        pf.fechaDesactivacion,
        pf.estado
    FROM `PreguntasFormulario` pf
    INNER JOIN `Preguntas` p
        ON p.idPregunta = pf.idPregunta
    WHERE pf.idFormulario = pIdFormulario
      AND pf.idPregunta = pIdPregunta;
END //

-- -----------------------------------------------------
-- sp_admin_obtener_formulario
-- -----------------------------------------------------
CREATE OR REPLACE PROCEDURE `sp_admin_obtener_formulario`(
    IN pIdFormulario INT
)
READS SQL DATA
COMMENT 'Obtiene la cabecera de un formulario y todas sus preguntas, incluidas las inactivas y reemplazadas.'
BEGIN
    IF pIdFormulario IS NULL OR NOT EXISTS (
        SELECT 1 FROM `Formularios` f WHERE f.idFormulario = pIdFormulario
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El formulario indicado no existe.';
    END IF;

    SELECT
        f.idFormulario,
        f.idCategoria,
        c.nombre AS categoria,
        c.estado AS estadoCategoria,
        f.idSubcategoria,
        s.nombre AS subcategoria,
        s.estado AS estadoSubcategoria,
        f.titulo,
        f.descripcion,
        f.fechaCreacion,
        COALESCE(pa.cantidadPreguntasHistoricas, 0) AS cantidadPreguntasHistoricas,
        COALESCE(pa.cantidadPreguntasActivas, 0) AS cantidadPreguntasActivas,
        COALESCE(ra.cantidadActoresConRespuestas, 0) AS cantidadActoresConRespuestas
    FROM `Formularios` f
    INNER JOIN `Categorias` c
        ON c.idCategoria = f.idCategoria
    LEFT JOIN `Subcategorias` s
        ON s.idCategoria = f.idCategoria
       AND s.idSubcategoria = f.idSubcategoria
    LEFT JOIN (
        SELECT
            pf.idFormulario,
            COUNT(*) AS cantidadPreguntasHistoricas,
            SUM(pf.estado = 'A') AS cantidadPreguntasActivas
        FROM `PreguntasFormulario` pf
        WHERE pf.idFormulario = pIdFormulario
        GROUP BY pf.idFormulario
    ) pa
        ON pa.idFormulario = f.idFormulario
    LEFT JOIN (
        SELECT
            r.idFormulario,
            COUNT(DISTINCT r.idActor) AS cantidadActoresConRespuestas
        FROM `Respuestas` r
        WHERE r.idFormulario = pIdFormulario
        GROUP BY r.idFormulario
    ) ra
        ON ra.idFormulario = f.idFormulario
    WHERE f.idFormulario = pIdFormulario;

    SELECT
        pf.idFormulario,
        pf.idPregunta,
        p.pregunta,
        p.tipoDato,
        p.opciones,
        pf.idPreguntaReemplazada,
        pr.pregunta AS preguntaReemplazada,
        pf.orden,
        pf.esObligatorio,
        pf.esPublico,
        pf.fechaIncorporacion,
        pf.fechaDesactivacion,
        pf.estado,
        COALESCE(ra.cantidadActoresQueRespondieron, 0) AS cantidadActoresQueRespondieron
    FROM `PreguntasFormulario` pf
    INNER JOIN `Preguntas` p
        ON p.idPregunta = pf.idPregunta
    LEFT JOIN `Preguntas` pr
        ON pr.idPregunta = pf.idPreguntaReemplazada
    LEFT JOIN (
        SELECT
            r.idFormulario,
            r.idPregunta,
            COUNT(DISTINCT r.idActor) AS cantidadActoresQueRespondieron
        FROM `Respuestas` r
        WHERE r.idFormulario = pIdFormulario
        GROUP BY r.idFormulario, r.idPregunta
    ) ra
        ON ra.idFormulario = pf.idFormulario
       AND ra.idPregunta = pf.idPregunta
    WHERE pf.idFormulario = pIdFormulario
    ORDER BY
        CASE WHEN pf.estado = 'A' THEN 0 ELSE 1 END,
        pf.orden ASC,
        pf.fechaIncorporacion ASC,
        pf.idPregunta ASC;
END //

-- -----------------------------------------------------
-- sp_actor_listar_formularios
-- -----------------------------------------------------
CREATE OR REPLACE PROCEDURE `sp_actor_listar_formularios`(
    IN pIdActor INT
)
READS SQL DATA
COMMENT 'Lista los formularios aplicables a un actor: el de su categoría y, cuando existe, el de su subcategoría.'
BEGIN
    IF pIdActor IS NULL OR NOT EXISTS (
        SELECT 1 FROM `Actores` a WHERE a.idActor = pIdActor
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El actor indicado no existe.';
    END IF;

    SELECT
        f.idFormulario,
        CASE
            WHEN f.idSubcategoria IS NULL THEN 'CATEGORIA'
            ELSE 'SUBCATEGORIA'
        END AS ambito,
        f.idCategoria,
        c.nombre AS categoria,
        f.idSubcategoria,
        s.nombre AS subcategoria,
        f.titulo,
        f.descripcion,
        COUNT(DISTINCT CASE WHEN pf.estado = 'A' THEN pf.idPregunta END) AS cantidadPreguntasActivas,
        COUNT(DISTINCT CASE WHEN pf.estado = 'A' AND pf.esObligatorio = 1 THEN pf.idPregunta END) AS cantidadPreguntasObligatorias,
        COUNT(DISTINCT CASE WHEN pf.estado = 'A' AND r.idPregunta IS NOT NULL THEN pf.idPregunta END) AS cantidadRespondidas,
        COUNT(DISTINCT CASE
            WHEN pf.estado = 'A'
             AND pf.esObligatorio = 1
             AND r.idPregunta IS NULL
            THEN pf.idPregunta
        END) AS cantidadObligatoriasPendientes,
        CASE
            WHEN COUNT(DISTINCT CASE
                WHEN pf.estado = 'A'
                 AND pf.esObligatorio = 1
                 AND r.idPregunta IS NULL
                THEN pf.idPregunta
            END) = 0 THEN 1
            ELSE 0
        END AS estaCompleto,
        MIN(CASE WHEN pf.estado = 'A' THEN r.fechaUltimaConfirmacion END) AS fechaConfirmacionMasAntigua,
        MAX(CASE WHEN pf.estado = 'A' THEN r.fechaUltimaModificacion END) AS fechaUltimaModificacion
    FROM `Actores` a
    INNER JOIN `Formularios` f
        ON f.idCategoria = a.idCategoria
       AND (
            f.idSubcategoria IS NULL
            OR f.idSubcategoria = a.idSubcategoria
       )
    INNER JOIN `Categorias` c
        ON c.idCategoria = f.idCategoria
    LEFT JOIN `Subcategorias` s
        ON s.idCategoria = f.idCategoria
       AND s.idSubcategoria = f.idSubcategoria
    LEFT JOIN `PreguntasFormulario` pf
        ON pf.idFormulario = f.idFormulario
    LEFT JOIN `Respuestas` r
        ON r.idFormulario = pf.idFormulario
       AND r.idPregunta = pf.idPregunta
       AND r.idActor = a.idActor
    WHERE a.idActor = pIdActor
    GROUP BY
        f.idFormulario,
        f.idCategoria,
        c.nombre,
        f.idSubcategoria,
        s.nombre,
        f.titulo,
        f.descripcion
    ORDER BY
        CASE WHEN f.idSubcategoria IS NULL THEN 0 ELSE 1 END,
        f.idFormulario ASC;
END //

-- -----------------------------------------------------
-- sp_actor_obtener_formulario
-- -----------------------------------------------------
CREATE OR REPLACE PROCEDURE `sp_actor_obtener_formulario`(
    IN pIdActor INT,
    IN pIdFormulario INT
)
READS SQL DATA
COMMENT 'Obtiene un formulario aplicable al actor y sus preguntas activas junto con las respuestas vigentes.'
BEGIN
    IF pIdActor IS NULL OR NOT EXISTS (
        SELECT 1 FROM `Actores` a WHERE a.idActor = pIdActor
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El actor indicado no existe.';
    END IF;

    IF pIdFormulario IS NULL OR NOT EXISTS (
        SELECT 1 FROM `Formularios` f WHERE f.idFormulario = pIdFormulario
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El formulario indicado no existe.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM `Actores` a
        INNER JOIN `Formularios` f
            ON f.idFormulario = pIdFormulario
           AND f.idCategoria = a.idCategoria
           AND (
                f.idSubcategoria IS NULL
                OR f.idSubcategoria = a.idSubcategoria
           )
        WHERE a.idActor = pIdActor
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El formulario no corresponde a la categoría del actor.';
    END IF;

    SELECT
        f.idFormulario,
        f.idCategoria,
        c.nombre AS categoria,
        f.idSubcategoria,
        s.nombre AS subcategoria,
        f.titulo,
        f.descripcion,
        COUNT(DISTINCT pf.idPregunta) AS cantidadPreguntasActivas,
        COUNT(DISTINCT CASE WHEN pf.esObligatorio = 1 THEN pf.idPregunta END) AS cantidadObligatorias,
        COUNT(DISTINCT CASE WHEN pf.esObligatorio = 1 AND r.idPregunta IS NULL THEN pf.idPregunta END) AS cantidadObligatoriasPendientes,
        CASE
            WHEN COUNT(DISTINCT CASE
                WHEN pf.esObligatorio = 1 AND r.idPregunta IS NULL THEN pf.idPregunta
            END) = 0 THEN 1
            ELSE 0
        END AS estaCompleto
    FROM `Formularios` f
    INNER JOIN `Categorias` c
        ON c.idCategoria = f.idCategoria
    LEFT JOIN `Subcategorias` s
        ON s.idCategoria = f.idCategoria
       AND s.idSubcategoria = f.idSubcategoria
    LEFT JOIN `PreguntasFormulario` pf
        ON pf.idFormulario = f.idFormulario
       AND pf.estado = 'A'
    LEFT JOIN `Respuestas` r
        ON r.idFormulario = pf.idFormulario
       AND r.idPregunta = pf.idPregunta
       AND r.idActor = pIdActor
    WHERE f.idFormulario = pIdFormulario
    GROUP BY
        f.idFormulario,
        f.idCategoria,
        c.nombre,
        f.idSubcategoria,
        s.nombre,
        f.titulo,
        f.descripcion;

    SELECT
        pf.idFormulario,
        pf.idPregunta,
        p.pregunta,
        p.tipoDato,
        p.opciones,
        pf.orden,
        pf.esObligatorio,
        pf.esPublico,
        r.valor,
        r.fechaCreacion,
        r.fechaUltimaModificacion,
        r.fechaUltimaConfirmacion,
        CASE WHEN r.idPregunta IS NULL THEN 0 ELSE 1 END AS estaRespondida
    FROM `PreguntasFormulario` pf
    INNER JOIN `Preguntas` p
        ON p.idPregunta = pf.idPregunta
    LEFT JOIN `Respuestas` r
        ON r.idFormulario = pf.idFormulario
       AND r.idPregunta = pf.idPregunta
       AND r.idActor = pIdActor
    WHERE pf.idFormulario = pIdFormulario
      AND pf.estado = 'A'
    ORDER BY pf.orden ASC, pf.idPregunta ASC;
END //

-- -----------------------------------------------------
-- sp_actor_guardar_respuesta
-- -----------------------------------------------------
CREATE OR REPLACE PROCEDURE `sp_actor_guardar_respuesta`(
    IN pIdActor INT,
    IN pIdFormulario INT,
    IN pIdPregunta INT,
    IN pValor JSON
)
MODIFIES SQL DATA
COMMENT 'Inserta o actualiza la respuesta vigente de un actor, validando el formulario, la pregunta y el tipo JSON recibido.'
BEGIN
    DECLARE vCategoriaActor INT;
    DECLARE vSubcategoriaActor INT;
    DECLARE vEstadoActor CHAR(1);
    DECLARE vCategoriaFormulario INT;
    DECLARE vSubcategoriaFormulario INT;
    DECLARE vEstadoPregunta CHAR(1);
    DECLARE vTipoDato VARCHAR(20);
    DECLARE vOpciones JSON;

    IF pIdActor IS NULL OR NOT EXISTS (
        SELECT 1 FROM `Actores` a WHERE a.idActor = pIdActor
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El actor indicado no existe.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM `PreguntasFormulario` pf
        INNER JOIN `Formularios` f
            ON f.idFormulario = pf.idFormulario
        INNER JOIN `Preguntas` p
            ON p.idPregunta = pf.idPregunta
        WHERE pf.idFormulario = pIdFormulario
          AND pf.idPregunta = pIdPregunta
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La pregunta no pertenece al formulario indicado.';
    END IF;

    SELECT
        a.idCategoria,
        a.idSubcategoria,
        a.estado
      INTO
        vCategoriaActor,
        vSubcategoriaActor,
        vEstadoActor
    FROM `Actores` a
    WHERE a.idActor = pIdActor;

    SELECT
        f.idCategoria,
        f.idSubcategoria,
        pf.estado,
        p.tipoDato,
        p.opciones
      INTO
        vCategoriaFormulario,
        vSubcategoriaFormulario,
        vEstadoPregunta,
        vTipoDato,
        vOpciones
    FROM `PreguntasFormulario` pf
    INNER JOIN `Formularios` f
        ON f.idFormulario = pf.idFormulario
    INNER JOIN `Preguntas` p
        ON p.idPregunta = pf.idPregunta
    WHERE pf.idFormulario = pIdFormulario
      AND pf.idPregunta = pIdPregunta;

    IF vEstadoActor = 'I' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Un actor inactivo no puede registrar respuestas.';
    END IF;

    IF vEstadoPregunta <> 'A' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'No se puede responder una pregunta inactiva.';
    END IF;

    IF vCategoriaActor <> vCategoriaFormulario THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El actor no pertenece a la categoría del formulario.';
    END IF;

    IF vSubcategoriaFormulario IS NOT NULL
       AND NOT (vSubcategoriaActor <=> vSubcategoriaFormulario) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El actor no pertenece a la subcategoría del formulario.';
    END IF;

    CALL `sp_interno_validar_valor_respuesta`(
        vTipoDato,
        vOpciones,
        pValor
    );

    INSERT INTO `Respuestas` (
        idFormulario,
        idPregunta,
        idActor,
        valor,
        fechaCreacion,
        fechaUltimaModificacion,
        fechaUltimaConfirmacion
    )
    VALUES (
        pIdFormulario,
        pIdPregunta,
        pIdActor,
        pValor,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    ON DUPLICATE KEY UPDATE
        valor = VALUES(valor),
        fechaUltimaModificacion = CURRENT_TIMESTAMP;

    SELECT
        r.idFormulario,
        r.idPregunta,
        p.pregunta,
        p.tipoDato,
        r.idActor,
        r.valor,
        r.fechaCreacion,
        r.fechaUltimaModificacion,
        r.fechaUltimaConfirmacion
    FROM `Respuestas` r
    INNER JOIN `Preguntas` p
        ON p.idPregunta = r.idPregunta
    WHERE r.idFormulario = pIdFormulario
      AND r.idPregunta = pIdPregunta
      AND r.idActor = pIdActor;
END //

-- -----------------------------------------------------
-- sp_actor_confirmar_formulario
-- -----------------------------------------------------
CREATE OR REPLACE PROCEDURE `sp_actor_confirmar_formulario`(
    IN pIdActor INT,
    IN pIdFormulario INT
)
MODIFIES SQL DATA
COMMENT 'Confirma las respuestas vigentes de un formulario cuando todas sus preguntas obligatorias activas fueron respondidas.'
BEGIN
    DECLARE vPendientes INT DEFAULT 0;
    DECLARE vAhora DATETIME;
    DECLARE vCantidadConfirmadas INT DEFAULT 0;
    DECLARE vIdFormularioBloqueado INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF pIdActor IS NULL OR NOT EXISTS (
        SELECT 1 FROM `Actores` a WHERE a.idActor = pIdActor
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El actor indicado no existe.';
    END IF;

    IF pIdFormulario IS NULL OR NOT EXISTS (
        SELECT 1 FROM `Formularios` f WHERE f.idFormulario = pIdFormulario
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El formulario indicado no existe.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM `Actores` a
        INNER JOIN `Formularios` f
            ON f.idFormulario = pIdFormulario
           AND f.idCategoria = a.idCategoria
           AND (
                f.idSubcategoria IS NULL
                OR f.idSubcategoria = a.idSubcategoria
           )
        WHERE a.idActor = pIdActor
          AND a.estado <> 'I'
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El formulario no corresponde a un actor habilitado.';
    END IF;

    START TRANSACTION;

    SELECT f.idFormulario
      INTO vIdFormularioBloqueado
    FROM `Formularios` f
    WHERE f.idFormulario = pIdFormulario
    FOR UPDATE;

    SELECT COUNT(*)
      INTO vPendientes
    FROM `PreguntasFormulario` pf
    WHERE pf.idFormulario = pIdFormulario
      AND pf.estado = 'A'
      AND pf.esObligatorio = 1
      AND NOT EXISTS (
          SELECT 1
          FROM `Respuestas` r
          WHERE r.idFormulario = pf.idFormulario
            AND r.idPregunta = pf.idPregunta
            AND r.idActor = pIdActor
      );

    IF vPendientes > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El formulario todavía tiene preguntas obligatorias pendientes.';
    END IF;

    SET vAhora = CURRENT_TIMESTAMP;

    UPDATE `Respuestas` r
    INNER JOIN `PreguntasFormulario` pf
        ON pf.idFormulario = r.idFormulario
       AND pf.idPregunta = r.idPregunta
       AND pf.estado = 'A'
    SET r.fechaUltimaConfirmacion = vAhora
    WHERE r.idFormulario = pIdFormulario
      AND r.idActor = pIdActor;

    SET vCantidadConfirmadas = ROW_COUNT();

    COMMIT;

    SELECT
        pIdActor AS idActor,
        pIdFormulario AS idFormulario,
        vAhora AS fechaConfirmacion,
        0 AS cantidadObligatoriasPendientes,
        vCantidadConfirmadas AS cantidadRespuestasConfirmadas;
END //

-- -----------------------------------------------------
-- sp_actor_listar_preguntas_pendientes
-- -----------------------------------------------------
CREATE OR REPLACE PROCEDURE `sp_actor_listar_preguntas_pendientes`(
    IN pIdActor INT
)
READS SQL DATA
COMMENT 'Lista las preguntas obligatorias activas que el actor todavía no respondió en sus formularios aplicables.'
BEGIN
    IF pIdActor IS NULL OR NOT EXISTS (
        SELECT 1 FROM `Actores` a WHERE a.idActor = pIdActor
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El actor indicado no existe.';
    END IF;

    SELECT
        f.idFormulario,
        f.titulo AS formulario,
        CASE
            WHEN f.idSubcategoria IS NULL THEN 'CATEGORIA'
            ELSE 'SUBCATEGORIA'
        END AS ambito,
        pf.idPregunta,
        p.pregunta,
        p.tipoDato,
        p.opciones,
        pf.orden,
        pf.esPublico
    FROM `Actores` a
    INNER JOIN `Formularios` f
        ON f.idCategoria = a.idCategoria
       AND (
            f.idSubcategoria IS NULL
            OR f.idSubcategoria = a.idSubcategoria
       )
    INNER JOIN `PreguntasFormulario` pf
        ON pf.idFormulario = f.idFormulario
       AND pf.estado = 'A'
       AND pf.esObligatorio = 1
    INNER JOIN `Preguntas` p
        ON p.idPregunta = pf.idPregunta
    LEFT JOIN `Respuestas` r
        ON r.idFormulario = pf.idFormulario
       AND r.idPregunta = pf.idPregunta
       AND r.idActor = a.idActor
    WHERE a.idActor = pIdActor
      AND r.idPregunta IS NULL
    ORDER BY
        CASE WHEN f.idSubcategoria IS NULL THEN 0 ELSE 1 END,
        f.idFormulario ASC,
        pf.orden ASC;
END //

DELIMITER ;
