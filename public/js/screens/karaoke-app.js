// Karaoke App - Style KaraFun

const KaraokeApp = {

  PIN_CODE: '1234', // ← Modifier ce code ici
  unlocked: false,

  songs: [
    {
      id: 'gims-ciel',
      artist: 'Maître Gims',
      title: 'Ciel',
      cover: '/assets/images/karaoke-covers/gims-ciel.png',
      video: '/assets/videos/karaoke/gims-ciel.mov',
      actuator: 1
    },
    {
      id: 'zaho-symphonie',
      artist: 'Zaho de Sagazan',
      title: 'La Symphonie des Éclairs',
      cover: '/assets/images/karaoke-covers/zaho-symphonie.png',
      video: '/assets/videos/karaoke/zaho-symphonie.mov',
      actuator: 2
    },
    {
      id: 'coldplay-stars',
      artist: 'Coldplay',
      title: 'A Sky Full of Stars',
      cover: '/assets/images/karaoke-covers/coldplay-stars.png',
      video: '/assets/videos/karaoke/coldplay-stars.mov',
      actuator: 3
    },
    {
      id: 'indila-danse',
      artist: 'Indila',
      title: 'Dernière Danse',
      cover: '/assets/images/karaoke-covers/indila-danse.png',
      video: '/assets/videos/karaoke/indila-danse.mov',
      actuator: 4
    },
    {
      id: 'delpech-chasseur',
      artist: 'Michel Delpech',
      title: 'Le Chasseur',
      cover: '/assets/images/karaoke-covers/delpech-chasseur.png',
      video: '/assets/videos/karaoke/delpech-chasseur.mov',
      actuator: 5
    }
  ],

  pinEntry: '',

  init() {
    document.getElementById('karaokeBackBtn').addEventListener('click', () => {
      stateManager.changeScreen('home');
    });

    document.getElementById('karaokePinKeypad').addEventListener('click', (e) => {
      const key = e.target.dataset.key;
      if (!key) return;
      if (key === 'delete') {
        this.pinEntry = this.pinEntry.slice(0, -1);
      } else {
        this.pinEntry += key;
        if (this.pinEntry.length === 4) {
          this.validatePin();
        }
      }
      this.updatePinDots();
    });

    document.getElementById('karaokePinCancel').addEventListener('click', () => {
      stateManager.changeScreen('home');
    });

    document.getElementById('karaokeStopBtn').addEventListener('click', () => {
      this.stopVideo();
    });
  },

  updatePinDots() {
    const dots = document.querySelectorAll('.karaoke-pin__dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('filled', i < this.pinEntry.length);
    });
  },

  validatePin() {
    if (this.pinEntry === this.PIN_CODE) {
      this.unlocked = true;
      document.getElementById('karaokePinScreen').classList.remove('show');
      document.getElementById('karaokeMainContent').classList.add('show');
    } else {
      document.getElementById('karaokePinError').classList.add('show');
      setTimeout(() => {
        document.getElementById('karaokePinError').classList.remove('show');
        this.pinEntry = '';
        this.updatePinDots();
      }, 1000);
    }
    this.pinEntry = '';
    this.updatePinDots();
  },

  renderSongs() {
    const list = document.getElementById('karaokeSongList');
    list.innerHTML = '';

    this.songs.forEach(song => {
      const row = document.createElement('div');
      row.className = 'karaoke-song-row';
      row.innerHTML = `
        <div class="karaoke-song-row__cover">
          <img src="${song.cover}" alt="${song.title}"
               onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
          <div class="karaoke-song-row__cover-placeholder" style="display:none;">🎤</div>
        </div>
        <div class="karaoke-song-row__info">
          <div class="karaoke-song-row__title">${song.title}</div>
          <div class="karaoke-song-row__sub">Karaoké · ${song.artist}</div>
        </div>
        <div class="karaoke-song-row__chevron">›</div>
      `;
      row.addEventListener('click', () => this.playSong(song));
      list.appendChild(row);
    });
  },

  playSong(song) {
    const player = document.getElementById('karaokeFullscreen');
    const video = document.getElementById('karaokeFullVideo');
    const title = document.getElementById('karaokeFullTitle');

    title.textContent = `${song.artist} – ${song.title}`;
    video.src = song.video;
    player.classList.add('show');
    video.play().catch(() => {});

    if (wsClient && wsClient.socket) {
      wsClient.socket.emit('karaoke_play', {
        id: song.id,
        artist: song.artist,
        title: song.title,
        actuator: song.actuator
      });
    }
  },

  stopVideo() {
    const player = document.getElementById('karaokeFullscreen');
    const video = document.getElementById('karaokeFullVideo');
    video.pause();
    video.src = '';
    player.classList.remove('show');

    if (wsClient && wsClient.socket) {
      wsClient.socket.emit('karaoke_stop');
    }
  },

  open() {
    this.pinEntry = '';
    this.updatePinDots();
    document.getElementById('karaokePinError').classList.remove('show');

    if (this.unlocked) {
      document.getElementById('karaokePinScreen').classList.remove('show');
      document.getElementById('karaokeMainContent').classList.add('show');
    } else {
      document.getElementById('karaokePinScreen').classList.add('show');
      document.getElementById('karaokeMainContent').classList.remove('show');
    }

    this.renderSongs();
    document.getElementById('karaokeApp').classList.add('show');
  },

  close() {
    this.stopVideo();
    document.getElementById('karaokeApp').classList.remove('show');
  }
};

stateManager.on('screenChange', (data) => {
  if (data.to === 'karaoke') {
    KaraokeApp.open();
  } else if (data.from === 'karaoke') {
    KaraokeApp.close();
  }
});
