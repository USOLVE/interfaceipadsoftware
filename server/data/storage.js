// Stockage en mémoire pour les messages, médias et appels
class Storage {
  constructor() {
    this.messages = [];
    this.notifications = [];
    this.currentCall = null;
    this.timer = null;
    this.hintEnabled = false;
    this.photos = [];
  }

  // Ajouter un message
  addMessage(messageData) {
    const message = {
      id: `msg-${Date.now()}`,
      type: 'text',
      sender: messageData.sender,
      senderPhoto: messageData.senderPhoto,
      message: messageData.message,
      timestamp: messageData.timestamp || new Date().toISOString(),
      read: false
    };
    this.messages.push(message);
    return message;
  }

  // Ajouter une image
  addImage(imageData) {
    const message = {
      id: `img-${Date.now()}`,
      type: 'image',
      sender: imageData.sender,
      senderPhoto: imageData.senderPhoto,
      imageUrl: imageData.imageUrl,
      caption: imageData.caption || '',
      timestamp: new Date().toISOString(),
      read: false
    };
    this.messages.push(message);
    return message;
  }

  // Ajouter une vidéo
  addVideo(videoData) {
    const message = {
      id: `vid-${Date.now()}`,
      type: 'video',
      sender: videoData.sender,
      senderPhoto: videoData.senderPhoto,
      videoUrl: videoData.videoUrl,
      caption: videoData.caption || '',
      timestamp: new Date().toISOString(),
      read: false
    };
    this.messages.push(message);
    return message;
  }

  // Définir un appel entrant
  setIncomingCall(callData) {
    this.currentCall = {
      id: `call-${Date.now()}`,
      caller: callData.caller,
      callerPhoto: callData.callerPhoto,
      phoneNumber: callData.phoneNumber,
      videoUrl: callData.videoUrl || null,
      autoAnswer: callData.autoAnswer || false,
      autoAnswerDelay: callData.autoAnswerDelay || 5000,
      timestamp: new Date().toISOString()
    };
    return this.currentCall;
  }

  // Annuler l'appel en cours
  clearCall() {
    this.currentCall = null;
  }

  // Obtenir tous les messages
  getAllMessages() {
    return this.messages;
  }

  // Obtenir l'appel en cours
  getCurrentCall() {
    return this.currentCall;
  }

  // Obtenir le nombre de messages non lus
  getUnreadCount() {
    return this.messages.filter(msg => !msg.read).length;
  }

  // Marquer tous les messages comme lus
  markAllAsRead() {
    this.messages.forEach(msg => msg.read = true);
  }

  // Effacer tous les messages (reset)
  reset() {
    this.messages = [];
    this.notifications = [];
    this.currentCall = null;
    this.timer = null;
    this.hintEnabled = false;
    // Don't clear photos on reset
  }

  // Timer methods
  setTimer(duration, running = true) {
    this.timer = {
      duration,
      running,
      startedAt: running ? Date.now() : null
    };
    return this.timer;
  }

  clearTimer() {
    this.timer = null;
  }

  getTimer() {
    return this.timer;
  }

  // Hint methods
  setHintEnabled(enabled) {
    this.hintEnabled = enabled;
  }

  isHintEnabled() {
    return this.hintEnabled;
  }

  // Photos methods
  addPhoto(url) {
    const photo = {
      id: `photo-${Date.now()}`,
      url,
      timestamp: new Date().toISOString()
    };
    this.photos.push(photo);
    return photo;
  }

  getPhotos() {
    return this.photos;
  }

  clearPhotos() {
    this.photos = [];
  }

  // Obtenir le statut actuel
  getStatus() {
    return {
      messagesCount: this.messages.length,
      unreadCount: this.getUnreadCount(),
      hasIncomingCall: this.currentCall !== null,
      currentCall: this.currentCall
    };
  }
}

// Singleton instance
const storage = new Storage();

module.exports = storage;
