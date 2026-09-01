# Esquema JSON de un caso InfraGuide

El caso es un objeto JSON de solo lectura. InfraGuide no lo edita; el estudiante identifica datos y construye el análisis.

Esquema formal opcional: `src/data/cases/case.schema.json`.

## Raíz

| Campo | Obligatorio | Descripción |
| --- | --- | --- |
| `id` | sí | Identificador estable (`modelo-helados-boreal`). |
| `name` | sí | Nombre visible. |
| `kind` | sí | `model` u otro tipo pedagógico. |
| `kindLabel` | no | Etiqueta para el selector. |
| `sector` | no | Sector de la organización. |
| `organizationType` | no | Tipo de organización. |
| `summary` | no | Resumen corto. |
| `pedagogicalNote` | no | Nota de uso académico. |
| `readOnly` | no | Debe permanecer en `true`. |
| `useButtonLabel` | no | Texto del botón de selección. |
| `sections` | sí | Lista de secciones del caso. |

## Sección

| Campo | Descripción |
| --- | --- |
| `sectionId` | Id usado por el visor y por `sourceSectionId` en el mapa de datos. |
| `sectionTitle` | Título. |
| `index` | Orden. |
| `groupId` | Agrupación pedagógica. |
| `summary` | Para qué sirve la sección. |
| `blocks` | Bloques de campos o registros. |

## Bloques y campos

Un bloque puede tener `fields` (pares etiqueta/valor) o `records` (filas con `title` + `fields`).

Cada campo típico:

- `key` — clave única en el caso (p. ej. `periodHours`).
- `label`
- `value` — número o texto. No inventar si falta.
- `unit`
- `qualifier` — p. ej. “aproximadamente”.
- `displayValue` — forma ya redactada.
- `usable` — si el estudiante puede llevarlo a “Mis datos”.

## Secciones críticas

`CaseValidator` exige: `context`, `services`, `infrastructure`, `operational-data`, `incidents`, `constraints`.

## Relación con el análisis

El mapa metodológico (`src/data/methodology/data-map.js`) apunta a `sourceSectionId` y a `key`. Si cambias ids de sección, actualiza ese mapa.

InfraGuide no rellena el documento desde el JSON de forma automática: el estudiante extrae, calcula e interpreta.
