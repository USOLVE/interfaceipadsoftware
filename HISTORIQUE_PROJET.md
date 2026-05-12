# Historique du Projet - Interface iPad Escape Game

**Date de création :** 2 février 2026
**Dernière mise à jour :** 3 février 2026

---

## Résumé du Projet

Application web simulant une interface iPadOS pour des escape games, contrôlable via Node-RED. L'interface permet d'envoyer des messages, images, vidéos, déclencher des appels avec vidéo, et inclut plusieurs applications interactives.

---

## Structure du Projet

```
interfaceIpadsoftware/
├── server/                          # Backend Node.js
│   ├── controllers/
│   │   ├── messageController.js     # Gestion des messages texte
│   │   ├── mediaController.js       # Gestion images/vidéos
│   │   └── callController.js        # Gestion des appels (+ videoUrl)
│   ├── routes/
│   │   └── api.js                   # Endpoints REST (timer, hint, photo, fullscreen)
│   ├── data/
│   │   └── storage.js               # Stockage en mémoire (singleton)
│   └── server.js                    # Point d'entrée serveur (port 3000)
│
├── public/                          # Frontend
│   ├── index.html                   # Page principale
│   ├── css/
│   │   ├── reset.css
│   │   ├── variables.css
│   │   ├── typography.css
│   │   ├── animations.css
│   │   ├── components/
│   │   │   ├── status-bar.css       # Timer + bouton indice
│   │   │   ├── notifications.css
│   │   │   └── blur-effects.css
│   │   └── screens/
│   │       ├── lock-screen.css      # + écran PIN
│   │       ├── home-screen.css      # Badges corrigés
│   │       ├── messages-app.css
│   │       ├── notes-app.css
│   │       ├── photos-app.css
│   │       ├── clock-app.css        # NOUVEAU - App Horloge
│   │       └── call-screen.css      # + écran vidéo
│   ├── js/
│   │   ├── main.js                  # Init + fullscreen forcé
│   │   ├── state-manager.js
│   │   ├── websocket-client.js      # Sons activés + events
│   │   ├── gesture-handler.js
│   │   ├── animation-controller.js
│   │   ├── components/
│   │   │   ├── status-bar.js        # Timer + hint button
│   │   │   ├── notification.js
│   │   │   └── message-bubble.js
│   │   └── screens/
│   │       ├── lock-screen.js       # Code PIN 4242
│   │       ├── home-screen.js       # Lance Notes + Photos
│   │       ├── messages-app.js
│   │       ├── notes-app.js
│   │       ├── photos-app.js        # (caméra + galerie)
│   │       ├── clock-app.js         # NOUVEAU - Timer 60min
│   │       └── call-screen.js       # Vidéo après réponse
│   ├── data/
│   │   └── apps.json                # Config des apps
│   └── assets/
│       ├── images/
│       │   ├── wallpapers/default.jpg
│       │   ├── app-icons/
│       │   └── contact-photos/gm.jpg
│       ├── sounds/
│       │   ├── notifications.mp3    # Son notification
│       │   └── ringtone.mp3         # Sonnerie appel
│       └── videos/
│           └── calls/votre-video.mp4
│
├── control-panel.html               # Interface de test (mise à jour)
├── START.bat                        # Lanceur Windows
├── package.json
├── README.md
└── HISTORIQUE_PROJET.md             # CE FICHIER
```

---

## Historique des Modifications

### Session du 2 février 2026

#### 1. Correction Bug Home Screen Noir
**Problème :** L'écran d'accueil restait noir après déverrouillage.
**Cause :** `animation-controller.js` ligne 26 - condition toujours vraie ajoutant classe `show` au lieu de `active`.
**Solution :** Modifié pour toujours ajouter la classe `active`.
**Fichier :** `public/js/animation-controller.js`

#### 2. Ajout Code PIN de Déverrouillage
**Code :** `4242`
**Fonctionnement :**
- Swipe vers le haut affiche le pavé numérique
- 4 points indiquent les chiffres entrés
- Animation de secousse si code incorrect
- Bouton Annuler pour revenir

**Fichiers modifiés :**
- `public/index.html` - Ajout HTML du pavé PIN
- `public/css/screens/lock-screen.css` - Styles du PIN
- `public/js/screens/lock-screen.js` - Logique de vérification

#### 3. Ajout Application Notes
**Fonctionnalités :**
- Liste des notes avec aperçu
- Création/modification/suppression
- Sauvegarde localStorage
- État vide avec indication

**Fichiers créés :**
- `public/css/screens/notes-app.css`
- `public/js/screens/notes-app.js`

**Fichiers modifiés :**
- `public/index.html`
- `public/js/screens/home-screen.js`
- `public/js/animation-controller.js`
- `public/js/main.js`

