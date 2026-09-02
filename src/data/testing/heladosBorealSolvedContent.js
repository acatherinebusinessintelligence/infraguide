export const MODEL_INTRO = {
  kicker: 'CASO MODELO RESUELTO',
  lead: 'Este caso muestra cómo se desarrolla un análisis completo de infraestructura TI. No debes resolverlo. Recorre sus etapas para comprender cómo se obtiene cada dato, cómo se realizan los cálculos, cómo se construyen los hallazgos y cómo se genera el informe técnico final.',
  warning: 'Estás explorando un ejemplo. No estás diligenciando tu caso asignado.',
  workBanner: 'CASO DE TRABAJO DEL EQUIPO',
};

export const MODEL_STAGE_META = {
  1: {
    teaches: 'Cómo extraer contexto, usuarios, servicios y restricciones del PDF sin inventar datos.',
    result: 'Alcance del informe con evidencia de páginas 2, 3 y 9.',
  },
  2: {
    teaches: 'Cómo construir un AS-IS e inventario relevante a partir de dependencias reales.',
    result: 'Diagrama AS-IS del ERP y lista de componentes justificados.',
  },
  3: {
    teaches: 'Cómo justificar un SPOF por dependencia e impacto, no por la etiqueta “crítico”.',
    result: 'Matriz SPOF de FW-01 e IOT-GW01 con evidencia de fallas.',
  },
  4: {
    teaches: 'Cómo calcular con fórmula, sustitución e interpretación, y cuándo declarar información insuficiente.',
    result: 'Disponibilidad, MTTR, MTBF, almacenamiento, CPU, memoria, latencia y concurrencia resueltos.',
  },
  5: {
    teaches: 'Cómo convertir un dato interpretado en hallazgo de ingeniería con evidencia y criterio.',
    result: 'Ocho hallazgos documentados (capacidad, perímetro, restore, cambio, ERP, identidad, MFA, parches).',
  },
  6: {
    teaches: 'Cómo aplicar ITIL, COBIT e ISO 27001 sobre hallazgos, no como capítulos teóricos.',
    result: 'Prácticas, responsables e indicadores ligados a cada hallazgo.',
  },
  7: {
    teaches: 'Cómo comparar alternativas con criterios, restricciones del PDF y supuestos de método explícitos.',
    result: 'Programa, CAPEX/OPEX de referencia y arquitectura objetivo sin reemplazar el ERP.',
  },
  8: {
    teaches: 'Cómo ensamblar el informe de consultoría con trazabilidad de cada apartado.',
    result: 'Informe técnico de 13 secciones, exportable desde el inicio.',
  },
};

export const INSUFFICIENT_MODEL = [
  {
    id: 'mttd',
    name: 'MTTD',
    missing: 'El PDF no registra tiempos de detección por incidente.',
  },
  {
    id: 'rto',
    name: 'Cumplimiento de RTO',
    missing: 'No hay RTO aprobado. Solo hay expectativas informales de recuperación.',
  },
  {
    id: 'rpo',
    name: 'Cumplimiento de RPO',
    missing: 'No hay RPO documentado ni frecuencia de copia como acuerdo.',
  },
  {
    id: 'backup-success',
    name: 'Porcentaje de éxito de backups',
    missing: 'No existe un denominador de copias exitosas vs. intentadas.',
  },
  {
    id: 'patching',
    name: 'Porcentaje completo de parcheo',
    missing: 'Se conocen 7 servidores rezagados, no el tamaño total de la flota.',
  },
];

export const HOW_BUILT_GENERIC = [
  { label: 'PDF', text: 'Caso Helados Boreal S.A.S., documento fuente de 10 páginas.' },
  { label: 'EVIDENCIA', text: 'Fragmento localizado con página verificada en el registro de evidencias.' },
  { label: 'DATO', text: 'Campo extraído del JSON del caso, sin inventar magnitudes.' },
  { label: 'PROCESAMIENTO', text: 'Clasificación, cálculo o cruce de dependencias, según la etapa.' },
  { label: 'INTERPRETACIÓN', text: 'Qué significa el dato para el servicio y qué no permite afirmar.' },
  { label: 'HALLAZGO', text: 'Condición + evidencia + impacto, cuando la etapa ya diagnosticó.' },
  { label: 'DECISIÓN', text: 'Alternativa seleccionada condicionada por restricciones del PDF.' },
  { label: 'DOCUMENTO', text: 'Apartado del informe técnico de consultoría que recibe el resultado.' },
];

