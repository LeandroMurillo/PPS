-- Migración para bases creadas antes de incorporar Firebase Authentication.
-- Ejecutar una sola vez sobre el esquema existente. Las instalaciones nuevas ya
-- incluyen estos cambios en 01_cultura.sql, 02_checks.sql y 03_sp.sql.

USE `cultura`;

ALTER TABLE `Usuarios`
  ADD COLUMN `firebaseUid` VARCHAR(128) NULL
    COMMENT 'Identificador estable de Firebase Authentication' AFTER `email`,
  MODIFY COLUMN `contraseña` VARCHAR(255) NULL
    COMMENT 'Hash legado; las cuentas Firebase no almacenan contraseña local',
  ADD UNIQUE INDEX `uq_Usuarios_firebase_uid` (`firebaseUid` ASC);

ALTER TABLE `Usuarios`
  DROP CONSTRAINT `chk_Usuarios_contrasena_hash`;

ALTER TABLE `Usuarios`
  ADD CONSTRAINT `chk_Usuarios_contrasena_hash`
    CHECK (
      `contraseña` IS NULL
      OR (`contraseña` = TRIM(`contraseña`) AND CHAR_LENGTH(`contraseña`) >= 60)
    ),
  ADD CONSTRAINT `chk_Usuarios_firebase_uid`
    CHECK (
      `firebaseUid` IS NULL
      OR (`firebaseUid` = TRIM(`firebaseUid`) AND `firebaseUid` <> '')
    );

DELIMITER //

DROP PROCEDURE IF EXISTS `sp_usuario_actualizar_contrasena` //
DROP PROCEDURE IF EXISTS `sp_publico_obtener_usuario_por_email` //

CREATE OR REPLACE PROCEDURE `sp_publico_registrar_usuario`(
    IN pFirebaseUid VARCHAR(128),
    IN pNombre VARCHAR(45),
    IN pApellido VARCHAR(45),
    IN pGenero ENUM('F', 'M', 'MF', 'FM', 'B', 'O', 'N'),
    IN pFechaNacimiento DATE,
    IN pNacionalidad VARCHAR(45),
    IN pEmail VARCHAR(99),
    IN pCUIL VARCHAR(11),
    IN pActividadesArcaCodigo CHAR(6),
    IN pFotoDniUrl VARCHAR(255)
)
MODIFIES SQL DATA
COMMENT 'Registra una identidad Firebase verificada en estado Pendiente (P) con rol USUARIO.'
BEGIN
    DECLARE vEmailExistente INT DEFAULT 0;
    DECLARE vCUILExistente INT DEFAULT 0;
    DECLARE vFirebaseUidExistente INT DEFAULT 0;
    DECLARE vNuevoId INT DEFAULT 0;

    SET pEmail = LOWER(TRIM(pEmail));
    SET pFirebaseUid = TRIM(pFirebaseUid);
    SET pNombre = TRIM(pNombre);
    SET pApellido = TRIM(pApellido);
    SET pNacionalidad = TRIM(pNacionalidad);
    SET pCUIL = TRIM(pCUIL);
    SET pActividadesArcaCodigo = NULLIF(TRIM(pActividadesArcaCodigo), '');
    SET pFotoDniUrl = NULLIF(TRIM(pFotoDniUrl), '');

    SELECT COUNT(*) INTO vEmailExistente FROM `Usuarios` WHERE `email` = pEmail;
    IF vEmailExistente > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El correo electrónico ya se encuentra registrado.';
    END IF;

    SELECT COUNT(*) INTO vFirebaseUidExistente FROM `Usuarios` WHERE `firebaseUid` = pFirebaseUid;
    IF vFirebaseUidExistente > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La identidad de Firebase ya se encuentra registrada.';
    END IF;

    SELECT COUNT(*) INTO vCUILExistente FROM `Usuarios` WHERE `CUIL` = pCUIL;
    IF vCUILExistente > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El CUIL ya se encuentra registrado.';
    END IF;

    INSERT INTO `Usuarios` (
        `nombre`, `apellido`, `genero`, `fechaNacimiento`, `nacionalidad`,
        `email`, `firebaseUid`, `CUIL`, `actividadesArcaCodigo`, `fotoDniUrl`, `rol`, `estado`
    ) VALUES (
        pNombre, pApellido, pGenero, pFechaNacimiento, pNacionalidad,
        pEmail, pFirebaseUid, pCUIL, pActividadesArcaCodigo, pFotoDniUrl, 'USUARIO', 'P'
    );

    SET vNuevoId = LAST_INSERT_ID();

    SELECT
        u.idUsuario, u.nombre, u.apellido, u.email, u.genero, u.fechaNacimiento,
        u.nacionalidad, u.CUIL, u.actividadesArcaCodigo, u.fotoDniUrl,
        u.rol, u.estado, u.fechaRegistro
    FROM `Usuarios` u
    WHERE u.idUsuario = vNuevoId;
END //

CREATE OR REPLACE PROCEDURE `sp_publico_obtener_usuario_por_firebase_uid`(
    IN pFirebaseUid VARCHAR(128)
)
READS SQL DATA
COMMENT 'Obtiene un usuario por la identidad validada por Firebase Authentication.'
BEGIN
    SELECT
        u.idUsuario, u.nombre, u.apellido, u.email, u.genero, u.fechaNacimiento,
        u.nacionalidad, u.CUIL, u.actividadesArcaCodigo, u.fotoDniUrl,
        u.rol, u.estado, u.fechaRegistro
    FROM `Usuarios` u
    WHERE u.firebaseUid = TRIM(pFirebaseUid);
END //

DELIMITER ;
