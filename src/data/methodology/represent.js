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
    name: 'Canales de venta',
    type: 'Canal',
    category: 'users',
    characteristics: 'Tiendas propias, distribuidores, supermercados y clientes institucionales. El PDF no indica cantidad de tiendas.',
    sourceSectionId: 'context',
    sourceLabel: 'Contexto',
    relatedServiceIds: ['sales'],
    principal: false,
    inDiagram: true,
  },
  {
    id: 'plant',
    name: 'Bogotá',
    type: 'Sede',
    category: 'users',
    characteristics: 'Planta, oficinas y centro de datos. 145 usuarios habituales. Producción 24/6.',
    sourceSectionId: 'context',
    sourceLabel: 'Contexto',
    relatedServiceIds: ['erp', 'production', 'cold-chain'],
    principal: false,
    inDiagram: true,
  },
  {
    id: 'dc',
    name: 'Medellín y Cali',
    type: 'Sede',
    category: 'users',
    characteristics: 'Centros de distribución. 28 usuarios en Medellín; 24 en Cali tras ajuste. 16 h, lunes a sábado.',
    sourceSectionId: 'context',
    sourceLabel: 'Contexto',
    relatedServiceIds: ['erp', 'sales'],
    principal: false,
    inDiagram: true,
  },
  {
    id: 'ecommerce-customers',
    name: 'Usuarios remotos',
    type: 'Usuarios',
    category: 'users',
    characteristics: '38 usuarios de ventas y supervisión por VPN.',
    sourceSectionId: 'context',
    sourceLabel: 'Contexto',
    relatedServiceIds: ['sales'],
    principal: false,
    inDiagram: true,
  },
  {
    id: 'internet',
    name: 'Internet',
    type: 'Conectividad',
    category: 'connectivity',
    characteristics: 'Dos ISP. Enlace principal 500 Mbps y secundario 200 Mbps.',
    sourceSectionId: 'network',
    sourceLabel: 'Red',
    relatedServiceIds: ['sales', 'erp'],
    principal: true,
    inDiagram: true,
  },
  {
    id: 'vpn',
    name: 'VPN',
    type: 'Conectividad / seguridad',
    category: 'connectivity',
    characteristics: 'VPN hacia sedes y usuarios remotos. Depende de FW-01.',
    sourceSectionId: 'network',
    sourceLabel: 'Red',
    relatedServiceIds: ['erp', 'sales'],
    principal: true,
    inDiagram: true,
  },
  {
    id: 'internal-net',
    name: 'Red interna',
    type: 'Conectividad',
    category: 'connectivity',
    characteristics: 'Red corporativa y de planta. Segmentación parcial.',
    sourceSectionId: 'network',
    sourceLabel: 'Red',
    relatedServiceIds: ['erp', 'production', 'cold-chain'],
    principal: false,
    inDiagram: true,
  },
  {
    id: 'firewall',
    name: 'FW-01',
    type: 'Seguridad / conectividad',
    category: 'security',
    characteristics: 'Una instancia principal. Punto único de perímetro.',
    sourceSectionId: 'network',
    sourceLabel: 'Red y seguridad',
    relatedServiceIds: ['erp', 'sales', 'production', 'cold-chain', 'files'],
    principal: true,
    inDiagram: true,
    architectureFact: 'Existe un único firewall principal (FW-01).',
  },
  {
    id: 'ad-srv01',
    name: 'AD-SRV01',
    type: 'Servidor de identidad',
    category: 'security',
    characteristics: '4 vCPU / 12 GB RAM. Active Directory y DNS. Controlador principal único.',
    sourceSectionId: 'infrastructure',
    sourceLabel: 'Infraestructura',
    relatedServiceIds: ['erp', 'files'],
    principal: true,
    inDiagram: true,
  },
  {
    id: 'app-srv01',
    name: 'ERP-APP01',
    type: 'Servidor',
    category: 'applications',
    characteristics: '8 vCPU / 24 GB RAM. Aplicación ERP. Instancia única.',
    sourceSectionId: 'infrastructure',
    sourceLabel: 'Infraestructura',
    relatedServiceIds: ['erp', 'sales'],
    principal: true,
    inDiagram: true,
  },
  {
    id: 'erp-srv01',
    name: 'WEB-APP01',
    type: 'Servidor',
    category: 'applications',
    characteristics: '4 vCPU / 8 GB RAM. Portal de pedidos publicado a Internet.',
    sourceSectionId: 'infrastructure',
    sourceLabel: 'Infraestructura',
    relatedServiceIds: ['sales'],
    principal: true,
    inDiagram: true,
  },
  {
    id: 'wms-srv01',
    name: 'PROD-APP01',
    type: 'Servidor',
    category: 'applications',
    characteristics: '6 vCPU / 16 GB RAM. Producción y lotes. Comparte ERP-DB01.',
    sourceSectionId: 'infrastructure',
    sourceLabel: 'Infraestructura',
    relatedServiceIds: ['production'],
    principal: true,
    inDiagram: true,
  },
  {
    id: 'mes-srv01',
    name: 'COLD-APP01',
    type: 'Servidor',
    category: 'applications',
    characteristics: '4 vCPU / 12 GB RAM. Cadena de frío. Recibe datos de IOT-GW01.',
    sourceSectionId: 'infrastructure',
    sourceLabel: 'Infraestructura',
    relatedServiceIds: ['cold-chain'],
    principal: true,
    inDiagram: true,
  },
  {
    id: 'file-srv01',
    name: 'FILE-SRV01',
    type: 'Servidor',
    category: 'applications',
    characteristics: '4 vCPU / 12 GB RAM. Archivos. Datos alojados en NAS-01.',
    sourceSectionId: 'infrastructure',
    sourceLabel: 'Infraestructura',
    relatedServiceIds: ['files'],
    principal: true,
    inDiagram: true,
  },
  {
    id: 'db-srv01',
    name: 'ERP-DB01',
    type: 'Servidor de base de datos',
    category: 'data',
    characteristics: '12 vCPU / 48 GB RAM. SQL. Instancia única; dependencia crítica.',
    sourceSectionId: 'infrastructure',
    sourceLabel: 'Infraestructura',
    relatedServiceIds: ['erp', 'production', 'sales'],
    principal: true,
    inDiagram: true,
  },
  {
    id: 'nas',
    name: 'NAS-01',
    type: 'Almacenamiento',
    category: 'storage',
    characteristics: 'Capacidad útil 24 TB. Utilizada 19,2 TB (80 %). Crecimiento 650 GB/mes.',
    sourceSectionId: 'storage',
    sourceLabel: 'Almacenamiento',
    relatedServiceIds: ['files', 'erp', 'production'],
    principal: true,
    inDiagram: true,
  },
  {
    id: 'backups',
    name: 'Backups',
    type: 'Continuidad',
    category: 'continuity',
    characteristics: 'Copia externa falló 9 días (9-18 ago.). Última restauración parcial: nov. 2025. No hay prueba integral de restauración del ERP.',
    sourceSectionId: 'backup',
    sourceLabel: 'Backup',
    relatedServiceIds: ['erp', 'files'],
    principal: true,
    inDiagram: true,
  },
  {
    id: 'store-providers',
    name: 'Proveedores de Internet',
    type: 'Dependencia externa',
    category: 'external',
    characteristics: 'Dos ISP en sede principal. No hay segundo centro de datos.',
    sourceSectionId: 'network',
    sourceLabel: 'Red',
    relatedServiceIds: ['erp', 'sales'],
    principal: false,
    inDiagram: true,
  },
  {
    id: 'external-backup',
    name: 'Copia externa de backup',
    type: 'Dependencia externa',
    category: 'external',
    characteristics: 'Copia externa. Falla detectada 9 días después, en agosto de 2026.',
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
    name: 'Correo / Teams',
    type: 'Canal de registro',
    characteristics: 'Los incidentes se registran en correo, Teams y hoja de cálculo. No es un servicio crítico del caso.',
    sourceSectionId: 'operations',
    sourceLabel: 'Operación',
    relatedServiceIds: [],
    trap: true,
    feedback:
      'Este canal existe en el caso, pero no hay evidencia suficiente para afirmar que forma parte directa de esta cadena de servicio.',
  },
];

