# Cómo agregar un caso a InfraGuide

InfraGuide hoy publica un único caso modelo. Esta guía prepara la arquitectura para los 15 casos oficiales **sin copiar su contenido**.

## 1. Duplicar la estructura JSON

Copia `src/data/cases/caso-modelo-helados-boreal.json` a un archivo nuevo, por ejemplo `src/data/cases/caso-xx.json`.

## 2. Crear un id nuevo

El `id` debe ser estable, en kebab-case y único. Ejemplo: `caso-clinica-andina`.

No reutilices `modelo-helados-boreal`.

## 3. Definir secciones

Cada caso necesita al menos:

- `context`
- `services`
- `infrastructure`
- `operational-data`
- `incidents`
- `constraints`

Otras secciones útiles: `storage`, `backup`, `network`, `security`, `it-team`, `operations`, `governance`.

## 4. Agregar servicios

En `services`, documenta los servicios tecnológicos con criticidad, usuarios y dependencias **solo si el caso las declara**. No inventes.

## 5. Infraestructura

Lista componentes reales del caso (servidores, red, almacenamiento, perímetro). Cada dato debe poder rastrearse a una sección.

## 6. Métricas

En `operational-data` (u otra sección de operación) incluye periodos, indisponibilidad, incidentes, CPU, almacenamiento, latencia, etc., con unidades.

## 7. Incidentes

Describe incidentes con impacto y duración cuando el caso los aporta. No completes huecos.

## 8. Restricciones

Presupuesto, ventanas de cambio, personal, continuidad, cloud permitido o no, etc.

## 9. Metadata

Completa:

- `name`
- `kind` (`model` o `official` cuando existan casos oficiales)
- `kindLabel`
- `sector`
- `summary`
- `pedagogicalNote`
- `readOnly: true`

## 10. Registrar el caso en el selector

1. Importa el JSON en `src/data/cases/index.js`.
2. Agrégalo a `caseRegistry`:

```js
{
  id: nuevoCaso.id,
  name: nuevoCaso.name,
  type: nuevoCaso.kind,
  data: nuevoCaso,
}
```

3. `CaseValidator` se ejecuta al cargar. Si el JSON está corrupto, el caso se omite y el resto de la app sigue funcionando.

Consulta `docs/CASE-SCHEMA.md` para el detalle de campos.
