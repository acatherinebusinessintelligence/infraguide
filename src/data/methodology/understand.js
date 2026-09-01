export const understandMethodSteps = [
  {
    id: 'search',
    verb: 'BUSCAR',
    title: 'DÓNDE BUSCO',
    description: 'Sección del caso donde se encuentra la información.',
  },
  {
    id: 'extract',
    verb: 'EXTRAER',
    title: 'QUÉ DATO TOMO',
    description: 'Información específica necesaria para el análisis.',
  },
  {
    id: 'process',
    verb: 'PROCESAR',
    title: 'QUÉ HAGO',
    description: 'Relación del dato con el negocio y con lo que se debe proteger.',
  },
  {
    id: 'interpret',
    verb: 'INTERPRETAR',
    title: 'QUÉ SIGNIFICA',
    description: 'Interpretación técnica sustentada en evidencia.',
  },
  {
    id: 'write',
    verb: 'REDACTAR',
    title: 'CÓMO LO ESCRIBO',
    description: 'Forma en que el análisis se incorpora al documento.',
  },
];

export const understandSubstages = [
  { id: 1, key: 'organization', name: 'Organización', title: '¿Qué hace la organización?' },
  { id: 2, key: 'users', name: 'Usuarios y operación', title: '¿Quién utiliza los servicios y cuándo?' },
  { id: 3, key: 'services', name: 'Servicios tecnológicos', title: '¿Qué servicios soportan el negocio?' },
  { id: 4, key: 'criticality', name: 'Criticidad', title: '¿Cuál servicio protegerías primero?' },
  { id: 5, key: 'constraints', name: 'Restricciones', title: '¿Qué limita las decisiones?' },
  { id: 6, key: 'review', name: 'Construir sección del documento', title: 'Revisión de COMPRENDER' },
];

export const understandFinders = {
  organization: {
    id: 'understand-org',
    need: 'Contexto de la organización',
    lookIn: 'Contexto / Información general',
    lookInSectionId: 'context',
    needed: [
      'Actividad principal',
      'Tipo de organización',
      'Sedes',
      'Tamaño',
      'Operación',
      'Canales de atención o venta',
      'Características relevantes del negocio',
    ],
    notYet: ['CPU', 'RAM', 'Capacidad de almacenamiento', 'Tiempos de caída'],
  },
  users: {
    id: 'understand-users',
    need: 'Usuarios y operación',
    lookIn: 'Contexto, servicios y operación actual',
    lookInSectionId: 'operations',
    needed: [
      'Empleados',
      'Usuarios directos',
      'Clientes',
      'Tiendas',
      'E-commerce',
      'Producción',
      'Horarios',
      'Logística',
    ],
    notYet: ['Inventario de servidores', 'Fórmulas de disponibilidad'],
  },
  services: {
    id: 'understand-services',
    need: 'Servicios tecnológicos',
    lookIn: 'Servicios tecnológicos',
    lookInSectionId: 'services',
    needed: ['Nombre del servicio', 'Función', 'Criticidad declarada', 'Quién lo usa', 'Ventana de operación'],
    notYet: ['vCPU', 'RAM', 'Latencia pico'],
  },
  criticality: {
    id: 'understand-criticality',
    need: 'Criticidad de servicios',
    lookIn: 'Servicios tecnológicos y operación',
    lookInSectionId: 'services',
    needed: ['Función del servicio', 'Usuarios', 'Impacto si falla', 'Dependencias', 'Alternativas'],
    notYet: ['Aceptar la criticidad de la tabla sin justificar', 'Elegir por el nombre del servicio'],
  },
  constraints: {
    id: 'understand-constraints',
    need: 'Restricciones del caso',
    lookIn: 'Restricciones',
    lookInSectionId: 'constraints',
    needed: ['Límites financieros', 'Límites operativos', 'Límites tecnológicos', 'Crecimiento', 'Trazabilidad'],
    notYet: ['Diseño detallado de la solución', 'CAPEX/OPEX cerrado'],
  },
};

