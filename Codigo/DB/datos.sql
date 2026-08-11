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
   '2026-06-20 10:00:00', 'USUARIO', 'A', '20241117775'),

  (11, '900011', 'Cesar', 'H', 'M', '1999-04-18', 'Argentina',
   'cesar.carpinchos@email.com',
   '$2b$12$C6UzMDM.H6dfI/f/IKcEe.72Yw4z9jH6V6U6Z6mY3G5m1fN8KQz2.',
   '2026-06-22 09:00:00', 'USUARIO', 'A', '20401118884'),

  (12, '900011', 'Leandro', 'M', 'M', '1999-09-05', 'Argentina',
   'leandro.carpinchos@email.com',
   '$2b$12$C6UzMDM.H6dfI/f/IKcEe.72Yw4z9jH6V6U6Z6mY3G5m1fN8KQz2.',
   '2026-06-22 09:05:00', 'USUARIO', 'A', '20411119997');

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
  (6, 'Artes Visuales', 'Palette', 'A'),
  (7, 'Patrimonio', 'Category', 'A'),
  (8, 'Danza', 'Category', 'A'),
  (9, 'Fotografía', 'Category', 'A'),
  (10, 'Diseño', 'Category', 'A');

-- -----------------------------------------------------
-- 4. Subcategorías
-- Subcategorías por categoría.
-- -----------------------------------------------------
INSERT INTO `cultura`.`Subcategorias`
  (`idCategoria`, `idSubcategoria`, `nombre`, `estado`)
VALUES
  (1, 1, 'Música popular', 'A'),
  (1, 2, 'Música académica', 'A'),
  (1, 3, 'Folklore y tradición', 'A'),
  (2, 1, 'Artesanía tradicional', 'A'),
  (2, 2, 'Cerámica y modelado', 'A'),
  (2, 3, 'Textil y telar', 'A'),
  (3, 1, 'Artes escénicas', 'A'),
  (3, 2, 'Dramaturgia y dirección', 'A'),
  (3, 3, 'Teatro independiente', 'A'),
  (4, 1, 'Producción audiovisual', 'A'),
  (4, 2, 'Cine y documental', 'A'),
  (4, 3, 'Fotografía audiovisual', 'A');

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
   -26.81600000, -65.21050000, 1),
  (2, 'Tucumán', 'Tafí Viejo', 'Tafí Viejo', 'Av. Alem 100',
   -26.73333300, -65.26666700, 1),
  (3, 'Tucumán', 'Tafí del Valle', 'Tafí del Valle', 'Ruta Provincial 307 KM 60',
   -26.85280000, -65.70980000, 1),
  (4, 'Tucumán', 'Yerba Buena', 'Yerba Buena', 'Av. Aconquija 1500',
   -26.81298000, -65.29543000, 1),
  (5, 'Tucumán', 'Capital', 'San Miguel de Tucumán', 'Muñecas 200',
   -26.81600000, -65.21050000, 1),
  (6, 'Tucumán', 'Lules', 'San Isidro de Lules', 'Ruta Provincial 301',
   -26.92000000, -65.34000000, 1),
  (7, 'Tucumán', 'Burruyacú', 'Burruyacú', 'Plaza Principal', -26.5000, -64.7500, 1),
  (8, 'Tucumán', 'Burruyacú', 'Burruyacú', 'Centro de Artesanos', -26.5020, -64.7520, 1),
  (9, 'Tucumán', 'Capital', 'San Miguel de Tucumán', '24 de Septiembre 400', -26.8241, -65.2226, 1),
  (10, 'Tucumán', 'Capital', 'San Miguel de Tucumán', 'Mendoza 800', -26.8280, -65.2210, 1),
  (11, 'Tucumán', 'Capital', 'San Miguel de Tucumán', 'Av. Sarmiento 601', -26.8195, -65.2105, 1),
  (12, 'Tucumán', 'Capital', 'San Miguel de Tucumán', '25 de Mayo 265', -26.8250, -65.2080, 1),
  (13, 'Tucumán', 'Capital', 'San Miguel de Tucumán', 'Av. Aconquija 729', -26.8220, -65.2060, 1),
  (14, 'Tucumán', 'Capital', 'San Miguel de Tucumán', 'San Juan 700', -26.8260, -65.2010, 1),
  (15, 'Tucumán', 'Capital', 'San Miguel de Tucumán', 'Crisóstomo Álvarez 500', -26.8230, -65.2190, 1),
  (16, 'Tucumán', 'Capital', 'San Miguel de Tucumán', 'Congreso 65', -26.8350, -65.2120, 1),
  (17, 'Tucumán', 'Capital', 'San Miguel de Tucumán', 'Congreso 141', -26.8306, -65.2039, 1),
  (18, 'Tucumán', 'Capital', 'San Miguel de Tucumán', 'San Martín 251', -26.8190, -65.2110, 1),
  (19, 'Tucumán', 'Chicligasta', 'Concepción', 'Italia 1200', -27.3450, -65.5950, 1),
  (20, 'Tucumán', 'Chicligasta', 'Concepción', 'San Martín 1500', -27.3460, -65.5980, 1),
  (21, 'Tucumán', 'Chicligasta', 'Concepción', 'Plaza Mitre', -27.3448, -65.5966, 1),
  (22, 'Tucumán', 'Cruz Alta', 'Banda del Río Salí', 'Av. San Martín 300', -26.8550, -65.1700, 1),
  (23, 'Tucumán', 'Cruz Alta', 'Banda del Río Salí', 'Ruta 9 KM 1290', -26.8600, -65.1500, 1),
  (24, 'Tucumán', 'Famaillá', 'Famaillá', 'Ruta 38', -27.0510, -65.4020, 1),
  (25, 'Tucumán', 'Famaillá', 'Famaillá', 'Parque Temático Histórico', -27.0500, -65.4000, 1),
  (26, 'Tucumán', 'Graneros', 'Graneros', 'Plaza Principal', -27.6500, -65.4300, 1),
  (27, 'Tucumán', 'Graneros', 'Graneros', 'Ruta 308', -27.6520, -65.4310, 1),
  (28, 'Tucumán', 'Juan Bautista Alberdi', 'Alberdi', 'Plaza Principal', -27.5861, -65.6200, 1),
  (29, 'Tucumán', 'Juan Bautista Alberdi', 'Alberdi', 'Centro Cultural', -27.5870, -65.6210, 1),
  (30, 'Tucumán', 'La Cocha', 'La Cocha', 'Ruta 38', -27.7667, -65.5833, 1),
  (31, 'Tucumán', 'La Cocha', 'La Cocha', 'Centro Cultural', -27.7690, -65.5810, 1),
  (32, 'Tucumán', 'Leales', 'Bella Vista', 'Plaza Principal', -27.0340, -65.3010, 1),
  (33, 'Tucumán', 'Leales', 'Bella Vista', 'Ingenio Bella Vista', -27.0333, -65.3000, 1),
  (34, 'Tucumán', 'Lules', 'San Isidro de Lules', 'Ruta 301 KM 20', -26.9200, -65.3400, 1),
  (35, 'Tucumán', 'Lules', 'San Isidro de Lules', 'Parroquia San Isidro', -26.9167, -65.3333, 1),
  (36, 'Tucumán', 'Monteros', 'Monteros', 'Plaza Bernabé Aráoz', -27.1667, -65.5000, 1),
  (37, 'Tucumán', 'Monteros', 'Monteros', 'Gimnasio Municipal', -27.1680, -65.5020, 1),
  (38, 'Tucumán', 'Río Chico', 'Aguilares', 'Av. Mitre 500', -27.4350, -65.6180, 1),
  (39, 'Tucumán', 'Río Chico', 'Aguilares', 'Centro Cultural', -27.4333, -65.6167, 1),
  (40, 'Tucumán', 'Simoca', 'Simoca', 'Predio Ferial', -27.2667, -65.3500, 1),
  (41, 'Tucumán', 'Simoca', 'Simoca', 'Ruta 157', -27.2680, -65.3510, 1),
  (42, 'Tucumán', 'Tafí del Valle', 'Colalao del Valle', 'Ruta 40 KM 4292', -26.2778, -66.0222, 1),
  (43, 'Tucumán', 'Tafí del Valle', 'Tafí del Valle', 'Ruta 307 KM 62', -26.8600, -65.7000, 1),
  (44, 'Tucumán', 'Tafí del Valle', 'Tafí del Valle', 'Ruta 307 KM 59', -26.8540, -65.7080, 1),
  (45, 'Tucumán', 'Tafí del Valle', 'Amaicha del Valle', 'Plaza Principal', -26.5950, -65.9200, 1),
  (46, 'Tucumán', 'Tafí Viejo', 'Tafí Viejo', 'Av. Alem y Alsina', -26.7333, -65.2667, 1),
  (47, 'Tucumán', 'Tafí Viejo', 'Tafí Viejo', 'Talleres Ferroviarios', -26.7310, -65.2650, 1),
  (48, 'Tucumán', 'Trancas', 'Trancas', 'Ruta 9 KM 1350', -26.2333, -65.2800, 1),
  (49, 'Tucumán', 'Trancas', 'Trancas', 'Plaza Principal', -26.2350, -65.2820, 1),
  (50, 'Tucumán', 'Yerba Buena', 'Yerba Buena', 'Av. Aconquija 2000', -26.8167, -65.3000, 1),
  (51, 'Tucumán', 'Yerba Buena', 'Yerba Buena', 'Lobo de la Vega 150', -26.8180, -65.3020, 1),
  (52, 'Tucumán', 'Yerba Buena', 'Yerba Buena', 'Av. Perón 1500', -26.8120, -65.3050, 1),
  (53, 'Tucumán', 'Yerba Buena', 'Yerba Buena', 'Av. Aconquija 1000', -26.8200, -65.2900, 1),
  (54, 'Tucumán', 'Capital', 'San Miguel de Tucumán', 'San Lorenzo 1200', -26.8210, -65.2250, 1),
  (55, 'Tucumán', 'Tafí del Valle', 'Amaicha del Valle', 'Ruta 307', -26.5934, -65.9187, 1),
  (56, 'Tucumán', 'Chicligasta', 'Concepción', '24 de Septiembre 1100', -27.3465, -65.5990, 1);

