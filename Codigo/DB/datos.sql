-- ================================================================
-- Mosaico Cultural
-- Base de datos: cultura v1.0.1
-- Autores: Cesar Ezequiel Herrera, Leandro Murillo
-- ================================================================

-- -----------------------------------------------------
-- Inserción de Usuarios (Diferentes Roles)
-- -----------------------------------------------------
-- Se incluyen perfiles de Administrador, Moderador y Usuarios estándar.
INSERT INTO `cultura`.`Usuarios` (`idUsuario`, `nombre`, `apellido`, `dni`, `genero`, `fechaNacimiento`, `email`, `contraseña`, `fechaRegistro`, `rol`, `estado`) VALUES
(1, 'Ana', 'Gómez', '30123456', 'F', '1985-05-12', 'admin@culturatucuman.gob.ar', 'hash_secreto_123', '2026-06-01 09:00:00', 'ADMIN', 'A'),
(2, 'Carlos', 'López', '32654987', 'M', '1988-11-20', 'mod.musica@culturatucuman.gob.ar', 'hash_secreto_123', '2026-06-02 10:15:00', 'MODERADOR', 'A'),
(3, 'María', 'Sosa', '35111222', 'F', '1990-03-15', 'maria.tejidos@email.com', 'hash_secreto_123', '2026-06-10 14:30:00', 'USUARIO', 'A'),
(4, 'Juan', 'Pérez', '38444555', 'M', '1995-07-22', 'juan.folclore@email.com', 'hash_secreto_123', '2026-06-15 16:45:00', 'USUARIO', 'A');

-- -----------------------------------------------------
-- Inserción de Categorías
-- -----------------------------------------------------
INSERT INTO `cultura`.`Categorias` (`idCategoria`, `nombre`, `estado`) VALUES
(1, 'Música', 'A'),
(2, 'Artesanía', 'A'),
(3, 'Artes Escénicas', 'A');

-- -----------------------------------------------------
-- Asignación de Moderadores a Categorías
-- -----------------------------------------------------
-- Carlos López modera la categoría Música.
INSERT INTO `cultura`.`ModeradoresCategorias` (`idUsuario`, `idCategoria`) VALUES
(2, 1);

-- -----------------------------------------------------
-- Inserción de Ubicaciones Georeferenciadas en Tucumán
-- -----------------------------------------------------
INSERT INTO `cultura`.`Ubicaciones` (`idUbicacion`, `provincia`, `departamento`, `localidad`, `direccion`, `latitud`, `longitud`, `esPublica`) VALUES
(1, 'Tucumán', 'Capital', 'San Miguel de Tucumán', 'San Martín 251', -26.83000000, -65.20000000, 1),
(2, 'Tucumán', 'Tafí Viejo', 'Tafí Viejo', 'Av. Alem 100', -26.73333300, -65.26666700, 1),
(3, 'Tucumán', 'Tafí del Valle', 'Tafí del Valle', 'Ruta Provincial 307', -26.85250000, -65.71000000, 1);

-- -----------------------------------------------------
-- Inserción de Actores Culturales
-- -----------------------------------------------------
-- Se refleja la distinción entre Individuo, Colectivo y Espacio.
INSERT INTO `cultura`.`Actores` (`idActor`, `idCategoria`, `idUsuarioDueño`, `idUbicacion`, `nombre`, `cuit`, `tipoActor`, `fechaCreacion`) VALUES
(1, 2, 3, 3, 'Tejidos Ancestrales', '27351112229', 'INDIVIDUO', '2026-06-11 10:00:00'),
(2, 1, 4, 1, 'Los Tucu Cantores', '20384445558', 'COLECTIVO', '2026-06-16 09:30:00'),
(3, 3, 1, 1, 'Teatro Alberdi', '30500011122', 'ESPACIO', '2026-06-05 08:00:00');

-- -----------------------------------------------------
-- Inserción de Integrantes
-- -----------------------------------------------------
-- Relaciona la persona física (Usuario) con la entidad (Actor).
INSERT INTO `cultura`.`Integrantes` (`idUsuario`, `idActor`, `rol`) VALUES
(3, 1, 'Artesana Titular'),
(4, 2, 'Vocalista y Guitarra');

-- -----------------------------------------------------
-- Inserción de Eventos (Cartelera)
-- -----------------------------------------------------
INSERT INTO `cultura`.`Eventos` (`idEvento`, `idUbicacion`, `nombre`, `descripcion`, `tipo`, `fechaInicio`, `fechaFin`, `estado`, `esAnual`, `fechaCreacion`) VALUES
(1, 2, 'Festival Nacional del Limón', 'Tradicional festival de Tafí Viejo', 'FESTIVAL', '2026-09-10 20:00:00', '2026-09-12 23:59:59', 'A', 1, '2026-06-17 11:00:00'),
(2, 3, 'Mercado Artesanal Calchaquí', 'Feria de artesanos del valle', 'MERCADO', '2026-07-15 10:00:00', '2026-07-20 20:00:00', 'A', 1, '2026-06-18 10:00:00');

