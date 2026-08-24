= Anexo: Listado de procedimientos almacenados

Toda la lógica de persistencia, reglas de validación de negocio, control de concurrencia y mutaciones de datos del sistema *Mosaico Cultural* se encuentran estrictamente encapsuladas en la base de datos MariaDB mediante *Procedimientos Almacenados (Stored Procedures)*.

Esta decisión de diseño arquitectónico proporciona los siguientes beneficios clave:
1. *Seguridad e Inmunidad frente a Inyección SQL:* El backend se comunica con la base de datos invocando exclusivamente llamadas parametrizadas (`CALL sp_nombre(...)`), garantizando la separación total entre código ejecutable y datos de usuario.
2. *Integridad Transaccional y Atomicidad (ACID):* Las operaciones compuestas (como la creación de actores con su ubicación e integrante titular, la asignación transaccional de categorías a moderadores o la supresión física de cuentas con recolección de archivos huérfanos) se ejecutan dentro de bloques `START TRANSACTION` / `COMMIT` con manejadores de excepciones `DECLARE EXIT HANDLER FOR SQLEXCEPTION` que aseguran el `ROLLBACK` automático ante cualquier fallo.
3. *Consistencia y Control de Concurrencia:* Se aplican bloqueos pesimistas (`FOR UPDATE`) en comprobaciones críticas (por ejemplo, validación de existencia de usuarios y recuento del límite de actores pendientes).
4. *Validación Estricta de Esquemas Dinámicos:* Los procedimientos almacenados validan internamente la coherencia de las estructuras JSON correspondientes a opciones y respuestas de preguntas en los formularios EAV.

A continuación, se presenta el catálogo completo de los procedimientos almacenados implementados en el esquema `cultura`, generado automáticamente a partir del código fuente SQL:

#text(size: 8pt)[

  #show table: set par(justify: false)

  #let listado_sp = csv("listado_sp.tsv", delimiter: "\t")
  #let filas = listado_sp.slice(1)
  #let encabezados_sp = (
    "Stored procedure",
    "Descripción",
    "Parámetros de entrada",
    "Resultsets",
  )

  #let corte_invisible = "\u{200b}"
  #let celda_sp(nombre) = raw(nombre.replace("_", "_" + corte_invisible))
  #let celda_params(params) = raw(params.replace(" | ", "\n"))

  #let separar_resultsets(descripcion) = {
    let partes = descripcion.split("Resultsets:")
    if partes.len() == 1 {
      (descripcion.trim(), "")
    } else {
      (partes.at(0).trim(), partes.slice(1).join("Resultsets:").trim())
    }
  }

  #let celda_resultsets(texto) = {
    let t1 = texto.replace(". RS", "\nRS")
    let t2 = t1.replace("). ", ").\n")
    t2
  }

  #let formatear_fila(fila) = {
    let separado = separar_resultsets(fila.at(1))
    let descripcion = if fila.len() > 3 { fila.at(1) } else { separado.at(0) }
    let resultsets = if fila.len() > 3 { fila.at(3) } else { separado.at(1) }

    (
      celda_sp(fila.at(0)),
      descripcion,
      celda_params(fila.at(2)),
      celda_resultsets(resultsets),
    )
  }

  #table(
    columns: (2.3fr, 3fr, 2.6fr, 3.4fr),
    stroke: 0.4pt,
    inset: 3pt,
    table.header(..encabezados_sp.map(e => strong(e))),
    ..filas.map(formatear_fila).flatten(),
  )
]
