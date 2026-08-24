= Especificación de requisitos complementarios del software // (ANSI/IEEE 830)

Esta especificación tiene como objetivo analizar y documentar exhaustivamente los requisitos funcionales, no funcionales, reglas de negocio y restricciones técnicas que rigen el sistema *Mosaico Cultural*. Para ello, se adoptan las directrices del estándar IEEE 830, adaptadas a una arquitectura moderna de servicios web distribuidos, tipado estricto e interfaces reactivas de alto rendimiento.

== Identificación de los usuarios participantes

En la organización y en el ecosistema provincial de la plataforma se identifican los siguientes tipos de actores y usuarios:

- *Ente Cultural de Tucumán*: Organismo público solicitante de la plataforma web y rector de las políticas culturales de la provincia.
- *Grupo de Administradores*: Personal técnico y directivo encargado de la supervisión global de la plataforma, administración de usuarios y asignación de roles, gestión integral de categorías y subcategorías, diseño de formularios dinámicos y bancos de preguntas, administración del padrón de actividades económicas ARCA, creación y gestión de convocatorias oficiales, y ejecución de auditorías automatizadas de integridad del sistema.
- *Grupo de Moderadores de Categoría Cultural (Editores)*: Integrantes del equipo técnico del Ente Cultural a quienes se les delega autoridad exclusiva sobre una o varias disciplinas artísticas específicas. Tienen competencia para validar, publicar, rechazar o dar de baja a los actores culturales pertenecientes a sus categorías asignadas, registrar y verificar espacios culturales, y monitorear el relevamiento sectorial.
- *Grupo de Actores Culturales*: Entidades artísticas, productivas o institucionales registradas en el sistema (clasificadas como *Individuos*, *Colectivos* o *Espacios Culturales*) cuyos perfiles y portafolios públicos son visibilizados en la plataforma una vez aprobados. Pueden postularse a convocatorias oficiales, gestionar su portafolio multimedia, programar eventos en la agenda cultural provincial y administrar a sus integrantes.
- *Grupo de Usuarios*: Personas físicas registradas y autenticadas mediante Firebase Authentication que han completado su perfil con su documento de identidad (DNI), CUIL y actividad ARCA optativa. Están facultadas para crear y administrar actores culturales, integrar agrupaciones artísticas y postular a convocatorias.
- *Grupo de Personas (Público General)*: Ciudadanos y turistas que acceden a la plataforma sin necesidad de registrarse para consultar el directorio público de artistas, explorar el mapa cultural georreferenciado, consultar la agenda de eventos culturales (con opción de exportación a calendarios personales) y acceder a estadísticas culturales del territorio.

== Objetivos y alcances del sistema

El proyecto tiene por objetivo primordial recopilar, catalogar, georreferenciar y difundir el patrimonio vivo y los hacedores culturales de la provincia de Tucumán a través de una plataforma web accesible, moderna y adaptable (_responsive_).

Entre sus principales alcances funcionales se destacan:
1. *Georreferenciación y Cartografía Cultural:* Mapeo interactivo basado en coordenadas geográficas reales sobre el territorio provincial, permitiendo localizar artistas, salas de teatro, talleres artesanales, centros culturales y museos.
2. *Formularios Dinámicos por Disciplina:* Sistema flexible bajo el patrón Entidad-Atributo-Valor (EAV) que permite crear cuestionarios específicos según la naturaleza de cada sector artístico sin necesidad de modificar el esquema relacional de la base de datos.
3. *Agenda Cultural y Difusión de Eventos:* Publicación de actividades y espectáculos con integración y exportación directa a calendarios digitales.
4. *Gestión de Convocatorias y Fomento Cultural:* Canal unificado para el lanzamiento de concursos, subsidios y festivales provinciales con soporte de bases en formato Markdown, postulación en línea para actores registrados y paneles de evaluación.
5. *Vinculación con el Padrón Fiscal ARCA:* Mapeo y caracterización de la formalidad socioeconómica del sector artístico mediante el enlace voluntario a códigos oficiales de actividad económica.
6. *Cumplimiento Normativo y Protección de Datos:* Resguardo estricto de datos sensibles conforme a la Ley N° 25.326 de Protección de los Datos Personales, garantizando el derecho al olvido mediante borrado físico y recolección de archivos locales huérfanos.

