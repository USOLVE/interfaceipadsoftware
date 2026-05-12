const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const mediaController = require('../controllers/mediaController');
const callController = require('../controllers/callController');
const storage = require('../data/storage');

module.exports = (io) => {
  // Routes pour les messages
  router.post('/message', (req, res) => messageController.sendMessage(req, res, io));
  router.get('/messages', messageController.getAllMessages);
  router.post('/messages/read', messageController.markAsRead);

  // Routes pour les médias
  router.post('/image', (req, res) => mediaController.sendImage(req, res, io));
  router.post('/video', (req, res) => mediaController.sendVideo(req, res, io));

  // Routes pour les appels
  router.post('/call', (req, res) => callController.triggerCall(req, res, io));
  router.post('/call/end', (req, res) => callController.endCall(req, res, io));

  // Route pour reset (effacer tout)
  router.post('/reset', (req, res) => {
    try {
      storage.reset();

      // Notifier tous les clients
      io.emit('reset');

      res.json({
        success: true,
        message: 'All data cleared successfully'
      });
    } catch (error) {
      console.error('Error resetting data:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Route pour obtenir le statut actuel
  router.get('/status', (req, res) => {
    try {
      const status = storage.getStatus();
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('Error getting status:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // ========== TIMER ROUTES ==========

  // Start timer
  router.post('/timer/start', (req, res) => {
    try {
      const { duration } = req.body; // duration in seconds

      if (!duration || duration <= 0) {
        return res.status(400).json({
          success: false,
          error: 'duration is required and must be positive (in seconds)'
        });
      }

      storage.setTimer(duration, true);
      io.emit('timer_start', { duration });

      res.json({
        success: true,
        message: `Timer started for ${duration} seconds`
      });
    } catch (error) {
      console.error('Error starting timer:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  // Stop timer
  router.post('/timer/stop', (req, res) => {
    try {
      storage.clearTimer();
      io.emit('timer_stop');

      res.json({
        success: true,
        message: 'Timer stopped'
      });
    } catch (error) {
      console.error('Error stopping timer:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  // Set timer (display only, not running)
  router.post('/timer/set', (req, res) => {
    try {
      const { duration } = req.body;

      if (!duration || duration <= 0) {
        return res.status(400).json({
          success: false,
          error: 'duration is required and must be positive (in seconds)'
        });
      }

      storage.setTimer(duration, false);
      io.emit('timer_set', { duration });

      res.json({
        success: true,
        message: `Timer set to ${duration} seconds (not running)`
      });
    } catch (error) {
      console.error('Error setting timer:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  // Adjust timer (add/remove seconds)
  router.post('/timer/adjust', (req, res) => {
    try {
      const { seconds } = req.body; // Can be positive or negative

      if (seconds === undefined || seconds === null) {
        return res.status(400).json({
          success: false,
          error: 'seconds is required (positive to add, negative to remove)'
        });
      }

      io.emit('timer_adjust', { seconds: parseInt(seconds) });

      res.json({
        success: true,
        message: `Timer adjusted by ${seconds} seconds`
      });
    } catch (error) {
      console.error('Error adjusting timer:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  // Pause timer
  router.post('/timer/pause', (req, res) => {
    try {
      io.emit('timer_pause');

      res.json({
        success: true,
        message: 'Timer paused'
      });
    } catch (error) {
      console.error('Error pausing timer:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  // ========== HINT BUTTON ROUTES ==========

  // Enable/disable hint button
  router.post('/hint/toggle', (req, res) => {
    try {
      const { enabled } = req.body;

      storage.setHintEnabled(enabled !== false);
      io.emit('hint_toggle', { enabled: enabled !== false });

      res.json({
        success: true,
        message: `Hint button ${enabled !== false ? 'enabled' : 'disabled'}`
      });
    } catch (error) {
      console.error('Error toggling hint:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  // ========== PHOTOS ROUTES ==========

  // Add photo to gallery
  router.post('/photo', (req, res) => {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({
          success: false,
          error: 'url is required'
        });
      }

      const photo = storage.addPhoto(url);
      io.emit('new_photo', photo);

      res.json({
        success: true,
        message: 'Photo added to gallery',
        data: photo
      });
    } catch (error) {
      console.error('Error adding photo:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  // ========== FULLSCREEN ROUTE ==========

  // Request fullscreen on clients
  router.post('/fullscreen', (req, res) => {
    try {
      const { enabled } = req.body;
      io.emit('fullscreen', { enabled: enabled !== false });

      res.json({
        success: true,
        message: `Fullscreen ${enabled !== false ? 'requested' : 'exit requested'}`
      });
    } catch (error) {
      console.error('Error requesting fullscreen:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  return router;
};
