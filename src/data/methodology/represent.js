export const representMethodSteps = [
  {
    id: 'search',
    verb: 'BUSCAR',
    title: 'DÓNDE BUSCO',
    description: 'Sección del caso donde aparece el componente o la dependencia.',
  },
  {
    id: 'extract',
    verb: 'IDENTIFICAR',
    title: 'QUÉ COMPONENTE EXISTE',
    description: 'Solo elementos con evidencia en el caso. No se inventa infraestructura.',
  },
  {
    id: 'process',
    verb: 'RELACIONAR',
    title: 'QUÉ SERVICIO SOPORTA',
    description: 'Vínculo entre el componente y el servicio crítico.',
  },
  {
    id: 'interpret',
    verb: 'DEPENDER',
    title: 'DE QUÉ DEPENDE / QUÉ PASA SI FALLA',
    description: 'Cadena de prestación e impacto de una interrupción.',
  },
  {
    id: 'write',
    verb: 'DOCUMENTAR',
    title: 'CÓMO LO REPRESENTO Y DOCUMENTO',
    description: 'AS-IS, inventario y matriz SPOF con fuentes.',
  },
];

export const representSubstages = [
  { id: 1, key: 'critical', name: 'Servicios críticos', title: 'Revisar servicios críticos' },
  { id: 2, key: 'components', name: 'Componentes', title: 'Identificar componentes' },
  { id: 3, key: 'inventory', name: 'Inventario', title: 'Construir inventario relevante' },
  { id: 4, key: 'dependencies', name: 'Dependencias', title: 'Relacionar dependencias' },
  { id: 5, key: 'asis', name: 'AS-IS', title: 'Construir AS-IS' },
  { id: 6, key: 'spof', name: 'SPOF', title: 'Identificar SPOF' },
  { id: 7, key: 'review', name: 'Documentar', title: 'Documentar resultados' },
];

export const representFinders = {
  components: {
    id: 'represent-components',
    need: 'Componentes que sostienen los servicios críticos',
    lookIn: 'Infraestructura, red, almacenamiento, backup, seguridad, servicios y dependencias externas',
    lookInSectionId: 'infrastructure',
    needed: [
      'Servidores descritos',
      'Almacenamiento',
      'Firewall y VPN',
      'Internet y enlaces',
      'Backup',
      'Sedes de operación',
    ],
    notYet: ['Diseño TO-BE', 'Cálculo de disponibilidad', 'Capacidad objetivo'],
  },
  inventory: {
    id: 'represent-inventory',
    need: 'Inventario relevante para el análisis',
    lookIn: 'Infraestructura actual y secciones de red, almacenamiento y seguridad',
    lookInSectionId: 'infrastructure',
    needed: ['Componente', 'Tipo', 'Características observadas', 'Servicio relacionado', 'Fuente'],
    notYet: ['Listar todos los activos sin criterio', 'Inventar características no reportadas'],
  },
  dependencies: {
    id: 'represent-dependencies',
    need: 'Cadena de prestación del servicio',
    lookIn: 'Red, seguridad, infraestructura, sedes e incidentes',
    lookInSectionId: 'network',
    needed: ['Origen del usuario', 'Conectividad', 'Seguridad', 'Aplicación', 'Datos'],
    notYet: ['Componentes que no aparecen en el caso', 'Arquitectura futura'],
  },
  spof: {
    id: 'represent-spof',
    need: 'Posibles puntos únicos de falla',
    lookIn: 'Infraestructura, red e incidentes',
    lookInSectionId: 'incidents',
    needed: ['Instancia única', 'Redundancia o failover', 'Incidente asociado', 'Impacto'],
    notYet: ['Marcar SPOF solo porque el nombre es crítico', 'Calcular MTTR'],
  },
};