== Definiciones, acrónimos y abreviaturas

- *Definiciones*:
  - *Actividad ARCA*: Código oficial del clasificador de actividades económicas de la Agencia de Recaudación y Control Aduanero (ex-AFIP/Rentas Tucumán) utilizado para evaluar el impacto formal del sector.
  - *Actor Cultural*: Entidad lógica central de la plataforma que representa a un artista individual, una agrupación o un espacio físico.
  - *Artesanía*: son los objetos elaborados manualmente, mediante la transformación de la materia prima con ayuda de recursos instrumentales y el dominio de técnicas específicas del oficio, que expresan un criterio estético funcional con valor cultural.
  - *Artesanos/as*: son aquellos hacedores culturales que elaboran artesanías, es decir, objetos de origen utilitario que cobran significación cultural, realizados manualmente con técnicas que son transmitidas de generación en generación o con máquinas movidas con energía básicamente humana, en forma individual o colectiva. (Art. 2º Ley 8083).
  - *Convocatoria*: Llamado formal abierto para certámenes, subsidios o participación en festivales.
  - *Data URL en Base64*: Esquema URI que permite incrustar archivos binarios (imágenes) directamente dentro de cadenas de texto en formato JSON.
  - *Derecho al Olvido*: Mecanismo que garantiza la supresión física definitiva de los datos personales e identificatorios de un usuario y de sus archivos asociados a su requerimiento expreso.
  - *Evento*: Suceso o actividad cultural calendarizada (festivales, obras de teatro, exposiciones, mercados) asociado a un actor.
  - *Formulario EAV*: Patrón arquitectónico (Entidad-Atributo-Valor) que permite almacenar propiedades dinámicas mediante pares clave-valor estructurados.
  - *Markdown*: Lenguaje de marcado ligero que permite aplicar formato estructurado a textos planos mediante etiquetas simples y legibles.
  - *Portafolio Cultural*: Colección pública de ítems multimedia (imágenes, enlaces externos y redes sociales) que constituye la vitrina digital del actor cultural.
  - *_Web responsive_*: Diseño adaptativo que permite una visualización y funcionalidad óptima en dispositivos móviles, _tablets_ y computadoras de escritorio.

- *Acrónimos y Abreviaturas*:
  - *ACID*: _Atomicity, Consistency, Isolation, Durability_ (Propiedades de transaccionalidad de bases de datos).
  - *ARCA*: _Agencia de Recaudación y Control Aduanero_.
  - *COOP*: _Cross-Origin-Opener-Policy_.
  - *CSP*: _Content Security Policy_.
  - *EAV*: _Entity-Attribute-Value_.
  - *GFM*: _GitHub Flavored Markdown_.
  - *IEEE*: _Institute of Electrical and Electronics Engineers_.
  - *JWT*: _JSON Web Token_.
  - *MUI*: _Material UI_.
  - *REST*: _Representational State Transfer_.
  - *SPA*: _Single Page Application_.
  - *UUID*: _Universally Unique Identifier_.

== Descripción general de los módulos y arquitectura funcional

=== Arquitectura Híbrida de Identidad y Autenticación

El sistema implementa un esquema desacoplado de identidad y perfiles relacionales:

