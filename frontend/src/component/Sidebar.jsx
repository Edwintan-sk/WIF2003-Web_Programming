import { Nav } from 'react-bootstrap';
import { BoxArrowRight } from 'react-bootstrap-icons'; 
import '../styles/theme.css';

const Sidebar = ({ role = "manager", onSwitch = () => {} }) => {
  const isManager = role === "manager";

  return (
    <div className="d-flex flex-column vh-100 p-4 shadow-lg z-1 sidebar-container">
      
      {/* Brand Logo Area */}
      <div className="mb-5 d-flex align-items-center px-2">
        <div className="me-3 brand-logo-box">K</div>
        <h4 className="mb-0 text-white" style={{ fontFamily: 'var(--font-heading)' }}>Kempen</h4>
        {isManager && <span className="ms-2 badge border text-uppercase" style={{fontSize: '10px', color: 'var(--sidebar-tag)'}}>Manager</span>}
      </div>

      <div className="d-flex flex-column gap-5 flex-grow-1 overflow-auto overflow-x-hidden">
          <div>
            <p className="sidebar-header small mb-3">Workspace</p>
            <Nav className="flex-column gap-1">
              {/* Active Page Square (#C85A3A) */}
              <Nav.Link href="#" className="px-3 py-2 d-flex align-items-center gap-3 rounded-3 sidebar-link active">
                <div className="menu-square"></div>
                <span className="fw-normal">{isManager ? "Team dashboard" : "Dashboard"}</span>
              </Nav.Link>
              
              {/* Inactive Page Squares (#7A8E85) */}
              <Nav.Link href="#" className="px-3 py-2 d-flex justify-content-between align-items-center rounded-3 sidebar-link">
                <div className="d-flex align-items-center gap-3">
                  <div className="menu-square"></div>
                  <span className="fw-normal">{isManager ? "All KPIs" : "My KPIs"}</span>
                </div>
                <span className="badge rounded-pill sidebar-badge">{isManager ? "24" : "12"}</span>
              </Nav.Link>

              <Nav.Link href="#" className="px-3 py-2 d-flex align-items-center gap-3 rounded-3 sidebar-link">
                <div className="menu-square"></div>
                <span className="fw-normal">{isManager ? "Assignment center" : "Submit progress"}</span>
              </Nav.Link>

              <Nav.Link href="#" className="px-3 py-2 d-flex justify-content-between align-items-center rounded-3 sidebar-link">
                <div className="d-flex align-items-center gap-3">
                  <div className="menu-square"></div>
                  <span className="fw-normal">{isManager ? "Verification inbox" : "Evidence archive"}</span>
                </div>
                {isManager && <span className="badge rounded-pill sidebar-badge">8</span>}
              </Nav.Link>
            </Nav>
          </div>

          <div>
            <p className="sidebar-header small mb-3">Communication</p>
            <Nav className="flex-column gap-1">
              <Nav.Link href="#" className="px-3 py-2 d-flex justify-content-between align-items-center rounded-3 sidebar-link">
                <div className="d-flex align-items-center gap-3">
                  <div className="menu-square"></div>
                  <span className="fw-normal">Notifications</span>
                </div>
                <span className="badge rounded-pill sidebar-badge">{isManager ? "5" : "3"}</span>
              </Nav.Link>
              <Nav.Link href="#" className="px-3 py-2 d-flex align-items-center gap-3 rounded-3 sidebar-link">
                <div className="menu-square"></div>
                <span className="fw-normal">Feedback</span>
              </Nav.Link>
              <Nav.Link href="#" className="px-3 py-2 d-flex align-items-center gap-3 rounded-3 sidebar-link">
                <div className="menu-square"></div>
                <span className="fw-normal">{isManager ? "Reports" : "Help & Support"}</span>
              </Nav.Link>
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

          <Nav.Link href="#" className="d-flex align-items-center gap-2 px-3 py-2 sidebar-link rounded-3 fw-normal">
            <BoxArrowRight size={18} /> Logout
          </Nav.Link>
        </div>
    </div>
  );
};

export default Sidebar;