export function howBuiltForSection(key) {
  const extra = {
    scope: [
      { label: 'PDF', text: 'Páginas 2, 3 y 9: contexto, servicios y restricciones.' },
      { label: 'EVIDENCIA', text: 'HB-context-organizationName, usuarios y presupuesto.' },
      { label: 'DATO', text: 'Empresa, 235 usuarios, COP 180 millones, ERP no reemplazable en 18 meses.' },
      { label: 'PROCESAMIENTO', text: 'COMPRENDER agrupa contexto, operación, servicios y restricciones.' },
      { label: 'INTERPRETACIÓN', text: 'El alcance del dictamen es la infraestructura que sostiene facturación, despacho y frío.' },
      { label: 'DOCUMENTO', text: 'Apartado 2. Alcance, método y limitaciones.' },
    ],
    performance: [
      { label: 'PDF', text: 'Páginas 6, 7 y 8: almacenamiento, desempeño e incidentes.' },
      { label: 'EVIDENCIA', text: 'Periodo 2.160 h, NAS 19,2/24 TB, CPU 92 %, latencia 4,8 s.' },
      { label: 'DATO', text: 'Horas, TB, porcentajes y conteos literales del caso.' },
      { label: 'PROCESAMIENTO', text: 'Fórmulas de disponibilidad, MTTR, MTBF y utilización.' },
      { label: 'INTERPRETACIÓN', text: '99,51 % no es SLA del ERP; 85 % no es umbral aprobado.' },
      { label: 'HALLAZGO', text: 'Saturación del ERP y NAS al 80 %.' },
      { label: 'DOCUMENTO', text: 'Apartado 5. Desempeño y capacidad.' },
    ],
    findings: [
      { label: 'PDF', text: 'Páginas 5 a 8: red, backups, picos e incidentes.' },
      { label: 'EVIDENCIA', text: 'FW-01 único, hueco de copia externa, cambio sin reversa, MFA 9/17.' },
      { label: 'DATO', text: 'Cada hallazgo cita página y fragmento.' },
      { label: 'PROCESAMIENTO', text: 'DATO → interpretación → condición → impacto.' },
      { label: 'INTERPRETACIÓN', text: 'No se declara RTO/RPO ni % de backups.' },
      { label: 'HALLAZGO', text: 'Ocho hallazgos de ingeniería.' },
      { label: 'DECISIÓN', text: 'Cada hallazgo alimenta al menos una recomendación.' },
      { label: 'DOCUMENTO', text: 'Apartado 3. Hallazgos de ingeniería.' },
    ],
    alternatives: [
      { label: 'PDF', text: 'Página 9: costos de referencia y umbral de comité.' },
      { label: 'EVIDENCIA', text: 'COP 42 millones NAS, COP 68 millones firewall, COP 3,8 millones/mes monitoreo.' },
      { label: 'DATO', text: 'Precios y restricción de no reemplazar el ERP.' },
      { label: 'PROCESAMIENTO', text: 'Tabla ponderada. Los pesos son supuesto de método, no del PDF.' },
      { label: 'INTERPRETACIÓN', text: 'El segundo firewall exige comité porque supera COP 60 millones.' },
      { label: 'DECISIÓN', text: 'Se selecciona la alternativa de mayor puntaje compatible con restricciones.' },
      { label: 'DOCUMENTO', text: 'Apartado 8. Evaluación de alternativas.' },
    ],
    architecture: [
      { label: 'PDF', text: 'Páginas 4 y 5: hosts, VMs, red y FW-01.' },
      { label: 'EVIDENCIA', text: 'Tres hosts, ERP-APP01, ERP-DB01, FW-01, NAS-01, IOT-GW01.' },
      { label: 'DATO', text: 'Componentes con servicio soportado y dependencia.' },
      { label: 'PROCESAMIENTO', text: 'Cadenas AS-IS. No se dibuja el TO-BE en REPRESENTAR.' },
      { label: 'INTERPRETACIÓN', text: 'Dos enlaces no eliminan el SPOF si convergen en FW-01.' },
      { label: 'HALLAZGO', text: 'SPOF de perímetro y de pasarela de frío.' },
      { label: 'DOCUMENTO', text: 'Apartado 4. Arquitectura y resiliencia.' },
    ],
  };
  return extra[key] || HOW_BUILT_GENERIC;
}
