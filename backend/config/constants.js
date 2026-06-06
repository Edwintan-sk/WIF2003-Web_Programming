/**
 * KPI Management System Constants
 */

const KPI_STATUS = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  UNDER_REVIEW: 'Under Review',
  COMPLETED: 'Completed'
};

const MILESTONE_STATUS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed'
};

const SUBMISSION_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected'
};

const CATEGORY_COLORS = {
  'Community': {
    catBg: '#e2efe9',
    catText: '#183628',
    progColor: '#183628',
    tag1Bg: '#e2efe9',
    tag1Text: '#183628',
    progressColor: '#183628',
    statusBg: '#e2efe9',
    statusText: '#183628',
    statusBorder: '#c0d6cb'
  },
  'Content': {
    catBg: '#fae3e0',
    catText: '#de5c44',
    progColor: '#de5c44',
    tag1Bg: '#fae3e0',
    tag1Text: '#de5c44',
    progressColor: '#de5c44',
    statusBg: '#fae3e0',
    statusText: '#de5c44',
    statusBorder: '#f0c3bc'
  },
  'Internal': {
    catBg: '#faebd7',
    catText: '#c99552',
    progColor: '#c99552',
    tag1Bg: '#faebd7',
    tag1Text: '#c99552',
    progressColor: '#c99552',
    statusBg: '#faebd7',
    statusText: '#c99552',
    statusBorder: '#e8d2b7'
  },
  'Partnerships': {
    catBg: '#e6f4ea',
    catText: '#1b6a38',
    progColor: '#1b6a38',
    tag1Bg: '#e6f4ea',
    tag1Text: '#1b6a38',
    progressColor: '#1b6a38',
    statusBg: '#e6f4ea',
    statusText: '#1b6a38',
    statusBorder: '#b3e0c2'
  },
  'Project Mgmt': {
    catBg: '#e6ebf1',
    catText: '#597495',
    progColor: '#597495',
    tag1Bg: '#e6ebf1',
    tag1Text: '#597495',
    progressColor: '#597495',
    statusBg: '#e6ebf1',
    statusText: '#597495',
    statusBorder: '#c5d1df'
  }
};

const DEFAULT_COLORS = {
  catBg: '#f0f0f0',
  catText: '#333333',
  progColor: '#666666',
  tag1Bg: '#f0f0f0',
  tag1Text: '#333333',
  progressColor: '#666666',
  statusBg: '#f0f0f0',
  statusText: '#333333',
  statusBorder: '#cccccc'
};

module.exports = {
  KPI_STATUS,
  MILESTONE_STATUS,
  SUBMISSION_STATUS,
  CATEGORY_COLORS,
  DEFAULT_COLORS
};
