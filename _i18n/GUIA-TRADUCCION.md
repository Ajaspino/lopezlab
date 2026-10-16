# Guía de traducción (Lopezlab) — ES / GL / NL

Contexto: Lopezlab es un estudio de comunicación estratégica y diseño en Ámsterdam (dirigido por Mariola López Mariño). Se traducen los textos de su web del inglés al español (España), gallego (normativa RAG, gallego real, no español adaptado) y neerlandés (Países Bajos). Es un BORRADOR que revisará Mariola.

## Reglas de forma (obligatorias)
1. Entrada: un JSON `{ "s0001": "texto en inglés", ... }`. Salida: un JSON con **exactamente las mismas claves** y el valor traducido. Nada de claves nuevas ni omitidas. JSON válido (escapa comillas dobles con \").
2. Conserva **tal cual** todas las etiquetas HTML y entidades: `<strong>`, `<em>`, `<br/>`, `<a href="...">`, `&amp;`, `&nbsp;`… Traduce solo el texto entre ellas. Mantén `<strong>` alrededor de la traducción equivalente de lo que estaba resaltado.
3. Listas escritas con guion: `– punto uno<br/>– punto dos`. Mantén el guion largo `– ` al principio de cada ítem y el separador `<br/>` exactamente igual.
4. Mantén el número de frases y el ritmo: no añadas, quites ni reordenes ideas. Sin florituras: el estilo original es profesional, directo y cercano, frases claras y activas.
5. Conserva mayúsculas/minúsculas del original cuando es un rótulo (p. ej. `WHO WE WORK WITH` va en mayúsculas).
6. Comillas y puntuación: usa las del idioma de destino de forma coherente (en español y gallego «…» o “…”; en neerlandés “…” o ‘…’). Respeta los puntos suspensivos y signos de interrogación del idioma (¿…?).

## Lo que NO se traduce
- `Lopezlab`, `PitchLab`, nombres de personas, de clientes y organizaciones (Politie Amsterdam, a.s.r., Cancer Centre Amsterdam, College van Rijksadviseurs, Kloosterplaats, Alizent, Uxua, Esero, Ferring, Xolvio, Arriva, Amstel, etc.).
- Títulos de proyectos o piezas que son nombres propios (p. ej. «Until It Becomes What It Must Be (Tot het is wat het moet zijn)», «Naar een ontspannen Nederland», «Herman»). Si el nombre propio va seguido de una explicación descriptiva, traduce solo la descripción.
- Texto ya en neerlandés u otro idioma dentro del original: se queda.
- Cifras, años y direcciones.

## Tratamiento
- Voz institucional: primera persona del plural («we» → «nosotros / nós / wij» implícito según el idioma). En «Clarity is a strategy» el autor habla en primera persona del singular («I»): mantenla.
- Español: tuteo («no dudes en escribirnos»). Gallego: «non dubides en escribirnos». Neerlandés: «je/jouw» (tono cercano, profesional).

## Glosario (usa SIEMPRE estas equivalencias para mantener coherencia)
| English | Español | Galego | Nederlands |
|---|---|---|---|
| strategic communication | comunicación estratégica | comunicación estratéxica | strategische communicatie |
| visual strategy | estrategia visual | estratexia visual | visuele strategie |
| brand identity | identidad de marca | identidade de marca | merkidentiteit |
| storytelling | storytelling | storytelling | storytelling |
| narrative | narrativa | narrativa | verhaal / narratief |
| stakeholders | partes interesadas | partes interesadas | stakeholders |
| stakeholder alignment | alineación de las partes interesadas | aliñamento das partes interesadas | afstemming met stakeholders |
| pitch / pitch deck | pitch / pitch deck | pitch / pitch deck | pitch / pitchdeck |
| funding | financiación | financiamento | financiering |
| sustainability | sostenibilidad | sustentabilidade | duurzaamheid |
| Green & Sustainability | Verde y sostenibilidad | Verde e sustentabilidade | Groen & duurzaamheid |
| Health & Care | Salud y cuidados | Saúde e coidados | Gezondheid & zorg |
| Brands & Corporate | Marcas y corporativo | Marcas e corporativo | Merken & corporate |
| Culture & Society | Cultura y sociedad | Cultura e sociedade | Cultuur & samenleving |
| Public Institutions & Policy | Instituciones públicas y políticas públicas | Institucións públicas e políticas públicas | Publieke instellingen & beleid |
| Design | Diseño | Deseño | Design |
| Strategic Communication (categoría) | Comunicación estratégica | Comunicación estratéxica | Strategische communicatie |
| Stakeholder Alignment (categoría) | Alineación de partes interesadas | Aliñamento das partes interesadas | Afstemming met stakeholders |
| Our method | Nuestro método | O noso método | Onze methode |
| Work (menú) | Proyectos | Proxectos | Werk |
| About (menú) | Nosotros | Nós | Over ons |
| Contact | Contacto | Contacto | Contact |
| Read post | Leer artículo | Ler artigo | Lees het artikel |
| Explore our method | Descubre nuestro método | Descubre o noso método | Ontdek onze methode |
| WHO WE WORK WITH | CON QUIÉN TRABAJAMOS | CON QUEN TRABALLAMOS | MET WIE WE WERKEN |
| Clear stories for complex ideas. | Historias claras para ideas complejas. | Historias claras para ideas complexas. | Heldere verhalen voor complexe ideeën. |
| PITCHING & STRATEGIC COMMUNICATION | PITCHING Y COMUNICACIÓN ESTRATÉGICA | PITCHING E COMUNICACIÓN ESTRATÉXICA | PITCHING & STRATEGISCHE COMMUNICATIE |
| Brand Identity (etiqueta) | Identidad de marca | Identidade de marca | Merkidentiteit |
| Editorial (etiqueta) | Editorial | Editorial | Redactioneel / Editorial (usa «Editorial») |

Si una cadena es una etiqueta de disciplina («Narrative strategy», «Editorial design», «Corporate communication»…), tradúcela con naturalidad usando el glosario. Si es el nombre de un cliente u organización, déjala igual.

Cuando dudes de un término, elige la opción más habitual en el sector del diseño y la comunicación y mantén la misma en todo el archivo.
