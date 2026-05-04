import React from 'react';
import { Nav } from 'react-bootstrap';
import { BoxArrowRight } from 'react-bootstrap-icons'; 
import { Link, useLocation } from 'react-router-dom';
import '../styles/theme.css';

const Sidebar = () => {
  const location = useLocation();

  const workspaceItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/staff-dashboard'},
    { id: 'kpis', label: 'My KPIs', badge: 12, path: '/staff-assigned-kpi'},
    { id: 'progress', label: 'Submit progress', path: '/staff-submit-progress'},
    { id: 'archive', label: 'Evidence archive', path: '/staff-evidence-archive' }
  ];

  // TODO: Replace correct path
  const communicationItems = [
    { id: 'notifications', label: 'Notifications', badge: 3, path: '/notifications'},
    { id: 'feedback', label: 'Feedback', path: '/feedback'},
    { id: 'support', label: 'Help & Support', path: '/help-support'}
  ];

  return (
    <div className="d-flex flex-column vh-100 p-4 shadow-lg z-1 sidebar-container">
      
      {/* Brand Logo Area */}
      <div className="mb-5 d-flex align-items-center px-2">
        <div className="me-3 brand-logo-box">K</div>
        <h4 className="mb-0 text-white">Kempen</h4>
      </div>

      {/* Navigation */}
      <div className="d-flex flex-column gap-5 flex-grow-1 overflow-auto overflow-x-hidden">
          <div>
            <p className="sidebar-header small mb-3 font-monospace">
              Workspace
            </p>
            <Nav className="flex-column gap-1">
              {workspaceItems.map((item) => {
                const isActive = location.pathname === item.path;
                
                return (
                  <Nav.Link key={item.id} as={Link} to={item.path} 
                  className={`px-3 py-2 d-flex justify-content-between align-items-center rounded-3 sidebar-link ${isActive ? 'active' : ''}`}>
                    <div className="d-flex align-items-center gap-3">
                      <div className={`menu-square ${isActive ? 'active-square' : ''}`}></div>
                      <span className="fw-normal">{item.label}</span>
                    </div>
                    {/* Handle item badge notifications */}
                    {
                      item.badge && (<span className="badge rounded-pill sidebar-badge">{item.badge}</span>)
                    }
                  </Nav.Link>
                );
              })}
            </Nav>
          </div>

          {/* COMMUNICATION */}
          <div>
            <p className="sidebar-header small mb-3 font-monospace">
              COMMUNICATION 
            </p>
            <Nav className="flex-column gap-1">
              {communicationItems.map((item) => {
                const isActive = location.pathname === item.path;
                
                return(
                  <Nav.Link key={item.id} as={Link} to={item.path} 
                    className={`px-3 py-2 d-flex justify-content-between align-items-center rounded-3 sidebar-link ${isActive ? 'active' : ''}`}>
                      <div className="d-flex align-items-center gap-3">
                        <div className={`menu-square ${isActive ? 'active-square' : ''}`}></div>
                        <span className="fw-normal">{item.label}</span>
                      </div>
                      {/* Handle item badge notifications */}
                      {
                        item.badge && (<span className="badge rounded-pill sidebar-badge">{item.badge}</span>)
                      }
                  </Nav.Link>
                );
              })}
            </Nav>
          </div>
        </div>

        {/* Profile Section */}
        <div className="mt-auto pt-3">
          <div className="d-flex align-items-center gap-3 p-3 rounded-4 mb-3 profile-container">
            <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold profile-avatar">
              AR
            </div>
            <div>
              <div className="small fw-bold text-white">Aisha Rahman</div>
              <div style={{ fontSize: '11px', color: 'var(--sidebar-tag)' }}>Communications</div>
            </div>
          </div>

          <Nav.Link href="#" className="d-flex align-items-center gap-2 px-3 py-2 sidebar-link rounded-3 fw-normal">
            <BoxArrowRight size={18} /> 
              Logout
          </Nav.Link>
        </div>
    </div>
  );
};

export default Sidebar;