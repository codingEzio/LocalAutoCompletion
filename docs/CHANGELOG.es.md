# Registro de cambios

## 0.5.2 — 2026-09-21

- Indicar la disponibilidad pública en el manifiesto VSIX para evitar que las cargas manuales
  permanezcan privadas.

## 0.5.1 — 2026-09-21

- Usar la identidad de publicador codingEzio en Marketplace para publicar la extensión desde la
  cuenta de Microsoft autorizada.

## 0.5.0 — 2026-09-20

- Añadir localizaciones del README y de los ajustes de la extensión en siete idiomas nuevos, con el
  inglés como idioma de reserva.
- Documentar y verificar Visual Studio Code como entorno anfitrión compatible.

## 0.4.1 — 2026-09-20

- Sustituir el derivado de uso restringido de Google Web Trillion Word Corpus por vocabulario común
  y para exámenes del snapshot revisado de ECDICT, publicado bajo la licencia MIT.
- Hacer determinista la extracción de ECDICT y protegerla con una comprobación del hash.

## 0.4.0 — 2026-09-15

- Cambiar el nombre del producto a X-LocalAutoCompletion.
- Completar palabras a partir de todo el archivo actual, no solo de las líneas cercanas.
- Incluir siempre vocabulario inglés disponible sin conexión y ordenado: primero las palabras
  comunes y después los términos adicionales de exámenes.
- Eliminar la indexación del espacio de trabajo, las opciones aprendidas, las palabras fijadas, el
  cambio entre interfaces de sugerencias, los ajustes de idioma CJK y el backend experimental de
  evaluación de rendimiento nativo.

## 0.3.2 — 2026-09-07

- Limitar la lectura del documento antes de copiar el texto y recorrer los identificadores finales
  sin volver a analizar líneas largas.
- Mantener las sugerencias en línea compatibles con la capitalización escrita y con el elemento
  seleccionado del menú de sugerencias.

## 0.3.1 — 2026-09-07

- Conservar los 250 registros aceptados más recientes para que un historial lleno pueda seguir
  aprendiendo nuevas opciones.

## 0.3.0 — 2026-09-07

- Añadir vocabulario inglés sin conexión y opcional, con términos marcados para IELTS/TOEFL/GRE.

## 0.2.1 — 2026-09-07

- Corregir la integración de los cuatro comandos del usuario en la paleta de comandos.

## 0.2.0 — 2026-09-03

- Aprendizaje e indexación explícita en el espacio de trabajo; permitir elegir de forma nativa dónde
  aparecen las sugerencias.

## 0.1.0 — 2026-09-03

- Primera versión: sugerencias de palabras a partir de documentos cercanos.