export const representMethodValues = {
  1: {
    search: 'Documento de COMPRENDER, sección de servicios críticos.',
    extract: 'Los servicios que ya justificaste, no una lista nueva.',
    process: 'Esos servicios son lo que la infraestructura debe sostener.',
    interpret: 'El AS-IS se construye alrededor del negocio crítico, no de todos los servidores.',
    write: 'Punto de partida visible: tus servicios críticos seleccionados.',
  },
  2: {
    search: 'Infraestructura, red, almacenamiento, backup y seguridad.',
    extract: 'Componentes nombrados en el caso.',
    process: 'Asociar cada componente a un servicio, con evidencia.',
    interpret: 'Existir en el inventario no implica participar en esta cadena.',
    write: 'Selección razonada por servicio.',
  },
  3: {
    search: 'Los componentes ya identificados y sus fuentes.',
    extract: 'Solo los que ayudan a entender el servicio o un riesgo.',
    process: 'Un inventario relevante no copia todos los activos.',
    interpret: 'Qué debe aparecer en el informe y qué puede quedar fuera.',
    write: 'Tabla de inventario en el documento.',
  },
  4: {
    search: 'Sedes, red, seguridad e infraestructura.',
    extract: 'Nodos reales para armar la cadena de prestación.',
    process: 'Usuario → conectividad → seguridad → aplicación → datos.',
    interpret: 'Cómo llega un usuario al servicio hoy.',
    write: 'Cadena ordenada, sin nodos inventados.',
  },
  5: {
    search: 'La cadena construida y sus fuentes.',
    extract: 'Nodos, orden y servicio representado.',
    process: 'Describir el estado actual, no el deseado.',
    interpret: 'AS-IS = cómo funciona ahora.',
    write: 'Diagrama más un párrafo de 3 a 5 frases.',
  },
  6: {
    search: 'AS-IS, inventario e incidentes.',
    extract: 'Unicidad, impacto, alternativa, evidencia de falla.',
    process: 'Único no implica SPOF; hace falta justificar.',
    interpret: 'Posible, justificado, sin evidencia o información insuficiente.',
    write: 'Matriz SPOF con fuentes e incidentes.',
  },
  7: {
    search: 'Lo ya documentado en REPRESENTAR.',
    extract: 'Inventario, AS-IS y SPOF.',
    process: 'Verificar trazabilidad y revisiones pendientes.',
    interpret: 'Ya puedes explicar cómo funciona la infraestructura actual.',
    write: 'Cierre de etapa y habilitación de MEDIR.',
  },
};

export const nodeCategories = [
  { id: 'users', label: 'Usuarios / sedes' },
  { id: 'connectivity', label: 'Conectividad' },
  { id: 'security', label: 'Seguridad' },
  { id: 'applications', label: 'Aplicaciones' },
  { id: 'data', label: 'Datos' },
  { id: 'storage', label: 'Almacenamiento' },
  { id: 'continuity', label: 'Continuidad' },
  { id: 'external', label: 'Dependencias externas' },
];

