= Especificación de requisitos complementarios del software // (ANSI/IEEE 830)

Esta especificación tiene como objetivo documentar de manera estructurada los requisitos funcionales, no funcionales, reglas de negocio y restricciones técnicas del sistema *Mosaico Cultural*. Para su organización se toman como referencia las directrices establecidas por el estándar IEEE 830 para especificaciones de requisitos de software (SRS), adaptadas a una arquitectura moderna de servicios web distribuidos e interfaces reactivas.

== Introducción

=== Propósito del documento

El presente documento define formalmente el alcance, las capacidades funcionales, las reglas operativas y las características de calidad del sistema *Mosaico Cultural*. Está dirigido a los desarrolladores del proyecto, directores académicos de la Práctica Profesional Supervisada (PPS) de la Facultad de Ciencias Exactas y Tecnología (FACET - UNT), y autoridades técnicas del Ente Cultural de Tucumán como organismo beneficiario.

=== Objetivos y alcance del sistema

El proyecto tiene por objetivo recopilar, catalogar, georreferenciar y difundir el patrimonio vivo y los hacedores culturales de la provincia de Tucumán a través de una plataforma web accesible, moderna y adaptable (_responsive_).

Entre sus principales alcances se destacan:
1. *Georreferenciación y Cartografía Cultural:* Mapeo interactivo basado en coordenadas geográficas reales sobre el territorio provincial, permitiendo localizar artistas, salas de teatro, talleres artesanales, centros culturales y museos.
2. *Formularios Dinámicos por Disciplina:* Sistema flexible bajo el patrón Entidad-Atributo-Valor (EAV) que permite crear cuestionarios específicos según la naturaleza de cada sector artístico sin modificar el esquema relacional de la base de datos.
3. *Agenda Cultural y Nexo de Eventos:* Publicación de actividades y espectáculos vinculando a los artistas con espacios físicos y fechas específicas, con exportación a calendarios digitales (.ics y Google Calendar).
4. *Gestión de Convocatorias Oficiales:* Canal unificado para el lanzamiento de concursos, certámenes y subsidios provinciales con bases en formato Markdown y postulación en línea para actores registrados.
5. *Vinculación con el Padrón Fiscal ARCA:* Mapeo de la formalidad socioeconómica del sector mediante el enlace voluntario a códigos oficiales de actividad económica.
6. *Protección de Datos Personales:* Resguardo de datos sensibles conforme a la Ley N° 25.326, garantizando el mecanismo de supresión física de cuentas de usuario y la recolección de archivos locales huérfanos.

=== Definiciones, acrónimos y abreviaturas

- *Definiciones*:
  - *Actividad ARCA*: Código correspondiente a una actividad económica del clasificador oficial utilizado por la Agencia de Recaudación y Control Aduanero (ARCA).
  - *Actor Cultural*: Entidad lógica central de la plataforma que representa a un artista individual, una agrupación o un espacio físico.
  - *Artesanía*: son los objetos elaborados manualmente, mediante la transformación de la materia prima con ayuda de recursos instrumentales y el dominio de técnicas específicas del oficio, que expresan un criterio estético funcional con valor cultural.
  - *Artesanos/as*: son aquellos hacedores culturales que elaboran artesanías, es decir, objetos de origen utilitario que cobran significación cultural, realizados manualmente con técnicas que son transmitidas de generación en generación o con máquinas movidas con energía básicamente humana, en forma individual o colectiva. (Art. 2º Ley 8083).
  - *Convocatoria*: Llamado formal abierto para certámenes, subsidios o festivales oficiales.
  - *Data URL en Base64*: Esquema URI que permite incrustar archivos binarios (imágenes) directamente dentro de cadenas de texto en formato JSON.
  - *Evento Cultural*: Suceso o actividad calendarizada que vincula a uno o varios artistas con un espacio cultural físico en una fecha determinada.
  - *Formulario EAV*: Patrón arquitectónico (Entidad-Atributo-Valor) que permite almacenar propiedades dinámicas mediante pares clave-valor estructurados.
  - *Markdown*: Lenguaje de marcado ligero que permite aplicar formato estructurado a textos planos mediante etiquetas legibles.
  - *Portafolio Cultural*: Colección pública de ítems multimedia (imágenes, enlaces externos y redes sociales) de un actor cultural.
  - *Supresión de Datos Personales:* Mecanismo mediante el cual se eliminan físicamente los datos personales del usuario y los archivos asociados a su requerimiento expreso, conforme a la normativa de protección de datos (Ley N° 25.326).
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
  - *SRS*: _Software Requirements Specification_.
  - *UUID*: _Universally Unique Identifier_.

