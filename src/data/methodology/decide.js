export const DECISION_STATUS = {
  DRAFT: 'DRAFT',
  FINDING_LINKED: 'FINDING_LINKED',
  ALTERNATIVES_ANALYZED: 'ALTERNATIVES_ANALYZED',
  DECISION_SELECTED: 'DECISION_SELECTED',
  RISK_REVIEWED: 'RISK_REVIEWED',
  METRIC_DEFINED: 'METRIC_DEFINED',
  PRIORITIZED: 'PRIORITIZED',
  DOCUMENTED: 'DOCUMENTED',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
};

export const QUALITY_STATUS = {
  ADECUADA: 'ADECUADA',
  PARCIAL: 'PARCIAL',
  NO_SUSTENTADA: 'NO_SUSTENTADA',
};

export const MIN_RECOMMENDATIONS = 5;
export const MIN_ALTERNATIVES = 2;

export const decideMethodSteps = [
  {
    id: 'search',
    verb: 'PARTIR',
    title: '¿QUÉ PROBLEMA?',
    description: 'El hallazgo sustentado, no la tecnología de moda.',
  },
  {
    id: 'extract',
    verb: 'SUSTENTAR',
    title: '¿QUÉ EVIDENCIA Y RESTRICCIONES?',
    description: 'Evidencias del hallazgo y límites ya documentados.',
  },
  {
    id: 'process',
    verb: 'COMPARAR',
    title: '¿QUÉ ALTERNATIVAS?',
    description: 'Mínimo dos, incluidas on-premise, cloud, híbrido o proceso.',
  },
  {
    id: 'interpret',
    verb: 'DECIDIR',
    title: '¿POR QUÉ ESTA?',
    description: 'Beneficio, riesgo introducido, CAPEX/OPEX, métrica y prioridad.',
  },
  {
    id: 'write',
    verb: 'DOCUMENTAR',
    title: '¿CÓMO LO ESCRIBO?',
    description: 'Estrategia, tabla de costo y recomendaciones priorizadas.',
  },
];

export const decideSubstages = [
  { id: 1, key: 'findings', name: 'Hallazgos', title: 'Revisar hallazgos' },
  { id: 2, key: 'problem', name: 'Problema', title: 'Seleccionar problema' },
  { id: 3, key: 'constraints', name: 'Restricciones', title: 'Revisar restricciones' },
  { id: 4, key: 'alternatives', name: 'Alternativas', title: 'Generar alternativas' },
  { id: 5, key: 'compare', name: 'Comparar', title: 'On-premise / cloud / híbrido / edge' },
  { id: 6, key: 'decision', name: 'Decisión', title: 'Elegir decisión' },
  { id: 7, key: 'cost', name: 'CAPEX/OPEX', title: 'Analizar CAPEX/OPEX' },
  { id: 8, key: 'risk', name: 'Riesgo', title: 'Definir riesgo introducido' },
  { id: 9, key: 'metric', name: 'Métrica', title: 'Definir métrica de éxito' },
  { id: 10, key: 'priority', name: 'Priorizar', title: 'Priorizar' },
  { id: 11, key: 'recommend', name: 'Recomendaciones', title: 'Construir recomendaciones' },
  { id: 12, key: 'strategy', name: 'Estrategia', title: 'Documentar estrategia' },
];

export const decideFinders = {
  findings: {
    id: 'decide-findings',
    need: 'Hallazgos sustentados para decidir',
    lookIn: 'Matriz de diagnóstico y restricciones de COMPRENDER',
    lookInSectionId: 'constraints',
    needed: ['Hallazgo', 'Evidencia', 'Impacto', 'Restricciones'],
    notYet: ['Marca de producto', 'Migrar porque es moderno'],
  },
  alternatives: {
    id: 'decide-alts',
    need: 'Alternativas comparables',
    lookIn: 'Hallazgo, restricciones y arquitectura AS-IS',
    lookInSectionId: 'infrastructure',
    needed: ['Al menos dos alternativas', 'On-premise / cloud / proceso si aplica'],
    notYet: ['Ganador automático', 'TO-BE dibujado'],
  },
};

