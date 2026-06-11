import { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../component/Sidebar';
import api from '../utils/axiosInstance';
import '../styles/theme.css';

const AllKPIs = () => {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterCategory, setFilterCategory] = useState('');
  const [filterDeadline, setFilterDeadline] = useState('All');
  const [filterAssigned, setFilterAssigned] = useState('');

  // re-fetch when server-side filters change; deadline is computed client-side below
  useEffect(() => {
    const fetchKpis = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const params = {};
        if (filterCategory) params.category = filterCategory;
        if (filterAssigned) params.assignee = filterAssigned;
        const response = await api.get('/api/kpi', { params });
        setKpis(response.data.data || response.data || []);
      } catch (err) {
        console.error('Error fetching KPIs:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load KPIs.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchKpis();
  }, [filterCategory, filterAssigned]);

  const now = new Date();

  // compute display status — overdue is derived, not stored
  const getDisplayStatus = (kpi) => {
    if (kpi.targetDate && new Date(kpi.targetDate) < now && kpi.status !== 'Completed') {
      return 'Overdue';
    }
    return kpi.status;
  };

  // deadline filter is client-side (overdue/due today are computed from targetDate)
  const filteredKpis = kpis.filter((kpi) => {
    if (filterDeadline === 'All') return true;
    const due = kpi.targetDate ? new Date(kpi.targetDate) : null;
    if (filterDeadline === 'Overdue') return due && due < now && kpi.status !== 'Completed';
    if (filterDeadline === 'Due today') return due && due.toDateString() === now.toDateString();
    return true;
  });

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Overdue':      return '#E85D3F';
      case 'Due today':    return '#FFC107';
      case 'Draft':        return '#6C757D';
      case 'Not Started':  return '#6C757D';
      case 'In Progress':  return '#0d6efd';
      case 'Under Review': return '#c99552';
      case 'Completed':    return '#28a745';
      default:             return '#6C757D';
    }
  };

  const handleEditKPI = (kpiId) => {
    navigate(`/manager/all-kpis/edit/${kpiId}`);
  };

  // derive counts from the fetched array for the status pills
  const counts = {
    all: kpis.length,
    overdue: kpis.filter((k) => k.targetDate && new Date(k.targetDate) < now && k.status !== 'Completed').length,
    dueToday: kpis.filter((k) => k.targetDate && new Date(k.targetDate).toDateString() === now.toDateString()).length,
    draft: kpis.filter((k) => k.status === 'Draft').length,
  };

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
          <h3 className="serif-font mb-0">All KPIs</h3>
          <Button className="btn-orange" onClick={() => navigate('/manager/all-kpis/new')}>+ New KPI</Button>
        </div>

        <p className="text-muted mb-4">KPI directory – All KPIs across departments – create, edit, and manage records</p>

        {/* Filter Controls */}
        <Row className="mb-4 g-3">
          <Col md={3}>
            <Form.Select
              size="sm"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="filter-select"
            >
              <option value="">Category (All)</option>
              <option value="Community">Community</option>
              <option value="Content">Content</option>
              <option value="Internal">Internal</option>
              <option value="Partnerships">Partnerships</option>
              <option value="Project Mgmt">Project Mgmt</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Select
              size="sm"
              value={filterDeadline}
              onChange={(e) => setFilterDeadline(e.target.value)}
              className="filter-select"
            >
              <option value="All">Deadline (All)</option>
              <option value="Due today">Due today</option>
              <option value="Overdue">Overdue</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Select
              size="sm"
              value={filterAssigned}
              onChange={(e) => setFilterAssigned(e.target.value)}
              className="filter-select"
            >
              <option value="">Assigned to (All)</option>
              <option value="unassigned">Unassigned</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <div className="d-flex gap-2 flex-wrap">
              <span className="badge-pill badge-status">All {counts.all}</span>
              <span className="badge-pill badge-status">Overdue {counts.overdue}</span>
              <span className="badge-pill badge-status">Due today {counts.dueToday}</span>
              <span className="badge-pill badge-status">Draft {counts.draft}</span>
            </div>
          </Col>
        </Row>

        {isLoading && (
          <div className="text-center py-5">
            <Spinner animation="border" size="sm" className="me-2" />
            Loading KPIs...
          </div>
        )}

        {error && <Alert variant="danger">{error}</Alert>}

        {!isLoading && !error && (
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
                {filteredKpis.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-muted py-4">No KPIs found.</td>
                  </tr>
                ) : filteredKpis.map((kpi) => {
                  const displayStatus = getDisplayStatus(kpi);
                  const formattedDate = kpi.targetDate
                    ? new Date(kpi.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : '—';
                  return (
                    <tr key={kpi._id}>
                      <td><Form.Check type="checkbox" /></td>
                      <td className="fw-normal">{kpi.title}</td>
                      <td>
                        <span className="badge badge-category">
                          ● {kpi.category}
                        </span>
                      </td>
                      <td className="text-muted small">{formattedDate}</td>
                      <td>
                        <span className="badge badge-assigned">
                          {(kpi.assignees && kpi.assignees.length > 0)
                            ? kpi.assignees.length === 1
                              ? kpi.assignees[0]
                              : `${kpi.assignees[0]} +${kpi.assignees.length - 1}`
                            : 'Unassigned'}
                        </span>
                      </td>
                      <td>
                        <div className="progress-container">
                          <div className="progress-bar-wrapper">
                            <div
                              className="progress-fill"
                              style={{ width: `${kpi.achievementScore || 0}%`, backgroundColor: '#0B2019' }}
                            ></div>
                          </div>
                          <span className="progress-text fw-bold">{kpi.achievementScore || 0}%</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className="badge badge-status-pill"
                          style={{ backgroundColor: `${getStatusBadgeColor(displayStatus)}20`, color: getStatusBadgeColor(displayStatus) }}
                        >
                          {displayStatus}
                        </span>
                      </td>
                      <td>
                        <Button
                          variant="dark"
                          size="sm"
                          className="edit-button"
                          onClick={() => handleEditKPI(kpi._id)}
                        >
                          Edit →
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
};

export default AllKPIs;