== Descripción general del sistema

=== Identificación de usuarios y matriz de capacidades

En el ecosistema de la plataforma se identifican los siguientes grupos de usuarios con sus correspondientes alcances funcionales:

1. *Público General (Visitantes no registrados):*
  - Acceder al mapa cultural georreferenciado y explorar los puntos culturales de la provincia.
  - Consultar el directorio público de actores aplicando filtros combinados por disciplina/categoría, subcategoría, departamento y búsqueda por texto.
  - Visualizar la ficha pública y el portafolio multimedia de los actores en estado activo.
  - Consultar la agenda de eventos culturales públicos con filtros por fecha, disciplina y departamento.
  - Exportar eventos a calendarios personales (.ics y Google Calendar).
  - Consultar el resumen estadístico de impacto cultural provincial.
  - _Restricción_: Solo tienen acceso a información pública aprobada; no pueden acceder a datos identificatorios privados (DNI, CUIL, respuestas de formularios privadas) ni participar en convocatorias.

2. *Usuarios Registrados:*
  - Iniciar sesión mediante correo/contraseña o autenticación federada con Google.
  - Completar y actualizar su perfil personal (datos de contacto, CUIL, actividad ARCA opcional, imagen de DNI y avatar DiceBear).
  - Solicitar la supresión física definitiva de su cuenta de usuario bajo la Ley N° 25.326.
  - Registrar nuevos actores culturales (individuos, colectivos o espacios físicos).
  - Completar y actualizar los formularios dinámicos EAV correspondientes a la categoría/subcategoría de sus actores.
  - Gestionar el portafolio multimedia de sus actores (imágenes, enlaces externos y redes sociales).
  - Administrar agrupaciones: invitar integrantes registrados, precargar integrantes sin cuenta, modificar roles artísticos, transferir la titularidad o renunciar a la membresía.
  - Registrar, programar y dar de baja eventos culturales en la agenda pública vinculados a sus actores.
  - Postular a sus actores culturales en convocatorias oficiales activas y retirar postulaciones antes del cierre.

3. *Actores Culturales (Entidades nucleares del registro):*
  - *Individuo:* Artistas independientes que gestionan directamente su perfil personal y portafolio.
  - *Colectivo / Agrupación:* Agrupaciones musicales, ballets, elencos teatrales o cooperativas artesanales gestionadas por un titular con nómina de integrantes.
  - *Espacio Cultural:* Establecimientos físicos con domicilio y coordenadas geográficas (salas de teatro, museos, bibliotecas populares, talleres artesanales y centros culturales).

4. *Grupo de Moderadores de Categoría Cultural (Editores):*
  - Visualizar la bandeja de actores culturales pertenecientes exclusivamente a las categorías o disciplinas que tienen asignadas.
  - Evaluar, aprobar (`'A'`), rechazar o dar de baja lógica (`'I'`) a los actores de su competencia territorial y disciplinaria.
  - Verificar la coherencia de las respuestas de formularios dinámicos EAV y la ubicación de espacios físicos.
  - _Restricción explícita de autorización_: Tienen estrictamente restringida la visualización y modificación de datos sensibles de los usuarios (como el CUIL o la edición de cuentas personales ajenas), circunscribiendo su autoridad a la fiscalización artística del actor.

