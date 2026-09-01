export const METRIC_STATUS = {
  MISSING_DATA: 'MISSING_DATA',
  READY_TO_CALCULATE: 'READY_TO_CALCULATE',
  CALCULATED: 'CALCULATED',
  INTERPRETED: 'INTERPRETED',
  DOCUMENTED: 'DOCUMENTED',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
};

export const METRIC_STATUS_LABEL = {
  MISSING_DATA: 'Faltan datos',
  READY_TO_CALCULATE: 'Listo para calcular',
  CALCULATED: 'Calculado',
  INTERPRETED: 'Interpretado',
  DOCUMENTED: 'Documentado',
  REVIEW_REQUIRED: 'Revisión requerida',
};

export const measureMethodSteps = [
  {
    id: 'search',
    verb: 'PREGUNTAR',
    title: '¿QUÉ QUIERO MEDIR?',
    description: 'Define la métrica antes de buscar números.',
  },
  {
    id: 'extract',
    verb: 'LOCALIZAR',
    title: '¿DÓNDE ESTÁ EL DATO?',
    description: 'Sección del caso y evidencia recolectada.',
  },
  {
    id: 'process',
    verb: 'FORMULAR',
    title: '¿QUÉ FÓRMULA USO?',
    description: 'Sustituye solo datos del caso. El estudiante calcula.',
  },
  {
    id: 'interpret',
    verb: 'INTERPRETAR',
    title: '¿QUÉ SIGNIFICA Y QUÉ NO?',
    description: 'Un resultado no es un diagnóstico ni una solución.',
  },
  {
    id: 'write',
    verb: 'DOCUMENTAR',
    title: '¿CÓMO LO ESCRIBO?',
    description: 'Fuente, fórmula, resultado, interpretación y límite.',
  },
];

export const measureSubstages = [
  { id: 1, key: 'prepare', name: 'Preparar datos', title: 'Preparar datos' },
  { id: 2, key: 'availability', name: 'Disponibilidad', title: 'Disponibilidad' },
  { id: 3, key: 'mttr', name: 'MTTR', title: 'MTTR' },
  { id: 4, key: 'mtbf', name: 'MTBF', title: 'MTBF estimado' },
  { id: 5, key: 'capacity', name: 'Capacidad', title: 'Capacidad' },
  { id: 6, key: 'storage', name: 'Almacenamiento', title: 'Almacenamiento y crecimiento' },
  { id: 7, key: 'performance', name: 'Rendimiento', title: 'Rendimiento y latencia' },
  { id: 8, key: 'integrate', name: 'Integrar', title: 'Integrar métricas' },
  { id: 9, key: 'review', name: 'Documentar', title: 'Documentar resultados' },
];

export const measureFinders = {
  prepare: {
    id: 'measure-prepare',
    need: 'Datos para calcular métricas',
    lookIn: 'Información operacional disponible, almacenamiento e incidentes',
    lookInSectionId: 'operational-data',
    needed: ['Periodo observado', 'Indisponibilidad', 'Incidentes', 'Recuperación', 'CPU, RAM, latencia, demanda', 'NAS'],
    notYet: ['Hallazgos', 'Causa raíz', 'Recomendación tecnológica'],
  },
  availability: {
    id: 'measure-availability',
    need: 'Disponibilidad observada',
    lookIn: 'Información operacional disponible',
    lookInSectionId: 'operational-data',
    needed: ['Periodo observado', 'Tiempo de indisponibilidad'],
    notYet: ['SLA', 'Causa de las caídas', 'Diseño TO-BE'],
  },
  mttr: {
    id: 'measure-mttr',
    need: 'Tiempo medio de recuperación',
    lookIn: 'Información operacional disponible',
    lookInSectionId: 'operational-data',
    needed: ['Número de incidentes', 'Tiempo total de recuperación'],
    notYet: ['SLA de recuperación', 'MTBF'],
  },
  mtbf: {
    id: 'measure-mtbf',
    need: 'Tiempo medio entre fallos (estimación)',
    lookIn: 'Información operacional disponible',
    lookInSectionId: 'operational-data',
    needed: ['Periodo', 'Indisponibilidad', 'Incidentes'],
    notYet: ['Marca temporal de cada fallo', 'Definición uniforme de fallo por servicio'],
  },
  capacity: {
    id: 'measure-capacity',
    need: 'Señales de capacidad bajo carga',
    lookIn: 'Información operacional — APP-SRV01',
    lookInSectionId: 'operational-data',
    needed: ['CPU promedio y pico', 'RAM', 'Demanda', 'Latencia'],
    notYet: ['Causa única', 'Decisión de compra'],
  },
  storage: {
    id: 'measure-storage',
    need: 'Uso y margen de almacenamiento',
    lookIn: 'Almacenamiento / NAS',
    lookInSectionId: 'storage',
    needed: ['Capacidad total', 'Utilizado', 'Crecimiento mensual'],
    notYet: ['Fecha exacta de agotamiento', 'Compra de discos'],
  },
  performance: {
    id: 'measure-performance',
    need: 'Degradación de rendimiento',
    lookIn: 'Información operacional — latencia y demanda',
    lookInSectionId: 'operational-data',
    needed: ['Latencia normal y pico', 'Demanda normal y pico'],
    notYet: ['Diagnóstico de red o aplicación', 'Migración a cloud'],
  },
};

