const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  assignee: { type: String, required: true },
  title: { type: String, required: true }, 
  desc: { type: String, required: true }, 
  type: { 
    type: String, 
    enum: ['progress_update', 'comment', 'deadline_reminder', 'new_kpi', 'revision_requested', 'evidence_approved'], 
    required: true 
  },
  dotColor: { type: String, default: '#1b6a38' },
  kpiId: { type: mongoose.Schema.Types.ObjectId, ref: 'Kpi' }
}, { timestamps: true });

module.exports = mongoose.model('Activity', ActivitySchema);
