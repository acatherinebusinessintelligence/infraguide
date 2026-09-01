export const GOVERN_STATUS = {
  DRAFT: 'DRAFT',
  LINKED_TO_FINDING: 'LINKED_TO_FINDING',
  ANALYZED: 'ANALYZED',
  VALIDATED: 'VALIDATED',
  DOCUMENTED: 'DOCUMENTED',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
};

export const MIN_ITIL = 4;
export const MIN_COBIT = 3;
export const MIN_ISO = 5;

export const governMethodSteps = [
  {
    id: 'search',
    verb: 'PREGUNTAR',
    title: '¿QUÉ PROBLEMA ANALIZO?',
    description: 'Parte del hallazgo. No elijas el marco primero.',
  },
  {
    id: 'extract',
    verb: 'ELEGIR',
    title: '¿QUÉ PERSPECTIVA?',
    description: 'ITIL gestiona. COBIT gobierna. ISO 27001 trata el riesgo de información.',
  },
  {
    id: 'process',
    verb: 'ANALIZAR',
    title: '¿QUÉ ESTRUCTURA USO?',
    description: 'Cada marco responde una pregunta distinta.',
  },
  {
    id: 'interpret',
    verb: 'PROPONER',
    title: '¿QUÉ ACCIÓN, DECISIÓN O CONTROL?',
    description: 'Con beneficio o indicador. Sin comprar por inercia.',
  },
  {
    id: 'write',
    verb: 'DOCUMENTAR',
    title: '¿CÓMO LO ESCRIBO?',
    description: 'Tablas ITIL, COBIT e ISO con hallazgo, evidencia y fuente.',
  },
];

export const governSubstages = [
  { id: 1, key: 'findings', name: 'Hallazgos', title: 'Revisar hallazgos' },
  { id: 2, key: 'perspective', name: 'Perspectiva', title: 'Elegir perspectiva' },
  { id: 3, key: 'itil', name: 'ITIL', title: 'ITIL — ¿Cómo gestionamos mejor el servicio?' },
  { id: 4, key: 'cobit', name: 'COBIT', title: 'COBIT — ¿Quién decide y cómo se controla?' },
  { id: 5, key: 'iso', name: 'ISO 27001', title: 'ISO 27001 — ¿Qué riesgo debemos tratar?' },
  { id: 6, key: 'multi', name: 'Varios marcos', title: 'Un mismo hallazgo, varias perspectivas' },
  { id: 7, key: 'document', name: 'Documento', title: 'Construir secciones del documento' },
  { id: 8, key: 'review', name: 'Revisión', title: 'Revisión final' },
];

export const frameworkCards = [
  {
    id: 'itil',
    name: 'ITIL',
    question: '¿Cómo gestionamos mejor el servicio?',
    summary: 'Gestionar el servicio.',
  },
  {
    id: 'cobit',
    name: 'COBIT',
    question: '¿Quién debe decidir, dirigir, controlar y medir?',
    summary: 'Gobernar y controlar.',
  },
  {
    id: 'iso',
    name: 'ISO 27001',
    question: '¿Qué activo está expuesto, frente a qué riesgo y con qué control?',
    summary: 'Gestionar riesgos de información.',
  },
];

