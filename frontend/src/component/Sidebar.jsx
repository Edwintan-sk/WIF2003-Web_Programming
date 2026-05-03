import { Nav } from 'react-bootstrap';
import { BoxArrowRight } from 'react-bootstrap-icons'; 
import '../styles/theme.css';

const Sidebar = () => {
  return (
    <div className="d-flex flex-column vh-100 p-4 shadow-lg z-1 sidebar-container">
      
      {/* Brand Logo Area */}
      <div className="mb-5 d-flex align-items-center px-2">
        <div className="me-3 brand-logo-box">K</div>
        <h4 className="mb-0 text-white" style={{ fontFamily: 'var(--font-heading)' }}>Kempen</h4>
      </div>

      {/* Navigation */}
      <div className="d-flex flex-column gap-5 flex-grow-1 overflow-auto overflow-x-hidden">
          <div>
            <p className="sidebar-header small mb-3 font-monospace">
              Workspace
            </p>
            <Nav className="flex-column gap-1">
              <Nav.Link href="#" className="px-3 py-2 d-flex align-items-center gap-3 rounded-3 sidebar-link active">
                <div className="menu-square active-square"></div>
               <span className="fw-normal">Dashboard</span>
              </Nav.Link>
              
              <Nav.Link href="#" className="px-3 py-2 d-flex justify-content-between align-items-center rounded-3 sidebar-link">
                <div className="d-flex align-items-center gap-3">
                  <div className="menu-square"></div>
                  <span className="fw-normal">My KPIs</span>
                </div>
                <span className="badge rounded-pill sidebar-badge">12</span>
              </Nav.Link>

              <Nav.Link href="#" className="px-3 py-2 d-flex justify-content-between align-items-center rounded-3 sidebar-link">
                <div className="d-flex align-items-center gap-3">
                  <div className="menu-square"></div>
                  <span className="fw-normal">Submit progress</span>
                </div>
              </Nav.Link>
              <Nav.Link href="#" className="px-3 py-2 d-flex justify-content-between align-items-center rounded-3 sidebar-link">
                <div className="d-flex align-items-center gap-3">
                  <div className="menu-square"></div>
                  <span className="fw-normal">Evidence archive</span>
                </div>
              </Nav.Link>
            </Nav>
          </div>

          {/* COMMUNICATION */}
          <div>
            <p className="sidebar-header small mb-3 font-monospace">
              COMMUNICATION 
            </p>
            <Nav className="flex-column gap-1">
              <Nav.Link href="#" className="px-3 py-2 d-flex justify-content-between align-items-center rounded-3 sidebar-link">
                <div className="d-flex align-items-center gap-3">
                  <div className="menu-square"></div>
                  <span className="fw-normal">Notifications</span>
                  <span className="badge rounded-pill sidebar-badge"> 3 </span>
                </div>
              </Nav.Link>
              <Nav.Link href="#" className="px-3 py-2 d-flex justify-content-between align-items-center rounded-3 sidebar-link">
                <div className="d-flex align-items-center gap-3">
                  <div className="menu-square"></div>
                  <span className="fw-normal">Feedback</span>
                </div>
              </Nav.Link>
              <Nav.Link href="#" className="px-3 py-2 d-flex justify-content-between align-items-center rounded-3 sidebar-link">
                <div className="d-flex align-items-center gap-3">
                  <div className="menu-square"></div>
                  <span className="fw-normal">Help & Support</span>
                </div>
              </Nav.Link>
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