// Photos App - Galerie photos avec caméra

const PhotosApp = {
  gallery: null,
  emptyState: null,
  backButton: null,
  cameraBtn: null,

  // Viewer elements
  viewer: null,
  viewerImage: null,
  viewerClose: null,

  // Camera elements
  cameraView: null,
  cameraPreview: null,
  cameraCaptureBtn: null,
  cameraCancelBtn: null,
  cameraSwitchBtn: null,

  // State
  photos: [],
  stream: null,
  facingMode: 'user', // 'user' for front, 'environment' for back

  init() {
    this.gallery = document.getElementById('photosGallery');
    this.emptyState = document.getElementById('photosEmpty');
    this.backButton = document.getElementById('photosBackBtn');
    this.cameraBtn = document.getElementById('photosCameraBtn');

    this.viewer = document.getElementById('photoViewer');
    this.viewerImage = document.getElementById('photoViewerImage');
    this.viewerClose = document.getElementById('photoViewerClose');

    this.cameraView = document.getElementById('photosCamera');
    this.cameraPreview = document.getElementById('cameraPreview');
    this.cameraCaptureBtn = document.getElementById('cameraCaptureBtn');
    this.cameraCancelBtn = document.getElementById('cameraCancelBtn');
    this.cameraSwitchBtn = document.getElementById('cameraSwitchBtn');

    // Load saved photos
    this.loadPhotos();

    // Back button
    this.backButton.addEventListener('click', () => {
      this.close();
    });

    // Camera button
    this.cameraBtn.addEventListener('click', () => {
      this.openCamera();
    });

    // Viewer close
    this.viewerClose.addEventListener('click', () => {
      this.closeViewer();
    });

    // Camera controls
    this.cameraCaptureBtn.addEventListener('click', () => {
      this.capturePhoto();
    });

    this.cameraCancelBtn.addEventListener('click', () => {
      this.closeCamera();
    });

    this.cameraSwitchBtn.addEventListener('click', () => {
      this.switchCamera();
    });

    // Listen for screen changes
    stateManager.on('screenChange', (data) => {
      if (data.to === 'photos') {
        this.open();
      } else if (data.from === 'photos') {
        this.closeCamera();
      }
    });

    // Listen for new photos from server
    stateManager.on('newPhoto', (photo) => {
      this.addPhoto(photo.url, false);
    });
  },

  loadPhotos() {
    try {
      const saved = localStorage.getItem('escapegame_photos');
      if (saved) {
        this.photos = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading photos:', e);
      this.photos = [];
    }
  },

  savePhotos() {
    try {
      localStorage.setItem('escapegame_photos', JSON.stringify(this.photos));
    } catch (e) {
      console.error('Error saving photos:', e);
    }
  },

  open() {
    const app = document.getElementById('photosApp');
    app.classList.add('active');
    this.renderGallery();
  },

  close() {
    this.closeCamera();
    this.closeViewer();
    const app = document.getElementById('photosApp');
    app.classList.remove('active');
    stateManager.changeScreen('home');
  },

  renderGallery() {
    // Clear existing items (keep empty state)
    const existingItems = this.gallery.querySelectorAll('.photos-app__item');
    existingItems.forEach(item => item.remove());

    if (this.photos.length === 0) {
      this.emptyState.style.display = 'flex';
      return;
    }

    this.emptyState.style.display = 'none';

    this.photos.forEach((photo, index) => {
      const item = document.createElement('div');
      item.className = 'photos-app__item';

      const img = document.createElement('img');
      img.src = photo.url;
      img.alt = `Photo ${index + 1}`;

      item.appendChild(img);
      item.addEventListener('click', () => {
        this.openViewer(photo.url);
      });

      this.gallery.appendChild(item);
    });
  },

  openViewer(url) {
    this.viewerImage.src = url;
    this.viewer.classList.add('active');
  },

  closeViewer() {
    this.viewer.classList.remove('active');
    this.viewerImage.src = '';
  },

  async openCamera() {
    // Check if getUserMedia is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Caméra non disponible.\n\nSur iPad/iPhone, la caméra nécessite une connexion HTTPS.');
      return;
    }

    try {
      const constraints = {
        video: {
          facingMode: this.facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.cameraPreview.srcObject = this.stream;
      this.cameraView.classList.add('active');
    } catch (err) {
      console.error('Error accessing camera:', err);
      if (err.name === 'NotAllowedError') {
        alert('Accès à la caméra refusé.\n\nVérifiez les permissions dans les réglages.');
      } else if (err.name === 'NotFoundError') {
        alert('Aucune caméra détectée.');
      } else if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        alert('Caméra non disponible.\n\nLa caméra nécessite HTTPS sur iPad/iPhone.\n\nTestez sur l\'ordinateur ou configurez HTTPS.');
      } else {
        alert('Erreur caméra: ' + err.message);
      }
    }
  },

  closeCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.cameraPreview.srcObject = null;
    this.cameraView.classList.remove('active');
  },

  async switchCamera() {
    this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';

    // Close and reopen with new facing mode
    if (this.stream) {
      this.closeCamera();
      await this.openCamera();
    }
  },

  capturePhoto() {
    if (!this.stream) return;

    // Create canvas to capture frame
    const canvas = document.createElement('canvas');
    const video = this.cameraPreview;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');

    // Mirror if front camera
    if (this.facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0);

    // Get data URL
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

    // Add to photos
    this.addPhoto(dataUrl, true);

    // Flash effect
    this.cameraView.style.backgroundColor = '#FFFFFF';
    setTimeout(() => {
      this.cameraView.style.backgroundColor = '#000000';
    }, 100);

    // Close camera
    this.closeCamera();
  },

  addPhoto(url, isLocal = true) {
    const photo = {
      id: Date.now().toString(),
      url: url,
      timestamp: new Date().toISOString(),
      isLocal: isLocal
    };

    this.photos.unshift(photo);
    this.savePhotos();
    this.renderGallery();
  },

  // Called by server to add a photo
  addServerPhoto(url) {
    this.addPhoto(url, false);
  },

  clear() {
    this.photos = [];
    this.savePhotos();
    this.renderGallery();
  }
};
