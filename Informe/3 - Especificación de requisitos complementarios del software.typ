// #pagebreak()
= Especificación de requisitos complementarios del software // (ANSI/IEEE 830)

Esta especificación tiene como objetivo analizar y documentar las necesidades funcionales que deberán ser soportadas por el sistema a desarrollar. Para ello, se identificarán los requisitos que ha de satisfacer el nuevo sistema mediante entrevistas, el estudio de los problemas de las unidades afectadas y sus necesidades actuales. Además de identificar los requisitos se deberán establecer prioridades, lo cual proporciona un punto de referencia para validar el sistema final que compruebe que se ajusta a las necesidades del usuario.

== Identificación de los usuarios participantes

Los objetivos de esta tarea son identificar a los responsables de cada una de las unidades y a los principales usuarios implicados. En la organización se identificaron los siguientes usuarios:

- *Ente cultural de Tucumán*: son los solicitantes de la página web.
- *Grupo de administradores*: son las personas encargadas de gestionar la plataforma de cultura de forma global, gestionar el acceso de los moderadores y usuarios a la plataforma, crear o administrar las convocatorias.
- *Grupo de moderadores de categoría cultural (Editores)*: son los que se encargan de validar los datos de los actores culturales de una categoría y gestionar a los usuarios correspondientes a su sector. Además, son los encargados de registrar espacios y crear las convocatorias.
- *Grupo de actores culturales*: son las personas o grupo de personas con datos validados y publicados en el sitio de la plataforma. Estos actores tienen la capacidad de postularse a las convocatorias vigentes para participar en ellas y también pueden gestionar sus eventos de cartelera.
- *Grupo de usuarios*: son las personas registradas en el sitio que están en condiciones de solicitar la publicación de un actor cultural en el sitio de la plataforma.
- *Grupo de personas*: grupo que puede visualizar los datos públicos (portafolios) de la plataforma sin necesidad de registrarse.

== Objetivos y alcances del sistema

El proyecto consiste en desarrollar una plataforma para recopilar, almacenar, catalogar y poner a disposición registros culturales en Tucumán. Cuenta con un mapa cultural georeferenciado que brinda a los actores culturales de la provincia, visibilidad e identificación de sus manifestaciones culturales. Cada usuario a través de una aplicación _web responsive_ puede gestionar su actor cultural y armar su portafolio. Además, el sistema debe ofrecer una apariencia conforme a los requisitos de la provincia de Tucumán.

Además debe permitir a las personas visualizar los datos públicos del sistema y registrarse como usuario de la plataforma.

== Definiciones, acrónimos y abreviaturas

- *Definiciones*:
  - *Artesanía*: son los objetos elaborados manualmente, mediante la transformación de la materia prima con ayuda de recursos instrumentales y el dominio de técnicas específicas del oficio, que expresan un criterio estético funcional con valor cultural.
  - *Artesanos/as*: son aquellos hacedores culturales que elaboran artesanías, es decir, objetos de origen utilitario que cobran significación cultural, realizados manualmente con técnicas que son transmitidas de generación en generación o con máquinas movidas con energía básicamente humana, en forma individual o colectiva. (Art. 2º Ley 8083).
  - *Convocatoria*: un llamado o invitación al cual los actores culturales de la plataforma pueden aplicar o postularse.
  - *Evento*: un suceso (ejemplo festivales o mercados calendarizados) que puede destacar un actor.
  - *Mapa georeferenciado*: es una representación cartográfica que ha sido vinculada a una ubicación real y precisa sobre la superficie terrestre mediante coordenadas geográficas.
  - *Portafolio*: recopilación organizada de evidencias, proyectos, trabajos y logros de una persona u organización. Es la cara visible y pública del actor cultural.
  - *_Web responsive_*: hacer que un sitio web sea accesible y adaptable en todos los dispositivos: _tablets_, _smartphones_, etc.

- *Abreviaturas*:
  - *IEEE*: _Institute of Electrical & Electronics Engineers_

