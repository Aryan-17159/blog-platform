const express = require('express');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { requireAuth, attachUserIfPresent } = require('../middleware/auth');

const router = express.Router();

// GET /api/posts — list all published posts, newest first
router.get('/', attachUserIfPresent, async (req, res) => {
  try {
    const posts = await Post.find({ published: true })
      .sort({ createdAt: -1 })
      .populate('author', 'username')
      .lean();
    res.json({ posts });
  } catch (err) {
    res.status(500).json({ error: 'Could not load posts.' });
  }
});

// GET /api/posts/mine — posts belonging to the signed-in user (drafts included)
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.userId })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ posts });
  } catch (err) {
    res.status(500).json({ error: 'Could not load your posts.' });
  }
});

// GET /api/posts/:id — single post with its comments
router.get('/:id', attachUserIfPresent, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'username').lean();
    if (!post) return res.status(404).json({ error: 'Post not found.' });

    const comments = await Comment.find({ post: post._id })
      .sort({ createdAt: 1 })
      .populate('author', 'username')
      .lean();

    res.json({ post, comments });
  } catch (err) {
    res.status(404).json({ error: 'Post not found.' });
  }
});

// POST /api/posts — create a post
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, body, published } = req.body;
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required.' });
    }
    const post = await Post.create({
      title,
      body,
      published: published !== undefined ? published : true,
      author: req.userId,
    });
    res.status(201).json({ post });
  } catch (err) {
    res.status(500).json({ error: 'Could not create post.' });
  }
});

// PUT /api/posts/:id — edit a post (author only)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ error: "You can only edit your own posts." });
    }

    const { title, body, published } = req.body;
    if (title !== undefined) post.title = title;
    if (body !== undefined) {
      post.body = body;
      post.excerpt = body.replace(/\s+/g, ' ').slice(0, 180).trim();
    }
    if (published !== undefined) post.published = published;
    await post.save();

    res.json({ post });
  } catch (err) {
    res.status(500).json({ error: 'Could not update post.' });
  }
});

// DELETE /api/posts/:id — delete a post and its comments (author only)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ error: "You can only delete your own posts." });
    }

    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete post.' });
  }
});

module.exports = router;
