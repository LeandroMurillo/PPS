#pagebreak()

#let listado_sp = csv("listado_sp.tsv", delimiter: "\t")

#let filas = listado_sp.slice(1)

#let encabezados_sp = (
  "Stored procedure",
  "Descripción",
  "Parámetros de entrada",
)

#let celda_sp(nombre) = raw(nombre)

#let celda_params(params) = raw(params.replace(" | ", "\n"))

#let formatear_fila(fila) = (
  celda_sp(fila.at(0)),
  fila.at(1),
  celda_params(fila.at(2)),
)


== Anexo: Listado de Stored Procedures

#text(size: 8pt)[
  #table(
    columns: (2.6fr, 3.2fr, 3fr),
    stroke: 0.4pt,
    inset: 3pt,

    table.header(..encabezados_sp.map(e => strong(e))),

    ..filas.map(formatear_fila).flatten(),
  )
]
