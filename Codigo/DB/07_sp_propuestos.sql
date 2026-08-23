-- ================================================================
-- Mosaico Cultural
-- Archivo: 07_sp_propuestos.sql
-- Procedimientos almacenados complementarios para evaluación
-- Autores: Cesar Ezequiel Herrera, Leandro Murillo
-- ================================================================
USE `cultura`;

SET NAMES utf8mb4;

DELIMITER //

-- ================================================================
-- GRUPO A: OPERACIONES CRUD ASIMÉTRICAS / FALTANTES
-- ================================================================

-- -----------------------------------------------------
-- sp_actor_editar_evento
-- -----------------------------------------------------
CREATE
OR
REPLACE
  PROCEDURE `sp_actor_editar_evento` (
    IN pIdUsuario INT,
    IN pIdActor INT,
    IN pIdEvento INT,
    IN pNombre VARCHAR(100),
    IN pDescripcion VARCHAR(500),
    IN pFecha DATETIME
  ) MODIFIES SQL DATA
COMMENT 'Modifica los datos y fecha de un evento perteneciente a un actor cultural validando permisos de titularidad. Resultsets: RS1: (idEvento, nombre, descripcion, fecha, estado).'
BEGIN
  DECLARE vIdActor INT;
  DECLARE vEsDueno INT DEFAULT 0;

  IF pNombre IS NULL OR TRIM(pNombre) = '' THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'El nombre del evento no puede estar vacio.';
  END IF;

  IF pDescripcion IS NULL OR TRIM(pDescripcion) = '' THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'La descripcion del evento no puede estar vacia.';
  END IF;

  IF pFecha IS NULL THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'La fecha del evento es obligatoria.';
  END IF;

  SELECT idActor INTO vIdActor
  FROM `Eventos`
  WHERE idEvento = pIdEvento AND idActor = pIdActor;

  IF vIdActor IS NULL THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'El evento no existe o no pertenece al actor especificado.';
  END IF;

  SELECT COUNT(*) INTO vEsDueno
  FROM `Integrantes`
  WHERE idUsuario = pIdUsuario
    AND idActor = pIdActor
    AND esDueño = 1;

  IF vEsDueno = 0 THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'No tenes permisos sobre este actor.';
  END IF;

  UPDATE `Eventos`
  SET
    nombre = TRIM(pNombre),
    descripcion = TRIM(pDescripcion),
    fecha = pFecha
  WHERE idEvento = pIdEvento AND idActor = pIdActor;

  SELECT
    idEvento,
    nombre,
    descripcion,
    fecha,
    estado
  FROM `Eventos`
  WHERE idEvento = pIdEvento;
END //

-- -----------------------------------------------------
-- sp_actor_editar_item_portafolio
-- -----------------------------------------------------
CREATE
OR
REPLACE
  PROCEDURE `sp_actor_editar_item_portafolio` (
    IN pIdUsuario INT,
    IN pIdActor INT,
    IN pIdItem INT,
    IN pTipo VARCHAR(20),
    IN pDescripcion VARCHAR(255),
    IN pUrl VARCHAR(255)
  ) MODIFIES SQL DATA
COMMENT 'Modifica un item del portafolio de un actor cultural previa verificación de titularidad. Resultsets: RS1: (idItem, idActor, tipo, descripcion, url, fechaCreacion).'
BEGIN
  DECLARE vIdActorItem INT;
  DECLARE vEsDueno INT DEFAULT 0;

  IF pTipo NOT IN ('IMAGEN', 'LINK', 'RRSS') THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Tipo de item invalido. Debe ser IMAGEN, LINK o RRSS.';
  END IF;

  IF pDescripcion IS NULL OR TRIM(pDescripcion) = '' THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'La descripción no puede estar vacía.';
  END IF;

  IF pUrl IS NULL OR TRIM(pUrl) = '' OR pUrl NOT REGEXP '^https?://[^[:space:]]+$' THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'La URL provista no tiene un formato HTTP/HTTPS valido.';
  END IF;

  SELECT idActor INTO vIdActorItem
  FROM `ItemsPortafolio`
  WHERE idItem = pIdItem AND idActor = pIdActor;

  IF vIdActorItem IS NULL THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'El item de portafolio no existe o no pertenece al actor especificado.';
  END IF;

  SELECT COUNT(*) INTO vEsDueno
  FROM `Integrantes`
  WHERE idUsuario = pIdUsuario
    AND idActor = pIdActor
    AND esDueño = 1;

  IF vEsDueno = 0 THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'No tenes permisos sobre este actor.';
  END IF;

  UPDATE `ItemsPortafolio`
  SET
    tipo = pTipo,
    descripcion = TRIM(pDescripcion),
    url = TRIM(pUrl)
  WHERE idItem = pIdItem AND idActor = pIdActor;

  SELECT
    idItem,
    idActor,
    tipo,
    descripcion,
    url,
    fechaCreacion
  FROM `ItemsPortafolio`
  WHERE idItem = pIdItem;
