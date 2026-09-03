(() => {
  if (window.__RECAST_UI_CONSISTENCY_BOOTSTRAP__) return;
  window.__RECAST_UI_CONSISTENCY_BOOTSTRAP__ = true;

  const hasCss = [...document.querySelectorAll('link[rel="stylesheet"]')]
    .some(link => (link.getAttribute('href') || '').includes('ui-consistency.css'));
  if (!hasCss) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/ui-consistency.css?v=2';
    document.head.appendChild(link);
  }

  const hasScript = [...document.querySelectorAll('script[src]')]
    .some(script => (script.getAttribute('src') || '').includes('ui-consistency.js'));
  if (!hasScript) {
    const script = document.createElement('script');
    script.src = '/ui-consistency.js?v=2';
    script.defer = true;
    document.head.appendChild(script);
  }
})();
