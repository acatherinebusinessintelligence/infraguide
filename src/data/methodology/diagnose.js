export const FINDING_STATUS = {
  DRAFT: 'DRAFT',
  EVIDENCE_SELECTED: 'EVIDENCE_SELECTED',
  INTERPRETED: 'INTERPRETED',
  IMPACT_DEFINED: 'IMPACT_DEFINED',
  VALIDATED: 'VALIDATED',
  DOCUMENTED: 'DOCUMENTED',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
};

export const diagnoseMethodSteps = [
  {
    id: 'search',
    verb: 'OBSERVAR',
    title: '¿QUÉ OBSERVO?',
    description: 'Patrón en datos, incidentes o arquitectura. No es una opinión.',
  },
  {
    id: 'extract',
    verb: 'SUSTENTAR',
    title: '¿QUÉ EVIDENCIA TENGO?',
    description: 'Una o varias evidencias rastreadas hasta el caso.',
  },
  {
    id: 'process',
    verb: 'INTERPRETAR',
    title: '¿QUÉ SIGNIFICA?',
    description: 'El hallazgo explica el dato en el contexto del servicio.',
  },
  {
    id: 'interpret',
    verb: 'VALORAR',
    title: '¿QUÉ IMPACTO Y CRITICIDAD?',
    description: 'Consecuencia sobre negocio o servicio, con justificación.',
  },
  {
    id: 'write',
    verb: 'DOCUMENTAR',
    title: '¿CÓMO LO DOCUMENTO?',
    description: 'Matriz de hallazgos con fuente. Sin recomendación todavía.',
  },
];

export const diagnoseSubstages = [
  { id: 1, key: 'bank', name: 'Evidencias', title: 'Revisar evidencias' },
  { id: 2, key: 'dato', name: 'Dato vs hallazgo', title: 'Diferenciar dato y hallazgo' },
  { id: 3, key: 'build', name: 'Construir', title: 'Construir hallazgos' },
  { id: 4, key: 'impact', name: 'Impacto', title: 'Analizar impacto' },
  { id: 5, key: 'criticality', name: 'Criticidad', title: 'Definir criticidad' },
  { id: 6, key: 'missing', name: 'Ausencia', title: 'Identificar ausencia de evidencia' },
  { id: 7, key: 'classify', name: 'Clasificar', title: 'Clasificar hallazgos' },
  { id: 8, key: 'matrix', name: 'Matriz', title: 'Construir matriz de diagnóstico' },
  { id: 9, key: 'review', name: 'Documentar', title: 'Documentar' },
];

export const diagnoseFinders = {
  bank: {
    id: 'diagnose-bank',
    need: 'Evidencias ya construidas para diagnosticar',
    lookIn: 'Servicios críticos, AS-IS, SPOF, incidentes y métricas',
    lookInSectionId: 'operational-data',
    needed: ['Dato', 'Interpretación previa', 'Fuente', 'Etapa de origen'],
    notYet: ['Recomendación', 'ITIL', 'Compra de tecnología'],
  },
  build: {
    id: 'diagnose-build',
    need: 'Hallazgos técnicos sustentados',
    lookIn: 'Banco de evidencias y el caso',
    lookInSectionId: 'incidents',
    needed: ['Evidencia', 'Interpretación', 'Impacto', 'Criticidad justificada'],
    notYet: ['Solución', 'Migrar a cloud', 'Comprar hardware'],
  },
};