-- -----------------------------------------------------
-- Inserción de Relación Actores-Eventos
-- -----------------------------------------------------
-- Postulación y participación histórica.
INSERT INTO `cultura`.`ActoresEventos` (`idEvento`, `idActor`) VALUES
(1, 2), -- Los Tucu Cantores participan en el Festival del Limón
(2, 1); -- Tejidos Ancestrales en el Mercado Artesanal

-- -----------------------------------------------------
-- Inserción de Campos de Formularios Dinámicos
-- -----------------------------------------------------
-- Refleja el modelo EAV para adaptarse a cada rubro.
INSERT INTO `cultura`.`CamposFormularios` (`idCampo`, `idCategoria`, `tipoDato`, `esPublico`, `obligatorio`, `orden`, `pregunta`) VALUES
(1, 2, 'TEXTO', 1, 1, 1, 'Rama productiva principal (Ej: Textil, Cerámica)'),
(2, 2, 'TEXTO', 1, 0, 2, 'Procedencia de la materia prima'),
(3, 1, 'TEXTO', 1, 1, 1, 'Géneros musicales que interpreta');

-- -----------------------------------------------------
-- Inserción de Respuestas a los Formularios (JSON)
-- -----------------------------------------------------
INSERT INTO `cultura`.`RespuestasFormularios` (`idRespuesta`, `idActor`, `idCampo`, `valor`) VALUES
(1, 1, 1, '\"Textil y Telar\"'),
(2, 1, 2, '\"Lana de oveja local de Tafí del Valle\"'),
(3, 2, 3, '\"Folclore tradicional tucumano\"');

-- -----------------------------------------------------
-- Inserción de Ítems de Portafolio
-- -----------------------------------------------------
INSERT INTO `cultura`.`ItemsPortafolio` (`idItem`, `idActor`, `tipo`, `url`, `orden`, `descripcion`) VALUES
(1, 1, 'IMAGEN', 'https://mi-servidor.com/tejidos/poncho.jpg', 1, 'Poncho tucumano en telar'),
(2, 2, 'VIDEO', 'https://youtube.com/watch?v=ejemplo', 1, 'Presentación en vivo 2025');

-- -----------------------------------------------------
-- Inserción de Más Usuarios (y Moderadores)
-- -----------------------------------------------------
INSERT INTO `cultura`.`Usuarios` (`idUsuario`, `nombre`, `apellido`, `dni`, `genero`, `fechaNacimiento`, `email`, `contraseña`, `fechaRegistro`, `rol`, `estado`) VALUES
(5, 'Sofía', 'García', '39111222', 'F', '1998-05-10', 'sofia.admin@culturatucuman.gob.ar', 'hash_secreto_123', '2026-06-18 09:00:00', 'ADMIN', 'A'),
(6, 'Daniel', 'Craig', '40111333', 'M', '1968-03-02', 'daniel.audiovisual@email.com', 'hash_secreto_123', '2026-06-18 09:05:00', 'USUARIO', 'A'),
(7, 'Milo', 'Herrera', '41111444', 'M', '2015-01-01', 'milo.musica@email.com', 'hash_secreto_123', '2026-06-18 09:10:00', 'USUARIO', 'A'),
(8, 'Fito', 'Herrera', '42111555', 'M', '2018-01-01', 'fito.escenicas@email.com', 'hash_secreto_123', '2026-06-18 09:15:00', 'USUARIO', 'A'),
(9, 'Jane', 'Doe', '43111666', 'F', '1990-10-10', 'mod.escenicas@culturatucuman.gob.ar', 'hash_secreto_123', '2026-06-18 09:20:00', 'MODERADOR', 'A');

-- -----------------------------------------------------
-- Inserción de Más Categorías
-- -----------------------------------------------------
INSERT INTO `cultura`.`Categorias` (`idCategoria`, `nombre`, `estado`) VALUES
(4, 'Audiovisual', 'A'),
(5, 'Literatura', 'A');

-- -----------------------------------------------------
-- Asignación de Moderadores a Nuevas Categorías
-- -----------------------------------------------------
INSERT INTO `cultura`.`ModeradoresCategorias` (`idUsuario`, `idCategoria`) VALUES
(9, 3); -- Jane Doe modera Artes Escénicas

-- -----------------------------------------------------
-- Inserción de Más Ubicaciones
-- -----------------------------------------------------
INSERT INTO `cultura`.`Ubicaciones` (`idUbicacion`, `provincia`, `departamento`, `localidad`, `direccion`, `latitud`, `longitud`, `esPublica`) VALUES
(4, 'Tucumán', 'Yerba Buena', 'Yerba Buena', 'Av. Aconquija 1500', -26.81500000, -65.30000000, 1),
(5, 'Tucumán', 'Lules', 'San Isidro de Lules', 'Ruta Provincial 301', -26.92000000, -65.34000000, 1),
(6, 'Tucumán', 'Capital', 'San Miguel de Tucumán', 'Muñecas 200', -26.83000000, -65.20000000, 1);

