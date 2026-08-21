-- ============================================================================
-- CULTURA - Restricciones CHECK
-- Ejecutar despues de crear las tablas mediante MySQL Workbench.
-- ============================================================================
ALTER TABLE `cultura`.`ActividadesArca`
ADD CONSTRAINT `chk_ActividadesArca_codigo` CHECK (`codigo` REGEXP '^[0-9]{6}$'),
ADD CONSTRAINT `chk_ActividadesArca_descripcion` CHECK (
  `descripcion` = TRIM(`descripcion`)
  AND `descripcion` <> ''
);

ALTER TABLE `cultura`.`Usuarios`
ADD CONSTRAINT `chk_Usuarios_nombre` CHECK (
  `nombre` = TRIM(`nombre`)
  AND `nombre` <> ''
  AND `nombre` NOT REGEXP '[0-9]'
),
ADD CONSTRAINT `chk_Usuarios_apellido` CHECK (
  `apellido` = TRIM(`apellido`)
  AND `apellido` <> ''
  AND `apellido` NOT REGEXP '[0-9]'
),
ADD CONSTRAINT `chk_Usuarios_nacionalidad` CHECK (
  `nacionalidad` = TRIM(`nacionalidad`)
  AND `nacionalidad` <> ''
  AND `nacionalidad` NOT REGEXP '[0-9]'
),
ADD CONSTRAINT `chk_Usuarios_email` CHECK (
  `email` = TRIM(`email`)
  AND `email` REGEXP '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
),
ADD CONSTRAINT `chk_Usuarios_contrasena_hash` CHECK (
  `contraseña` IS NULL
  OR (
    `contraseña` = TRIM(`contraseña`)
    AND CHAR_LENGTH(`contraseña`) >= 60
  )
),
ADD CONSTRAINT `chk_Usuarios_firebase_uid` CHECK (
  `firebaseUid` IS NULL
  OR (
    `firebaseUid` = TRIM(`firebaseUid`)
    AND `firebaseUid` <> ''
  )
),
ADD CONSTRAINT `chk_Usuarios_CUIL_formato` CHECK (`CUIL` REGEXP '^[0-9]{11}$'),
ADD CONSTRAINT `chk_Usuarios_fechas` CHECK (`fechaNacimiento` < `fechaRegistro`);

ALTER TABLE `cultura`.`Ubicaciones`
ADD CONSTRAINT `chk_Ubicaciones_provincia` CHECK (
  `provincia` = TRIM(`provincia`)
  AND `provincia` <> ''
),
ADD CONSTRAINT `chk_Ubicaciones_departamento` CHECK (
  `departamento` = TRIM(`departamento`)
  AND `departamento` <> ''
),
ADD CONSTRAINT `chk_Ubicaciones_localidad` CHECK (
  `localidad` = TRIM(`localidad`)
  AND `localidad` <> ''
),
ADD CONSTRAINT `chk_Ubicaciones_direccion` CHECK (
  `direccion` = TRIM(`direccion`)
  AND `direccion` <> ''
),
ADD CONSTRAINT `chk_Ubicaciones_latitud` CHECK (`latitud` BETWEEN -90.00000000 AND 90.00000000),
ADD CONSTRAINT `chk_Ubicaciones_longitud` CHECK (`longitud` BETWEEN -180.00000000 AND 180.00000000),
ADD CONSTRAINT `chk_Ubicaciones_esPublica` CHECK (`esPublica` IN (0, 1));

ALTER TABLE `cultura`.`Categorias`
ADD CONSTRAINT `chk_Categorias_nombre` CHECK (
  `nombre` = TRIM(`nombre`)
  AND `nombre` <> ''
),
ADD CONSTRAINT `chk_Categorias_icono` CHECK (`icono` REGEXP '^[A-Za-z][A-Za-z0-9]{0,63}$');

ALTER TABLE `cultura`.`Subcategorias`
ADD CONSTRAINT `chk_Subcategorias_nombre` CHECK (
  `nombre` = TRIM(`nombre`)
  AND `nombre` <> ''
);

ALTER TABLE `cultura`.`Actores`
ADD CONSTRAINT `chk_Actores_nombre` CHECK (
  `nombre` = TRIM(`nombre`)
  AND `nombre` <> ''
),
ADD CONSTRAINT `chk_Actores_descripcion` CHECK (
  `descripcion` = TRIM(`descripcion`)
  AND `descripcion` <> ''
),
ADD CONSTRAINT `chk_Actores_fotoPerfilUrl` CHECK (
  `fotoPerfilUrl` IS NULL
  OR `fotoPerfilUrl` REGEXP '^https?://[^[:space:]]+$'
),
ADD CONSTRAINT `chk_Actores_cuit_formato` CHECK (
  `cuit` IS NULL
  OR `cuit` REGEXP '^[0-9]{11}$'
);

ALTER TABLE `cultura`.`Eventos`
ADD CONSTRAINT `chk_Eventos_nombre` CHECK (
  `nombre` = TRIM(`nombre`)
  AND `nombre` <> ''
),
ADD CONSTRAINT `chk_Eventos_descripcion` CHECK (
  `descripcion` = TRIM(`descripcion`)
  AND `descripcion` <> ''
);