export const governFinders = {
  findings: {
    id: 'govern-findings',
    need: 'Hallazgos ya documentados en DIAGNOSTICAR',
    lookIn: 'Matriz de hallazgos y evidencias del caso',
    lookInSectionId: 'incidents',
    needed: ['Hallazgo', 'Evidencia', 'Impacto', 'Criticidad', 'Fuente'],
    notYet: ['TO-BE', 'CAPEX', 'Compra de cloud'],
  },
  itil: {
    id: 'govern-itil',
    need: 'Práctica, acción, beneficio e indicador de gestión del servicio',
    lookIn: 'Hallazgo seleccionado y operación del caso',
    lookInSectionId: 'operations',
    needed: ['Situación', 'Práctica ITIL', 'Acción', 'Beneficio'],
    notYet: ['Implementar ITIL como eslogan', 'Migrar a cloud'],
  },
  cobit: {
    id: 'govern-cobit',
    need: 'Decisión de gobierno, responsable e indicador',
    lookIn: 'Gobierno TI y hallazgos de capacidad o SLA',
    lookInSectionId: 'governance',
    needed: ['Problema', 'Decisión', 'Responsable justificado', 'Indicador'],
    notYet: ['Asignar todo al CIO', 'Reiniciar un servidor como decisión'],
  },
  iso: {
    id: 'govern-iso',
    need: 'Activo, amenaza, vulnerabilidad, impacto y control',
    lookIn: 'Seguridad, backup e identidades del caso',
    lookInSectionId: 'security',
    needed: ['Activo', 'Amenaza', 'Vulnerabilidad', 'Impacto', 'Control'],
    notYet: ['Comprar una herramienta y llamarla control'],
  },
};

export const governMethodValues = {
  1: {
    search: 'Qué hallazgos ya están sustentados.',
    extract: 'Categoría, evidencia, impacto, criticidad y fuente.',
    process: 'No se inventan hallazgos nuevos aquí.',
    interpret: 'Un hallazgo puede servir a uno o varios marcos.',
    write: 'Banco de hallazgos para gobernar.',
  },
  2: {
    search: 'Qué pregunta quieres responder con el hallazgo.',
    extract: 'Gestión, gobierno o riesgo de información.',
    process: 'Los marcos no son intercambiables.',
    interpret: 'Una misma situación puede verse desde varios ángulos.',
    write: 'Perspectivas seleccionadas.',
  },
  3: {
    search: 'Cómo se gestiona mejor el servicio.',
    extract: 'Práctica ITIL pertinente al hallazgo.',
    process: 'Acción concreta, no “aplicar ITIL”.',
    interpret: 'Beneficio medible. Indicador opcional pero preferible.',
    write: 'Fila de la tabla ITIL.',
  },
  4: {
    search: 'Quién decide y cómo se controla.',
    extract: 'Evaluar, dirigir y monitorear; no ejecutar el ticket.',
    process: 'Problema + decisión + responsable + indicador.',
    interpret: 'No todo es del CIO. Justifica el responsable.',
    write: 'Fila de la tabla COBIT.',
  },
  5: {
    search: 'Qué activo está expuesto.',
    extract: 'Amenaza distinta de vulnerabilidad.',
    process: 'Impacto y control. El control no es un producto.',
    interpret: 'Lógica de riesgo, no implementación completa de ISO.',
    write: 'Fila de la tabla ISO 27001.',
  },
  6: {
    search: 'Un mismo hallazgo, distintas preguntas.',
    extract: 'ITIL gestiona; COBIT gobierna; ISO trata el riesgo.',
    process: 'No exigir siempre los tres.',
    interpret: 'Cada análisis conserva su estructura.',
    write: 'Vista multiperspectiva.',
  },
  7: {
    search: 'Análisis validados.',
    extract: 'Tablas con hallazgo origen, evidencia y fuente.',
    process: 'Mínimos 4 / 3 / 5. Sin revisión pendiente.',
    interpret: 'Las tres secciones alimentan DECIDIR, no lo reemplazan.',
    write: '11. ITIL, 12. COBIT, 13. ISO 27001.',
  },
  8: {
    search: 'Cobertura y checkpoint.',
    extract: 'Trazabilidad completa.',
    process: 'Resolver REVIEW_REQUIRED.',
    interpret: 'Ya se puede gestionar, gobernar y proteger.',
    write: 'Cierre y habilitación de DECIDIR.',
  },
};

export const itilPractices = [
  { id: 'incident', label: 'Gestión de incidentes' },
  { id: 'problem', label: 'Gestión de problemas' },
  { id: 'change', label: 'Habilitación del cambio' },
  { id: 'monitoring', label: 'Monitoreo y gestión de eventos' },
  { id: 'slm', label: 'Gestión de niveles de servicio' },
  { id: 'continuity', label: 'Continuidad' },
  { id: 'capacity', label: 'Gestión de la capacidad' },
];