export const architectureNodes = [
  {
    id: 'stores',
    name: 'Tiendas',
    type: 'Sede / canal',
    category: 'users',
    characteristics: '46 tiendas.',
    sourceSectionId: 'context',
    sourceLabel: 'Contexto',
    relatedServiceIds: ['pos'],
    principal: false,
    inDiagram: true,
  },
  {
    id: 'plant',
    name: 'Planta',
    type: 'Sede',
    category: 'users',
    characteristics: 'Planta principal de producción.',
    sourceSectionId: 'context',
    sourceLabel: 'Contexto',
    relatedServiceIds: ['mes'],
    principal: false,
    inDiagram: true,
  },
  {
    id: 'dc',
    name: 'Centro de distribución',
    type: 'Sede',
    category: 'users',
    characteristics: 'Centro de distribución y operación logística.',
    sourceSectionId: 'context',
    sourceLabel: 'Contexto',
    relatedServiceIds: ['wms'],
    principal: false,
    inDiagram: true,
  },
  {
    id: 'ecommerce-customers',
    name: 'Clientes e-commerce',
    type: 'Usuarios externos',
    category: 'users',
    characteristics: 'Canal digital 24/7.',
    sourceSectionId: 'context',
    sourceLabel: 'Contexto',
    relatedServiceIds: ['ecommerce'],
    principal: false,
    inDiagram: true,
  },
  {
    id: 'internet',
    name: 'Internet',
    type: 'Conectividad',
    category: 'connectivity',
    characteristics: '2 enlaces de Internet en sede principal. Algunas tiendas con un único enlace.',
    sourceSectionId: 'network',
    sourceLabel: 'Red',
    relatedServiceIds: ['pos', 'ecommerce', 'wms'],
    principal: true,
    inDiagram: true,
  },
  {
    id: 'vpn',
    name: 'VPN',
    type: 'Conectividad / seguridad',
    category: 'connectivity',
    characteristics: 'VPN hacia tiendas.',
    sourceSectionId: 'network',
    sourceLabel: 'Red',
    relatedServiceIds: ['pos', 'wms'],
    principal: true,
    inDiagram: true,
  },
  {
    id: 'internal-net',
    name: 'Red interna',
    type: 'Conectividad',
    category: 'connectivity',
    characteristics: 'Red corporativa, red de producción y segmentación parcial.',
    sourceSectionId: 'network',
    sourceLabel: 'Red',
    relatedServiceIds: ['erp', 'mes', 'ad'],
    principal: false,
    inDiagram: true,
  },
  {
    id: 'firewall',
    name: 'Firewall',
    type: 'Seguridad / conectividad',
    category: 'security',
    characteristics: '1 instancia principal.',
    sourceSectionId: 'network',
    sourceLabel: 'Red y seguridad',
    relatedServiceIds: ['pos', 'wms', 'ecommerce', 'erp', 'mes'],
    principal: true,
    inDiagram: true,
    architectureFact: 'Existe 1 firewall principal.',
  },
  {
    id: 'ad-srv01',
    name: 'AD-SRV01',
    type: 'Servidor de identidad',
    category: 'security',
    characteristics: '4 vCPU / 16 GB RAM. Windows Server. Rol: Active Directory.',
    sourceSectionId: 'infrastructure',
    sourceLabel: 'Infraestructura',
    relatedServiceIds: ['ad'],
    principal: true,
    inDiagram: true,
  },
  {
    id: 'app-srv01',
    name: 'APP-SRV01',
    type: 'Servidor',
    category: 'applications',
    characteristics: '8 vCPU / 24 GB RAM. Linux. Integración tiendas / POS.',
    sourceSectionId: 'infrastructure',
    sourceLabel: 'Infraestructura',
    relatedServiceIds: ['pos'],
    principal: true,
    inDiagram: true,
  },
  {
    id: 'erp-srv01',
    name: 'ERP-SRV01',
    type: 'Servidor',
    category: 'applications',
    characteristics: '16 vCPU / 64 GB RAM. Windows. Rol: ERP.',
    sourceSectionId: 'infrastructure',
    sourceLabel: 'Infraestructura',
    relatedServiceIds: ['erp'],
    principal: true,
    inDiagram: true,
  },
  {
    id: 'wms-srv01',
    name: 'WMS-SRV01',
    type: 'Servidor',
    category: 'applications',
    characteristics: '16 vCPU / 32 GB RAM. Linux. Rol: WMS.',
    sourceSectionId: 'infrastructure',
    sourceLabel: 'Infraestructura',
    relatedServiceIds: ['wms'],
    principal: true,
    inDiagram: true,
  },
  {
    id: 'mes-srv01',
    name: 'MES-SRV01',
    type: 'Servidor',
    category: 'applications',
    characteristics: '16 vCPU / 32 GB RAM. Windows. Rol: MES.',
    sourceSectionId: 'infrastructure',
    sourceLabel: 'Infraestructura',
    relatedServiceIds: ['mes'],
    principal: true,
    inDiagram: true,
  },
  {
    id: 'file-srv01',
    name: 'FILE-SRV01',
    type: 'Servidor',
    category: 'applications',
    characteristics: '8 vCPU / 24 GB RAM. Windows Server. Rol: archivos.',
    sourceSectionId: 'infrastructure',
    sourceLabel: 'Infraestructura',
    relatedServiceIds: ['files'],
    principal: true,
    inDiagram: true,
  },
  {
    id: 'db-srv01',
    name: 'DB-SRV01',
    type: 'Servidor de base de datos',
    category: 'data',
    characteristics: '24 vCPU / 96 GB RAM. PostgreSQL. Base de datos principal.',
    sourceSectionId: 'infrastructure',
    sourceLabel: 'Infraestructura',
    relatedServiceIds: ['wms', 'erp', 'pos', 'mes', 'ecommerce'],
    principal: true,
    inDiagram: true,
  },
  {
    id: 'nas',
    name: 'NAS',
    type: 'Almacenamiento',
    category: 'storage',
    characteristics: 'Capacidad 20 TB. Utilizada 16,8 TB. Crecimiento 420 GB/mes.',
    sourceSectionId: 'storage',
    sourceLabel: 'Almacenamiento',
    relatedServiceIds: ['files', 'erp', 'wms'],
    principal: true,
    inDiagram: true,
  },
  {
    id: 'backups',
    name: 'Backups',
    type: 'Continuidad',
    category: 'continuity',
    characteristics: 'Backup diario, incrementales cada 6 horas, almacenamiento principal en NAS, pruebas de restauración irregulares.',
    sourceSectionId: 'backup',
    sourceLabel: 'Backup',
    relatedServiceIds: ['erp', 'wms', 'files'],
    principal: true,
    inDiagram: true,
  },
  {
    id: 'store-providers',
    name: 'Proveedores de Internet de tiendas',
    type: 'Dependencia externa',
    category: 'external',
    characteristics: 'Tiendas con diferentes proveedores. Algunas tiendas con un único enlace.',
    sourceSectionId: 'network',
    sourceLabel: 'Red',
    relatedServiceIds: ['pos'],
    principal: false,
    inDiagram: true,
  },
  {
    id: 'external-backup',
    name: 'Copia externa de backup',
    type: 'Dependencia externa',
    category: 'external',
    characteristics: 'Copia externa semanal.',
    sourceSectionId: 'backup',
    sourceLabel: 'Backup',
    relatedServiceIds: ['erp', 'files'],
    principal: false,
    inDiagram: true,
  },
];