export const pickerCatalog = [...architectureNodes.filter((item) => item.category !== 'users'), ...pickerTraps];

export const serviceComponentHints = {
  erp: {
    direct: ['app-srv01', 'db-srv01', 'nas', 'firewall', 'ad-srv01', 'internal-net'],
    possible: ['backups', 'file-srv01', 'vpn'],
    unrelated: ['mail', 'mes-srv01'],
  },
  production: {
    direct: ['wms-srv01', 'db-srv01', 'plant', 'internal-net'],
    possible: ['ad-srv01', 'nas', 'backups', 'firewall'],
    unrelated: ['mail', 'erp-srv01', 'ecommerce-customers'],
  },
  sales: {
    direct: ['erp-srv01', 'app-srv01', 'internet', 'firewall', 'db-srv01'],
    possible: ['ad-srv01', 'vpn', 'ecommerce-customers'],
    unrelated: ['mail', 'mes-srv01', 'file-srv01'],
  },
  'cold-chain': {
    direct: ['mes-srv01', 'plant', 'internal-net'],
    possible: ['firewall', 'nas'],
    unrelated: ['mail', 'erp-srv01', 'file-srv01'],
  },
  files: {
    direct: ['file-srv01', 'nas', 'ad-srv01'],
    possible: ['backups', 'firewall'],
    unrelated: ['mail', 'mes-srv01'],
  },
};

