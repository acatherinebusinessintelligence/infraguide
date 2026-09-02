import { escapeHtml } from '../../utils/escape.js';
import { getCaseField, formatFieldValue } from '../../data/cases/index.js';
import { getEvidenceForField, EVIDENCE_STATUS_LABEL, resolveEvidenceStatus } from '../../data/evidence/index.js';
import { dataMap } from '../../data/methodology/data-map.js';
import { getSelectedCaseData } from '../../state/appState.js';

export function CollectEvidenceDialog({ pendingCollectKey }) {
  if (!pendingCollectKey) return '';
  const caseData = getSelectedCaseData();
  const located = getCaseField(caseData, pendingCollectKey);
  const evidence = getEvidenceForField(caseData, pendingCollectKey);
  const meta = dataMap[pendingCollectKey] ?? {};
  const field = located?.field;
  const status = resolveEvidenceStatus(evidence);
  const uses = (meta.usedIn ?? evidence?.usedBy ?? []).join(', ') || 'comprensión del caso';

  return `
    <div class="collect-dialog" role="dialog" aria-modal="true" aria-labelledby="collect-dialog-title">
      <div class="collect-dialog__card">
        <h2 id="collect-dialog-title">Agregar a mis datos</h2>
        <p>Antes de incorporarlo, comprueba que el dato conserva su referencia al PDF.</p>
        <dl class="evidence-dl">
          <div><dt>Dato</dt><dd>${escapeHtml(field?.label || evidence?.label || pendingCollectKey)}</dd></div>
          <div><dt>Valor</dt><dd>${escapeHtml(field ? formatFieldValue(field) : evidence?.value || '—')}</dd></div>
          <div><dt>Unidad</dt><dd>${escapeHtml(field?.unit || evidence?.unit || '—')}</dd></div>
          <div><dt>Página</dt><dd>${evidence?.page != null ? escapeHtml(String(evidence.page)) : '—'}</dd></div>
          <div><dt>Sección</dt><dd>${escapeHtml(evidence?.section || located?.section?.sectionTitle || '—')}</dd></div>
          <div><dt>Estado</dt><dd>${escapeHtml(EVIDENCE_STATUS_LABEL[status] || status)}</dd></div>
          <div><dt>Análisis donde puede utilizarse</dt><dd>${escapeHtml(uses)}</dd></div>
        </dl>
        <p><strong>Fragmento:</strong> ${evidence?.quote ? `“${escapeHtml(evidence.quote)}”` : 'Sin fragmento localizado. El dato no se marcará como verificado.'}</p>
        <div class="collect-dialog__actions">
          <button class="btn" type="button" data-action="cancel-collect-evidence">Cancelar</button>
          <button class="btn btn--primary" type="button" data-action="confirm-collect-evidence" data-field-key="${escapeHtml(pendingCollectKey)}">Confirmar e incorporar</button>
        </div>
      </div>
    </div>
  `;
}
