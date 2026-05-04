import React, { useState } from 'react';
/* React-Bootstrap Components: Row, Col, Card, Badge, Button, ProgressBar, Form, Dropdown */
import { Row, Col, Card, Badge, Button, ProgressBar, Form, Dropdown } from 'react-bootstrap';
/* React-Bootstrap-Icons */
import { ChevronLeft, CircleFill, ArrowRight } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import '../styles/theme.css';

/* Reusable Components */
import ConversationMessage from '../component/ConversationMessage';
import ActivityLog from '../component/ActivityLog';

// ─── Mock Data ──────────────────────────────────────────────────────────────────

// TODO: Replace with database data later
const taskData = {
  category: 'Community',
  catBg: '#e6f4ea',
  catText: '#1b6a38',
  title: 'Host 4 community outreach events',
  description: 'Public-facing engagements to grow awareness of the campaign.',
  progress: 75,
  due: 'Nov 30, 2026',
  owner: 'Aisha Rahman',
  reviewer: 'Lee Chen',
  status: 'On track',
};

const jumpToItems = [
  { label: 'Submission #A-0419', detail: '2h ago' },
  { label: 'Assignment note', detail: 'Aug 10' },
  { label: 'Check-in #2', detail: 'Oct 03' },
];

const messagesData = [
  {
    id: 1,
    date: 'NOV 18 · MONDAY',
    messages: [
      {
        avatarInitials: 'AR',
        avatarBg: '#F9E7DE',
        avatarColor: '#C85A3A',
        userName: 'Aisha Rahman',
        role: 'Staff',
        roleBg: '#e6f4ea',
        roleColor: '#1b6a38',
        time: '11:42 AM',
        message:
          'Just wrapped up the East Library event — 52 attendees, full house. Got great photos and Star News is running a short piece tomorrow. Starting the submission now.',
        reactions: [
          { emoji: '🖐️', count: 3 },
          { emoji: '👏', count: 2 },
        ],
      },
      {
        avatarInitials: 'LC',
        avatarBg: '#e2efe9',
        avatarColor: '#183628',
        userName: 'Lee Chen',
        role: 'Manager',
        roleBg: '#fef2e4',
        roleColor: '#a87022',
        time: '1:15 PM',
        message:
          'Huge — 4th event, right on schedule. When you file the evidence, add the attendance log and at least one wide shot of the venue so we can use it for the quarterly report.',
        isPinned: true,
        reactions: [{ emoji: '👍', count: 1 }],
      },
    ],
  },
  {
    id: 2,
    date: 'NOV 19 · TUESDAY',
    messages: [
      {
        avatarInitials: 'AR',
        avatarBg: '#F9E7DE',
        avatarColor: '#C85A3A',
        userName: 'Aisha Rahman',
        role: 'Staff',
        roleBg: '#e6f4ea',
        roleColor: '#1b6a38',
        time: '9:08 AM',
        message:
          "Submitted — 75% → 100%, everything attached. Let me know if anything's missing.",
        attachment: { name: 'east_library_attendance.pdf', size: '1.4 KB' },
      },
      {
        avatarInitials: 'RK',
        avatarBg: '#fce8e6',
        avatarColor: '#c73a24',
        userName: 'Rachel Koh',
        role: 'Staff',
        roleBg: '#e6f4ea',
        roleColor: '#1b6a38',
        time: '10:24 AM',
        message:
          "So proud of this one — you carried it. If you want a hand with the Q1 drive kickoff, I've got Thursday free.",
        reactions: [{ emoji: '❤️', count: 2 }],
      },
      {
        avatarInitials: 'LC',
        avatarBg: '#e2efe9',
        avatarColor: '#183628',
        userName: 'Lee Chen',
        role: 'Manager',
        roleBg: '#fef2e4',
        roleColor: '#a87022',
        time: '11:50 AM',
        message:
          "Reviewing now. Star News coverage is a nice bonus. One quick note: could you confirm the photographer credit before I approve? Want to get that right.",
      },
    ],
  },
];

const activityItems = [
  { dotColor: '#1b6a38', title: 'Lee approved submission #A-0419', time: '22 min ago' },
  { dotColor: '#1b6a38', title: 'Aisha posted a reply', time: '38 min ago' },
  { dotColor: '#d69f4c', title: 'Submission filed (75 → 100%)', time: '1 hour ago' },
  { dotColor: '#1b6a38', title: 'Lee replied on Nov 18 thread', time: 'Yesterday' },
  { dotColor: '#c73a24', title: 'Rachel reacted ❤️', time: 'Yesterday' },
];

const participantAvatars = [
  { initials: 'LC', bg: '#e2efe9', color: '#183628' },
  { initials: 'AR', bg: '#F9E7DE', color: '#C85A3A' },
  { initials: 'RK', bg: '#fce8e6', color: '#c73a24' },
];