export const understandMethodValues = {
  1: {
    search: 'Contexto / información general del caso.',
    extract: 'Actividad, sedes, tamaño, canales y operación.',
    process: 'Separar lo que describe el negocio de lo que describe capacidad técnica.',
    interpret: 'Qué necesita proteger la infraestructura y a quién sirve.',
    write: 'Párrafo de contexto en la sección 1 del informe.',
  },
  2: {
    search: 'Contexto, servicios y operación actual.',
    extract: 'Usuarios, canales, horarios y ventanas de servicio.',
    process: 'Clasificar usuarios e interpretar por qué el horario condiciona TI.',
    interpret: 'Quién depende de los servicios y cuándo no se puede interrumpir.',
    write: 'Sección de usuarios y operación.',
  },
  3: {
    search: 'Servicios tecnológicos.',
    extract: 'Función, usuarios, operación y criticidad declarada.',
    process: 'Distinguir servicio de componente de infraestructura.',
    interpret: 'Qué servicios sostienen el negocio, no qué servidor existe.',
    write: 'Listado de servicios tecnológicos revisados.',
  },
  4: {
    search: 'Servicios tecnológicos y operación.',
    extract: 'Función, dependencia e impacto de falla.',
    process: 'Justificar criticidad con evidencia, no copiar la tabla.',
    interpret: 'Qué servicio protegerías primero y por qué.',
    write: 'Tabla de servicios críticos con trazabilidad.',
  },
  5: {
    search: 'Restricciones del caso.',
    extract: 'Límites financieros, operativos, tecnológicos y de crecimiento.',
    process: 'Clasificar y relacionar cada restricción con decisiones futuras.',
    interpret: 'Qué no se puede ignorar al proponer cambios.',
    write: 'Sección de restricciones, con fuentes.',
  },
  6: {
    search: 'Lo ya documentado en COMPRENDER.',
    extract: 'Contexto, usuarios, servicios, criticidad y restricciones.',
    process: 'Verificar evidencia, interpretación y texto en cada sección.',
    interpret: 'La infraestructura debe proteger el negocio comprendido, no al revés.',
    write: 'Cierre de etapa y habilitación de REPRESENTAR.',
  },
};

export const contextEvidence = [
  {
    id: 'activity',
    label: 'Produce y comercializa productos congelados.',
    relevant: true,
    source: 'Contexto - actividad',
    slot: 'activity',
  },
  {
    id: 'stores',
    label: 'Tiene tiendas propias, distribuidores, supermercados y clientes institucionales.',
    relevant: true,
    source: 'Contexto - canales',
    slot: 'coverage',
  },
  {
    id: 'plant',
    label: 'Tiene una planta.',
    relevant: true,
    source: 'Contexto - planta',
    slot: 'coverage',
  },
  {
    id: 'dc',
    label: 'Tiene centros de distribución en Medellín y Cali.',
    relevant: true,
    source: 'Contexto - centro de distribución',
    slot: 'coverage',
  },
  {
    id: 'ecom',
    label: 'Cuenta con portal de ventas y pedidos (WEB-APP01).',
    relevant: true,
    source: 'Servicios - ventas y pedidos',
    slot: 'channels',
  },
  {
    id: 'employees',
    label: 'Bogotá concentra planta, oficinas y centro de datos, con 145 usuarios habituales.',
    relevant: true,
    source: 'Contexto - empleados',
    slot: 'size',
  },
  {
    id: 'users',
    label: 'Tiene 235 usuarios con acceso a servicios tecnológicos corporativos.',
    relevant: true,
    source: 'Contexto - usuarios de sistemas',
    slot: 'size',
  },
  {
    id: 'cpu',
    label: 'CPU pico ERP-APP01 = 92 %.',
    relevant: false,
    laterStage: 'MEDIR',
    feedback:
      'Este dato es válido, pero todavía no pertenece al contexto de la organización. Se utilizará posteriormente en la etapa de medición.',
  },
  {
    id: 'nas',
    label: 'NAS-01 = 19,2 TB usados de 24 TB.',
    relevant: false,
    laterStage: 'MEDIR',
    feedback:
      'Este dato es válido, pero todavía no pertenece al contexto de la organización. Se utilizará posteriormente en la etapa de medición.',
  },
];

