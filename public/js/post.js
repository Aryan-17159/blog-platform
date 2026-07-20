function getPostId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function renderComment(comment, currentUser) {
  const mine = currentUser && comment.author?._id === currentUser.id;
  return `
    <div class="note" data-comment-id="${comment._id}">
      ${mine ? `<button class="note-delete" data-delete="${comment._id}">remove</button>` : ''}
      <span class="note-author">${escapeHtml(comment.author?.username || 'Unknown')}</span>
      <span class="note-time">${timeAgo(comment.createdAt)}</span>
      <p class="note-body">${escapeHtml(comment.body)}</p>
    </div>
  `;
}

async function loadPost() {
  const postId = getPostId();
  const articleEl = document.getElementById('article');
  const marginEl = document.getElementById('marginalia-notes');
  const countEl = document.getElementById('comment-count');
  const ownerActionsEl = document.getElementById('owner-actions');
  const formWrapEl = document.getElementById('comment-form-wrap');

  if (!postId) {
    articleEl.innerHTML = '<p>No post specified.</p>';
    return;
  }

  let currentUser = null;
  try {
    const meRes = await api.get('/api/auth/me');
    currentUser = meRes.user;
  } catch (err) {
    currentUser = null;
  }

  try {
    const { post, comments } = await api.get(`/api/posts/${postId}`);

    document.title = `${post.title} — Marginalia`;
    articleEl.innerHTML = `
      <div class="article-meta">
        By ${escapeHtml(post.author?.username || 'Unknown')} &middot; ${formatDate(post.createdAt)}
        ${!post.published ? '<span class="status-tag" style="margin-left:8px;">Draft</span>' : ''}
      </div>
      <h1 class="article-title">${escapeHtml(post.title)}</h1>
      <div class="article-body">${escapeHtml(post.body)}</div>
    `;

    if (currentUser && post.author?._id === currentUser.id) {
      ownerActionsEl.innerHTML = `
        <a class="btn btn-small" href="/dashboard.html?edit=${post._id}">Edit post</a>
        <button class="btn btn-small btn-danger" id="delete-post">Delete post</button>
      `;
      ownerActionsEl.style.display = 'flex';
      document.getElementById('delete-post').addEventListener('click', async () => {
        if (!confirm('Delete this post and all its comments? This cannot be undone.')) return;
        try {
          await api.delete(`/api/posts/${post._id}`);
          window.location.href = '/dashboard.html';
        } catch (err) {
          alert(err.message);
        }
      });
    }

    countEl.textContent = comments.length;
    marginEl.innerHTML = comments.length
      ? comments.map((c) => renderComment(c, currentUser)).join('')
      : '<p class="sign-in-prompt">No annotations yet. Be the first to add one.</p>';

    marginEl.querySelectorAll('[data-delete]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const commentId = btn.getAttribute('data-delete');
        if (!confirm('Remove this comment?')) return;
        try {
          await api.delete(`/api/posts/${postId}/comments/${commentId}`);
          loadPost();
        } catch (err) {
          alert(err.message);
        }
      });
    });

    if (currentUser) {
      formWrapEl.innerHTML = `
        <form class="comment-form" id="comment-form">
          <textarea name="body" placeholder="Add a note in the margin..." maxlength="500" required></textarea>
          <div class="comment-form-actions">
            <button type="submit" class="btn btn-accent btn-small">Post note</button>
          </div>
        </form>
      `;
      document.getElementById('comment-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = e.target.body.value.trim();
        if (!body) return;
        try {
          await api.post(`/api/posts/${postId}/comments`, { body });
          e.target.reset();
          loadPost();
        } catch (err) {
          alert(err.message);
        }
      });
    } else {
      formWrapEl.innerHTML = `<p class="sign-in-prompt"><a href="/login.html">Sign in</a> to leave a note.</p>`;
    }
  } catch (err) {
    articleEl.innerHTML = `<p>${escapeHtml(err.message)}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  loadPost();
});
