const mongoose = require('mongoose');

const MilestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' }
});

const SubmissionSchema = new mongoose.Schema({
  progressValue: { type: Number, required: true, min: 0, max: 100 },
  notes: { type: String },
  evidenceUrl: { type: String },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

const KpiSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true }, 
  targetText: { type: String, required: true },
  weightage: { type: Number, required: true },
  achievementScore: { type: Number, default: 0 },
  targetDate: { type: Date, required: true },
  status: { type: String, enum: ['Not Started', 'In Progress', 'Under Review', 'Completed'], default: 'Not Started' },
  assignee: { type: String, required: true },
  milestones: [MilestoneSchema],
  submissions: [SubmissionSchema]
}, { timestamps: true });

module.exports = mongoose.model('Kpi', KpiSchema);