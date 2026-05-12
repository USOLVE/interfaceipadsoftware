// Status Bar Component with Timer and Hint Button

const StatusBar = {
  timeElement: null,
  batteryElement: null,
  batteryFill: null,
  batteryLevel: null,

  // Timer
  timerElement: null,
  timerInterval: null,
  timerEndTime: null,
  timerActive: false,

  // Hint Button
  hintBtn: null,
  hintEnabled: false,

  init() {
    this.timeElement = document.getElementById('statusTime');
    this.batteryElement = document.getElementById('statusBattery');
    this.batteryFill = this.batteryElement.querySelector('.status-bar__battery-fill');
    this.batteryLevel = this.batteryElement.querySelector('.status-bar__battery-level');

    // Timer element
    this.timerElement = document.getElementById('statusTimer');

    // Hint button
    this.hintBtn = document.getElementById('hintBtn');
    this.hintBtn.addEventListener('click', () => {
      this.requestHint();
    });

    // Update time and battery on state change
    stateManager.on('stateChange', (state) => {
      this.updateTime(state.time);
      this.updateBattery(state.battery);
    });

    // Listen for timer events
    stateManager.on('timerStart', (data) => {
      this.startTimer(data.duration);
    });

    stateManager.on('timerStop', () => {
      this.stopTimer();
    });

    stateManager.on('timerSet', (data) => {
      this.setTimer(data.duration);
    });

    stateManager.on('hintToggle', (data) => {
      this.toggleHintButton(data.enabled);
    });

    // Initial update
    this.updateTime(stateManager.state.time);
    this.updateBattery(stateManager.state.battery);
  },

  updateTime(date) {
    if (!date || !this.timeElement) return;

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    this.timeElement.textContent = `${hours}:${minutes}`;
  },

  updateBattery(level) {
    if (!this.batteryFill || !this.batteryLevel) return;

    const percentage = Math.round(level);
    this.batteryLevel.textContent = `${percentage}%`;
    this.batteryFill.style.width = `${percentage}%`;

    // Update battery color based on level
    if (percentage < 20) {
      this.batteryElement.classList.add('status-bar__battery--low');
    } else {
      this.batteryElement.classList.remove('status-bar__battery--low');
    }
  },

  setStyle(style) {
    const statusBar = document.getElementById('statusBar');
    statusBar.className = 'status-bar';

    if (style === 'lock') {
      statusBar.classList.add('lock-style');
    } else if (style === 'home') {
      statusBar.classList.add('home-style');
    }
  },

  // Timer Methods
  startTimer(durationSeconds) {
    this.stopTimer(); // Clear any existing timer

    this.timerEndTime = Date.now() + (durationSeconds * 1000);
    this.timerActive = true;
    this.timerElement.classList.add('active');

    this.updateTimerDisplay();

    this.timerInterval = setInterval(() => {
      this.updateTimerDisplay();
    }, 1000);
  },

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.timerActive = false;
    this.timerElement.classList.remove('active', 'warning', 'danger');
  },

  setTimer(durationSeconds) {
    // Set timer without starting (just display)
    this.timerEndTime = Date.now() + (durationSeconds * 1000);
    this.timerActive = true;
    this.timerElement.classList.add('active');
    this.updateTimerDisplay();

    // Don't start interval, just show static time
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  },

  updateTimerDisplay() {
    if (!this.timerActive) return;

    const remaining = Math.max(0, this.timerEndTime - Date.now());
    const totalSeconds = Math.ceil(remaining / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    this.timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Update styling based on remaining time
    this.timerElement.classList.remove('warning', 'danger');

    if (totalSeconds <= 60) {
      this.timerElement.classList.add('danger');
    } else if (totalSeconds <= 300) { // 5 minutes
      this.timerElement.classList.add('warning');
    }

    // Timer ended
    if (totalSeconds <= 0) {
      this.stopTimer();
      this.timerElement.textContent = '00:00';
      this.timerElement.classList.add('active', 'danger');

      // Emit timer ended event
      stateManager.emit('timerEnded');

      // Notify server
      if (wsClient && wsClient.socket) {
        wsClient.socket.emit('timer_ended');
      }
    }
  },

  // Hint Button Methods
  toggleHintButton(enabled) {
    this.hintEnabled = enabled;
    if (enabled) {
      this.hintBtn.classList.add('active');
    } else {
      this.hintBtn.classList.remove('active');
    }
  },

  requestHint() {
    if (!this.hintEnabled) return;

    console.log('[StatusBar] Hint requested');

    // Visual feedback
    this.hintBtn.style.transform = 'scale(0.8)';
    setTimeout(() => {
      this.hintBtn.style.transform = '';
    }, 150);

    // Notify server
    if (wsClient && wsClient.socket) {
      wsClient.socket.emit('hint_requested', {
        timestamp: new Date().toISOString()
      });
    }

    // Emit local event
    stateManager.emit('hintRequested');
  }
};
