-- ================================================================
-- Mosaico Cultural
-- Datos de prueba compatibles con cultura v1.2.2
-- Autores: Cesar Ezequiel Herrera, Leandro Murillo
-- ================================================================

USE `cultura`;

SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS;
SET @OLD_UNIQUE_CHECKS = @@UNIQUE_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;
SET UNIQUE_CHECKS = 0;

-- -----------------------------------------------------
-- Limpiar tablas antes de recargar los datos
-- -----------------------------------------------------
TRUNCATE TABLE `cultura`.`Respuestas`;
TRUNCATE TABLE `cultura`.`PreguntasFormulario`;
TRUNCATE TABLE `cultura`.`Formularios`;
TRUNCATE TABLE `cultura`.`Preguntas`;
TRUNCATE TABLE `cultura`.`ItemsPortafolio`;
TRUNCATE TABLE `cultura`.`Postulaciones`;
TRUNCATE TABLE `cultura`.`Convocatorias`;
TRUNCATE TABLE `cultura`.`Eventos`;
TRUNCATE TABLE `cultura`.`Integrantes`;
TRUNCATE TABLE `cultura`.`ModeradoresCategorias`;
TRUNCATE TABLE `cultura`.`Actores`;
TRUNCATE TABLE `cultura`.`Subcategorias`;
TRUNCATE TABLE `cultura`.`Categorias`;
TRUNCATE TABLE `cultura`.`Ubicaciones`;
TRUNCATE TABLE `cultura`.`Usuarios`;
TRUNCATE TABLE `cultura`.`ActividadesArca`;

-- -----------------------------------------------------
-- 1. Actividades económicas (ARCA)
-- -----------------------------------------------------
INSERT INTO `cultura`.`ActividadesArca`
  (`codigo`, `descripcion`)
VALUES
  ('900011', 'Producción de espectáculos teatrales y musicales'),
  ('900012', 'Composición y representación de obras teatrales, musicales y artísticas'),
  ('321011', 'Fabricación de joyas, bisutería y artículos conexos'),
  ('591110', 'Producción de filmes y videocintas'),
  ('900091', 'Servicios de agencias de ventas de entradas y actividades conexas'),
  ('741000', 'Diseño especializado (gráfico, indumentaria, industrial)'),
  ('854910', 'Enseñanza artística y cultural');

-- -----------------------------------------------------
-- 2. Usuarios
-- Las contraseñas son hashes ficticios de 60 caracteres para datos de prueba.
-- -----------------------------------------------------
INSERT INTO `cultura`.`Usuarios`
  (`idUsuario`, `actividadesArcaCodigo`, `nombre`, `apellido`, `genero`,
   `fechaNacimiento`, `nacionalidad`, `email`, `contraseña`,
   `fechaRegistro`, `rol`, `estado`, `CUIL`)
