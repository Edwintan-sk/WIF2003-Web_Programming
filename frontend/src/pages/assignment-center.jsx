import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Row, Col, Card, Form, Button, Nav, InputGroup, Spinner, Alert
} from 'react-bootstrap';
import { Search, ArrowRight } from 'react-bootstrap-icons';
import Sidebar from '../component/Sidebar';
import KpiSelectItem from '../component/KpiSelectItem';
import StaffAssigneeRow from '../component/StaffAssigneeRow';
import CategoryBadge from '../component/CategoryBadge';
import axiosInstance from '../utils/axiosInstance';
import '../styles/theme.css';

const AssignmentCenter = () => {
  const navigate = useNavigate();

  const [activeTab,      setActiveTab]      = useState('by-kpi');
  const [kpis,           setKpis]           = useState([]);
  const [staffList,      setStaffList]      = useState([]);
  const [selectedKpiId,  setSelectedKpiId]  = useState(null);
  const [kpiSearch,      setKpiSearch]      = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [staffSearch,    setStaffSearch]    = useState('');
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [kpisRes, staffRes] = await Promise.all([
          axiosInstance.get('/api/kpi'),
          axiosInstance.get('/api/auth/staff')
        ]);
        const kpisData = kpisRes.data || [];
        setKpis(kpisData);
        setStaffList(staffRes.data || []);
        if (kpisData.length > 0) {
          setSelectedKpiId(kpisData[0]._id);
        }
      } catch (err) {
        console.error('Failed to load Assignment Center data:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch assignment center data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const mappedKpis = kpis.map(kpi => {
    const staff = staffList.find(s => s.email.toLowerCase() === (kpi.assignee || '').toLowerCase());
    const progressList = [];
    if (staff) {
      progressList.push({
        initials: `${staff.firstName[0]}${staff.lastName[0]}`.toUpperCase(),
        name: `${staff.firstName} ${staff.lastName}`,
        role: staff.roleAtShop || staff.positionTitle || 'Staff',
        progress: kpi.achievementScore || 0,
        text: `${kpi.achievementScore}%`
      });
    }
    
    return {
      id: kpi._id,
      title: kpi.title,
      category: kpi.category || 'Target',
      tag: kpi.category || 'Target',
      deadline: kpi.targetDate ? new Date(kpi.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No deadline',
      assignees: kpi.assignee ? [kpi.assignee] : [],
      status: kpi.status,
      totalSlots: 1,
      targetValue: kpi.targetText || 'No target value',
      progressValue: `${kpi.achievementScore}% complete`,
      description: kpi.description || kpi.targetText || '',
      progress: progressList
    };
  });

  const selectedKpi = mappedKpis.find((k) => k.id === selectedKpiId);

  const filteredKpis = mappedKpis.filter((kpi) => {
    const matchSearch   = kpi.title.toLowerCase().includes(kpiSearch.toLowerCase());
    const matchCategory = filterCategory === 'All' || kpi.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const suggestedStaff = staffList.filter((s) =>
    staffSearch.trim() &&
    (`${s.firstName} ${s.lastName}`).toLowerCase().includes(staffSearch.toLowerCase())
  );

  const handleAssignStaff = async (staffEmail) => {
    try {
      if (!selectedKpiId) return;
      const kpiToUpdate = kpis.find(k => k._id === selectedKpiId);
      if (!kpiToUpdate) return;
      
      const payload = {
        ...kpiToUpdate,
        assignee: staffEmail
      };
      
      await axiosInstance.put(`/api/kpi/${selectedKpiId}`, payload);
      
      // Refresh lists
      const kpisRes = await axiosInstance.get('/api/kpi');
      setKpis(kpisRes.data || []);
      setStaffSearch('');
      alert('KPI assignee updated successfully!');
    } catch (err) {
      console.error('Failed to assign staff:', err);
      alert(err.response?.data?.message || 'Error occurred while assigning staff.');
    }
  };

  const handleNotify = () => {
    alert('Notifications sent successfully to assignee!');
  };

  if (loading) {
    return (
      <div className="d-flex">
        <Sidebar role="manager" />
        <main style={{ marginLeft: 'var(--sidebar-width)', flex: 1, padding: '40px 48px' }} className="d-flex justify-content-center align-items-center">
          <Spinner animation="border" variant="dark" className="me-2" />
          <span>Loading Assignment Center...</span>
        </main>
      </div>
    );
  }

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

        {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

        <Row className="g-4" style={{ minHeight: 'calc(100vh - 200px)' }}>
          {/* LEFT PANEL */}
          <Col md={5} lg={4} style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="mb-4">
              <h4 className="serif-font mb-1" style={{ fontWeight: 700 }}>Select a KPI</h4>
              <p style={{ fontSize: '12px', color: '#6C757D', marginBottom: '24px' }}>
                {mappedKpis.length} KPIs total. Click to assign.
              </p>

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
                  All <span style={{ backgroundColor: filterCategory === 'All' ? '#333' : '#F0EAE0', color: filterCategory === 'All' ? '#fff' : '#1A1A1A', borderRadius: '50%', padding: '2px 6px', fontSize: '10px' }}>{mappedKpis.length}</span>
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
                  <span style={{ color: '#DC3545' }}>●</span> Target <span style={{ backgroundColor: '#F0EAE0', color: '#1A1A1A', borderRadius: '50%', padding: '2px 6px', fontSize: '10px' }}>{mappedKpis.filter(k => k.category === 'Target').length}</span>
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
                  <span style={{ color: '#0D6EFD' }}>●</span> Project <span style={{ backgroundColor: '#F0EAE0', color: '#1A1A1A', borderRadius: '50%', padding: '2px 6px', fontSize: '10px' }}>{mappedKpis.filter(k => k.category === 'Project').length}</span>
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
                  placeholder="Search by title..."
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
                        <span style={{ backgroundColor: '#E8F0ED', color: '#0B5E3A', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContext: 'center', fontSize: '11px', fontWeight: 700, justifyContent: 'center' }}>
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

                  {/* Reassign / Assign to staff */}
                  <div className="mt-5">
                    <p style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>Reassign to staff member</p>

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
                        placeholder="Search team member name..."
                        value={staffSearch}
                        onChange={(e) => setStaffSearch(e.target.value)}
                        style={{ border: 'none', backgroundColor: 'transparent', fontSize: '13px', padding: '14px 16px 14px 8px' }}
                      />
                    </InputGroup>

                    {suggestedStaff.length > 0 && staffSearch && (
                      <div className="mb-4">
                        <p style={{ fontSize: '10px', fontWeight: 700, color: '#A8A092', letterSpacing: '1px', marginBottom: '12px' }}>SUGGESTED staff</p>
                        <div style={{ borderRadius: '8px', border: '1px solid #E8E1D3', overflow: 'hidden', backgroundColor: '#fff' }}>
                          {suggestedStaff.map((s, idx) => (
                            <div
                              key={idx}
                              className="d-flex align-items-center justify-content-between px-3 py-2 hover-bg-light"
                              style={{ borderBottom: idx < suggestedStaff.length - 1 ? '1px solid #F0EAE0' : 'none', cursor: 'pointer' }}
                              onClick={() => handleAssignStaff(s.email)}
                            >
                              <div className="d-flex align-items-center gap-3">
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#F9E7DE', color: '#C85A3A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '10px' }}>
                                  {s.firstName[0]}{s.lastName[0]}
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: 500 }}>{s.firstName} {s.lastName} ({s.email})</span>
                              </div>
                              <Button size="sm" variant="dark" style={{ fontSize: '11px', padding: '4px 8px' }}>Assign</Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="d-flex align-items-center justify-content-between mt-4">
                      <div className="d-flex align-items-center gap-2">
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0B5E3A' }} />
                        <span style={{ fontSize: '12px', color: '#6C757D' }}>Select staff search result above to assign.</span>
                      </div>
                      <Button 
                        style={{ backgroundColor: '#0B2019', border: 'none', fontSize: '13px', fontWeight: 600, padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}
                        onClick={handleNotify}
                      >
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
