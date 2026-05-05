import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { ArrowRight } from 'react-bootstrap-icons';
import Sidebar from '../component/Sidebar';
import '../styles/theme.css';

// Stats Data
const statsData = [
  { id: 1, label: 'OVERALL PROGRESS', value: '68%', hasProgress: true, progressValue: 68, badgeText: '+12%', 
    badgeColor: '#2D7A4E', badgeBg: '#E4EDE7', dotColor: '#0D3B2E'},
  { id: 2, label: 'KPIS ASSIGNED', value: '12', badgeText: '+5', 
    badgeColor: '#C85A3A', badgeBg: '#FCE8E6', dotColor: '#C85A3A'},
  { id: 3, label: 'COMPLETED', value: '8', badgeText: '+3', 
    badgeColor: '#2D7A4E', badgeBg: '#E4EDE7', dotColor: '#0D3B2E'},
  { id: 4, label: 'PENDING REVIEW', value: '5', badgeText: '3 new', 
    badgeColor: '#D69F4C', badgeBg: '#FEF2E4', dotColor: '#D69F4C'},
  { id: 5, label: 'OVERDUE', value: '2', badgeText: '+2', 
    badgeColor: '#C85A3A', badgeBg: '#FCE8E6', dotColor: '#C85A3A'}
];

// Team Progress Data
const teamProgressData = [
  { id: 1, name: 'Ahmad Razif', progress: 75, status: 'Within SLA', dueDate: 'Due Nov 30', statusColor: '#0D3B2E', statusBg: '#E4EDE7' },
  { id: 2, name: 'Nurul Izzah', progress: 40, status: 'Overdue', dueDate: 'Due Sep 15', statusColor: '#C85A3A', statusBg: '#FCE8E6' },
  { id: 3, name: 'Muhammad Rahim', progress: 60, status: 'Due today', dueDate: 'Due Nov 22', statusColor: '#D69F4C', statusBg: '#FEF2E4' },
  { id: 4, name: 'Lee Xiao Meng', progress: 92, status: 'Within SLA', dueDate: 'Due Jan 10', statusColor: '#0D3B2E', statusBg: '#E4EDE7' },
  { id: 5, name: 'Lee Da Meng', progress: 92, status: 'Within SLA', dueDate: 'Due Jan 10', statusColor: '#0D3B2E', statusBg: '#E4EDE7' },
  { id: 6, name: 'Lee Zhong Meng', progress: 92, status: 'Within SLA', dueDate: 'Due Jan 10', statusColor: '#0D3B2E', statusBg: '#E4EDE7' },
];

// Activity Data
const activityData = [
  { id: 1, dotColor: '#0D3B2E', title: 'Evidence submitted', actor: 'Rachel', action: ' submitted evidence for ', target: '‘Host 4 community outreach events’', time: '2 hours ago' },
  { id: 2, dotColor: '#C85A3A', title: 'Comment posted', actor: 'Nurul Izzah', action: ' left a comment on ', target: '‘Editorial articles’', time: 'Yesterday' },
  { id: 3, dotColor: '#0D3B2E', title: 'New KPI assigned', actor: 'Assigned to Hariz Daniel', action: ' on ', target: 'Partnership outreach (Q1)', time: '3 days ago' },
];

// Upcoming Deadlines Data
const upcomingDeadlines = [
  { id: 1, title: 'Secure 3 new media partnerships', subtitle: 'Mei Lin', progress: 67, progColor: '#C85A3A', time: 'Due in 7 hours' },
  { id: 2, title: 'Complete communications audits', subtitle: 'Ahmad Razif', progress: 85, progColor: '#C85A3A', time: 'Due tomorrow' },
];

