const User = require('../models/User');
const Kpi = require('../models/Kpi');
const Activity = require('../models/Activity');
const { SUBMISSION_STATUS, KPI_STATUS, MILESTONE_STATUS } = require('../config/constants');

// Helper to determine avatar styling colors based on staff initials
const getAvatarColors = (initials) => {
  const bgColors = ['#fce8e6', '#e2efe9', '#e6f4ea', '#fef2e4', '#e8f0ed', '#e6ebf1'];
  const textColors = ['#c73a24', '#183628', '#1b6a38', '#a87022', '#0b2019', '#597495'];
  
  let hash = 0;
  for (let i = 0; i < initials.length; i++) {
    hash = initials.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % bgColors.length;
  return { bg: bgColors[idx], text: textColors[idx] };
};

// Helper to deduce file format type from URL extension
const getFileType = (url) => {
  if (!url) return 'FILE';
  const ext = url.split('.').pop().toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'IMG';
  if (ext === 'pdf') return 'PDF';
  if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) return 'VID';
  return 'FILE';
};

// Helper to format relative time strings (e.g. "2h ago", "Yesterday")
const formatRelativeTime = (date) => {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMin = Math.round(diffMs / 60000);
  const diffHr = Math.round(diffMs / 3600000);
  const diffDay = Math.round(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return 'Yesterday';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Helper for status text display color mapping
const getStatusColor = (status) => {
  switch (status) {
    case 'Approved': return '#0D3B2E';
    case 'Rejected': return '#B23B3B';
    case 'Revision Requested':
    case 'Revision requested': return '#B8862D';
    case 'Pending':
    default: return '#B23B3B';
  }
};

// Helper for status background display color mapping
const getStatusBg = (status) => {
  switch (status) {
    case 'Approved': return '#E4EDE7';
    case 'Rejected': return '#F4DAD8';
    case 'Revision Requested':
    case 'Revision requested': return '#F4E8CA';
    case 'Pending':
    default: return '#F4DAD8';
  }
};

/**
 * @desc    Get all KPI submissions across the entire team for manager review
 * @route   GET /api/kpis/submissions
 * @access  Protected (Manager only)
 */
exports.getSubmissions = async (req, res) => {
  try {
    const statusFilter = req.query.status;

    // Fetch all users to construct an in-memory email lookup map (prevents N+1 query overhead)
    const users = await User.find();
    const userMap = {};
    users.forEach(u => {
      userMap[u.email.toLowerCase()] = u;
    });

    // Fetch all KPI documents from MongoDB
    const kpis = await Kpi.find();
    const allSubmissions = [];

    kpis.forEach(kpi => {
      const assigneeEmails = Array.isArray(kpi.assignees) && kpi.assignees.length > 0
        ? kpi.assignees
        : (kpi.assignee ? [kpi.assignee] : []);
      const assigneeEmail = (assigneeEmails[0] || '').toLowerCase();
      const staffUser = userMap[assigneeEmail] || null;

      // Sort submissions by creation date ascending to correctly trace progress history
      const sortedSubs = [...kpi.submissions].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      sortedSubs.forEach((sub, index) => {
        // Calculate progress.old: the progressValue of the latest approved submission before this one, or 0 if none
        let oldProgress = 0;
        for (let i = index - 1; i >= 0; i--) {
          if (sortedSubs[i].status === 'Approved') {
            oldProgress = sortedSubs[i].progressValue;
            break;
          }
        }

        // Calculate dynamic SLA status
        let slaStatus = 'Within SLA';
        let slaColor = '#0D3B2E';
        let slaBg = '#E4EDE7';

        if (sub.status === 'Pending') {
          const hoursPending = (new Date() - new Date(sub.createdAt)) / 3600000;
          if (hoursPending > 48) {
            slaStatus = 'Overdue';
            slaColor = '#B23B3B';
            slaBg = '#F4DAD8';
          } else if (hoursPending > 24) {
            slaStatus = 'Due today';
            slaColor = '#B8862D';
            slaBg = '#F4E8CA';
          }
        }

        // Format staff details
        const firstName = staffUser ? staffUser.firstName : 'Unknown';
        const lastName = staffUser ? staffUser.lastName : 'User';
        const initials = staffUser 
          ? (staffUser.firstName[0] + staffUser.lastName[0]).toUpperCase() 
          : 'UN';
        
        const colors = getAvatarColors(initials);

        allSubmissions.push({
          id: sub._id,
          kpiId: kpi._id,
          kpi: kpi.title,
          category: kpi.category,
          progress: { old: oldProgress, new: sub.progressValue },
          notes: sub.notes,
          evidence: sub.evidenceUrl ? [getFileType(sub.evidenceUrl)] : [],
          evidenceUrl: sub.evidenceUrl || null,
          submitted: {
            time: formatRelativeTime(sub.createdAt),
            date: new Date(sub.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          },
          status: {
            text: sub.status === 'Revision Requested' ? 'Revision requested' : sub.status,
            color: getStatusColor(sub.status),
            bg: getStatusBg(sub.status)
          },
          slaStatus: {
            text: slaStatus,
            color: slaColor,
            bg: slaBg
          },
          staff: {
            name: `${firstName} ${lastName}`,
            email: assigneeEmails.join(', '),
            initials,
            bgColor: colors.bg,
            textColor: colors.text,
            role: staffUser ? staffUser.roleAtShop || staffUser.positionTitle : 'Staff',
            photoUrl: staffUser ? staffUser.photoUrl : ''
          },
          createdAt: sub.createdAt
        });
      });
    });

    // Filter list based on filter requested by the frontend
    let filteredSubmissions = allSubmissions;
    if (statusFilter && statusFilter !== 'All') {
      if (statusFilter === 'Pending') {
        filteredSubmissions = allSubmissions.filter(s => s.status.text === 'Pending');
      } else if (statusFilter === 'Approved') {
        filteredSubmissions = allSubmissions.filter(s => s.status.text === 'Approved');
      } else if (statusFilter === 'Revision requested') {
        filteredSubmissions = allSubmissions.filter(s => s.status.text === 'Revision requested' || s.status.text === 'Revision Requested');
      } else if (statusFilter === 'Rejected') {
        filteredSubmissions = allSubmissions.filter(s => s.status.text === 'Rejected');
      }
    }

    // Sort by submission date descending (newest first)
    filteredSubmissions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Calculate total counts for filter tabs
    const counts = {
      Pending: allSubmissions.filter(s => s.status.text === 'Pending').length,
      Approved: allSubmissions.filter(s => s.status.text === 'Approved').length,
      RevisionRequested: allSubmissions.filter(s => s.status.text === 'Revision requested' || s.status.text === 'Revision Requested').length,
      Rejected: allSubmissions.filter(s => s.status.text === 'Rejected').length,
      All: allSubmissions.length
    };

    res.status(200).json({
      submissions: filteredSubmissions,
      counts
    });
  } catch (error) {
    console.error('Error in getSubmissions:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * @desc    Get detailed view of a single submission by its nested subdocument ID
 * @route   GET /api/kpis/submissions/:id
 * @access  Protected (Manager only)
 */
exports.getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the parent KPI document that contains the requested submission
    const kpi = await Kpi.findOne({ "submissions._id": id });
    if (!kpi) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const submission = kpi.submissions.id(id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Lookup assignee User profile details
    const primaryEmail = (Array.isArray(kpi.assignees) && kpi.assignees.length > 0)
      ? kpi.assignees[0]
      : (kpi.assignee || null);
    const staffUser = primaryEmail ? await User.findOne({ email: primaryEmail }) : null;

    // Calculate progress.old: the progressValue of the latest approved submission before this one, or 0 if none
    const sortedSubs = [...kpi.submissions].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const subIndex = sortedSubs.findIndex(s => s._id.toString() === id);

    let oldProgress = 0;
    for (let i = subIndex - 1; i >= 0; i--) {
      if (sortedSubs[i].status === 'Approved') {
        oldProgress = sortedSubs[i].progressValue;
        break;
      }
    }

    // Determine staff profile layout styles
    const firstName = staffUser ? staffUser.firstName : 'Unknown';
    const lastName = staffUser ? staffUser.lastName : 'User';
    const initials = staffUser 
      ? (staffUser.firstName[0] + staffUser.lastName[0]).toUpperCase() 
      : 'UN';
    const colors = getAvatarColors(initials);

    // Calculate queue mapping traversal indices (for previous / next chevrons)
    const allPendingKpis = await Kpi.find({ "submissions.status": "Pending" });
    const allPendingSubmissions = [];
    
    for (const pk of allPendingKpis) {
      pk.submissions.forEach(ps => {
        if (ps.status === 'Pending') {
          allPendingSubmissions.push({
            id: ps._id.toString(),
            createdAt: ps.createdAt
          });
        }
      });
    }
    
    allPendingSubmissions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const queueIndex = allPendingSubmissions.findIndex(q => q.id === id);

    // Format uploads list structure
    const files = [];
    if (submission.evidenceUrl) {
      const fileName = submission.evidenceUrl.split('/').pop();
      const fileType = getFileType(submission.evidenceUrl);
      files.push({
        name: fileName,
        url: submission.evidenceUrl,
        type: fileType,
        size: '2.5 MB', // Mock size as Multer doesn't write sizes directly into the subdocument schema
        date: new Date(submission.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }

    res.status(200).json({
      id: submission._id,
      kpiId: kpi._id,
      kpi: kpi.title,
      progress: {
        old: oldProgress,
        new: submission.progressValue,
        points: `+${submission.progressValue - oldProgress} pts`
      },
      note: submission.notes || '',
      files,
      status: submission.status,
      managerComment: submission.managerComment || '',
      submittedAt: submission.createdAt,
      staff: {
        name: `${firstName} ${lastName}`,
        initials,
        bgColor: colors.bg,
        textColor: colors.text,
        role: staffUser ? staffUser.roleAtShop || staffUser.positionTitle : 'Staff',
        time: formatRelativeTime(submission.createdAt)
      },
      queue: {
        index: queueIndex !== -1 ? queueIndex + 1 : 1,
        total: allPendingSubmissions.length > 0 ? allPendingSubmissions.length : 1,
        previousId: queueIndex > 0 ? allPendingSubmissions[queueIndex - 1].id : null,
        nextId: queueIndex < allPendingSubmissions.length - 1 && queueIndex !== -1 ? allPendingSubmissions[queueIndex + 1].id : null
      }
    });

  } catch (error) {
    console.error('Error in getSubmissionById:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * @desc    Submit a manager decision (Approve, Request Revision, Reject) on a progress update
 * @route   POST /api/kpis/submissions/:id/review
 * @access  Protected (Manager only)
 */
exports.reviewSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, comment } = req.body;

    if (!['approve', 'revision', 'reject'].includes(decision)) {
      return res.status(400).json({ message: 'Invalid decision type. Must be approve, revision, or reject.' });
    }

    // 1. Locate parent KPI matching subdocument ID
    const kpi = await Kpi.findOne({ "submissions._id": id });
    if (!kpi) {
      return res.status(404).json({ message: 'KPI submission not found' });
    }

    const submission = kpi.submissions.id(id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // 2. Set review status and audit constants
    let activityTitle = '';
    let activityDesc = '';
    let activityType = '';
    let activityColor = '';

    if (decision === 'approve') {
      submission.status = 'Approved';
      activityTitle = 'Progress approved';
      activityDesc = `Approved progress of ${submission.progressValue}% for '${kpi.title}'`;
      activityType = 'evidence_approved';
      activityColor = '#1b6a38';
    } else if (decision === 'revision') {
      submission.status = 'Revision Requested';
      activityTitle = 'Revision requested';
      activityDesc = `Requested revision for progress update of ${submission.progressValue}% on '${kpi.title}'`;
      activityType = 'revision_requested';
      activityColor = '#d69f4c';
    } else {
      submission.status = 'Rejected';
      activityTitle = 'Progress rejected';
      activityDesc = `Rejected progress update of ${submission.progressValue}% for '${kpi.title}'`;
      activityType = 'progress_update';
      activityColor = '#c73a24';
    }
    
    submission.managerComment = comment || '';

    // 3. Recalculate achievement score and milestones
    // Find all sorted submissions (by date ascending)
    const sortedSubs = [...kpi.submissions].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    // Find the latest approved progress value
    let latestApprovedProgress = 0;
    for (let i = sortedSubs.length - 1; i >= 0; i--) {
      if (sortedSubs[i].status === 'Approved') {
        latestApprovedProgress = sortedSubs[i].progressValue;
        break;
      }
    }

    // The current KPI achievement score is updated to match the latest approved progress value
    kpi.achievementScore = latestApprovedProgress;

    // Re-evaluate milestone completion statuses based on the new achievement score
    if (kpi.milestones && kpi.milestones.length > 0) {
      const milestoneCount = kpi.milestones.length;
      const completedCount = Math.floor((latestApprovedProgress / 100) * milestoneCount);

      kpi.milestones = kpi.milestones.map((milestone, idx) => {
        let status = MILESTONE_STATUS.PENDING;
        if (idx < completedCount) {
          status = MILESTONE_STATUS.COMPLETED;
        } else if (idx === completedCount && latestApprovedProgress < 100) {
          status = MILESTONE_STATUS.IN_PROGRESS;
        }
        return {
          _id: milestone._id,
          title: milestone.title,
          status
        };
      });
    }

    // Update main KPI status based on pending requests and updated score
    const hasPendingSubmissions = kpi.submissions.some(s => s.status === 'Pending');
    if (hasPendingSubmissions) {
      kpi.status = KPI_STATUS.UNDER_REVIEW;
    } else {
      if (latestApprovedProgress === 100) {
        kpi.status = KPI_STATUS.COMPLETED;
      } else if (latestApprovedProgress > 0) {
        kpi.status = KPI_STATUS.IN_PROGRESS;
      } else {
        kpi.status = KPI_STATUS.NOT_STARTED;
      }
    }

    await kpi.save();

    // 4. Record audit entry in Activity collection
    try {
      const newActivity = new Activity({
        assignee: (Array.isArray(kpi.assignees) && kpi.assignees.length > 0)
          ? kpi.assignees[0]
          : (kpi.assignee || 'unknown'),
        title: activityTitle,
        desc: activityDesc,
        type: activityType,
        dotColor: activityColor,
        kpiId: kpi._id
      });
      await newActivity.save();
    } catch (actError) {
      console.error(`Failed to log activity record during review: ${actError.stack}`);
    }

    res.status(200).json({
      message: `Submission successfully ${decision}d`,
      kpi
    });

  } catch (error) {
    console.error('Error in reviewSubmission:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
