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
 * @desc    Get dashboard aggregate stats and active KPIs for the logged-in staff
 * @route   GET /api/kpi/dashboard or /api/kpis/dashboard
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
      { $match: { assignees: assigneeEmail } },
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
      assignees: assigneeEmail,
      status: { $ne: KPI_STATUS.COMPLETED }
    }).sort({ targetDate: 1 }).limit(10);

    const activeKpis = activeKpiDocs.map(kpi => {
      const colors = CATEGORY_COLORS[kpi.category] || DEFAULT_COLORS;
      
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
        progColor: colors.progColor
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
 * @route   GET /api/kpi/assigned or /api/kpis/assigned
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
      Kpi.find({ assignees: assigneeEmail })
        .sort({ targetDate: 1 })
        .skip(skip)
        .limit(limit),
      Kpi.countDocuments({ assignees: assigneeEmail })
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

      if (kpi.status === KPI_STATUS.UNDER_REVIEW) {
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
 * @route   POST /api/kpi/progress or /api/kpis/progress
 * @access  Protected (Staff only)
 */
exports.submitProgress = async (req, res) => {
  try {
    if (!req.user || !req.user.email) {
      return res.status(401).json({ message: 'Unauthorized: User context missing' });
    }

    let { kpiId, newMetricValue, notes } = req.body;
    let evidenceUrl = req.body.evidenceUrl || '';
    const assigneeEmail = req.user.email;

    // If a file was uploaded, store ONLY the relative path
    if (req.file) {
      evidenceUrl = `/uploads/${req.file.filename}`;
    }

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
      progressValue: metricNum,
      notes: sanitizedNotes,
      evidenceUrl: sanitizedEvidenceUrl,
      status: SUBMISSION_STATUS.PENDING
    };

    while (retries > 0) {
      const kpi = await Kpi.findOne({ _id: kpiId, assignees: assigneeEmail });
      if (!kpi) {
        return res.status(404).json({ message: 'KPI not found' });
      }

      // Calculate milestone auto-progression based on progress percentage
      let updatedMilestones = [...kpi.milestones];
      if (kpi.milestones && kpi.milestones.length > 0) {
        const milestoneCount = kpi.milestones.length;
        const completedCount = Math.floor((metricNum / 100) * milestoneCount);

        updatedMilestones = kpi.milestones.map((milestone, idx) => {
          let status = MILESTONE_STATUS.PENDING;
          if (idx < completedCount) {
            status = MILESTONE_STATUS.COMPLETED;
          } else if (idx === completedCount && metricNum < 100) {
            status = MILESTONE_STATUS.IN_PROGRESS;
          }
          return {
            _id: milestone._id,
            title: milestone.title,
            status
          };
        });
      }

      // Perform atomic update with version checking to prevent lost updates
      updatedKpi = await Kpi.findOneAndUpdate(
        { _id: kpiId, assignees: assigneeEmail, __v: kpi.__v },
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

// ── Manager KPI CRUD ─────────────────────────────────────────────────────────

/**
 * @desc    Get all KPIs with optional filters and pagination
 * @route   GET /api/kpi
 * @access  Protected (Manager only)
 */
exports.getAllKpis = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.assignee) {
      if (req.query.assignee === 'unassigned') {
        filter.assignees = { $size: 0 };
      } else {
        filter.assignees = req.query.assignee;
      }
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

/**
 * @desc    Get a single KPI by ID
 * @route   GET /api/kpi/:id
 * @access  Protected (Manager only)
 */
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

// Derive the display string from targetValue + unit + direction (e.g. "≥ RM 25,000")
const buildTargetText = (targetValue, unit, direction) => {
  const dirSymbols = { 'Atleast (≥)': '≥', 'Atmost (≤)': '≤', 'Exact (=)': '=' };
  const sym = dirSymbols[direction] || '';
  if (unit === 'RM') return `${sym} RM ${Number(targetValue).toLocaleString()}`.trim();
  if (unit === '%') return `${sym} ${targetValue}%`.trim();
  return `${sym} ${targetValue}${unit ? ' ' + unit : ''}`.trim();
};

/**
 * @desc    Create a new KPI
 * @route   POST /api/kpi
 * @access  Protected (Manager only)
 */
exports.createKpi = async (req, res) => {
  try {
    const {
      title, category, targetValue, deadline,
      unit, direction, description, department,
      startDate, evidenceRequirements, staffInstructions,
      milestones, status, assignees
    } = req.body;

    if (!title || !category || targetValue === undefined || !deadline) {
      return res.status(400).json({ message: 'title, category, targetValue, and deadline are required' });
    }

    const mappedMilestones = (milestones || []).map(m => ({
      title: sanitizeInput(m.label || m.title || ''),
      percentage: m.percentage,
      status: MILESTONE_STATUS.PENDING
    }));

    const kpi = new Kpi({
      title: sanitizeInput(title),
      category: sanitizeInput(category),
      description: sanitizeInput(description || ''),
      department: sanitizeInput(department || ''),
      targetValue: Number(targetValue),
      unit,
      direction,
      targetText: buildTargetText(targetValue, unit, direction),
      startDate: startDate || null,
      targetDate: deadline,
      evidenceRequirements: evidenceRequirements || { pdf: false, images: false, spreadsheet: false },
      staffInstructions: sanitizeInput(staffInstructions || ''),
      milestones: mappedMilestones,
      weightage: 100,
      status: status || KPI_STATUS.NOT_STARTED,
      assignees: Array.isArray(assignees) ? assignees : []
    });

    const saved = await kpi.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error(`Error in createKpi: ${error.stack}`);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * @desc    Update an existing KPI
 * @route   PUT /api/kpi/:id
 * @access  Protected (Manager only)
 */
exports.updateKpi = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid KPI ID' });
    }

    const {
      title, category, targetValue, deadline,
      unit, direction, description, department,
      startDate, evidenceRequirements, staffInstructions,
      milestones, status, assignees
    } = req.body;

    // preserve existing milestone statuses so an update doesn't reset staff progress
    const mappedMilestones = (milestones || []).map(m => ({
      title: sanitizeInput(m.label || m.title || ''),
      percentage: m.percentage,
      status: m.status || MILESTONE_STATUS.PENDING
    }));

    const updates = {
      title: sanitizeInput(title),
      category: sanitizeInput(category),
      description: sanitizeInput(description || ''),
      department: sanitizeInput(department || ''),
      targetValue: Number(targetValue),
      unit,
      direction,
      targetText: buildTargetText(targetValue, unit, direction),
      startDate: startDate || null,
      targetDate: deadline,
      evidenceRequirements: evidenceRequirements || { pdf: false, images: false, spreadsheet: false },
      staffInstructions: sanitizeInput(staffInstructions || ''),
      milestones: mappedMilestones,
      assignees: Array.isArray(assignees) ? assignees : []
    };
    if (status) updates.status = status;

    const updated = await Kpi.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
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

/**
 * @desc    Delete a KPI by ID
 * @route   DELETE /api/kpi/:id
 * @access  Protected (Manager only)
 */
exports.deleteKpi = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid KPI ID' });
    }
    const deleted = await Kpi.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'KPI not found' });
    res.status(200).json({ message: 'KPI deleted successfully', kpi: deleted });
  } catch (error) {
    console.error(`Error in deleteKpi: ${error.stack}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * @desc    Update only the assignees array for a KPI
 * @route   PATCH /api/kpi/:id/assignees
 * @access  Protected (Manager only)
 */
exports.updateAssignees = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid KPI ID' });
    }
    const { assignees } = req.body;
    if (!Array.isArray(assignees)) {
      return res.status(400).json({ message: 'assignees must be an array' });
    }
    const updated = await Kpi.findByIdAndUpdate(
      req.params.id,
      { assignees },
      { new: true, runValidators: false }
    );
    if (!updated) return res.status(404).json({ message: 'KPI not found' });
    res.status(200).json(updated);
  } catch (error) {
    console.error(`Error in updateAssignees: ${error.stack}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * @desc    Send in-app notifications to all current assignees of a KPI
 * @route   POST /api/kpi/:id/notify-assignees
 * @access  Protected (Manager only)
 */
exports.notifyAssignees = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid KPI ID' });
    }
    const kpi = await Kpi.findById(req.params.id);
    if (!kpi) return res.status(404).json({ message: 'KPI not found' });

    const recipients = kpi.assignees || [];
    if (recipients.length === 0) {
      return res.status(400).json({ message: 'No assignees to notify' });
    }

    const deadlineStr = kpi.targetDate
      ? new Date(kpi.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'No deadline';

    await createNotifications(recipients, {
      tag: 'KPI',
      category: 'action',
      title: `You have been assigned: ${kpi.title}`,
      description: `Deadline: ${deadlineStr}`,
      link: '/staff/my-kpis',
      kpiId: kpi._id,
    });

    res.status(200).json({ message: `Notified ${recipients.length} assignee(s)` });
  } catch (error) {
    console.error(`Error in notifyAssignees: ${error.stack}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
