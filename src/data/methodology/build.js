export const DOCUMENT_STATUS = {
  IN_PROGRESS: 'IN_PROGRESS',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
  VALIDATED: 'VALIDATED',
  READY_TO_EXPORT: 'READY_TO_EXPORT',
};

export const SECTION_STATUS = {
  COMPLETE: 'COMPLETA',
  INCOMPLETE: 'INCOMPLETA',
  REVIEW_REQUIRED: 'REVISIÓN REQUERIDA',
  NA: 'NO APLICA',
};

export const ISSUE_SEVERITY = {
  ERROR: 'ERROR',
  REVIEW: 'REVISIÓN',
  WARNING: 'ADVERTENCIA',
};

export const PREVIEW_MODES = {
  academic: 'academic',
  document: 'document',
};

export const buildMethodSteps = [
  {
    id: 'search',
    verb: 'REUNIR',
    title: '¿QUÉ YA CONSTRUÍ?',
    description: 'Las secciones documentadas. No se inventa análisis nuevo.',
  },
  {
    id: 'extract',
    verb: 'VALIDAR',
    title: '¿QUÉ FALTA O SE ROMPE?',
    description: 'Vacíos, REVIEW_REQUIRED, trazabilidad y números.',
  },
  {
    id: 'process',
    verb: 'SINTETIZAR',
    title: '¿QUÉ CONCLUYO?',
    description: 'Estado, riesgos, patrones, prioridades y limitaciones.',
  },
  {
    id: 'interpret',
    verb: 'REVISAR',
    title: '¿EL INFORME ES COHERENTE?',
    description: 'Vista previa, índice y modo académico o documento.',
  },
  {
    id: 'write',
    verb: 'CERRAR',
    title: '¿QUEDA LISTO?',
    description: 'Sin errores ni revisiones pendientes. Exportación en la siguiente fase.',
  },
];

export const buildSubstages = [
  { id: 1, key: 'status', name: 'Estado', title: 'Reunir y revisar el documento' },
  { id: 2, key: 'validate', name: 'Validar', title: 'Validar coherencia y números' },
  { id: 3, key: 'trace', name: 'Trazabilidad', title: 'Auditar trazabilidad' },
  { id: 4, key: 'conclusions', name: 'Conclusiones', title: 'Construir conclusiones' },
  { id: 5, key: 'preview', name: 'Vista previa', title: 'Revisar el informe' },
  { id: 6, key: 'close', name: 'Cierre', title: 'Calidad y listo para exportar' },
];

export const buildMethodValues = {
  1: {
    search: 'Secciones ya escritas en “Tu documento”.',
    extract: 'Completa, incompleta o revisión requerida.',
    process: 'No se duplica contenido: se ensambla.',
    interpret: 'Las 14 secciones del informe final.',
    write: 'Panel de estado.',
  },
  2: {
    search: 'Huecos, hallazgos sin evidencia, recomendaciones sin métrica.',
    extract: 'Valores calculados vs redacción.',
    process: 'Contradicciones hallazgo ↔ recomendación.',
    interpret: 'ERROR, REVISIÓN o ADVERTENCIA.',
    write: 'Issues navegables.',
  },
  3: {
    search: 'Caso → dato → hallazgo → gobierno/decisión → recomendación → métrica.',
    extract: 'Cada eslabón debe existir.',
    process: 'Clic en un nodo abre el origen.',
    interpret: 'TRAZABILIDAD INCOMPLETA si falta un enlace.',
    write: 'Auditoría de trazabilidad.',
  },
  4: {
    search: 'Hallazgos principales, fortalezas, restricciones, prioridades, límites.',
    extract: 'No es un resumen de tablas ni una lista de compras.',
    process: '3 a 5 párrafos de síntesis.',
    interpret: 'Limitaciones son fortaleza metodológica.',
    write: 'Sección 14. Conclusiones.',
  },
  5: {
    search: 'Portada, índice y 14 secciones.',
    extract: 'Modo académico muestra fuentes y cálculos.',
    process: 'Modo documento muestra el informe limpio.',
    interpret: 'Editar vuelve al builder original.',
    write: 'Vista previa no exporta.',
  },
  6: {
    search: 'Checklist estructural, no un puntaje de calidad.',
    extract: 'READY_TO_EXPORT exige 0 errores y 0 REVIEW_REQUIRED.',
    process: 'Advertencias se revisan, no bloquean solas.',
    interpret: 'El archivo final se genera después.',
    write: 'Documento listo para exportar.',
  },
};

