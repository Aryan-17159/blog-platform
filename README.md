# Marginalia — Blog Platform with Comments

A full-stack blogging platform where users register, publish posts, and leave
comments that render as a **marginalia rail** beside the article — annotations
in the margin, not a stacked list at the bottom.

## Stack

- **Backend:** Node.js, Express, MongoDB Atlas (via Mongoose)
- **Auth:** JWT stored in an httpOnly cookie, passwords hashed with bcrypt
- **Frontend:** Vanilla HTML / CSS / JS (no framework, no build step)

## Features

- User registration, login, logout, session persistence
- Create, edit, delete, and publish/draft your own blog posts
- Comment on any post; delete your own comments
- RESTful JSON API consumed by the static frontend
- Authorization checks: only an author can edit/delete their own post or comment

## Project structure

```
blog-platform/
├── server/
│   ├── server.js            # Express app entry point
│   ├── models/               # Mongoose schemas: User, Post, Comment
│   ├── routes/                # auth.js, posts.js, comments.js
│   └── middleware/auth.js    # JWT verification
├── public/                    # Static frontend
│   ├── index.html             # Feed
│   ├── login.html / register.html
│   ├── post.html               # Post detail + marginalia comments
│   ├── dashboard.html         # Create/edit/delete your posts
│   ├── css/style.css
│   └── js/                     # api.js, nav.js, feed.js, auth.js, post.js, dashboard.js
├── package.json
└── .env.example
```

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**

   Copy `.env.example` to `.env` and fill in real values:
   ```bash
   cp .env.example .env
   ```
   - `MONGO_URI` — your MongoDB Atlas connection string
   - `JWT_SECRET` — any long random string
   - `PORT` — defaults to 3000

3. **Run the server**
   ```bash
   npm start
   ```
   Or, for auto-restart during development:
   ```bash
   npm run dev
   ```

4. Visit `http://localhost:3000`

## API reference

| Method | Route                              | Auth required | Description                          |
|--------|-------------------------------------|---------------|---------------------------------------|
| POST   | `/api/auth/register`               | No            | Create an account                     |
| POST   | `/api/auth/login`                  | No            | Sign in                               |
| POST   | `/api/auth/logout`                 | No            | Clear session cookie                  |
| GET    | `/api/auth/me`                     | Yes           | Current user                          |
| GET    | `/api/posts`                       | No            | List published posts                  |
| GET    | `/api/posts/mine`                  | Yes           | List your own posts (incl. drafts)    |
| GET    | `/api/posts/:id`                   | No            | Single post + its comments            |
| POST   | `/api/posts`                       | Yes           | Create a post                         |
| PUT    | `/api/posts/:id`                   | Yes (author)  | Edit a post                           |
| DELETE | `/api/posts/:id`                   | Yes (author)  | Delete a post + its comments          |
| POST   | `/api/posts/:postId/comments`      | Yes           | Add a comment                         |
| DELETE | `/api/posts/:postId/comments/:id`  | Yes (author)  | Delete your own comment               |

## Notes

- This project deliberately avoids a frontend framework and build tooling to
  keep the stack transparent for a coursework submission — everything is
  plain HTML/CSS/JS served statically by Express.
- `.env` is git-ignored. Never commit real database credentials.
- To deploy (e.g. on Render, as with the portfolio site), set the same three
  environment variables in the host's dashboard and point the build/start
  command at `npm start`.