export const itilIndicators = [
  { id: 'backup-success', label: 'Porcentaje de backups exitosos' },
  { id: 'detection-time', label: 'Tiempo de detección de fallo' },
  { id: 'incidents-registered', label: 'Porcentaje de incidentes registrados' },
  { id: 'changes-success', label: 'Porcentaje de cambios exitosos' },
  { id: 'changes-rollback', label: 'Porcentaje de cambios con rollback definido' },
  { id: 'sla-compliance', label: 'Cumplimiento de SLA' },
];

export const itilActionOptions = [
  {
    id: 'a',
    label: 'Configurar monitoreo automático de tareas de backup y generar alerta/ticket ante fallo.',
    correctFor: ['monitoring', 'backup'],
  },
  { id: 'b', label: 'Comprar nuevos servidores.', correctFor: [] },
  { id: 'c', label: 'Migrar todo a cloud.', correctFor: [] },
  { id: 'd', label: 'Eliminar las tareas de backup.', correctFor: [] },
];

export const cobitResponsibles = [
  { id: 'ti-direction', label: 'Dirección TI' },
  { id: 'service-owner', label: 'Dueño del servicio' },
  { id: 'infra-lead', label: 'Líder de infraestructura' },
  { id: 'security', label: 'Seguridad' },
  { id: 'tech-committee', label: 'Comité de tecnología' },
  { id: 'operations', label: 'Operación' },
  { id: 'business-owner', label: 'Responsable de negocio' },
];

export const cobitIndicators = [
  { id: 'capacity-review', label: 'Porcentaje de servicios críticos con revisión periódica de capacidad' },
  { id: 'sla-defined', label: 'Porcentaje de servicios críticos con SLA definido y medido' },
  { id: 'investments-criteria', label: 'Porcentaje de inversiones evaluadas con criterios definidos' },
  { id: 'recovery-policy', label: 'Porcentaje de servicios críticos con política de recuperación asignada' },
  { id: 'change-approval', label: 'Porcentaje de cambios con aprobación formal' },
];

export const isoAssets = [
  { id: 'sales-info', label: 'Información de ventas' },
  { id: 'database', label: 'Base de datos' },
  { id: 'customer-data', label: 'Datos de clientes' },
  { id: 'credentials', label: 'Credenciales' },
  { id: 'wms', label: 'ERP Boreal' },
  { id: 'inventory-info', label: 'Información de inventario' },
  { id: 'backups', label: 'Respaldos' },
  { id: 'configs', label: 'Configuraciones' },
  { id: 'cold-chain', label: 'Cadena de frío' },
];

export const isoThreats = [
  { id: 'unauthorized-access', label: 'Acceso no autorizado' },
  { id: 'info-loss', label: 'Pérdida de información' },
  { id: 'malware', label: 'Malware' },
  { id: 'unavailability', label: 'Indisponibilidad' },
  { id: 'unauthorized-change', label: 'Modificación no autorizada' },
  { id: 'exploit', label: 'Explotación de vulnerabilidad' },
  { id: 'infra-failure', label: 'Falla de infraestructura' },
];

export const isoVulnerabilities = [
  { id: 'stale-account', label: 'Cuenta de exempleado activa' },
  { id: 'mfa-gap', label: 'MFA incompleto' },
  { id: 'no-monitoring', label: 'Falta de monitoreo' },
  { id: 'backup-unverified', label: 'Backup sin verificación' },
  { id: 'pending-patches', label: 'Parches pendientes' },
  { id: 'shared-credentials', label: 'Credenciales compartidas' },
  { id: 'no-redundancy', label: 'Ausencia de redundancia' },
];

