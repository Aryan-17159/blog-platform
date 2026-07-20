async function loadFeed() {
  const listEl = document.getElementById('feed-list');
  try {
    const { posts } = await api.get('/api/posts');
    if (!posts.length) {
      listEl.innerHTML = `
        <div class="empty-state">
          <span class="eyebrow">Nothing published yet</span>
          <p>Be the first to write something worth annotating.</p>
        </div>
      `;
      return;
    }
    listEl.innerHTML = posts
      .map(
        (post) => `
      <a class="feed-item" href="/post.html?id=${post._id}">
        <div class="feed-meta">
          <span>${escapeHtml(post.author?.username || 'Unknown')}</span>
          <span class="dot">&middot;</span>
          <span>${formatDate(post.createdAt)}</span>
        </div>
        <h2 class="feed-title">${escapeHtml(post.title)}</h2>
        <p class="feed-excerpt">${escapeHtml(post.excerpt || '')}</p>
      </a>
    `
      )
      .join('');
  } catch (err) {
    listEl.innerHTML = `<div class="empty-state">Could not load posts. ${escapeHtml(err.message)}</div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  loadFeed();
});