export const finalReportSections = [
  { id: 1, key: 'context', title: 'Contexto de la organización', editPath: '/comprender/1', editLabel: 'Editar contexto' },
  { id: 2, key: 'criticalServices', title: 'Servicios tecnológicos críticos', editPath: '/comprender/4', editLabel: 'Editar servicios críticos' },
  { id: 3, key: 'asis', title: 'Arquitectura AS-IS', editPath: '/representar/5', editLabel: 'Editar AS-IS' },
  { id: 4, key: 'inventory', title: 'Inventario relevante', editPath: '/representar/3', editLabel: 'Editar inventario' },
  { id: 5, key: 'spof', title: 'Identificación de SPOF', editPath: '/representar/6', editLabel: 'Editar SPOF' },
  { id: 6, key: 'metrics', title: 'Métricas de infraestructura', editPath: '/medir', editLabel: 'Editar métricas' },
  { id: 7, key: 'findings', title: 'Matriz de diagnóstico', editPath: '/diagnosticar', editLabel: 'Editar hallazgos' },
  { id: 8, key: 'itil', title: 'Análisis ITIL', editPath: '/gobernar/3', editLabel: 'Editar ITIL' },
  { id: 9, key: 'cobit', title: 'Análisis COBIT', editPath: '/gobernar/4', editLabel: 'Editar COBIT' },
  { id: 10, key: 'iso27001', title: 'Análisis ISO 27001', editPath: '/gobernar/5', editLabel: 'Editar ISO 27001' },
  { id: 11, key: 'strategy', title: 'Estrategia tecnológica preliminar', editPath: '/decidir/12', editLabel: 'Editar estrategia' },
  { id: 12, key: 'capex', title: 'CAPEX y OPEX', editPath: '/decidir/7', editLabel: 'Editar CAPEX/OPEX' },
  { id: 13, key: 'recommendations', title: 'Recomendaciones priorizadas', editPath: '/decidir/11', editLabel: 'Editar recomendaciones' },
  { id: 14, key: 'conclusions', title: 'Conclusiones', editPath: '/construir/4', editLabel: 'Editar conclusiones' },
];

export const metricSubsections = [
  { id: 'availability', number: '6.1', title: 'Disponibilidad', resultKey: 'availabilityPercent', unit: '%' },
  { id: 'mttr', number: '6.2', title: 'MTTR', resultKey: 'mttrHours', unit: 'h' },
  { id: 'mtbf', number: '6.3', title: 'MTBF estimado', resultKey: 'mtbfHours', unit: 'h' },
  { id: 'capacity', number: '6.4', title: 'Capacidad y rendimiento' },
  { id: 'performance', number: '6.4', title: 'Rendimiento' },
  { id: 'storage', number: '6.5', title: 'Almacenamiento y crecimiento', resultKey: 'storageUsedPercent', unit: '%' },
];

export const strengthOptions = [
  { id: 'helpdesk', label: 'Existencia de mesa de ayuda' },
  { id: 'dual-link', label: 'Dos enlaces de Internet en sede principal' },
  { id: 'backup-exists', label: 'Backup existente' },
  { id: 'ti-team', label: 'Equipo TI establecido' },
  { id: 'partial-monitoring', label: 'Monitoreo parcial' },
  { id: 'cloud-allowed', label: 'Cloud permitido cuando se justifica' },
];

export const limitationOptions = [
  { id: 'history', label: 'Falta de histórico completo de incidentes' },
  { id: 'mtbf-estimate', label: 'MTBF estimado (no es un dato directo del caso)' },
  { id: 'no-sla', label: 'Ausencia de SLA documentado' },
  { id: 'partial-metrics', label: 'Métricas parciales o de un periodo limitado' },
  { id: 'incident-detail', label: 'Falta de detalle de algunos incidentes' },
];

export const conclusionTemplate = [
  'El análisis de la infraestructura de [organización] evidencia una operación tecnológica que soporta [servicios principales], pero presenta oportunidades de mejora principalmente en [categorías].',
  'Los hallazgos de mayor relevancia corresponden a [hallazgos], debido a su impacto sobre [servicios/procesos].',
  'Las decisiones futuras deben considerar restricciones como [restricciones].',
  'La estrategia recomendada debe priorizar [prioridades], utilizando indicadores como [métricas] para validar los resultados.',
  'No obstante, el análisis presenta limitaciones relacionadas con [datos faltantes].',
];