VALUES
  (1, NULL, 'Ana', 'Gómez', 'F', '1985-05-12', 'Argentina',
   'admin@culturatucuman.gob.ar',
   '$2b$12$C6UzMDM.H6dfI/f/IKcEe.72Yw4z9jH6V6U6Z6mY3G5m1fN8KQz2.',
   '2026-06-01 09:00:00', 'ADMIN', 'A', '27301234567'),

  (2, NULL, 'Carlos', 'López', 'M', '1988-11-20', 'Argentina',
   'mod.musica@culturatucuman.gob.ar',
   '$2b$12$C6UzMDM.H6dfI/f/IKcEe.72Yw4z9jH6V6U6Z6mY3G5m1fN8KQz2.',
   '2026-06-02 10:15:00', 'MODERADOR', 'A', '20326549871'),

  (3, '321011', 'María', 'Sosa', 'F', '1990-03-15', 'Argentina',
   'maria.tejidos@email.com',
   '$2b$12$C6UzMDM.H6dfI/f/IKcEe.72Yw4z9jH6V6U6Z6mY3G5m1fN8KQz2.',
   '2026-06-10 14:30:00', 'USUARIO', 'A', '27351112229'),

  (4, '900012', 'Juan', 'Pérez', 'M', '1995-07-22', 'Argentina',
   'juan.folclore@email.com',
   '$2b$12$C6UzMDM.H6dfI/f/IKcEe.72Yw4z9jH6V6U6Z6mY3G5m1fN8KQz2.',
   '2026-06-15 16:45:00', 'USUARIO', 'A', '20384445558'),

  (5, NULL, 'Jane', 'Doe', 'F', '1980-01-10', 'Argentina',
   'mod.escenicas@culturatucuman.gob.ar',
   '$2b$12$C6UzMDM.H6dfI/f/IKcEe.72Yw4z9jH6V6U6Z6mY3G5m1fN8KQz2.',
   '2026-06-18 09:00:00', 'MODERADOR', 'A', '27281110004'),

  (6, '591110', 'Daniel', 'Craig', 'M', '1982-03-02', 'Argentina',
   'daniel.audiovisual@email.com',
   '$2b$12$C6UzMDM.H6dfI/f/IKcEe.72Yw4z9jH6V6U6Z6mY3G5m1fN8KQz2.',
   '2026-06-18 09:05:00', 'USUARIO', 'A', '20311113337'),

  (7, '900011', 'Milo', 'Herrera', 'M', '1998-01-01', 'Argentina',
   'milo.musica@email.com',
   '$2b$12$C6UzMDM.H6dfI/f/IKcEe.72Yw4z9jH6V6U6Z6mY3G5m1fN8KQz2.',
   '2026-06-18 09:10:00', 'USUARIO', 'A', '20391114441'),

  (8, '900012', 'Fito', 'Herrera', 'M', '1999-01-01', 'Argentina',
   'fito.escenicas@email.com',
   '$2b$12$C6UzMDM.H6dfI/f/IKcEe.72Yw4z9jH6V6U6Z6mY3G5m1fN8KQz2.',
   '2026-06-18 09:15:00', 'USUARIO', 'A', '20401115552'),

  (9, '900091', 'Sofía', 'García', 'F', '1989-10-10', 'Argentina',
   'sofia.teatro@email.com',
   '$2b$12$C6UzMDM.H6dfI/f/IKcEe.72Yw4z9jH6V6U6Z6mY3G5m1fN8KQz2.',
   '2026-06-18 09:20:00', 'USUARIO', 'A', '27341116663'),

  (10, NULL, 'Roberto', 'Sánchez', 'M', '1975-08-19', 'Argentina',
   'roberto.cultura@email.com',
   '$2b$12$C6UzMDM.H6dfI/f/IKcEe.72Yw4z9jH6V6U6Z6mY3G5m1fN8KQz2.',
   '2026-06-20 10:00:00', 'USUARIO', 'A', '20241117775');

-- -----------------------------------------------------
-- 3. Categorías culturales
-- -----------------------------------------------------
INSERT INTO `cultura`.`Categorias`
  (`idCategoria`, `nombre`, `icono`, `estado`)
VALUES
  (1, 'Música', 'MusicNote', 'A'),
  (2, 'Artesanía', 'Handyman', 'A'),
  (3, 'Artes Escénicas', 'TheaterComedy', 'A'),
  (4, 'Audiovisual', 'Movie', 'A'),
  (5, 'Literatura', 'MenuBook', 'A'),
  (6, 'Artes Visuales', 'Palette', 'A');

-- -----------------------------------------------------
-- 4. Subcategorías
-- Cada categoría puede tener como máximo una subcategoría.
-- -----------------------------------------------------
INSERT INTO `cultura`.`Subcategorias`
  (`idCategoria`, `idSubcategoria`, `nombre`, `estado`)
VALUES
  (1, 1, 'Música popular', 'A'),
  (2, 1, 'Artesanía tradicional', 'A'),
  (3, 1, 'Artes escénicas', 'A'),
  (4, 1, 'Producción audiovisual', 'A');

-- -----------------------------------------------------
-- 5. Moderadores por categoría
-- -----------------------------------------------------
INSERT INTO `cultura`.`ModeradoresCategorias`
  (`idCategoria`, `idUsuario`)
VALUES
  (1, 2),
  (3, 5),
  (4, 5);

-- -----------------------------------------------------
-- 6. Ubicaciones
-- -----------------------------------------------------
INSERT INTO `cultura`.`Ubicaciones`
  (`idUbicacion`, `provincia`, `departamento`, `localidad`, `direccion`,
   `latitud`, `longitud`, `esPublica`)
