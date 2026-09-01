# Changelog

## 1.3.0 — 2026-09-01

Informe técnico de consultoría, capa pedagógica de cálculo guiado y menú APRENDIZAJE.

- Exportación HTML/DOCX/impresión como informe de consultoría (dictamen, hallazgos, evidencias)
- ConceptExplanationCard, GuidedCalculator, InterpretationBuilder, CalculationTrace y glosario contextual
- Página `/aprender` visible en el menú; la pedagogía no se exporta al documento profesional
- Indicadores insuficientes sin inventar fórmulas ni resultados
- El fallo de extensiones (p. ej. MetaMask) ya no tumba la aplicación

## 1.1.0 — 2026-09-01

FASE 12.1 — PDF original, lectura guiada y trazabilidad visual.

- Pantalla de entrada “Antes de analizar, conoce el caso”
- Visor CasePdfViewer (PDF.js) con página, zoom, ajuste al ancho, pestaña nueva, descarga y retorno
- Lectura guiada GuidedCaseReading y mapa del caso
- sourceDocuments + evidenceRegistry + EvidenceValidator
- Enlaces subrayados “Ver evidencia en el caso” en las etapas y en el documento
- Distinción DATOS FUENTE / RESULTADO CALCULADO
- Exportación académica con cita de fuente
- El PDF original aún no estaba en el repositorio: hay un marcador de posición en `public/cases/helados-boreal/caso-helados-boreal.pdf`. Ninguna evidencia se marca como verificada.

## 1.0.0 — 2026-09-01

Primera versión de producción de InfraGuide.

- Flujo guiado: COMPRENDER → REPRESENTAR → MEDIR → DIAGNOSTICAR → GOBERNAR → DECIDIR → CONSTRUIR → EXPORTAR
- Caso modelo Helados Boreal S.A.S. con trazabilidad de datos
- Arquitectura AS-IS, inventario, dependencias y SPOF
- Métricas con fuente, fórmula e interpretación (disponibilidad, MTTR, MTBF, capacidad, almacenamiento, rendimiento)
- Diagnóstico con hallazgos y matriz
- Gobierno ITIL, COBIT e ISO 27001
- Decisiones, estrategia, CAPEX/OPEX, recomendaciones y métricas de éxito
- Documento final, conclusiones y validación
- Exportación HTML, DOCX e impresión/PDF
- Persistencia local, autosave, importar/exportar progreso
- Build Vite, hash routing y despliegue GitHub Pages
- caseRegistry, CaseValidator, AppHealthCheck y pantalla de error controlada
