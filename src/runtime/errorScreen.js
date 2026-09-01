import { APP_VERSION } from '../config.js';
import { escapeHtml } from '../utils/escape.js';

export function renderFatalScreen(message = '') {
  const detail = message ? `<p class="fatal-detail">${escapeHtml(message)}</p>` : '';
  return `
    <div class="fatal-screen" role="alert">
      <h1>InfraGuide encontró un problema inesperado.</h1>
      <p>Puedes recargar, recuperar un archivo de progreso o descargar el progreso guardado en este navegador.</p>
      ${detail}
      <div class="export-actions">
        <button class="btn btn--primary" type="button" data-action="fatal-reload">Recargar</button>
        <button class="btn" type="button" data-action="recover-backup">Recuperar backup</button>
        <label class="btn">
          Importar progreso
          <input class="visually-hidden" type="file" accept="application/json,.json" data-action="fatal-import" />
        </label>
        <button class="btn" type="button" data-action="export-progress">Guardar mi progreso</button>
        <button class="btn btn--danger" type="button" data-action="recovery-start-new">Iniciar nuevo</button>
      </div>
      <p>InfraGuide v${escapeHtml(APP_VERSION)}</p>
    </div>
  `;
}

function isExternalNoise(error) {
  const text = [
    error?.message,
    error?.reason,
    error?.stack,
    typeof error === 'string' ? error : '',
  ]
    .filter(Boolean)
    .join(' ');
  return /metamask|failed to connect to metamask|ethereum|evmAsk|solana|walletconnect|chrome-extension:|moz-extension:|inpage\.js|ResizeObserver|Script error/i.test(
    text,
  );
}

export function installErrorBoundary(root, onFatal) {
  const show = (error) => {
    if (isExternalNoise(error)) {
      return;
    }
    if (typeof onFatal === 'function') onFatal(error);
    if (!root) return;
    const text = error?.message ? String(error.message).slice(0, 280) : '';
    root.innerHTML = renderFatalScreen(text);
  };

  window.addEventListener('error', (event) => {
    if (event.message && isExternalNoise({ message: event.message, stack: event.error?.stack })) {
      return;
    }
    if (event.message && /ResizeObserver|Script error/i.test(event.message)) return;
    show(event.error || { message: event.message });
  });
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    if (isExternalNoise(reason)) {
      event.preventDefault();
      return;
    }
    show(reason);
  });

  return show;
}
