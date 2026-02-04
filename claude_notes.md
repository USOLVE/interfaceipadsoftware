# Notes de projet - iPad Escape Game Interface

## Dernier probleme en cours
Tout fonctionne ! iPad connecte en HTTPS, camera OK.

## Regle firewall ajoutee
- Nom: "iPad Escape Game HTTPS"
- Port TCP 3443 autorise en entree

## Ce qui a ete fait

### Applications implementees
- **Lock Screen** : Ecran de verrouillage avec code PIN 4242
- **Home Screen** : Ecran d'accueil avec icones d'apps
- **Messages App** : Application de messages avec bouton "demander indice"
- **Notes App** : Application de notes
- **Photos App** : Galerie photos avec acces camera
- **Clock App** : Application horloge avec timer 60 min (controle par GM uniquement)
- **Call Screen** : Ecran d'appel entrant avec video

### Fonctionnalites
- WebSocket (Socket.IO) pour communication temps reel
- Timer controlable depuis Control Panel (start, stop, pause, +/-10sec, +/-1min)
- Bouton indice dans Messages qui notifie le Control Panel
- Auto-lock apres 5 minutes d'inactivite
- Mode plein ecran automatique
- Audio unlock pour iOS (sons de notification/appel)

### Configuration HTTPS (pour camera iPad)
- Certificats SSL generes dans `/ssl/server.crt` et `/ssl/server.key`
- CN = 192.168.0.211 (IP WiFi de l'ordinateur)
- Server modifie pour supporter HTTP (3000) et HTTPS (3443)

### Fichiers importants
- `server/server.js` : Serveur principal (HTTP + HTTPS)
- `public/js/main.js` : Point d'entree client, audio unlock iOS
- `public/js/state-manager.js` : Gestion d'etat, events dynamiques (corrige)
- `public/js/websocket-client.js` : Client WebSocket, events timer
- `public/js/screens/clock-app.js` : Timer (ecoute events du GM)
- `public/js/screens/photos-app.js` : Photos + camera
- `control-panel.html` : Interface GM avec controles timer et alertes indices
- `server/routes/api.js` : Endpoints API (timer/start, timer/stop, timer/adjust, timer/pause, etc.)
- `start-server.bat` : Script de lancement Windows

### Adresses
- HTTP local : http://localhost:3000
- HTTPS local : https://localhost:3443
- iPad (HTTPS) : https://192.168.0.211:3443

### Corrections effectuees
1. stateManager.on() ne creait pas les events dynamiques -> corrige
2. Sons iOS bloques sans interaction -> setupAudioUnlock() ajoute
3. Camera iPad necessite HTTPS -> certificats SSL generes
4. Control Panel erreur syntaxe (base64 audio) -> remplace par Web Audio API

## Prochaine etape
Diagnostiquer pourquoi le serveur se ferme au lancement.
Attendre le message d'erreur de l'utilisateur.
