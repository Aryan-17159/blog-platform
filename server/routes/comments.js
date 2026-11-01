const express = require("express");
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const { requireAuth } = require("../middleware/auth");

// mergeParams lets this router read :postId from the parent router
const router = express.Router({ mergeParams: true });

// POST /api/posts/:postId/comments — add a comment to a post
router.post("/", requireAuth, async (req, res) => {
  try {
    const { body } = req.body;
    if (!body || !body.trim()) {
      return res.status(400).json({ error: "Comment cannot be empty." });
    }

    const post = await Post.findById(req.params.postId);
    if (!post || !post.published)
      return res.status(404).json({ error: "Published post not found." });

    const comment = await Comment.create({
      post: post._id,
      author: req.userId,
      body: body.trim(),
    });
    await comment.populate("author", "username");

    res.status(201).json({ comment });
  } catch (err) {
    res.status(500).json({ error: "Could not add comment." });
  }
});

// DELETE /api/posts/:postId/comments/:commentId — remove own comment
router.delete("/:commentId", requireAuth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment || comment.post.toString() !== req.params.postId)
      return res.status(404).json({ error: "Comment not found." });
    if (comment.author.toString() !== req.userId) {
      return res
        .status(403)
        .json({ error: "You can only delete your own comments." });
    }
    await comment.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Could not delete comment." });
  }
});

module.exports = router;
