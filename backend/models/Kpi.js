const mongoose = require('mongoose');

const MilestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  percentage: { type: String },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' }
});

const SubmissionSchema = new mongoose.Schema({
  progressValue: { type: Number, required: true, min: 0, max: 100 },
  notes: { type: String },
  evidenceUrl: { type: String },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Revision Requested'], default: 'Pending' },
  managerComment: { type: String, default: '' }
}, { timestamps: true });

const KpiSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  department: { type: String },
  targetText: { type: String, required: true },
  targetValue: { type: Number },
  unit: { type: String, enum: ['RM', '%', 'events'] },
  direction: { type: String, enum: ['Atleast (≥)', 'Atmost (≤)', 'Exact (=)'] },
  startDate: { type: Date },
  evidenceRequirements: {
    pdf: { type: Boolean, default: false },
    images: { type: Boolean, default: false },
    spreadsheet: { type: Boolean, default: false }
  },
  staffInstructions: { type: String },
  weightage: { type: Number, required: true, default: 100 },
  achievementScore: { type: Number, default: 0 },
  targetDate: { type: Date, required: true },
  status: { type: String, enum: ['Draft', 'Not Started', 'In Progress', 'Under Review', 'Completed'], default: 'Not Started' },
  assignees: { type: [String], default: [] },
  milestones: [MilestoneSchema],
  submissions: [SubmissionSchema]
}, { timestamps: true });

module.exports = mongoose.model('Kpi', KpiSchema);