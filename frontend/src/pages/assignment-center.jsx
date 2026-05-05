import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Row, Col, Card, Form, Button, Badge, Nav, InputGroup,
} from 'react-bootstrap'; // react-bootstrap
import { Search, PlusLg } from 'react-bootstrap-icons';
import Sidebar from '../component/Sidebar';
import KpiSelectItem from '../component/KpiSelectItem';   // reusable component
import StaffAssigneeRow from '../component/StaffAssigneeRow'; // reusable component
import '../styles/theme.css';

// ─── Mock data (replace with API calls) ──────────────────────────────────────

const KPI_LIST = [
  {
    id: 1,
    title: 'Host 4 community outreach events',
    category: 'Target',
    deadline: 'Nov 19',
    assignees: ['AS', 'SR', 'RK'],
    status: null,
    totalSlots: 4,
    description:
      'Organize and facilitate at least 4 community outreach events that promote company initiatives and engage local stakeholders. Each event must have a minimum of 25 attendees.',
    progress: [
      { initials: 'AS', name: 'AakarSerman', progress: 70 },
      { initials: 'SR', name: 'SR Chen',     progress: 70 },
      { initials: 'RK', name: 'Ravi Kumar',  progress: 45 },
    ],
  },
  {
    id: 2,
    title: 'Publish 12 editorial articles',
    category: 'Target',
    deadline: 'Nov 30',
    assignees: ['NG'],
    status: 'Success',
    totalSlots: 2,
    description: 'Publish 12 high-quality editorial articles across company platforms within the quarter.',
    progress: [{ initials: 'NG', name: 'Nguyen Tran', progress: 100 }],
  },
  {
    id: 3,
    title: 'Launch newsletter redesign project',
    category: 'Project',
    deadline: 'Dec 5',
    assignees: [],
    status: null,
    totalSlots: 3,
    description: 'Complete a full redesign of the company newsletter template and migrate to the new format.',
    progress: [],
  },
  {
    id: 4,
    title: 'Grow newsletter to 5,000 subscribers',
    category: 'Target',
    deadline: 'Dec 31',
    assignees: [],
    status: null,
    totalSlots: 2,
    description: 'Increase newsletter subscriber count to 5,000 through organic content campaigns.',
    progress: [],
  },
  {
    id: 5,
    title: 'Secure 3 new media partnerships',
    category: 'Target',
    deadline: 'Nov 25',
    assignees: ['DF', 'RK'],
    status: null,
    totalSlots: 2,
    description: 'Identify and secure partnership agreements with 3 new media outlets before year-end.',
    progress: [
      { initials: 'DF', name: 'Diana Fern', progress: 60 },
      { initials: 'RK', name: 'Ravi Kumar', progress: 40 },
    ],
  },
  {
    id: 6,
    title: 'Launch internal brand handbook',
    category: 'Project',
    deadline: 'Jan 15',
    assignees: ['NG'],
    status: 'Project Report',
    totalSlots: 2,
    description: 'Develop and publish the internal brand guidelines handbook for all departments.',
    progress: [{ initials: 'NG', name: 'Nguyen Tran', progress: 80 }],
  },
];

const ALL_STAFF = [
  { initials: 'MW', name: 'Marcus Wong' },
  { initials: 'PL', name: 'Priya Lal'  },
  { initials: 'JT', name: 'James Tan'  },
  { initials: 'EC', name: 'Elena Cruz' },
];

// ─── Component ───────────────────────────────────────────────────────────────

