#pagebreak()
= Especificación de requisitos complementarios del software // (ANSI/IEEE 830)

Esta especificación tiene como objetivo analizar y documentar las necesidades funcionales que deberán ser soportadas por el sistema *Mosaico Cultural* a desarrollar. Para ello, se identificarán los requisitos que ha de satisfacer el nuevo sistema mediante entrevistas, el estudio de los problemas de las unidades afectadas y sus necesidades actuales, adoptando las directrices del estándar IEEE 830 adaptadas a una arquitectura moderna de servicios web distribuidos, tipado estricto e interfaces reactivas. Además de identificar los requisitos se deberán establecer prioridades, lo cual proporciona un punto de referencia para validar el sistema final que compruebe que se ajusta a las necesidades del usuario.

== Identificación de los usuarios participantes

Los objetivos de esta tarea son identificar a los responsables de cada una de las unidades y a los principales usuarios implicados. En la organización se identificaron los siguientes usuarios:

- *Ente cultural de Tucumán*: son los solicitantes de la página web y rectores de las políticas culturales de la provincia.
- *Grupo de administradores*: son las personas encargadas de gestionar la plataforma de cultura de forma global, gestionar el acceso de los moderadores y usuarios a la plataforma, crear o administrar las convocatorias, diseñar los formularios dinámicos y el banco de preguntas, administrar el padrón de actividades económicas ARCA y ejecutar las auditorías automatizadas de integridad del sistema.
- *Grupo de moderadores de categoría cultural (Editores)*: son los que se encargan de validar los datos de los actores culturales de una categoría y gestionar a los usuarios correspondientes a su sector. Además, son los encargados de registrar espacios y crear las convocatorias. Tienen asignada una o más categorías culturales, y su alcance de lectura, edición y aprobación se restringe estrictamente a los actores y categorías que tienen a cargo.
- *Grupo de actores culturales*: son las personas o grupo de personas con datos validados y publicados en el sitio de la plataforma. Estos actores tienen la capacidad de postularse a las convocatorias vigentes para participar en ellas y también pueden gestionar sus eventos de cartelera y su portafolio multimedia.
- *Grupo de usuarios*: son las personas registradas en el sitio, autenticadas mediante Firebase Authentication, que están en condiciones de solicitar la publicación de un actor cultural en el sitio de la plataforma.
- *Grupo de personas*: grupo que puede visualizar los datos públicos (portafolios, mapa cultural y agenda de eventos) de la plataforma sin necesidad de registrarse.

== Objetivos y alcances del sistema

El proyecto consiste en desarrollar una plataforma para recopilar, almacenar, catalogar y poner a disposición registros culturales en Tucumán. Cuenta con un mapa cultural georeferenciado que brinda a los actores culturales de la provincia, visibilidad e identificación de sus manifestaciones culturales. Cada usuario a través de una aplicación _web responsive_ puede gestionar su actor cultural y armar su portafolio. Además, el sistema debe ofrecer una apariencia conforme a los requisitos de la provincia de Tucumán.

Además debe permitir a las personas visualizar los datos públicos del sistema, consultar la agenda de eventos culturales con exportación a calendarios personales, consultar estadísticas de impacto cultural, y registrarse como usuario de la plataforma. El sistema también contempla la vinculación voluntaria con el padrón fiscal de actividades económicas ARCA para caracterizar la formalidad socioeconómica del sector, y el estricto resguardo de los datos personales conforme a la Ley N° 25.326.

== Definiciones, acrónimos y abreviaturas

