(function () {
  const NAV_ITEMS = [
    { href: 'index.html', label: 'Home' },
    { href: 'p5-sketch1.html', label: '2D Canvas.1' },
    { href: 'p5-sketch2.html', label: '2D Canvas.2' },
    { href: 'three-scene1.html', label: '3D Canvas.1' },
    { href: 'three-scene2.html', label: '3D Canvas.2' },
    { href: 'three-scene3.html', label: '3D Canvas.3' },
    { href: 'three-scene4.html', label: '3D Canvas.4' },
    { href: 'd3-months-scene.html', label: 'Timeline' },
    { href: 'explore-connections.html', label: 'Relational Structures' },
    { href: 'geospatial-production-map.html', label: 'Geospatial' },
    { href: 'doodle-gravity.html', label: 'Interactive' },
  ];

  function currentPage() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    return path === '' ? 'index.html' : path;
  }

  function buildNav() {
    if (document.querySelector('.site-nav')) return;

    const page = currentPage();
    const links = NAV_ITEMS.map(item => {
      const active = item.href === page ? ' class="is-active"' : '';
      return `<a href="${item.href}"${active}>${item.label}</a>`;
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
