import { Row, Col, Card } from 'react-bootstrap';
import Sidebar from '../component/Sidebar';
import StatCard from '../component/StatCard';
import '../styles/theme.css';

const StaffDashboard = () => {
  return (
    <div className="d-flex">
      <Sidebar role="staff" />
      <main style={{ 
        marginLeft: 'var(--sidebar-width)', 
        flex: 1, 
        padding: '40px 60px',
        backgroundColor: 'var(--main-bg)',
        minHeight: '100vh'
      }}>
        <p className="sidebar-header small mb-1">Dashboard</p>
        <h3 className="serif-font mb-5">Overview</h3>

        <h1 className="serif-font mb-2">Good afternoon, Aisha.</h1>
        <p className="text-muted mb-5">You have 3 KPIs with submissions due this week. Let's keep it moving</p>

        {/* The Grid: 4 columns for staff cards */}
        <Row className="g-3 mb-5">
          <Col md={6} lg={3}>
            <StatCard title="OVERALL PROGRESS" value="68" percentage color="#0B2019" subValue="+12%" />
          </Col>
          <Col md={6} lg={3}>
            <StatCard title="EPIS ASSIGNED" value="12" color="#E85D3F" subValue="+5" />
          </Col>
          <Col md={6} lg={3}>
            <StatCard title="COMPLETED" value="8" color="#28a745" subValue="+3" />
          </Col>
          <Col md={6} lg={3}>
            <StatCard title="PENDING REVIEW" value="2" color="#ffc107" subValue="1 new" />
          </Col>
        </Row>

        {/* Active KPIs and Recent Activity Sections */}
        <Row className="g-4">
          <Col lg={8}>
            <Card className="custom-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="serif-font mb-0">Active KPIs</h5>
                  <a href="#" style={{ fontSize: '12px', color: 'var(--accent-orange)', textDecoration: 'none' }}>View all →</a>
                </div>
                <div className="kpis-list">
                  <p className="text-muted text-center py-4">Your assigned KPIs will be displayed here</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4}>
            <Card className="custom-card">
              <Card.Body>
                <h5 className="serif-font mb-4">Recent activity</h5>
                <div className="activity-list">
                  <p className="text-muted text-center py-4">Recent activity will be displayed here</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </main>
    </div>
  );
};

export default StaffDashboard;