const AssignmentCenter = () => {
  const navigate = useNavigate();

  const [activeTab,      setActiveTab]      = useState('by-kpi');
  const [selectedKpiId,  setSelectedKpiId]  = useState(1);
  const [kpiSearch,      setKpiSearch]      = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [staffSearch,    setStaffSearch]    = useState('');

  const selectedKpi = KPI_LIST.find((k) => k.id === selectedKpiId);

  const filteredKpis = KPI_LIST.filter((kpi) => {
    const matchSearch   = kpi.title.toLowerCase().includes(kpiSearch.toLowerCase());
    const matchCategory = filterCategory === 'All' || kpi.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const suggestedStaff = ALL_STAFF.filter((s) =>
    staffSearch.trim() &&
    s.name.toLowerCase().includes(staffSearch.toLowerCase())
  );

  return (
    <div className="d-flex">
      {/* Sidebar — custom component (wraps react-bootstrap Nav) */}
      <Sidebar role="manager" />

      <main
        style={{
          marginLeft: 'var(--sidebar-width)',
          flex: 1,
          padding: '40px 48px',
          backgroundColor: 'var(--main-bg)',
          minHeight: '100vh',
        }}
      >
        {/* ── Page header ─────────────────────────────────────────── */}
        <p className="sidebar-header small mb-1">Workspace</p>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="serif-font mb-0">Assignment center</h3>

          <div className="d-flex align-items-center gap-3">
            {/* View-mode toggle — Nav (react-bootstrap) */}
            <Nav
              style={{
                backgroundColor: '#EAE3D2',
                padding: '4px',
                borderRadius: '8px',
                gap: '2px',
              }}
            >
              {[
                { key: 'by-kpi',   label: 'By KPI'   },
                { key: 'by-staff', label: 'By staff'  },
              ].map(({ key, label }) => (
                /* Nav.Link — react-bootstrap */
                <Nav.Link
                  key={key}
                  onClick={() => setActiveTab(key)}
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '6px 14px',
                    borderRadius: '6px',
                    color:           activeTab === key ? '#fff' : 'var(--text-muted)',
                    backgroundColor: activeTab === key ? 'var(--sidebar-bg)' : 'transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {label}
                </Nav.Link>
              ))}
            </Nav>

            {/* Button — react-bootstrap */}
            <Button
              className="btn-orange d-flex align-items-center gap-1"
              onClick={() => navigate('/manager/all-kpis/new')}
            >
              <PlusLg size={14} /> Assign KPI
            </Button>
          </div>
        </div>

        {/* ── Split layout ─────────────────────────────────────────── */}
        {/* Row — react-bootstrap */}
        <Row className="g-3" style={{ minHeight: 'calc(100vh - 200px)' }}>

          {/* ── LEFT: KPI list panel ───────────────────────────────── */}
          {/* Col — react-bootstrap */}
          <Col md={4} style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Card — react-bootstrap */}
            <Card className="custom-card flex-grow-1" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

              {/* Card.Header — react-bootstrap */}
              <Card.Header
                style={{
                  backgroundColor: 'transparent',
                  borderBottom: '1px solid #F0EAE0',
                  padding: '16px 20px 14px',
                }}
              >
                <p className="section-label mb-1">Select a KPI</p>

                {/* Search — InputGroup (react-bootstrap) */}
                <InputGroup
                  className="mb-2"
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #E8E1D3',
                    overflow: 'hidden',
                  }}
                >
                  {/* InputGroup.Text — react-bootstrap */}
                  <InputGroup.Text style={{ backgroundColor: '#F9F7F4', border: 'none' }}>
                    <Search size={13} color="var(--text-muted)" />
                  </InputGroup.Text>
                  {/* Form.Control — react-bootstrap */}
                  <Form.Control
                    placeholder="Filter this KPI"
                    value={kpiSearch}
                    onChange={(e) => setKpiSearch(e.target.value)}
                    style={{ border: 'none', backgroundColor: '#F9F7F4', fontSize: '13px' }}
                  />
                </InputGroup>

                {/* Category filter badges */}
                <div className="d-flex gap-1 flex-wrap">
                  {['All', 'Target', 'Project'].map((cat) => (
                    /* Badge (clickable filter) — react-bootstrap */
                    <Badge
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: filterCategory === cat ? 'var(--sidebar-bg)' : '#EAE3D2',
                        color:           filterCategory === cat ? '#fff' : 'var(--text-muted)',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '5px 10px',
                        borderRadius: '6px',
                      }}
                    >
                      {cat === 'All' ? 'All' : `● ${cat}`}
                    </Badge>
                  ))}
                </div>
              </Card.Header>

              {/* Card.Body — react-bootstrap */}
              <Card.Body style={{ overflowY: 'auto', padding: '8px' }}>
                {filteredKpis.length > 0 ? (
                  filteredKpis.map((kpi) => (
                    /* KpiSelectItem — reusable component from /component/KpiSelectItem.jsx */
                    <KpiSelectItem
                      key={kpi.id}
                      kpi={kpi}
                      isSelected={kpi.id === selectedKpiId}
                      onClick={() => setSelectedKpiId(kpi.id)}
                    />
                  ))
                ) : (
                  <p
                    className="text-muted text-center"
                    style={{ fontSize: '13px', padding: '20px 0' }}
                  >
                    No KPIs match your filter.
                  </p>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* ── RIGHT: KPI detail panel ────────────────────────────── */}
          {/* Col — react-bootstrap */}
          <Col md={8} style={{ display: 'flex', flexDirection: 'column' }}>
            {selectedKpi ? (
              /* Card — react-bootstrap */
              <Card
                className="custom-card flex-grow-1"
                style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
              >
                {/* Card.Body — react-bootstrap */}
                <Card.Body style={{ overflowY: 'auto', padding: '28px 36px' }}>

                  {/* Category + deadline badges */}
                  <div className="d-flex align-items-center gap-2 mb-3">
                    {/* Badge — react-bootstrap */}
                    <Badge
                      style={{
                        backgroundColor: '#E8F0ED',
                        color: '#0B5E3A',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '5px 10px',
                        borderRadius: '6px',
                      }}
                    >
                      {selectedKpi.category}
                    </Badge>
                    {/* Badge — react-bootstrap */}
                    <Badge
                      style={{
                        backgroundColor: '#F9F7F4',
                        color: 'var(--text-muted)',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '5px 10px',
                        borderRadius: '6px',
                        border: '1px solid #E8E1D3',
                      }}
                    >
                      Due {selectedKpi.deadline}
                    </Badge>
                  </div>

                  {/* KPI title */}
                  <h4 className="serif-font mb-2">{selectedKpi.title}</h4>
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--text-muted)',
                      lineHeight: 1.6,
                      marginBottom: '24px',
                    }}
                  >
                    {selectedKpi.description}
                  </p>

                  {/* Currently assigned section */}
                  <div className="mb-2">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>
                        Currently assigned:{' '}
                        <span style={{ color: 'var(--accent-orange)' }}>
                          {selectedKpi.progress.length}/{selectedKpi.totalSlots}
                        </span>
                      </span>
                      {/* Button (link) — react-bootstrap */}
                      <Button
                        variant="link"
                        className="p-0 text-decoration-none"
                        style={{ fontSize: '12px', color: 'var(--accent-orange)' }}
                        onClick={() => navigate(`/manager/all-kpis/edit/${selectedKpiId}`)}
                      >
                        Manage
                      </Button>
                    </div>

                    {selectedKpi.progress.length > 0 ? (
                      selectedKpi.progress.map((staff, idx) => (
                        /* StaffAssigneeRow — reusable component from /component/StaffAssigneeRow.jsx */
                        <StaffAssigneeRow key={idx} staff={staff} />
                      ))
                    ) : (
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '12px 0' }}>
                        No staff assigned to this KPI yet.
                      </p>
                    )}
                  </div>

                  <hr style={{ borderColor: '#F0EAE0', margin: '24px 0' }} />

                  {/* Assign to more staff */}
                  <div>
                    <p className="section-label mb-3">Assign to more staff</p>

                    {/* InputGroup — react-bootstrap */}
                    <InputGroup
                      className="mb-2"
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #E8E1D3',
                        overflow: 'hidden',
                      }}
                    >
                      {/* InputGroup.Text — react-bootstrap */}
                      <InputGroup.Text style={{ backgroundColor: '#F9F7F4', border: 'none' }}>
                        <Search size={13} color="var(--text-muted)" />
                      </InputGroup.Text>
                      {/* Form.Control — react-bootstrap */}
                      <Form.Control
                        placeholder="Start typing to search team…"
                        value={staffSearch}
                        onChange={(e) => setStaffSearch(e.target.value)}
                        style={{ border: 'none', backgroundColor: '#F9F7F4', fontSize: '13px' }}
                      />
                    </InputGroup>

                    {/* Staff dropdown suggestions */}
                    {suggestedStaff.length > 0 && (
                      <div
                        style={{
                          borderRadius: '10px',
                          border: '1px solid #E8E1D3',
                          overflow: 'hidden',
                          marginBottom: '16px',
                          backgroundColor: '#fff',
                        }}
                      >
                        {suggestedStaff.map((s, idx) => (
                          <div
                            key={idx}
                            className="d-flex align-items-center gap-3 px-3 py-2"
                            style={{
                              borderBottom:
                                idx < suggestedStaff.length - 1
                                  ? '1px solid #F0EAE0'
                                  : 'none',
                              cursor: 'pointer',
                              fontSize: '13px',
                            }}
                            onClick={() => setStaffSearch('')}
                          >
                            <div
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                backgroundColor: '#F9E7DE',
                                color: '#C85A3A',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '10px',
                                flexShrink: 0,
                              }}
                            >
                              {s.initials}
                            </div>
                            {s.name}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Notify button — Button (react-bootstrap) */}
                    <Button className="btn-orange">Notify assignees</Button>
                  </div>
                </Card.Body>
              </Card>
            ) : (
              /* Card — react-bootstrap */
              <Card className="custom-card flex-grow-1 d-flex align-items-center justify-content-center">
                <p className="text-muted" style={{ fontSize: '13px' }}>
                  Select a KPI from the left to view details.
                </p>
              </Card>
            )}
          </Col>
        </Row>
      </main>
    </div>
  );
};

export default AssignmentCenter;
