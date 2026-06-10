import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Spinner, Alert, Dropdown } from 'react-bootstrap';
import { ArrowRight, Search } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../component/Sidebar';
import axiosInstance from '../utils/axiosInstance';
import '../styles/theme.css';

const VerificationInbox = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('Pending');
  const [selectedSubIds, setSelectedSubIds] = useState([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axiosInstance.get('/api/kpi/manager/submissions');
        setSubmissions(res.data || []);
      } catch (err) {
        console.error('Failed to fetch submissions:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch verification inbox.');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const getRelativeTime = (dateString) => {
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

  const getEvidenceTags = (url) => {
    if (!url) return ['None'];
    const ext = url.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return ['PDF'];
    if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) return ['IMG'];
    if (['xlsx', 'xls', 'csv'].includes(ext)) return ['XLSX'];
    return ['FILE'];
  };

  const mappedSubmissions = submissions.map(sub => {
    const isOverdue = sub.status === 'Pending' && (new Date() - new Date(sub.createdAt)) > 48 * 60 * 60 * 1000;
    
    let statusText = sub.status;
    let color = '#6C757D';
    let bg = '#EAE3D2';
    
    if (isOverdue) {
      statusText = 'Overdue';
      color = '#B23B3B';
      bg = '#F4DAD8';
    } else if (sub.status === 'Pending') {
      statusText = 'Pending';
      color = '#B8862D';
      bg = '#F4E8CA';
    } else if (sub.status === 'Approved') {
      statusText = 'Approved';
      color = '#0D3B2E';
      bg = '#E4EDE7';
    } else if (sub.status === 'Revision requested') {
      statusText = 'Revision requested';
      color = '#B8862D';
      bg = '#F4E8CA';
    } else if (sub.status === 'Rejected') {
      statusText = 'Rejected';
      color = '#B23B3B';
      bg = '#F4DAD8';
    }

    return {
      id: sub.id,
      kpiId: sub.kpiId,
      staff: {
        name: sub.staffName,
        initials: sub.staffInitials,
        bgColor: '#e2efe9',
        textColor: '#183628',
        role: sub.staffRole
      },
      kpi: sub.kpiTitle,
      progress: {
        old: sub.oldProgress !== undefined ? sub.oldProgress : 0,
        new: sub.progressValue
      },
      evidence: getEvidenceTags(sub.evidenceUrl),
      submitted: {
        time: getRelativeTime(sub.createdAt),
        date: new Date(sub.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      },
      status: {
        text: statusText,
        raw: sub.status,
        color,
        bg
      }
    };
  });

  // Calculate filter counts dynamically
  const pendingCount = mappedSubmissions.filter(s => s.status.raw === 'Pending').length;
  const approvedCount = mappedSubmissions.filter(s => s.status.raw === 'Approved').length;
  const revisionCount = mappedSubmissions.filter(s => s.status.raw === 'Revision requested').length;
  const rejectedCount = mappedSubmissions.filter(s => s.status.raw === 'Rejected').length;
  const totalCount = mappedSubmissions.length;

  const filters = [
    { label: 'Pending', count: pendingCount },
    { label: 'Approved', count: approvedCount },
    { label: 'Revision requested', count: revisionCount },
    { label: 'Rejected', count: rejectedCount },
    { label: 'All', count: totalCount }
  ];

  const filteredSubmissions = mappedSubmissions.filter(sub => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Pending') return sub.status.raw === 'Pending';
    if (activeFilter === 'Approved') return sub.status.raw === 'Approved';
    if (activeFilter === 'Revision requested') return sub.status.raw === 'Revision requested';
    if (activeFilter === 'Rejected') return sub.status.raw === 'Rejected';
    return true;
  });

  // Select/Deselect handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const actionables = filteredSubmissions
        .filter(s => s.status.raw === 'Pending')
        .map(s => s.id);
      setSelectedSubIds(actionables);
    } else {
      setSelectedSubIds([]);
    }
  };

  const handleSelectRow = (id, checked) => {
    if (checked) {
      setSelectedSubIds(prev => [...prev, id]);
    } else {
      setSelectedSubIds(prev => prev.filter(x => x !== id));
    }
  };

  const handleBulkAction = async (actionStatus) => {
    if (selectedSubIds.length === 0) {
      alert("No pending submissions selected.");
      return;
    }
    const actionVerb = actionStatus === 'Approved' ? 'approve' : actionStatus === 'Rejected' ? 'reject' : 'request revisions for';
    const confirmMsg = `Are you sure you want to bulk ${actionVerb} the ${selectedSubIds.length} selected submissions?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setBulkActionLoading(true);
      setError(null);
      
      const comment = `Bulk ${actionStatus.toLowerCase()} by manager.`;
      
      await Promise.all(
        selectedSubIds.map(id => 
          axiosInstance.patch(`/api/kpi/manager/submissions/${id}/decision`, {
            status: actionStatus,
            comment
          })
        )
      );

      alert(`Successfully processed bulk ${actionStatus.toLowerCase()} for ${selectedSubIds.length} submissions.`);
      setSelectedSubIds([]);
      
      const res = await axiosInstance.get('/api/kpi/manager/submissions');
      setSubmissions(res.data || []);
    } catch (err) {
      console.error('Failed to run bulk decision:', err);
      alert(err.response?.data?.message || 'An error occurred while bulk processing.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to print the report.");
      return;
    }
    
    const pCount = submissions.filter(s => s.status === 'Pending').length;
    const aCount = submissions.filter(s => s.status === 'Approved').length;
    const rCount = submissions.filter(s => s.status === 'Revision requested').length;
    const rejCount = submissions.filter(s => s.status === 'Rejected').length;

    const reportRows = filteredSubmissions.map(sub => {
      const dateStr = sub.submitted.date;
      const oldProgress = sub.progress.old;
      const newProgress = sub.progress.new;
      let statusStyle = 'background-color: #FAF5E8; color: #B8862D;';
      if (sub.status.raw === 'Approved') statusStyle = 'background-color: #E4EDE7; color: #0D3B2E;';
      if (sub.status.raw === 'Revision requested') statusStyle = 'background-color: #fff3cd; color: #856404;';
      if (sub.status.raw === 'Rejected') statusStyle = 'background-color: #F4DAD8; color: #B23B3B;';
      
      const filesText = sub.evidence && sub.evidence.length > 0 ? sub.evidence.join(', ') : 'None';

      return `
        <tr>
          <td>
            <strong>${sub.staff.name || ''}</strong><br>
            <span style="font-size: 10px; color: #666;">${sub.staff.role || ''}</span>
          </td>
          <td>${sub.kpi || ''}</td>
          <td style="text-align: center; font-weight: bold;">${oldProgress}% &rarr; ${newProgress}%</td>
          <td>${sub.submitted.time} (${dateStr})</td>
          <td>
            <span style="display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; ${statusStyle}">
              ${sub.status.text}
            </span>
          </td>
          <td>${filesText}</td>
        </tr>
      `;
    }).join('');

    const reportHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>KPI Verification Inbox Report</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 40px;
              color: #2D3748;
              background-color: #FFFFFF;
            }
            .header-container {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #E2E8F0;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .title-area h1 {
              margin: 0;
              font-size: 24px;
              color: #1A202C;
              font-family: Georgia, serif;
            }
            .title-area p {
              margin: 5px 0 0;
              font-size: 12px;
              color: #718096;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              background-color: #2A3D37;
              color: #FFFFFF;
              width: 45px;
              height: 45px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 8px;
            }
            .metrics-bar {
              display: flex;
              gap: 20px;
              margin-bottom: 30px;
            }
            .metric-card {
              flex: 1;
              border: 1px solid #E2E8F0;
              border-radius: 8px;
              padding: 15px;
              background-color: #F8FAFC;
              text-align: center;
            }
            .metric-card h3 {
              margin: 0 0 5px;
              font-size: 10px;
              color: #718096;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .metric-card p {
              margin: 0;
              font-size: 22px;
              font-weight: bold;
              color: #1D2D27;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th, td {
              border: 1px solid #E2E8F0;
              padding: 12px 15px;
              text-align: left;
              font-size: 12px;
            }
            th {
              background-color: #EDF2F7;
              color: #4A5568;
              font-weight: bold;
              text-transform: uppercase;
              font-size: 10px;
              letter-spacing: 0.5px;
            }
            tr:nth-child(even) {
              background-color: #F8FAFC;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 10px;
              color: #A0AEC0;
              border-top: 1px solid #E2E8F0;
              padding-top: 20px;
            }
            @media print {
              body { padding: 0; }
              .header-container { border-bottom-color: #000; }
              th { background-color: #EDF2F7 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="title-area">
              <h1>Verification Inbox Report</h1>
              <p>Active Filter: <strong>${activeFilter}</strong> &middot; Generated on ${new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}</p>
            </div>
            <div class="logo">K</div>
          </div>
          
          <div class="metrics-bar">
            <div class="metric-card">
              <h3>Total Visible</h3>
              <p>${filteredSubmissions.length}</p>
            </div>
            <div class="metric-card">
              <h3>Pending</h3>
              <p>${pCount}</p>
            </div>
            <div class="metric-card">
              <h3>Approved</h3>
              <p>${aCount}</p>
            </div>
            <div class="metric-card">
              <h3>Revision Requested</h3>
              <p>${rCount}</p>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>KPI Title</th>
                <th style="text-align: center;">Progress Target</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Evidence Types</th>
              </tr>
            </thead>
            <tbody>
              ${reportRows || `<tr><td colspan="6" style="text-align: center; color: #718096;">No submissions found for the selected filter.</td></tr>`}
            </tbody>
          </table>
          
          <div class="footer">
            KP EYE KPI Management System &middot; Confidential Report
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(reportHtml);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="d-flex">
        <Sidebar role="manager" />
        <main style={{ marginLeft: 'var(--sidebar-width)', flex: 1, padding: '40px 60px' }} className="d-flex justify-content-center align-items-center">
          <Spinner animation="border" variant="dark" className="me-2" />
          <span>Loading verification inbox...</span>
        </main>
      </div>
    );
  }

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
        {/* Header Section */}
        <header className="d-flex justify-content-between align-items-start mb-5">
          <div>
            <p className="text-secondary fw-bold text-uppercase text-micro mb-1">WORKSPACE</p>
            <h1 className="fw-bold m-0 fs-4">Verification inbox</h1>
          </div>
          <div className="d-flex align-items-center gap-3">
            <Dropdown>
              <Dropdown.Toggle 
                variant="outline-custom" 
                id="dropdown-bulk-actions"
                className="px-4 py-2 bg-white rounded-3 shadow-sm border-0 text-sm d-flex align-items-center gap-1"
                disabled={selectedSubIds.length === 0 || bulkActionLoading}
              >
                Bulk actions ({selectedSubIds.length} selected)
              </Dropdown.Toggle>
              <Dropdown.Menu className="shadow border-0">
                <Dropdown.Item onClick={() => handleBulkAction('Approved')} className="text-success text-sm fw-medium">
                  ✓ Bulk Approve
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleBulkAction('Revision requested')} className="text-warning text-sm fw-medium">
                  ⚠ Bulk Request Revision
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleBulkAction('Rejected')} className="text-danger text-sm fw-medium">
                  ✗ Bulk Reject
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <Button variant="dark" className="px-4 py-2 rounded-3 btn-primary-dark shadow-sm text-sm" onClick={handlePrintReport}>
              Print report
            </Button>
          </div>
        </header>

        <div className="header-divider"></div>

        {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

        {/* SLA Alert Section */}
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h2 className="serif-font mb-2">{pendingCount} submissions waiting on you</h2>
            <p className="text-secondary mb-0 text-sm">Review evidence and approve or request revisions. Avg response time: 18 hours.</p>
          </div>
          
          {pendingCount > 0 && (
            <Card className="custom-card border-0 shadow-sm" style={{ backgroundColor: '#fdf4f3', border: '1px solid #f8d7da !important' }}>
              <Card.Body className="p-3 pe-5">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <div className="stat-dot rounded-circle" style={{ backgroundColor: '#B23B3B' }}></div>
                  <span className="text-micro fw-bold text-uppercase" style={{ color: '#B23B3B' }}>PENDING REVIEW</span>
                </div>
                <div className="serif-font fs-5 fw-bold mb-1" style={{ color: 'var(--text-main)' }}>{pendingCount} submissions</div>
                <div className="text-xs" style={{ color: '#B23B3B' }}>waiting for manager decision</div>
              </Card.Body>
            </Card>
          )}
        </div>

        {/* Filter Row */}
        <div className="d-flex gap-2 mb-4 flex-wrap">
          {filters.map((filter) => (
            <Button 
              key={filter.label}
              className={`filter-btn rounded-pill px-3 py-2 d-flex align-items-center gap-2 border-0 text-sm transition-all ${activeFilter === filter.label ? 'active shadow-sm' : ''}`}
              onClick={() => setActiveFilter(filter.label)}
              style={{ 
                backgroundColor: activeFilter === filter.label ? 'var(--text-main)' : 'transparent',
                color: activeFilter === filter.label ? '#FFFFFF' : 'var(--text-main)'
              }}
            >
              {filter.label}
              <span className="ms-1 d-flex align-items-center justify-content-center rounded-circle" 
                     style={{ 
                       backgroundColor: activeFilter === filter.label ? '#2A3D37' : '#EAE3D2', 
                       color: activeFilter === filter.label ? '#FFFFFF' : 'var(--text-main)',
                       height: '20px',
                       minWidth: '20px',
                       fontSize: '10px'
                     }}>
                {filter.count}
              </span>
            </Button>
          ))}
        </div>

        {/* Submissions List */}
        <Card className="custom-card border-0 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="d-flex align-items-center p-3 border-bottom" style={{ backgroundColor: '#F9F8F5', borderColor: 'var(--divider-color)' }}>
            <div style={{ width: '40px' }} className="d-flex justify-content-center">
              <Form.Check 
                type="checkbox" 
                className="shadow-none"
                checked={
                  filteredSubmissions.filter(s => s.status.raw === 'Pending').length > 0 &&
                  selectedSubIds.length === filteredSubmissions.filter(s => s.status.raw === 'Pending').length
                }
                onChange={handleSelectAll}
                disabled={filteredSubmissions.filter(s => s.status.raw === 'Pending').length === 0}
              />
            </div>
            <div style={{ flex: '2' }} className="text-micro text-secondary fw-bold text-uppercase">STAFF &middot; KPI</div>
            <div style={{ flex: '1.5' }} className="text-micro text-secondary fw-bold text-uppercase">PROGRESS</div>
            <div style={{ flex: '1.5' }} className="text-micro text-secondary fw-bold text-uppercase">EVIDENCE</div>
            <div style={{ flex: '1' }} className="text-micro text-secondary fw-bold text-uppercase">SUBMITTED</div>
            <div style={{ flex: '1.5' }} className="text-micro text-secondary fw-bold text-uppercase">STATUS</div>
            <div style={{ width: '100px' }}></div>
          </div>

          {/* List Rows */}
          {filteredSubmissions.map((sub) => (
            <div key={sub.id} 
                 className="d-flex align-items-center p-3 kpi-row border-bottom" 
                 style={{ 
                   borderColor: 'var(--divider-color)', 
                   backgroundColor: sub.status.text === 'Overdue' ? '#FCF7E9' : '#FFFFFF' 
                 }}>
              <div style={{ width: '40px' }} className="d-flex justify-content-center">
                <Form.Check 
                  type="checkbox" 
                  checked={selectedSubIds.includes(sub.id)}
                  onChange={(e) => handleSelectRow(sub.id, e.target.checked)}
                  disabled={sub.status.raw !== 'Pending'}
                  className="shadow-none"
                />
              </div>
              
              {/* Staff & KPI */}
              <div style={{ flex: '2' }} className="d-flex align-items-center gap-3 pe-3">
                <div className="profile-avatar rounded-circle d-flex align-items-center justify-content-center fw-bold" 
                     style={{ width: '36px', height: '36px', backgroundColor: sub.staff.bgColor, color: sub.staff.textColor, fontSize: '13px' }}>
                  {sub.staff.initials}
                </div>
                <div>
                  <div className="fw-bold text-sm" style={{ color: 'var(--text-main)' }}>{sub.staff.name}</div>
                  <div className="text-secondary" style={{ fontSize: '12px' }}>{sub.kpi}</div>
                </div>
              </div>

              {/* Progress */}
              <div style={{ flex: '1.5' }} className="pe-4">
                <div className="d-flex align-items-baseline gap-2 mb-2">
                  <span className="text-secondary" style={{ fontSize: '12px' }}>{sub.progress.old}&rarr;</span>
                  <span className="fw-bold text-sm">{sub.progress.new}%</span>
                </div>
                <div className="progress-track-sm rounded-pill w-100" style={{ height: '6px', backgroundColor: 'rgba(0,0,0,0.05)', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${sub.progress.old}%`, backgroundColor: 'var(--sidebar-tag)', borderRadius: '3px' }}></div>
                  <div style={{ position: 'absolute', top: 0, left: `${sub.progress.old}%`, height: '100%', width: `${sub.progress.new - sub.progress.old}%`, backgroundColor: 'var(--sidebar-bg)', borderRadius: '0 3px 3px 0' }}></div>
                </div>
              </div>

              {/* Evidence Tags */}
              <div style={{ flex: '1.5' }} className="d-flex flex-wrap gap-2 pe-3">
                {sub.evidence.map((tag, i) => (
                  <span key={i} className="rounded-2" 
                    style={{ backgroundColor: tag === 'PDF' ? '#F4DAD8' : tag === 'IMG' ? '#E4EDE7' : '#EAE3D2', 
                             color: tag === 'PDF' ? '#B23B3B' : tag === 'IMG' ? '#0D3B2E' : 'var(--text-main)', 
                             fontSize: '10px', padding: '5px 8px', letterSpacing: '0.5px' }}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* Submitted Date */}
              <div style={{ flex: '1' }} className="pe-3">
                <div className="fw-bold text-xs" style={{ color: sub.status.text === 'Overdue' ? '#B23B3B' : 'var(--text-main)' }}>{sub.submitted.time}</div>
                <div className="text-secondary" style={{ fontSize: '10px' }}>{sub.submitted.date}</div>
              </div>

              {/* Status Pill */}
              <div style={{ flex: '1.5' }}>
                <span className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-2" 
                       style={{ backgroundColor: sub.status.bg, color: sub.status.color, fontWeight: '600', fontSize: '11px' }}>
                  <div className="stat-dot rounded-circle" style={{ backgroundColor: sub.status.color }}></div>
                  {sub.status.text}
                </span>
              </div>

              {/* Action Button */}
              <div style={{ width: '100px' }} className="text-end">
                <Button variant="dark" className="btn-primary-dark rounded-3 px-3 py-2 text-micro d-inline-flex align-items-center gap-1 shadow-sm border-0"
                  onClick={() => navigate(`/manager/evidence-detail/${sub.id}`)}
                  style={{ fontSize: '10px' }}>
                  Review <ArrowRight size={10} />
                </Button>
              </div>
            </div>
          ))}
          {filteredSubmissions.length === 0 && (
            <div className="p-5 text-center text-muted">
              No submissions found for the selected filter.
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default VerificationInbox;