END //

-- -----------------------------------------------------
-- sp_admin_cambiar_estado_evento
-- -----------------------------------------------------
CREATE
OR
REPLACE
  PROCEDURE `sp_admin_cambiar_estado_evento` (
    IN pIdUsuarioSolicitante INT,
    IN pIdEvento INT,
    IN pEstado CHAR(1)
  ) MODIFIES SQL DATA
COMMENT 'Permite a administradores o moderadores activar o desactivar un evento respetando el alcance de categorias asignadas. Resultsets: RS1: (idEvento, idActor, nombre, estado).'
BEGIN
  DECLARE vRolSolicitante VARCHAR(20);
  DECLARE vIdActor INT;
  DECLARE vIdCategoriaActor INT;

  SELECT u.rol INTO vRolSolicitante
  FROM `Usuarios` u
  WHERE u.idUsuario = pIdUsuarioSolicitante
    AND u.estado = 'A';

  IF vRolSolicitante IS NULL OR vRolSolicitante NOT IN ('ADMIN', 'MODERADOR') THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'El usuario solicitante no tiene permisos de administracion.';
  END IF;

  IF pEstado NOT IN ('A', 'I') THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'El estado debe ser A o I.';
  END IF;

  SELECT e.idActor, a.idCategoria
  INTO vIdActor, vIdCategoriaActor
  FROM `Eventos` e
  JOIN `Actores` a ON a.idActor = e.idActor
  WHERE e.idEvento = pIdEvento;

  IF vIdActor IS NULL THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'El evento no existe.';
  END IF;

  IF vRolSolicitante = 'MODERADOR' THEN
    IF NOT EXISTS (
      SELECT 1
      FROM `ModeradoresCategorias` mc
      WHERE mc.idUsuario = pIdUsuarioSolicitante
        AND mc.idCategoria = vIdCategoriaActor
    ) THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'El moderador no tiene permisos sobre la categoria a la que pertenece el actor del evento.';
    END IF;
  END IF;

  UPDATE `Eventos`
  SET estado = pEstado
  WHERE idEvento = pIdEvento;

  SELECT
    idEvento,
    idActor,
    nombre,
    estado
  FROM `Eventos`
  WHERE idEvento = pIdEvento;
END //

-- -----------------------------------------------------
-- sp_admin_obtener_pregunta
-- -----------------------------------------------------
CREATE
OR
REPLACE
  PROCEDURE `sp_admin_obtener_pregunta` (
    IN pIdPregunta INT
  ) READS SQL DATA
COMMENT 'Obtiene el detalle de una pregunta reutilizable por identificador. Resultsets: RS1: (idPregunta, pregunta, tipoDato, opciones).'
BEGIN
  DECLARE vExiste INT DEFAULT 0;

  SELECT COUNT(*) INTO vExiste
  FROM `Preguntas`
  WHERE idPregunta = pIdPregunta;

  IF vExiste = 0 THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'La pregunta especificada no existe.';
  END IF;

  SELECT
    idPregunta,
    pregunta,
    tipoDato,
    opciones
  FROM `Preguntas`
  WHERE idPregunta = pIdPregunta;
END //