1. *Gestión de Identidad y Proveedores de Acceso (Firebase Authentication):* La capa de autenticación, almacenamiento seguro de credenciales, autenticación federada con Google, emisión de enlaces de verificación de correo y recuperación de contraseñas es gestionada íntegramente por Firebase Authentication.
2. *Integración con Backend y Base de Datos Relacional:* La base de datos MariaDB *no almacena contraseñas ni hashes de acceso*. En su lugar, la tabla `Usuarios` almacena el atributo `idFirebase VARCHAR(128) NOT NULL` como clave foránea conceptual. El backend en Node.js/Express intercepta las peticiones, valida criptográficamente el ID Token de Firebase mediante el Firebase Admin SDK y genera una sesión interna respaldada por el procedimiento almacenado `sp_auth_obtener_usuario_sesion`.
3. *Manejador de Acciones de Correo Personalizado:* La plataforma cuenta con una ruta especializada en el frontend (`/auth/action`) que procesa los códigos de acción de Firebase (_oobCode_) para validar correos electrónicos y restablecer contraseñas de forma transparente en español y con validación de estados de seguridad.

=== Flujo de Registro y Gestión de Usuarios

El proceso de alta de un usuario se ejecuta en dos etapas coordinadas:

1. *Fase 1: Registro en Firebase Auth y Verificación de Correo:* El usuario crea su cuenta y recibe un correo para validar la titularidad de su casilla.
2. *Fase 2: Completitud de Perfil en la Plataforma (`RegistroDatosPage`):* Una vez validado el acceso, el usuario completa sus datos obligatorios:
  - Nombre y Apellidos.
  - Género: Tipificado según enumerador.
  - Fecha de Nacimiento: El sistema impone como regla de negocio obligatoria que el usuario debe tener una *edad mínima de 10 años cumplidos*.
  - Nacionalidad.
  - CUIL: Código de 11 dígitos numéricos sin guiones.
  - Código de Actividad ARCA: Opcional, seleccionado del padrón oficial provisto por el sistema.
  - Imagen de Documento de Identidad (DNI): Archivo escaneado o fotografía transmitido en Base64 y almacenado en una ruta privada con acceso restringido bajo `/uploads/dni/:filename`.
  - Avatar Personalizado: Selección de estilo y semilla gráfica generada dinámicamente mediante DiceBear (`avatarEstilo`, `avatarSeed`).

*Seguridad y Privacidad en el Acceso al DNI:*
La imagen del documento de identidad no se expone a través de directorios públicos estáticos. El acceso se canaliza exclusivamente mediante el endpoint autenticado `GET /uploads/dni/:filename`, el cual exige token de sesión JWT (`verifyToken`) y comprueba a nivel de base de datos que *únicamente el usuario titular (`idUsuario`) o un agente con rol `ADMIN` o `MODERADOR` en tareas de verificación de identidad tienen autorización para visualizar y descargar el archivo*. Las peticiones de terceros no autorizados son rechazadas inmediatamente con código HTTP 403 Forbidden.

*Derecho al Olvido y Supresión Física (Ley N° 25.326):*
Si un usuario solicita la baja de su cuenta, el sistema ejecuta el procedimiento `sp_usuario_eliminar_cuenta`. Este procedimiento efectúa la eliminación física transaccional de los registros personales del usuario, desvincula o elimina los actores de su titularidad exclusiva y retorna un conjunto de resultados con las rutas relativas de los archivos almacenados en el servidor (foto de DNI, fotos de perfil de actores y archivos de portafolio). El backend procesa este manifiesto y elimina físicamente los archivos del disco, garantizando que no queden datos huérfanos.

=== Modelo de Actores Culturales

Un Actor Cultural es la entidad nuclear del sistema y se clasifica en tres naturalezas:

1. *Individuo:* Artistas, hacedores, músicos o artesanos independientes que gestionan su propio perfil y portafolio de manera directa.
2. *Colectivo / Agrupación:* Bandas de música, ballets folclóricos, compañías teatrales o colectivos de artesanos conformados por múltiples personas.
3. *Espacio Cultural:* Salas de teatro, museos, bibliotecas populares, talleres o galerías de arte que disponen de una sede física y coordenadas geográficas.

