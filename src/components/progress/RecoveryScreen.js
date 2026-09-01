import { escapeHtml } from '../../utils/escape.js';
import { APP_VERSION } from '../../config.js';

export function RecoveryScreen({ recovery = {} }) {
  const message = recovery.futureVersion
    ? 'Este progreso fue creado con una versión más reciente de InfraGuide.'
    : recovery.message || 'Encontramos un problema al recuperar tu progreso.';
  return `
    <div class="recovery-screen" role="alert">
      <h1>No pudimos abrir tu progreso</h1>
      <p>${escapeHtml(message)}</p>
      <p>La aplicación no se detiene: puedes recuperar una copia, cargar un archivo o empezar de nuevo.</p>
      <div class="progress-actions">
        <button class="btn btn--primary" type="button" data-action="recover-backup" ${recovery.hasBackup ? '' : 'disabled'}>Recuperar backup</button>
        <label class="btn btn--ghost-dark" for="recovery-file-input">
          Importar progreso
          <input id="recovery-file-input" class="visually-hidden" type="file" accept="application/json,.json" data-action="import-progress" />
        </label>
        <button class="btn btn--danger" type="button" data-action="recovery-start-new">Iniciar nuevo</button>
      </div>
      <p>InfraGuide v${escapeHtml(APP_VERSION)}</p>
    </div>
  `;
}
