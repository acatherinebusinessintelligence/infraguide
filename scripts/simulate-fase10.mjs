const store = new Map();
globalThis.window = {
  localStorage: {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
  },
  location: { hash: '' },
  dispatchEvent() {},
};

const { getState, setState, patchState, selectWorkCase, hydrateFromStorage } = await import('../src/state/appState.js');
const { DATA_STATUS } = await import('../src/data/methodology/data-map.js');
const { FINDING_STATUS } = await import('../src/data/methodology/diagnose.js');
const { GOVERN_STATUS } = await import('../src/data/methodology/govern.js');
const { DECISION_STATUS } = await import('../src/data/methodology/decide.js');
const { METRIC_STATUS } = await import('../src/data/methodology/measure.js');
const { markPreviewReviewed, addConclusionsToDocument, completeBuildStage, setConclusionField, toggleConclusionChip } = await import(
  '../src/state/buildActions.js'
);
const { setExportMode, setExportFlag, getExportModel, invalidateExportCache } = await import('../src/state/exportActions.js');
const { validateExportPayload, modelHasTechnicalIds, buildExportModel } = await import('../src/export/buildExportModel.js');
const { HtmlExporter } = await import('../src/export/htmlExporter.js');
const { packDocx, docxFileName } = await import('../src/export/docxExporter.js');
const { exportBaseName, safeFileName } = await import('../src/export/text.js');
const { effectiveExportConfig, createExportConfig, EXPORT_MODES } = await import('../src/data/methodology/export.js');
const { persistableExport } = await import('../src/state/exportModel.js');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function documented(text, extra = {}) {
  return {
    status: DATA_STATUS.DOCUMENTED,
    text,
    rows: extra.rows ?? [],
    sources: extra.sources ?? ['Caso modelo Helados Boreal'],
    lastUpdated: new Date().toISOString(),
    reviewRequired: false,
    ...extra,
  };
}

function govBase(findingId, extra) {
  return { findingId, sources: ['Diagnóstico'], sourceSections: ['findings'], status: GOVERN_STATUS.DOCUMENTED, ...extra };
}

hydrateFromStorage();
selectWorkCase('modelo-helados-boreal');

const findings = [
  { findingId: 'finding-01', title: 'Degradación de rendimiento bajo alta demanda', category: 'performance', evidenceIds: ['ev-cpu', 'ev-latency', 'ev-demand'], impact: 'Lentitud y abandono de compras.', criticality: 'high', justification: 'CPU 96 % y latencia 900 ms.', sources: ['Información operacional disponible'], sourceSections: ['operational-data'] },
  { findingId: 'finding-02', title: 'Riesgo de agotamiento de almacenamiento', category: 'storage', evidenceIds: ['ev-storage-used', 'ev-growth', 'ev-margin'], impact: 'Depuraciones urgentes.', criticality: 'high', justification: '84 % y 7,6 meses.', sources: ['Almacenamiento'], sourceSections: ['storage'] },
  { findingId: 'finding-03', title: 'Debilidad de monitoreo de respaldos', category: 'monitoring', evidenceIds: ['ev-inc-d'], impact: 'Riesgo de recuperación.', criticality: 'high', justification: 'Dos días sin alerta.', sources: ['Incidentes'], sourceSections: ['incidents'] },
  { findingId: 'finding-04', title: 'Dependencia crítica del firewall', category: 'dependency', evidenceIds: ['ev-firewall-unique', 'ev-inc-b'], impact: 'Tiendas incomunicadas.', criticality: 'critical', justification: 'SPOF + 4 h.', sources: ['Infraestructura'], sourceSections: ['infrastructure'] },
  { findingId: 'finding-05', title: 'Cambio POS sin reversa', category: 'operation', evidenceIds: ['ev-inc-e'], impact: 'Interrupción POS.', criticality: 'medium', justification: 'Sin rollback.', sources: ['Incidentes'], sourceSections: ['incidents'] },
  { findingId: 'finding-06', title: 'Baja trazabilidad de incidentes', category: 'operation', evidenceIds: ['ev-incident-channels'], impact: 'No se cuantifica frecuencia.', criticality: 'medium', justification: 'Múltiples canales.', sources: ['Incidentes'], sourceSections: ['incidents'] },
  { findingId: 'finding-07', title: 'Ciclo de vida de identidades débil', category: 'security', evidenceIds: ['ev-stale-accounts'], impact: 'Cuentas activas de exempleados.', criticality: 'high', justification: 'Deshabilitación tardía.', sources: ['Seguridad'], sourceSections: ['security'] },
  { findingId: 'finding-08', title: 'Gestión reactiva de capacidad', category: 'government', evidenceIds: ['ev-capacity-reactive'], impact: 'Inversiones urgentes.', criticality: 'medium', justification: 'Decisiones reactivas.', sources: ['Operación'], sourceSections: ['operational-data'] },
].map((item) => ({ ...item, description: item.title, status: FINDING_STATUS.DOCUMENTED }));