*Soporte de Formato Markdown en Descripciones:*
Las descripciones públicas de los actores culturales admiten texto enriquecido en formato Markdown con un límite de hasta 5.000 caracteres (almacenado en tipo `TEXT`). Esto permite a los artistas estructurar su reseña biográfica, incluir enlaces web, texto en negrita/cursiva, listas y citas. En el cliente, el contenido se procesa mediante `react-markdown` y `remark-gfm`, mientras que en el backend se valida y sanitiza contra caracteres de control e invisibles mediante `sanitizeString` (`publicDescriptionSchema`).

*Relación de Pertenencia y Gestión de Integrantes:*
- *Integrantes Registrados (`Integrantes`):* Vincula usuarios de la plataforma con el actor, definiendo su rol artístico y la bandera `esDueño`.
- *Transferencia de Titularidad (`sp_actor_transferir_titularidad`):* El titular de un colectivo puede transferir de forma transaccional el control del actor a otro integrante registrado.
- *Renuncia de Integrantes (`sp_actor_renunciar_integrante`):* Un usuario registrado puede renunciar voluntariamente a su vinculación con una agrupación.
- *Integrantes No Registrados (`IntegrantesNoRegistrados`):* Permite al titular cargar a miembros que no poseen cuenta activa en la plataforma (registrando nombre, apellido, correo electrónico opcional y rol), facilitando la representación fidedigna de agrupaciones tradicionales o comunitarias.
- *Migración y Auto-vinculación de Integrantes No Registrados (`sp_publico_registrar_usuario`):* Cuando una persona que fue previamente incorporada por el titular como integrante no registrado (`IntegrantesNoRegistrados`) decide registrarse formalmente en la plataforma utilizando la misma casilla de correo electrónico, el procedimiento almacenado de registro transfiere de manera atómica todas sus membresías preexistentes hacia la tabla `Integrantes` (asignándole `esDueño = 0` y preservando su rol artístico), eliminando en la misma transacción los registros temporales de `IntegrantesNoRegistrados`. Esto asegura la continuidad histórica del colectivo artístico y una experiencia de usuario transparente sin requerir reconfiguraciones manuales.

*Estados y Reglas de Validación de Actores:*
- Los actores transitan por los estados `'P'` (Pendiente de revisión), `'A'` (Activo / Publicado) e `'I'` (Inactivo / Dado de baja lógica).
- *Límite de Actores Pendientes:* Para prevenir la saturación de las bandejas de moderación, un usuario puede tener como máximo *cinco actores en estado pendiente simultáneamente* en los que sea titular (`esDueño = 1`).

*Portafolio y Agenda de Eventos:*
- Cada actor dispone de una vitrina o galería multimedia (`ItemsPortafolio`) con soporte para imágenes, enlaces externos y redes sociales, aplicando un límite de negocio estricto de *hasta 10 imágenes por actor* implementado en la API y el diálogo de gestión.
- Los actores pueden registrar eventos calendarizados vinculados a su perfil. Estos eventos se publican en la agenda cultural provincial y cuentan con exportación directa a Google Calendar y archivos descargables en estándar iCalendar.

=== Sistema de Formularios Dinámicos (Patrón EAV) y Banco de Preguntas

Para adaptarse a las diversas disciplinas culturales sin modificar la estructura de la base de datos, se implementó un motor de formularios dinámicos:

1. *Ámbitos de Formulario:* Se asocian a una Categoría (`idSubcategoria = 0`) o de forma especializada a una Subcategoría (`idSubcategoria > 0`).
2. *Banco Reutilizable de Preguntas (`Preguntas`):* Almacena enunciados tipificados que pueden ser reutilizados entre distintos formularios. Soporta 11 tipos de datos:
  - `TEXTO`, `NUMERO`, `BOOLEANO`, `FECHA`, `URL`, `EMAIL`, `TELEFONO`.
  - `OPCION_UNICA`, `OPCION_MULTIPLE`, `OPCION_MULTIPLE_CHIPS`, `TAGS` (con opciones validadas en formato JSON).