// ─── Component ──────────────────────────────────────────────────────────────────

const FeedbackPage = () => {
  const [sortOrder, setSortOrder] = useState('Oldest first');
  const [emailNotif, setEmailNotif] = useState(true);
  const [inAppPings, setInAppPings] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const totalMessages = messagesData.reduce((sum, group) => sum + group.messages.length, 0);

  return (
    <main>
      {/* ── Page Header ──────────────────────────────────────────── */}
      <header className="d-flex justify-content-between align-items-start mb-4">
        <div>
          {/* React-Bootstrap: Button (as Link) - back navigation */}
          <Link to="/notification-dashboard" className="text-secondary text-decoration-none d-flex align-items-center gap-1 mb-2" style={{ fontSize: '12px' }}>
            {/* React-Bootstrap-Icons: ChevronLeft */}
            <ChevronLeft size={12} /> All threads
          </Link>
          <h1 className="fw-bold m-0 fs-5 serif-font">
            Feedback · {taskData.title}
          </h1>
        </div>

        <div className="d-flex align-items-center gap-3">
          {/* Participant Avatars */}
          <div className="d-flex" style={{ marginRight: '8px' }}>
            {participantAvatars.map((avatar, index) => (
              <div
                key={index}
                className="rounded-circle d-flex align-items-center justify-content-center fw-bold border border-2 border-white"
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: avatar.bg,
                  color: avatar.color,
                  fontSize: '11px',
                  marginLeft: index > 0 ? '-8px' : '0',
                  zIndex: participantAvatars.length - index,
                }}
              >
                {avatar.initials}
              </div>
            ))}
          </div>

          {/* React-Bootstrap: Form.Check - subscribed toggle */}
          <Form.Check
            type="switch"
            id="subscribed-switch"
            label="Subscribed"
            defaultChecked
            className="feedback-switch text-sm fw-medium"
          />
        </div>
      </header>

      <div className="header-divider" style={{ marginBottom: '1.5rem' }}></div>

      {/* ── Three-Column Layout ──────────────────────────────────── */}
      {/* React-Bootstrap: Row, Col - responsive 3-column grid */}
      <Row className="g-4">
        {/* ═══ LEFT COLUMN: Task Card ═══ */}
        <Col xs={12} lg={3}>
          {/* React-Bootstrap: Card - assigned task details */}
          <Card className="custom-card border-0 p-4 mb-4">
            {/* Category tag */}
            <span
              className="badge rounded-pill fw-bold mb-3 d-inline-block"
              style={{
                backgroundColor: taskData.catBg,
                color: taskData.catText,
                fontSize: '10px',
                letterSpacing: '1.5px',
                padding: '4px 10px',
                textTransform: 'uppercase',
                fontFamily: 'monospace',
                width: 'fit-content',
              }}
            >
              {taskData.category}
            </span>

            <h5 className="fw-bold serif-font mb-2" style={{ fontSize: '16px' }}>
              {taskData.title}
            </h5>
            <p className="text-secondary mb-4" style={{ fontSize: '13px', lineHeight: '1.5' }}>
              {taskData.description}
            </p>

            {/* Progress section */}
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-secondary fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '1.5px' }}>
                Progress
              </span>
              <span className="fw-bold" style={{ fontSize: '14px' }}>{taskData.progress}%</span>
            </div>
            {/* React-Bootstrap: ProgressBar - task completion */}
            <ProgressBar
              now={taskData.progress}
              className="mb-4"
              style={{ height: '6px', backgroundColor: 'var(--light-gray)' }}
              variant="success"
            />

            {/* Task details */}
            <div className="d-flex flex-column gap-3">
              {[
                { label: 'DUE', value: taskData.due },
                { label: 'OWNER', value: taskData.owner },
                { label: 'REVIEWER', value: taskData.reviewer },
                { label: 'STATUS', value: taskData.status },
              ].map((item, index) => (
                <div key={index} className="d-flex justify-content-between">
                  <span className="text-secondary fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '1.5px' }}>
                    {item.label}
                  </span>
                  <span className="fw-medium" style={{ fontSize: '13px' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Jump To section */}
          {/* React-Bootstrap: Card - jump-to navigation */}
          <Card className="custom-card border-0 p-4 mb-4">
            <span className="text-secondary fw-bold text-uppercase mb-3 d-block" style={{ fontSize: '10px', letterSpacing: '1.5px' }}>
              Jump to
            </span>
            {jumpToItems.map((item, index) => (
              <div key={index} className="d-flex align-items-start gap-3 mb-3">
                {/* React-Bootstrap-Icons: CircleFill - bullet indicator */}
                <CircleFill size={6} className="text-secondary mt-1 flex-shrink-0" />
                <div>
                  <span className="fw-bold d-block" style={{ fontSize: '13px' }}>{item.label}</span>
                  <span className="text-secondary" style={{ fontSize: '11px' }}>{item.detail}</span>
                </div>
              </div>
            ))}
          </Card>

          {/* Heads up info card */}
          {/* React-Bootstrap: Card - informational notice */}
          <Card className="border-0 p-4 info-card" style={{ borderRadius: 'var(--radius-lg)' }}>
            <h6 className="fw-bold mb-2" style={{ color: '#d69f4c', fontSize: '14px' }}>Heads up</h6>
            <p className="mb-0" style={{ fontSize: '12px', lineHeight: '1.5', color: 'var(--sidebar-text)' }}>
              Threads auto-archive 30 days after a KPI is marked complete. Pin messages you want to keep.
            </p>
          </Card>
        </Col>

        {/* ═══ MIDDLE COLUMN: Conversation ═══ */}
        <Col xs={12} lg={6}>
          {/* Conversation Header */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div>
              <h4 className="fw-bold serif-font mb-1" style={{ fontSize: '20px' }}>Conversation</h4>
              <p className="text-secondary mb-0" style={{ fontSize: '12px' }}>
                {totalMessages} messages · last reply 22 min ago
              </p>
            </div>

            {/* React-Bootstrap: Dropdown - sort order selector */}
            <Dropdown>
              {/* React-Bootstrap: Dropdown.Toggle - sort button */}
              <Dropdown.Toggle
                variant="light"
                size="sm"
                className="rounded-pill border-0 text-sm fw-medium px-3"
                style={{ backgroundColor: 'var(--card-bg)' }}
              >
                {sortOrder} ▾
              </Dropdown.Toggle>
              {/* React-Bootstrap: Dropdown.Menu and Dropdown.Item - sort options */}
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setSortOrder('Oldest first')}>Oldest first</Dropdown.Item>
                <Dropdown.Item onClick={() => setSortOrder('Newest first')}>Newest first</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>

          <div className="header-divider" style={{ marginBottom: '1.5rem' }}></div>

          {/* Message Groups by Date */}
          {messagesData.map((group) => (
            <div key={group.id}>
              {/* Date separator */}
              <div className="text-center mb-4">
                <span
                  className="text-secondary fw-bold text-uppercase"
                  style={{ fontSize: '10px', letterSpacing: '2px' }}
                >
                  {group.date}
                </span>
              </div>

              {/* Individual messages — Reusable ConversationMessage Component */}
              {group.messages.map((msg, index) => (
                <ConversationMessage
                  key={index}
                  avatarInitials={msg.avatarInitials}
                  avatarBg={msg.avatarBg}
                  avatarColor={msg.avatarColor}
                  userName={msg.userName}
                  role={msg.role}
                  roleBg={msg.roleBg}
                  roleColor={msg.roleColor}
                  time={msg.time}
                  message={msg.message}
                  isPinned={msg.isPinned || false}
                  reactions={msg.reactions || []}
                  attachment={msg.attachment || null}
                />
              ))}
            </div>
          ))}
        </Col>

        {/* ═══ RIGHT COLUMN: Activity & Settings ═══ */}
        <Col xs={12} lg={3}>
          {/* Reusable ActivityLog Component */}
          <div className="mb-4">
            <ActivityLog title="Activity" items={activityItems} />
          </div>

          {/* Thread Settings Card */}
          {/* React-Bootstrap: Card - settings panel */}
          <Card className="custom-card border-0 p-4">
            <h6 className="fw-bold serif-font mb-3">Thread settings</h6>

            {/* React-Bootstrap: Form.Check (switch) - toggle settings */}
            <div className="d-flex flex-column gap-3">
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-medium" style={{ fontSize: '13px' }}>Email notifications</span>
                {/* React-Bootstrap: Form.Check - email toggle */}
                <Form.Check
                  type="switch"
                  id="email-notif-switch"
                  checked={emailNotif}
                  onChange={() => setEmailNotif(!emailNotif)}
                  className="feedback-switch"
                />
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-medium" style={{ fontSize: '13px' }}>In-app pings</span>
                {/* React-Bootstrap: Form.Check - in-app toggle */}
                <Form.Check
                  type="switch"
                  id="inapp-pings-switch"
                  checked={inAppPings}
                  onChange={() => setInAppPings(!inAppPings)}
                  className="feedback-switch"
                />
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-medium" style={{ fontSize: '13px' }}>Weekly digest</span>
                {/* React-Bootstrap: Form.Check - weekly digest toggle */}
                <Form.Check
                  type="switch"
                  id="weekly-digest-switch"
                  checked={weeklyDigest}
                  onChange={() => setWeeklyDigest(!weeklyDigest)}
                  className="feedback-switch"
                />
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </main>
  );
};

export default FeedbackPage;
