# 🚀 Démarrage Rapide - Interface iPad Escape Game

## 📁 Fichiers créés pour vous

### 1. **START.bat** ⚡
Double-cliquez sur ce fichier pour :
- ✅ Vérifier que Node.js est installé
- ✅ Démarrer automatiquement le serveur
- ✅ Ouvrir l'interface dans votre navigateur

### 2. **control-panel.html** 🎮
Panneau de contrôle complet avec :
- ✅ **Statut en temps réel** (serveur, messages, appels)
- ✅ **Envoi de messages** (formulaire simple)
- ✅ **Envoi d'images** (avec URL)
- ✅ **Déclenchement d'appels**
- ✅ **Reset de l'interface**
- ✅ **Prévisualisation de l'interface iPad**
- ✅ **Suivi de l'avancement du projet** (toutes les fonctionnalités ✓)

---

## 🎯 Comment utiliser

### Première fois :

1. **Démarrer le serveur**
   ```
   Double-clic sur START.bat
   ```

2. **Ouvrir le panneau de contrôle**
   ```
   Double-clic sur control-panel.html
   ```
   (Ouvre dans votre navigateur par défaut)

3. **Tester l'interface**
   - Utilisez les boutons du panneau de contrôle
   - Envoyez des messages, images, appels
   - Regardez-les apparaître en temps réel dans la prévisualisation !

### Workflow typique :

```
START.bat  →  Serveur démarre  →  Ouvrir control-panel.html
                                      ↓
                              Tester les fonctionnalités
                                      ↓
                          Voir le résultat en temps réel
```

---

## 📱 Accès depuis l'iPad

1. **Trouver l'IP de votre PC**
   ```cmd
   ipconfig
   ```
   Cherchez "Adresse IPv4" (ex: 192.168.1.50)

2. **Sur l'iPad (Safari)**
   ```
   http://192.168.1.50:3000
   ```

3. **Ajouter à l'écran d'accueil**
   - Cliquer sur le bouton "Partager"
   - "Sur l'écran d'accueil"
   - L'app s'ouvrira en plein écran !

---

## 🎮 Raccourcis clavier (tests desktop)

| Touche | Action |
|--------|--------|
| **L** | Lock/Unlock (verrouiller/déverrouiller) |
| **H** | Home screen |
| **M** | Messages app |
| **R** | Reset |

---

## 📊 Avancement du projet

✅ Backend Node.js + API REST
✅ WebSocket temps réel
✅ Interface iPadOS complète
✅ Lock Screen avec slide to unlock
✅ Home Screen avec icônes
✅ Messages App (texte, images, vidéos)
✅ Call Screen (appels entrants)
✅ Système de notifications
✅ Documentation complète

**🎉 100% TERMINÉ ! Prêt pour votre escape game !**

---

## 🔧 Intégration Node-RED

Voir le **README.md** principal pour :
- Exemples de flows Node-RED
- Configuration complète
- Scénarios d'escape game
- Architecture réseau

---

## 🆘 Problèmes courants

### Le serveur ne démarre pas
```cmd
# Vérifiez Node.js
node --version
```
Si erreur : Installez Node.js sur https://nodejs.org

### "Port 3000 already in use"
```cmd
# Arrêtez le processus sur le port 3000
npx kill-port 3000
```
Puis relancez START.bat

### L'interface ne se charge pas
1. Vérifiez que START.bat est bien lancé
2. Ouvrez http://localhost:3000 manuellement
3. Vérifiez la console pour les erreurs (F12)

---

## 📞 Support

- **Documentation complète** : README.md
- **Assets** : public/assets/images/README.md
- **Code** : Tous les fichiers sont commentés

---

**Créé pour votre escape game** 🎭
Profitez bien ! 🚀