export const isoControlTypes = [
  { id: 'procedure', label: 'Procedimiento' },
  { id: 'segregation', label: 'Segregación' },
  { id: 'review', label: 'Revisión' },
  { id: 'monitoring', label: 'Monitoreo' },
  { id: 'authentication', label: 'Autenticación' },
  { id: 'training', label: 'Capacitación' },
  { id: 'policy', label: 'Política' },
  { id: 'configuration', label: 'Configuración' },
  { id: 'backup', label: 'Respaldo' },
  { id: 'technical', label: 'Control técnico' },
];

export const govVsMgmtItems = [
  { id: 'gv1', text: 'Configurar una alerta de backup.', correct: 'gestion' },
  { id: 'gv2', text: 'Definir quién es responsable de garantizar la política de recuperación.', correct: 'gobierno' },
  { id: 'gv3', text: 'Reiniciar firewall.', correct: 'gestion' },
  { id: 'gv4', text: 'Definir criterios de inversión para resiliencia.', correct: 'gobierno' },
];

export const threatVsVulnItems = [
  { id: 'tv1', text: 'Cuenta de exempleado activa', correct: 'vulnerabilidad' },
  { id: 'tv2', text: 'Acceso no autorizado', correct: 'amenaza' },
  { id: 'tv3', text: 'Falta de MFA', correct: 'vulnerabilidad' },
  { id: 'tv4', text: 'Malware', correct: 'amenaza' },
  { id: 'tv5', text: 'Backup sin prueba', correct: 'vulnerabilidad' },
  { id: 'tv6', text: 'Pérdida de información', correct: 'contexto', note: 'Puede ser amenaza o impacto potencial según cómo se formule.' },
];

export const governActivities = {
  backupPerspectives: {
    id: 'g-backup-view',
    prompt: 'El backup falló durante dos días y nadie lo detectó. ¿Qué perspectivas pueden ser pertinentes?',
    options: [
      { id: 'a', label: 'Solo ITIL. Los otros marcos no aplican.' },
      { id: 'b', label: 'ITIL sí; COBIT si se analiza responsabilidad/control; ISO 27001 si se analiza riesgo sobre disponibilidad/recuperación.' },
      { id: 'c', label: 'Solo comprar un software de backup.' },
      { id: 'd', label: 'Ninguna: primero hay que migrar a cloud.' },
    ],
    correctId: 'b',
    feedbackCorrect:
      'Una misma situación puede analizarse desde distintos marcos, pero cada uno responde una pregunta diferente.',
    feedbackIncorrect:
      'ITIL sí aplica. COBIT puede aplicar si se pregunta quién controla. ISO aplica si se trata el riesgo sobre la información.',
  },
  itilBackupPractice: {
    id: 'g-itil-backup-practice',
    prompt: 'Hallazgo: el monitoreo de respaldos presenta debilidad de detección. ¿Qué práctica es más pertinente?',
    options: [
      { id: 'incident', label: 'Gestión de incidentes.' },
      { id: 'monitoring', label: 'Monitoreo y gestión de eventos.' },
      { id: 'change', label: 'Habilitación del cambio.' },
      { id: 'finance', label: 'Gestión financiera.' },
    ],
    correctId: 'monitoring',
    feedbackCorrect:
      'Correcto. El incidente debe atenderse cuando ocurre, pero el problema muestra una debilidad de detección: monitoreo y gestión de eventos.',
    feedbackIncorrect:
      'Parcial o incorrecto. El incidente debe atenderse, pero el problema también muestra una debilidad de detección. Revisa monitoreo y gestión de eventos.',
  },
  itilBackupAction: {
    id: 'g-itil-backup-action',
    prompt: '¿Qué acción ITIL es pertinente para el hallazgo de backup sin alerta?',
    options: [
      { id: 'a', label: 'Configurar monitoreo automático de tareas de backup y generar alerta/ticket ante fallo.' },
      { id: 'b', label: 'Comprar nuevos servidores.' },
      { id: 'c', label: 'Migrar todo a cloud.' },
      { id: 'd', label: 'Eliminar las tareas de backup.' },
    ],
    correctId: 'a',
    feedbackCorrect: 'Correcto. La acción atiende la detección, no reemplaza la evidencia por una compra.',
    feedbackIncorrect: 'Comprar, migrar o eliminar backup no está sustentado. La acción pertinente es detectar y escalar el fallo.',
  },
};

