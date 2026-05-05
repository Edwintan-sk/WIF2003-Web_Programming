import React, { useState } from 'react';
/* React-Bootstrap Components: Card, Button, Badge */
import { Card, Button, Badge } from 'react-bootstrap';
/* React-Bootstrap-Icons: PinAngleFill, FileEarmarkPdf */
import { PinAngleFill, FileEarmarkPdf } from 'react-bootstrap-icons';
import '../styles/theme.css';

/**
 * Reusable ConversationMessage component
 * Displays a single message in a feedback conversation thread
 *
 * @param {string}   avatarInitials - User initials for avatar (e.g. "AR")
 * @param {string}   avatarBg      - Background color for the avatar circle
 * @param {string}   avatarColor   - Text color for the avatar initials
 * @param {string}   userName      - Display name of the message author
 * @param {string}   role          - Role badge text (e.g. "Staff", "Manager")
 * @param {string}   time          - Timestamp string (e.g. "11:42 AM")
 * @param {string}   message       - The message body text
 * @param {boolean}  isPinned      - Whether the message is pinned
 * @param {Array}    reactions      - Array of { emoji, count } objects
 * @param {object}   attachment    - Optional { name, size } for file attachment
 */
const ConversationMessage = ({
  avatarInitials,
  avatarBg = '#F9E7DE',
  avatarColor = '#C85A3A',
  userName,
  role,
  time,
  message,
  isPinned = false,
  reactions = [],
  attachment = null,
}) => {
  const [localReactions, setLocalReactions] = useState(reactions);

  let computedRoleBg = '#e6f4ea';
  let computedRoleColor = '#1b6a38';

  if (role && role.toLowerCase() === 'staff') {
    computedRoleBg = '#F9E7DE';
    computedRoleColor = '#C85A3A';
  } else if (role && role.toLowerCase() === 'manager') {
    computedRoleBg = '#E4EDE7';
    computedRoleColor = '#0D3B2E';
  }

  const handleReact = (index) => {
    setLocalReactions((prev) =>
      prev.map((r, i) =>
        i === index ? { ...r, count: r.count + 1 } : r
      )
    );
  };

  return (
    <div className="d-flex gap-3 mb-4">
      {/* Avatar */}
      <div
        className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
        style={{
          width: '36px',
          height: '36px',
          backgroundColor: avatarBg,
          color: avatarColor,
          fontSize: '13px',
        }}
      >
        {avatarInitials}
      </div>

      {/* Message Content */}
      <div className="flex-grow-1">
        {/* Author info row */}
        <div className="d-flex align-items-center gap-2 mb-2">
          <span className="fw-bold text-sm">{userName}</span>

          {/* React-Bootstrap: Card - role indicator */}
          <Card
            className="fw-bold border-0"
            style={{
              backgroundColor: computedRoleBg,
              color: computedRoleColor,
              fontSize: '9px',
              letterSpacing: '1.5px',
              padding: '3px 8px',
              textTransform: 'uppercase',
              fontFamily: 'monospace',
              display: 'inline-block',
              borderRadius: '50rem',
            }}
          >
            {role}
          </Card>

          <span className="text-secondary" style={{ fontSize: '12px' }}>
            · {time}
          </span>

          {isPinned && (
            <>
              {/* React-Bootstrap-Icons: PinAngleFill */}
              <span className="d-flex align-items-center gap-1 ms-2" style={{ color: '#c73a24', fontSize: '12px' }}>
                <PinAngleFill size={12} /> Pinned
              </span>
            </>
          )}
        </div>

        {/* React-Bootstrap: Card - message bubble */}
        <Card className="conversation-bubble border-0 p-3 mb-2">
          <p className="mb-0" style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-main)' }}>
            {message}
          </p>
        </Card>

        {/* File attachment */}
        {attachment && (
          /* React-Bootstrap: Card - file attachment card */
          <Card className="d-inline-flex align-items-center gap-2 px-3 py-2 mb-2 border-0 attachment-card" style={{ cursor: 'pointer' }}>
            {/* React-Bootstrap-Icons: FileEarmarkPdf */}
            <div
              className="rounded d-flex align-items-center justify-content-center"
              style={{ width: '28px', height: '28px', backgroundColor: '#fce8e6' }}
            >
              <FileEarmarkPdf size={14} style={{ color: '#c73a24' }} />
            </div>
            <div>
              <div className="fw-medium" style={{ fontSize: '12px' }}>{attachment.name}</div>
              <div className="text-secondary" style={{ fontSize: '10px' }}>{attachment.size}</div>
            </div>
          </Card>
        )}

        {/* Reactions and actions row */}
        <div className="d-flex align-items-center gap-3">
          {/* Reaction pills */}
          {localReactions.map((reaction, index) => (
            /* React-Bootstrap: Button - reaction pill */
            <Button
              key={index}
              variant="light"
              size="sm"
              className="d-flex align-items-center gap-1 rounded-pill border-0 reaction-pill px-2 py-1"
              onClick={() => handleReact(index)}
            >
              <span style={{ fontSize: '13px' }}>{reaction.emoji}</span>
              <span className="fw-medium" style={{ fontSize: '12px', color: 'var(--text-main)' }}>
                {reaction.count}
              </span>
            </Button>
          ))}

          {/* Action links */}
          <span className="text-secondary fw-medium conversation-action" style={{ fontSize: '12px', cursor: 'pointer' }}>
            Reply
          </span>
          <span className="text-secondary fw-medium conversation-action" style={{ fontSize: '12px', cursor: 'pointer' }}>
            React
          </span>
        </div>
      </div>
    </div>
  );
};

export default ConversationMessage;
