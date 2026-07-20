async function handleLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;
  const banner = document.getElementById('form-banner');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.email.value.trim();
    const password = form.password.value;
    try {
      await api.post('/api/auth/login', { email, password });
      window.location.href = '/index.html';
    } catch (err) {
      showBanner(banner, err.message);
    }
  });
}

async function handleRegisterForm() {
  const form = document.getElementById('register-form');
  if (!form) return;
  const banner = document.getElementById('form-banner');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = form.username.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;

    if (password.length < 6) {
      showBanner(banner, 'Password must be at least 6 characters.');
      return;
    }

    try {
      await api.post('/api/auth/register', { username, email, password });
      window.location.href = '/index.html';
    } catch (err) {
      showBanner(banner, err.message);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  handleLoginForm();
  handleRegisterForm();
});
