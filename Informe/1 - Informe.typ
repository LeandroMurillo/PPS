#import "@preview/hydra:0.6.2": anchor, hydra
#import "@preview/grayness:0.5.0": *

#let hoy = datetime.today()
#let meses = (
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
)
#let fecha-str = (
  meses.at(hoy.month() - 1) + " de " + str(hoy.year())
)

#set text(font: "Cantarell", size: 12pt, lang: "es")

#let arkheion(
  title: "",
  abstract: none,
  keywords: (),
  authors: (),
  custom-authors: none,
  date: none,
  body,
) = {
  // Set the document's basic properties.
  set document(author: authors.map(a => a.name), title: title)
  set page(
    margin: (left: 31.7mm, right: 31.7mm, top: 25.4mm, bottom: 25.4mm),
  )
  show math.equation: set text(weight: 400)
  show math.equation: set block(spacing: 0.65em)
  set math.equation(numbering: "(1)")
  set heading(numbering: "1.1")

  // Set run-in subheadings
  show heading: it => {
    // H1 and H2
    if it.level == 1 {
      pad(
        bottom: 10pt,
        it,
      )
    } else if it.level == 2 {
      line(length: 100%, stroke: (dash: "loosely-dash-dotted", thickness: 0.5pt))
      pad(
        bottom: 8pt,
        it,
      )
    } else if it.level == 3 {
      pad(
        bottom: 8pt,
        underline(it),
      )
    } else {
      align(center)[#pad(
        bottom: 4pt,
        it,
      )]
    }
  }

  line(length: 100%, stroke: 2pt)
  // Title row.
  pad(
    bottom: 4pt,
    top: 4pt,
    align(center)[
      #block(text(weight: 500, 1.75em, title))
      #v(1em, weak: true)
    ],
  )
  line(length: 100%, stroke: 2pt)

  // Author information.
  if custom-authors != none {
    custom-authors
  } else {
    pad(
      top: 0.5em,
      x: 2em,
      {
        // Primero preparamos el diseño de CADA autor y lo guardamos en una lista
        let author-boxes = authors.map(author => align(center)[
          #grid(
            columns: 2,
            rows: 2pt,
            [*#author.name*],
          )
          #link(author.at("email", default: ""))
          #if "affiliation" in author [
            \ #author.affiliation
          ]
        ])

        // Lógica de visualización: Caso especial para 3 autores
        if authors.len() == 3 {
          // Primera fila: 2 autores
          grid(
            columns: (1fr, 1fr),
            gutter: 1em,
            author-boxes.at(0), author-boxes.at(1),
          )
          v(1em) // Espacio vertical entre filas
          // Segunda fila: 1 autor centrado
          align(center, author-boxes.at(2))
        } else {
          // Caso normal (automático para 1, 2, 4+ autores)
          grid(
            columns: (1fr,) * calc.min(3, authors.len()),
            gutter: 1em,
            ..author-boxes
          )
        }
      },
    )
  }

  // Abstract.
  if abstract != none {
    pad(
      x: 3em,
      top: 1em,
      bottom: 0.4em,
      align(center)[
        #heading(
          outlined: false,
          numbering: none,
          text(0.85em, smallcaps[Abstracto]),
        )
        #set par(justify: true)
        #set text(hyphenate: false)

        #abstract
      ],
    )
  }

  // Keywords
  if keywords.len() > 0 {
    [*_Keywords_* #h(0.3cm)] + keywords.map(str).join(" · ")
  }
  // Main body.
  set par(justify: true)
  set text(hyphenate: false)

  body
}

// Configuración de la plantilla (Arkheion modificado para datos)
#show: arkheion.with(
  title: "UNIVERSIDAD NACIONAL DE TUCUMÁN
  FACULTAD DE CIENCIAS EXACTAS Y TECNOLOGÍA
  Departamento de Electricidad, Electrónica y Computación
  Ingeniería en Computación

  Práctica Profesional Supervisada
  Mosaico Cultural",
  authors: (
    (
      name: "Leandro Murillo",
      email: "mailto:leandromurillo00@gmail.com",
      affiliation: "42221212",
    ),
    (
      name: "César Ezequiel Herrera",
      email: "mailto:cesar.ezequiel.herrera@gmail.com",
      affiliation: "38737903",
    ),
    (
      name: "Ing. Esteban Volentini",
      email: "mailto:evolentini@herrera.unt.edu.ar",
      affiliation: "",
    ),
  ),
)

#align(center)[
  #v(.5cm)
  #image("Img/EscudoUNT.jpeg", width: 42%)
  #v(.5cm)
  #fecha-str
]

// Reiniciar contador para el contenido
#counter(page).update(0)

// CORRECCIÓN DE HYDRA Y ENCABEZADOS
#set page(
  margin: (left: 31.7mm, right: 31.7mm, top: 25.4mm, bottom: 25.4mm),

  // Header corregido: Título a la izq, Autores a la derecha, Línea separadora
  header: [
    #anchor()
    #set text(size: 10pt) // Letra un poco más chica para encabezado (estético)
    Mosaico cultural
    #h(1fr)
    Murillo - Herrera
    #v(-6pt)
    #line(length: 100%, stroke: 0.5pt)
  ],

  // Footer con Hydra: Capítulo a la izq, Número a la derecha
  footer: context [
    #set text(size: 10pt)
    #line(length: 100%, stroke: 0.5pt) // Opcional: línea superior del pie
    #v(-6pt)
    // 1. Try to find a Level 2 heading (Section)
    // 2. If it's empty (none), display the Level 1 heading (Chapter)
    #{
      let section = hydra(2, use-last: true, book: false, skip-starting: true)
      if section != none {
        section
      } else {
        hydra(1, use-last: true, book: false, skip-starting: false)
      }
    }
    #h(1fr)
    #counter(page).display("1")
  ],
)

#set table(
  fill: (x, y) => if y == 0 {
    gray.lighten(40%)
  },
)

#show figure.where(kind: table): set figure(supplement: "Tabla")
#show figure.where(kind: table): set block(breakable: true)
#show figure.where(kind: table): set figure.caption(position: top)

// Reiniciamos el contador de figuras cada vez que aparece un Título de Nivel 1 (Capítulo)
#show heading.where(level: 1): it => {
  counter(figure).update(0)
  it
}

// Configuración global de las figuras
#set figure(
  // Definimos la numeración compuesta: Capítulo.Figura
  numbering: num => {
    let chapter = counter(heading).get().first()
    [#chapter.#num]
  },
  // Cambiamos la etiqueta de "Figura" a "Fig."
  supplement: "Fig.",
)

// Índice
#pagebreak()
/* #outline(
  title: "Tabla de contenido",
  depth: 2,
) */

#include "2 - Introducción.typ"
#include "3 - Especificación de requisitos complementarios del software.typ"
#include "4 - Licencia.typ"

/*
#include "Modelo de ciclo de vida y metodología de desarrollo de software.typ"
#include "Especificación C.typ"
#include "Diagrama de clases.typ"
#include "Identificación de roles, sus funciones y restricciones.typ"
#include "Guiones y escenarios.typ"
#include "Especificación D.typ"
#include "Codificación.typ"
#include "Pruebas.typ"
#include "Conclusiones.typ"
#include "Bibliografía.typ"

#pagebreak()
= Anexos

#set heading(numbering: none);

#include "Anexo Diagramas de casos de uso.typ"
#include "Anexo Descripción textual de los casos de uso y diagramas de actividad.typ"
#include "Anexo Ficha técnica de clases.typ"
#include "Anexo Diagramas de transición de escenarios.typ"
#include "Anexo Elección del lenguaje de programación.typ"
