// Message Bubble Component - Création de bulles de messages

const MessageBubble = {
  create(message) {
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble message-bubble--received';

    // Avatar
    const avatar = document.createElement('div');
    avatar.className = 'message-bubble__avatar';
    avatar.innerHTML = `<img src="${message.senderPhoto || '/assets/images/contact-photos/default.jpg'}" alt="${message.sender}">`;

    // Content
    const content = document.createElement('div');
    content.className = 'message-bubble__content';

    // Sender name
    const sender = document.createElement('div');
    sender.className = 'message-bubble__sender';
    sender.textContent = message.sender || 'Inconnu';
    content.appendChild(sender);

    // Message content based on type
    if (message.type === 'text') {
      const text = document.createElement('div');
      text.className = 'message-bubble__text';
      text.textContent = message.message;
      content.appendChild(text);
    } else if (message.type === 'image') {
      const imageContainer = document.createElement('div');
      imageContainer.className = 'message-bubble__image';
      const img = document.createElement('img');
      img.src = message.imageUrl;
      img.alt = 'Image';
      img.loading = 'lazy';
      imageContainer.appendChild(img);
      content.appendChild(imageContainer);

      if (message.caption) {
        const caption = document.createElement('div');
        caption.className = 'message-bubble__text message-bubble__caption';
        caption.textContent = message.caption;
        content.appendChild(caption);
      }
    } else if (message.type === 'video') {
      const videoContainer = document.createElement('div');
      videoContainer.className = 'message-bubble__video';

      const video = document.createElement('video');
      video.src = message.videoUrl;
      video.controls = true;
      video.preload = 'metadata';
      videoContainer.appendChild(video);

      content.appendChild(videoContainer);

      if (message.caption) {
        const caption = document.createElement('div');
        caption.className = 'message-bubble__text message-bubble__caption';
        caption.textContent = message.caption;
        content.appendChild(caption);
      }
    }

    // Timestamp
    const timestamp = document.createElement('div');
    timestamp.className = 'message-bubble__timestamp';
    timestamp.textContent = this.formatTime(new Date(message.timestamp));
    content.appendChild(timestamp);

    // Assemble
    bubble.appendChild(avatar);
    bubble.appendChild(content);

    return bubble;
  },

  formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
};