#### 4. Correction Badges de Notification
**Problème :** Les badges rouges étaient coupés par `overflow: hidden`.
**Solution :**
- `overflow: visible` sur `.app-icon__image`, `.home-screen__content`, `.home-screen__dock`
- `z-index: 10` sur `.app-icon__badge`
- Border-radius déplacé sur l'image directement

**Fichier :** `public/css/screens/home-screen.css`

#### 5. Correction Messages App Noir
**Problème :** L'app Messages restait noire.
**Cause :** Utilisait classe `.show` mais AnimationController ajoutait `.active`.
**Solution :** Ajout `.messages-app.active` et `.call-screen.active` dans CSS.

**Fichiers :**
- `public/css/screens/messages-app.css`
- `public/css/screens/call-screen.css`

#### 6. Suppression Raccourcis Clavier
**Supprimés :** L, H, M, R (navigation entre écrans)
**Fichier :** `public/js/main.js`

#### 7. Système Vidéo pour Appels
**Fonctionnement :**
1. Appel entrant s'affiche
2. Joueur appuie sur "Répondre"
3. Vidéo se lance en plein écran
4. Affiche nom appelant + durée
5. Fin auto ou bouton "Raccrocher"

**Fichiers modifiés :**
- `public/index.html` - Ajout écran vidéo
- `public/css/screens/call-screen.css` - Styles vidéo
- `public/js/screens/call-screen.js` - Logique vidéo
- `public/js/websocket-client.js` - Correction flux
- `server/controllers/callController.js` - Param videoUrl
- `server/data/storage.js` - Stockage videoUrl

**Valeurs par défaut :**
- Photo : `/assets/images/contact-photos/gm.jpg`
- Vidéo : `/assets/videos/calls/votre-video.mp4`

#### 8. Activation des Sons
**Fichiers sons requis :**
- `public/assets/sounds/notifications.mp3` (avec 's')
- `public/assets/sounds/ringtone.mp3`

**Fichier modifié :** `public/js/websocket-client.js`

#### 9. Ajout Minuteur (Timer)
**Affichage :** Dans la status bar, en rouge
**États visuels :**
- Normal : rouge
- < 5 min : orange (warning)
- < 1 min : rouge clignotant rapide (danger)

**API :**
```
POST /api/timer/start   {"duration": 3600}  # En secondes
POST /api/timer/stop
POST /api/timer/set     {"duration": 3600}  # Affiche sans démarrer
```

**Fichiers :**
- `public/css/components/status-bar.css`
- `public/js/components/status-bar.js`
- `server/routes/api.js`
- `server/data/storage.js`

#### 10. Ajout Application Photos
**Fonctionnalités :**
- Galerie de photos (cliquables pour agrandir)
- Prise de selfies avec caméra
- Changement caméra avant/arrière
- Sauvegarde localStorage

**API :**
```
POST /api/photo   {"url": "/assets/images/indice.jpg"}
```

**Fichiers créés :**
- `public/css/screens/photos-app.css`
- `public/js/screens/photos-app.js`

#### 11. Ajout Bouton Demande d'Indice
**Affichage :** Bouton "?" jaune au centre de la status bar
**Événement :** Émet `hint_requested` sur WebSocket

**API :**
```
POST /api/hint/toggle   {"enabled": true}
POST /api/hint/toggle   {"enabled": false}
```

**Écoute Node-RED :** WebSocket event `hint_requested`

#### 12. Mode Plein Écran Forcé
**Comportement :**
- Plein écran automatique au premier toucher
- Re-entre si le joueur tente de sortir
- Bloque Escape, F11, Ctrl+W, etc.

**API :**
```
POST /api/fullscreen   {"enabled": true}
POST /api/fullscreen   {"enabled": false}
```

**Fichier :** `public/js/main.js`

#### 13. Mise à Jour Panneau de Contrôle
**Nouvelles sections :**
- Minuteur (démarrer/arrêter)
- Contrôles du jeu (hint + fullscreen)
- Ajouter une photo

**Fichier :** `control-panel.html`

---

### Session du 3 février 2026

#### 14. Ajout Application Horloge (Timer)
**Fonctionnement :**
- Ouvrir l'app Horloge lance automatiquement un décompte de 60 minutes
- Affichage circulaire avec progression visuelle
- États visuels : normal (orange) → warning < 5min → danger < 1min (rouge clignotant)
- Le timer continue même si on quitte l'app

**Fichiers créés :**
- `public/css/screens/clock-app.css`
- `public/js/screens/clock-app.js`

**Fichiers modifiés :**
- `public/index.html` - Ajout HTML de l'app Horloge
- `public/js/animation-controller.js` - Ajout écran clock
- `public/js/screens/home-screen.js` - Gestion lancement app
- `public/js/main.js` - Initialisation ClockApp
- `public/data/apps.json` - Ajout config app Horloge