-- -----------------------------------------------------
-- sp_admin_eliminar_pregunta
-- -----------------------------------------------------
CREATE
OR
REPLACE
  PROCEDURE `sp_admin_eliminar_pregunta` (
    IN pIdPregunta INT
  ) MODIFIES SQL DATA
COMMENT 'Elimina una pregunta del banco global siempre que no este asignada a ningún formulario ni posea respuestas. Resultsets: RS1: (idPregunta).'
BEGIN
  DECLARE vExiste INT DEFAULT 0;

  SELECT COUNT(*) INTO vExiste
  FROM `Preguntas`
  WHERE idPregunta = pIdPregunta;

  IF vExiste = 0 THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'La pregunta no existe.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM `PreguntasFormulario`
    WHERE idPregunta = pIdPregunta
       OR idPreguntaReemplazada = pIdPregunta
  ) THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'No se puede eliminar la pregunta porque esta vinculada a uno o mas formularios.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM `Respuestas`
    WHERE idPregunta = pIdPregunta
  ) THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'No se puede eliminar la pregunta porque posee respuestas registradas de actores.';
  END IF;

  DELETE FROM `Preguntas`
  WHERE idPregunta = pIdPregunta;

  SELECT pIdPregunta AS idPregunta;
END //

-- -----------------------------------------------------
-- sp_admin_reactivar_pregunta_formulario
-- -----------------------------------------------------
CREATE
OR
REPLACE
  PROCEDURE `sp_admin_reactivar_pregunta_formulario` (
    IN pIdFormulario INT,
    IN pIdPregunta INT
  ) MODIFIES SQL DATA
COMMENT 'Reactiva una pregunta previamente desactivada en un formulario. Resultsets: RS1: (idFormulario, idPregunta, orden, esObligatorio, esPublico, fechaIncorporacion, estado).'
BEGIN
  DECLARE vEstadoActual CHAR(1);

  SELECT estado INTO vEstadoActual
  FROM `PreguntasFormulario`
  WHERE idFormulario = pIdFormulario
    AND idPregunta = pIdPregunta;

  IF vEstadoActual IS NULL THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'La pregunta no pertenece al formulario especificado.';
  END IF;

  IF vEstadoActual = 'A' THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'La pregunta ya se encuentra activa en el formulario.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM `PreguntasFormulario`
    WHERE idFormulario = pIdFormulario
      AND idPreguntaReemplazada = pIdPregunta
      AND estado = 'A'
  ) THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'No se puede reactivar la pregunta porque ya fue reemplazada por otra pregunta activa.';
  END IF;

  UPDATE `PreguntasFormulario`
  SET
    estado = 'A',
    fechaDesactivacion = NULL
  WHERE idFormulario = pIdFormulario
    AND idPregunta = pIdPregunta;

  SELECT
    idFormulario,
    idPregunta,
    orden,
    esObligatorio,
    esPublico,
    fechaIncorporacion,
    estado
  FROM `PreguntasFormulario`
  WHERE idFormulario = pIdFormulario
    AND idPregunta = pIdPregunta;
END //


-- ================================================================
-- GRUPO B: DASHBOARDS Y METRICAS CULTURALES
-- ================================================================

-- -----------------------------------------------------
-- sp_admin_obtener_estadisticas_dashboard
-- -----------------------------------------------------
CREATE
OR
REPLACE
  PROCEDURE `sp_admin_obtener_estadisticas_dashboard` (
    IN pIdUsuarioSolicitante INT
  ) READS SQL DATA