export const measureMethodValues = {
  1: {
    search: 'Qué métricas vas a construir en esta etapa.',
    extract: 'Información operacional y almacenamiento del caso.',
    process: 'Separar dato localizado de dato todavía no usable.',
    interpret: 'Listo para calcular no es lo mismo que diagnosticado.',
    write: 'Tablero de preparación. Aún no se redacta el hallazgo.',
  },
  2: {
    search: 'Información operacional disponible.',
    extract: '720 h de periodo y 12 h de indisponibilidad.',
    process: '(Tiempo total − tiempo fuera) / tiempo total × 100.',
    interpret: 'Disponibilidad observada del periodo. No es el SLA.',
    write: 'Subsección de disponibilidad con fórmula y límite.',
  },
  3: {
    search: 'Información operacional: incidentes y recuperación.',
    extract: '10 incidentes y 31 h de recuperación.',
    process: '31 / 10.',
    interpret: 'Promedio de restauración, no la duración de cada incidente.',
    write: 'Subsección MTTR.',
  },
  4: {
    search: 'Periodo, indisponibilidad e incidentes.',
    extract: 'Tiempo operativo estimado 708 h e incidentes 10.',
    process: '708 / 10. Es una estimación.',
    interpret: 'Presentar con limitaciones, no como valor exacto.',
    write: 'MTBF estimado y su advertencia.',
  },
  5: {
    search: 'CPU, RAM, demanda y latencia del mismo periodo.',
    extract: '78→96 % CPU, 88 % RAM, 14 000→31 000, 180→900 ms.',
    process: 'Relacionar variables. No forzar una causa.',
    interpret: 'Patrón de degradación bajo alta demanda.',
    write: 'Capacidad y rendimiento cualitativo.',
  },
  6: {
    search: 'Almacenamiento / NAS.',
    extract: '20 TB, 16,8 TB usados, 420 GB/mes.',
    process: 'Libre, porcentaje y proyección a ritmo constante.',
    interpret: 'Margen teórico, no fecha exacta de agotamiento.',
    write: 'Almacenamiento y crecimiento.',
  },
  7: {
    search: 'Latencia y demanda observadas.',
    extract: '180 ms vs 900 ms; 14 000 vs 31 000 pedidos.',
    process: '900/180 y el incremento relativo de demanda.',
    interpret: 'Disponible no implica que responda bien.',
    write: 'Rendimiento y latencia.',
  },
  8: {
    search: 'Las métricas ya calculadas.',
    extract: 'Resultados y sus limitaciones.',
    process: 'Armar el panel de evidencia. Sin semáforos automáticos.',
    interpret: 'Qué se puede afirmar y qué queda para diagnosticar.',
    write: 'Evidencias reutilizables para DIAGNOSTICAR.',
  },
  9: {
    search: 'Sección de métricas del documento.',
    extract: 'Subsecciones con fórmula y fuente.',
    process: 'Verificar revisión requerida y evidencias.',
    interpret: 'Los datos ya son evidencia, no todavía hallazgos.',
    write: 'Cierre de MEDIR y habilitación de DIAGNOSTICAR.',
  },
};

export const measureFactKeys = [
  'periodHours',
  'downtimeHours',
  'incidentCount',
  'totalRecoveryHours',
  'appCpuAverage',
  'appCpuPeak',
  'appRamUsage',
  'appLatencyNormal',
  'appLatencyPeak',
  'appDemandNormal',
  'appDemandPeak',
  'storageCapacity',
  'storageUsed',
  'storageGrowth',
];

