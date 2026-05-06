import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Row, Col, Card, Form, Button, Nav, InputGroup,
} from 'react-bootstrap';
import { Search, ArrowRight } from 'react-bootstrap-icons';
import Sidebar from '../component/Sidebar';
import KpiSelectItem from '../component/KpiSelectItem';
import StaffAssigneeRow from '../component/StaffAssigneeRow';
import CategoryBadge from '../component/CategoryBadge';
import '../styles/theme.css';

// ─── Mock data (replace with API calls) ──────────────────────────────────────

const KPI_LIST = [
  {
    id: 1,
    title: 'Host 4 community outreach events',
    category: 'Target',
    tag: 'Community',
    deadline: 'Nov 30',
    assignees: ['AR'],
    status: null,
    totalSlots: 4,
    targetValue: '4 community events',
    progressValue: '3 / 4 events hosted',
    description:
      'Public-facing engagements with local partners and community groups. Each event counts as one unit toward the 4-event target.',
    progress: [
      { initials: 'AR', name: 'Aisha Rahman', role: 'Communications', progress: 75, text: '3/4' },
    ],
  },
  {
    id: 2,
    title: 'Publish 12 editorial articles',
    category: 'Target',
    tag: 'Content',
    deadline: 'Nov 30',
    assignees: [],
    status: null,
    totalSlots: 2,
    targetValue: '12 articles',
    progressValue: '0 / 12 articles published',
    description: 'Publish 12 high-quality editorial articles across company platforms within the quarter.',
    progress: [],
  },
  {
    id: 3,
    title: 'Launch website redesign project',
    category: 'Project',
    tag: 'Project Mgmt',
    deadline: 'Feb 28',
    assignees: [],
    status: null,
    totalSlots: 1,
    targetValue: 'Go-live by Feb 28',
    progressValue: 'In progress',
    description: 'Complete a full redesign of the company website.',
    progress: [],
  },
];

