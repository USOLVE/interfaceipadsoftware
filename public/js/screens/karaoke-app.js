// Karaoke App - Style KaraFun

const KaraokeApp = {

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

  init() {
    document.getElementById('karaokeBackBtn').addEventListener('click', () => {
      stateManager.changeScreen('home');
    });
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
    const video = document.getElementById('karaokeVideo');
    const placeholder = document.getElementById('karaokeLogoPlaceholder');

    video.src = song.video;
    video.style.display = 'block';
    placeholder.style.display = 'none';
    video.play().catch(() => {});

    // Notify server → game master
    if (wsClient && wsClient.socket) {
      wsClient.socket.emit('karaoke_play', {
        id: song.id,
        artist: song.artist,
        title: song.title,
        actuator: song.actuator
      });
    }
  },

  closePlayer() {
    const video = document.getElementById('karaokeVideo');
    const placeholder = document.getElementById('karaokeLogoPlaceholder');
    video.pause();
    video.src = '';
    video.style.display = 'none';
    placeholder.style.display = 'flex';

    if (wsClient && wsClient.socket) {
      wsClient.socket.emit('karaoke_stop');
    }
  },

  open() {
    this.renderSongs();
    document.getElementById('karaokeApp').classList.add('show');
  },

  close() {
    this.closePlayer();
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