export const pickerTraps = [
  {
    id: 'mail',
    name: 'Correo',
    type: 'Servicio',
    characteristics: 'Comunicación institucional.',
    sourceSectionId: 'services',
    sourceLabel: 'Servicios tecnológicos',
    relatedServiceIds: ['mail'],
    trap: true,
    feedback:
      'Este componente existe en el caso, pero no hay evidencia suficiente para afirmar que forma parte directa de esta cadena de servicio.',
  },
];

export const pickerCatalog = [...architectureNodes.filter((item) => item.category !== 'users'), ...pickerTraps];

export const serviceComponentHints = {
  wms: {
    direct: ['wms-srv01', 'db-srv01', 'firewall', 'vpn', 'nas', 'internet', 'dc'],
    possible: ['ad-srv01', 'backups', 'internal-net'],
    unrelated: ['mail', 'file-srv01', 'mes-srv01', 'app-srv01'],
  },
  mes: {
    direct: ['mes-srv01', 'db-srv01', 'plant', 'internal-net', 'firewall'],
    possible: ['ad-srv01', 'nas', 'backups'],
    unrelated: ['mail', 'app-srv01', 'file-srv01', 'ecommerce-customers'],
  },
  ecommerce: {
    direct: ['internet', 'firewall', 'db-srv01', 'ecommerce-customers'],
    possible: ['app-srv01', 'ad-srv01', 'nas'],
    unrelated: ['mail', 'file-srv01', 'mes-srv01'],
  },
  pos: {
    direct: ['stores', 'internet', 'vpn', 'firewall', 'app-srv01', 'db-srv01', 'store-providers'],
    possible: ['ad-srv01'],
    unrelated: ['mail', 'mes-srv01', 'file-srv01'],
  },
  erp: {
    direct: ['erp-srv01', 'db-srv01', 'nas', 'firewall', 'internal-net'],
    possible: ['ad-srv01', 'backups', 'file-srv01'],
    unrelated: ['mail', 'mes-srv01'],
  },
  ad: {
    direct: ['ad-srv01', 'internal-net', 'firewall'],
    possible: ['internet', 'vpn'],
    unrelated: ['mail', 'nas'],
  },
  files: {
    direct: ['file-srv01', 'nas', 'backups'],
    possible: ['ad-srv01', 'firewall'],
    unrelated: ['mail', 'mes-srv01'],
  },
  mail: {
    direct: ['mail', 'internet', 'firewall'],
    possible: ['ad-srv01'],
    unrelated: ['wms-srv01', 'mes-srv01'],
  },
  'cold-chain': {
    direct: ['internet', 'firewall', 'db-srv01'],
    possible: ['app-srv01', 'wms-srv01'],
    unrelated: ['mail', 'file-srv01'],
  },
};

