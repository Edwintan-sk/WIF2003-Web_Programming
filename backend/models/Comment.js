const mongoose = require('mongoose');

/**
 * A feedback comment attached to a single KPI thread.
 * Powers the Feedback / KPI Comments page.
 */
const CommentSchema = new mongoose.Schema(
  {
    kpiId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Kpi',
      required: true,
      index: true,
    },
    authorEmail: { type: String, required: true },
    authorName: { type: String, required: true },
    authorRole: { type: String, enum: ['manager', 'staff'], required: true },
    body: { type: String, required: true, maxlength: 2000 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', CommentSchema);
