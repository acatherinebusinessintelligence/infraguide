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
    label: 'Tiene 46 tiendas.',
    relevant: true,
    source: 'Contexto - tiendas',
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
    label: 'Tiene centro de distribución.',
    relevant: true,
    source: 'Contexto - centro de distribución',
    slot: 'coverage',
  },
  {
    id: 'ecom',
    label: 'Cuenta con e-commerce 24/7.',
    relevant: true,
    source: 'Contexto - e-commerce',
    slot: 'channels',
  },
  {
    id: 'employees',
    label: 'Tiene aproximadamente 980 empleados.',
    relevant: true,
    source: 'Contexto - empleados',
    slot: 'size',
  },
  {
    id: 'users',
    label: 'Tiene 420 usuarios directos de sistemas.',
    relevant: true,
    source: 'Contexto - usuarios de sistemas',
    slot: 'size',
  },
  {
    id: 'cpu',
    label: 'CPU APP-SRV01 = 78 %.',
    relevant: false,
    laterStage: 'MEDIR',
    feedback:
      'Este dato es válido, pero todavía no pertenece al contexto de la organización. Se utilizará posteriormente en la etapa de medición.',
  },
  {
    id: 'nas',
    label: 'NAS = 16,8 TB usados.',
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
  'Helados Boreal S.A.S. es una empresa dedicada a la producción, distribución y comercialización de helados y productos congelados. Su operación incluye una planta principal, un centro de distribución, 46 tiendas y un canal de e-commerce. La compañía cuenta con aproximadamente 980 empleados y 420 usuarios directos de sistemas.';

export const userActors = [
  { id: 'employees', label: 'Empleados', correct: 'internal' },
  { id: 'storeStaff', label: 'Personal de tiendas', correct: 'internal' },
  { id: 'ecomCustomers', label: 'Clientes e-commerce', correct: 'external' },
  { id: 'storeCustomers', label: 'Clientes en tiendas', correct: 'external' },
  { id: 'sensors', label: 'Sensores de cadena de frío', correct: 'systems' },
];

export const userCategories = [
  { id: 'internal', label: 'Usuarios internos' },
  { id: 'external', label: 'Usuarios externos' },
  { id: 'systems', label: 'Sistemas / dispositivos' },
];

export const operationWindows = [
  { id: 'production', label: 'Producción', value: '20 horas/día - 6 días/semana' },
  { id: 'stores', label: 'Tiendas', value: 'Todos los días' },
  { id: 'ecommerce', label: 'E-commerce', value: '24/7' },
  { id: 'logistics', label: 'Logística', value: 'Operación extendida' },
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
  'Los servicios tecnológicos son utilizados por personal administrativo, usuarios de tiendas, producción y logística, además de clientes de los canales físicos y digitales. La operación presenta diferentes ventanas de servicio, incluyendo e-commerce 24/7 y producción extendida.';

export const serviceComponentItems = [
  { id: 'pos', label: 'POS', correct: 'service' },
  { id: 'app-srv01', label: 'APP-SRV01', correct: 'component' },
  { id: 'wms', label: 'WMS', correct: 'service' },
  { id: 'db-srv01', label: 'DB-SRV01', correct: 'component' },
  { id: 'ecommerce', label: 'E-commerce', correct: 'service' },
  { id: 'firewall', label: 'Firewall', correct: 'component' },
  {
    id: 'ad',
    label: 'Active Directory',
    correct: 'service',
    note: 'Servicio / servicio de infraestructura según el enfoque del caso.',
  },
  { id: 'nas', label: 'NAS', correct: 'component' },
];

export const serviceComponentCategories = [
  { id: 'service', label: 'Servicio' },
  { id: 'component', label: 'Componente' },
];

export const understandServices = [
  {
    id: 'pos',
    name: 'POS',
    description: 'Registro de ventas en tiendas.',
    declaredCriticality: 'Alta',
    users: 'Personal de tiendas y clientes en puntos de venta.',
    operation: 'Todos los días, en horario de tiendas.',
    failureImpact: 'Se dificulta o detiene el registro de ventas en el canal físico.',
    alternativeHint: 'Parcial: venta manual, con pérdida de control e integración.',
    when: 'Operación de tiendas',
    sourceSectionId: 'services',
    sourceLabel: 'Servicios tecnológicos',
  },
  {
    id: 'erp',
    name: 'ERP',
    description: 'Finanzas, compras, inventario y operación administrativa.',
    declaredCriticality: 'Alta',
    users: 'Áreas administrativas, compras y finanzas.',
    operation: 'Jornada administrativa, con dependencias hacia otros sistemas.',
    failureImpact: 'Se afecta la operación administrativa y la consistencia de inventario y compras.',
    alternativeHint: 'Parcial y de corto plazo, no sustituye el proceso.',
    when: 'Operación administrativa continua',
    sourceSectionId: 'services',
    sourceLabel: 'Servicios tecnológicos',
  },
  {
    id: 'wms',
    name: 'WMS',
    description: 'Gestión de inventarios y despachos del centro de distribución.',
    declaredCriticality: 'Crítica',
    users: 'Centro de distribución / logística.',
    operation: 'Operación logística extendida.',
    failureImpact: 'Se dificulta la preparación y el despacho de pedidos.',
    alternativeHint: 'No está claro que exista una alternativa equivalente.',
    when: 'Operación logística',
    sourceSectionId: 'services',
    sourceLabel: 'Servicios tecnológicos',
  },
  {
    id: 'mes',
    name: 'MES',
    description: 'Control de producción.',
    declaredCriticality: 'Crítica durante operación de planta',
    users: 'Planta de producción.',
    operation: '20 horas al día, 6 días por semana.',
    failureImpact: 'Se pierde visibilidad y control de la producción en curso.',
    alternativeHint: 'Parcial, con riesgo operativo alto.',
    when: 'Ventana de producción',
    sourceSectionId: 'services',
    sourceLabel: 'Servicios tecnológicos',
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'Ventas online.',
    declaredCriticality: 'Alta',
    users: 'Clientes digitales y operación comercial en línea.',
    operation: '24/7',
    failureImpact: 'Se interrumpen compras en línea y puede haber abandono de pedidos.',
    alternativeHint: 'El canal físico no cubre la demanda digital.',
    when: 'Continuo',
    sourceSectionId: 'services',
    sourceLabel: 'Servicios tecnológicos',
  },
  {
    id: 'cold-chain',
    name: 'Integración de cadena de frío',
    description: 'Recepción de datos de temperatura y monitoreo de transporte.',
    declaredCriticality: 'Alta',
    users: 'Logística, calidad y sensores de transporte.',
    operation: 'Operación extendida de distribución refrigerada.',
    failureImpact: 'Se pierde trazabilidad de temperatura en tránsito.',
    alternativeHint: 'Monitoreo manual, con menor cobertura.',
    when: 'Transporte y almacenamiento refrigerado',
    sourceSectionId: 'services',
    sourceLabel: 'Servicios tecnológicos',
  },
  {
    id: 'ad',
    name: 'Active Directory',
    description: 'Identidad y acceso de usuarios y equipos.',
    declaredCriticality: 'Crítica',
    users: 'Todos los usuarios internos de sistemas.',
    operation: 'Continua, como servicio de infraestructura.',
    failureImpact: 'Se afecta el acceso a múltiples servicios dependientes de identidad.',
    alternativeHint: 'No hay alternativa equivalente de corto plazo.',
    when: 'Toda la operación tecnológica',
    sourceSectionId: 'services',
    sourceLabel: 'Servicios tecnológicos',
  },
  {
    id: 'mail',
    name: 'Correo',
    description: 'Comunicación institucional.',
    declaredCriticality: 'Media',
    users: 'Personal administrativo y de soporte.',
    operation: 'Puede permanecer disponible de forma continua.',
    failureImpact: 'Se degrada la coordinación, sin detener necesariamente la producción o el despacho.',
    alternativeHint: 'Sí: otros canales de mensajería, con menor formalidad.',
    when: 'Jornada y soporte',
    sourceSectionId: 'services',
    sourceLabel: 'Servicios tecnológicos',
  },
  {
    id: 'files',
    name: 'Archivos compartidos',
    description: 'Repositorio de documentos y archivos administrativos.',
    declaredCriticality: 'Media',
    users: 'Áreas administrativas.',
    operation: 'Jornada administrativa.',
    failureImpact: 'Se dificulta el acceso a documentos, sin detener la cadena de frío ni el despacho.',
    alternativeHint: 'Parcial, copias locales no gobernadas.',
    when: 'Operación administrativa',
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
  service: 'WMS',
  datum: 'Gestiona inventario y despacho.',
  impact: 'Una falla afecta la preparación de pedidos.',
  conclusion:
    'El WMS presenta criticidad alta/crítica porque soporta directamente la operación del centro de distribución.',
  reminder: 'La conclusión no surge del nombre WMS. Surge de: FUNCIÓN + DEPENDENCIA + IMPACTO.',
  trace: {
    search: 'Servicios tecnológicos.',
    extract: 'WMS gestiona inventario y despachos.',
    process: 'Analizar función e impacto.',
    interpret: 'Su indisponibilidad afecta la operación logística.',
    write: 'Servicios críticos.',
  },
};

export const hoursCriticalityQuestion = {
  id: 'same-hours-criticality',
  prompt:
    'El e-commerce funciona 24/7 y el correo también puede estar disponible 24/7. ¿Eso significa que tienen la misma criticidad?',
  options: [
    { id: 'yes', label: 'Sí, la ventana 24/7 iguala la criticidad.' },
    { id: 'no', label: 'No.' },
  ],
  correctId: 'no',
  feedbackCorrect:
    'La ventana de operación es solo uno de los criterios. Debes analizar impacto y dependencia del negocio.',
  feedbackIncorrect:
    'Compartir horario no iguala criticidad. Un canal de venta y un correo institucional no tienen el mismo impacto de negocio.',
};

export const restrictionItems = [
  {
    id: 'budget',
    label: 'Presupuesto limitado',
    correctType: 'financial',
    suggestedImpact: 'Limita el alcance de inversiones y obliga a priorizar.',
  },
  {
    id: 'production-window',
    label: 'No detener producción por periodos largos',
    correctType: 'operational',
    suggestedImpact: 'La implementación debe minimizar ventanas de interrupción.',
  },
  {
    id: 'keep-erp',
    label: 'No reemplazar ERP a corto plazo',
    correctType: 'technological',
    suggestedImpact: 'Afecta la estrategia tecnológica: se evoluciona sobre el ERP actual.',
  },
  {
    id: 'keep-stores',
    label: 'Mantener operación de tiendas',
    correctType: 'operational',
    suggestedImpact: 'Los cambios no pueden dejar inoperante el canal físico.',
  },
  {
    id: 'ecom-growth',
    label: 'Crecimiento esperado de e-commerce del 35 %',
    correctType: 'growth',
    suggestedImpact: 'La capacidad futura debe contemplar un canal digital en expansión.',
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
      { id: 'd', label: 'WMS es un componente y APP-SRV01 es un servicio.' },
    ],
    correctId: 'b',
    feedbackCorrect: 'Correcto. POS o WMS son servicios; APP-SRV01 o NAS son componentes.',
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
