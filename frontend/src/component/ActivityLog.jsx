import React from 'react';
/* React-Bootstrap Components: Card */
import { Card } from 'react-bootstrap';
import '../styles/theme.css';

/**
 * Reusable ActivityLog component
 * Displays a timeline of recent activities
 *
 * @param {string} title     - Card heading (e.g. "Activity")
 * @param {Array}  items     - Array of { dotColor, title, time } objects
 */
const ActivityLog = ({ title = 'Activity', items = [] }) => {
  return (
    /* React-Bootstrap: Card - activity log container */
    <Card className="custom-card border-0 p-4">
      <h6 className="fw-bold serif-font mb-3">{title}</h6>

      <div className="activity-log-track">
        {items.map((item, index) => (
          <div key={index} className="d-flex align-items-start gap-3 mb-3">
            {/* Colored dot indicator */}
            <div
              className="rounded flex-shrink-0 mt-1"
              style={{
                width: '10px',
                height: '10px',
                backgroundColor: item.dotColor,
                borderRadius: '3px',
              }}
            />
            <div>
              <p className="mb-0 fw-medium" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                {item.title}
              </p>
              <span className="text-secondary" style={{ fontSize: '11px' }}>
                {item.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ActivityLog;