5. *Grupo de Administradores:*
  - Supervisión global e irrestricta de todos los módulos de la plataforma.
  - Gestión integral de usuarios (activación, bloqueo de estado y consulta de perfiles administrativos).
  - Asignación y revocación transaccional de categorías a moderadores (promoción a `'MODERADOR'` y degradación a `'USUARIO'`).
  - Gestión del árbol de disciplinas (CRUD y bajas lógicas de Categorías y Subcategorías).
  - Diseño y mantenimiento de formularios dinámicos EAV y del banco reutilizable de preguntas.
  - Administración del catálogo de actividades económicas ARCA e importación masiva desde archivos F883.
  - Creación, edición, cierre y evaluación de Convocatorias Oficiales, con descarga de nóminas de postulantes y datos de contacto de responsables.
  - Ejecución del módulo de auditoría diagnóstica de integridad referencial del sistema (`sp_sistema_auditar_integridad`).

=== Modelo del ciclo de vida y metodología de desarrollo

El desarrollo del proyecto *Mosaico Cultural* se condujo bajo el modelo de *Prototipado Evolutivo*. Esta metodología permitió construir la solución de manera iterativa e incremental, validando prototipos funcionales junto al equipo técnico del Ente Cultural de Tucumán a lo largo de tres etapas consecutivas:

1. *Etapa 1 (Visualización pública y cartografía):* Implementación del mapa interactivo georreferenciado, directorio de actores, catálogo público de eventos y diseño de la base de datos relacional inicial.
2. *Etapa 2 (Autogestión de usuarios, actores y formularios EAV):* Integración de Firebase Authentication, perfil de usuario con validación de edad y DNI, autogestión de actores (individuos, colectivos y espacios), motor de formularios dinámicos EAV y gestión de portafolios.
3. *Etapa 3 (Moderación descentralizada, convocatorias y administración):* Panel administrativo jerárquico, módulo de convocatorias oficiales, catálogo ARCA, auditoría automatizada de integridad de datos y hardening de seguridad en API y base de datos.

== Requisitos funcionales específicos

=== Módulo 1: Identidad, Autenticación y Perfil de Usuario

- *RF-01 (Autenticación desacoplada):* El sistema debe permitir el inicio de sesión y registro mediante Firebase Authentication (correo/contraseña y Google OAuth), utilizando `idFirebase` como identificador externo de vinculación en MariaDB sin almacenar hashes de contraseñas localmente.
- *RF-02 (Verificación de correo electrónico):* El sistema debe requerir la verificación obligatoria del correo antes de habilitar las operaciones de creación de actores y postulación a convocatorias, gestionando los códigos de acción a través de una vista interna (`/auth/action`).
- *RF-03 (Completitud de perfil en dos fases):* Tras autenticarse, el usuario debe completar sus datos obligatorios: nombre, apellido, género, fecha de nacimiento, nacionalidad, CUIL (11 dígitos) y carga de fotografía de DNI.
- *RF-04 (Restricción de edad mínima):* El sistema debe rechazar el registro de usuarios que no posean al menos *10 años de edad cumplidos* a la fecha de alta.
- *RF-05 (Supresión de datos personales):* El usuario debe poder solicitar la eliminación física de su cuenta. El sistema debe ejecutar de forma transaccional el borrado de sus datos relacionales, desvincular o eliminar los actores de su propiedad y purgar los archivos físicos huérfanos del disco (DNI, fotos de perfil y portafolios).

=== Módulo 2: Portal Público, Directorio y Cartografía Cultural

