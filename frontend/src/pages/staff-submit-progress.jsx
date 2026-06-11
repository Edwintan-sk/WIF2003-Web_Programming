import React, { useState, useEffect, useRef } from 'react';
import { Form, InputGroup, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { Search, ArrowRight, Trash } from 'react-bootstrap-icons';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Sidebar from '../component/Sidebar';
import api from '../utils/axiosInstance';
import { getAssetUrl } from '../utils/assetUrl';
import '../styles/theme.css'; 

export default function StaffSubmitProgress() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryKpiId = searchParams.get('kpiId');

  const [kpis, setKpis] = useState([]);
  const [selectedKpiId, setSelectedKpiId] = useState(queryKpiId || '');
  const [progressValue, setProgressValue] = useState(0);
  const [notes, setNotes] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fileInputRef = useRef(null);

  // Fetch KPIs on component mount
  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await api.get('/api/kpi/assigned');
        const data = response.data.data || response.data || [];
        
        setKpis(data);

        // Resolve default KPI selection
        if (data.length > 0) {
          const matchId = queryKpiId || data[0].id;
          setSelectedKpiId(matchId);
          const found = data.find(k => k.id === matchId);
          if (found) {
            const draft = localStorage.getItem(`kpi_draft_${matchId}`);
            if (draft) {
              try {
                const parsed = JSON.parse(draft);
                setProgressValue(parsed.progressValue ?? (found.progressValue || 0));
                setNotes(parsed.notes || '');
              } catch (e) {
                setProgressValue(found.progressValue || 0);
              }
            } else {
              setProgressValue(found.progressValue || 0);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching KPIs:', err);
        setError(err.response?.data?.message || err.message || 'An error occurred while loading KPIs.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchKPIs();
  }, [queryKpiId]);

  // Find the selected KPI details
  const activeKpi = kpis.find(k => k.id === selectedKpiId);
  const isKpiCompleted = activeKpi && (activeKpi.status || '').toLowerCase() === 'completed';

  const handleKpiChange = (e) => {
    const newId = e.target.value;
    setSelectedKpiId(newId);
    setSelectedFiles([]); // Reset files on KPI change
    const found = kpis.find(k => k.id === newId);
    if (found) {
      const draft = localStorage.getItem(`kpi_draft_${newId}`);
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          setProgressValue(parsed.progressValue ?? (found.progressValue || 0));
          setNotes(parsed.notes || '');
        } catch (e) {
          setProgressValue(found.progressValue || 0);
          setNotes('');
        }
      } else {
        setProgressValue(found.progressValue || 0);
        setNotes('');
      }
    }
  };

  const handleSaveDraft = () => {
    if (!selectedKpiId) return;
    if (isKpiCompleted) return;
    const draft = { progressValue, notes };
    localStorage.setItem(`kpi_draft_${selectedKpiId}`, JSON.stringify(draft));
    setSuccessMsg('Draft saved successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleFileChange = (e) => {
    if (isKpiCompleted) return;
    const files = Array.from(e.target.files);
    const validFiles = [];
    for (let file of files) {
      if (file.size > 25 * 1024 * 1024) {
        alert(`File "${file.name}" is too large! Maximum size is 25MB.`);
        continue;
      }
      validFiles.push(file);
    }
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleDropzoneClick = () => {
    if (isKpiCompleted) return;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveFile = (index, e) => {
    e.stopPropagation();
    if (isKpiCompleted) return;
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedKpiId) {
      setError('Please select a KPI to update.');
      return;
    }
    if (isKpiCompleted) {
      setError('Cannot submit progress updates to an already completed and approved KPI.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMsg('');

      const formData = new FormData();
      formData.append('kpiId', selectedKpiId);
      formData.append('newMetricValue', progressValue);
      formData.append('notes', notes);
      if (selectedFiles && selectedFiles.length > 0) {
        selectedFiles.forEach((file) => {
          formData.append('evidenceFiles', file);
        });
      }

      const response = await api.post('/api/kpi/progress', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Clear draft after successful submission
      localStorage.removeItem(`kpi_draft_${selectedKpiId}`);

      setSuccessMsg('Progress update submitted successfully!');
      setNotes('');
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';

      setTimeout(() => {
        navigate('/staff/kpis');
      }, 1500);

    } catch (err) {
      console.error('Error submitting progress:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred while submitting progress.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="d-flex">
      <Sidebar role="staff" />
      <main className="staff-main-content">
        <header className="d-flex justify-content-between align-items-start mb-5">
          <div>
            <p className="text-secondary fw-bold text-uppercase staff-text-micro mb-1">Workspace / Submit Progress</p>
            <h1 className="fw-bold m-0 fs-4">
              {activeKpi ? `Update: ${activeKpi.title}` : 'Update KPI Progress'}
            </h1>
          </div>
          <div className="d-flex align-items-center gap-3">
            <InputGroup className="bg-white rounded-3 shadow-sm align-items-center px-2 search-wrapper">
              <Search size={16} className="text-secondary ms-2" />
              <Form.Control type="text" placeholder="Search KPIs, evidence..." className="bg-transparent border-0 shadow-none py-2 staff-text-sm"/>
            </InputGroup>
            <button className="btn bg-white btn-square-42 shadow-sm rounded-3 p-2 d-flex align-items-center justify-content-center border-0">
              <div className="menu-square"></div>
            </button>
          </div>
        </header>

        <div className="header-divider"></div>

        {error && (
          <Alert variant="danger" className="mb-4 shadow-sm rounded-3">
            <Alert.Heading className="fs-6 fw-bold">Failed to submit update</Alert.Heading>
            <p className="mb-0 staff-text-sm">{error}</p>
          </Alert>
        )}

        {successMsg && (
          <Alert variant="success" className="mb-4 shadow-sm rounded-3">
            <Alert.Heading className="fs-6 fw-bold">Success</Alert.Heading>
            <p className="mb-0 staff-text-sm">{successMsg}</p>
          </Alert>
        )}

        {isLoading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <Spinner animation="border" variant="dark" className="me-2" />
            <span className="serif-font fw-medium">Loading KPI workspace...</span>
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            {kpis.length === 0 ? (
              <div className="staff-custom-card p-5 text-center shadow-sm">
                <h4 className="fw-bold text-dark mb-3">No KPIs Available</h4>
                <p className="text-muted mb-0">
                  You currently have no assigned KPIs to update. Please wait for your manager to assign a KPI, or log in with an account that has active assignments.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 p-4 staff-custom-card bg-white shadow-sm rounded-3 d-flex flex-column gap-2">
                  <h5 className="fw-bold mb-0 text-dark fs-6">Select KPI to update</h5>
                  <Form.Select 
                    value={selectedKpiId} 
                    onChange={handleKpiChange}
                    className="border border-light-gray shadow-none py-2 px-3 rounded fw-medium bg-white text-dark kpi-card-max-width"
                  >
                    {kpis.map(k => (
                      <option key={k.id} value={k.id}>{k.title}</option>
                    ))}
                  </Form.Select>
                </div>

                {activeKpi && (
                  <Row className="g-4">
                    <Col lg={8}>
                      {/* Top Info Card */}
                      <div className="staff-custom-card p-4 mb-4">
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <span className="badge rounded staff-kpi-tag font-monospace" style={{ backgroundColor: '#e2efe9', color: '#183628' }}>
                            {activeKpi.tag1 || 'Community'}
                          </span>
                          <span className="staff-text-sm text-muted">
                            · Assigned by Manager · <span className="fw-bold text-dark">Due {activeKpi.due}</span>
                          </span>
                        </div>
                        
                        <h3 className="serif-font fw-bold mb-4 fs-4 text-dark">
                          {activeKpi.title}
                        </h3>

                        <div className="d-flex align-items-center gap-3">
                          <span className="fw-semibold text-uppercase text-muted staff-text-overline">
                            Current
                          </span>
                          <div className="staff-progress-track-md flex-grow-1 overflow-hidden rounded-pill">
                            <div className="h-100" style={{ backgroundColor: 'var(--sidebar-bg)', width: `${activeKpi.progressValue}%` }}></div>
                          </div>
                          <span className="fw-bold staff-text-sm text-dark">
                            {activeKpi.progressValue}% · <span className="fw-normal text-muted">{activeKpi.subProgress || 'in progress'}</span>
                          </span>
                        </div>
                      </div>

                      {/* Form Card */}
                      <div className="staff-custom-card p-4 p-md-5">
                        {isKpiCompleted && (
                          <Alert variant="success" className="mb-4 shadow-sm rounded-3">
                            <Alert.Heading className="fs-6 fw-bold">KPI Completed & Approved</Alert.Heading>
                            <p className="mb-0 staff-text-sm">
                              This KPI has been completed and approved by the manager. You are not allowed to update the progress or upload new evidence.
                            </p>
                          </Alert>
                        )}

                        {/* Progress Slider Section */}
                        <div className="mb-5">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="fw-bold mb-0 text-dark fs-6">Progress update</h5>
                            <div className="serif-font fw-bold fs-5 staff-text-primary-dark">
                              {activeKpi.progressValue}% → {progressValue}%
                            </div>
                          </div>
                          
                          <div className="position-relative mb-2">
                            {/* Interactive Drag Bar */}
                            <input 
                              type="range" 
                              className="staff-custom-range w-100" 
                              min="0" 
                              max="100" 
                              step="25"
                              value={progressValue} 
                              onChange={(e) => setProgressValue(Number(e.target.value))} 
                              style={{ background: `linear-gradient(to right, var(--sidebar-bg) ${progressValue}%, #e8e4d9 ${progressValue}%)` }} 
                              disabled={isKpiCompleted}
                            />
                          </div>
                          
                          <div className="d-flex justify-content-between text-muted staff-text-mini fw-medium">
                            <span>0%</span>
                            <span>25%</span>
                            <span>50%</span>
                            <span>75%</span>
                            <span>100%</span>
                          </div>
                          <p className="mt-3 mb-0 staff-text-sm text-muted">
                            Drag to update. Marking 100% will move this KPI to Completed after review.
                          </p>
                        </div>

                        {/* Textarea Section */}
                        <div className="mb-5">
                          <h5 className="fw-bold mb-3 text-dark fs-6">What changed?</h5>
                          <Form.Control 
                            as="textarea" 
                            rows={4} 
                            className="staff-textarea-custom"
                            placeholder="Detail recent activities, milestone completions, and target achievements..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            required={!isKpiCompleted}
                            disabled={isKpiCompleted}
                          />
                        </div>

                        {/* File Upload Section */}
                        <div className="mb-5">
                          <h5 className="fw-bold mb-3 text-dark fs-6">Evidence files</h5>
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            style={{ display: 'none' }} 
                            className="d-none" 
                            accept=".pdf,.jpg,.jpeg,.png,.mp4"
                            multiple
                            disabled={isKpiCompleted}
                          />
                          <div 
                            className={`staff-dashed-dropzone ${isKpiCompleted ? 'pe-none opacity-50' : ''}`} 
                            onClick={handleDropzoneClick}
                            style={{ cursor: isKpiCompleted ? 'not-allowed' : 'pointer' }}
                          >
                            <div>
                              <div className="fw-bold mb-1 fs-6">Click to browse files</div>
                              <div className="staff-text-sm text-muted">PDF, JPG, PNG, MP4 · up to 25 MB each (Multiple allowed)</div>
                            </div>
                          </div>
                          
                          {selectedFiles.length > 0 && (
                            <div className="mt-3 d-flex flex-column gap-2">
                              {selectedFiles.map((file, index) => (
                                <div key={index} className="d-flex align-items-center justify-content-between p-2 rounded bg-light border">
                                  <span className="staff-text-sm text-dark text-truncate" style={{ maxWidth: '85%' }}>
                                    📄 {file.name} <span className="text-muted">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                                  </span>
                                  {!isKpiCompleted && (
                                    <button 
                                      type="button" 
                                      className="btn btn-sm text-danger p-0 border-0 ms-2" 
                                      onClick={(e) => handleRemoveFile(index, e)} 
                                      title="Remove file"
                                    >
                                      <Trash size={18} />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="d-flex justify-content-between align-items-center pt-2">
                          <button 
                            type="button" 
                            className="btn staff-btn-outline-custom shadow-sm" 
                            onClick={handleSaveDraft}
                            disabled={isKpiCompleted || isSubmitting}
                          >
                            Save draft
                          </button>
                          <button 
                            type="submit" 
                            className="btn staff-btn-primary-dark shadow-sm d-flex align-items-center gap-2"
                            disabled={isKpiCompleted || isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <Spinner animation="border" size="sm" className="me-1" />
                                Submitting...
                              </>
                            ) : (
                              <>
                                Submit for review <ArrowRight size={16} />
                              </>
                            )}
                          </button>
                        </div>

                      </div>
                    </Col>

                    {/* Right Column - Sidebar Widgets */}
                    <Col lg={4}>
                      {/* History Widget */}
                      <div className="staff-custom-card p-4 mb-4">
                        <h5 className="serif-font fw-bold mb-4 fs-5 text-dark">Submission history</h5>
                        
                        <div className="d-flex flex-column gap-3">
                          {activeKpi.submissions && activeKpi.submissions.length > 0 ? (
                            [...activeKpi.submissions].reverse().map((sub, idx) => {
                              const dateObj = new Date(sub.createdAt || new Date());
                              const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                              
                              let statusBg = '#fef2e4';
                              let statusColor = '#a87022';
                              if (sub.status === 'Approved') {
                                statusBg = '#dcf0e2';
                                statusColor = '#183628';
                              } else if (sub.status === 'Rejected') {
                                statusBg = '#fce8e6';
                                statusColor = '#c73a24';
                              } else if (sub.status === 'Revision requested') {
                                statusBg = '#fbe9e7';
                                statusColor = '#d35400';
                              }
                              
                              return (
                                <div className="history-item d-flex align-items-start gap-3" key={sub._id || idx}>
                                  <div 
                                    className="history-circle rounded-circle d-flex align-items-center justify-content-center fw-bold staff-text-xs flex-shrink-0" 
                                    style={{ backgroundColor: statusBg, color: statusColor, width: '42px', height: '42px' }}
                                  >
                                    {sub.progressValue}%
                                  </div>
                                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                    <div className="fw-bold mb-1 staff-text-sm text-dark d-flex justify-content-between align-items-center">
                                      <span>{dateStr}</span>
                                      <span className="badge font-monospace" style={{ backgroundColor: statusBg, color: statusColor, fontSize: '9px', textTransform: 'uppercase' }}>
                                        {sub.status}
                                      </span>
                                    </div>
                                    <div className="text-muted staff-text-mini">
                                      {sub.notes ? sub.notes : 'Update logged'}
                                    </div>
                                    
                                    {/* Multiple Files display in Submission History */}
                                    {((sub.evidenceUrls && sub.evidenceUrls.length > 0) || sub.evidenceUrl) && (
                                      <div className="mt-2 d-flex flex-wrap gap-2" style={{ maxWidth: '100%' }}>
                                        {sub.evidenceUrls && sub.evidenceUrls.length > 0 ? (
                                          sub.evidenceUrls.map((url, uidx) => {
                                            const fName = url.split('/').pop() || `File ${uidx + 1}`;
                                            return (
                                              <a
                                                key={uidx}
                                                href={getAssetUrl(url)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="badge bg-light text-dark border d-inline-flex align-items-center gap-1 text-decoration-none"
                                                style={{ fontSize: '10px', maxWidth: '100%', overflow: 'hidden' }}
                                                title={fName}
                                              >
                                                <span className="text-truncate" style={{ maxWidth: '100%' }}>📎 {fName}</span>
                                              </a>
                                            );
                                          })
                                        ) : (
                                          <a
                                            href={getAssetUrl(sub.evidenceUrl)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="badge bg-light text-dark border d-inline-flex align-items-center gap-1 text-decoration-none"
                                            style={{ fontSize: '10px', maxWidth: '100%', overflow: 'hidden' }}
                                            title={sub.evidenceUrl.split('/').pop() || 'Attachment'}
                                          >
                                            <span className="text-truncate" style={{ maxWidth: '100%' }}>📎 {sub.evidenceUrl.split('/').pop() || 'Attachment'}</span>
                                          </a>
                                        )}
                                      </div>
                                    )}

                                    {sub.feedback && (
                                      <div className="mt-2 p-2 rounded" style={{ backgroundColor: '#fff8e1', borderLeft: '3px solid #ffb300', fontSize: '11px', color: '#5d4037' }}>
                                        <strong>Manager Comment:</strong> {sub.feedback}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-secondary staff-text-sm text-center mb-0 mt-3 py-3">
                              No progress updates submitted yet.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Note Widget */}
                      <div className="staff-custom-card staff-info-card p-4">
                        <h5 className="serif-font fw-bold mb-3 fs-5">A note on evidence</h5>
                        <p className="mb-0 staff-text-sm staff-text-note">
                          Strong submissions include timestamps, a short description, and at least one piece of visual proof. 
                          Reviews typically return within 48 hours.
                        </p>
                      </div>
                    </Col>
                  </Row>
                )}
              </>
            )}
          </Form>
        )}
      </main>
    </div>
  );
}