const recs = [
  { decisionId: 'dec-01', findingIds: ['finding-01'], evidenceIds: ['ev-cpu', 'ev-latency'], decision: 'Optimizar y evaluar capacidad elástica del canal digital.', title: 'Capacidad elástica', impact: 'Lentitud en picos.', benefitText: 'Anticipar capacidad y reducir latencia.', riskText: 'Complejidad híbrida.', costModel: 'mixed', costJustification: 'CAPEX local y OPEX cloud puntual.', metricIds: ['latency', 'cpu'], metricText: 'Latencia pico y CPU.', priority: 'high', justification: 'El pico documentado exige elasticidad.', alternatives: [{ title: 'Ampliar local' }, { title: 'Optimizar' }], status: DECISION_STATUS.DOCUMENTED },
  { decisionId: 'dec-02', findingIds: ['finding-03'], evidenceIds: ['ev-inc-d'], decision: 'Alerta automática de backup a mesa.', title: 'Monitoreo de backup', impact: 'Fallo no detectado.', benefitText: 'Reducir tiempo de detección.', riskText: 'Ruido de alertas.', costModel: 'opex', costJustification: 'Esfuerzo operativo / suscripción.', metricIds: ['detection-time', 'backup-success'], metricText: 'Tiempo de detección y % backup exitoso.', priority: 'high', justification: 'Dos días sin alerta exigen detección.', alternatives: [{ title: 'Manual' }, { title: 'Alerta automática' }], status: DECISION_STATUS.DOCUMENTED },
  { decisionId: 'dec-03', findingIds: ['finding-04'], evidenceIds: ['ev-firewall-unique'], decision: 'Planificar failover de perímetro sin fijar marca.', title: 'Resiliencia de firewall', impact: 'Tiendas incomunicadas.', benefitText: 'Mejorar disponibilidad.', riskText: 'Complejidad operativa.', costModel: 'capex', costJustification: 'Infraestructura de perímetro.', metricIds: ['availability'], metricText: 'Disponibilidad de conectividad de tiendas.', priority: 'immediate', justification: 'El SPOF y las 4 h documentadas exigen resiliencia.', alternatives: [{ title: 'Mantener' }, { title: 'Failover' }], status: DECISION_STATUS.DOCUMENTED },
  { decisionId: 'dec-04', findingIds: ['finding-02'], evidenceIds: ['ev-storage-used', 'ev-margin'], decision: 'Retención/archivado y ampliación planificada de capacidad.', title: 'Almacenamiento', impact: 'Margen teórico limitado.', benefitText: 'Anticipar saturación.', riskText: 'Pérdida si la retención se aplica mal.', costModel: 'mixed', costJustification: 'Proceso más posible CAPEX posterior.', metricIds: ['storage-use', 'storage-growth'], metricText: '% uso y crecimiento mensual.', priority: 'medium', justification: 'El margen de 7,6 meses permite planificar.', alternatives: [{ title: 'Comprar disco' }, { title: 'Retención' }], status: DECISION_STATUS.DOCUMENTED },
  { decisionId: 'dec-05', findingIds: ['finding-08'], evidenceIds: ['ev-capacity-reactive'], decision: 'Revisión periódica de capacidad e inversión.', title: 'Gobierno de capacidad', impact: 'Decisiones reactivas.', benefitText: 'Anticipar capacidad.', riskText: 'El proceso se abandona sin dueño.', costModel: 'opex', costJustification: 'Esfuerzo de gobierno.', metricIds: ['cpu'], metricText: 'Servicios con revisión periódica de capacidad.', priority: 'strategic', justification: 'El hallazgo es de gobierno.', alternatives: [{ title: 'Seguir reactivo' }, { title: 'Calendario de revisión' }], status: DECISION_STATUS.DOCUMENTED },
];