- *RF-06 (Directorio público de actores):* El portal debe listar los actores culturales activos permitiendo filtros combinados por categoría, subcategoría, departamento y búsqueda por texto, con paginación controlada.
- *RF-07 (Mapa cultural georreferenciado):* El sistema debe renderizar un mapa interactivo con marcadores basados en coordenadas geográficas reales (latitud/longitud dentro de los límites de Tucumán), filtrables por disciplina y departamento, mostrando solo aquellos actores con ubicación pública explícitamente autorizada.
- *RF-08 (Ficha pública y portafolio):* Cada actor activo debe contar con una vista pública que exponga su reseña biográfica (Markdown), galería multimedia, integrantes y respuestas a preguntas de visibilidad pública del formulario EAV.
- *RF-09 (Resumen estadístico público):* El portal debe computar y exhibir en tiempo real contadores agregados de actores activos, espacios físicos, departamentos alcanzados y disciplinas activas.

=== Módulo 3: Gestión de Actores Culturales y Portafolio

- *RF-10 (Alta de actores culturales):* El usuario autenticado debe poder crear actores culturales en las tipologías de *Individuo*, *Colectivo* o *Espacio Cultural*, inicializándolos en estado Pendiente (`'P'`) y asignando al creador como titular (`esDueño = 1`).
- *RF-11 (Límite de actores pendientes):* El sistema debe impedir que un usuario tenga más de *5 actores en estado pendiente simultáneamente* en los que figure como titular.
- *RF-12 (Gestión de integrantes en colectivos):* El titular debe poder:
  - Invitar a usuarios registrados mediante correo electrónico asignándoles un rol artístico.
  - Precargar integrantes no registrados (nombre, apellido, email opcional y rol).
  - Modificar roles artísticos de los miembros.
  - Desvincular integrantes garantizando que no se elimine al único titular.
- *RF-13 (Auto-vinculación de integrantes no registrados):* Si un integrante precargado sin cuenta se registra formalmente en la plataforma con el mismo correo, el sistema debe migrar de forma atómica sus membresías a la tabla `Integrantes` (`esDueño = 0`) y purgar el registro temporal de `IntegrantesNoRegistrados`.
- *RF-14 (Transferencia de titularidad y renuncia):* El titular debe poder transferir el control del actor (`esDueño = 1`) a otro integrante registrado. Asimismo, cualquier integrante debe poder renunciar voluntariamente al colectivo, siempre que no sea el único titular activo.
- *RF-15 (Portafolio multimedia):* El actor debe poder cargar imágenes, enlaces web y redes sociales en su vitrina, aplicando un límite de *hasta 10 imágenes por actor*.
- *RF-16 (Texto enriquecido en Markdown):* La descripción del actor debe admitir formato Markdown (hasta 5.000 caracteres), procesándose en cliente con `react-markdown` y sanitizándose en backend contra caracteres de control e invisibles.

=== Módulo 4: Sistema de Formularios Dinámicos (Patrón EAV)

- *RF-17 (Banco reutilizable de preguntas):* Los administradores deben poder crear preguntas globales tipificadas en 11 tipos de datos (`TEXTO`, `NUMERO`, `BOOLEANO`, `FECHA`, `URL`, `EMAIL`, `TELEFONO`, `OPCION_UNICA`, `OPCION_MULTIPLE`, `OPCION_MULTIPLE_CHIPS`, `TAGS`) con opciones estructuradas en JSON.
- *RF-18 (Formularios por ámbito):* El sistema debe permitir definir formularios asociados a una Categoría o a una Subcategoría, configurando para cada pregunta su orden, obligatoriedad (`esObligatorio`) y visibilidad pública (`esPublico`).
- *RF-19 (Sustitución histórica de preguntas):* Cuando se reemplaza una pregunta activa en un formulario, el sistema debe desactivar la versión anterior y asociar la nueva mediante `idPreguntaReemplazada`, preservando las respuestas históricas de los actores ya registrados.
- *RF-20 (Validación y confirmación de respuestas):* Las respuestas deben validarse contra el tipo de dato y opciones de la pregunta. El formulario solo puede confirmarse cuando todas sus preguntas obligatorias activas han sido respondidas.

=== Módulo 5: Agenda Cultural y Nexo de Eventos