export const metricDefinitions = [
  {
    id: 'availability',
    label: 'Disponibilidad',
    requiredKeys: ['periodHours', 'downtimeHours'],
    readyWhenComplete: 'LISTO PARA CALCULAR',
  },
  {
    id: 'mttr',
    label: 'MTTR',
    requiredKeys: ['incidentCount', 'totalRecoveryHours'],
    readyWhenComplete: 'LISTO PARA CALCULAR',
  },
  {
    id: 'mtbf',
    label: 'MTBF',
    requiredKeys: ['periodHours', 'downtimeHours', 'incidentCount'],
    readyWhenComplete: 'ESTIMABLE CON LIMITACIONES',
    limited: true,
  },
  {
    id: 'capacity',
    label: 'Capacidad',
    requiredKeys: ['appCpuAverage', 'appCpuPeak', 'appRamUsage', 'appDemandNormal', 'appDemandPeak', 'appLatencyNormal', 'appLatencyPeak'],
    readyWhenComplete: 'LISTO PARA INTERPRETAR',
  },
  {
    id: 'storage',
    label: 'Almacenamiento',
    requiredKeys: ['storageCapacity', 'storageUsed', 'storageGrowth'],
    readyWhenComplete: 'LISTO PARA CALCULAR',
  },
  {
    id: 'performance',
    label: 'Rendimiento',
    requiredKeys: ['appLatencyNormal', 'appLatencyPeak', 'appDemandNormal', 'appDemandPeak'],
    readyWhenComplete: 'LISTO PARA CALCULAR',
  },
];

export const expectedResults = {
  uptimeHours: 708,
  availabilityPercent: 98.33,
  mttrHours: 3.1,
  mtbfHours: 70.8,
  storageFreeTb: 3.2,
  storageUsedPercent: 84,
  storageMonths: 7.62,
  latencyRatio: 5,
  demandIncreasePercent: 121.43,
};

export const availabilityLimits = [
  'que el SLA se cumple',
  'que la disponibilidad sea suficiente',
  'cuál fue la causa de las caídas',
  'qué solución tecnológica debe implementarse',
];

export const availabilityMissingForConclusion = ['SLA', 'criticidad', 'causa', 'impacto', 'estrategia'];

export const mtbfNeedsForPrecision = [
  'momento exacto de cada fallo',
  'duración de cada fallo',
  'definición uniforme de qué eventos cuentan como fallo',
  'si todos los incidentes corresponden al mismo servicio',
];

export const storageContextNeeded = ['crecimiento', 'umbral', 'criticidad', 'políticas', 'capacidad futura'];

export const templates = {
  availability:
    'Durante el periodo analizado de [periodo], el servicio presentó [indisponibilidad] de indisponibilidad. Aplicando la fórmula de disponibilidad se obtiene aproximadamente [resultado]. Este resultado debe contrastarse con [criterio] antes de determinar si el nivel de servicio es adecuado.',
  mttr:
    'Durante el periodo analizado se registraron [n] incidentes y [h] horas totales de recuperación. El MTTR calculado es de [resultado] horas por incidente, lo que representa el tiempo promedio empleado para restaurar el servicio.',
  mtbf:
    'Con los datos disponibles se estima un MTBF aproximado de [resultado] horas. Este valor debe interpretarse con cautela debido a que el caso no proporciona el detalle temporal completo de todos los fallos.',
  capacity:
    'Durante periodos de alta demanda se observan picos de CPU de 96 %, uso de RAM de 88 % y aumento de latencia desde 180 ms hasta 900 ms. Los datos sugieren presión de capacidad o degradación bajo carga, aunque no permiten determinar por sí solos una causa única.',
  storage:
    'El almacenamiento utiliza actualmente [x] TB de una capacidad total de [y] TB, equivalente a [z] %. Con un crecimiento aproximado de [g] GB mensuales, el margen teórico disponible es cercano a [m] meses si la tendencia se mantiene.',
  performance:
    'La latencia aumenta de aproximadamente 180 ms en condiciones normales a 900 ms durante alta demanda, es decir, cerca de cinco veces el valor habitual. Esto evidencia degradación de rendimiento aun cuando el servicio pueda permanecer técnicamente disponible.',
};