- *Definiciones*:
  - *Actividad ARCA*: código oficial del clasificador de actividades económicas de la Agencia de Recaudación y Control Aduanero (ex-AFIP/Rentas Tucumán), utilizado para evaluar el impacto formal del sector.
  - *Artesanía*: son los objetos elaborados manualmente, mediante la transformación de la materia prima con ayuda de recursos instrumentales y el dominio de técnicas específicas del oficio, que expresan un criterio estético funcional con valor cultural.
  - *Artesanos/as*: son aquellos hacedores culturales que elaboran artesanías, es decir, objetos de origen utilitario que cobran significación cultural, realizados manualmente con técnicas que son transmitidas de generación en generación o con máquinas movidas con energía básicamente humana, en forma individual o colectiva. (Art. 2º Ley 8083).
  - *Convocatoria*: un llamado o invitación al cual los actores culturales de la plataforma pueden aplicar o postularse, con bases y condiciones redactadas en formato Markdown.
  - *Data URL en Base64*: esquema URI que permite incrustar archivos binarios (imágenes) directamente dentro de cadenas de texto en formato JSON.
  - *Derecho al Olvido*: mecanismo que garantiza la supresión física definitiva de los datos personales e identificatorios de un usuario y de sus archivos asociados, a su requerimiento expreso.
  - *Evento*: un suceso (ejemplo festivales o mercados calendarizados) que puede destacar un actor, actuando como el nexo entre un actor cultural y un espacio en una fecha determinada.
  - *Formulario EAV*: patrón arquitectónico (Entidad-Atributo-Valor) que permite almacenar propiedades dinámicas mediante pares clave-valor estructurados, sin alterar el esquema relacional rígido de la base de datos.
  - *Mapa georeferenciado*: es una representación cartográfica que ha sido vinculada a una ubicación real y precisa sobre la superficie terrestre mediante coordenadas geográficas.
  - *Portafolio*: recopilación organizada de evidencias, proyectos, trabajos y logros de una persona u organización. Es la cara visible y pública del actor cultural.
  - *_Web responsive_*: hacer que un sitio web sea accesible y adaptable en todos los dispositivos: _tablets_, _smartphones_, etc.

- *Abreviaturas*:
  - *ACID*: _Atomicity, Consistency, Isolation, Durability_ (propiedades de transaccionalidad de bases de datos).
  - *ARCA*: _Agencia de Recaudación y Control Aduanero_.
  - *COOP*: _Cross-Origin-Opener-Policy_.
  - *CSP*: _Content Security Policy_.
  - *EAV*: _Entity-Attribute-Value_.
  - *IEEE*: _Institute of Electrical & Electronics Engineers_.
  - *JWT*: _JSON Web Token_.
  - *REST*: _Representational State Transfer_.
  - *SPA*: _Single Page Application_.
  - *UUID*: _Universally Unique Identifier_.

== Descripción general

Esta sección ofrece una descripción general del sistema con el propósito de identificar las funciones que debe soportar, los datos asociados, las restricciones impuestas y cualquier otro factor que pueda influir en su desarrollo.

La plataforma de cultura será administrada globalmente por un equipo de administradores, quienes gestionarán a sus moderadores y les delegarán autoridad para gestionar de forma independiente los actores culturales de su respectiva categoría cultural. La asignación de al menos una categoría a un usuario estándar promueve automáticamente su rol a moderador; la revocación de todas sus categorías restablece su rol a usuario.

Los administradores tienen control total de la plataforma. Tienen la capacidad de ver datos de los usuarios, y acceder sin restricciones a todos los usuarios y actores culturales registrados. Son responsables de gestionar el acceso de los espacios e instituciones a la plataforma, asignando, modificando o retirando recursos según sea necesario.

Los administradores son los responsables de crear, modificar y eliminar categorías, subcategorías y moderadores. Los administradores definen las categorías culturales (y sus subcategorías), cada una con un nombre único y un formulario de registro dinámico. La estructura de estos formularios varía obligatoriamente según la categoría y subcategoría; por ejemplo, para registrar un artesano se requerirán datos de la rama productiva, procedencia de materia prima y técnicas, mientras que para un músico se requerirán géneros musicales y roles. El sistema soporta hasta once tipos de dato para las preguntas del formulario (texto, número, booleano, fecha, url, correo, teléfono y variantes de opción única, opción múltiple y etiquetas), reutilizables entre distintos formularios mediante un banco de preguntas. Cuando un administrador decide reformular una pregunta de un formulario activo, el sistema desactiva la anterior y la vincula con la nueva, preservando las respuestas históricas de los actores ya registrados.

