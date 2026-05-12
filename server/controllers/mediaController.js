const storage = require('../data/storage');

// Envoyer une image
exports.sendImage = (req, res, io) => {
  try {
    const { sender, senderPhoto, imageUrl, caption } = req.body;

    // Validation
    if (!sender || !imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'sender and imageUrl are required'
      });
    }

    // Ajouter l'image au storage
    const newImage = storage.addImage({
      sender,
      senderPhoto: senderPhoto || '/assets/images/contact-photos/default.jpg',
      imageUrl,
      caption
    });

    // Envoyer via WebSocket
    io.emit('new_message', newImage);

    res.json({
      success: true,
      message: 'Image sent successfully',
      data: newImage
    });
  } catch (error) {
    console.error('Error sending image:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Envoyer une vidéo
exports.sendVideo = (req, res, io) => {
  try {
    const { sender, senderPhoto, videoUrl, caption } = req.body;

    // Validation
    if (!sender || !videoUrl) {
      return res.status(400).json({
        success: false,
        error: 'sender and videoUrl are required'
      });
    }

    // Ajouter la vidéo au storage
    const newVideo = storage.addVideo({
      sender,
      senderPhoto: senderPhoto || '/assets/images/contact-photos/default.jpg',
      videoUrl,
      caption
    });

    // Envoyer via WebSocket
    io.emit('new_message', newVideo);

    res.json({
      success: true,
      message: 'Video sent successfully',
      data: newVideo
    });
  } catch (error) {
    console.error('Error sending video:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
