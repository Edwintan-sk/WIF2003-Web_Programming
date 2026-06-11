const Kpi = require('../models/Kpi');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { KPI_STATUS } = require('../config/constants');
const { getRelativeTime } = require('../utils/time');

const STATUS_COLORS = {
  'Not Started': '#9aa6a0',
  'In Progress': '#597495',
  'Under Review': '#d69f4c',
  Completed: '#1b6a38',
};

const initialsOf = (name) =>
  (name || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'U';

/**
 * @desc    Team-wide dashboard aggregates for managers: headline stats,
 *          status distribution (for the chart), per-staff progress, and a
 *          recent activity feed across the whole organisation.
 * @route   GET /api/manager/dashboard
 * @access  Protected (Manager only)
 */
exports.getManagerDashboard = async (req, res) => {
  try {
    const kpis = await Kpi.find();
    const now = new Date();

    let completed = 0;
    let underReview = 0;
    let overdue = 0;
    let scoreSum = 0;

    const statusDist = {
      'Not Started': 0,
      'In Progress': 0,
      'Under Review': 0,
      Completed: 0,
    };
    const perStaff = {}; // email -> { total, scoreSum }

    kpis.forEach((kpi) => {
      scoreSum += kpi.achievementScore || 0;

      if (kpi.status === KPI_STATUS.COMPLETED) completed += 1;
      if (kpi.status === KPI_STATUS.UNDER_REVIEW) underReview += 1;

      const isOverdue =
        kpi.targetDate &&
        new Date(kpi.targetDate) < now &&
        kpi.status !== KPI_STATUS.COMPLETED;
      if (isOverdue) overdue += 1;

      if (statusDist[kpi.status] !== undefined) statusDist[kpi.status] += 1;
      else statusDist[kpi.status] = 1;

      const emailList = (Array.isArray(kpi.assignees) && kpi.assignees.length > 0)
        ? kpi.assignees
        : (kpi.assignee ? [kpi.assignee] : ['unassigned']);
      emailList.forEach((email) => {
        if (!perStaff[email]) perStaff[email] = { total: 0, scoreSum: 0 };
        perStaff[email].total += 1;
        perStaff[email].scoreSum += kpi.achievementScore || 0;
      });
    });

    const totalKpis = kpis.length;
    const overallProgress = totalKpis ? Math.round(scoreSum / totalKpis) : 0;

    // Resolve assignee emails to display names.
    const emails = Object.keys(perStaff).filter((e) => e !== 'unassigned');
    const users = emails.length
      ? await User.find({ email: { $in: emails } }).select(
          'email firstName lastName englishName'
        )
      : [];
    const userByEmail = {};
    users.forEach((u) => {
      userByEmail[u.email] = u;
    });

    const teamProgress = Object.entries(perStaff)
      .map(([email, v]) => {
        const u = userByEmail[email];
        const name = u
          ? u.englishName || `${u.firstName} ${u.lastName}`.trim()
          : email;
        return {
          email,
          name,
          initials: initialsOf(name),
          kpiCount: v.total,
          progress: v.total ? Math.round(v.scoreSum / v.total) : 0,
        };
      })
      .sort((a, b) => b.progress - a.progress);

    const statusDistribution = Object.entries(statusDist)
      .filter(([, value]) => value > 0)
      .map(([label, value]) => ({
        label,
        value,
        color: STATUS_COLORS[label] || '#9aa6a0',
      }));

    const activities = await Activity.find().sort({ createdAt: -1 }).limit(6);
    const recentActivity = activities.map((a) => ({
      id: a._id,
      dotColor: a.dotColor,
      title: a.title,
      desc: a.desc,
      time: getRelativeTime(a.createdAt),
    }));

    const stats = [
      { label: 'OVERALL PROGRESS', value: String(overallProgress), percentage: true, color: '#0B2019' },
      { label: 'KPIS ASSIGNED', value: String(totalKpis), color: '#E85D3F' },
      { label: 'COMPLETED', value: String(completed), color: '#28a745' },
      { label: 'PENDING REVIEW', value: String(underReview), color: '#ffc107' },
      { label: 'OVERDUE', value: String(overdue), color: '#dc3545' },
    ];

    res.status(200).json({
      stats,
      overallProgress,
      totalKpis,
      statusDistribution,
      teamProgress,
      recentActivity,
    });
  } catch (error) {
    console.error(`Error in getManagerDashboard: ${error.stack}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
