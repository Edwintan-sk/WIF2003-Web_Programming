import { Container, Row, Col } from 'react-bootstrap';
import Sidebar from '../component/Sidebar';
import StatCard from '../component/StatCard';

const ManagerDashboard = () => {
  return (
    <div className="d-flex">
      {/* Passing the manager role to your modular sidebar */}
      <Sidebar role="manager" />
      
      <main style={{ 
        marginLeft: 'var(--sidebar-width)', 
        flex: 1, 
        padding: '40px 60px',
        backgroundColor: 'var(--main-bg)',
        minHeight: '100vh'
      }}>
        <p className="sidebar-header small mb-1">Workspace</p>
        <h3 className="serif-font mb-5">Team dashboard</h3>

        <h1 className="serif-font mb-2">Good afternoon, Lee.</h1>
        <p className="text-muted mb-5">Filler text</p>

        {/* The Grid: 5 columns for your 5 cards */}
        <Row className="g-3">
          <Col>
            <StatCard title="OVERALL PROGRESS" value="68" percentage color="#0B2019" subValue="+12%" />
          </Col>
          <Col>
            <StatCard title="KPIS ASSIGNED" value="12" color="#E85D3F" subValue="+5" />
          </Col>
          <Col>
            <StatCard title="COMPLETED" value="8" color="#28a745" subValue="+3" />
          </Col>
          <Col>
            <StatCard title="PENDING REVIEW" value="5" color="#ffc107" subValue="3 new" />
          </Col>
          <Col>
            <StatCard title="OVERDUE" value="2" color="#dc3545" subValue="+2" />
          </Col>
        </Row>
      </main>
    </div>
  );
};

export default ManagerDashboard;