3. *Preguntas en Formularios (`PreguntasFormulario`):* Define el orden, la obligatoriedad (`esObligatorio`), la visibilidad pública (`esPublico`) y el estado de la pregunta.
4. *Sustitución Histórica de Preguntas (`idPreguntaReemplazada`):* Cuando el Ente Cultural decide reformular o reemplazar una pregunta en un formulario activo, el sistema la desactiva y vincula la nueva pregunta con la anterior mediante `idPreguntaReemplazada`. Esto permite que los nuevos registros utilicen la versión actualizada sin invalidar ni borrar las respuestas históricas de los actores ya registrados.
5. *Confirmación de Formularios (`sp_actor_confirmar_formulario`):* Valida que todas las preguntas obligatorias activas hayan sido debidamente respondidas antes de permitir la solicitud de publicación del actor.

=== Moderación Descentralizada y Matriz de Roles

La administración del sistema se rige por un esquema jerárquico de control de acceso:

1. *Administradores:* Tienen acceso irrestricto a todas las funcionalidades del sistema: gestión de usuarios, asignación de moderadores, CRUD de categorías y subcategorías, gestión de formularios, administración de actividades ARCA, gestión de convocatorias y auditorías de integridad.
2. *Moderadores (Editores):* Tienen asignada una o más categorías culturales en la tabla `ModeradoresCategorias`. Su alcance de lectura, edición, aprobación y cambio de estado se restringe estrictamente a los actores culturales y categorías que tienen asignadas (`sp_admin_listar_actores`, `sp_admin_cambiar_estado_actores`).
3. *Promoción y Degradación Dinámica:* La asignación de al menos una categoría a un usuario estándar promueve automáticamente su rol a `'MODERADOR'`; la revocación de todas sus categorías restablece su rol a `'USUARIO'`.

=== Convocatorias Culturales

El módulo de convocatorias permite a los administradores lanzar y gestionar llamados públicos:
- Creación, modificación y cierre de convocatorias con fecha límite obligatoria (`fechaCierre`).
- *Bases y Condiciones en Markdown:* El campo de descripción y bases de la convocatoria admite texto enriquecido en Markdown (hasta 5.000 caracteres), facilitando la publicación de requisitos, cláusulas y enlaces institucionales.
- Postulación en línea: Los actores culturales en estado `'A'` (Activo) pueden postularse mientras la convocatoria se encuentre abierta.
- Cancelación de postulación: El titular del actor puede retirar su postulación antes del cierre.
- Panel de evaluación administrativo: Visualización de métricas de postulación y reporte con datos de contacto del responsable de cada actor.

=== Catálogo de Actividades Económicas ARCA / Rentas

El sistema cuenta con un catálogo administrable de actividades económicas (`ActividadesArca`) que permite:
- Búsqueda, alta y edición de códigos y descripciones oficiales de actividad.
- Importación masiva desde archivos oficiales F883 de ARCA.
- Auditoría de utilización por parte de los usuarios registrados.
- Asociación opcional en el formulario de registro y perfil de usuario para fines estadísticos provinciales.

=== Auditoría e Integridad del Sistema

Para garantizar la consistencia de la base de datos a lo largo del tiempo, se implementaron mecanismos preventivos y diagnósticos:

1. *Procedimiento Diagnóstico (`sp_sistema_auditar_integridad`):* Consumido desde la interfaz administrativa (`adminAuditoria.tsx`), evalúa y reporta:
  - Registros huérfanos entre actores, usuarios, ubicaciones e integrantes.
  - Formularios activos sin preguntas o categorías activas sin formularios definidos.
  - Discrepancias en estados de actores y ubicaciones no públicas mal configuradas.
  - Actores con formularios obligatorios incompletos en estado publicado.