Cada categoría cuenta con un nombre único, su formulario específico, y un estado (activa o dada de baja), permitiendo un borrado lógico cuando una categoría ya no se utiliza. Las categorías que tengan actores asociados no pueden ser eliminadas. Al cambiar su estado a "dado de baja", estas categorías dejarán de aparecer en la clasificación de actores. La plataforma también debe ofrecer funcionalidad para gestionar las categorías.

*Relación entre Usuarios y Actores Culturales:*
El sistema separa lógicamente la "Cuenta de Usuario" (persona física) del "Perfil de Actor Cultural" (entidad artística/productiva). Para gestionar esta versatilidad, se implementa una relación de cardinalidad _Muchos a Muchos_ (N:M). Esto permite que un mismo Usuario registrado pueda crear y/o pertenecer a múltiples Actores Culturales, y a su vez, que un Actor Cultural tipo "Agrupación" esté conformado por múltiples Usuarios. El titular de una agrupación puede invitar integrantes registrados por correo, precargar integrantes que aún no poseen cuenta (registrando nombre, apellido y rol) y transferir la titularidad del actor a otro integrante. Si una persona precargada como integrante no registrado se registra formalmente con el mismo correo, sus membresías se migran automáticamente hacia la tabla de integrantes activos, preservando la continuidad histórica del colectivo.

Cuando un usuario crea un nuevo actor cultural, este se registra con los atributos: nombre, descripción, fecha de creación, y estado. Inicialmente, el actor tiene el estado "Pendiente". Para garantizar la integridad del flujo de control y no saturar las bandejas de validación, se establece como regla de negocio que un usuario puede tener hasta cinco actores culturales pendientes de revisión de manera simultánea en los que figure como titular. Al alcanzar ese límite, podrá registrar otro cuando finalice al menos una de las revisiones.

Un moderador, al publicarlo en el sitio, cambia su estado a "Publicado" (Activo). Una vez que el usuario ya no desea que el actor cultural figure en el sitio (por ejemplo, si una agrupación musical se disuelve), puede dar de baja el actor, marcándolo con el estado "DadoDeBaja" (Inactivo). Este borrado lógico permite conservar el registro histórico y estadístico de los eventos en los que la agrupación participó; la base de datos gestiona automáticamente la fecha de baja mediante disparadores (_triggers_) al producirse el cambio de estado.

Por otro lado, en estricto cumplimiento de la Ley N° 25.326 de Protección de los Datos Personales, si una persona física solicita formalmente la eliminación de su cuenta y sus datos del sistema, la plataforma deberá realizar un borrado físico definitivo de su información identificatoria y sensible. Esta operación se ejecuta de forma transaccional: se elimina la fila del usuario, se desvinculan o eliminan los actores de su titularidad exclusiva, y se purgan del disco los archivos huérfanos asociados (foto de documento de identidad, fotos de perfil y archivos de portafolio).

=== Grupo de Personas (Público):

El público podrá realizar la búsqueda de los actores culturales publicados en el sitio filtrando por categoría, título, y departamento de la provincia. Además, podrá visualizar el portafolio público individual de los actores, agrupaciones y espacios, el cual mostrará únicamente la información artística o institucional de carácter público, resguardando datos sensibles o privados de contacto personal. También podrá consultar la agenda de eventos culturales con filtros por fecha, disciplina y departamento, exportar eventos a calendarios personales, y acceder al resumen estadístico de impacto cultural provincial (cantidad de actores activos, espacios registrados, departamentos alcanzados y categorías activas).

=== Grupo de Usuarios:

Los usuarios serán personas que tengan un correo electrónico, la posibilidad de ingresar al sitio y que estén en condiciones legales de publicar sus datos en la plataforma; que cumplan la edad mínima —fijada como regla de negocio en un mínimo de 10 años cumplidos— y que sean personas capaces bajo la ley.

