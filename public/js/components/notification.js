// Notification Component

const Notification = {
  banner: null,

  init() {
    this.banner = document.getElementById('notificationBanner');

    // Listen for new notifications
    stateManager.on('newNotification', (notification) => {
      this.show(notification);
    });
  },

  show(notification) {
    const bannerIcon = document.getElementById('bannerIcon');
    const bannerApp = document.getElementById('bannerApp');
    const bannerTitle = document.getElementById('bannerTitle');
    const bannerMessage = document.getElementById('bannerMessage');
    const bannerTime = document.getElementById('bannerTime');

    // Set content
    bannerApp.textContent = notification.app || 'Messages';
    bannerTitle.textContent = notification.title || 'Notification';
    bannerMessage.textContent = notification.message || '';
    bannerTime.textContent = this.formatTime(new Date());

    // Set icon if provided
    if (notification.icon) {
      bannerIcon.querySelector('img').src = notification.icon;
    }

    // Show banner
    this.banner.classList.add('show');

    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.hide();
    }, 5000);
  },

  hide() {
    this.banner.classList.remove('show');
  },

  formatTime(date) {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'maintenant';
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }
};