VALUES
  (1, 'Tucumán', 'Capital', 'San Miguel de Tucumán', 'San Martín 251',
   -26.83000000, -65.20000000, 1),
  (2, 'Tucumán', 'Tafí Viejo', 'Tafí Viejo', 'Av. Alem 100',
   -26.73333300, -65.26666700, 1),
  (3, 'Tucumán', 'Tafí del Valle', 'Tafí del Valle', 'Ruta Provincial 307 KM 60',
   -26.85250000, -65.71000000, 1),
  (4, 'Tucumán', 'Yerba Buena', 'Yerba Buena', 'Av. Aconquija 1500',
   -26.81500000, -65.30000000, 1),
  (5, 'Tucumán', 'Capital', 'San Miguel de Tucumán', 'Muñecas 200',
   -26.83000000, -65.20000000, 1),
  (6, 'Tucumán', 'Lules', 'San Isidro de Lules', 'Ruta Provincial 301',
   -26.92000000, -65.34000000, 1);

-- -----------------------------------------------------
-- 7. Actores culturales
-- La FK a Subcategorias requiere idCategoria e idSubcategoria.
-- -----------------------------------------------------
INSERT INTO `cultura`.`Actores`
  (`idActor`, `idCategoria`, `idSubcategoria`, `idUbicacion`, `nombre`,
   `descripcion`, `fotoPerfilUrl`, `cuit`, `tipoActor`, `fechaCreacion`, `estado`)
VALUES
  (1, 2, 1, 3, 'Tejidos Ancestrales María',
   'Producción de ponchos y ruanas en telar criollo.',
   'https://img.com/tejidos.jpg', '27351112229', 'INDIVIDUO',
   '2026-06-11 10:00:00', 'A'),

  (2, 1, 1, 1, 'Los Tucu Cantores',
   'Agrupación folclórica con más de 10 años de trayectoria.',
   'https://img.com/tucucantores.jpg', '30777888991', 'COLECTIVO',
   '2026-06-16 09:30:00', 'A'),

  (3, 3, 1, 5, 'Teatro Alberdi',
   'Espacio cultural histórico administrado por la UNT.',
   'https://img.com/alberdi.jpg', '30500011122', 'ESPACIO',
   '2026-06-05 08:00:00', 'A'),

  (4, 1, 1, 4, 'Los Carpinchos del Alba',
   'Banda de indie rock emergente de Yerba Buena.',
   'https://img.com/carpinchos.jpg', '33666555449', 'COLECTIVO',
   '2026-06-18 10:00:00', 'A'),

  (5, 4, 1, 6, 'Casino Royale Producciones',
   'Productora audiovisual independiente de cortometrajes.',
   'https://img.com/casinoroyale.jpg', '20311113337', 'INDIVIDUO',
   '2026-06-18 10:10:00', 'P'),

  (6, 3, 1, 2, 'Compañía Circo Fuego',
   'Colectivo de artistas callejeros y teatro de calle.',
   'https://img.com/circofuego.jpg', '30111222334', 'COLECTIVO',
   '2026-06-21 11:00:00', 'A');

-- -----------------------------------------------------
-- 8. Integrantes
-- esDueño controla permisos administrativos y no determina el rol artístico.
-- -----------------------------------------------------
INSERT INTO `cultura`.`Integrantes`
  (`idUsuario`, `idActor`, `rol`, `esDueño`)
VALUES
  (3, 1, 'Artesana textil', 1),
  (4, 2, 'Voz principal y guitarra', 1),
  (10, 2, 'Bombo legüero', 0),
  (9, 3, 'Administradora del espacio', 1),
  (7, 4, 'Voz y guitarra', 1),
  (8, 4, 'Batería y coros', 0),
  (6, 5, 'Director y productor audiovisual', 1),
  (8, 6, 'Artista circense', 1),
  (10, 6, 'Logística', 0);

-- -----------------------------------------------------
-- 9. Eventos
-- -----------------------------------------------------
INSERT INTO `cultura`.`Eventos`
  (`idEvento`, `idActor`, `nombre`, `descripcion`, `fecha`, `fechaCreacion`, `estado`)
VALUES
  (1, 2, 'Presentación en Peña Patria',
   'Tocaremos nuestro nuevo disco en vivo.',
   '2026-07-09 22:00:00', '2026-06-25 10:00:00', 'A'),
  (2, 4, 'Toque en Bar de Yerba Buena',
   'Cierre de la gira barrial.',
   '2026-08-15 23:30:00', '2026-06-26 14:00:00', 'A'),
  (3, 3, 'Apertura Temporada Teatral 2026',
   'El teatro abre sus puertas con grandes obras.',
   '2026-09-01 20:00:00', '2026-06-27 09:00:00', 'A');

