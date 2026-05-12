// Home Screen - Écran d'accueil avec icônes d'applications

const HomeScreen = {
  appsGrid: null,
  dock: null,
  apps: [],

  init() {
    this.appsGrid = document.getElementById('homePage1');
    this.dock = document.getElementById('homeDock');

    // Load apps configuration
    this.loadApps();

    // Listen for screen changes
    stateManager.on('screenChange', (data) => {
      if (data.to === 'home') {
        StatusBar.setStyle('home');
      }
    });
  },

  async loadApps() {
    try {
      const response = await fetch('/data/apps.json');
      const data = await response.json();
      this.apps = data.apps;
      this.renderApps();
    } catch (error) {
      console.error('Error loading apps:', error);
      this.renderDefaultApps();
    }
  },

  renderDefaultApps() {
    // Default apps if JSON not found
    const defaultApps = [
      {
        id: 'messages',
        name: 'Messages',
        icon: '/assets/images/app-icons/messages.png',
        badge: 0,
        dockPosition: 0
      }
    ];

    this.renderAppsList(defaultApps);
  },

  renderApps() {
    this.renderAppsList(this.apps);
  },

  renderAppsList(apps) {
    // Clear existing
    this.appsGrid.innerHTML = '';
    this.dock.innerHTML = '';

    // Render grid apps
    apps.filter(app => app.dockPosition === null || app.dockPosition === undefined).forEach(app => {
      const appIcon = this.createAppIcon(app);
      this.appsGrid.appendChild(appIcon);
    });

    // Render dock apps
    apps.filter(app => app.dockPosition !== null && app.dockPosition !== undefined)
      .sort((a, b) => a.dockPosition - b.dockPosition)
      .forEach(app => {
        const appIcon = this.createAppIcon(app);
        this.dock.appendChild(appIcon);
      });

    // Update badges
    this.updateBadges();
  },

  createAppIcon(app) {
    const icon = document.createElement('div');
    icon.className = 'app-icon';
    icon.dataset.appId = app.id;

    const image = document.createElement('div');
    image.className = 'app-icon__image';

    const img = document.createElement('img');
    img.src = app.icon;
    img.alt = app.name;
    img.onerror = () => {
      // Generate colored icon if image not found
      image.innerHTML = this.generateIconSVG(app);
    };

    image.appendChild(img);

    if (app.badge && app.badge > 0) {
      const badge = document.createElement('div');
      badge.className = 'app-icon__badge';
      badge.textContent = app.badge > 99 ? '99+' : app.badge;
      image.appendChild(badge);
    }

    const name = document.createElement('div');
    name.className = 'app-icon__name';
    name.textContent = app.name;

    icon.appendChild(image);
    icon.appendChild(name);

    // Click handler
    icon.addEventListener('click', () => {
      this.launchApp(app);
    });

    return icon;
  },

  launchApp(app) {
    // Scale animation
    const icon = this.appsGrid.querySelector(`[data-app-id="${app.id}"]`) ||
                  this.dock.querySelector(`[data-app-id="${app.id}"]`);

    if (icon) {
      AnimationController.scaleAnimation(icon, 0.9, 150);
    }

    // Open specific app
    setTimeout(() => {
      if (app.id === 'messages') {
        stateManager.changeScreen('messages');
        stateManager.markMessagesAsRead();
        this.updateBadges();
      } else if (app.id === 'notes') {
        stateManager.changeScreen('notes');
      } else if (app.id === 'photos') {
        stateManager.changeScreen('photos');
      } else if (app.id === 'clock' || app.id === 'horloge') {
        stateManager.changeScreen('clock');
      } else if (app.id === 'karaoke') {
        stateManager.changeScreen('karaoke');
      }
    }, 150);
  },

  updateBadges() {
    // Update Messages badge
    const messagesIcon = this.appsGrid.querySelector('[data-app-id="messages"]') ||
                          this.dock.querySelector('[data-app-id="messages"]');

    if (messagesIcon) {
      const badgeElement = messagesIcon.querySelector('.app-icon__badge');
      const unreadCount = stateManager.state.unreadCount;

      if (unreadCount > 0) {
        if (!badgeElement) {
          const badge = document.createElement('div');
          badge.className = 'app-icon__badge';
          badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
          messagesIcon.querySelector('.app-icon__image').appendChild(badge);
        } else {
          badgeElement.textContent = unreadCount > 99 ? '99+' : unreadCount;
        }
      } else {
        if (badgeElement) {
          badgeElement.remove();
        }
      }
    }
  }
};

// Update badges when messages are received
stateManager.on('newMessage', () => {
  if (HomeScreen.appsGrid) {
    HomeScreen.updateBadges();
  }
});
