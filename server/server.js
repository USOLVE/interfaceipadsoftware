const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

// Créer l'application Express
const app = express();

// SSL Configuration - try to load certificates
let sslOptions = null;
let httpsServer = null;
const sslKeyPath = path.join(__dirname, '../ssl/server.key');
const sslCertPath = path.join(__dirname, '../ssl/server.crt');

try {
  if (fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath)) {
    sslOptions = {
      key: fs.readFileSync(sslKeyPath),
      cert: fs.readFileSync(sslCertPath)
    };
    console.log('[SSL] Certificates loaded successfully');
  } else {
    console.log('[SSL] Certificate files not found, HTTPS disabled');
  }
} catch (err) {
  console.error('[SSL] Error loading certificates:', err.message);
}

// Create HTTP server
const httpServer = http.createServer(app);

// Create HTTPS server if SSL is available
if (sslOptions) {
  httpsServer = https.createServer(sslOptions, app);
}

// Configurer Socket.IO
const io = new Server({
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Attach Socket.IO to servers
io.attach(httpServer);
if (httpsServer) {
  io.attach(httpsServer);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques du dossier public
app.use(express.static(path.join(__dirname, '../public')));

// Routes API
const apiRoutes = require('./routes/api')(io);
app.use('/api', apiRoutes);

// Route par défaut - servir index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Gestion des connexions WebSocket
io.on('connection', (socket) => {
  console.log(`[WebSocket] Client connected: ${socket.id}`);

  // Envoyer un message de bienvenue
  socket.emit('connected', {
    message: 'Connected to iPad interface server',
    socketId: socket.id
  });

  // Gérer la déconnexion
  socket.on('disconnect', () => {
    console.log(`[WebSocket] Client disconnected: ${socket.id}`);
  });

  // Gérer les messages du client (optionnel - pour interactions futures)
  socket.on('client_message', (data) => {
    console.log('[WebSocket] Message from client:', data);
  });

  // Gérer la réponse à un appel
  socket.on('call_answered', () => {
    console.log('[WebSocket] Call answered by client');
    io.emit('call_answered');
  });

  socket.on('call_declined', () => {
    console.log('[WebSocket] Call declined by client');
    io.emit('call_declined');
  });

  socket.on('call_ended', () => {
    console.log('[WebSocket] Call ended by client');
    io.emit('call_ended');
  });

  // Hint requested by player
  socket.on('hint_requested', (data) => {
    console.log('[WebSocket] 🆘 HINT REQUESTED by player!', data);
    io.emit('hint_requested', data);
  });

  // Karaoke song playing
  socket.on('karaoke_play', (data) => {
    console.log(`[WebSocket] 🎤 KARAOKE: "${data.artist} - ${data.title}" → Actionneur #${data.actuator}`);
    io.emit('karaoke_play', data);
  });

  // Karaoke stopped
  socket.on('karaoke_stop', () => {
    console.log('[WebSocket] 🎤 KARAOKE: arrêté');
    io.emit('karaoke_stop');
  });

  // Timer ended
  socket.on('timer_ended', () => {
    console.log('[WebSocket] ⏰ TIMER ENDED!');
    io.emit('timer_ended');
  });
});

// Ports d'écoute
const HTTP_PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

function printStartupInfo() {
  console.log('===========================================');
  console.log('  iPad Escape Game Interface - Server');
  console.log('===========================================');
  console.log(`[HTTP]  http://localhost:${HTTP_PORT}`);
  if (httpsServer) {
    console.log(`[HTTPS] https://localhost:${HTTPS_PORT}`);
    console.log('');
    console.log('📱 Pour iPad (avec caméra), utilisez HTTPS:');
    console.log(`   https://192.168.0.211:${HTTPS_PORT}`);
    console.log('');
    console.log('⚠️  Note: Sur iPad, acceptez le certificat:');
    console.log('   1. Ouvrez l\'URL HTTPS dans Safari');
    console.log('   2. Cliquez "Afficher les détails" puis "Visiter ce site"');
    console.log('   3. Confirmez dans les réglages si demandé');
  } else {
    console.log('');
    console.log('⚠️  HTTPS non disponible (certificats manquants)');
    console.log('   La caméra ne fonctionnera pas sur iPad');
  }
  console.log('');
  console.log('WebSocket ready for real-time communication');
  console.log('');
  console.log('API Endpoints:');
  console.log(`  POST   /api/message`);
  console.log(`  POST   /api/image`);
  console.log(`  POST   /api/video`);
  console.log(`  POST   /api/call`);
  console.log(`  POST   /api/timer/start  {duration: seconds}`);
  console.log(`  POST   /api/timer/stop`);
  console.log(`  POST   /api/timer/adjust {seconds: +/-}`);
  console.log(`  POST   /api/timer/pause`);
  console.log(`  POST   /api/hint/toggle  {enabled: true/false}`);
  console.log(`  POST   /api/photo        {url: "..."}`);
  console.log(`  POST   /api/fullscreen   {enabled: true/false}`);
  console.log(`  POST   /api/reset`);
  console.log(`  GET    /api/status`);
  console.log('');
  console.log('Ready for Node-RED integration!');
  console.log('===========================================');
}

// Start HTTP server
httpServer.listen(HTTP_PORT, () => {
  console.log(`[HTTP] Server running on: http://localhost:${HTTP_PORT}`);

  // If no HTTPS, print info now
  if (!httpsServer) {
    printStartupInfo();
  }
});

// Start HTTPS server if available
if (httpsServer) {
  httpsServer.listen(HTTPS_PORT, () => {
    console.log(`[HTTPS] Server running on: https://localhost:${HTTPS_PORT}`);
    printStartupInfo();
  });
}

// Gestion des erreurs
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});
