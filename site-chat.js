(function () {
  const script = document.currentScript;
  const isDoodle = document.body.classList.contains('chat-doodle')
    || script?.dataset?.chatMode === 'doodle';

  const chatIcon = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>`;

  if (!document.getElementById('chatbot')) {
    document.body.insertAdjacentHTML('beforeend', `
      <div id="chatbot"${isDoodle ? '' : ' hidden'}>
        <div id="chat-header">
          <span id="chat-title">Portfolio Assistant</span>
          <button id="chat-minimize" type="button" aria-label="Minimize chat" title="Minimize">−</button>
        </div>
        <div id="chat-messages">
          <div class="bot">Hi. Ask me anything about this project.</div>
        </div>
        <div id="chat-input-area">
          <input id="chat-input" type="text" placeholder="Ask something..." autocomplete="off">
          <button id="send-btn" type="button">Send</button>
        </div>
      </div>
    `);
  }

  const chatbot = document.getElementById('chatbot');
  const chatMinimize = document.getElementById('chat-minimize');

  if (!isDoodle && chatMinimize) {
    chatMinimize.hidden = true;
  }

  function ensureChatToggle() {
    if (document.getElementById('chat-toggle')) return document.getElementById('chat-toggle');

    document.body.insertAdjacentHTML('beforeend', `
      <button id="chat-toggle" type="button" aria-label="Open chat" aria-expanded="false">
        ${chatIcon}
      </button>
    `);

    return document.getElementById('chat-toggle');
  }

  function openChat() {
    chatbot.hidden = false;
    chatbot.classList.remove('chatbot--minimized');
    document.body.classList.remove('chat-minimized');

    const toggle = document.getElementById('chat-toggle');
    if (toggle) {
      toggle.hidden = isDoodle;
      toggle.setAttribute('aria-expanded', 'true');
      toggle.classList.add('chat-toggle--active');
    }

    document.getElementById('chat-input')?.focus();
  }

  function closeChat() {
    chatbot.hidden = true;
    chatbot.classList.add('chatbot--minimized');
    document.body.classList.add('chat-minimized');

    const toggle = ensureChatToggle();
    toggle.hidden = false;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.classList.remove('chat-toggle--active');
  }

  if (isDoodle) {
    chatbot.classList.add('chatbot--doodle');
    chatbot.hidden = false;

    chatMinimize?.addEventListener('click', closeChat);

    const toggle = ensureChatToggle();
    toggle.hidden = true;
    toggle.addEventListener('click', () => {
      if (chatbot.hidden) openChat();
      else closeChat();
    });
  } else {
    const toggle = ensureChatToggle();
    toggle.addEventListener('click', () => {
      if (chatbot.hidden) openChat();
      else closeChat();
    });
  }
})();
