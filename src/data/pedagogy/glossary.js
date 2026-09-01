export const FEEDBACK_STATUS = {
  CORRECT: 'CORRECTO',
  PARTIAL: 'PARCIALMENTE CORRECTO',
  REVIEW_DATA: 'REVISAR DATOS',
  INSUFFICIENT: 'INFORMACIÓN INSUFICIENTE',
  DONT_CONFUSE: 'NO CONFUNDIR',
};

export const PEDAGOGY_LEVEL = {
  UNDERSTAND: 1,
  APPLY: 2,
  ANALYZE: 3,
};

export const PEDAGOGY_LEVEL_LABEL = {
  1: 'Comprender',
  2: 'Aplicar',
  3: 'Analizar',
};

/** Umbral de ejercicio. No está aprobado en el PDF del caso. */
export const STORAGE_EXERCISE_THRESHOLD = {
  ratio: 0.85,
  label: '85 %',
  note: 'Umbral de trabajo pedagógico. El PDF no aprueba un umbral de 85 %.',
};

export const glossaryTerms = [
  { id: 'asis', term: 'AS-IS', definition: 'Representación de la arquitectura y los flujos tal como operan hoy, sin el diseño futuro.', use: 'Identificar dependencias y puntos únicos antes de proponer cambios.' },
  { id: 'tobe', term: 'TO-BE', definition: 'Arquitectura objetivo de referencia. No es un diseño definitivo hasta validar compatibilidad y pruebas.', use: 'Orientar requisitos e inversión sin presentarla como cotización.' },
  { id: 'activo', term: 'Activo', definition: 'Recurso de información o infraestructura que el negocio necesita proteger o sostener.', use: 'Anclar el riesgo a algo concreto (datos, identidad, NAS, ERP).' },
  { id: 'dependencia', term: 'Dependencia', definition: 'Relación en la que un servicio o componente necesita de otro para funcionar.', use: 'Ver qué se cae si falla un nodo de la cadena AS-IS.' },
  { id: 'spof', term: 'SPOF', definition: 'Punto único de falla: un componente cuya pérdida interrumpe el servicio porque no hay alternativa efectiva.', use: 'Distinguir redundancia aparente (dos hipervisores) de redundancia efectiva (aplicación única).' },
  { id: 'redundancia', term: 'Redundancia', definition: 'Existencia de una alternativa real que puede asumir la carga si el componente principal falla.', use: 'No basta con “hay dos equipos”: hay que ver si cubren el mismo servicio.' },
  { id: 'alta-disponibilidad', term: 'Alta disponibilidad', definition: 'Diseño para que el servicio siga operativo ante fallos previstos, con conmutación ensayada.', use: 'No se afirma solo porque el porcentaje del periodo sea alto.' },
  { id: 'disponibilidad', term: 'Disponibilidad', definition: 'Porcentaje de tiempo, en un periodo y alcance definidos, en que el servicio estuvo operativo.', use: 'Línea base observada. No es automáticamente un SLA.' },
  { id: 'incidente', term: 'Incidente', definition: 'Interrupción o degradación no planificada que afecta un servicio.', use: 'Alimenta MTTR, disponibilidad y el registro de modos de falla.' },
  { id: 'problema', term: 'Problema', definition: 'Causa o deficiencia subyacente que puede originar uno o varios incidentes.', use: 'Evita tratar solo el síntoma (reiniciar) sin cerrar la causa.' },
  { id: 'cambio', term: 'Cambio', definition: 'Modificación controlada de un servicio o componente, con riesgo, pruebas y reversa.', use: 'Un cambio sin reversa es un hallazgo operativo, no un “detalle”.' },
  { id: 'mttr', term: 'MTTR', definition: 'Tiempo medio de reparación o restauración: promedio del tiempo para recuperar el servicio tras un fallo.', use: 'Mide capacidad operativa de recuperación. No es el tiempo máximo ni el RTO.' },
  { id: 'mtbf', term: 'MTBF', definition: 'Tiempo medio entre fallos. En este caso es una estimación con limitaciones de información.', use: 'No usarlo como garantía de intervalo entre fallos.' },
  { id: 'mttd', term: 'MTTD', definition: 'Tiempo medio de detección: cuánto tarda en advertirse un fallo.', use: 'El caso no entrega un MTTD calculable como serie uniforme.' },
  { id: 'rto', term: 'RTO', definition: 'Objetivo de tiempo de recuperación aprobado por el negocio: en cuánto tiempo el servicio debe volver.', use: 'El caso declara expectativas informales, no un RTO formal.' },
  { id: 'rpo', term: 'RPO', definition: 'Objetivo de punto de recuperación: cuánta pérdida de datos se tolera en el tiempo.', use: 'Sin RPO aprobado no se puede afirmar cumplimiento.' },
  { id: 'capacidad', term: 'Capacidad', definition: 'Aptitud de un recurso para atender la demanda (CPU, RAM, almacenamiento, concurrencia).', use: 'Un pico no demuestra saturación permanente.' },
  { id: 'rendimiento', term: 'Rendimiento', definition: 'Cómo responde el servicio (latencia, throughput) mientras está operativo.', use: 'Disponible no implica responder dentro de umbral de negocio.' },
  { id: 'latencia', term: 'Latencia', definition: 'Tiempo que tarda una operación en completarse, observado en el caso como tiempo de respuesta.', use: 'Comparar habitual frente a pico del mismo corte.' },
  { id: 'throughput', term: 'Throughput', definition: 'Cantidad de trabajo procesado por unidad de tiempo.', use: 'El caso no entrega un throughput formal; no se inventa.' },
  { id: 'concurrencia', term: 'Concurrencia', definition: 'Número de usuarios o sesiones simultáneas sobre el servicio.', use: 'Relacionarla con CPU y latencia del mismo periodo.' },
  { id: 'escalabilidad', term: 'Escalabilidad', definition: 'Capacidad de absorber más demanda sin degradación inaceptable.', use: 'Se evalúa con evidencia de pico, no con una marca de producto.' },
  { id: 'capex', term: 'CAPEX', definition: 'Inversión de capital (compra o ampliación de infraestructura).', use: 'Los montos del PDF son estimación de referencia, no cotización.' },
  { id: 'opex', term: 'OPEX', definition: 'Gasto operativo recurrente (suscripción, operación, monitoreo).', use: 'Separarlo del CAPEX al justificar una iniciativa.' },
  { id: 'riesgo', term: 'Riesgo', definition: 'Exposición derivada de una amenaza sobre un activo con un control insuficiente.', use: 'Se ancla a un hallazgo, no a un adjetivo (“alto”) vacío.' },
  { id: 'probabilidad', term: 'Probabilidad', definition: 'Posibilidad de que el evento ocurra, calificada con evidencia (ya observado vs hipotético).', use: 'Si el incidente ya ocurrió, no es especulación pura.' },
  { id: 'impacto', term: 'Impacto', definition: 'Daño al servicio o al negocio si la condición se materializa o continúa.', use: 'Debe nombrar el servicio afectado.' },
  { id: 'control', term: 'Control', definition: 'Medida (proceso, técnico o de gobierno) que reduce probabilidad o impacto.', use: 'ITIL, COBIT e ISO se usan como lentes, no como capítulos teóricos.' },
  { id: 'riesgo-residual', term: 'Riesgo residual', definition: 'Riesgo que permanece después del tratamiento propuesto.', use: 'Declararlo bajo solo con justificación.' },
  { id: 'sla', term: 'SLA', definition: 'Acuerdo de nivel de servicio con metas contractuales. El caso no documenta un SLA formal.', use: 'No convertir la disponibilidad calculada en “el SLA se cumple”.' },
  { id: 'kpi', term: 'KPI', definition: 'Indicador con línea base, meta y evidencia de aceptación.', use: 'Sirve para cerrar un hallazgo, no para decorar el informe.' },
  { id: 'baseline', term: 'Línea base', definition: 'Valor de partida observado o calculado contra el que se comparará la mejora.', use: 'El periodo de 90 días es una línea base, no un estándar universal.' },
  { id: 'criterio-aceptacion', term: 'Criterio de aceptación', definition: 'Prueba objetiva que permite cerrar el hallazgo o la iniciativa.', use: 'Debe ser verificable (ensayo, cobertura, umbral), no “mejorar la seguridad”.' },
];

export function getGlossaryTerm(id) {
  return glossaryTerms.find((item) => item.id === id) ?? null;
}

export function TermLink({ termId, children }) {
  const item = getGlossaryTerm(termId);
  const label = children || item?.term || termId;
  return `<button class="term-link" type="button" data-action="open-glossary" data-term="${termId}" aria-haspopup="dialog">${label} <span class="term-link__hint">¿Qué significa?</span></button>`;
}