export const contextSlots = [
  { id: 'activity', label: 'Actividad' },
  { id: 'coverage', label: 'Cobertura' },
  { id: 'operation', label: 'Operación' },
  { id: 'size', label: 'Tamaño' },
  { id: 'channels', label: 'Canales' },
];

export const contextTemplate =
  '[Organización] es una empresa del sector [sector] dedicada a [actividad]. Su operación incluye [sedes/canales]. Cuenta aproximadamente con [dato] y su operación tecnológica soporta [característica relevante].';

export const contextExample =
  'Helados Boreal S.A.S. es una empresa colombiana mediana dedicada a la fabricación y comercialización de helados, postres congelados y productos de temporada. Su operación principal está en Bogotá, con centros de distribución en Medellín y Cali. La compañía tiene 235 usuarios con acceso a servicios tecnológicos corporativos.';

export const userActors = [
  { id: 'employees', label: 'Usuarios de planta, oficinas y CD en Bogotá', correct: 'internal' },
  { id: 'storeStaff', label: 'Personal de centros de distribución', correct: 'internal' },
  { id: 'ecomCustomers', label: 'Vendedores y supervisión remota', correct: 'internal' },
  { id: 'storeCustomers', label: 'Clientes institucionales y supermercados', correct: 'external' },
  { id: 'sensors', label: 'Sensores de cadena de frío', correct: 'systems' },
];

export const userCategories = [
  { id: 'internal', label: 'Usuarios internos' },
  { id: 'external', label: 'Usuarios externos' },
  { id: 'systems', label: 'Sistemas / dispositivos' },
];

export const operationWindows = [
  { id: 'production', label: 'Producción', value: '24/6' },
  { id: 'stores', label: 'Ventas y pedidos', value: '06:00-22:00' },
  { id: 'ecommerce', label: 'Cadena de frío', value: '24/7' },
  { id: 'logistics', label: 'Centros de distribución', value: '16 h, lunes a sábado' },
];

export const scheduleQuestion = {
  id: 'why-schedule',
  prompt: '¿Por qué importa conocer el horario?',
  options: [
    { id: 'a', label: 'Para decidir el color de los servidores.' },
    { id: 'b', label: 'Porque condiciona disponibilidad, mantenimiento, cambios y recuperación.' },
    { id: 'c', label: 'Solo para calcular empleados.' },
    { id: 'd', label: 'No es relevante.' },
  ],
  correctId: 'b',
  feedbackCorrect:
    'Correcto. El horario define ventanas de cambio, objetivos de disponibilidad y el impacto de una recuperación.',
  feedbackIncorrect:
    'El horario no es un detalle estético ni un dato de nómina: condiciona cuándo se puede intervenir y qué tan grave es una caída.',
};

export const operationsExample =
  'Los servicios tecnológicos son utilizados desde Bogotá, Medellín, Cali y posiciones remotas. La producción opera 24/6; la cadena de frío requiere 24/7; ventas y pedidos operan de 06:00 a 22:00.';

export const serviceComponentItems = [
  { id: 'erp', label: 'ERP Boreal', correct: 'service' },
  { id: 'erp-app01', label: 'ERP-APP01', correct: 'component' },
  { id: 'production', label: 'Producción y lotes', correct: 'service' },
  { id: 'erp-db01', label: 'ERP-DB01', correct: 'component' },
  { id: 'sales', label: 'Ventas y pedidos', correct: 'service' },
  { id: 'firewall', label: 'FW-01', correct: 'component' },
  { id: 'cold-chain', label: 'Cadena de frío', correct: 'service' },
  { id: 'nas', label: 'NAS-01', correct: 'component' },
];

export const serviceComponentCategories = [
  { id: 'service', label: 'Servicio' },
  { id: 'component', label: 'Componente' },
];