export const diagnoseMethodValues = {
  1: {
    search: 'Qué evidencias ya existen de COMPRENDER, REPRESENTAR y MEDIR.',
    extract: 'Dato, fuente, etapa y para qué sirve.',
    process: 'Filtrar por tema sin inventar nueva infraestructura.',
    interpret: 'Dato no es hallazgo hasta que se interpreta.',
    write: 'Banco de evidencias reutilizable.',
  },
  2: {
    search: 'Pares dato / hallazgo del caso modelo.',
    extract: 'Qué ocurrió frente a qué significa.',
    process: 'Clasificar sin confundir evento con conclusión.',
    interpret: 'El hallazgo se rastrea hasta la evidencia.',
    write: 'Criterio para redactar después.',
  },
  3: {
    search: 'Evidencias del banco, una o varias.',
    extract: 'Patrón observado, no la solución.',
    process: 'Frases del tipo “existe evidencia de…”.',
    interpret: 'Conclusión sustentada, no opinión.',
    write: 'Borrador de hallazgo.',
  },
  4: {
    search: 'Consecuencia sobre servicio, usuario o negocio.',
    extract: 'Categorías de impacto, no la causa.',
    process: 'CPU alta no es impacto; abandono de compras sí.',
    interpret: 'Qué se ve afectado si el hallazgo es cierto.',
    write: 'Campo de impacto.',
  },
  5: {
    search: 'Servicio, usuarios, duración, alternativas.',
    extract: 'Baja, media, alta o crítica, con justificación.',
    process: 'Si todo es crítico, no hay priorización.',
    interpret: 'Criticidad del diagnóstico, no de la implementación.',
    write: 'Criticidad justificada.',
  },
  6: {
    search: 'Lo que el caso no entrega.',
    extract: 'Ausencia de logs, métricas o registro completo.',
    process: 'Documentar la limitación. No inventar el 99 %.',
    interpret: 'La ausencia de información puede ser un hallazgo.',
    write: 'Hallazgo de tipo ausencia.',
  },
  7: {
    search: 'Los hallazgos ya construidos.',
    extract: 'Categoría editable por el estudiante.',
    process: 'Advertir si todos son del mismo tipo.',
    interpret: 'Cobertura del diagnóstico, no un cupo obligatorio.',
    write: 'Clasificación para la matriz.',
  },
  8: {
    search: 'Hallazgos validados.',
    extract: 'Hallazgo, evidencia, impacto, criticidad, fuente.',
    process: 'Ordenar por criticidad. Recomendación pendiente.',
    interpret: 'La matriz es el diagnóstico, no el plan TO-BE.',
    write: '10. Hallazgos / matriz de diagnóstico.',
  },
  9: {
    search: 'Matriz y resumen breve.',
    extract: 'Mínimo 8 hallazgos rastreados al caso.',
    process: 'Resolver revisiones si cambió una evidencia.',
    interpret: 'Ya se puede demostrar qué ocurre.',
    write: 'Cierre y habilitación de GOBERNAR.',
  },
};

export const evidenceFilters = [
  { id: 'all', label: 'Todas' },
  { id: 'service', label: 'Servicio' },
  { id: 'infrastructure', label: 'Infraestructura' },
  { id: 'availability', label: 'Disponibilidad' },
  { id: 'capacity', label: 'Capacidad' },
  { id: 'storage', label: 'Almacenamiento' },
  { id: 'security', label: 'Seguridad' },
  { id: 'backup', label: 'Backup' },
  { id: 'operation', label: 'Operación' },
  { id: 'government', label: 'Gobierno' },
  { id: 'incidents', label: 'Incidentes' },
];

export const findingCategories = [
  { id: 'capacity', label: 'Capacidad' },
  { id: 'availability', label: 'Disponibilidad' },
  { id: 'performance', label: 'Rendimiento' },
  { id: 'storage', label: 'Almacenamiento' },
  { id: 'continuity', label: 'Continuidad' },
  { id: 'monitoring', label: 'Monitoreo' },
  { id: 'security', label: 'Seguridad' },
  { id: 'network', label: 'Red' },
  { id: 'operation', label: 'Operación' },
  { id: 'government', label: 'Gobierno' },
  { id: 'dependency', label: 'Dependencia' },
  { id: 'missing', label: 'Ausencia de información' },
];

export const impactCategories = [
  { id: 'operational', label: 'Operativo' },
  { id: 'financial', label: 'Financiero' },
  { id: 'user', label: 'Usuario' },
  { id: 'continuity', label: 'Continuidad' },
  { id: 'security', label: 'Seguridad' },
  { id: 'regulatory', label: 'Regulatorio' },
  { id: 'reputational', label: 'Reputacional' },
];

export const criticalityLevels = [
  { id: 'low', label: 'Baja' },
  { id: 'medium', label: 'Media' },
  { id: 'high', label: 'Alta' },
  { id: 'critical', label: 'Crítica' },
];

export const criticalityCriteria = [
  'Servicio afectado',
  'Cantidad de usuarios',
  'Duración',
  'Frecuencia',
  'Continuidad',
  'Seguridad',
  'Alternativas',
  'Impacto',
  'Regulación',
];

