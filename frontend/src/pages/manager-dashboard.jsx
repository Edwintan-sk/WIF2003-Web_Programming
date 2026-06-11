import { Container, Row, Col, Card } from 'react-bootstrap';
import Sidebar from '../component/Sidebar';
import StatCard from '../component/StatCard';
import '../styles/theme.css';
import { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axiosInstance.get('/api/kpi/manager/dashboard');
        setDashboardData(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboard();
  }, []);
  
  if (loading) {
    return (
      <div className="d-flex">
        <Sidebar role="manager" />
        <main style={{ marginLeft: 'var(--sidebar-width)', flex: 1, padding: '40px 60px' }}>
          <p>Loading dashboard...</p>
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
        <h3 className="serif-font mb-5">Team dashboard</h3>

        <h1 className="serif-font mb-2">Good afternoon, Manager.</h1>
        <p className="text-muted mb-5">Review summary metrics and recent activity feeds below.</p>

        {/* Stat Cards Container - 5 cards with 20px gap */}
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          marginBottom: '40px',
          flexWrap: 'wrap'
        }}>
          <StatCard 
            title="OVERALL PROGRESS" 
            value={dashboardData?.overallProgress?.value || 0} 
            percentage 
            color="#0B2019" 
            subValue={dashboardData?.overallProgress?.change || "0%"} 
          />
          <StatCard 
            title="KPIS ASSIGNED" 
            value={dashboardData?.kpisAssigned?.value || 0} 
            color="#E85D3F" 
            subValue={dashboardData?.kpisAssigned?.change || "0"} 
          />
          <StatCard 
            title="COMPLETED" 
            value={dashboardData?.completed?.value || 0} 
            color="#28a745" 
            subValue={dashboardData?.completed?.change || "0"} 
          />
          <StatCard 
            title="PENDING REVIEW" 
            value={dashboardData?.pendingReview?.value || 0} 
            color="#ffc107" 
            subValue={dashboardData?.pendingReview?.change || "0 new"} 
          />
          <StatCard 
            title="OVERDUE" 
            value={dashboardData?.overdue?.value || 0} 
            color="#dc3545" 
            subValue={dashboardData?.overdue?.change || "0"} 
          />
        </div>

        {/* Team Progress Overview Section */}
        <Row style={{ gap: '20px', display: 'flex' }}>
          <Col lg={7} style={{ minWidth: '648px', flex: '1 0 648px' }}>
            <Card className="custom-card">
              <Card.Body style={{ padding: '24px' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="serif-font mb-0">Team Progress Overview</h5>
                  <span 
                    style={{ fontSize: '12px', color: 'var(--accent-orange)', textDecoration: 'none', cursor: 'pointer' }}
                    onClick={() => navigate('/manager/assign')}
                  >
                    View all staff &rarr;
                  </span>
                </div>
                <div className="team-progress-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {dashboardData?.teamProgress && dashboardData.teamProgress.length > 0 ? (
                    dashboardData.teamProgress.map((member, idx) => (
                      <div key={idx} className="d-flex align-items-center justify-content-between pb-3" style={{ borderBottom: '1px solid #FAF5E8' }}>
                        <div className="d-flex align-items-center gap-3">
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: '#E8F0ED',
                            color: '#0B5E3A',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '12px'
                          }}>
                            {member.initials}
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>{member.name}</div>
                            <div style={{ fontSize: '11px', color: '#6C757D' }}>{member.role} &middot; {member.kpiCount} KPIs</div>
                          </div>
                        </div>
                        <div style={{ width: '200px' }} className="d-flex align-items-center gap-3">
                          <div className="progress-bar-wrapper flex-grow-1" style={{ height: '8px', backgroundColor: '#e8e4d9', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${member.progress}%`, height: '100%', backgroundColor: '#0B2019' }}></div>
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: 'bold', minWidth: '35px', textAlign: 'right' }}>{member.progress}%</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted text-center py-4">No team member progress data available.</p>
                  )}
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
              <Card.Body style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <h5 className="serif-font mb-4">Recent activity</h5>
                <div className="activity-list" style={{ display: 'flex', flexDirection: 'column', gap: '18px', overflowY: 'auto', flex: 1 }}>
                  {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 ? (
                    dashboardData.recentActivity.map((activity, idx) => (
                      <div key={idx} className="d-flex align-items-start gap-3">
                        <div 
                          className="rounded-circle mt-1" 
                          style={{ width: '8px', height: '8px', backgroundColor: activity.dotColor || '#1b6a38', flexShrink: 0 }}
                        />
                        <div style={{ fontSize: '12px' }}>
                          <div className="fw-bold" style={{ color: 'var(--text-main)' }}>{activity.title}</div>
                          <div style={{ color: '#6C757D', marginTop: '2px', lineHeight: '1.4' }}>{activity.desc}</div>
                          <div className="text-muted mt-1" style={{ fontSize: '10px' }}>{activity.time}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted text-center py-4">No recent activity logs found.</p>
                  )}
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