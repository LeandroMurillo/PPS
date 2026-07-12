-- ================================================================
-- Mosaico Cultural
-- Base de datos: cultura v1.0.2
-- Autores: Cesar Ezequiel Herrera, Leandro Murillo
-- ================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar tablas antes de insertar (Opcional, útil para recargar datos limpios)
TRUNCATE TABLE `cultura`.`ItemsPortafolio`;
TRUNCATE TABLE `cultura`.`RespuestasCampo`;
TRUNCATE TABLE `cultura`.`FormulariosSubcategoria`;
TRUNCATE TABLE `cultura`.`Formularios`;
TRUNCATE TABLE `cultura`.`CamposFormulario`;
TRUNCATE TABLE `cultura`.`Postulaciones`;
TRUNCATE TABLE `cultura`.`Convocatorias`;
TRUNCATE TABLE `cultura`.`Eventos`;
TRUNCATE TABLE `cultura`.`Integrantes`;
TRUNCATE TABLE `cultura`.`Actores`;
TRUNCATE TABLE `cultura`.`ModeradoresCategorias`;
TRUNCATE TABLE `cultura`.`Subcategorias`;
TRUNCATE TABLE `cultura`.`Categorias`;
TRUNCATE TABLE `cultura`.`Ubicaciones`;
TRUNCATE TABLE `cultura`.`Usuarios`;
TRUNCATE TABLE `cultura`.`ActividadesArca`;

-- -----------------------------------------------------
-- 1. Actividades Económicas (ARCA / AFIP)
-- -----------------------------------------------------
INSERT INTO `cultura`.`ActividadesArca` (`codigo`, `descripcion`) VALUES
('900011', 'Producción de espectáculos teatrales y musicales'),
('900012', 'Composición y representación de obras teatrales, musicales y artísticas'),
('321011', 'Fabricación de joyas, bisutería y artículos conexos'),
('591110', 'Producción de filmes y videocintas'),
('900091', 'Servicios de agencias de ventas de entradas y actividades conexas'),
('741000', 'Diseño especializado (gráfico, indumentaria, industrial)'),
('854910', 'Enseñanza artística y cultural');

-- -----------------------------------------------------
-- 2. Usuarios (Administradores, Moderadores y Públicos)
-- Nota: La columna 'dni' no existe, usamos 'CUIL' y 'nacionalidad'.
-- -----------------------------------------------------
INSERT INTO `cultura`.`Usuarios` (`idUsuario`, `actividadesArcaCodigo`, `nombre`, `apellido`, `genero`, `fechaNacimiento`, `nacionalidad`, `email`, `contraseña`, `fechaRegistro`, `rol`, `estado`, `CUIL`) VALUES
(1, NULL, 'Ana', 'Gómez', 'F', '1985-05-12', 'Argentina', 'admin@culturatucuman.gob.ar', 'hash_secreto', '2026-06-01 09:00:00', 'ADMIN', 'A', '27301234567'),
(2, NULL, 'Carlos', 'López', 'M', '1988-11-20', 'Argentina', 'mod.musica@culturatucuman.gob.ar', 'hash_secreto', '2026-06-02 10:15:00', 'MODERADOR', 'A', '20326549871'),
(3, '321011', 'María', 'Sosa', 'F', '1990-03-15', 'Argentina', 'maria.tejidos@email.com', 'hash_secreto', '2026-06-10 14:30:00', 'USUARIO', 'A', '27351112229'),
(4, '900012', 'Juan', 'Pérez', 'M', '1995-07-22', 'Argentina', 'juan.folclore@email.com', 'hash_secreto', '2026-06-15 16:45:00', 'USUARIO', 'A', '20384445558'),
(5, NULL, 'Jane', 'Doe', 'F', '1980-01-10', 'Argentina', 'mod.escenicas@culturatucuman.gob.ar', 'hash_secreto', '2026-06-18 09:00:00', 'MODERADOR', 'A', '27281110004'),
(6, '591110', 'Daniel', 'Craig', 'M', '1982-03-02', 'Argentina', 'daniel.audiovisual@email.com', 'hash_secreto', '2026-06-18 09:05:00', 'USUARIO', 'A', '20311113337'),
(7, '900011', 'Milo', 'Herrera', 'M', '1998-01-01', 'Argentina', 'milo.musica@email.com', 'hash_secreto', '2026-06-18 09:10:00', 'USUARIO', 'A', '20391114441'),
(8, '900012', 'Fito', 'Herrera', 'M', '1999-01-01', 'Argentina', 'fito.escenicas@email.com', 'hash_secreto', '2026-06-18 09:15:00', 'USUARIO', 'A', '20401115552'),
(9, '900091', 'Sofía', 'García', 'F', '1989-10-10', 'Argentina', 'sofia.teatro@email.com', 'hash_secreto', '2026-06-18 09:20:00', 'USUARIO', 'A', '27341116663'),
(10, NULL, 'Roberto', 'Sánchez', 'M', '1975-08-19', 'Argentina', 'roberto.cultura@email.com', 'hash_secreto', '2026-06-20 10:00:00', 'USUARIO', 'A', '20241117775');

