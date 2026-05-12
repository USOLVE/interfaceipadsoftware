// Notes App - Application de notes

const NotesApp = {
  notesList: null,
  notesEditor: null,
  notesTextarea: null,
  notesEmpty: null,
  backButton: null,
  newButton: null,
  editorBackButton: null,
  deleteButton: null,

  notes: [],
  currentNoteId: null,

  init() {
    this.notesList = document.getElementById('notesList');
    this.notesEditor = document.getElementById('notesEditor');
    this.notesTextarea = document.getElementById('notesTextarea');
    this.notesEmpty = document.getElementById('notesEmpty');
    this.backButton = document.getElementById('notesBackBtn');
    this.newButton = document.getElementById('notesNewBtn');
    this.editorBackButton = document.getElementById('notesEditorBack');
    this.deleteButton = document.getElementById('notesDeleteBtn');

    // Load saved notes from localStorage
    this.loadNotes();

    // Back button handler
    this.backButton.addEventListener('click', () => {
      this.close();
    });

    // New note button
    this.newButton.addEventListener('click', () => {
      this.createNewNote();
    });

    // Editor back button
    this.editorBackButton.addEventListener('click', () => {
      this.saveCurrentNote();
      this.showList();
    });

    // Delete button
    this.deleteButton.addEventListener('click', () => {
      this.deleteCurrentNote();
    });

    // Auto-save on textarea change
    this.notesTextarea.addEventListener('input', () => {
      this.autoSave();
    });

    // Listen for screen changes
    stateManager.on('screenChange', (data) => {
      if (data.to === 'notes') {
        this.open();
      }
    });
  },

  loadNotes() {
    try {
      const saved = localStorage.getItem('escapegame_notes');
      if (saved) {
        this.notes = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading notes:', e);
      this.notes = [];
    }
  },

  saveNotes() {
    try {
      localStorage.setItem('escapegame_notes', JSON.stringify(this.notes));
    } catch (e) {
      console.error('Error saving notes:', e);
    }
  },

  open() {
    const app = document.getElementById('notesApp');
    app.classList.add('active');
    this.renderNotesList();
    this.showList();
  },

  close() {
    this.saveCurrentNote();
    const app = document.getElementById('notesApp');
    app.classList.remove('active');
    stateManager.changeScreen('home');
  },

  showList() {
    this.notesList.classList.remove('hidden');
    this.notesEditor.classList.remove('active');
    this.currentNoteId = null;
    this.renderNotesList();
  },

  showEditor(noteId) {
    this.currentNoteId = noteId;
    const note = this.notes.find(n => n.id === noteId);

    if (note) {
      this.notesTextarea.value = note.content;
    } else {
      this.notesTextarea.value = '';
    }

    this.notesList.classList.add('hidden');
    this.notesEditor.classList.add('active');

    // Focus textarea
    setTimeout(() => {
      this.notesTextarea.focus();
    }, 300);
  },

  createNewNote() {
    const note = {
      id: Date.now().toString(),
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.notes.unshift(note);
    this.saveNotes();
    this.showEditor(note.id);
  },

  saveCurrentNote() {
    if (!this.currentNoteId) return;

    const note = this.notes.find(n => n.id === this.currentNoteId);
    if (note) {
      const content = this.notesTextarea.value.trim();

      if (content === '') {
        // Delete empty notes
        this.notes = this.notes.filter(n => n.id !== this.currentNoteId);
      } else {
        note.content = content;
        note.updatedAt = new Date().toISOString();
      }

      this.saveNotes();
    }
  },

  autoSave() {
    if (!this.currentNoteId) return;

    const note = this.notes.find(n => n.id === this.currentNoteId);
    if (note) {
      note.content = this.notesTextarea.value;
      note.updatedAt = new Date().toISOString();
      this.saveNotes();
    }
  },

  deleteCurrentNote() {
    if (!this.currentNoteId) return;

    this.notes = this.notes.filter(n => n.id !== this.currentNoteId);
    this.saveNotes();
    this.showList();
  },

  renderNotesList() {
    // Clear existing notes (keep empty state)
    const existingItems = this.notesList.querySelectorAll('.notes-app__item');
    existingItems.forEach(item => item.remove());

    if (this.notes.length === 0) {
      this.notesEmpty.style.display = 'flex';
      return;
    }

    this.notesEmpty.style.display = 'none';

    // Sort by updatedAt (most recent first)
    const sortedNotes = [...this.notes].sort((a, b) =>
      new Date(b.updatedAt) - new Date(a.updatedAt)
    );

    sortedNotes.forEach(note => {
      const item = this.createNoteItem(note);
      this.notesList.appendChild(item);
    });
  },

  createNoteItem(note) {
    const item = document.createElement('div');
    item.className = 'notes-app__item';
    item.dataset.noteId = note.id;

    // Get title (first line) and preview (rest)
    const lines = note.content.split('\n').filter(l => l.trim());
    const title = lines[0] || 'Nouvelle note';
    const preview = lines.slice(1).join(' ') || 'Aucun texte supplémentaire';

    // Format date
    const date = new Date(note.updatedAt);
    const dateStr = date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });

    item.innerHTML = `
      <div class="notes-app__item-title">${this.escapeHtml(title)}</div>
      <div class="notes-app__item-preview">${this.escapeHtml(preview)}</div>
      <div class="notes-app__item-date">${dateStr}</div>
    `;

    item.addEventListener('click', () => {
      this.showEditor(note.id);
    });

    return item;
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // Clear all notes (for reset)
  clear() {
    this.notes = [];
    this.saveNotes();
    this.renderNotesList();
  }
};

// Clear notes on reset if needed
stateManager.on('reset', () => {
  // Optionally clear notes on reset
  // NotesApp.clear();
});
