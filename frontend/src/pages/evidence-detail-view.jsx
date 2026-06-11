import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Nav, Spinner, Alert } from 'react-bootstrap';
import { ArrowLeft, ChevronLeft, ChevronRight, Download, Plus, Check2, ExclamationTriangle, XCircle } from 'react-bootstrap-icons';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../component/Sidebar';
import axiosInstance from '../utils/axiosInstance';
import { getAssetUrl } from '../utils/assetUrl';
import '../styles/theme.css';

const getRelativeTime = (dateString) => {
  if (!dateString) return 'unknown time';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.round(diffMs / 60000);
  const diffHr = Math.round(diffMs / 3600000);
  const diffDay = Math.round(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const EvidenceDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State for interactivity
  const [submissionData, setSubmissionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFile, setActiveFile] = useState(0);
  const [decision, setDecision] = useState('approve');
  const [comment, setComment] = useState('');
  const [zoom, setZoom] = useState(100);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axiosInstance.get(`/api/kpi/manager/submissions/${id}`);
        setSubmissionData(res.data);
      } catch (err) {
        console.error('Failed to load submission detail:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch submission details.');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmission();
  }, [id]);

  const handleDecisionSubmit = async () => {
    try {
      setSaving(true);

      let status = 'Approved';
      if (decision === 'revision') status = 'Revision requested';
      if (decision === 'reject') status = 'Rejected';

      await axiosInstance.patch(`/api/kpi/manager/submissions/${id}/decision`, {
        status,
        comment
      });

      alert(`Submission has been ${status.toLowerCase()} successfully!`);
      navigate('/manager/verification-inbox');
    } catch (err) {
      console.error('Failed to submit decision:', err);
      alert(err.response?.data?.message || 'Error occurred while saving decision.');
    } finally {
      setSaving(false);
    }
  };

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

  if (loading) {
    return (
      <div className="d-flex">
        <Sidebar role="manager" />
        <main style={{ marginLeft: 'var(--sidebar-width)', flex: 1, padding: '40px 60px' }} className="d-flex justify-content-center align-items-center">
          <Spinner animation="border" variant="dark" className="me-2" />
          <span>Loading submission details...</span>
        </main>
      </div>
    );
  }

  if (error || !submissionData) {
    return (
      <div className="d-flex">
        <Sidebar role="manager" />
        <main style={{ marginLeft: 'var(--sidebar-width)', flex: 1, padding: '40px 60px' }}>
          <Alert variant="danger">
            {error || 'Submission not found.'}
          </Alert>
          <Button variant="dark" onClick={() => navigate('/manager/verification-inbox')}>
            Back to inbox
          </Button>
        </main>
      </div>
    );
  }

  // Determine evidence file details
  const files = submissionData?.evidenceUrls && submissionData.evidenceUrls.length > 0
    ? submissionData.evidenceUrls
    : (submissionData?.evidenceUrl ? [submissionData.evidenceUrl] : []);

  const activeFileUrl = getAssetUrl(files[activeFile]);

  const activeFileName = files[activeFile] ? files[activeFile].split('/').pop() : 'No file';
  const activeFileExtension = files[activeFile] ? files[activeFile].split('.').pop().toUpperCase() : 'NONE';
  const isActiveImage = ['PNG', 'JPG', 'JPEG', 'WEBP', 'GIF'].includes(activeFileExtension);

  return (
    <div className="d-flex">
      <Sidebar role="manager" />

      <main style={{
        marginLeft: 'var(--sidebar-width)',
        flex: 1,
        padding: '40px 60px',
        backgroundColor: 'var(--main-bg)',
        minHeight: '100vh'
      }}>
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
            <h2 className="serif-font mb-0" style={{ fontSize: '1.8rem', color: 'var(--text-main)' }}>
              Submission #{submissionData?.id ? submissionData.id.slice(-6) : (submissionData?._id ? String(submissionData._id).slice(-6) : '')}
            </h2>
          </div>

          <div className="d-flex align-items-center gap-2 mt-2">
            <Button variant="light" className="rounded-2 p-1 border shadow-sm" style={{ backgroundColor: '#FAF5E8' }} onClick={() => navigate('/manager/verification-inbox')}><ChevronLeft size={16} /></Button>
            <span className="text-micro fw-bold px-2">Inbox Item</span>
            <Button variant="light" className="rounded-2 p-1 border shadow-sm" style={{ backgroundColor: '#FAF5E8' }} onClick={() => navigate('/manager/verification-inbox')}><ChevronRight size={16} /></Button>
          </div>
        </div>

        <Row className="g-4">
          {/* Left Column: Evidence Viewer */}
          <Col lg={8}>
            {/* File Tabs */}
            <div className="d-flex gap-2 mb-3 flex-wrap">
              {files.length > 0 ? (
                files.map((file, idx) => {
                  const fName = file.split('/').pop() || `File ${idx + 1}`;
                  const fExt = file.split('.').pop().toUpperCase() || 'NONE';
                  const isSelected = activeFile === idx;
                  return (
                    <div
                      key={idx}
                      className="d-flex align-items-center gap-2 px-3 py-2 rounded-2 border bg-white shadow-sm"
                      style={{
                        fontSize: '11px',
                        borderColor: isSelected ? 'var(--text-main)' : '#EAE3D2',
                        cursor: 'pointer',
                        borderWidth: isSelected ? '1.5px' : '1px',
                        fontWeight: isSelected ? 'bold' : 'normal'
                      }}
                      onClick={() => setActiveFile(idx)}
                    >
                      <span className="rounded-1 px-1 fw-bold" style={{
                        backgroundColor: fExt === 'PDF' ? '#F4DAD8' : '#E4EDE7',
                        color: fExt === 'PDF' ? '#B23B3B' : '#0D3B2E',
                        fontSize: '9px'
                      }}>{fExt}</span>
                      {fName}
                    </div>
                  );
                })
              ) : (
                <div className="text-secondary text-xs">No files uploaded</div>
              )}
            </div>

            {/* Main Viewer Area */}
            <div className="viewer-container rounded-4 shadow-sm mb-3" style={{ backgroundColor: '#2A3D37', height: '550px', position: 'relative', overflow: 'auto', display: 'flex' }}>
              {activeFileUrl ? (
                isActiveImage ? (
                  <img
                    src={activeFileUrl}
                    alt="Evidence"
                    style={{
                      width: `${zoom}%`,
                      height: `${zoom}%`,
                      objectFit: 'contain',
                      margin: 'auto',
                      transition: 'width 0.2s ease, height 0.2s ease'
                    }}
                  />
                ) : (
                  <iframe
                    src={activeFileUrl}
                    title="Evidence Document"
                    style={{
                      width: `${zoom}%`,
                      height: `${zoom}%`,
                      border: 'none',
                      backgroundColor: '#FFFFFF',
                      margin: 'auto',
                      transition: 'width 0.2s ease, height 0.2s ease'
                    }}
                  />
                )
              ) : (
                <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white" style={{ margin: 'auto' }}>
                  <span>No evidence document uploaded</span>
                </div>
              )}
            </div>

            {/* External Metadata Bar */}
            {activeFileUrl && (
              <div className="p-3 rounded-4 shadow-sm" style={{ backgroundColor: '#0B2019' }}>
                <h5 className="mb-1 fw-bold" style={{ color: '#F5EFDF' }}>{activeFileName}</h5>
                <p className="mb-0 text-micro" style={{ color: '#F5EFDF', opacity: 0.8 }}>Uploaded by {submissionData?.staff?.name || 'Staff'}</p>
              </div>
            )}

            {/* Viewer Controls Bar */}
            <div className="d-flex justify-content-between align-items-center mt-3 p-3 bg-white rounded-3 border shadow-sm">
              <div className="text-secondary text-xs">
                {activeFileExtension} document evidence
              </div>

              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center rounded-pill px-2" style={{ backgroundColor: '#FAF5E8', border: '1px solid #EAE3D2' }}>
                  <Button variant="link" className="text-dark p-1" style={{ textDecoration: 'none' }} onClick={() => setZoom(Math.max(50, zoom - 10))}>—</Button>
                  <span className="text-xs fw-bold px-2">{zoom}%</span>
                  <Button variant="link" className="text-dark p-1" style={{ textDecoration: 'none' }} onClick={() => setZoom(Math.min(200, zoom + 10))}>+</Button>
                </div>
                {activeFileUrl && (
                  <a href={activeFileUrl} download className="btn btn-light text-xs px-3 py-1 rounded-pill border d-flex align-items-center gap-2 shadow-sm" style={{ backgroundColor: '#FAF5E8', borderColor: '#EAE3D2', textDecoration: 'none', color: '#1A1A1A' }}>
                    <Download size={14} /> Download
                  </a>
                )}
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
                    style={{ width: '48px', height: '48px', backgroundColor: '#FAF5E8', color: '#1b6a38', border: '1px solid #C0D6CB' }}>
                    {submissionData?.staff?.initials || 'ST'}
                  </div>
                  <div>
                    <div className="fw-bold fs-6" style={{ color: 'var(--text-main)' }}>{submissionData?.staff?.name || 'Staff'}</div>
                    <div className="text-secondary text-xs">{(submissionData?.staff?.role || 'Staff')} &middot; submitted {getRelativeTime(submissionData?.createdAt)}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-micro fw-bold text-secondary text-uppercase mb-2">KPI</label>
                  <div className="fw-bold" style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>{submissionData?.kpiTitle || ''}</div>
                </div>

                <div className="p-3 rounded-4 mb-4" style={{ backgroundColor: '#FAF5E8' }}>
                  <label className="text-micro fw-bold text-secondary text-uppercase mb-2">Requested Progress Update</label>
                  <div className="d-flex align-items-baseline gap-2 mb-2 serif-font">
                    <span className="text-secondary fs-4">{submissionData?.progress?.old ?? 0}%</span>
                    <span className="fs-4">&rarr;</span>
                    <span className="fw-bold fs-3">{submissionData?.progress?.new ?? 0}%</span>
                  </div>
                  <div className="text-xs text-secondary">
                    <span className="rounded-pill px-2 py-1 fw-bold me-1" style={{ backgroundColor: '#E4EDE7', color: '#0D3B2E' }}>
                      +{(submissionData?.progress?.new ?? 0) - (submissionData?.progress?.old ?? 0)}%
                    </span>
                    marking KPI progress
                  </div>
                </div>

                <div>
                  <label className="text-micro fw-bold text-secondary text-uppercase mb-2">Staff Note</label>
                  <p className="text-secondary mb-0" style={{ fontSize: '13px', lineHeight: '1.6' }}>
                    {submissionData?.note || "No note was attached to this submission."}
                  </p>
                </div>
              </Card.Body>
            </Card>

            {/* Decision Card */}
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
                  placeholder="Add a comment or decision reason..."
                  className="textarea-custom mb-4 shadow-none"
                  style={{ backgroundColor: '#F3EDDF', borderColor: '#EAE3D2' }}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />

                <div className="d-flex gap-3">
                  <Button variant="light" className="py-1 px-3 text-micro border bg-white rounded-3 flex-shrink-0" style={{ borderColor: '#EAE3D2', minWidth: '100px' }} onClick={() => navigate('/manager/verification-inbox')}>Cancel</Button>
                  <Button
                    className="py-1 px-4 text-micro rounded-3 border-0 d-flex align-items-center justify-content-center gap-2 flex-grow-1"
                    style={{ backgroundColor: decision === 'approve' ? '#2D7A4E' : actionStyle.bg, color: 'white' }}
                    onClick={handleDecisionSubmit}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : actionStyle.text} {!saving && actionStyle.icon}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </main>
    </div>
  );
};

export default EvidenceDetailView;
