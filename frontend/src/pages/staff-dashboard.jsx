import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, InputGroup, Form, Spinner, Alert } from 'react-bootstrap';
import { Search, ArrowRight } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../component/Sidebar';
import api from '../utils/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import '../styles/theme.css';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState([]);
  const [activeKpis, setActiveKpis] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await api.get('/api/kpi/dashboard');
        const data = response.data;
        
        setStats(data.stats || []);
        setActiveKpis(data.activeKpis || []);
        setRecentActivity(data.recentActivity || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'An error occurred while loading dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="d-flex">
      <Sidebar role="staff" />
      
      <main className="main-layout-pad bg-main min-vh-100" style={{
        marginLeft: 'var(--sidebar-width)', 
        flex: 1
      }}>
        <header className="d-flex justify-content-between align-items-start mb-5">
          <div>
            <p className="text-secondary fw-bold text-uppercase staff-text-micro mb-1">Dashboard</p>
            <h1 className="fw-bold m-0 fs-4">Overview</h1>
          </div>
          <div className="d-flex align-items-center gap-3">
            <InputGroup className="bg-white rounded-3 shadow-sm align-items-center px-2 search-wrapper">
              <Search size={16} className="text-secondary ms-2" />
              <Form.Control type="text" placeholder="Search KPIs, evidence..." className="bg-transparent border-0 shadow-none py-2 staff-text-sm"/>
            </InputGroup>
            <button className="btn bg-white btn-square-42 shadow-sm rounded-3 p-2 d-flex align-items-center justify-content-center border-0">
              <div className="menu-square"></div>
            </button>
          </div>
        </header>
        
        <div className="header-divider"></div>

        {/* Welcome Section */}
        <div className="d-flex justify-content-between align-items-end mb-4 pb-2">
          <div>
            <h2 className="serif-font mb-2 staff-heading-greeting">Good afternoon, {user?.name || 'Staff'}.</h2>
            <p className="text-secondary mb-0 staff-text-sm">Here is a snapshot of your current KPI targets and submissions.</p>
          </div>
          <button 
            onClick={() => navigate('/staff/submit')}
            className="btn staff-btn-primary-dark rounded-3 px-4 py-2 d-flex align-items-center gap-2 shadow-sm staff-text-sm"
          >
            Submit progress <ArrowRight size={16} />
          </button>
        </div>

        {error && (
          <Alert variant="danger" className="mb-4 shadow-sm rounded-3">
            <Alert.Heading className="fs-6 fw-bold">Failed to load overview</Alert.Heading>
            <p className="mb-0 staff-text-sm">{error}</p>
          </Alert>
        )}

        {isLoading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <Spinner animation="border" variant="dark" className="me-2" />
            <span className="serif-font fw-medium">Loading overview...</span>
          </div>
        ) : (
          <>
            {/* Top Stats Grid */}
            <Row className="g-4 mb-4 pb-2">
              {stats.map((stat) => (
                <Col xs={12} md={6} lg={3} key={stat.id}>
                  <Card className="staff-custom-card h-100 p-4 d-flex flex-column justify-content-between" style={{ minHeight: '160px' }}>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <div className="rounded-circle staff-stat-dot" style={{ backgroundColor: stat.dotColor }}></div>
                      <h6 className="mb-0 text-secondary fw-bold text-uppercase staff-text-xs">{stat.label}</h6>
                    </div>
                    <div className="mt-2">
                      <span className="serif-font" style={{ fontSize: '3rem', lineHeight: 1, color: 'var(--text-main)' }}>{stat.value}</span>
                    </div>
                    <div className="mt-auto pt-3">
                      {stat.hasProgress ? (
                        <div className="d-flex align-items-center gap-3">
                          <span className="fw-bold rounded px-2 py-1 staff-text-xs" style={{ backgroundColor: stat.badgeBg, color: stat.badgeColor }}>{stat.badgeText}</span>
                          <div className="progress progress-track-sm flex-grow-1">
                            <div className="progress-bar rounded-pill" style={{ width: `${stat.progressValue}%`, backgroundColor: 'var(--sidebar-bg)' }}></div>
                          </div>
                        </div>
                      ) : (
                        <span className="fw-bold rounded px-2 py-1 d-inline-block staff-text-xs" style={{ backgroundColor: stat.badgeBg, color: stat.badgeColor }}>{stat.badgeText}</span>
                      )}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Bottom Section: KPIs and Activity */}
            <Row className="g-4 flex-grow-1">
              {/* Active KPIs */}
              <Col xs={12} lg={8}>
                <Card className="staff-custom-card h-100 p-4 p-xl-5">
                  <div className="d-flex justify-content-between align-items-center mb-4 pb-2">
                    <div className="d-flex align-items-center gap-3">
                      <h2 className="fs-4 fw-bold serif-font mb-0">Active KPIs</h2>
                      <span className="d-flex align-items-center justify-content-center bg-light text-secondary fw-bold rounded-circle staff-badge-circle-24">
                        {activeKpis.length}
                      </span>
                    </div>
                    <a href="/staff/kpis" className="text-secondary text-decoration-none staff-text-sm fw-medium d-flex align-items-center gap-1">
                      View all <ArrowRight size={14} />
                    </a>
                  </div>
                  
                  <div className="d-flex flex-column gap-4">
                    {activeKpis.length > 0 ? (
                      activeKpis.map((kpi, index) => (
                        <div key={kpi.id || index}>
                          <div className="d-flex align-items-center justify-content-between mb-2 pb-1">
                            <div className="d-flex align-items-center gap-3 flex-grow-1">
                              <span className="fw-bold rounded px-2 py-1 staff-text-mini" style={{ backgroundColor: kpi.catBg, color: kpi.catText }}>{kpi.category}</span>
                              <span className="fw-bold staff-text-sm">{kpi.title}</span>
                            </div>
                            <span className="text-secondary fw-medium staff-text-mini">Due {kpi.dueDateFormatted || kpi.dueDate}</span>
                          </div>
                          <div className="d-flex align-items-center gap-3">
                            <div className="progress staff-progress-track-md flex-grow-1">
                              <div className="progress-bar rounded-pill" style={{ width: `${kpi.progress}%`, backgroundColor: kpi.progColor, transition: 'width 0.5s ease' }}></div>
                            </div>
                            <span className="fw-bold text-end staff-text-sm" style={{ width: '36px' }}>{kpi.progress}%</span>
                          </div>
                          {index < activeKpis.length - 1 && <hr className="text-light opacity-100 mt-4 mb-0" />}
                        </div>
                      ))
                    ) : (
                      <p className="text-secondary text-center py-4 staff-text-sm mb-0">No active KPIs assigned to you.</p>
                    )}
                  </div>
                </Card>
              </Col>

              {/* Recent Activity Timeline */}
              <Col xs={12} lg={4}>
                <Card className="staff-custom-card h-100 p-4 p-xl-5">
                  <h2 className="fs-4 fw-bold serif-font mb-1">Recent activity</h2>
                  <p className="text-secondary fw-medium mb-4 pb-2 staff-text-mini">Last 7 days</p>
                  
                  <div className="staff-timeline-track">
                    {recentActivity.length > 0 ? (
                      recentActivity.map((activity) => (
                        <div key={activity.id} className="position-relative ps-4 mb-4 pb-1">
                          {/* Timeline Dot */}
                          <div className="position-absolute rounded-circle border border-2 border-white staff-timeline-dot" style={{ backgroundColor: activity.dotColor }}></div>
                          <div>
                            <h4 className="fw-bold mb-1 staff-text-sm">{activity.title}</h4>
                            <p className="text-secondary mb-1 lh-sm staff-text-mini">{activity.desc}</p>
                            <span className="text-secondary fw-medium staff-text-xs">{activity.time}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-secondary text-center py-4 staff-text-sm mb-0">No recent activity found.</p>
                    )}
                  </div>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </main>
    </div>
  );
};

export default StaffDashboard;