Para registrarse en el sitio web, primero, los usuarios deberán crear su cuenta mediante correo/contraseña o autenticación federada con Google, gestionada íntegramente por Firebase Authentication; la base de datos no almacena contraseñas ni hashes de acceso, sino que vincula al usuario mediante su identificador externo de Firebase. Tras confirmar la titularidad de su casilla de correo, el usuario deberá completar los siguientes datos obligatorios: apellidos, nombres, CUIL, fecha de nacimiento, género y nacionalidad, además de enviar una imagen de un documento de identidad y elegir un avatar personalizado. Una actividad de Rentas/ARCA se puede agregar de manera opcional. Es importante que el usuario confirme estos datos antes de avanzar al siguiente paso de registro. La dirección de correo electrónico es obligatoria y única. La imagen del documento de identidad no se expone de forma pública: se almacena en una ruta privada y solo puede ser consultada por su titular o por un administrador o moderador en tareas de verificación, rechazándose cualquier otro pedido.

Una vez que un usuario se encuentre activo y habilitado para iniciar sesión, podrá crear sus actores culturales (completando el formulario específico de su sector y con un máximo de cinco actores pendientes de revisión), armar su portafolio, editar sus datos, integrar agrupaciones, buscar y postular a convocatorias vigentes en la plataforma, y ver los datos públicos.

Un usuario puede darse de baja por comportamiento inapropiado, contrario a las políticas de la plataforma. El usuario pendiente es aquel que está en el proceso de registro y confirmación.

=== Grupo de Moderadores:

Los moderadores (editores) son parte del _staff_ del Ente organizado por sector cultural. Una vez habilitados, pueden validar a los artistas de su categoría, registrar espacios culturales y crear las convocatorias en el sistema. Su alcance de lectura, edición, aprobación y cambio de estado se restringe estrictamente a los actores culturales y categorías que tienen asignadas. Tienen restringida la modificación de datos sensibles (como el CUIL) de los usuarios y la administración de cuentas personales ajenas fuera de su competencia disciplinaria.

=== Grupo de Administradores:

Los administradores serán personas que tengan un correo electrónico, la posibilidad de ingresar al sitio y que estén registrados como administradores. La dirección de correo electrónico es obligatoria y única.

Una vez que un administrador se encuentre activo y habilitado para iniciar sesión, podrá gestionar los usuarios, roles y vinculaciones manuales, y aceptar o rechazar las solicitudes de creación o actualización de actores culturales desde la bandeja de registros pendientes. Además, podrán ver los datos públicos y privados de la plataforma, accediendo a _dashboards_ estadísticos con el historial de eventos y convocatorias, tendrán la potestad de crear y gestionar los eventos anuales calendarizados, administrar el catálogo de actividades ARCA (incluyendo la importación masiva desde archivos oficiales), y ejecutar auditorías automatizadas que evalúan la integridad referencial del sistema, la existencia de formularios sin preguntas o categorías sin formularios definidos, y la coherencia de los estados de actores y ubicaciones.

=== Actores culturales:

Un actor cultural es la entidad lógica central de la plataforma y puede presentarse en tres naturalezas distintas:

- *Individuos*: Profesionales o hacedores particulares (ej. músicos, artesanos) que gestionan su propio perfil, su portafolio y su información artística de manera individual y unívoca con su cuenta de usuario.
- *Agrupaciones / Colectivos*: Entidades propias (ej. bandas, colectivos de producción artesanal) que poseen un nombre, género o rama productiva y un historial de eventos. Están conformadas por múltiples integrantes. El usuario que inscribe a la agrupación funge como administrador principal del perfil de la misma, y puede cargar a los demás integrantes mediante su correo. El sistema los vinculará automáticamente a la agrupación si están registrados en la plataforma.
- *Espacios Culturales*: Entidades físicas (ej. teatros, clubes, galerías, talleres) que cuentan con datos de geolocalización, dirección y tipo de espacio. Pueden ser administrados por un titular o cargados directamente por los moderadores para reflejar la realidad del sector informal.