== Descripción general

Esta sección ofrece una descripción general del sistema con el propósito de identificar las funciones que debe soportar, los datos asociados, las restricciones impuestas y cualquier otro factor que pueda influir en su desarrollo.

La plataforma de cultura será administrada globalmente por un equipo de administradores, quienes gestionarán a sus moderadores y les delegarán autoridad para gestionar de forma independiente los actores culturales de su respectiva categoría cultural.

Los administradores tienen control total de la plataforma. Tienen la capacidad de cargar datos de los usuarios, y acceder sin restricciones a todos los usuarios y actores culturales registrados. Son responsables de gestionar el acceso de los espacios e instituciones a la plataforma, asignando, modificando o retirando recursos según sea necesario. // Cada espacio o categoría se registra con un nombre único y un estado de actividad (activa o inactiva).

Los administradores son los responsables de crear, modificar y eliminar categorías, subcategorías y moderadores. Los administradores definen las categorías culturales (y sus subcategorías), cada una con un nombre único y un formulario de registro dinámico. La estructura de estos formularios varía obligatoriamente según la categoría y subcategoría; por ejemplo, para registrar un artesano se requerirán datos de la rama productiva, procedencia de materia prima y técnicas, mientras que para un músico se requerirán géneros musicales y roles.

Cada categoría cuenta con un nombre único, su formulario específico, y un estado (activa o dada de baja), permitiendo un borrado lógico cuando una categoría ya no se utiliza. Las categorías que tengan actores asociados no pueden ser eliminadas. Al cambiar su estado a "dado de baja", estas categorías dejarán de aparecer en la clasificación de actores. La plataforma también debe ofrecer funcionalidad para gestionar las categorías.

*Relación entre Usuarios y Actores Culturales:*
El sistema separa lógicamente la "Cuenta de Usuario" (persona física) del "Perfil de Actor Cultural" (entidad artística/productiva). Para gestionar esta versatilidad, se implementa una relación de cardinalidad _Muchos a Muchos_ (N:M). Esto permite que un mismo Usuario registrado pueda crear y/o pertenecer a múltiples Actores Culturales, y a su vez, que un Actor Cultural tipo "Agrupación" esté conformado por múltiples Usuarios.

Cuando un usuario crea un nuevo actor cultural, este se registra con los atributos: nombre, descripción, fecha de creación, y estado. Inicialmente, el actor tiene el estado "Pendiente". Para garantizar la integridad del flujo de control y no saturar las bandejas de validación, se establece como regla de negocio que un usuario puede tener hasta cinco actores culturales pendientes de revisión de manera simultánea. Al alcanzar ese límite, podrá registrar otro cuando finalice al menos una de las revisiones.

Un moderador, al publicarlo en el sitio, cambia su estado a "Publicado". Una vez que el usuario ya no desea que el actor cultural figure en el sitio (por ejemplo, si una agrupación musical se disuelve), puede dar de baja el actor, marcándolo con el estado "DadoDeBaja". Este borrado lógico permite conservar el registro histórico y estadístico de los eventos en los que la agrupación participó.

Por otro lado, en estricto cumplimiento de la Ley N° 25.326 de Protección de los Datos Personales, si una persona física solicita formalmente la eliminación de su cuenta y sus datos del sistema, la plataforma deberá realizar un borrado físico definitivo de su información identificatoria y sensible.

=== Grupo de Personas (Público):

El público podrá realizar la búsqueda de los actores culturales publicados en el sitio filtrando por categoría, título, y departamento de la provincia. Además, podrá visualizar el portafolio público individual de los actores, agrupaciones y espacios, el cual mostrará únicamente la información artística o institucional de carácter público, resguardando datos sensibles o privados de contacto personal.

=== Grupo de Usuarios:

Los usuarios serán personas que tengan un correo electrónico, la posibilidad de ingresar al sitio y que estén en condiciones legales de publicar sus datos en la plataforma; que cumplan la edad legal mínima y que sean personas capaces bajo la ley.