-- -----------------------------------------------------
-- Inserción de Más Actores Culturales
-- -----------------------------------------------------
INSERT INTO `cultura`.`Actores` (`idActor`, `idCategoria`, `idUsuarioDueño`, `idUbicacion`, `nombre`, `cuit`, `tipoActor`, `fechaCreacion`) VALUES
(4, 1, 7, 4, 'Los Carpinchos del Alba', '20411114448', 'COLECTIVO', '2026-06-18 10:00:00'),
(5, 3, 5, 6, 'Teatro Milo y Fito', '30777888991', 'ESPACIO', '2026-06-18 10:05:00'),
(6, 4, 6, 5, 'Casino Royale Producciones', '20401113337', 'INDIVIDUO', '2026-06-18 10:10:00'),
(7, 3, 8, 4, 'Compañía Pyro', '20421115556', 'COLECTIVO', '2026-06-18 10:15:00');

-- -----------------------------------------------------
-- Inserción de Más Integrantes (Armando las agrupaciones)
-- -----------------------------------------------------
INSERT INTO `cultura`.`Integrantes` (`idUsuario`, `idActor`, `rol`) VALUES
(7, 4, 'Primera Voz y Bombo'),     -- Milo en Los Carpinchos
(8, 4, 'Guitarra Rítmica'),        -- Fito en Los Carpinchos
(6, 6, 'Director y Productor'),    -- Daniel en su productora
(8, 7, 'Actor Principal');         -- Fito en Compañía Pyro

-- -----------------------------------------------------
-- Inserción de Más Eventos
-- -----------------------------------------------------
INSERT INTO `cultura`.`Eventos` (`idEvento`, `idUbicacion`, `nombre`, `descripcion`, `tipo`, `fechaInicio`, `fechaFin`, `estado`, `esAnual`, `fechaCreacion`) VALUES
(3, 4, 'Festival del Carpincho', 'Música, arte y naturaleza en Yerba Buena', 'FESTIVAL', '2026-10-05 18:00:00', '2026-10-06 02:00:00', 'A', 1, '2026-06-18 10:30:00'),
(4, 6, 'Muestra Audiovisual Goldfinger', 'Cine clásico y producciones locales', 'FESTIVAL', '2026-11-10 19:00:00', '2026-11-12 23:00:00', 'A', 1, '2026-06-18 10:35:00');

-- -----------------------------------------------------
-- Inserción de Relación Actores-Eventos
-- -----------------------------------------------------
INSERT INTO `cultura`.`ActoresEventos` (`idEvento`, `idActor`) VALUES
(3, 4), -- Los Carpinchos del Alba en el Festival del Carpincho
(4, 6), -- Casino Royale Producciones en Muestra Goldfinger
(3, 7); -- Compañía Pyro en el Festival del Carpincho

-- -----------------------------------------------------
-- Inserción de Campos Adicionales para los Formularios
-- -----------------------------------------------------
INSERT INTO `cultura`.`CamposFormularios` (`idCampo`, `idCategoria`, `tipoDato`, `esPublico`, `obligatorio`, `orden`, `pregunta`) VALUES
(4, 4, 'TEXTO', 1, 1, 1, 'Rol principal en la producción (Ej: Director, Guionista)'),
(5, 4, 'TEXTO', 1, 0, 2, 'Cámaras o equipos habitualmente utilizados'),
(6, 3, 'TEXTO', 1, 1, 1, 'Disciplina escénica (Ej: Teatro de texto, Danza, Circo)');

-- -----------------------------------------------------
-- Inserción de Respuestas a Formularios (Comprobación EAV)
-- -----------------------------------------------------
INSERT INTO `cultura`.`RespuestasFormularios` (`idRespuesta`, `idActor`, `idCampo`, `valor`) VALUES
(4, 6, 4, '\"Director y Productor General\"'),
(5, 6, 5, '\"ARRI Alexa, RED V-Raptor\"'),
(6, 4, 3, '\"Cumbia norteña y chamamé\"'), -- Los Carpinchos del Alba (Campo 3 pertenece a la categoría 1: Música)
(7, 7, 6, '\"Teatro Físico y Malabares\"');

-- -----------------------------------------------------
-- Inserción de Más Ítems de Portafolio
-- -----------------------------------------------------
INSERT INTO `cultura`.`ItemsPortafolio` (`idItem`, `idActor`, `tipo`, `url`, `orden`, `descripcion`) VALUES
(3, 4, 'AUDIO', 'https://servidor-musica.local/carpinchos_mix.mp3', 1, 'Demo de estudio 2026'),
(4, 6, 'VIDEO', 'https://mpv-ex.server/reel_daniel.mp4', 1, 'Reel de Dirección Audiovisual'),
(5, 5, 'IMAGEN', 'https://mi-servidor.com/teatro_frente.jpg', 1, 'Fachada principal del Teatro'),
(6, 7, 'DOCUMENTO', 'https://mi-servidor.com/dossier_pyro.pdf', 1, 'Dossier técnico de la obra');