COMMENT 'Devuelve indicadores y distribuciones estadisticas para el dashboard administrativo, acotadas al ambito del solicitante. Resultsets: RS1: (totalUsuariosActivos, totalUsuariosPendientes, totalActoresActivos, totalActoresPendientes, totalConvocatoriasActivas, totalEventosProximos). RS2: (tipoActor, cantidad). RS3: (idCategoria, categoria, icono, cantidadActores). RS4: (departamento, cantidadActores).'
BEGIN
  DECLARE vRolSolicitante VARCHAR(20);

  SELECT u.rol INTO vRolSolicitante
  FROM `Usuarios` u
  WHERE u.idUsuario = pIdUsuarioSolicitante
    AND u.estado = 'A';

  IF vRolSolicitante IS NULL OR vRolSolicitante NOT IN ('ADMIN', 'MODERADOR') THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'El usuario solicitante no tiene permisos de administracion.';
  END IF;

  -- RS1: Indicadores cuantitativos globales/sectoriales
  SELECT
    (SELECT COUNT(*) FROM `Usuarios` WHERE estado = 'A') AS totalUsuariosActivos,
    (SELECT COUNT(*) FROM `Usuarios` WHERE estado = 'P') AS totalUsuariosPendientes,
    (
      SELECT COUNT(*)
      FROM `Actores` a
      WHERE a.estado = 'A'
        AND (
          vRolSolicitante = 'ADMIN'
          OR a.idCategoria IN (SELECT idCategoria FROM `ModeradoresCategorias` WHERE idUsuario = pIdUsuarioSolicitante)
        )
    ) AS totalActoresActivos,
    (
      SELECT COUNT(*)
      FROM `Actores` a
      WHERE a.estado = 'P'
        AND (
          vRolSolicitante = 'ADMIN'
          OR a.idCategoria IN (SELECT idCategoria FROM `ModeradoresCategorias` WHERE idUsuario = pIdUsuarioSolicitante)
        )
    ) AS totalActoresPendientes,
    (SELECT COUNT(*) FROM `Convocatorias` WHERE fechaCierre > NOW()) AS totalConvocatoriasActivas,
    (
      SELECT COUNT(*)
      FROM `Eventos` e
      JOIN `Actores` a ON a.idActor = e.idActor
      WHERE e.estado = 'A'
        AND a.estado = 'A'
        AND e.fecha >= CURDATE()
        AND (
          vRolSolicitante = 'ADMIN'
          OR a.idCategoria IN (SELECT idCategoria FROM `ModeradoresCategorias` WHERE idUsuario = pIdUsuarioSolicitante)
        )
    ) AS totalEventosProximos;

  -- RS2: Desglose por naturaleza del actor (INDIVIDUO, COLECTIVO, ESPACIO)
  SELECT
    a.tipoActor,
    COUNT(*) AS cantidad
  FROM `Actores` a
  WHERE a.estado = 'A'
    AND (
      vRolSolicitante = 'ADMIN'
      OR a.idCategoria IN (SELECT idCategoria FROM `ModeradoresCategorias` WHERE idUsuario = pIdUsuarioSolicitante)
    )
  GROUP BY a.tipoActor
  ORDER BY cantidad DESC;

  -- RS3: Desglose por Categoria Cultural
  SELECT
    c.idCategoria,
    c.nombre AS categoria,
    c.icono,
    COUNT(a.idActor) AS cantidadActores
  FROM `Categorias` c
  LEFT JOIN `Actores` a
    ON a.idCategoria = c.idCategoria
    AND a.estado = 'A'
  WHERE c.estado = 'A'
    AND (
      vRolSolicitante = 'ADMIN'
      OR c.idCategoria IN (SELECT idCategoria FROM `ModeradoresCategorias` WHERE idUsuario = pIdUsuarioSolicitante)
    )
  GROUP BY c.idCategoria, c.nombre, c.icono
  ORDER BY cantidadActores DESC, c.nombre ASC;

  -- RS4: Distribucion geografica por Departamento provincial
  SELECT
    u.departamento,
    COUNT(a.idActor) AS cantidadActores
  FROM `Ubicaciones` u
  JOIN `Actores` a
    ON a.idUbicacion = u.idUbicacion
    AND a.estado = 'A'
  WHERE (
    vRolSolicitante = 'ADMIN'
    OR a.idCategoria IN (SELECT idCategoria FROM `ModeradoresCategorias` WHERE idUsuario = pIdUsuarioSolicitante)
  )
  GROUP BY u.departamento
  ORDER BY cantidadActores DESC, u.departamento ASC;
END //

-- -----------------------------------------------------
-- sp_admin_contar_pendientes
-- -----------------------------------------------------
CREATE
OR
REPLACE
  PROCEDURE `sp_admin_contar_pendientes` (
    IN pIdUsuarioSolicitante INT
  ) READS SQL DATA