export const findingStarters = [
  'Existe evidencia de',
  'Se observa',
  'Se identifica riesgo de',
  'Los datos sugieren',
];

export const avoidPhrases = ['definitivamente', 'la única causa es', 'la solución debe ser'];

export const solutionStarts = ['implementar', 'comprar', 'migrar', 'instalar'];

export const weakPatterns = [
  { test: /el servidor est[aá] lento/i, message: 'Este hallazgo es demasiado general. Añade qué ocurre y qué evidencia lo demuestra.' },
  { test: /hay problemas de red/i, message: 'Este hallazgo es demasiado general. Añade qué ocurre y qué evidencia lo demuestra.' },
  { test: /el backup est[aá] mal/i, message: 'Este hallazgo es demasiado general. Añade qué ocurre y qué evidencia lo demuestra.' },
];

export const summaryTemplate =
  'El diagnóstico evidencia principalmente situaciones relacionadas con [categorías principales]. Los hallazgos de mayor criticidad corresponden a [selección], sustentados por [evidencias].';

export const pedagogicalExamples = [
  {
    id: 'ex-capacity',
    title: 'Capacidad / rendimiento',
    evidence: 'CPU 96 %, RAM 88 %, latencia 900 ms, demanda 31 000.',
    finding: 'Existe evidencia de degradación de rendimiento durante periodos de alta demanda.',
    category: 'CAPACIDAD / RENDIMIENTO',
  },
  {
    id: 'ex-storage',
    title: 'Almacenamiento',
    evidence: '16,8 TB / 20 TB, 420 GB/mes, margen ≈7,6 meses, incidente NAS 94 %.',
    finding: 'Existe riesgo de agotamiento progresivo de capacidad de almacenamiento.',
  },
  {
    id: 'ex-monitor',
    title: 'Monitoreo',
    evidence: 'Backup falla dos días sin alerta.',
    finding: 'El monitoreo de respaldos presenta debilidades de detección.',
  },
  {
    id: 'ex-fw',
    title: 'Dependencia',
    evidence: 'Un firewall principal, caída de 4 h, tiendas incomunicadas.',
    finding: 'Existe una dependencia crítica del firewall principal.',
  },
  {
    id: 'ex-change',
    title: 'Cambios / operación',
    evidence: 'Actualización POS sin rollback.',
    finding: 'El proceso de cambios presenta debilidad en planificación de reversa.',
    note: 'No se desarrolla ITIL todavía. Solo se diagnostica.',
  },
  {
    id: 'ex-incidents',
    title: 'Registro de incidentes',
    evidence: 'Canales: mesa, correo, llamadas, mensajería y solicitudes directas. No todos quedan registrados.',
    finding: 'Existe baja trazabilidad consolidada de incidentes.',
  },
  {
    id: 'ex-security',
    title: 'Seguridad',
    evidence: 'Cuentas de exempleados deshabilitadas tardíamente.',
    finding: 'Existe riesgo de acceso no autorizado por debilidad en el ciclo de vida de identidades.',
  },
  {
    id: 'ex-gov',
    title: 'Gobierno',
    evidence: 'Decisiones de capacidad reactivas e inversiones ante urgencias.',
    finding: 'Existe una gestión reactiva de capacidad e inversión tecnológica.',
  },
];