export const decideMethodValues = {
  1: {
    search: 'Hallazgos ya documentados.',
    extract: 'Evidencia, impacto, criticidad y marcos usados.',
    process: 'No se inventa un problema nuevo aquí.',
    interpret: 'Una decisión parte del diagnóstico.',
    write: 'Banco de problemas a decidir.',
  },
  2: {
    search: 'Qué hallazgo se convierte en problema de decisión.',
    extract: 'Evidencias que sustentan específicamente esta decisión.',
    process: 'El impacto se reutiliza; se puede precisar.',
    interpret: 'Sin hallazgo, la recomendación queda no sustentada.',
    write: 'Problema vinculado a findingId.',
  },
  3: {
    search: 'Restricciones de COMPRENDER.',
    extract: 'Presupuesto, producción, cloud, costos variables, crecimiento.',
    process: 'Revisar todas. Puede no afectar, pero hay que declararlo.',
    interpret: 'No se decide en el vacío.',
    write: 'Restricciones que condicionan la alternativa.',
  },
  4: {
    search: 'Qué se puede hacer además de comprar.',
    extract: 'Optimizar, escalar, monitorear, proceso, cloud, híbrido.',
    process: 'Mínimo dos alternativas, salvo acción operativa concreta.',
    interpret: 'No hay ganador automático.',
    write: 'Lista de alternativas.',
  },
  5: {
    search: 'On-premise, cloud, híbrido y edge como opciones, no como dogma.',
    extract: 'Ayuda, límites, costo, dependencia, habilidades.',
    process: 'Híbrido no es 50/50. Edge no se sugiere solo por tener sedes.',
    interpret: 'Valoración cualitativa, no puntaje rígido.',
    write: 'Comparación tecnológica.',
  },
  6: {
    search: 'Por qué esta alternativa es más pertinente.',
    extract: 'Criterios, no “porque es moderna”.',
    process: 'La recomendación debe defenderse aunque cambie el nombre de la tecnología.',
    interpret: 'Decisión + justificación.',
    write: 'Texto de decisión.',
  },
  7: {
    search: 'CAPEX, OPEX o mixto.',
    extract: 'Compra vs suscripción vs híbrido.',
    process: 'El costo informa; no determina solo.',
    interpret: 'Clasificación justificada.',
    write: 'Fila de CAPEX/OPEX.',
  },
  8: {
    search: 'Qué riesgo introduce la decisión.',
    extract: 'Proveedor, costo variable, complejidad, ruido de alertas.',
    process: 'Residual bajo solo con justificación.',
    interpret: 'No toda decisión es un riesgo crítico.',
    write: 'Riesgo introducido.',
  },
  9: {
    search: 'Cómo se comprobará que funcionó.',
    extract: 'Métricas ya estudiadas: latencia, MTTR, backup, almacenamiento.',
    process: 'Objetivo opcional. Si el caso no lo sustenta, “por definir con negocio/SLA”.',
    interpret: 'Sin métrica no se completa.',
    write: 'Métrica de éxito.',
  },
  10: {
    search: 'Impacto versus esfuerzo.',
    extract: 'Criticidad, urgencia, factibilidad, costo.',
    process: 'La matriz orienta; no es regla absoluta.',
    interpret: 'Prioridad justificada.',
    write: 'Prioridad de la recomendación.',
  },
  11: {
    search: 'Recomendaciones priorizadas.',
    extract: 'Mínimo cinco. Una puede cubrir varios hallazgos.',
    process: 'Cada una con hallazgo, evidencia, impacto, decisión, beneficio, riesgo, costo, métrica y prioridad.',
    interpret: 'Adecuada, parcial o no sustentada.',
    write: '16. Recomendaciones.',
  },
  12: {
    search: 'Visión preliminar, no TO-BE automático.',
    extract: 'Qué se mantiene, mejora, escala, redundancia, cloud, edge y medición.',
    process: 'Organizar decisiones. No dibujar la arquitectura futura completa.',
    interpret: 'Estrategia + CAPEX/OPEX + recomendaciones.',
    write: 'Cierre y habilitación de CONSTRUIR.',
  },
};

