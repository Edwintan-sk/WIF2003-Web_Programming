import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Nav } from 'react-bootstrap';
import { ArrowLeft, ChevronLeft, ChevronRight, Download, Plus, Check2, ExclamationTriangle, XCircle } from 'react-bootstrap-icons';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/theme.css';

const EvidenceDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State for interactivity
  const [activeFile, setActiveFile] = useState(0);
  const [decision, setDecision] = useState('approve');
  const [comment, setComment] = useState('');
  const [zoom, setZoom] = useState(100);

  // Mock data matching the UI screenshot
  const submissionData = {
    id: id || 'A-0419',
    staff: { name: 'Aisha Rahman', role: 'Communications', initials: 'AR', bgColor: '#fce8e6', textColor: '#c73a24', time: '2h ago' },
    kpi: 'Host 4 community outreach events',
    progress: { old: 75, new: 100, points: '+25 pts' },
    note: "Hosted the 4th event at East Library on Nov 18. 52 attendees, media coverage by Star News. Photos and attendance log attached.",
    files: [
      { name: 'event_photo_01.jpg', type: 'IMG', size: '2.4 MB', resolution: '3024 × 2016', date: 'Nov 18', author: 'M. Ling' },
      { name: 'east_library_attendance.pdf', type: 'PDF', size: '1.2 MB' },
      { name: 'starnews_coverage.pdf', type: 'PDF', size: '0.8 MB' }
    ]
  };

  const activeFileData = submissionData.files[activeFile];

  // Logic for the primary action button
  const getButtonStyles = () => {
    switch (decision) {
      case 'approve': return { bg: '#2A3D37', text: 'Approve submission', icon: <Check2 size={18} /> };
      case 'revision': return { bg: '#B8862D', text: 'Request revision', icon: <ExclamationTriangle size={16} /> };
      case 'reject': return { bg: '#B23B3B', text: 'Reject submission', icon: <XCircle size={16} /> };
      default: return { bg: '#2A3D37', text: 'Approve submission', icon: <Check2 size={18} /> };
    }
  };

  const actionStyle = getButtonStyles();

  return (
    <div>
      {/* Top Navigation / Breadcrumbs */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <div
            className="d-flex align-items-center gap-2 text-secondary mb-2"
            style={{ fontSize: '13px', cursor: 'pointer' }}
            onClick={() => navigate('/manager/verification-inbox')}
          >
            <ArrowLeft size={14} /> <span>Back to inbox</span>
          </div>
          <h2 className="serif-font mb-0" style={{ fontSize: '1.8rem', color: 'var(--text-main)' }}>Submission #{submissionData.id}</h2>
        </div>

        <div className="d-flex align-items-center gap-2 mt-2">
          <Button variant="light" className="rounded-2 p-1 border shadow-sm" style={{ backgroundColor: '#FAF5E8' }}><ChevronLeft size={16} /></Button>
          <span className="text-micro fw-bold px-2">1 of 8</span>
          <Button variant="light" className="rounded-2 p-1 border shadow-sm" style={{ backgroundColor: '#FAF5E8' }}><ChevronRight size={16} /></Button>
        </div>
      </div>

      <Row className="g-4">
        {/* Left Column: Evidence Viewer */}
        <Col lg={8}>
          {/* File Tabs */}
          <div className="d-flex gap-2 mb-3">
            {submissionData.files.map((file, idx) => (
              <div
                key={idx}
                className={`d-flex align-items-center gap-2 px-3 py-2 rounded-2 border cursor-pointer transition-all ${activeFile === idx ? 'bg-white shadow-sm border-secondary' : 'bg-transparent text-secondary'}`}
                style={{ fontSize: '11px', cursor: 'pointer', opacity: activeFile === idx ? 1 : 0.7, borderColor: activeFile === idx ? 'var(--text-main)' : '#EAE3D2' }}
                onClick={() => setActiveFile(idx)}
              >
                <span className="rounded-1 px-1 fw-bold" style={{
                  backgroundColor: file.type === 'PDF' ? '#F4DAD8' : '#E4EDE7',
                  color: file.type === 'PDF' ? '#B23B3B' : '#0D3B2E',
                  fontSize: '9px'
                }}>{file.type}</span>
                {file.name}
              </div>
            ))}
          </div>

          {/* Main Viewer Area */}
          <div className="viewer-container rounded-4 overflow-hidden shadow-sm mb-3" style={{ backgroundColor: '#2A3D37', height: '550px', position: 'relative' }}>
            <div className="w-100 h-100 d-flex align-items-center justify-content-center">
              <div className="rounded-circle" style={{ width: '200px', height: '200px', backgroundColor: '#5D4037', opacity: 0.8 }}></div>
            </div>
          </div>

          {/* New External Metadata Bar */}
          <div className="p-3 rounded-4 shadow-sm" style={{ backgroundColor: '#0B2019' }}>
            <h5 className="mb-1 fw-bold" style={{ color: '#F5EFDF' }}>{activeFileData.name} &bull; {activeFileData.date}</h5>
            <p className="mb-0 text-micro" style={{ color: '#F5EFDF', opacity: 0.8 }}>52 attendees &middot; photographer: {activeFileData.author || 'Staff'} &middot; uploaded by Aisha Rahman</p>
          </div>

          {/* Viewer Controls Bar */}
          <div className="d-flex justify-content-between align-items-center mt-3 p-3 bg-white rounded-3 border shadow-sm">
            <div className="text-secondary text-xs">
              {activeFileData.size} &middot; {activeFileData.type} &middot; {activeFileData.resolution || 'Document'}
            </div>

            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center rounded-pill px-2" style={{ backgroundColor: '#FAF5E8', border: '1px solid #EAE3D2' }}>
                <Button variant="link" className="text-dark p-1" style={{ textDecoration: 'none' }} onClick={() => setZoom(Math.max(50, zoom - 10))}>—</Button>
                <span className="text-xs fw-bold px-2">{zoom}%</span>
                <Button variant="link" className="text-dark p-1" style={{ textDecoration: 'none' }} onClick={() => setZoom(Math.min(200, zoom + 10))}>+</Button>
              </div>
              <Button variant="light" className="text-xs px-3 py-1 rounded-pill border d-flex align-items-center gap-2 shadow-sm" style={{ backgroundColor: '#FAF5E8', borderColor: '#EAE3D2' }}>
                <Download size={14} /> Download
              </Button>
            </div>
          </div>
        </Col>

        {/* Right Column: Details & Decisions */}
        <Col lg={4}>
          {/* Staff Info Card */}
          <Card className="custom-card border-0 shadow-sm mb-4">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                  style={{ width: '48px', height: '48px', backgroundColor: submissionData.staff.bgColor, color: submissionData.staff.textColor }}>
                  {submissionData.staff.initials}
                </div>
                <div>
                  <div className="fw-bold fs-6" style={{ color: 'var(--text-main)' }}>{submissionData.staff.name}</div>
                  <div className="text-secondary text-xs">{submissionData.staff.role} &middot; submitted {submissionData.staff.time}</div>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-micro fw-bold text-secondary text-uppercase mb-2">KPI</label>
                <div className="fw-bold" style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>{submissionData.kpi}</div>
              </div>

              <div className="p-3 rounded-4 mb-4" style={{ backgroundColor: '#FAF5E8' }}>
                <label className="text-micro fw-bold text-secondary text-uppercase mb-2">Requested Progress Update</label>
                <div className="d-flex align-items-baseline gap-2 mb-2 serif-font">
                  <span className="text-secondary fs-4">{submissionData.progress.old}%</span>
                  <span className="fs-4">&rarr;</span>
                  <span className="fw-bold fs-3">{submissionData.progress.new}%</span>
                </div>
                <div className="text-xs text-secondary">
                  <span className="rounded-pill px-2 py-1 fw-bold me-1" style={{ backgroundColor: '#E4EDE7', color: '#0D3B2E' }}>
                    {submissionData.progress.points}
                  </span>
                  marking KPI as complete
                </div>
              </div>

              <div>
                <label className="text-micro fw-bold text-secondary text-uppercase mb-2">Staff Note</label>
                <p className="text-secondary mb-0" style={{ fontSize: '13px', lineHeight: '1.6' }}>
                  {submissionData.note}
                </p>
              </div>
            </Card.Body>
          </Card>

          {/* Your Decision Card */}
          <Card className="custom-card border-0 shadow-sm">
            <Card.Body className="p-4">
              <h3 className="serif-font mb-4">Your decision</h3>

              <div className="d-flex flex-column gap-3 mb-4">
                {/* Approve Option */}
                <div
                  className="p-3 rounded-4 border cursor-pointer transition-all"
                  style={{
                    backgroundColor: decision === 'approve' ? '#FAF5E8' : 'transparent',
                    cursor: 'pointer',
                    borderColor: decision === 'approve' ? '#2D7A4E' : '#EAE3D2',
                    borderWidth: '1.5px'
                  }}
                  onClick={() => setDecision('approve')}
                >
                  <div className="d-flex gap-3">
                    <Form.Check
                      type="radio"
                      name="decision"
                      checked={decision === 'approve'}
                      onChange={() => setDecision('approve')}
                      className="shadow-none"
                    />
                    <div>
                      <div className="fw-bold text-sm mb-1">Approve</div>
                      <div className="text-secondary text-xs">Accept the submission and apply progress change.</div>
                    </div>
                  </div>
                </div>

                {/* Revision Option */}
                <div
                  className="p-3 rounded-4 border cursor-pointer transition-all"
                  style={{
                    backgroundColor: decision === 'revision' ? '#FAF5E8' : 'transparent',
                    cursor: 'pointer',
                    borderColor: decision === 'revision' ? '#B8862D' : '#EAE3D2',
                    borderWidth: '1.5px'
                  }}
                  onClick={() => setDecision('revision')}
                >
                  <div className="d-flex gap-3">
                    <Form.Check
                      type="radio"
                      name="decision"
                      checked={decision === 'revision'}
                      onChange={() => setDecision('revision')}
                      className="shadow-none"
                    />
                    <div>
                      <div className="fw-bold text-sm mb-1">Request revision</div>
                      <div className="text-secondary text-xs">Send back with a comment asking for changes.</div>
                    </div>
                  </div>
                </div>

                {/* Reject Option */}
                <div
                  className="p-3 rounded-4 border cursor-pointer transition-all"
                  style={{
                    backgroundColor: decision === 'reject' ? '#FAF5E8' : 'transparent',
                    cursor: 'pointer',
                    borderColor: decision === 'reject' ? '#B23B3B' : '#EAE3D2',
                    borderWidth: '1.5px'
                  }}
                  onClick={() => setDecision('reject')}
                >
                  <div className="d-flex gap-3">
                    <Form.Check
                      type="radio"
                      name="decision"
                      checked={decision === 'reject'}
                      onChange={() => setDecision('reject')}
                      className="shadow-none"
                    />
                    <div>
                      <div className="fw-bold text-sm mb-1">Reject</div>
                      <div className="text-secondary text-xs">Do not apply the update. Requires a reason.</div>
                    </div>
                  </div>
                </div>
              </div>

              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Add a comment (optional on approval)..."
                className="textarea-custom mb-4 shadow-none"
                style={{ backgroundColor: '#F3EDDF', borderColor: '#EAE3D2' }}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />

              <div className="d-flex gap-3">
                <Button variant="light" className="py-1 px-3 text-micro border bg-white rounded-3 flex-shrink-0" style={{ borderColor: '#EAE3D2', minWidth: '100px' }}>Decide later</Button>
                <Button
                  className="py-1 px-4 text-micro rounded-3 border-0 d-flex align-items-center justify-content-center gap-2 flex-grow-1"
                  style={{ backgroundColor: decision === 'approve' ? '#2D7A4E' : actionStyle.bg, color: 'white' }}
                >
                  {actionStyle.text} {actionStyle.icon}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EvidenceDetailView;
