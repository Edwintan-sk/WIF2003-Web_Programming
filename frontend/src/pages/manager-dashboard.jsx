import { Container, Row, Col, Card } from 'react-bootstrap';
import Sidebar from '../component/Sidebar';
import StatCard from '../component/StatCard';
import '../styles/theme.css';

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

        {/* Stat Cards Container - 5 cards with 20px gap */}
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          marginBottom: '40px',
          flexWrap: 'wrap'
        }}>
          <StatCard title="OVERALL PROGRESS" value="68" percentage color="#0B2019" subValue="+12%" />
          <StatCard title="KPIS ASSIGNED" value="12" color="#E85D3F" subValue="+5" />
          <StatCard title="COMPLETED" value="8" color="#28a745" subValue="+3" />
          <StatCard title="PENDING REVIEW" value="5" color="#ffc107" subValue="3 new" />
          <StatCard title="OVERDUE" value="2" color="#dc3545" subValue="+2" />
        </div>

        {/* Team Progress Overview Section */}
        <Row style={{ gap: '20px', display: 'flex' }}>
          <Col lg={8} style={{ minWidth: '648px', flex: '0 0 648px' }}>
            <Card className="custom-card">
              <Card.Body style={{ padding: '24px' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="serif-font mb-0">Team Progress Overview</h5>
                  <a href="#" style={{ fontSize: '12px', color: 'var(--accent-orange)', textDecoration: 'none' }}>View all staff →</a>
                </div>
                <div className="team-progress-list">
                  {/* Placeholder for team members */}
                  <p className="text-muted text-center py-4">Team progress data will be displayed here</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4} style={{ minWidth: '360px', flex: '0 0 360px' }}>
            <Card className="custom-card" style={{ 
              height: '372px',
              borderRadius: '18px',
              padding: '24px'
            }}>
              <Card.Body style={{ padding: '0' }}>
                <h5 className="serif-font mb-4">Recent activity</h5>
                <div className="activity-list" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
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

export default ManagerDashboard;