-- -----------------------------------------------------
-- 3. Categorías Culturales
-- -----------------------------------------------------
INSERT INTO `cultura`.`Categorias` (`idCategoria`, `nombre`, `estado`) VALUES
(1, 'Música', 'A'),
(2, 'Artesanía', 'A'),
(3, 'Artes Escénicas', 'A'),
(4, 'Audiovisual', 'A'),
(5, 'Literatura', 'A'),
(6, 'Artes Visuales', 'A');

-- -----------------------------------------------------
-- 4. Subcategorías (Clave compuesta PK: idSubcategoria, idCategoria)
-- -----------------------------------------------------
INSERT INTO `cultura`.`Subcategorias` (`idSubcategoria`, `idCategoria`, `nombre`) VALUES
(1, 1, 'Folclore'),
(2, 1, 'Rock / Pop'),
(3, 1, 'Música Clásica y Académica'),
(1, 2, 'Textil'),
(2, 2, 'Cerámica y Alfarería'),
(3, 2, 'Luthería'),
(1, 3, 'Teatro de Texto'),
(2, 3, 'Danza Contemporánea'),
(3, 3, 'Circo y Murga'),
(1, 4, 'Cine Ficción'),
(2, 4, 'Documental');

-- -----------------------------------------------------
-- 5. Moderadores x Categorías
-- -----------------------------------------------------
INSERT INTO `cultura`.`ModeradoresCategorias` (`idCategoria`, `idUsuario`) VALUES
(1, 2), -- Carlos (Música)
(3, 5), -- Jane (Artes Escénicas)
(4, 5); -- Jane también modera Audiovisual

-- -----------------------------------------------------
-- 6. Ubicaciones
-- -----------------------------------------------------
INSERT INTO `cultura`.`Ubicaciones` (`idUbicacion`, `provincia`, `departamento`, `localidad`, `direccion`, `latitud`, `longitud`, `esPublica`) VALUES
(1, 'Tucumán', 'Capital', 'San Miguel de Tucumán', 'San Martín 251', -26.83000000, -65.20000000, 1),
(2, 'Tucumán', 'Tafí Viejo', 'Tafí Viejo', 'Av. Alem 100', -26.73333300, -65.26666700, 1),
(3, 'Tucumán', 'Tafí del Valle', 'Tafí del Valle', 'Ruta Provincial 307 KM 60', -26.85250000, -65.71000000, 1),
(4, 'Tucumán', 'Yerba Buena', 'Yerba Buena', 'Av. Aconquija 1500', -26.81500000, -65.30000000, 1),
(5, 'Tucumán', 'Capital', 'San Miguel de Tucumán', 'Muñecas 200', -26.83000000, -65.20000000, 1),
(6, 'Tucumán', 'Lules', 'San Isidro de Lules', 'Ruta Provincial 301', -26.92000000, -65.34000000, 1);