ALTER TABLE `cultura`.`ItemsPortafolio`
ADD CONSTRAINT `chk_ItemsPortafolio_descripcion` CHECK (
  `descripcion` = TRIM(`descripcion`)
  AND `descripcion` <> ''
),
ADD CONSTRAINT `chk_ItemsPortafolio_url` CHECK (`url` REGEXP '^https?://[^[:space:]]+$');

ALTER TABLE `cultura`.`Preguntas`
ADD CONSTRAINT `chk_Preguntas_texto` CHECK (
  `pregunta` = TRIM(`pregunta`)
  AND `pregunta` <> ''
),
ADD CONSTRAINT `chk_Preguntas_opciones_segun_tipo` CHECK (
  (
    `tipoDato` IN ('OPCION_UNICA', 'OPCION_MULTIPLE')
    AND `opciones` IS NOT NULL
    AND JSON_TYPE(`opciones`) = 'ARRAY'
    AND JSON_LENGTH(`opciones`) >= 2
  )
  OR (
    `tipoDato` NOT IN ('OPCION_UNICA', 'OPCION_MULTIPLE')
    AND `opciones` IS NULL
  )
);

ALTER TABLE `cultura`.`Integrantes`
ADD CONSTRAINT `chk_Integrantes_rol` CHECK (
  `rol` = TRIM(`rol`)
  AND `rol` <> ''
),
ADD CONSTRAINT `chk_Integrantes_esDueno` CHECK (`esDueño` IN (0, 1));

ALTER TABLE `cultura`.`IntegrantesNoRegistrados`
ADD CONSTRAINT `chk_IntegrantesNoRegistrados_nombre` CHECK (
  `nombre` = TRIM(`nombre`)
  AND `nombre` <> ''
  AND `nombre` NOT REGEXP '[0-9]'
),
ADD CONSTRAINT `chk_IntegrantesNoRegistrados_apellido` CHECK (
  `apellido` = TRIM(`apellido`)
  AND `apellido` <> ''
  AND `apellido` NOT REGEXP '[0-9]'
),
ADD CONSTRAINT `chk_IntegrantesNoRegistrados_email` CHECK (
  `email` IS NULL
  OR (
    `email` = TRIM(`email`)
    AND `email` = LOWER(`email`)
    AND `email` REGEXP '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
  )
),
ADD CONSTRAINT `chk_IntegrantesNoRegistrados_rol` CHECK (
  `rol` = TRIM(`rol`)
  AND `rol` <> ''
);

ALTER TABLE `cultura`.`Convocatorias`
ADD CONSTRAINT `chk_Convocatorias_titulo` CHECK (
  `titulo` = TRIM(`titulo`)
  AND `titulo` <> ''
),
ADD CONSTRAINT `chk_Convocatorias_descripcion` CHECK (
  `descripcion` = TRIM(`descripcion`)
  AND `descripcion` <> ''
),
ADD CONSTRAINT `chk_Convocatorias_fechas` CHECK (`fechaCierre` > `fechaCreacion`);

ALTER TABLE `cultura`.`Formularios`
ADD CONSTRAINT `chk_Formularios_subcategoria` CHECK (`idSubcategoria` >= 0),
ADD CONSTRAINT `chk_Formularios_titulo` CHECK (
  `titulo` = TRIM(`titulo`)
  AND `titulo` <> ''
),
ADD CONSTRAINT `chk_Formularios_descripcion` CHECK (
  `descripcion` IS NULL
  OR (
    `descripcion` = TRIM(`descripcion`)
    AND `descripcion` <> ''
  )
);

ALTER TABLE `cultura`.`PreguntasFormulario`
ADD CONSTRAINT `chk_PreguntasFormulario_orden` CHECK (`orden` > 0),
ADD CONSTRAINT `chk_PreguntasFormulario_esObligatorio` CHECK (`esObligatorio` IN (0, 1)),
ADD CONSTRAINT `chk_PreguntasFormulario_esPublico` CHECK (`esPublico` IN (0, 1)),
ADD CONSTRAINT `chk_PreguntasFormulario_no_autorreemplazo` CHECK (
  `idPreguntaReemplazada` IS NULL
  OR `idPreguntaReemplazada` <> `idPregunta`
),
ADD CONSTRAINT `chk_PreguntasFormulario_estado_fecha` CHECK (
  (
    `estado` = 'A'
    AND `fechaDesactivacion` IS NULL
  )
  OR (
    `estado` = 'I'
    AND `fechaDesactivacion` IS NOT NULL
  )
),
ADD CONSTRAINT `chk_PreguntasFormulario_fechas` CHECK (
  `fechaDesactivacion` IS NULL
  OR `fechaDesactivacion` >= `fechaIncorporacion`
);

ALTER TABLE `cultura`.`Respuestas`
ADD CONSTRAINT `chk_Respuestas_valor_no_nulo_json` CHECK (JSON_TYPE(`valor`) <> 'NULL'),
ADD CONSTRAINT `chk_Respuestas_fechas` CHECK (
  `fechaUltimaModificacion` >= `fechaCreacion`
  AND `fechaUltimaConfirmacion` >= `fechaCreacion`
);