export const pedagogicalItil = [
  {
    id: 'ex-itil-backup',
    finding: 'El monitoreo de respaldos presenta debilidad de detección.',
    practice: 'Monitoreo y gestión de eventos',
    action: 'Configurar monitoreo automático de tareas de backup y generar alerta/ticket ante fallo.',
    benefit: 'Reducir tiempo de detección, mejorar trazabilidad y permitir respuesta más rápida.',
    indicator: 'Tiempo de detección de fallo / porcentaje de backups exitosos',
  },
  {
    id: 'ex-itil-change',
    finding: 'Actualización POS sin plan formal de rollback.',
    practice: 'Habilitación del cambio',
    action: 'Evaluación de riesgo + pruebas + ventana + rollback.',
    benefit: 'Reducir impacto de cambios fallidos.',
    indicator: 'Porcentaje de cambios exitosos / porcentaje de cambios con rollback definido',
  },
  {
    id: 'ex-itil-incidents',
    finding: 'Los incidentes llegan por múltiples canales y no todos quedan registrados.',
    practice: 'Gestión de incidentes',
    action: 'Centralizar el registro.',
    benefit: 'Trazabilidad y medición.',
    indicator: 'Porcentaje de incidentes registrados formalmente',
  },
];

export const pedagogicalCobit = [
  {
    id: 'ex-cobit-capacity',
    finding: 'Las decisiones de capacidad se realizan de manera reactiva.',
    problem: 'No existe planeación formal de capacidad.',
    decision: 'Definir criterios y periodicidad de revisión de capacidad.',
    responsible: 'Dirección de TI + dueño del servicio / comité correspondiente.',
    indicator: 'Porcentaje de servicios críticos con revisión periódica de capacidad.',
  },
  {
    id: 'ex-cobit-sla',
    problem: 'SLA incompletos.',
    decision: 'Definir y aprobar niveles de servicio para servicios críticos.',
    responsible: 'Dirección TI + dueño del servicio.',
    indicator: 'Porcentaje de servicios críticos con SLA definido y medido.',
  },
  {
    id: 'ex-cobit-invest',
    finding: 'Inversiones ante urgencias.',
    decision: 'Definir criterios de priorización basados en riesgo, valor, criticidad y capacidad.',
    indicator: 'Porcentaje de inversiones evaluadas con criterios definidos.',
  },
];

export const pedagogicalIso = [
  {
    id: 'ex-iso-identity',
    finding: 'Cuentas de exempleados se deshabilitan tardíamente.',
    asset: 'Credenciales / información corporativa',
    threat: 'Acceso no autorizado',
    vulnerability: 'Cuentas activas después del retiro',
    impact: 'Consulta o modificación no autorizada de información',
    control: 'Proceso formal de baja + revisión periódica de cuentas',
  },
  {
    id: 'ex-iso-backup',
    asset: 'Información corporativa / respaldos',
    threat: 'Pérdida o indisponibilidad de información',
    vulnerability: 'Fallos de backup sin detección y restauraciones irregulares',
    impact: 'Incapacidad de recuperación',
    control: 'Monitoreo + verificación + pruebas periódicas de restauración',
  },
];