const ManagerDashboard = () => {
  return (
    <div className="d-flex" style={{ backgroundColor: '#F3EDDF', minHeight: '100vh', overflowX: 'hidden' }}>
      <Sidebar role="manager" />
      
      {/* Main Page Container - Fluid Width */}
      <main style={{ 
        marginLeft: 'var(--sidebar-width)', 
        flex: 1,
        backgroundColor: '#F3EDDF',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0 
      }}>
        
        {/* Top Bar */}
        <div style={{ 
          width: '100%', 
          height: '80px', 
          padding: '0 48px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between'
        }}>
          {/* Workspace & Team Dashboard */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 600, fontSize: '10px', letterSpacing: '0.28em', color: '#8E8F93', lineHeight: '100%', textTransform: 'uppercase' }}>
              WORKSPACE
            </span>
            <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: '20px', color: '#0F1317', lineHeight: '100%' }}>
              Team dashboard
            </span>
          </div>
          
          {/* + New KPI Button */}
          <button style={{ 
            height: '38px', 
            borderRadius: '10px', 
            backgroundColor: '#C85A3A', 
            border: 'none', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '10px 14px',
            cursor: 'pointer'
          }}>
            <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 600, fontSize: '13px', color: '#FFF6EC', lineHeight: '100%', whiteSpace: 'nowrap' }}>
              + New KPI
            </span>
          </button>
        </div>

        {/* Divider */}
        <div style={{ width: '100%', height: '1px', backgroundColor: '#EAE3D2' }}></div>

        {/* Body Container - Fluid Padding */}
        <div style={{ 
          width: '100%', 
          padding: '40px 48px 48px 48px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '32px' 
        }}>
          
          {/* Welcome Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
             <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: '44px', lineHeight: '100%', color: '#0F1317', margin: 0 }}>
               Good afternoon, Lee.
             </h2>
             <p style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 400, fontSize: '15px', lineHeight: '100%', color: '#5E6168', margin: 0 }}>
               Filler text
             </p>
          </div>

          {/* Top Stats Grid - Automatically fits columns based on screen width */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '20px', 
            width: '100%' 
          }}>
            {statsData.map((stat) => (
              <div key={stat.id} style={{ 
                height: '164px', 
                borderRadius: '18px', 
                padding: '20px 22px', 
                border: '1px solid #EAE3D2', 
                backgroundColor: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '4px', backgroundColor: stat.dotColor, flexShrink: 0 }}></div>
                  <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 600, fontSize: '10px', letterSpacing: '0.28em', color: '#5E6168', lineHeight: '100%', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {stat.label}
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', marginBottom: '12px' }}>
                  <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: '44px', lineHeight: '100%', color: '#0F1317' }}>
                    {stat.value.replace('%', '')}
                  </span>
                  {stat.value.includes('%') && (
                    <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 400, fontSize: '24px', lineHeight: '100%', color: '#5E6168', paddingBottom: '4px' }}>
                      %
                    </span>
                  )}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: 'auto' }}>
                  <div style={{ display: 'inline-flex', gap: '6px', backgroundColor: stat.badgeBg, padding: '2px 6px', borderRadius: '4px', width: 'fit-content' }}>
                     <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 600, fontSize: '11px', color: stat.badgeColor, lineHeight: '100%' }}>{stat.badgeText}</span>
                  </div>
                  {stat.hasProgress && (
                     <div style={{ width: '100%', height: '6px', borderRadius: '3px', backgroundColor: '#EAE3D2', marginTop: '3px' }}>
                        <div style={{ width: `${stat.progressValue}%`, height: '100%', borderRadius: '3px', backgroundColor: '#0D3B2E' }}></div>
                     </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Layout - Using Bootstrap Grid for responsiveness */}
          <Row className="g-4 m-0" style={{ width: '100%' }}>
            
            {/* Left Column: Team Progress Card Container */}
            <Col xs={12} xl={8} style={{ paddingLeft: 0, paddingRight: '12px' }}>
              <div style={{ 
                width: '100%', 
                borderRadius: '18px', 
                padding: '12px 28px', 
                backgroundColor: '#FFFFFF', 
                border: '1px solid #EAE3D2',
                display: 'flex',
                flexDirection: 'column'
              }}>
                
                {/* Card Header */}
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', marginBottom: '16px' }}>
                  <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: '20px', color: '#0F1317', lineHeight: '100%' }}>
                    Team Progress Overview
                  </span>
                  <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 600, fontSize: '12px', color: '#0D3B2E', lineHeight: '100%', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    View all staff &rarr;
                  </span>
                </div>
                
                {/* KPI Rows */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {teamProgressData.map((member, index) => (
                    <div key={member.id} style={{ 
                      width: '100%', 
                      padding: '16px 0', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '12px' 
                    }}>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 600, fontSize: '14px', color: '#0F1317', lineHeight: '100%' }}>
                          {member.name}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ background: member.statusBg, borderRadius: '999px', padding: '4px 10px 4px 8px', display: 'flex', alignItems: 'center', gap: '6px', height: '23px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '3px', backgroundColor: member.statusColor }}></div>
                            <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 600, fontSize: '11px', color: member.statusColor, lineHeight: '100%', whiteSpace: 'nowrap' }}>
                              {member.status}
                            </span>
                          </div>
                          <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 500, fontSize: '12px', color: '#5E6168', lineHeight: '100%', whiteSpace: 'nowrap' }}>
                            {member.dueDate}
                          </span>
                        </div>
                      </div>
                      
                      {/* Fluid Progress Bar */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
                        <div style={{ flex: 1, height: '8px', borderRadius: '4px', backgroundColor: '#EAE3D2', position: 'relative' }}>
                          <div style={{ width: `${member.progress}%`, height: '100%', backgroundColor: member.statusColor, borderRadius: '4px' }}></div>
                        </div>
                        <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: '12px', color: '#8E8F93', minWidth: '27px', textAlign: 'right' }}>
                          {member.progress}%
                        </span>
                      </div>

                      {index < teamProgressData.length - 1 && (
                        <div style={{ width: '100%', height: '1px', backgroundColor: '#EAE3D2', marginTop: '16px' }}></div>
                      )}

                    </div>
                  ))}
                </div>
              </div>
            </Col>

            {/* Right Column: Contains Recent Activity & Upcoming Deadlines */}
            <Col xs={12} xl={4} style={{ paddingLeft: '12px', paddingRight: 0 }}>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Recent Activity Card */}
                <div style={{ width: '100%', borderRadius: '18px', padding: '24px', border: '1px solid #EAE3D2', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '20px', color: '#0F1317', margin: 0 }}>Recent activity</h2>
                    <p style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 500, fontSize: '12px', color: '#5E6168', margin: 0 }}>Last 7 days</p>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {activityData.map((activity) => (
                      <div key={activity.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '6px', backgroundColor: activity.dotColor, border: '2px solid #FFFFFF', marginTop: '3px', flexShrink: 0 }}></div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                          <h4 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 600, fontSize: '13px', color: '#0F1317', margin: 0, lineHeight: '100%' }}>
                            {activity.title}
                          </h4>
                          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: '12px', color: '#5E6168', lineHeight: '1.4', margin: 0, width: '100%' }}>
                            <span style={{ fontWeight: 800 }}>{activity.actor}</span>
                            <span style={{ fontWeight: 400 }}>{activity.action}</span>
                            <span style={{ fontWeight: 800 }}>{activity.target}</span>
                          </p>
                          <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 500, fontSize: '11px', color: '#8E8F93', lineHeight: '100%' }}>
                            {activity.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Deadlines Card */}
                <div style={{ width: '100%', borderRadius: '18px', padding: '24px', border: '1px solid #EAE3D2', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '20px', color: '#0F1317', margin: 0 }}>Upcoming deadlines</h2>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {upcomingDeadlines.map((deadline) => (
                      <div key={deadline.id} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flex: 1 }}>
                            <div style={{ paddingTop: '5px', flexShrink: 0 }}>
                              <div style={{ width: '6px', height: '6px', borderRadius: '3px', backgroundColor: deadline.progColor }}></div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                              <h4 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 600, fontSize: '13px', color: '#0F1317', margin: 0, lineHeight: '1.2' }}>
                                {deadline.title}
                              </h4>
                              <p style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: '12px', color: '#5E6168', margin: 0 }}>
                                {deadline.subtitle}
                              </p>
                            </div>
                          </div>
                          <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: '#0F1317', cursor: 'pointer', fontSize: '16px', lineHeight: '1' }}>&raquo;</span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                             <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: '11px', color: '#8E8F93', minWidth: '23px', lineHeight: '100%' }}>
                               {deadline.progress}%
                             </span>
                             {/* Fluid Upcoming Deadline Bar */}
                             <div style={{ flex: 1, height: '6px', backgroundColor: '#EAE3D2', borderRadius: '3px', position: 'relative', marginTop: '2px' }}>
                                <div style={{ width: `${deadline.progress}%`, height: '100%', backgroundColor: deadline.progColor, borderRadius: '3px' }}></div>
                             </div>
                          </div>
                          <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 500, fontSize: '11px', color: '#8E8F93', lineHeight: '100%', paddingLeft: '31px' }}>
                            {deadline.time}
                          </span>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </Col>

          </Row>

        </div>
      </main>
    </div>
  );
};

export default ManagerDashboard;