export const unrelatedComponentFeedback =
  'Este componente existe en el caso, pero no hay evidencia suficiente para afirmar que forma parte directa de esta cadena de servicio.';

export const asIsTemplate =
  'Los usuarios de [origen] acceden al servicio mediante [conectividad]. El tráfico atraviesa [seguridad] y llega a [aplicación]. Los datos son gestionados por [base de datos] y almacenados en [almacenamiento].';

export const posChainExample = ['plant', 'internal-net', 'firewall', 'app-srv01', 'db-srv01'];

export const posGuideQuestions = [
  {
    id: 'rep-where-data',
    prompt: 'En la cadena del ERP Boreal, ¿dónde están los datos transaccionales?',
    options: [
      { id: 'vpn', label: 'VPN.' },
      { id: 'db-srv01', label: 'ERP-DB01.' },
      { id: 'stores', label: 'En cada sede, de forma exclusiva.' },
      { id: 'mail', label: 'En el correo institucional.' },
    ],
    correctId: 'db-srv01',
    feedbackCorrect: 'Correcto. El caso describe ERP-DB01 como base de datos SQL única.',
    feedbackIncorrect: 'Revisa la cadena: la aplicación ERP llega a los datos en ERP-DB01.',
  },
  {
    id: 'rep-access-control',
    prompt: '¿Qué componente controla el acceso perimetral hacia la red central?',
    options: [
      { id: 'nas', label: 'NAS-01.' },
      { id: 'firewall-vpn', label: 'FW-01 / VPN, según el punto analizado.' },
      { id: 'mail', label: 'Correo.' },
      { id: 'files', label: 'FILE-SRV01.' },
    ],
    correctId: 'firewall-vpn',
    feedbackCorrect: 'Correcto. El perímetro aparece como FW-01 y VPN hacia sedes y remotos.',
    feedbackIncorrect: 'El acceso central se observa en red y seguridad, no en almacenamiento de archivos.',
  },
];

export const caseIncidents = [
  {
    id: 'incident-a',
    letter: 'A',
    title: 'Falla de almacenamiento del ERP (12 jun.)',
    duration: '2 h 20 min',
    impact: 'La base de datos quedó sin respuesta.',
    suggestedComponentIds: ['db-srv01', 'nas'],
  },
  {
    id: 'incident-b',
    letter: 'B',
    title: 'Reinicio no planeado de FW-01 (3 jul.)',
    duration: '1 h 35 min',
    impact: 'VPN de sedes interrumpida.',
    suggestedComponentIds: ['firewall', 'vpn'],
    architectureFact: 'Existe un único firewall principal (FW-01).',
  },
  {
    id: 'incident-c',
    letter: 'C',
    title: 'IOT-GW01 dejó de recibir sensores (19 jul.)',
    duration: '3 h 10 min',
    impact: 'Cadena de frío sin lecturas.',
    suggestedComponentIds: ['mes-srv01'],
  },
  {
    id: 'incident-d',
    letter: 'D',
    title: 'Actualización de conector ERP (7 ago.)',
    duration: '55 min',
    impact: 'Cambio incompatible. La solicitud no incluía riesgo, pruebas ni plan de reversa.',
    suggestedComponentIds: ['app-srv01'],
  },
  {
    id: 'incident-e',
    letter: 'E',
    title: 'Degradación del ERP (28 ago.)',
    duration: '2 h 40 min',
    impact: 'Lentitud en facturación y despacho durante cierre comercial.',
    suggestedComponentIds: ['app-srv01', 'db-srv01'],
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
      'Existe un único firewall (FW-01) y su falla interrumpió la VPN de sedes. ¿Qué conclusión tiene mayor evidencia?',
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
  'Si no existe evidencia de redundancia, ERP-APP01 puede ser un posible SPOF. Eso no se marca solo: debes justificarlo.';

export const externalDependencyNote =
  'Una dependencia externa también puede afectar disponibilidad. Solo se listan las que aparecen en el caso: enlaces de Internet, VPN y copia externa de backup. No hay evidencia de un proveedor de pagos ni de cloud en operación actual.';