export const conclusionHints = {
  length: 'Orienta a 3–5 párrafos. No es un conteo rígido.',
  notSummary: 'Las conclusiones no deben repetir la tabla de recomendaciones ni opinar en general.',
  strengths: 'No hagas que el documento parezca que todo está mal. Identifica fortalezas con evidencia del caso. No se agregan solas.',
  limits: 'Documentar limitaciones es una fortaleza metodológica, no una falla.',
};

export const vagueConclusionPatterns = [
  { test: /todo est[aá] bien/i, message: 'Demasiado vaga. Sintetiza estado, riesgos y prioridades con evidencia.' },
  { test: /hay que comprar servidores/i, message: 'Eso es una recomendación, no una conclusión.' },
  { test: /cloud es la mejor opci[oó]n/i, message: 'No sustentada. Relaciona la conclusión con hallazgos y restricciones.' },
  { test: /se recomienda mejorar\.?$/i, message: 'Esta afirmación necesita mayor precisión o evidencia.' },
  { test: /hay muchos problemas/i, message: 'Esta afirmación necesita mayor precisión o evidencia.' },
  { test: /la infraestructura est[aá] mal/i, message: 'Esta afirmación necesita mayor precisión o evidencia.' },
  { test: /el sistema es obsoleto/i, message: 'Esta afirmación necesita mayor precisión o evidencia.' },
];

export const absolutePatterns = [
  { test: /\bsiempre\b/i, term: 'siempre' },
  { test: /\bnunca\b/i, term: 'nunca' },
  { test: /\bdefinitivamente\b/i, term: 'definitivamente' },
  { test: /la [uú]nica soluci[oó]n/i, term: 'la única solución' },
];

export const terminology = ['AS-IS', 'SPOF', 'MTTR', 'MTBF', 'ITIL', 'COBIT', 'ISO 27001', 'CAPEX', 'OPEX', 'On-premise', 'Cloud', 'Híbrido', 'Edge'];

export const categoryKeywords = {
  storage: ['almacen', 'nas', 'disco', 'retenc', 'archiv', 'crecimiento', 'margen'],
  performance: ['latenc', 'rendim', 'pico', 'elastic', 'cpu', 'capacidad', 'demanda'],
  capacity: ['capacidad', 'cpu', 'ram', 'elastic', 'escala', 'pico'],
  monitoring: ['monitor', 'alerta', 'detecc', 'backup', 'respald', 'evento'],
  dependency: ['firewall', 'spof', 'redundan', 'failover', 'perimetr', 'disponib'],
  government: ['gobierno', 'criterio', 'revisión periódica', 'inversión', 'capacidad'],
  operation: ['operac', 'rollback', 'cambio', 'incidente', 'mesa'],
  security: ['identidad', 'cuenta', 'acceso', 'mfa', 'autentic'],
  availability: ['disponib', 'caída', 'spof', 'failover'],
  continuity: ['recuper', 'backup', 'continuidad', 'rto'],
};

export const qualityChecks = [
  { id: 'business', label: 'El documento explica el negocio.', test: 'context' },
  { id: 'critical', label: 'Los servicios críticos están justificados.', test: 'criticalServices' },
  { id: 'asis-current', label: 'El AS-IS representa solo estado actual.', test: 'asis' },
  { id: 'spof-evidence', label: 'Los SPOF tienen evidencia.', test: 'spof' },
  { id: 'metrics-calc', label: 'Las métricas muestran cálculo.', test: 'metrics' },
  { id: 'mtbf-limit', label: 'MTBF indica limitación si corresponde.', test: 'mtbfLimit' },
  { id: 'findings-min', label: 'Hay mínimo 8 hallazgos.', test: 'findingsMin' },
  { id: 'itil-min', label: 'ITIL tiene mínimo 4 situaciones.', test: 'itilMin' },
  { id: 'cobit-min', label: 'COBIT tiene mínimo 3 situaciones.', test: 'cobitMin' },
  { id: 'iso-min', label: 'ISO tiene mínimo 5 riesgos.', test: 'isoMin' },
  { id: 'recs-findings', label: 'Las recomendaciones parten de hallazgos.', test: 'recsLinked' },
  { id: 'recs-metrics', label: 'Todas las recomendaciones tienen métrica.', test: 'recsMetrics' },
  { id: 'capex-justified', label: 'CAPEX/OPEX está justificado.', test: 'capex' },
  { id: 'conclusions-synth', label: 'Las conclusiones sintetizan el análisis.', test: 'conclusions' },
];