COMMENT 'Obtiene los contadores rápidos de elementos pendientes de moderación para las insignias del panel. Resultsets: RS1: (actoresPendientes, convocatoriasAbiertas).'
BEGIN
  DECLARE vRolSolicitante VARCHAR(20);

  SELECT u.rol INTO vRolSolicitante
  FROM `Usuarios` u
  WHERE u.idUsuario = pIdUsuarioSolicitante
    AND u.estado = 'A';

  IF vRolSolicitante IS NULL OR vRolSolicitante NOT IN ('ADMIN', 'MODERADOR') THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'El usuario solicitante no tiene permisos de administración.';
  END IF;

  SELECT
    (
      SELECT COUNT(*)
      FROM `Actores` a
      WHERE a.estado = 'P'
        AND (
          vRolSolicitante = 'ADMIN'
          OR a.idCategoria IN (SELECT idCategoria FROM `ModeradoresCategorias` WHERE idUsuario = pIdUsuarioSolicitante)
        )
    ) AS actoresPendientes,
    (SELECT COUNT(*) FROM `Convocatorias` WHERE fechaCierre > NOW()) AS convocatoriasAbiertas;
END //

-- -----------------------------------------------------
-- sp_admin_reporte_actividades_arca
-- -----------------------------------------------------
CREATE
OR
REPLACE
  PROCEDURE `sp_admin_reporte_actividades_arca` () READS SQL DATA
COMMENT 'Genera el reporte de empadronamiento tributario/económico de usuarios registrados según padrón Rentas/ARCA. Resultsets: RS1: (codigo, descripcion, cantidadUsuarios).'
BEGIN
  SELECT
    COALESCE(aa.codigo, 'SIN_REG') AS codigo,
    COALESCE(aa.descripcion, 'No registrado / Sin actividad declarada') AS descripcion,
    COUNT(u.idUsuario) AS cantidadUsuarios
  FROM `Usuarios` u
  LEFT JOIN `ActividadesArca` aa ON u.actividadesArcaCodigo = aa.codigo
  WHERE u.estado = 'A'
  GROUP BY aa.codigo, aa.descripcion
  ORDER BY cantidadUsuarios DESC, descripcion ASC;
END //


-- ================================================================
-- GRUPO C: CARTELERA PUBLICA Y PORTAL CIUDADANO
-- ================================================================

-- -----------------------------------------------------
-- sp_publico_listar_convocatorias
-- -----------------------------------------------------
CREATE
OR
REPLACE
  PROCEDURE `sp_publico_listar_convocatorias` (
    IN pBusqueda VARCHAR(255) DEFAULT NULL,
    IN pLimit INT DEFAULT 20,
    IN pOffset INT DEFAULT 0
  ) SQL SECURITY DEFINER READS SQL DATA
COMMENT 'Lista convocatorias activas para visualización publica sin requerir inicio de sesión. Resultsets: RS1: (total). RS2: (idConvocatoria, titulo, descripcion, fechaCreacion, fechaCierre, totalPostulaciones).'
BEGIN
  DECLARE vLimit INT DEFAULT 20;
  DECLARE vOffset INT DEFAULT 0;

  SET vLimit = LEAST(GREATEST(COALESCE(pLimit, 20), 1), 100);
  SET vOffset = GREATEST(COALESCE(pOffset, 0), 0);

  -- RS1: Total de convocatorias abiertas
  SELECT COUNT(*) AS total
  FROM `Convocatorias` c
  WHERE c.fechaCierre > NOW()
    AND (
      pBusqueda IS NULL
      OR TRIM(pBusqueda) = ''
      OR c.titulo LIKE CONCAT('%', TRIM(pBusqueda), '%')
      OR c.descripcion LIKE CONCAT('%', TRIM(pBusqueda), '%')
    );

  -- RS2: Registros paginados
  SELECT
    c.idConvocatoria,
    c.titulo,
    c.descripcion,
    c.fechaCreacion,
    c.fechaCierre,
    (SELECT COUNT(*) FROM `Postulaciones` p WHERE p.idConvocatoria = c.idConvocatoria) AS totalPostulaciones
  FROM `Convocatorias` c
  WHERE c.fechaCierre > NOW()
    AND (
      pBusqueda IS NULL
      OR TRIM(pBusqueda) = ''
      OR c.titulo LIKE CONCAT('%', TRIM(pBusqueda), '%')
      OR c.descripcion LIKE CONCAT('%', TRIM(pBusqueda), '%')
    )
  ORDER BY c.fechaCierre ASC, c.idConvocatoria DESC
  LIMIT vLimit OFFSET vOffset;