-- -----------------------------------------------------
-- 7. Actores culturales
-- La FK a Subcategorias requiere idCategoria e idSubcategoria.
-- -----------------------------------------------------
INSERT INTO `cultura`.`Actores`
  (`idActor`, `idCategoria`, `idSubcategoria`, `idUbicacion`, `nombre`,
   `descripcion`, `fotoPerfilUrl`, `cuit`, `tipoActor`, `fechaCreacion`, `estado`)
VALUES
  (1, 2, 1, 3, 'Tejidos Ancestrales María',
   'Producción de ponchos y ruanas en telar criollo. Utilizando técnicas heredadas de generaciones pasadas, cada pieza es única, tejida con lana de oveja hilada a mano y teñida con pigmentos naturales del cerro. Las carpinchas, con sus anteojos de lectura y ovillos de colores, tejen los lazos de la comunidad.',
   'https://images.unsplash.com/photo-1606722590583-6951b5ea92ad?auto=format&fit=crop&w=600&q=80', '27351112229', 'INDIVIDUO',
   '2026-06-11 10:00:00', 'A'),

  (2, 1, 1, 1, 'Los Tucu Cantores',
   'Agrupación folclórica con más de 10 años de trayectoria. Llevamos el sonido vibrante de las zambas y chacareras a cada rincón del país, manteniendo vivo el espíritu tradicional del norte.',
   'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80', '30777888991', 'COLECTIVO',
   '2026-06-16 09:30:00', 'A'),

  (3, 3, 1, 5, 'Teatro Alberdi',
   'Espacio cultural histórico administrado por la UNT. Epicentro de la vida escénica tucumana, ofreciendo una cartelera diversa que va desde el teatro clásico hasta propuestas independientes contemporáneas.',
   'https://images.unsplash.com/photo-1773332598451-8a0a59941912?auto=format&fit=crop&w=600&q=80', '30500011122', 'ESPACIO',
   '2026-06-05 08:00:00', 'A'),

  (4, 1, 1, 4, 'Los Carpinchos del Alba',
   'Banda de indie rock emergente de Yerba Buena. Melenas al viento que harían envidiar al mismísimo Ariel, aparecen Los Carpinchos del Alba.',
   'https://images.unsplash.com/photo-1614793351079-11dd79b922ba?auto=format&fit=crop&w=600&q=80', '33666555449', 'COLECTIVO',
   '2026-06-18 10:00:00', 'A'),

  (5, 4, 1, 6, 'Casino Royale Producciones',
   'Productora audiovisual independiente dedicada a la creación de cortometrajes y documentales que exploran temáticas sociales e historias locales con una mirada cinematográfica íntima.',
   'https://images.unsplash.com/photo-1601506521937-0121a7fc2a6b?auto=format&fit=crop&w=600&q=80', '20311113337', 'INDIVIDUO',
   '2026-06-18 10:10:00', 'P'),

  (6, 3, 1, 2, 'Compañía Circo Fuego',
   'Colectivo de artistas callejeros y teatro de calle. Intervenimos espacios públicos con espectáculos de malabares, acrobacias y humor, llevando magia y sonrisas a grandes y chicos.',
   'https://images.unsplash.com/photo-1531058240690-006c446962d8?auto=format&fit=crop&w=600&q=80', '30111222334', 'COLECTIVO',
   '2026-06-21 11:00:00', 'A'),

  (7, 1, 1, 7, 'Festival de la Alfalfa',
   'Tradicional festival folclórico de Burruyacú que reúne a músicos locales y provinciales, celebrando las raíces rurales y el trabajo del campo con jineteadas, canto y comidas típicas.',
   NULL, NULL, 'COLECTIVO', '2026-06-05 08:00:00', 'A'),

  (8, 2, 1, 8, 'Taller de Tejido Criollo de Burruyacú',
   'Espacio comunitario dedicado a la preservación de técnicas ancestrales de hilado y telar criollo, donde artesanas locales transmiten su saber a las nuevas generaciones.',
   NULL, NULL, 'COLECTIVO', '2026-07-12 11:07:00', 'A'),
  (9, 1, 1, 9, 'Grupo Ráfaga',
   'Reconocida banda de música tropical con una enorme trayectoria, haciendo bailar a multitudes en grandes festivales populares y eventos en toda la provincia.',
   'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80', NULL, 'COLECTIVO', '2026-06-29 14:14:00', 'A'),

  (10, 1, 1, 10, 'Homenaje a Mercedes Sosa',
   'Espacio cultural y colectivo de artistas dedicados a realizar actividades conmemorativas e interpretaciones para mantener vivo el inmenso legado de La Voz de América.',
   'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=600&q=80', NULL, 'COLECTIVO', '2026-06-16 17:21:00', 'A'),

  (11, 3, 1, 11, 'Teatro San Martín',
   'El principal coliseo de la provincia de Tucumán. Edificio de imponente arquitectura clásica que es sede de los cuerpos estables de teatro, ballet y ópera provinciales.',
   'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&w=600&q=80', NULL, 'ESPACIO', '2026-07-23 10:28:00', 'A'),

  (12, 6, NULL, 12, 'Centro Cultural Virla',
   'Dinámico espacio artístico gestionado por la UNT en pleno microcentro. Alberga exposiciones de artes plásticas, recitales íntimos, ciclos de cine e importantes debates culturales.',
   'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&w=600&q=80', NULL, 'ESPACIO', '2026-07-10 13:35:00', 'A'),

  (13, 4, 1, 13, 'Escuela Universitaria de Cine',
   'Semillero fundamental de realizadores audiovisuales. Institución que impulsa el cine independiente en el NOA, formando profesionales en dirección, producción y guión.',
   'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80', NULL, 'ESPACIO', '2026-06-27 16:42:00', 'A'),

  (14, 9, NULL, 14, 'Fotoclub Tucumán',
   'Asociación civil que nuclea a fotógrafos aficionados y profesionales, enfocada en la enseñanza, la exposición y la documentación identitaria, social e histórica de la provincia.',
   'https://images.unsplash.com/photo-1516961642265-531546e84af2?auto=format&fit=crop&w=600&q=80', NULL, 'COLECTIVO', '2026-06-14 09:49:00', 'A'),

  (15, 10, NULL, 15, 'Diseño de Autor Tucumano',
   'Colectivo de diseñadores locales de indumentaria que fusionan la rica iconografía precolombina de los valles con tendencias modernas y materiales sustentables.',
   NULL, NULL, 'COLECTIVO', '2026-07-21 12:56:00', 'A'),

  (16, 5, NULL, 16, 'Biblioteca Sarmiento',
   'Prestigiosa y centenaria institución dedicada al resguardo del patrimonio bibliográfico, hemeroteca histórica y a la constante promoción de la literatura de autores regionales.',
   'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=600&q=80', NULL, 'ESPACIO', '2026-07-08 15:03:00', 'A'),

  (17, 7, NULL, 17, 'Casa Histórica de la Independencia',
   'Monumento Nacional icónico y museo de sitio. La casa colonial donde el Congreso de Tucumán proclamó la solemne Declaración de la Independencia Argentina el 9 de julio de 1816.',
   NULL, NULL, 'ESPACIO', '2026-06-25 08:10:00', 'A'),

  (18, 8, NULL, 18, 'Ballet Contemporáneo de la Provincia',
   'Compañía artística oficial integrada por talentosos bailarines, orientada a desarrollar producciones coreográficas de vanguardia, experimentación y giras regionales.',
   'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?auto=format&fit=crop&w=600&q=80', NULL, 'COLECTIVO', '2026-06-12 11:17:00', 'A'),

  (19, 3, 1, 19, 'Teatro Estación Concepción',
   'Antigua estación ferroviaria bellamente recuperada y transformada en un vibrante centro cultural, con sala de teatro independiente y espacios para talleres comunitarios de arte.',
   'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80', NULL, 'ESPACIO', '2026-07-19 14:24:00', 'A'),

  (20, 5, NULL, 20, 'Biblioteca Mariano Moreno',
   'Activo espacio de fomento a la lectura en el sur provincial que realiza ciclos de cafés literarios, presentaciones de libros y encuentros con autores locales y regionales.',
   'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80', NULL, 'ESPACIO', '2026-07-06 17:31:00', 'A'),

  (21, 2, 1, 21, 'Feria de Artesanos del Sur',
   'Punto de encuentro semanal en la plaza principal de Concepción, exhibiendo excelentes trabajos de artesanos del cuero, metal, madera y cestería de toda la región sur.',
   NULL, NULL, 'COLECTIVO', '2026-06-23 10:38:00', 'A'),

  (22, 8, NULL, 22, 'Academia Danzas Banda del Río Salí',
   'Reconocida escuela de formación artística para niños y jóvenes, fuertemente enfocada en la enseñanza del malambo, las destrezas gauchas y las danzas folclóricas del NOA.',
   'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=600&q=80', NULL, 'COLECTIVO', '2026-06-10 13:45:00', 'A'),

  (23, 7, NULL, 23, 'Festival de la Humita',
   'Gran encuentro gastronómico, musical y cultural que rinde homenaje a la humita, plato ancestral del norte argentino, convocando a miles de familias en cada edición.',
   'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80', NULL, 'COLECTIVO', '2026-07-17 16:52:00', 'A'),

  (24, 7, NULL, 24, 'Fiesta Nacional de la Empanada',
   'Famoso y multitudinario festival nacional en Famaillá. Premia a las mejores "campeonas del repulgue" y reúne a las figuras más destacadas del folclore nacional en su escenario principal.',
   'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80', NULL, 'COLECTIVO', '2026-07-04 09:59:00', 'A'),

  (25, 4, 1, 25, 'Festival de Cortos Famaillá',
   'Muestra competitiva anual de cine que convoca a realizadores independientes, estudiantes y profesionales del formato cortometraje y documental de toda la región.',
   'https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=600&q=80', NULL, 'COLECTIVO', '2026-06-21 12:06:00', 'A'),

  (26, 7, NULL, 26, 'Fiesta Provincial del Locro',
   'Encuentro popular y familiar de cocina tradicional criolla acompañado por nutridas peñas folclóricas, agrupaciones gauchas y ferias de artesanos al aire libre.',
   'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80', NULL, 'COLECTIVO', '2026-06-08 15:13:00', 'A'),

  (27, 1, 1, 27, 'Encuentro Cantores de Graneros',
   'Reunión anual e intimista de copleros, decidores y cantores de tonadas tradicionales que preservan el cancionero popular y la poesía oral del sur tucumano.',
   'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=600&q=80', NULL, 'COLECTIVO', '2026-07-15 08:20:00', 'A'),

  (28, 3, 1, 28, 'Centro Cultural Alberdi (Sur)',
   'Espacio público dependiente del municipio que promueve fuertemente la actividad escénica a través de subsidios, espacios de ensayo y fomento a colectivos teatrales independientes.',
   'https://images.unsplash.com/photo-1581022295087-35e593704911?auto=format&fit=crop&w=600&q=80', NULL, 'ESPACIO', '2026-07-02 11:27:00', 'A'),

  (29, 4, 1, 29, 'Cine Teatro Marconi',
   'Histórico y hermoso edificio cinematográfico y de artes escénicas de estilo art decó, recientemente puesto en valor y recuperado para la vibrante comunidad del sur provincial.',
   'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80', NULL, 'ESPACIO', '2026-06-19 14:34:00', 'A'),

  (30, 1, 1, 30, 'Festival de la Cocha y el Canto',
   'Importante y convocante cita invernal de la música folclórica argentina que congrega a reconocidas figuras nacionales en varias lunas llenas de música y tradición.',
   'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=600&q=80', NULL, 'COLECTIVO', '2026-06-06 17:41:00', 'A'),

  (31, 9, NULL, 31, 'Muestra Fotográfica \'Rostros del Tabaco\'',
   'Exposición itinerante de fotoperiodismo que documenta crudamente y con belleza la vida, el arduo trabajo y las profundas tradiciones de los trabajadores rurales tucumanos.',
   'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=600&q=80', NULL, 'COLECTIVO', '2026-07-13 10:48:00', 'A'),

  (32, 2, 1, 32, 'Artesanos del Mimbre de Bella Vista',
   'Sólida agrupación de familias artesanas dedicadas generación tras generación a la cestería tradicional, utilizando habilidosamente fibras naturales y mimbre del entorno ribereño.',
   NULL, NULL, 'COLECTIVO', '2026-06-30 13:55:00', 'A'),

  (33, 3, 1, 33, 'Teatro Comunitario de Leales',
   'Enorme colectivo teatral conformado por más de 50 vecinos de todas las edades que relatan la rica y a veces dolorosa historia azucarera del departamento a través de monumentales obras a cielo abierto.',
   'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80', NULL, 'ESPACIO', '2026-06-17 16:02:00', 'A'),

  (34, 7, NULL, 34, 'Ruinas de San José de Lules',
   'Sitio histórico de inmenso valor. Antiguo conjunto arquitectónico jesuítico y dominico que data del siglo XVII, con una capilla y claustros declarados Monumento Histórico Nacional.',
   NULL, NULL, 'ESPACIO', '2026-07-24 09:09:00', 'A'),

  (35, 1, 1, 35, 'Lules Coral',
   'Prestigioso encuentro anual que congrega a coros polifónicos vocacionales y profesionales de diversas provincias, brindando conciertos acústicos en las históricas iglesias lulistas.',
   'https://images.unsplash.com/photo-1552862750-746b8f6f7f25?auto=format&fit=crop&w=600&q=80', NULL, 'COLECTIVO', '2026-07-11 12:16:00', 'A'),

  (36, 5, NULL, 36, 'Encuentro de Escritores \'Monteros de la Patria\'',
   'Foro literario del NOA, cariñosamente llamado "Monteros de la Patria, Fortaleza del Folklore", donde reconocidos poetas, ensayistas y novelistas exponen y debaten sus nuevas obras.',
   'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80', NULL, 'COLECTIVO', '2026-06-28 15:23:00', 'A'),

  (37, 1, 1, 37, 'Fortaleza del Folklore',
   'Uno de los festivales de música folclórica más antiguos, prestigiosos y masivos del noroeste del país, cita obligada en octubre en la ciudad de Monteros.',
   NULL, NULL, 'COLECTIVO', '2026-06-15 08:30:00', 'A'),

  (38, 8, NULL, 38, 'Corsos de Carnaval de Aguilares',
   'La mayor fiesta de carnaval de toda la provincia de Tucumán. Famosa por el brillante y lujoso despliegue de sus gigantescas comparsas, batucadas y escuelas de danza.',
   'https://images.unsplash.com/photo-1561571994-3c61c554181a?auto=format&fit=crop&w=600&q=80', NULL, 'COLECTIVO', '2026-07-22 11:37:00', 'A'),

  (39, 6, NULL, 39, 'Salón de Pintura Aguilares',
   'Destacado certamen anual de artes plásticas a nivel regional que expone, premia y adquiere obras y lienzos inspirados en el paisaje y la particular idiosincrasia sureña.',
   'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80', NULL, 'COLECTIVO', '2026-07-09 14:44:00', 'A'),

  (40, 7, NULL, 40, 'Feria de Simoca',
   'Mercado tradicional y feria sabatina centenaria que se mantiene viva. Famosa nacionalmente por el trueque, sus comidas típicas (rosquetes, pastel de novios), artesanías y la clásica presencia de sulkys.',
   'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=600&q=80', NULL, 'COLECTIVO', '2026-06-26 17:51:00', 'A'),

  (41, 7, NULL, 41, 'Festival Nacional del Sulky',
   'Festival folclórico mayor de Simoca que rinde homenaje a su tradicional medio de transporte y a la profunda cultura gaucha, con imponentes desfiles de caballería y shows musicales de primer nivel.',
   NULL, NULL, 'COLECTIVO', '2026-06-13 10:58:00', 'A'),

  (42, 7, NULL, 42, 'Ruinas de Quilmes',
   'Uno de los asentamientos y ciudades prehispánicas más grandes e importantes de Argentina. Bastión heroico de la tenaz resistencia del pueblo diaguita-calchaquí contra la conquista.',
   NULL, NULL, 'ESPACIO', '2026-07-20 13:05:00', 'A'),

  (43, 7, NULL, 43, 'Museo Jesuítico La Banda',
   'Fascinante estancia y conjunto colonial del siglo XVIII en Tafí del Valle. El museo preserva intacto valioso mobiliario de época, imponente arte sacro y sorprendentes vestigios arqueológicos vallistos.',
   NULL, NULL, 'ESPACIO', '2026-07-07 16:12:00', 'A'),

  (44, 2, 1, 44, 'Ruta del Artesano de Tafí del Valle',
   'Circuito turístico y cultural impulsado por una cooperativa que conecta y pone en valor talleres familiares de excepcionales tejidos en telar, experta platería y rústica cerámica de los valles.',
   NULL, NULL, 'COLECTIVO', '2026-06-24 09:19:00', 'A'),

  (45, 5, NULL, 45, 'Poesía en las Nubes (Amaicha del Valle)',
   'Conmovedor recital poético anual y encuentro literario realizado bajo el límpido y estrellado cielo de Amaicha del Valle, impulsado principalmente por talentosos escritores de las comunidades indígenas.',
   NULL, NULL, 'COLECTIVO', '2026-06-11 12:26:00', 'A'),

  (46, 1, 1, 46, 'Festival Nacional del Limón',
   'Gigantesco y tradicional festival del folclore argentino en el club Villa Mitre que celebra con orgullo la pujante producción citrícola característica de Tafí Viejo, la Capital Nacional del Limón.',
   'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80', NULL, 'COLECTIVO', '2026-07-18 15:33:00', 'A'),

  (47, 7, NULL, 47, 'Talleres Ferroviarios de Tafí Viejo',
   'Colosal patrimonio industrial, arquitectónico e histórico que a lo largo del siglo XX forjó la profunda identidad social, obrera y cultural de la "Ciudad del Limón".',
   NULL, NULL, 'ESPACIO', '2026-07-05 08:40:00', 'A'),

  (48, 7, NULL, 48, 'Fiesta Nacional del Caballo',
   'Cita multitudinaria y fundamental de la fuerte tradición gaucha en Trancas, ofreciendo formidables jineteadas, audaces destrezas ecuestres y destacados grupos folclóricos de renombre nacional.',
   NULL, NULL, 'COLECTIVO', '2026-06-22 11:47:00', 'A'),

  (49, 1, 1, 49, 'Trancas Canta a la Patria',
   'Sentida y cálida peña folclórica de vigilia comunitaria que convoca a diversos artistas locales, academias de danza y agrupaciones gauchas en las vísperas de las fechas patrias más importantes.',
   NULL, NULL, 'COLECTIVO', '2026-06-09 14:54:00', 'A'),

  (50, 4, 1, 50, 'Encuentro de Cine Independiente del NOA',
   'Importante muestra audiovisual anual no competitiva que funciona como plataforma de exhibición y debate para talentosos directores y productores emergentes de toda la región del noroeste argentino.',
   'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80', NULL, 'COLECTIVO', '2026-07-16 17:01:00', 'A'),

  (51, 10, NULL, 51, 'Estudio de Diseño Sostenible Yerba Buena',
   'Innovador laboratorio de diseño de Yerba Buena altamente enfocado en la creación de mobiliario y objetos contemporáneos utilizando exclusivamente materiales reciclados y maderas nativas certificadas.',
   NULL, NULL, 'COLECTIVO', '2026-07-03 10:08:00', 'A'),

  (52, 6, NULL, 52, 'Galería de Arte Contemporáneo \'El Árbol\'',
   'Hermoso y apacible espacio expositivo rodeado por la exuberante naturaleza de las yungas, dedicado exclusivamente a la promoción de la pintura, escultura e innovadoras instalaciones conceptuales locales.',
   'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80', NULL, 'ESPACIO', '2026-06-20 13:15:00', 'A'),

  (53, 8, NULL, 53, 'Estudio de Danza Contemporánea Yerba Buena',
   'Prestigioso centro formativo y de entrenamiento físico y expresivo dedicado a las danzas modernas, la improvisación y la profunda investigación del movimiento corporal para bailarines profesionales.',
   'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=600&q=80', NULL, 'COLECTIVO', '2026-06-07 16:22:00', 'A'),

  (54, 3, 1, 54, 'Teatro de la Paz',
   'Acogedor espacio escénico independiente y alternativo situado en el microcentro, con un fuerte enfoque en la producción de coloridas comedias musicales y punzantes dramas de dramaturgia local.',
   NULL, NULL, 'ESPACIO', '2026-07-14 09:29:00', 'A'),

  (55, 2, 1, 55, 'Cerámica Ancestral de Amaicha del Valle',
   'Reconocido taller y escuela artesanal enfocado rigurosamente en la creación de finas réplicas de urnas y vasijas, rescatando las técnicas e iconografía original de la cultura milenaria Santa María.',
   'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80', NULL, 'COLECTIVO', '2026-07-01 12:36:00', 'A'),

  (56, 9, NULL, 56, 'Muestra Visual del Sur',
   'Destacado salón anual de fotografía artística y documental del interior que expone y premia las más impactantes y hermosas capturas de paisajes naturales y retratos profundos de los tucumanos.',
   'https://images.unsplash.com/photo-1516961642265-531546e84af2?auto=format&fit=crop&w=600&q=80', NULL, 'COLECTIVO', '2026-06-18 15:43:00', 'A');

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
  (11, 4, 'Batería', 1),
  (12, 4, 'Bajo', 0),
  (6, 5, 'Director y productor audiovisual', 1),
  (8, 6, 'Artista circense', 1),
  (10, 6, 'Logística', 0);