export const buildCheckpoint = [
  {
    id: 'b-q1',
    prompt: '¿Puedes rastrear cada recomendación hasta un hallazgo?',
    options: [
      { id: 'a', label: 'No es necesario si la idea suena razonable.' },
      { id: 'b', label: 'Sí. Sin hallazgo la recomendación queda no sustentada.' },
      { id: 'c', label: 'Solo si es cloud.' },
      { id: 'd', label: 'El índice sustituye la trazabilidad.' },
    ],
    correctId: 'b',
    feedbackCorrect: 'Correcto. Cada recomendación debe llegar hasta un hallazgo y su evidencia.',
    feedbackIncorrect: 'Sin hallazgo no hay recomendación defendible.',
  },
  {
    id: 'b-q2',
    prompt: '¿Tus métricas muestran de dónde salieron?',
    options: [
      { id: 'a', label: 'Basta el porcentaje final.' },
      { id: 'b', label: 'Deben mostrar datos, fórmula, cálculo, resultado, interpretación y límites.' },
      { id: 'c', label: 'Solo MTTR necesita fórmula.' },
      { id: 'd', label: 'Se pueden redondear a un valor más atractivo.' },
    ],
    correctId: 'b',
    feedbackCorrect: 'Correcto. El valor calculado permanece vinculado al cálculo original.',
    feedbackIncorrect: 'Una métrica sin fuente y fórmula no se puede defender.',
  },
  {
    id: 'b-q3',
    prompt: '¿Los hallazgos tienen evidencia?',
    options: [
      { id: 'a', label: 'Un hallazgo puede ser una opinión experta.' },
      { id: 'b', label: 'Todo hallazgo del informe debe tener evidencia rastreable.' },
      { id: 'c', label: 'Solo los críticos.' },
      { id: 'd', label: 'La evidencia se agrega en la exportación.' },
    ],
    correctId: 'b',
    feedbackCorrect: 'Correcto. Un hallazgo sin evidencia no entra al documento final como sustentado.',
    feedbackIncorrect: 'Sin evidencia el hallazgo no está listo.',
  },
  {
    id: 'b-q4',
    prompt: '¿Las conclusiones sintetizan y no repiten?',
    options: [
      { id: 'a', label: 'Deben copiar las 5 recomendaciones.' },
      { id: 'b', label: 'Sintetizan estado, riesgos, patrones, prioridades y límites; no son un resumen de tablas.' },
      { id: 'c', label: 'Deben proponer marcas de producto.' },
      { id: 'd', label: 'Con un “todo está bien” alcanza.' },
    ],
    correctId: 'b',
    feedbackCorrect: 'Correcto. Conclusión no es recomendación ni resumen de matriz.',
    feedbackIncorrect: 'No copies la tabla ni opines en vacío.',
  },
  {
    id: 'b-q5',
    prompt: '¿Documentaste limitaciones cuando faltan datos?',
    options: [
      { id: 'a', label: 'Esconderlas mejora la nota.' },
      { id: 'b', label: 'Sí. Declarar límites (p. ej. MTBF estimado) es fortaleza metodológica.' },
      { id: 'c', label: 'Solo si el profesor lo pide.' },
      { id: 'd', label: 'Se inventa el dato faltante.' },
    ],
    correctId: 'b',
    feedbackCorrect: 'Correcto. No inventes el dato: declara la limitación.',
    feedbackIncorrect: 'Inventar o ocultar un vacío rompe la trazabilidad.',
  },
];

export const buildClosing = {
  lead: 'Tu análisis está construido.',
  mid: 'Cada conclusión puede rastrearse hasta la evidencia que la originó.',
  next: 'El documento está listo para exportar en HTML, Word o PDF.',
  exportHint: 'Usa Exportar documento para abrir el centro de exportación.',
};

export const buildActivities = {
  start: {
    id: 'b-start',
    prompt: '¿Qué hace CONSTRUIR?',
    options: [
      { id: 'a', label: 'Inventa el TO-BE y las conclusiones.' },
      { id: 'b', label: 'Ensambla, valida y orienta lo ya construido. No genera análisis que el estudiante no haya hecho.' },
      { id: 'c', label: 'Exporta Word de inmediato.' },
      { id: 'd', label: 'Recalcula las métricas con otros números.' },
    ],
    correctId: 'b',
    feedbackCorrect: 'Correcto. InfraGuide ensambla y valida; no inventa el análisis.',
    feedbackIncorrect: 'No se genera automáticamente lo que no construiste.',
  },
};