Para registrarse en el sitio web, primero, los usuarios deberán completar los siguientes datos obligatorios: correo electrónico, contraseña, apellidos, nombres, CUIL, fecha de nacimiento y género, además, deberán enviar una imagen de un documento de identidad. Una actividad de Rentas/ARCA se puede agregar de manera opcional. Es importante que el usuario confirme estos datos antes de avanzar al siguiente paso de registro. La dirección de correo electrónico es obligatoria y única. La contraseña deberá tener una longitud mínima de 6 caracteres. Finalmente, se le enviará un correo electrónico a la dirección provista para activar la cuenta de usuario.

Una vez que un usuario se encuentre activo y habilitado para iniciar sesión, podrá crear sus actores culturales (completando el formulario específico de su sector y con un máximo de cinco actores pendientes de revisión), armar su portafolio, editar sus datos, integrar agrupaciones, buscar y postular a convocatorias vigentes en la plataforma, y ver los datos públicos.

Un usuario puede darse de baja por comportamiento inapropiado, contrario a las políticas de la plataforma. El usuario pendiente es aquel que está en el proceso de registro y confirmación.

=== Grupo de Moderadores:

Los moderadores (editores) son parte del _staff_ del Ente organizado por sector cultural. Una vez habilitados, pueden validar a los artistas de su categoría, registrar espacios culturales y crear las convocatorias en el sistema. Tienen restringida la modificación de datos sensibles (como el CUIL) de los usuarios.

=== Grupo de Administradores:

Los administradores serán personas que tengan un correo electrónico, la posibilidad de ingresar al sitio y que estén registrados como administradores. La dirección de correo electrónico es obligatoria y única. La contraseña deberá tener una longitud mínima de 6 caracteres.

Una vez que un administrador se encuentre activo y habilitado para iniciar sesión, podrá gestionar los usuarios, roles y vinculaciones manuales, y aceptar o rechazar las solicitudes de creación o actualización de actores culturales desde la bandeja de registros pendientes. Además, podrán ver los datos públicos y privados de la plataforma, accediendo a _dashboards_ estadísticos con el historial de eventos y convocatorias, y tendrán la potestad de crear y gestionar los eventos anuales calendarizados.

=== Actores culturales:

Un actor cultural es la entidad lógica central de la plataforma y puede presentarse en tres naturalezas distintas:

- *Individuos*: Profesionales o hacedores particulares (ej. músicos, artesanos) que gestionan su propio perfil, su portafolio y su información artística de manera individual y unívoca con su cuenta de usuario.
- *Agrupaciones / Colectivos*: Entidades propias (ej. bandas, colectivos de producción artesanal) que poseen un nombre, género o rama productiva y un historial de eventos. Están conformadas por múltiples integrantes. El usuario que inscribe a la agrupación funge como administrador principal del perfil de la misma, y puede cargar a los demás integrantes mediante CUIL o correo. El sistema los vinculará automáticamente a la agrupación si están registrados en la plataforma. //, o les enviará una invitación de registro si aún no lo están.
- *Espacios Culturales*: Entidades físicas (ej. teatros, clubes, galerías, talleres) que cuentan con datos de geolocalización, dirección y tipo de espacio. Pueden ser administrados por un titular o cargados directamente por los moderadores para reflejar la realidad del sector informal.

Los actores culturales interactúan a través de Eventos (festivales o mercados calendarizados que se realizan todos los años), los cuales funcionan como el nexo que vincula a los individuos o agrupaciones con un espacio cultural en una fecha determinada. Esto permite llevar un registro histórico, visibilizar la cartelera para el público y generar las métricas de la actividad cultural en la provincia.

La identidad pública de cada actor se complementa mediante un Portafolio, el cual es una recopilación dinámica de ítems multimedia. El sistema permite a los actores organizar y enlazar evidencias de su trabajo (como imágenes descriptivas o enlaces a redes y videos externos) para construir su perfil público.

