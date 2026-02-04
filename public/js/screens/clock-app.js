// Clock App - Application Horloge avec Timer Escape Game

const ClockApp = {
  container: null,
  backBtn: null,
  timerTime: null,
  timerProgress: null,
  timerLabel: null,

  // Timer state
  timerInterval: null,
  timerEndTime: null,
  timerDuration: 60 * 60, // 60 minutes par défaut
  timerRunning: false,
  timerPaused: false,
  pausedTimeRemaining: 0, // Temps restant lors de la pause
  circumference: 2 * Math.PI * 126, // rayon du cercle SVG

  init() {
    this.container = document.getElementById('clockApp');
    this.backBtn = document.getElementById('clockBackBtn');
    this.timerTime = document.getElementById('clockTimerTime');
    this.timerProgress = document.getElementById('clockTimerProgress');
    this.timerLabel = document.getElementById('clockTimerLabel');

    // Set initial stroke-dasharray
    if (this.timerProgress) {
      this.timerProgress.style.strokeDasharray = this.circumference;
      this.timerProgress.style.strokeDashoffset = 0;
    }

    // Back button
    this.backBtn.addEventListener('click', () => {
      this.hide();
    });

    // Listen for screen changes
    stateManager.on('screenChange', (data) => {
      if (data.to === 'clock') {
        this.show();
      }
    });

    // Listen for API timer events
    stateManager.on('timerStart', (data) => {
      console.log('[ClockApp] Timer start from API:', data);
      this.startTimer(data.duration);
    });

    stateManager.on('timerStop', () => {
      console.log('[ClockApp] Timer stop from API');
      this.stopTimer(true);
    });

    stateManager.on('timerSet', (data) => {
      console.log('[ClockApp] Timer set from API:', data);
      this.setTimerDisplay(data.duration);
    });

    stateManager.on('timerAdjust', (data) => {
      console.log('[ClockApp] Timer adjust from API:', data);
      this.adjustTime(data.seconds);
    });

    stateManager.on('timerPause', () => {
      console.log('[ClockApp] Timer pause from API');
      this.pauseTimer();
    });
  },

  adjustTime(seconds) {
    if (this.timerPaused) {
      // If paused, adjust the paused time
      this.pausedTimeRemaining = Math.max(10, this.pausedTimeRemaining + seconds);
      const mins = Math.floor(this.pausedTimeRemaining / 60);
      const secs = this.pausedTimeRemaining % 60;
      this.timerTime.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    } else if (!this.timerRunning) {
      // If not running, adjust the default duration
      this.timerDuration = Math.max(10, this.timerDuration + seconds);
      const mins = Math.floor(this.timerDuration / 60);
      const secs = this.timerDuration % 60;
      this.timerTime.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    } else {
      // If running, adjust the end time
      this.timerEndTime += seconds * 1000;
      // Ensure at least 1 second remaining
      if (this.timerEndTime < Date.now() + 1000) {
        this.timerEndTime = Date.now() + 1000;
      }
      this.updateTimerDisplay();
    }
  },

  setTimerDisplay(durationSeconds) {
    // Set timer without starting (just display)
    this.timerDuration = durationSeconds;
    const mins = Math.floor(durationSeconds / 60);
    const secs = durationSeconds % 60;
    this.timerTime.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    this.timerLabel.textContent = 'Appuyez pour démarrer';
  },

  show() {
    this.container.classList.add('active');

    // Show default time if not running
    if (!this.timerRunning) {
      this.setTimerDisplay(this.timerDuration);
    }
  },

  hide() {
    this.container.classList.remove('active');
    stateManager.changeScreen('home');
  },

  startTimer(durationSeconds) {
    // Clear any existing interval
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    this.timerDuration = durationSeconds;
    this.timerEndTime = Date.now() + (durationSeconds * 1000);
    this.timerRunning = true;
    this.timerPaused = false;
    this.pausedTimeRemaining = 0;

    // Update display immediately
    this.updateTimerDisplay();

    // Start interval
    this.timerInterval = setInterval(() => {
      this.updateTimerDisplay();
    }, 1000);

    this.timerLabel.textContent = 'Temps restant';
  },

  pauseTimer() {
    if (!this.timerRunning) return;

    // Save remaining time
    this.pausedTimeRemaining = this.getRemainingTime();
    this.timerPaused = true;

    // Stop the interval
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    this.timerRunning = false;
    this.timerLabel.textContent = 'En pause';
  },

  stopTimer(reset = true) {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    this.timerRunning = false;
    this.timerPaused = false;
    this.pausedTimeRemaining = 0;

    if (reset) {
      this.timerDuration = 60 * 60; // Reset to 60 min
      this.timerTime.textContent = '60:00';
      this.timerTime.className = 'clock-app__timer-time';
      this.timerProgress.style.strokeDashoffset = 0;
      this.timerProgress.className = 'clock-app__timer-progress';
      this.timerLabel.textContent = 'Appuyez pour démarrer';
    }
  },

  updateTimerDisplay() {
    if (!this.timerRunning) return;

    const remaining = Math.max(0, this.timerEndTime - Date.now());
    const totalSeconds = Math.ceil(remaining / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    // Update time display
    this.timerTime.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Update progress circle
    const elapsed = this.timerDuration - totalSeconds;
    const progress = elapsed / this.timerDuration;
    const offset = this.circumference * progress;
    this.timerProgress.style.strokeDashoffset = offset;

    // Update styling based on remaining time
    this.timerTime.classList.remove('warning', 'danger');
    this.timerProgress.classList.remove('warning', 'danger');

    if (totalSeconds <= 60) {
      // Less than 1 minute - danger
      this.timerTime.classList.add('danger');
      this.timerProgress.classList.add('danger');
    } else if (totalSeconds <= 300) {
      // Less than 5 minutes - warning
      this.timerTime.classList.add('warning');
      this.timerProgress.classList.add('warning');
    }

    // Timer ended
    if (totalSeconds <= 0) {
      this.timerRunning = false;
      clearInterval(this.timerInterval);
      this.timerInterval = null;

      this.timerTime.textContent = '00:00';
      this.timerTime.classList.add('danger');
      this.timerProgress.classList.add('danger');
      this.timerLabel.textContent = 'Temps écoulé !';

      // Notify server
      if (wsClient && wsClient.socket) {
        wsClient.socket.emit('timer_ended');
      }

      // Emit local event
      stateManager.emit('timerEnded');
    }
  },

  // Get remaining time (for external use)
  getRemainingTime() {
    if (this.timerPaused) return this.pausedTimeRemaining;
    if (!this.timerRunning) return 0;
    return Math.max(0, Math.ceil((this.timerEndTime - Date.now()) / 1000));
  },

  // Set timer duration (can be called from API)
  setDuration(seconds) {
    this.timerDuration = seconds;
    if (this.timerRunning) {
      this.startTimer(seconds);
    }
  }
};
