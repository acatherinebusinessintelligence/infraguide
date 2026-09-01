export const methodSteps = [
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
    description: 'Cálculo, comparación, clasificación o relación.',
  },
  {
    id: 'interpret',
    verb: 'INTERPRETAR',
    title: 'QUÉ SIGNIFICA',
    description: 'Interpretación técnica del resultado.',
  },
  {
    id: 'write',
    verb: 'REDACTAR',
    title: 'CÓMO LO ESCRIBO',
    description: 'Forma en que el análisis se incorpora al documento.',
  },
];

export const traceabilityFields = [
  {
    id: 'source',
    label: 'FUENTE',
    caption: 'Dato de origen.',
  },
  {
    id: 'evidence',
    label: 'EVIDENCIA',
    caption: 'Dato utilizado.',
  },
  {
    id: 'processing',
    label: 'PROCESAMIENTO',
    caption: 'Operación realizada.',
  },
  {
    id: 'result',
    label: 'RESULTADO',
    caption: 'Resultado obtenido.',
  },
  {
    id: 'interpretation',
    label: 'INTERPRETACIÓN',
    caption: 'Conclusión técnica.',
  },
  {
    id: 'destination',
    label: 'DESTINO',
    caption: 'Sección del documento donde aparecerá.',
  },
];