export const unrelatedComponentFeedback =
  'Este componente existe en el caso, pero no hay evidencia suficiente para afirmar que forma parte directa de esta cadena de servicio.';

export const asIsTemplate =
  'Los usuarios de [origen] acceden al servicio mediante [conectividad]. El tráfico atraviesa [seguridad] y llega a [aplicación]. Los datos son gestionados por [base de datos] y almacenados en [almacenamiento].';

export const posChainExample = ['stores', 'internet', 'vpn', 'firewall', 'app-srv01', 'db-srv01'];

export const posGuideQuestions = [
  {
    id: 'rep-where-data',
    prompt: 'En la cadena de POS de tiendas, ¿dónde están los datos?',
    options: [
      { id: 'vpn', label: 'VPN.' },
      { id: 'db-srv01', label: 'DB-SRV01.' },
      { id: 'stores', label: 'En cada tienda, de forma exclusiva.' },
      { id: 'mail', label: 'En el correo institucional.' },
    ],
    correctId: 'db-srv01',
    feedbackCorrect: 'Correcto. El caso describe DB-SRV01 como base de datos principal.',
    feedbackIncorrect: 'Revisa la cadena: la aplicación llega a los datos en DB-SRV01.',
  },
  {
    id: 'rep-access-control',
    prompt: '¿Qué componente controla el acceso hacia la red central?',
    options: [
      { id: 'nas', label: 'NAS.' },
      { id: 'firewall-vpn', label: 'Firewall / VPN, según el punto analizado.' },
      { id: 'mail', label: 'Correo.' },
      { id: 'files', label: 'FILE-SRV01.' },
    ],
    correctId: 'firewall-vpn',
    feedbackCorrect: 'Correcto. El perímetro aparece como firewall principal y VPN hacia tiendas.',
    feedbackIncorrect: 'El acceso central se observa en red y seguridad, no en almacenamiento de archivos.',
  },
];

export const caseIncidents = [
  {
    id: 'incident-a',
    letter: 'A',
    title: 'Alta demanda de e-commerce',
    duration: '2 h 30 min',
    impact: 'Lentitud y abandono de compras.',
    suggestedComponentIds: ['app-srv01', 'db-srv01'],
  },
  {
    id: 'incident-b',
    letter: 'B',
    title: 'Falla del firewall principal',
    duration: '4 horas',
    impact: 'Varias tiendas pierden conectividad con sistemas centrales.',
    suggestedComponentIds: ['firewall'],
    architectureFact: 'Existe 1 firewall principal.',
  },
  {
    id: 'incident-c',
    letter: 'C',
    title: 'NAS alcanza 94 %',
    duration: 'No reportada como caída de servicio',
    impact: 'Se requiere eliminación manual urgente de archivos.',
    suggestedComponentIds: ['nas'],
  },
  {
    id: 'incident-d',
    letter: 'D',
    title: 'Falla de backup sin alerta',
    duration: 'dos días',
    impact: 'Backup falla durante dos días sin generar alerta.',
    suggestedComponentIds: ['backups'],
  },
  {
    id: 'incident-e',
    letter: 'E',
    title: 'Actualización del sistema de integración POS',
    duration: '1 h 20 min',
    impact: 'Interrupción asociada a un cambio en integración POS. No existía plan formal de rollback.',
    suggestedComponentIds: ['app-srv01'],
  },
];