export const baseEvidenceCatalog = [
  {
    id: 'ev-wms',
    filters: ['service'],
    datum: 'WMS — gestión de inventarios y despachos. Criticidad declarada: crítica.',
    interpretation: 'Servicio crítico seleccionado en COMPRENDER.',
    source: 'Servicios tecnológicos',
    sourceSectionId: 'services',
    stage: 'COMPRENDER',
    usableIn: 'Hallazgo de dependencia / continuidad.',
  },
  {
    id: 'ev-mes',
    filters: ['service'],
    datum: 'MES — control de producción. Crítico durante operación de planta.',
    interpretation: 'Servicio crítico de planta.',
    source: 'Servicios tecnológicos',
    sourceSectionId: 'services',
    stage: 'COMPRENDER',
    usableIn: 'Hallazgo de continuidad de producción.',
  },
  {
    id: 'ev-ecom',
    filters: ['service'],
    datum: 'E-commerce — ventas online 24/7. Criticidad alta.',
    interpretation: 'Canal digital dependiente de disponibilidad y rendimiento.',
    source: 'Servicios tecnológicos',
    sourceSectionId: 'services',
    stage: 'COMPRENDER',
    usableIn: 'Hallazgo de rendimiento o disponibilidad.',
  },
  {
    id: 'ev-firewall-unique',
    filters: ['infrastructure', 'network'],
    datum: 'Firewall principal: 1 instancia.',
    interpretation: 'Instancia única en el perímetro.',
    source: 'Red y seguridad',
    sourceSectionId: 'network',
    stage: 'REPRESENTAR',
    usableIn: 'Hallazgo de dependencia / SPOF.',
  },
  {
    id: 'ev-db-srv01',
    filters: ['infrastructure'],
    datum: 'DB-SRV01 — 24 vCPU / 96 GB. Base de datos principal.',
    interpretation: 'Componente de datos del AS-IS.',
    source: 'Infraestructura',
    sourceSectionId: 'infrastructure',
    stage: 'REPRESENTAR',
    usableIn: 'Hallazgo de dependencia de datos.',
  },
  {
    id: 'ev-wms-srv01',
    filters: ['infrastructure', 'service'],
    datum: 'WMS-SRV01 — 16 vCPU / 32 GB. Rol WMS.',
    interpretation: 'Servidor de aplicación del WMS.',
    source: 'Infraestructura',
    sourceSectionId: 'infrastructure',
    stage: 'REPRESENTAR',
    usableIn: 'Hallazgo de capacidad o dependencia.',
  },
  {
    id: 'ev-spof-firewall',
    filters: ['infrastructure', 'network', 'incidents'],
    datum: 'SPOF: firewall justificado — instancia única + incidente B.',
    interpretation: 'Candidato fuerte a punto único de falla.',
    source: 'Red e incidentes',
    sourceSectionId: 'incidents',
    stage: 'REPRESENTAR',
    usableIn: 'Hallazgo de dependencia crítica.',
  },
  {
    id: 'ev-inc-b',
    filters: ['incidents', 'network'],
    datum: 'Incidente B — firewall fuera 4 h. Tiendas pierden conectividad.',
    interpretation: 'Impacto transversal sobre el canal físico.',
    source: 'Incidentes',
    sourceSectionId: 'incidents',
    stage: 'REPRESENTAR',
    usableIn: 'Hallazgo de dependencia / disponibilidad.',
  },
  {
    id: 'ev-inc-c',
    filters: ['incidents', 'storage'],
    datum: 'Incidente C — NAS alcanza 94 %. Eliminación manual urgente.',
    interpretation: 'Presión de almacenamiento observada en incidente.',
    source: 'Incidentes',
    sourceSectionId: 'incidents',
    stage: 'REPRESENTAR',
    usableIn: 'Hallazgo de almacenamiento.',
  },
  {
    id: 'ev-inc-d',
    filters: ['incidents', 'backup'],
    datum: 'Incidente D — backup falla dos días sin generar alerta.',
    interpretation: 'Fallo de respaldo no detectado oportunamente.',
    source: 'Incidentes / Backup',
    sourceSectionId: 'incidents',
    stage: 'REPRESENTAR',
    usableIn: 'Hallazgo de monitoreo / continuidad.',
  },
  {
    id: 'ev-inc-e',
    filters: ['incidents', 'operation'],
    datum: 'Incidente E — actualización POS 1 h 20 min. Sin plan formal de rollback.',
    interpretation: 'Cambio sin reversa planificada.',
    source: 'Incidentes',
    sourceSectionId: 'incidents',
    stage: 'REPRESENTAR',
    usableIn: 'Hallazgo de operación / cambios.',
  },
  {
    id: 'ev-avail',
    filters: ['availability'],
    datum: 'Disponibilidad observada ≈ 98,33 % (720 h / 12 h).',
    interpretation: 'Disponibilidad del periodo. No es el SLA.',
    source: 'Información operacional disponible',
    sourceSectionId: 'operational-data',
    stage: 'MEDIR',
    usableIn: 'Hallazgo de disponibilidad.',
  },
  {
    id: 'ev-mttr',
    filters: ['availability', 'operation'],
    datum: 'MTTR 3,1 h (31 h / 10 incidentes).',
    interpretation: 'Tiempo promedio de restauración.',
    source: 'Información operacional disponible',
    sourceSectionId: 'operational-data',
    stage: 'MEDIR',
    usableIn: 'Hallazgo de recuperación.',
  },
  {
    id: 'ev-mtbf',
    filters: ['availability'],
    datum: 'MTBF estimado ≈ 70,8 h.',
    interpretation: 'Estimación con limitaciones de información.',
    source: 'Información operacional disponible',
    sourceSectionId: 'operational-data',
    stage: 'MEDIR',
    usableIn: 'Hallazgo de disponibilidad / ausencia de detalle.',
  },
  {
    id: 'ev-cpu',
    filters: ['capacity'],
    datum: 'CPU pico 96 % (promedio 78 %).',
    interpretation: 'Pico observado; no equivale al promedio.',
    source: 'Información operacional disponible',
    sourceSectionId: 'operational-data',
    stage: 'MEDIR',
    usableIn: 'Hallazgo de capacidad / rendimiento.',
  },
  {
    id: 'ev-ram',
    filters: ['capacity'],
    datum: 'RAM 88 %.',
    interpretation: 'Uso alto; no autoriza por sí solo una compra.',
    source: 'Información operacional disponible',
    sourceSectionId: 'operational-data',
    stage: 'MEDIR',
    usableIn: 'Hallazgo de capacidad.',
  },
  {
    id: 'ev-latency',
    filters: ['capacity'],
    datum: 'Latencia pico 900 ms (normal 180 ms).',
    interpretation: '≈ 5 veces la latencia normal.',
    source: 'Información operacional disponible',
    sourceSectionId: 'operational-data',
    stage: 'MEDIR',
    usableIn: 'Hallazgo de rendimiento.',
  },
  {
    id: 'ev-demand',
    filters: ['capacity', 'service'],
    datum: 'Demanda pico 31 000 pedidos (normal 14 000).',
    interpretation: '≈ 121 % superior al nivel de referencia.',
    source: 'Información operacional disponible',
    sourceSectionId: 'operational-data',
    stage: 'MEDIR',
    usableIn: 'Hallazgo de capacidad / rendimiento.',
  },
  {
    id: 'ev-storage-used',
    filters: ['storage'],
    datum: 'Almacenamiento 16,8 TB de 20 TB (84 %).',
    interpretation: 'Uso alto; el contexto lo da el crecimiento.',
    source: 'Almacenamiento',
    sourceSectionId: 'storage',
    stage: 'MEDIR',
    usableIn: 'Hallazgo de almacenamiento.',
  },
  {
    id: 'ev-growth',
    filters: ['storage'],
    datum: 'Crecimiento NAS 420 GB/mes.',
    interpretation: 'Ritmo usado para proyectar margen teórico.',
    source: 'Almacenamiento',
    sourceSectionId: 'storage',
    stage: 'MEDIR',
    usableIn: 'Hallazgo de almacenamiento.',
  },
  {
    id: 'ev-margin',
    filters: ['storage'],
    datum: 'Margen teórico ≈ 7,6 meses (crecimiento constante).',
    interpretation: 'No es fecha exacta de agotamiento.',
    source: 'Almacenamiento',
    sourceSectionId: 'storage',
    stage: 'MEDIR',
    usableIn: 'Hallazgo de almacenamiento.',
  },
  {
    id: 'ev-metric-capacity-01',
    filters: ['capacity'],
    datum: 'Evidencia metric-capacity-01: CPU 96 % + latencia 900 ms + demanda 31 000.',
    interpretation: 'Degradación bajo alta demanda (guardada en MEDIR).',
    source: 'Información operacional disponible',
    sourceSectionId: 'operational-data',
    stage: 'MEDIR',
    usableIn: 'Hallazgo de capacidad / rendimiento.',
    fromMetricEvidence: true,
  },
  {
    id: 'ev-stale-accounts',
    filters: ['security'],
    datum: 'Cuentas de exempleados: varias deshabilitadas tardíamente.',
    interpretation: 'Debilidad en el ciclo de vida de identidades.',
    source: 'Seguridad',
    sourceSectionId: 'security',
    stage: 'CASO',
    usableIn: 'Hallazgo de seguridad.',
  },
  {
    id: 'ev-incident-channels',
    filters: ['operation', 'government'],
    datum: 'Incidentes por mesa, correo, llamadas, mensajería y solicitudes directas. No todos quedan registrados.',
    interpretation: 'Trazabilidad consolidada incompleta.',
    source: 'Operación',
    sourceSectionId: 'operations',
    stage: 'CASO',
    usableIn: 'Hallazgo de operación / ausencia de registro.',
  },
  {
    id: 'ev-capacity-reactive',
    filters: ['government'],
    datum: 'Decisiones de capacidad principalmente reactivas. Inversiones ante urgencias.',
    interpretation: 'Gestión reactiva de capacidad e inversión.',
    source: 'Gobierno TI',
    sourceSectionId: 'governance',
    stage: 'CASO',
    usableIn: 'Hallazgo de gobierno.',
  },
  {
    id: 'ev-missing-history',
    filters: ['availability', 'operation'],
    datum: 'No existe un historial completo y uniforme de disponibilidad por servicio.',
    interpretation: 'Limitación de información. No se inventa un 99 %.',
    source: 'Información operacional / gobierno (SLA incompletos)',
    sourceSectionId: 'governance',
    stage: 'CASO',
    usableIn: 'Hallazgo de ausencia de información.',
    missing: true,
  },
];

