(function () {
  const NAV_ITEMS = [
    { path: 'home/', label: 'Home' },
    { path: '2d-canvas-1/', label: '2D Canvas.1' },
    { path: '2d-canvas-2/', label: '2D Canvas.2' },
    { path: '2d-canvas-3/', label: '2D Canvas.3' },
    { path: '2d-canvas-4/', label: '2D Canvas.4' },
    { path: '3d-canvas-1/', label: '3D Canvas.1' },
    { path: '3d-canvas-2/', label: '3D Canvas.2' },
    { path: 'timeline/', label: 'Timeline' },
    { path: 'relational-structures/', label: 'Relational Structures' },
    { path: 'geospatial/', label: 'Geospatial' },
    { path: 'interactive/', label: 'Interactive' },
  ];

  function siteRoot() {
    const script = document.currentScript || document.querySelector('script[src*="site-nav.js"]');
    if (!script?.src) return './';
    const url = new URL(script.src, window.location.href);
    return url.pathname.replace(/shared\/site-nav\.js(\?.*)?$/, '');
  }

  const ROOT = siteRoot();

  function navHref(path) {
    return `${ROOT}${path}`;
  }

  function currentPage() {
    const pathname = window.location.pathname;
    const rel = pathname.startsWith(ROOT)
      ? pathname.slice(ROOT.length)
      : pathname.replace(/^\//, '');

    if (!rel || rel === 'index.html') return 'home/';

    const normalized = rel
      .replace(/index\.html(\?.*)?$/, '')
      .replace(/\/$/, '');

    return normalized ? `${normalized}/` : 'home/';
  }

  function buildNav() {
    if (document.querySelector('.site-nav')) return;

    const page = currentPage();
    const links = NAV_ITEMS.map(item => {
      const active = item.path === page ? ' class="is-active"' : '';
      return `<a href="${navHref(item.path)}"${active}>${item.label}</a>`;
    }).join('');

    const nav = document.createElement('nav');
    nav.className = 'site-nav';
    nav.setAttribute('aria-label', 'Project navigation');
    nav.innerHTML = links;

    document.body.prepend(nav);
    document.body.classList.add('has-site-nav');
  }

  if (document.body) buildNav();
  else document.addEventListener('DOMContentLoaded', buildNav);
})();
