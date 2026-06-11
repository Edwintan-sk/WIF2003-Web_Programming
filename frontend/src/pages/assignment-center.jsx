import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Row, Col, Card, Form, Button, Nav, InputGroup, Spinner, Alert,
} from 'react-bootstrap';
import { Search, ArrowRight } from 'react-bootstrap-icons';
import Sidebar from '../component/Sidebar';
import KpiSelectItem from '../component/KpiSelectItem';
import StaffAssigneeRow from '../component/StaffAssigneeRow';
import CategoryBadge from '../component/CategoryBadge';
import api from '../utils/axiosInstance';
import '../styles/theme.css';

// Canonical categories — must match backend constants.js CATEGORY_COLORS and the
// create-edit-kpi.jsx category dropdown (source of truth for what managers can pick).
const CATEGORIES = ['Community', 'Content', 'Internal', 'Partnerships', 'Project Mgmt'];
const CATEGORY_DOT_COLORS = {
  'Community':    '#183628',
  'Content':      '#de5c44',
  'Internal':     '#c99552',
  'Partnerships': '#1b6a38',
  'Project Mgmt': '#597495',
};

// ─── Component ───────────────────────────────────────────────────────────────

const AssignmentCenter = () => {
  const navigate = useNavigate();

  const [kpis,               setKpis]               = useState([]);
  const [staffList,          setStaffList]          = useState([]);
  const [isLoading,          setIsLoading]          = useState(true);
  const [error,              setError]              = useState(null);
  const [isSaving,           setIsSaving]           = useState(false);
  const [notifyStatus,       setNotifyStatus]       = useState(null); // null | 'sending' | 'sent' | 'error'

  const [activeTab,          setActiveTab]          = useState('by-kpi');
  const [selectedKpiId,      setSelectedKpiId]      = useState(null);
  const [selectedStaffEmail, setSelectedStaffEmail] = useState(null);
  const [kpiSearch,          setKpiSearch]          = useState('');
  const [filterCategory,     setFilterCategory]     = useState('All');
  const [staffSearch,        setStaffSearch]        = useState('');

  // fetch KPIs and staff list in parallel on mount
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const [kpiRes, staffRes] = await Promise.all([
          api.get('/api/kpi'),
          api.get('/api/users/staff'),
        ]);
        const fetchedKpis  = kpiRes.data.data  || kpiRes.data  || [];
        const fetchedStaff = staffRes.data.data || [];
        setKpis(fetchedKpis);
        setStaffList(fetchedStaff);
        if (fetchedKpis.length  > 0) setSelectedKpiId(fetchedKpis[0]._id);
        if (fetchedStaff.length > 0) setSelectedStaffEmail(fetchedStaff[0].email);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load data.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // ── Derived data ─────────────────────────────────────────────────────────

  const totalKpis      = kpis.length;
  const categoryCounts = Object.fromEntries(
    CATEGORIES.map((c) => [c, kpis.filter((k) => k.category === c).length])
  );

  // add a formatted deadline field so KpiSelectItem can display it
  const adaptedKpisForList = kpis.map((k) => ({
    ...k,
    deadline: k.targetDate
      ? new Date(k.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : 'No deadline',
    targetValue: k.targetText || '',
  }));

  const filteredKpis = adaptedKpisForList.filter((kpi) => {
    const matchSearch   = kpi.title.toLowerCase().includes(kpiSearch.toLowerCase());
    const matchCategory = filterCategory === 'All' || kpi.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const selectedKpi = kpis.find((k) => k._id === selectedKpiId) || null;

  // build the shape the right panel needs from the raw KPI + staffList
  const adaptedSelected = selectedKpi ? {
    ...selectedKpi,
    deadline: selectedKpi.targetDate
      ? new Date(selectedKpi.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : 'No deadline',
    targetValue:   selectedKpi.targetText || '',
    progressValue: `${selectedKpi.achievementScore || 0}% complete`,
    progress: (selectedKpi.assignees || []).map((email) => {
      const s       = staffList.find((x) => x.email === email);
      const name    = s ? `${s.firstName} ${s.lastName}` : email;
      const initials = s
        ? (s.firstName[0] + s.lastName[0]).toUpperCase()
        : email.slice(0, 2).toUpperCase();
      return {
        email,
        initials,
        name,
        role:     s?.roleAtShop || '',
        progress: selectedKpi.achievementScore || 0,
      };
    }),
  } : null;

  // staff suggestions for the "assign to more staff" search in By KPI view
  const suggestedStaff = staffList.filter((s) => {
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
    return (
      staffSearch.trim() &&
      fullName.includes(staffSearch.toLowerCase()) &&
      !(selectedKpi?.assignees || []).includes(s.email)
    );
  });

  // By-staff view derived data
  const filteredStaff = staffList.filter((s) => {
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
    return fullName.includes(staffSearch.toLowerCase());
  });

  const selectedStaff = staffList.find((s) => s.email === selectedStaffEmail) || null;
  const staffKpis     = selectedStaff
    ? kpis.filter((k) => (k.assignees || []).includes(selectedStaff.email))
    : [];

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleAssign = async (staffEmail) => {
    if (!selectedKpi) return;
    const current = selectedKpi.assignees || [];
    if (current.includes(staffEmail)) return;
    const updated = [...current, staffEmail];
    try {
      setIsSaving(true);
      await api.patch(`/api/kpi/${selectedKpi._id}/assignees`, { assignees: updated });
      setKpis((prev) =>
        prev.map((k) => k._id === selectedKpi._id ? { ...k, assignees: updated } : k)
      );
    } catch (err) {
      console.error('Failed to assign staff:', err);
    } finally {
      setIsSaving(false);
      setStaffSearch('');
    }
  };

  const handleUnassign = async (staffEmail) => {
    if (!selectedKpi) return;
    const updated = (selectedKpi.assignees || []).filter((e) => e !== staffEmail);
    try {
      setIsSaving(true);
      await api.patch(`/api/kpi/${selectedKpi._id}/assignees`, { assignees: updated });
      setKpis((prev) =>
        prev.map((k) => k._id === selectedKpi._id ? { ...k, assignees: updated } : k)
      );
    } catch (err) {
      console.error('Failed to unassign staff:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotify = async () => {
    if (!selectedKpi || !(selectedKpi.assignees?.length > 0)) return;
    try {
      setNotifyStatus('sending');
      await api.post(`/api/kpi/${selectedKpi._id}/notify-assignees`);
      setNotifyStatus('sent');
      setTimeout(() => setNotifyStatus(null), 3000);
    } catch (err) {
      console.error('Failed to notify assignees:', err);
      setNotifyStatus('error');
      setTimeout(() => setNotifyStatus(null), 3000);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="d-flex">
        <Sidebar role="manager" />
        <main style={{ marginLeft: 'var(--sidebar-width)', flex: 1, padding: '40px 48px', backgroundColor: 'var(--main-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spinner animation="border" style={{ color: '#0B5E3A' }} />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex">
        <Sidebar role="manager" />
        <main style={{ marginLeft: 'var(--sidebar-width)', flex: 1, padding: '40px 48px', backgroundColor: 'var(--main-bg)', minHeight: '100vh' }}>
          <Alert variant="danger">{error}</Alert>
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
                  onClick={() => {
                    setActiveTab(key);
                    setKpiSearch('');
                    setStaffSearch('');
                  }}
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

          {/* ═══════════ BY KPI TAB ═══════════ */}
          {activeTab === 'by-kpi' && (
            <>
              {/* LEFT PANEL */}
              <Col md={5} lg={4} style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="mb-4">
                  <h4 className="serif-font mb-1" style={{ fontWeight: 700 }}>Select a KPI</h4>
                  <p style={{ fontSize: '12px', color: '#6C757D', marginBottom: '24px' }}>
                    {totalKpis} KPIs total. Click to assign.
                  </p>

                  <div className="d-flex gap-2 mb-4 flex-wrap">
                    {/* All chip */}
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
                        boxShadow: 'none',
                      }}
                    >
                      All <span style={{ backgroundColor: filterCategory === 'All' ? '#333' : '#F0EAE0', color: filterCategory === 'All' ? '#fff' : '#1A1A1A', borderRadius: '50%', padding: '2px 6px', fontSize: '10px' }}>{totalKpis}</span>
                    </Card>

                    {/* One chip per real category */}
                    {CATEGORIES.map((cat) => (
                      <Card
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        body={false}
                        style={{
                          cursor: 'pointer',
                          backgroundColor: filterCategory === cat ? '#1A1A1A' : '#FFFFFF',
                          color: filterCategory === cat ? '#fff' : '#1A1A1A',
                          border: filterCategory === cat ? '1px solid #1A1A1A' : '1px solid #E8E1D3',
                          fontSize: '12px',
                          fontWeight: 600,
                          padding: '6px 12px',
                          borderRadius: '20px',
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: 'none',
                        }}
                      >
                        <span style={{ color: filterCategory === cat ? '#fff' : CATEGORY_DOT_COLORS[cat] }}>●</span>
                        {cat}
                        <span style={{ backgroundColor: filterCategory === cat ? '#333' : '#F0EAE0', color: filterCategory === cat ? '#fff' : '#1A1A1A', borderRadius: '50%', padding: '2px 6px', fontSize: '10px' }}>
                          {categoryCounts[cat]}
                        </span>
                      </Card>
                    ))}
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
                        key={kpi._id}
                        kpi={kpi}
                        isSelected={kpi._id === selectedKpiId}
                        onClick={() => setSelectedKpiId(kpi._id)}
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
                {adaptedSelected ? (
                  <Card className="custom-card flex-grow-1" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: '16px' }}>
                    <Card.Body style={{ overflowY: 'auto', padding: '40px 48px' }}>

                      {/* Top badges */}
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <CategoryBadge category={adaptedSelected.category} />
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#A8A092', letterSpacing: '1px' }}>
                          {adaptedSelected.category.toUpperCase()}
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#1A1A1A', marginLeft: '4px' }}>
                          · Due {adaptedSelected.deadline}
                        </span>
                      </div>

                      <h3 className="serif-font mb-4" style={{ fontWeight: 700 }}>{adaptedSelected.title}</h3>

                      {/* Info box */}
                      <div style={{ backgroundColor: '#F9F7F4', border: '1px solid #E8E1D3', borderRadius: '8px', padding: '20px 24px', display: 'flex', gap: '48px', marginBottom: '24px' }}>
                        <div>
                          <p style={{ fontSize: '10px', fontWeight: 700, color: '#A8A092', letterSpacing: '1.5px', marginBottom: '6px' }}>TARGET</p>
                          <p style={{ fontSize: '16px', fontWeight: 600, color: '#0B5E3A', margin: 0 }}>{adaptedSelected.targetValue}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '10px', fontWeight: 700, color: '#A8A092', letterSpacing: '1.5px', marginBottom: '6px' }}>AGGREGATED PROGRESS</p>
                          <p style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A1A', margin: 0 }}>
                            {adaptedSelected.progressValue}
                          </p>
                        </div>
                      </div>

                      {adaptedSelected.description && (
                        <p style={{ fontSize: '13px', color: '#6C757D', lineHeight: 1.6, marginBottom: '32px' }}>
                          {adaptedSelected.description}
                        </p>
                      )}

                      <hr style={{ borderColor: '#E8E1D3', margin: '0 0 32px 0' }} />

                      {/* Currently assigned section */}
                      <div className="mb-4">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <div className="d-flex align-items-center gap-2">
                            <span style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
                              Currently assigned
                            </span>
                            <span style={{ backgroundColor: '#E8F0ED', color: '#0B5E3A', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                              {adaptedSelected.progress.length}
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

                        {adaptedSelected.progress.length > 0 ? (
                          adaptedSelected.progress.map((staff) => (
                            <StaffAssigneeRow
                              key={staff.email}
                              staff={staff}
                              onRemove={() => handleUnassign(staff.email)}
                            />
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
                                  key={s._id}
                                  className="d-flex align-items-center gap-3 px-3 py-2"
                                  style={{ borderBottom: idx < suggestedStaff.length - 1 ? '1px solid #F0EAE0' : 'none', cursor: 'pointer' }}
                                  onClick={() => handleAssign(s.email)}
                                >
                                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#F9E7DE', color: '#C85A3A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '10px' }}>
                                    {(s.firstName[0] + s.lastName[0]).toUpperCase()}
                                  </div>
                                  <div>
                                    <span style={{ fontSize: '13px', fontWeight: 500 }}>{s.firstName} {s.lastName}</span>
                                    {s.roleAtShop && (
                                      <span style={{ fontSize: '11px', color: '#6C757D', marginLeft: '8px' }}>{s.roleAtShop}</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="d-flex align-items-center justify-content-between mt-4">
                          <div className="d-flex align-items-center gap-2">
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isSaving ? '#FFC107' : '#0B5E3A' }} />
                            <span style={{ fontSize: '12px', color: '#6C757D' }}>
                              {notifyStatus === 'sent'
                                ? 'Assignees notified'
                                : notifyStatus === 'error'
                                ? 'Notification failed'
                                : isSaving ? 'Saving…' : 'Changes saved'}
                            </span>
                          </div>
                          <Button
                            style={{ backgroundColor: '#0B2019', border: 'none', fontSize: '13px', fontWeight: 600, padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', opacity: (notifyStatus === 'sending' || !(selectedKpi?.assignees?.length > 0)) ? 0.6 : 1 }}
                            disabled={notifyStatus === 'sending' || !(selectedKpi?.assignees?.length > 0)}
                            onClick={handleNotify}
                          >
                            {notifyStatus === 'sending' ? 'Sending…' : notifyStatus === 'sent' ? 'Sent ✓' : <>Notify assignees <ArrowRight size={14} /></>}
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
            </>
          )}

          {/* ═══════════ BY STAFF TAB ═══════════ */}
          {activeTab === 'by-staff' && (
            <>
              {/* LEFT PANEL — staff list */}
              <Col md={5} lg={4} style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="mb-4">
                  <h4 className="serif-font mb-1" style={{ fontWeight: 700 }}>Select a staff</h4>
                  <p style={{ fontSize: '12px', color: '#6C757D', marginBottom: '24px' }}>
                    {staffList.length} staff member{staffList.length !== 1 ? 's' : ''}
                  </p>

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
                      placeholder="Search by name..."
                      value={staffSearch}
                      onChange={(e) => setStaffSearch(e.target.value)}
                      style={{ border: 'none', backgroundColor: '#FFFFFF', fontSize: '13px', padding: '12px 16px 12px 8px' }}
                    />
                  </InputGroup>
                </div>

                <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, paddingRight: '8px' }}>
                  {filteredStaff.length > 0 ? (
                    filteredStaff.map((s) => {
                      const initials   = (s.firstName[0] + s.lastName[0]).toUpperCase();
                      const kpiCount   = kpis.filter((k) => (k.assignees || []).includes(s.email)).length;
                      const isSelected = s.email === selectedStaffEmail;
                      return (
                        <div
                          key={s._id}
                          className="d-flex align-items-center gap-3"
                          onClick={() => setSelectedStaffEmail(s.email)}
                          style={{
                            cursor: 'pointer',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            backgroundColor: isSelected ? '#1A1A1A' : '#FFFFFF',
                            border: isSelected ? '1px solid #1A1A1A' : '1px solid #E8E1D3',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              backgroundColor: isSelected ? '#333' : '#F9E7DE',
                              color: isSelected ? '#fff' : '#C85A3A',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '12px',
                              flexShrink: 0,
                            }}
                          >
                            {initials}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: isSelected ? '#fff' : 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {s.firstName} {s.lastName}
                            </div>
                            {s.roleAtShop && (
                              <div style={{ fontSize: '11px', color: isSelected ? '#ccc' : '#6C757D', marginTop: '2px' }}>
                                {s.roleAtShop}
                              </div>
                            )}
                          </div>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '3px 8px',
                              borderRadius: '12px',
                              backgroundColor: isSelected ? '#333' : '#E8F0ED',
                              color: isSelected ? '#fff' : '#0B5E3A',
                              whiteSpace: 'nowrap',
                              flexShrink: 0,
                            }}
                          >
                            {kpiCount} KPI{kpiCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-muted text-center" style={{ fontSize: '13px', padding: '20px 0' }}>
                      No staff found.
                    </p>
                  )}
                </div>
              </Col>

              {/* RIGHT PANEL — staff KPI list */}
              <Col md={7} lg={8} style={{ display: 'flex', flexDirection: 'column' }}>
                {selectedStaff ? (
                  <Card className="custom-card flex-grow-1" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: '16px' }}>
                    <Card.Body style={{ overflowY: 'auto', padding: '40px 48px' }}>

                      {/* Staff header */}
                      <div className="d-flex align-items-center gap-4 mb-4">
                        <div
                          style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            backgroundColor: '#F9E7DE',
                            color: '#C85A3A',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '18px',
                            flexShrink: 0,
                          }}
                        >
                          {(selectedStaff.firstName[0] + selectedStaff.lastName[0]).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="serif-font mb-1" style={{ fontWeight: 700 }}>
                            {selectedStaff.firstName} {selectedStaff.lastName}
                          </h4>
                          {selectedStaff.roleAtShop && (
                            <p style={{ fontSize: '13px', color: '#6C757D', margin: 0 }}>{selectedStaff.roleAtShop}</p>
                          )}
                          <p style={{ fontSize: '12px', color: '#A8A092', margin: '4px 0 0' }}>{selectedStaff.email}</p>
                        </div>
                      </div>

                      <hr style={{ borderColor: '#E8E1D3', margin: '0 0 32px 0' }} />

                      {/* Assigned KPIs section */}
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-4">
                          <span style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
                            Assigned KPIs
                          </span>
                          <span style={{ backgroundColor: '#E8F0ED', color: '#0B5E3A', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                            {staffKpis.length}
                          </span>
                        </div>

                        {staffKpis.length === 0 ? (
                          <div style={{ padding: '32px', textAlign: 'center', backgroundColor: '#F9F7F4', borderRadius: '12px', border: '1px dashed #D8CFC2' }}>
                            <p style={{ fontSize: '13px', color: '#6C757D', margin: 0 }}>No KPIs assigned yet.</p>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {staffKpis.map((kpi) => {
                              const deadline = kpi.targetDate
                                ? new Date(kpi.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                : 'No deadline';
                              return (
                                <div
                                  key={kpi._id}
                                  className="d-flex align-items-center gap-3"
                                  style={{ padding: '16px 20px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E8E1D3' }}
                                >
                                  <CategoryBadge category={kpi.category} style={{ flexShrink: 0 }} />
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {kpi.title}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#6C757D' }}>
                                      Due {deadline} · {kpi.status}
                                    </div>
                                  </div>
                                  <Button
                                    variant="link"
                                    className="p-0 text-decoration-none d-flex align-items-center gap-1"
                                    style={{ fontSize: '12px', color: '#0B5E3A', fontWeight: 600, flexShrink: 0 }}
                                    onClick={() => navigate(`/manager/all-kpis/edit/${kpi._id}`)}
                                  >
                                    View <ArrowRight size={12} />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                ) : (
                  <Card className="custom-card flex-grow-1 d-flex align-items-center justify-content-center">
                    <p className="text-muted" style={{ fontSize: '13px' }}>Select a staff member to view their KPIs.</p>
                  </Card>
                )}
              </Col>
            </>
          )}

        </Row>
      </main>
    </div>
  );
};

export default AssignmentCenter;
