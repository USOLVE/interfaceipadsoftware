const storage = require('../data/storage');

// Envoyer un message texte
exports.sendMessage = (req, res, io) => {
  try {
    const { sender, senderPhoto, message, timestamp } = req.body;

    // Validation
    if (!sender || !message) {
      return res.status(400).json({
        success: false,
        error: 'sender and message are required'
      });
    }

    // Ajouter le message au storage
    const newMessage = storage.addMessage({
      sender,
      senderPhoto: senderPhoto || '/assets/images/contact-photos/default.jpg',
      message,
      timestamp
    });

    // Envoyer via WebSocket à tous les clients connectés
    io.emit('new_message', newMessage);

    res.json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Obtenir tous les messages
exports.getAllMessages = (req, res) => {
  try {
    const messages = storage.getAllMessages();
    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Marquer les messages comme lus
exports.markAsRead = (req, res) => {
  try {
    storage.markAllAsRead();
    res.json({
      success: true,
      message: 'All messages marked as read'
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
