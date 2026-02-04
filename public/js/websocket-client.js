// WebSocket Client - Connexion temps réel avec le serveur

class WebSocketClient {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.ringtoneAudio = null;
    this.connect();
  }

  connect() {
    console.log('[WebSocket] Connecting to server...');

    // Connect to Socket.IO server
    this.socket = io();

    // Connection successful
    this.socket.on('connected', (data) => {
      console.log('[WebSocket] Connected:', data);
      this.connected = true;
    });

    // New message received
    this.socket.on('new_message', (message) => {
      console.log('[WebSocket] New message received:', message);
      this.handleNewMessage(message);
    });

    // Incoming call
    this.socket.on('incoming_call', (callData) => {
      console.log('[WebSocket] Incoming call:', callData);
      this.handleIncomingCall(callData);
    });

    // Call ended
    this.socket.on('call_ended', () => {
      console.log('[WebSocket] Call ended');
      stateManager.emit('callEnded');
      stateManager.clearIncomingCall();
    });

    // Reset command
    this.socket.on('reset', () => {
      console.log('[WebSocket] Reset received');
      stateManager.reset();
    });

    // Timer events
    this.socket.on('timer_start', (data) => {
      console.log('[WebSocket] Timer start:', data);
      stateManager.emit('timerStart', data);
    });

    this.socket.on('timer_stop', () => {
      console.log('[WebSocket] Timer stop');
      stateManager.emit('timerStop');
    });

    this.socket.on('timer_set', (data) => {
      console.log('[WebSocket] Timer set:', data);
      stateManager.emit('timerSet', data);
    });

    this.socket.on('timer_adjust', (data) => {
      console.log('[WebSocket] Timer adjust:', data);
      stateManager.emit('timerAdjust', data);
    });

    this.socket.on('timer_pause', () => {
      console.log('[WebSocket] Timer pause');
      stateManager.emit('timerPause');
    });

    // Hint button toggle
    this.socket.on('hint_toggle', (data) => {
      console.log('[WebSocket] Hint toggle:', data);
      stateManager.emit('hintToggle', data);
    });

    // New photo
    this.socket.on('new_photo', (photo) => {
      console.log('[WebSocket] New photo:', photo);
      stateManager.emit('newPhoto', photo);
    });

    // Fullscreen request
    this.socket.on('fullscreen', (data) => {
      console.log('[WebSocket] Fullscreen:', data);
      if (data.enabled) {
        this.requestFullscreen();
      } else {
        this.exitFullscreen();
      }
    });

    // Connection error
    this.socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error);
      this.connected = false;
    });

    // Disconnection
    this.socket.on('disconnect', () => {
      console.log('[WebSocket] Disconnected from server');
      this.connected = false;
    });
  }

  handleNewMessage(message) {
    // Add message to state
    stateManager.addMessage(message);

    // Show notification banner
    this.showNotificationBanner(message);

    // Play notification sound
    this.playNotificationSound();
  }

  showNotificationBanner(message) {
    const banner = document.getElementById('notificationBanner');
    const bannerIcon = document.getElementById('bannerIcon');
    const bannerApp = document.getElementById('bannerApp');
    const bannerTitle = document.getElementById('bannerTitle');
    const bannerMessage = document.getElementById('bannerMessage');

    // Set content
    bannerApp.textContent = 'Messages';
    bannerTitle.textContent = message.sender || 'Nouveau message';

    if (message.type === 'text') {
      bannerMessage.textContent = message.message;
    } else if (message.type === 'image') {
      bannerMessage.textContent = message.caption || 'Vous a envoyé une image';
    } else if (message.type === 'video') {
      bannerMessage.textContent = message.caption || 'Vous a envoyé une vidéo';
    }

    // Show banner
    banner.classList.add('show');

    // Auto-hide after 5 seconds
    setTimeout(() => {
      banner.classList.remove('show');
    }, 5000);

    // Click to open Messages app
    banner.onclick = () => {
      banner.classList.remove('show');
      if (stateManager.state.currentScreen === 'home') {
        stateManager.changeScreen('messages');
      }
    };
  }

  handleIncomingCall(callData) {
    // Set incoming call in state
    stateManager.setIncomingCall(callData);

    // Show call screen
    stateManager.changeScreen('call');

    // Play ringtone
    this.playRingtone();

    // Auto-answer if specified
    if (callData.autoAnswer) {
      setTimeout(() => {
        // Trigger answer on CallScreen directly
        if (typeof CallScreen !== 'undefined') {
          CallScreen.answer();
        }
      }, callData.autoAnswerDelay || 5000);
    }
  }

  answerCall() {
    console.log('[WebSocket] Call answered - notifying server');
    this.socket.emit('call_answered');
    // Don't clear incoming call here - let CallScreen handle it after video
  }

  declineCall() {
    console.log('[WebSocket] Call declined');
    this.socket.emit('call_declined');
    stateManager.clearIncomingCall();
  }

  endCall() {
    console.log('[WebSocket] Call ended by user');
    this.socket.emit('call_ended');
    stateManager.clearIncomingCall();
  }

  playNotificationSound() {
    const audio = new Audio('/assets/sounds/notifications.mp3');
    audio.play().catch(err => console.log('Cannot play sound:', err));
  }

  playRingtone() {
    const audio = new Audio('/assets/sounds/ringtone.mp3');
    audio.loop = true;
    audio.play().catch(err => console.log('Cannot play ringtone:', err));
    // Store audio reference to stop it later
    this.ringtoneAudio = audio;
  }

  stopRingtone() {
    if (this.ringtoneAudio) {
      this.ringtoneAudio.pause();
      this.ringtoneAudio.currentTime = 0;
      this.ringtoneAudio = null;
    }
  }

  // Fullscreen methods
  requestFullscreen() {
    const elem = document.documentElement;

    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  }

  exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }
}

// Global instance
const wsClient = new WebSocketClient();
