//#pagebreak()

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
    (
      descripcion.trim(),
      "",
    )
  } else {
    (
      partes.at(0).trim(),
      partes.slice(1).join("Resultsets:").trim(),
    )
  }
}

#let celda_resultsets(texto) = {
  let t1 = texto.replace(". RS", "\nRS")
  let t2 = t1.replace("). ", ").\n")
  t2
}

#let formatear_fila(fila) = {
  let separado = separar_resultsets(fila.at(1))

  (
    celda_sp(fila.at(0)),
    separado.at(0),
    celda_params(fila.at(2)),
    celda_resultsets(separado.at(1)),
  )
}

= Anexo: Listado de Stored Procedures

#text(size: 8pt)[

  #show table: set par(justify: false)

  #table(
    columns: (2.3fr, 3fr, 2.6fr, 3.4fr),
    stroke: 0.4pt,
    inset: 3pt,

    table.header(..encabezados_sp.map(e => strong(e))),

    ..filas.map(formatear_fila).flatten(),
  )
]
