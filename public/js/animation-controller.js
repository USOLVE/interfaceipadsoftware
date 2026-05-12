// Animation Controller - Orchestration des animations

const AnimationController = {
  // Transition between screens
  transitionScreens(fromScreen, toScreen) {
    const screens = {
      lock: document.getElementById('lockScreen'),
      home: document.getElementById('homeScreen'),
      messages: document.getElementById('messagesApp'),
      notes: document.getElementById('notesApp'),
      photos: document.getElementById('photosApp'),
      clock: document.getElementById('clockApp'),
      call: document.getElementById('callScreen')
    };

    // Hide all screens
    Object.values(screens).forEach(screen => {
      if (screen) {
        screen.classList.remove('show', 'active');
      }
    });

    // Show target screen
    if (screens[toScreen]) {
      // Special handling for lock screen
      if (toScreen === 'lock') {
        screens[toScreen].classList.remove('unlocking', 'hidden');
      } else {
        screens[toScreen].classList.add('active');
      }
    }
  },

  // Unlock animation
  unlock() {
    const lockScreen = document.getElementById('lockScreen');
    const homeScreen = document.getElementById('homeScreen');

    lockScreen.classList.add('unlocking');

    setTimeout(() => {
      lockScreen.classList.add('hidden');
      homeScreen.classList.add('active');
      stateManager.changeScreen('home');
    }, 500);
  },

  // Lock animation
  lock() {
    const lockScreen = document.getElementById('lockScreen');
    const homeScreen = document.getElementById('homeScreen');

    lockScreen.classList.remove('unlocking', 'hidden');
    homeScreen.classList.remove('active');

    stateManager.setState({ isLocked: true });
    stateManager.changeScreen('lock');
  },

  // Animate element
  animate(element, animation, duration = 300) {
    return new Promise((resolve) => {
      element.style.animation = `${animation} ${duration}ms var(--ease-ios)`;

      setTimeout(() => {
        element.style.animation = '';
        resolve();
      }, duration);
    });
  },

  // Fade in
  fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';

    requestAnimationFrame(() => {
      element.style.transition = `opacity ${duration}ms var(--ease-ios)`;
      element.style.opacity = '1';
    });
  },

  // Fade out
  fadeOut(element, duration = 300) {
    element.style.transition = `opacity ${duration}ms var(--ease-ios)`;
    element.style.opacity = '0';

    setTimeout(() => {
      element.style.display = 'none';
    }, duration);
  },

  // Scale animation
  scaleAnimation(element, scale = 0.9, duration = 150) {
    element.style.transform = `scale(${scale})`;
    element.style.transition = `transform ${duration}ms var(--ease-ios)`;

    setTimeout(() => {
      element.style.transform = 'scale(1)';
    }, duration);
  }
};
