import React, { useState, useRef } from 'react';
import { Form, InputGroup, Row, Col } from 'react-bootstrap';
import { Search, ArrowRight, Trash } from 'react-bootstrap-icons';
import Sidebar from '../component/Sidebar';
import '../styles/theme.css'; 

export default function StaffSubmitProgress() {
  const [progressValue, setProgressValue] = useState(100);
  
  const [selectedFile, setSelectedFile] = useState(null);
  // Create a reference to hidden file input
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Ensure under 25MB
      if (file.size > 25 * 1024 * 1024) {
        alert("File is too large! Maximum size is 25MB.");
        return;
      }
      setSelectedFile(file);
    }
  }

  const handleDropzoneClick = () => {
    fileInputRef.current.click();
  }

  const handleRemoveFile = (e) => {
    // Prevents the click from triggering the dropzone
    e.stopPropagation();
    setSelectedFile(null);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
        <div className="d-flex">
            <Sidebar role="staff" />
            <main className="staff-main-content">
                <header className="d-flex justify-content-between align-items-start mb-5">
                <div>
                  <p className="text-secondary fw-bold text-uppercase staff-text-micro mb-1">Workspace / Submit Progress</p>
                  <h1 className="fw-bold m-0 fs-4">Update: Host 4 community outreach events</h1>
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

            <Row className="g-4">
              <Col lg={8}>
                {/* Top Info Card */}
                <div className="staff-custom-card p-4 mb-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <span className="badge rounded staff-kpi-tag font-monospace" style={{ backgroundColor: '#e2efe9', color: '#183628' }}>
                      Community
                    </span>
                    <span className="staff-text-sm text-muted">
                      · Assigned by Lee Chen · <span className="fw-bold text-dark">Due Nov 30</span>
                    </span>
                  </div>
                  
                  <h3 className="serif-font fw-bold mb-4 fs-4 text-dark">
                    Host 4 community outreach events
                  </h3>

                  <div className="d-flex align-items-center gap-3">
                    <span className="fw-semibold text-uppercase text-muted staff-text-overline">
                      Current
                    </span>
                    <div className="staff-progress-track-md flex-grow-1 overflow-hidden rounded-pill">
                      <div className="h-100" style={{ backgroundColor: 'var(--sidebar-bg)', width: '75%' }}></div>
                    </div>
                    <span className="fw-bold staff-text-sm text-dark">
                      75% · <span className="fw-normal text-muted">3/4 done</span>
                    </span>
                  </div>
                </div>

                {/* Form Card */}
                <div className="staff-custom-card p-4 p-md-5">
                  
                  {/* Progress Slider Section */}
                  <div className="mb-5">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="fw-bold mb-0 text-dark fs-6">Progress update</h5>
                      <div className="serif-font fw-bold fs-5 staff-text-primary-dark">
                        75% → {progressValue}%
                      </div>
                    </div>
                    
                    <div className="position-relative mb-2">
                      {/* Interactive Drag Bar */}
                      <input type="range" className="staff-custom-range w-100" min="0" max="100" step="25" 
                        value={progressValue} onChange={(e) => setProgressValue(e.target.value)} 
                        style={{ background: `linear-gradient(to right, var(--sidebar-bg) ${progressValue}%, #e8e4d9 ${progressValue}%)` }} 
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
                      defaultValue="Hosted the 4th event at the East Library on Nov 18. 52 attendees, media coverage by Star News. Photos and attendance log attached."/>
                  </div>

                  {/* File Upload Section */}
                  <div className="mb-5">
                    <h5 className="fw-bold mb-3 text-dark fs-6">Evidence files</h5>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} className="d-none" accept=".pdf,.jpg,.jpeg,.png,.mp4"/>
                    <div className="staff-dashed-dropzone" onClick={handleDropzoneClick}>
                      {selectedFile ? (
                        <div>
                          <div className="fw-bold mb-1 fs-6 staff-text-primary-dark d-flex justify-content-center align-items-center gap-2">
                            📄 {selectedFile.name}
                            <button className="btn btn-sm text-danger p-0 border-0 ms-2" onClick={handleRemoveFile} title="Remove file">
                              <Trash size={18} />
                            </button>
                          </div>
                          <div className="staff-text-sm text-muted">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </div>
                        </div>
                      ) : (
                        // Show if no file is selected
                        <div>
                          <div className="fw-bold mb-1 fs-6">Click to browse files</div>
                          <div className="staff-text-sm text-muted">PDF, JPG, PNG, MP4 · up to 25 MB each</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="d-flex justify-content-between align-items-center pt-2">
                    <button className="btn staff-btn-outline-custom shadow-sm">
                      Save draft
                    </button>
                    <button className="btn staff-btn-primary-dark shadow-sm d-flex align-items-center gap-2">
                      Submit for review <ArrowRight size={16} />
                    </button>
                  </div>

                </div>
              </Col>

              {/* Right Column - Sidebar Widgets */}
              <Col lg={4}>
                
                {/* History Widget */}
                <div className="staff-custom-card p-4 mb-4">
                  <h5 className="serif-font fw-bold mb-4 fs-5 text-dark">Submission history</h5>
                  
                  <div className="history-item">
                    <div className="history-circle" style={{ backgroundColor: '#dcf0e2' }}>50%</div>
                    <div>
                      <div className="fw-bold mb-1 staff-text-sm text-dark">Oct 15</div>
                      <div className="text-muted staff-text-mini">Approved — Event 2 complete</div>
                    </div>
                  </div>
                  
                  <div className="history-item">
                    <div className="history-circle" style={{ backgroundColor: '#dcf0e2' }}>25%</div>
                    <div>
                      <div className="fw-bold mb-1 staff-text-sm text-dark">Sep 02</div>
                      <div className="text-muted staff-text-mini">Approved — Event 1 complete</div>
                    </div>
                  </div>

                  <div className="history-item">
                    <div className="history-circle bg-light text-muted border">0%</div>
                    <div>
                      <div className="fw-bold mb-1 staff-text-sm text-dark">Aug 10</div>
                      <div className="text-muted staff-text-mini">KPI assigned by Lee Chen</div>
                    </div>
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
            </main>
        </div>
  );
}

