-- ================================================================
-- Mosaico Cultural
-- Triggers de auditoria de baja logica
-- ================================================================
USE `cultura`;

DELIMITER //

DROP TRIGGER IF EXISTS `trg_Usuarios_fecha_baja_bi`//
CREATE TRIGGER `trg_Usuarios_fecha_baja_bi`
BEFORE INSERT ON `Usuarios`
FOR EACH ROW
BEGIN
  IF NEW.estado = 'I' AND NEW.fechaBaja IS NULL THEN
    SET NEW.fechaBaja = CURRENT_TIMESTAMP;
  END IF;

  IF NEW.estado <> 'I' THEN
    SET NEW.fechaBaja = NULL;
  END IF;
END//

DROP TRIGGER IF EXISTS `trg_Usuarios_fecha_baja_bu`//
CREATE TRIGGER `trg_Usuarios_fecha_baja_bu`
BEFORE UPDATE ON `Usuarios`
FOR EACH ROW
BEGIN
  IF NEW.estado = 'I' AND OLD.estado <> 'I' THEN
    SET NEW.fechaBaja = CURRENT_TIMESTAMP;
  END IF;

  IF NEW.estado = 'I' AND NEW.fechaBaja IS NULL THEN
    SET NEW.fechaBaja = CURRENT_TIMESTAMP;
  END IF;

  IF NEW.estado <> 'I' THEN
    SET NEW.fechaBaja = NULL;
  END IF;
END//

DROP TRIGGER IF EXISTS `trg_Actores_fecha_baja_bi`//
CREATE TRIGGER `trg_Actores_fecha_baja_bi`
BEFORE INSERT ON `Actores`
FOR EACH ROW
BEGIN
  IF NEW.estado = 'I' AND NEW.fechaBaja IS NULL THEN
    SET NEW.fechaBaja = CURRENT_TIMESTAMP;
  END IF;

  IF NEW.estado <> 'I' THEN
    SET NEW.fechaBaja = NULL;
  END IF;
END//

DROP TRIGGER IF EXISTS `trg_Actores_fecha_baja_bu`//
CREATE TRIGGER `trg_Actores_fecha_baja_bu`
BEFORE UPDATE ON `Actores`
FOR EACH ROW
BEGIN
  IF NEW.estado = 'I' AND OLD.estado <> 'I' THEN
    SET NEW.fechaBaja = CURRENT_TIMESTAMP;
  END IF;

  IF NEW.estado = 'I' AND NEW.fechaBaja IS NULL THEN
    SET NEW.fechaBaja = CURRENT_TIMESTAMP;
  END IF;

  IF NEW.estado <> 'I' THEN
    SET NEW.fechaBaja = NULL;
  END IF;
END//

DELIMITER ;