2. *Triggers de Auditoría para Bajas Lógicas:* Para asegurar la trazabilidad temporal del ciclo de vida de los registros sin depender exclusivamente del servidor de aplicaciones, MariaDB incorpora triggers automáticos:
  - `trg_Usuarios_fecha_baja_insert` y `trg_Usuarios_fecha_baja_update`: Gestionan automáticamente la columna `fechaBaja` en la tabla `Usuarios`, asignando `CURRENT_TIMESTAMP` cuando el estado cambia a `'I'` e inicializándola en `NULL` si el usuario es reactivado a `'A'`.
  - `trg_Actores_fecha_baja_insert` y `trg_Actores_fecha_baja_update`: Gestionan de forma análoga la columna `fechaBaja` en la tabla `Actores`, asegurando registros fidedignos para auditorías institucionales.

=== Resumen Estadístico y Portal Público

El portal público cuenta con el procedimiento `sp_publico_resumen_estadisticas`, el cual calcula en tiempo real métricas clave de impacto cultural (total de actores activos, total de espacios registrados, total de departamentos alcanzados y categorías activas), visibles en la portada institucional y en la página de licencia del sistema.

== Suposiciones y dependencias

- *Suposiciones del Sistema*:
  - La plataforma opera de manera _online_ 24x7; se descarta formalmente el almacenamiento local _offline_ debido a la complejidad de sincronización concurrente en formularios dinámicos y postulaciones con fecha límite estricta.
  - La base de datos opera bajo el motor MariaDB 10.x / MySQL 8.x con el motor de almacenamiento InnoDB y modo estricto `STRICT_TRANS_TABLES`.
  - Todas las mutaciones críticas de datos (creación de actores, transacciones de formularios, cambio de roles y supresión de cuentas) se ejecutan de manera atómica mediante procedimientos almacenados con control de excepciones (`DECLARE EXIT HANDLER FOR SQLEXCEPTION`, `START TRANSACTION`, `COMMIT`, `ROLLBACK` y bloqueos `FOR UPDATE`).

- *Dependencias Tecnológicas Externas*:
  - *Firebase Authentication & Google Identity Services:* Dependencia de los servicios de autenticación en la nube para el inicio de sesión federado y el envío de correos transaccionales de verificación y cambio de contraseña.
  - *Servidores de Cartografía (OpenStreetMap / Leaflet):* Dependencia de proveedores de teselas geográficas estándar para la representación visual del mapa provincial.

== Requisitos de usuario y tecnológicos

- *Requisitos de Usuario*:
  - Interfaz gráfica intuitiva, moderna y accesible sin necesidad de capacitación técnica previa.
  - Diseño totalmente adaptable (_responsive_) que garantice una experiencia de uso fluida tanto en dispositivos móviles táctiles como en equipos de escritorio.
- *Requisitos de Arquitectura Tecnológica*:
  - *Capa de Cliente (Frontend):* Aplicación de Página Única (SPA) construida con React 19, TypeScript y Vite, utilizando el sistema de diseño y componentes de interfaz de *Material UI* (`@mui/material`, `@mui/icons-material`, `@mui/x-date-pickers`, `@toolpad/core`) y librerías especializadas (Leaflet / React Leaflet para mapas georreferenciados, Day.js para gestión de fechas, React Toastify para notificaciones y React Markdown con Remark GFM para renderizado de texto enriquecido).
  - *Capa de Servidor (Backend):* API REST construida en Node.js con Express y TypeScript, integrando Firebase Admin SDK, registro estructurado de eventos con Pino HTTP, especificación completa bajo el estándar *OpenAPI 3.1.0* (generada con `@asteasolutions/zod-to-openapi`) y documentación interactiva moderna renderizada mediante *Scalar API Reference* (`@scalar/express-api-reference`) accesible en la ruta `/docs`.
  - *Capa de Datos (Base de Datos):* Motor relacional MariaDB / MySQL con esquema relacional normalizado, soporte para tipos JSON nativos, restricciones de integridad referencial, triggers automáticos de auditoría e implementación exhaustiva de lógica de negocio en Procedimientos Almacenados (Stored Procedures).
  - *Servidor Web y Proxy Inverso:* Nginx configurado con políticas estrictas de seguridad (COOP, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy) y reescritura de rutas para SPA.
  - *Contenedorización:* Despliegue estandarizado mediante Docker y Docker Compose (`compose.yml`).