-- -----------------------------------------------------
-- 7. Actores Culturales (Con Clave Subrogada)
-- -----------------------------------------------------
INSERT INTO `cultura`.`Actores` (`idActor`, `idSubcategoria`, `idCategoria`, `idUbicacion`, `nombre`, `descripcion`, `fotoPerfilUrl`, `cuit`, `tipoActor`, `fechaCreacion`, `estado`) VALUES
(1, 1, 2, 3, 'Tejidos Ancestrales María', 'Producción de ponchos y ruanas en telar criollo.', 'https://img.com/tejidos.jpg', '27351112229', 'INDIVIDUO', '2026-06-11 10:00:00', 'A'),
(2, 1, 1, 1, 'Los Tucu Cantores', 'Agrupación folclórica con más de 10 años de trayectoria.', 'https://img.com/tucucantores.jpg', '30777888991', 'COLECTIVO', '2026-06-16 09:30:00', 'A'),
(3, 1, 3, 5, 'Teatro Alberdi', 'Espacio cultural histórico administrado por la UNT.', 'https://img.com/alberdi.jpg', '30500011122', 'ESPACIO', '2026-06-05 08:00:00', 'A'),
(4, 2, 1, 4, 'Los Carpinchos del Alba', 'Banda de Indie Rock emergente de Yerba Buena.', 'https://img.com/carpinchos.jpg', '33666555449', 'COLECTIVO', '2026-06-18 10:00:00', 'A'),
(5, 1, 4, 6, 'Casino Royale Producciones', 'Productora audiovisual independiente de cortometrajes.', 'https://img.com/casinoroyale.jpg', '20311113337', 'INDIVIDUO', '2026-06-18 10:10:00', 'P'),
(6, 3, 3, 2, 'Compañía Circo Fuego', 'Colectivo de artistas callejeros y teatro de calle.', 'https://img.com/circofuego.jpg', '30111222334', 'COLECTIVO', '2026-06-21 11:00:00', 'A');

-- -----------------------------------------------------
-- 8. Integrantes (Relación N:M, 'esDueño' define administración)
-- -----------------------------------------------------
INSERT INTO `cultura`.`Integrantes` (`idUsuario`, `idActor`, `rol`, `esDueño`) VALUES
(3, 1, 'Artesana Titular', 1),            -- María es dueña de su perfil individual
(4, 2, 'Vocalista y Guitarra', 1),      -- Juan es creador/dueño de la banda "Los Tucu Cantores"
(10, 2, 'Bombo Legüero', 0),            -- Roberto es solo un integrante de la banda
(9, 3, 'Productora General', 1),        -- Sofía administra el Espacio Teatro Alberdi
(7, 4, 'Primera Voz', 1),               -- Milo creó la banda "Los Carpinchos del Alba"
(8, 4, 'Batería y Coros', 0),           -- Fito es baterista en la banda de Milo
(6, 5, 'Director y Guionista', 1),      -- Daniel es el productor audiovisual
(8, 6, 'Actor y Malabarista', 1),       -- Fito (baterista en la banda 4) también es dueño de una compañía de circo
(10, 6, 'Logística', 0);                -- Roberto también ayuda en el circo

-- -----------------------------------------------------
-- 9. Eventos (Noticias o agendas autogestionadas por los Actores)
-- -----------------------------------------------------
INSERT INTO `cultura`.`Eventos` (`idEvento`, `idActor`, `nombre`, `descripcion`, `fecha`, `fechaCreacion`, `estado`) VALUES
(1, 2, 'Presentación en Peña Patria', 'Tocaremos nuestro nuevo disco en vivo', '2026-07-09 22:00:00', '2026-06-25 10:00:00', 'A'),
(2, 4, 'Toque en Bar de Yerba Buena', 'Cierre de la gira barrial', '2026-08-15 23:30:00', '2026-06-26 14:00:00', 'A'),
(3, 3, 'Apertura Temporada Teatral 2026', 'El teatro abre sus puertas con grandes obras', '2026-09-01 20:00:00', '2026-06-27 09:00:00', 'A');

-- -----------------------------------------------------
-- 10. Convocatorias (Creadas por el Ente/Administradores)
-- -----------------------------------------------------
INSERT INTO `cultura`.`Convocatorias` (`idConvocatoria`, `titulo`, `descripcion`, `fechaCreacion`, `fechaCierre`) VALUES
(1, 'Festival Nacional del Limón 2026', 'Convocatoria oficial para artistas musicales de Tafí Viejo y la provincia.', '2026-06-01 08:00:00', '2026-08-30 23:59:59'),
(2, 'Mercado Artesanal Calchaquí - Edición Invierno', 'Espacio de exposición y venta para artesanos de la ruta 307.', '2026-06-10 08:00:00', '2026-07-05 23:59:59'),
(3, 'Fomento a la Producción Audiovisual Independiente', 'Subsidio provincial para finalización de cortometrajes.', '2026-06-15 10:00:00', '2026-10-15 23:59:59');

-- -----------------------------------------------------
-- 11. Postulaciones (Actores aplicando a Convocatorias)
-- -----------------------------------------------------
INSERT INTO `cultura`.`Postulaciones` (`idConvocatoria`, `idActor`, `fechaPostulacion`) VALUES
(1, 2, '2026-06-20 15:30:00'), -- Los Tucu Cantores se postulan al Festival del Limón
(1, 4, '2026-06-21 18:45:00'), -- Los Carpinchos del Alba se postulan al Festival del Limón
(2, 1, '2026-06-12 11:20:00'), -- Tejidos Ancestrales se postula al Mercado Calchaquí
(3, 5, '2026-06-19 09:15:00'); -- Casino Royale se postula al subsidio audiovisual

