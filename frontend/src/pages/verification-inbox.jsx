import React, { useState } from 'react';
import { Row, Col, Card, Form, Button } from 'react-bootstrap';
import { ArrowRight, Search } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../component/Sidebar';
import '../styles/theme.css';

const submissions = [
  {
    id: 'A-0419',
    staff: { name: 'Aisha Rahman', initials: 'AR', bgColor: '#fce8e6', textColor: '#c73a24' },
    kpi: 'Host 4 community outreach events',
    progress: { old: 75, new: 100 },
    evidence: ['PDF', 'IMG', 'PDF'],
    submitted: { time: '2h ago', date: 'Nov 19' },
    status: { text: 'Overdue', color: '#B23B3B', bg: '#F4DAD8' }
  },
  {
    id: 'A-0420',
    staff: { name: 'Rachel Koh', initials: 'RK', bgColor: '#e2efe9', textColor: '#183628' },
    kpi: 'Run Q1 volunteer drive',
    progress: { old: 14, new: 30 },
    evidence: ['PDF', 'IMG', 'IMG', '+2'],
    submitted: { time: '5h ago', date: 'Nov 19' },
    status: { text: 'Overdue', color: '#B23B3B', bg: '#F4DAD8' }
  },
  {
    id: 'A-0421',
    staff: { name: 'Mei Lin', initials: 'ML', bgColor: '#e6f4ea', textColor: '#1b6a38' },
    kpi: 'Secure 3 new media partnerships',
    progress: { old: 67, new: 92 },
    evidence: ['PDF', 'PDF'],
    submitted: { time: 'Today, 9:12am', date: 'Nov 20' },
    status: { text: 'Due today', color: '#B8862D', bg: '#F4E8CA' }
  },
  {
    id: 'A-0422',
    staff: { name: 'David Park', initials: 'DP', bgColor: '#fef2e4', textColor: '#a87022' },
    kpi: 'Complete communications audit',
    progress: { old: 20, new: 40 },
    evidence: ['PDF'],
    submitted: { time: 'Yesterday', date: 'Nov 19' },
    status: { text: 'Within SLA', color: '#0D3B2E', bg: '#E4EDE7' }
  },
  {
    id: 'A-0423',
    staff: { name: 'Sarah Noor', initials: 'SN', bgColor: '#fce8e6', textColor: '#c73a24' },
    kpi: 'Grow newsletter to 5,000 subscribers',
    progress: { old: 72, new: 82 },
    evidence: ['PDF', 'IMG'],
    submitted: { time: 'Yesterday', date: 'Nov 19' },
    status: { text: 'Within SLA', color: '#0D3B2E', bg: '#E4EDE7' }
  }
];

const VerificationInbox = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('Pending');

  const filters = [
    { label: 'Pending', count: 8 },
    { label: 'Approved', count: 42 },
    { label: 'Revision requested', count: 3 },
    { label: 'Rejected', count: 1 },
    { label: 'All', count: 54 }
  ];

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
            <Button variant="outline-custom" className="px-4 py-2 bg-white rounded-3 shadow-sm border-0 text-sm">
              Bulk actions <span className="ms-2">▾</span>
            </Button>
            <Button variant="dark" className="px-4 py-2 rounded-3 btn-primary-dark shadow-sm text-sm">
              Export report
            </Button>
          </div>
        </header>

        <div className="header-divider"></div>

        {/* SLA Alert Section */}
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h2 className="serif-font mb-2">8 submissions waiting on you</h2>
            <p className="text-secondary mb-0 text-sm">Review evidence and approve or request revisions. Avg response time: 18 hours.</p>
          </div>
          
          <Card className="custom-card border-0 shadow-sm" style={{ backgroundColor: '#fdf4f3', border: '1px solid #f8d7da !important' }}>
            <Card.Body className="p-3 pe-5">
              <div className="d-flex align-items-center gap-2 mb-1">
                <div className="stat-dot rounded-circle" style={{ backgroundColor: '#B23B3B' }}></div>
                <span className="text-micro fw-bold text-uppercase" style={{ color: '#B23B3B' }}>OVERDUE</span>
              </div>
              <div className="serif-font fs-5 fw-bold mb-1" style={{ color: 'var(--text-main)' }}>2 submissions</div>
              <div className="text-xs" style={{ color: '#B23B3B' }}>past 48h SLA — review ASAP</div>
            </Card.Body>
          </Card>
        </div>

        {/* Filter Row */}
        <div className="d-flex gap-2 mb-4">
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
              <Form.Check type="checkbox" className="shadow-none" />
            </div>
            <div style={{ flex: '2' }} className="text-micro text-secondary fw-bold text-uppercase">STAFF &middot; KPI</div>
            <div style={{ flex: '1.5' }} className="text-micro text-secondary fw-bold text-uppercase">PROGRESS</div>
            <div style={{ flex: '1.5' }} className="text-micro text-secondary fw-bold text-uppercase">EVIDENCE</div>
            <div style={{ flex: '1' }} className="text-micro text-secondary fw-bold text-uppercase">SUBMITTED</div>
            <div style={{ flex: '1.5' }} className="text-micro text-secondary fw-bold text-uppercase">STATUS</div>
            <div style={{ width: '100px' }}></div>
          </div>

          {/* List Rows */}
          {submissions.map((sub) => (
            <div key={sub.id} 
                 className="d-flex align-items-center p-3 kpi-row border-bottom" 
                 style={{ 
                   borderColor: 'var(--divider-color)', 
                   backgroundColor: sub.status.text === 'Overdue' ? '#FCF7E9' : '#FFFFFF' 
                 }}>
              <div style={{ width: '40px' }} className="d-flex justify-content-center">
                <Form.Check type="checkbox" />
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
        </Card>
      </main>
    </div>
  );
};

export default VerificationInbox;