**Icône requise :** `public/assets/images/app-icons/clock.png`

#### 15. Bouton Demande d'Indice dans Messages
**Fonctionnement :**
- Bouton en bas de l'app Messages avec le texte prédéfini
- Texte : "Tu te souviens pas d'autres choses qui pourrait nous aider ?"
- Au clic : envoie le message et notifie le serveur via WebSocket `hint_requested`
- Devient "Demande envoyée !" pendant 30 secondes

**Fichiers modifiés :**
- `public/index.html` - Ajout du bouton HTML
- `public/css/screens/messages-app.css` - Styles du bouton
- `public/js/screens/messages-app.js` - Logique d'envoi

#### 16. Changement Texte Messages Vides
**Avant :** "En attente d'indices..."
**Après :** "Pas de nouveau messages"

**Fichier modifié :** `public/index.html`

#### 17. Verrouillage Automatique par Inactivité
**Fonctionnement :**
- Après 5 minutes sans interaction (toucher, clic, scroll, clavier)
- L'iPad retourne automatiquement sur l'écran de verrouillage
- Le timer se réinitialise à chaque interaction
- Ne se déclenche pas si déjà sur l'écran de verrouillage

**Fichier modifié :** `public/js/main.js`

---

## API Endpoints Complète

### Messages
```
POST /api/message      {"sender": "...", "message": "..."}
POST /api/image        {"sender": "...", "imageUrl": "...", "caption": "..."}
POST /api/video        {"sender": "...", "videoUrl": "...", "caption": "..."}
GET  /api/messages
POST /api/messages/read
```

### Appels
```
POST /api/call         {"caller": "...", "callerPhoto": "...", "phoneNumber": "...", "videoUrl": "..."}
POST /api/call/end
```

### Timer
```
POST /api/timer/start  {"duration": 3600}  # Secondes
POST /api/timer/stop
POST /api/timer/set    {"duration": 3600}
```

### Contrôles
```
POST /api/hint/toggle  {"enabled": true/false}
POST /api/fullscreen   {"enabled": true/false}
POST /api/photo        {"url": "..."}
POST /api/reset
GET  /api/status
```

---

## WebSocket Events

### Serveur → Client
- `connected` - Connexion établie
- `new_message` - Nouveau message
- `incoming_call` - Appel entrant
- `call_ended` - Fin d'appel
- `timer_start` - Démarrage timer
- `timer_stop` - Arrêt timer
- `timer_set` - Affichage timer
- `hint_toggle` - Toggle bouton indice
- `new_photo` - Nouvelle photo
- `fullscreen` - Demande plein écran
- `reset` - Réinitialisation

### Client → Serveur
- `call_answered` - Appel décroché
- `call_declined` - Appel refusé
- `call_ended` - Appel terminé
- `hint_requested` - Indice demandé
- `timer_ended` - Timer terminé

---

## Configuration Requise

### Fichiers à Fournir
1. **Photo contact :** `public/assets/images/contact-photos/gm.jpg`
2. **Vidéo appel :** `public/assets/videos/calls/votre-video.mp4`
3. **Son notification :** `public/assets/sounds/notifications.mp3`
4. **Son sonnerie :** `public/assets/sounds/ringtone.mp3`
5. **Fond d'écran :** `public/assets/images/wallpapers/default.jpg`
6. **Icône Horloge :** `public/assets/images/app-icons/clock.png`

### Démarrage
```bash
npm install
npm start
```
Ou double-clic sur `START.bat`

### Accès
- Interface iPad : http://localhost:3000
- Panneau de contrôle : Ouvrir `control-panel.html` dans un navigateur

---

## Notes Techniques

### Code PIN
Le code de déverrouillage est `4242`, défini dans :
`public/js/screens/lock-screen.js` ligne 17 : `correctPin: '4242'`

### Stockage Local
Les données suivantes sont sauvegardées dans localStorage :
- `escapegame_notes` - Notes de l'application Notes
- `escapegame_photos` - Photos prises avec la caméra

### Sons
Le fichier de notification s'appelle `notifications.mp3` (avec un 's').

### Verrouillage Automatique
L'iPad se verrouille automatiquement après 5 minutes d'inactivité.
Défini dans `public/js/main.js` : `INACTIVITY_DELAY = 5 * 60 * 1000`

### Timer Horloge
Le décompte par défaut est de 60 minutes.
Défini dans `public/js/screens/clock-app.js` : `timerDuration: 60 * 60`

---

## Sauvegarde Créée
- **Dossier backup :** `C:\Users\lucpe\Desktop\interfaceIpadsoftware_backup_2026-02-02`
- **Contenu :** 74 fichiers/dossiers (sans node_modules)

---

## Contact / Contexte
Projet développé pour une interface d'escape game contrôlée via Node-RED.