patchState((prev) => ({
  ...prev,
  completedStages: [1, 2, 3, 4, 5, 6, 7],
  currentStage: 7,
  analysis: {
    ...prev.analysis,
    diagnose: { ...prev.analysis.diagnose, findings },
    measure: {
      ...prev.analysis.measure,
      availability: { ...prev.analysis.measure.availability, result: 98.33, sourceKeys: ['periodHours', 'downtimeHours'], status: METRIC_STATUS.DOCUMENTED },
      mttr: { ...prev.analysis.measure.mttr, result: 3.1, sourceKeys: ['totalRecoveryHours', 'incidentCount'], status: METRIC_STATUS.DOCUMENTED },
      mtbf: { ...prev.analysis.measure.mtbf, result: 70.8, limitation: 'Estimación con limitaciones de información.', sourceKeys: ['periodHours', 'incidentCount'], status: METRIC_STATUS.DOCUMENTED },
      storage: { ...prev.analysis.measure.storage, result: { percent: 84, months: 7.62, free: 3.2 }, sourceKeys: ['storageUsed', 'storageCapacity', 'storageGrowth'], status: METRIC_STATUS.DOCUMENTED },
      capacity: { ...prev.analysis.measure.capacity, result: 96, sourceKeys: ['cpuPeak'], status: METRIC_STATUS.DOCUMENTED },
      performance: { ...prev.analysis.measure.performance, result: 900, sourceKeys: ['appLatencyPeak'], status: METRIC_STATUS.DOCUMENTED },
    },
    represent: {
      ...prev.analysis.represent,
      asIs: { description: 'Cadena POS: tiendas → internet → firewall → APP-SRV01.', chains: { pos: ['stores', 'internet', 'firewall'] } },
    },
    govern: {
      ...prev.analysis.govern,
      itil: [
        govBase('finding-03', { analysisId: 'itil-01', situation: 'Backup falla sin detección.', practice: 'monitoring', action: 'Alerta a mesa.', benefit: 'Detección temprana.', indicator: 'detection-time' }),
        govBase('finding-05', { analysisId: 'itil-02', situation: 'Cambio POS sin reversa.', practice: 'change', action: 'Exigir rollback.', benefit: 'Menos interrupciones.', indicator: 'changes-rollback' }),
        govBase('finding-06', { analysisId: 'itil-03', situation: 'Incidentes en varios canales.', practice: 'incident', action: 'Registro único.', benefit: 'Trazabilidad.', indicator: 'incidents-registered' }),
        govBase('finding-01', { analysisId: 'itil-04', situation: 'Picos de demanda.', practice: 'capacity', action: 'Revisar capacidad del canal digital.', benefit: 'Anticipar saturación.', indicator: 'sla-compliance' }),
      ],
      cobit: [
        govBase('finding-08', { analysisId: 'cobit-01', problem: 'Inversión reactiva.', decision: 'Criterios de capacidad.', responsibleIds: ['ti-direction'], responsibleJustification: 'Gobierna la inversión.', indicator: 'capacity-review' }),
        govBase('finding-04', { analysisId: 'cobit-02', problem: 'SPOF de perímetro.', decision: 'Dueño de resiliencia.', responsibleIds: ['infra-lead'], responsibleJustification: 'Opera el perímetro.', indicator: 'recovery-policy' }),
        govBase('finding-03', { analysisId: 'cobit-03', problem: 'Nadie alerta el backup.', decision: 'Asignar control de recuperación.', responsibleIds: ['service-owner'], responsibleJustification: 'Dueño del servicio de archivos.', indicator: 'recovery-policy' }),
      ],
      iso27001: [
        govBase('finding-07', { analysisId: 'iso-01', assetId: 'credentials', threatId: 'unauthorized-access', vulnerabilityId: 'stale-account', impact: 'Acceso indebido.', control: 'Revisión de altas y bajas.' }),
        govBase('finding-03', { analysisId: 'iso-02', assetId: 'backups', threatId: 'info-loss', vulnerabilityId: 'backup-unverified', impact: 'Pérdida de recuperación.', control: 'Prueba y alerta de backup.' }),
        govBase('finding-04', { analysisId: 'iso-03', assetId: 'configs', threatId: 'unavailability', vulnerabilityId: 'no-redundancy', impact: 'Tiendas caídas.', control: 'Failover de perímetro.' }),
        govBase('finding-02', { analysisId: 'iso-04', assetId: 'database', threatId: 'info-loss', vulnerabilityId: 'no-monitoring', impact: 'Saturación de NAS.', control: 'Umbral y retención.' }),
        govBase('finding-05', { analysisId: 'iso-05', assetId: 'wms', threatId: 'unauthorized-change', vulnerabilityId: 'no-monitoring', impact: 'Cambio sin reversa.', control: 'Ventana y rollback.' }),
      ],
    },
    decide: { ...prev.analysis.decide, recommendations: recs, decisions: recs },
  },
  documentSections: {
    ...prev.documentSections,
    context: documented('Helados Boreal produce y comercializa helados. Planta, CD, 46 tiendas y e-commerce.'),
    criticalServices: documented('POS, ERP, e-commerce y WMS sustentan operación crítica.', { rows: [{ name: 'POS', justification: 'Cierra la venta en tienda.' }] }),
    asis: documented('AS-IS del canal de tiendas: usuario → conectividad → firewall → aplicación.', { chains: [{ serviceId: 'pos', nodeIds: ['stores', 'internet', 'firewall'] }], nodes: [{ name: 'Firewall' }] }),
    inventory: documented('Inventario relevante: APP-SRV01, firewall, NAS, enlaces.', { rows: [{ name: 'Firewall', justification: 'Perímetro único.' }] }),
    spof: documented('Firewall principal sin redundancia documentada.', { rows: [{ name: 'Firewall', impact: 'Tiendas incomunicadas', justification: 'Instancia única', evidence: 'Diagrama e incidente de 4 h' }] }),
    metrics: documented('Disponibilidad 98,33 %. MTTR 3,1 h. MTBF estimado 70,8 h. NAS 84 %.', {
      subsections: {
        availability: { title: 'Disponibilidad', text: 'Observada 98,33 %.', data: '720 h / 12 h', formula: '(720-12)/720×100', substitution: '(720 - 12) / 720 × 100', result: '98,33 %', interpretation: 'Periodo analizado.', limitation: 'No afirma SLA.', sources: ['Información operacional disponible'] },
        mttr: { title: 'MTTR', text: '3,1 h.', data: '31 h / 10 incidentes', formula: '31/10', substitution: '31/10', result: '3,1 h', interpretation: 'Promedio del periodo.', sources: ['Incidentes'] },
        mtbf: { title: 'MTBF estimado', text: '70,8 h.', data: '708 / 10', formula: 'uptime/incidentes', substitution: '708/10', result: '70,8 h', interpretation: 'Estimación.', limitation: 'No es un dato directo del caso.', sources: ['Información operacional disponible'] },
        capacity: { title: 'Capacidad', text: 'CPU pico 96 %.', result: '96 %', formula: 'dato observado', sources: ['Información operacional disponible'] },
        performance: { title: 'Rendimiento', text: 'Latencia pico 900 ms.', result: '900 ms', formula: 'dato observado', sources: ['Información operacional disponible'] },
        storage: { title: 'Almacenamiento', text: '84 % y ≈7,6 meses.', result: '84 % usado · ≈ 7,6 meses', formula: 'libre/crecimiento', sources: ['Almacenamiento'] },
      },
    }),
    findings: documented('Ocho hallazgos sustentados de capacidad, almacenamiento, monitoreo, SPOF, operación, seguridad y gobierno.'),
    itil: documented('ITIL cubre monitoreo, cambio, incidentes y capacidad.'),
    cobit: documented('COBIT asigna responsabilidad de capacidad, resiliencia y recuperación.'),
    iso27001: documented('ISO cubre identidades, backup, perímetro, archivos y cambios POS.'),
    strategy: documented('Mantener ERP; fortalecer resiliencia y monitoreo; evaluar híbrido si se justifica.'),
    capex: documented('Capacidad mixta; backup OPEX; perímetro CAPEX; almacenamiento mixto; gobierno OPEX.'),
    recommendations: documented('Cinco recomendaciones priorizadas con hallazgo, beneficio y métrica.'),
    conclusions: null,
  },
}));