-- -----------------------------------------------------
-- 9. Eventos
-- -----------------------------------------------------
INSERT INTO `cultura`.`Eventos`
  (`idEvento`, `idActor`, `nombre`, `descripcion`, `fecha`, `fechaCreacion`, `estado`)
VALUES
  (1, 1, 'Taller Abierto de Telar', 'Demostración en vivo de técnicas de telar criollo para todo público.', '2026-09-10 10:00:00', '2026-08-01 10:00:00', 'A'),
  (2, 2, 'Peña de la Independencia', 'Gran show folclórico celebrando nuestras raíces.', '2026-07-09 22:00:00', '2026-06-25 10:00:00', 'A'),
  (3, 3, 'Apertura Temporada Teatral', 'El teatro abre sus puertas con la obra clásica "El Conventillo de la Paloma".', '2026-09-01 20:00:00', '2026-06-27 09:00:00', 'A'),
  (4, 4, 'Toque en Bar de Yerba Buena', 'Cierre de la gira barrial. Presentación acústica e íntima.', '2026-08-15 23:30:00', '2026-06-26 14:00:00', 'A'),
  (5, 5, 'Estreno: "Voces del Cerro"', 'Proyección especial de nuestro último cortometraje documental.', '2026-10-20 19:30:00', '2026-08-15 10:00:00', 'A'),
  (6, 6, 'Función a la Gorra', 'Espectáculo de circo, fuego y humor en la plaza principal.', '2026-09-05 17:00:00', '2026-08-20 10:00:00', 'A'),
  (7, 7, 'Festival de la Alfalfa 2026', 'Edición 2026 con cartelera completa de artistas regionales.', '2026-11-15 21:00:00', '2026-09-01 10:00:00', 'A'),
  (8, 8, 'Exposición Anual de Tejidos', 'Muestra y venta de las piezas creadas durante el año en el taller.', '2026-12-10 18:00:00', '2026-11-01 10:00:00', 'A'),
  (9, 9, 'Ráfaga 30 Años', 'Megaconcierto celebrando tres décadas de cumbia.', '2026-10-31 22:30:00', '2026-08-15 10:00:00', 'A'),
  (10, 10, 'Cantata a Mercedes', 'Homenaje sinfónico-coral a la Negra Sosa.', '2026-10-04 20:00:00', '2026-08-01 10:00:00', 'A'),
  (11, 11, 'Gala de Ballet', 'El Ballet Estable presenta "El Lago de los Cisnes".', '2026-09-25 21:00:00', '2026-07-15 10:00:00', 'A'),
  (12, 12, 'Muestra Colectiva "Retratos"', 'Inauguración de la exposición de artistas visuales tucumanos emergentes.', '2026-08-20 19:00:00', '2026-07-20 10:00:00', 'A'),
  (13, 13, 'Festival de Cortos de Tesis', 'Proyección de los trabajos finales de los alumnos de la Escuela de Cine.', '2026-12-15 18:00:00', '2026-11-15 10:00:00', 'A'),
  (14, 14, 'Safari Fotográfico Urbano', 'Recorrido fotográfico por el casco histórico de la ciudad.', '2026-09-12 09:00:00', '2026-08-25 10:00:00', 'A'),
  (15, 15, 'Desfile Colección Primavera', 'Presentación de la nueva línea de indumentaria con identidad local.', '2026-09-21 20:30:00', '2026-08-10 10:00:00', 'A'),
  (16, 16, 'Noche de las Bibliotecas', 'Recorrido histórico y lectura de cuentos a la luz de las velas.', '2026-10-18 20:00:00', '2026-09-15 10:00:00', 'A'),
  (17, 17, 'Vigilia del 9 de Julio', 'Actos protocolares y espectáculos folclóricos en la víspera del Día de la Independencia.', '2026-07-08 23:00:00', '2026-06-01 10:00:00', 'A'),
  (18, 18, 'Estreno "Cuerpos en Movimiento"', 'Nueva obra conceptual del Ballet Contemporáneo.', '2026-11-05 21:00:00', '2026-09-20 10:00:00', 'A'),
  (19, 19, 'Ciclo de Teatro Independiente', 'Presentación de tres obras cortas de dramaturgos del sur.', '2026-08-28 20:00:00', '2026-07-25 10:00:00', 'A'),
  (20, 20, 'Café Literario: Poesía del Sur', 'Encuentro con poetas locales y micrófono abierto.', '2026-09-18 19:30:00', '2026-08-15 10:00:00', 'A'),
  (21, 21, 'Feria Especial Día de la Madre', 'Edición especial de la feria con sorteos y música en vivo.', '2026-10-17 10:00:00', '2026-09-10 10:00:00', 'A'),
  (22, 22, 'Muestra de Fin de Año', 'Gala de cierre donde todos los alumnos presentan lo aprendido.', '2026-12-18 21:00:00', '2026-11-01 10:00:00', 'A'),
  (23, 23, 'Festival de la Humita 2026', 'Tres días de comida tradicional, música y baile en familia.', '2026-02-15 20:00:00', '2026-01-10 10:00:00', 'A'),
  (24, 24, 'Fiesta Nacional de la Empanada', 'Elección de la campeona 2026 y cierre con artistas nacionales.', '2026-09-11 20:00:00', '2026-07-01 10:00:00', 'A'),
  (25, 25, 'Gala de Premiación', 'Ceremonia de clausura y entrega de premios del Festival de Cortos.', '2026-10-25 21:00:00', '2026-09-15 10:00:00', 'A'),
  (26, 26, 'Fiesta del Locro Patrio', 'Gran locro popular para celebrar el 25 de Mayo.', '2026-05-25 12:00:00', '2026-04-10 10:00:00', 'A'),
  (27, 27, 'Encuentro de Copleros', 'Ronda de cantores e improvisación poética.', '2026-08-14 18:00:00', '2026-07-15 10:00:00', 'A'),
  (28, 28, 'Estreno "La Nona"', 'El elenco estable de la ciudad presenta la clásica comedia argentina.', '2026-10-10 21:00:00', '2026-09-01 10:00:00', 'A'),
  (29, 29, 'Ciclo de Cine Argentino', 'Proyección de películas nacionales clásicas restauradas.', '2026-11-12 19:00:00', '2026-10-10 10:00:00', 'A'),
  (30, 30, 'Festival La Cocha 2026', 'Dos lunas a puro folclore en el sur tucumano.', '2026-07-24 22:00:00', '2026-06-15 10:00:00', 'A'),
  (31, 31, 'Inauguración "Rostros del Tabaco"', 'Apertura de la muestra fotográfica con presencia del autor.', '2026-09-04 19:30:00', '2026-08-05 10:00:00', 'A'),
  (32, 32, 'Taller de Cestería Básica', 'Clase abierta y gratuita para aprender a tejer con mimbre.', '2026-10-03 16:00:00', '2026-09-15 10:00:00', 'A'),
  (33, 33, 'Obra "Memorias del Ingenio"', 'Representación teatral comunitaria sobre la historia local.', '2026-11-20 20:30:00', '2026-10-10 10:00:00', 'A'),
  (34, 34, 'Visita Guiada Nocturna', 'Recorrido histórico por las ruinas iluminadas con relatos sobre mitos locales.', '2026-10-31 21:00:00', '2026-10-01 10:00:00', 'A'),
  (35, 35, 'Gran Concierto Coral', 'Cierre del encuentro con todos los coros interpretando una obra conjunta.', '2026-11-07 20:00:00', '2026-10-15 10:00:00', 'A'),
  (36, 36, 'Mesa Panel de Literatura', 'Debate sobre las nuevas tendencias de la narrativa en el NOA.', '2026-08-22 18:00:00', '2026-07-25 10:00:00', 'A'),
  (37, 37, 'Fortaleza del Folklore - Noche 1', 'Primera luna del histórico festival montero.', '2026-10-09 22:00:00', '2026-08-15 10:00:00', 'A'),
  (38, 38, 'Desfile Inaugural de Corsos', 'Apertura oficial del carnaval con todas las comparsas en el corsódromo.', '2026-02-14 22:00:00', '2026-01-15 10:00:00', 'A'),
  (39, 39, 'Premiación Salón de Pintura', 'Anuncio de los ganadores y entrega de premios del certamen.', '2026-09-17 19:30:00', '2026-08-20 10:00:00', 'A'),
  (40, 40, 'Feria Aniversario', 'Gran fiesta celebrando un nuevo aniversario del tradicional mercado.', '2026-07-11 09:00:00', '2026-06-15 10:00:00', 'A'),
  (41, 41, 'Desfile Nacional de Sulkys', 'Más de 500 sulkys desfilando por las calles de la ciudad.', '2026-10-10 11:00:00', '2026-09-01 10:00:00', 'A'),
  (42, 42, 'Ceremonia a la Pachamama', 'Celebración ancestral en el sitio sagrado guiada por referentes de la comunidad.', '2026-08-01 12:00:00', '2026-07-10 10:00:00', 'A'),
  (43, 43, 'Muestra de Arte Sacro', 'Exhibición temporal de piezas religiosas coloniales restauradas.', '2026-12-05 10:00:00', '2026-11-05 10:00:00', 'A'),
  (44, 44, 'Feria Artesanal del Valle', 'Encuentro de todos los artesanos de la ruta en la plaza de Tafí.', '2026-01-20 10:00:00', '2026-12-01 10:00:00', 'A'),
  (45, 45, 'Recital de Poesía bajo las Estrellas', 'Lectura de poemas junto al fogón en la comunidad de Amaicha.', '2026-02-10 21:00:00', '2026-01-10 10:00:00', 'A'),
  (46, 46, 'Festival del Limón - Cierre', 'Gran cierre del festival con sorteo de autos y shows de primer nivel.', '2026-09-20 22:00:00', '2026-08-01 10:00:00', 'A'),
  (47, 47, 'Visita Guiada: Historia Ferroviaria', 'Recorrido por las naves históricas de los talleres.', '2026-11-14 10:00:00', '2026-10-15 10:00:00', 'A'),
  (48, 48, 'Gran Jineteada', 'Competencia de destreza ecuestre en el marco de la Fiesta del Caballo.', '2026-10-11 14:00:00', '2026-09-05 10:00:00', 'A'),
  (49, 49, 'Peña de la Revolución', 'Folclore y comidas típicas para esperar el 25 de Mayo.', '2026-05-24 22:00:00', '2026-05-01 10:00:00', 'A'),
  (50, 50, 'Muestra de Cortos Estudiantiles', 'Proyección de los mejores trabajos de escuelas de cine de la región.', '2026-11-27 18:30:00', '2026-10-25 10:00:00', 'A'),
  (51, 51, 'Workshop: Diseño con Materiales Reciclados', 'Taller teórico-práctico sobre sustentabilidad en el diseño.', '2026-08-08 15:00:00', '2026-07-15 10:00:00', 'A'),
  (52, 52, 'Inauguración "Paisajes de las Yungas"', 'Nueva muestra pictórica dedicada a la selva tucumana.', '2026-10-02 20:00:00', '2026-09-05 10:00:00', 'A'),
  (53, 53, 'Clase Magistral de Danza Abierta', 'Clase de técnica contemporánea gratuita en el parque.', '2026-09-26 10:30:00', '2026-09-01 10:00:00', 'A'),
  (54, 54, 'Estreno "Locos de Amor"', 'Nueva comedia musical original producida por el teatro.', '2026-11-13 21:30:00', '2026-10-15 10:00:00', 'A'),
  (55, 55, 'Taller de Cerámica Precolombina', 'Aprendé las técnicas de modelado y pintura de la cultura Santa María.', '2026-10-24 10:00:00', '2026-09-25 10:00:00', 'A'),
  (56, 56, 'Muestra Anual de Alumnos', 'Exposición fotográfica de los trabajos realizados en los cursos del año.', '2026-12-11 19:00:00', '2026-11-10 10:00:00', 'A'),
  (57, 4, 'Presentación en Peña Patria',
   'Tocaremos nuestro nuevo disco en vivo. Con invitados especiales y artistas locales.',
   '2026-07-09 22:00:00', '2026-06-25 10:00:00', 'A'),
  (59, 3, 'Apertura Temporada Teatral 2026',
   'El teatro abre sus puertas con grandes obras.',
   '2026-09-01 20:00:00', '2026-06-27 09:00:00', 'A'),
  (60, 4, 'Nuevo álbum en streaming',
   'Escucha nuestro nuevo álbum en todas las plataformas de streaming.',
   '2026-02-15 23:30:00', '2026-06-28 09:00:00', 'A');

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
-- idSubcategoria 0 identifica un formulario de categoría.
-- -----------------------------------------------------
INSERT INTO `cultura`.`Formularios`
  (`idFormulario`, `idCategoria`, `idSubcategoria`, `titulo`, `descripcion`, `fechaCreacion`)
