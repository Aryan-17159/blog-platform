async function initNav() {
  const linksEl = document.getElementById('nav-links');
  if (!linksEl) return null;

  try {
    const { user } = await api.get('/api/auth/me');
    linksEl.innerHTML = `
      <a href="/dashboard.html">Write</a>
      <span>${escapeHtml(user.username)}</span>
      <button id="nav-logout">Sign out</button>
    `;
    document.getElementById('nav-logout').addEventListener('click', async () => {
      await api.post('/api/auth/logout');
      window.location.href = '/index.html';
    });
    return user;
  } catch (err) {
    linksEl.innerHTML = `
      <a href="/login.html">Sign in</a>
      <a href="/register.html" class="btn btn-small btn-accent">Start writing</a>
    `;
    return null;
  }
}
