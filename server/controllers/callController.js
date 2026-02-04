const storage = require('../data/storage');

// Déclencher un appel entrant
exports.triggerCall = (req, res, io) => {
  try {
    const { caller, callerPhoto, phoneNumber, videoUrl, autoAnswer, autoAnswerDelay } = req.body;

    // Validation
    if (!caller) {
      return res.status(400).json({
        success: false,
        error: 'caller is required'
      });
    }

    // Créer l'appel
    const newCall = storage.setIncomingCall({
      caller,
      callerPhoto: callerPhoto || '/assets/images/contact-photos/gm.jpg',
      phoneNumber: phoneNumber || 'Mobile',
      videoUrl: videoUrl || '/assets/videos/calls/votre-video.mp4',
      autoAnswer,
      autoAnswerDelay
    });

    // Envoyer via WebSocket
    io.emit('incoming_call', newCall);

    res.json({
      success: true,
      message: 'Call triggered successfully',
      data: newCall
    });
  } catch (error) {
    console.error('Error triggering call:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Annuler l'appel en cours
exports.endCall = (req, res, io) => {
  try {
    storage.clearCall();

    // Notifier les clients
    io.emit('call_ended');

    res.json({
      success: true,
      message: 'Call ended successfully'
    });
  } catch (error) {
    console.error('Error ending call:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
