const endpoint =
  'https://us-central1-design-workflows.cloudfunctions.net/chat';

const messagesDiv = document.getElementById('chat-messages');
const input = document.getElementById('chat-input');
const button = document.getElementById('send-btn');

if (!messagesDiv || !input || !button) {
  console.warn('Chatbot elements not found on this page.');
} else {

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  messagesDiv.innerHTML += `
    <div class="user">
      <b>You</b><br>${text}
    </div>
  `;

  input.value = '';
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: text }]
      })
    });

    const data = await response.json();

    messagesDiv.innerHTML += `
      <div class="bot">
        <b>Assistant</b><br>
        ${data.reply}
      </div>
    `;

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  } catch (e) {
    console.error(e);
    messagesDiv.innerHTML += `
      <div class="bot">
        Unable to reach the chatbot.
      </div>
    `;
  }
}

button.addEventListener('click', sendMessage);

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendMessage();
  }
});

}
