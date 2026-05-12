// Messages App - Application de messagerie (CRITIQUE pour escape game)

const MessagesApp = {
  conversation: null,
  emptyState: null,
  backButton: null,
  hintBtn: null,
  hintSent: false,

  init() {
    this.conversation = document.getElementById('messagesConversation');
    this.emptyState = document.getElementById('messagesEmpty');
    this.backButton = document.getElementById('messagesBackBtn');
    this.hintBtn = document.getElementById('messagesHintBtn');

    // Back button handler
    this.backButton.addEventListener('click', () => {
      this.close();
    });

    // Hint button handler
    if (this.hintBtn) {
      this.hintBtn.addEventListener('click', () => {
        this.sendHintRequest();
      });
    }

    // Listen for new messages
    stateManager.on('newMessage', (message) => {
      this.addMessage(message);
    });

    // Listen for screen changes
    stateManager.on('screenChange', (data) => {
      if (data.to === 'messages') {
        this.open();
      }
    });
  },

  sendHintRequest() {
    if (this.hintSent) return;

    const hintMessage = "Tu te souviens pas d'autres choses qui pourrait nous aider ?";

    // Visual feedback
    this.hintBtn.classList.add('sent');
    this.hintBtn.querySelector('.messages-app__hint-text').textContent = 'Demande envoyée !';

    // Add message to conversation as "sent" message
    const message = {
      id: Date.now(),
      type: 'text',
      message: hintMessage,
      sender: 'Joueurs',
      timestamp: new Date().toISOString(),
      sent: true // Mark as sent by player
    };

    // Add to UI
    this.addSentMessage(message);

    // Notify server via WebSocket
    if (wsClient && wsClient.socket) {
      wsClient.socket.emit('hint_requested', {
        message: hintMessage,
        timestamp: new Date().toISOString()
      });
    }

    this.hintSent = true;

    // Reset after 30 seconds to allow another request
    setTimeout(() => {
      this.hintSent = false;
      this.hintBtn.classList.remove('sent');
      this.hintBtn.querySelector('.messages-app__hint-text').textContent = hintMessage;
    }, 30000);
  },

  addSentMessage(message) {
    // Hide empty state
    this.emptyState.style.display = 'none';

    // Create sent message bubble
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble message-bubble--sent';
    bubble.innerHTML = `
      <div class="message-bubble__content">
        <div class="message-bubble__text">${message.message}</div>
        <div class="message-bubble__timestamp">${this.formatTime(new Date())}</div>
      </div>
    `;

    // Add to conversation
    this.conversation.appendChild(bubble);
    this.scrollToBottom();
  },

  formatTime(date) {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  },

  open() {
    const app = document.getElementById('messagesApp');
    app.classList.add('show');

    // Hide empty state if there are messages
    if (stateManager.state.messages.length > 0) {
      this.emptyState.style.display = 'none';
    }

    // Mark messages as read
    stateManager.markMessagesAsRead();

    // Scroll to bottom
    setTimeout(() => {
      this.scrollToBottom();
    }, 100);
  },

  close() {
    const app = document.getElementById('messagesApp');
    app.classList.remove('show');

    // Return to home screen
    stateManager.changeScreen('home');
  },

  addMessage(message) {
    // Hide empty state
    this.emptyState.style.display = 'none';

    // Create message bubble
    const bubble = MessageBubble.create(message);

    // Add to conversation
    this.conversation.appendChild(bubble);

    // Scroll to bottom
    this.scrollToBottom();
  },

  scrollToBottom() {
    this.conversation.scrollTop = this.conversation.scrollHeight;
  },

  clear() {
    // Keep empty state, remove all messages
    const messages = this.conversation.querySelectorAll('.message-bubble');
    messages.forEach(msg => msg.remove());

    this.emptyState.style.display = 'flex';
  }
};

// Clear messages on reset
stateManager.on('stateChange', (state) => {
  if (state.messages.length === 0 && MessagesApp.conversation) {
    MessagesApp.clear();
  }
});