export const measureActivities = {
  availabilityAffirm: {
    id: 'm-avail-affirm',
    prompt: '¿Qué puedes afirmar con evidencia?',
    options: [
      { id: 'a', label: 'El servicio estuvo disponible aproximadamente 98,33 % del periodo.' },
      { id: 'b', label: 'La disponibilidad es excelente.' },
      { id: 'c', label: 'El servicio cumple el SLA.' },
      { id: 'd', label: 'La infraestructura debe migrarse a cloud.' },
    ],
    correctId: 'a',
    feedbackCorrect: 'Correcto. Solo puedes afirmar lo que el cálculo y el periodo sustentan.',
    feedbackIncorrect: 'Excelente, SLA o cloud no están demostrados con este único número.',
  },
  mttrMeaning: {
    id: 'm-mttr-mean',
    prompt: '¿Qué significa el MTTR de 3,1 h?',
    options: [
      { id: 'a', label: 'Todos los incidentes duran exactamente 3,1 h.' },
      { id: 'b', label: 'En promedio, recuperar el servicio ha requerido 3,1 h por incidente.' },
      { id: 'c', label: 'El sistema falla cada 3,1 h.' },
      { id: 'd', label: 'El SLA es 3,1 h.' },
    ],
    correctId: 'b',
    feedbackCorrect: 'Correcto. Es un promedio de restauración, no la duración de cada evento ni el SLA.',
    feedbackIncorrect: '3,1 h no es la duración de todos los incidentes, ni el intervalo entre fallos, ni un SLA.',
  },
  mtbfPresent: {
    id: 'm-mtbf-present',
    prompt: '¿Cómo deberías presentar 70,8 h?',
    options: [
      { id: 'a', label: 'Como un valor exacto.' },
      { id: 'b', label: 'Como una estimación con limitaciones de información.' },
      { id: 'c', label: 'Como el SLA.' },
      { id: 'd', label: 'Como MTTR.' },
    ],
    correctId: 'b',
    feedbackCorrect: 'Correcto. El caso no da el detalle temporal completo de cada fallo.',
    feedbackIncorrect: '70,8 h no es exacto, no es el SLA y no es MTTR.',
  },
  capacityPattern: {
    id: 'm-cap-pattern',
    prompt: 'Demanda 14.000 → 31.000. CPU 78 % → 96 % pico. Latencia 180 → 900 ms. ¿Qué patrón observas?',
    options: [
      { id: 'a', label: 'La demanda aumenta mientras CPU y latencia también aumentan.' },
      { id: 'b', label: 'El servidor está dañado.' },
      { id: 'c', label: 'El firewall es la causa.' },
      { id: 'd', label: 'La solución es cloud.' },
    ],
    correctId: 'a',
    feedbackCorrect: 'Correcto. Describes un patrón observado, no una causa ni una solución.',
    feedbackIncorrect: 'Los datos no demuestran daño, firewall ni cloud. Solo un patrón conjunto.',
  },
  peakEqualsAverage: {
    id: 'm-cap-peak',
    prompt: 'CPU promedio 78 % y CPU pico 96 %. ¿Son equivalentes?',
    options: [
      { id: 'yes', label: 'Sí, miden lo mismo.' },
      { id: 'no', label: 'No.' },
    ],
    correctId: 'no',
    feedbackCorrect: 'El promedio describe el comportamiento general. El pico es el máximo observado. Un pico aislado no demuestra presión sostenida.',
    feedbackIncorrect: 'Promedio y pico no son intercambiables.',
  },
  ramBuy: {
    id: 'm-cap-ram',
    prompt: '¿88 % de RAM significa automáticamente que debes comprar memoria?',
    options: [
      { id: 'yes', label: 'Sí.' },
      { id: 'no', label: 'No.' },
    ],
    correctId: 'no',
    feedbackCorrect: 'Debe analizarse junto con duración, comportamiento, paginación, aplicación y rendimiento.',
    feedbackIncorrect: 'Un porcentaje alto no autoriza, por sí solo, una compra.',
  },
  storageWait: {
    id: 'm-sto-wait',
    prompt: '¿Debemos esperar 7,6 meses para actuar?',
    options: [
      { id: 'yes', label: 'Sí, hay margen exacto.' },
      { id: 'no', label: 'No.' },
    ],
    correctId: 'no',
    feedbackCorrect: 'La proyección permite anticipar el riesgo antes de alcanzar niveles críticos.',
    feedbackIncorrect: '7,6 meses no es una cita de espera. Es un margen teórico con supuesto de crecimiento constante.',
  },
  availableSlow: {
    id: 'm-perf-avail',
    prompt: '¿Puede existir un problema aunque el servicio no esté caído?',
    options: [
      { id: 'yes', label: 'Sí.' },
      { id: 'no', label: 'No, si está disponible no hay problema.' },
    ],
    correctId: 'yes',
    feedbackCorrect: 'Disponibilidad evalúa si el servicio está operativo. Rendimiento analiza cómo responde.',
    feedbackIncorrect: 'Un servicio puede estar “arriba” y responder mal.',
  },
  integrate: {
    id: 'm-int-conclusion',
    prompt: 'CPU 96 %, latencia 900 ms, demanda 31.000, RAM 88 %. ¿Cuál conclusión está mejor sustentada?',
    options: [
      { id: 'a', label: 'El servidor debe reemplazarse.' },
      { id: 'b', label: 'Existe evidencia de degradación durante alta demanda.' },
      { id: 'c', label: 'Cloud solucionará el problema.' },
      { id: 'd', label: 'La red está dañada.' },
    ],
    correctId: 'b',
    feedbackCorrect: 'Correcto. Es lo que los datos permiten afirmar sin saltar a la solución.',
    feedbackIncorrect: 'Reemplazo, cloud o red dañada no están demostrados por este conjunto.',
  },
};

