# Interface iPad pour Escape Game

Webapp simulant l'interface iPadOS 17/18, contrôlée via Node-RED pour les escape games. Les joueurs reçoivent des indices (messages, images, vidéos, appels) en temps réel.

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Démarrer le serveur
npm start
```

Le serveur démarre sur `http://localhost:3000`

## 📱 Configuration iPad

1. Ouvrir Safari sur l'iPad : `http://[IP-SERVEUR]:3000`
2. Cliquer sur "Partager" → "Sur l'écran d'accueil"
3. L'app s'ouvrira en mode plein écran
4. Réglages recommandés :
   - Luminosité → Verrouillage auto : **Jamais**
   - Ne pas déranger : **Activé** (désactive notifications iOS)

## 🔌 API Endpoints pour Node-RED

### 1. Envoyer un message texte

```http
POST http://localhost:3000/api/message
Content-Type: application/json

{
  "sender": "Game Master",
  "senderPhoto": "http://localhost:3000/assets/images/contact-photos/gm.jpg",
  "message": "Bienvenue ! Voici votre premier indice...",
  "timestamp": "2026-02-02T15:30:00Z"
}
```

### 2. Envoyer une image

```http
POST http://localhost:3000/api/image
Content-Type: application/json

{
  "sender": "Agent Secret",
  "senderPhoto": "http://localhost:3000/assets/images/contact-photos/agent.jpg",
  "imageUrl": "http://localhost:3000/assets/images/hint1.jpg",
  "caption": "Regardez ce tableau attentivement"
}
```

### 3. Envoyer une vidéo

```http
POST http://localhost:3000/api/video
Content-Type: application/json

{
  "sender": "Le Professeur",
  "senderPhoto": "http://localhost:3000/assets/images/contact-photos/prof.jpg",
  "videoUrl": "http://localhost:3000/assets/videos/intro.mp4",
  "caption": "Message vidéo important"
}
```

### 4. Déclencher un appel entrant

```http
POST http://localhost:3000/api/call
Content-Type: application/json

{
  "caller": "Directeur",
  "callerPhoto": "http://localhost:3000/assets/images/contact-photos/boss.jpg",
  "phoneNumber": "+33 6 12 34 56 78",
  "autoAnswer": false,
  "autoAnswerDelay": 5000
}
```

### 5. Reset (effacer tout)

```http
POST http://localhost:3000/api/reset
```

### 6. Obtenir le statut

```http
GET http://localhost:3000/api/status
```

## 🔧 Exemples Node-RED

### Flow 1 : Envoyer un message simple

```
[Inject] → [Function] → [HTTP Request]
```

**Node Function :**
```javascript
msg.payload = {
    sender: "Game Master",
    senderPhoto: "http://192.168.1.50:3000/assets/images/contact-photos/gm.jpg",
    message: "Le code est dans le tableau !",
    timestamp: new Date().toISOString()
};
msg.url = "http://192.168.1.50:3000/api/message";
msg.method = "POST";
msg.headers = { "Content-Type": "application/json" };
return msg;
```

### Flow 2 : Séquence d'indices

```
[Inject]
  ↓
[Delay: 0s] → [Function: Message 1] → [HTTP Request]
  ↓
[Delay: 30s] → [Function: Image] → [HTTP Request]
  ↓
[Delay: 60s] → [Function: Appel] → [HTTP Request]
```

### Flow 3 : Déclenchement par bouton

```
[MQTT In] → [Switch] → [Function] → [HTTP Request]
  topic: "escape/button1"
```

## 🧪 Tests manuels (curl)

```bash
# Test message
curl -X POST http://localhost:3000/api/message \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "Test",
    "message": "Hello World"
  }'

# Test image
curl -X POST http://localhost:3000/api/image \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "Test",
    "imageUrl": "https://via.placeholder.com/600x400",
    "caption": "Test image"
  }'

# Test appel
curl -X POST http://localhost:3000/api/call \
  -H "Content-Type: application/json" \
  -d '{
    "caller": "Test Caller",
    "phoneNumber": "+33 6 12 34 56 78"
  }'

# Reset
curl -X POST http://localhost:3000/api/reset

# Statut
curl http://localhost:3000/api/status
```

## 📂 Structure des assets

Placez vos fichiers dans les dossiers suivants :

```
public/assets/
├── images/
│   ├── wallpapers/          # Fonds d'écran (2732x2048px)
│   ├── app-icons/           # Icônes d'apps (180x180px)
│   ├── contact-photos/      # Photos des contacts (400x400px)
│   │   ├── gm.jpg          # Game Master
│   │   ├── agent.jpg       # Agent secret
│   │   └── default.jpg     # Photo par défaut
│   └── ui-elements/         # Icônes système
├── sounds/                  # Sons (optionnel)
│   ├── ringtone.mp3
│   ├── notification.mp3
│   └── unlock.mp3
└── videos/                  # Vidéos pour les indices
    └── intro.mp4
```

## 🎮 Scénarios Escape Game

### Scénario 1 : Introduction
1. **Message de bienvenue** (texte)
2. **Image** : Photo de la salle avec indice
3. **Vidéo** : Message du Game Master
4. **Appel** : Indice audio

### Scénario 2 : Énigme progressive
1. **Message** : "Cherchez le code..."
2. **Attente 2min** (joueurs cherchent)
3. **Message d'aide** : "Regardez sous le bureau"
4. **Image** : Photo zoomée de l'indice

### Scénario 3 : Urgence
1. **Appel entrant** : "Vous avez 10 minutes !"
2. **Messages rapides** : Compte à rebours
3. **Image finale** : Solution

## 🌐 Architecture Réseau

```
[iPad Joueurs]
  192.168.1.100
      ↓ WiFi
[Serveur Node.js]
  192.168.1.50:3000
      ↑ HTTP
[Node-RED]
  192.168.1.50:1880
      ↑
[Capteurs/Boutons]
  MQTT, GPIO, etc.
```

**Important** : Tout fonctionne sur réseau local (pas besoin d'Internet)

## ⚙️ Conseils de Scénarisation

- **Timing** : Espacer les messages de 30s minimum
- **Lisibilité** : Messages courts (2-3 lignes max)
- **Images** : Optimisées (< 2MB), haute résolution
- **Vidéos** : Courtes (< 1 minute), format MP4 H.264
- **Appels** : Utiliser avec parcimonie (moments clés)
- **Humour** : Ajouter des messages drôles pour détendre

## 🔄 Reset entre sessions

```bash
curl -X POST http://localhost:3000/api/reset
```

Ou depuis Node-RED : node HTTP Request vers `/api/reset`

## 🐛 Dépannage

### Le serveur ne démarre pas
```bash
# Vérifier que le port 3000 est libre
netstat -ano | findstr :3000

# Ou changer le port
set PORT=3001 && npm start
```

### L'iPad ne reçoit pas les messages
1. Vérifier que l'iPad et le serveur sont sur le même réseau
2. Ouvrir la console du navigateur (Safari → Développement)
3. Vérifier que WebSocket est connecté

### Les images ne s'affichent pas
1. Vérifier que les URLs sont accessibles depuis l'iPad
2. Utiliser des URLs complètes : `http://192.168.1.50:3000/assets/...`
3. Pas d'URLs relatives depuis Node-RED

## 📝 License

MIT - Libre d'utilisation pour vos escape games !
