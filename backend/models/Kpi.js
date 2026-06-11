const mongoose = require('mongoose');

const MilestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  percentage: { type: String, default: '' },
  label: { type: String, default: '' }
});

const SubmissionSchema = new mongoose.Schema({
  assignee: { type: String, default: '' },
  progressValue: { type: Number, required: true, min: 0, max: 100 },
  notes: { type: String },
  evidenceUrl: { type: String },
  evidenceUrls: [{ type: String }],
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Revision Requested', 'Revision requested'],
    default: 'Pending'
  },
  managerComment: { type: String, default: '' },
  feedback: { type: String, default: '' }
}, { timestamps: true });

const KpiSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  targetText: { type: String, default: '' },
  weightage: { type: Number, default: 100 },
  achievementScore: { type: Number, default: 0 },
  targetDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Draft', 'Not Started', 'In Progress', 'Under Review', 'Completed'],
    default: 'Not Started'
  },
  // Legacy single-assignee records remain readable during migration.
  assignee: { type: String, default: '' },
  assignees: { type: [String], default: [] },
  description: { type: String, default: '' },
  department: { type: String, default: '' },
  startDate: { type: Date },
  targetValue: { type: mongoose.Schema.Types.Mixed, default: '' },
  unit: { type: String, default: '' },
  direction: { type: String, default: '' },
  evidencePdf: { type: Boolean, default: false },
  evidenceImages: { type: Boolean, default: false },
  evidenceSpreadsheet: { type: Boolean, default: false },
  evidenceRequirements: {
    pdf: { type: Boolean, default: false },
    images: { type: Boolean, default: false },
    spreadsheet: { type: Boolean, default: false }
  },
  staffInstructions: { type: String, default: '' },
  milestones: [MilestoneSchema],
  submissions: [SubmissionSchema]
}, { timestamps: true });

module.exports = mongoose.model('Kpi', KpiSchema);
