import React, { useState, useEffect } from 'react';
import { Form, InputGroup, Dropdown, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { Search, ArrowRight, CheckCircleFill, Circle, CircleFill } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import Sidebar from '../component/Sidebar';
import api from '../utils/axiosInstance';
import '../styles/theme.css';

const KPICard = ({ data }) => (
  <Row className="align-items-center p-4 staff-kpi-row mx-0 mb-3 rounded-3 shadow-sm bg-white">
    {/* Info Section */}
    <Col xs={12} md={4} className="mb-3 mb-md-0 px-0 pe-md-3">
      <div className="d-flex gap-2 mb-2">
        <span 
          className="badge staff-text-xs staff-kpi-tag font-monospace" 
          style={{ backgroundColor: data.tag1Bg, color: data.tag1Text }}>
          {data.tag1}
        </span>
        <span className="badge text-uppercase staff-text-xs text-secondary staff-kpi-tag staff-kpi-tag-outline font-monospace">
          {data.tag2}
        </span>
      </div>
      <h6 className="fw-bold mb-1">{data.title}</h6>
      <p className="mb-0 staff-text-sm text-secondary">
        <span className="me-1 font-monospace opacity-75">Target</span> 
        <span className="fw-bold text-dark">{data.target}</span>
      </p>
      {data.status === 'Revision requested' && data.feedback && (
        <div className="mt-2 p-2 rounded staff-text-xs" style={{ backgroundColor: '#fff8e1', borderLeft: '3px solid #ffb300', color: '#5d4037' }}>
          <strong>Revision Requested Note:</strong> {data.feedback}
        </div>
      )}
    </Col>

    {/* Progress Section */}
    <Col xs={12} md={4} className="px-0 px-md-4 mb-3 mb-md-0">
      <div className="d-flex align-items-baseline gap-2 mb-2">
        <span className="fw-bold fs-5">{data.progressText}</span>
        <span className="staff-text-sm text-secondary">{data.subProgress}</span>
      </div>
      
      {data.type === 'bar' ? (
        <div className="staff-progress-track-md flex-grow-1 overflow-hidden rounded-pill" style={{ height: '8px', backgroundColor: '#e8e4d9' }}>
          <div className="h-100" style={{ backgroundColor: data.progressColor, width: `${data.progressValue}%` }}></div>
        </div>
      ) : (
        <div className="d-flex align-items-center w-75 pt-1">
          {data.steps.map((state, i) => (
             <React.Fragment key={i}>
                {/* Dot */}
                {state === 'completed' && <CheckCircleFill className="d-flex" color="#597495" size={14} />}
                {state === 'current' && <Circle className="d-flex staff-timeline-circle-current" color="#597495" size={14} />}
                {state === 'pending' && <CircleFill className="d-flex" color="#e8e4d9" size={14} />}

                {/* Timeline Line */}
                {i < data.steps.length - 1 && (
                    <div className="flex-grow-1 staff-timeline-line" style={{ 
                        backgroundColor: state === 'completed' ? '#597495' : '#e8e4d9',
                        height: '2px'
                    }}>
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
        style={{ border: `1px solid ${data.statusBorder}`, backgroundColor: data.statusBg, color: data.statusText }}>
        <div className="staff-status-dot-sm" style={{ backgroundColor: data.statusText }}></div>
        {data.status}
      </div>

      {(data.status || '').toLowerCase() !== 'completed' ? (
        <Link 
          to={`/staff/submit?kpiId=${data.id}`}
          className="btn rounded-circle staff-btn-action-arrow flex-shrink-0 d-flex align-items-center justify-content-center p-0 border-0"
          title="Submit progress update"
        >
          <ArrowRight color="#1A1A1A" />
        </Link>
      ) : (
        <div 
          className="btn rounded-circle staff-btn-action-arrow flex-shrink-0 d-flex align-items-center justify-content-center p-0 border-0 bg-light"
          style={{ cursor: 'not-allowed', opacity: 0.8 }}
          title="KPI Completed & Approved"
        >
          <CheckCircleFill color="#183628" size={16} />
        </div>
      )}
    </Col>
  </Row>
);

export default function StaffAssignedKPI() {
  const [kpis, setKpis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeType, setActiveType] = useState('All types');
  const [activePill, setActivePill] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSort, setActiveSort] = useState('Urgency');

  useEffect(() => {
    const fetchAssignedKpis = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await api.get('/api/kpi/assigned');
        setKpis(response.data.data || response.data || []);
      } catch (err) {
        console.error('Error fetching assigned KPIs:', err);
        setError(err.response?.data?.message || err.message || 'An error occurred while loading assigned KPIs.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignedKpis();
  }, []);

  // Filter logic based on type, pill selection, and search query
  const filteredKpis = kpis.filter(kpi => {
    // Filter by Search Query (Title or Category)
    const matchesSearch = searchQuery === '' || 
      kpi.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kpi.tag1.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by Type (All, Target, Project)
    const matchesType = activeType === 'All types' || kpi.tag2.toLowerCase() === activeType.toLowerCase();

    // Filter by Status Pill
    let matchesPill = true;
    const normStatus = (kpi.status || '').toLowerCase();
    
    if (activePill === 'Active') {
      matchesPill = normStatus === 'in progress' || normStatus === 'on track' || normStatus === 'not started' || normStatus === 'revision requested';
    } else if (activePill === 'Project Mgmt') {
      matchesPill = kpi.tag1 === 'Project Mgmt';
    } else if (activePill === 'Pending review') {
      matchesPill = normStatus === 'under review';
    } else if (activePill === 'Completed') {
      matchesPill = normStatus === 'completed';
    } else if (activePill === 'Overdue') {
      matchesPill = normStatus === 'overdue';
    }

    return matchesSearch && matchesType && matchesPill;
  }).sort((a, b) => {
    if (activeSort === 'Urgency') {
      // Sort by Due Date (closest first)
      const dateA = a.dueRaw ? new Date(a.dueRaw) : new Date(8640000000000000);
      const dateB = b.dueRaw ? new Date(b.dueRaw) : new Date(8640000000000000);
      return dateA - dateB;
    } else if (activeSort === 'Status') {
      return (a.status || '').localeCompare(b.status || '');
    }
    return 0;
  });

  // Calculate counts for pills dynamically
  const getPillCount = (pillLabel) => {
    return kpis.filter(kpi => {
      const normStatus = (kpi.status || '').toLowerCase();
      if (pillLabel === 'All') return true;
      if (pillLabel === 'Active') return normStatus === 'in progress' || normStatus === 'on track' || normStatus === 'not started' || normStatus === 'revision requested';
      if (pillLabel === 'Project Mgmt') return kpi.tag1 === 'Project Mgmt';
      if (pillLabel === 'Pending review') return normStatus === 'under review';
      if (pillLabel === 'Completed') return normStatus === 'completed';
      if (pillLabel === 'Overdue') return normStatus === 'overdue';
      return true;
    }).length;
  };

  const filterPills = [
    { label: 'All', count: getPillCount('All') },
    { label: 'Active', count: getPillCount('Active') },
    { label: 'Project Mgmt', count: getPillCount('Project Mgmt') },
    { label: 'Pending review', count: getPillCount('Pending review') },
    { label: 'Completed', count: getPillCount('Completed') },
    { label: 'Overdue', count: getPillCount('Overdue') }
  ];

  return (
    <div className="d-flex">
      <Sidebar role="staff" />
      <main className="staff-main-content">
        <header className="d-flex justify-content-between align-items-start mb-5">
          <div>
            <p className="text-secondary fw-bold text-uppercase staff-text-micro mb-1">Workspace</p>
            <h1 className="fw-bold m-0 fs-4">My KPIs</h1>
          </div>
          <div className="d-flex align-items-center gap-3">
            <InputGroup className="bg-white rounded-3 shadow-sm align-items-center px-2 search-wrapper">
              <Search size={16} className="text-secondary ms-2" />
              <Form.Control 
                type="text" 
                placeholder="Search KPIs, evidence..." 
                className="bg-transparent border-0 shadow-none py-2 staff-text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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
            <h2 className="serif-font fw-bold mb-2 fs-3">{kpis.length} KPIs assigned to you</h2>
            <p className="mb-0 staff-text-sm text-secondary">
              Mix of target-based (reach a number) and project-based (hit milestones). Sorted by urgency.
            </p>
          </div>
          
          <div className="d-flex gap-3">
            <div className="rounded p-1 shadow-sm d-flex fw-medium staff-text-sm bg-white">
              {['All types', 'Target', 'Project'].map(type => (
                <button 
                  key={type} 
                  onClick={() => setActiveType(type)} 
                  className={`btn border-0 rounded px-3 py-1 shadow-none staff-text-sm staff-tab-btn ${activeType === type ? 'active-tab' : 'text-secondary'}`}
                >
                  {type}
                </button>
              ))}
            </div>
            
            <Dropdown>
              <Dropdown.Toggle variant="light" className="border-0 shadow-sm py-2 px-3 rounded fw-medium d-flex align-items-center gap-2 bg-white text-dark">
                {activeSort === 'Urgency' ? 'Due date' : 'Status'}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item 
                  active={activeSort === 'Urgency'} 
                  onClick={() => setActiveSort('Urgency')}
                >
                  Urgency (Due date)
                </Dropdown.Item>
                <Dropdown.Item 
                  active={activeSort === 'Status'} 
                  onClick={() => setActiveSort('Status')}
                >
                  Status
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="d-flex gap-3 mb-4 overflow-auto pb-2 staff-hide-scrollbar">
          {filterPills.map((filter, idx) => {
            const isActive = activePill === filter.label;
            return (
              <button 
                key={idx} 
                onClick={() => setActivePill(filter.label)}
                className={`btn rounded-pill d-flex align-items-center gap-2 px-3 py-1 fw-medium text-nowrap staff-filter-btn shadow-sm staff-text-sm ${isActive ? 'active' : ''}`}
              >
                {filter.label}
                <span className="badge rounded-pill px-2 py-1 staff-text-mini">
                  {filter.count}
                </span>
              </button>
            );
          })}
        </div>

        {error && (
          <Alert variant="danger" className="shadow-sm rounded-3">
            <Alert.Heading className="fs-6 fw-bold">Error loading KPIs</Alert.Heading>
            <p className="mb-0 staff-text-sm">{error}</p>
          </Alert>
        )}

        {/* KPI List Wrapper */}
        <div className="staff-kpi-card-wrapper">
          {isLoading ? (
            <div className="d-flex justify-content-center align-items-center py-5">
              <Spinner animation="border" variant="dark" className="me-2" />
              <span className="serif-font fw-medium">Loading KPIs...</span>
            </div>
          ) : filteredKpis.length > 0 ? (
            filteredKpis.map(kpi => <KPICard key={kpi.id} data={kpi} />)
          ) : (
            <div className="p-5 text-center text-secondary bg-white rounded-3 shadow-sm">
              <p className="mb-0 staff-text-sm">No KPIs found for this filter combination.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