== Requisitos de interfaces externas

- *Interfaces de Hardware*:
  - Dispositivos móviles: Soporte para pantallas táctiles con resolución mínima de 360x640 píxeles.
  - Equipos de escritorio / _laptops_: Resolución mínima de 1366x768 píxeles recomendada para paneles administrativos, tablas de auditoría y diseño de formularios.
- *Interfaces de Software*:
  - Navegadores web modernos compatibles con los estándares HTML5, CSS3 y JavaScript ECMAScript 2022+ (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari).
- *Almacenamiento y Protección de Archivos*:
  - *Archivos Públicos (`/uploads/actores/`):* Fotografías de perfil y material de portafolio servidos con cabeceras `Cross-Origin-Resource-Policy: cross-origin`.
  - *Archivos Privados (`/uploads/dni/`):* Imágenes de documentos de identidad almacenadas fuera del alcance estático público, accesibles exclusivamente mediante el endpoint autenticado `/uploads/dni/:filename` bajo validación estricta de titularidad o rol administrativo (`ADMIN`/`MODERADOR`).

== Requisitos de rendimiento y seguridad

- *Tiempos de Respuesta y Capacidad*:
  - Las consultas públicas (búsqueda de actores en mapa, listado de eventos y visualización de portafolios) deben responder en menos de 2 segundos bajo condiciones normales de red.
  - Soporte para concurrencia masiva en períodos de apertura de convocatorias culturales o festivales provinciales.
- *Políticas de Seguridad y Mitigación de Amenazas*:
  - *Mitigación de Denegación de Servicio (Rate Limiting):* Límites de tasa mediante `express-rate-limit` (300 peticiones por ventana de 15 minutos en la API general; 30 peticiones por 15 minutos en endpoints de autenticación).
  - *Límite de Tamaño de Carga:* Restricción de _payload_ JSON a 10 MB para evitar saturación de memoria en el servidor.
  - *Transmisión y Validación de Archivos (Base64 / Data URLs):* El backend no utiliza middleware multipart como Multer; las imágenes (DNI, fotos de perfil e imágenes de portafolio) se transmiten codificadas como Data URLs en Base64 en el cuerpo JSON de las peticiones. Son validadas estrictamente en backend mediante esquemas de Zod y expresiones regulares que verifican el encabezado MIME permitido (`image/jpeg`, `image/png`, `image/webp`) y un tamaño máximo de hasta 7 MB por imagen. Posteriormente, el backend decodifica la carga en buffers nativos de Node.js (`Buffer.from`) y escribe los archivos de forma atómica en el sistema de archivos con esquemas de nomenclatura que combinan identificadores criptográficamente seguros y marcas temporales (`crypto.randomUUID()` para fotos de perfil y portafolio, y el patrón `dni_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}` para documentos de identidad).
  - *Encapsulamiento en Procedimientos Almacenados:* Todas las operaciones de base de datos se ejecutan mediante procedimientos almacenados con parámetros tipificados, anulando la superficie de ataque por inyección SQL.
- *Integración y Despliegue Continuo (CI/CD)*:
  - Pipeline automatizado en GitHub Actions que ejecuta pruebas de sintaxis (ESLint), validación de scripts SQL, y compilación automática de la documentación Typst con encriptación mediante QPDF y firma digital criptográfica con clave PGP/GPG.
