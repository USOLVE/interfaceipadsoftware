// State Manager - Gestion centralisée de l'état de l'application

class StateManager {
  constructor() {
    this.state = {
      currentScreen: 'lock',  // 'lock', 'home', 'messages', 'call'
      isLocked: true,
      time: new Date(),
      battery: 100,
      messages: [],
      notifications: [],
      incomingCall: null,
      unreadCount: 0,
      apps: []
    };

    this.listeners = {
      stateChange: [],
      newMessage: [],
      newNotification: [],
      incomingCall: [],
      screenChange: []
    };

    // Update time every second
    setInterval(() => {
      this.updateTime();
    }, 1000);

    // Simulate battery drain
    setInterval(() => {
      this.state.battery = Math.max(0, this.state.battery - 0.1);
      this.emit('stateChange', this.state);
    }, 60000); // Every minute
  }

  // Get current state
  getState() {
    return { ...this.state };
  }

  // Update state
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.emit('stateChange', this.state);
  }

  // Update time
  updateTime() {
    this.state.time = new Date();
    this.emit('stateChange', this.state);
  }

  // Add message
  addMessage(message) {
    this.state.messages.push(message);
    this.state.unreadCount++;
    this.emit('newMessage', message);
    this.emit('stateChange', this.state);
  }

  // Add notification
  addNotification(notification) {
    this.state.notifications.push(notification);
    this.emit('newNotification', notification);
    this.emit('stateChange', this.state);
  }

  // Set incoming call
  setIncomingCall(callData) {
    this.state.incomingCall = callData;
    this.emit('incomingCall', callData);
    this.emit('stateChange', this.state);
  }

  // Clear incoming call
  clearIncomingCall() {
    this.state.incomingCall = null;
    this.emit('stateChange', this.state);
  }

  // Change screen
  changeScreen(screen) {
    const prevScreen = this.state.currentScreen;
    this.state.currentScreen = screen;

    if (screen !== 'lock') {
      this.state.isLocked = false;
    }

    this.emit('screenChange', { from: prevScreen, to: screen });
    this.emit('stateChange', this.state);
  }

  // Mark messages as read
  markMessagesAsRead() {
    this.state.unreadCount = 0;
    this.emit('stateChange', this.state);
  }

  // Reset all data
  reset() {
    this.state.messages = [];
    this.state.notifications = [];
    this.state.incomingCall = null;
    this.state.unreadCount = 0;
    this.emit('stateChange', this.state);
  }

  // Event system
  on(event, callback) {
    // Create event array if it doesn't exist (support dynamic events)
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
}

// Global instance
const stateManager = new StateManager();
