import { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import Sidebar from '../component/Sidebar';
import StatCard from '../component/StatCard';
import StaffAssigneeRow from '../component/StaffAssigneeRow';
import ProgressRing from '../component/ProgressRing';
import api from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';
import '../styles/theme.css';

// Short contextual caption shown on each stat card badge.
const SUB_LABELS = {
  'OVERALL PROGRESS': 'team avg',
  'KPIS ASSIGNED': 'total',
  COMPLETED: 'done',
  'PENDING REVIEW': 'to review',
  OVERDUE: 'late',
};

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get('/api/manager/dashboard');
        setData(response.data);
      } catch (err) {
        console.error('Error fetching manager dashboard:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const stats = data?.stats || [];
  const teamProgress = data?.teamProgress || [];
  const recentActivity = data?.recentActivity || [];
  const statusDistribution = data?.statusDistribution || [];
  const overallProgress = data?.overallProgress || 0;

  const statusTotal = statusDistribution.reduce((sum, s) => sum + s.value, 0);

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

        <h1 className="serif-font mb-2">
          Good afternoon, {user?.englishName || user?.firstName || 'Manager'}.
        </h1>
        <p className="text-muted mb-5">Here is how your team is tracking across all KPIs.</p>

        {isLoading ? (
          <div className="text-center py-5">
            <Spinner animation="border" className="me-2" />
            <span className="text-secondary">Loading team dashboard…</span>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          <>
            {/* Stat Cards */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
              {stats.map((stat) => (
                <StatCard
                  key={stat.label}
                  title={stat.label}
                  value={stat.value}
                  percentage={Boolean(stat.percentage)}
                  color={stat.color}
                  subValue={SUB_LABELS[stat.label] || ''}
                />
              ))}
            </div>

            {/* Team progress + performance snapshot */}
            <Row className="g-4 mb-4">
              <Col lg={8}>
                <Card className="custom-card h-100">
                  <Card.Body style={{ padding: '24px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="serif-font mb-0">Team Progress Overview</h5>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {teamProgress.length} staff
                      </span>
                    </div>
                    {teamProgress.length === 0 ? (
                      <p className="text-muted text-center py-4">No assigned KPIs yet.</p>
                    ) : (
                      <div className="team-progress-list">
                        {teamProgress.map((staff) => (
                          <StaffAssigneeRow
                            key={staff.email}
                            staff={{ initials: staff.initials, name: `${staff.name} · ${staff.kpiCount} KPI${staff.kpiCount !== 1 ? 's' : ''}`, progress: staff.progress }}
                          />
                        ))}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={4}>
                <Card className="custom-card h-100">
                  <Card.Body style={{ padding: '24px' }}>
                    <h5 className="serif-font mb-3">Performance</h5>

                    {/* SVG progress ring — overall achievement score */}
                    <div className="d-flex justify-content-center mb-4">
                      <ProgressRing value={overallProgress} size={150} stroke={14} label="Overall progress" />
                    </div>

                    {/* CSS stacked bar — KPI status distribution */}
                    <span className="text-secondary fw-bold text-uppercase d-block mb-2" style={{ fontSize: '10px', letterSpacing: '1.5px' }}>
                      KPI status
                    </span>
                    <div className="d-flex w-100 mb-3" style={{ height: '12px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#EFE9DC' }}>
                      {statusTotal > 0 && statusDistribution.map((s) => (
                        <div
                          key={s.label}
                          title={`${s.label}: ${s.value}`}
                          style={{ width: `${(s.value / statusTotal) * 100}%`, backgroundColor: s.color, transition: 'width 0.5s ease' }}
                        />
                      ))}
                    </div>

                    {/* Legend */}
                    <div className="d-flex flex-column gap-2">
                      {statusDistribution.map((s) => (
                        <div key={s.label} className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center gap-2">
                            <span className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: s.color, display: 'inline-block' }} />
                            <span style={{ fontSize: '12px', color: 'var(--text-main)' }}>{s.label}</span>
                          </div>
                          <span className="fw-bold" style={{ fontSize: '12px' }}>{s.value}</span>
                        </div>
                      ))}
                      {statusDistribution.length === 0 && (
                        <span className="text-muted" style={{ fontSize: '12px' }}>No KPIs yet.</span>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Recent activity */}
            <Row className="g-4">
              <Col lg={12}>
                <Card className="custom-card">
                  <Card.Body style={{ padding: '24px' }}>
                    <h5 className="serif-font mb-4">Recent activity</h5>
                    {recentActivity.length === 0 ? (
                      <p className="text-muted text-center py-4">No recent activity.</p>
                    ) : (
                      <div className="d-flex flex-column gap-3">
                        {recentActivity.map((act) => (
                          <div key={act.id} className="d-flex align-items-start gap-3">
                            <div className="rounded-circle mt-1" style={{ width: '10px', height: '10px', backgroundColor: act.dotColor, flexShrink: 0 }} />
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between">
                                <span className="fw-bold" style={{ fontSize: '13px' }}>{act.title}</span>
                                <span className="text-muted" style={{ fontSize: '11px' }}>{act.time}</span>
                              </div>
                              <p className="mb-0 text-muted" style={{ fontSize: '12px' }}>{act.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </main>
    </div>
  );
};

export default ManagerDashboard;
