import { Nav } from 'react-bootstrap';
import { BoxArrowRight } from 'react-bootstrap-icons';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/theme.css';

const Sidebar = ({ role = "manager", onSwitch = () => {} }) => {
  const isManager = role === "manager";
  const location = useLocation();
  const navigate = useNavigate();

  // Define link arrays based on role
  const managerLinks = [
    { label: "Team dashboard", path: "/manager", icon: true },
    { label: "All KPIs", path: "/manager/all-kpis", icon: true, badge: "24" },
    { label: "Assignment center", path: "/manager/assign", icon: true },
    { label: "Verification inbox", path: "/manager/verification-inbox", icon: true, badge: "8" },
  ];

  const staffLinks = [
    { label: "Dashboard", path: "/", icon: true },
    { label: "My KPIs", path: "/staff/kpis", icon: true, badge: "12" },
    { label: "Submit progress", path: "/staff/submit", icon: true },
    { label: "Evidence archive", path: "/staff/archive", icon: true },
  ];

  const workspaceLinks = isManager ? managerLinks : staffLinks;

  const communicationLinks = [
    { label: "Notifications", path: isManager ? "/manager/notifications" : "/staff/notifications", icon: true, badge: isManager ? "5" : "3" },
    { label: "Feedback", path: isManager ? "/manager/feedback" : "/staff/feedback", icon: true },
    { label: isManager ? "Reports" : "Help & Support", path: isManager ? "/reports" : "/help", icon: true },
  ];

  const isActive = (path) => location.pathname === path;

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="d-flex flex-column vh-100 p-4 shadow-lg z-1 sidebar-container">
      
      {/* Brand Logo Area */}
      <div className="mb-5 d-flex flex-column px-2">
        <div className="d-flex align-items-center">
          <div className="me-3 brand-logo-box">K</div>
          <h4 className="m-0 lh-1 text-white" style={{ fontFamily: 'var(--font-heading)' }}>Kempen</h4>
        </div>
        {isManager && (
          <span 
            className="badge border text-uppercase mt-2" 
            style={{ fontSize: '10px', color: 'var(--sidebar-tag)', width: 'fit-content' }}
          >
            Manager
          </span>
        )}
      </div>

      <div className="d-flex flex-column gap-5 flex-grow-1 overflow-auto overflow-x-hidden">
          {/* Workspace Section */}
          <div>
            <p className="sidebar-header small mb-3">Workspace</p>
            <Nav className="flex-column gap-1">
              {workspaceLinks.map((link, index) => {
                const active = isActive(link.path);
                return (
                  <Nav.Link 
                    key={index}
                    onClick={() => handleNavigation(link.path)}
                    className={`px-3 py-2 d-flex justify-content-between align-items-center rounded-3 sidebar-link ${active ? 'active' : ''}`}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div className={`menu-square ${active ? 'active-square' : ''}`}></div>
                      <span className="fw-normal">{link.label}</span>
                    </div>
                    {link.badge && <span className="badge rounded-pill sidebar-badge">{link.badge}</span>}
                  </Nav.Link>
                );
              })}
            </Nav>
          </div>

          {/* Communication Section */}
          <div>
            <p className="sidebar-header small mb-3">Communication</p>
            <Nav className="flex-column gap-1">
              {communicationLinks.map((link, index) => {
                const active = isActive(link.path);
                return (
                  <Nav.Link 
                    key={index}
                    onClick={() => handleNavigation(link.path)}
                    className={`px-3 py-2 d-flex justify-content-between align-items-center rounded-3 sidebar-link ${active ? 'active' : ''}`}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div className={`menu-square ${active ? 'active-square' : ''}`}></div>
                      <span className="fw-normal">{link.label}</span>
                    </div>
                    {link.badge && <span className="badge rounded-pill sidebar-badge">{link.badge}</span>}
                  </Nav.Link>
                );
              })}
            </Nav>
          </div>
        </div>

        {/* Profile Section - Swaps based on Manager UI */}
        <div className="mt-auto pt-3">
          <div className="d-flex align-items-center gap-3 p-3 rounded-4 mb-3 profile-container">
            <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold profile-avatar">
              {isManager ? "LC" : "AR"}
            </div>
            <div>
              <div className="small fw-bold text-white">{isManager ? "Lee Chen" : "Aisha Rahman"}</div>
              <div style={{ fontSize: '11px', color: 'var(--sidebar-tag)' }}>{isManager ? "Team manager" : "Communications"}</div>
            </div>
          </div>

          <Nav.Link onClick={() => navigate('/login')} className="d-flex align-items-center gap-2 px-3 py-2 sidebar-link rounded-3 fw-normal" style={{ cursor: 'pointer' }}>
            <BoxArrowRight size={18} /> Logout
          </Nav.Link>
        </div>
    </div>
  );
};

export default Sidebar;