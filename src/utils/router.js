const VIEW_BY_PATH = {
  '/': 'home',
  '/intro': 'intro',
  '/ruta': 'dashboard',
  '/ayuda': 'help',
  '/caso': 'caseOverview',
  '/explorar': 'caseExplore',
};

export function getPathFromHash() {
  const raw = window.location.hash.replace(/^#/, '');
  if (!raw || raw === '') {
    return '/';
  }
  return raw.startsWith('/') ? raw : `/${raw}`;
}

export function parseRoute(path) {
  if (path.startsWith('/explorar/')) {
    return {
      view: 'caseExplore',
      sectionId: decodeURIComponent(path.replace('/explorar/', '')),
    };
  }

  if (path === '/comprender' || path.startsWith('/comprender/')) {
    const raw = path.replace('/comprender/', '').replace('/comprender', '');
    const substage = Number(raw);
    return {
      view: 'understand',
      substage: Number.isFinite(substage) && substage > 0 ? substage : null,
    };
  }

  if (path === '/medir' || path.startsWith('/medir/')) {
    const raw = path.replace('/medir/', '').replace('/medir', '');
    const substage = Number(raw);
    return {
      view: 'measure',
      substage: Number.isFinite(substage) && substage > 0 ? substage : null,
    };
  }

  if (path === '/decidir' || path.startsWith('/decidir/')) {
    const raw = path.replace('/decidir/', '').replace('/decidir', '');
    const substage = Number(raw);
    return {
      view: 'decide',
      substage: Number.isFinite(substage) && substage > 0 ? substage : null,
    };
  }

  if (path === '/gobernar' || path.startsWith('/gobernar/')) {
    const raw = path.replace('/gobernar/', '').replace('/gobernar', '');
    const substage = Number(raw);
    return {
      view: 'govern',
      substage: Number.isFinite(substage) && substage > 0 ? substage : null,
    };
  }

  if (path === '/diagnosticar' || path.startsWith('/diagnosticar/')) {
    const raw = path.replace('/diagnosticar/', '').replace('/diagnosticar', '');
    const substage = Number(raw);
    return {
      view: 'diagnose',
      substage: Number.isFinite(substage) && substage > 0 ? substage : null,
    };
  }

  if (path === '/exportar/imprimir') {
    return { view: 'export', print: true };
  }

  if (path === '/exportar' || path.startsWith('/exportar/')) {
    return { view: 'export', print: false };
  }

  if (path === '/construir' || path.startsWith('/construir/')) {
    const raw = path.replace('/construir/', '').replace('/construir', '');
    const substage = Number(raw);
    return {
      view: 'build',
      substage: Number.isFinite(substage) && substage > 0 ? substage : null,
    };
  }

  if (path === '/representar' || path.startsWith('/representar/')) {
    const raw = path.replace('/representar/', '').replace('/representar', '');
    const substage = Number(raw);
    return {
      view: 'represent',
      substage: Number.isFinite(substage) && substage > 0 ? substage : null,
    };
  }

  return {
    view: VIEW_BY_PATH[path] ?? 'home',
    sectionId: null,
  };
}

export function getViewFromPath(path) {
  return parseRoute(path).view;
}

export function navigate(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (getPathFromHash() === normalized) {
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    return;
  }
  window.location.hash = normalized;
}
