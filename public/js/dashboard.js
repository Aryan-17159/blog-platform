let editingId = null;

function getEditIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get("edit");
}

function setFormMode(mode, post) {
  const titleEl = document.getElementById("editor-title");
  const submitEl = document.getElementById("editor-submit");
  const cancelEl = document.getElementById("editor-cancel");
  const form = document.getElementById("post-form");

  if (mode === "edit" && post) {
    editingId = post._id;
    titleEl.textContent = "Edit post";
    submitEl.textContent = "Save changes";
    cancelEl.style.display = "inline-flex";
    form.elements.namedItem("title").value = post.title;
    form.body.value = post.body;
    form.published.checked = post.published;
  } else {
    editingId = null;
    titleEl.textContent = "New post";
    submitEl.textContent = "Publish";
    cancelEl.style.display = "none";
    form.reset();
    form.published.checked = true;
  }
}

function renderPostRow(post) {
  return `
    <div class="post-row" data-id="${post._id}">
      <div>
        <h3 class="post-row-title">${escapeHtml(post.title)}</h3>
        <span class="status-tag ${post.published ? "live" : ""}">${post.published ? "Published" : "Draft"}</span>
        <span class="feed-meta" style="display:inline-flex; margin-left:8px;">${formatDate(post.createdAt)}</span>
      </div>
      <div class="post-row-actions">
        <a class="btn btn-small" href="/post.html?id=${post._id}">View</a>
        <button class="btn btn-small" data-edit="${post._id}">Edit</button>
        <button class="btn btn-small btn-danger" data-delete="${post._id}">Delete</button>
      </div>
    </div>
  `;
}

async function loadMyPosts() {
  const listEl = document.getElementById("my-posts-list");
  try {
    const { posts } = await api.get("/api/posts/mine");
    if (!posts.length) {
      listEl.innerHTML =
        '<p class="sign-in-prompt">You haven\'t written anything yet.</p>';
      return;
    }
    listEl.innerHTML = posts.map(renderPostRow).join("");

    listEl.querySelectorAll("[data-edit]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const post = posts.find((p) => p._id === btn.getAttribute("data-edit"));
        setFormMode("edit", post);
        window.scrollTo({ top: 0, behavior: "smooth" });
        history.replaceState(null, "", `/dashboard.html?edit=${post._id}`);
      });
    });

    listEl.querySelectorAll("[data-delete]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("Delete this post and all its comments?")) return;
        try {
          await api.delete(`/api/posts/${btn.getAttribute("data-delete")}`);
          loadMyPosts();
        } catch (err) {
          alert(err.message);
        }
      });
    });

    const editId = getEditIdFromQuery();
    if (editId) {
      const post = posts.find((p) => p._id === editId);
      if (post) setFormMode("edit", post);
    }
  } catch (err) {
    listEl.innerHTML = `<p class="sign-in-prompt">${escapeHtml(err.message)}</p>`;
  }
}

async function initDashboard() {
  const user = await initNav();
  if (!user) {
    window.location.href = "/login.html";
    return;
  }

  const form = document.getElementById("post-form");
  const banner = document.getElementById("editor-banner");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = form.elements.namedItem("title").value.trim();
    const body = form.body.value.trim();
    const published = form.published.checked;

    if (!title || !body) {
      showBanner(banner, "Title and body are both required.");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/api/posts/${editingId}`, { title, body, published });
      } else {
        await api.post("/api/posts", { title, body, published });
      }
      setFormMode("new");
      history.replaceState(null, "", "/dashboard.html");
      loadMyPosts();
    } catch (err) {
      showBanner(banner, err.message);
    }
  });

  document.getElementById("editor-cancel").addEventListener("click", () => {
    setFormMode("new");
    history.replaceState(null, "", "/dashboard.html");
  });

  setFormMode("new");
  loadMyPosts();
}

document.addEventListener("DOMContentLoaded", initDashboard);

const bodyField = document.getElementById("body");
bodyField.addEventListener("input", () => {
  const words = bodyField.value.trim().split(/\s+/).filter(Boolean).length;
  document.getElementById("word-count").textContent =
    `${words} words · ${Math.max(1, Math.ceil(words / 200))} min read`;
});
document.getElementById("published").addEventListener("change", (e) => {
  document.getElementById("editor-submit").textContent = editingId
    ? "Save changes"
    : e.target.checked
      ? "Publish"
      : "Save draft";
});
