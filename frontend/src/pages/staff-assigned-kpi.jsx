import React, { useState } from 'react';
import { Form, InputGroup, Dropdown, Row, Col } from 'react-bootstrap';
import { Search, ArrowRight, CheckCircleFill, Circle, CircleFill } from 'react-bootstrap-icons';
import '../styles/theme.css';

const KPICard = ({ data }) => (
  <Row className="align-items-center p-4 staff-kpi-row mx-0">
    
    {/* Info Section */}
    <Col xs={12} md={4} className="mb-3 mb-md-0 px-0 pe-md-3">
      <div className="d-flex gap-2 mb-2">
        <span 
          className="badge staff-text-xs staff-kpi-tag font-monospace" 
          style={{ backgroundColor: data.tag1Bg, color: data.tag1Text}}>
          {data.tag1}
        </span>
        <span className="badge text-uppercase staff-text-xs text-secondary staff-kpi-tag staff-kpi-tag-outline font-monospace" >
          {data.tag2}
        </span>
      </div>
      <h6 className="fw-bold mb-1">{data.title}</h6>
      <p className="mb-0 staff-text-sm text-secondary">
        <span className="me-1 font-monospace opacity-75">Target</span> 
        <span className="fw-bold text-dark">{data.target}</span>
      </p>
    </Col>

    {/* Progress Section */}
    <Col xs={12} md={4} className="px-0 px-md-4 mb-3 mb-md-0">
      <div className="d-flex align-items-baseline gap-2 mb-2">
        <span className="fw-bold fs-5">{data.progressText}</span>
        <span className="staff-text-sm text-secondary">{data.subProgress}</span>
      </div>
      
      {data.type === 'bar' ? (
        <div className="staff-progress-track-md flex-grow-1 overflow-hidden rounded-pill">
          <div className="h-100" style={{backgroundColor: data.progressColor, width: `${data.progressValue}%` }}></div>
        </div>
      ) : (
        <div className="d-flex align-items-center w-75 pt-1">
          {data.steps.map((state, i) => (
             <React.Fragment key={i}>
                {/* Dot */}
                {state === 'completed' && <CheckCircleFill className="d-flex" color="#597495" size={14} />}

                {/* Icons */}
                {state === 'current' && <Circle className="d-flex staff-timeline-circle-current" color="#597495" size={14} />}
                {state === 'pending' && <CircleFill className="d-flex" color="#e8e4d9" size={14} />}

                {/* Timeline */}
                {i < data.steps.length - 1 && (
                    <div className="flex-grow-1 staff-timeline-line" style={{ 
                        backgroundColor: state === 'completed' ? '#597495' : '#e8e4d9'}}>
                    </div>
                )}
             </React.Fragment>
          ))}
        </div>
      )}
    </Col>

    {/* Due Section */}
    <Col xs={6} md={2} className="d-flex flex-column align-items-start px-0">
      <span className="mb-1 staff-text-mini text-secondary">Due</span>
      <span className="fw-bold mb-2 staff-text-sm">{data.due}</span>
    </Col>

    {/* Action Section */}
    <Col xs={6} md={2} className="d-flex align-items-center justify-content-end gap-3 px-0">
      <div className="d-flex align-items-center gap-2 px-3 py-1 rounded-pill fw-bold staff-text-mini" 
        style={{ border: `1px solid ${data.statusBorder}`, backgroundColor: data.statusBg, color: data.statusText}}>
        <div className="staff-status-dot-sm"></div>
        {data.status}
      </div>

      <button className="btn rounded-circle staff-btn-action-arrow flex-shrink-0 d-flex align-items-center justify-content-center p-0 border-0">
        <ArrowRight color="#1A1A1A" />
      </button>
    </Col>
  </Row>
);

