import React from 'react';
/* React-Bootstrap Components: Card, Button */
import { Card, Button } from 'react-bootstrap';
/* React-Bootstrap-Icons: Envelope */
import { Envelope } from 'react-bootstrap-icons';
import '../styles/theme.css';

/**
 * Tag color mapping for notification categories
 */
const TAG_STYLES = {
  Decision: { bg: '#fce8e6', text: '#c73a24', border: '#f5c6bc' },
  KPI:      { bg: '#e6f4ea', text: '#1b6a38', border: '#b7dfbf' },
  Deadline: { bg: '#fef2e4', text: '#a87022', border: '#f5deb3' },
  Activity: { bg: '#e8eaf6', text: '#3949ab', border: '#c5cae9' },
};

/**
 * Reusable NotificationCard component
 * @param {string} tag - Category tag (Decision, KPI, Deadline, Activity)
 * @param {string} title - Notification title
 * @param {string} description - Notification description text
 * @param {string} time - Time ago string (e.g. "2h ago")
 * @param {boolean} isRead - Whether the notification has been read
 * @param {function} onMarkRead - Callback when envelope icon is clicked
 */
const NotificationCard = ({ tag, title, description, time, isRead = false, onMarkRead }) => {
  const tagStyle = TAG_STYLES[tag] || TAG_STYLES.Activity;

  return (
    /* React-Bootstrap: Card - main container for each notification */
    <Card
      className="notification-card border-0 shadow-sm mb-3"
      style={{
        borderLeft: `4px solid ${tagStyle.border}`,
        borderRadius: '12px',
        backgroundColor: isRead ? '#fafaf8' : 'var(--card-bg)',
      }}
    >
      {/* React-Bootstrap: Card.Body - card content area */}
      <Card.Body className="d-flex justify-content-between align-items-center px-4 py-3">
        <div>
          {/* Using a standard span instead of Badge to avoid React-Bootstrap's default bg-primary !important */}
          <span
            className="badge rounded-pill notification-tag fw-bold mb-2"
            style={{
              backgroundColor: tagStyle.bg,
              color: tagStyle.text,
              fontSize: '10px',
              letterSpacing: '1.5px',
              padding: '4px 10px',
              textTransform: 'uppercase',
              fontFamily: 'monospace',
            }}
          >
            {tag}
          </span>

          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="fw-bold text-sm">{title}</span>
            <span className="text-secondary" style={{ fontSize: '13px' }}>•</span>
            <span className="text-secondary" style={{ fontSize: '13px' }}>{time}</span>
          </div>

          <p className="mb-0 text-secondary" style={{ fontSize: '13px' }}>{description}</p>
        </div>

        {/* React-Bootstrap: Button - envelope icon action button */}
        <Button
          variant="light"
          className="notification-icon-btn rounded-circle d-flex align-items-center justify-content-center border-0"
          style={{ width: '40px', height: '40px', flexShrink: 0 }}
          onClick={onMarkRead}
          aria-label={isRead ? 'Mark as unread' : 'Mark as read'}
        >
          {/* React-Bootstrap-Icons: Envelope */}
          <Envelope size={18} className="text-secondary" />
        </Button>
      </Card.Body>
    </Card>
  );
};

export default NotificationCard;