const ALL_STAFF = [
  { initials: 'MW', name: 'Marcus Wong', role: 'Design' },
  { initials: 'PL', name: 'Priya Lal', role: 'Marketing'  },
  { initials: 'JT', name: 'James Tan', role: 'Engineering'  },
  { initials: 'EC', name: 'Elena Cruz', role: 'Communications' },
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
        <p className="sidebar-header small mb-1" style={{ letterSpacing: '1px' }}>WORKSPACE</p>
        <div className="d-flex justify-content-between align-items-center mb-5">
          <h3 className="serif-font mb-0" style={{ fontWeight: 700 }}>Assignment center</h3>

          <div className="d-flex align-items-center gap-3">
            <Nav
              style={{
                backgroundColor: 'transparent',
                padding: '4px',
                borderRadius: '8px',
                gap: '4px',
              }}
            >
              {[
                { key: 'by-kpi',   label: 'By KPI'   },
                { key: 'by-staff', label: 'By staff'  },
              ].map(({ key, label }) => (
                <Nav.Link
                  key={key}
                  onClick={() => setActiveTab(key)}
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '6px 14px',
                    borderRadius: '6px',
                    color:           activeTab === key ? '#fff' : '#1A1A1A',
                    backgroundColor: activeTab === key ? '#1A1A1A' : 'transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {label}
                </Nav.Link>
              ))}
            </Nav>

            <Button
              style={{ backgroundColor: '#C73F1F', border: 'none', fontSize: '13px', fontWeight: 600, padding: '8px 16px', borderRadius: '6px' }}
              onClick={() => navigate('/manager/all-kpis/new')}
            >
              + New KPI
            </Button>
          </div>
        </div>

        <Row className="g-4" style={{ minHeight: 'calc(100vh - 200px)' }}>
          {/* LEFT PANEL */}
          <Col md={5} lg={4} style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="mb-4">
              <h4 className="serif-font mb-1" style={{ fontWeight: 700 }}>Select a KPI</h4>
              <p style={{ fontSize: '12px', color: '#6C757D', marginBottom: '24px' }}>24 KPIs · 18 target · 6 project. Click to assign.</p>

              <div className="d-flex gap-2 mb-4 flex-wrap">
                <Card
                  onClick={() => setFilterCategory('All')}
                  body={false}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: filterCategory === 'All' ? '#1A1A1A' : '#FFFFFF',
                    color: filterCategory === 'All' ? '#fff' : '#1A1A1A',
                    border: filterCategory === 'All' ? '1px solid #1A1A1A' : '1px solid #E8E1D3',
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '6px 12px',
                    borderRadius: '20px',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: 'none'
                  }}
                >
                  All <span style={{ backgroundColor: filterCategory === 'All' ? '#333' : '#F0EAE0', color: filterCategory === 'All' ? '#fff' : '#1A1A1A', borderRadius: '50%', padding: '2px 6px', fontSize: '10px' }}>24</span>
                </Card>
                <Card
                  onClick={() => setFilterCategory('Target')}
                  body={false}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: filterCategory === 'Target' ? '#1A1A1A' : '#FFFFFF',
                    color: filterCategory === 'Target' ? '#fff' : '#1A1A1A',
                    border: filterCategory === 'Target' ? '1px solid #1A1A1A' : '1px solid #E8E1D3',
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '6px 12px',
                    borderRadius: '20px',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: 'none'
                  }}
                >
                  <span style={{ color: '#DC3545' }}>●</span> Target <span style={{ backgroundColor: '#F0EAE0', color: '#1A1A1A', borderRadius: '50%', padding: '2px 6px', fontSize: '10px' }}>18</span>
                </Card>
                <Card
                  onClick={() => setFilterCategory('Project')}
                  body={false}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: filterCategory === 'Project' ? '#1A1A1A' : '#FFFFFF',
                    color: filterCategory === 'Project' ? '#fff' : '#1A1A1A',
                    border: filterCategory === 'Project' ? '1px solid #1A1A1A' : '1px solid #E8E1D3',
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '6px 12px',
                    borderRadius: '20px',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: 'none'
                  }}
                >
                  <span style={{ color: '#0D6EFD' }}>●</span> Project <span style={{ backgroundColor: '#F0EAE0', color: '#1A1A1A', borderRadius: '50%', padding: '2px 6px', fontSize: '10px' }}>6</span>
                </Card>
              </div>

              <InputGroup
                style={{
                  borderRadius: '8px',
                  border: '1px solid #E8E1D3',
                  overflow: 'hidden',
                }}
              >
                <InputGroup.Text style={{ backgroundColor: '#FFFFFF', border: 'none', paddingLeft: '16px' }}>
                  <Search size={14} color="#6C757D" />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search by title or tag..."
                  value={kpiSearch}
                  onChange={(e) => setKpiSearch(e.target.value)}
                  style={{ border: 'none', backgroundColor: '#FFFFFF', fontSize: '13px', padding: '12px 16px 12px 8px' }}
                />
              </InputGroup>
            </div>

            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, paddingRight: '8px' }}>
              {filteredKpis.length > 0 ? (
                filteredKpis.map((kpi) => (
                  <KpiSelectItem
                    key={kpi.id}
                    kpi={kpi}
                    isSelected={kpi.id === selectedKpiId}
                    onClick={() => setSelectedKpiId(kpi.id)}
                  />
                ))
              ) : (
                <p className="text-muted text-center" style={{ fontSize: '13px', padding: '20px 0' }}>
                  No KPIs match your filter.
                </p>
              )}
            </div>
          </Col>

          {/* RIGHT PANEL */}
          <Col md={7} lg={8} style={{ display: 'flex', flexDirection: 'column' }}>
            {selectedKpi ? (
              <Card className="custom-card flex-grow-1" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: '16px' }}>
                <Card.Body style={{ overflowY: 'auto', padding: '40px 48px' }}>

                  {/* Top badges */}
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <CategoryBadge category={selectedKpi.tag || selectedKpi.category} />
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#A8A092', letterSpacing: '1px' }}>
                      {selectedKpi.category.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#1A1A1A', marginLeft: '4px' }}>
                      · Due {selectedKpi.deadline}
                    </span>
                  </div>

                  <h3 className="serif-font mb-4" style={{ fontWeight: 700 }}>{selectedKpi.title}</h3>
                  
                  {/* Info box */}
                  <div style={{ backgroundColor: '#F9F7F4', border: '1px solid #E8E1D3', borderRadius: '8px', padding: '20px 24px', display: 'flex', gap: '48px', marginBottom: '24px' }}>
                    <div>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: '#A8A092', letterSpacing: '1.5px', marginBottom: '6px' }}>TARGET</p>
                      <p style={{ fontSize: '16px', fontWeight: 600, color: '#0B5E3A', margin: 0 }}>{selectedKpi.targetValue}</p>
                    </div>
                    {selectedKpi.progressValue && (
                      <div>
                        <p style={{ fontSize: '10px', fontWeight: 700, color: '#A8A092', letterSpacing: '1.5px', marginBottom: '6px' }}>AGGREGATED PROGRESS</p>
                        <p style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A1A', margin: 0 }}>
                          {selectedKpi.progressValue.split(' ').map((word, i) => 
                            i < 2 ? <span key={i}>{word} </span> : <span key={i} style={{ color: '#6C757D', fontWeight: 400, fontSize: '13px' }}>{word} </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  <p style={{ fontSize: '13px', color: '#6C757D', lineHeight: 1.6, marginBottom: '32px' }}>
                    {selectedKpi.description}
                  </p>

                  <hr style={{ borderColor: '#E8E1D3', margin: '0 0 32px 0' }} />

                  {/* Currently assigned section */}
                  <div className="mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <span style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
                          Currently assigned
                        </span>
                        <span style={{ backgroundColor: '#E8F0ED', color: '#0B5E3A', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                          {selectedKpi.progress.length}
                        </span>
                      </div>
                      <Button
                        variant="link"
                        className="p-0 text-decoration-none"
                        style={{ fontSize: '13px', color: '#0B5E3A', fontWeight: 600 }}
                        onClick={() => navigate(`/manager/all-kpis/edit/${selectedKpiId}`)}
                      >
                        Manage
                      </Button>
                    </div>

                    {selectedKpi.progress.length > 0 ? (
                      selectedKpi.progress.map((staff, idx) => (
                        <StaffAssigneeRow key={idx} staff={staff} />
                      ))
                    ) : (
                      <p style={{ fontSize: '13px', color: '#6C757D', padding: '12px 0' }}>
                        No staff assigned to this KPI yet.
                      </p>
                    )}
                  </div>

                  {/* Assign to more staff */}
                  <div className="mt-5">
                    <p style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>Assign to more staff</p>

                    <InputGroup
                      className="mb-4"
                      style={{
                        borderRadius: '8px',
                        border: '1px dashed #A8A092',
                        overflow: 'hidden',
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      <InputGroup.Text style={{ backgroundColor: 'transparent', border: 'none', paddingLeft: '16px' }}>
                        <Search size={14} color="#A8A092" />
                      </InputGroup.Text>
                      <Form.Control
                        placeholder="Start typing a name or select from team..."
                        value={staffSearch}
                        onChange={(e) => setStaffSearch(e.target.value)}
                        style={{ border: 'none', backgroundColor: 'transparent', fontSize: '13px', padding: '14px 16px 14px 8px' }}
                      />
                    </InputGroup>

                    {suggestedStaff.length > 0 && staffSearch && (
                      <div className="mb-4">
                        <p style={{ fontSize: '10px', fontWeight: 700, color: '#A8A092', letterSpacing: '1px', marginBottom: '12px' }}>SUGGESTED</p>
                        <div style={{ borderRadius: '8px', border: '1px solid #E8E1D3', overflow: 'hidden', backgroundColor: '#fff' }}>
                          {suggestedStaff.map((s, idx) => (
                            <div
                              key={idx}
                              className="d-flex align-items-center gap-3 px-3 py-2"
                              style={{ borderBottom: idx < suggestedStaff.length - 1 ? '1px solid #F0EAE0' : 'none', cursor: 'pointer' }}
                              onClick={() => setStaffSearch('')}
                            >
                              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#F9E7DE', color: '#C85A3A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '10px' }}>
                                {s.initials}
                              </div>
                              <span style={{ fontSize: '13px', fontWeight: 500 }}>{s.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="d-flex align-items-center justify-content-between mt-4">
                      <div className="d-flex align-items-center gap-2">
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0B5E3A' }} />
                        <span style={{ fontSize: '12px', color: '#6C757D' }}>Changes saved · 2 min ago</span>
                      </div>
                      <Button style={{ backgroundColor: '#0B2019', border: 'none', fontSize: '13px', fontWeight: 600, padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Notify assignees <ArrowRight size={14} />
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ) : (
              <Card className="custom-card flex-grow-1 d-flex align-items-center justify-content-center">
                <p className="text-muted" style={{ fontSize: '13px' }}>Select a KPI to view details.</p>
              </Card>
            )}
          </Col>
        </Row>
      </main>
    </div>
  );
};

export default AssignmentCenter;