export default function StaffAssignedKPI() {
    const [activeType, setActiveType] = useState('All types');
    const [activePill, setActivePill] = useState('All');

    // TODO: Replace Mock Data with database data later
    const kpis = [
        { id: 1, tag1: 'Internal', tag1Bg: '#faebd7', tag1Text: '#c99552', tag2: 'TARGET',
          title: 'Complete communications audit', target: '1 audit report',
          progressText: '40%', subProgress: '2 of 5 sections',
          progressValue: 40, progressColor: '#c99552',
          due: 'Nov 22', status: 'Due soon', statusBg: '#faebd7', statusText: '#c99552', statusBorder: '#e8d2b7', type: 'bar' },
        { id: 2, tag1: 'Community', tag1Bg: '#e2efe9', tag1Text: '#183628', tag2: 'TARGET',
          title: 'Host 4 community outreach events', target: '4 events',
          progressText: '75%', subProgress: '3 of 4 hosted',
          progressValue: 75, progressColor: '#183628',
          due: 'Nov 30', status: 'On track', statusBg: '#e2efe9', statusText: '#183628', statusBorder: '#c0d6cb', type: 'bar' },
        { id: 3, tag1: 'Project Mgmt', tag1Bg: '#e6ebf1', tag1Text: '#597495', tag2: 'PROJECT',
          title: 'Launch website redesign project', target: 'Go-live by Feb 28',
          progressText: 'Phase 3 of 5', subProgress: '· Design review',
          type: 'steps', steps: ['completed', 'completed', 'current', 'pending', 'pending'],
          due: 'Feb 28', status: 'In progress', statusBg: '#e6ebf1', statusText: '#597495', statusBorder: '#c5d1df' },
        { id: 4, tag1: 'Content', tag1Bg: '#fae3e0', tag1Text: '#de5c44', tag2: 'TARGET',
          title: 'Publish 12 editorial articles', target: '12 articles',
          progressText: '58%', subProgress: '7 of 12 published',
          progressValue: 58, progressColor: '#de5c44',
          due: 'Dec 15', status: 'In progress', statusBg: '#fae3e0', statusText: '#de5c44',  statusBorder: '#f0c3bc', type: 'bar'},
        { id: 5, tag1: 'Content', tag1Bg: '#fae3e0', tag1Text: '#de5c44', tag2: 'TARGET',
          title: 'Grow newsletter to 5,000 subscribers', target: '5,000 subs',
          progressText: '82%', subProgress: '4,124 subs',
          progressValue: 82, progressColor: '#de5c44',
          due: 'Dec 31', status: 'Under review', statusBg: '#e6f4ea', statusText: '#1b6a38', statusBorder: '#1b6a38', type: 'bar'},
        { id: 6, tag1: 'Partnerships', tag1Bg: '#e6f4ea', tag1Text: '#1b6a38', tag2: 'TARGET',
          title: 'Secure 3 new media partnerships', target: '3 partners',
          progressText: '92%', subProgress: '3 signed · 1 pending',
          progressValue: 92, progressColor: '#1b6a38',
          due: 'Jan 10', status: 'Near complete', statusBg: '#e6f4ea', statusText: '#1b6a38', statusBorder: '#1b6a38', type: 'bar'}
    ];

    // Filter logic based on the selected state
    const filteredKpis = kpis.filter(kpi => {
        // Filter by Type (All, Target, Project)
        const matchType = activeType === 'All types' || kpi.tag2.toLowerCase() === activeType.toLowerCase();

        // Filter by Status Pill
        let matchPill = true;
        if (activePill === 'Active') {
            matchPill = kpi.status === 'In progress' || kpi.status === 'On track';
        } else if (activePill === 'Project Mgmt') {
            matchPill = kpi.tag1 === 'Project Mgmt';
        } else if (activePill === 'Pending review') {
            matchPill = kpi.status === 'Under review';
        } else if (activePill === 'Completed') {
            matchPill = kpi.progressValue === 100;
        } else if (activePill === 'Overdue') {
            matchPill = kpi.status === 'Overdue';
        }

        return matchType && matchPill;
    });

    const filterPills = [
        { label: 'All', count: 12 },
        { label: 'Active', count: 8 },
        { label: 'Project Mgmt', count: 2 },
        { label: 'Pending review', count: 2 },
        { label: 'Completed', count: 2 },
        { label: 'Overdue', count: 1 }
    ];

    return (
            <main>
              <header className="d-flex justify-content-between align-items-start mb-5">
                <div>
                  <p className="text-secondary fw-bold text-uppercase staff-text-micro mb-1">Workspace</p>
                  <h1 className="fw-bold m-0 fs-4">My KPIs</h1>
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
              
              {/* Tabs */}
              <div className="d-flex justify-content-between align-items-end mb-4">
                <div>
                    <h2 className="serif-font fw-bold mb-2 fs-3">12 KPIs assigned to you</h2>
                    <p className="mb-0 staff-text-sm text-secondary">
                    Mix of target-based (reach a number) and project-based (hit milestones). Sorted by urgency.
                    </p>
                </div>
                
                <div className="d-flex gap-3">
                    <div className="rounded p-1 shadow-sm d-flex fw-medium staff-text-sm bg-white">
                      {/* Clickable Filters */}
                      {['All types', 'Target', 'Project'].map(type => (
                      <button key={type} onClick={() => setActiveType(type)} 
                        className={`btn border-0 rounded px-3 py-1 shadow-none staff-text-sm staff-tab-btn ${activeType === type ? 'active-tab' : 'text-secondary'}`}>
                          {type}
                      </button>
                    ))}
                  </div>
                    
                    <Dropdown>
                    <Dropdown.Toggle variant="light" 
                        className="border-0 shadow-sm py-2 px-3 rounded fw-medium d-flex align-items-center gap-2 bg-white text-dark">
                        Due date
                    </Dropdown.Toggle>
                      <Dropdown.Menu>
                          <Dropdown.Item>Urgency</Dropdown.Item>
                          <Dropdown.Item>Status</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                </div>
              </div>

                {/* Filter Pills */}
                <div className="d-flex gap-3 mb-4 overflow-auto pb-2 staff-hide-scrollbar">
                {filterPills.map((filter, idx) => {
                  const isActive = activePill === filter.label;
                  return (
                    <button key={idx} onClick={() => setActivePill(filter.label)}
                        className={`btn rounded-pill d-flex align-items-center gap-2 px-3 py-1 fw-medium text-nowrap staff-filter-btn shadow-sm staff-text-sm ${isActive ? 'active' : ''}`}>
                          {filter.label}
                          <span className="badge rounded-pill px-2 py-1 staff-text-mini">
                            {filter.count}
                        </span>
                    </button>
                  );
                })}
                </div>

                {/* KPI List Wrapper */}
                <div className="staff-kpi-card-wrapper">
                    {filteredKpis.length > 0 ? (
                        filteredKpis.map(kpi => <KPICard key={kpi.id} data={kpi} />)
                    ) : (
                        <div className="p-5 text-center text-secondary">
                            <p className="mb-0">No KPIs found for this filter combination.</p>
                        </div>
                    )}
                </div>
        </main>
  );
}