export const spofStatuses = [
  { id: 'no-spof', label: 'No evidencia de SPOF' },
  { id: 'possible', label: 'Posible SPOF' },
  { id: 'justified', label: 'SPOF justificado' },
  { id: 'insufficient', label: 'No hay información suficiente' },
];

export const ternaryOptions = [
  { id: 'yes', label: 'Sí' },
  { id: 'no', label: 'No' },
  { id: 'unclear', label: 'No está claro' },
];

export const spofActivities = [
  {
    id: 'rep-act1',
    prompt: 'Dos servidores de aplicación existen detrás de un balanceador. ¿Cada servidor es automáticamente SPOF?',
    options: [
      { id: 'yes', label: 'Sí, porque cada uno puede fallar.' },
      { id: 'no', label: 'No.' },
    ],
    correctId: 'no',
    feedbackCorrect:
      'La existencia de una alternativa funcional puede eliminar la dependencia de una única instancia.',
    feedbackIncorrect:
      'Si hay una alternativa que asume la función, la instancia individual no se clasifica automáticamente como SPOF.',
  },
  {
    id: 'rep-act2',
    prompt:
      'Existe un único servidor, pero si falla el proceso puede continuar manualmente durante 24 horas. ¿Debe clasificarse automáticamente como SPOF crítico?',
    options: [
      { id: 'yes', label: 'Sí, único implica SPOF crítico.' },
      { id: 'no', label: 'No necesariamente.' },
    ],
    correctId: 'no',
    feedbackCorrect:
      'Único no equivale automáticamente a SPOF crítico. Debes analizar alternativa, impacto y ventana de continuidad.',
    feedbackIncorrect: 'Hay que valorar si existe una alternativa funcional y cuál es el impacto real.',
  },
  {
    id: 'rep-act3',
    prompt:
      'Existe un único firewall y su falla dejó incomunicadas múltiples tiendas. ¿Qué conclusión tiene mayor evidencia?',
    options: [
      { id: 'a', label: 'No es importante.' },
      { id: 'b', label: 'Es un candidato fuerte a SPOF.' },
      { id: 'c', label: 'Debe migrarse a cloud.' },
      { id: 'd', label: 'Hay que comprar dos servidores.' },
    ],
    correctId: 'b',
    feedbackCorrect: 'Correcto. Instancia única + incidente real + impacto transversal son evidencia de SPOF.',
    feedbackIncorrect: 'La evidencia apunta a un candidato fuerte a SPOF; no justifica todavía una solución TO-BE.',
  },
];

