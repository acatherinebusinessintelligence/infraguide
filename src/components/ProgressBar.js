import { appCopy } from '../data/copy.js';
import { escapeHtml } from '../utils/escape.js';

export function ProgressBar({ progress, caseLabel }) {
  const safeProgress = Number.isFinite(progress) ? Math.min(100, Math.max(0, progress)) : 0;

  return `
    <div class="progress-block">
      <div class="progress-block__meta">
        <p class="progress-block__case">
          ${escapeHtml(appCopy.dashboard.activeCaseLabel)}:
          <strong>${escapeHtml(caseLabel)}</strong>
        </p>
        <p class="progress-block__value">
          ${escapeHtml(appCopy.dashboard.progressLabel)}:
          <strong>${safeProgress} %</strong>
        </p>
      </div>
      <div
        class="progress-bar"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow="${safeProgress}"
        aria-label="${escapeHtml(appCopy.dashboard.progressLabel)}"
      >
        <div class="progress-bar__fill" style="width: ${safeProgress}%"></div>
      </div>
    </div>
  `;
}