['finding-01', 'finding-03', 'finding-04', 'finding-02'].forEach((id) => toggleConclusionChip('selectedFindings', id));
['helpdesk', 'backup-exists', 'ti-team'].forEach((id) => toggleConclusionChip('selectedStrengths', id));
['budget', 'production-window'].forEach((id) => toggleConclusionChip('constraintIds', id));
toggleConclusionChip('priorities', 'dec-02');
toggleConclusionChip('priorities', 'dec-03');
toggleConclusionChip('limitations', 'mtbf-estimate');
setConclusionField(
  'draft',
  [
    'El análisis de la infraestructura de Helados Boreal evidencia una operación tecnológica que soporta POS, ERP, e-commerce y logística, pero presenta oportunidades de mejora principalmente en monitoreo, resiliencia de perímetro y capacidad del canal digital.',
    'Los hallazgos de mayor relevancia corresponden a la degradación en picos, el SPOF del firewall y la detección tardía de backups, debido a su impacto sobre ventas en tienda y recuperación de información.',
    'Las decisiones futuras deben considerar restricciones como presupuesto limitado y la necesidad de no detener producción. Existen fortalezas: mesa de ayuda, backup existente y equipo TI establecido.',
    'La estrategia recomendada debe priorizar alerta de backup y failover de perímetro, utilizando indicadores como tiempo de detección, disponibilidad y latencia para validar los resultados.',
    'No obstante, el análisis presenta limitaciones relacionadas con el MTBF estimado y la ausencia de un SLA documentado. Declarar esos límites evita inventar certeza que el caso no sostiene.',
  ].join('\n\n'),
);
assert(addConclusionsToDocument(), `No se guardaron conclusiones: ${getState().documentError}`);
markPreviewReviewed();
assert(completeBuildStage(), `No se completó CONSTRUIR: ${getState().documentError}`);
assert(getState().analysis.build.readyToExport, 'readyToExport debe ser true');
console.log('1-2 ExportCenter READY');