== Suposiciones y dependencias

- *Suposiciones*:
  - Se asume que los requisitos descritos en este documento (gestión de actores, categorías y usuarios) serán considerados estables una vez que sean aprobados por los responsables del proyecto y el tutor. Cualquier solicitud de cambio en las especificaciones funcionales deberá ser evaluada en función de su impacto en el cronograma y deberá contar con la aprobación de las partes involucradas antes de su implementación por el equipo de desarrollo.
  - Se estudió exhaustivamente el requerimiento analítico de permitir que la plataforma opere de manera offline (fuera de línea); sin embargo, esta posibilidad fue formalmente descartada debido a la alta complejidad técnica que representaba la resolución de conflictos en la sincronización de datos distribuidos, ponderada frente a la baja proporción de usuarios objetivo dentro del territorio que carecen totalmente de conectividad a internet.
  - Se asume que inicialmente los espacios culturales serán  agregados en la base de datos por los moderadores.

- *Supuestos de la Base de Datos*:
  - _Actividad de Rentas/ARCA_: Para categorizar el impacto económico del sector, el sistema se apoya en un padrón predefinido de actividades económicas (que deberá ser gestionado por los administradores). Durante el registro, los usuarios pueden vincularse opcionalmente a un código de actividad de este padrón (si están formalmente registrados), de lo contrario, el sistema soporta que este dato permanezca nulo.
  - _Formularios Dinámicos (Patrón EAV)_: Se asume un modelo de "Entidad-Atributo-Valor" apoyado en el uso de campos JSON (`valor` en la tabla `RESPUESTASCAMPO`) para permitir que cada Categoría posea preguntas y esquemas de datos disímiles sin alterar el esquema relacional rígido.
  - _Geolocalización Mandatoria_: Se asume que todo Actor /*y todo Evento*/ debe estar invariablemente ligado a una instancia de `UBICACIONES`, haciendo de la representación geoespacial una característica estructural y no opcional.
  - _Identificación Fiscal_: La estructura impone la obligatoriedad de un documento fiscal (`CUIT CHAR(11) NOT NULL`). Se asume procedimentalmente que, para acoger al sector cultural informal, este campo se completará con el CUIL del usuario o un valor estandarizado transitorio.
  - _Propiedad y Pertenencia_: El modelo asume que todo Actor Cultural posee un creador inicial de carácter obligatorio, determinado por el campo `esDueño` en la tabla asociativa `INTEGRANTES`, la cual gestiona al resto de los participantes de un colectivo.
  - _Tipificación Ampliada_: Dado que el enumerador de la base de datos restringe el `tipoActor` a `('INDIVIDUO', 'COLECTIVO', 'ESPACIO')`, se asume lógicamente que los "Espacios Culturales" heredarán el comportamiento de los actores.

- *Dependencias*:
  - *Servicio de Correo Electrónico*: Para cumplir con el requisito de activación de cuentas de usuarios mediante enlace de verificación, el sistema requiere acceso a un servidor SMTP o servicio de envío de correos transaccionales.
  - *Conectividad*: Dado que es una plataforma web distribuida y se ha descartado el almacenamiento local offline, su funcionamiento depende enteramente de una conexión estable a Internet tanto en el servidor como en los clientes.

== Requisitos de usuario y tecnológicos

- *Requisitos de usuario*: Los usuarios del sistema se dividen en cuatro perfiles claros: Administradores, Moderadores, Usuarios y Personas. Las interfaces deben ser _responsive_ (adaptables), intuitivas y fáciles de navegar, permitiendo que un usuario sin conocimientos técnicos pueda registrarse y cargar su actor cultural sin necesidad de capacitación previa. Asimismo, los administradores deben poder gestionar la plataforma con una curva de aprendizaje mínima.
- *Requisitos tecnológicos*: La aplicación seguirá una arquitectura Cliente/Servidor sobre Internet.
  - *Servidor*: Deberá estar configurado para soportar el entorno de ejecución NodeJS y un motor de base de datos relacional robusto (que soporte sintaxis de comprobación de restricciones y tipos JSON, como MySQL 8.x o PostgreSQL), dimensionado para gestionar múltiples conexiones concurrentes.
  - *Cliente*: La interfaz de usuario se ejecutará en el navegador web del cliente (Chrome, Firefox, Edge, Safari), comunicándose con el servidor mediante peticiones HTTP asíncronas (API REST).
