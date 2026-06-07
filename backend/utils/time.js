/**
 * Convert a date into a human-readable relative time string.
 * e.g. "Just now", "5 mins ago", "2 hours ago", "Yesterday", "3 days ago".
 * @param {Date|string} date
 * @returns {string}
 */
const getRelativeTime = (date) => {
  if (!date) return '';
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMin = Math.round(diffMs / 60000);
  const diffHr = Math.round(diffMs / 3600000);
  const diffDay = Math.round(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min${diffMin !== 1 ? 's' : ''} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? 's' : ''} ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay} days ago`;
  const diffWeek = Math.round(diffDay / 7);
  return `${diffWeek} week${diffWeek !== 1 ? 's' : ''} ago`;
};

module.exports = { getRelativeTime };
