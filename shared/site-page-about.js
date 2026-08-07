(function () {
  const source = document.getElementById('page-about-source');
  if (!source) return;

  const contentHtml = source.innerHTML.trim();
  source.remove();
  if (!contentHtml) return;

  document.body.insertAdjacentHTML('beforeend', `
    <div id="page-about" hidden>
      <div id="page-about-header">
        <span id="page-about-title">About the page</span>
        <button id="page-about-close" type="button" aria-label="Close about panel" title="Close">−</button>
      </div>
      <div id="page-about-body">${contentHtml}</div>
    </div>
  `);

  const panel = document.getElementById('page-about');
  const closeBtn = document.getElementById('page-about-close');

  function ensureFabGroup() {
    let group = document.getElementById('site-fab-group');
    if (group) return group;

    group = document.createElement('div');
    group.id = 'site-fab-group';
    group.className = 'site-fab-group';
    document.body.appendChild(group);

    const chatToggle = document.getElementById('chat-toggle');
    if (chatToggle) group.appendChild(chatToggle);

    return group;
  }

  function ensureAboutToggle() {
    if (document.getElementById('page-about-toggle')) {
      return document.getElementById('page-about-toggle');
    }

    const btn = document.createElement('button');
    btn.id = 'page-about-toggle';
    btn.type = 'button';
    btn.textContent = 'About the page';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'page-about');
    ensureFabGroup().prepend(btn);
    return btn;
  }

  function openAbout() {
    window.SiteChat?.close?.();
    panel.hidden = false;
    const toggle = ensureAboutToggle();
    toggle.setAttribute('aria-expanded', 'true');
    toggle.classList.add('page-about-toggle--active');
    document.body.classList.add('page-about-open');
  }

  function closeAbout() {
    panel.hidden = true;
    const toggle = document.getElementById('page-about-toggle');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.classList.remove('page-about-toggle--active');
    }
    document.body.classList.remove('page-about-open');
  }

  window.SitePageAbout = { open: openAbout, close: closeAbout };

  const aboutToggle = ensureAboutToggle();
  aboutToggle.addEventListener('click', () => {
    if (panel.hidden) openAbout();
    else closeAbout();
  });

  closeBtn.addEventListener('click', closeAbout);

  document.addEventListener('site-chat:open', closeAbout);
})();