Los actores culturales interactúan a través de Eventos (festivales o mercados calendarizados que se realizan todos los años), los cuales funcionan como el nexo que vincula a los individuos o agrupaciones con un espacio cultural en una fecha determinada. Esto permite llevar un registro histórico, visibilizar la cartelera para el público y generar las métricas de la actividad cultural en la provincia. Cada evento cuenta con exportación directa a Google Calendar y a archivos descargables en formato iCalendar.

La identidad pública de cada actor se complementa mediante un Portafolio, el cual es una recopilación dinámica de ítems multimedia. El sistema permite a los actores organizar y enlazar evidencias de su trabajo (como imágenes descriptivas o enlaces a redes y videos externos) para construir su perfil público, con un límite de negocio de hasta diez imágenes por actor. Asimismo, la reseña biográfica del actor admite texto enriquecido en formato Markdown (hasta 5.000 caracteres), permitiendo incluir enlaces, énfasis, listas y citas; este contenido se sanitiza en el servidor contra caracteres de control e invisibles antes de su publicación.

=== Identificación de alcances funcionales de usuarios


1. *Público General (Visitantes no registrados):*
  - Acceder al mapa cultural georreferenciado y explorar los puntos culturales de la provincia.
  - Consultar el directorio público de actores aplicando filtros combinados por disciplina/categoría, subcategoría, departamento y búsqueda por texto.
  - Visualizar la ficha pública y el portafolio multimedia de los actores en estado activo.
  - Consultar la agenda de eventos culturales públicos con filtros por fecha, disciplina y departamento.
  - Exportar eventos a calendarios personales.
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

3. *Grupo de Moderadores de Categoría Cultural:*
  - Visualizar la bandeja de actores culturales pertenecientes exclusivamente a las categorías o disciplinas que tienen asignadas.
  - Evaluar, aprobar (`'A'`), rechazar o dar de baja lógica (`'I'`) a los actores de su competencia territorial y disciplinaria.
  - Verificar la coherencia de las respuestas de formularios dinámicos EAV y la ubicación de espacios físicos.
//- _Restricción explícita de autorización_: Tienen estrictamente restringida la visualización y modificación de datos sensibles de los usuarios (como el CUIL o la edición de cuentas personales ajenas), circunscribiendo su autoridad a la fiscalización artística del actor.

4. *Grupo de Administradores:*
  - Supervisión global e irrestricta de todos los módulos de la plataforma.
  - Gestión integral de usuarios (activación, bloqueo de estado y consulta de perfiles administrativos).
  - Asignación y revocación transaccional de categorías a moderadores (promoción a `'MODERADOR'` y degradación a `'USUARIO'`).
  - Gestión del árbol de disciplinas (CRUD y bajas lógicas de Categorías y Subcategorías).
  - Diseño y mantenimiento de formularios dinámicos EAV y del banco reutilizable de preguntas.
  - Administración del catálogo de actividades económicas ARCA e importación masiva desde archivos F883.
  - Creación, edición, cierre y evaluación de Convocatorias Oficiales, con descarga de nóminas de postulantes y datos de contacto de responsables.
  - Ejecución del módulo de auditoría diagnóstica de integridad referencial del sistema (`sp_sistema_auditar_integridad`).

== Matriz de estados y transiciones

El ciclo de vida de las entidades del sistema se rige por estados controlados:

#figure(
  [
    #show table: set par(justify: false)
    #table(
      columns: (1.5fr, 1fr, 3fr),
      align: (center, center, left),
      table.header([*Entidad*], [*Estados Posibles*], [*Significado y Transiciones Permitidas*]),
      [Actor Cultural],
      [`'P'`, `'A'`, `'I'`],
      [
        `'P'` (Pendiente): Creado o editado por usuario, en espera de revisión.\
        `'A'` (Activo): Aprobado por moderador/admin, visible en directorio y mapa.\
        `'I'` (Inactivo): Baja lógica por titular o moderador.
      ],

      [Usuario],
      [`'P'`, `'A'`, `'I'`],
      [
        `'P'` (Pendiente): Registrado en Firebase pero sin completar verificación o perfil.\
        `'A'` (Activo): Perfil completo y habilitado para operar.\
        `'I'` (Inactivo): Cuenta bloqueada administrativamente.
      ],

      [Categoría / Subcategoría],
      [`'A'`, `'I'`],
      [
        `'A'` (Activa): Disponible para registro de actores y filtros.\
        `'I'` (Inactiva): Oculta para nuevos registros, preserva vínculos históricos.
      ],

      [Pregunta en Formulario],
      [`'A'`, `'I'`],
      [
        `'A'` (Activa): Vigente en el formulario y requerida al confirmar.\
        `'I'` (Inactiva / Reemplazada): Desactivada, preserva respuestas históricas.
      ],

      [Convocatoria],
      [Abierta / Cerrada],
      [
        Abierta: Fecha actual $<=$ `fechaCierre`, admite postulaciones.\
        Cerrada: Fecha actual $>$ `fechaCierre`, solo lectura y evaluación.
      ],
    )],
  caption: [Matriz de estados y ciclo de vida de entidades en Mosaico Cultural.],
)

== Suposiciones y dependencias

- *Suposiciones*:
  - Se asume que los requisitos descritos en este documento (gestión de actores, categorías y usuarios) serán considerados estables una vez que sean aprobados por los responsables del proyecto y el tutor. Cualquier solicitud de cambio en las especificaciones funcionales deberá ser evaluada en función de su impacto en el cronograma y deberá contar con la aprobación de las partes involucradas antes de su implementación por el equipo de desarrollo.
  - Se estudió exhaustivamente el requerimiento analítico de permitir que la plataforma opere de manera _offline_ (fuera de línea); sin embargo, esta posibilidad fue formalmente descartada debido a la alta complejidad técnica que representaba la resolución de conflictos en la sincronización de datos distribuidos —particularmente en los formularios dinámicos y en los cierres de convocatorias con fecha límite estricta—, ponderada frente a la baja proporción de usuarios objetivo dentro del territorio que carecen totalmente de conectividad a internet.
  - Se asume que inicialmente los espacios culturales serán agregados en la base de datos por los moderadores.
  - Todas las mutaciones críticas de datos (creación de actores, transacciones de formularios, cambio de roles y supresión de cuentas) se asumen ejecutadas de manera atómica mediante procedimientos almacenados con control de excepciones y bloqueos, sobre un motor de base de datos con soporte transaccional /* (InnoDB) */ en modo estricto.

- *Supuestos de la Base de Datos*:
  - _Actividad de Rentas/ARCA_: Para categorizar el impacto económico del sector, el sistema se apoya en un padrón predefinido de actividades económicas (que deberá ser gestionado por los administradores). Durante el registro, los usuarios pueden vincularse opcionalmente a un código de actividad de este padrón (si están formalmente registrados), de lo contrario, el sistema soporta que este dato permanezca nulo.
  - _Formularios Dinámicos (Patrón EAV)_: Se asume un modelo de "Entidad-Atributo-Valor" apoyado en el uso de campos JSON (`valor` en la tabla `RESPUESTASCAMPO`) para permitir que cada Categoría posea preguntas y esquemas de datos disímiles sin alterar el esquema relacional rígido. El formulario solo puede confirmarse cuando todas sus preguntas obligatorias activas han sido respondidas.
  - _Geolocalización Mandatoria_: Se asume que todo Actor debe estar invariablemente ligado a una instancia de `UBICACIONES`, haciendo de la representación geoespacial una característica estructural y no opcional. Sin embargo, puede mantenerse privada.
  - _Identificación Fiscal_: La estructura impone la obligatoriedad de un documento fiscal. Se asume procedimentalmente que, para acoger al sector cultural informal, este campo se completará con el CUIL del usuario o un valor estandarizado transitorio.
  - _Propiedad y Pertenencia_: El modelo asume que todo Actor Cultural posee un creador inicial de carácter obligatorio, determinado por el campo `esDueño` en la tabla asociativa `INTEGRANTES`, la cual gestiona al resto de los participantes de un colectivo.
  - _Tipificación Ampliada_: Dado que el enumerador de la base de datos restringe el `tipoActor` a `('INDIVIDUO', 'COLECTIVO', 'ESPACIO')`, se asume lógicamente que los "Espacios Culturales" heredarán el comportamiento de los actores.