export const representCheckpoint = [
  {
    id: 'rep-q1',
    prompt: '¿Qué representa AS-IS?',
    options: [
      { id: 'a', label: 'Cómo debería quedar la infraestructura.' },
      { id: 'b', label: 'Cómo funciona actualmente la infraestructura.' },
      { id: 'c', label: 'El presupuesto aprobado.' },
      { id: 'd', label: 'La estrategia de nube.' },
    ],
    correctId: 'b',
    feedbackCorrect: 'Correcto. AS-IS es el estado actual. TO-BE es el estado futuro.',
    feedbackIncorrect: 'AS-IS describe el presente. Todavía no se diseña cómo debería quedar.',
  },
  {
    id: 'rep-q2',
    prompt: '¿Por qué no debes inventar componentes?',
    options: [
      { id: 'a', label: 'Porque el diagrama se vería vacío.' },
      { id: 'b', label: 'Porque el análisis debe sustentarse en evidencia del caso.' },
      { id: 'c', label: 'Porque el profesor ya conoce la respuesta.' },
      { id: 'd', label: 'Porque cloud está prohibido.' },
    ],
    correctId: 'b',
    feedbackCorrect: 'Correcto. Si no está en el caso, no forma parte del AS-IS.',
    feedbackIncorrect: 'Inventar infraestructura rompe la trazabilidad y mezcla AS-IS con TO-BE.',
  },
  {
    id: 'rep-q3',
    prompt: '¿Qué es una dependencia?',
    options: [
      { id: 'a', label: 'Un servidor con más vCPU.' },
      { id: 'b', label: 'La relación que permite prestar un servicio: de qué elementos depende su funcionamiento.' },
      { id: 'c', label: 'Cualquier archivo en el NAS.' },
      { id: 'd', label: 'Un incidente antiguo.' },
    ],
    correctId: 'b',
    feedbackCorrect: 'Correcto. La cadena muestra cómo llega un usuario al servicio y de qué depende.',
    feedbackIncorrect: 'Dependencia no es tamaño ni inventario: es la relación necesaria para prestar el servicio.',
  },
  {
    id: 'rep-q4',
    prompt: '¿Ser único implica automáticamente ser SPOF?',
    options: [
      { id: 'a', label: 'Sí, siempre.' },
      { id: 'b', label: 'No. Hay que analizar dependencia, redundancia, failover, impacto y alternativa.' },
      { id: 'c', label: 'Sí, si el nombre contiene SRV.' },
      { id: 'd', label: 'Solo si está en la nube.' },
    ],
    correctId: 'b',
    feedbackCorrect: 'Correcto. Único ≠ SPOF automáticamente.',
    feedbackIncorrect: 'Un componente único es un candidato, no una conclusión.',
  },
  {
    id: 'rep-q5',
    prompt: '¿Qué evidencia debes usar para justificar un SPOF?',
    options: [
      { id: 'a', label: 'Solo el nombre del servidor.' },
      { id: 'b', label: 'La criticidad declarada en una tabla, sin más.' },
      { id: 'c', label: 'Arquitectura (p. ej. instancia única), incidente real e impacto sobre el servicio.' },
      { id: 'd', label: 'Una recomendación de compra.' },
    ],
    correctId: 'c',
    feedbackCorrect: 'Correcto. Arquitectura + incidente + impacto sustentan la conclusión.',
    feedbackIncorrect: 'La justificación nace de evidencia arquitectónica y operacional, no del nombre.',
  },
];

export const representClosing = {
  lead: 'Ya puedes explicar cómo funciona la infraestructura actual.',
  next: 'Ahora debemos medir cómo se está comportando.',
  nextStage: 'MEDIR',
  nextHint: 'Disponibilidad, MTTR, MTBF, capacidad y rendimiento. El contenido se desarrollará en una fase posterior.',
};

export const missingEvidenceMessage =
  'Antes de redactar debes identificar qué información del caso sustenta esta conclusión.';

export const asIsChangeWarning =
  'Cambiaste el AS-IS. El análisis SPOF asociado no se borró, pero quedó marcado para revisión.';

export const nasSpofHint =
  'No todo componente importante debe clasificarse como SPOF. Si no puedes afirmar que su falla detiene de inmediato el servicio principal, usa “No hay información suficiente”.';

export const appSrvHint =
  'Si no existe evidencia de redundancia, APP-SRV01 puede ser un posible SPOF. Eso no se marca solo: debes justificarlo.';

export const externalDependencyNote =
  'Una dependencia externa también puede afectar disponibilidad. Solo se listan las que aparecen en el caso: enlaces de Internet, proveedores de tiendas y copia externa de backup. No hay evidencia de un proveedor de pagos ni de cloud en operación actual.';
