import { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button, Form, Spinner, Alert, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Search } from 'react-bootstrap-icons';
import Sidebar from '../component/Sidebar';
import axiosInstance from '../utils/axiosInstance';
import '../styles/theme.css';

const AllKPIs = () => {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterDeadline, setFilterDeadline] = useState("All");
  const [filterAssigned, setFilterAssigned] = useState("All");
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [kpisRes, staffRes] = await Promise.all([
          axiosInstance.get('/api/kpi'),
          axiosInstance.get('/api/auth/staff')
        ]);
        setKpis(kpisRes.data || []);
        setStaffList(staffRes.data || []);
      } catch (err) {
        console.error('Failed to load KPIs or staff:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch database records.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatus = (kpi) => {
    if (kpi.status === 'Not Started') {
      return "Draft";
    }
    if (kpi.status === 'Completed' || kpi.achievementScore === 100) {
      return "Within SLA";
    }
    if (kpi.targetDate) {
      const dueDate = new Date(kpi.targetDate);
      const today = new Date();
      dueDate.setHours(23, 59, 59, 999);
      if (dueDate < today) {
        return "Overdue";
      }
      
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      if (dueDate >= todayStart && dueDate <= todayEnd) {
        return "Due today";
      }
    }
    return "Within SLA";
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Overdue":
        return "#E85D3F"; // orange/red
      case "Due today":
        return "#FFC107"; // yellow
      case "Within SLA":
        return "#28a745"; // green
      case "Draft":
        return "#6C757D"; // gray
      default:
        return "#6C757D"; // gray
    }
  };

  const getStaffInitials = (email) => {
    const staff = staffList.find(s => s.email.toLowerCase() === email.toLowerCase());
    if (staff) {
      return `${staff.firstName[0]}${staff.lastName[0]}`.toUpperCase();
    }
    if (email) {
      const parts = email.split('@')[0].split(/[._-]/);
      if (parts.length > 1) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return email.substring(0, 2).toUpperCase();
    }
    return '??';
  };

  const getStaffName = (email) => {
    const staff = staffList.find(s => s.email.toLowerCase() === email.toLowerCase());
    if (staff) {
      return `${staff.firstName} ${staff.lastName}`;
    }
    return email;
  };

  const handleEditKPI = (kpiId) => {
    navigate(`/manager/all-kpis/edit/${kpiId}`);
  };

  const mappedKpis = kpis.map(kpi => {
    const status = getStatus(kpi);
    return {
      id: kpi._id,
      title: kpi.title,
      category: kpi.category || 'Target',
      deadline: kpi.targetDate ? new Date(kpi.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No deadline',
      assignedEmail: kpi.assignee,
      assignedInitials: getStaffInitials(kpi.assignee),
      assignedName: getStaffName(kpi.assignee),
      progress: kpi.achievementScore || 0,
      status: status
    };
  });

  const totalCount = mappedKpis.length;
  const overdueCount = mappedKpis.filter(k => k.status === 'Overdue').length;
  const dueTodayCount = mappedKpis.filter(k => k.status === 'Due today').length;
  const withinSlaCount = mappedKpis.filter(k => k.status === 'Within SLA').length;
  const draftCount = mappedKpis.filter(k => k.status === 'Draft').length;

  const filteredKpis = mappedKpis.filter(kpi => {
    const matchSearch = searchQuery.trim() === '' || kpi.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = filterCategory === 'All' || kpi.category === filterCategory;
    const matchDeadline = filterDeadline === 'All' || kpi.status === filterDeadline;
    const matchAssigned = filterAssigned === 'All' || kpi.assignedEmail === filterAssigned;
    const matchTab = activeTab === 'All' || kpi.status === activeTab;
    return matchSearch && matchCategory && matchDeadline && matchAssigned && matchTab;
  });

  if (loading) {
    return (
      <div className="d-flex">
        <Sidebar role="manager" />
        <main style={{ marginLeft: 'var(--sidebar-width)', flex: 1, padding: '40px 60px' }} className="d-flex justify-content-center align-items-center">
          <Spinner animation="border" variant="dark" className="me-2" />
          <span>Loading KPIs...</span>
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
        <p className="sidebar-header small mb-1">Workspace</p>
        <div className="d-flex justify-content-between align-items-center mb-5">
          <h3 className="serif-font mb-0">KPI directory</h3>
          <Button className="btn-orange" onClick={() => navigate('/manager/all-kpis/new')}>+ New KPI</Button>
        </div>

        <p className="text-muted mb-4">All KPIs across departments – create, edit, and manage records</p>

        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Filter Controls Row (Search and Dropdowns aligned horizontally) */}
        <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
          <InputGroup style={{ maxWidth: '280px', borderRadius: '8px', border: '1px solid #E8E1D3', overflow: 'hidden', backgroundColor: '#fff' }}>
            <InputGroup.Text style={{ backgroundColor: 'transparent', border: 'none', paddingLeft: '12px' }}>
              <Search size={14} color="#6C757D" />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search by title or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', fontSize: '13px', padding: '8px 12px 8px 0', boxShadow: 'none' }}
            />
          </InputGroup>

          <Form.Select 
            size="sm" 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ width: 'auto', borderRadius: '8px', borderColor: '#E8E1D3', fontSize: '13px', padding: '8px 36px 8px 12px', height: '38px', backgroundColor: '#fff' }}
          >
            <option value="All">Category</option>
            <option value="Target">Target</option>
            <option value="Project">Project</option>
          </Form.Select>

          <Form.Select 
            size="sm"
            value={filterDeadline}
            onChange={(e) => setFilterDeadline(e.target.value)}
            style={{ width: 'auto', borderRadius: '8px', borderColor: '#E8E1D3', fontSize: '13px', padding: '8px 36px 8px 12px', height: '38px', backgroundColor: '#fff' }}
          >
            <option value="All">Deadline</option>
            <option value="Due today">Due today</option>
            <option value="Overdue">Overdue</option>
            <option value="Within SLA">Within SLA</option>
            <option value="Draft">Draft</option>
          </Form.Select>

          <Form.Select 
            size="sm"
            value={filterAssigned}
            onChange={(e) => setFilterAssigned(e.target.value)}
            style={{ width: 'auto', borderRadius: '8px', borderColor: '#E8E1D3', fontSize: '13px', padding: '8px 36px 8px 12px', height: '38px', backgroundColor: '#fff' }}
          >
            <option value="All">Assigned to</option>
            {staffList.map(staff => (
              <option key={staff.id} value={staff.email}>
                {staff.firstName} {staff.lastName}
              </option>
            ))}
          </Form.Select>
        </div>

        {/* Clickable Status Filters Row (Horizontal status pills) */}
        <div className="d-flex gap-3 mb-4 flex-wrap align-items-center">
          {[
            { label: 'All', count: totalCount },
            { label: 'Within SLA', count: withinSlaCount },
            { label: 'Due today', count: dueTodayCount },
            { label: 'Overdue', count: overdueCount },
            { label: 'Draft', count: draftCount },
          ].map((tab) => {
            const isSelected = activeTab === tab.label;
            return (
              <div
                key={tab.label}
                onClick={() => setActiveTab(tab.label)}
                style={{
                  cursor: 'pointer',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  backgroundColor: isSelected ? '#1A1A1A' : 'transparent',
                  color: isSelected ? '#FFFFFF' : '#6C757D',
                  border: isSelected ? '1px solid #1A1A1A' : '1px solid transparent',
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    fontSize: '10px',
                    backgroundColor: isSelected ? '#2E423B' : '#E8E1D3',
                    color: isSelected ? '#FFFFFF' : '#1A1A1A',
                  }}
                >
                  {tab.count}
                </span>
              </div>
            );
          })}
        </div>

        {/* KPI Table */}
        <div className="table-container">
          <Table hover responsive className="kpi-table">
            <thead>
              <tr>
                <th><Form.Check type="checkbox" aria-label="Select all" /></th>
                <th>KPI TITLE</th>
                <th>CATEGORY</th>
                <th>DEADLINE</th>
                <th>ASSIGNED</th>
                <th>PROGRESS</th>
                <th>STATUS</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredKpis.map((kpi) => (
                <tr key={kpi.id}>
                  <td><Form.Check type="checkbox" /></td>
                  <td className="fw-normal">{kpi.title}</td>
                  <td>
                    <span className="badge badge-category">
                      {kpi.category === "Target" && "●"}
                      {kpi.category === "Project" && "●"}
                      {" " + kpi.category}
                    </span>
                  </td>
                  <td className="text-muted small">{kpi.deadline}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <span className="badge badge-assigned" title={kpi.assignedName}>
                        {kpi.assignedInitials}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="progress-container">
                      <div className="progress-bar-wrapper">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${kpi.progress}%`, backgroundColor: '#0B2019' }}
                        ></div>
                      </div>
                      <span className="progress-text fw-bold">{kpi.progress}%</span>
                    </div>
                  </td>
                  <td>
                    <span 
                      className="badge badge-status-pill"
                      style={{ backgroundColor: `${getStatusBadgeColor(kpi.status)}20`, color: getStatusBadgeColor(kpi.status) }}
                    >
                      {kpi.status}
                    </span>
                  </td>
                  <td>
                    <Button 
                      variant="dark" 
                      size="sm"
                      className="edit-button"
                      onClick={() => handleEditKPI(kpi.id)}
                    >
                      Edit →
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredKpis.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-muted">
                    No KPIs found matching search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </main>
    </div>
  );
};

export default AllKPIs;