- *Dependencias*:
  - *Servicio de Identidad y Correo Electrónico*: Para cumplir con el requisito de activación de cuentas de usuarios mediante enlace de verificación, autenticación federada y recuperación de contraseñas, el sistema depende de Firebase Authentication y de los Servicios de Identidad de Google.
  - *Servidores de Cartografía*: El sistema depende de proveedores externos de teselas geográficas (OpenStreetMap, consumidos mediante Leaflet) para la representación visual del mapa cultural.
  - *Conectividad*: Dado que es una plataforma web distribuida y se ha descartado el almacenamiento local offline, su funcionamiento depende enteramente de una conexión estable a Internet tanto en el servidor como en los clientes.

== Requisitos de usuario y tecnológicos

- *Requisitos de usuario*: Los usuarios del sistema se dividen en cuatro perfiles claros: Administradores, Moderadores, Usuarios y Personas. Las interfaces deben ser _responsive_ (adaptables), intuitivas y fáciles de navegar, permitiendo que un usuario sin conocimientos técnicos pueda registrarse y cargar su actor cultural sin necesidad de capacitación previa. Asimismo, los administradores deben poder gestionar la plataforma con una curva de aprendizaje mínima.
- *Requisitos tecnológicos*: La aplicación sigue una arquitectura Cliente/Servidor sobre Internet.
  - *Cliente*: la interfaz se implementa como una aplicación de página única (_SPA_) construida con React 19, TypeScript y Vite, utilizando Material UI como sistema de diseño y componentes, Leaflet/React Leaflet para el mapa georreferenciado, Day.js para el manejo de fechas, React Toastify para notificaciones y React Markdown con Remark GFM para el renderizado de texto enriquecido.
  - *Servidor*: la API REST se implementa en Node.js con Express y TypeScript, integrando el Firebase Admin SDK para validar la sesión del usuario, registro estructurado de eventos con Pino, y una especificación completa bajo el estándar OpenAPI con documentación interactiva accesible en una ruta dedicada del sitio.
  - *Base de datos*: motor relacional robusto que soporta sintaxis de comprobación de restricciones y tipos JSON (MariaDB/MySQL con motor InnoDB en modo estricto), dimensionado para gestionar múltiples conexiones concurrentes, con la lógica de negocio encapsulada en procedimientos almacenados transaccionales y disparadores de auditoría.
  - *Infraestructura*: servidor web y proxy inverso Nginx, con despliegue contenerizado mediante Docker y Docker Compose.
- *Disponibilidad*: La aplicación deberá operar en un régimen de 24x7 para permitir que las personas accedan a los datos públicos del sitio en todo momento.

== Requisitos de interfaces externas

- *Interfaces de usuario*: La interfaz gráfica debe cumplir estrictamente con el diseño _web responsive_, adaptándose automáticamente a la resolución del dispositivo. Esto es crítico para los usuarios, quienes accederán mayoritariamente desde dispositivos móviles en el territorio provincial, y para los administradores que podrían requerir gestionar urgencias desde tabletas o teléfonos.
- *Interfaces _hardware_*:
  - Dispositivos móviles: Pantalla táctil con resolución mínima de 360x640 píxeles.
  - Escritorio/_Laptop_: Pantalla con resolución mínima de 1366x768 píxeles (recomendado para la visualización de tablas de administración e historial de eventos), teclado y dispositivo señalizador (_mouse_/_trackpad_).
- *Interfaces software*: El sistema requiere un navegador web compatible con los estándares de HTML5, CSS3 y JavaScript (ES6+).
- *Almacenamiento y protección de archivos*: los archivos públicos (fotos de perfil y material de portafolio) se sirven desde una ruta pública con cabeceras de recursos entre orígenes habilitadas; los archivos privados (imágenes de documento de identidad) se almacenan fuera del alcance estático público y solo son accesibles mediante un endpoint autenticado, validando la titularidad o el rol administrativo de quien los solicita.

