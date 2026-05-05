import React from 'react';
import { Row, Col, Card, InputGroup, Form } from 'react-bootstrap';
import { Search, GridFill, ArrowRight } from 'react-bootstrap-icons';
import '../styles/theme.css';

// TODO: Replace Mock Data with database data later
const statsData = [
  { id: 1, label: 'OVERALL PROGRESS', value: '68%', hasProgress: true, progressValue: 68, badgeText: '+12%', 
    badgeColor: '#1b6a38', badgeBg: '#e6f4ea', dotColor: '#1b6a38'},
  { id: 2, label: 'KPIS ASSIGNED', value: '12', badgeText: '2 new', 
    badgeColor: '#c73a24', badgeBg: '#fce8e6', dotColor: '#c73a24'},
  { id: 3, label: 'COMPLETED', value: '8', badgeText: '+3', badgeColor: '#1b6a38', badgeBg: '#e6f4ea', 
    dotColor: '#1b6a38'},
  { id: 4, label: 'PENDING REVIEW', value: '2', badgeText: '1 overdue', badgeColor: '#a87022', badgeBg: '#fef2e4', 
    dotColor: '#d69f4c'}
];

const kpiData = [
  { id: 1, category: 'Community', catBg: '#e6f4ea', catText: '#1b6a38', title: 'Host 4 community outreach events', 
    dueDate: 'Nov 30', progress: 75, progColor: '#1b6a38' },
  { id: 2, category: 'Content', catBg: '#fce8e6', catText: '#c73a24', title: 'Publish 12 editorial articles', 
    dueDate: 'Dec 15', progress: 58, progColor: '#c73a24' },
  { id: 3, category: 'Internal', catBg: '#fef2e4', catText: '#a87022', title: 'Complete communications audit', 
    dueDate: 'Nov 22', progress: 40, progColor: '#d69f4c', color:'#B8862D' },
  { id: 4, category: 'Partnerships', catBg: '#e6f4ea', catText: '#1b6a38', title: 'Secure 3 new media partnerships', 
    dueDate: 'Jan 10', progress: 92, progColor: '#1b6a38' },
];

const activityData = [
  { id: 1, dotColor: '#1b6a38', title: 'Evidence approved', desc: 'Outreach event #3 by Rachel K.', time: '2 hours ago' },
  { id: 2, dotColor: '#c73a24', title: 'New comment', desc: "On 'Editorial articles' KPI", time: 'Yesterday' },
  { id: 3, dotColor: '#d69f4c', title: 'Deadline reminder', desc: 'Audit due in 5 days', time: '2 days ago' },
  { id: 4, dotColor: '#1b6a38', title: 'New KPI assigned', desc: 'Partnership outreach (Q1)', time: '3 days ago' },
  { id: 5, dotColor: '#c73a24', title: 'Revision requested', desc: "On 'Community outreach'", time: '4 days ago' },
];

