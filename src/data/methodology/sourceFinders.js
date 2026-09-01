export const sourceFinders = [
  {
    id: 'availability',
    need: 'Disponibilidad',
    lookIn: 'Información operacional disponible',
    lookInSectionId: 'operational-data',
    needed: ['Periodo observado', 'Indisponibilidad'],
    notYet: ['CPU', 'RAM', 'Número de servidores'],
  },
  {
    id: 'mttr',
    need: 'MTTR',
    lookIn: 'Información operacional disponible',
    lookInSectionId: 'operational-data',
    needed: ['Tiempo total de recuperación', 'Número de incidentes'],
    notYet: ['CPU', 'Latencia', 'Número de tiendas'],
  },
  {
    id: 'capacity',
    need: 'Riesgo de capacidad de almacenamiento',
    lookIn: 'Almacenamiento / Información operacional (NAS)',
    lookInSectionId: 'storage',
    needed: ['Capacidad total', 'Capacidad utilizada', 'Crecimiento'],
    notYet: ['Incidentes', 'MTTR', 'Firewall'],
  },
];

export const findTheDataActivities = [
  {
    id: 'availability-data',
    prompt: 'Necesitas calcular disponibilidad. ¿Qué datos debes buscar?',
    options: [
      { id: 'a', label: 'CPU y RAM.' },
      { id: 'b', label: 'Tiempo observado y tiempo de indisponibilidad.' },
      { id: 'c', label: 'Número de empleados y tiendas.' },
      { id: 'd', label: 'Capacidad de almacenamiento.' },
    ],
    correctId: 'b',
    feedbackCorrect:
      'Correcto. Para calcular disponibilidad necesitas conocer el periodo observado y cuánto tiempo el servicio estuvo indisponible.',
    feedbackIncorrect:
      'No todavía. La disponibilidad se construye con el periodo observado y el tiempo de indisponibilidad, no con inventario ni con carga de CPU.',
  },
  {
    id: 'mttr-data',
    prompt: 'Necesitas calcular MTTR. ¿Qué información debes localizar?',
    options: [
      { id: 'a', label: 'Tiempo total de recuperación y número de incidentes.' },
      { id: 'b', label: 'CPU y latencia.' },
      { id: 'c', label: 'Almacenamiento total y utilizado.' },
      { id: 'd', label: 'Tiempo de operación y usuarios.' },
    ],
    correctId: 'a',
    feedbackCorrect:
      'Correcto. El MTTR requiere el tiempo total de recuperación y la cantidad de incidentes recuperados.',
    feedbackIncorrect:
      'No todavía. CPU, latencia o almacenamiento describen capacidad o rendimiento, no el tiempo medio de recuperación.',
  },
  {
    id: 'storage-data',
    prompt: 'Quieres analizar riesgo de capacidad de almacenamiento. ¿Qué datos son más útiles?',
    options: [
      { id: 'a', label: 'Capacidad total, capacidad utilizada y crecimiento.' },
      { id: 'b', label: 'Incidentes y MTTR.' },
      { id: 'c', label: 'Firewall y VPN.' },
      { id: 'd', label: 'Número de tiendas.' },
    ],
    correctId: 'a',
    feedbackCorrect:
      'Correcto. El riesgo de capacidad se observa con el total, lo ya utilizado y el ritmo de crecimiento.',
    feedbackIncorrect:
      'No todavía. Incidentes, red o tiendas no reemplazan las cifras de capacidad, uso y crecimiento del almacenamiento.',
  },
];

export const readingGuide = [
  'No subrayes todo.',
  'Pregunta qué estás intentando analizar.',
  'Busca la sección relacionada.',
  'Extrae solo los datos necesarios.',
  'Registra siempre la fuente.',
  'No calcules antes de entender qué representa el dato.',
];

export const consultantTips = [
  'Un buen análisis puede rastrear cada conclusión hasta el dato que la originó.',
  'Si no puedes explicar de dónde salió un número, todavía no deberías usarlo en tu informe.',
];

export const identificationTraceFields = [
  { id: 'source', label: 'FUENTE', caption: 'Dato de origen.' },
  { id: 'datum', label: 'DATO', caption: 'Dato utilizado.' },
  { id: 'usedIn', label: 'SE UTILIZA EN', caption: 'Análisis donde se usará.' },
  { id: 'destination', label: 'DESTINO', caption: 'Sección del documento.' },
  { id: 'status', label: 'ESTADO', caption: 'Estado metodológico.' },
];