export const understandServices = [
  {
    id: 'erp',
    name: 'ERP Boreal',
    description: 'ERP-APP01, ERP-DB01, AD/DNS y NAS. 24/6, con cierres mensuales.',
    declaredCriticality: 'Crítica',
    users: 'Operación administrativa, inventario, crédito y despacho.',
    operation: '24/6; cierres mensuales.',
    failureImpact: 'Se afectan pedidos, inventario, crédito y programación de despacho.',
    alternativeHint: 'No hay alternativa equivalente de corto plazo; el ERP no puede reemplazarse en 18 meses.',
    when: 'Producción 24/6 y cierres',
    sourceSectionId: 'services',
    sourceLabel: 'Servicios tecnológicos',
  },
  {
    id: 'production',
    name: 'Producción y lotes',
    description: 'PROD-APP01, ERP-DB01 y red de planta.',
    declaredCriticality: 'Crítica',
    users: 'Planta de producción.',
    operation: '24/6.',
    failureImpact: 'Se pierde registro de consumos, lotes y producto terminado.',
    alternativeHint: 'Parcial, con riesgo operativo alto.',
    when: 'Ventana de producción 24/6',
    sourceSectionId: 'services',
    sourceLabel: 'Servicios tecnológicos',
  },
  {
    id: 'cold-chain',
    name: 'Cadena de frío',
    description: 'IOT-GW01, COLD-APP01 y red de planta. 96 sensores.',
    declaredCriticality: 'Crítica',
    users: 'Planta, cuartos fríos y vehículos seleccionados.',
    operation: '24/7.',
    failureImpact: 'Se deja de recibir lecturas de temperatura.',
    alternativeHint: 'Monitoreo manual, con menor cobertura.',
    when: 'Continuo 24/7',
    sourceSectionId: 'services',
    sourceLabel: 'Servicios tecnológicos',
  },
  {
    id: 'sales',
    name: 'Ventas y pedidos',
    description: 'WEB-APP01, ERP-APP01 e Internet.',
    declaredCriticality: 'Alta',
    users: 'Vendedores y portal web.',
    operation: '06:00-22:00.',
    failureImpact: 'Se interrumpe la consolidación de pedidos en el ERP.',
    alternativeHint: 'Pedidos por otros canales, con menor integración.',
    when: '06:00-22:00',
    sourceSectionId: 'services',
    sourceLabel: 'Servicios tecnológicos',
  },
  {
    id: 'files',
    name: 'Archivos corporativos',
    description: 'FILE-SRV01, NAS y AD.',
    declaredCriticality: 'Media',
    users: 'Áreas administrativas.',
    operation: '07:00-20:00.',
    failureImpact: 'Se dificulta el acceso a documentos corporativos.',
    alternativeHint: 'Parcial, copias locales no gobernadas.',
    when: 'Jornada administrativa',
    sourceSectionId: 'services',
    sourceLabel: 'Servicios tecnológicos',
  },
];

export const criticalityCriteria = [
  'Usuarios afectados',
  'Impacto operativo',
  'Impacto financiero',
  'Continuidad',
  'Seguridad',
  'Regulación',
  'Horario',
  'Dependencia de otros procesos',
  'Alternativas disponibles',
];

export const impactLevels = [
  { id: 'low', label: 'Bajo' },
  { id: 'medium', label: 'Medio' },
  { id: 'high', label: 'Alto' },
  { id: 'critical', label: 'Crítico' },
];

export const alternativeOptions = [
  { id: 'yes', label: 'Sí' },
  { id: 'partial', label: 'Parcial' },
  { id: 'no', label: 'No' },
  { id: 'unclear', label: 'No está claro' },
];