export const alternativeTypes = [
  { id: 'optimize', label: 'Optimización' },
  { id: 'scale-up', label: 'Escalamiento vertical' },
  { id: 'scale-out', label: 'Escalamiento horizontal' },
  { id: 'redundancy', label: 'Redundancia' },
  { id: 'monitoring', label: 'Monitoreo' },
  { id: 'automation', label: 'Automatización' },
  { id: 'onprem', label: 'On-premise' },
  { id: 'cloud', label: 'Cloud' },
  { id: 'hybrid', label: 'Híbrido' },
  { id: 'edge', label: 'Edge' },
  { id: 'process', label: 'Cambio de proceso' },
  { id: 'managed', label: 'Servicio administrado' },
];

export const compareCriteria = [
  { id: 'problem', label: 'Problema que resuelve' },
  { id: 'constraints', label: 'Compatibilidad con restricciones' },
  { id: 'capex', label: 'Costo inicial' },
  { id: 'opex', label: 'Costo recurrente' },
  { id: 'elasticity', label: 'Elasticidad' },
  { id: 'availability', label: 'Disponibilidad' },
  { id: 'latency', label: 'Latencia' },
  { id: 'operations', label: 'Operación' },
  { id: 'security', label: 'Seguridad' },
  { id: 'complexity', label: 'Complejidad' },
  { id: 'dependency', label: 'Dependencia externa' },
  { id: 'skills', label: 'Habilidades' },
];

export const qualitativeRatings = [
  { id: 'favorable', label: 'Favorable' },
  { id: 'medium', label: 'Intermedia' },
  { id: 'unfavorable', label: 'Desfavorable' },
  { id: 'na', label: 'No aplica' },
];

export const costModels = [
  { id: 'capex', label: 'CAPEX' },
  { id: 'opex', label: 'OPEX' },
  { id: 'mixed', label: 'Mixto' },
];

export const successMetrics = [
  { id: 'mttr', label: 'MTTR' },
  { id: 'availability', label: 'Disponibilidad' },
  { id: 'latency', label: 'Latencia / tiempo de respuesta' },
  { id: 'cpu', label: 'CPU en pico' },
  { id: 'storage-use', label: '% uso de almacenamiento' },
  { id: 'storage-growth', label: 'Crecimiento mensual' },
  { id: 'backup-success', label: '% backups exitosos' },
  { id: 'detection-time', label: 'Tiempo de detección de fallo' },
  { id: 'incidents-registered', label: '% incidentes registrados' },
  { id: 'changes-rollback', label: '% cambios con rollback' },
];

export const benefitOptions = [
  { id: 'latency', label: 'Reducir latencia' },
  { id: 'availability', label: 'Mejorar disponibilidad' },
  { id: 'detection', label: 'Reducir tiempo de detección' },
  { id: 'capacity', label: 'Anticipar capacidad' },
  { id: 'risk', label: 'Reducir riesgo' },
  { id: 'trace', label: 'Mejorar trazabilidad' },
  { id: 'growth', label: 'Soportar crecimiento' },
];

export const introducedRiskOptions = [
  { id: 'vendor', label: 'Dependencia de proveedor', typicalFor: ['cloud', 'managed'] },
  { id: 'variable-cost', label: 'Costo variable', typicalFor: ['cloud', 'hybrid'] },
  { id: 'complexity', label: 'Complejidad operativa', typicalFor: ['redundancy', 'hybrid', 'edge'] },
  { id: 'distributed', label: 'Más infraestructura distribuida', typicalFor: ['edge'] },
  { id: 'config-error', label: 'Errores de configuración', typicalFor: ['automation', 'monitoring'] },
  { id: 'alert-noise', label: 'Ruido de alertas si se configura mal', typicalFor: ['monitoring', 'automation'] },
];

export const priorityLevels = [
  { id: 'immediate', label: 'Inmediata' },
  { id: 'high', label: 'Alta' },
  { id: 'medium', label: 'Media' },
  { id: 'low', label: 'Baja' },
  { id: 'strategic', label: 'Planificada / estratégica' },
];

export const impactEffortCells = [
  { id: 'high-low', label: 'Alto impacto / bajo esfuerzo', hint: 'Prioridad alta (orienta, no obliga).' },
  { id: 'high-high', label: 'Alto impacto / alto esfuerzo', hint: 'Planificar.' },
  { id: 'low-low', label: 'Bajo impacto / bajo esfuerzo', hint: 'Evaluar.' },
  { id: 'low-high', label: 'Bajo impacto / alto esfuerzo', hint: 'Prioridad menor.' },
];