- *RF-21 (Nexo relacional de eventos):* El sistema debe modelar los eventos como el nexo conceptual que vincula a un *Actor Cultural* con un *Espacio Cultural* físico y una *Fecha/Hora* determinada (*Actor → Evento → Espacio → Fecha*), permitiendo reconstruir la trayectoria de actividades y generar estadísticas sectoriales.
- *RF-22 (Agenda pública y filtros):* Los eventos futuros deben publicarse en la agenda general con filtros por rango de fechas, disciplina y departamento.
- *RF-23 (Exportación a calendarios):* Cada evento debe ofrecer exportación directa a Google Calendar y descarga de archivo estándar iCalendar (.ics).

=== Módulo 6: Gestión de Convocatorias Oficiales

- *RF-24 (Administración de convocatorias):* Los administradores deben poder crear, editar y cerrar convocatorias oficiales estableciendo título, bases y condiciones en formato Markdown (hasta 5.000 caracteres) y fecha de cierre obligatoria.
- *RF-25 (Postulación en línea):* Los actores culturales en estado Activo (`'A'`) deben poder postularse a convocatorias vigentes a través de su titular. El titular debe poder retirar la postulación antes del cierre.
- *RF-26 (Reporte de postulantes):* El panel de administración debe presentar el reporte de actores postulados con sus datos de contacto (nombre, apellido y correo del responsable).

=== Módulo 7: Catálogo de Actividades Económicas ARCA

- *RF-27 (Catálogo oficial administrable):* El sistema debe gestionar el padrón de actividades económicas ARCA (código de 6 dígitos y descripción), con soporte para importación masiva desde archivos oficiales TXT F883.
- *RF-28 (Protección de integridad referencial):* El sistema debe impedir la eliminación de actividades ARCA que se encuentren asociadas al perfil de uno o más usuarios registrados.

=== Módulo 8: Panel de Moderación y Administración

- *RF-29 (Bandeja descentralizada de moderación):* Los moderadores deben acceder exclusivamente a los actores culturales de las disciplinas que tienen asignadas, pudiendo aprobar (`'A'`), solicitar correcciones (`'P'`) o dar de baja (`'I'`).
- *RF-30 (Auditoría diagnóstica de integridad):* Los administradores deben poder ejecutar el procedimiento `sp_sistema_auditar_integridad` para detectar anomalías relacionales, registros huérfanos o desajustes en formularios.

== Reglas de negocio y ciclo de vida de entidades

=== Matriz de estados y transiciones

El ciclo de vida de las entidades del sistema se rige por estados controlados:

#figure(
  table(
    columns: (1.5fr, 1fr, 3fr),
    table.header([*Entidad*], [*Estados Posibles*], [*Significado y Transiciones Permitidas*]),
    [Actor Cultural], [`'P'`, `'A'`, `'I'`], [
      `'P'` (Pendiente): Creado o editado por usuario, en espera de revisión.\
      `'A'` (Activo): Aprobado por moderador/admin, visible en directorio y mapa.\
      `'I'` (Inactivo): Baja lógica por titular o moderador.
    ],
    [Usuario], [`'P'`, `'A'`, `'I'`], [
      `'P'` (Pendiente): Registrado en Firebase pero sin completar DNI/perfil.\
      `'A'` (Activo): Perfil completo y habilitado para operar.\
      `'I'` (Inactivo): Cuenta bloqueada administrativamente.
    ],
    [Categoría / Subcategoría], [`'A'`, `'I'`], [
      `'A'` (Activa): Disponible para registro de actores y filtros.\
      `'I'` (Inactiva): Oculta para nuevos registros, preserva vínculos históricos.
    ],
    [Pregunta en Formulario], [`'A'`, `'I'`], [
      `'A'` (Activa): Vigente en el formulario y requerida al confirmar.\
      `'I'` (Inactiva / Reemplazada): Desactivada, preserva respuestas históricas.
    ],
    [Convocatoria], [Abierta / Cerrada], [
      Abierta: Fecha actual $<=$ `fechaCierre`, admite postulaciones.\
      Cerrada: Fecha actual $>$ `fechaCierre`, solo lectura y evaluación.
    ],
  ),
  caption: [Matriz de estados y ciclo de vida de entidades en Mosaico Cultural.],
)

