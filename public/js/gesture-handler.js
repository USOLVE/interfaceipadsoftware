// Gesture Handler - Détection des gestes touch et swipe

class GestureHandler {
  constructor(element) {
    this.element = element;
    this.startX = 0;
    this.startY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.isDragging = false;
    this.startTime = 0;

    this.callbacks = {
      onSwipeUp: null,
      onSwipeDown: null,
      onSwipeLeft: null,
      onSwipeRight: null,
      onDragStart: null,
      onDragMove: null,
      onDragEnd: null,
      onTap: null
    };

    this.init();
  }

  init() {
    // Touch events
    this.element.addEventListener('touchstart', (e) => this.handleStart(e), { passive: false });
    this.element.addEventListener('touchmove', (e) => this.handleMove(e), { passive: false });
    this.element.addEventListener('touchend', (e) => this.handleEnd(e), { passive: false });

    // Mouse events (pour desktop)
    this.element.addEventListener('mousedown', (e) => this.handleStart(e));
    this.element.addEventListener('mousemove', (e) => this.handleMove(e));
    this.element.addEventListener('mouseup', (e) => this.handleEnd(e));
  }

  handleStart(e) {
    const point = e.touches ? e.touches[0] : e;
    this.startX = point.clientX;
    this.startY = point.clientY;
    this.currentX = this.startX;
    this.currentY = this.startY;
    this.startTime = Date.now();
    this.isDragging = false;

    if (this.callbacks.onDragStart) {
      this.callbacks.onDragStart({
        x: this.startX,
        y: this.startY
      });
    }
  }

  handleMove(e) {
    if (!this.startTime) return;

    const point = e.touches ? e.touches[0] : e;
    this.currentX = point.clientX;
    this.currentY = point.clientY;

    const deltaX = this.currentX - this.startX;
    const deltaY = this.currentY - this.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > 10 && !this.isDragging) {
      this.isDragging = true;
    }

    if (this.isDragging && this.callbacks.onDragMove) {
      e.preventDefault();
      this.callbacks.onDragMove({
        deltaX,
        deltaY,
        currentX: this.currentX,
        currentY: this.currentY,
        progress: this.calculateProgress(deltaX, deltaY)
      });
    }
  }

  handleEnd(e) {
    if (!this.startTime) return;

    const duration = Date.now() - this.startTime;
    const deltaX = this.currentX - this.startX;
    const deltaY = this.currentY - this.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / duration;

    if (this.callbacks.onDragEnd) {
      this.callbacks.onDragEnd({
        deltaX,
        deltaY,
        velocity,
        duration
      });
    }

    // Déterminer le type de geste
    if (!this.isDragging && duration < 300 && distance < 10) {
      // Tap
      if (this.callbacks.onTap) {
        this.callbacks.onTap({
          x: this.currentX,
          y: this.currentY
        });
      }
    } else if (this.isDragging) {
      // Swipe detection
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absY > absX && absY > 50) {
        // Vertical swipe
        if (deltaY > 0 && this.callbacks.onSwipeDown) {
          this.callbacks.onSwipeDown({ deltaY, velocity });
        } else if (deltaY < 0 && this.callbacks.onSwipeUp) {
          this.callbacks.onSwipeUp({ deltaY, velocity });
        }
      } else if (absX > absY && absX > 50) {
        // Horizontal swipe
        if (deltaX > 0 && this.callbacks.onSwipeRight) {
          this.callbacks.onSwipeRight({ deltaX, velocity });
        } else if (deltaX < 0 && this.callbacks.onSwipeLeft) {
          this.callbacks.onSwipeLeft({ deltaX, velocity });
        }
      }
    }

    // Reset
    this.startX = 0;
    this.startY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.startTime = 0;
    this.isDragging = false;
  }

  calculateProgress(deltaX, deltaY) {
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const max = Math.max(absX, absY);
    const threshold = 100; // pixels
    return Math.min(max / threshold, 1);
  }

  on(event, callback) {
    const callbackName = `on${event.charAt(0).toUpperCase()}${event.slice(1)}`;
    if (this.callbacks.hasOwnProperty(callbackName)) {
      this.callbacks[callbackName] = callback;
    }
  }
}
