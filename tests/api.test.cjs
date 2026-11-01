const { test } = require("node:test");
const assert = require("node:assert/strict");
const base = process.env.TEST_URL || "http://localhost:3000";
async function req(path, method = "GET", body, token) {
  return fetch(base + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}
test("post lifecycle, private drafts, comments and ownership", async () => {
  const suffix = Date.now();
  async function register(n) {
    const r = await req("/api/auth/register", "POST", {
      username: n + suffix,
      email: n + suffix + "@example.com",
      password: "test-password-123",
    });
    assert.equal(r.status, 201);
    return (await r.json()).token;
  }
  const a = await register("writer"),
    b = await register("reader");
  let r = await req(
    "/api/posts",
    "POST",
    {
      title: "Private thoughts",
      body: "Only the author can read this draft.",
      published: false,
    },
    a,
  );
  assert.equal(r.status, 201);
  const id = (await r.json()).post._id;
  assert.equal((await req("/api/posts/" + id)).status, 404);
  assert.equal((await req("/api/posts/" + id, "GET", null, b)).status, 404);
  assert.equal((await req("/api/posts/" + id, "GET", null, a)).status, 200);
  assert.equal(
    (
      await req(
        "/api/posts/" + id + "/comments",
        "POST",
        { body: "Not allowed on drafts" },
        b,
      )
    ).status,
    404,
  );
  r = await req(
    "/api/posts/" + id,
    "PUT",
    { published: true, title: "Published thoughts" },
    a,
  );
  assert.equal(r.status, 200);
  assert.equal(
    (await req("/api/posts/" + id, "PUT", { title: "Stolen" }, b)).status,
    403,
  );
  r = await req(
    "/api/posts/" + id + "/comments",
    "POST",
    { body: "A thoughtful note." },
    b,
  );
  assert.equal(r.status, 201);
  const cid = (await r.json()).comment._id;
  assert.equal(
    (await req("/api/posts/" + id + "/comments/" + cid, "DELETE", null, a))
      .status,
    403,
  );
  assert.equal(
    (await req("/api/posts/" + id + "/comments/" + cid, "DELETE", null, b))
      .status,
    200,
  );
  assert.equal((await req("/api/posts/" + id, "DELETE", null, a)).status, 200);
  assert.equal((await req("/api/posts/" + id)).status, 404);
});