=== Políticas de ciclo de vida: Borrado Lógico vs. Supresión Física

Para balancear la trazabilidad histórica de la administración pública con las garantías individuales de privacidad, el sistema adopta dos políticas diferenciadas:

1. *Política de Borrado Lógico (Preservación referencial):*
  - *Ámbito de aplicación:* Actores culturales, categorías, subcategorías, preguntas de formularios dinámicos y eventos.
  - *Comportamiento:* Las entidades nunca se eliminan físicamente de la base de datos al ser canceladas o disueltas; en su lugar, se actualiza su estado a inactivo (`'I'`). MariaDB gestiona automáticamente la columna `fechaBaja` mediante triggers de base de datos (`trg_Usuarios_fecha_baja_*`, `trg_Actores_fecha_baja_*`), preservando la integridad referencial y el histórico de censos y estadísticas.

2. *Política de Supresión Física de Datos Personales (Derecho de Supresión - Ley N° 25.326):*
  - *Ámbito de aplicación:* Cuentas de usuario personales y sus archivos privados asociados.
  - *Comportamiento:* A solicitud expresa del titular, se ejecuta el procedimiento transaccional `sp_usuario_eliminar_cuenta` que borra físicamente la fila en `Usuarios`, desvincula o elimina los actores donde era único titular y genera el manifiesto para que el backend elimine físicamente los archivos del disco (DNI, fotos de perfil y portafolios huérfanos).

== Requisitos no funcionales

=== Seguridad y privacidad

- *RNF-01 (Seguridad en acceso a datos):* Las operaciones de persistencia y consulta se encapsulan en procedimientos almacenados con parámetros tipificados, reduciendo sustancialmente la superficie de ataque asociada a la inyección SQL.
- *RNF-02 (Protección del documento de identidad):* El archivo de DNI se almacena en el directorio privado `/uploads/dni/`, fuera de la raíz pública de Nginx. El acceso a través de `GET /uploads/dni/:filename` requiere autenticación JWT y restringe la lectura únicamente al propio titular (`idUsuario`) o personal con rol `ADMIN`/`MODERADOR` (código 403 Forbidden para terceros).
- *RNF-03 (Cabeceras de seguridad HTTP):* El servidor web Nginx y el middleware del backend aplican políticas estrictas: CSP, COOP (_same-origin-allow-popups_), X-Content-Type-Options (_nosniff_), X-Frame-Options (_SAMEORIGIN_) y Referrer-Policy (_no-referrer_).
- *RNF-04 (Mitigación de abuso y DoS):* Límites de tasa mediante `express-rate-limit` (300 peticiones por ventana de 15 minutos en la API general; 30 peticiones por 15 minutos en endpoints de autenticación) y restricción del tamaño de payload JSON a 10 MB.

=== Rendimiento, escalabilidad y disponibilidad

- *RNF-05 (Tiempo de respuesta):* Las consultas del directorio público, agenda y mapa georreferenciado deben responder en menos de 2 segundos bajo condiciones normales de red.
- *RNF-06 (Disponibilidad 24x7):* La plataforma opera de forma continua en línea; se descarta el almacenamiento _offline_ debido a la complejidad de sincronización concurrente en formularios EAV y cierres de convocatorias con fecha límite estricta.

=== Usabilidad y diseño adaptativo

- *RNF-07 (Diseño responsive):* La interfaz de usuario debe adaptarse fluidamente a dispositivos móviles (resolución mínima 360x640 px), _tablets_ y computadoras de escritorio (resolución mínima recomendada 1366x768 px para paneles administrativos).

== Requisitos de arquitectura tecnológica y restricciones de diseño

=== Arquitectura y componentes tecnológicos

