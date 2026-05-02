import { Nav } from 'react-bootstrap';
import '../styles/theme.css';

const Sidebar = () => {
  return (
    <div className="d-flex flex-column vh-100 p-4" 
         style={{ 
           backgroundColor: 'var(--sidebar-bg)', 
           color: 'var(--sidebar-text)', 
           width: 'var(--sidebar-width)', 
           position: 'fixed' 
         }}>
      
      {/* Brand Logo Area */}
      <div className="mb-5 d-flex align-items-center">
        <div className="me-2" style={{ background: 'var(--accent-orange)', width: '32px', height: '32px', borderRadius: '8px', display: 'grid', placeItems: 'center', color: 'white', fontWeight: 'bold' }}>
          K
        </div>
        <h4 className="mb-0 text-white" style={{ fontFamily: 'var(--font-heading)' }}>Kempen</h4>
      </div>

      <p className="text-uppercase small mb-3" style={{ color: 'var(--sidebar-tag)', letterSpacing: '1px', fontWeight: 600 }}>
        Workspace
      </p>

      <Nav className="flex-column mb-auto">
        <Nav.Link href="#" className="px-0 py-2" style={{ color: 'white' }}>Dashboard</Nav.Link>
        <Nav.Link href="#" className="px-0 py-2 d-flex justify-content-between align-items-center" style={{ color: 'var(--sidebar-text)', opacity: 0.8 }}>
          My KPIs
          <span className="badge rounded-pill" style={{ background: 'var(--accent-orange)', fontSize: '10px' }}>12</span>
        </Nav.Link>
        <Nav.Link href="#" className="px-0 py-2" style={{ color: 'var(--sidebar-text)', opacity: 0.8 }}>Submit progress</Nav.Link>
      </Nav>

      {/* Profile Section */}
      <div className="mt-auto pt-3 border-top border-secondary d-flex align-items-center">
        <div className="rounded-circle me-2" style={{ width: '32px', height: '32px', background: 'var(--sidebar-tag)', display: 'grid', placeItems: 'center', fontSize: '12px', color: 'var(--sidebar-bg)' }}>
          AR
        </div>
        <div>
          <div className="small fw-bold text-white">Aisha Rahman</div>
          <div className="smaller" style={{ fontSize: '10px', color: 'var(--sidebar-tag)' }}>Communications</div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;