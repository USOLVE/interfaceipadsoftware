// Main - Point d'entrée de l'application

(function() {
  'use strict';

  console.log('🚀 iPad Escape Game Interface - Starting...');

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    console.log('📱 Initializing iPad interface...');

    // Initialize components
    StatusBar.init();
    Notification.init();

    // Initialize screens
    LockScreen.init();
    HomeScreen.init();
    MessagesApp.init();
    NotesApp.init();
    PhotosApp.init();
    ClockApp.init();
    CallScreen.init();
    KaraokeApp.init();

    // Setup inactivity auto-lock (5 minutes)
    setupInactivityTimer();

    // Setup screen change listener
    stateManager.on('screenChange', (data) => {
      console.log(`Screen changed: ${data.from} → ${data.to}`);
      AnimationController.transitionScreens(data.from, data.to);

      // Update status bar style
      if (data.to === 'lock') {
        StatusBar.setStyle('lock');
      } else if (data.to === 'home') {
        StatusBar.setStyle('home');
      }
    });

    // Prevent context menu on long press (for better mobile experience)
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    // Prevent zoom on double tap
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, false);

    // Prevent pull-to-refresh
    document.body.addEventListener('touchmove', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });

    // Setup fullscreen mode
    setupFullscreenMode();

    // Setup audio unlock for iOS
    setupAudioUnlock();

    // Welcome message
    console.log('✅ iPad interface ready!');
    console.log('🔌 WebSocket connected. Ready to receive messages from Node-RED!');
    console.log('📡 API endpoints available:');
    console.log('  POST /api/message - Send text message');
    console.log('  POST /api/image - Send image');
    console.log('  POST /api/video - Send video');
    console.log('  POST /api/call - Trigger incoming call');
    console.log('  POST /api/timer/start - Start timer {duration: seconds}');
    console.log('  POST /api/timer/stop - Stop timer');
    console.log('  POST /api/hint/toggle - Toggle hint button {enabled: true/false}');
    console.log('  POST /api/photo - Add photo to gallery {url: "..."}');
    console.log('  POST /api/fullscreen - Request fullscreen {enabled: true/false}');
    console.log('  POST /api/reset - Reset all data');
  }

  // Audio unlock for iOS - must be triggered by user interaction
  function setupAudioUnlock() {
    let audioUnlocked = false;

    const unlockAudio = () => {
      if (audioUnlocked) return;

      // Create and play a silent audio to unlock
      const silentAudio = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYoRwmHAAAAAAD/+9DEAAAG4ANX9AAAIi4g6v80IAAAAAA3/AAAAABJAAAACQAAAAEA//vQxBcAAADSAAAAAAAAANIAAAAASZmZmf/7EMQoAAADSAAAAAAAAANIAAAAAExBTUUz//sQxDQAAANIAAAAAAAAANIAAAAAMQBVAVf/+xDEPwAAA0gAAAAAAAAAQgAAAABNQQAA//sQxEkAAANIAAAAAAAAAEoAAAAATEFNRf/7EMRVAAADSAAAAAAAAACQAAAADEAuLi7/+xDEXgAAA0gAAAAAAAAASgAAAABMQU1F//sQxGcAAANIAAAAAAAAAE4AAAAA//sQxG0AAANIAAAAAAAAAE4AAAAA//sQxHMAAANIAAAAAAAAAE4AAAAA');
      silentAudio.play().then(() => {
        console.log('[Audio] Audio unlocked for iOS');
        audioUnlocked = true;
      }).catch(() => {});

      // Also try AudioContext
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
        console.log('[Audio] AudioContext unlocked');
      } catch (e) {}
    };

    // Unlock on first interaction
    const events = ['touchstart', 'touchend', 'click', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, unlockAudio, { once: true });
    });
  }

  // Inactivity auto-lock setup (5 minutes)
  let inactivityTimeout = null;
  const INACTIVITY_DELAY = 5 * 60 * 1000; // 5 minutes in ms

  function setupInactivityTimer() {
    const resetInactivityTimer = () => {
      // Clear existing timeout
      if (inactivityTimeout) {
        clearTimeout(inactivityTimeout);
      }

      // Don't start timer if already on lock screen
      if (stateManager.state.currentScreen === 'lock') {
        return;
      }

      // Set new timeout
      inactivityTimeout = setTimeout(() => {
        console.log('⏰ Inactivity timeout - locking screen');
        // Return to lock screen
        AnimationController.lock();
      }, INACTIVITY_DELAY);
    };

    // Reset timer on any user interaction
    const interactionEvents = ['touchstart', 'touchmove', 'click', 'keydown', 'scroll'];
    interactionEvents.forEach(event => {
      document.addEventListener(event, resetInactivityTimer, { passive: true });
    });

    // Reset timer on screen change (except to lock)
    stateManager.on('screenChange', (data) => {
      if (data.to !== 'lock') {
        resetInactivityTimer();
      } else {
        // Clear timer when going to lock screen
        if (inactivityTimeout) {
          clearTimeout(inactivityTimeout);
          inactivityTimeout = null;
        }
      }
    });

    // Initial timer start
    resetInactivityTimer();
  }

  // Fullscreen mode setup
  function setupFullscreenMode() {
    // Request fullscreen on first user interaction (required by browsers)
    const requestFullscreenOnInteraction = () => {
      const elem = document.documentElement;

      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {});
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      }

      // Remove listener after first interaction
      document.removeEventListener('touchstart', requestFullscreenOnInteraction);
      document.removeEventListener('click', requestFullscreenOnInteraction);
    };

    // Listen for first interaction
    document.addEventListener('touchstart', requestFullscreenOnInteraction, { once: true });
    document.addEventListener('click', requestFullscreenOnInteraction, { once: true });

    // Prevent exiting fullscreen (re-request on exit)
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        // Try to re-enter fullscreen after a short delay
        setTimeout(() => {
          const elem = document.documentElement;
          if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(() => {});
          } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
          }
        }, 100);
      }
    });

    // Prevent keyboard shortcuts that might exit fullscreen
    document.addEventListener('keydown', (e) => {
      // Block Escape key
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Block F11
      if (e.key === 'F11') {
        e.preventDefault();
        return false;
      }

      // Block browser shortcuts (Ctrl/Cmd + W, T, N, etc.)
      if ((e.ctrlKey || e.metaKey) && ['w', 't', 'n', 'r'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        return false;
      }
    }, true);
  }

  // Error handling
  window.addEventListener('error', (e) => {
    console.error('❌ Error:', e.error);
  });

  window.addEventListener('unhandledrejection', (e) => {
    console.error('❌ Unhandled Promise Rejection:', e.reason);
  });
})();