export const wmsPedagogy = {
  service: 'ERP Boreal',
  datum: 'Soporta pedidos, inventario, crédito y despacho. Criticidad declarada: crítica.',
  impact: 'Una falla afecta la consolidación de pedidos y la programación de despacho.',
  conclusion:
    'El ERP Boreal presenta criticidad crítica porque los pedidos, el inventario y los despachos dependen de él.',
  reminder: 'La conclusión no surge del nombre ERP. Surge de: FUNCIÓN + DEPENDENCIA + IMPACTO.',
  trace: {
    search: 'Servicios tecnológicos.',
    extract: 'ERP Boreal — ERP-APP01, ERP-DB01, AD/DNS, NAS. Crítica.',
    process: 'Analizar función e impacto.',
    interpret: 'Su indisponibilidad afecta la operación comercial y logística.',
    write: 'Servicios críticos.',
  },
};

export const hoursCriticalityQuestion = {
  id: 'same-hours-criticality',
  prompt:
    'La cadena de frío opera 24/7 y los archivos corporativos también pueden consultarse en jornada extendida. ¿Eso significa que tienen la misma criticidad?',
  options: [
    { id: 'yes', label: 'Sí, la ventana de operación iguala la criticidad.' },
    { id: 'no', label: 'No.' },
  ],
  correctId: 'no',
  feedbackCorrect:
    'La ventana de operación es solo uno de los criterios. Debes analizar impacto y dependencia del negocio.',
  feedbackIncorrect:
    'Compartir o acercar horarios no iguala criticidad. La cadena de frío y los archivos corporativos no tienen el mismo impacto de negocio.',
};

export const restrictionItems = [
  {
    id: 'budget',
    label: 'Presupuesto hasta COP 180 millones en doce meses',
    correctType: 'financial',
    suggestedImpact: 'Limita el alcance de inversiones y obliga a priorizar.',
  },
  {
    id: 'production-window',
    label: 'No se puede detener producción de lunes 05:00 a sábado 22:00 salvo emergencia',
    correctType: 'operational',
    suggestedImpact: 'La implementación debe minimizar ventanas de interrupción.',
  },
  {
    id: 'keep-erp',
    label: 'El ERP no puede reemplazarse durante los próximos 18 meses',
    correctType: 'technological',
    suggestedImpact: 'Afecta la estrategia tecnológica: se evoluciona sobre el ERP actual.',
  },
  {
    id: 'keep-stores',
    label: 'No se autoriza aumentar la planta de TI durante 2026',
    correctType: 'operational',
    suggestedImpact: 'La propuesta no puede depender de más personal interno en 2026.',
  },
  {
    id: 'ecom-growth',
    label: 'Adquisiciones superiores a COP 60 millones requieren comité',
    correctType: 'financial',
    suggestedImpact: 'Las compras grandes no se aprueban solo por el equipo de TI.',
  },
  {
    id: 'cloud-ok',
    label: 'Cloud permitido si se justifica',
    correctType: 'technological',
    suggestedImpact: 'Habilita alternativas, pero exige justificación de costo y riesgo.',
  },
  {
    id: 'variable-cost',
    label: 'Preocupación por costos variables',
    correctType: 'financial',
    suggestedImpact: 'Desincentiva modelos de gasto recurrente sin evidencia de valor.',
  },
  {
    id: 'cold-trace',
    label: 'Mantener trazabilidad de cadena de frío',
    correctType: 'security',
    suggestedImpact: 'Cualquier rediseño debe conservar el monitoreo de temperatura.',
  },
];

export const restrictionTypes = [
  { id: 'financial', label: 'Financiera' },
  { id: 'operational', label: 'Operativa' },
  { id: 'technological', label: 'Tecnológica' },
  { id: 'growth', label: 'Crecimiento' },
  { id: 'security', label: 'Seguridad / trazabilidad' },
];

export const restrictionExamples = [
  {
    finding: 'Se necesita mejorar capacidad.',
    restriction: 'Presupuesto limitado.',
    implication: 'No cualquier solución será factible.',
  },
  {
    finding: 'Se necesita mejorar resiliencia.',
    restriction: 'No detener producción.',
    implication: 'La implementación debe minimizar ventanas de interrupción.',
  },
];