-- -----------------------------------------------------
-- 10. Convocatorias
-- -----------------------------------------------------
INSERT INTO `cultura`.`Convocatorias`
  (`idConvocatoria`, `titulo`, `descripcion`, `fechaCreacion`, `fechaCierre`)
VALUES
  (1, 'Festival Nacional del Limón 2026',
   'Convocatoria oficial para artistas musicales de Tafí Viejo y la provincia.',
   '2026-06-01 08:00:00', '2026-08-30 23:59:59'),
  (2, 'Mercado Artesanal Calchaquí - Edición Invierno',
   'Espacio de exposición y venta para artesanos de la ruta 307.',
   '2026-06-10 08:00:00', '2026-07-05 23:59:59'),
  (3, 'Fomento a la Producción Audiovisual Independiente',
   'Subsidio provincial para finalización de cortometrajes.',
   '2026-06-15 10:00:00', '2026-10-15 23:59:59');

-- -----------------------------------------------------
-- 11. Postulaciones
-- -----------------------------------------------------
INSERT INTO `cultura`.`Postulaciones`
  (`idConvocatoria`, `idActor`, `fechaPostulacion`)
VALUES
  (1, 2, '2026-06-20 15:30:00'),
  (1, 4, '2026-06-21 18:45:00'),
  (2, 1, '2026-06-12 11:20:00'),
  (3, 5, '2026-06-19 09:15:00');

-- -----------------------------------------------------
-- 12. Preguntas reutilizables
-- -----------------------------------------------------
INSERT INTO `cultura`.`Preguntas`
  (`idPregunta`, `pregunta`, `tipoDato`, `opciones`)
VALUES
  (1, 'Rama productiva principal (técnica)', 'OPCION_UNICA',
   '["Telar Criollo", "Macramé", "Dos Agujas", "Torno cerámico", "Modelado a mano"]'),
  (2, '¿La materia prima es de origen local?', 'BOOLEANO', NULL),
  (3, 'Género musical principal', 'TEXTO', NULL),
  (4, 'Cantidad de discos editados', 'NUMERO', NULL),
  (5, 'Cámaras o equipos utilizados', 'OPCION_MULTIPLE',
   '["ARRI", "RED", "Sony Alpha", "Blackmagic", "Dron"]'),
  (6, 'Capacidad máxima de espectadores', 'NUMERO', NULL),
  (7, 'Influencias musicales principales', 'TEXTO', NULL),
  (8, 'Formato habitual de presentación', 'OPCION_UNICA',
   '["Solista", "Dúo", "Trío", "Banda", "Orquesta"]');

-- -----------------------------------------------------
-- 13. Formularios
-- idSubcategoria NULL identifica un formulario de categoría.
-- -----------------------------------------------------
INSERT INTO `cultura`.`Formularios`
  (`idFormulario`, `idCategoria`, `idSubcategoria`, `titulo`, `descripcion`, `fechaCreacion`)
VALUES
  (1, 2, NULL,
   'Relevamiento de Artesanía',
   'Información productiva general de los actores de la categoría Artesanía.',
   '2026-06-01 09:00:00'),

  (2, 1, NULL,
   'Relevamiento de Música',
   'Información general sobre la actividad y trayectoria musical.',
   '2026-06-01 09:15:00'),

  (3, 4, NULL,
   'Relevamiento Audiovisual',
   'Información técnica general de productores y realizadores audiovisuales.',
   '2026-06-01 09:30:00'),

  (4, 3, 1,
   'Información específica de artes escénicas',
   'Información complementaria para actores de la subcategoría Artes escénicas.',
   '2026-06-01 09:45:00'),

  (5, 1, 1,
   'Información específica de música popular',
   'Información complementaria para actores de la subcategoría Música popular.',
   '2026-06-01 10:00:00');

-- -----------------------------------------------------
-- 14. Preguntas incorporadas a cada formulario
-- -----------------------------------------------------
INSERT INTO `cultura`.`PreguntasFormulario`
  (`idFormulario`, `idPregunta`, `idPreguntaReemplazada`, `orden`,
   `esObligatorio`, `esPublico`, `fechaIncorporacion`, `fechaDesactivacion`, `estado`)