export const datoVsFindingItems = [
  { id: 'd1', text: 'NAS utilizado 84 %.', correct: 'dato' },
  {
    id: 'h1',
    text: 'Existe riesgo de reducción progresiva del margen de almacenamiento debido al nivel de uso y crecimiento mensual.',
    correct: 'hallazgo',
  },
  { id: 'd2', text: 'Backup falló durante dos días.', correct: 'dato' },
  {
    id: 'h2',
    text: 'Existe debilidad de monitoreo de respaldos, ya que fallos pueden permanecer sin detección.',
    correct: 'hallazgo',
  },
  { id: 'd3', text: 'Firewall estuvo fuera cuatro horas.', correct: 'dato' },
  {
    id: 'h3',
    text: 'La dependencia de un único firewall representa un riesgo significativo para la conectividad de tiendas.',
    correct: 'hallazgo',
  },
];

export const diagnoseActivities = {
  pattern: {
    id: 'd-pattern',
    prompt: '¿Qué patrón aparece en CPU 96 %, latencia 900 ms y demanda 31 000?',
    options: [
      { id: 'a', label: 'Alta demanda coincide con mayor utilización y latencia.' },
      { id: 'b', label: 'El servidor está dañado.' },
      { id: 'c', label: 'Cloud resolverá el problema.' },
      { id: 'd', label: 'No existe ningún patrón.' },
    ],
    correctId: 'a',
    feedbackCorrect: 'Correcto. Describes un patrón. Aún no es la causa ni la solución.',
    feedbackIncorrect: 'Daño o cloud no están demostrados. El patrón es coincidencia de demanda, uso y latencia.',
  },
  impactCpu: {
    id: 'd-impact-cpu',
    prompt: '“CPU elevada”. ¿Es impacto?',
    options: [
      { id: 'yes', label: 'Sí, es el impacto.' },
      { id: 'no', label: 'No.' },
    ],
    correctId: 'no',
    feedbackCorrect: 'El impacto describe la consecuencia sobre el servicio, usuario o negocio. CPU elevada es un dato.',
    feedbackIncorrect: 'CPU elevada describe un estado técnico, no la consecuencia de negocio.',
  },
  impactUser: {
    id: 'd-impact-user',
    prompt: '“Clientes abandonan compras por lentitud”. ¿Es impacto?',
    options: [
      { id: 'yes', label: 'Sí.' },
      { id: 'no', label: 'No, es solo un dato de CPU.' },
    ],
    correctId: 'yes',
    feedbackCorrect: 'Correcto. Describe la consecuencia sobre el usuario y el canal de venta.',
    feedbackIncorrect: 'Esa frase sí es impacto: consecuencia sobre el cliente.',
  },
  missing: {
    id: 'd-missing',
    prompt: 'No existe historial completo de disponibilidad. ¿Qué deberías hacer?',
    options: [
      { id: 'a', label: 'Inventar un porcentaje aproximado.' },
      { id: 'b', label: 'No analizar disponibilidad.' },
      { id: 'c', label: 'Documentar la limitación y plantear ausencia de métricas como hallazgo cuando corresponda.' },
      { id: 'd', label: 'Asumir 99 %.' },
    ],
    correctId: 'c',
    feedbackCorrect: 'Correcto. La ausencia de métricas puede ser un hallazgo. No se inventa el 99 %.',
    feedbackIncorrect: 'No se inventan porcentajes. Se documenta la limitación.',
  },
};