export const capexOpexItems = [
  { id: 'cx1', text: 'Comprar segundo firewall', correct: 'capex' },
  { id: 'cx2', text: 'Servicio cloud mensual', correct: 'opex' },
  { id: 'cx3', text: 'Suscripción de monitoreo', correct: 'opex' },
  { id: 'cx4', text: 'Compra de NAS', correct: 'capex' },
  { id: 'cx5', text: 'Solución híbrida (local + cloud)', correct: 'mixed' },
];

export const pedagogicalExamples = [
  {
    id: 'ex-capacity',
    finding: 'Degradación en picos.',
    alternatives: 'Ampliar local / capacidad elástica en cloud / optimizar antes de escalar.',
    note: 'No existe ganador automático.',
  },
  {
    id: 'ex-backup',
    finding: 'Fallo de backup no detectado.',
    decision: 'Alerta automática integrada a mesa.',
    cost: 'OPEX / esfuerzo operativo',
    metric: 'Tiempo de detección + % backup exitoso',
    priority: 'Alta',
  },
  {
    id: 'ex-firewall',
    finding: 'SPOF de firewall.',
    alternatives: 'Mantener / HA / segundo equipo + failover / otro diseño pertinente.',
    note: 'No asumir marca o producto.',
  },
  {
    id: 'ex-storage',
    finding: 'Margen ≈ 7,6 meses.',
    alternatives: 'Ampliar / retención / archivado / almacenamiento de menor costo / combinación.',
    note: 'La solución no tiene que ser solamente comprar más disco.',
  },
];

export const strategyPrompts = [
  { id: 'keep', label: '¿Qué debe mantenerse?' },
  { id: 'improve', label: '¿Qué debe mejorarse?' },
  { id: 'scale', label: '¿Qué puede escalar?' },
  { id: 'redundant', label: '¿Qué debe ser redundante?' },
  { id: 'cloud', label: '¿Qué puede usar cloud?' },
  { id: 'edge', label: '¿Qué podría requerir edge?' },
  { id: 'measure', label: '¿Qué debe medirse mejor?' },
];

export const strategyHints = [
  'Mantener ERP actual.',
  'Fortalecer resiliencia.',
  'Analizar capacidad del canal digital.',
  'Mejorar monitoreo.',
  'Planificar almacenamiento.',
  'Evaluar híbrido cuando sea pertinente.',
];

export const decideActivities = {
  start: {
    id: 'dec-start',
    prompt: '¿Cuál planteamiento es correcto para decidir?',
    options: [
      { id: 'a', label: 'Usar cloud porque es moderno.' },
      { id: 'b', label: 'El servicio presenta picos de demanda y degradación; se comparan alternativas para mejorar capacidad y elasticidad.' },
      { id: 'c', label: 'Comprar el producto que más se anuncia.' },
      { id: 'd', label: 'Empezar dibujando el TO-BE.' },
    ],
    correctId: 'b',
    feedbackCorrect: 'Correcto. No empieces por la tecnología. Una recomendación debe poder defenderse aunque cambies el nombre de la tecnología.',
    feedbackIncorrect: '“Usar cloud porque es moderno” es incorrecto. Parte del problema y de la evidencia.',
  },
};

