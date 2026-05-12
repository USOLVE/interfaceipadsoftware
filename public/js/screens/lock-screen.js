// Lock Screen - Écran de verrouillage avec code PIN

const LockScreen = {
  lockTimeElement: null,
  lockDateElement: null,
  slideContainer: null,
  slideProgress: null,
  gestureHandler: null,

  // PIN Code
  pinScreen: null,
  pinDots: null,
  pinError: null,
  pinKeypad: null,
  pinCancel: null,
  enteredPin: '',
  correctPin: '4242',

  init() {
    this.lockTimeElement = document.getElementById('lockTime');
    this.lockDateElement = document.getElementById('lockDate');
    this.slideContainer = document.getElementById('slideToUnlock');
    this.slideProgress = document.getElementById('slideProgress');

    // PIN elements
    this.pinScreen = document.getElementById('pinScreen');
    this.pinDots = document.getElementById('pinDots');
    this.pinError = document.getElementById('pinError');
    this.pinKeypad = document.getElementById('pinKeypad');
    this.pinCancel = document.getElementById('pinCancel');

    // Update time and date
    stateManager.on('stateChange', (state) => {
      this.updateTime(state.time);
    });

    // Setup gesture handler for slide to unlock
    this.setupSlideToUnlock();

    // Setup PIN keypad
    this.setupPinKeypad();

    // Initial update
    this.updateTime(stateManager.state.time);
  },

  updateTime(date) {
    if (!date) return;

    // Time
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    this.lockTimeElement.textContent = `${hours}:${minutes}`;

    // Date
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    const dateStr = date.toLocaleDateString('fr-FR', options);
    this.lockDateElement.textContent = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
  },

  setupSlideToUnlock() {
    this.gestureHandler = new GestureHandler(this.slideContainer);

    let startY = 0;
    let isDragging = false;

    this.gestureHandler.on('dragStart', (data) => {
      startY = data.y;
      isDragging = true;
      this.slideContainer.classList.add('dragging');
    });

    this.gestureHandler.on('dragMove', (data) => {
      if (data.deltaY < 0) { // Swipe up
        const progress = Math.min(Math.abs(data.deltaY) / 200, 1);
        this.slideProgress.style.width = `${progress * 100}%`;
      }
    });

    this.gestureHandler.on('dragEnd', (data) => {
      isDragging = false;
      this.slideContainer.classList.remove('dragging');

      // Check if swipe is enough to show PIN screen
      if (data.deltaY < -100 && data.velocity > 0.5) {
        this.showPinScreen();
      }
      // Reset progress
      this.slideProgress.style.width = '0%';
    });

    // Alternative: swipe up anywhere on lock screen to show PIN
    const lockScreen = document.getElementById('lockScreen');
    const lockGesture = new GestureHandler(lockScreen);

    lockGesture.on('swipeUp', (data) => {
      if (Math.abs(data.deltaY) > 150) {
        this.showPinScreen();
      }
    });
  },

  setupPinKeypad() {
    // Handle key presses
    this.pinKeypad.addEventListener('click', (e) => {
      const key = e.target.closest('.pin-screen__key');
      if (!key) return;

      const keyValue = key.dataset.key;
      if (!keyValue) return;

      if (keyValue === 'delete') {
        this.deleteDigit();
      } else {
        this.addDigit(keyValue);
      }
    });

    // Handle cancel button
    this.pinCancel.addEventListener('click', () => {
      this.hidePinScreen();
    });

    // Handle keyboard input (for desktop testing)
    document.addEventListener('keydown', (e) => {
      if (!this.pinScreen.classList.contains('active')) return;

      if (e.key >= '0' && e.key <= '9') {
        this.addDigit(e.key);
      } else if (e.key === 'Backspace') {
        this.deleteDigit();
      } else if (e.key === 'Escape') {
        this.hidePinScreen();
      }
    });
  },

  showPinScreen() {
    this.enteredPin = '';
    this.updatePinDots();
    this.pinError.classList.remove('visible');
    this.pinScreen.classList.add('active');
  },

  hidePinScreen() {
    this.pinScreen.classList.remove('active');
    this.enteredPin = '';
    this.updatePinDots();
  },

  addDigit(digit) {
    if (this.enteredPin.length >= 4) return;

    this.enteredPin += digit;
    this.updatePinDots();

    // Check PIN when 4 digits entered
    if (this.enteredPin.length === 4) {
      setTimeout(() => this.checkPin(), 200);
    }
  },

  deleteDigit() {
    if (this.enteredPin.length === 0) return;

    this.enteredPin = this.enteredPin.slice(0, -1);
    this.updatePinDots();
  },

  updatePinDots() {
    const dots = this.pinDots.querySelectorAll('.pin-screen__dot');
    dots.forEach((dot, index) => {
      dot.classList.remove('filled', 'error');
      if (index < this.enteredPin.length) {
        dot.classList.add('filled');
      }
    });
  },

  checkPin() {
    if (this.enteredPin === this.correctPin) {
      // Correct PIN - unlock
      this.hidePinScreen();
      this.unlock();
    } else {
      // Wrong PIN - show error
      this.showError();
    }
  },

  showError() {
    const dots = this.pinDots.querySelectorAll('.pin-screen__dot');
    dots.forEach(dot => dot.classList.add('error'));
    this.pinError.classList.add('visible');

    // Reset after animation
    setTimeout(() => {
      this.enteredPin = '';
      this.updatePinDots();
      this.pinError.classList.remove('visible');
    }, 1000);
  },

  unlock() {
    AnimationController.unlock();
    this.slideProgress.style.width = '0%';
  }
};