export const diagnoseCheckpoint = [
  {
    id: 'd-q1',
    prompt: '¿Cuál es la diferencia entre dato y hallazgo?',
    options: [
      { id: 'a', label: 'No hay diferencia.' },
      { id: 'b', label: 'El dato describe lo ocurrido; el hallazgo explica qué significa con evidencia.' },
      { id: 'c', label: 'El hallazgo es una opinión del consultor.' },
      { id: 'd', label: 'El dato ya es la recomendación.' },
    ],
    correctId: 'b',
    feedbackCorrect: 'Correcto. Un hallazgo se rastrea hasta la evidencia.',
    feedbackIncorrect: 'CPU 96 % es un dato. El hallazgo interpreta ese dato en contexto.',
  },
  {
    id: 'd-q2',
    prompt: '¿Por qué una evidencia puede estar formada por varios datos?',
    options: [
      { id: 'a', label: 'Para que el informe se vea más largo.' },
      { id: 'b', label: 'Un patrón (demanda + CPU + latencia) sustenta mejor una conclusión que un número aislado.' },
      { id: 'c', label: 'Porque un solo dato está prohibido.' },
      { id: 'd', label: 'Porque así se evita la fuente.' },
    ],
    correctId: 'b',
    feedbackCorrect: 'Correcto. Varios datos del mismo periodo pueden formar una evidencia.',
    feedbackIncorrect: 'Combinar datos relacionados fortalece la interpretación, no reemplaza la fuente.',
  },
  {
    id: 'd-q3',
    prompt: '¿Qué diferencia existe entre impacto y causa?',
    options: [
      { id: 'a', label: 'Son lo mismo.' },
      { id: 'b', label: 'El impacto es la consecuencia; la causa es el origen, y aquí aún no se cierra la causa.' },
      { id: 'c', label: 'El impacto es comprar hardware.' },
      { id: 'd', label: 'La causa es el SLA.' },
    ],
    correctId: 'b',
    feedbackCorrect: 'Correcto. CPU alta no es impacto; abandono de compras sí.',
    feedbackIncorrect: 'No confundas consecuencia de negocio con origen técnico.',
  },
  {
    id: 'd-q4',
    prompt: '¿Por qué no todos los hallazgos deberían clasificarse como críticos?',
    options: [
      { id: 'a', label: 'Porque el color rojo se ve mal.' },
      { id: 'b', label: 'Si todo es crítico, no hay priorización. La criticidad exige justificación.' },
      { id: 'c', label: 'Porque el caso no tiene riesgos.' },
      { id: 'd', label: 'Porque la matriz no admite críticos.' },
    ],
    correctId: 'b',
    feedbackCorrect: 'Correcto. Priorizar es parte del diagnóstico.',
    feedbackIncorrect: 'Criticidad no es un adorno: distingue urgencia relativa.',
  },
  {
    id: 'd-q5',
    prompt: '¿La ausencia de métricas puede ser un hallazgo?',
    options: [
      { id: 'a', label: 'No. Solo cuentan los porcentajes.' },
      { id: 'b', label: 'Sí, si se documenta la limitación y se rastrea al caso.' },
      { id: 'c', label: 'Solo si inventas el valor faltante.' },
      { id: 'd', label: 'Solo en TO-BE.' },
    ],
    correctId: 'b',
    feedbackCorrect: 'Correcto. “No hay evidencia suficiente” es una conclusión válida.',
    feedbackIncorrect: 'No se rellena el vacío con un 99 % inventado.',
  },
];

export const diagnoseClosing = {
  lead: 'Ya sabes qué está ocurriendo y puedes demostrarlo.',
  next: 'Ahora vamos a analizar cómo gestionar, gobernar y proteger estos servicios.',
  nextStage: 'GOBERNAR',
  nextHint: 'Abre GOBERNAR para analizar los hallazgos con ITIL, COBIT e ISO 27001.',
};

export const missingEvidenceMessage =
  'No puedes documentar un hallazgo sin fuente. Selecciona evidencia del banco o declara una ausencia rastreable al caso.';

export const reviewRequiredMessage =
  'Una evidencia utilizada cambió. El hallazgo no se borró: quedó en REVISIÓN REQUERIDA.';
