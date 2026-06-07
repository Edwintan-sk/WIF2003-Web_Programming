import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { ArrowLeft, ChevronLeft, ChevronRight, Download, Check2, ExclamationTriangle, XCircle } from 'react-bootstrap-icons';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../component/Sidebar';
import api from '../utils/axiosInstance';
import '../styles/theme.css';

const EvidenceDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Component states
  const [submissionData, setSubmissionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Interactive controls states
  const [activeFile, setActiveFile] = useState(0);
  const [decision, setDecision] = useState('approve');
  const [comment, setComment] = useState('');
  const [zoom, setZoom] = useState(100);

  const fetchSubmissionDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get(`/api/kpis/submissions/${id}`);
      setSubmissionData(response.data);
      setComment(response.data.managerComment || '');
      setDecision(response.data.status === 'Pending' ? 'approve' : response.data.status === 'Revision Requested' ? 'revision' : response.data.status.toLowerCase());
      setActiveFile(0);
      setZoom(100);
    } catch (err) {
      console.error('Error fetching submission details:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred while loading submission details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissionDetails();
  }, [id]);

  const handleSubmitDecision = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMsg('');

      await api.post(`/api/kpis/submissions/${id}/review`, {
        decision,
        comment
      });

      setSuccessMsg('Review decision submitted successfully!');

      setTimeout(() => {
        if (submissionData.queue?.nextId) {
          navigate(`/manager/evidence-detail/${submissionData.queue.nextId}`);
        } else {
          navigate('/manager/verification-inbox');
        }
      }, 1500);

    } catch (err) {
      console.error('Error submitting review decision:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred while submitting decision.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex">
        <Sidebar role="manager" />
        <main style={{ marginLeft: 'var(--sidebar-width)', flex: 1, padding: '40px 60px', backgroundColor: 'var(--main-bg)', minHeight: '100vh' }} className="d-flex justify-content-center align-items-center">
          <div className="text-center">
            <Spinner animation="border" variant="dark" className="mb-2" />
            <p className="serif-font fw-medium text-secondary">Loading submission details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error && !submissionData) {
    return (
      <div className="d-flex">
        <Sidebar role="manager" />
        <main style={{ marginLeft: 'var(--sidebar-width)', flex: 1, padding: '40px 60px', backgroundColor: 'var(--main-bg)', minHeight: '100vh' }} className="p-5">
          <Alert variant="danger" className="shadow-sm rounded-3">
            <Alert.Heading className="fs-6 fw-bold">Error Loading Details</Alert.Heading>
            <p className="mb-0 text-sm">{error}</p>
          </Alert>
          <Button variant="link" onClick={() => navigate('/manager/verification-inbox')} className="text-dark p-0 mt-3 d-flex align-items-center gap-2">
            <ArrowLeft size={16} /> Back to verification inbox
          </Button>
        </main>
      </div>
    );
  }

  const activeFileData = submissionData.files && submissionData.files.length > 0 ? submissionData.files[activeFile] : null;

  // Logic for the primary action button styling
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
            <h2 className="serif-font mb-0" style={{ fontSize: '1.8rem', color: 'var(--text-main)' }}>Submission #{submissionData.id.substring(Math.max(0, submissionData.id.length - 6))}</h2>
          </div>

          <div className="d-flex align-items-center gap-2 mt-2">
            <Button 
              variant="light" 
              className="rounded-2 p-1 border shadow-sm" 
              style={{ backgroundColor: '#FAF5E8', opacity: submissionData.queue?.previousId ? 1 : 0.5 }}
              disabled={!submissionData.queue?.previousId}
              onClick={() => navigate(`/manager/evidence-detail/${submissionData.queue.previousId}`)}
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="text-micro fw-bold px-2">{submissionData.queue?.index} of {submissionData.queue?.total}</span>
            <Button 
              variant="light" 
              className="rounded-2 p-1 border shadow-sm" 
              style={{ backgroundColor: '#FAF5E8', opacity: submissionData.queue?.nextId ? 1 : 0.5 }}
              disabled={!submissionData.queue?.nextId}
              onClick={() => navigate(`/manager/evidence-detail/${submissionData.queue.nextId}`)}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="danger" className="mb-4 shadow-sm rounded-3">
            {error}
          </Alert>
        )}

        {successMsg && (
          <Alert variant="success" className="mb-4 shadow-sm rounded-3">
            {successMsg}
          </Alert>
        )}

        <Row className="g-4">
          {/* Left Column: Evidence Viewer */}
          <Col lg={8}>
            {/* File Tabs */}
            {submissionData.files && submissionData.files.length > 0 ? (
              <div className="d-flex gap-2 mb-3">
                {submissionData.files.map((file, idx) => (
                  <div
                    key={idx}
                    className={`d-flex align-items-center gap-2 px-3 py-2 rounded-2 border cursor-pointer transition-all ${activeFile === idx ? 'bg-white shadow-sm border-secondary' : 'bg-transparent text-secondary'}`}
                    style={{ fontSize: '11px', cursor: 'pointer', opacity: activeFile === idx ? 1 : 0.7, borderColor: activeFile === idx ? 'var(--text-main)' : '#EAE3D2' }}
                    onClick={() => setActiveFile(idx)}
                  >
                    <span className="rounded-1 px-1 fw-bold" style={{
                      backgroundColor: file.type === 'PDF' ? '#F4DAD8' : file.type === 'IMG' ? '#E4EDE7' : '#EAE3D2',
                      color: file.type === 'PDF' ? '#B23B3B' : file.type === 'IMG' ? '#0D3B2E' : 'var(--text-main)',
                      fontSize: '9px'
                    }}>{file.type}</span>
                    {file.name}
                  </div>
                ))}
              </div>
            ) : null}

            {/* Main Viewer Area */}
            <div className="viewer-container rounded-4 overflow-hidden shadow-sm mb-3" style={{ backgroundColor: '#2A3D37', height: '550px', position: 'relative' }}>
              {activeFileData ? (
                <div className="w-100 h-100 d-flex align-items-center justify-content-center overflow-auto" style={{ position: 'relative' }}>
                  {activeFileData.type === 'IMG' && (
                    <div style={{ transform: `scale(${zoom / 100})`, transition: 'transform 0.1s ease', display: 'inline-block' }}>
                      <img 
                        src={`http://localhost:5000${activeFileData.url}`} 
                        alt={activeFileData.name}
                        style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }}
                      />
                    </div>
                  )}
                  {activeFileData.type === 'PDF' && (
                    <iframe 
                      src={`http://localhost:5000${activeFileData.url}`} 
                      title={activeFileData.name}
                      width="100%" 
                      height="100%" 
                      style={{ border: 'none', backgroundColor: '#FFF' }}
                    />
                  )}
                  {activeFileData.type === 'VID' && (
                    <video 
                      src={`http://localhost:5000${activeFileData.url}`} 
                      controls 
                      width="100%" 
                      height="100%" 
                      style={{ objectFit: 'contain' }}
                    />
                  )}
                  {activeFileData.type === 'FILE' && (
                    <div className="text-center text-white p-4">
                      <div className="fs-1 mb-3">📄</div>
                      <h5 className="serif-font mb-2">{activeFileData.name}</h5>
                      <p className="text-light text-xs opacity-75">Preview is not supported for this file format.</p>
                      <a href={`http://localhost:5000${activeFileData.url}`} download className="btn btn-outline-light rounded-pill px-4 mt-2">
                        Download File
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-white text-center">
                  <div className="fs-1 mb-3">📁</div>
                  <h5 className="serif-font">No Evidence Files Attached</h5>
                  <p className="text-light text-xs opacity-75">This progress update did not upload any evidence files.</p>
                </div>
              )}
            </div>

            {/* External Metadata Bar */}
            {activeFileData && (
              <div className="p-3 rounded-4 shadow-sm mb-3" style={{ backgroundColor: '#0B2019' }}>
                <h5 className="mb-1 fw-bold text-truncate" style={{ color: '#F5EFDF' }}>{activeFileData.name}</h5>
                <p className="mb-0 text-micro text-truncate" style={{ color: '#F5EFDF', opacity: 0.8 }}>
                  Uploaded by {submissionData.staff.name} &bull; File Date: {activeFileData.date}
                </p>
              </div>
            )}

            {/* Viewer Controls Bar */}
            {activeFileData && (
              <div className="d-flex justify-content-between align-items-center mt-3 p-3 bg-white rounded-3 border shadow-sm">
                <div className="text-secondary text-xs">
                  Format: {activeFileData.type} &middot; Size: {activeFileData.size || 'N/A'}
                </div>

                <div className="d-flex align-items-center gap-3">
                  {activeFileData.type === 'IMG' && (
                    <div className="d-flex align-items-center rounded-pill px-2" style={{ backgroundColor: '#FAF5E8', border: '1px solid #EAE3D2' }}>
                      <Button variant="link" className="text-dark p-1" style={{ textDecoration: 'none' }} onClick={() => setZoom(Math.max(50, zoom - 10))}>—</Button>
                      <span className="text-xs fw-bold px-2">{zoom}%</span>
                      <Button variant="link" className="text-dark p-1" style={{ textDecoration: 'none' }} onClick={() => setZoom(Math.min(200, zoom + 10))}>+</Button>
                    </div>
                  )}
                  <a 
                    href={`http://localhost:5000${activeFileData.url}`} 
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-light text-xs px-3 py-1 rounded-pill border d-flex align-items-center gap-2 shadow-sm" 
                    style={{ backgroundColor: '#FAF5E8', borderColor: '#EAE3D2', textDecoration: 'none', color: '#000' }}
                  >
                    <Download size={14} /> Download
                  </a>
                </div>
              </div>
            )}
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
                    marking KPI as {submissionData.progress.new === 100 ? 'complete' : 'updated'}
                  </div>
                </div>

                <div>
                  <label className="text-micro fw-bold text-secondary text-uppercase mb-2">Staff Note</label>
                  <p className="text-secondary mb-0" style={{ fontSize: '13px', lineHeight: '1.6' }}>
                    {submissionData.note || 'No notes provided.'}
                  </p>
                </div>
              </Card.Body>
            </Card>

            {/* Your Decision Card */}
            <Card className="custom-card border-0 shadow-sm">
              <Card.Body className="p-4">
                <h3 className="serif-font mb-4">Your decision</h3>

                {submissionData.status !== 'Pending' ? (
                  <div className="p-3 rounded-4 mb-3" style={{ 
                    backgroundColor: submissionData.status === 'Approved' ? '#e2efe9' : submissionData.status === 'Rejected' ? '#fce8e6' : '#fef2e4',
                    color: submissionData.status === 'Approved' ? '#183628' : submissionData.status === 'Rejected' ? '#c73a24' : '#a87022',
                  }}>
                    <h5 className="fw-bold mb-1 d-flex align-items-center gap-2">
                      {submissionData.status === 'Approved' ? <Check2 size={18} /> : submissionData.status === 'Rejected' ? <XCircle size={16} /> : <ExclamationTriangle size={16} />}
                      Reviewed: {submissionData.status === 'Revision Requested' ? 'Revision Requested' : submissionData.status}
                    </h5>
                    <p className="mb-0 text-sm mt-2" style={{ lineHeight: '1.4' }}>
                      <strong>Feedback comment:</strong> {submissionData.managerComment || 'No feedback comments provided.'}
                    </p>
                    <div className="mt-3 text-micro text-uppercase fw-semibold" style={{ opacity: 0.7 }}>
                      This submission has been finalized.
                    </div>
                  </div>
                ) : (
                  <>
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
                      <Button variant="light" className="py-1 px-3 text-micro border bg-white rounded-3 flex-shrink-0" style={{ borderColor: '#EAE3D2', minWidth: '100px' }} onClick={() => navigate('/manager/verification-inbox')}>Decide later</Button>
                      <Button
                        disabled={isSubmitting}
                        className="py-1 px-4 text-micro rounded-3 border-0 d-flex align-items-center justify-content-center gap-2 flex-grow-1"
                        style={{ backgroundColor: decision === 'approve' ? '#2D7A4E' : actionStyle.bg, color: 'white' }}
                        onClick={handleSubmitDecision}
                      >
                        {isSubmitting ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-1" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            {actionStyle.text} {actionStyle.icon}
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </main>
    </div>
  );
};

export default EvidenceDetailView;
