# InfraGuide

Constructor guiado de análisis de infraestructura TI para la asignatura **Gestión de la Infraestructura**.

Aplicación web estática: se ejecuta por completo en el navegador. No requiere backend, base de datos, API keys ni servicios externos.

Versión: **1.1.0**

## Objetivo

Acompañar al estudiante para que construya un análisis metodológico a partir de un caso: identificar datos, calcular con fórmula y fuente, diagnosticar con evidencia, gobernar (ITIL / COBIT / ISO 27001), decidir con CAPEX/OPEX y métricas, ensamblar el documento y exportarlo.

InfraGuide no resuelve el caso ni inventa información faltante.

## Metodología

Trabajo con cada dato:

**BUSCAR → EXTRAER → PROCESAR → INTERPRETAR → REDACTAR**

Argumentación de hallazgos y decisiones:

**PROBLEMA → EVIDENCIA → IMPACTO → DECISIÓN → MÉTRICA**

## Tecnologías

- HTML, CSS y JavaScript ES modules
- [Vite](https://vitejs.dev/) 8
- Persistencia en `localStorage`
- Exportación Word con [`docx`](https://www.npmjs.com/package/docx) 9.7.1 (se carga al entrar a Exportar)
- Hash routing (compatible con GitHub Pages)
- Visor PDF con [PDF.js](https://mozilla.github.io/pdf.js/) (`pdfjs-dist`)

## Documento fuente

El caso Helados Boreal debe leerse desde el PDF original:

`public/cases/helados-boreal/caso-helados-boreal.pdf`

Si ese archivo es un marcador de posición, reemplace por el PDF académico y no marque evidencias como verificadas hasta contrastar cada página.

## Instalación

Requisito: **Node.js 20** (LTS). Ver `.nvmrc`.

```bash
npm ci
```

Si no existe `package-lock.json` en un clon incompleto, usa `npm install`.

## Desarrollo

```bash
npm run dev
```

Queda en http://localhost:5173/ (`base: /`).

En desarrollo, `VITE_DEBUG_MODE=true` habilita **Cargar demostración completa** en Ayuda. Esa acción no aparece en producción.

## Build

```bash
npm run build
npm run preview
```

Los archivos publicados salen en `dist/`. El preview de producción usa `base: /infraguide/` (http://localhost:4173/infraguide/).

## GitHub Pages

El sitio está pensado para:

`https://<usuario>.github.io/infraguide/`

El base path de producción se centraliza en `.env.production` (`VITE_PAGES_BASE=/infraguide/`). Si el repositorio tiene otro nombre, cambia solo ese valor.

Despliegue: GitHub Actions (`.github/workflows/deploy.yml`), Node 20, `npm ci`, `npm run build`.

Procedimiento en GitHub: **Settings → Pages → Source: GitHub Actions**. Detalle en `docs/GITHUB-PAGES.md`.

No se hace push automático desde el entorno de desarrollo.

## Estructura del proyecto

```
src/
  app.js                 Arranque y eventos
  config.js              Versión, debug, claves de persistencia
  data/cases/            Casos JSON + caseRegistry + CaseValidator
  data/document/         Esquema de “Tu documento”
  data/methodology/      Fichas y catálogos pedagógicos
  export/                HTML, DOCX, impresión
  pages/                 Pantallas por etapa
  runtime/               Health check y pantalla de error
  state/                 Estado, persistencia, acciones
  utils/router.js        Hash routing
docs/                    Casos, esquema, QA, Pages
```

## Persistencia

El progreso se guarda en este navegador (`infraguide_state`) con copia anterior (`infraguide_state_backup`) y hasta 3 puntos de recuperación.

No hay backend, cuentas ni sincronización en la nube. Puedes **guardar tu progreso** como JSON (`InfraGuide_Helados_Boreal_Progreso.json`) y cargarlo en otro computador.

Eso no es lo mismo que **exportar el documento** (HTML, Word o PDF).

Detalle del formato: [docs/STATE-SCHEMA.md](docs/STATE-SCHEMA.md).

En **Progreso** puedes ver el estado, descargar o cargar una copia, restaurar el backup y reiniciar el trabajo local.

## Exportación

Con el documento en **LISTO PARA EXPORTAR**:

- HTML independiente (abre offline)
- Word `.docx` generado en el navegador
- Vista imprimible / Guardar como PDF (`window.print`, CSS A4)

Modos limpio y académico. Sin envío a correo, Drive ni Moodle.

## Agregar nuevos casos

Ver `docs/ADDING-CASES.md` y `docs/CASE-SCHEMA.md`.

Hoy solo está registrado el caso modelo **Helados Boreal S.A.S.** No se cargan los 15 casos oficiales en esta versión.

## Limitaciones

- Un caso modelo; los oficiales se incorporarán después.
- El PDF no se genera con una librería: se usa la impresión del navegador.
- El diagrama AS-IS en Word se exporta como flujo de nodos y tabla, no como imagen vectorial embebida.
- Licencia del repositorio: **pendiente de confirmación** (no se asumió MIT).
- No hay PWA ni service worker.

## Pruebas

- Recorrido de etapas: `docs/QA-CHECKLIST.md`
- Persistencia y portabilidad: `node scripts/simulate-fase11.mjs`
- Simulación de construcción: `node scripts/simulate-fase9.mjs`
- Simulación de exportación: `node scripts/simulate-fase10.mjs`
- Simulación de publicación: `node scripts/simulate-fase12.mjs`
