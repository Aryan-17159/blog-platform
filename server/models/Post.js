const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    body: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      maxlength: 240,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    published: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });

postSchema.pre('save', function (next) {
  if (!this.excerpt) {
    this.excerpt = this.body.replace(/\s+/g, ' ').slice(0, 180).trim();
  }
  next();
});

module.exports = mongoose.model('Post', postSchema);