- *Frontend (Capa de Cliente):*
  - Aplicación de Página Única (SPA) construida con *React 19*, *TypeScript* y *Vite*.
  - Sistema de diseño y librería de componentes basado en *Material UI* (`@mui/material` v7, `@mui/icons-material`, `@mui/x-date-pickers`, `@toolpad/core`).
  - Cartografía interactiva con *Leaflet* y *React Leaflet*.
  - Renderizado de texto enriquecido seguro con *React Markdown* y *Remark GFM*.
  - Manipulación de fechas con *Day.js* y notificaciones visuales con *React Toastify*.
- *Backend (Capa de Servidor):*
  - API REST desarrollada en *Node.js* con *Express* y *TypeScript*.
  - Autenticación e integración con *Firebase Admin SDK*.
  - Validación de esquemas y sanitización con *Zod*.
  - Especificación formal bajo el estándar *OpenAPI 3.1.0* generada dinámicamente mediante `@asteasolutions/zod-to-openapi`.
  - Documentación interactiva moderna servida con *Scalar API Reference* (`@scalar/express-api-reference`) en la ruta `/docs`.
  - Registro estructurado de eventos con *Pino* y *Pino HTTP*.
- *Base de Datos (Capa de Persistencia):*
  - Motor relacional *MariaDB 10.x* con motor de almacenamiento *InnoDB* y modo estricto `STRICT_TRANS_TABLES`.
  - Encapsulamiento de lógica de negocio en 84 *Procedimientos Almacenados (Stored Procedures)* transaccionales con control de excepciones (`DECLARE EXIT HANDLER FOR SQLEXCEPTION`).
  - Triggers automáticos para auditoría temporal de bajas lógicas (`fechaBaja`).
- *Infraestructura y Despliegue:*
  - Servidor web y proxy inverso *Nginx*.
  - Contenedorización estándar mediante *Docker* y *Docker Compose* (`compose.yml`).

=== Transmisión y almacenamiento de archivos

- *Transmisión mediante Data URLs en Base64:* El sistema descarta el uso de middlewares multipart (como Multer). Las imágenes (DNI, fotos de perfil y portafolio) se envían codificadas en Base64 en el cuerpo JSON de las peticiones. Son validadas en el backend con Zod y expresiones regulares (MIME `image/jpeg`, `image/png`, `image/webp` con límite de hasta 7 MB por imagen) y decodificadas en buffers nativos de Node.js (`Buffer.from`) antes de su persistencia atómica en disco.
- *Nomenclatura criptográfica de archivos en disco:*
  - Fotos de perfil y portafolio (`/uploads/actores/`): Identificadores UUIDv4 aleatorios generados mediante `crypto.randomUUID()`.
  - Documentos de identidad (`/uploads/dni/`): Esquema basado en marca temporal y entropía de bytes aleatorios (`dni_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`), impidiendo nombres predecibles y permitiendo ordenamiento cronológico.

== Operación, mantenimiento y aseguramiento de la calidad

=== Diagnóstico automatizado e integridad de datos

El sistema cuenta con el procedimiento `sp_sistema_auditar_integridad`, consumible desde la vista administrativa `adminAuditoria.tsx`. Este módulo evalúa de manera periódica y preventiva:
- Integridad referencial entre usuarios, actores, integrantes y ubicaciones.
- Formularios activos sin preguntas o categorías sin formularios asignados.
- Coherencia en estados de visibilidad y coordenadas geográficas.
- Actores publicados con preguntas obligatorias incompletas.

=== Integración y despliegue continuo (CI/CD)

El repositorio cuenta con flujos automatizados en GitHub Actions:
- Validación de sintaxis y tipado estático (ESLint y `tsc --noEmit`).
- Ejecución de suites de pruebas unitarias y de integración en backend (Vitest) y frontend (React Testing Library).
- Compilación automática del informe técnico en Typst, generando documentos PDF/A con encriptación mediante QPDF y firma digital criptográfica con clave PGP/GPG.
