const mongoose = require('mongoose');

const MilestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' }
});

const KpiSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true }, // e.g., "Core Responsibility", "Elective"
  targetText: { type: String, required: true },
  weightage: { type: Number, required: true }, // Weight percentage out of 100
  achievementScore: { type: Number, default: 0 },
  targetDate: { type: Date, required: true },
  status: { type: String, enum: ['Not Started', 'In Progress', 'Under Review', 'Completed'], default: 'Not Started' },
  assignee: { type: String, required: true }, // Can map to user email or name
  milestones: [MilestoneSchema]
}, { timestamps: true });

module.exports = mongoose.model('Kpi', KpiSchema);