import { useState } from 'react';
import { Container, Row, Col, Table, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../component/Sidebar';
import '../styles/theme.css';

const AllKPIs = () => {
  const navigate = useNavigate();
  const [kpiData] = useState([
    { id: 1, title: "Host 4 community outreach events", category: "Target", deadline: "2h ago Nov 19", assigned: "RK", progress: 80, status: "Overdue" },
    { id: 2, title: "Launch website design project", category: "Project", deadline: "2h ago Nov 19", assigned: "DP", progress: 80, status: "Overdue" },
    { id: 3, title: "Secure 3 new media partnerships", category: "Target", deadline: "Today, 9:12am Nov 19", assigned: "DF, RK", progress: 80, status: "Due today" },
    { id: 4, title: "Host 4 community outreach events", category: "Target", deadline: "Today, 9:12am Nov 19", assigned: "RK", progress: 80, status: "Within SLA" },
    { id: 5, title: "Host 4 community outreach events", category: "Target", deadline: "Today, 9:12am Nov 19", assigned: "RK", progress: 80, status: "Within SLA" },
    { id: 6, title: "Host 4 community outreach events", category: "Target", deadline: "Today, 9:12am Nov 19", assigned: "RK", progress: 80, status: "Within SLA" },
    { id: 7, title: "Host 4 community outreach events", category: "Target", deadline: "Today, 9:12am Nov 19", assigned: "RK", progress: 80, status: "Within SLA" },
    { id: 8, title: "Host 4 community outreach events", category: "Target", deadline: "Today, 9:12am Nov 19", assigned: "RK", progress: 80, status: "Within SLA" },
  ]);

  const [filterCategory, setFilterCategory] = useState("All");
  const [filterDeadline, setFilterDeadline] = useState("All");
  const [filterAssigned, setFilterAssigned] = useState("All");

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Overdue":
        return "#E85D3F"; // orange/red
      case "Due today":
        return "#FFC107"; // yellow
      case "Within SLA":
        return "#28a745"; // green
      default:
        return "#6C757D"; // gray
    }
  };

  const handleEditKPI = (kpiId) => {
    navigate(`/manager/all-kpis/edit/${kpiId}`);
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
          <Button className="btn-orange">+ New KPI</Button>
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
              <option>Category</option>
              <option>All</option>
              <option>Target</option>
              <option>Project</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Select 
              size="sm"
              value={filterDeadline}
              onChange={(e) => setFilterDeadline(e.target.value)}
              className="filter-select"
            >
              <option>Deadline</option>
              <option>All</option>
              <option>Due today</option>
              <option>Overdue</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Select 
              size="sm"
              value={filterAssigned}
              onChange={(e) => setFilterAssigned(e.target.value)}
              className="filter-select"
            >
              <option>Assigned to</option>
              <option>All</option>
              <option>RK</option>
              <option>DP</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <div className="d-flex gap-2">
              <span className="badge-pill badge-status">All 34</span>
              <span className="badge-pill badge-status">Within SLA 16</span>
              <span className="badge-pill badge-status">Due today 4</span>
              <span className="badge-pill badge-status">Overdue 3</span>
              <span className="badge-pill badge-status">Draft 1</span>
            </div>
          </Col>
        </Row>

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
              {kpiData.map((kpi) => (
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
                      {kpi.assigned.split(", ").map((person, idx) => (
                        <span key={idx} className="badge badge-assigned">{person}</span>
                      ))}
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
            </tbody>
          </Table>
        </div>
      </main>
    </div>
  );
};

export default AllKPIs;