VALUES
  (1, 1, NULL, 1, 1, 1, '2026-06-01 10:00:00', NULL, 'A'),
  (1, 2, NULL, 2, 1, 0, '2026-06-01 10:01:00', NULL, 'A'),

  (2, 3, NULL, 1, 1, 1, '2026-06-01 10:05:00', NULL, 'A'),
  (2, 4, NULL, 2, 0, 1, '2026-06-01 10:06:00', NULL, 'A'),

  (3, 5, NULL, 1, 1, 0, '2026-06-01 10:10:00', NULL, 'A'),

  (4, 6, NULL, 1, 1, 1, '2026-06-01 10:15:00', NULL, 'A'),

  (5, 7, NULL, 1, 1, 1, '2026-06-01 10:20:00', NULL, 'A'),
  (5, 8, NULL, 2, 1, 1, '2026-06-01 10:21:00', NULL, 'A');

-- -----------------------------------------------------
-- 15. Respuestas vigentes de los actores
-- La PK incluye formulario, pregunta y actor.
-- -----------------------------------------------------
INSERT INTO `cultura`.`Respuestas`
  (`idFormulario`, `idPregunta`, `idActor`, `valor`, `fechaCreacion`,
   `fechaUltimaModificacion`, `fechaUltimaConfirmacion`)
VALUES
  (1, 1, 1, '"Telar Criollo"',
   '2026-06-11 10:15:00', '2026-06-11 10:15:00', '2026-07-01 09:00:00'),
  (1, 2, 1, 'true',
   '2026-06-11 10:16:00', '2026-06-11 10:16:00', '2026-07-01 09:00:00'),

  (2, 3, 2, '"Folclore tradicional tucumano"',
   '2026-06-16 09:45:00', '2026-06-16 09:45:00', '2026-07-02 10:00:00'),
  (2, 4, 2, '3',
   '2026-06-16 09:46:00', '2026-06-16 09:46:00', '2026-07-02 10:00:00'),

  (2, 3, 4, '"Indie Rock Alternativo"',
   '2026-06-18 10:20:00', '2026-06-18 10:20:00', '2026-07-03 11:00:00'),
  (2, 4, 4, '0',
   '2026-06-18 10:21:00', '2026-06-18 10:21:00', '2026-07-03 11:00:00'),

  (5, 7, 4, '"Rock nacional, britpop y post-punk"',
   '2026-06-18 10:22:00', '2026-06-18 10:22:00', '2026-07-03 11:00:00'),
  (5, 8, 4, '"Banda"',
   '2026-06-18 10:23:00', '2026-06-18 10:23:00', '2026-07-03 11:00:00'),

  (3, 5, 5, '["Sony Alpha", "Dron"]',
   '2026-06-18 10:30:00', '2026-06-18 10:30:00', '2026-07-04 12:00:00'),

  (4, 6, 3, '650',
   '2026-06-05 08:30:00', '2026-06-05 08:30:00', '2026-07-05 09:00:00');

-- -----------------------------------------------------
-- 16. Ítems del portafolio
-- -----------------------------------------------------
INSERT INTO `cultura`.`ItemsPortafolio`
  (`idItem`, `idActor`, `tipo`, `descripcion`, `url`, `fechaCreacion`)
VALUES
  (1, 1, 'IMAGEN', 'Poncho tucumano en telar',
   'https://mi-servidor.com/tejidos/poncho.jpg', '2026-06-12 10:00:00'),
  (2, 2, 'LINK', 'Video de la presentación en Cosquín',
   'https://youtube.com/watch?v=12345', '2026-06-17 11:00:00'),
  (3, 4, 'LINK', 'Videoclip oficial "Ruta 307"',
   'https://youtube.com/watch?v=rutaza', '2026-06-19 12:00:00'),
  (4, 5, 'LINK', 'Reel de cortometrajes 2025',
   'https://vimeo.com/casinoroyale', '2026-06-20 13:00:00'),
  (5, 6, 'IMAGEN', 'Espectáculo de fuego en Plaza Independencia',
   'https://img.com/circo_fuego1.jpg', '2026-06-22 14:00:00'),
  (6, 6, 'IMAGEN', 'Clown y malabares',
   'https://img.com/circo_clown.jpg', '2026-06-22 14:10:00');

SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS = @OLD_UNIQUE_CHECKS;