export const checkpointQuestions = [
  {
    id: 'q1',
    prompt: '¿Qué hace Helados Boreal?',
    options: [
      { id: 'a', label: 'Fabrica software de punto de venta.' },
      { id: 'b', label: 'Produce, distribuye y comercializa helados y productos congelados.' },
      { id: 'c', label: 'Opera únicamente un centro de datos.' },
      { id: 'd', label: 'Es un proveedor de nube pública.' },
    ],
    correctId: 'b',
    feedbackCorrect: 'Correcto. El negocio es alimentario y de cadena de frío, no un fabricante de infraestructura.',
    feedbackIncorrect: 'Revisa el contexto: la organización produce y comercializa productos congelados.',
  },
  {
    id: 'q2',
    prompt: '¿Quién depende de sus servicios?',
    options: [
      { id: 'a', label: 'Solo el director de TI.' },
      { id: 'b', label: 'Únicamente el proveedor de Internet.' },
      { id: 'c', label: 'Personal interno, canales físicos y digitales, producción y logística.' },
      { id: 'd', label: 'Nadie, mientras los servidores enciendan.' },
    ],
    correctId: 'c',
    feedbackCorrect: 'Correcto. Hay usuarios internos, clientes y operación industrial/logística.',
    feedbackIncorrect: 'Los servicios no existen para el equipo de TI: existen para el negocio y sus usuarios.',
  },
  {
    id: 'q3',
    prompt: '¿Qué diferencia existe entre servicio y componente?',
    options: [
      { id: 'a', label: 'No hay diferencia.' },
      { id: 'b', label: 'El servicio es lo que el negocio usa; el componente es un elemento técnico que lo sostiene.' },
      { id: 'c', label: 'Todo servidor es un servicio.' },
      { id: 'd', label: 'ERP Boreal es un componente y ERP-APP01 es un servicio.' },
    ],
    correctId: 'b',
    feedbackCorrect: 'Correcto. ERP Boreal o cadena de frío son servicios; ERP-APP01 o NAS-01 son componentes.',
    feedbackIncorrect: 'No confundas la función de negocio con el servidor o el almacenamiento que la ejecutan.',
  },
  {
    id: 'q4',
    prompt: '¿Por qué un servicio es crítico?',
    options: [
      { id: 'a', label: 'Porque la tabla del caso usa la palabra “crítico”.' },
      { id: 'b', label: 'Porque su nombre es corto.' },
      { id: 'c', label: 'Por función, dependencia e impacto si falla, sustentados en evidencia.' },
      { id: 'd', label: 'Porque tiene más vCPU.' },
    ],
    correctId: 'c',
    feedbackCorrect: 'Correcto. La criticidad se justifica; no se copia.',
    feedbackIncorrect: 'La etiqueta del caso es un dato inicial, no la conclusión.',
  },
  {
    id: 'q5',
    prompt: '¿Qué restricciones pueden afectar futuras decisiones?',
    options: [
      { id: 'a', label: 'Ninguna: siempre se compra la mejor tecnología.' },
      { id: 'b', label: 'Solo el color corporativo.' },
      { id: 'c', label: 'Presupuesto, ventanas de producción, ERP actual, crecimiento y trazabilidad, entre otras.' },
      { id: 'd', label: 'Únicamente el número de tiendas.' },
    ],
    correctId: 'c',
    feedbackCorrect: 'Correcto. Las restricciones condicionan qué se puede implementar y cuándo.',
    feedbackIncorrect: 'Las restricciones del caso no son decorativas: filtran las soluciones posibles.',
  },
];

export const closingMessages = {
  lead: 'Ya sabes qué necesita proteger la infraestructura.',
  next: 'Ahora vamos a descubrir cómo está construida.',
  nextStage: 'REPRESENTAR',
  nextHint: 'Arquitectura AS-IS. El contenido de esa etapa se desarrollará en una fase posterior.',
};

export const missingEvidenceMessage =
  'Antes de redactar debes identificar qué información del caso sustenta esta conclusión.';