- *Disponibilidad*: La aplicación deberá operar en un régimen de 24x7 para permitir que las personas accedan a los datos públicos del sitio en todo momento.

== Requisitos de interfaces externas

- *Interfaces de usuario*: La interfaz gráfica debe cumplir estrictamente con el diseño _web responsive_, adaptándose automáticamente a la resolución del dispositivo. Esto es crítico para los usuarios, quienes accederán mayoritariamente desde dispositivos móviles en el territorio provincial, y para los administradores que podrían requerir gestionar urgencias desde tabletas o teléfonos.
- *Interfaces _hardware_*:
  - Dispositivos móviles: Pantalla táctil con resolución mínima de 360x640 píxeles.
  - Escritorio/_Laptop_: Pantalla con resolución mínima de 1366x768 píxeles (recomendado para la visualización de tablas de administración e historial de eventos), teclado y dispositivo señalizador (_mouse_/_trackpad_).

- *Interfaces software*: El sistema requiere un navegador web compatible con los estándares de HTML5, CSS3 y JavaScript (ES6+).

== Requisitos de rendimiento

- *Tiempo de respuesta*: Las operaciones de lectura (listado de actores, categorías, portafolios) no deberán superar los 3 segundos bajo condiciones normales de red. Las operaciones de escritura (carga de imágenes, creación de actores y vinculación de integrantes mediante validación de JSON) no deberán superar los 10 segundos, dependiendo del ancho de banda del usuario para la subida de archivos.
- *Concurrencia*: El sistema debe ser capaz de soportar múltiples personas accediendo simultáneamente a los datos públicos, así como registros masivos simultáneos durante periodos de convocatorias (festivales) o censos de relevamiento provinciales.

== Requisitos de desarrollo

El ciclo de vida adoptado es el de Prototipado Evolutivo. El desarrollo se orientará a la creación de versiones incrementales del software, permitiendo validar primero la visualización de los datos públicos, luego la gestión de usuarios y actores y finalmente la administración. El código debe ser modular para facilitar la incorporación de nuevas funcionalidades (como futuros sectores culturales) o cambios en la lógica de negocio sin afectar la estabilidad del sistema.

== Restricciones de diseño

- *Ajuste a estándares*: La especificación de requisitos se basa en el estándar IEEE 830. El desarrollo del código sigue estándares modernos de JavaScript y patrones de diseño estructurados (como MVC/MTV). La base de datos obedece a normativas de modelado relacional e integridad referencial. // (`STRICT_TRANS_TABLES`).
- *Seguridad*:
  - Las contraseñas se almacenarán encriptadas utilizando algoritmos de _hash_ robustos nativos (Bcrypt/SHA-256).
  - El acceso a los recursos de la _API_ se controlará mediante _tokens_ de sesión (JWT) y _middlewares_ de validación de roles y permisos.

- *Política de Respaldo*: Se establece una política de respaldo completo mensual de la base de datos y de los archivos cenados (volúmenes de portafolio). //, complementada con respaldos incrementales diarios.
- *Política de Borrado*: Se implementará una política de borrado lógico guiado por estados paramétricos (e.g., `'A'`, `'I'`, `'P'`). Por ejemplo, las categorías, eventos o agrupaciones disueltas no se eliminarán físicamente de la base de datos, sino que cambiarán su estado a "Inactivo/DadoDeBaja" para mantener la integridad histórica de las métricas culturales vinculadas.
