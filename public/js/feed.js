let allPosts = [];
async function loadFeed() {
  const listEl = document.getElementById("feed-list");
  try {
    const { posts } = await api.get("/api/posts");
    allPosts = posts;
    renderFeed(posts);
  } catch (err) {
    listEl.innerHTML = `<div class="empty-state">Could not load posts. ${escapeHtml(err.message)}</div>`;
  }
}
function renderFeed(posts) {
  const listEl = document.getElementById("feed-list");
  document.getElementById("feed-count").textContent =
    `${posts.length} ${posts.length === 1 ? "story" : "stories"}`;
  if (!posts.length) {
    listEl.innerHTML = `
        <div class="empty-state">
          <span class="eyebrow">No stories to show</span>
          <p>Try a different search, or write a story of your own.</p>
        </div>
      `;
    return;
  }
  listEl.innerHTML = posts
    .map(
      (post) => `
      <a class="feed-item" href="/post.html?id=${post._id}">
        <div class="feed-meta">
          <span>${escapeHtml(post.author?.username || "Unknown")}</span>
          <span class="dot">&middot;</span>
          <span>${formatDate(post.createdAt)}</span>
        </div>
        <h2 class="feed-title">${escapeHtml(post.title)}</h2>
        <p class="feed-excerpt">${escapeHtml(post.excerpt || "")}</p>
      </a>
    `,
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  loadFeed();
});

document.getElementById("feed-search").addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase();
  renderFeed(
    allPosts.filter((p) =>
      `${p.title} ${p.excerpt} ${p.author?.username}`.toLowerCase().includes(q),
    ),
  );
});