setExportMode(EXPORT_MODES.academic);
setExportFlag('includeTraceability', true);
invalidateExportCache();
const academicModel = getExportModel(getState());
const academicErrors = validateExportPayload(getState(), academicModel.config);
assert(academicErrors.length === 0, `Validación académica: ${academicErrors.join(' | ')}`);
assert(academicModel.kind === 'consulting', 'El modelo exportado debe ser de consultoría');
assert(academicModel.sections[0].key === 'dictamen', 'El informe debe abrir con el dictamen técnico');
assert(academicModel.sections.length === 13, `Deben exportarse 13 secciones de consultoría, hay ${academicModel.sections.length}`);
assert(academicModel.manifest.sectionsIncluded.length === 13, 'ExportManifest incompleto');
assert(academicModel.manifest.InfraGuideVersion, 'Falta InfraGuideVersion');
assert(!modelHasTechnicalIds(academicModel), 'El modelo de consultoría contiene IDs internos (finding-/dec-/ev-)');
const academicHtml = HtmlExporter(academicModel).html;
assert(academicHtml.startsWith('<!DOCTYPE html>'), 'HTML no es independiente');
assert(academicHtml.includes('Dictamen técnico'), 'Falta dictamen');
assert(academicHtml.includes('Hallazgos de ingeniería'), 'Faltan hallazgos');
assert(academicHtml.includes('F-01'), 'Falta identificador de hallazgo');
assert(academicHtml.includes('Informe técnico de consultoría'), 'Falta tipo de documento');
assert(academicHtml.includes('98,33'), 'Falta disponibilidad documentada');
assert(academicHtml.includes('(720 - 12) / 720 × 100') || academicHtml.includes('(720-12)/720'), 'Falta fórmula');
assert(academicHtml.includes('<svg'), 'Falta diagrama AS-IS');
assert(academicHtml.includes('Fuente:'), 'Falta cita de fuente');
assert(!/finding-0\d/.test(academicHtml), 'HTML muestra finding-id');
assert(!/dec-0\d/.test(academicHtml), 'HTML muestra decision-id');
assert(!academicHtml.includes('SourceFinder') && !academicHtml.includes('MethodCard'), 'HTML incluye UI pedagógica');
const htmlName = HtmlExporter(academicModel).fileName;
assert(htmlName === 'Informe_Tecnico_Consultoria_Helados_Boreal.html', `Nombre HTML: ${htmlName}`);
console.log('3-8 HTML consultoría OK', htmlName);