VALUES
  (1, 2, 0,
   'Relevamiento de Artesanía',
   'Información productiva general de los actores de la categoría Artesanía.',
   '2026-06-01 09:00:00'),

  (2, 1, 0,
   'Relevamiento de Música',
   'Información general sobre la actividad y trayectoria musical.',
   '2026-06-01 09:15:00'),

  (3, 4, 0,
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
   '2026-06-05 08:30:00', '2026-06-05 08:30:00', '2026-07-05 09:00:00'),

  (3, 5, 4, '["Sony Alpha", "Dron"]',
   '2026-06-23 09:10:00', '2026-06-23 09:10:00', '2026-07-06 10:00:00');

-- -----------------------------------------------------
-- 16. Ítems del portafolio
-- -----------------------------------------------------
INSERT INTO `cultura`.`ItemsPortafolio`
  (`idItem`, `idActor`, `tipo`, `descripcion`, `url`, `fechaCreacion`)
VALUES
  (1, 1, 'RRSS', 'Instagram', 'https://instagram.com/tejidosmaria', '2026-06-12 10:00:00'),
  (2, 2, 'LINK', 'Video de la presentación en Cosquín', 'https://youtube.com/watch?v=12345', '2026-06-17 11:00:00'),
  (3, 3, 'RRSS', 'Facebook del Teatro', 'https://facebook.com/teatroalberdi', '2026-06-05 09:00:00'),
  (5, 5, 'LINK', 'Reel de cortometrajes', 'https://vimeo.com/casinoroyale', '2026-06-20 13:00:00'),
  (6, 6, 'RRSS', 'Instagram Compañía', 'https://instagram.com/circofuego', '2026-06-22 14:00:00'),
  (7, 7, 'RRSS', 'Facebook del Festival', 'https://facebook.com/festivalalfalfa', '2026-06-05 09:00:00'),
  (8, 8, 'LINK', 'Página de la Comuna', 'https://tucuman.gob.ar/burruyacu', '2026-07-12 12:00:00'),
  (9, 9, 'RRSS', 'Instagram Oficial', 'https://instagram.com/gruporafaga', '2026-06-29 15:00:00'),
  (10, 10, 'LINK', 'Sitio Web Homenaje', 'https://mercedessosa.org', '2026-06-16 18:00:00'),
  (11, 11, 'RRSS', 'Instagram Teatro San Martín', 'https://instagram.com/teatrosanmartin', '2026-07-23 11:00:00'),
  (12, 12, 'LINK', 'Cartelera del Centro', 'https://secretariadecultura.unt.edu.ar/virla', '2026-07-10 14:00:00'),
  (13, 13, 'RRSS', 'Facebook Escuela de Cine', 'https://facebook.com/escueladecineunt', '2026-06-27 17:00:00'),
  (14, 14, 'LINK', 'Sitio Web Fotoclub', 'https://fotoclubtucuman.com.ar', '2026-06-14 10:00:00'),
  (15, 15, 'RRSS', 'Instagram Diseño de Autor', 'https://instagram.com/disenoautortuc', '2026-07-21 13:00:00'),
  (16, 16, 'LINK', 'Catálogo Online', 'https://bibliotecasarmiento.org', '2026-07-08 16:00:00'),
  (17, 17, 'RRSS', 'Instagram Museo', 'https://instagram.com/casahistorica', '2026-06-25 09:00:00'),
  (18, 18, 'LINK', 'Página Oficial Ente de Cultura', 'https://entedecultura.tucuman.gob.ar', '2026-06-12 12:00:00'),
  (19, 19, 'RRSS', 'Facebook Teatro Estación', 'https://facebook.com/teatroestacion', '2026-07-19 15:00:00'),
  (20, 20, 'LINK', 'Información de la Biblioteca', 'https://concepcion.gob.ar/biblioteca', '2026-07-06 18:00:00'),
  (21, 21, 'RRSS', 'Instagram Feria de Artesanos', 'https://instagram.com/artesanossur', '2026-06-23 11:00:00'),
  (22, 22, 'LINK', 'Videos de Presentaciones', 'https://youtube.com/user/academiabrs', '2026-06-10 14:00:00'),
  (23, 23, 'RRSS', 'Facebook Festival Humita', 'https://facebook.com/festivalhumita', '2026-07-17 17:00:00'),
  (24, 24, 'LINK', 'Sitio Oficial de la Fiesta', 'https://fiestanacionaldelaempanada.com', '2026-07-04 10:00:00'),
  (25, 25, 'RRSS', 'Instagram Festival de Cortos', 'https://instagram.com/cortosfamailla', '2026-06-21 13:00:00'),
  (26, 26, 'LINK', 'Página de Turismo', 'https://tucumanturismo.gob.ar', '2026-06-08 16:00:00'),
  (27, 27, 'RRSS', 'Facebook Encuentro Graneros', 'https://facebook.com/encuentrograneros', '2026-07-15 09:00:00'),
  (28, 28, 'LINK', 'Cartelera Centro Alberdi', 'https://municipioalberdi.gob.ar/cultura', '2026-07-02 12:00:00'),
  (29, 29, 'RRSS', 'Instagram Cine Marconi', 'https://instagram.com/cinemarconi', '2026-06-19 15:00:00'),
  (30, 30, 'LINK', 'Página de la Municipalidad', 'https://lacocha.gob.ar', '2026-06-06 18:00:00'),
  (31, 31, 'RRSS', 'Instagram del Autor', 'https://instagram.com/fotografo_rural', '2026-07-13 11:00:00'),
  (32, 32, 'LINK', 'Asociación de Artesanos', 'https://artesanosbellavista.org', '2026-06-30 14:00:00'),
  (33, 33, 'RRSS', 'Facebook Teatro Leales', 'https://facebook.com/teatroleales', '2026-06-17 17:00:00'),
  (34, 34, 'LINK', 'Información Histórica', 'https://ruinaslules.com.ar', '2026-07-24 10:00:00'),
  (35, 35, 'RRSS', 'Instagram Lules Coral', 'https://instagram.com/lulescoral', '2026-07-11 13:00:00'),
  (36, 36, 'LINK', 'Programa del Encuentro', 'https://monteros.gob.ar/cultura', '2026-06-28 16:00:00'),
  (37, 37, 'RRSS', 'Facebook Fortaleza Folklore', 'https://facebook.com/fortalezafolklore', '2026-06-15 09:00:00'),
  (38, 38, 'LINK', 'Página Corsos Aguilares', 'https://corsosaguilares.com', '2026-07-22 12:00:00'),
  (39, 39, 'RRSS', 'Instagram Salón Pintura', 'https://instagram.com/salonpinturaaguilares', '2026-07-09 15:00:00'),
  (40, 40, 'LINK', 'Información de la Feria', 'https://simoca.gob.ar/feria', '2026-06-26 18:00:00'),
  (41, 41, 'RRSS', 'Facebook Festival Sulky', 'https://facebook.com/festivalsulky', '2026-06-13 11:00:00'),
  (42, 42, 'LINK', 'Sitio Arqueológico', 'https://ruinasdequilmes.ar', '2026-07-20 14:00:00'),
  (43, 43, 'RRSS', 'Instagram Museo Jesuítico', 'https://instagram.com/museojesuiticolabanda', '2026-07-07 17:00:00'),
  (44, 44, 'LINK', 'Guía de la Ruta del Artesano', 'https://rutadelartesanotafi.com.ar', '2026-06-24 10:00:00'),
  (45, 45, 'RRSS', 'Facebook Poesía Nubes', 'https://facebook.com/poesiaenlasnubes', '2026-06-11 13:00:00'),
  (46, 46, 'LINK', 'Página Oficial Festival Limón', 'https://festivaldellimon.com.ar', '2026-07-18 16:00:00'),
  (47, 47, 'RRSS', 'Instagram Museo Ferroviario', 'https://instagram.com/museoferroviariotv', '2026-07-05 09:00:00'),
  (48, 48, 'LINK', 'Sitio Fiesta del Caballo', 'https://fiestanacionaldelcaballo.com.ar', '2026-06-22 12:00:00'),
  (49, 49, 'RRSS', 'Facebook Trancas Canta', 'https://facebook.com/trancascanta', '2026-06-09 15:00:00'),
  (50, 50, 'LINK', 'Programación Encuentro Cine', 'https://cineindependientenoa.org', '2026-07-16 18:00:00'),
  (51, 51, 'RRSS', 'Instagram Estudio Sostenible', 'https://instagram.com/estudiosostenibleyba', '2026-07-03 11:00:00'),
  (52, 52, 'LINK', 'Catálogo Galería El Árbol', 'https://galeriaelarbol.com.ar', '2026-06-20 14:00:00'),
  (53, 53, 'RRSS', 'Instagram Estudio Danza', 'https://instagram.com/danzacontemporaneayba', '2026-06-07 17:00:00'),
  (54, 54, 'LINK', 'Cartelera Teatro de la Paz', 'https://teatrodelapaz.com.ar', '2026-07-14 10:00:00'),
  (55, 55, 'RRSS', 'Facebook Cerámica Amaicha', 'https://facebook.com/ceramicaamaicha', '2026-07-01 13:00:00'),
  (56, 56, 'LINK', 'Página Muestra Visual', 'https://muestravirtualdelsur.com.ar', '2026-06-18 16:00:00'),
  (57, 1, 'IMAGEN', 'Poncho tucumano en telar',
   'https://mi-servidor.com/tejidos/poncho.jpg', '2026-06-12 10:00:00'),
  (58, 2, 'LINK', 'Video de la presentación en Cosquín',
   'https://youtube.com/watch?v=12345', '2026-06-17 11:00:00'),
  (59, 3, 'LINK', 'Videoclip oficial "Ruta 307"',
   'https://youtube.com/watch?v=rutaza', '2026-06-19 12:00:00'),
  (60, 4, 'LINK', 'Reel de cortometrajes 2025',
   'https://vimeo.com/casinoroyale', '2026-06-20 13:00:00'),
  (61, 5, 'IMAGEN', 'Espectáculo de fuego en Plaza Independencia',
   'https://img.com/circo_fuego1.jpg', '2026-06-22 14:00:00'),
  (62, 5, 'IMAGEN', 'Clown y malabares',
   'https://img.com/circo_clown.jpg', '2026-06-22 14:10:00'),
  (63, 4, 'RRSS', 'Instagram',
   'https://www.instagram.com/culturadetucuman', '2026-06-23 09:00:00'),
  (64, 4, 'RRSS', 'Facebook',
   'https://www.facebook.com/culturadetucuman', '2026-06-23 09:01:00'),
  (65, 4, 'LINK', 'Contactanos por WhatsApp',
   'https://wa.me/5493815551234', '2026-06-23 09:02:00'),
  (66, 4, 'LINK', 'Sitio web oficial',
   'https://www.culturadetucuman.com.ar', '2026-06-23 09:03:00'),
  (67, 4, 'LINK', 'Presentación en Japón',
   'http://youtube.com/watch?v=nAwCcBMQBrc', '2026-06-23 09:04:00');

SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS = @OLD_UNIQUE_CHECKS;