export const measureCheckpoint = [
  {
    id: 'm-q1',
    prompt: '¿De qué sección salieron los datos de disponibilidad?',
    options: [
      { id: 'a', label: 'Restricciones del caso.' },
      { id: 'b', label: 'Información operacional disponible.' },
      { id: 'c', label: 'Estrategia tecnológica.' },
      { id: 'd', label: 'ISO 27001.' },
    ],
    correctId: 'b',
    feedbackCorrect: 'Correcto. Periodo e indisponibilidad están en información operacional.',
    feedbackIncorrect: 'Vuelve a SourceFinder: la fuente es información operacional disponible.',
  },
  {
    id: 'm-q2',
    prompt: '¿Qué diferencia existe entre MTTR y MTBF?',
    options: [
      { id: 'a', label: 'No hay diferencia.' },
      { id: 'b', label: 'MTTR es el tiempo promedio de recuperación; MTBF estima el tiempo entre fallos.' },
      { id: 'c', label: 'MTBF es un porcentaje de disponibilidad.' },
      { id: 'd', label: 'MTTR es el SLA.' },
    ],
    correctId: 'b',
    feedbackCorrect: 'Correcto. Recuperar no es lo mismo que el intervalo entre fallos.',
    feedbackIncorrect: 'MTTR recupera; MTBF estima el tiempo entre fallos.',
  },
  {
    id: 'm-q3',
    prompt: '¿Un CPU de 96 % demuestra por sí solo saturación?',
    options: [
      { id: 'a', label: 'Sí, siempre.' },
      { id: 'b', label: 'No. Hay que ver duración, demanda, latencia y si el pico es sostenido.' },
      { id: 'c', label: 'Sí, y obliga a comprar CPU.' },
      { id: 'd', label: 'Solo si el servidor se llama APP-SRV01.' },
    ],
    correctId: 'b',
    feedbackCorrect: 'Correcto. Un pico no demuestra, solo, saturación sostenida.',
    feedbackIncorrect: '96 % es una señal, no un veredicto automático.',
  },
  {
    id: 'm-q4',
    prompt: '¿Qué supuesto utilizaste para proyectar almacenamiento?',
    options: [
      { id: 'a', label: 'Que el crecimiento se detendrá.' },
      { id: 'b', label: 'Crecimiento constante, similar al ritmo observado.' },
      { id: 'c', label: 'Que el NAS se duplicará.' },
      { id: 'd', label: 'Ninguno: la fecha es exacta.' },
    ],
    correctId: 'b',
    feedbackCorrect: 'Correcto. La proyección no es una fecha de agotamiento exacta.',
    feedbackIncorrect: 'El margen de ~7,6 meses asume crecimiento constante.',
  },
  {
    id: 'm-q5',
    prompt: '¿Por qué disponibilidad y rendimiento no son lo mismo?',
    options: [
      { id: 'a', label: 'Porque usan la misma fórmula.' },
      { id: 'b', label: 'Disponibilidad indica si el servicio opera; rendimiento, cómo responde.' },
      { id: 'c', label: 'Porque ambas son SLA.' },
      { id: 'd', label: 'No hay diferencia académica.' },
    ],
    correctId: 'b',
    feedbackCorrect: 'Correcto. Un servicio puede estar disponible y ser lento.',
    feedbackIncorrect: 'Operar no equivale a responder con calidad.',
  },
];

export const measureClosing = {
  lead: 'Ya transformaste datos en evidencia.',
  next: 'Ahora debes convertir esa evidencia en hallazgos.',
  nextStage: 'DIAGNOSTICAR',
  nextHint: 'Abre DIAGNOSTICAR para convertir evidencia en hallazgos sustentados.',
};

export const missingEvidenceMessage =
  'Antes de documentar debes calcular, interpretar y redactar con fuente y fórmula. Un resultado sin fuente es solo un número.';

export const reviewRequiredMessage =
  'Un dato usado en esta métrica se retiró o cambió. El análisis no se borró: quedó en REVISIÓN REQUERIDA.';