-- -----------------------------------------------------
-- 12. Campos de Formularios Dinámicos (EAV)
-- -----------------------------------------------------
INSERT INTO `cultura`.`CamposFormulario` (`idCampo`, `pregunta`, `tipoDato`, `opciones`) VALUES
(1, 'Rama productiva principal (Técnica)', 'OPCION_UNICA', '["Telar Criollo", "Macramé", "Dos Agujas", "Torno cerámico", "Modelado a mano"]'),
(2, '¿La materia prima es de origen local?', 'BOOLEANO', NULL),
(3, 'Género musical principal', 'TEXTO', NULL),
(4, 'Cantidad de discos editados', 'NUMERO', NULL),
(5, 'Cámaras o equipos utilizados', 'OPCION_MULTIPLE', '["ARRI", "RED", "Sony Alpha", "Blackmagic", "Dron"]'),
(6, 'Capacidad máxima de espectadores', 'NUMERO', NULL);

-- -----------------------------------------------------
-- 13. Formularios (Relación Campos x Categorías)
-- -----------------------------------------------------
INSERT INTO `cultura`.`Formularios` (`idCategoria`, `idCampo`, `orden`, `esObligatorio`, `esPublico`, `estado`) VALUES
(2, 1, 1, 1, 1, 'A'), -- Artesanía -> Rama Productiva
(2, 2, 2, 1, 0, 'A'), -- Artesanía -> Origen Materia Prima (Privado)
(1, 3, 1, 1, 1, 'A'), -- Música -> Género Musical
(1, 4, 2, 0, 1, 'A'), -- Música -> Discos (Opcional)
(4, 5, 1, 1, 0, 'A'); -- Audiovisual -> Equipos (Privado/Técnico)

-- -----------------------------------------------------
-- 14. FormulariosSubcategoria (Campos ultra-específicos)
-- -----------------------------------------------------
INSERT INTO `cultura`.`FormulariosSubcategoria` (`idCampo`, `idSubcategoria`, `idCategoria`, `orden`, `esObligatorio`, `esPublico`, `estado`) VALUES
(6, 1, 3, 1, 1, 1, 'A'); -- "Capacidad espectadores" solo para "Teatro de Texto" (Subcat 1 de Cat 3)

-- -----------------------------------------------------
-- 15. Respuestas a Campos (La data dinámica de los Actores)
-- -----------------------------------------------------
INSERT INTO `cultura`.`RespuestasCampo` (`idCampo`, `idActor`, `valor`) VALUES
(1, 1, '"Telar Criollo"'),                 -- Artesana María
(2, 1, 'true'),                            -- Materia prima local: true
(3, 2, '"Folclore tradicional tucumano"'), -- Banda Los Tucu
(4, 2, '3'),                               -- Discos: 3
(3, 4, '"Indie Rock Alternativo"'),        -- Banda Los Carpinchos
(4, 4, '0'),                               -- Discos: 0
(5, 5, '["Sony Alpha", "Dron"]');          -- Productora Casino Royale (JSON Array)

-- -----------------------------------------------------
-- 16. Ítems de Portafolio (Galería Pública de cada Actor)
-- -----------------------------------------------------
INSERT INTO `cultura`.`ItemsPortafolio` (`idItem`, `idActor`, `tipo`, `descripcion`, `url`, `orden`) VALUES
(1, 1, 'IMAGEN', 'Poncho tucumano en telar', 'https://mi-servidor.com/tejidos/poncho.jpg', 1),
(2, 2, 'LINK', 'Video de la presentación en Cosquín', 'https://youtube.com/watch?v=12345', 1),
(3, 4, 'LINK', 'Videoclip oficial "Ruta 307"', 'https://youtube.com/watch?v=rutaza', 1),
(4, 5, 'LINK', 'Reel de Cortometrajes 2025', 'https://vimeo.com/casinoroyale', 1),
(5, 6, 'IMAGEN', 'Espectáculo de fuego en Plaza Independencia', 'https://img.com/circo_fuego1.jpg', 1),
(6, 6, 'IMAGEN', 'Clown y malabares', 'https://img.com/circo_clown.jpg', 2);

SET FOREIGN_KEY_CHECKS = 1;