== Requisitos de rendimiento

- *Tiempo de respuesta*: Las operaciones de lectura (listado de actores, categorías, portafolios, mapa y agenda) no deberán superar los 2 a 3 segundos bajo condiciones normales de red. Las operaciones de escritura (carga de imágenes, creación de actores y vinculación de integrantes mediante validación de JSON) no deberán superar los 10 segundos, dependiendo del ancho de banda del usuario para la subida de archivos.
- *Concurrencia*: El sistema debe ser capaz de soportar múltiples personas accediendo simultáneamente a los datos públicos, así como registros masivos simultáneos durante periodos de convocatorias (festivales) o censos de relevamiento provinciales.
- *Mitigación de abuso*: se establecen límites de tasa de peticiones (más laxos para la API general y más estrictos para los endpoints de autenticación) y una restricción de tamaño máximo para el cuerpo de las peticiones JSON, de modo de evitar la saturación de memoria del servidor. Las imágenes se transmiten codificadas en Base64 dentro del cuerpo JSON —sin depender de middlewares de carga de archivos _multipart_—, validadas contra el tipo MIME permitido y un tamaño máximo por imagen, y luego persistidas de forma atómica en el sistema de archivos con nombres generados mediante identificadores criptográficamente seguros.

== Requisitos de desarrollo

El ciclo de vida adoptado es el de Prototipado Evolutivo. El desarrollo se orientará a la creación de versiones incrementales del software, permitiendo validar primero la visualización de los datos públicos y la cartografía, luego la autogestión de usuarios, actores y formularios dinámicos, y finalmente la moderación descentralizada, las convocatorias y la administración. El código debe ser modular para facilitar la incorporación de nuevas funcionalidades (como futuros sectores culturales) o cambios en la lógica de negocio sin afectar la estabilidad del sistema.

El repositorio cuenta además con un flujo de integración y despliegue continuo que ejecuta pruebas de sintaxis y tipado estático, valida los scripts de la base de datos, y compila automáticamente la documentación técnica en Typst, generando el informe final con cifrado y firma digital.

== Restricciones de diseño

- *Ajuste a estándares*: La especificación de requisitos se basa en el estándar IEEE 830. El desarrollo del código sigue estándares modernos de JavaScript/TypeScript y patrones de diseño estructurados, con una especificación formal de la API bajo el estándar OpenAPI. La base de datos obedece a normativas de modelado relacional e integridad referencial.
- *Seguridad*:
  - La gestión de credenciales de acceso no es responsabilidad del sistema: la autenticación, el almacenamiento seguro de credenciales y la autenticación federada con Google son delegadas íntegramente a Firebase Authentication, por lo que la base de datos relacional no almacena contraseñas ni hashes de acceso.
  - El acceso a los recursos de la _API_ se controla mediante la validación del token de sesión de Firebase y la emisión de _tokens_ internos (JWT), junto con _middlewares_ de validación de roles y permisos.
  - El servidor aplica cabeceras de seguridad HTTP estrictas (política de seguridad de contenido, políticas de apertura entre orígenes y de referencia, y prevención de _clickjacking_).
  - Todas las operaciones de base de datos se ejecutan mediante procedimientos almacenados con parámetros tipificados, reduciendo la superficie de ataque por inyección SQL.

- *Política de Respaldo*: Se establece una política de respaldo completo mensual de la base de datos y de los archivos alojados (volúmenes de portafolio).
- *Política de Borrado*: Se implementará una política de borrado lógico guiado por estados paramétricos (e.g., `'A'`, `'I'`, `'P'`). Por ejemplo, las categorías, eventos o agrupaciones disueltas no se eliminarán físicamente de la base de datos, sino que cambiarán su estado a "Inactivo/DadoDeBaja" para mantener la integridad histórica de las métricas culturales vinculadas, quedando la fecha de baja registrada automáticamente mediante disparadores de la base de datos. Esta política de borrado lógico convive con la política de supresión física descrita anteriormente para los datos personales de los usuarios, en cumplimiento de la Ley N° 25.326.