END //

-- -----------------------------------------------------
-- sp_publico_listar_espacios_culturales
-- -----------------------------------------------------
CREATE
OR
REPLACE
  PROCEDURE `sp_publico_listar_espacios_culturales` (
    IN pBusqueda VARCHAR(255) DEFAULT NULL,
    IN pDepartamento VARCHAR(100) DEFAULT NULL,
    IN pLimit INT DEFAULT 20,
    IN pOffset INT DEFAULT 0
  ) SQL SECURITY DEFINER READS SQL DATA
COMMENT 'Lista los espacios culturales activos para el catalogo publico georreferenciado. Resultsets: RS1: (total). RS2: (idActor, nombre, descripcion, fotoPerfilUrl, idCategoria, categoria, categoriaIcono, subcategoria, departamento, localidad, direccion, latitud, longitud).'
BEGIN
  DECLARE vLimit INT DEFAULT 20;
  DECLARE vOffset INT DEFAULT 0;

  SET vLimit = LEAST(GREATEST(COALESCE(pLimit, 20), 1), 100);
  SET vOffset = GREATEST(COALESCE(pOffset, 0), 0);

  -- RS1: Total de espacios
  SELECT COUNT(*) AS total
  FROM `Actores` a
  JOIN `Categorias` c ON c.idCategoria = a.idCategoria
  JOIN `Ubicaciones` u ON u.idUbicacion = a.idUbicacion
  WHERE a.tipoActor = 'ESPACIO'
    AND a.estado = 'A'
    AND c.estado = 'A'
    AND u.esPublica = 1
    AND (pDepartamento IS NULL OR u.departamento = pDepartamento)
    AND (
      pBusqueda IS NULL
      OR TRIM(pBusqueda) = ''
      OR a.nombre LIKE CONCAT('%', TRIM(pBusqueda), '%')
      OR a.descripcion LIKE CONCAT('%', TRIM(pBusqueda), '%')
      OR u.localidad LIKE CONCAT('%', TRIM(pBusqueda), '%')
    );

  -- RS2: Registros de espacios culturales
  SELECT
    a.idActor,
    a.nombre,
    a.descripcion,
    a.fotoPerfilUrl,
    c.idCategoria,
    c.nombre AS categoria,
    c.icono AS categoriaIcono,
    sc.nombre AS subcategoria,
    u.departamento,
    u.localidad,
    u.direccion,
    u.latitud,
    u.longitud
  FROM `Actores` a
  JOIN `Categorias` c ON c.idCategoria = a.idCategoria
  LEFT JOIN `Subcategorias` sc
    ON sc.idCategoria = a.idCategoria
    AND sc.idSubcategoria = a.idSubcategoria
  JOIN `Ubicaciones` u ON u.idUbicacion = a.idUbicacion
  WHERE a.tipoActor = 'ESPACIO'
    AND a.estado = 'A'
    AND c.estado = 'A'
    AND u.esPublica = 1
    AND (pDepartamento IS NULL OR u.departamento = pDepartamento)
    AND (
      pBusqueda IS NULL
      OR TRIM(pBusqueda) = ''
      OR a.nombre LIKE CONCAT('%', TRIM(pBusqueda), '%')
      OR a.descripcion LIKE CONCAT('%', TRIM(pBusqueda), '%')
      OR u.localidad LIKE CONCAT('%', TRIM(pBusqueda), '%')
    )
  ORDER BY a.nombre ASC
  LIMIT vLimit OFFSET vOffset;
END //

DELIMITER ;