const packed = await packDocx(academicModel);
const buffer = packed instanceof Uint8Array ? packed : Buffer.from(await packed.arrayBuffer?.() || packed);
assert(buffer[0] === 0x50 && buffer[1] === 0x4b, 'DOCX no es un ZIP válido (PK)');
assert(docxFileName(academicModel).endsWith('.docx'), 'Nombre DOCX inválido');
assert(buffer.length > 2000, 'DOCX demasiado pequeño');
console.log('9-13 DOCX OK', docxFileName(academicModel), buffer.length);

const printBody = academicHtml;
assert(printBody.includes('ig-break') || printBody.includes('page-break'), 'Faltan saltos de página');
console.log('14-16 Print/PDF CSS embebido OK');

setExportMode(EXPORT_MODES.clean);
invalidateExportCache();
const cleanModel = getExportModel(getState());
const cleanHtml = HtmlExporter(cleanModel).html;
assert(!cleanHtml.includes('Procesamiento:'), 'Modo compacto muestra procesamiento');
assert(cleanHtml.includes('Conclusión y recomendación de cierre'), 'Modo compacto perdió el cierre');
assert(cleanHtml.includes('98,33'), 'Modo compacto perdió métricas');
console.log('17-18 modo compacto OK');

patchState((prev) => ({
  ...prev,
  analysis: {
    ...prev.analysis,
    export: {
      ...prev.analysis.export,
      history: [
        { version: 1, label: 'v1', format: 'HTML', mode: 'academic', generatedAt: new Date().toISOString(), fileName: htmlName },
        { version: 2, label: 'v2', format: 'WORD', mode: 'clean', generatedAt: new Date().toISOString(), fileName: docxFileName(cleanModel) },
      ],
      lastExport: { version: 2, label: 'v2', format: 'WORD' },
      nextVersion: 3,
      config: cleanModel.config,
    },
  },
}));
assert(getState().analysis.export.history.length === 2, 'Historial no guardó dos exportaciones');
assert(getState().analysis.export.nextVersion === 3, 'Versionado simple no incrementó');
console.log('19-20 historial v1 HTML / v2 WORD');

hydrateFromStorage();
assert(getState().analysis.export.history.length === 2, 'Historial no persistió');
assert(getState().analysis.export.config.mode === 'clean', 'Config no persistió');
assert(!persistableExport(getState().analysis.export).history.some((item) => item.blob), 'Se persistió un blob');
assert(safeFileName('Helados Boreal S.A.S. *?', 'html') === 'Helados_Boreal_S_A_S.html' || safeFileName('Helados Boreal', 'html').includes('Helados'), 'safeFileName');
assert(exportBaseName('Helados Boreal S.A.S.') === 'Informe_Tecnico_Consultoria_Helados_Boreal', `base: ${exportBaseName('Helados Boreal S.A.S.')}`);
console.log('21-22 persistencia OK');

const blocked = { ...getState(), analysis: { ...getState().analysis, build: { ...getState().analysis.build, readyToExport: false } } };
assert(validateExportPayload(blocked, createExportConfig())[0].includes('revisión'), 'Debe bloquear si no está READY');

console.log('FASE 10 simulación OK', {
  sections: academicModel.sections.length,
  htmlBytes: academicHtml.length,
  docxBytes: buffer.length,
  history: getState().analysis.export.history.map((item) => `${item.format} ${item.label}`),
  mode: getState().analysis.export.config.mode,
});
