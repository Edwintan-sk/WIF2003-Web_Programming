const Kpi = require('../models/Kpi');
const Activity = require('../models/Activity');
const User = require('../models/User');
const mongoose = require('mongoose');
const { createNotifications } = require('../utils/notify');
const {
  KPI_STATUS,
  MILESTONE_STATUS,
  SUBMISSION_STATUS,
  CATEGORY_COLORS,
  DEFAULT_COLORS
} = require('../config/constants');

/**
 * Helper to strip HTML tags to prevent stored Cross-Site Scripting (XSS).
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeInput = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim();
};

const getUploadedEvidenceUrl = (file) => {
  if (!file) return '';
  if (file.path && /^https?:\/\//i.test(file.path)) return file.path;
  return file.filename ? `/uploads/${file.filename}` : '';
};

const assignedTo = (email) => ({
  $or: [
    { assignee: email },
    { assignees: email }
  ]
});

const getPrimaryAssignee = (kpi, submission = null) => (
  submission?.assignee || kpi.assignee || kpi.assignees?.[0] || ''
);

/**
 * Helper to calculate relative time from a given date.
 * @param {Date|string} date - The date to format
 * @returns {string} Human readable relative time string (e.g. "2 hours ago", "Yesterday")
 */
const getRelativeTime = (date) => {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMin = Math.round(diffMs / 60000);
  const diffHr = Math.round(diffMs / 3600000);
  const diffDay = Math.round(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min${diffMin !== 1 ? 's' : ''} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? 's' : ''} ago`;
  if (diffDay === 1) return 'Yesterday';
  return `${diffDay} days ago`;
};

/**
 * Helper to calculate milestone status progression based on percentage thresholds.
 * @param {Array} milestones - List of milestones
 * @param {number} achievementScore - Current KPI progress score (0-100)
 * @returns {Array} Updated milestones list with resolved statuses
 */
const calculateMilestones = (milestones, achievementScore) => {
  if (!milestones || milestones.length === 0) return [];

  // Sort a copy of milestones by percentage ascending to determine "In Progress" transition order correctly
  const sortedMilestones = [...milestones].sort((a, b) => {
    const pctA = Number(a.percentage) || 0;
    const pctB = Number(b.percentage) || 0;
    return pctA - pctB;
  });

  // Find the first milestone that is greater than achievementScore. This is "In Progress" (if score < 100).
  const inProgressMilestone = sortedMilestones.find(m => (Number(m.percentage) || 0) > achievementScore);
  const inProgressId = inProgressMilestone ? inProgressMilestone._id.toString() : null;

  return milestones.map((milestone) => {
    const milestonePct = Number(milestone.percentage) || 0;
    let status = MILESTONE_STATUS.PENDING;

    if (achievementScore >= milestonePct) {
      status = MILESTONE_STATUS.COMPLETED;
    } else if (inProgressId && milestone._id.toString() === inProgressId && achievementScore < 100) {
      status = MILESTONE_STATUS.IN_PROGRESS;
    }

    return {
      _id: milestone._id,
      title: milestone.title,
      percentage: milestone.percentage,
      label: milestone.label,
      status
    };
  });
};

/**
 * @desc    Get dashboard aggregate stats and active KPIs for the logged-in staff
 * @route   GET /api/kpi/dashboard
 * @access  Protected (Staff only)
 */
exports.getDashboardData = async (req, res) => {
  try {
    if (!req.user || !req.user.email) {
      return res.status(401).json({ message: 'Unauthorized: User context missing' });
    }

    const assigneeEmail = req.user.email;

    // Aggregation pipeline for calculating dashboard stats directly in MongoDB
    const statsPipeline = await Kpi.aggregate([
      { $match: assignedTo(assigneeEmail) },
      {
        $group: {
          _id: null,
          totalAssigned: { $sum: 1 },
          completedKpis: {
            $sum: { $cond: [{ $eq: ['$status', KPI_STATUS.COMPLETED] }, 1, 0] }
          },
          pendingReview: {
            $sum: { $cond: [{ $eq: ['$status', KPI_STATUS.UNDER_REVIEW] }, 1, 0] }
          },
          totalWeight: { $sum: { $ifNull: ['$weightage', 0] } },
          weightedScoreSum: { $sum: { $multiply: [{ $ifNull: ['$achievementScore', 0] }, { $ifNull: ['$weightage', 0] }] } },
          scoreSum: { $sum: { $ifNull: ['$achievementScore', 0] } }
        }
      }
    ]);

    let totalAssigned = 0;
    let completedKpis = 0;
    let pendingReview = 0;
    let overallProgress = 0;

    if (statsPipeline.length > 0) {
      const s = statsPipeline[0];
      totalAssigned = s.totalAssigned;
      completedKpis = s.completedKpis;
      pendingReview = s.pendingReview;

      if (s.totalWeight > 0) {
        overallProgress = Math.round(s.weightedScoreSum / s.totalWeight);
      } else if (totalAssigned > 0) {
        overallProgress = Math.round(s.scoreSum / totalAssigned);
      }
    }

    // Build stats array for frontend staff-dashboard.jsx
    const stats = [
      {
        id: 1,
        label: 'OVERALL PROGRESS',
        value: `${overallProgress}%`,
        hasProgress: true,
        progressValue: overallProgress,
        badgeColor: '#1b6a38',
        badgeBg: '#e6f4ea',
        dotColor: '#1b6a38'
      },
      {
        id: 2,
        label: 'KPIS ASSIGNED',
        value: String(totalAssigned),
        badgeText: 'active',
        badgeColor: '#c73a24',
        badgeBg: '#fce8e6',
        dotColor: '#c73a24'
      },
      {
        id: 3,
        label: 'COMPLETED',
        value: String(completedKpis),
        badgeText: 'achieved',
        badgeColor: '#1b6a38',
        badgeBg: '#e6f4ea',
        dotColor: '#1b6a38'
      },
      {
        id: 4,
        label: 'PENDING REVIEW',
        value: String(pendingReview),
        badgeText: pendingReview > 0 ? `${pendingReview} pending` : '0 pending',
        badgeColor: '#a87022',
        badgeBg: '#fef2e4',
        dotColor: '#d69f4c'
      }
    ];

    // Fetch limited active KPIs to avoid memory bloat
    const activeKpiDocs = await Kpi.find({ 
      assignee: assigneeEmail, 
      status: { $ne: KPI_STATUS.COMPLETED } 
    }).sort({ targetDate: 1 }).limit(10);

    const activeKpis = activeKpiDocs.map(kpi => {
      const colors = CATEGORY_COLORS[kpi.category] || DEFAULT_COLORS;
      
      const latestSubmission = kpi.submissions && kpi.submissions.length > 0 
        ? kpi.submissions[kpi.submissions.length - 1] 
        : null;

      let isRevisionRequested = false;
      let feedback = '';
      if (latestSubmission && latestSubmission.status === 'Revision requested') {
        isRevisionRequested = true;
        feedback = latestSubmission.feedback || '';
      }

      return {
        id: kpi._id,
        category: kpi.category,
        catBg: colors.catBg,
        catText: colors.catText,
        title: kpi.title,
        dueDate: kpi.targetDate, // Keep raw ISO date for client manipulation
        dueDateFormatted: kpi.targetDate 
          ? new Date(kpi.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
          : 'No due date',
        progress: kpi.achievementScore,
        progColor: colors.progColor,
        isRevisionRequested,
        feedback
      };
    });

    // Fetch recent activities
    const activities = await Activity.find({ assignee: assigneeEmail })
      .sort({ createdAt: -1 })
      .limit(5);

    const formattedActivities = activities.map(act => ({
      id: act._id,
      dotColor: act.dotColor,
      title: act.title,
      desc: act.desc,
      time: getRelativeTime(act.createdAt)
    }));

    const recentActivity = formattedActivities;

    res.status(200).json({
      stats,
      activeKpis,
      recentActivity
    });
  } catch (error) {
    console.error(`Error in getDashboardData: ${error.stack}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * @desc    Get detailed list of assigned KPIs for the logged-in staff
 * @route   GET /api/kpi/assigned
 * @access  Protected (Staff only)
 */
exports.getAssignedKpis = async (req, res) => {
  try {
    if (!req.user || !req.user.email) {
      return res.status(401).json({ message: 'Unauthorized: User context missing' });
    }

    const assigneeEmail = req.user.email;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50; // default large limit to not break existing frontend if not passing query
    const skip = (page - 1) * limit;

    // Fetch user KPIs with pagination, sorting by urgency (due date ascending)
    const [kpis, total] = await Promise.all([
      Kpi.find(assignedTo(assigneeEmail))
        .sort({ targetDate: 1 })
        .skip(skip)
        .limit(limit),
      Kpi.countDocuments(assignedTo(assigneeEmail))
    ]);

    const formattedKpis = kpis.map(kpi => {
      const colors = CATEGORY_COLORS[kpi.category] || DEFAULT_COLORS;
      const formattedDate = kpi.targetDate 
        ? new Date(kpi.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
        : 'No due date';

      const hasMilestones = kpi.milestones && kpi.milestones.length > 0;
      const type = hasMilestones ? 'steps' : 'bar';
      const tag2 = hasMilestones ? 'PROJECT' : 'TARGET';

      let steps = [];
      let subProgress = '';

      if (hasMilestones) {
        let foundCurrent = false;
        steps = kpi.milestones.map((milestone) => {
          if (milestone.status === MILESTONE_STATUS.COMPLETED) return 'completed';
          if (milestone.status === MILESTONE_STATUS.IN_PROGRESS || (!foundCurrent && milestone.status === MILESTONE_STATUS.PENDING)) {
            foundCurrent = true;
            return 'current';
          }
          return 'pending';
        });

        const currentMilestone = kpi.milestones.find(m => m.status === MILESTONE_STATUS.IN_PROGRESS) || kpi.milestones.find(m => m.status === MILESTONE_STATUS.PENDING);
        subProgress = `· ${currentMilestone ? currentMilestone.title : 'No active milestone'}`;
      } else {
        subProgress = `${kpi.achievementScore}% complete`;
      }

      // Format UI status configurations
      let uiStatus = kpi.status;
      let uiStatusBg = colors.statusBg;
      let uiStatusText = colors.statusText;
      let uiStatusBorder = colors.statusBorder;

      // Check if the latest submission was requested for revision
      const latestSubmission = kpi.submissions && kpi.submissions.length > 0 
        ? kpi.submissions[kpi.submissions.length - 1] 
        : null;

      let latestFeedback = '';
      if (latestSubmission && latestSubmission.status === 'Revision requested') {
        uiStatus = 'Revision requested';
        uiStatusBg = '#fff3cd';
        uiStatusText = '#856404';
        uiStatusBorder = '#ffeeba';
        latestFeedback = latestSubmission.feedback || '';
      } else if (kpi.status === KPI_STATUS.UNDER_REVIEW) {
        uiStatus = 'Under review';
        uiStatusBg = '#faebd7';
        uiStatusText = '#c99552';
        uiStatusBorder = '#e8d2b7';
      } else if (kpi.status === KPI_STATUS.COMPLETED) {
        uiStatus = 'Completed';
        uiStatusBg = '#e2efe9';
        uiStatusText = '#183628';
        uiStatusBorder = '#c0d6cb';
      }

      // Flag overdue non-completed tasks
      if (kpi.targetDate && new Date(kpi.targetDate) < new Date() && kpi.status !== KPI_STATUS.COMPLETED) {
        uiStatus = 'Overdue';
        uiStatusBg = '#fce8e6';
        uiStatusText = '#c73a24';
        uiStatusBorder = '#fce8e6';
      }

      return {
        id: kpi._id,
        tag1: kpi.category,
        tag1Bg: colors.tag1Bg,
        tag1Text: colors.tag1Text,
        tag2,
        title: kpi.title,
        target: kpi.targetText,
        progressText: hasMilestones 
          ? `Phase ${kpi.milestones.filter(m => m.status === MILESTONE_STATUS.COMPLETED).length} of ${kpi.milestones.length}` 
          : `${kpi.achievementScore}%`,
        subProgress,
        progressValue: kpi.achievementScore,
        progressColor: colors.progressColor,
        due: formattedDate,
        dueRaw: kpi.targetDate, // Provide raw date
        status: uiStatus,
        statusBg: uiStatusBg,
        statusText: uiStatusText,
        statusBorder: uiStatusBorder,
        feedback: latestFeedback,
        type,
        steps,
        milestones: kpi.milestones,
        submissions: kpi.submissions
      };
    });

    res.status(200).json({
      data: formattedKpis,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error(`Error in getAssignedKpis: ${error.stack}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * @desc    Submit a new progress update with sanitization, constraints validation, and concurrency checks
 * @route   POST /api/kpi/progress
 * @access  Protected (Staff only)
 */
exports.submitProgress = async (req, res) => {
  try {
    if (!req.user || !req.user.email) {
      return res.status(401).json({ message: 'Unauthorized: User context missing' });
    }

    let { kpiId, newMetricValue, notes } = req.body;
    const assigneeEmail = req.user.email;
    let evidenceUrls = [];
    if (req.files && req.files.length > 0) {
      evidenceUrls = req.files.map(getUploadedEvidenceUrl).filter(Boolean);
    } else if (req.file) {
      evidenceUrls = [getUploadedEvidenceUrl(req.file)].filter(Boolean);
    }
    let evidenceUrl = evidenceUrls.length > 0 ? evidenceUrls[0] : (req.body.evidenceUrl || '');

    // Inputs validation
    if (!kpiId) {
      return res.status(400).json({ message: 'KPI ID (kpiId) is required' });
    }
    if (!mongoose.Types.ObjectId.isValid(kpiId)) {
      return res.status(400).json({ message: 'Invalid KPI ID format' });
    }
    if (newMetricValue === undefined || newMetricValue === null) {
      return res.status(400).json({ message: 'Progress update value (newMetricValue) is required' });
    }

    const metricNum = Number(newMetricValue);
    if (isNaN(metricNum) || metricNum < 0 || metricNum > 100) {
      return res.status(400).json({ message: 'newMetricValue must be a number between 0 and 100' });
    }

    // Validate notes length (DoS mitigation)
    if (notes && notes.length > 1000) {
      return res.status(400).json({ message: 'Notes must not exceed 1000 characters' });
    }

    // Validate evidence URL structure if provided
    if (evidenceUrl) {
      if (!evidenceUrl.startsWith('/uploads/')) {
        try {
          new URL(evidenceUrl);
        } catch (err) {
          return res.status(400).json({ message: 'Evidence URL must be a valid absolute URL or a local upload path' });
        }
      }
    }

    // Sanitize user inputs to protect against stored XSS
    const sanitizedNotes = sanitizeInput(notes);
    const sanitizedEvidenceUrl = sanitizeInput(evidenceUrl);

    // Concurrency Control Loop (Optimistic Locking)
    let retries = 3;
    let updatedKpi = null;
    const newSubmission = {
      assignee: assigneeEmail,
      progressValue: metricNum,
      notes: sanitizedNotes,
      evidenceUrl: sanitizedEvidenceUrl,
      evidenceUrls: evidenceUrls,
      status: SUBMISSION_STATUS.PENDING
    };

    while (retries > 0) {
      const kpi = await Kpi.findOne({ _id: kpiId, ...assignedTo(assigneeEmail) });
      if (!kpi) {
        return res.status(404).json({ message: 'KPI not found' });
      }
      if (kpi.status === 'Completed') {
        return res.status(400).json({ message: 'Cannot submit progress updates to an already completed and approved KPI.' });
      }

      // Calculate milestone auto-progression based on progress percentage thresholds
      const updatedMilestones = calculateMilestones(kpi.milestones, metricNum);

      // Perform atomic update with version checking to prevent lost updates
      updatedKpi = await Kpi.findOneAndUpdate(
        { _id: kpiId, __v: kpi.__v, ...assignedTo(assigneeEmail) },
        {
          $push: { submissions: newSubmission },
          $set: {
            achievementScore: metricNum,
            status: KPI_STATUS.UNDER_REVIEW,
            milestones: updatedMilestones
          },
          $inc: { __v: 1 } // Increment mongoose version key manually to signal update
        },
        { new: true, runValidators: true }
      );

      if (updatedKpi) {
        break; // Success!
      }

      retries--;
      if (retries === 0) {
        return res.status(409).json({
          message: 'Conflict: This KPI document is currently being updated. Please try again.'
        });
      }
      
      // Small backoff before retry (50ms)
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Log Activity (Fault-tolerant audit logging)
    try {
      const newActivity = new Activity({
        assignee: assigneeEmail,
        title: 'Progress updated',
        desc: `Submitted progress of ${metricNum}% for '${updatedKpi.title}'`,
        type: 'progress_update',
        dotColor: '#d69f4c', // Yellow warning dot for pending status
        kpiId: updatedKpi._id
      });
      await newActivity.save();
    } catch (actError) {
      // Log the failure to database logs but don't reject the whole client request
      console.error(`Failed to log activity record: ${actError.stack}`);
    }

    // Notify all managers that a new submission is awaiting review (fault-tolerant)
    try {
      const managers = await User.find({ role: 'manager' }).select('email');
      await createNotifications(
        managers.map((m) => m.email),
        {
          tag: 'KPI',
          category: 'action',
          title: 'New submission to review',
          description: `${assigneeEmail} submitted ${metricNum}% for '${updatedKpi.title}'`,
          link: '/manager/verification-inbox',
          kpiId: updatedKpi._id,
        }
      );
    } catch (notifyError) {
      console.error(`Failed to send submission notification: ${notifyError.message}`);
    }

    res.status(200).json({
      message: 'Progress update submitted successfully, pending review',
      kpi: updatedKpi
    });
  } catch (error) {
    console.error(`Error in submitProgress: ${error.stack}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Manager KPI CRUD

exports.getAllKpis = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);
    const skip = (page - 1) * limit;
    const filter = {};

    if (req.query.category) filter.category = req.query.category;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.assignee === 'unassigned') {
      filter.$and = [
        { $or: [{ assignee: '' }, { assignee: { $exists: false } }] },
        { $or: [{ assignees: { $size: 0 } }, { assignees: { $exists: false } }] }
      ];
    } else if (req.query.assignee) {
      Object.assign(filter, assignedTo(req.query.assignee));
    }

    const [kpis, total] = await Promise.all([
      Kpi.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Kpi.countDocuments(filter)
    ]);

    res.status(200).json({
      data: kpis,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error(`Error in getAllKpis: ${error.stack}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getKpiById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid KPI ID' });
    }
    const kpi = await Kpi.findById(req.params.id);
    if (!kpi) return res.status(404).json({ message: 'KPI not found' });
    res.status(200).json(kpi);
  } catch (error) {
    console.error(`Error in getKpiById: ${error.stack}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const buildTargetText = (targetValue, unit, direction) => {
  const symbols = {
    'Atleast (>=)': '>=',
    'Atmost (<=)': '<=',
    'Atleast (≥)': '≥',
    'Atmost (≤)': '≤',
    'Exact (=)': '='
  };
  const symbol = symbols[direction] || '';
  if (unit === 'RM') return `${symbol} RM ${Number(targetValue).toLocaleString()}`.trim();
  if (unit === '%') return `${symbol} ${targetValue}%`.trim();
  return `${symbol} ${targetValue}${unit ? ` ${unit}` : ''}`.trim();
};

const mapKpiPayload = (body, preserveStatus = false) => {
  const {
    title,
    category,
    targetValue,
    deadline,
    unit,
    direction,
    description,
    department,
    startDate,
    evidenceRequirements,
    staffInstructions,
    milestones,
    status,
    assignees
  } = body;

  const normalizedAssignees = Array.isArray(assignees)
    ? [...new Set(assignees.map((email) => sanitizeInput(email)).filter(Boolean))]
    : [];
  const evidence = evidenceRequirements || {};
  const payload = {
    title: sanitizeInput(title),
    category: sanitizeInput(category),
    description: sanitizeInput(description || ''),
    department: sanitizeInput(department || ''),
    targetValue: Number(targetValue),
    unit: sanitizeInput(unit || ''),
    direction: sanitizeInput(direction || ''),
    targetText: buildTargetText(targetValue, unit, direction),
    startDate: startDate || null,
    targetDate: deadline,
    evidenceRequirements: {
      pdf: Boolean(evidence.pdf),
      images: Boolean(evidence.images),
      spreadsheet: Boolean(evidence.spreadsheet)
    },
    // Keep flat evidence flags synchronized for existing staff pages.
    evidencePdf: Boolean(evidence.pdf),
    evidenceImages: Boolean(evidence.images),
    evidenceSpreadsheet: Boolean(evidence.spreadsheet),
    staffInstructions: sanitizeInput(staffInstructions || ''),
    milestones: (milestones || []).map((milestone) => ({
      title: sanitizeInput(milestone.label || milestone.title || ''),
      label: sanitizeInput(milestone.label || milestone.title || ''),
      percentage: milestone.percentage,
      status: milestone.status || MILESTONE_STATUS.PENDING
    })),
    assignees: normalizedAssignees,
    // Retain a primary assignee for legacy dashboard and activity records.
    assignee: normalizedAssignees[0] || ''
  };

  if (!preserveStatus || status) {
    payload.status = status || KPI_STATUS.NOT_STARTED;
  }
  return payload;
};

exports.createKpi = async (req, res) => {
  try {
    const { title, category, targetValue, deadline } = req.body;
    if (!title || !category || targetValue === undefined || !deadline) {
      return res.status(400).json({
        message: 'title, category, targetValue, and deadline are required'
      });
    }
    if (!Number.isFinite(Number(targetValue))) {
      return res.status(400).json({ message: 'targetValue must be a number' });
    }

    const saved = await Kpi.create(mapKpiPayload(req.body));
    res.status(201).json(saved);
  } catch (error) {
    console.error(`Error in createKpi: ${error.stack}`);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.updateKpi = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid KPI ID' });
    }
    if (!Number.isFinite(Number(req.body.targetValue))) {
      return res.status(400).json({ message: 'targetValue must be a number' });
    }

    const updated = await Kpi.findByIdAndUpdate(
      req.params.id,
      mapKpiPayload(req.body, true),
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'KPI not found' });
    res.status(200).json(updated);
  } catch (error) {
    console.error(`Error in updateKpi: ${error.stack}`);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.updateAssignees = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid KPI ID' });
    }
    if (!Array.isArray(req.body.assignees)) {
      return res.status(400).json({ message: 'assignees must be an array' });
    }

    const assignees = [...new Set(
      req.body.assignees.map((email) => sanitizeInput(email)).filter(Boolean)
    )];
    const updated = await Kpi.findByIdAndUpdate(
      req.params.id,
      { assignees, assignee: assignees[0] || '' },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'KPI not found' });
    res.status(200).json(updated);
  } catch (error) {
    console.error(`Error in updateAssignees: ${error.stack}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.notifyAssignees = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid KPI ID' });
    }
    const kpi = await Kpi.findById(req.params.id);
    if (!kpi) return res.status(404).json({ message: 'KPI not found' });

    const recipients = kpi.assignees?.length
      ? kpi.assignees
      : (kpi.assignee ? [kpi.assignee] : []);
    if (recipients.length === 0) {
      return res.status(400).json({ message: 'No assignees to notify' });
    }

    const deadline = kpi.targetDate
      ? new Date(kpi.targetDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
      : 'No deadline';

    await createNotifications(recipients, {
      tag: 'KPI',
      category: 'action',
      title: `You have been assigned: ${kpi.title}`,
      description: `Deadline: ${deadline}`,
      link: '/staff/my-kpis',
      kpiId: kpi._id
    });

    res.status(200).json({ message: `Notified ${recipients.length} assignee(s)` });
  } catch (error) {
    console.error(`Error in notifyAssignees: ${error.stack}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * @desc    Get manager dashboard stats
 * @route   GET /api/kpi/manager/dashboard
 * @access  Protected (Manager only)
 */
exports.getManagerDashboardData = async (req, res) => {
  try {
    // Get all KPIs (no assignee filter - manager sees everything)
    const allKpis = await Kpi.find({});
    const User = require('../models/User');
    
    // Fetch all staff users for team progress
    const staffUsers = await User.find({ role: 'staff', isActive: true });
    
    let totalScore = 0;
    let completedCount = 0;
    let pendingReviewCount = 0;
    let overdueCount = 0;
    let uniqueAssignees = new Set();
    
    for (const kpi of allKpis) {
      totalScore += kpi.achievementScore || 0;
      
      if (kpi.status === 'Completed') {
        completedCount++;
      }
      
      const assignedEmails = kpi.assignees?.length
        ? kpi.assignees
        : (kpi.assignee ? [kpi.assignee] : []);
      assignedEmails.forEach((email) => uniqueAssignees.add(email));
      
      if (kpi.submissions && kpi.submissions.length > 0) {
        const pendingSubmissions = kpi.submissions.filter(sub => sub.status === 'Pending');
        pendingReviewCount += pendingSubmissions.length;
        
        const now = new Date();
        for (const sub of pendingSubmissions) {
          if (sub.createdAt) {
            const hoursSince = (now - new Date(sub.createdAt)) / (1000 * 60 * 60);
            if (hoursSince > 48) {
              overdueCount++;
            }
          }
        }
      }
    }
    
    const avgProgress = allKpis.length > 0 ? Math.round(totalScore / allKpis.length) : 0;
    
    // Build team progress overview dynamically
    const teamProgress = [];
    for (const user of staffUsers) {
      const userKpis = allKpis.filter((kpi) => (
        kpi.assignee === user.email || kpi.assignees?.includes(user.email)
      ));
      let avgScore = 0;
      if (userKpis.length > 0) {
        const total = userKpis.reduce((sum, k) => sum + (k.achievementScore || 0), 0);
        avgScore = Math.round(total / userKpis.length);
      }
      teamProgress.push({
        name: `${user.firstName} ${user.lastName}`,
        initials: `${user.firstName[0]}${user.lastName[0]}`.toUpperCase(),
        role: user.roleAtShop || user.positionTitle || 'Staff',
        progress: avgScore,
        kpiCount: userKpis.length
      });
    }

    // Fetch recent activity feed
    const activities = await Activity.find({}).sort({ createdAt: -1 }).limit(10);
    const recentActivity = activities.map(act => ({
      id: act._id,
      title: act.title,
      desc: act.desc,
      time: getRelativeTime(act.createdAt),
      dotColor: act.dotColor || '#1b6a38'
    }));
    
    const stats = {
      overallProgress: { value: avgProgress, change: "+12%" },
      kpisAssigned: { value: allKpis.length, change: `+${allKpis.length}` },
      completed: { value: completedCount, change: `+${completedCount}` },
      pendingReview: { value: pendingReviewCount, change: `${pendingReviewCount} new` },
      overdue: { value: overdueCount, change: `+${overdueCount}` },
      teamProgress,
      recentActivity
    };
    
    res.status(200).json(stats);
    
  } catch (error) {
    console.error('Error in getManagerDashboardData:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @desc    Approve a staff KPI submission
 * @route   PATCH /api/kpi/approve
 * @access  Protected (Manager only)
 */
exports.approveSubmission = async (req, res) => {
  try {
    const { kpiId, submissionId } = req.body;

    const kpi = await Kpi.findById(kpiId);
    if (!kpi) {
      return res.status(404).json({ message: 'KPI not found' });
    }

    const submission = kpi.submissions.id(submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission record not found' });
    }

    if (submission.status === 'Approved') {
      return res.status(400).json({ message: 'Submission is already approved' });
    }

    submission.status = 'Approved';

    const approvedScore = submission.newMetricValue || submission.progressValue || 0;
    kpi.achievementScore = approvedScore;

    if (approvedScore === 100) {
      kpi.status = 'Completed';
    }

    await kpi.save();

    res.status(200).json({
      message: 'Submission approved successfully. KPI scores updated.',
      kpi
    });
  } catch (error) {
    console.error('Error in approveSubmission:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @desc    Delete a KPI by ID
 * @route   DELETE /api/kpi/:id
 * @access  Protected (Manager only)
 */
exports.deleteKpi = async (req, res) => {
  try {
    const kpi = await Kpi.findByIdAndDelete(req.params.id);
    if (!kpi) return res.status(404).json({ message: "KPI not found" });
    res.status(200).json({ message: "KPI deleted successfully" });
  } catch (error) {
    console.error('Error in deleteKpi:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all submission records across all KPIs
 * @route   GET /api/kpi/manager/submissions
 * @access  Protected (Manager only)
 */
exports.getSubmissions = async (req, res) => {
  try {
    const kpis = await Kpi.find({});
    const User = require('../models/User');
    const users = await User.find({ role: 'staff' });
    const userMap = {};
    users.forEach(u => {
      userMap[u.email] = u;
    });

    let submissions = [];
    for (const kpi of kpis) {
      if (kpi.submissions && kpi.submissions.length > 0) {
        for (const sub of kpi.submissions) {
          const submissionAssignee = getPrimaryAssignee(kpi, sub);
          const staffUser = userMap[submissionAssignee];
          
          let oldProgress = 0;
          const approvedSubs = kpi.submissions.filter(s => s.status === 'Approved' && s.createdAt < sub.createdAt);
          if (approvedSubs.length > 0) {
            approvedSubs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            oldProgress = approvedSubs[0].progressValue;
          }

          submissions.push({
            id: sub._id,
            kpiId: kpi._id,
            kpiTitle: kpi.title,
            assignee: submissionAssignee,
            staffName: staffUser ? `${staffUser.firstName} ${staffUser.lastName}` : submissionAssignee,
            staffRole: staffUser ? staffUser.roleAtShop || staffUser.positionTitle || 'Staff' : 'Staff',
            staffInitials: staffUser ? `${staffUser.firstName[0]}${staffUser.lastName[0]}`.toUpperCase() : 'ST',
            progressValue: sub.progressValue,
            oldProgress: oldProgress,
            notes: sub.notes,
            evidenceUrl: sub.evidenceUrl,
            evidenceUrls: sub.evidenceUrls || [],
            status: sub.status,
            createdAt: sub.createdAt,
            updatedAt: sub.updatedAt
          });
        }
      }
    }

    submissions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json(submissions);
  } catch (error) {
    console.error('Error in getSubmissions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @desc    Get detailed info of a single submission
 * @route   GET /api/kpi/manager/submissions/:id
 * @access  Protected (Manager only)
 */
exports.getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const kpi = await Kpi.findOne({ "submissions._id": id });
    if (!kpi) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const sub = kpi.submissions.id(id);
    if (!sub) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    const User = require('../models/User');
    const submissionAssignee = getPrimaryAssignee(kpi, sub);
    const staffUser = await User.findOne({ email: submissionAssignee });

    // Calculate previous progress score before this submission
    let oldProgress = 0;
    const approvedSubs = kpi.submissions.filter(s => s.status === 'Approved' && s.createdAt < sub.createdAt);
    if (approvedSubs.length > 0) {
      approvedSubs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      oldProgress = approvedSubs[0].progressValue;
    }

    res.status(200).json({
      id: sub._id,
      kpiId: kpi._id,
      kpiTitle: kpi.title,
      kpiDescription: kpi.description || kpi.targetText || '',
      assignee: submissionAssignee,
      staff: {
        name: staffUser ? `${staffUser.firstName} ${staffUser.lastName}` : submissionAssignee,
        role: staffUser ? staffUser.roleAtShop || staffUser.positionTitle || 'Staff' : 'Staff',
        initials: staffUser ? `${staffUser.firstName[0]}${staffUser.lastName[0]}`.toUpperCase() : 'ST',
        photoUrl: staffUser ? staffUser.photoUrl : ''
      },
      progress: {
        old: oldProgress,
        new: sub.progressValue
      },
      note: sub.notes,
      evidenceUrl: sub.evidenceUrl,
      evidenceUrls: sub.evidenceUrls || [],
      status: sub.status,
      createdAt: sub.createdAt
    });
  } catch (error) {
    console.error('Error in getSubmissionById:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @desc    Submit submission decision (approve/reject/revision requested)
 * @route   PATCH /api/kpi/manager/submissions/:id/decision
 * @access  Protected (Manager only)
 */
exports.handleSubmissionDecision = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    if (!['Approved', 'Rejected', 'Revision requested'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status decision' });
    }

    const kpi = await Kpi.findOne({ "submissions._id": id });
    if (!kpi) {
      return res.status(404).json({ message: 'KPI submission not found' });
    }

    const submission = kpi.submissions.id(id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    submission.status = status;
    submission.feedback = comment || '';
    kpi.markModified('submissions');

    if (status === 'Approved') {
      const approvedScore = submission.progressValue || 0;
      kpi.achievementScore = approvedScore;
      kpi.milestones = calculateMilestones(kpi.milestones, approvedScore);
      if (approvedScore === 100) {
        kpi.status = 'Completed';
      } else {
        kpi.status = 'In Progress';
      }
    } else {
      kpi.status = 'In Progress';
    }

    await kpi.save();

    // Log Activity
    try {
      const Activity = require('../models/Activity');
      const newActivity = new Activity({
        assignee: getPrimaryAssignee(kpi, submission),
        title: `Submission ${status.toLowerCase()}`,
        desc: `Submission for '${kpi.title}' has been ${status.toLowerCase()}.${comment ? ` Reason/Note: ${comment}` : ''}`,
        type: status === 'Approved' ? 'evidence_approved' : status === 'Rejected' ? 'progress_update' : 'revision_requested',
        dotColor: status === 'Approved' ? '#1b6a38' : '#c73a24',
        kpiId: kpi._id
      });
      await newActivity.save();
    } catch (actError) {
      console.error(`Failed to log activity record: ${actError.stack}`);
    }

    res.status(200).json({
      message: `Submission ${status.toLowerCase()} successfully`,
      kpi
    });
  } catch (error) {
    console.error('Error in handleSubmissionDecision:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