export const governCheckpoint = [
  {
    id: 'g-q1',
    prompt: '¿Qué pregunta responde principalmente ITIL?',
    options: [
      { id: 'a', label: '¿Quién aprueba la inversión?' },
      { id: 'b', label: '¿Cómo gestionamos mejor el servicio?' },
      { id: 'c', label: '¿Qué amenaza afecta un activo de información?' },
      { id: 'd', label: '¿Cuánto cuesta el hardware?' },
    ],
    correctId: 'b',
    feedbackCorrect: 'Correcto. ITIL se usa aquí para gestionar el servicio.',
    feedbackIncorrect: 'ITIL no reemplaza a COBIT ni a ISO. Pregunta cómo se gestiona el servicio.',
  },
  {
    id: 'g-q2',
    prompt: '¿Qué diferencia existe entre gobierno y gestión?',
    options: [
      { id: 'a', label: 'No hay diferencia.' },
      { id: 'b', label: 'La gestión ejecuta; el gobierno evalúa, dirige y monitorea.' },
      { id: 'c', label: 'Gobierno es reiniciar el servidor.' },
      { id: 'd', label: 'Gestión es solo el CIO.' },
    ],
    correctId: 'b',
    feedbackCorrect: 'Correcto. Evaluar → dirigir → monitorear no es lo mismo que ejecutar el ticket.',
    feedbackIncorrect: 'Configurar una alerta es gestión. Definir quién garantiza la política es gobierno.',
  },
  {
    id: 'g-q3',
    prompt: '¿Qué estructura utiliza COBIT en este laboratorio?',
    options: [
      { id: 'a', label: 'Activo → amenaza → control.' },
      { id: 'b', label: 'Problema → decisión de gobierno → responsable → indicador.' },
      { id: 'c', label: 'CPU → RAM → disco.' },
      { id: 'd', label: 'Comprar → instalar → migrar.' },
    ],
    correctId: 'b',
    feedbackCorrect: 'Correcto. Aquí COBIT se usa para gobernar y controlar, no para ejecutar.',
    feedbackIncorrect: 'No uses la estructura de ISO ni una lista de compras.',
  },
  {
    id: 'g-q4',
    prompt: '¿Cuál es la diferencia entre amenaza y vulnerabilidad?',
    options: [
      { id: 'a', label: 'Son sinónimos.' },
      { id: 'b', label: 'La amenaza es lo que puede ocurrir; la vulnerabilidad es la debilidad que lo facilita.' },
      { id: 'c', label: 'La amenaza es falta de MFA.' },
      { id: 'd', label: 'La vulnerabilidad es el malware.' },
    ],
    correctId: 'b',
    feedbackCorrect: 'Correcto. Falta de MFA es vulnerabilidad; acceso no autorizado puede ser la amenaza.',
    feedbackIncorrect: 'No intercambies amenaza y vulnerabilidad.',
  },
  {
    id: 'g-q5',
    prompt: '¿Una misma situación puede analizarse desde varios marcos?',
    options: [
      { id: 'a', label: 'No. Hay que elegir uno solo para siempre.' },
      { id: 'b', label: 'Sí, pero cada marco responde una pregunta diferente.' },
      { id: 'c', label: 'Solo si se compran las tres certificaciones.' },
      { id: 'd', label: 'Solo en TO-BE.' },
    ],
    correctId: 'b',
    feedbackCorrect: 'Correcto. No son respuestas intercambiables.',
    feedbackIncorrect: 'ITIL, COBIT e ISO 27001 no se sustituyen entre sí.',
  },
];

export const governClosing = {
  lead: 'Ya sabes qué ocurre.',
  mid: 'Ya sabes cómo gestionarlo, gobernarlo y protegerlo.',
  next: 'Ahora debes decidir qué hacer.',
  nextStage: 'DECIDIR',
  nextHint: 'Abre DECIDIR para comparar alternativas y construir recomendaciones sustentadas.',
};

export const vagueBenefit = /mejorar\s+ti\b/i;
export const vagueItil = /aplicar\s+itil/i;
export const vagueCobit = /cobit\s+recomienda\s+mejorar/i;
export const vagueIso = /^riesgo de seguridad\.?$/i;
export const isoStructureInItil = /activo[\s,]+amenaza[\s,]+vulnerabilidad/i;
export const managementAction = /reiniciar\s+(el\s+)?servidor|reiniciar\s+firewall|configurar una alerta/i;
export const productControl = /^(comprar|adquirir)\b/i;
export const reviewRequiredMessage =
  'Un hallazgo utilizado cambió. Los análisis relacionados no se borraron: quedaron en REVISIÓN REQUERIDA.';
