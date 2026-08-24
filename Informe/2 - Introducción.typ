= Introducción

Este documento corresponde al informe final de la Práctica Profesional Supervisada (PPS) de la carrera de Ingeniería en Computación de la Facultad de Ciencias Exactas y Tecnología (FACET) de la Universidad Nacional de Tucumán (UNT). El proyecto consiste en el diseño, desarrollo e implementación de una plataforma web integral denominada *Mosaico Cultural*, desarrollada en articulación con las necesidades de relevamiento, visibilización y gestión cultural del Ente Cultural de Tucumán.

== Motivación y Planteamiento del Problema

El ecosistema cultural de la provincia de Tucumán se caracteriza por una amplia diversidad y riqueza en sus expresiones artísticas y tradicionales, abarcando disciplinas como la música, las artes escénicas, las artesanías, las letras, las artes visuales, los medios audiovisuales y la gestión de espacios culturales comunitarios e independientes. No obstante, históricamente este sector ha enfrentado desafíos estructurales signados por la informalidad, la fragmentación de la información y la concentración geográfica de la oferta cultural en los principales centros urbanos.

La carencia de un registro digital centralizado, dinámico y georreferenciado dificultaba tanto el conocimiento fehaciente del padrón de hacedores culturales por parte de los organismos provinciales como el acceso del público general a las manifestaciones artísticas que tienen lugar en los diversos departamentos del territorio. Asimismo, los métodos tradicionales de censo y relevamiento manual resultaban estáticos, costosos y rápidamente obsoletos frente a la dinámica cambiante de los colectivos artísticos y las iniciativas autogestionadas.

== La Solución: Plataforma Mosaico Cultural

Como respuesta a esta problemática, *Mosaico Cultural* se concibió como un ecosistema digital moderno, accesible y escalable que articula tres dimensiones fundamentales:

1. *Visibilidad Pública e Identificación Territorial:* Proporciona a la ciudadanía un mapa cultural interactivo georreferenciado y un directorio público con filtros multidimensionales (disciplina, subcategoría y departamento), permitiendo descubrir tanto a artistas individuales y agrupaciones como a espacios físicos y salas culturales en toda la provincia. Cada actor cultural dispone de un portafolio público digital donde expone sus obras, galerías fotográficas, enlaces a redes sociales y trayectoria artística.
2. *Empoderamiento y Gestión para los Hacedores Culturales:* Brinda a los artistas y gestores culturales una herramienta de autogestión donde pueden registrar sus perfiles (en calidad de individuos, colectivos o espacios), administrar integrantes registrados y no registrados, transferir la titularidad de agrupaciones, programar eventos en una agenda cultural pública con exportación directa a calendarios digitales, y postularse directamente a convocatorias y certámenes oficiales impulsados por el Ente Cultural.
3. *Herramienta Integral de Gestión y Relevamiento para el Estado Provincial:* Ofrece a los equipos técnicos y moderadores del Ente Cultural un panel administrativo con moderación descentralizada por sectores culturales, un generador dinámico de formularios bajo el patrón Entidad-Atributo-Valor (EAV) que permite adaptar los cuestionarios de registro a las especificidades de cada disciplina (desde la procedencia de materias primas artesanales hasta registros técnicos de salas teatrales), la gestión y fiscalización de actividades económicas ARCA (ex-AFIP/Rentas), y herramientas diagnósticas automatizadas para la auditoría de integridad de datos.

/* == Estructura del Documento

El presente informe se encuentra estructurado en los siguientes capítulos y secciones principales:

- *Capítulo 1 (este capítulo):* Brinda la introducción general, la justificación del proyecto, los problemas abordados y la visión global de la solución implementada.
- *Capítulo 2:* Detalla la *Especificación de Requisitos Complementarios del Software* siguiendo las directrices del estándar IEEE 830, describiendo los actores participantes, los requisitos funcionales y no funcionales, el modelo de datos relacional y EAV, las reglas de negocio, los esquemas de autenticación y seguridad, y las consideraciones arquitectónicas y de despliegue.
- *Capítulo 3 (Anexo):* Contiene el catálogo exhaustivo de los *Procedimientos Almacenados (Stored Procedures)* implementados en la base de datos MariaDB, detallando para cada uno de ellos su propósito funcional, sus parámetros de entrada y sus conjuntos de resultados (_resultsets_).
- *Capítulo 4:* Expone los términos de la licencia de uso y derechos de autor bajo *Creative Commons Atribución 4.0 Internacional (CC BY 4.0)*.

_Nota sobre la organización modular de los archivos fuente:_ En el repositorio del proyecto, los archivos fuente en Typst que componen este documento adoptan prefijos numéricos (`1 - Informe.typ` para la portada/configuración, `2 - Introducción.typ`, `3 - Especificación de requisitos...`, `4 - Anexo Listado...` y `5 - Licencia.typ`) con el fin de preservar el orden de ensamblado y compilación modular.
