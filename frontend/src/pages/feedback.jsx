import React, { useState, useEffect, useCallback, useRef } from 'react';
/* React-Bootstrap Components */
import { Row, Col, Card, Button, ProgressBar, Form, Dropdown, Spinner } from 'react-bootstrap';
/* React-Bootstrap-Icons */
import { ChevronLeft, ArrowRight } from 'react-bootstrap-icons';
import { useLocation } from 'react-router-dom';
import Sidebar from '../component/Sidebar';
import api from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';
import '../styles/theme.css';

/* Reusable Components */
import ConversationMessage from '../component/ConversationMessage';
import ActivityLog from '../component/ActivityLog';
import CategoryBadge from '../component/CategoryBadge';

const POLL_INTERVAL_MS = 15000;

// Normalise the two different KPI list shapes (staff vs manager) into one.
const normalizeKpi = (k, isManager, ownerFallback) => {
  if (isManager) {
    return {
      id: k._id,
      title: k.title,
      category: k.category,
      progress: k.achievementScore ?? 0,
      due: k.targetDate
        ? new Date(k.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '—',
      status: k.status || '—',
      owner: k.assignee || '—',
    };
  }
  return {
    id: k.id,
    title: k.title,
    category: k.tag1 || k.category,
    progress: k.progressValue ?? 0,
    due: k.due || '—',
    status: k.status || '—',
    owner: ownerFallback || 'You',
  };
};

// Build a "NOV 18 · MONDAY" style label for a date.
const dateLabel = (date) => {
  const d = new Date(date);
  const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  return `${month} ${d.getDate()} · ${weekday}`;
};

// Group comments (already sorted oldest-first) into date buckets.
const groupByDate = (comments) => {
  const groups = [];
  const indexByKey = {};
  comments.forEach((c) => {
    const key = new Date(c.createdAt).toDateString();
    if (indexByKey[key] === undefined) {
      indexByKey[key] = groups.length;
      groups.push({ key, date: dateLabel(c.createdAt), messages: [] });
    }
    groups[indexByKey[key]].messages.push(c);
  });
  return groups;
};

const FeedbackPage = () => {
  const location = useLocation();
  const { user } = useAuth();
  const role = location.pathname.startsWith('/manager') ? 'manager' : 'staff';
  const isManager = role === 'manager';

  const ownerName = user?.englishName || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'You';

  const [kpis, setKpis] = useState([]);
  const [selectedKpiId, setSelectedKpiId] = useState(null);
  const [comments, setComments] = useState([]);
  const [draft, setDraft] = useState('');
  const [isLoadingKpis, setIsLoadingKpis] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState(null);

  const [sortOrder, setSortOrder] = useState('Oldest first');
  const [emailNotif, setEmailNotif] = useState(true);
  const [inAppPings, setInAppPings] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const selectedKpi = kpis.find((k) => String(k.id) === String(selectedKpiId)) || null;
  const selectedKpiIdRef = useRef(selectedKpiId);
  selectedKpiIdRef.current = selectedKpiId;

  // ── Load KPI list (role-aware) ───────────────────────────────────────────
  useEffect(() => {
    const fetchKpis = async () => {
      try {
        setIsLoadingKpis(true);
        setError(null);
        const endpoint = isManager ? '/api/kpi/' : '/api/kpi/assigned';
        const response = await api.get(endpoint);
        const raw = isManager
          ? response.data || []
          : response.data.data || response.data || [];
        const list = raw.map((k) => normalizeKpi(k, isManager, ownerName));
        setKpis(list);
        if (list.length > 0) setSelectedKpiId(list[0].id);
      } catch (err) {
        console.error('Error fetching KPIs for feedback:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load KPIs.');
      } finally {
        setIsLoadingKpis(false);
      }
    };
    fetchKpis();
  }, [isManager, ownerName]);

  // ── Load comments for the selected KPI ───────────────────────────────────
  const fetchComments = useCallback(async (kpiId, silent = false) => {
    if (!kpiId) return;
    try {
      if (!silent) setIsLoadingComments(true);
      const response = await api.get(`/api/comments/${kpiId}`);
      // Ignore late responses if the user already switched KPI.
      if (String(selectedKpiIdRef.current) === String(kpiId)) {
        setComments(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      if (!silent) setIsLoadingComments(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedKpiId) return undefined;
    setComments([]);
    fetchComments(selectedKpiId);
    const interval = setInterval(() => fetchComments(selectedKpiIdRef.current, true), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [selectedKpiId, fetchComments]);

  // ── Post a new comment ───────────────────────────────────────────────────
  const handleSend = async (e) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || !selectedKpiId) return;
    try {
      setIsPosting(true);
      const response = await api.post(`/api/comments/${selectedKpiId}`, { body });
      setComments((prev) => [...prev, response.data.comment]);
      setDraft('');
    } catch (err) {
      console.error('Error posting comment:', err);
      setError(err.response?.data?.message || err.message || 'Failed to send comment.');
    } finally {
      setIsPosting(false);
    }
  };

  const orderedComments =
    sortOrder === 'Newest first' ? [...comments].slice().reverse() : comments;
  const groups = groupByDate(orderedComments);

  // Distinct participants for the avatar stack.
  const participants = [];
  const seen = new Set();
  comments.forEach((c) => {
    if (!seen.has(c.authorEmail)) {
      seen.add(c.authorEmail);
      participants.push({ initials: c.avatarInitials, bg: c.avatarBg, color: c.avatarColor });
    }
  });

  // Derive a lightweight activity feed from the most recent comments.
  const activityItems = [...comments]
    .slice(-5)
    .reverse()
    .map((c) => ({
      dotColor: c.role === 'Manager' ? '#0D3B2E' : '#C85A3A',
      title: `${c.userName} commented`,
      time: c.relativeTime || c.time,
    }));

  return (
    <div className="d-flex">
      <Sidebar role={role} />

      <main style={{
        marginLeft: 'var(--sidebar-width)',
        flex: 1,
        padding: '40px 60px',
        backgroundColor: 'var(--main-bg)',
        minHeight: '100vh'
      }}>
      {/* ── Page Header ──────────────────────────────────────────── */}
      <header className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <p className="text-secondary text-decoration-none d-flex align-items-center gap-1 mb-2" style={{ fontSize: '12px' }}>
            <ChevronLeft size={12} /> KPI threads
          </p>
          <h1 className="fw-bold m-0 fs-5 serif-font">
            Feedback{selectedKpi ? ` · ${selectedKpi.title}` : ''}
          </h1>
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="d-flex" style={{ marginRight: '8px' }}>
            {participants.map((avatar, index) => (
              <div
                key={index}
                className="rounded-circle d-flex align-items-center justify-content-center fw-bold border border-2 border-white"
                style={{
                  width: '32px', height: '32px',
                  backgroundColor: avatar.bg, color: avatar.color,
                  fontSize: '11px',
                  marginLeft: index > 0 ? '-8px' : '0',
                  zIndex: participants.length - index,
                }}
              >
                {avatar.initials}
              </div>
            ))}
          </div>

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

      {error && <div className="text-danger fw-medium mb-3" style={{ fontSize: '13px' }}>{error}</div>}

      {/* ── Three-Column Layout ──────────────────────────────────── */}
      <Row className="g-4">
        {/* ═══ LEFT COLUMN: KPI picker + Task Card ═══ */}
        <Col xs={12} lg={3}>
          {/* KPI selector */}
          <Card className="custom-card border-0 p-4 mb-4">
            <span className="text-secondary fw-bold text-uppercase mb-2 d-block" style={{ fontSize: '10px', letterSpacing: '1.5px' }}>
              KPI thread
            </span>
            <Form.Select
              value={selectedKpiId || ''}
              onChange={(e) => setSelectedKpiId(e.target.value)}
              disabled={isLoadingKpis || kpis.length === 0}
              className="filter-select"
            >
              {kpis.length === 0 && <option>No KPIs available</option>}
              {kpis.map((k) => (
                <option key={k.id} value={k.id}>{k.title}</option>
              ))}
            </Form.Select>
          </Card>

          {/* Task details card */}
          {selectedKpi && (
            <Card className="custom-card border-0 p-4 mb-4">
              <CategoryBadge
                category={selectedKpi.category}
                className="mb-3"
                style={{ width: 'fit-content', textTransform: 'uppercase', letterSpacing: '1px' }}
              />

              <h5 className="fw-bold serif-font mb-3" style={{ fontSize: '16px' }}>
                {selectedKpi.title}
              </h5>

              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-secondary fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '1.5px' }}>
                  Progress
                </span>
                <span className="fw-bold" style={{ fontSize: '14px' }}>{selectedKpi.progress}%</span>
              </div>
              <ProgressBar
                now={selectedKpi.progress}
                className="mb-4"
                style={{ height: '6px' }}
                variant="success"
              />

              <div className="d-flex flex-column gap-3">
                {[
                  { label: 'DUE', value: selectedKpi.due },
                  { label: isManager ? 'ASSIGNEE' : 'OWNER', value: selectedKpi.owner },
                  { label: 'STATUS', value: selectedKpi.status },
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
          )}

          {/* Heads up info card */}
          <Card className="border-0 p-4 info-card" style={{ borderRadius: 'var(--radius-lg)', backgroundColor: '#0D3B2E' }}>
            <h6 className="fw-bold mb-2" style={{ color: '#d69f4c', fontSize: '14px', fontStyle: 'italic' }}>Heads up</h6>
            <p className="mb-0" style={{ fontSize: '12px', lineHeight: '1.5', color: 'var(--sidebar-text)' }}>
              Replies are shared with the KPI owner and managers, and trigger an in-app notification.
            </p>
          </Card>
        </Col>

        {/* ═══ MIDDLE COLUMN: Conversation ═══ */}
        <Col xs={12} lg={6}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div>
              <h4 className="fw-bold serif-font mb-1" style={{ fontSize: '20px' }}>Conversation</h4>
              <p className="text-secondary mb-0" style={{ fontSize: '12px' }}>
                {comments.length} message{comments.length !== 1 ? 's' : ''}
                {comments.length > 0 ? ` · last reply ${comments[comments.length - 1].relativeTime || comments[comments.length - 1].time}` : ''}
              </p>
            </div>

            <Dropdown>
              <Dropdown.Toggle
                variant="light"
                size="sm"
                className="rounded-pill border-0 text-sm fw-medium px-3"
                style={{ backgroundColor: 'var(--card-bg)' }}
              >
                {sortOrder}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setSortOrder('Oldest first')}>Oldest first</Dropdown.Item>
                <Dropdown.Item onClick={() => setSortOrder('Newest first')}>Newest first</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>

          <div className="header-divider" style={{ marginBottom: '1.5rem' }}></div>

          {/* Messages */}
          {isLoadingComments ? (
            <div className="text-center py-5">
              <Spinner animation="border" size="sm" className="me-2" />
              <span className="text-secondary">Loading conversation…</span>
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-secondary fw-medium mb-0">No messages yet. Start the conversation below.</p>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.key}>
                <div className="text-center mb-4">
                  <span className="text-secondary fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '2px' }}>
                    {group.date}
                  </span>
                </div>

                {group.messages.map((msg) => (
                  <ConversationMessage
                    key={msg.id}
                    avatarInitials={msg.avatarInitials}
                    avatarBg={msg.avatarBg}
                    avatarColor={msg.avatarColor}
                    userName={msg.userName}
                    role={msg.role}
                    time={msg.time}
                    message={msg.message}
                  />
                ))}
              </div>
            ))
          )}

          {/* Compose box */}
          <Form onSubmit={handleSend} className="mt-3">
            <Card className="custom-card border-0 p-3">
              <Form.Control
                as="textarea"
                rows={3}
                placeholder={selectedKpi ? 'Write a reply…' : 'Select a KPI to start a thread'}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={!selectedKpi || isPosting}
                className="border-0 shadow-none mb-2"
                style={{ resize: 'none', fontSize: '13px', backgroundColor: 'transparent' }}
              />
              <div className="d-flex justify-content-end">
                <Button
                  type="submit"
                  className="btn-orange d-flex align-items-center gap-2"
                  disabled={!draft.trim() || !selectedKpi || isPosting}
                >
                  {isPosting ? 'Sending…' : 'Send reply'} <ArrowRight size={14} />
                </Button>
              </div>
            </Card>
          </Form>
        </Col>

        {/* ═══ RIGHT COLUMN: Activity & Settings ═══ */}
        <Col xs={12} lg={3}>
          <div className="mb-4">
            <ActivityLog title="Activity" items={activityItems} />
          </div>

          <Card className="custom-card border-0 p-4">
            <h6 className="fw-bold serif-font mb-3">Thread settings</h6>
            <div className="d-flex flex-column gap-3">
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-medium" style={{ fontSize: '13px' }}>Email notifications</span>
                <Form.Check type="switch" id="email-notif-switch" checked={emailNotif} onChange={() => setEmailNotif(!emailNotif)} className="feedback-switch" />
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-medium" style={{ fontSize: '13px' }}>In-app pings</span>
                <Form.Check type="switch" id="inapp-pings-switch" checked={inAppPings} onChange={() => setInAppPings(!inAppPings)} className="feedback-switch" />
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-medium" style={{ fontSize: '13px' }}>Weekly digest</span>
                <Form.Check type="switch" id="weekly-digest-switch" checked={weeklyDigest} onChange={() => setWeeklyDigest(!weeklyDigest)} className="feedback-switch" />
              </div>
            </div>
          </Card>
        </Col>
      </Row>
      </main>
    </div>
  );
};

export default FeedbackPage;