const StaffDashboard = () => { 
  return (
      <main>
        <header className="d-flex justify-content-between align-items-start mb-5">
          <div>
            <p className="text-secondary fw-bold text-uppercase text-micro mb-1">Dashboard</p>
            <h1 className="fw-bold m-0 fs-4">Overview</h1>
          </div>
          <div className="d-flex align-items-center gap-3">
            <InputGroup className="bg-white rounded-3 shadow-sm align-items-center px-2 search-wrapper">
              <Search size={16} className="text-secondary ms-2" />
              <Form.Control type="text" placeholder="Search KPIs, evidence..." className="bg-transparent border-0 shadow-none py-2 text-sm"/>
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
            <h2 className="serif-font mb-2 heading-greeting">Good afternoon, Aisha.</h2>
            <p className="text-secondary mb-0 text-sm">You have 3 KPIs with submissions due this week. Let's keep it moving.</p>
          </div>
          <button className="btn btn-primary-dark rounded-3 px-4 py-2 d-flex align-items-center gap-2 shadow-sm text-sm">
            Submit progress <ArrowRight size={16} />
          </button>
        </div>

        {/* Top Stats Grid */}
        <Row className="g-4 mb-4 pb-2">
          {statsData.map((stat) => (
            <Col xs={12} md={6} lg={3} key={stat.id}>
              <Card className="custom-card h-100 p-4 d-flex flex-column justify-content-between" style={{ minHeight: '160px' }}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <div className="rounded-circle stat-dot" style={{backgroundColor: stat.dotColor }}></div>
                  <h6 className="mb-0 text-secondary fw-bold text-uppercase text-xs">{stat.label}</h6>
                </div>
                <div className="mt-2">
                  <span className="serif-font" style={{ fontSize: '3rem', lineHeight: 1, color: 'var(--text-main)' }}>{stat.value}</span>
                </div>
                <div className="mt-auto pt-3">
                  {stat.hasProgress ? (
                    <div className="d-flex align-items-center gap-3">
                      <span className="fw-bold rounded px-2 py-1 text-xs" style={{backgroundColor: stat.badgeBg, color: stat.badgeColor }}>{stat.badgeText}</span>
                      <div className="progress progress-track-sm flex-grow-1">
                        <div className="progress-bar rounded-pill" style={{ width: `${stat.progressValue}%`, backgroundColor: 'var(--sidebar-bg)' }}></div>
                      </div>
                    </div>
                  ) : (
                    <span className="fw-bold rounded px-2 py-1 d-inline-block text-xs" style={{backgroundColor: stat.badgeBg, color: stat.badgeColor }}>{stat.badgeText}</span>
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
            <Card className="custom-card h-100 p-4 p-xl-5">
              <div className="d-flex justify-content-between align-items-center mb-4 pb-2">
                <div className="d-flex align-items-center gap-3">
                  <h2 className="fs-4 fw-bold serif-font mb-0">Active KPIs</h2>
                  <span className="d-flex align-items-center justify-content-center bg-light text-secondary fw-bold rounded-circle badge-circle-24">4</span>
                </div>
                <a href="#" className="text-secondary text-decoration-none text-sm fw-medium d-flex align-items-center gap-1">
                  View all <ArrowRight size={14} />
                </a>
              </div>
              
              <div className="d-flex flex-column gap-4">
                {kpiData.map((kpi, index) => (
                  <div key={kpi.id}>
                    <div className="d-flex align-items-center justify-content-between mb-2 pb-1">
                      <div className="d-flex align-items-center gap-3 flex-grow-1">
                        <span className="fw-bold rounded px-2 py-1 text-mini" style={{backgroundColor: kpi.catBg, color: kpi.catText }}>{kpi.category}</span>
                        <span className="fw-bold text-sm">{kpi.title}</span>
                      </div>
                      <span className="text-secondary fw-medium text-mini">Due {kpi.dueDate}</span>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                      <div className="progress progress-track-md flex-grow-1">
                        <div className="progress-bar rounded-pill" style={{ width: `${kpi.progress}%`, backgroundColor: kpi.progColor, transition: 'width 0.5s ease' }}></div>
                      </div>
                      <span className="fw-bold text-end text-sm" style={{ width: '36px' }}>{kpi.progress}%</span>
                    </div>
                    {index < kpiData.length - 1 && <hr className="text-light opacity-100 mt-4 mb-0" />}
                  </div>
                ))}
              </div>
            </Card>
          </Col>

          {/* Recent Activity Timeline */}
          <Col xs={12} lg={4}>
            <Card className="custom-card h-100 p-4 p-xl-5">
              <h2 className="fs-4 fw-bold serif-font mb-1">Recent activity</h2>
              <p className="text-secondary fw-medium mb-4 pb-2 text-mini">Last 7 days</p>
              
              <div className="timeline-track">
                {activityData.map((activity) => (
                  <div key={activity.id} className="position-relative ps-4 mb-4 pb-1">
                    {/* Timeline Dot */}
                    <div className="position-absolute rounded-circle border border-2 border-white timeline-dot" style={{ backgroundColor: activity.dotColor }}>
                    </div>
                    <div>
                      <h4 className="fw-bold mb-1 text-sm">{activity.title}</h4>
                      <p className="text-secondary mb-1 lh-sm text-mini">{activity.desc}</p>
                      <span className="text-secondary fw-medium text-xs">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>
    </main>
  );
};

export default StaffDashboard;