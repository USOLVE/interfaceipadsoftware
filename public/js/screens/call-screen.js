// Call Screen - Interface d'appel entrant avec vidéo

const CallScreen = {
  screen: null,
  background: null,
  photo: null,
  name: null,
  number: null,
  answerBtn: null,
  declineBtn: null,

  // Video call elements
  videoScreen: null,
  videoElement: null,
  videoOverlay: null,
  videoCaller: null,
  videoDuration: null,
  endVideoBtn: null,

  // Current call data
  currentCall: null,
  durationInterval: null,
  callStartTime: null,

  init() {
    // Incoming call elements
    this.screen = document.getElementById('callScreen');
    this.background = document.getElementById('callBackground');
    this.photo = document.getElementById('callPhoto').querySelector('img');
    this.name = document.getElementById('callName');
    this.number = document.getElementById('callNumber');
    this.answerBtn = document.getElementById('answerCallBtn');
    this.declineBtn = document.getElementById('declineCallBtn');

    // Video call elements
    this.videoScreen = document.getElementById('videoCallScreen');
    this.videoElement = document.getElementById('callVideo');
    this.videoOverlay = document.getElementById('videoCallOverlay');
    this.videoCaller = document.getElementById('videoCallCaller');
    this.videoDuration = document.getElementById('videoCallDuration');
    this.endVideoBtn = document.getElementById('endVideoCallBtn');

    // Button handlers
    this.answerBtn.addEventListener('click', () => {
      this.answer();
    });

    this.declineBtn.addEventListener('click', () => {
      this.decline();
    });

    this.endVideoBtn.addEventListener('click', () => {
      this.endCall();
    });

    // Video ended handler
    this.videoElement.addEventListener('ended', () => {
      this.endCall();
    });

    // Toggle overlay on video click
    this.videoScreen.addEventListener('click', (e) => {
      // Don't toggle if clicking the end button
      if (e.target.closest('.video-call-screen__end')) return;

      this.videoOverlay.classList.toggle('hidden');
      this.endVideoBtn.style.opacity = this.videoOverlay.classList.contains('hidden') ? '0' : '1';
    });

    // Listen for incoming calls
    stateManager.on('incomingCall', (callData) => {
      this.show(callData);
    });

    // Listen for call ended event from server
    stateManager.on('callEnded', () => {
      this.endCall();
    });
  },

  show(callData) {
    console.log('[CallScreen] Showing call:', callData);

    // Store call data
    this.currentCall = callData;

    // Set caller information
    this.name.textContent = callData.caller || 'Inconnu';
    this.number.textContent = callData.phoneNumber || 'Mobile';

    // Set photo
    if (callData.callerPhoto) {
      this.photo.src = callData.callerPhoto;
      this.photo.onerror = () => {
        this.photo.src = '/assets/images/contact-photos/gm.jpg';
      };
      this.background.style.backgroundImage = `url(${callData.callerPhoto})`;
    } else {
      this.photo.src = '/assets/images/contact-photos/gm.jpg';
      this.background.style.backgroundImage = 'none';
      this.background.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }

    // Show screen
    this.screen.classList.remove('hidden');
    this.screen.classList.add('show');
  },

  hide() {
    this.screen.classList.remove('show');

    // Reset after animation
    setTimeout(() => {
      this.screen.classList.add('hidden');
    }, 500);
  },

  answer() {
    console.log('[CallScreen] Call answered');

    // Notify server
    wsClient.answerCall();
    wsClient.stopRingtone();

    // Hide incoming call screen
    this.hide();

    // Check if there's a video to play
    if (this.currentCall && this.currentCall.videoUrl) {
      console.log('[CallScreen] Starting video call with:', this.currentCall.videoUrl);
      setTimeout(() => {
        this.startVideoCall();
      }, 600); // Wait for hide animation
    } else {
      console.log('[CallScreen] No video URL, returning to home');
      // No video, just end the call UI
      setTimeout(() => {
        stateManager.changeScreen('home');
        stateManager.clearIncomingCall();
      }, 500);
    }
  },

  startVideoCall() {
    console.log('[CallScreen] Starting video playback');

    // Set caller name in video screen
    this.videoCaller.textContent = this.currentCall.caller || 'Appel en cours...';

    // Set video source
    this.videoElement.src = this.currentCall.videoUrl;

    // Show video screen
    this.videoScreen.classList.add('active');

    // Reset overlay visibility
    this.videoOverlay.classList.remove('hidden');
    this.endVideoBtn.style.opacity = '1';

    // Start duration counter
    this.callStartTime = Date.now();
    this.updateDuration();
    this.durationInterval = setInterval(() => {
      this.updateDuration();
    }, 1000);

    // Play video
    this.videoElement.play().catch(err => {
      console.error('[CallScreen] Error playing video:', err);
      // If video fails, end call
      this.endCall();
    });
  },

  updateDuration() {
    const elapsed = Math.floor((Date.now() - this.callStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    this.videoDuration.textContent = `${minutes}:${seconds}`;
  },

  endCall() {
    console.log('[CallScreen] Ending call');

    // Stop duration counter
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
      this.durationInterval = null;
    }

    // Stop and reset video
    this.videoElement.pause();
    this.videoElement.src = '';

    // Hide video screen
    this.videoScreen.classList.remove('active');

    // Hide incoming call screen if still visible
    this.hide();

    // Clear current call
    this.currentCall = null;

    // Notify server and clear state
    wsClient.endCall();

    // Return to home screen
    stateManager.changeScreen('home');
  },

  decline() {
    console.log('[CallScreen] Call declined');
    wsClient.declineCall();
    wsClient.stopRingtone();
    this.currentCall = null;
    this.hide();
    stateManager.changeScreen('home');
  }
};