export const decideCheckpoint = [
  {
    id: 'dec-q1',
    prompt: '¿Por qué no debes empezar por cloud/on-premise?',
    options: [
      { id: 'a', label: 'Porque esas opciones están prohibidas.' },
      { id: 'b', label: 'Porque primero hay un problema, evidencia, impacto y restricciones que comparar.' },
      { id: 'c', label: 'Porque cloud siempre es más barato.' },
      { id: 'd', label: 'Porque on-premise ya no existe.' },
    ],
    correctId: 'b',
    feedbackCorrect: 'Correcto. La tecnología se elige después de entender el problema.',
    feedbackIncorrect: 'No hay prejuicio a favor ni en contra de cloud u on-premise.',
  },
  {
    id: 'dec-q2',
    prompt: '¿Qué debe ocurrir antes de elegir una alternativa?',
    options: [
      { id: 'a', label: 'Comparar al menos dos alternativas, revisar restricciones y sostener con evidencia.' },
      { id: 'b', label: 'Pedir cotización de un único proveedor.' },
      { id: 'c', label: 'Dibujar el TO-BE completo.' },
      { id: 'd', label: 'Elegir la opción más moderna.' },
    ],
    correctId: 'a',
    feedbackCorrect: 'Correcto. Mínimo dos alternativas, salvo una acción operativa concreta y sencilla.',
    feedbackIncorrect: 'Antes de decidir se comparan alternativas frente a evidencia y restricciones.',
  },
  {
    id: 'dec-q3',
    prompt: '¿Toda solución introduce riesgos?',
    options: [
      { id: 'a', label: 'Sí, y todos son críticos.' },
      { id: 'b', label: 'Hay que revisar el riesgo introducido; puede ser residual bajo si se justifica, no se asume crítico.' },
      { id: 'c', label: 'No. Las buenas decisiones no tienen riesgo.' },
      { id: 'd', label: 'Solo si es cloud.' },
    ],
    correctId: 'b',
    feedbackCorrect: 'Correcto. Se revisa el riesgo; no se dramatiza ni se ignora.',
    feedbackIncorrect: 'No asumas que toda decisión introduce un riesgo crítico, ni que no introduce ninguno.',
  },
  {
    id: 'dec-q4',
    prompt: '¿CAPEX/OPEX determina por sí solo la decisión?',
    options: [
      { id: 'a', label: 'Sí. Lo más barato gana.' },
      { id: 'b', label: 'No. Ayuda a analizar el modelo de costo, pero no determina por sí solo cuál alternativa es mejor.' },
      { id: 'c', label: 'Solo el CAPEX importa.' },
      { id: 'd', label: 'Solo el OPEX importa.' },
    ],
    correctId: 'b',
    feedbackCorrect: 'Correcto. El costo informa; no sustituye evidencia, restricción ni métrica.',
    feedbackIncorrect: 'CAPEX y OPEX no eligen solos la alternativa.',
  },
  {
    id: 'dec-q5',
    prompt: '¿Por qué toda recomendación necesita una métrica?',
    options: [
      { id: 'a', label: 'Para rellenar la tabla.' },
      { id: 'b', label: 'Para comprobar si la decisión funcionó.' },
      { id: 'c', label: 'Porque ITIL lo exige siempre.' },
      { id: 'd', label: 'No la necesita si la tecnología es conocida.' },
    ],
    correctId: 'b',
    feedbackCorrect: 'Correcto. Sin métrica no puedes saber si la decisión mejoró el servicio.',
    feedbackIncorrect: 'La pregunta es: ¿cómo comprobarás que la decisión funcionó?',
  },
  {
    id: 'dec-q6',
    prompt: 'Completa: PROBLEMA → ________ → IMPACTO → DECISIÓN → ________',
    options: [
      { id: 'a', label: 'EVIDENCIA · MÉTRICA' },
      { id: 'b', label: 'CLOUD · CAPEX' },
      { id: 'c', label: 'MARCA · SLA inventado' },
      { id: 'd', label: 'OPINIÓN · TO-BE' },
    ],
    correctId: 'a',
    feedbackCorrect: 'Correcto. Problema → evidencia → impacto → decisión → métrica.',
    feedbackIncorrect: 'La cadena obligatoria incluye evidencia y métrica, no la marca.',
  },
];

export const decideClosing = {
  lead: 'Ya convertiste el diagnóstico en decisiones sustentadas.',
  next: 'Ahora vamos a consolidar todo tu trabajo en un documento técnico coherente.',
  nextStage: 'CONSTRUIR',
  nextHint: 'El ensamblado final, conclusiones y exportación se desarrollarán después.',
};

export const fashionPattern =
  /migrar a cloud porque es m[aá]s moderno|porque es moderna|porque es moderno|porque es cloud|porque es mejor\.?$/i;
export const vagueBenefitPattern = /^mejorar infraestructura\.?$/i;
export const vagueJustificationPattern = /^(porque es mejor|porque es moderna|porque es cloud)\.?$/i;

export const reviewRequiredMessage =
  'Un hallazgo o una restricción utilizada cambió. Las decisiones relacionadas no se borraron: quedaron en REVISIÓN REQUERIDA.';
